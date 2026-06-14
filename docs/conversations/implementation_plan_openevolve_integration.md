# OpenEvolve 整合計畫：AgentSociety CrewAI 演化

## Goal Description
將我們既有的多智能體預測系統（位於 `LLM_APP_2026/AgentSocietyChallenge` 的 `AgentSocietyChallenge` CrewAI 實作）完美整合進 `OpenEvolve` 的框架中。

根據收斂結果，演化的重心分為兩大階段：
- **第一階段 [方向A]**：進行 Agent Prompts 與 Persona 的自我進化，並特別引導 LLM 在 Prompt 中加入知識生成 (Knowledge Generation) 與應用的機制，以提高決策品質。
- **第二階段 [方向C]**：擴大演化範圍，讓 OpenEvolve 直接改寫負責資料處理與過濾的檢索邏輯程式碼 (Tool Logic Evolution)。
- **評估機制**：不依賴假資料，而是從真實的 `dummy_dataset` / `dummy_groundtruth`（或是真實提供之訓練資料集）中抽取出少量的「真實測試樣例」，寫成評估用的 Dataset，以求快速且客觀地透過 `run_simulator_test.py` 反映每次演化的預測分數。

## Proposed Changes

根據要求，我們將實作步驟拆分成高度具體、可於 5-10 分鐘內驗證的細節任務 (Bite-sized Tasks)。並且**嚴格遵守本專案的「`uv` 套件管理原則」與「CrewAI yaml-first 原則（禁止 hardcode prompt）」**。

---

### Step 1: 建立快速評估集 (Rapid Evaluation Dataset Pipeline)
- **目標檔案**: `[NEW] src/utils/create_sampled_dataset.py`
- **實作細節**:
  - 讀取現有的 `dummy_dataset/` 和 `dummy_groundtruth/`。
  - 隨機或順序抽取 5-10 筆連續的 User-Item interaction 紀錄。
  - 將這小批量的資料儲存到新建的目錄 `dummy_sampled_dataset/` 與 `dummy_sampled_groundtruth/`。
- **驗證步驟**:
  - 原地執行 `uv run python src/utils/create_sampled_dataset.py`
  - 確認成功產生正確格式的小型 JSONL 測試集。

### Step 2: 建立演化目標設定檔 (Evolving YAML File)
- **目標檔案**: `[NEW] config/agents_evolving.yaml`
- **實作細節**:
  - 基於已有的 `config/agents.yaml` 複製一份。
  - 這裡不會修改 python 檔案來寫 prompt（遵守 `crewai-strict-separation.md`）。相反地，我們會將 `# EVOLVE-BLOCK-START` 與 `# EVOLVE-BLOCK-END` 等註解直接安插在 YAML 內 Agent 的 `role`, `goal`, `backstory` 屬性周圍！
  - 確保這份 YAML 裡的 `backstory` 初始設計中含有「必須實施 Knowledge Generation 與邏輯推導」的初始模板，讓 LLM 有範本可以延續變異。
- **驗證步驟**:
  - 執行 `cat config/agents_evolving.yaml` 確保格式沒有因為 `#` 註解而破壞 YAML 解析。

### Step 3: 重構 CrewAI 架構以支援動態 Config
- **目標檔案**: `[MODIFY] src/flows/serving_flow.py` 或相關架構檔
- **實作細節**:
  - 為 `AgentSocietyServingFlow` (亦或 `UserAnalysisCrew` 等 `@CrewBase` 定義) 增添動態換置 `agents_config` 變數的能力。
  - 原因：當 OpenEvolve 每一輪產生新的 mutated YAML 給 Evaluator 時，Evaluator 必須能告訴 CrewAI 去讀取那份最新的 YAML，而非永遠寫死讀取預設的 `config/agents.yaml`。
- **驗證步驟**:
  - 暫時將 Crew 初始化中的 `agents_config` 替換為 `config/agents_evolving.yaml` 並執行 `uv run python run_simulator_test.py` 確保不會報錯。

### Step 4: 實作 OpenEvolve 的 Evaluator (`evaluator.py`)
- **目標檔案**: `[NEW] openevolve_evaluator.py` (在 repo 根目錄層級)
- **實作細節**:
  - 此腳本負責被 OpenEvolve 的 `openevolve-run.py` 呼叫。
  - 它將：
    1. 接收 `sys.argv[1]` 作為新生成的 `mutated_agents.yaml` 的位置。
    2. 指派 CrewAI 載入這份 `mutated_agents.yaml`。
    3. 實例化 `Simulator(data_dir="dummy_sampled_dataset", ...)`。
    4. 啟動 `simulator.run_simulation()` 並擷取 `simulator.evaluate()` 返回的分數 (例如算出的 MAE 或 MSE)。
    5. 將評分公式定為 `Fitness = 1.0 / (MAE + 1e-4)` (越低 MAE 分數越高)。
    6. 將 `{"score": fitness}` 與標準化 JSON 印出回傳給 OpenEvolve。
- **驗證步驟**:
  - 手動執行 `uv run python openevolve_evaluator.py config/agents_evolving.yaml` 確保其能夠回傳含有 `{"score": ...}` 的成功結果並跳出。

### Step 5: OpenEvolve 啟動配置與測試 (`config.yaml`)
- **目標檔案**: `[NEW] openevolve_config.yaml`
- **實作細節**:
  - 配置 `OpenEvolve` 要使用的演化引擎（例如透過 NVIDIA NIM 或 OpenAI 的環境變數）。
  - 將專為 YAML 設定的 `system_message` 寫死在此，特別叮囑 LLM：「你現在要優化的是一個 CrewAI Agents 的 YAML 設定檔，請絕對保持 YAML 語法正確，並專注增強在 Knowledge reasoning 上的角色描寫。」
- **驗證步驟**:
  - 執行微型測試： `uv run openevolve-run.py config/agents_evolving.yaml openevolve_evaluator.py --config openevolve_config.yaml --iterations 1` 確保所有自動化循環皆能跑通！

### [後續] Step 6: 檢索邏輯的重構 (Phase 2 - Direction C)
- 等 Prompt Evolution 的管線確立後，再複製一份 `data_process_evolving.py`，並把 `# EVOLVE-BLOCK-START` 打在用來過濾評論或是 Retrieval 的演算法實作區。
- 這樣可以讓 OpenEvolve 自己設計檢索架構。

## Verification Plan

### Automated Tests
1. **[小步快跑]**: 完成 Step 4 後，可確認我們的 Evaluator 完全能相容於這個黑盒子評估機制。
2. **[端到端]**: Step 5 的 single iteration run 如果沒有崩潰，代表包含 Artifact 反饋、LLM API Calls、到 yaml 的動態掛載已全數無縫接軌。
