import os
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

from src.tools.interaction_tool_wrapper import get_injected_tool
from src.tools.tool_loader import load_evolved_tools

# L5 (rate-limit defense): pace the crew's LLM calls to stay under the provider's
# limit and avoid 429-driven retry backoffs (which can blow the per-task 300s
# timeout). Crew-level max_rpm throttles requests per minute; 0 disables.
# Tunable via OPENEVOLVE_MAX_RPM (default 30 — conservative for NVIDIA NIM).
_MAX_RPM = int(os.environ.get("OPENEVOLVE_MAX_RPM", "30"))

# L2: default path to the derived-tool module (repo root evolvable_tools.py).
_DEFAULT_TOOLS_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "evolvable_tools.py"
)


def _tools_path():
    """Resolve the tool module at call time. During a tool-evolution run the
    evaluator points OPENEVOLVE_TOOLS_PATH at the current candidate file; the
    env is read here (per crew build) so each task picks up the right one."""
    return os.environ.get("OPENEVOLVE_TOOLS_PATH") or _DEFAULT_TOOLS_PATH


def _load_analyst_tools():
    """L2: safely load evolution-generated derived tools for the analyst.
    Any failure degrades gracefully to an empty list — the analyst can still
    reason from {retrieved_context} without these extra tools."""
    it = get_injected_tool()
    path = _tools_path()
    if it is None or not os.path.exists(path):
        return []
    try:
        with open(path, encoding="utf-8") as f:
            src = f.read()
        tools, report = load_evolved_tools(src, it)
        print(f"[L2] loaded evolved tools: {report.get('loaded', [])}; "
              f"dropped: {report.get('dropped', [])}")
        return tools
    except Exception as e:  # noqa: BLE001 — never let tool loading break the crew
        print(f"[L2] tool loading failed, continuing without: {e}")
        return []


@CrewBase
class SimulationCrew():
    """Simulation Crew for generating user review simulation"""

    # 指向剛才撰寫好的 YAML 配置檔
    agents_config = '../../config/agents.yaml'
    tasks_config = '../../config/tasks.yaml'

    @agent
    def data_retriever(self) -> Agent:
        # L1 接線後 data_retriever 不再呼叫工具：檢索已由 retrieval_executor
        # 在 crew 啟動前確定性完成，並透過 {retrieved_context} 注入 task。
        # 這個 agent 現在的職責是「萃取／結構化」已檢索好的資料，是純文字任務，
        # 不會有 ReAct 工具呼叫失效的風險。
        return Agent(
            config=self.agents_config['data_retriever'],
            verbose=False
        )

    @agent
    def psychological_analyst(self) -> Agent:
        # L2: this agent (the "decision point") gets the evolved derived-analysis
        # tools and decides autonomously whether to call them. Tools that fail
        # the sandbox are already dropped; if none load, the agent still works
        # from {retrieved_context}, so this never crashes the pipeline.
        return Agent(
            config=self.agents_config['psychological_analyst'],
            verbose=False,
            tools=_load_analyst_tools(),
        )

    @agent
    def behavior_simulator(self) -> Agent:
        return Agent(
            config=self.agents_config['behavior_simulator'],
            verbose=False
        )

    @task
    def retrieve_data_task(self) -> Task:
        return Task(
            config=self.tasks_config['retrieve_data_task']
        )

    @task
    def analyze_preference_task(self) -> Task:
        return Task(
            config=self.tasks_config['analyze_preference_task']
        )

    @task
    def simulate_review_task(self) -> Task:
        return Task(
            config=self.tasks_config['simulate_review_task']
        )

    @crew
    def crew(self) -> Crew:
        kwargs = dict(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
        if _MAX_RPM > 0:          # L5: throttle to avoid provider rate limits
            kwargs["max_rpm"] = _MAX_RPM
        return Crew(**kwargs)
