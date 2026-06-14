"""
L1 retrieval-policy executor — the FROZEN interpreter for the Tool Calling
Failure Taxonomy.

An evolved `retrieval_policy` declares *what data to fetch and how* (which
queries, how to sample reviews, how much to keep). This module executes that
declaration deterministically.

Core safety contract — NEVER raise on a malformed policy:
    Every illegal field is clamped / projected back into the legal space,
    worst case falling back to the default policy. This is exactly what lets
    the policy live inside an EVOLVE-BLOCK and be mutated freely by an LLM
    without ever crashing the prediction pipeline. The worst outcome of a
    nonsensical mutation is "degrades to baseline retrieval", never "pipeline
    dies".

The whitelist (ALLOWED_QUERIES) is frozen because it mirrors the underlying
InteractionTool's capability boundary — the data simply does not contain
anything else. Evolution composes/orders/samples within this vocabulary;
it does not invent new query kinds (that is L2's job, via sandboxed code).
"""

from __future__ import annotations

import random
from typing import Any

# ── Frozen protocol: legal query kinds (mirror InteractionTool capabilities) ──
ALLOWED_QUERIES = ("user", "item", "review_by_user", "review_by_item")
ALLOWED_STRATEGIES = ("recent", "random", "extreme_ratings", "longest")

# ── Default policy: the safe fallback any malformed field collapses toward ──
DEFAULT_POLICY: dict[str, Any] = {
    "queries": ["user", "item", "review_by_user"],
    "review_sampling": {"strategy": "recent", "k": 15},
    "max_chars_per_result": 6000,
}

# ── Clamp bounds ──
_K_MIN, _K_MAX = 1, 50
_CHARS_MIN, _CHARS_MAX = 500, 20000


def _clamp_int(val: Any, default: int, lo: int, hi: int) -> int:
    """Coerce to int and clamp into [lo, hi]; fall back to default on garbage."""
    try:
        v = int(val)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, v))


def normalize_policy(raw: Any) -> dict[str, Any]:
    """Project an arbitrary (possibly malformed) policy back into the legal
    space. Never raises — the returned dict is always a valid policy."""
    if not isinstance(raw, dict):
        return _clone_default()

    # queries: keep only whitelisted, dedupe preserving order, empty -> default
    q_raw = raw.get("queries")
    queries: list[str] = []
    if isinstance(q_raw, list):
        seen = set()
        for q in q_raw:
            if q in ALLOWED_QUERIES and q not in seen:
                seen.add(q)
                queries.append(q)
    if not queries:
        queries = list(DEFAULT_POLICY["queries"])

    # review_sampling: strategy whitelist + k clamp
    rs_raw = raw.get("review_sampling")
    if not isinstance(rs_raw, dict):
        rs_raw = {}
    strategy = rs_raw.get("strategy")
    if strategy not in ALLOWED_STRATEGIES:
        strategy = DEFAULT_POLICY["review_sampling"]["strategy"]
    k = _clamp_int(rs_raw.get("k"), DEFAULT_POLICY["review_sampling"]["k"], _K_MIN, _K_MAX)

    # max_chars_per_result: clamp
    max_chars = _clamp_int(
        raw.get("max_chars_per_result"),
        DEFAULT_POLICY["max_chars_per_result"],
        _CHARS_MIN,
        _CHARS_MAX,
    )

    return {
        "queries": queries,
        "review_sampling": {"strategy": strategy, "k": k},
        "max_chars_per_result": max_chars,
    }


def _clone_default() -> dict[str, Any]:
    return {
        "queries": list(DEFAULT_POLICY["queries"]),
        "review_sampling": dict(DEFAULT_POLICY["review_sampling"]),
        "max_chars_per_result": DEFAULT_POLICY["max_chars_per_result"],
    }


def _sample_reviews(reviews: Any, sampling: dict[str, Any]) -> Any:
    """Apply the sampling strategy to a list of review dicts. Defensive: if the
    input is not a list (or elements are odd shapes), degrade gracefully."""
    if not isinstance(reviews, list):
        return reviews

    strategy = sampling["strategy"]
    k = sampling["k"]

    def _stars(r: Any) -> float:
        try:
            return float(r.get("stars", 3)) if isinstance(r, dict) else 3.0
        except (TypeError, ValueError):
            return 3.0

    def _date(r: Any) -> str:
        return str(r.get("date", "")) if isinstance(r, dict) else ""

    def _len(r: Any) -> int:
        return len(str(r.get("text", ""))) if isinstance(r, dict) else 0

    if strategy == "recent":
        ordered = sorted(reviews, key=_date, reverse=True)
    elif strategy == "longest":
        ordered = sorted(reviews, key=_len, reverse=True)
    elif strategy == "extreme_ratings":
        # furthest from the neutral 3.0 first (captures love/hate signals)
        ordered = sorted(reviews, key=lambda r: abs(_stars(r) - 3.0), reverse=True)
    elif strategy == "random":
        ordered = list(reviews)
        random.shuffle(ordered)
    else:  # unreachable after normalize_policy, but defensive
        ordered = reviews

    return ordered[:k]


def execute_policy(policy: Any, interaction_tool: Any, user_id: str, item_id: str) -> str:
    """Deterministically retrieve and format context per the policy.

    `policy` may be raw/malformed — it is normalized internally, so callers
    cannot break this by passing garbage. Per-query failures are caught and
    annotated rather than propagated, so one bad query never sinks the rest.
    """
    p = normalize_policy(policy)
    parts: list[str] = []

    for q in p["queries"]:
        try:
            if q == "user":
                data: Any = interaction_tool.get_user(user_id=user_id)
            elif q == "item":
                data = interaction_tool.get_item(item_id=item_id)
            elif q == "review_by_user":
                data = _sample_reviews(
                    interaction_tool.get_reviews(user_id=user_id), p["review_sampling"]
                )
            elif q == "review_by_item":
                data = _sample_reviews(
                    interaction_tool.get_reviews(item_id=item_id), p["review_sampling"]
                )
            else:  # unreachable after normalize, defensive
                continue
            text = str(data)[: p["max_chars_per_result"]]
            parts.append(f"## {q}\n{text}")
            _record_query(q, ok=True)
        except Exception as e:  # noqa: BLE001 — never let one query crash the run
            parts.append(f"## {q}\n(retrieval error: {e})")
            _record_query(q, ok=False)

    return "\n\n".join(parts)


def _record_query(query_type: str, ok: bool) -> None:
    """Feed the executor's deterministic queries into the same L0 tool-call log,
    so observability/coverage metrics stay meaningful after L1 takes over
    retrieval from the LLM. Soft dependency — never let logging break execution."""
    try:
        from src.tools.interaction_tool_wrapper import _record
        _record(query_type, ok)
    except Exception:  # noqa: BLE001
        pass
