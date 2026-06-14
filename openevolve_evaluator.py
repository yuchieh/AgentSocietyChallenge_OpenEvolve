import os
import json
import tempfile
import sys
import logging
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout

project_dir = os.path.dirname(os.path.abspath(__file__))
if project_dir not in sys.path:
    sys.path.append(project_dir)

from websocietysimulator import Simulator
from crewai_simulation_agent import CrewAISimulationAgent
from src.tools.interaction_tool_wrapper import drain_tool_log

# 整個 simulation 的 hard timeout（秒）。超時則回傳 fallback fitness 讓 OpenEvolve 繼續。
# 預設 15 分鐘，可由 OPENEVOLVE_SIM_TIMEOUT env var 覆寫。
SIM_TIMEOUT_SEC = int(os.environ.get("OPENEVOLVE_SIM_TIMEOUT", 900))

# L0 工具使用觀測：tasks.yaml 強制的核心查詢 vs 校準用的加分查詢
ESSENTIAL_QUERIES = {"user", "item", "review_by_user"}
BONUS_QUERIES = {"review_by_item"}

# 可選的 coverage-aware fitness shaping。
#   shaped = raw * (1 - PENALTY * (1 - essential_coverage))
# 預設 0.0 = 完全不影響分數（向後相容）；設 1.0 則「完全沒查核心資料」直接歸零。
TOOL_COVERAGE_PENALTY = float(os.environ.get("OPENEVOLVE_TOOL_COVERAGE_PENALTY", "0"))


def _summarize_tool_use(log: list[dict]) -> dict:
    """把原始呼叫日誌整理成可讀的工具使用摘要。"""
    ok_by_type = Counter(c["query_type"] for c in log if c["ok"])
    failed = [c["query_type"] for c in log if not c["ok"]]
    used = set(ok_by_type)
    coverage = len(ESSENTIAL_QUERIES & used) / len(ESSENTIAL_QUERIES)
    return {
        "total_calls": len(log),
        "ok_by_type": dict(ok_by_type),
        "failed_calls": failed,
        "essential_coverage": round(coverage, 4),
        "missing_essential": sorted(ESSENTIAL_QUERIES - used),
        "used_bonus": sorted(BONUS_QUERIES & used),
    }


def _result(score: float, artifacts: dict = None, extra_metrics: dict = None):
    """統一的回傳包裝。優先用 EvaluationResult（帶 artifacts），
    若 OpenEvolve 不可用（例如本地直接跑）則 graceful 退回 dict。

    metrics 一定含 combined_score（OpenEvolve 用它當 fitness）。
    extra_metrics（如 preference_estimation / review_generation）會併入 metrics，
    供 MAP-Elites 當 feature dimensions 使用——OpenEvolve 仍以 combined_score 為
    fitness，feature_dimensions 列出的 metric 只決定多樣性座標，不影響勝負。
    """
    artifacts = artifacts or {}
    metrics = {"combined_score": float(score)}
    if extra_metrics:
        metrics.update({k: float(v) for k, v in extra_metrics.items()})
    try:
        from openevolve.evaluation_result import EvaluationResult
        return EvaluationResult(
            metrics=metrics,
            artifacts={k: (v if isinstance(v, (str, bytes)) else json.dumps(v, ensure_ascii=False))
                       for k, v in artifacts.items()},
        )
    except ImportError:
        return metrics

# ---------------------------------------------------------------------------
# Lazy singleton: Simulator is expensive to initialize (loads LMDB dataset).
# OpenEvolve imports this module once and calls evaluate() many times, so we
# initialize on the first call and reuse the same instance afterward.
# ---------------------------------------------------------------------------
_simulator: Simulator = None

def _get_simulator() -> Simulator:
    global _simulator
    if _simulator is None:
        logging.getLogger().setLevel(logging.WARNING)
        # Train/holdout split: evolution uses dummy_tasks (train); holdout
        # validation overrides these env vars to point at holdout_tasks.
        task_dir = os.environ.get("OPENEVOLVE_TASK_DIR", "dummy_tasks")
        gt_dir = os.environ.get("OPENEVOLVE_GT_DIR", "dummy_groundtruth")
        print(f"[Evaluator] Initializing Simulator (task_dir={task_dir}, one-time)...")
        _simulator = Simulator(data_dir="dummy_dataset", device="cpu", cache=True)
        _simulator.set_task_and_groundtruth(
            task_dir=task_dir,
            groundtruth_dir=gt_dir,
        )
        _simulator.set_agent(CrewAISimulationAgent)
        print("[Evaluator] Simulator ready.")
    return _simulator


def evaluate(program_path: str) -> dict:
    """
    Module-level function required by OpenEvolve.

    OpenEvolve writes the mutated YAML to a temp file (suffix configured as
    .yaml) and passes the FILE PATH here as the sole argument.

    Returns a dict with 'combined_score' as the primary fitness metric (required
    by OpenEvolve), plus individual sub-metrics for MAP-Elites feature tracking.

    combined_score = overall_quality (0–1):
      overall_quality = (preference_estimation + review_generation) / 2
    where preference_estimation = 1 - normalized_star_MAE.
    """
    simulator = _get_simulator()
    try:
        # 1. Tell CrewAISimulationAgent to load this YAML config for the run
        os.environ["OPENEVOLVE_AGENTS_YAML"] = program_path

        num_tasks = int(os.environ.get("OPENEVOLVE_NUM_TASKS", 5))
        print(f"\n[Evaluator] Running simulation: {program_path}  (tasks={num_tasks}, timeout={SIM_TIMEOUT_SEC}s)")

        # 清掉上一輪可能殘留的工具呼叫日誌（例如上一輪 timeout 中斷留下的）
        drain_tool_log()

        # Hard timeout 包住整個 simulation。如果 simulator/CrewAI/LiteLLM 內部卡住
        # （例如 rate limit retry 死循環），這層會在 SIM_TIMEOUT_SEC 後強制中止，
        # 讓 evaluator 回傳 fallback 分數讓 OpenEvolve 能繼續下一個 iteration。
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
            print(f"[Evaluator] ⏱  Simulation exceeded {SIM_TIMEOUT_SEC}s — returning fallback score")
            tool_summary = _summarize_tool_use(drain_tool_log())
            return _result(0.0, {"failure_stage": "timeout", "tool_use": tool_summary},
                           extra_metrics={"preference_estimation": 0.0, "review_generation": 0.0})

        # 取走本輪的工具呼叫日誌
        tool_summary = _summarize_tool_use(drain_tool_log())

        # 2. Compute official metrics
        # eval_results structure:
        #   {"type": "simulation", "metrics": <SimulationMetrics.__dict__>, "data_info": {...}}
        print("[Evaluator] Calculating official metrics...")
        eval_results = simulator.evaluate()

        metrics           = eval_results.get("metrics", {}) if isinstance(eval_results, dict) else {}
        overall_quality   = metrics.get("overall_quality", 0.0)
        pref_estimation   = metrics.get("preference_estimation", 0.0)
        review_generation = metrics.get("review_generation", 0.0)

        # 可選的 coverage-aware shaping（預設 PENALTY=0 → shaped == raw）
        coverage = tool_summary["essential_coverage"]
        shaped = overall_quality * (1.0 - TOOL_COVERAGE_PENALTY * (1.0 - coverage))

        shaping_note = "" if TOOL_COVERAGE_PENALTY == 0 else \
            f"  →  shaped={shaped:.4f} (coverage={coverage:.2f}, penalty={TOOL_COVERAGE_PENALTY})"
        print(
            f"[Evaluator] preference_estimation={pref_estimation:.4f}, "
            f"review_generation={review_generation:.4f}, "
            f"overall_quality={overall_quality:.4f}  →  combined_score={overall_quality:.4f}{shaping_note}"
        )
        print(f"[Evaluator] tool_use: {tool_summary}")

        artifacts = {
            "tool_use": tool_summary,
            "preference_estimation": round(pref_estimation, 4),
            "review_generation": round(review_generation, 4),
            "raw_overall_quality": round(overall_quality, 4),
        }
        # preference_estimation / review_generation 同時放進 metrics 供 MAP-Elites
        # 當 feature dimensions（多樣性座標）；combined_score 仍是 fitness。
        return _result(shaped, artifacts, extra_metrics={
            "preference_estimation": pref_estimation,
            "review_generation": review_generation,
        })

    except Exception as e:
        print(f"[Evaluator] ❌ Error during evaluation: {e}")
        import traceback
        traceback.print_exc()
        return _result(0.0, {"failure_stage": "exception", "error": str(e)},
                       extra_metrics={"preference_estimation": 0.0, "review_generation": 0.0})


if __name__ == "__main__":
    # Lightweight integration test — write initial YAML to a temp file,
    # then call evaluate() exactly as OpenEvolve would.
    import tempfile
    yaml_path = os.path.join(project_dir, "config", "agents_evolving.yaml")
    if os.path.exists(yaml_path):
        with open(yaml_path, "r", encoding="utf-8") as f:
            content = f.read()
        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False, encoding='utf-8') as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        try:
            fitness = evaluate(tmp_path)
            print(f"Test execution completed with evaluated fitness score: {fitness}")
        finally:
            os.remove(tmp_path)
