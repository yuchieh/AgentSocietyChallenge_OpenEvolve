import os
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

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
        return Agent(
            config=self.agents_config['psychological_analyst'],
            verbose=False
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
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True
        )
