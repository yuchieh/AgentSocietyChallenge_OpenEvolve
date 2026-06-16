"""
Tool-evolution evaluator for OpenEvolve (the §14 "tool evolution run", A' arch).

Unlike openevolve_evaluator.py (which evolves the agent YAML), here OpenEvolve
evolves `evolvable_tools.py`. OpenEvolve writes each mutated tool file to a temp
path and passes it here as `program_path`. We:

  1. point the crew's tool loader at that file via OPENEVOLVE_TOOLS_PATH,
  2. keep the agent prompts FIXED (config/agents.yaml) via OPENEVOLVE_AGENTS_YAML,
  3. run the simulation and return combined_score (+ sub-metrics + n_tools).

The frozen four-gate loader (src/tools/tool_loader.py) already makes a broken or
malicious tool file degrade gracefully (bad tools dropped; whole-file failure →
empty tool list → the analyst still reasons from {retrieved_context}). So the
worst case here is a low score, never a crash.

evaluate(program_path) -> dict with 'combined_score' (required by OpenEvolve).
"""
import os
import sys
import ast
import json
import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout

project_dir = os.path.dirname(os.path.abspath(__file__))
if project_dir not in sys.path:
    sys.path.append(project_dir)

# Reuse the agent-evaluator's simulator singleton + helpers (no duplication).
from openevolve_evaluator import _get_simulator, _summarize_tool_use, _result, SIM_TIMEOUT_SEC
from src.tools.interaction_tool_wrapper import drain_tool_log

_FIXED_AGENTS_YAML = os.path.join(project_dir, "config", "agents.yaml")


def _count_tools(path: str) -> int:
    """Static count of evolved tools: top-level `tool_*` defs taking 3 params.
    A proxy for 'how many tools this candidate defines' (logged as an artifact)."""
    try:
        tree = ast.parse(open(path, encoding="utf-8").read())
    except Exception:
        return 0
    n = 0
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name.startswith("tool_"):
            args = node.args
            if len(args.posonlyargs) + len(args.args) == 3 and not args.vararg and not args.kwarg:
                n += 1
    return n


def evaluate(program_path: str) -> dict:
    # Fixed prompts; only the tool file evolves.
    os.environ["OPENEVOLVE_AGENTS_YAML"] = _FIXED_AGENTS_YAML
    os.environ["OPENEVOLVE_TOOLS_PATH"] = program_path

    n_tools = _count_tools(program_path)
    num_tasks = int(os.environ.get("OPENEVOLVE_NUM_TASKS", 5))
    print(f"\n[ToolEval] Running simulation: {program_path}  (tools_defined={n_tools}, "
          f"tasks={num_tasks}, timeout={SIM_TIMEOUT_SEC}s)")

    simulator = _get_simulator()
    try:
        drain_tool_log()
        try:
            with ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(
                    simulator.run_simulation,
                    number_of_tasks=num_tasks,
                    enable_threading=True,
                    max_workers=2,
                )
                future.result(timeout=SIM_TIMEOUT_SEC)
        except FuturesTimeout:
            print(f"[ToolEval] ⏱  exceeded {SIM_TIMEOUT_SEC}s — fallback score")
            tool_summary = _summarize_tool_use(drain_tool_log())
            return _result(0.0, {"failure_stage": "timeout", "tool_use": tool_summary, "n_tools": n_tools},
                           extra_metrics={"preference_estimation": 0.0, "review_generation": 0.0})

        tool_summary = _summarize_tool_use(drain_tool_log())
        eval_results = simulator.evaluate()
        metrics = eval_results.get("metrics", {}) if isinstance(eval_results, dict) else {}
        overall = metrics.get("overall_quality", 0.0)
        pref = metrics.get("preference_estimation", 0.0)
        review = metrics.get("review_generation", 0.0)

        print(f"[ToolEval] combined_score={overall:.4f}  pref={pref:.4f}  review={review:.4f}  "
              f"n_tools={n_tools}")
        print(f"[ToolEval] tool_use: {tool_summary}")

        return _result(overall, {
            "tool_use": tool_summary,
            "n_tools": n_tools,
            "preference_estimation": round(pref, 4),
            "review_generation": round(review, 4),
        }, extra_metrics={"preference_estimation": pref, "review_generation": review})

    except Exception as e:
        print(f"[ToolEval] ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return _result(0.0, {"failure_stage": "exception", "error": str(e), "n_tools": n_tools},
                       extra_metrics={"preference_estimation": 0.0, "review_generation": 0.0})


if __name__ == "__main__":
    # Local integration test: evaluate the seed evolvable_tools.py exactly as
    # OpenEvolve would (defaults to 1 task unless OPENEVOLVE_NUM_TASKS is set).
    seed = os.path.join(project_dir, "evolvable_tools.py")
    print(f"Tool evaluator self-test on: {seed}")
    print("Result:", evaluate(seed))
