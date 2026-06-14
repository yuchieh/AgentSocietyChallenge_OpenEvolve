"""
L2 tool loader — the FROZEN sandbox that safely loads evolution-generated
derived tools for the Tool Calling Failure Taxonomy.

An evolved `evolvable_tools.py` may define new `tool_*` functions that compute
derived analyses over the fixed dataset (rating variance, category affinity,
…). This module loads them through four gates, so a malformed/malicious tool
can never crash the pipeline.

Four gates:
  1. AST safety scan  — static: block imports outside a small allow-list, ban
                        dangerous builtins (open/exec/eval/__import__/…) and
                        dunder access (__globals__/__class__/… escape vectors).
  2. Signature        — only accept `tool_*` callables taking (kit, user_id, item_id).
  3. Sandbox trial    — actually run each tool once on a fixture with a timeout;
                        return must be a non-empty, bounded str. Bad tools are
                        SILENTLY DROPPED ("silent dead genes"), not raised.
  4. Wrap & register  — survivors become CrewAI @tools; docstring -> description.

Safety scope: this is an EDUCATIONAL sandbox (AST allow/deny + restricted
builtins + read-only data facade). It defends against an evolving LLM
*accidentally* writing unsafe code — NOT against a determined adversary.
Production isolation would need a subprocess/container.

The data root: every tool can only reach data through ReadOnlyKit, which
forwards to exactly three InteractionTool methods. No filesystem, no network,
no groundtruth — everything funnels back to read-only data.
"""

from __future__ import annotations

import ast
import inspect
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout
from typing import Any, Callable

# ── Gate-1 policy ──
_ALLOWED_IMPORTS = {
    "statistics", "math", "json", "re", "collections",
    "datetime", "itertools", "functools",
}
_FORBIDDEN_CALLS = {
    "open", "exec", "eval", "compile", "__import__", "input",
    "globals", "locals", "vars", "getattr", "setattr", "delattr",
    "breakpoint", "memoryview",
}
# Restricted builtins handed to exec'd tool code (no __import__, open, etc.)
_SAFE_BUILTINS = {
    "len", "range", "sum", "min", "max", "sorted", "reversed", "abs", "round",
    "float", "int", "str", "bool", "list", "dict", "set", "tuple",
    "enumerate", "zip", "map", "filter", "any", "all", "isinstance", "print",
}

# ── Gate-3 bounds ──
_TRIAL_TIMEOUT_SEC = 5
_MAX_TOOL_CHARS = 4000
_FIXTURE = ("__fixture_user__", "__fixture_item__")


class ReadOnlyKit:
    """Read-only data facade given to evolved tools. Exposes exactly the three
    InteractionTool query methods — nothing else (no groundtruth, fs, network)."""

    def __init__(self, interaction_tool: Any):
        self._tool = interaction_tool

    def get_user(self, user_id: str):
        return self._tool.get_user(user_id=user_id)

    def get_item(self, item_id: str):
        return self._tool.get_item(item_id=item_id)

    def get_reviews(self, user_id: str = None, item_id: str = None):
        return self._tool.get_reviews(user_id=user_id, item_id=item_id)


def ast_safety_scan(source: str) -> list[str]:
    """Static scan. Returns a list of violation strings; empty list = safe."""
    try:
        tree = ast.parse(source)
    except SyntaxError as e:
        return [f"syntax error: {e}"]

    violations: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split(".")[0] not in _ALLOWED_IMPORTS:
                    violations.append(f"forbidden import: {alias.name}")
        elif isinstance(node, ast.ImportFrom):
            root = (node.module or "").split(".")[0]
            if root not in _ALLOWED_IMPORTS:
                violations.append(f"forbidden import from: {node.module}")
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id in _FORBIDDEN_CALLS:
                violations.append(f"forbidden call: {node.func.id}")
        elif isinstance(node, ast.Attribute):
            if node.attr.startswith("__") and node.attr.endswith("__"):
                violations.append(f"forbidden dunder attribute: {node.attr}")
        elif isinstance(node, ast.Name):
            if node.id.startswith("__") and node.id.endswith("__"):
                violations.append(f"forbidden dunder name: {node.id}")
    return violations


def signature_ok(fn: Callable) -> bool:
    """Gate 2: accept only callables taking exactly 3 params (kit, user_id, item_id)."""
    try:
        params = list(inspect.signature(fn).parameters.values())
    except (ValueError, TypeError):
        return False
    if len(params) != 3:
        return False
    # reject *args/**kwargs-only signatures
    return all(
        p.kind in (p.POSITIONAL_OR_KEYWORD, p.POSITIONAL_ONLY) for p in params
    )


def trial_run(fn: Callable, kit: ReadOnlyKit, user_id: str, item_id: str,
              timeout: int = _TRIAL_TIMEOUT_SEC, max_chars: int = _MAX_TOOL_CHARS):
    """Gate 3: run once on a fixture. Returns (ok: bool, reason: str)."""
    try:
        with ThreadPoolExecutor(max_workers=1) as ex:
            out = ex.submit(fn, kit, user_id, item_id).result(timeout=timeout)
    except FuturesTimeout:
        return False, "timeout"
    except Exception as e:  # noqa: BLE001
        return False, f"exception: {e}"
    if not isinstance(out, str):
        return False, f"non-str return: {type(out).__name__}"
    if len(out) == 0:
        return False, "empty return"
    if len(out) > max_chars:
        return False, f"oversized return: {len(out)} chars"
    return True, "ok"


def _safe_import(name, *args, **kwargs):
    """A restricted __import__ that only permits the allow-listed modules.
    Needed because exec'd tool code uses `import statistics` etc., and the
    import statement requires __import__ to be present in builtins. The AST
    scan already blocks non-allowed imports statically; this is defense-in-depth."""
    if name.split(".")[0] not in _ALLOWED_IMPORTS:
        raise ImportError(f"import of '{name}' is not allowed in evolved tools")
    return __import__(name, *args, **kwargs)


def _restricted_namespace() -> dict:
    import builtins
    safe = {k: getattr(builtins, k) for k in _SAFE_BUILTINS if hasattr(builtins, k)}
    safe["__import__"] = _safe_import
    return {"__builtins__": safe}


def _wrap_as_crewai_tool(name: str, fn: Callable, kit: ReadOnlyKit,
                         max_chars: int = _MAX_TOOL_CHARS):
    """Gate 4: wrap a validated tool fn as a CrewAI tool; docstring -> description."""
    from crewai.tools import tool

    # CrewAI's @tool requires the wrapped function to HAVE a docstring at
    # decoration time, so transfer the evolved tool's docstring onto the
    # wrapper before applying @tool (a guaranteed non-empty fallback to name).
    doc = (fn.__doc__ or f"Derived analysis tool {name}.").strip() or f"Tool {name}."

    def _wrapped(user_id: str, item_id: str) -> str:
        try:
            out = str(fn(kit, user_id, item_id))[:max_chars]
            _record_l0(name, True)
            return out
        except Exception as e:  # noqa: BLE001 — runtime safety net
            _record_l0(name, False)
            return f"(tool {name} error: {e})"

    _wrapped.__name__ = name
    _wrapped.__doc__ = doc
    return tool(name)(_wrapped)


def _record_l0(name: str, ok: bool) -> None:
    """L0 observability extension: log evolved-tool calls into the same tool-call
    log. The tool name is recorded (not an essential query), so it shows up in
    artifacts (ok_by_type) — giving the docstring-co-evolution signal "which
    evolved tools did the agent actually call" — without affecting
    essential_coverage. Soft dependency; never break tool execution."""
    try:
        from src.tools.interaction_tool_wrapper import _record
        _record(name, ok)
    except Exception:  # noqa: BLE001
        pass


def load_evolved_tools(source: str, interaction_tool: Any,
                       fixture: tuple = _FIXTURE, wrap: bool = True):
    """Load evolved tools through the four gates.

    Args:
        source: tool source CODE (str). (Callers that have a path should read it.)
        interaction_tool: the live InteractionTool (wrapped in ReadOnlyKit).
        fixture: (user_id, item_id) used for the sandbox trial run.
        wrap: if True, return CrewAI tools; if False, return raw (name, fn)
              tuples (useful for unit tests without CrewAI).

    Returns:
        (tools_or_pairs, report) where report = {loaded, dropped, rejected_all?}.
    """
    # Gate 1: AST safety scan (file-level — one violation rejects the whole file,
    # because exec runs the whole module).
    violations = ast_safety_scan(source)
    if violations:
        return [], {"loaded": [], "dropped": [], "rejected_all": violations}

    # Compile + exec in a restricted namespace.
    ns = _restricted_namespace()
    try:
        exec(compile(source, "<evolvable_tools>", "exec"), ns)
    except Exception as e:  # noqa: BLE001
        return [], {"loaded": [], "dropped": [], "rejected_all": [f"exec error: {e}"]}

    # Gate 2: signature convention.
    candidates = [
        (name, obj) for name, obj in ns.items()
        if name.startswith("tool_") and callable(obj) and signature_ok(obj)
    ]

    # Gate 3: sandbox trial run (per-tool; bad ones silently dropped).
    kit = ReadOnlyKit(interaction_tool)
    loaded, dropped = [], []
    for name, fn in candidates:
        ok, reason = trial_run(fn, kit, fixture[0], fixture[1])
        (loaded if ok else dropped).append((name, fn) if ok else f"{name}: {reason}")

    report = {"loaded": [n for n, _ in loaded], "dropped": dropped}

    # Gate 4: wrap survivors (or return raw pairs for tests).
    if not wrap:
        return loaded, report
    return [_wrap_as_crewai_tool(name, fn, kit) for name, fn in loaded], report
