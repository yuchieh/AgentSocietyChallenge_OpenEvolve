"""
Holdout validation — detect overfitting in an evolved agents config.

Evolution optimizes on the TRAIN split (dummy_tasks/). This script runs a
given agents YAML against the disjoint HOLDOUT split (holdout_tasks/) and
reports the holdout score. A large train-minus-holdout gap signals the
evolved config memorized the train tasks rather than generalizing.

Usage:
  uv run --env-file .env python scripts/validate_holdout.py [path/to/agents.yaml]

Defaults to config/openevolve_output/best/best_program.yaml if present,
otherwise config/agents.yaml.
"""
import os
import sys

# project root on path so we can import the evaluator
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

# Point the evaluator's simulator at the holdout split BEFORE importing it
# (the simulator is a lazy singleton initialized on first evaluate()).
os.environ["OPENEVOLVE_TASK_DIR"] = os.environ.get("OPENEVOLVE_TASK_DIR", "holdout_tasks")
os.environ["OPENEVOLVE_GT_DIR"] = os.environ.get("OPENEVOLVE_GT_DIR", "holdout_groundtruth")


def _pick_default_yaml() -> str:
    candidates = [
        os.path.join(_ROOT, "config", "openevolve_output", "best", "best_program.yaml"),
        os.path.join(_ROOT, "config", "agents.yaml"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    raise FileNotFoundError("No agents YAML found to validate.")


def _score_of(result) -> float:
    # evaluate() may return EvaluationResult or a plain dict
    metrics = getattr(result, "metrics", result)
    return float(metrics.get("combined_score", 0.0))


def main() -> int:
    yaml_path = sys.argv[1] if len(sys.argv) > 1 else _pick_default_yaml()
    if not os.path.exists(yaml_path):
        print(f"❌ YAML not found: {yaml_path}")
        return 1

    from openevolve_evaluator import evaluate

    print("=" * 60)
    print(f"Holdout validation: {yaml_path}")
    print(f"  task_dir={os.environ['OPENEVOLVE_TASK_DIR']}")
    print("=" * 60)

    result = evaluate(yaml_path)
    holdout_score = _score_of(result)

    print("\n" + "=" * 60)
    print(f"HOLDOUT combined_score = {holdout_score:.4f}")
    print("Compare against the program's TRAIN score (from checkpoint")
    print("best_program_info.json). A large train - holdout gap => overfit.")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
