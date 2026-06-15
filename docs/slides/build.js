const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";            // 13.33 x 7.5
p.author = "AgentSocietyChallenge_OpenEvolve";
p.title = "用 OpenEvolve 進化 LLM Agent Crew";

// ---- palette ----
const NAVY = "1E2761", BLUE = "3A5BA0", ICE = "CADCFC";
const AMBER = "E8A33D", GREEN = "2E9E6B", RED = "C0453B";
const INK = "23272E", MUTE = "6B7280", LIGHT = "F4F7FB", WHITE = "FFFFFF";
const HF = "Georgia", BF = "Calibri", CF = "Consolas";
const W = 13.33, H = 7.5;

const sh = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 135, opacity: 0.12 });

// header for light content slides
function header(s, kicker, title) {
  s.background = { color: LIGHT };
  s.addShape(p.shapes.OVAL, { x: 0.55, y: 0.5, w: 0.16, h: 0.16, fill: { color: AMBER } });
  s.addText(kicker.toUpperCase(), { x: 0.8, y: 0.46, w: 11, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: BLUE, charSpacing: 2, margin: 0 });
  s.addText(title, { x: 0.55, y: 0.78, w: 12.2, h: 0.85, fontFace: HF, fontSize: 30, bold: true, color: NAVY, margin: 0 });
}

function card(s, x, y, w, h, fill) {
  s.addShape(p.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill || WHITE }, line: { color: "E2E8F0", width: 1 }, shadow: sh() });
}

function chip(s, x, y, txt, fill, tcolor) {
  s.addShape(p.shapes.OVAL, { x, y, w: 0.5, h: 0.5, fill: { color: fill } });
  s.addText(txt, { x, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: HF, fontSize: 18, bold: true, color: tcolor || WHITE, margin: 0 });
}

// 程式對照頁尾：把每一頁連到真實實作（節錄或 檔名:行號）
function codeRef(s, txt, dark) {
  s.addText([
    { text: "‹code›  ", options: { fontFace: CF, color: AMBER, bold: true } },
    { text: txt, options: { fontFace: CF, color: dark ? "8FA3C8" : MUTE } },
  ], { x: 0.55, y: 7.2, w: 12.4, h: 0.22, fontSize: 9, valign: "middle", margin: 0 });
}

// ============================================================ 1 TITLE
let s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("OPENEVOLVE × CREWAI", { x: 1, y: 1.9, w: 11, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 3, margin: 0 });
s.addText("用 OpenEvolve 進化\nLLM Agent Crew", { x: 0.95, y: 2.3, w: 11.5, h: 2, fontFace: HF, fontSize: 46, bold: true, color: WHITE, lineSpacing: 50, margin: 0 });
s.addText("從「會崩潰的 Tool Calling」到「安全可進化的多代理系統」", { x: 1, y: 4.5, w: 11, h: 0.5, fontFace: BF, fontSize: 19, color: ICE, margin: 0 });
s.addText("AgentSociety Challenge · Tool Calling Failure Taxonomy", { x: 1, y: 6.4, w: 11, h: 0.4, fontFace: BF, fontSize: 13, color: "8FA3C8", margin: 0 });
codeRef(s, "進入點：config/openevolve_config.yaml · openevolve_evaluator.py · config/agents_evolving.yaml", true);

// ============================================================ 2 AGENDA + OBJECTIVES
s = p.addSlide();
header(s, "Agenda", "議程與學習目標");
const parts = [
  ["1", "背景與問題", "競賽任務、CrewAI、OpenEvolve"],
  ["2", "事故與分類", "Tool Calling 5 層失效"],
  ["3", "分層解法", "L0 / L1 / L2"],
  ["4", "可信機制", "過擬合、MAP-Elites、Rate Limit"],
  ["5", "工程教訓", "兩個真 bug、金句"],
  ["6", "結果與展望", "數據、全景、未來"],
];
parts.forEach((it, i) => {
  const x = 0.55 + (i % 3) * 4.15, y = 1.9 + Math.floor(i / 3) * 1.55;
  card(s, x, y, 3.9, 1.35);
  chip(s, x + 0.25, y + 0.25, it[0], NAVY);
  s.addText(it[1], { x: x + 0.9, y: y + 0.2, w: 2.85, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText(it[2], { x: x + 0.9, y: y + 0.62, w: 2.85, h: 0.6, fontFace: BF, fontSize: 12, color: MUTE, margin: 0 });
});
s.addText([
  { text: "學習目標   ", options: { bold: true, color: AMBER } },
  { text: "進化式優化如何套用在 agent 設計 · 5 層失效與防護 · 協議/策略分離 + 優雅退化 · 讓自動優化變可信", options: { color: INK } },
], { x: 0.55, y: 5.25, w: 12.2, h: 0.8, fontFace: BF, fontSize: 13.5, valign: "middle", margin: 0 });
codeRef(s, "全程對照：docs/evolution_design_notes.md（設計與驗證數據的完整記錄）");

// ============================================================ 3 TASK
s = p.addSlide();
header(s, "Part 1 · 背景", "競賽任務：模擬用戶行為");
s.addText([
  { text: "Track 1：", options: { bold: true, color: NAVY } },
  { text: "預測某用戶會對某商家給出的 ", options: { color: INK } },
  { text: "{stars, review}", options: { fontFace: CF, color: BLUE, bold: true } },
], { x: 0.6, y: 2.0, w: 12, h: 0.5, fontFace: BF, fontSize: 17, margin: 0 });
card(s, 0.6, 2.8, 5.9, 3.4);
s.addText("fitness 怎麼算", { x: 0.9, y: 3.05, w: 5, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "overall_quality", options: { fontFace: CF, bold: true, color: BLUE, breakLine: true } },
  { text: "  = (preference_estimation", options: { fontFace: CF, color: INK, breakLine: true } },
  { text: "     + review_generation) / 2", options: { fontFace: CF, color: INK, breakLine: true } },
], { x: 0.9, y: 3.55, w: 5.3, h: 1.2, fontSize: 13, margin: 0 });
s.addText([
  { text: "preference_estimation", options: { fontFace: CF, bold: true, color: GREEN } },
  { text: " — 評分準度（1 − 正規化星等 MAE）", options: { color: INK, breakLine: true } },
  { text: "review_generation", options: { fontFace: CF, bold: true, color: AMBER } },
  { text: " — 文字相似度（情感+情緒+主題）", options: { color: INK } },
], { x: 0.9, y: 4.75, w: 5.4, h: 1.2, fontSize: 12.5, lineSpacing: 18, margin: 0 });
card(s, 6.8, 2.8, 5.95, 3.4, NAVY);
s.addText("這兩個分項常此消彼長", { x: 7.1, y: 3.1, w: 5.4, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: WHITE, margin: 0 });
s.addText("「評分超準但文字平庸」 vs 「文字生動但評分偏掉」——後面 #6 會用這個張力做文章。", { x: 7.1, y: 3.65, w: 5.4, h: 1, fontFace: BF, fontSize: 14, color: ICE, margin: 0 });
s.addText("“ 預測的不是真相，是「這個用戶會怎麼反應」 ”", { x: 7.1, y: 4.9, w: 5.4, h: 1, fontFace: HF, fontSize: 16, italic: true, color: AMBER, margin: 0 });
codeRef(s, "openevolve_evaluator.py:96 evaluate() · :106-108 combined_score = overall_quality · :149-151 取分項");

// ============================================================ 4 CREWAI PIPELINE
s = p.addSlide();
header(s, "Part 1 · 背景", "基礎架構：CrewAI 三代理流水線");
const ag = [
  ["data_retriever", "查 4 種資料", BLUE],
  ["psychological_analyst", "分析偏好 / 評分習慣", BLUE],
  ["behavior_simulator", "產出 {stars, review}", BLUE],
];
ag.forEach((a, i) => {
  const x = 0.7 + i * 4.25;
  card(s, x, 2.6, 3.6, 2.1);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.6, w: 3.6, h: 0.12, fill: { color: a[2] } });
  s.addText(a[0], { x: x + 0.25, y: 3.0, w: 3.1, h: 0.7, fontFace: CF, fontSize: 15, bold: true, color: NAVY, margin: 0 });
  s.addText(a[1], { x: x + 0.25, y: 3.75, w: 3.1, h: 0.7, fontFace: BF, fontSize: 13.5, color: MUTE, margin: 0 });
  if (i < 2) s.addText("→", { x: x + 3.65, y: 3.1, w: 0.55, h: 1, fontFace: HF, fontSize: 30, bold: true, color: AMBER, align: "center", margin: 0 });
});
s.addText("Process.sequential — 前一棒的輸出，是後一棒的 context", { x: 0.7, y: 5.1, w: 12, h: 0.4, fontFace: BF, fontSize: 14, italic: true, color: BLUE, margin: 0 });
s.addText("OpenEvolve 的任務：不只進化 prompt 文字，而是優化這條流水線的「各個面向」——工具使用、任務設計、甚至拓撲。", { x: 0.7, y: 5.7, w: 12, h: 0.6, fontFace: BF, fontSize: 14, color: INK, margin: 0 });
codeRef(s, "src/crews/simulation_crew.py:42 data_retriever · :53 analyst · :65 behavior_simulator · :89 crew(Process.sequential)");

// ============================================================ 5 OPENEVOLVE
s = p.addSlide();
header(s, "Part 1 · 背景", "OpenEvolve：用 LLM 進化程式");
s.addText("Google AlphaEvolve 的開源實作 — 反覆「突變 → 評分 → 選擇」", { x: 0.6, y: 1.95, w: 12, h: 0.4, fontFace: BF, fontSize: 16, color: INK, margin: 0 });
const loop = [["sample", "從族群採樣 parent"], ["mutate", "LLM 突變程式"], ["evaluate", "evaluator 評分"], ["select", "MAP-Elites 保留精英"]];
loop.forEach((l, i) => {
  const x = 0.7 + i * 3.15;
  card(s, x, 2.7, 2.75, 1.7);
  chip(s, x + 0.25, y_(2.95), `${i + 1}`, AMBER, NAVY);
  s.addText(l[0], { x: x + 0.9, y: 2.95, w: 1.7, h: 0.4, fontFace: CF, fontSize: 15, bold: true, color: NAVY, margin: 0 });
  s.addText(l[1], { x: x + 0.25, y: 3.55, w: 2.3, h: 0.7, fontFace: BF, fontSize: 12.5, color: MUTE, margin: 0 });
  if (i < 3) s.addText("→", { x: x + 2.78, y: 3.1, w: 0.4, h: 0.8, fontFace: HF, fontSize: 24, bold: true, color: AMBER, align: "center", margin: 0 });
});
function y_(v){return v;}
s.addText([
  { text: "關鍵元件   ", options: { bold: true, color: AMBER } },
  { text: "MAP-Elites 資料庫 · Island 多島模型 · EVOLVE-BLOCK 標記 · combined_score 當 fitness", options: { color: INK } },
], { x: 0.7, y: 4.9, w: 12, h: 0.5, fontFace: BF, fontSize: 14, margin: 0 });
s.addText("核心問題：如何讓系統「自己設計自己」——又不讓它把自己改壞？", { x: 0.7, y: 5.6, w: 12, h: 0.5, fontFace: HF, fontSize: 17, bold: true, italic: true, color: NAVY, margin: 0 });
codeRef(s, "config/openevolve_config.yaml:10 max_iterations · :18 diff_based_evolution:false · :71-88 database(islands/MAP-Elites)");

// ============================================================ 6 TEN DIRECTIONS
s = p.addSlide();
header(s, "Part 1 · 背景", "10 個可優化方向（新穎性 × 可行性）");
s.addChart(p.charts.SCATTER, [
  { name: "X", values: [4.5, 4.5, 3.5, 5, 3, 3, 3, 4.5, 2.5, 5] },
  { name: "方向", values: [4.5, 4, 4.5, 3, 5, 5, 5, 3, 5, 2] },
], {
  x: 0.6, y: 1.9, w: 7.2, h: 5.0,
  chartColors: [BLUE], lineSize: 0, lineDataSymbol: "circle", lineDataSymbolSize: 14,
  catAxisTitle: "新穎性 →", showCatAxisTitle: true, valAxisTitle: "可行性 →", showValAxisTitle: true,
  catAxisMinVal: 2, catAxisMaxVal: 5.5, valAxisMinVal: 1.5, valAxisMaxVal: 5.5,
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { color: "E2E8F0", size: 0.5 },
  catAxisLabelColor: MUTE, valAxisLabelColor: MUTE, showLegend: false,
});
card(s, 8.1, 1.95, 4.65, 4.95, WHITE);
s.addText("今天的主線", { x: 8.35, y: 2.2, w: 4.2, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "#2 確定性檢索  ", options: { fontFace: CF, bold: true, color: BLUE } },
  { text: "→ 透過 L1 落地", options: { color: INK, breakLine: true } },
  { text: "#7 Train/Val 切分  ", options: { fontFace: CF, bold: true, color: GREEN, breakLine: true } },
  { text: "#6 MAP-Elites 維度  ", options: { fontFace: CF, bold: true, color: AMBER, breakLine: true } },
], { x: 8.35, y: 2.75, w: 4.2, h: 1.6, fontSize: 13, lineSpacing: 22, margin: 0 });
s.addShape(p.shapes.RECTANGLE, { x: 8.35, y: 4.5, w: 4.15, h: 0.02, fill: { color: "E2E8F0" } });
s.addText([
  { text: "共同約束　", options: { bold: true, color: RED } },
  { text: "NVIDIA NIM rate limit — v3 進化 ", options: { color: INK } },
  { text: "36% iteration 失敗", options: { bold: true, color: RED } },
  { text: "。凡能減少 LLM call 的方向都有雙重價值。", options: { color: INK } },
], { x: 8.35, y: 4.7, w: 4.2, h: 2, fontFace: BF, fontSize: 13, valign: "top", margin: 0 });
codeRef(s, "docs/evolution_design_notes.md §2（10 方向總表）· §10 Rate Limit 五層防護 · openevolve_config.yaml:32 retries");

// ============================================================ 7 INCIDENT
s = p.addSlide();
header(s, "Part 2 · 事故", "事故現場：進化把系統改崩了");
s.addText("v3 進化中，agent prompt 的突變導致 tool 呼叫失效 → 整條 pipeline 崩潰", { x: 0.6, y: 1.95, w: 12, h: 0.4, fontFace: BF, fontSize: 16, color: INK, margin: 0 });
s.addChart(p.charts.LINE, [
  { name: "combined_score", labels: ["it0", "it1", "it2", "it3", "it4", "it5", "it6", "it7", "it8", "it9", "it10"],
    values: [0.28, 0.28, 0.65, 0.55, 0.60, 0.35, 0.71, 0.35, 0.35, 0.79, 0.35] },
], {
  x: 0.6, y: 2.6, w: 8.0, h: 4.2, chartColors: [BLUE], lineSize: 3, lineSmooth: false,
  lineDataSymbol: "circle", lineDataSymbolSize: 7,
  valAxisMinVal: 0, valAxisMaxVal: 1, valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  catAxisLabelColor: MUTE, valAxisLabelColor: MUTE, showLegend: false,
});
card(s, 8.9, 2.7, 3.85, 4.0, NAVY);
s.addText("0.35", { x: 9.1, y: 3.0, w: 3.4, h: 0.9, fontFace: HF, fontSize: 54, bold: true, color: AMBER, margin: 0 });
s.addText("fallback 分數", { x: 9.15, y: 3.95, w: 3.4, h: 0.4, fontFace: BF, fontSize: 13, color: ICE, margin: 0 });
s.addText("多個 iteration 反覆掉到這個地板——工具呼叫一壞，預測流程整個垮掉。", { x: 9.15, y: 4.5, w: 3.45, h: 1.8, fontFace: BF, fontSize: 14, color: WHITE, valign: "top", margin: 0 });
codeRef(s, "openevolve_evaluator.py:133-137 timeout fallback · :179-184 exception fallback（都回 _result(0.0)）");

// ============================================================ 8 TAXONOMY (core)
s = p.addSlide();
header(s, "Part 2 · 事故", "Tool Calling Failure Taxonomy");
const tax = [
  ["L1", "呼叫協議", "ReAct 格式被改壞 → parser 抓不到", RED],
  ["L2", "參數正確性", "query_type 亂掰", AMBER],
  ["L3", "呼叫策略", "「不查了，直接猜」", AMBER],
  ["L4", "結果消化", "上千筆 review 怎麼取樣", BLUE],
  ["L5", "下游契約", "summary 結構爛掉", BLUE],
];
tax.forEach((t, i) => {
  const y = 1.85 + i * 1.0;
  card(s, 0.6, y, 12.15, 0.86);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 0.86, fill: { color: t[3] } });
  s.addText(t[0], { x: 0.9, y, w: 1.0, h: 0.86, fontFace: CF, fontSize: 22, bold: true, color: t[3], valign: "middle", margin: 0 });
  s.addText(t[1], { x: 2.0, y, w: 2.6, h: 0.86, fontFace: HF, fontSize: 16, bold: true, color: NAVY, valign: "middle", margin: 0 });
  s.addText(t[2], { x: 4.7, y, w: 8.0, h: 0.86, fontFace: BF, fontSize: 14, color: INK, valign: "middle", margin: 0 });
});
s.addText("原本只有 L1 有防護（tasks.yaml 凍結），L2–L5 全裸露 — 這張是全場骨架", { x: 0.6, y: 6.8, w: 12, h: 0.3, fontFace: BF, fontSize: 12.5, italic: true, color: MUTE, margin: 0 });
codeRef(s, "docs/evolution_design_notes.md §3（5 層分類表）· 防護落地：interaction_tool_wrapper.py · retrieval_executor.py · tool_loader.py");

// ============================================================ 9 INSIGHT (quote)
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("關鍵洞察", { x: 1, y: 1.7, w: 11, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 3, margin: 0 });
s.addText("fitness 只告訴你\n「壞了」，不告訴你\n「哪裡壞了」", { x: 0.95, y: 2.4, w: 11.5, h: 2.6, fontFace: HF, fontSize: 42, bold: true, color: WHITE, lineSpacing: 48, margin: 0 });
s.addText("這就是為什麼有些突變看似無害，卻造成崩潰——單一純量分數無法做 credit assignment。", { x: 1, y: 5.5, w: 11, h: 0.8, fontFace: BF, fontSize: 17, color: ICE, margin: 0 });
codeRef(s, "docs/evolution_design_notes.md §3（關鍵洞察）— 解法是 L0 把盲區變訊號", true);

// ============================================================ 10 PROTOCOL/POLICY
s = p.addSlide();
header(s, "Part 2 · 原則", "設計原則：協議 / 策略分離");
card(s, 0.6, 2.0, 12.15, 1.9, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 2.0, w: 0.12, h: 1.9, fill: { color: NAVY } });
s.addText("協議層（Protocol）— 凍結、機器驗證、程式碼強制", { x: 0.95, y: 2.2, w: 11.6, h: 0.5, fontFace: HF, fontSize: 18, bold: true, color: NAVY, margin: 0 });
s.addText("「工具怎麼被呼叫」：函式簽名、參數 schema、ReAct 格式、回傳格式、註冊機制", { x: 0.95, y: 2.85, w: 11.6, h: 0.9, fontFace: BF, fontSize: 14.5, color: INK, margin: 0 });
card(s, 0.6, 4.1, 12.15, 1.9, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 4.1, w: 0.12, h: 1.9, fill: { color: AMBER } });
s.addText("策略層（Policy）— 自由進化", { x: 0.95, y: 4.3, w: 11.6, h: 0.5, fontFace: HF, fontSize: 18, bold: true, color: AMBER, margin: 0 });
s.addText("「工具被怎麼使用」：查什麼、查多少、何時查、怎麼消化結果、甚至「需要什麼新工具」", { x: 0.95, y: 4.95, w: 11.6, h: 0.9, fontFace: BF, fontSize: 14.5, color: INK, margin: 0 });
s.addText([{ text: "安全憲法　", options: { bold: true, color: RED } }, { text: "最壞 = 優雅退化（graceful degradation），絕不是災難性崩潰。", options: { color: INK } }], { x: 0.6, y: 6.3, w: 12, h: 0.5, fontFace: BF, fontSize: 15, margin: 0 });
codeRef(s, "協議：retrieval_executor.py:28-30 ALLOWED_QUERIES/STRATEGIES（凍結）｜策略：config/agents_evolving.yaml:11-16 retrieval_policy（進化）");

// ============================================================ 11 SOLUTION OVERVIEW
s = p.addSlide();
header(s, "Part 3 · 解法", "分層解法：L0 → L1 → L2");
const lay = [
  ["L0", "看得見", "工具呼叫可觀測性 — 把盲區變訊號", GREEN],
  ["L1", "安全地用", "把工具呼叫從 LLM 拿走 → 確定性 executor", BLUE],
  ["L2", "安全地造", "讓進化發明新工具 — 四道關卡沙箱", NAVY],
];
lay.forEach((l, i) => {
  const y = 1.95 + i * 1.55;
  card(s, 0.6, y, 12.15, 1.35);
  chip(s, 0.95, y + 0.42, l[0][1], l[3]);
  s.addText(l[0], { x: 1.6, y: y + 0.2, w: 2, h: 0.5, fontFace: HF, fontSize: 22, bold: true, color: l[3], margin: 0 });
  s.addText(l[1], { x: 1.6, y: y + 0.72, w: 2.2, h: 0.4, fontFace: BF, fontSize: 13, color: MUTE, margin: 0 });
  s.addText(l[2], { x: 4.0, y, w: 8.6, h: 1.35, fontFace: BF, fontSize: 16, color: INK, valign: "middle", margin: 0 });
});
s.addText("每一層都遵守同一條安全憲法：最壞只是低分，不是崩潰。", { x: 0.6, y: 6.68, w: 12, h: 0.3, fontFace: BF, fontSize: 13, italic: true, color: MUTE, margin: 0 });
codeRef(s, "L0 interaction_tool_wrapper.py · L1 retrieval_executor.py · L2 tool_loader.py（皆在 src/tools/）");

// ============================================================ 12 L0
s = p.addSlide();
header(s, "Part 3 · L0", "L0：工具呼叫可觀測性");
card(s, 0.6, 2.0, 6.0, 4.6);
s.addText("做了什麼", { x: 0.9, y: 2.25, w: 5, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "thread-safe 呼叫日誌", options: { bold: true, color: NAVY, breakLine: true } },
  { text: "每條路徑記錄 (query_type, ok)", options: { color: INK, breakLine: true } },
  { text: "evaluator 整理成 artifacts", options: { bold: true, color: NAVY, breakLine: true } },
  { text: "total_calls / coverage / missing_essential …", options: { fontFace: CF, fontSize: 11.5, color: MUTE } },
], { x: 0.9, y: 2.75, w: 5.4, h: 2, fontSize: 14, lineSpacing: 22, margin: 0 });
s.addText("下一輪突變的 prompt 看得到「missing_essential: [user]」這種診斷", { x: 0.9, y: 5.2, w: 5.4, h: 1, fontFace: BF, fontSize: 13.5, italic: true, color: BLUE, margin: 0 });
card(s, 6.9, 2.0, 5.85, 4.6, NAVY);
s.addText("為什麼是地基", { x: 7.2, y: 2.25, w: 5, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: AMBER, margin: 0 });
s.addText("沒有 L0，L1 的 clamp、L2 的 quarantine 效果全都「看不見」——只能瞎子摸象。", { x: 7.2, y: 2.8, w: 5.3, h: 1.2, fontFace: BF, fontSize: 15, color: WHITE, margin: 0 });
s.addText([{ text: "設計重點　", options: { bold: true, color: ICE } }, { text: "純觀測增量 / env var opt-in — 預設行為逐位元不變。", options: { color: WHITE } }], { x: 7.2, y: 4.5, w: 5.3, h: 1.5, fontFace: BF, fontSize: 14, valign: "top", margin: 0 });
codeRef(s, "interaction_tool_wrapper.py:17 _TOOL_CALL_LOG · :21 _record · :26 drain_tool_log ｜ openevolve_evaluator.py:31 _summarize_tool_use");

// ============================================================ 13 L1 executor
s = p.addSlide();
header(s, "Part 3 · L1", "L1：把工具呼叫從 LLM 手上拿走");
s.addText([
  { text: "進化端宣告 ", options: { color: INK } },
  { text: "retrieval_policy", options: { fontFace: CF, bold: true, color: BLUE } },
  { text: "（查什麼、取樣、截斷）；凍結端 executor 直譯。", options: { color: INK } },
], { x: 0.6, y: 1.95, w: 12, h: 0.4, fontFace: BF, fontSize: 16, margin: 0 });
card(s, 0.6, 2.6, 6.0, 4.1, "11183B");
s.addText([
  { text: "retrieval_policy:", options: { color: ICE, breakLine: true } },
  { text: "  queries: [user, item,", options: { color: WHITE, breakLine: true } },
  { text: "            review_by_user]", options: { color: WHITE, breakLine: true } },
  { text: "  review_sampling:", options: { color: WHITE, breakLine: true } },
  { text: "    strategy: recent", options: { color: WHITE, breakLine: true } },
  { text: "    k: 15", options: { color: WHITE, breakLine: true } },
  { text: "  max_chars_per_result: 6000", options: { color: WHITE } },
], { x: 0.9, y: 2.95, w: 5.5, h: 3.4, fontFace: CF, fontSize: 14, lineSpacing: 26, margin: 0 });
card(s, 6.9, 2.6, 5.85, 4.1);
s.addText("clamp, don't reject", { x: 7.2, y: 2.85, w: 5.3, h: 0.4, fontFace: HF, fontSize: 18, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "非法值投影回合法空間，", options: { color: INK } },
  { text: "永不 raise", options: { bold: true, color: GREEN } },
  { text: "。", options: { color: INK, breakLine: true } },
  { text: "k=999999 → 50 · 亂掰 query → 過濾 · 整個爛掉 → 退預設", options: { fontFace: CF, fontSize: 11.5, color: MUTE } },
], { x: 7.2, y: 3.4, w: 5.3, h: 1.4, fontSize: 14.5, lineSpacing: 20, margin: 0 });
s.addText("最壞 = 退化成 baseline 檢索，pipeline 永不崩。", { x: 7.2, y: 5.2, w: 5.3, h: 1, fontFace: BF, fontSize: 14, italic: true, color: BLUE, margin: 0 });
codeRef(s, "src/tools/retrieval_executor.py:44 _clamp_int · :53 normalize_policy（clamp）· :103 _sample_reviews · :140 execute_policy");

// ============================================================ 14 whitelist != no space
s = p.addSlide();
header(s, "Part 3 · L1", "最大誤解：白名單 ≠ 沒有進化空間");
card(s, 0.6, 2.1, 12.15, 1.5, NAVY);
s.addText([
  { text: "ALLOWED_QUERIES", options: { fontFace: CF, bold: true, color: ICE } },
  { text: " = 字母表（what is permitted）　凍結", options: { color: WHITE, breakLine: true } },
  { text: "retrieval_policy", options: { fontFace: CF, bold: true, color: AMBER } },
  { text: " = 用字母拼出的句子（what is chosen）　進化", options: { color: WHITE } },
], { x: 0.95, y: 2.4, w: 11.5, h: 1, fontSize: 16, lineSpacing: 26, valign: "middle", margin: 0 });
s.addText("26 個字母固定，但能寫出無限多句子。同一個白名單下，不同 policy（查哪些子集、什麼順序、取樣策略、k、截斷）餵給下游的 context 天差地別。", { x: 0.6, y: 3.9, w: 12.15, h: 1.0, fontFace: BF, fontSize: 16, color: INK, margin: 0 });
s.addText([
  { text: "真正的天花板是資料集", options: { bold: true, color: RED } },
  { text: "（只有 user / item / review 三張表），不是白名單——後者只是忠實反映底層資料邊界。", options: { color: INK } },
], { x: 0.6, y: 5.1, w: 12.15, h: 1.2, fontFace: BF, fontSize: 16, margin: 0 });
codeRef(s, "src/tools/retrieval_executor.py:29 ALLOWED_QUERIES（字母表）· :33-37 DEFAULT_POLICY · :53 normalize_policy（拼句子）");

// ============================================================ 15 L1 wiring before/after
s = p.addSlide();
header(s, "Part 3 · L1", "接線：data_retriever 從「呼叫者」轉「萃取者」");
card(s, 0.6, 2.2, 5.95, 3.9);
s.addText("接線前", { x: 0.9, y: 2.5, w: 5, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "data_retriever [有 tool]", options: { fontFace: CF, bold: true, color: NAVY, breakLine: true } },
  { text: "  ↓ LLM ReAct 呼叫 wrapper ×4", options: { color: INK, breakLine: true } },
  { text: "  ↓ 整理成 summary", options: { color: INK } },
], { x: 0.9, y: 3.15, w: 5.4, h: 1.7, fontSize: 14, lineSpacing: 30, margin: 0 });
s.addText("使用者是 LLM — 會崩潰的那種。", { x: 0.9, y: 5.35, w: 5.4, h: 0.6, fontFace: BF, fontSize: 14, italic: true, color: RED, margin: 0 });
card(s, 6.8, 2.2, 5.95, 3.9, NAVY);
s.addText("接線後", { x: 7.1, y: 2.5, w: 5, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "executor 確定性檢索（crew 前）", options: { color: ICE, breakLine: true } },
  { text: "  ↓ retrieved_context 注入", options: { color: WHITE, breakLine: true } },
  { text: "data_retriever [無 tool]", options: { fontFace: CF, bold: true, color: AMBER, breakLine: true } },
  { text: "  ↓ 只萃取 {retrieved_context}", options: { color: WHITE } },
], { x: 7.1, y: 3.15, w: 5.4, h: 1.9, fontSize: 14, lineSpacing: 30, margin: 0 });
s.addText("純文字任務 — 不會在工具呼叫上崩潰。", { x: 7.1, y: 5.35, w: 5.4, h: 0.6, fontFace: BF, fontSize: 14, italic: true, color: ICE, margin: 0 });
codeRef(s, "src/flows/serving_flow.py:85-93 execute_policy → retrieved_context 注入 ｜ simulation_crew.py:42-50 data_retriever 無 tools");

// ============================================================ 16 L2 four gates
s = p.addSlide();
header(s, "Part 3 · L2", "L2：讓進化發明工具 — 四道關卡沙箱");
s.addText("資料固定（三張表）→「新工具」= 有界特徵工程，不是無界程式生成", { x: 0.6, y: 1.95, w: 12, h: 0.4, fontFace: BF, fontSize: 15, italic: true, color: BLUE, margin: 0 });
const gates = [
  ["1", "AST 安全掃描", "擋 import / open / exec / dunder 逃逸"],
  ["2", "簽名約定", "只認 tool_* + (kit, user_id, item_id)"],
  ["3", "沙箱試跑", "5s timeout，壞工具靜默丟棄"],
  ["4", "包裝註冊", "docstring → agent 看到的工具說明"],
];
gates.forEach((g, i) => {
  const x = 0.6 + (i % 2) * 6.15, y = 2.6 + Math.floor(i / 2) * 1.75;
  card(s, x, y, 5.9, 1.5);
  chip(s, x + 0.28, y + 0.5, g[0], NAVY);
  s.addText(g[1], { x: x + 0.95, y: y + 0.22, w: 4.7, h: 0.5, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText(g[2], { x: x + 0.95, y: y + 0.72, w: 4.7, h: 0.6, fontFace: BF, fontSize: 13, color: MUTE, margin: 0 });
});
s.addText([{ text: "ReadOnlyKit　", options: { bold: true, color: AMBER } }, { text: "只暴露 get_user / get_item / get_reviews — 萬流歸宗到唯讀資料，碰不到檔案系統 / 網路 / groundtruth。", options: { color: INK } }], { x: 0.6, y: 6.25, w: 12.15, h: 0.6, fontFace: BF, fontSize: 13, margin: 0 });
codeRef(s, "src/tools/tool_loader.py:77 ast_safety_scan · :106 signature_ok · :120 trial_run · :156 _wrap_as_crewai_tool · :60 ReadOnlyKit");

// ============================================================ 17 docstring + placement
s = p.addSlide();
header(s, "Part 3 · L2", "docstring 共同進化 + 工具裝在「決策點」");
card(s, 0.6, 2.0, 6.0, 4.6);
s.addText("docstring 共同進化", { x: 0.9, y: 2.25, w: 5.4, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "docstring 品質", options: { fontFace: CF, fontSize: 12, bold: true, color: BLUE, breakLine: true } },
  { text: "  ↓ agent 呼叫 / 不呼叫", options: { color: INK, breakLine: true } },
  { text: "  ↓ 資訊是否進入推理", options: { color: INK, breakLine: true } },
  { text: "  ↓ combined_score", options: { color: INK, breakLine: true } },
  { text: "  ↓ OpenEvolve selection", options: { color: INK, breakLine: true } },
  { text: "  ↓ 基因存續", options: { color: INK } },
], { x: 0.9, y: 2.8, w: 5.4, h: 2.6, fontSize: 13.5, lineSpacing: 22, margin: 0 });
s.addText("「工具的可被發現性」也受進化壓力。", { x: 0.9, y: 5.7, w: 5.4, h: 0.6, fontFace: BF, fontSize: 13.5, italic: true, color: BLUE, margin: 0 });
card(s, 6.9, 2.0, 5.85, 4.6, NAVY);
s.addText("裝給 psychological_analyst", { x: 7.2, y: 2.25, w: 5.3, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: AMBER, margin: 0 });
s.addText([
  { text: "資料點 → 決策點 → 輸出點", options: { color: ICE, breakLine: true } },
  { text: "工具裝在「判斷發生的地方」。", options: { color: WHITE } },
], { x: 7.2, y: 2.8, w: 5.3, h: 1, fontSize: 14.5, lineSpacing: 22, margin: 0 });
s.addText([
  { text: "為何不是 data_retriever？", options: { bold: true, color: ICE, breakLine: true } },
  { text: "會把 L1 剛清掉的崩潰風險請回來 · 職責混淆 · 時機太早（還沒分析脈絡）", options: { color: WHITE } },
], { x: 7.2, y: 4.0, w: 5.3, h: 2.4, fontFace: BF, fontSize: 13.5, valign: "top", lineSpacing: 18, margin: 0 });
codeRef(s, "src/tools/tool_loader.py:156-177 _wrap_as_crewai_tool（docstring→description）· simulation_crew.py:53-62 analyst tools=_load_analyst_tools()");

// ============================================================ 18 #7 train/val
s = p.addSlide();
header(s, "Part 4 · 可信機制", "#7 Train / Val 切分：過擬合照妖鏡");
s.addText("進化會「背答案」——對那幾個 train task 特化但不泛化。disjoint holdout 揪出它。", { x: 0.6, y: 1.95, w: 12, h: 0.4, fontFace: BF, fontSize: 15, color: INK, margin: 0 });
card(s, 0.6, 2.7, 5.95, 3.6, "F7E9E7");
s.addText("過擬合（假冠軍）", { x: 0.9, y: 2.95, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "train  0.90", options: { fontFace: CF, fontSize: 20, bold: true, color: INK, breakLine: true } },
  { text: "holdout  0.40", options: { fontFace: CF, fontSize: 20, bold: true, color: RED, breakLine: true } },
  { text: "差距 0.50 → 🚨 警報", options: { color: RED, bold: true } },
], { x: 0.9, y: 3.6, w: 5.4, h: 2, fontSize: 15, lineSpacing: 30, margin: 0 });
card(s, 6.8, 2.7, 5.95, 3.6, "E7F2EC");
s.addText("真泛化（可信）", { x: 7.1, y: 2.95, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "train  0.75", options: { fontFace: CF, fontSize: 20, bold: true, color: INK, breakLine: true } },
  { text: "holdout  0.72", options: { fontFace: CF, fontSize: 20, bold: true, color: GREEN, breakLine: true } },
  { text: "差距 0.03 → ✅ 真的學會了", options: { color: GREEN, bold: true } },
], { x: 7.1, y: 3.6, w: 5.4, h: 2, fontSize: 15, lineSpacing: 30, margin: 0 });
s.addText("make validate-holdout — disjoint 已驗證 overlap = 0", { x: 0.6, y: 6.5, w: 12, h: 0.4, fontFace: CF, fontSize: 13, color: MUTE, margin: 0 });
codeRef(s, "openevolve_evaluator.py:83-84 OPENEVOLVE_TASK_DIR · scripts/validate_holdout.py:25 切 holdout · create_sampled_dataset.py:8 disjoint");

// ============================================================ 19 #6 MAP-Elites
s = p.addSlide();
header(s, "Part 4 · 可信機制", "#6 MAP-Elites 自訂維度");
s.addText("單一 combined_score 會把兩種極端高手壓成中間值而淘汰。改用兩個分項當 diversity 維度。", { x: 0.6, y: 1.95, w: 12, h: 0.4, fontFace: BF, fontSize: 15, color: INK, margin: 0 });
s.addChart(p.charts.SCATTER, [
  { name: "X", values: [0.3, 0.8, 0.5, 0.9, 0.4, 0.7, 0.6] },
  { name: "elites", values: [0.85, 0.35, 0.6, 0.7, 0.5, 0.8, 0.55] },
], {
  x: 0.6, y: 2.6, w: 6.6, h: 4.2, chartColors: [AMBER], lineSize: 0,
  lineDataSymbol: "circle", lineDataSymbolSize: 13,
  catAxisTitle: "preference_estimation →", showCatAxisTitle: true,
  valAxisTitle: "review_generation →", showValAxisTitle: true,
  catAxisMinVal: 0, catAxisMaxVal: 1, valAxisMinVal: 0, valAxisMaxVal: 1,
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { color: "E2E8F0", size: 0.5 },
  catAxisLabelColor: MUTE, valAxisLabelColor: MUTE, showLegend: false,
});
card(s, 7.5, 2.7, 5.25, 4.0, NAVY);
s.addText("fitness vs feature", { x: 7.8, y: 2.95, w: 4.7, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: AMBER, margin: 0 });
s.addText([
  { text: "combined_score", options: { fontFace: CF, bold: true, color: ICE } },
  { text: " 決定誰勝出（fitness）", options: { color: WHITE, breakLine: true } },
  { text: "preference × review", options: { fontFace: CF, bold: true, color: ICE } },
  { text: " 只決定座標（多樣性）", options: { color: WHITE } },
], { x: 7.8, y: 3.5, w: 4.7, h: 1.6, fontSize: 13.5, lineSpacing: 22, margin: 0 });
s.addText("保留 trade-off 前沿各路精英，雜交出兼顧者。", { x: 7.8, y: 5.3, w: 4.7, h: 1, fontFace: BF, fontSize: 13.5, italic: true, color: ICE, margin: 0 });
codeRef(s, "config/openevolve_config.yaml:85-88 feature_dimensions（8×8）· openevolve_evaluator.py:47-59 _result(extra_metrics) · :174-177");

// ============================================================ 20 engineering lessons
s = p.addSlide();
header(s, "Part 5 · 工程教訓", "兩個真 bug，一句金句");
card(s, 0.6, 2.0, 6.0, 2.3);
s.addText("Bug #1 — 受限沙箱的 __import__", { x: 0.9, y: 2.25, w: 5.4, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: NAVY, margin: 0 });
s.addText("移除 __import__ 後，連白名單的 import statistics 都失效。縱深防禦要留「安全的門」。", { x: 0.9, y: 2.75, w: 5.4, h: 1.4, fontFace: BF, fontSize: 13.5, color: INK, margin: 0 });
card(s, 6.9, 2.0, 5.85, 2.3);
s.addText("Bug #2 — @tool 需要 docstring", { x: 7.2, y: 2.25, w: 5.3, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: NAVY, margin: 0 });
s.addText("combined_score=0.8452 看似完美，但 agent.tools == [] — 工具根本沒裝上。", { x: 7.2, y: 2.75, w: 5.3, h: 1.4, fontFace: BF, fontSize: 13.5, color: INK, margin: 0 });
card(s, 0.6, 4.5, 12.15, 2.1, NAVY);
s.addText("“ 分數健康 ≠ 功能正確 ”", { x: 0.95, y: 4.75, w: 11.5, h: 0.7, fontFace: HF, fontSize: 28, bold: true, color: AMBER, margin: 0 });
s.addText("graceful fallback 會讓「沒裝上工具」偽裝成「分數正常」。驗證要查功能本身（tools 清單），不能只看分數。", { x: 0.95, y: 5.55, w: 11.5, h: 0.9, fontFace: BF, fontSize: 15, color: WHITE, margin: 0 });
codeRef(s, "tool_loader.py:139-146 _safe_import（bug#1）· :156-177 docstring 轉移（bug#2）· simulation_crew.py:21-30 graceful [] 蓋住失敗", true);

// ============================================================ 21 results
s = p.addSlide();
header(s, "Part 6 · 結果", "L1 接線前後：穩定性的轉變");
const rows = [
  ["指標", "v3（接線前）", "L1 接線後"],
  ["每 task LLM call", "~7（含 ReAct 來回）", "~3"],
  ["tool calling 崩潰", "多次", "0"],
  ["tool_use coverage", "不穩", "穩定 1.0"],
  ["429 rate limit", "59 次", "大幅減少"],
];
const tableData = [];
for (let ri = 0; ri < rows.length; ri++) {
  const rowCells = [];
  for (let ci = 0; ci < rows[ri].length; ci++) {
    rowCells.push({
      text: rows[ri][ci],
      options: {
        fontFace: ri === 0 ? HF : (ci === 0 ? BF : CF), fontSize: ri === 0 ? 15 : 14,
        bold: ri === 0 || ci === 0,
        color: ri === 0 ? WHITE : (ci === 2 ? GREEN : INK),
        fill: { color: ri === 0 ? NAVY : (ri % 2 ? WHITE : LIGHT) },
        align: ci === 0 ? "left" : "center", valign: "middle",
      },
    });
  }
  tableData.push(rowCells);
}
s.addTable(tableData, { x: 0.6, y: 2.1, w: 12.15, colW: [4.05, 4.05, 4.05], rowH: 0.72, border: { pt: 1, color: "E2E8F0" } });
s.addText([
  { text: "進化跑：", options: { bold: true, color: NAVY } },
  { text: " v1 best 0.79 · v3 best 0.64（rate limit 重災）· L1 驗證 0.78 · 單元測試 46 全綠", options: { color: INK } },
], { x: 0.6, y: 6.4, w: 12.15, h: 0.5, fontFace: BF, fontSize: 13.5, margin: 0 });
codeRef(s, "docs/evolution_design_notes.md §12.4（接線前後對照）· §12.3（進化跑歷史）");

// ============================================================ 22 full picture / takeaways
s = p.addSlide();
header(s, "Part 6 · 結果", "完成全景 + Key Takeaways");
card(s, 0.6, 2.0, 4.0, 4.7, NAVY);
s.addText("Taxonomy 進度", { x: 0.85, y: 2.25, w: 3.5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: AMBER, margin: 0 });
s.addText([
  { text: "✅ L0  可觀測性", options: { color: WHITE, breakLine: true } },
  { text: "✅ L1  clamp + 接線", options: { color: WHITE, breakLine: true } },
  { text: "✅ #7  Train-Val", options: { color: WHITE, breakLine: true } },
  { text: "✅ #6  MAP-Elites", options: { color: WHITE, breakLine: true } },
  { text: "✅ L2  工具生成", options: { color: WHITE, breakLine: true } },
  { text: "⬜ Tier C  RagTool", options: { color: ICE } },
], { x: 0.85, y: 2.85, w: 3.5, h: 3.5, fontFace: CF, fontSize: 14, lineSpacing: 30, margin: 0 });
const tk = [
  "進化能設計 agent，但要防它把自己改壞",
  "協議/策略分離 + 優雅退化 = 可安全進化的地形",
  "自動優化要配可信機制（holdout、MAP-Elites）才不自欺",
  "分數健康 ≠ 功能正確；不盡信文件，讀原始碼",
];
tk.forEach((t, i) => {
  const y = 2.0 + i * 1.2;
  card(s, 4.85, y, 7.9, 1.05);
  chip(s, 5.1, y + 0.28, `${i + 1}`, AMBER, NAVY);
  s.addText(t, { x: 5.75, y, w: 6.85, h: 1.05, fontFace: BF, fontSize: 14.5, color: INK, valign: "middle", margin: 0 });
});
codeRef(s, "docs/evolution_design_notes.md §11（進度與 PR 對照）· §12.7（完整架構數據：baseline 0.72 → best 0.842）");

// ============================================================ 23 closing
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("謝謝 · Q & A", { x: 0.95, y: 2.6, w: 11.5, h: 1, fontFace: HF, fontSize: 44, bold: true, color: WHITE, margin: 0 });
s.addText([
  { text: "repo　", options: { bold: true, color: AMBER } },
  { text: "github.com/yuchieh/AgentSocietyChallenge_OpenEvolve", options: { color: ICE, breakLine: true } },
  { text: "深入　", options: { bold: true, color: AMBER } },
  { text: "docs/evolution_design_notes.md · docs/student_integration_guide.md", options: { color: ICE } },
], { x: 1, y: 4.0, w: 11.5, h: 1.4, fontFace: BF, fontSize: 16, lineSpacing: 30, margin: 0 });
codeRef(s, "tests/test_retrieval_executor.py + tests/test_tool_loader.py（46 全綠）· docs/evolution_design_notes.md", true);

p.writeFile({ fileName: "/tmp/deck/OpenEvolve_CrewAI_教學投影片.pptx" }).then(f => console.log("WROTE", f));
