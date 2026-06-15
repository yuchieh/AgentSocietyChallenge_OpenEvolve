const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";            // 13.33 x 7.5
p.author = "AgentSocietyChallenge_OpenEvolve";
p.title = "人 × AI × 進化 — 協作打造可進化 Agent 系統";

// ---- palette ----
const NAVY = "1E2761", BLUE = "3A5BA0", ICE = "CADCFC";
const AMBER = "E8A33D", GREEN = "2E9E6B", RED = "C0453B";
const INK = "23272E", MUTE = "6B7280", LIGHT = "F4F7FB", WHITE = "FFFFFF";
const HF = "Georgia", BF = "Calibri", CF = "Consolas";
const HUMAN = GREEN, CLAUDE = BLUE, OE = AMBER;
const W = 13.33, H = 7.5;

const sh = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 135, opacity: 0.12 });

function header(s, kicker, title) {
  s.background = { color: LIGHT };
  s.addShape(p.shapes.OVAL, { x: 0.55, y: 0.5, w: 0.16, h: 0.16, fill: { color: AMBER } });
  s.addText(kicker.toUpperCase(), { x: 0.8, y: 0.46, w: 11, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: BLUE, charSpacing: 2, margin: 0 });
  s.addText(title, { x: 0.55, y: 0.78, w: 12.2, h: 0.85, fontFace: HF, fontSize: 28, bold: true, color: NAVY, margin: 0 });
}
function card(s, x, y, w, h, fill) {
  s.addShape(p.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill || WHITE }, line: { color: "E2E8F0", width: 1 }, shadow: sh() });
}
function chip(s, x, y, txt, fill, tcolor) {
  s.addShape(p.shapes.OVAL, { x, y, w: 0.5, h: 0.5, fill: { color: fill } });
  s.addText(txt, { x, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: HF, fontSize: 18, bold: true, color: tcolor || WHITE, margin: 0 });
}
function arrow(s, x, y, w, color) {
  s.addText("→", { x, y, w: w || 0.55, h: 0.8, fontFace: HF, fontSize: 28, bold: true, color: color || AMBER, align: "center", valign: "middle", margin: 0 });
}
// 每個 footer 裡的「檔名:行號」自動變成可點的 GitHub permalink（pin 到 commit SHA，
// 行號不會隨日後改碼漂移）。footer 字串不必改——靠已知檔名清單自動偵測。
const GH_BASE = "https://github.com/yuchieh/AgentSocietyChallenge_OpenEvolve/blob/facfd59aceddfe0ce7f7499f93af16566d8002c2/";
const PATHMAP = {
  "openevolve_evaluator.py": "openevolve_evaluator.py",
  "evaluator.py": "openevolve_evaluator.py",
  "evolvable_tools.py": "evolvable_tools.py",
  "CLAUDE.md": "CLAUDE.md",
  "src/tools/interaction_tool_wrapper.py": "src/tools/interaction_tool_wrapper.py",
  "interaction_tool_wrapper.py": "src/tools/interaction_tool_wrapper.py",
  "src/tools/retrieval_executor.py": "src/tools/retrieval_executor.py",
  "retrieval_executor.py": "src/tools/retrieval_executor.py",
  "src/tools/tool_loader.py": "src/tools/tool_loader.py",
  "tool_loader.py": "src/tools/tool_loader.py",
  "src/crews/simulation_crew.py": "src/crews/simulation_crew.py",
  "simulation_crew.py": "src/crews/simulation_crew.py",
  "src/flows/serving_flow.py": "src/flows/serving_flow.py",
  "serving_flow.py": "src/flows/serving_flow.py",
  "src/utils/create_sampled_dataset.py": "src/utils/create_sampled_dataset.py",
  "create_sampled_dataset.py": "src/utils/create_sampled_dataset.py",
  "scripts/validate_holdout.py": "scripts/validate_holdout.py",
  "validate_holdout.py": "scripts/validate_holdout.py",
  "tests/test_tool_loader.py": "tests/test_tool_loader.py",
  "test_tool_loader.py": "tests/test_tool_loader.py",
  "tests/test_retrieval_executor.py": "tests/test_retrieval_executor.py",
  "test_retrieval_executor.py": "tests/test_retrieval_executor.py",
  "config/openevolve_config.yaml": "config/openevolve_config.yaml",
  "openevolve_config.yaml": "config/openevolve_config.yaml",
  "config/agents_evolving.yaml": "config/agents_evolving.yaml",
  "agents_evolving.yaml": "config/agents_evolving.yaml",
  "config/agents.yaml": "config/agents.yaml",
  "agents.yaml": "config/agents.yaml",
  "config/tasks.yaml": "config/tasks.yaml",
  "tasks.yaml": "config/tasks.yaml",
  "docs/evolution_design_notes.md": "docs/evolution_design_notes.md",
  "evolution_design_notes.md": "docs/evolution_design_notes.md",
  "docs/collaboration_workflow_outline.md": "docs/collaboration_workflow_outline.md",
  "collaboration_workflow_outline.md": "docs/collaboration_workflow_outline.md",
  "docs/teaching_slides_outline.md": "docs/teaching_slides_outline.md",
  "teaching_slides_outline.md": "docs/teaching_slides_outline.md",
  "docs/unified_deck_outline.md": "docs/unified_deck_outline.md",
  "unified_deck_outline.md": "docs/unified_deck_outline.md",
};
const _NAMES = Object.keys(PATHMAP).sort((a, b) => b.length - a.length);
const _esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// 接續的 :行號 只在「冒號前不是文字字元」時才算（讓「num_islands:3」這種設定值不被誤判成行號）
const _REF_RE = new RegExp("(" + _NAMES.map(_esc).join("|") + ")(:\\d+(?:-\\d+)?)?|(?<![\\w]):(\\d+(?:-\\d+)?)", "g");

function _ghUrl(path, lines) {
  let url = GH_BASE + path;
  if (lines) { const [a, b] = lines.split("-"); url += "#L" + a + (b ? "-L" + b : ""); }
  return url;
}
// 把 footer 字串拆成 [{text} | {text, url}] runs
function _linkify(txt) {
  const runs = [];
  let last = 0, lastPath = null, m;
  _REF_RE.lastIndex = 0;
  while ((m = _REF_RE.exec(txt)) !== null) {
    if (m.index > last) runs.push({ text: txt.slice(last, m.index) });
    if (m[1]) {                                   // 檔名(:行號)
      lastPath = PATHMAP[m[1]];
      const lines = m[2] ? m[2].slice(1) : null;
      // .md（設計文件）沒有指定行數就不連結——連到整份長文件意義不大
      if (lastPath.endsWith(".md") && !lines) {
        runs.push({ text: m[0] });
      } else {
        runs.push({ text: m[0], url: _ghUrl(lastPath, lines) });
      }
    } else if (m[3] && lastPath) {                // 接續的 :行號（沿用前一個檔案）
      runs.push({ text: m[0], url: _ghUrl(lastPath, m[3]) });
    } else {
      runs.push({ text: m[0] });
    }
    last = _REF_RE.lastIndex;
  }
  if (last < txt.length) runs.push({ text: txt.slice(last) });
  return runs;
}

function codeRef(s, txt, dark) {
  const linkCol = dark ? ICE : BLUE;
  const plainCol = dark ? "8FA3C8" : MUTE;
  const runs = [{ text: "‹code›  ", options: { fontFace: CF, color: AMBER, bold: true } }];
  for (const r of _linkify(txt)) {
    runs.push(r.url
      ? { text: r.text, options: { fontFace: CF, color: linkCol, underline: { style: "sng" }, hyperlink: { url: r.url } } }
      : { text: r.text, options: { fontFace: CF, color: plainCol } });
  }
  s.addText(runs, { x: 0.55, y: 7.2, w: 12.4, h: 0.22, fontSize: 9, valign: "middle", margin: 0 });
}
const chain = [["我", HUMAN], ["Claude", CLAUDE], ["OpenEvolve", OE]];

// ============================================================ S1 TITLE
let s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("HUMAN × CLAUDE CODE × OPENEVOLVE", { x: 1, y: 1.75, w: 11.5, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 3, margin: 0 });
s.addText("人 × AI × 進化", { x: 0.95, y: 2.2, w: 11.5, h: 1.1, fontFace: HF, fontSize: 48, bold: true, color: WHITE, margin: 0 });
s.addText("協作打造一個會「安全進化」的 Agent 系統", { x: 1, y: 3.55, w: 11.5, h: 0.6, fontFace: BF, fontSize: 20, color: ICE, margin: 0 });
chain.forEach((c, i) => {
  const x = 1.0 + i * 3.7;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 5.0, w: 2.8, h: 0.8, rectRadius: 0.1, fill: { color: c[1] } });
  s.addText(c[0], { x, y: 5.0, w: 2.8, h: 0.8, align: "center", valign: "middle", fontFace: HF, fontSize: 18, bold: true, color: WHITE, margin: 0 });
  if (i < 2) s.addText("▶", { x: x + 2.85, y: 5.0, w: 0.8, h: 0.8, align: "center", valign: "middle", fontFace: BF, fontSize: 16, color: AMBER, margin: 0 });
});
s.addText("一份講完「系統怎麼做的」與「人 + AI 怎麼協作做出來的」", { x: 1, y: 6.3, w: 11.5, h: 0.4, fontFace: BF, fontSize: 13, color: "8FA3C8", margin: 0 });
codeRef(s, "repo · 進入點 openevolve_evaluator.py · config/openevolve_config.yaml · config/agents_evolving.yaml", true);

// ============================================================ S2 RESULT TEASER
s = p.addSlide();
header(s, "開場", "我們做出了什麼？");
const stats = [
  ["baseline", "0.28 → 0.72", "executor 確定性檢索的穩定性紅利", HUMAN],
  ["best", "0.842", "iter22（進化到第 22 代）長出的量化公式", CLAUDE],
  ["工具崩潰", "36% → 0", "從會把自己改崩，到零工具呼叫崩潰", OE],
];
stats.forEach((t, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.2, 3.85, 3.0);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.2, w: 3.85, h: 0.14, fill: { color: t[3] } });
  s.addText(t[0], { x: x + 0.25, y: 2.5, w: 3.35, h: 0.4, fontFace: BF, fontSize: 14, color: MUTE, margin: 0 });
  s.addText(t[1], { x: x + 0.25, y: 2.95, w: 3.35, h: 0.9, fontFace: HF, fontSize: 30, bold: true, color: t[3], margin: 0 });
  s.addText(t[2], { x: x + 0.25, y: 4.0, w: 3.4, h: 1.0, fontFace: BF, fontSize: 13.5, color: INK, lineSpacing: 20, margin: 0 });
});
s.addText("而且這不是一個人寫出來的——是「我 + Claude + OpenEvolve」三個智能體協作的成果。", { x: 0.6, y: 5.6, w: 12, h: 0.6, fontFace: HF, fontSize: 17, italic: true, color: NAVY, align: "center", margin: 0 });

// ============================================================ S3 AGENDA
s = p.addSlide();
header(s, "Agenda", "議程與學習目標");
const parts = [
  ["1", "協作架構", "三個智能體 · 自主 vs 護欄"],
  ["2", "問題與接縫", "進化把自己改崩 → 失敗分類學"],
  ["3", "技術主體", "L0 / L1 / L2 分層解法"],
  ["4", "可信機制", "Train/Val · MAP-Elites"],
  ["5", "協作模式", "5 個可遷移模式"],
  ["6", "高潮 iter22", "三層協作的湧現產物"],
];
parts.forEach((it, i) => {
  const x = 0.55 + (i % 3) * 4.15, y = 1.9 + Math.floor(i / 3) * 1.5;
  card(s, x, y, 3.9, 1.3);
  chip(s, x + 0.25, y + 0.25, it[0], NAVY);
  s.addText(it[1], { x: x + 0.9, y: y + 0.18, w: 2.85, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText(it[2], { x: x + 0.9, y: y + 0.6, w: 2.85, h: 0.6, fontFace: BF, fontSize: 12, color: MUTE, margin: 0 });
});
s.addText([
  { text: "學習目標　", options: { bold: true, color: AMBER } },
  { text: "三層協作架構 + 自主/護欄配置 · 看懂失敗分類學與 L0/L1/L2 · 帶走 5 個協作模式 · 判準：什麼我做/交給 AI/交給進化", options: { color: INK } },
], { x: 0.55, y: 5.2, w: 12.2, h: 0.8, fontFace: BF, fontSize: 13, valign: "middle", margin: 0 });
s.addText("主線：協作故事是外層，技術分類學是嵌入其中的實戰案例。", { x: 0.55, y: 6.15, w: 12, h: 0.4, fontFace: BF, fontSize: 13, italic: true, color: BLUE, margin: 0 });

// ============================================================ S4 三個角色
s = p.addSlide();
header(s, "Part 1 · 協作架構", "三個角色登場");
const roles = [
  ["我（Human）", "本場講者", "設方向 · 做決策\n提問 · 把關", HUMAN],
  ["Claude Code", "我的實作夥伴（AI）", "實作 · 驗證\n分析 · 誠實報告", CLAUDE],
  ["OpenEvolve 的 LLM", "Claude 駕馭的探索者（AI）", "自主突變 · 發明工具\n探索進化", OE],
];
roles.forEach((r, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.2, 3.85, 3.4);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.2, w: 3.85, h: 0.14, fill: { color: r[3] } });
  s.addText(r[0], { x: x + 0.25, y: 2.55, w: 3.35, h: 0.5, fontFace: HF, fontSize: 17, bold: true, color: r[3], margin: 0 });
  s.addText(r[1], { x: x + 0.25, y: 3.1, w: 3.35, h: 0.4, fontFace: BF, fontSize: 13, italic: true, color: MUTE, margin: 0 });
  s.addText(r[2], { x: x + 0.25, y: 3.7, w: 3.35, h: 1.6, fontFace: BF, fontSize: 15, color: INK, lineSpacing: 24, margin: 0 });
});
s.addText("關鍵：後兩者都是 AI，但角色完全不同；我站在最外層指揮。", { x: 0.6, y: 5.9, w: 12, h: 0.5, fontFace: BF, fontSize: 15, italic: true, color: BLUE, margin: 0 });
codeRef(s, "我+Claude 寫 config/agents.yaml（正式）· agents_evolving.yaml（種子）｜ OpenEvolve 改 evolvable_tools.py:18-58");

// ============================================================ S5 三層嵌套
s = p.addSlide();
header(s, "Part 1 · 協作架構", "三層嵌套：委派自主性的鏈");
const layers = [
  ["我（Human）", "意圖 / 決策", HUMAN],
  ["Claude Code", "實作 / 判斷", CLAUDE],
  ["OpenEvolve LLM", "自主探索", OE],
];
layers.forEach((l, i) => {
  const x = 0.7 + i * 4.25;
  card(s, x, 2.6, 3.55, 2.0, WHITE);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.6, w: 3.55, h: 0.12, fill: { color: l[2] } });
  s.addText(l[0], { x: x + 0.25, y: 3.05, w: 3.05, h: 0.6, fontFace: HF, fontSize: 18, bold: true, color: l[2], margin: 0 });
  s.addText(l[1], { x: x + 0.25, y: 3.7, w: 3.05, h: 0.6, fontFace: BF, fontSize: 14, color: MUTE, margin: 0 });
  if (i < 2) s.addText("指揮 ▶", { x: x + 3.55, y: 3.0, w: 0.75, h: 1, fontFace: BF, fontSize: 12, bold: true, color: AMBER, align: "center", valign: "middle", margin: 0 });
});
s.addText("← 自主程度越往右越高　|　護欄也要越往右越強 →", { x: 0.7, y: 5.0, w: 11.85, h: 0.4, fontFace: BF, fontSize: 14, bold: true, color: NAVY, align: "center", margin: 0 });
s.addText("這不是「我用工具」，是「我把自主性一層層往下委派」的三層鏈。", { x: 0.7, y: 5.7, w: 12, h: 0.5, fontFace: HF, fontSize: 17, italic: true, color: NAVY, margin: 0 });
codeRef(s, "我→config/*.yaml ｜ Claude→src/tools/ + src/crews/ + src/flows/ ｜ OpenEvolve→agents_evolving.yaml EVOLVE-BLOCK");

// ============================================================ S6 架構師 vs 探勘者
s = p.addSlide();
header(s, "Part 1 · 協作架構", "Claude × OpenEvolve：架構師 vs 探勘者");
card(s, 0.6, 1.95, 5.9, 1.95, "EAF0FA");
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 1.95, w: 0.12, h: 1.95, fill: { color: CLAUDE } });
s.addText("Claude＝架構師", { x: 0.9, y: 2.15, w: 5.4, h: 0.45, fontFace: HF, fontSize: 18, bold: true, color: CLAUDE, margin: 0 });
s.addText("有意圖的設計 · 知道「為什麼」\n少量 · 高槓桿 · 可解釋", { x: 0.9, y: 2.65, w: 5.4, h: 1.1, fontFace: BF, fontSize: 14, color: INK, lineSpacing: 22, margin: 0 });
card(s, 6.85, 1.95, 5.9, 1.95, "FBF1E0");
s.addShape(p.shapes.RECTANGLE, { x: 6.85, y: 1.95, w: 0.12, h: 1.95, fill: { color: OE } });
s.addText("OpenEvolve＝探勘者", { x: 7.15, y: 2.15, w: 5.4, h: 0.45, fontFace: HF, fontSize: 18, bold: true, color: "B5791F", margin: 0 });
s.addText("無意圖的突變 + 篩選 · 只知「是什麼」\n大量 · 低槓桿 · 靠數量", { x: 7.15, y: 2.65, w: 5.4, h: 1.1, fontFace: BF, fontSize: 14, color: INK, lineSpacing: 22, margin: 0 });
const cyc = [["① 設計搜尋空間", "可進化範圍 + 護欄", CLAUDE], ["② 大規模探索", "iter22 · 8 次崩潰", OE], ["③ 分析與調整", "診斷 → 改框架", CLAUDE]];
cyc.forEach((c, i) => {
  const x = 0.6 + i * 4.25;
  card(s, x, 4.35, 3.6, 1.45, WHITE);
  s.addText(c[0], { x: x + 0.2, y: 4.55, w: 3.2, h: 0.5, fontFace: HF, fontSize: 15, bold: true, color: c[2], margin: 0 });
  s.addText(c[1], { x: x + 0.2, y: 5.05, w: 3.2, h: 0.6, fontFace: BF, fontSize: 12.5, color: MUTE, margin: 0 });
  if (i < 2) arrow(s, x + 3.62, 4.65, 0.6, NAVY);
});
s.addText("↺ 不是誰比較強，是不同物種、各補一塊——Claude 精準設計但不會盲搜，OpenEvolve 盲搜但不懂自己找到了什麼。", { x: 0.6, y: 6.05, w: 12.15, h: 0.6, fontFace: BF, fontSize: 13.5, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "Claude 搭框架 src/tools/tool_loader.py（77 AST / 120 沙箱）· OpenEvolve 在 evolvable_tools.py:18-58 EVOLVE-BLOCK 內探索");

// ============================================================ S7 自主 vs 護欄 + 憲法
s = p.addSlide();
header(s, "Part 1 · 協作架構", "自主越高、護欄越強 ＋ 安全憲法");
const gv = [
  ["層", "自主做什麼", "護欄是什麼"],
  ["我（Human）", "最終決策", "自己的判斷、領域知識"],
  ["Claude", "實作 + 分析", "我的 review、git PR flow、誠實回報"],
  ["OpenEvolve LLM", "突變 + 發明", "Failure Taxonomy（clamp / sandbox）"],
];
const rc = [HUMAN, CLAUDE, OE];
const td = [];
for (let ri = 0; ri < gv.length; ri++) {
  const row = [];
  for (let ci = 0; ci < 3; ci++) {
    row.push({
      text: gv[ri][ci],
      options: {
        fontFace: ri === 0 ? HF : (ci === 0 ? HF : BF), fontSize: ri === 0 ? 15 : 14.5,
        bold: ri === 0 || ci === 0,
        color: ri === 0 ? WHITE : (ci === 0 ? rc[ri - 1] : INK),
        fill: { color: ri === 0 ? NAVY : (ri % 2 ? WHITE : LIGHT) },
        align: "left", valign: "middle",
      },
    });
  }
  td.push(row);
}
s.addTable(td, { x: 0.6, y: 2.05, w: 12.15, colW: [3.0, 3.4, 5.75], rowH: [0.55, 0.82, 0.82, 0.82], border: { pt: 1, color: "E2E8F0" } });
card(s, 0.6, 5.55, 12.15, 1.35, NAVY);
s.addText("安全憲法", { x: 0.95, y: 5.7, w: 11, h: 0.4, fontFace: BF, fontSize: 13, bold: true, color: ICE, charSpacing: 2, margin: 0 });
s.addText("我越是放手讓它自主，越要先建好「最壞 = 優雅退化，絕不是災難性崩潰」的護欄。", { x: 0.95, y: 6.1, w: 11.5, h: 0.6, fontFace: HF, fontSize: 18, bold: true, color: AMBER, margin: 0 });
codeRef(s, "護欄落地：retrieval_executor.py:53 normalize_policy（clamp）· tool_loader.py:77-177（AST→沙箱→包裝）");

// ============================================================ S8 舞台
s = p.addSlide();
header(s, "Part 2 · 問題", "舞台：競賽任務 + CrewAI + OpenEvolve");
s.addText([
  { text: "Track 1：", options: { bold: true, color: NAVY } },
  { text: "預測某用戶對某商家的 ", options: { color: INK } },
  { text: "{stars, review}", options: { fontFace: CF, bold: true, color: BLUE } },
  { text: "　fitness = overall_quality =（評分準度 + 文字相似度）/ 2", options: { color: INK } },
], { x: 0.6, y: 1.9, w: 12.15, h: 0.4, fontFace: BF, fontSize: 15, margin: 0 });
const ag = [["data_retriever", "查 / 萃取資料"], ["psychological_analyst", "分析偏好 · 評分習慣"], ["behavior_simulator", "產出 {stars, review}"]];
ag.forEach((a, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.6, 3.6, 1.7);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.6, w: 3.6, h: 0.12, fill: { color: BLUE } });
  s.addText(a[0], { x: x + 0.22, y: 2.95, w: 3.2, h: 0.6, fontFace: CF, fontSize: 13.5, bold: true, color: NAVY, margin: 0 });
  s.addText(a[1], { x: x + 0.22, y: 3.5, w: 3.2, h: 0.6, fontFace: BF, fontSize: 13, color: MUTE, margin: 0 });
  if (i < 2) s.addText("→", { x: x + 3.62, y: 3.0, w: 0.5, h: 0.9, fontFace: HF, fontSize: 26, bold: true, color: AMBER, align: "center", margin: 0 });
});
s.addText("CrewAI 三代理流水線（Process.sequential）— 前一棒輸出是後一棒 context", { x: 0.6, y: 4.5, w: 12, h: 0.4, fontFace: BF, fontSize: 13.5, italic: true, color: BLUE, margin: 0 });
card(s, 0.6, 5.1, 12.15, 1.55, NAVY);
s.addText("OpenEvolve = 用 LLM 反覆「突變 → 評分 → 選擇」", { x: 0.95, y: 5.3, w: 11.5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: WHITE, margin: 0 });
s.addText("MAP-Elites 資料庫 · Island 多島模型 · EVOLVE-BLOCK 標記 · combined_score 當 fitness。核心問題：如何讓系統「自己設計自己」，又不讓它把自己改壞？", { x: 0.95, y: 5.75, w: 11.5, h: 0.8, fontFace: BF, fontSize: 13.5, color: ICE, margin: 0 });
codeRef(s, "evaluator.py:96 evaluate · :106-108 fitness ｜ simulation_crew.py:42-89 三代理 ｜ openevolve_config.yaml:10-88");

// ============================================================ S9 事故現場
s = p.addSlide();
header(s, "Part 2 · 問題", "事故現場：進化把自己改崩了");
s.addText("在先前一次「沒有防護」的進化實驗裡，agent prompt 的突變導致工具呼叫失效 → 整條流程崩潰", { x: 0.6, y: 1.9, w: 12.15, h: 0.4, fontFace: BF, fontSize: 15.5, color: INK, margin: 0 });
s.addChart(p.charts.LINE, [
  { name: "combined_score", labels: ["it0", "it1", "it2", "it3", "it4", "it5", "it6", "it7", "it8", "it9", "it10"],
    values: [0.28, 0.28, 0.65, 0.55, 0.60, 0.35, 0.71, 0.35, 0.35, 0.79, 0.35] },
], {
  x: 0.6, y: 2.5, w: 8.0, h: 4.1, chartColors: [BLUE], lineSize: 3, lineSmooth: false,
  lineDataSymbol: "circle", lineDataSymbolSize: 7,
  valAxisMinVal: 0, valAxisMaxVal: 1, valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  catAxisLabelColor: MUTE, valAxisLabelColor: MUTE, showLegend: false,
});
card(s, 8.9, 2.6, 3.85, 3.9, NAVY);
s.addText("0.35", { x: 9.1, y: 2.9, w: 3.4, h: 0.9, fontFace: HF, fontSize: 52, bold: true, color: AMBER, margin: 0 });
s.addText("保底分數（fallback）", { x: 9.15, y: 3.85, w: 3.4, h: 0.4, fontFace: BF, fontSize: 13, color: ICE, margin: 0 });
s.addText("那次約 36% 的迭代反覆掉到這地板——工具呼叫一壞，預測流程整個垮掉。", { x: 9.15, y: 4.35, w: 3.45, h: 1.9, fontFace: BF, fontSize: 13.5, color: WHITE, valign: "top", margin: 0 });
codeRef(s, "openevolve_evaluator.py:133-137 timeout fallback · :179-184 exception fallback（都回 _result(0.0)）");

// ============================================================ S10 接縫：好問題 → 失敗分類學
s = p.addSlide();
header(s, "Part 2 · 接縫", "協作模式 ①：Claude 的「失敗分類學」");
s.addText([
  { text: "「失敗分類學」＝", options: { bold: true, color: NAVY } },
  { text: "與其工具一壞就頭痛醫頭，Claude 先把「工具呼叫會怎麼壞」分門別類成 5 種失敗模式，每一層各配一種防護。", options: { color: INK } },
], { x: 0.6, y: 1.62, w: 12.15, h: 0.4, fontFace: BF, fontSize: 13.5, margin: 0 });
card(s, 0.6, 2.12, 4.5, 4.2, "EAF0FA");
s.addText("我問的好問題", { x: 0.85, y: 2.3, w: 4.0, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: HUMAN, margin: 0 });
s.addText("「怎麼讓 agent 安全進化、用不同工具、甚至創造新工具，而不在工具呼叫上崩潰？」", { x: 0.85, y: 2.78, w: 4.0, h: 2.4, fontFace: HF, fontSize: 17, italic: true, color: NAVY, lineSpacing: 28, margin: 0 });
s.addText("不是「幫我修 bug」，而是往深處逼的設計問題。", { x: 0.85, y: 5.55, w: 4.0, h: 0.7, fontFace: BF, fontSize: 12.5, color: MUTE, margin: 0 });
const tax = [
  ["L1", "呼叫協議", "呼叫工具的文字格式被改壞", RED],
  ["L2", "參數正確性", "參數（query_type）亂填", AMBER],
  ["L3", "呼叫策略", "「不查了，直接猜」", AMBER],
  ["L4", "結果消化", "上千筆 review 不知怎麼取樣", BLUE],
  ["L5", "下游契約", "傳給下一棒的摘要爛掉", BLUE],
];
tax.forEach((t, i) => {
  const y = 2.12 + i * 0.72;
  card(s, 5.3, y, 7.45, 0.62);
  s.addShape(p.shapes.RECTANGLE, { x: 5.3, y, w: 0.1, h: 0.62, fill: { color: t[3] } });
  s.addText(t[0], { x: 5.5, y, w: 0.8, h: 0.62, fontFace: CF, fontSize: 15, bold: true, color: t[3], valign: "middle", margin: 0 });
  s.addText(t[1], { x: 6.3, y, w: 2.2, h: 0.62, fontFace: HF, fontSize: 13.5, bold: true, color: NAVY, valign: "middle", margin: 0 });
  s.addText(t[2], { x: 8.55, y, w: 4.05, h: 0.62, fontFace: BF, fontSize: 12, color: INK, valign: "middle", margin: 0 });
});
s.addText("好處：進化改壞其中任何一層，最壞只是退化、不是整個崩潰。關鍵洞察——fitness 只告訴你「壞了」，不告訴你「哪裡壞了」；分層才能對症下藥。", { x: 5.3, y: 5.78, w: 7.45, h: 0.75, fontFace: BF, fontSize: 11.5, italic: true, color: BLUE, lineSpacing: 16, margin: 0 });
codeRef(s, "落地 src/tools/{interaction_tool_wrapper,retrieval_executor,tool_loader}.py");

// ============================================================ S11 協議/策略分離
s = p.addSlide();
header(s, "Part 3 · 解法", "設計原則：協議 / 策略分離");
card(s, 0.6, 2.0, 12.15, 1.9, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 2.0, w: 0.12, h: 1.9, fill: { color: NAVY } });
s.addText("協議層（Protocol）— 凍結、不准進化亂改", { x: 0.95, y: 2.18, w: 11.6, h: 0.5, fontFace: HF, fontSize: 18, bold: true, color: NAVY, margin: 0 });
s.addText("「工具怎麼被呼叫」：函式簽名、參數格式、回傳格式、註冊機制", { x: 0.95, y: 2.72, w: 11.6, h: 0.5, fontFace: BF, fontSize: 14, color: INK, margin: 0 });
s.addText([
  { text: "例：", options: { bold: true, color: NAVY } },
  { text: "「只能查 user / item / review 這幾種資料」——固定不變，誰都不能改。", options: { color: INK } },
], { x: 0.95, y: 3.25, w: 11.6, h: 0.5, fontFace: BF, fontSize: 14, italic: true, margin: 0 });
card(s, 0.6, 4.1, 12.15, 1.9, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 4.1, w: 0.12, h: 1.9, fill: { color: AMBER } });
s.addText("策略層（Policy）— 自由進化", { x: 0.95, y: 4.28, w: 11.6, h: 0.5, fontFace: HF, fontSize: 18, bold: true, color: AMBER, margin: 0 });
s.addText("「工具被怎麼使用」：查哪幾種、查幾筆、何時查、怎麼消化、甚至需要什麼新工具", { x: 0.95, y: 4.82, w: 11.6, h: 0.5, fontFace: BF, fontSize: 14, color: INK, margin: 0 });
s.addText([
  { text: "例：", options: { bold: true, color: "B5791F" } },
  { text: "「這一輪查 user + review、各取 15 筆、按最近排序」——放手讓進化去試。", options: { color: INK } },
], { x: 0.95, y: 5.35, w: 11.6, h: 0.5, fontFace: BF, fontSize: 14, italic: true, margin: 0 });
s.addText("好比插座：插座規格是「協議」（固定），要插什麼電器是「策略」（自由）——形狀統一，用法無限。", { x: 0.6, y: 6.25, w: 12.15, h: 0.4, fontFace: BF, fontSize: 14, italic: true, color: BLUE, margin: 0 });
codeRef(s, "協議 retrieval_executor.py:28-30 ALLOWED_QUERIES/STRATEGIES（凍結）｜ 策略 agents_evolving.yaml:11-16 retrieval_policy");

// ============================================================ S12 三層總覽 + L0
s = p.addSlide();
header(s, "Part 3 · 解法", "三層解法總覽 ＋ L0 可觀測性");
const lay = [
  ["L0", "看得見", "工具呼叫可觀測性 — 把盲區變訊號", GREEN],
  ["L1", "安全地用", "把工具呼叫從 LLM 拿走 → 確定性 executor", BLUE],
  ["L2", "安全地造", "讓進化發明新工具 — 四道關卡沙箱", NAVY],
];
lay.forEach((l, i) => {
  const y = 1.95 + i * 1.15;
  card(s, 0.6, y, 12.15, 1.0);
  chip(s, 0.9, y + 0.25, l[0][1], l[3]);
  s.addText(l[0], { x: 1.55, y: y + 0.12, w: 1.5, h: 0.45, fontFace: HF, fontSize: 20, bold: true, color: l[3], margin: 0 });
  s.addText(l[1], { x: 1.55, y: y + 0.56, w: 1.8, h: 0.35, fontFace: BF, fontSize: 12, color: MUTE, margin: 0 });
  s.addText(l[2], { x: 3.6, y, w: 9.0, h: 1.0, fontFace: BF, fontSize: 15, color: INK, valign: "middle", margin: 0 });
});
card(s, 0.6, 5.5, 12.15, 1.35, "EAF7F0");
s.addText([
  { text: "L0 細節　", options: { bold: true, color: GREEN } },
  { text: "thread-safe 呼叫日誌（query_type, ok）→ evaluator 整理成 artifacts → 下一輪突變 prompt 看得到「missing_essential: [user]」這種診斷。純觀測增量、預設行為不變。", options: { color: INK } },
], { x: 0.95, y: 5.5, w: 11.5, h: 1.35, fontFace: BF, fontSize: 13.5, valign: "middle", lineSpacing: 20, margin: 0 });
codeRef(s, "interaction_tool_wrapper.py:21 _record · :26 drain_tool_log ｜ openevolve_evaluator.py:31 _summarize_tool_use");

// ============================================================ S13 L1 clamp + whitelist
s = p.addSlide();
header(s, "Part 3 · L1", "L1：clamp executor ＋「白名單 ≠ 沒有進化空間」");
card(s, 0.6, 2.0, 6.0, 4.1, "11183B");
s.addText([
  { text: "retrieval_policy:", options: { color: ICE, breakLine: true } },
  { text: "  queries: [user, item,", options: { color: WHITE, breakLine: true } },
  { text: "            review_by_user]", options: { color: WHITE, breakLine: true } },
  { text: "  review_sampling:", options: { color: WHITE, breakLine: true } },
  { text: "    strategy: recent", options: { color: WHITE, breakLine: true } },
  { text: "    k: 15", options: { color: WHITE, breakLine: true } },
  { text: "  max_chars_per_result: 6000", options: { color: WHITE } },
], { x: 0.9, y: 2.35, w: 5.5, h: 3.4, fontFace: CF, fontSize: 14, lineSpacing: 26, margin: 0 });
card(s, 6.9, 2.0, 5.85, 4.1);
s.addText("clamp, don't reject", { x: 7.2, y: 2.25, w: 5.3, h: 0.4, fontFace: HF, fontSize: 18, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "非法值投影回合法空間，", options: { color: INK } },
  { text: "永不 raise", options: { bold: true, color: GREEN } },
  { text: "。k=999999→50 · 亂掰 query→過濾 · 整個爛掉→退預設。", options: { color: INK } },
], { x: 7.2, y: 2.75, w: 5.3, h: 1.4, fontSize: 14, lineSpacing: 22, margin: 0 });
s.addShape(p.shapes.RECTANGLE, { x: 7.2, y: 4.35, w: 5.3, h: 0.02, fill: { color: "E2E8F0" } });
s.addText([
  { text: "白名單 ≠ 沒空間：", options: { bold: true, color: AMBER, breakLine: true } },
  { text: "ALLOWED_QUERIES 是「字母表」，policy 是「拼出的句子」。26 字母固定，能寫無限句子。真正的天花板是資料集，不是白名單。", options: { color: INK } },
], { x: 7.2, y: 4.5, w: 5.3, h: 1.5, fontSize: 13, lineSpacing: 19, valign: "top", margin: 0 });
codeRef(s, "retrieval_executor.py:44 _clamp_int · :53 normalize_policy · :29 ALLOWED_QUERIES · :140 execute_policy");

// ============================================================ S14 L1 接線
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

// ============================================================ S15 L2 四關卡
s = p.addSlide();
header(s, "Part 3 · L2", "L2：四道關卡沙箱 ＋ docstring 共同進化");
const gates = [
  ["1", "AST 安全掃描", "擋 import / open / exec / dunder"],
  ["2", "簽名約定", "只認 tool_* + (kit, user_id, item_id)"],
  ["3", "沙箱試跑", "5s timeout，壞工具靜默丟棄"],
  ["4", "包裝註冊", "docstring → agent 看到的工具說明"],
];
gates.forEach((g, i) => {
  const x = 0.6 + (i % 2) * 6.15, y = 1.95 + Math.floor(i / 2) * 1.5;
  card(s, x, y, 5.9, 1.3);
  chip(s, x + 0.28, y + 0.4, g[0], NAVY);
  s.addText(g[1], { x: x + 0.95, y: y + 0.18, w: 4.7, h: 0.5, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText(g[2], { x: x + 0.95, y: y + 0.65, w: 4.7, h: 0.55, fontFace: BF, fontSize: 12.5, color: MUTE, margin: 0 });
});
card(s, 0.6, 5.0, 12.15, 1.65, "FBF1E0");
s.addText([
  { text: "兩個重點　", options: { bold: true, color: "B5791F" } },
  { text: "①「docstring 共同進化」：含糊 docstring → agent 不呼叫 → 零 fitness → 淘汰，可被發現性受進化壓力。② 工具裝在「決策點」psychological_analyst（不是 data_retriever，免得把 L1 剛清掉的崩潰風險請回來）。ReadOnlyKit 只暴露 get_user/get_item/get_reviews。", options: { color: INK } },
], { x: 0.95, y: 5.1, w: 11.5, h: 1.5, fontFace: BF, fontSize: 13, valign: "middle", lineSpacing: 19, margin: 0 });
codeRef(s, "tool_loader.py:77/:106/:120/:156 四關卡 · :60 ReadOnlyKit · :164 docstring ｜ simulation_crew.py:53-62 裝給 analyst");

// ============================================================ S16 #7 train/val
s = p.addSlide();
header(s, "Part 4 · 可信機制", "Train / Val 切分：過擬合照妖鏡");
s.addText("進化會「背答案」——對那幾個 train task 特化但不泛化。disjoint holdout 揪出它。", { x: 0.6, y: 1.95, w: 12, h: 0.4, fontFace: BF, fontSize: 15, color: INK, margin: 0 });
card(s, 0.6, 2.7, 5.95, 3.4, "F7E9E7");
s.addText("過擬合（假冠軍）", { x: 0.9, y: 2.95, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "train  0.90", options: { fontFace: CF, fontSize: 20, bold: true, color: INK, breakLine: true } },
  { text: "holdout  0.40", options: { fontFace: CF, fontSize: 20, bold: true, color: RED, breakLine: true } },
  { text: "差距 0.50 → 🚨 警報", options: { color: RED, bold: true } },
], { x: 0.9, y: 3.6, w: 5.4, h: 2, fontSize: 15, lineSpacing: 30, margin: 0 });
card(s, 6.8, 2.7, 5.95, 3.4, "E7F2EC");
s.addText("真泛化（可信）", { x: 7.1, y: 2.95, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "train  0.75", options: { fontFace: CF, fontSize: 20, bold: true, color: INK, breakLine: true } },
  { text: "holdout  0.72", options: { fontFace: CF, fontSize: 20, bold: true, color: GREEN, breakLine: true } },
  { text: "差距 0.03 → ✅ 真的學會了", options: { color: GREEN, bold: true } },
], { x: 7.1, y: 3.6, w: 5.4, h: 2, fontSize: 15, lineSpacing: 30, margin: 0 });
s.addText("make validate-holdout — disjoint 已驗證 overlap = 0", { x: 0.6, y: 6.45, w: 12, h: 0.4, fontFace: CF, fontSize: 13, color: MUTE, margin: 0 });
codeRef(s, "evaluator.py:83-84 OPENEVOLVE_TASK_DIR · scripts/validate_holdout.py:25 切 holdout · create_sampled_dataset.py:8 disjoint");

// ============================================================ S17 #6 MAP-Elites
s = p.addSlide();
header(s, "Part 4 · 可信機制", "MAP-Elites 自訂維度");
s.addText("單一 combined_score 會把兩種極端高手壓成中間值而淘汰。改用兩個分項當 diversity 維度。", { x: 0.6, y: 1.95, w: 12, h: 0.4, fontFace: BF, fontSize: 15, color: INK, margin: 0 });
s.addChart(p.charts.SCATTER, [
  { name: "X", values: [0.3, 0.8, 0.5, 0.9, 0.4, 0.7, 0.6] },
  { name: "elites", values: [0.85, 0.35, 0.6, 0.7, 0.5, 0.8, 0.55] },
], {
  x: 0.6, y: 2.6, w: 6.6, h: 4.0, chartColors: [AMBER], lineSize: 0,
  lineDataSymbol: "circle", lineDataSymbolSize: 13,
  catAxisTitle: "preference_estimation →", showCatAxisTitle: true,
  valAxisTitle: "review_generation →", showValAxisTitle: true,
  catAxisMinVal: 0, catAxisMaxVal: 1, valAxisMinVal: 0, valAxisMaxVal: 1,
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { color: "E2E8F0", size: 0.5 },
  catAxisLabelColor: MUTE, valAxisLabelColor: MUTE, showLegend: false,
});
card(s, 7.5, 2.7, 5.25, 3.9, NAVY);
s.addText("fitness vs feature", { x: 7.8, y: 2.95, w: 4.7, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: AMBER, margin: 0 });
s.addText([
  { text: "combined_score", options: { fontFace: CF, bold: true, color: ICE } },
  { text: " 決定誰勝出（fitness）", options: { color: WHITE, breakLine: true } },
  { text: "preference × review", options: { fontFace: CF, bold: true, color: ICE } },
  { text: " 只決定座標（多樣性）", options: { color: WHITE } },
], { x: 7.8, y: 3.5, w: 4.7, h: 1.6, fontSize: 13.5, lineSpacing: 22, margin: 0 });
s.addText("保留 trade-off 前沿各路精英，雜交出兼顧者。", { x: 7.8, y: 5.3, w: 4.7, h: 1, fontFace: BF, fontSize: 13.5, italic: true, color: ICE, margin: 0 });
codeRef(s, "config/openevolve_config.yaml:85-88 feature_dimensions（8×8）· openevolve_evaluator.py:47-59 _result(extra_metrics)");

// ============================================================ S18 誠實抓 bug
s = p.addSlide();
header(s, "Part 5 · 協作模式", "協作模式 ②：誠實回報，分數健康 ≠ 功能正確");
card(s, 0.6, 1.95, 5.95, 2.5, "F7E9E7");
s.addText("看似完美", { x: 0.9, y: 2.15, w: 5, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "combined_score = ", options: { fontFace: CF, fontSize: 15, bold: true, color: INK } },
  { text: "0.8452", options: { fontFace: CF, fontSize: 24, bold: true, color: RED, breakLine: true } },
  { text: "分數漂亮，沒人會起疑。", options: { color: MUTE } },
], { x: 0.9, y: 2.65, w: 5.4, h: 1.6, lineSpacing: 28, margin: 0 });
card(s, 6.8, 1.95, 5.95, 2.5, "E7F2EC");
s.addText("Claude 主動驗證", { x: 7.1, y: 2.15, w: 5, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "直接查 agent.tools → 發現是 ", options: { color: INK } },
  { text: "[]", options: { fontFace: CF, fontSize: 18, bold: true, color: RED, breakLine: true } },
  { text: "兩個真 bug：_safe_import 移除 / @tool 需要 docstring → graceful [] 把失敗藏起來。", options: { color: INK } },
], { x: 7.1, y: 2.65, w: 5.4, h: 1.7, fontSize: 13, lineSpacing: 20, margin: 0 });
card(s, 0.6, 4.65, 12.15, 1.5, NAVY);
s.addText("“ 分數健康 ≠ 功能正確 ”", { x: 0.95, y: 4.8, w: 11.5, h: 0.6, fontFace: HF, fontSize: 24, bold: true, color: AMBER, margin: 0 });
s.addText("graceful fallback 會讓「沒裝上工具」偽裝成「分數正常」。驗證要查功能本身（tools 清單），不能只看分數。", { x: 0.95, y: 5.45, w: 11.5, h: 0.6, fontFace: BF, fontSize: 14, color: WHITE, margin: 0 });
codeRef(s, "tool_loader.py:139-146 _safe_import · :164 docstring · simulation_crew.py:21-30 graceful [] · tests/test_tool_loader.py:185-203");

// ============================================================ S19 ③④ 把關 + 知識互補
s = p.addSlide();
header(s, "Part 5 · 協作模式", "協作模式 ③④：把關不可逆 ＋ 知識互補");
card(s, 0.6, 2.1, 5.95, 4.0, "F7ECEC");
s.addText("③ 我把關不可逆操作", { x: 0.9, y: 2.35, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "Claude 先問我，再做：", options: { color: INK, breakLine: true } },
  { text: "merge PR · brew install · 改系統設定 · 建新 GitHub repo · 裝 LibreOffice", options: { fontFace: CF, fontSize: 12.5, color: NAVY, breakLine: true } },
  { text: "把關「不可逆」是我這一層的核心職責。", options: { color: INK } },
], { x: 0.9, y: 2.95, w: 5.4, h: 2.8, fontSize: 14, lineSpacing: 24, margin: 0 });
card(s, 6.8, 2.1, 5.95, 4.0, "EAF0FA");
s.addText("④ 人機知識互補", { x: 7.1, y: 2.35, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: CLAUDE, margin: 0 });
s.addText([
  { text: "我補 Claude：", options: { bold: true, color: HUMAN } },
  { text: "「Mac 闔蓋會中斷背景進程」（環境知識）", options: { color: INK, breakLine: true } },
  { text: "Claude 補我：", options: { bold: true, color: CLAUDE } },
  { text: "解釋 caffeinate、幫我設定（防睡眠但讓螢幕休息）（工具細節）", options: { color: INK } },
], { x: 7.1, y: 2.95, w: 5.4, h: 2.8, fontSize: 14, lineSpacing: 24, margin: 0 });
s.addText("兩種知識互補，缺一進化就跑不完。", { x: 0.6, y: 6.25, w: 12, h: 0.4, fontFace: BF, fontSize: 14, italic: true, color: NAVY, align: "center", margin: 0 });

// ============================================================ S20 ⑤ 分層委派
s = p.addSlide();
header(s, "Part 5 · 協作模式", "協作模式 ⑤：分層委派自主（最核心）");
s.addText("我請 Claude 為 OpenEvolve 搭安全框架（L0/L1/L2）——框架到位，我才敢放手。回扣安全憲法。", { x: 0.6, y: 2.0, w: 12, h: 0.6, fontFace: BF, fontSize: 16, color: INK, margin: 0 });
card(s, 0.6, 2.9, 5.95, 2.9, "F7E9E7");
s.addText("沒防護的先前實驗", { x: 0.9, y: 3.15, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([{ text: "36%", options: { fontFace: HF, fontSize: 52, bold: true, color: RED, breakLine: true } }, { text: "iteration 崩潰", options: { color: INK } }], { x: 0.9, y: 3.7, w: 5.4, h: 1.8, lineSpacing: 36, margin: 0 });
card(s, 6.8, 2.9, 5.95, 2.9, "E7F2EC");
s.addText("完整架構", { x: 7.1, y: 3.15, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([{ text: "0", options: { fontFace: HF, fontSize: 52, bold: true, color: GREEN, breakLine: true } }, { text: "次工具呼叫崩潰", options: { color: INK } }], { x: 7.1, y: 3.7, w: 5.4, h: 1.8, lineSpacing: 36, margin: 0 });
s.addText("我委派自主性的前提，是先建好「最壞只是退化」的護欄。", { x: 0.6, y: 6.1, w: 12.15, h: 0.5, fontFace: HF, fontSize: 18, bold: true, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "三層護欄 interaction_tool_wrapper.py(L0) · retrieval_executor.py(L1) · tool_loader.py(L2)");

// ============================================================ S21 五模式總表
s = p.addSlide();
header(s, "Part 5 · 協作模式", "五個協作模式 · 一頁回顧");
const pat = [
  ["1", "提問深化設計", "我的開放問題 → 失敗分類學"],
  ["2", "誠實回報抓 bug", "agent.tools == [] 被主動揭露"],
  ["3", "我把關不可逆", "merge / brew / 建 repo 先問再做"],
  ["4", "人機知識互補", "我的環境知識 × Claude 的工具細節"],
  ["5", "分層委派自主", "先搭護欄，才放手讓它進化"],
];
pat.forEach((r, i) => {
  const y = 1.9 + i * 0.98;
  card(s, 0.6, y, 12.15, 0.84);
  chip(s, 0.85, y + 0.17, r[0], NAVY);
  s.addText(r[1], { x: 1.55, y, w: 3.6, h: 0.84, fontFace: HF, fontSize: 16, bold: true, color: NAVY, valign: "middle", margin: 0 });
  s.addText(r[2], { x: 5.3, y, w: 7.3, h: 0.84, fontFace: BF, fontSize: 14.5, color: INK, valign: "middle", margin: 0 });
});
s.addText("💬 哪一個模式，你明天就能用在自己的專案？", { x: 0.6, y: 6.78, w: 12, h: 0.3, fontFace: BF, fontSize: 14, italic: true, color: AMBER, margin: 0 });

// ============================================================ S22 三層產物 + formula
s = p.addSlide();
header(s, "Part 6 · 高潮", "iter22：三層協作的湧現產物");
const contrib = [
  ["我（Human）", "決定跑 50 iter\n設 caffeinate 跑整夜", HUMAN],
  ["Claude", "搭 L0/L1/L2 框架\n啟動進化、分析", CLAUDE],
  ["OpenEvolve", "進化出 iter22\n量化公式（0.842）", OE],
];
contrib.forEach((c, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.0, 3.85, 2.3);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.0, w: 3.85, h: 0.12, fill: { color: c[2] } });
  s.addText(c[0], { x: x + 0.25, y: 2.3, w: 3.35, h: 0.5, fontFace: HF, fontSize: 16, bold: true, color: c[2], margin: 0 });
  s.addText(c[1], { x: x + 0.25, y: 2.85, w: 3.4, h: 1.3, fontFace: BF, fontSize: 13.5, color: INK, lineSpacing: 20, margin: 0 });
});
card(s, 0.6, 4.6, 12.15, 2.05, "11183B");
s.addText("iter22 公式（節錄）— 沒人教它，三層協作才長得出來", { x: 0.9, y: 4.75, w: 11, h: 0.4, fontFace: HF, fontSize: 14, bold: true, color: AMBER, margin: 0 });
s.addText([
  { text: "if user_std < 0.7:  predicted = user_mean + 0.55·(item_mean − user_mean)", options: { color: WHITE, breakLine: true } },
  { text: "elif < 1.0: +0.45·…   elif < 1.3: +0.30·…   else: user_median + 0.20·…", options: { color: ICE, breakLine: true } },
  { text: "clamp [1,5] · round 0.5", options: { color: WHITE } },
], { x: 0.9, y: 5.2, w: 11.5, h: 1.3, fontFace: CF, fontSize: 13, lineSpacing: 22, margin: 0 });
codeRef(s, "進化目標檔 config/agents_evolving.yaml EVOLVE-BLOCK");

// ============================================================ S23 iter22 之後
s = p.addSlide();
header(s, "Part 6 · 高潮", "iter22「之後」深挖：局部最優");
s.addText("我請 Claude 追了 iter22 的所有衍生子代——結論：之後再沒有更好的後代。", { x: 0.6, y: 1.95, w: 12.15, h: 0.5, fontFace: BF, fontSize: 16, color: INK, margin: 0 });
const aft = [
  ["over-engineering", "4 段公式 → 5、6 段，加更多參數"],
  ["分項此消彼長", "preference 微幅波動，review_generation 反而退化 → 分數停滯"],
  ["三島趨同", "OpenEvolve 把族群分成 3 個獨立演化的「島」；遷移又把 iter22 基因散到三島 → 多樣性塌掉"],
];
aft.forEach((a, i) => {
  const y = 2.6 + i * 1.0;
  card(s, 0.6, y, 12.15, 0.88);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 0.88, fill: { color: OE } });
  s.addText(a[0], { x: 0.95, y, w: 3.2, h: 0.88, fontFace: HF, fontSize: 15, bold: true, color: "B5791F", valign: "middle", margin: 0 });
  s.addText(a[1], { x: 4.2, y, w: 8.4, h: 0.88, fontFace: BF, fontSize: 14, color: INK, valign: "middle", margin: 0 });
});
card(s, 0.6, 5.75, 12.15, 1.3, NAVY);
s.addText([
  { text: "Claude 給我的診斷：", options: { bold: true, color: AMBER } },
  { text: "iter22 是局部最優。OpenEvolve 能「找到」它，但「為什麼停在這、怎麼跳出去」是探勘者結構上做不到的——它沒有「局部最優」這個概念。", options: { color: WHITE } },
], { x: 0.95, y: 5.75, w: 11.5, h: 1.3, fontFace: BF, fontSize: 14, valign: "middle", lineSpacing: 21, margin: 0 });
codeRef(s, "島/遷移 config/openevolve_config.yaml:71-78（num_islands:3, migration）");

// ============================================================ S23b 怎麼跳出局部最優
s = p.addSlide();
header(s, "Part 6 · 高潮", "那要怎麼跳出局部最優？");
s.addText("跳出不是「再多跑幾代」（那只會把公式越加越複雜）——而是同時動三個旋鈕：", { x: 0.6, y: 1.62, w: 12.15, h: 0.4, fontFace: BF, fontSize: 13.5, color: BLUE, margin: 0 });
const fixes = [
  ["①", "加大 TASKS", "對治：fitness 訊號太弱", "每次 evaluate 用更多 task、擴大 train 樣本（資料源有 198 筆，目前只用 5）"],
  ["②", "島嶼種子多樣化", "對治：三島趨同", "不同設計哲學各 seed 一島；migration_interval 調長、migration_rate 調低"],
  ["③", "啟動工具進化", "對治：搜尋空間用盡", "讓 evolvable_tools.py 真正進化（＋ n_tools 維度）——給搜尋空間新原料"],
];
fixes.forEach((f, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.15, 3.85, 3.1);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.15, w: 3.85, h: 0.12, fill: { color: NAVY } });
  chip(s, x + 0.22, y_b(2.4), f[0], AMBER, NAVY);
  s.addText(f[1], { x: x + 0.85, y: 2.42, w: 2.85, h: 0.5, fontFace: HF, fontSize: 16, bold: true, color: NAVY, valign: "middle", margin: 0 });
  s.addText(f[2], { x: x + 0.25, y: 3.05, w: 3.4, h: 0.4, fontFace: BF, fontSize: 12.5, italic: true, color: RED, margin: 0 });
  s.addText(f[3], { x: x + 0.25, y: 3.55, w: 3.4, h: 1.5, fontFace: BF, fontSize: 13.5, color: INK, lineSpacing: 20, margin: 0 });
  s.addText("狀態：待辦", { x: x + 0.25, y: 4.85, w: 3.4, h: 0.3, fontFace: CF, fontSize: 11, color: MUTE, margin: 0 });
});
function y_b(v){return v;}
card(s, 0.6, 5.5, 12.15, 1.4, NAVY);
s.addText([
  { text: "配套（已就緒）：", options: { bold: true, color: AMBER } },
  { text: "holdout 照妖鏡確認進步是真泛化、MAP-Elites 把 review_generation 當維度保護文字品質。", options: { color: WHITE } },
  { text: "　前兩條治「卡在原地」，第三條給「新方向」。", options: { color: ICE } },
], { x: 0.95, y: 5.5, w: 11.5, h: 1.4, fontFace: BF, fontSize: 13.5, valign: "middle", lineSpacing: 21, margin: 0 });
codeRef(s, "加 task openevolve_evaluator.py:115 · 島/遷移 openevolve_config.yaml:71-78 · 工具進化 evolvable_tools.py:18-58");

// ============================================================ S24 失敗洞察
s = p.addSlide();
header(s, "Part 6 · 高潮", "連「失敗」也是協作的洞察");
s.addText("8 次低分崩潰 → 我請 Claude 爬梳資料歸因：", { x: 0.6, y: 2.1, w: 12, h: 0.5, fontFace: BF, fontSize: 18, color: INK, margin: 0 });
card(s, 0.6, 3.0, 5.95, 2.4, "F7E9E7");
s.addText([{ text: "5 次", options: { fontFace: HF, fontSize: 44, bold: true, color: RED, breakLine: true } }, { text: "YAML 語法壞掉", options: { color: INK } }, { text: "（full-rewrite 風險，繞過 clamp）", options: { fontSize: 12, color: MUTE } }], { x: 0.9, y: 3.3, w: 5.4, h: 1.9, lineSpacing: 30, margin: 0 });
card(s, 6.8, 3.0, 5.95, 2.4, "FBF1E0");
s.addText([{ text: "3 次", options: { fontFace: HF, fontSize: 44, bold: true, color: "B5791F", breakLine: true } }, { text: "rate limit 429", options: { color: INK } }, { text: "（NVIDIA NIM 限流）", options: { fontSize: 12, color: MUTE } }], { x: 7.1, y: 3.3, w: 5.4, h: 1.9, lineSpacing: 30, margin: 0 });
s.addText("協作不只產出成功，也共同理解失敗——成功與失敗，都是我們三層一起讀懂的。", { x: 0.6, y: 5.9, w: 12.15, h: 0.6, fontFace: HF, fontSize: 17, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "diff_based_evolution:false（full-rewrite 風險）見 openevolve_config.yaml:18");

// ============================================================ S25 什麼該誰做
s = p.addSlide();
header(s, "Part 7 · 反思", "什麼該誰做？");
const who = [
  ["我（Human）親自做", "方向 · 價值判斷\n不可逆決策 · 領域/物理知識", HUMAN],
  ["交給 Claude", "實作 · 驗證 · 分析\n文件 · 誠實回報", CLAUDE],
  ["交給進化（OpenEvolve）", "安全框架內的\n大規模探索與發明", OE],
];
who.forEach((c, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.2, 3.85, 3.0);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.2, w: 3.85, h: 0.14, fill: { color: c[2] } });
  s.addText(c[0], { x: x + 0.22, y: 2.5, w: 3.45, h: 0.8, fontFace: HF, fontSize: 16, bold: true, color: c[2], margin: 0 });
  s.addText(c[1], { x: x + 0.22, y: 3.4, w: 3.45, h: 1.6, fontFace: BF, fontSize: 15, color: INK, lineSpacing: 24, margin: 0 });
});
s.addText("我用三條判準分工：可逆性 · 是否需要價值判斷 · 搜尋空間大小。", { x: 0.6, y: 5.6, w: 12, h: 0.6, fontFace: HF, fontSize: 17, bold: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "對應：我→config/*.yaml ｜ Claude→src/ + tests/ ｜ 進化→EVOLVE-BLOCK（agents_evolving.yaml / evolvable_tools.py）");

// ============================================================ S26 Key Takeaways
s = p.addSlide();
header(s, "Part 7 · 反思", "Key Takeaways");
const tk = [
  "進化能設計 agent，但要防它把自己改壞 → 護欄越往內越強（最壞只是退化）",
  "協議 / 策略分離 + 優雅退化 = 可安全進化的地形",
  "誠實回報 + 人類把關不可逆 = 協作安全地基；分數健康 ≠ 功能正確",
  "好問題驅動好設計；連失敗都能共同理解；不盡信文件、讀原始碼",
];
tk.forEach((t, i) => {
  const y = 2.0 + i * 1.1;
  card(s, 0.6, y, 12.15, 0.95);
  chip(s, 0.9, y + 0.22, `${i + 1}`, AMBER, NAVY);
  s.addText(t, { x: 1.6, y, w: 11.0, h: 0.95, fontFace: BF, fontSize: 15.5, color: INK, valign: "middle", margin: 0 });
});
s.addText("💬 回到開場：你的 AI 是工具，還是夥伴？", { x: 0.6, y: 6.6, w: 12, h: 0.35, fontFace: BF, fontSize: 14, italic: true, color: AMBER, margin: 0 });

// ============================================================ S27 結語
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("謝謝 · Q & A", { x: 0.95, y: 1.9, w: 11.5, h: 1, fontFace: HF, fontSize: 42, bold: true, color: WHITE, margin: 0 });
s.addText("真正的產物不只是 0.842 的 agent——\n而是一套「人 + AI + 進化」安全協作的工作流。", { x: 1, y: 3.2, w: 11.5, h: 1.4, fontFace: HF, fontSize: 21, italic: true, color: ICE, lineSpacing: 34, margin: 0 });
chain.forEach((c, i) => {
  const x = 1.0 + i * 3.5;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 5.0, w: 2.6, h: 0.7, rectRadius: 0.08, fill: { color: c[1] } });
  s.addText(c[0], { x, y: 5.0, w: 2.6, h: 0.7, align: "center", valign: "middle", fontFace: HF, fontSize: 16, bold: true, color: WHITE, margin: 0 });
  if (i < 2) s.addText("▶", { x: x + 2.65, y: 5.0, w: 0.7, h: 0.7, align: "center", valign: "middle", fontFace: BF, fontSize: 14, color: AMBER, margin: 0 });
});
s.addText([
  { text: "資源　", options: { bold: true, color: AMBER } },
  { text: "docs/{collaboration_workflow_outline, teaching_slides_outline, unified_deck_outline, evolution_design_notes}.md", options: { color: ICE } },
], { x: 1, y: 6.3, w: 11.5, h: 0.6, fontFace: BF, fontSize: 13, margin: 0 });

p.writeFile({ fileName: "/tmp/deck/人AI進化_整合教學投影片.pptx" }).then(f => console.log("WROTE", f));
