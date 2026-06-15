const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";            // 13.33 x 7.5
p.author = "AgentSocietyChallenge_OpenEvolve";
p.title = "三層 AI 協作工作流";

// ---- palette ----
const NAVY = "1E2761", BLUE = "3A5BA0", ICE = "CADCFC";
const AMBER = "E8A33D", GREEN = "2E9E6B", RED = "C0453B";
const INK = "23272E", MUTE = "6B7280", LIGHT = "F4F7FB", WHITE = "FFFFFF";
const HF = "Georgia", BF = "Calibri", CF = "Consolas";
// role colors
const HUMAN = GREEN, CLAUDE = BLUE, OE = AMBER;
const W = 13.33, H = 7.5;

const sh = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 135, opacity: 0.12 });

function header(s, kicker, title) {
  s.background = { color: LIGHT };
  s.addShape(p.shapes.OVAL, { x: 0.55, y: 0.5, w: 0.16, h: 0.16, fill: { color: AMBER } });
  s.addText(kicker.toUpperCase(), { x: 0.8, y: 0.46, w: 11, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: BLUE, charSpacing: 2, margin: 0 });
  s.addText(title, { x: 0.55, y: 0.78, w: 12.2, h: 0.85, fontFace: HF, fontSize: 29, bold: true, color: NAVY, margin: 0 });
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

// ============================================================ 1 TITLE
let s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("HUMAN × CLAUDE CODE × OPENEVOLVE", { x: 1, y: 1.8, w: 11.5, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 3, margin: 0 });
s.addText("三層 AI 協作工作流", { x: 0.95, y: 2.25, w: 11.5, h: 1.3, fontFace: HF, fontSize: 46, bold: true, color: WHITE, margin: 0 });
s.addText("當 AI 也在指揮另一個 AI——我如何把自主性一層層往下委派", { x: 1, y: 3.85, w: 11.5, h: 0.6, fontFace: BF, fontSize: 19, color: ICE, margin: 0 });
// three-chip teaser chain
const chain = [["我", HUMAN], ["Claude", CLAUDE], ["OpenEvolve", OE]];
chain.forEach((c, i) => {
  const x = 1.0 + i * 3.7;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 5.2, w: 2.8, h: 0.8, rectRadius: 0.1, fill: { color: c[1] } });
  s.addText(c[0], { x, y: 5.2, w: 2.8, h: 0.8, align: "center", valign: "middle", fontFace: HF, fontSize: 18, bold: true, color: WHITE, margin: 0 });
  if (i < 2) s.addText("▶", { x: x + 2.85, y: 5.2, w: 0.8, h: 0.8, align: "center", valign: "middle", fontFace: BF, fontSize: 16, color: AMBER, margin: 0 });
});
s.addText("一場關於「人 + AI + 進化」安全協作的分享", { x: 1, y: 6.5, w: 11.5, h: 0.4, fontFace: BF, fontSize: 13, color: "8FA3C8", margin: 0 });

// ============================================================ 2 不尋常的協作
s = p.addSlide();
s.background = { color: LIGHT };
s.addShape(p.shapes.OVAL, { x: 0.55, y: 0.5, w: 0.16, h: 0.16, fill: { color: AMBER } });
s.addText("開場", { x: 0.8, y: 0.46, w: 11, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: BLUE, charSpacing: 2, margin: 0 });
s.addText("一個不尋常的協作", { x: 0.55, y: 0.78, w: 12.2, h: 0.85, fontFace: HF, fontSize: 29, bold: true, color: NAVY, margin: 0 });
s.addText("這個專案裡，有三個「智能體」在協作——不是一個人用一個工具。", { x: 0.6, y: 2.1, w: 12, h: 0.6, fontFace: BF, fontSize: 20, color: INK, margin: 0 });
card(s, 0.6, 3.1, 12.15, 2.0, NAVY);
s.addText([
  { text: "💬 想一個問題：", options: { bold: true, color: AMBER, breakLine: true } },
  { text: "你用 AI 時，是「你 + 工具」，", options: { color: WHITE } },
  { text: "還是「你 + 一個會自己做決定的夥伴」？", options: { color: ICE } },
], { x: 0.95, y: 3.45, w: 11.5, h: 1.4, fontFace: HF, fontSize: 24, lineSpacing: 38, valign: "middle", margin: 0 });
s.addText("這場分享，是後者——而且夥伴還帶著它自己的夥伴。", { x: 0.6, y: 5.5, w: 12, h: 0.6, fontFace: BF, fontSize: 17, italic: true, color: BLUE, margin: 0 });

// ============================================================ 3 議程 + 學習目標
s = p.addSlide();
header(s, "Agenda", "議程與學習目標");
const parts = [
  ["1", "協作架構", "三層嵌套 · 自主 vs 護欄"],
  ["2", "角色職責", "我 / Claude / OpenEvolve"],
  ["3", "五個協作模式", "可遷移到你的專案"],
  ["4", "高潮案例", "iter22 的誕生與之後"],
  ["5", "反思", "什麼該誰做"],
  ["6", "結語", "帶走一套工作流"],
];
parts.forEach((it, i) => {
  const x = 0.55 + (i % 3) * 4.15, y = 1.9 + Math.floor(i / 3) * 1.55;
  card(s, x, y, 3.9, 1.35);
  chip(s, x + 0.25, y + 0.25, it[0], NAVY);
  s.addText(it[1], { x: x + 0.9, y: y + 0.2, w: 2.85, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText(it[2], { x: x + 0.9, y: y + 0.62, w: 2.85, h: 0.6, fontFace: BF, fontSize: 12, color: MUTE, margin: 0 });
});
s.addText([
  { text: "我想帶給你的　", options: { bold: true, color: AMBER } },
  { text: "認識多層 AI 協作架構 · 學會配置「自主 vs 護欄」· 帶走 5 個協作模式 · 一條判準：什麼我做、什麼交給 AI、什麼交給進化", options: { color: INK } },
], { x: 0.55, y: 5.25, w: 12.2, h: 0.8, fontFace: BF, fontSize: 13.5, valign: "middle", margin: 0 });

// ============================================================ 4 三個角色登場
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

// ============================================================ 5 三層嵌套架構（核心圖）
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

// ============================================================ 5b 架構師 vs 探勘者（關係圖）
s = p.addSlide();
header(s, "Part 1 · 協作架構", "Claude × OpenEvolve：架構師 vs 探勘者");
// two role cards
card(s, 0.6, 1.95, 5.9, 1.95, "EAF0FA");
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 1.95, w: 0.12, h: 1.95, fill: { color: CLAUDE } });
s.addText("Claude＝架構師", { x: 0.9, y: 2.15, w: 5.4, h: 0.45, fontFace: HF, fontSize: 18, bold: true, color: CLAUDE, margin: 0 });
s.addText("有意圖的設計 · 知道「為什麼」\n少量 · 高槓桿 · 可解釋", { x: 0.9, y: 2.65, w: 5.4, h: 1.1, fontFace: BF, fontSize: 14, color: INK, lineSpacing: 22, margin: 0 });
card(s, 6.85, 1.95, 5.9, 1.95, "FBF1E0");
s.addShape(p.shapes.RECTANGLE, { x: 6.85, y: 1.95, w: 0.12, h: 1.95, fill: { color: OE } });
s.addText("OpenEvolve＝探勘者", { x: 7.15, y: 2.15, w: 5.4, h: 0.45, fontFace: HF, fontSize: 18, bold: true, color: "B5791F", margin: 0 });
s.addText("無意圖的突變 + 篩選 · 只知「是什麼」\n大量 · 低槓桿 · 靠數量", { x: 7.15, y: 2.65, w: 5.4, h: 1.1, fontFace: BF, fontSize: 14, color: INK, lineSpacing: 22, margin: 0 });
// cycle
const cyc = [["① 設計搜尋空間", "可進化範圍 + 護欄", CLAUDE], ["② 大規模探索", "iter22 · 8 次崩潰", OE], ["③ 分析與調整", "診斷 → 改框架", CLAUDE]];
cyc.forEach((c, i) => {
  const x = 0.6 + i * 4.25;
  card(s, x, 4.35, 3.6, 1.45, WHITE);
  s.addText(c[0], { x: x + 0.2, y: 4.55, w: 3.2, h: 0.5, fontFace: HF, fontSize: 15, bold: true, color: c[2], margin: 0 });
  s.addText(c[1], { x: x + 0.2, y: 5.05, w: 3.2, h: 0.6, fontFace: BF, fontSize: 12.5, color: MUTE, margin: 0 });
  if (i < 2) arrow(s, x + 3.62, 4.65, 0.6, NAVY);
});
s.addText("↺ 下一輪：用發現調整搜尋空間", { x: 0.6, y: 6.05, w: 12.15, h: 0.4, fontFace: BF, fontSize: 13, italic: true, color: NAVY, align: "center", margin: 0 });
s.addText("不是誰比較強，是不同物種、各補一塊——Claude 會精準設計但不會盲搜，OpenEvolve 會盲搜但不懂自己找到了什麼。", { x: 0.6, y: 6.55, w: 12.15, h: 0.5, fontFace: BF, fontSize: 13.5, color: INK, margin: 0 });

// ============================================================ 6 自主 vs 護欄
s = p.addSlide();
header(s, "Part 1 · 協作架構", "每層的「自主 vs 護欄」");
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
s.addTable(td, { x: 0.6, y: 2.1, w: 12.15, colW: [3.0, 3.4, 5.75], rowH: [0.6, 0.95, 0.95, 0.95], border: { pt: 1, color: "E2E8F0" } });
card(s, 0.6, 6.0, 12.15, 1.0, NAVY);
s.addText("金句：我越是放手讓它自主，越要先建好「最壞只是退化、不是崩潰」的護欄。", { x: 0.95, y: 6.0, w: 11.5, h: 1.0, fontFace: HF, fontSize: 18, bold: true, color: AMBER, valign: "middle", margin: 0 });

// ============================================================ 7 協作循環
s = p.addSlide();
header(s, "Part 1 · 協作架構", "協作循環：每個 PR、每個實驗都走一遍");
const ring = [
  ["我的意圖", HUMAN], ["Claude 實作", CLAUDE], ["驗證", CLAUDE],
  ["誠實報告", CLAUDE], ["我決策", HUMAN],
];
const cx = 6.66, cy = 4.25, radX = 3.95, radY = 1.85, cw = 2.4, ch = 0.85;
ring.forEach((r, i) => {
  const ang = -90 + i * (360 / ring.length);
  const rx = cx + radX * Math.cos(ang * Math.PI / 180) - cw / 2;
  const ry = cy + radY * Math.sin(ang * Math.PI / 180) - ch / 2;
  card(s, rx, ry, cw, ch, WHITE);
  s.addShape(p.shapes.RECTANGLE, { x: rx, y: ry, w: 0.1, h: ch, fill: { color: r[1] } });
  s.addText(r[0], { x: rx + 0.18, y: ry, w: cw - 0.25, h: ch, fontFace: HF, fontSize: 14.5, bold: true, color: r[1], valign: "middle", align: "center", margin: 0 });
});
s.addText("↻", { x: cx - 0.6, y: cy - 0.65, w: 1.2, h: 1.2, fontFace: HF, fontSize: 50, bold: true, color: AMBER, align: "center", valign: "middle", margin: 0 });
s.addText("（下一輪意圖）", { x: cx - 1.0, y: cy + 0.5, w: 2.0, h: 0.4, fontFace: BF, fontSize: 11, italic: true, color: MUTE, align: "center", margin: 0 });

// ============================================================ 8 為什麼值得學
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("為什麼這個架構值得學", { x: 1, y: 1.7, w: 11, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 2, margin: 0 });
s.addText("AI 越來越會\n「使用其他 AI / 工具」", { x: 0.95, y: 2.3, w: 11.5, h: 1.8, fontFace: HF, fontSize: 38, bold: true, color: WHITE, lineSpacing: 46, margin: 0 });
s.addText("協作不再是單層。我想用這個專案示範：如何安全地把自主性一層層往下委派。", { x: 1, y: 4.7, w: 11, h: 1, fontFace: BF, fontSize: 19, color: ICE, margin: 0 });

// ============================================================ 9 我的角色
s = p.addSlide();
header(s, "Part 2 · 角色職責", "我的角色：方向盤與煞車");
const me = [
  ["設方向", "「優化 agent crew 的各個面向」"],
  ["做不可逆決策", "要不要 merge、跑哪個實驗、改不改系統"],
  ["提問挑戰", "用問題驅動設計深化"],
  ["把關流程", "堅持 git PR flow"],
];
me.forEach((m, i) => {
  const y = 1.95 + i * 1.0;
  card(s, 0.6, y, 12.15, 0.86);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 0.86, fill: { color: HUMAN } });
  s.addText(m[0], { x: 0.95, y, w: 3.2, h: 0.86, fontFace: HF, fontSize: 17, bold: true, color: HUMAN, valign: "middle", margin: 0 });
  s.addText(m[1], { x: 4.2, y, w: 8.4, h: 0.86, fontFace: BF, fontSize: 15, color: INK, valign: "middle", margin: 0 });
});
s.addText("真實例子：我堅持「main 只接受 PR」——有次 Claude 忘了開分支，被我當場糾正、立刻改回。", { x: 0.6, y: 6.05, w: 12.15, h: 0.5, fontFace: BF, fontSize: 14, italic: true, color: BLUE, margin: 0 });

// ============================================================ 10 Claude 的角色
s = p.addSlide();
header(s, "Part 2 · 角色職責", "Claude 的角色：實作與判斷");
const cl = [
  "把我的意圖轉成程式碼 + 測試",
  "讀原始碼「驗證」——不盡信文件",
  "跑實驗、分析數據",
  "誠實報告——主動揭露 bug 與限制",
  "維護文件 / PR",
];
cl.forEach((t, i) => {
  const y = 1.95 + i * 0.82;
  s.addShape(p.shapes.OVAL, { x: 0.7, y: y + 0.12, w: 0.16, h: 0.16, fill: { color: CLAUDE } });
  s.addText(t, { x: 1.0, y, w: 11.5, h: 0.5, fontFace: BF, fontSize: 17, color: INK, valign: "middle", margin: 0 });
});
card(s, 0.6, 6.15, 12.15, 0.95, NAVY);
s.addText("真實例子：Claude 讀 OpenEvolve 原始碼，發現「EVOLVE-BLOCK 恰好一個」其實是建議、不是硬限制。", { x: 0.95, y: 6.15, w: 11.5, h: 0.95, fontFace: BF, fontSize: 14.5, color: WHITE, valign: "middle", margin: 0 });

// ============================================================ 11 OpenEvolve 的角色
s = p.addSlide();
header(s, "Part 2 · 角色職責", "OpenEvolve 的角色：自主探索者");
s.addText([
  { text: "在 Claude 搭的安全框架內 ", options: { color: INK } },
  { text: "自主突變", options: { bold: true, color: OE } },
  { text: " agent prompt；發明新工具、探索進化路徑。", options: { color: INK } },
], { x: 0.6, y: 2.1, w: 12, h: 0.6, fontFace: BF, fontSize: 18, margin: 0 });
card(s, 0.6, 3.0, 12.15, 2.4, "FBF1E0");
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 3.0, w: 0.12, h: 2.4, fill: { color: OE } });
s.addText("真實例子", { x: 0.95, y: 3.2, w: 11.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: "B5791F", margin: 0 });
s.addText("它自己進化出「按 user_std 切 4 段的評分預測公式」——沒人教它，連我和 Claude 都沒寫過。", { x: 0.95, y: 3.75, w: 11.4, h: 1.4, fontFace: BF, fontSize: 18, color: INK, lineSpacing: 28, margin: 0 });
s.addText("它能「找到」，但它不知道自己找到了什麼——這正是探勘者與架構師的分界。", { x: 0.6, y: 5.7, w: 12, h: 0.5, fontFace: BF, fontSize: 15, italic: true, color: BLUE, margin: 0 });

// ============================================================ 12 三者互補
s = p.addSlide();
header(s, "Part 2 · 角色職責", "三者互補，缺一不可");
const miss = [
  ["只有我（Human）", "沒時間 / 精力做完所有實作", HUMAN],
  ["只有 Claude", "缺方向與最終判斷、會做出不可逆錯誤", CLAUDE],
  ["只有 OpenEvolve", "會把自己改崩潰（v3 的 36% 失敗）", OE],
];
miss.forEach((m, i) => {
  const y = 2.1 + i * 1.4;
  card(s, 0.6, y, 12.15, 1.2);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 1.2, fill: { color: m[2] } });
  s.addText(m[0], { x: 0.95, y, w: 4.0, h: 1.2, fontFace: HF, fontSize: 18, bold: true, color: m[2], valign: "middle", margin: 0 });
  s.addText(m[1], { x: 5.1, y, w: 7.5, h: 1.2, fontFace: BF, fontSize: 16, color: INK, valign: "middle", margin: 0 });
});
s.addText("三層各補一塊——缺了我這一層，就沒方向。", { x: 0.6, y: 6.5, w: 12, h: 0.4, fontFace: BF, fontSize: 15, italic: true, color: NAVY, align: "center", margin: 0 });

// ============================================================ 13 Pattern 1（招牌）
s = p.addSlide();
header(s, "Part 3 · 協作模式", "Pattern 1：提問深化設計");
card(s, 0.6, 1.95, 5.9, 4.5, "EAF0FA");
s.addText("我問的好問題", { x: 0.9, y: 2.2, w: 5.3, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: HUMAN, margin: 0 });
s.addText("「怎麼讓 agent 安全地進化、用不同工具、甚至創造新工具，而不會在 tool calling 上崩潰？」", { x: 0.9, y: 2.7, w: 5.35, h: 2.0, fontFace: HF, fontSize: 19, italic: true, color: NAVY, lineSpacing: 30, margin: 0 });
s.addText("我問的不是「幫我修 bug」，而是一個往深處逼的設計問題。", { x: 0.9, y: 5.4, w: 5.35, h: 0.9, fontFace: BF, fontSize: 13.5, color: MUTE, margin: 0 });
card(s, 6.8, 1.95, 5.95, 4.5, WHITE);
s.addText("逼出來的好答案：失敗分類學", { x: 7.1, y: 2.2, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: CLAUDE, margin: 0 });
s.addText([
  { text: "Claude 沒直接寫 try/except，而是先分層：", options: { color: INK, breakLine: true } },
  { text: "L1 協定 · L2 參數 · L3 策略 · L4 消化 · L5 合約", options: { fontFace: CF, fontSize: 12.5, bold: true, color: BLUE, breakLine: true } },
  { text: "→ 安全憲法：graceful degradation, not crash", options: { color: INK, breakLine: true } },
  { text: "→ 落地：L0 觀測 + L1 clamp + L2 sandbox", options: { color: INK } },
], { x: 7.1, y: 2.75, w: 5.45, h: 2.3, fontSize: 14, lineSpacing: 24, margin: 0 });
s.addText([{ text: "成果　", options: { bold: true, color: GREEN } }, { text: "工具崩潰率 v3 的 36% → 0 次", options: { bold: true, color: GREEN } }], { x: 7.1, y: 5.7, w: 5.4, h: 0.5, fontFace: HF, fontSize: 16, margin: 0 });
s.addText("好問題的價值高於好答案——是我「往深處問」，把一個隨手的修補逼成可遷移的分層框架。", { x: 0.6, y: 6.6, w: 12.15, h: 0.5, fontFace: BF, fontSize: 14, italic: true, color: AMBER, align: "center", margin: 0 });

// ============================================================ 14 Pattern 2
s = p.addSlide();
header(s, "Part 3 · 協作模式", "Pattern 2：誠實回報，主動抓 bug");
card(s, 0.6, 2.1, 5.95, 3.4, "F7E9E7");
s.addText("看似完美", { x: 0.9, y: 2.35, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "combined_score", options: { fontFace: CF, fontSize: 16, bold: true, color: INK, breakLine: true } },
  { text: "= 0.8452", options: { fontFace: CF, fontSize: 30, bold: true, color: RED } },
], { x: 0.9, y: 2.9, w: 5.4, h: 1.6, lineSpacing: 36, margin: 0 });
s.addText("分數漂亮，沒人會起疑。", { x: 0.9, y: 4.7, w: 5.4, h: 0.6, fontFace: BF, fontSize: 14, italic: true, color: MUTE, margin: 0 });
card(s, 6.8, 2.1, 5.95, 3.4, "E7F2EC");
s.addText("Claude 主動驗證", { x: 7.1, y: 2.35, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "直接查 ", options: { color: INK } },
  { text: "agent.tools", options: { fontFace: CF, bold: true, color: NAVY } },
  { text: " → 發現是 ", options: { color: INK } },
  { text: "[]", options: { fontFace: CF, fontSize: 18, bold: true, color: RED, breakLine: true } },
  { text: "工具根本沒裝上！揭露 + 補回歸測試。", options: { color: INK } },
], { x: 7.1, y: 2.9, w: 5.4, h: 1.8, fontSize: 15, lineSpacing: 26, margin: 0 });
card(s, 0.6, 5.7, 12.15, 1.35, NAVY);
s.addText("“ 分數健康 ≠ 功能正確 ”　AI 的誠實性，是協作的地基。", { x: 0.95, y: 5.7, w: 11.5, h: 1.35, fontFace: HF, fontSize: 22, bold: true, color: AMBER, valign: "middle", margin: 0 });

// ============================================================ 15 Pattern 3
s = p.addSlide();
header(s, "Part 3 · 協作模式", "Pattern 3：我把關不可逆操作");
s.addText("Claude 先問我，再做——不擅自執行不可逆動作。", { x: 0.6, y: 2.05, w: 12, h: 0.5, fontFace: BF, fontSize: 18, color: INK, margin: 0 });
const irr = ["merge PR", "跑 4 小時實驗", "brew install", "改系統設定", "建新 GitHub repo", "裝 LibreOffice"];
irr.forEach((t, i) => {
  const x = 0.6 + (i % 3) * 4.15, y = 2.9 + Math.floor(i / 3) * 1.2;
  card(s, x, y, 3.9, 0.95);
  s.addShape(p.shapes.RECTANGLE, { x, y, w: 0.1, h: 0.95, fill: { color: RED } });
  s.addText(t, { x: x + 0.25, y, w: 3.5, h: 0.95, fontFace: CF, fontSize: 15, bold: true, color: NAVY, valign: "middle", margin: 0 });
});
s.addText("真實例子：建新 repo、裝 LibreOffice 前，Claude 都先問我確認。把關「不可逆」是我這一層的核心職責。", { x: 0.6, y: 5.7, w: 12.15, h: 0.6, fontFace: BF, fontSize: 14.5, italic: true, color: BLUE, margin: 0 });

// ============================================================ 16 Pattern 4
s = p.addSlide();
header(s, "Part 3 · 協作模式", "Pattern 4：人機知識互補");
card(s, 0.6, 2.2, 5.95, 3.5, "E7F2EC");
s.addText("我補 Claude 的盲點", { x: 0.9, y: 2.45, w: 5.3, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: HUMAN, margin: 0 });
s.addText("Claude 不知道「我的 Mac 闔蓋會中斷背景進程」——這是物理 / 環境世界的知識。", { x: 0.9, y: 3.0, w: 5.4, h: 2.4, fontFace: BF, fontSize: 16, color: INK, lineSpacing: 26, margin: 0 });
card(s, 6.8, 2.2, 5.95, 3.5, "EAF0FA");
s.addText("Claude 補我的盲點", { x: 7.1, y: 2.45, w: 5.3, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: CLAUDE, margin: 0 });
s.addText("我一提醒，Claude 就解釋 caffeinate 機制、幫我設定（防系統睡眠但讓螢幕休息）——這是工具細節。", { x: 7.1, y: 3.0, w: 5.4, h: 2.4, fontFace: BF, fontSize: 16, color: INK, lineSpacing: 26, margin: 0 });
s.addText("我的「環境知識」× Claude 的「工具細節」——兩種知識互補，缺一進化就跑不完。", { x: 0.6, y: 6.0, w: 12.15, h: 0.6, fontFace: BF, fontSize: 15, italic: true, color: NAVY, align: "center", margin: 0 });

// ============================================================ 17 Pattern 5
s = p.addSlide();
header(s, "Part 3 · 協作模式", "Pattern 5：分層委派自主（最核心）");
s.addText("我請 Claude 為 OpenEvolve 搭安全框架（L0/L1/L2 Failure Taxonomy）——框架到位，我才敢放手。", { x: 0.6, y: 2.0, w: 12, h: 0.6, fontFace: BF, fontSize: 16, color: INK, margin: 0 });
card(s, 0.6, 2.9, 5.95, 2.9, "F7E9E7");
s.addText("沒框架（v3）", { x: 0.9, y: 3.15, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([{ text: "36%", options: { fontFace: HF, fontSize: 52, bold: true, color: RED, breakLine: true } }, { text: "iteration 崩潰", options: { color: INK } }], { x: 0.9, y: 3.7, w: 5.4, h: 1.8, lineSpacing: 36, margin: 0 });
card(s, 6.8, 2.9, 5.95, 2.9, "E7F2EC");
s.addText("完整架構", { x: 7.1, y: 3.15, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([{ text: "0", options: { fontFace: HF, fontSize: 52, bold: true, color: GREEN, breakLine: true } }, { text: "次工具呼叫崩潰", options: { color: INK } }], { x: 7.1, y: 3.7, w: 5.4, h: 1.8, lineSpacing: 36, margin: 0 });
s.addText("我委派自主性的前提，是先建好「最壞只是退化」的護欄。", { x: 0.6, y: 6.1, w: 12.15, h: 0.5, fontFace: HF, fontSize: 18, bold: true, italic: true, color: NAVY, align: "center", margin: 0 });

// ============================================================ 18 五模式總表
s = p.addSlide();
header(s, "Part 3 · 協作模式", "五個模式 · 一頁回顧");
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
s.addText("💬 哪一個模式，你明天就能用在自己的專案？", { x: 0.6, y: 6.85, w: 12, h: 0.4, fontFace: BF, fontSize: 14, italic: true, color: AMBER, margin: 0 });

// ============================================================ 19 三層跑出進化產物
s = p.addSlide();
header(s, "Part 4 · 高潮案例", "三層協作，跑出一個進化產物");
const contrib = [
  ["我（Human）", "決定用完整架構跑 50 iter\n設定 caffeinate 讓它整夜跑完", HUMAN],
  ["Claude", "搭好 L0/L1/L2 框架、啟動進化\n脫離 harness、分析數據", CLAUDE],
  ["OpenEvolve", "自主進化出 iter22 的\n「量化分段公式」（0.842）", OE],
];
contrib.forEach((c, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.1, 3.85, 2.6);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.1, w: 3.85, h: 0.12, fill: { color: c[2] } });
  s.addText(c[0], { x: x + 0.25, y: 2.4, w: 3.35, h: 0.5, fontFace: HF, fontSize: 17, bold: true, color: c[2], margin: 0 });
  s.addText(c[1], { x: x + 0.25, y: 2.95, w: 3.4, h: 1.6, fontFace: BF, fontSize: 13.5, color: INK, lineSpacing: 20, margin: 0 });
});
card(s, 0.6, 5.0, 12.15, 1.9, "11183B");
s.addText("iter22 公式（節錄）", { x: 0.9, y: 5.15, w: 6, h: 0.4, fontFace: HF, fontSize: 14, bold: true, color: AMBER, margin: 0 });
s.addText([
  { text: "if user_std < 0.7:  predicted = user_mean + 0.55·(item_mean − user_mean)", options: { color: WHITE, breakLine: true } },
  { text: "elif < 1.0: +0.45·…   elif < 1.3: +0.30·…   else: user_median + 0.20·…", options: { color: ICE, breakLine: true } },
  { text: "clamp [1,5] · round 0.5", options: { color: WHITE } },
], { x: 0.9, y: 5.6, w: 11.5, h: 1.2, fontFace: CF, fontSize: 13, lineSpacing: 22, margin: 0 });

// ============================================================ 20 沒有一層能單獨做到
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("iter22 是三層協作的湧現產物", { x: 1, y: 1.6, w: 11.5, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 2, margin: 0 });
const none = [
  ["我", "不會手寫那套公式", HUMAN],
  ["Claude", "不會自己想到那個公式", CLAUDE],
  ["OpenEvolve", "沒框架會把自己改崩潰", OE],
];
none.forEach((n, i) => {
  const y = 2.4 + i * 1.3;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 1, y, w: 2.7, h: 1.0, rectRadius: 0.08, fill: { color: n[2] } });
  s.addText(n[0], { x: 1, y, w: 2.7, h: 1.0, align: "center", valign: "middle", fontFace: HF, fontSize: 20, bold: true, color: WHITE, margin: 0 });
  s.addText(n[1], { x: 4.1, y, w: 8.3, h: 1.0, fontFace: HF, fontSize: 22, color: WHITE, valign: "middle", margin: 0 });
});
s.addText("沒有任何一層能單獨做到。", { x: 1, y: 6.4, w: 11, h: 0.5, fontFace: HF, fontSize: 20, bold: true, italic: true, color: AMBER, margin: 0 });

// ============================================================ 21 iter22 之後（深挖）
s = p.addSlide();
header(s, "Part 4 · 高潮案例", "真正深刻的地方：iter22「之後」");
s.addText("我請 Claude 追了 iter22 (de559de9) 的所有衍生子代——結論：之後再沒有更好的後代。", { x: 0.6, y: 1.95, w: 12.15, h: 0.5, fontFace: BF, fontSize: 16, color: INK, margin: 0 });
const aft = [
  ["over-engineering", "4 段公式 → 5、6 段，加更多參數"],
  ["分項此消彼長", "preference 微幅波動，review_generation 反而退化 → 分數停滯"],
  ["三島趨同", "migration 把 iter22 基因散到 3 島 → 多樣性塌掉，整族卡同一山頭"],
];
aft.forEach((a, i) => {
  const y = 2.6 + i * 1.05;
  card(s, 0.6, y, 12.15, 0.92);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 0.92, fill: { color: OE } });
  s.addText(a[0], { x: 0.95, y, w: 3.2, h: 0.92, fontFace: HF, fontSize: 15, bold: true, color: "B5791F", valign: "middle", margin: 0 });
  s.addText(a[1], { x: 4.2, y, w: 8.4, h: 0.92, fontFace: BF, fontSize: 14, color: INK, valign: "middle", margin: 0 });
});
card(s, 0.6, 5.85, 12.15, 1.25, NAVY);
s.addText([
  { text: "Claude 給我的診斷：", options: { bold: true, color: AMBER } },
  { text: "iter22 是局部最優。OpenEvolve 能「找到」它，但「為什麼停在這、怎麼跳出去」是探勘者結構上做不到的——它沒有「局部最優」這個概念。", options: { color: WHITE } },
], { x: 0.95, y: 5.85, w: 11.5, h: 1.25, fontFace: BF, fontSize: 14.5, valign: "middle", lineSpacing: 22, margin: 0 });

// ============================================================ 22 失敗也是洞察
s = p.addSlide();
header(s, "Part 4 · 高潮案例", "連「失敗」也是協作的洞察");
s.addText("8 次低分崩潰 → 我請 Claude 爬梳資料歸因：", { x: 0.6, y: 2.1, w: 12, h: 0.5, fontFace: BF, fontSize: 18, color: INK, margin: 0 });
card(s, 0.6, 3.0, 5.95, 2.4, "F7E9E7");
s.addText([{ text: "5 次", options: { fontFace: HF, fontSize: 44, bold: true, color: RED, breakLine: true } }, { text: "YAML 語法壞掉", options: { color: INK } }, { text: "（full-rewrite 風險，繞過 clamp）", options: { fontSize: 12, color: MUTE } }], { x: 0.9, y: 3.3, w: 5.4, h: 1.9, lineSpacing: 30, margin: 0 });
card(s, 6.8, 3.0, 5.95, 2.4, "FBF1E0");
s.addText([{ text: "3 次", options: { fontFace: HF, fontSize: 44, bold: true, color: "B5791F", breakLine: true } }, { text: "rate limit 429", options: { color: INK } }, { text: "（NVIDIA NIM 限流）", options: { fontSize: 12, color: MUTE } }], { x: 7.1, y: 3.3, w: 5.4, h: 1.9, lineSpacing: 30, margin: 0 });
s.addText("協作不只產出成功，也共同理解失敗——成功與失敗，都是我們三層一起讀懂的。", { x: 0.6, y: 5.9, w: 12.15, h: 0.6, fontFace: HF, fontSize: 17, italic: true, color: NAVY, align: "center", margin: 0 });

// ============================================================ 23 什麼該誰做
s = p.addSlide();
header(s, "Part 5 · 反思", "什麼該誰做？");
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

// ============================================================ 24 Key Takeaways
s = p.addSlide();
header(s, "Part 5 · 反思", "Key Takeaways");
const tk = [
  "AI 協作正在變成多層——學會「委派自主性」是新技能",
  "每往下一層，護欄要越強（最壞只是退化，不是崩潰）",
  "誠實回報 + 人類把關不可逆 = 協作的安全地基",
  "好問題驅動好設計；連失敗都能共同理解",
];
tk.forEach((t, i) => {
  const y = 2.0 + i * 1.15;
  card(s, 0.6, y, 12.15, 1.0);
  chip(s, 0.9, y + 0.25, `${i + 1}`, AMBER, NAVY);
  s.addText(t, { x: 1.6, y, w: 11.0, h: 1.0, fontFace: BF, fontSize: 16.5, color: INK, valign: "middle", margin: 0 });
});
s.addText("💬 回到開場：你的 AI 是工具，還是夥伴？", { x: 0.6, y: 6.75, w: 12, h: 0.4, fontFace: BF, fontSize: 14, italic: true, color: AMBER, margin: 0 });

// ============================================================ 25 結語 + 資源
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("謝謝 · Q & A", { x: 0.95, y: 1.9, w: 11.5, h: 1, fontFace: HF, fontSize: 42, bold: true, color: WHITE, margin: 0 });
s.addText("這個專案的真正產物，不只是 0.842 的 agent——\n而是我帶走的一套「人 + AI + 進化」安全協作工作流。", { x: 1, y: 3.2, w: 11.5, h: 1.4, fontFace: HF, fontSize: 21, italic: true, color: ICE, lineSpacing: 34, margin: 0 });
// mini chain再現
chain.forEach((c, i) => {
  const x = 1.0 + i * 3.5;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 5.0, w: 2.6, h: 0.7, rectRadius: 0.08, fill: { color: c[1] } });
  s.addText(c[0], { x, y: 5.0, w: 2.6, h: 0.7, align: "center", valign: "middle", fontFace: HF, fontSize: 16, bold: true, color: WHITE, margin: 0 });
  if (i < 2) s.addText("▶", { x: x + 2.65, y: 5.0, w: 0.7, h: 0.7, align: "center", valign: "middle", fontFace: BF, fontSize: 14, color: AMBER, margin: 0 });
});
s.addText([
  { text: "資源　", options: { bold: true, color: AMBER } },
  { text: "docs/collaboration_workflow_outline.md · docs/evolution_design_notes.md · docs/teaching_slides_outline.md", options: { color: ICE } },
], { x: 1, y: 6.3, w: 11.5, h: 0.6, fontFace: BF, fontSize: 13.5, margin: 0 });

p.writeFile({ fileName: "/tmp/deck/三層協作工作流_教學投影片.pptx" }).then(f => console.log("WROTE", f));
