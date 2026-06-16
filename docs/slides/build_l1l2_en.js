const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "AgentSocietyChallenge_OpenEvolve";
p.title = "L1 × L2 Deep Dive: Safely Use and Safely Build Tools";

const NAVY = "1E2761", BLUE = "3A5BA0", ICE = "CADCFC";
const AMBER = "E8A33D", GREEN = "2E9E6B", RED = "C0453B";
const INK = "23272E", MUTE = "6B7280", LIGHT = "F4F7FB", WHITE = "FFFFFF";
const HF = "Georgia", BF = "Calibri", CF = "Consolas";
const W = 13.33, H = 7.5;
const sh = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 135, opacity: 0.12 });

function header(s, kicker, title) {
  s.background = { color: LIGHT };
  s.addShape(p.shapes.OVAL, { x: 0.55, y: 0.5, w: 0.16, h: 0.16, fill: { color: AMBER } });
  s.addText(kicker.toUpperCase(), { x: 0.8, y: 0.46, w: 11.5, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: BLUE, charSpacing: 2, margin: 0 });
  s.addText(title, { x: 0.55, y: 0.78, w: 12.4, h: 0.85, fontFace: HF, fontSize: 25, bold: true, color: NAVY, margin: 0 });
}
function card(s, x, y, w, h, fill) {
  s.addShape(p.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill || WHITE }, line: { color: "E2E8F0", width: 1 }, shadow: sh() });
}
function arrow(s, x, y, w, color, sz) {
  s.addText("→", { x, y, w: w || 0.5, h: 0.7, fontFace: HF, fontSize: sz || 22, bold: true, color: color || AMBER, align: "center", valign: "middle", margin: 0 });
}
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
s.addText("TOOL CALLING FAILURE TAXONOMY · DEEP DIVE", { x: 1, y: 1.8, w: 11.5, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 3, margin: 0 });
s.addText("L1 × L2", { x: 0.95, y: 2.25, w: 11.5, h: 1.0, fontFace: HF, fontSize: 50, bold: true, color: WHITE, margin: 0 });
s.addText("Safely USE tools — and safely BUILD them", { x: 1, y: 3.5, w: 11.5, h: 0.6, fontFace: HF, fontSize: 24, bold: true, color: WHITE, margin: 0 });
s.addText("Starting point — take the crash-prone “LLM-driven tool calling” out of the evolution space", { x: 1, y: 4.3, w: 11.5, h: 0.5, fontFace: BF, fontSize: 17, color: ICE, margin: 0 });
[["L1   Safely use", BLUE, 1.0], ["L2   Safely build", AMBER, 5.0]].forEach(c => {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: c[2], y: 5.3, w: 3.7, h: 0.8, rectRadius: 0.1, fill: { color: c[1] } });
  s.addText(c[0], { x: c[2], y: 5.3, w: 3.7, h: 0.8, align: "center", valign: "middle", fontFace: HF, fontSize: 17, bold: true, color: WHITE, margin: 0 });
});
codeRef(s, "L1 src/tools/retrieval_executor.py ｜ L2 src/tools/tool_loader.py + evolvable_tools.py", true);

// ============================================================ 2 SHARED PHILOSOPHY
s = p.addSlide();
header(s, "Design philosophy", "One shared move: freeze the “boundary”, free the “content”");
const gv = [
  ["", "L1 · Tool-use policy", "L2 · Tool generation"],
  ["Frozen (safety boundary)", "Interpreter: ALLOWED_QUERIES + clamp", "Loader: four-gate sandbox"],
  ["Evolved (free content)", "retrieval_policy: what to fetch / how to sample", "evolvable_tools: new derived computations"],
  ["Worst case", "Fall back to default policy (never raises)", "Silently drop bad tools (no error)"],
];
const td = [];
for (let r = 0; r < gv.length; r++) {
  const row = [];
  for (let c = 0; c < 3; c++) row.push({
    text: gv[r][c],
    options: {
      fontFace: r === 0 ? HF : (c === 0 ? HF : BF), fontSize: r === 0 ? 14.5 : 13,
      bold: r === 0 || c === 0, color: r === 0 ? WHITE : (c === 1 ? "0C447C" : c === 2 ? "8A5A0B" : INK),
      fill: { color: r === 0 ? NAVY : (r % 2 ? WHITE : LIGHT) }, align: "left", valign: "middle",
    },
  });
  td.push(row);
}
s.addTable(td, { x: 0.6, y: 2.05, w: 12.15, colW: [2.95, 4.6, 4.6], rowH: [0.55, 0.85, 0.85, 0.85], border: { pt: 1, color: "E2E8F0" } });
card(s, 0.6, 5.7, 12.15, 1.2, NAVY);
s.addText([
  { text: "Safety constitution   ", options: { bold: true, color: AMBER } },
  { text: "Worst case = graceful degradation, never a catastrophic crash. Both L1 and L2 separate a frozen safety skeleton from freely-evolving content — that is what lets us hand the LLM freedom to evolve without fear it breaks itself.", options: { color: WHITE } },
], { x: 0.95, y: 5.7, w: 11.5, h: 1.2, fontFace: BF, fontSize: 13.5, valign: "middle", lineSpacing: 20, margin: 0 });
codeRef(s, "L1 retrieval_executor.py:28-30 ALLOWED_* / :53 clamp ｜ L2 tool_loader.py:77-177 four gates");

// ============================================================ 3 L1 MECHANISM
s = p.addSlide();
header(s, "L1 · Mechanism", "L1: Take tool calling out of the LLM’s hands");
card(s, 0.6, 2.2, 5.95, 3.7, "F7E9E7");
s.addText("Before (crash-prone)", { x: 0.9, y: 2.45, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "data_retriever [has tool]", options: { fontFace: CF, bold: true, color: NAVY, breakLine: true } },
  { text: "  ↓ LLM actively calls the tool ×4 (text format)", options: { color: INK, breakLine: true } },
  { text: "  ↓ assembles a summary", options: { color: INK } },
], { x: 0.9, y: 3.1, w: 5.5, h: 1.8, fontSize: 13, lineSpacing: 28, margin: 0 });
s.addText("The caller is the LLM — one mutation breaks the format and it crashes.", { x: 0.9, y: 5.3, w: 5.5, h: 0.5, fontFace: BF, fontSize: 12.5, italic: true, color: RED, margin: 0 });
card(s, 6.8, 2.2, 5.95, 3.7, "E7F2EC");
s.addText("After (crash-free)", { x: 7.1, y: 2.45, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "serving_flow: before the crew starts", options: { fontFace: CF, bold: true, color: NAVY, breakLine: true } },
  { text: "  ↓ execute_policy() — deterministic retrieval", options: { color: INK, breakLine: true } },
  { text: "  ↓ stored as retrieved_context, injected", options: { color: INK, breakLine: true } },
  { text: "data_retriever [no tool]: just extracts text", options: { fontFace: CF, bold: true, color: GREEN } },
], { x: 7.1, y: 3.1, w: 5.55, h: 2.0, fontSize: 12.5, lineSpacing: 26, margin: 0 });
s.addText("No agent “calls tools” anymore — retrieval is done by deterministic code.", { x: 7.1, y: 5.3, w: 5.5, h: 0.5, fontFace: BF, fontSize: 12.5, italic: true, color: GREEN, margin: 0 });
s.addText("The essence: move the crash-prone part out of the evolution space; keep what is worth evolving (retrieval strategy + extraction prompt).", { x: 0.6, y: 6.1, w: 12.15, h: 0.5, fontFace: HF, fontSize: 14.5, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "serving_flow.py:85-93 execute_policy→inject ｜ simulation_crew.py:42-50 data_retriever has no tools");

// ============================================================ 4 L1 KEY QUESTION
s = p.addSlide();
header(s, "L1 · Key question", "If the whitelist is frozen, does evolving queries / strategy matter?");
s.addText("Yes. The key is separating the “alphabet” from the “sentence”:", { x: 0.6, y: 1.62, w: 12, h: 0.4, fontFace: BF, fontSize: 14, color: INK, margin: 0 });
card(s, 0.6, 2.1, 5.95, 1.55, "EAF0FA");
s.addText([
  { text: "ALLOWED_QUERIES = the alphabet", options: { bold: true, color: NAVY, breakLine: true } },
  { text: "Which queries are legal (4 of them) — frozen, can’t change", options: { color: INK } },
], { x: 0.9, y: 2.3, w: 5.5, h: 1.1, fontSize: 13, lineSpacing: 20, margin: 0 });
card(s, 6.8, 2.1, 5.95, 1.55, "FBF1E0");
s.addText([
  { text: "retrieval_policy = the sentence", options: { bold: true, color: "8A5A0B", breakLine: true } },
  { text: "Which to fetch this time, order, sampling, k, truncation — evolved", options: { color: INK } },
], { x: 7.1, y: 2.3, w: 5.5, h: 1.1, fontSize: 13, lineSpacing: 20, margin: 0 });
s.addText("Same alphabet → different sentences (policies) → wildly different context downstream:", { x: 0.6, y: 3.85, w: 12, h: 0.4, fontFace: BF, fontSize: 13.5, color: INK, margin: 0 });
card(s, 0.6, 4.35, 5.95, 1.55, "11183B");
s.addText([
  { text: "Policy A", options: { color: AMBER, bold: true, breakLine: true } },
  { text: "queries: [user, item, review_by_user]\nstrategy: recent   k: 15", options: { color: WHITE } },
], { x: 0.9, y: 4.5, w: 5.5, h: 1.3, fontFace: CF, fontSize: 12, lineSpacing: 18, margin: 0 });
card(s, 6.8, 4.35, 5.95, 1.55, "11183B");
s.addText([
  { text: "Policy B", options: { color: AMBER, bold: true, breakLine: true } },
  { text: "queries: [user, review_by_item]\nstrategy: extreme_ratings   k: 5", options: { color: WHITE } },
], { x: 7.1, y: 4.5, w: 5.5, h: 1.3, fontFace: CF, fontSize: 12, lineSpacing: 18, margin: 0 });
s.addText("Evolution changes not “what can be queried” but “how it’s queried this time”. The real ceiling is the dataset (3 tables), not the whitelist.", { x: 0.6, y: 6.15, w: 12.15, h: 0.5, fontFace: HF, fontSize: 14, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "retrieval_executor.py:29 ALLOWED_QUERIES (alphabet) · :33-37 DEFAULT_POLICY · :53 normalize_policy (compose sentence)");

// ============================================================ 5 L1 DATA FLOW
s = p.addSlide();
header(s, "L1 · How it works", "How does an evolved policy flow all the way to the final score?");
const flowL1 = ["retrieval_policy\n(evolved sentence)", "execute_policy()\nfrozen interpreter", "retrieved_context", "analyst reasons", "{stars, review}", "fitness → selection"];
const colsL1 = [AMBER, NAVY, BLUE, BLUE, GREEN, NAVY];
flowL1.forEach((t, i) => {
  const x = 0.55 + i * 2.08;
  card(s, x, 2.5, 1.78, 1.3, WHITE);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.5, w: 1.78, h: 0.1, fill: { color: colsL1[i] } });
  s.addText(t, { x: x + 0.05, y: 2.62, w: 1.68, h: 1.15, fontFace: BF, fontSize: 9.5, bold: true, color: INK, align: "center", valign: "middle", lineSpacing: 12, margin: 0 });
  if (i < 5) arrow(s, x + 1.78, 2.85, 0.3, NAVY, 16);
});
card(s, 0.6, 4.3, 12.15, 1.05, "E7F2EC");
s.addText([
  { text: "clamp protection:  ", options: { bold: true, color: GREEN } },
  { text: "k=999999 → 50 · bogus query → filtered out · whole policy garbage → fall back to default. Never raises.", options: { color: INK } },
], { x: 0.95, y: 4.3, w: 11.5, h: 1.05, fontFace: BF, fontSize: 13.5, valign: "middle", margin: 0 });
s.addText("So a good policy (queries the right things, samples right) → better analysis → higher fitness → survives; a bad one at worst degrades to baseline retrieval, never crashes. Evolution explores on this “safe terrain”.", { x: 0.6, y: 5.6, w: 12.15, h: 1.0, fontFace: BF, fontSize: 14, color: INK, lineSpacing: 22, margin: 0 });
codeRef(s, "retrieval_executor.py:53 normalize_policy (clamp) · :140 execute_policy ｜ serving_flow.py:90-99 inject inputs");

// ============================================================ 6 L2 MECHANISM
s = p.addSlide();
header(s, "L2 · Mechanism", "What gates does an evolved tool pass before reaching the agent?");
const flowL2 = ["evolvable_tools.py\ntool_* fns in\nEVOLVE-BLOCK", "_load_analyst_tools()\nread at crew build", "load_evolved_tools\nfour gates", "wrap as @tool\ndocstring→desc", "attach to\npsychological\n_analyst"];
const colsL2 = [AMBER, BLUE, NAVY, BLUE, GREEN];
flowL2.forEach((t, i) => {
  const x = 0.55 + i * 2.5;
  card(s, x, 2.3, 2.2, 1.5, WHITE);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.3, w: 2.2, h: 0.1, fill: { color: colsL2[i] } });
  s.addText(t, { x: x + 0.05, y: 2.42, w: 2.1, h: 1.35, fontFace: BF, fontSize: 9.5, bold: true, color: INK, align: "center", valign: "middle", lineSpacing: 12, margin: 0 });
  if (i < 4) arrow(s, x + 2.2, 2.7, 0.3, NAVY, 16);
});
const gates = [
  ["① AST safety scan", "Block import / open / exec / dunder (reject whole file)"],
  ["② Signature check", "Only tool_* + (kit, user_id, item_id)"],
  ["③ Sandbox trial", "Run on a fixture, 5s timeout; bad ones silently dropped"],
  ["④ Wrap & register", "Survivors become CrewAI @tools"],
];
gates.forEach((g, i) => {
  const x = 0.6 + (i % 2) * 6.15, y = 4.1 + Math.floor(i / 2) * 0.92;
  card(s, x, y, 5.9, 0.8);
  s.addText(g[0], { x: x + 0.2, y, w: 2.4, h: 0.8, fontFace: HF, fontSize: 13, bold: true, color: NAVY, valign: "middle", margin: 0 });
  s.addText(g[1], { x: x + 2.55, y, w: 3.2, h: 0.8, fontFace: BF, fontSize: 11, color: INK, valign: "middle", margin: 0 });
});
s.addText("ReadOnlyKit: tools can only reach get_user / get_item / get_reviews — no filesystem, network, or ground truth.", { x: 0.6, y: 6.05, w: 12.15, h: 0.5, fontFace: BF, fontSize: 13, italic: true, color: BLUE, margin: 0 });
codeRef(s, "simulation_crew.py:14-30 _load_analyst_tools ｜ tool_loader.py:193 load_evolved_tools · :77/:106/:120/:156 gates · :60 ReadOnlyKit");

// ============================================================ 7 L2 DOCSTRING CO-EVOLUTION
s = p.addSlide();
header(s, "L2 · How it works", "How does the agent “know” to use a tool?");
card(s, 0.6, 2.1, 6.0, 4.0, "EAF0FA");
s.addText("docstring co-evolution", { x: 0.9, y: 2.3, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "At wrap time the docstring becomes the tool description → the agent sees it → autonomously decides whether to call it.", options: { color: INK, breakLine: true } },
  { text: "Causal chain:", options: { bold: true, color: BLUE, breakLine: true } },
  { text: "docstring quality → called or not → enters reasoning or not → fitness → selection → docstring gene survives", options: { fontFace: CF, fontSize: 10.5, color: INK } },
], { x: 0.9, y: 2.8, w: 5.5, h: 2.6, fontSize: 13, lineSpacing: 20, margin: 0 });
s.addText("A tool’s “discoverability” is under evolutionary pressure too — accurate but vaguely described → not called → zero contribution → selected out.", { x: 0.9, y: 5.25, w: 5.5, h: 0.8, fontFace: BF, fontSize: 12, italic: true, color: BLUE, margin: 0 });
card(s, 6.8, 2.1, 5.95, 4.0, WHITE);
s.addText("Two safety designs", { x: 7.1, y: 2.3, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "Silent dead genes   ", options: { bold: true, color: GREEN } },
  { text: "Bad tools are silently dropped (5 bad, 3 left, 2 run fine) — pipeline never crashes; if all fail it falls back to an empty list and the agent still reasons from retrieved_context.", options: { color: INK, breakLine: true } },
  { text: "Mounted at the decision point   ", options: { bold: true, color: GREEN } },
  { text: "Tools go to the analyst (where judgment happens), not data_retriever — so we don’t reintroduce the crash risk L1 just removed.", options: { color: INK } },
], { x: 7.1, y: 2.8, w: 5.45, h: 3.2, fontSize: 12.5, lineSpacing: 19, margin: 0 });
codeRef(s, "tool_loader.py:156-177 _wrap_as_crewai_tool (docstring→description) · :226-238 silent drop ｜ simulation_crew.py:53-62 attach to analyst");

// ============================================================ 8 SYNTHESIS
s = p.addSlide();
header(s, "L1 × L2 · Together", "Alphabet → sentence → new word: safely evolving innovative tools");
const prog = [
  ["L1: compose new “sentences”", "Use a fixed “alphabet” (4 queries) to compose new retrieval sentences — deciding how to USE existing queries", BLUE],
  ["L2: coin new “words”", "Invent new derived analyses over the fixed data (3 tables) — BUILDING brand-new tools", AMBER],
];
prog.forEach((c, i) => {
  const y = 2.05 + i * 1.25;
  card(s, 0.6, y, 12.15, 1.1);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 1.1, fill: { color: c[2] } });
  s.addText(c[0], { x: 0.95, y, w: 3.6, h: 1.1, fontFace: HF, fontSize: 15, bold: true, color: c[2], valign: "middle", margin: 0 });
  s.addText(c[1], { x: 4.6, y, w: 8.0, h: 1.1, fontFace: BF, fontSize: 13.5, color: INK, valign: "middle", margin: 0 });
});
card(s, 0.6, 4.65, 12.15, 1.05, "F1EFE8");
s.addText([
  { text: "Shared boundary   ", options: { bold: true, color: NAVY } },
  { text: "Only 3 data tables → the problem narrows from “unbounded code generation” to “bounded feature engineering” — controllable, sandboxable, verifiable.", options: { color: INK } },
], { x: 0.95, y: 4.65, w: 11.5, h: 1.05, fontFace: BF, fontSize: 13.5, valign: "middle", margin: 0 });
card(s, 0.6, 5.9, 12.15, 1.0, NAVY);
s.addText("Freeze the “boundary”, free the “content” — that is why evolution can be both innovative and safe.", { x: 0.95, y: 5.9, w: 11.5, h: 1.0, fontFace: HF, fontSize: 17, bold: true, color: AMBER, valign: "middle", margin: 0 });
codeRef(s, "L1 retrieval_executor.py + agents_evolving.yaml:11-16 ｜ L2 tool_loader.py + evolvable_tools.py:18-58");

p.writeFile({ fileName: "/tmp/deck/L1L2_DeepDive_EN.pptx" }).then(f => console.log("WROTE", f));
