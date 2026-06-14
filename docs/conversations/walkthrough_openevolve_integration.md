# OpenEvolve + AgentSocietyChallenge 整合與執行報告 (Phase 1)

**專案狀態**： ✅ 核心適配層開發完成、✅ Rapid Evaluation Dataset 建置完成、✅ NVIDIA NIM LLM 配置完成

為了將 OpenEvolve 自動生成提示詞/流程的概念融入 AgentSocietyChallenge 中，並優化 CrewAI 的多代理架構，我們順利完成了**方向 A（Meta-Prompt Optimization）**的骨幹對接，涵蓋了知識生成 Agent（使用者心理分析）與知識應用 Agent（行為模擬）的聯合演化基礎。

---

## 1. 核心整合基礎 (Integration Bridge)

### 1-A. 配置與隔離環境
我們嚴格遵守了專案規則與包管理原則：
- **`uv` 原則遵循**：以 `pyproject.toml` 為專一依賴真理。使用 `uv add crewai[litellm] python-dotenv` 解決了 `AgentSocietyServingFlow` 中 NIM API 的不相容問題，並以 `uv add /path/to/openevolve` 將其設為本地相依，使 OpenEvolve 可直接在 `uv run` 中啟動。
- **`.env` 環境變數**：在專案根目錄產生 `.env` 寫入 NVIDIA API 配置，並修改了主執行通道，確保 `crewai_simulation_agent.py` 啟動前優先載入。

### 1-B. 快速評估資料集 (Rapid Evaluation Subset)
為了配合 OpenEvolve 大量評估造成的算力消耗與時間成本：
- 我們建立並自動採樣了極小型的 5 筆「快速驗證集」 (`dummy_sampled_dataset`)，從 `test_review_subset.json` 的真實分佈中擷取。
- OpenEvolve 目前在 Evaluation 時將採用該資料快速偵測突變的 `agents_config.yaml` 格式錯誤或是極端離群表現，確保只有能跑通的變種，才能進一步進入 Full Dataset 驗證。

---

## 2. 模組變更軌跡與重構

為了實踐 **YAML-First** 與動態注入，系統做了關鍵性的彈性改造：

### **`config/agents_evolving.yaml`** [NEW]
保留了原始的代理定義框架，但將負責心理分析 (`psychological_analyst`) 及輸出模擬 (`behavior_simulator`) 的 Agent 內核描述加上 `# EVOLVE-BLOCK-START` / `# EVOLVE-BLOCK-END` 的標記。
> OpenEvolve CLI 偵測到此檔案即會開始進行 `backstory`, `role`, `goal` 交叉突變嘗試。

### **`src/flows/serving_flow.py`** [MODIFY]
原本直接呼叫 `SimulationCrew().crew().kickoff(...)`。現在 `AgentSocietyServingFlow` 將可以在類別實例化時接收額外的 `agents_config_path`，並在啟動 Crew 之前動態寫入到 `SimulationCrew` 供 `@CrewBase` 生成對應的代理。

### **`crewai_simulation_agent.py`** [MODIFY]
```diff
     def __init__(self, agents_config_path=None, *args, **kwargs):
-        self.agents_config_path = agents_config_path
+        self.agents_config_path = agents_config_path or os.environ.get("OPENEVOLVE_AGENTS_YAML", None)
         super().__init__(*args, **kwargs)
```
這是最核心的「橋樑」。因為官方 Simulator 啟動 `SimulationAgent` 的管道被封裝得非常深，我們藉由環境變數 `OPENEVOLVE_AGENTS_YAML` 將突變產生的臨時 YAML 路徑塞入 `AgentSocietyServingFlow`。

### **`openevolve_evaluator.py`** [NEW]
撰寫了與 OpenEvolve 工作池 (Worker Pool) 接軌的 Evaluator 類別：
- 初始化即載入 `websocietysimulator.Simulator` 並掛載 `dummy_sampled_dataset`。
- `evaluate()` 方法收到字串格式的 `generated_prompt` 後，寫入 `tempfile.yaml` 並丟入 `os.environ`。
- 直接執行 `run_simulation()`，最終針對得到的 MAE (Mean Absolute Error) 計算出 Fitness Score (5.0 - MAE），將評分直接反饋給 MAP-Elites 演算法。

---

## 3. 使用方式 (How to Run)

目前已經能夠使用下述指令在完全相容 `AgentSocietyChallenge` 的依賴環境中觸發微小型的自動迭代測試。您可以在終端機親自測試：

```bash
# 確保在專案目錄下執行
cd ~/WorkSpace/LLM_APP_2026/AgentSocietyChallenge

# 啟動 1 次迭代的 OpenEvolve (會藉由 AgentSociety 環境執行)
uv run --env-file .env python /Users/jack.ho/WorkSpace/openevolve/openevolve-run.py config/agents_evolving.yaml openevolve_evaluator.py --iterations 1
```

## 4. 人工驗收與下一步計畫
- `Phase 1` (Direction A Meta-prompt) 系統整合層已準備完畢。
- 專案在設計時均遵守 `uv` 管理與 YAML 分離規則。建議先檢驗這些基礎建設運行是否流暢，後續我們將可展開 **Direction C (對 Retriever Method / Logic 層進行演化)** ，例如：撰寫 `tools_evolving.py`。
