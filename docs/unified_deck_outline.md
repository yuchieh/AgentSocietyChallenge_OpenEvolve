# 整合投影片大綱 — 一份講完「人 × AI × 進化」如何協作打造可進化 Agent 系統

> **整合策略**：協作故事當**骨架（外層）**，Tool Calling 失敗分類學當**嵌入的實戰案例（內層）**。
> 兩份原稿重複處（iter22、失敗分類學、36%→0、量化公式）各只講一次。
> **總張數**：27 張（vs 直接串接的 49 張）
> **建議時長**：90–100 分鐘（含 demo / Q&A）
> **來源標記**：每張標 `[協作]`=來自協作 deck、`[技術]`=來自技術 deck、`[新/融]`=新做或融合
> **慣例延續**：每張保留 `‹code›` 程式對照頁尾；角色固定配色（我=綠 / Claude=藍 / OpenEvolve=琥珀）

---

## 一句話定位
這份 deck 回答兩個交織的問題：**(1) 我們怎麼打造一個能安全進化的 agent 系統？（技術）** 與 **(2) 人 + AI + 進化是怎麼協作把它做出來的？（過程）**——後者是前者的「making of」。

## 學習目標（開場揭示、結尾回收）
1. 認識**三層嵌套的 AI 協作架構**，與每層「自主 vs 護欄」的配置
2. 看懂 **Tool Calling 失敗分類學（5 層）** 與 L0/L1/L2 分層解法
3. 帶走 **5 個可遷移的人機協作模式**
4. 一條判準：**什麼我做、什麼交給 AI、什麼交給進化**

---

# Part 0 — 開場（3 張）

### S1 — 標題頁　`[新/融]`
- 主標：人 × AI × 進化 — 協作打造一個會安全進化的 Agent 系統
- 副標：當我、Claude、OpenEvolve 三個智能體一起工作
- 📊 三色鏈 teaser（我 / Claude / OpenEvolve）
- `‹code›` repo · 兩大進入點 openevolve_evaluator.py · config/openevolve_config.yaml

### S2 — 我們做出了什麼（teaser）　`[融]`
- 📊 三個數字：baseline 0.28 → **0.72**、best **0.842**、工具崩潰 **36% → 0**
- 一句：而且這不是一個人寫出來的——是三個智能體協作的成果
- 🎤 先給結果，再回頭講「怎麼協作做到的」
- `‹code›` docs/evolution_design_notes.md §12.7（完整架構數據）

### S3 — 議程 + 學習目標　`[新/融]`
- 7 個 Part 一頁覽 + 4 條學習目標
- 🎤 點出主線：協作故事是外層，技術分類學是嵌入案例

---

# Part 1 — 協作架構：三個智能體（4 張）

### S4 — 三個角色登場　`[協作]`（原協作 S4）
- 三欄卡：我（Human）/ Claude Code / OpenEvolve 的 LLM
- `‹code›` 我+Claude→config/*.yaml ｜ OpenEvolve→evolvable_tools.py:18-58 EVOLVE-BLOCK

### S5 — 三層嵌套：委派自主性的鏈　`[協作]`（原協作 S5）
- 我 ─指揮→ Claude ─駕馭→ OpenEvolve；越往內自主↑、護欄↑
- `‹code›` 我→config/*.yaml ｜ Claude→src/ ｜ OpenEvolve→agents_evolving.yaml EVOLVE-BLOCK

### S6 — Claude × OpenEvolve：架構師 vs 探勘者（關係圖）　`[協作]`（原協作 S5b）
- 關係圖 + 對照表 + 設計→探索→分析循環
- `‹code›` Claude 搭框架 tool_loader.py · OpenEvolve 在 evolvable_tools.py 探索

### S7 — 自主越高、護欄越強 ＋ 安全憲法　`[融]`（協作 S6 + 技術 S10 的憲法）
- 自主 vs 護欄表（三層）
- **安全憲法**：最壞 = 優雅退化，絕不是災難性崩潰（從技術 deck 提前到這裡當總綱）
- `‹code›` 護欄落地 retrieval_executor.py:53 clamp · tool_loader.py:77-177 sandbox

---

# Part 2 — 問題：進化會把自己改崩（3 張）

### S8 — 舞台：競賽任務 + CrewAI 三代理 + OpenEvolve　`[技術]`（技術 S3+S4+S5 濃縮成 1 頁）
- Track 1：預測 {stars, review}；fitness=overall_quality
- CrewAI 三代理流水線；OpenEvolve = 突變→評分→選擇
- `‹code›` evaluator.py:96 evaluate · simulation_crew.py:42-89 · openevolve_config.yaml:10-88

### S9 — 事故現場：v3 把自己改崩了　`[技術]`（技術 S7）
- 📊 分數時間軸反覆掉到 0.35 fallback；36% iteration 失敗
- 🎤 「進化讓系統變強，也可能讓它把自己改壞」
- `‹code›` evaluator.py:133-137 timeout fallback · :179-184 exception fallback

### S10 — 招牌協作模式 ①：我的好問題 → Claude 的失敗分類學　`[融·接縫]`（協作 S13 + 技術 S8）
- **我問**：「怎麼讓 agent 安全進化、用不同工具、甚至創造新工具，而不在 tool calling 上崩潰？」
- **Claude 答**：不直接 try/except，而是先做**失敗分類學**——5 層表（L1 協定 / L2 參數 / L3 策略 / L4 消化 / L5 合約）
- 🎤 這是全場接縫：協作模式①，同時是技術主體的入口
- 💬 金句：fitness 只告訴你「壞了」，不告訴你「哪裡壞了」
- `‹code›` design notes §3（5 層表）· src/tools/{wrapper,executor,loader}.py

---

# Part 3 — 技術主體：分層解法 L0 / L1 / L2（5 張，嵌入案例）

### S11 — 設計原則：協議 / 策略分離　`[技術]`（技術 S10）
- 協議層（凍結）vs 策略層（自由進化）
- `‹code›` 協議 retrieval_executor.py:28-30 ALLOWED_* ｜ 策略 agents_evolving.yaml:11-16 retrieval_policy

### S12 — 三層解法總覽 ＋ L0 可觀測性　`[技術]`（技術 S11+S12 合併）
- L0 看得見 / L1 安全地用 / L2 安全地造 一頁總覽
- L0：thread-safe 呼叫日誌 → artifacts（missing_essential 診斷）
- `‹code›` interaction_tool_wrapper.py:21 _record · :26 drain · evaluator.py:31 _summarize_tool_use

### S13 — L1：clamp executor ＋「白名單 ≠ 沒有進化空間」　`[技術]`（技術 S13+S14 合併）
- clamp, don't reject；字母表 vs 句子的類比
- `‹code›` retrieval_executor.py:44 _clamp_int · :53 normalize_policy · :29 ALLOWED_QUERIES

### S14 — L1 接線：data_retriever 從「呼叫者」轉「萃取者」　`[技術]`（技術 S15）
- Before/After；會崩的部分移出進化空間
- `‹code›` serving_flow.py:85-93 注入 · simulation_crew.py:42-50 無 tools

### S15 — L2：四道關卡沙箱 ＋ docstring 共同進化 ＋ 裝在決策點　`[技術]`（技術 S16+S17 合併）
- 四關卡（AST/簽名/沙箱/包裝）+ ReadOnlyKit；docstring 受進化壓力；工具裝給 analyst（決策點）
- `‹code›` tool_loader.py:77/:106/:120/:156 · :60 ReadOnlyKit · simulation_crew.py:53-62

---

# Part 4 — 讓「自動優化」變可信（2 張）

### S16 — #7 Train / Val 切分：過擬合照妖鏡　`[技術]`（技術 S18）
- disjoint holdout；train-holdout 差距 = 過擬合警報
- `‹code›` evaluator.py:83-84 OPENEVOLVE_TASK_DIR · scripts/validate_holdout.py · create_sampled_dataset.py:8

### S17 — #6 MAP-Elites 自訂維度　`[技術]`（技術 S19）
- combined_score=fitness；preference × review=diversity 座標
- `‹code›` openevolve_config.yaml:85-88 feature_dimensions · evaluator.py:47-59 _result

---

# Part 5 — 協作如何驅動這一切（回到 meta，4 張）

### S18 — 協作模式 ②：誠實回報，抓出「分數健康 ≠ 功能正確」　`[融]`（協作 S14 + 技術 S20）
- combined_score=0.8452 看似完美 → Claude 主動查 agent.tools 發現是 []
- 兩個真 bug（_import_ / @tool docstring）+ 金句
- `‹code›` tool_loader.py:139-146 _safe_import · :164 docstring · simulation_crew.py:21-30 graceful [] · tests/test_tool_loader.py:185-203

### S19 — 協作模式 ③④：我把關不可逆 ＋ 人機知識互補　`[協作]`（協作 S15+S16 壓成 1 頁雙欄）
- ③ merge/brew/建 repo「先問再做」｜④ 我的環境知識 × Claude 的工具細節（caffeinate）
- `‹code›` CLAUDE.md Git 工作流程 · design notes §12.7(b) nohup+caffeinate

### S20 — 協作模式 ⑤：分層委派自主（最核心）　`[協作]`（協作 S17）
- 先搭 L0/L1/L2 護欄，才敢放手；v3 36% → 完整架構 0 次工具崩潰
- 🎤 回扣 S7 的安全憲法
- `‹code›` 三層護欄 src/tools/ · 數據 design notes §12.7

### S21 — 五個協作模式 · 一頁回顧　`[協作]`（協作 S18）
- 提問深化 / 誠實抓 bug / 把關不可逆 / 知識互補 / 分層委派
- 💬 哪一個你明天就能用？
- `‹code›` docs/collaboration_workflow_outline.md（Part 3）

---

# Part 6 — 高潮：iter22 是三層協作的湧現產物（3 張）

### S22 — 三層協作跑出 iter22 ＋ 公式　`[融]`（協作 S19 + 技術 formula）
- 誰貢獻什麼（我設定 caffeinate 跑完 / Claude 搭框架啟動分析 / OpenEvolve 進化出公式）
- iter22 公式節錄（按 user_std 切 4 段，clamp[1,5] round 0.5）
- `‹code›` config/agents_evolving.yaml EVOLVE-BLOCK · design notes §12.7(b)

### S23 — iter22「之後」深挖：局部最優　`[協作]`（協作 S21）
- 之後沒有更好的後代：over-engineering / 分項此消彼長 / 三島趨同
- Claude 診斷局部最優——探勘者結構上做不到的理解
- `‹code›` openevolve_config.yaml:71-78 islands/migration · design notes §12.7(b)

### S24 — 連「失敗」也是協作洞察　`[協作]`（協作 S22）
- 8 次低分歸因：5 次 YAML 壞（full-rewrite 繞過 clamp）+ 3 次 429
- `‹code›` design notes §12.7(b) · openevolve_config.yaml:18 diff_based_evolution:false

---

# Part 7 — 反思與結尾（3 張）

### S25 — 什麼該誰做？　`[協作]`（協作 S23）
- 三欄判準：我（方向/不可逆/領域知識）/ Claude（實作/驗證/分析）/ 進化（框架內探索）
- 判準：可逆性 · 價值判斷 · 搜尋空間大小
- `‹code›` 我→config/*.yaml ｜ Claude→src/+tests/ ｜ 進化→EVOLVE-BLOCK

### S26 — Key Takeaways　`[融]`（技術 S22 + 協作 S24 金句合併）
1. 進化能設計 agent，但要防它把自己改壞 → 護欄越往內越強（最壞只是退化）
2. 協議/策略分離 + 優雅退化 = 可安全進化的地形
3. 誠實回報 + 人類把關不可逆 = 協作安全地基；分數健康 ≠ 功能正確
4. 好問題驅動好設計；連失敗都能共同理解；不盡信文件、讀原始碼
- 💬 你的 AI 是工具，還是夥伴？

### S27 — 結語 + 資源　`[融]`
- 一句：真正的產物不只是 0.842 的 agent，而是一套「人 + AI + 進化」安全協作工作流
- 三色鏈再現；資源：兩份原大綱 + evolution_design_notes.md
- `‹code›` docs/{collaboration_workflow_outline,teaching_slides_outline,evolution_design_notes}.md

---

## 對照：兩份原稿 → 整合後的去重

| 重複主題 | 原本出現處 | 整合後 |
|---|---|---|
| 失敗分類學 5 層 | 技術 S8 + 協作 S13 | **S10 一次**（當接縫）|
| iter22 + 量化公式 | 技術 formula 片段 + 協作 S19/S20 | **S22 一次**（高潮）|
| v3 36% → 0 | 技術 S7/S21 + 協作 S13/S17 | teaser S2 + payoff **S20** |
| 分數健康 ≠ 功能正確 | 技術 S20 + 協作 S14 | **S18 一次** |
| 安全憲法（優雅退化） | 技術 S10 | 提前到 **S7** 當總綱，S20 回扣 |

## 被精簡 / 捨去（避免超時）
- 技術 deck 的「10 個可優化方向」「事故拆解互動頁」「結果數據表」→ 併入或移到附錄
- 協作 deck 的「不尋常的協作」破冰頁、「為什麼值得學」divider → 併進 S2/S3

## 時間分配（~95 分鐘）
| Part | 分鐘 |
|------|------|
| 0 開場 | 5 |
| 1 協作架構 | 14 |
| 2 問題 + 接縫 | 14 |
| 3 技術主體 L0/L1/L2 | 22 |
| 4 可信機制 | 10 |
| 5 協作模式（meta） | 16 |
| 6 iter22 高潮 | 10 |
| 7 反思 + Q&A | 4 |
