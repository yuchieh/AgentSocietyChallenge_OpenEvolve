# 教學投影片大綱 — 用 OpenEvolve 進化 LLM Agent Crew
### 從「會崩潰的 Tool Calling」到「安全可進化的多代理系統」

> **目標受眾**：修習 LLM 應用 / Multi-Agent 系統的學生（已具備 Python 與基本 LLM 概念）
> **建議時長**：75–90 分鐘（含 demo 與問答）
> **總張數**：約 40 張，分 7 個 Part
> **慣例**：每張標 `🎤 講者備註`、`📊 視覺建議`、`💬 互動點`

---

## 學習目標（開場時揭示，結尾時回收）

1. 理解 **進化式最佳化（OpenEvolve / AlphaEvolve 類）** 如何套用在 LLM agent 設計
2. 能說出 **Tool Calling 的 5 層失效**，並為每層設計對應防護
3. 掌握一條可遷移的設計原則：**協議/策略分離 + 優雅退化**
4. 學會用 **MAP-Elites、Train/Val 切分** 等機制讓「自動優化」變得可信
5. 帶走數個真實工程教訓（「分數健康 ≠ 功能正確」等）

---

# Part 0 — 開場（3 張）

### Slide 1 — 標題頁
- 主標：用 OpenEvolve 進化 LLM Agent Crew
- 副標：從會崩潰的 Tool Calling 到安全可進化的多代理系統
- 講者 / 日期 / repo 連結
- 📊 一張「進化前 vs 進化後」分數對比的 teaser 圖

### Slide 2 — 議程
- 7 個 Part 一頁總覽
- 🎤 點出主線：我們會用「Tool Calling 崩潰」這個真實事故當貫穿全場的案例

### Slide 3 — 學習目標
- 上述 5 條
- 💬 互動點：問「誰寫過會自己改自己 prompt 的系統？」破冰

---

# Part 1 — 背景與問題（5 張）

### Slide 4 — 競賽任務
- WWW'25 AgentSociety Challenge Track 1：預測用戶對商家的 `{stars, review}`
- fitness = `overall_quality` =（評分準度 + 文字相似度）/ 2
- 📊 一筆 (user, item) → 預測 vs groundtruth 的示意

### Slide 5 — 基礎架構：CrewAI 三代理流水線
- `data_retriever → psychological_analyst → behavior_simulator`
- 📊 流程圖（查資料 → 分析偏好 → 生成輸出）
- 🎤 強調 sequential：前一棒的輸出是後一棒的 context

### Slide 6 — OpenEvolve 是什麼？
- Google AlphaEvolve 的開源實作：用 LLM 反覆「突變程式 → 評分 → 選擇」
- 關鍵元件：MAP-Elites 資料庫、Island 模型、EVOLVE-BLOCK 標記
- 📊 進化迴圈圖（sample → mutate → evaluate → select）

### Slide 7 — 核心問題
- 「如何用 OpenEvolve 優化 agent crew 的**各個面向**？」
- 不只 prompt 文字——還有工具使用、任務設計、crew 拓撲
- 🎤 這不是「調 prompt」，是「讓系統自己設計自己」

### Slide 8 — 10 個可優化方向（地圖）
- 📊 2×2 矩陣：新穎性 × 可行性，標出 10 個方向
- 高亮今天的主線：方向 #2（確定性檢索）→ 透過 Tool Calling Taxonomy 的 L1 落地
- 🎤 共同約束：rate limit 是真實天花板（v3 進化 36% iteration 失敗）

---

# Part 2 — 事故與分類（5 張）

### Slide 9 — 事故現場
- v3 進化：agent prompt 突變 → tool 呼叫失效 → 整條 pipeline 崩潰
- 📊 分數時間軸：多次掉到 0.3515 fallback
- 🎤 「進化讓系統變強，但也可能讓它把自己改壞」

### Slide 10 — 為什麼會崩？拆解失效
- 工具呼叫不是單一動作，是一條鏈
- 💬 互動點：讓學生猜「哪些地方會壞？」

### Slide 11 — Tool Calling Failure Taxonomy（核心投影片）
- 📊 5 層表格：
  - L1 呼叫協議（ReAct 格式被改壞）
  - L2 參數正確性（query_type 亂掰）
  - L3 呼叫策略（不查了直接猜）
  - L4 結果消化（上千筆 review 怎麼取樣）
  - L5 下游契約（summary 結構爛掉）
- 🎤 這張是全場骨架，後面每個解法都對回這張

### Slide 12 — 關鍵洞察
- 原本只有 L1 有防護（tasks.yaml 凍結），L2–L5 全裸露
- **「fitness 只告訴你壞了，不告訴你哪裡壞」**
- 🎤 這句是整場的金句——可重複

### Slide 13 — 設計原則：協議 / 策略分離
- 📊 上下兩層圖：
  - 協議層（凍結、機器驗證）：工具「怎麼被呼叫」
  - 策略層（自由進化）：工具「被怎麼使用」
- **安全憲法：最壞 = 優雅退化，絕不是災難性崩潰**

---

# Part 3 — 分層解法 L0 / L1 / L2（12 張）

### Slide 14 — 解法總覽
- 📊 L0（看得見）→ L1（安全用）→ L2（安全造）的疊層圖
- 🎤 每層都遵守同一條安全憲法

### Slide 15 — L0：工具呼叫可觀測性
- 把 L3（呼叫策略）從盲區變訊號
- thread-safe 呼叫日誌 → evaluator artifacts
- 下一輪突變的 prompt 看得到「`missing_essential: [user]`」
- 🎤 預設行為逐位元不變——純觀測增量

### Slide 16 — L0 為什麼是地基
- 沒有 L0，L1 的 clamp、L2 的 quarantine 效果「看不見」
- 📊 「瞎子摸象 vs 有儀表板」對比

### Slide 17 — L1：把工具呼叫從 LLM 手上拿走
- 進化端宣告 `retrieval_policy`（查什麼、取樣、截斷）
- 凍結端 `executor` 直譯：**clamp, don't reject**
- 📊 retrieval_policy YAML 範例

### Slide 18 — L1 的最大誤解（很重要的教學點）
- **「白名單寫死 ≠ 沒有進化空間」**
- 📊 字母表 vs 句子的類比：26 字母固定，能寫無限句子
- 同一白名單下，不同 policy 餵出的 context 天差地別
- 🎤 真正的天花板是資料集，不是白名單

### Slide 19 — L1 接線：data_retriever 轉型
- 📊 Before/After 流程圖
- 從「呼叫者」→「萃取者」（純文字任務，不會工具崩潰）
- 🎤 「會崩的部分移出進化空間，值得進化的部分留下」

### Slide 20 — L1 的副作用：誰還在用工具？
- 📊 一句話：接線後**沒有 agent 在用工具**，查資料全交給 executor
- 角色表（executor=唯一使用者；三個 agent 都不碰）
- 🎤 帶出「孤兒 @tool」——工程現實：重構會留下需要清理的東西

### Slide 21 — L2：讓進化「發明新工具」
- 關鍵收窄：資料固定（三張表）→「新工具」= 有界特徵工程，不是無界程式生成
- 📊 evolvable_tools.py 的 EVOLVE-BLOCK 範例

### Slide 22 — L2 安全沙箱：四道關卡
- 📊 四關卡流程圖：
  1. AST 安全掃描（擋 import/open/exec/dunder）
  2. 簽名約定（只認 tool_*）
  3. 沙箱試跑（timeout，壞工具靜默丟棄）
  4. 包裝註冊（docstring → 工具說明）
- 🎤 ReadOnlyKit：萬流歸宗到唯讀資料

### Slide 23 — 「沉默的死基因」
- 壞工具丟棄而非報錯：5 個壞 3 個，剩 2 個照常 → pipeline 永不崩
- 🎤 對回安全憲法（優雅退化）

### Slide 24 — docstring 共同進化（精妙設計）
- 📊 因果鏈：docstring 品質 → agent 呼不呼叫 → fitness → selection → 基因存續
- 工具的「可被發現性」也受進化壓力
- 🎤 澄清：agent 不「評分」docstring，它只是讀了決定用不用；淘汰是 selection 做的

### Slide 25 — L2 工具裝給誰？決策點 vs 資料點
- 📊 三棒流水線圖，工具標在 analyst（決策點）
- 為什麼不是 data_retriever：會把 L1 剛清掉的崩潰風險請回來 + 職責混淆 + 時機太早
- 🎤 L1↔L2 對稱：確定性的事給 executor，需判斷的事給 agent

---

# Part 4 — 讓「自動優化」變可信（6 張）

### Slide 26 — 自動優化的陷阱：過擬合
- 進化會「背答案」——對那幾個 train task 特化但不泛化
- 💬 互動點：舉「總是猜低分剛好 train 都是低分用戶」的例子，讓學生判斷真假進步

### Slide 27 — #7 Train/Val 切分（過擬合照妖鏡）
- disjoint holdout 集合（與 train 無重疊）
- 📊 train 0.90 / holdout 0.40 → 過擬合警報；train 0.75 / holdout 0.72 → 可信
- `make validate-holdout`

### Slide 28 — #6 MAP-Elites 自訂維度
- 問題：combined_score 把「評分準/文字平庸」與「文字好/評分差」都壓成中間值
- 解法：用兩個分項當 diversity 維度 → 保留 trade-off 前沿各路精英
- 📊 8×8 網格示意（preference × review）
- 🎤 fitness vs feature 的分工：combined_score 決勝負，維度只決座標

### Slide 29 — 三者的相互關係
- 📊 關係圖：#7（照妖鏡）→ L2；#6（地圖）↔ L2 協同；#6↔#7 正交
- 建議順序：先把尺量準（#7）、地圖畫好（#6），再放生探索者（L2）
- 🎤 「沒有硬依賴，但有方法論順序」

### Slide 30 — Rate Limit 五層防護
- 📊 L1–L5 防護表（retry / hard timeout / cascade / per-task timeout / max_rpm 缺口）
- 🎤 L1 接線的紅利：每 task LLM call 從 ~7 降到 ~3

### Slide 31 — EVOLVE-BLOCK 的真相（破除迷思）
- 讀原始碼發現：`parse_evolve_blocks()` 在核心迴圈**從未被呼叫**
- 標記只是「給 LLM 看的提示」，「恰好一個」是建議非硬限制
- 🎤 教學點：不要盡信文件，讀原始碼驗證

---

# Part 5 — 工程實務與真實教訓（4 張）

### Slide 32 — 真 bug #1：受限沙箱的 `__import__`
- 移除 `__import__` 後，連白名單的 `import statistics` 都失效
- 🎤 安全與功能的拉扯：縱深防禦要留「安全的門」

### Slide 33 — 真 bug #2 + 金句：「分數健康 ≠ 功能正確」
- 接線後 `combined_score=0.8452` 看似完美，但 `agent.tools == []`
- graceful fallback 把「沒裝上工具」偽裝成「分數正常」
- 🎤 **驗證要查功能本身，不能只看分數**——全場第二金句

### Slide 34 — 測試覆蓋的盲區
- 原測試全 `wrap=False`，所以漏掉 `wrap=True` 路徑的 docstring bug
- 補回歸測試
- 🎤 「測試通過」不等於「測對了東西」

### Slide 35 — 工作方法：小步快跑 + PR 節奏
- 每層都「先地基（可單元測試）再接線」
- 15 個 merged PR，每個獨立可驗證、可回溯
- 📊 PR 對照表縮圖

---

# Part 6 — 結果與展望（4 張）

### Slide 36 — 驗證數據總覽
- 📊 進化跑歷史對照表（v1 0.79 / v3 0.64 / L1 驗證 0.78）
- L1 接線前後：tool 崩潰 多次→0、coverage 不穩→1.0、429 大幅減少
- 44→46 單元測試全綠

### Slide 37 — 完成全景
- 📊 Taxonomy 進度圖：L0 ✅ / L1 ✅ / #7 ✅ / #6 ✅ / L2 ✅ / Tier C ⬜
- 🎤 從「會崩潰」到「L0/L1/L2 三層防護完整」

### Slide 38 — 未來工作
- 啟動真正的工具進化 run（A' + n_tools 維度 + holdout 驗證）
- Tier C：現成生態工具（RagTool）的能力註冊表
- Crew 拓撲進化（方向 #4，新穎性最高）

### Slide 39 — Key Takeaways（回收學習目標）
1. 進化式優化能設計 agent，但要防它「把自己改壞」
2. 協議/策略分離 + 優雅退化 = 可安全進化的地形
3. 自動優化要配可信機制（holdout、MAP-Elites）才不自欺
4. 工程金句：分數健康 ≠ 功能正確；不盡信文件，讀原始碼
- 💬 互動點：問「你會把哪條原則用到自己的專案？」

### Slide 40 — Q&A / 資源
- repo 連結、`docs/evolution_design_notes.md`、OpenEvolve 官方
- 學生整合指南（`docs/student_integration_guide.md`）

---

## 附：建議的 Demo 橋段（可穿插）

| 時機 | Demo | 目的 |
|------|------|------|
| Slide 15 後 | 跑 1-task evaluate，看 artifacts 的 tool_use | 讓「可觀測性」具體 |
| Slide 22 後 | 餵一個 `import os` 的工具，看 AST 擋下 | 讓「沙箱」可信 |
| Slide 28 後 | 開 visualizer 看 MAP-Elites 網格 | 讓「trade-off 前沿」可見 |

## 附：時間分配建議（75 分鐘）

| Part | 分鐘 |
|------|------|
| 0 開場 | 3 |
| 1 背景 | 10 |
| 2 事故與分類 | 12 |
| 3 L0/L1/L2 | 25 |
| 4 可信機制 | 12 |
| 5 工程教訓 | 6 |
| 6 結果展望 | 4 |
| Q&A | 3 |
