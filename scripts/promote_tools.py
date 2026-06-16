"""
Promote the best evolved tools back into evolvable_tools.py — with a holdout
safeguard so a tool set that only looks good on the train tasks can't overwrite
the current one.

Pipeline:
  1. Locate the candidate (default: the tool run's best_program).
  2. Gate A — sandbox load: the candidate must pass the four-gate loader and
     produce at least one usable tool (a malformed file is refused outright).
  3. Gate B — holdout check (default on): run the SAME pipeline on the disjoint
     holdout set for both the candidate and the current evolvable_tools.py, and
     refuse to promote if the candidate regresses beyond --tol.
  4. Back up the current file and write the candidate in.

Usage:
  uv run --env-file .env python scripts/promote_tools.py            # validate + promote
  uv run --env-file .env python scripts/promote_tools.py --no-validate
  uv run --env-file .env python scripts/promote_tools.py --candidate path/to/tools.py --tol 0.02
Holdout task count follows OPENEVOLVE_NUM_TASKS (default 1; more = less noise).
"""
import os
import sys
import glob
import shutil
import argparse
import datetime

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

_CURRENT = os.path.join(_ROOT, "evolvable_tools.py")
_DEFAULT_BEST_DIR = os.path.join(_ROOT, "config", "openevolve_tools_output", "best")


class _FakeTool:
    """Minimal interaction tool for the sandbox load check (Gate A)."""
    def get_user(self, user_id=None): return {"user_id": user_id, "average_stars": 3.5}
    def get_item(self, item_id=None): return {"item_id": item_id, "categories": "Pizza, Restaurants"}
    def get_reviews(self, user_id=None, item_id=None):
        return [{"stars": 5.0, "item_id": "i1", "text": "great"},
                {"stars": 2.0, "item_id": "i2", "text": "meh"}]


def _find_candidate(arg):
    if arg:
        return arg
    for c in ("best_program.py", "best_program"):
        p = os.path.join(_DEFAULT_BEST_DIR, c)
        if os.path.exists(p):
            return p
    hits = glob.glob(os.path.join(_DEFAULT_BEST_DIR, "best_program.*"))
    return hits[0] if hits else None


def _gate_a_load(src):
    """Return (ok, report). ok=False means refuse (whole file rejected or no tools)."""
    from src.tools.tool_loader import load_evolved_tools
    tools, report = load_evolved_tools(src, _FakeTool(), wrap=False)
    if report.get("rejected_all"):
        return False, report
    if not report.get("loaded"):
        return False, report
    return True, report


def _holdout_score(tools_path):
    """Evaluate a given tools file on the holdout split. Real LLM calls."""
    from openevolve_tool_evaluator import evaluate
    res = evaluate(tools_path)
    m = getattr(res, "metrics", res)
    return float(m.get("combined_score", 0.0))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidate", default=None, help="path to candidate tools (.py)")
    ap.add_argument("--no-validate", action="store_true", help="skip the holdout check")
    ap.add_argument("--tol", type=float, default=0.0,
                    help="allowed holdout regression vs current before refusing (default 0.0)")
    args = ap.parse_args()

    cand = _find_candidate(args.candidate)
    if not cand or not os.path.exists(cand):
        print(f"❌ candidate not found (looked in {_DEFAULT_BEST_DIR}). Run the tool evolution first.")
        return 1
    print(f"Candidate : {cand}")
    print(f"Current   : {_CURRENT}")

    src = open(cand, encoding="utf-8").read()

    # Gate A — sandbox load
    ok, report = _gate_a_load(src)
    print(f"\n[Gate A · sandbox load] loaded={report.get('loaded')}  "
          f"dropped={report.get('dropped')}  rejected_all={report.get('rejected_all')}")
    if not ok:
        print("❌ REFUSED: candidate fails the four-gate loader (broken or yields no usable tool).")
        return 1

    # Gate B — holdout check
    if not args.no_validate:
        os.environ.setdefault("OPENEVOLVE_TASK_DIR", "holdout_tasks")
        os.environ.setdefault("OPENEVOLVE_GT_DIR", "holdout_groundtruth")
        print(f"\n[Gate B · holdout] task_dir={os.environ['OPENEVOLVE_TASK_DIR']} "
              f"(OPENEVOLVE_NUM_TASKS={os.environ.get('OPENEVOLVE_NUM_TASKS', '1')})")
        print("  evaluating candidate on holdout ...")
        cand_score = _holdout_score(cand)
        print("  evaluating current  on holdout ...")
        curr_score = _holdout_score(_CURRENT)
        print(f"\n  candidate holdout = {cand_score:.4f}")
        print(f"  current   holdout = {curr_score:.4f}")
        print(f"  delta = {cand_score - curr_score:+.4f}  (tol = -{args.tol})")
        if cand_score < curr_score - args.tol:
            print("❌ REFUSED: candidate regresses on holdout — NOT promoting.")
            return 1
        print("✅ holdout check passed.")
    else:
        print("\n[Gate B · holdout] skipped (--no-validate)")

    # Promote (with backup)
    ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = f"{_CURRENT}.bak-{ts}"
    shutil.copy2(_CURRENT, backup)
    shutil.copy2(cand, _CURRENT)
    print(f"\n✅ PROMOTED → {_CURRENT}\n   backup: {backup}")
    print("   next: run the prompt evolution (make evolve) so prompts can adapt to the new tools.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
