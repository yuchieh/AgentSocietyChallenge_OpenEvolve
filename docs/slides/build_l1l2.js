const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "AgentSocietyChallenge_OpenEvolve";
p.title = "L1 × L2 深入：安全地用工具、也安全地造工具";

const NAVY = "1E2761", BLUE = "3A5BA0", ICE = "CADCFC";
const AMBER = "E8A33D", GREEN = "2E9E6B", RED = "C0453B";
const INK = "23272E", MUTE = "6B7280", LIGHT = "F4F7FB", WHITE = "FFFFFF";
const HF = "Georgia", BF = "Calibri", CF = "Consolas";
const W = 13.33, H = 7.5;
const sh = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 135, opacity: 0.12 });

function header(s, kicker, title) {
  s.background = { color: LIGHT };
  s.addShape(p.shapes.OVAL, { x: 0.55, y: 0.5, w: 0.16, h: 0.16, fill: { color: AMBER } });
  s.addText(kicker.toUpperCase(), { x: 0.8, y: 0.46, w: 11, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: BLUE, charSpacing: 2, margin: 0 });
  s.addText(title, { x: 0.55, y: 0.78, w: 12.2, h: 0.85, fontFace: HF, fontSize: 27, bold: true, color: NAVY, margin: 0 });
}
function card(s, x, y, w, h, fill) {
  s.addShape(p.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill || WHITE }, line: { color: "E2E8F0", width: 1 }, shadow: sh() });
}
function arrow(s, x, y, w, color, sz) {
  s.addText("→", { x, y, w: w || 0.5, h: 0.7, fontFace: HF, fontSize: sz || 22, bold: true, color: color || AMBER, align: "center", valign: "middle", margin: 0 });
}
// ── ‹code› 頁尾：檔名:行號 → GitHub permalink（pin commit；.md 無行號不連結）──
const GH_BASE = "https://github.com/yuchieh/AgentSocietyChallenge_OpenEvolve/blob/facfd59aceddfe0ce7f7499f93af16566d8002c2/";
const PATHMAP = {
  "openevolve_evaluator.py": "openevolve_evaluator.py", "evaluator.py": "openevolve_evaluator.py",
  "evolvable_tools.py": "evolvable_tools.py",
  "src/tools/interaction_tool_wrapper.py": "src/tools/interaction_tool_wrapper.py", "interaction_tool_wrapper.py": "src/tools/interaction_tool_wrapper.py",
  "src/tools/retrieval_executor.py": "src/tools/retrieval_executor.py", "retrieval_executor.py": "src/tools/retrieval_executor.py",
  "src/tools/tool_loader.py": "src/tools/tool_loader.py", "tool_loader.py": "src/tools/tool_loader.py",
  "src/crews/simulation_crew.py": "src/crews/simulation_crew.py", "simulation_crew.py": "src/crews/simulation_crew.py",
  "src/flows/serving_flow.py": "src/flows/serving_flow.py", "serving_flow.py": "src/flows/serving_flow.py",
  "config/agents_evolving.yaml": "config/agents_evolving.yaml", "agents_evolving.yaml": "config/agents_evolving.yaml",
  "config/agents.yaml": "config/agents.yaml", "agents.yaml": "config/agents.yaml",
  "config/tasks.yaml": "config/tasks.yaml", "tasks.yaml": "config/tasks.yaml",
  "config/openevolve_config.yaml": "config/openevolve_config.yaml", "openevolve_config.yaml": "config/openevolve_config.yaml",
};
const _NAMES = Object.keys(PATHMAP).sort((a, b) => b.length - a.length);
const _esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const _REF_RE = new RegExp("(" + _NAMES.map(_esc).join("|") + ")(:\\d+(?:-\\d+)?)?|(?<![\\w]):(\\d+(?:-\\d+)?)", "g");
function _ghUrl(path, lines) { let u = GH_BASE + path; if (lines) { const [a, b] = lines.split("-"); u += "#L" + a + (b ? "-L" + b : ""); } return u; }
function _linkify(txt) {
  const runs = []; let last = 0, lastPath = null, m; _REF_RE.lastIndex = 0;
  while ((m = _REF_RE.exec(txt)) !== null) {
    if (m.index > last) runs.push({ text: txt.slice(last, m.index) });
    if (m[1]) { lastPath = PATHMAP[m[1]]; const ln = m[2] ? m[2].slice(1) : null;
      if (lastPath.endsWith(".md") && !ln) runs.push({ text: m[0] }); else runs.push({ text: m[0], url: _ghUrl(lastPath, ln) });
    } else if (m[3] && lastPath) { runs.push({ text: m[0], url: _ghUrl(lastPath, m[3]) }); }
    else { runs.push({ text: m[0] }); }
    last = _REF_RE.lastIndex;
  }
  if (last < txt.length) runs.push({ text: txt.slice(last) });
  return runs;
}
function codeRef(s, txt, dark) {
  const linkCol = dark ? ICE : BLUE, plainCol = dark ? "8FA3C8" : MUTE;
  const runs = [{ text: "‹code›  ", options: { fontFace: CF, color: AMBER, bold: true } }];
  for (const r of _linkify(txt)) runs.push(r.url
    ? { text: r.text, options: { fontFace: CF, color: linkCol, underline: { style: "sng" }, hyperlink: { url: r.url } } }
    : { text: r.text, options: { fontFace: CF, color: plainCol } });
  s.addText(runs, { x: 0.55, y: 7.2, w: 12.4, h: 0.22, fontSize: 9, valign: "middle", margin: 0 });
}

// ============================================================ 1 TITLE
let s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("TOOL CALLING FAILURE TAXONOMY · 深入", { x: 1, y: 1.8, w: 11.5, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 3, margin: 0 });
s.addText("L1 × L2", { x: 0.95, y: 2.25, w: 11.5, h: 1.0, fontFace: HF, fontSize: 50, bold: true, color: WHITE, margin: 0 });
s.addText("安全地「用」工具，也安全地「造」工具", { x: 1, y: 3.5, w: 11.5, h: 0.6, fontFace: HF, fontSize: 24, bold: true, color: WHITE, margin: 0 });
s.addText("起手式——把會崩潰的「LLM 主導工具呼叫」，從進化空間移除", { x: 1, y: 4.3, w: 11.5, h: 0.5, fontFace: BF, fontSize: 17, color: ICE, margin: 0 });
[["L1　安全地用", BLUE, 1.0], ["L2　安全地造", AMBER, 5.0]].forEach(c => {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: c[2], y: 5.3, w: 3.6, h: 0.8, rectRadius: 0.1, fill: { color: c[1] } });
  s.addText(c[0], { x: c[2], y: 5.3, w: 3.6, h: 0.8, align: "center", valign: "middle", fontFace: HF, fontSize: 17, bold: true, color: WHITE, margin: 0 });
});
codeRef(s, "L1 src/tools/retrieval_executor.py ｜ L2 src/tools/tool_loader.py + evolvable_tools.py", true);

// ============================================================ 2 共同設計哲學
s = p.addSlide();
header(s, "設計哲學", "共用一招：凍結「邊界」，放開「內容」");
const gv = [
  ["", "L1 · 工具使用策略", "L2 · 工具生成"],
  ["凍結（安全邊界）", "直譯器：ALLOWED_QUERIES + clamp", "裝載器：四道關卡沙箱"],
  ["進化（自由內容）", "retrieval_policy：查什麼 / 怎麼取樣", "evolvable_tools：新的派生計算"],
  ["最壞情況", "退回預設 policy（永不 raise）", "靜默丟棄壞工具（不報錯）"],
];
const td = [];
for (let r = 0; r < gv.length; r++) {
  const row = [];
  for (let c = 0; c < 3; c++) row.push({
    text: gv[r][c],
    options: {
      fontFace: r === 0 ? HF : (c === 0 ? HF : BF), fontSize: r === 0 ? 15 : 13.5,
      bold: r === 0 || c === 0, color: r === 0 ? WHITE : (c === 1 ? "0C447C" : c === 2 ? "8A5A0B" : INK),
      fill: { color: r === 0 ? NAVY : (r % 2 ? WHITE : LIGHT) }, align: "left", valign: "middle",
    },
  });
  td.push(row);
}
s.addTable(td, { x: 0.6, y: 2.05, w: 12.15, colW: [2.85, 4.65, 4.65], rowH: [0.55, 0.85, 0.85, 0.85], border: { pt: 1, color: "E2E8F0" } });
card(s, 0.6, 5.7, 12.15, 1.2, NAVY);
s.addText([
  { text: "安全憲法　", options: { bold: true, color: AMBER } },
  { text: "最壞 = 優雅退化，絕不是災難性崩潰。L1 與 L2 都把「凍結的安全骨架」與「自由進化的內容」分開——這就是能放手讓 LLM 進化、又不怕它把自己改崩的關鍵。", options: { color: WHITE } },
], { x: 0.95, y: 5.7, w: 11.5, h: 1.2, fontFace: BF, fontSize: 13.5, valign: "middle", lineSpacing: 20, margin: 0 });
codeRef(s, "L1 retrieval_executor.py:28-30 ALLOWED_*／:53 clamp ｜ L2 tool_loader.py:77-177 四關卡");

// ============================================================ 3 L1 機制：把工具呼叫從 LLM 手上拿走
s = p.addSlide();
header(s, "L1 · 機制", "L1：把工具呼叫從 LLM 手上拿走");
card(s, 0.6, 2.2, 5.95, 3.7, "F7E9E7");
s.addText("接線前（會崩）", { x: 0.9, y: 2.45, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "data_retriever [有 tool]", options: { fontFace: CF, bold: true, color: NAVY, breakLine: true } },
  { text: "  ↓ LLM 用文字格式「主動」呼叫工具 ×4", options: { color: INK, breakLine: true } },
  { text: "  ↓ 整理成 summary", options: { color: INK } },
], { x: 0.9, y: 3.1, w: 5.4, h: 1.8, fontSize: 13.5, lineSpacing: 28, margin: 0 });
s.addText("使用者是 LLM——突變一改壞格式就崩。", { x: 0.9, y: 5.3, w: 5.4, h: 0.5, fontFace: BF, fontSize: 13, italic: true, color: RED, margin: 0 });
card(s, 6.8, 2.2, 5.95, 3.7, "E7F2EC");
s.addText("接線後（不崩）", { x: 7.1, y: 2.45, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "serving_flow：crew 啟動前", options: { fontFace: CF, bold: true, color: NAVY, breakLine: true } },
  { text: "  ↓ execute_policy() 確定性檢索", options: { color: INK, breakLine: true } },
  { text: "  ↓ 結果存成 retrieved_context 注入", options: { color: INK, breakLine: true } },
  { text: "data_retriever [無 tool]：只萃取文字", options: { fontFace: CF, bold: true, color: GREEN } },
], { x: 7.1, y: 3.1, w: 5.5, h: 2.0, fontSize: 13.5, lineSpacing: 26, margin: 0 });
s.addText("沒有任何 agent 在「呼叫工具」——查資料的事交給確定性程式。", { x: 7.1, y: 5.3, w: 5.4, h: 0.5, fontFace: BF, fontSize: 13, italic: true, color: GREEN, margin: 0 });
s.addText("精髓：把「會崩潰的部分」移出進化空間，留下「值得進化的部分」（檢索策略 + 萃取 prompt）。", { x: 0.6, y: 6.1, w: 12.15, h: 0.5, fontFace: HF, fontSize: 15, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "serving_flow.py:85-93 execute_policy→注入 ｜ simulation_crew.py:42-50 data_retriever 無 tools");

// ============================================================ 4 L1 疑問：白名單寫死了，進化改什麼？
s = p.addSlide();
header(s, "L1 · 關鍵疑問", "白名單寫死了，queries / strategy 進化還有用嗎？");
s.addText("有用。關鍵是分清楚「字母表」與「句子」：", { x: 0.6, y: 1.62, w: 12, h: 0.4, fontFace: BF, fontSize: 14, color: INK, margin: 0 });
card(s, 0.6, 2.1, 5.95, 1.55, "EAF0FA");
s.addText([
  { text: "ALLOWED_QUERIES＝字母表", options: { bold: true, color: NAVY, breakLine: true } },
  { text: "哪些查詢「合法」（4 種）——凍結、不能改", options: { color: INK } },
], { x: 0.9, y: 2.3, w: 5.4, h: 1.1, fontSize: 13.5, lineSpacing: 20, margin: 0 });
card(s, 6.8, 2.1, 5.95, 1.55, "FBF1E0");
s.addText([
  { text: "retrieval_policy＝句子", options: { bold: true, color: "8A5A0B", breakLine: true } },
  { text: "這次查哪幾種、什麼順序、怎麼取樣、k、截斷——進化", options: { color: INK } },
], { x: 7.1, y: 2.3, w: 5.4, h: 1.1, fontSize: 13.5, lineSpacing: 20, margin: 0 });
s.addText("同一組字母 → 不同句子（policy），餵給下游的 context 天差地別：", { x: 0.6, y: 3.85, w: 12, h: 0.4, fontFace: BF, fontSize: 13.5, color: INK, margin: 0 });
card(s, 0.6, 4.35, 5.95, 1.55, "11183B");
s.addText([
  { text: "Policy A", options: { color: AMBER, bold: true, breakLine: true } },
  { text: "queries: [user, item, review_by_user]\nstrategy: recent   k: 15", options: { color: WHITE } },
], { x: 0.9, y: 4.5, w: 5.4, h: 1.3, fontFace: CF, fontSize: 12.5, lineSpacing: 18, margin: 0 });
card(s, 6.8, 4.35, 5.95, 1.55, "11183B");
s.addText([
  { text: "Policy B", options: { color: AMBER, bold: true, breakLine: true } },
  { text: "queries: [user, review_by_item]\nstrategy: extreme_ratings   k: 5", options: { color: WHITE } },
], { x: 7.1, y: 4.5, w: 5.4, h: 1.3, fontFace: CF, fontSize: 12.5, lineSpacing: 18, margin: 0 });
s.addText("進化改的不是「能查什麼」，而是「這次怎麼查」。真正的天花板是資料集（3 張表），不是白名單。", { x: 0.6, y: 6.15, w: 12.15, h: 0.5, fontFace: HF, fontSize: 15, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "retrieval_executor.py:29 ALLOWED_QUERIES（字母表）· :33-37 DEFAULT_POLICY · :53 normalize_policy（拼句子）");

// ============================================================ 5 L1 資料流：policy 如何影響後續任務
s = p.addSlide();
header(s, "L1 · 運作邏輯", "進化的 policy 怎麼一路影響到最終評分？");
const flowL1 = ["retrieval_policy\n（進化的句子）", "execute_policy()\n凍結直譯", "retrieved_context", "analyst 分析", "{stars, review}", "fitness → 選擇"];
const colsL1 = [AMBER, NAVY, BLUE, BLUE, GREEN, NAVY];
flowL1.forEach((t, i) => {
  const x = 0.55 + i * 2.08;
  card(s, x, 2.5, 1.78, 1.3, WHITE);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.5, w: 1.78, h: 0.1, fill: { color: colsL1[i] } });
  s.addText(t, { x: x + 0.05, y: 2.62, w: 1.68, h: 1.15, fontFace: BF, fontSize: 10.5, bold: true, color: INK, align: "center", valign: "middle", lineSpacing: 13, margin: 0 });
  if (i < 5) arrow(s, x + 1.78, 2.85, 0.3, NAVY, 16);
});
card(s, 0.6, 4.3, 12.15, 1.05, "E7F2EC");
s.addText([
  { text: "clamp 保護：", options: { bold: true, color: GREEN } },
  { text: "k=999999 → 50 · 亂掰的 query → 過濾掉 · 整個 policy 爛掉 → 退回預設。永不 raise。", options: { color: INK } },
], { x: 0.95, y: 4.3, w: 11.5, h: 1.05, fontFace: BF, fontSize: 13.5, valign: "middle", margin: 0 });
s.addText("所以好 policy（查得準、取樣對）→ 下游分析更準 → fitness 更高 → 被選中存活；爛 policy 最壞只是退化成 baseline 檢索，不會崩。進化就在這個「安全地形」上探索。", { x: 0.6, y: 5.6, w: 12.15, h: 1.0, fontFace: BF, fontSize: 14, color: INK, lineSpacing: 22, margin: 0 });
codeRef(s, "retrieval_executor.py:53 normalize_policy（clamp）· :140 execute_policy ｜ serving_flow.py:90-99 注入 inputs");

// ============================================================ 6 L2 機制：進化的工具怎麼到 agent 手上
s = p.addSlide();
header(s, "L2 · 機制", "進化出的工具，經過哪些關卡才到 agent 手上？");
const flowL2 = ["evolvable_tools.py\nEVOLVE-BLOCK 內\ntool_* 函式", "_load_analyst_tools()\n建 crew 時讀檔", "load_evolved_tools\n四道關卡", "包裝成 @tool\ndocstring→說明", "裝給\npsychological\n_analyst"];
const colsL2 = [AMBER, BLUE, NAVY, BLUE, GREEN];
flowL2.forEach((t, i) => {
  const x = 0.55 + i * 2.5;
  card(s, x, 2.3, 2.2, 1.5, WHITE);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.3, w: 2.2, h: 0.1, fill: { color: colsL2[i] } });
  s.addText(t, { x: x + 0.05, y: 2.42, w: 2.1, h: 1.35, fontFace: BF, fontSize: 10.5, bold: true, color: INK, align: "center", valign: "middle", lineSpacing: 13, margin: 0 });
  if (i < 4) arrow(s, x + 2.2, 2.7, 0.3, NAVY, 16);
});
const gates = [
  ["① AST 安全掃描", "擋 import / open / exec / dunder（整檔否決）"],
  ["② 簽名約定", "只認 tool_* + (kit, user_id, item_id)"],
  ["③ 沙箱試跑", "fixture 實跑 5s timeout，壞的靜默丟棄"],
  ["④ 包裝註冊", "存活者包成 CrewAI @tool"],
];
gates.forEach((g, i) => {
  const x = 0.6 + (i % 2) * 6.15, y = 4.1 + Math.floor(i / 2) * 0.92;
  card(s, x, y, 5.9, 0.8);
  s.addText(g[0], { x: x + 0.2, y, w: 2.3, h: 0.8, fontFace: HF, fontSize: 13.5, bold: true, color: NAVY, valign: "middle", margin: 0 });
  s.addText(g[1], { x: x + 2.45, y, w: 3.3, h: 0.8, fontFace: BF, fontSize: 11.5, color: INK, valign: "middle", margin: 0 });
});
s.addText("ReadOnlyKit：工具只能 get_user / get_item / get_reviews——碰不到檔案系統、網路、答案。", { x: 0.6, y: 6.05, w: 12.15, h: 0.5, fontFace: BF, fontSize: 13, italic: true, color: BLUE, margin: 0 });
codeRef(s, "simulation_crew.py:14-30 _load_analyst_tools ｜ tool_loader.py:193 load_evolved_tools · :77/:106/:120/:156 四關卡 · :60 ReadOnlyKit");

// ============================================================ 7 L2 關鍵：docstring 共同進化
s = p.addSlide();
header(s, "L2 · 運作邏輯", "agent 怎麼「知道」要用這個工具？");
card(s, 0.6, 2.1, 6.0, 4.0, "EAF0FA");
s.addText("docstring 共同進化", { x: 0.9, y: 2.3, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "包裝時 docstring → 工具 description → agent 看得到 → 自主決定呼不呼叫。", options: { color: INK, breakLine: true } },
  { text: "因果鏈：", options: { bold: true, color: BLUE, breakLine: true } },
  { text: "docstring 品質 → 呼叫/不呼叫 → 是否進入推理 → fitness → selection → docstring 基因存續", options: { fontFace: CF, fontSize: 11.5, color: INK } },
], { x: 0.9, y: 2.8, w: 5.5, h: 2.6, fontSize: 13.5, lineSpacing: 21, margin: 0 });
s.addText("「工具的可被發現性」也受進化壓力——算得準但說明含糊，agent 不呼叫＝零貢獻＝被淘汰。", { x: 0.9, y: 5.3, w: 5.5, h: 0.7, fontFace: BF, fontSize: 12.5, italic: true, color: BLUE, margin: 0 });
card(s, 6.8, 2.1, 5.95, 4.0, WHITE);
s.addText("兩個安全設計", { x: 7.1, y: 2.3, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "沉默的死基因　", options: { bold: true, color: GREEN } },
  { text: "壞工具靜默丟棄（5 個壞、3 個剩 2 個照跑），pipeline 永不崩；全失敗就退回空清單，agent 仍能用 retrieved_context 分析。", options: { color: INK, breakLine: true } },
  { text: "裝在「決策點」　", options: { bold: true, color: GREEN } },
  { text: "工具裝給 analyst（判斷發生的地方），不是 data_retriever——免得把 L1 剛清掉的崩潰風險請回來。", options: { color: INK } },
], { x: 7.1, y: 2.8, w: 5.45, h: 3.2, fontSize: 13, lineSpacing: 20, margin: 0 });
codeRef(s, "tool_loader.py:156-177 _wrap_as_crewai_tool（docstring→description）· :226-238 沉默丟棄 ｜ simulation_crew.py:53-62 裝給 analyst");

// ============================================================ 8 合體
s = p.addSlide();
header(s, "L1 × L2 · 合體", "字母表 → 句子 → 新詞：安全地演化出創新工具");
const prog = [
  ["L1：拼新「句子」", "用固定的「字母表」（4 種查詢）拼出新的檢索句子——決定怎麼「用」既有查詢", BLUE],
  ["L2：造新「詞」", "在固定的資料（3 張表）上發明新的派生分析——憑空「造」出新工具", AMBER],
];
prog.forEach((c, i) => {
  const y = 2.05 + i * 1.25;
  card(s, 0.6, y, 12.15, 1.1);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 1.1, fill: { color: c[2] } });
  s.addText(c[0], { x: 0.95, y, w: 3.2, h: 1.1, fontFace: HF, fontSize: 16, bold: true, color: c[2], valign: "middle", margin: 0 });
  s.addText(c[1], { x: 4.2, y, w: 8.4, h: 1.1, fontFace: BF, fontSize: 14, color: INK, valign: "middle", margin: 0 });
});
card(s, 0.6, 4.65, 12.15, 1.05, "F1EFE8");
s.addText([
  { text: "共同邊界　", options: { bold: true, color: NAVY } },
  { text: "資料只有 3 張表 → 問題從「無界的程式碼生成」收斂成「有界的特徵工程」——可控、可沙箱、可驗證。", options: { color: INK } },
], { x: 0.95, y: 4.65, w: 11.5, h: 1.05, fontFace: BF, fontSize: 13.5, valign: "middle", margin: 0 });
card(s, 0.6, 5.9, 12.15, 1.0, NAVY);
s.addText("凍結「邊界」、放開「內容」——這就是為什麼進化能又創新、又安全。", { x: 0.95, y: 5.9, w: 11.5, h: 1.0, fontFace: HF, fontSize: 17, bold: true, color: AMBER, valign: "middle", margin: 0 });
codeRef(s, "L1 retrieval_executor.py + agents_evolving.yaml:11-16 ｜ L2 tool_loader.py + evolvable_tools.py:18-58");

p.writeFile({ fileName: "/tmp/deck/L1L2_深入_教學投影片.pptx" }).then(f => console.log("WROTE", f));
