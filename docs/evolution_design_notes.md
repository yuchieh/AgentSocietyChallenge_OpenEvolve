# Evolution Design Notes — OpenEvolve × CrewAI Agent Optimization

> 本文件記錄我們運用 **OpenEvolve** 優化 CrewAI Agent Crew 設計的整體思路、
> 探索方向、以及 **Tool Calling Failure Taxonomy** 的設計、實作與驗證數據。
>
> **維護慣例**：之後每完成一項相關工作，會詢問是否要追加到本文件。
> 已落地的工作在「實作進度」表附上對應 PR 編號。

---

## 目錄

1. [背景與目標](#1-背景與目標)
2. [可優化面向總覽（10 個方向）](#2-可優化面向總覽10-個方向)
3. [Tool Calling Failure Taxonomy](#3-tool-calling-failure-taxonomy)
4. [協議／策略分離原則](#4-協議策略分離原則)
5. [L0 — 工具呼叫可觀測性](#5-l0--工具呼叫可觀測性)
6. [L1 — 安全進化工具使用策略](#6-l1--安全進化工具使用策略)
7. [L2 — 讓 OpenEvolve 創造新工具（設計，尚未實作）](#7-l2--讓-openevolve-創造新工具設計尚未實作)
8. [Tier C — 現成生態工具（RagTool，設計）](#8-tier-c--現成生態工具ragtool設計)
9. [EVOLVE-BLOCK 機制的真相](#9-evolve-block-機制的真相)
10. [Rate Limit 的五層防護](#10-rate-limit-的五層防護)
11. [實作進度與 PR 對照](#11-實作進度與-pr-對照)
12. [驗證數據](#12-驗證數據)
13. [後續工作的相互關係（L2 / #6 / #7）](#13-後續工作的相互關係l2--6--7)
14. [待辦與未解問題](#14-待辦與未解問題)

---

## 1. 背景與目標

本 repo 在競賽框架 `websocietysimulator` + CrewAI 三代理流水線之上，整合
OpenEvolve 做**進化式 prompt / 設計最佳化**。核心任務（Track 1）是預測某
用戶對某商家的評分與評論，fitness = `overall_quality`（評分準度 + 文字相似度）。

**大方向問題**：「運用 OpenEvolve 來優化目前的 Agent Crew 設計各個不同面向」
——不只進化 prompt 文字，還包括 Crew 拓撲、工具使用、任務設計等。

CrewAI 三代理流水線（進化前）：

```
data_retriever（有 tool）→ psychological_analyst → behavior_simulator
   查 4 種資料              分析偏好                 產出 {stars, review}
```

---

## 2. 可優化面向總覽（10 個方向）

依「新穎性 × 可行性」排名，列出可用 OpenEvolve 探索的方向：

| # | 方向 | 新穎性 | 可行性 | 改動範圍 |
|---|------|:---:|:---:|------|
| 1 | 結構化資料契約進化（解決 summary 壓縮瓶頸） | ★★★★ | ★★★★½ | tasks.yaml + block 範圍 |
| 2 | 確定性檢索器：用 Python 進化取代 LLM data_retriever | ★★★★½ | ★★★★ | 新增 evolvable .py |
| 3 | tasks.yaml 共同進化（含 ReAct 格式保護） | ★★★½ | ★★★★½ | 合併 YAML |
| 4 | Crew 拓撲 DSL 進化（成員數 + 協作模式） | ★★★★★ | ★★★ | 新 spec + crew factory |
| 5 | Artifacts 錯誤回饋通道 | ★★★ | ★★★★★ | 只改 evaluator |
| 6 | MAP-Elites 自訂特徵維度 | ★★★ | ★★★★★ | evaluator + config |
| 7 | Train/Validation 切分防過擬合 | ★★★ | ★★★★★ | evaluator + 資料 |
| 8 | Island 種子分化（多設計哲學並行） | ★★★★½ | ★★★ | config + 初始族群 |
| 9 | Cascade 兩階段評估（抗 rate limit） | ★★½ | ★★★★★ | evaluator 加兩函式 |
| 10 | 階層式協作模式進化（hierarchical process） | ★★★★★ | ★★ | crew factory 大改 |

> **共同約束**：實測最大瓶頸是 NVIDIA NIM rate limit（v3 進化 36% iteration 失敗）。
> 凡能「減少每次 evaluate 的 LLM call 數」的方向（#2、#9）都有雙重價值。

**目前進行中的主線**：方向 #2 的精神（把檢索從 LLM 移到確定性程式碼）已透過
Tool Calling Failure Taxonomy 的 L1 落地。

---

## 3. Tool Calling Failure Taxonomy

**起因**：v3 進化中，agent prompt 的突變曾導致 tool 呼叫失效，整個預測流程崩潰
（多次落到 0.3515 fallback 分數）。我們需要一套架構，讓 agent 能安全地進化、
使用不同工具、甚至創造新工具，而不會在工具呼叫上崩潰。

把工具呼叫的失效拆成 **5 層**，每層需要不同防護：

| 層 | 內容 | 進化會怎麼弄壞它 | 對應防護 |
|---|------|----------------|---------|
| **L1 呼叫協議** | ReAct 文字格式：`Action: ... Action Input: {JSON}` | 突變後 persona 讓 LLM 忘記/改寫格式 → parser 抓不到 → 幻覺資料 | tasks.yaml 凍結 → **L1 接線後徹底移除**（agent 不再呼叫） |
| **L2 參數正確性** | `query_type` 必須是 4 個精確字串之一 | LLM 發明新 query_type | clamp 直譯器（L1 executor） |
| **L3 呼叫策略** | 該呼叫哪些、幾次、順序 | 突變讓 agent「不查了直接猜」 | **L0 儀表化** + coverage 訊號 |
| **L4 結果消化** | 上千筆 review 的截斷/取樣 | 無進化壓力優化 | L1 policy 的 `review_sampling` |
| **L5 下游契約** | retriever summary → 下游 agent | summary 結構被突變改爛 | fitness 間接懲罰（仍裸露） |

> **關鍵洞察**：原本只有 L1（靠 tasks.yaml 凍結）有防護，L2~L5 都靠 fitness
> 噪音式間接懲罰。**fitness 只告訴進化「壞了」，不告訴它「哪裡壞了」**——這就是
> 為什麼有些突變看似無害卻造成崩潰。

---

## 4. 協議／策略分離原則

所有防護建立在這一條原則上：

```
┌──────────────────────────────────────────────────┐
│  協議層（Protocol）— 凍結、機器驗證、程式碼強制      │
│  「工具怎麼被呼叫」: 函式簽名、參數 schema、         │
│  ReAct 格式、回傳格式、註冊機制                     │
├──────────────────────────────────────────────────┤
│  策略層（Policy）— 自由進化                         │
│  「工具被怎麼使用」: 查什麼、查多少、何時查、         │
│  怎麼消化結果、甚至「需要什麼新工具」                │
└──────────────────────────────────────────────────┘
```

**安全憲法**：最壞情況 = 優雅退化（graceful degradation），絕不是災難性崩潰。

---

## 5. L0 — 工具呼叫可觀測性

**目標**：把 L3（呼叫策略）從盲區變成可觀測訊號，**預設行為逐位元不變**。

### 實作

**`src/tools/interaction_tool_wrapper.py` — 儀表化**
- thread-safe 呼叫日誌（`_TOOL_CALL_LOG` + `Lock`；Simulator `max_workers=2` 並行）
- 每條路徑記錄 `(query_type, ok)`
- `drain_tool_log()` 供 evaluator 取走+重置

**`openevolve_evaluator.py` — artifacts + 可選 shaping**
- simulation 前（清殘留）後（取結果）各 drain 一次
- 摘要：`total_calls / ok_by_type / failed_calls / essential_coverage / missing_essential / used_bonus`
- 回傳 `EvaluationResult` 帶 artifacts → 下一輪突變 prompt 看得到「`missing_essential: [user]`」
- 可選 coverage penalty（env `OPENEVOLVE_TOOL_COVERAGE_PENALTY`，預設 0 = 不影響分數）：
  `shaped = raw * (1 - PENALTY * (1 - essential_coverage))`

### 設計重點
- **觀測層增量**或 **env var opt-in**，預設與舊版完全相同
- 為後續 L1 clamp、L2 quarantine 提供「看得見」的基礎——沒有 L0，後續效果只能瞎子摸象

---

## 6. L1 — 安全進化工具使用策略

把工具呼叫從「LLM 主導（會崩潰）」變成「executor 確定性執行（clamp 保證安全）」。

### 6.1 檢索策略 DSL

進化端在 EVOLVE-BLOCK 內宣告 `retrieval_policy`：

```yaml
retrieval_policy:
  queries: [user, item, review_by_user, review_by_item]   # 查哪些、順序
  review_sampling:
    strategy: recent      # recent | random | extreme_ratings | longest
    k: 15                 # 1..50
  max_chars_per_result: 6000   # 500..20000
```

凍結端 `src/tools/retrieval_executor.py` 直譯：
- `ALLOWED_QUERIES` / `ALLOWED_STRATEGIES` 白名單
- `normalize_policy()` — **clamp, don't reject**：非法值投影回合法空間，永不 raise
- `execute_policy()` — 確定性檢索+格式化；per-query 失敗標註隔離
- 把每個 query 記進 L0 log（檢索移離 LLM 後觀測仍有意義）

### 6.2「白名單寫死 ≠ 沒有進化空間」

關鍵釐清（這是最常見的誤解）：

```
ALLOWED_QUERIES = 「合法動作的字彙表」（what is permitted）   ← 凍結
retrieval_policy = 「用這些字彙寫出的一句話」（what is chosen） ← 進化
```

白名單限制的是**字母表**，進化的是**用這些字母拼出的字串**。同一個白名單下，
不同 policy（查哪些子集、什麼順序、取樣策略、k、截斷）餵給下游的 context 天差地別。
直譯器寫死的是「安全邊界」，policy 是邊界內的某一個點。

**真正的天花板是資料集**（只有 user/item/review 三張表），不是 `ALLOWED_QUERIES`
這個 list——後者只是忠實反映底層資料邊界。

### 6.3 接線：data_retriever 從「呼叫者」轉為「萃取者」

```
Before:  crew → data_retriever[有tool] → LLM ReAct 呼叫 wrapper x4 → summary
After:   serving_flow → execute_policy(retrieval_policy) → retrieved_context
         → crew → data_retriever[無tool] → LLM 萃取 {retrieved_context}
```

- `executor`（凍結+clamp）負責「抓對、抓全、永不崩潰」
- `data_retriever`（LLM，可進化）負責「把原始資料萃取成洞察」——純文字任務，不會工具崩潰
- serving_flow 從 `get_injected_tool()` 拿 live tool 給 executor（不碰不可修改的 `crewai_simulation_agent.py`）

選項取捨：選保留 data_retriever（選項 Y）而非移除成 2-agent（選項 X）——改動可控、
保留可進化的萃取步驟。選項 X 列為未來優化（省一個 LLM call）。

### 6.4 這一步的精髓

> 把「會崩潰的部分」（LLM 主導工具呼叫）從進化空間**移除**（交給 clamp executor）；
> 把「值得進化的部分」（檢索策略 + 萃取 prompt）**留在**進化空間。
> 進化從此在「最壞只是低分」的安全地形上探索，不再有「改壞 prompt → 崩潰」的懸崖。

### 6.5 工具使用者的轉變（L1 接線前後）

L1 接線最根本的改變是**「誰在使用工具」**。一句話：**接線後，沒有任何 CrewAI
agent 在使用工具了**——查資料的工作從 agent 手上移到確定性的 executor。

**接線前**
```
data_retriever（agent）── 綁 @tool ──> interaction_tool_wrapper ──> InteractionTool
   LLM 用 ReAct 文字格式「主動」呼叫工具 4 次  ← 使用者是 LLM，會崩潰的那種
```

**接線後（現在）**
```
serving_flow（crew 啟動前）
   └─ get_injected_tool() 拿到 InteractionTool
   └─ execute_policy(...) ──直接呼叫──> InteractionTool.get_user/get_item/get_reviews
   └─ 結果存成 retrieved_context，注入 crew inputs
data_retriever（agent）── 無工具 ──> 只萃取 {retrieved_context}（純文字任務）
```

| 角色 | 接線後還用工具？ | 說明 |
|------|:---:|------|
| `retrieval_executor` | ✅ **唯一的真正使用者** | crew 啟動前確定性查資料 |
| `data_retriever`（agent） | ❌ | 變萃取者，只處理已給的文字 |
| `psychological_analyst` | ❌ | 本來就沒工具 |
| `behavior_simulator` | ❌ | 本來就沒工具 |

**副產物：`interaction_tool_wrapper`（@tool）成為孤兒**
唯一綁它的 data_retriever 在接線時拿掉了 `tools=[...]`，所以 `get_interaction_tool()`
與被 `@tool` 裝飾的 `interaction_tool_wrapper` 已**無人呼叫**。但其所在模組仍存活，
因為這些函式還有人用：`inject_simulator_tool()`（workflow 注入）、`get_injected_tool()`
（serving_flow 拿 tool 給 executor）、`_record()` / `drain_tool_log()`（L0 觀測）。
孤兒部分暫不清除——L2 可能復用其注入機制，待 L2 塵埃落定再評估（見 §14 待辦）。

---

## 7. L2 — 讓 OpenEvolve 創造新工具（設計，尚未實作）

讓進化「發明新的派生計算工具」。關鍵認知：原始資料固定（三張表），所以「新工具」
本質是**在固定資料上的新派生計算**——問題從「無界程式碼生成」收窄為「有界特徵工程」。

### 架構：進化的工具模組 + 凍結的裝載器

`evolvable_tools.py`（OpenEvolve 的 Python 模式 initial program）：

```python
# EVOLVE-BLOCK-START
def tool_rating_distribution(kit, user_id, item_id) -> str:
    """User's star-rating histogram and mean/std, for calibrating predictions."""
    ...   # 進化空間：LLM 可發明全新 tool_xxx 函式
# EVOLVE-BLOCK-END
```

凍結裝載器 `tool_loader.py` 四道關卡：
1. **AST 安全掃描** — 禁止 `os/sys/subprocess/open/exec/eval` 等
2. **簽名約定** — 只認 `tool_*` 前綴 + `(kit, user_id, item_id) -> str`
3. **沙箱試跑** — fixture task 實跑，5 秒 timeout，壞工具**靜默丟棄**（非報錯）
4. **自動包裝註冊** — docstring 成為 agent 看到的工具說明

### 三個巧思
- **docstring 共同進化**：CrewAI 把 tool description 給 agent 看。算得準但 docstring 含糊
  → agent 不呼叫 → 零 fitness 貢獻 → 淘汰。「工具的可被發現性」受進化壓力。
- **壞工具是「沉默的死基因」**：丟棄而非報錯，5 個壞 3 個剩 2 個照常，pipeline 永不崩潰。
- **工具數量交給 MAP-Elites**：把 `n_tools` 設為 feature dimension，保留「精簡派」到
  「重裝派」各路精英，讓進化回答「工具越多越好嗎」。

### docstring 機制的精確因果鏈
```
docstring 品質 → agent 呼叫/不呼叫 → 資訊是否進入推理 → 預測準度
            → combined_score → OpenEvolve selection → docstring 基因存續
```
agent 不「評判」docstring，它只是讀了決定用不用；真正的淘汰是 fitness + selection 做的。
**credit assignment 限制**：fitness 是整包一個分數，docstring 搭順風車被選擇——靠 L0
artifacts（哪些工具沒被呼叫）才能定向改進。

### 7.1 工具裝給誰？—— 裝在「決策點」，不是「資料點」

L2 工具裝給 **`psychological_analyst`**（3 個 agent 數量不變）。背後邏輯：

```
data_retriever        psychological_analyst       behavior_simulator
（資料點）              （決策點 ★）                （輸出點）
取得+整理資料   →     判斷用戶會怎麼反應    →     生成最終結果
   無工具              ← 工具在這裡最有價值 →         無工具
```

進階工具（派生計算）的存在意義是「**做更好的判斷**」，所以裝在判斷發生的地方。

**為什麼不是 data_retriever**（這點最關鍵）：
1. **會把 L1 才剛清掉的崩潰風險請回來** — PR #8 才把 data_retriever 去工具化（改確定性
   executor）；裝回工具等於把 LLM-主導-工具-呼叫的崩潰風險請回剛清乾淨的位置，自我矛盾。
2. **職責混淆** — 它現在的單一職責是「萃取已檢索的原始資料」（純文字任務）；加工具會變
   「萃取者+分析者」職責不清。
3. **時機太早** — 它是第一棒，還沒有分析脈絡，無從判斷「該不該算進階分析」。

**為什麼是 psychological_analyst**：任務性質匹配（它本來就在分析評分習慣/偏好）、是「自主
按需呼叫」的最佳位置（臨場判斷這個 case 要不要算 variance/affinity）、失敗安全（不呼叫或
工具壞了還有 executor 的 retrieved_context 墊底，優雅退化）。**不是 behavior_simulator**：
它是輸出點，該專心生成 stars+review，分析應在它之前完成。

**L1 ↔ L2 的對稱**：確定性的核心檢索 → executor（非 agent）；需判斷的進階分析 → analyst
（agent）。data_retriever 卡在中間當「把確定性結果整理成文字」的橋樑，兩邊都不沾工具。

### 7.2 進化架構（兩個選項，Phase 2 拍板）

OpenEvolve 一次 run 只進化一個 initial program 檔案。L2 要進化工具程式碼有兩條路：
- **選項 A'（傾向）**：獨立進化 `evolvable_tools.py`（Python 模式，OpenEvolve 原生強項，
  可用 diff 模式、格式乾淨）；代價是工具與 prompt 分開進化（可用交替優化彌補）。
- **選項 B**：把工具程式碼塞進 YAML 一個 `evolvable_tools_code: |` 欄位（單一目標、可共同
  進化）；代價是 YAML-in-Python 雙重縮排敏感、易出錯。

### 7.3 實作分期（沿用 L0/L1 節奏）

- **Phase 1（沙箱地基，零風險可測）— ✅ 已完成（PR #13）**：`tool_loader.py`（ReadOnlyKit
  + 四道關卡）+ `evolvable_tools.py`（2 個 seed 工具）+ `tests/test_tool_loader.py`。
  **未接進 pipeline**。
- **Phase 2（接線）⬜**：定 A'/B、給 psychological_analyst 裝 evolved tools、L0 儀表化延伸到
  evolved tool 呼叫、`n_tools` 加進 MAP-Elites 維度（接 #6）、holdout 驗證工具普遍價值（接 #7）。

#### 7.3.1 Phase 1 實作摘要（PR #13）

**四道關卡**（`src/tools/tool_loader.py`）：

| Gate | 函式 | 作用 | 失敗處置 |
|------|------|------|---------|
| 1 | `ast_safety_scan` | 靜態擋非白名單 import、危險 builtins（open/exec/eval/`__import__`）、dunder 逃逸（`__class__`/`__globals__`） | 整檔拒絕（exec 會跑整個 module） |
| 2 | `signature_ok` | 只認 `tool_*` 且簽名 `(kit, user_id, item_id)` | 不列為候選 |
| 3 | `trial_run` | fixture 實跑一次，5s timeout，回傳須非空 str ≤ 4000 字元 | **靜默丟棄**（沉默死基因） |
| 4 | `_wrap_as_crewai_tool` | 存活者包成 CrewAI `@tool`，docstring → description | — |

**ReadOnlyKit**：資料門面，只暴露 `get_user/get_item/get_reviews`——碰不到檔案系統、網路、
groundtruth，萬流歸宗到唯讀資料。exec 在受限 namespace（safe builtins + 只放行白名單的
`__import__`，AST 之上的縱深防禦）。

**安全範圍**：教育級沙箱（AST + 受限 builtins + 唯讀門面），防 LLM **無意中**寫危險碼，
非對抗惡意攻擊者（生產級需 subprocess/container）。

**驗證數據**：
- 22 單元測試全綠（惡意碼被擋 / 壞工具丟棄 / 好工具通過 / 混合 1 好 3 壞→只 load 好的不崩 /
  seed 工具確實可 load）；連同 L1 的 22 測試 = **44 全綠**。
- seed 工具用真實 `CacheInteractionTool` 能 load，空歷史時優雅回退（robust）。

**實作中抓到的真 bug**：受限 namespace 移除 `__import__` 後，連白名單的 `import statistics`
都無法執行（import 機制需要 `__import__`）。修正為提供只放行白名單的 `_safe_import`。

---

## 8. Tier C — 現成生態工具（RagTool，設計）

把 CrewAI 生態的現成重型工具（如語意檢索 `RagTool`）納入安全進化。

**為何不能套 L2**：RagTool 有狀態（需建索引）、初始化成本高、需配置、引入「語意相似度
檢索」新能力。**不該讓 LLM 寫它的初始化程式碼**（會亂配 embedding/vectordb、每次重建索引）。

**正確模式：能力註冊表（Capability Registry）+ 宣告式 portfolio**

| Tier | 工具來源 | 進化方式 | 安全機制 |
|------|---------|---------|---------|
| A | 內建唯讀查詢 | 凍結 | 永遠可用 |
| B | 派生計算工具（L2） | LLM 寫純函式 | AST 沙箱 + 唯讀 kit |
| **C** | 現成生態工具（RagTool） | 從 registry 選用+配置 | 人類工廠 + 白名單 + clamp |

人類寫安全工廠（`@lru_cache` 預建索引一次共享、**本地** embedding 避免 API 壓力、
**只 index 訓練集且排除當前 task 的 groundtruth review**）；進化只在 portfolio 宣告
「哪個 agent 配哪些工具、top_k 多少」。

**四個陷阱**：索引重建成本（預建共享）、embedding API rate limit（用本地 MiniLM）、
grounding 洩漏（排除測試樣本）、reward hacking（避免語意檢索撈回真實答案）。

---

## 9. EVOLVE-BLOCK 機制的真相

深入 OpenEvolve 原始碼（`utils/code_utils.py`）後的發現：

- `parse_evolve_blocks()` **存在但在核心進化迴圈中從未被呼叫**（`iteration.py` /
  `process_parallel.py` / `controller.py` / `prompt/sampler.py` 都沒 import 它）
- 進化引擎是把**整份程式（含 EVOLVE-BLOCK 標記文字）丟給 LLM**，標記只是**寫在 prompt
  裡給 LLM 看的提示**，引擎不解析、不計數
- 官方 `examples/README.md` 說「Exactly one EVOLVE-BLOCK」——這是**最佳實踐建議**
  （多 block 收斂變慢），**不是技術硬限制**
- `api.py`：完全沒 block 時自動把整體包成一個；有任意數量 block 時原樣傳遞

**結論**：6 個 block 技術上能跑，但官方建議合併成 1 個。我們已合併。

---

## 10. Rate Limit 的五層防護

| 層 | 位置 | 處理對象 |
|---|------|---------|
| L1 | `openevolve_config.yaml` `llm.retries=3, retry_delay=30` | OpenEvolve 突變 LLM 呼叫 |
| L2 | `openevolve_evaluator.py` hard timeout 15min | 整個 simulation wall time |
| L3 | `openevolve_config.yaml` `evaluator.timeout=900, max_retries=2` | evaluate() 重試 |
| L4 | `websocietysimulator/simulator.py` `future.result(timeout=300)` | 單一 task |
| L5（缺） | `simulation_crew.py` 沒設 `max_rpm` | CrewAI/LiteLLM 內部呼叫 |

**重要**：L1 接線後，data_retriever 不再用 LLM 呼叫工具，每個 task 的 LLM call 從
~7 次（含 ReAct 多輪）降到 ~3 次——這本身就大幅降低 rate limit 壓力（見驗證數據）。

---

## 11. 實作進度與 PR 對照

| 項目 | 狀態 | PR |
|------|------|----|
| Repo 重構（清理/合併測試/路徑對齊/docs legacy/Makefile） | ✅ merged | #1, #4 |
| data_retriever 進化 + review_by_item + evaluator timeout + 學生文件 | ✅ merged | #2 |
| Gemini 對話歸檔 | ✅ merged | #6 |
| **L0** 工具可觀測性 | ✅ merged | #5 |
| **L1** clamp 直譯器（executor + 22 單元測試） | ✅ merged | #7 |
| **L1** 接線（executor → pipeline，7 檔案） | ✅ merged | #8 |
| 設計文件落地 | ✅ merged | #9 |
| **#7** Train-Val 切分（holdout 驗證機制） | ✅ merged | #10 |
| **#6** MAP-Elites 自訂維度（preference × review） | ✅ merged | #11 |
| L2 規劃擴充（工具放置/架構/分期） | ✅ merged | #12 |
| **L2 Phase 1** 沙箱地基（loader + seed + 22 測試） | ✅ merged | #13 |
| L2 Phase 2 接線（工具裝給 analyst） | ⬜ 設計完成 | — |
| Tier C 能力註冊表（RagTool） | ⬜ 設計完成 | — |

```
Failure Taxonomy 進度：
✅ L0  可觀測性
✅ L1  clamp 直譯器
✅ L1  接線
🔵 L2  工具生成（Phase 1 沙箱地基 ✅；Phase 2 接線 ⬜）
⬜ Tier C  能力註冊表
```

---

## 12. 驗證數據

### 12.1 L1 元件單元測試
`tests/test_retrieval_executor.py` — **22 案例全綠**。證明 clamp 契約：
垃圾 policy（None / 字串 / 非法 query / k=-99 / k=999999 / non-dict）全部 clamp 不 raise；
各 sampling strategy 排序正確；per-query 失敗隔離。

### 12.2 L1 接線端到端
- **真實 1-task evaluate**：`combined_score=0.7454`，`tool_use coverage=1.0`
  （4 次查詢現在來自 executor，由 L0 捕捉）
- **mock smoke**（`agents_config_path=None` fallback 路徑）：✅ pass，無 KeyError
- 之前每次都有的 `cannot schedule new futures after shutdown` 警告**消失**
  （data_retriever 不再走 ReAct 工具呼叫機制）

### 12.3 進化跑歷史對照

| 跑次 | 設定 | baseline | best | 備註 |
|------|------|:---:|:---:|------|
| v1 | 10 iter × 1 task, 3 tools | 0.6646 | **0.7901** | 最早成功 |
| v3 | 50→10 iter × 3 tasks, 4 tools | 0.2826 | 0.6419 | rate limit 嚴重，59× 429，~36% fallback |
| L1 驗證 | 15 iter × 1 task（接線後） | — | ~0.779 | 14/15 完成後被環境 kill |

### 12.4 L1 對 rate limit / 穩定性的影響（接線前後）

| 指標 | v3（接線前） | L1 接線後 |
|------|:---:|:---:|
| 每 task LLM call | ~7（含 ReAct 來回） | ~3 |
| tool calling 崩潰 | 多次 | **0**（agent 不再呼叫工具） |
| tool_use coverage | 不穩 | 穩定 **1.0**（executor 確定性） |
| 429 rate limit | 59 次 | 大幅減少 |

> **注意**：受 Claude Code 背景任務 ~1 小時上限影響，多次完整進化（50 iter）被
> 中途 kill。要跑完整進化建議在終端機用 `nohup make evolve ITERS=50 TASKS=1 &`。

---

### 12.5 #7 Train-Val 切分實作摘要

**機制**：把評估任務分成兩組 disjoint 集合——
- `dummy_tasks/`（train，5 個）：進化時 evaluator 預設使用
- `holdout_tasks/`（holdout，5 個）：只用於事後驗證，**與 train 無重疊**

**改動**：
- `src/utils/create_sampled_dataset.py`：加 `--exclude`（排除某 task dir 已用的
  (user_id,item_id)，確保 holdout 與 train disjoint）與 `--seed`；順手修 default
  input 路徑 `data/` → `dummy_dataset/`（PR #4 漏改）。
- `openevolve_evaluator.py`：`_get_simulator()` 改讀 `OPENEVOLVE_TASK_DIR` /
  `OPENEVOLVE_GT_DIR` env var（預設 train），讓同一個 evaluator 能切到 holdout。
- `scripts/validate_holdout.py`：載入指定 YAML，對 holdout 跑 evaluate，回報
  holdout 分數；預設驗證 `best_program.yaml`（無則 `config/agents.yaml`）。
- `Makefile`：`make validate-holdout [YAML=path]`。

**用法**：
```bash
# 進化（train，不變）
make evolve ITERS=50 TASKS=1
# 進化後驗證最佳個體是否過擬合
make validate-holdout
# train - holdout 差距大 => 過擬合
```

**驗證數據**（baseline `config/agents.yaml`，1 task）：
- disjoint 檢查：train=5, holdout=5, overlap=**0** ✅
- holdout 路徑端到端：`task_dir=holdout_tasks`、tool_use coverage=1.0
- **HOLDOUT combined_score = 0.8601**（單 task，僅證明機制運作；多 task 才有統計意義）

**限制**：train 仍只有 5 個樣本，統計噪音大；holdout 機制已就緒，但要降低噪音需
擴大 train 樣本數（資料源 `dummy_dataset/test_review_subset.json` 有 198 筆可取）。

### 12.6 #6 MAP-Elites 自訂維度實作摘要

**目的**：`combined_score = (preference_estimation + review_generation) / 2`，這兩個分項
常此消彼長（評分超準但文字平庸／文字好但評分差）。用單一 combined_score 當唯一座標，
會把兩種極端高手都壓成中間值而淘汰。改用這兩個分項當 MAP-Elites 的 **diversity 維度**，
能保留「評分準度 × 文字擬真度」二維網格的各路精英，看見 trade-off 前沿並雜交出兼顧者。

**關鍵分工**（OpenEvolve 的 fitness vs feature 機制）：
- `combined_score` 仍是 **fitness**（決定誰勝出）
- `preference_estimation` / `review_generation` 是 **feature dimensions**（決定多樣性座標，
  不影響勝負）——OpenEvolve 規則：有 combined_score 就用它當 fitness，feature_dimensions
  列出的 metric 只作座標。

**改動**：
- `openevolve_evaluator.py`：`_result()` 加 `extra_metrics` 參數，把
  `preference_estimation` / `review_generation` 一併放進 **metrics**（原本只在 artifacts）。
  三條 return 路徑（成功／timeout／exception）都提供這兩個 metric，避免 MAP-Elites 缺維度。
- `config/openevolve_config.yaml`：`feature_dimensions: [preference_estimation, review_generation]`，
  `feature_bins: 8`（8×8 = 64 cells）。raw 連續 0–1 值，**非 bin index**（符合官方警告）。
- 順手修 `system_message`：移除 L1 接線前殘留的「data_retriever 必須遵循 tool-calling 格式」
  舊規則，改述其新職責（萃取者，不呼叫工具）+ 說明可調 `retrieval_policy`。

**驗證數據**：
- config 載入：`feature_dimensions=['preference_estimation','review_generation']`, `bins=8` ✅
- 真實 1-task evaluate 回傳 metrics：
  `{combined_score:0.6998, preference_estimation:0.70, review_generation:0.6997}` ✅
  （三值齊備：1 個 fitness + 2 個 feature 座標）

**觀測建議**：跑進化後用 visualizer 看 MAP-Elites 網格，即可直接觀察「評分準度 vs
文字擬真度」的 trade-off 前沿——這也是很好的教學展示。

---

## 13. 後續工作的相互關係（L2 / #6 / #7）

三者之間**沒有硬性技術依賴**（誰都不 import 誰、都能獨立跑），但有重要的方法論順序與協同。

### 三種關係

| 關係類型 | 意思 | 存在嗎 |
|---------|------|--------|
| 硬依賴（build/runtime） | A 沒做 B 就無法運作/報錯 | ❌ 完全沒有 |
| 方法論依賴 | A 沒做，B 的結果無法被信任 | ✅ 有一條關鍵的 |
| 協同增強 | A 做了讓 B 更有價值 | ✅ 有一對很強的 |

### 逐對分析

**L2 ↔ #7（Train-Val 切分）— ⭐ 方法論依賴（最關鍵）**
L2 大幅擴大搜尋空間 → 過擬合與 reward-hacking 風險升高。沒有 holdout，**分不清 L2 的「進步」是真聰明還是背了那幾題的答案**。L2 不 import #7，但 **#7 是 L2 結果可信度的前提**。

**L2 ↔ #6（MAP-Elites 自訂維度）— 強協同**
L2 設計裡「把 `n_tools` 設為 feature dimension」正是 #6。有了 #6，MAP-Elites 會保留「精簡派 → 重裝派」各路精英，直接回答 L2 的核心問題「工具越多越好嗎」。#6 不是 L2 前提，但大幅放大 L2 的探索品質與可解釋性。

**#6 ↔ #7 — 幾乎正交**
#6 改「多樣性地圖維度」（探索結構），#7 改「fitness 可信度」（評估結構），動的是不同部位，可獨立任意順序。

### 關係圖

```
                    擴大搜尋空間（重量級）
                          L2 工具生成
                         ╱            ╲
              方法論依賴 ╱              ╲ 強協同
        （先有照妖鏡）  ╱                ╲（n_tools 維度）
                      ╱                  ╲
            #7 Train-Val            #6 MAP-Elites 自訂維度
            （fitness 可信度）  正交   （探索結構）
```

### 關鍵洞察與建議順序

`#6 / #7` 是「改善衡量與探索機制」（輕量，只改 evaluator+config，不擴大搜尋空間）；
`L2` 是「擴大能力範圍」（重量，大幅擴大搜尋空間）。
**先把尺量準（#7）、地圖畫好（#6），再放生更強的探索者（L2）**：

```
#7 Train-Val 切分   ← 先做。輕量，是 L2 的驗證地基，也立刻揭露現有過擬合
       ↓
#6 MAP-Elites 維度  ← 再做。輕量，為 L2 準備好 n_tools 維度
       ↓
L2 工具生成         ← 最後。此時已有 holdout 照妖鏡 + n_tools 地圖，
                      能可信評估「進化發明的工具」是否有普遍價值
```

> 這是建議順序，非硬性。L2 可獨立先做（會跑、有測試），只是屆時缺乏判斷其進步真假的工具。

---

## 14. 待辦與未解問題

- [x] **L2 Phase 1** 沙箱地基（tool_loader 四道關卡 + seed + 22 測試，PR #13，見 §7.3.1）
- [ ] **L2 Phase 2** 接線（工具裝給 psychological_analyst + 進化架構 A'/B + n_tools 維度）
- [ ] **Tier C**（RagTool registry + portfolio）實作
- [ ] **L5 rate limit**：CrewAI 端 `max_rpm` / `litellm_params`（目前裸露）
- [x] **方向 #7 Train/Val 切分**：已建立 disjoint holdout 機制（見下方「#7 實作摘要」）。後續仍可擴大 train 樣本數降低噪音
- [x] **方向 #6 MAP-Elites 自訂維度**：已用 `preference_estimation × review_generation` 當 feature dims（見 §12.6）。後續可跑進化看 trade-off 前沿
- [ ] 完整 50-iter 進化（需在不受 session 上限影響的環境跑）
- [ ] coverage penalty A/B：`OPENEVOLVE_TOOL_COVERAGE_PENALTY` 是否真的有助於收斂
- [ ] **清理孤兒 @tool**：L1 接線後 `interaction_tool_wrapper`（@tool）與
  `get_interaction_tool()` 已無人呼叫（見 §6.5）。**待 L2 完成後評估是否移除**——
  L2 可能復用其注入機制，故暫留。

---

*本文件持續維護。新工作完成後會詢問是否追加記錄。*
