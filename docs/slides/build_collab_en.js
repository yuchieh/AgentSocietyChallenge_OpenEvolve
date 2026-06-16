const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "AgentSocietyChallenge_OpenEvolve";
p.title = "Three-Layer AI Collaboration Workflow";

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
  s.addText(kicker.toUpperCase(), { x: 0.8, y: 0.46, w: 11.5, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: BLUE, charSpacing: 2, margin: 0 });
  s.addText(title, { x: 0.55, y: 0.78, w: 12.4, h: 0.85, fontFace: HF, fontSize: 26, bold: true, color: NAVY, margin: 0 });
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
const GH_BASE = "https://github.com/yuchieh/AgentSocietyChallenge_OpenEvolve/blob/facfd59aceddfe0ce7f7499f93af16566d8002c2/";
const PATHMAP = {
  "openevolve_evaluator.py": "openevolve_evaluator.py", "evaluator.py": "openevolve_evaluator.py",
  "evolvable_tools.py": "evolvable_tools.py",
  "src/tools/interaction_tool_wrapper.py": "src/tools/interaction_tool_wrapper.py", "interaction_tool_wrapper.py": "src/tools/interaction_tool_wrapper.py",
  "src/tools/retrieval_executor.py": "src/tools/retrieval_executor.py", "retrieval_executor.py": "src/tools/retrieval_executor.py",
  "src/tools/tool_loader.py": "src/tools/tool_loader.py", "tool_loader.py": "src/tools/tool_loader.py",
  "src/crews/simulation_crew.py": "src/crews/simulation_crew.py", "simulation_crew.py": "src/crews/simulation_crew.py",
  "src/flows/serving_flow.py": "src/flows/serving_flow.py", "serving_flow.py": "src/flows/serving_flow.py",
  "tests/test_tool_loader.py": "tests/test_tool_loader.py", "test_tool_loader.py": "tests/test_tool_loader.py",
  "config/agents_evolving.yaml": "config/agents_evolving.yaml", "agents_evolving.yaml": "config/agents_evolving.yaml",
  "config/agents.yaml": "config/agents.yaml", "agents.yaml": "config/agents.yaml",
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
s.addText("HUMAN × CLAUDE CODE × OPENEVOLVE", { x: 1, y: 1.8, w: 11.5, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 3, margin: 0 });
s.addText("Three-Layer AI Collaboration", { x: 0.95, y: 2.25, w: 11.8, h: 1.3, fontFace: HF, fontSize: 42, bold: true, color: WHITE, margin: 0 });
s.addText("When an AI also directs another AI — how I delegate autonomy layer by layer", { x: 1, y: 3.85, w: 11.5, h: 0.6, fontFace: BF, fontSize: 18, color: ICE, margin: 0 });
const chain = [["Me", HUMAN], ["Claude", CLAUDE], ["OpenEvolve", OE]];
chain.forEach((c, i) => {
  const x = 1.0 + i * 3.7;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 5.2, w: 2.8, h: 0.8, rectRadius: 0.1, fill: { color: c[1] } });
  s.addText(c[0], { x, y: 5.2, w: 2.8, h: 0.8, align: "center", valign: "middle", fontFace: HF, fontSize: 18, bold: true, color: WHITE, margin: 0 });
  if (i < 2) s.addText("▶", { x: x + 2.85, y: 5.2, w: 0.8, h: 0.8, align: "center", valign: "middle", fontFace: BF, fontSize: 16, color: AMBER, margin: 0 });
});
s.addText("A talk about safe “human + AI + evolution” collaboration", { x: 1, y: 6.5, w: 11.5, h: 0.4, fontFace: BF, fontSize: 13, color: "8FA3C8", margin: 0 });
codeRef(s, "Three layers map to: Me→config/*.yaml ｜ Claude→src/ + tests/ ｜ OpenEvolve→EVOLVE-BLOCK", true);

// ============================================================ 2 AN UNUSUAL COLLABORATION
s = p.addSlide();
s.background = { color: LIGHT };
s.addShape(p.shapes.OVAL, { x: 0.55, y: 0.5, w: 0.16, h: 0.16, fill: { color: AMBER } });
s.addText("OPENING", { x: 0.8, y: 0.46, w: 11, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: BLUE, charSpacing: 2, margin: 0 });
s.addText("An unusual collaboration", { x: 0.55, y: 0.78, w: 12.4, h: 0.85, fontFace: HF, fontSize: 26, bold: true, color: NAVY, margin: 0 });
s.addText("This project has three “agents” collaborating — not one person using one tool.", { x: 0.6, y: 2.1, w: 12, h: 0.6, fontFace: BF, fontSize: 20, color: INK, margin: 0 });
card(s, 0.6, 3.1, 12.15, 2.0, NAVY);
s.addText([
  { text: "💬 A question to sit with:", options: { bold: true, color: AMBER, breakLine: true } },
  { text: "When you use AI, is it “you + a tool”,", options: { color: WHITE } },
  { text: "or “you + a partner that makes its own decisions”?", options: { color: ICE } },
], { x: 0.95, y: 3.45, w: 11.5, h: 1.4, fontFace: HF, fontSize: 23, lineSpacing: 38, valign: "middle", margin: 0 });
s.addText("This talk is the latter — and the partner brings a partner of its own.", { x: 0.6, y: 5.5, w: 12, h: 0.6, fontFace: BF, fontSize: 17, italic: true, color: BLUE, margin: 0 });
codeRef(s, "Three agents: Me (decisions) · Claude (builds in src/) · OpenEvolve (mutates inside evolvable_tools.py:18 EVOLVE-BLOCK)");

// ============================================================ 3 AGENDA
s = p.addSlide();
header(s, "Agenda", "Agenda & learning goals");
const parts = [
  ["1", "Collaboration architecture", "Nested layers · autonomy vs guardrails"],
  ["2", "Roles & responsibilities", "Me / Claude / OpenEvolve"],
  ["3", "Five collaboration patterns", "Transferable to your project"],
  ["4", "Climax case", "The birth of iter22 — and after"],
  ["5", "Reflection", "Who should do what"],
  ["6", "Closing", "Take home a workflow"],
];
parts.forEach((it, i) => {
  const x = 0.55 + (i % 3) * 4.15, y = 1.9 + Math.floor(i / 3) * 1.55;
  card(s, x, y, 3.9, 1.35);
  chip(s, x + 0.25, y + 0.25, it[0], NAVY);
  s.addText(it[1], { x: x + 0.9, y: y + 0.2, w: 2.85, h: 0.5, fontFace: HF, fontSize: 14, bold: true, color: NAVY, margin: 0 });
  s.addText(it[2], { x: x + 0.9, y: y + 0.68, w: 2.9, h: 0.6, fontFace: BF, fontSize: 11, color: MUTE, margin: 0 });
});
s.addText([
  { text: "What I want you to take away   ", options: { bold: true, color: AMBER } },
  { text: "a multi-layer AI collaboration architecture · how to set “autonomy vs guardrails” · 5 patterns · one rubric: what I do / delegate to AI / hand to evolution", options: { color: INK } },
], { x: 0.55, y: 5.25, w: 12.2, h: 0.8, fontFace: BF, fontSize: 13, valign: "middle", margin: 0 });
codeRef(s, "Full text: docs/collaboration_workflow_outline.md ｜ Technical details: docs/evolution_design_notes.md");

// ============================================================ 4 THREE ROLES
s = p.addSlide();
header(s, "Part 1 · Architecture", "Meet the three roles");
const roles = [
  ["I (Human)", "the presenter", "set direction · decide\nask · gatekeep", HUMAN],
  ["Claude Code", "my building partner (AI)", "implement · verify\nanalyze · report honestly", CLAUDE],
  ["OpenEvolve’s LLM", "the explorer Claude drives (AI)", "mutate autonomously · invent tools\nexplore evolution", OE],
];
roles.forEach((r, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.2, 3.85, 3.4);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.2, w: 3.85, h: 0.14, fill: { color: r[3] } });
  s.addText(r[0], { x: x + 0.25, y: 2.55, w: 3.35, h: 0.5, fontFace: HF, fontSize: 16, bold: true, color: r[3], margin: 0 });
  s.addText(r[1], { x: x + 0.25, y: 3.1, w: 3.4, h: 0.4, fontFace: BF, fontSize: 12.5, italic: true, color: MUTE, margin: 0 });
  s.addText(r[2], { x: x + 0.25, y: 3.7, w: 3.4, h: 1.6, fontFace: BF, fontSize: 14, color: INK, lineSpacing: 24, margin: 0 });
});
s.addText("Key: the last two are both AI, yet play completely different roles; I stand at the outermost layer, directing.", { x: 0.6, y: 5.9, w: 12.15, h: 0.5, fontFace: BF, fontSize: 14.5, italic: true, color: BLUE, margin: 0 });
codeRef(s, "Me+Claude write config/agents.yaml (production) · config/agents_evolving.yaml (seed) ｜ OpenEvolve edits evolvable_tools.py:18-58");

// ============================================================ 5 NESTED LAYERS
s = p.addSlide();
header(s, "Part 1 · Architecture", "Nested layers: a chain of delegated autonomy");
const layers = [
  ["I (Human)", "intent / decisions", HUMAN],
  ["Claude Code", "implementation / judgment", CLAUDE],
  ["OpenEvolve LLM", "autonomous exploration", OE],
];
layers.forEach((l, i) => {
  const x = 0.7 + i * 4.25;
  card(s, x, 2.6, 3.55, 2.0, WHITE);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.6, w: 3.55, h: 0.12, fill: { color: l[2] } });
  s.addText(l[0], { x: x + 0.25, y: 3.05, w: 3.1, h: 0.6, fontFace: HF, fontSize: 17, bold: true, color: l[2], margin: 0 });
  s.addText(l[1], { x: x + 0.25, y: 3.7, w: 3.1, h: 0.6, fontFace: BF, fontSize: 13, color: MUTE, margin: 0 });
  if (i < 2) s.addText("directs ▶", { x: x + 3.5, y: 3.0, w: 0.85, h: 1, fontFace: BF, fontSize: 11, bold: true, color: AMBER, align: "center", valign: "middle", margin: 0 });
});
s.addText("← autonomy rises to the right   |   guardrails must rise to the right too →", { x: 0.7, y: 5.0, w: 11.85, h: 0.4, fontFace: BF, fontSize: 14, bold: true, color: NAVY, align: "center", margin: 0 });
s.addText("This isn’t “me using a tool” — it’s me delegating autonomy down a three-layer chain.", { x: 0.7, y: 5.7, w: 12, h: 0.5, fontFace: HF, fontSize: 17, italic: true, color: NAVY, margin: 0 });
codeRef(s, "Me→config/*.yaml ｜ Claude→src/tools/ + src/crews/ + src/flows/ ｜ OpenEvolve→agents_evolving.yaml:1-44 EVOLVE-BLOCK");

// ============================================================ 5b ARCHITECT vs PROSPECTOR
s = p.addSlide();
header(s, "Part 1 · Architecture", "Claude × OpenEvolve: architect vs prospector");
card(s, 0.6, 1.95, 5.9, 1.95, "EAF0FA");
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 1.95, w: 0.12, h: 1.95, fill: { color: CLAUDE } });
s.addText("Claude = the architect", { x: 0.9, y: 2.15, w: 5.4, h: 0.45, fontFace: HF, fontSize: 18, bold: true, color: CLAUDE, margin: 0 });
s.addText("Intentional design · knows “why”\nfew moves · high leverage · explainable", { x: 0.9, y: 2.65, w: 5.4, h: 1.1, fontFace: BF, fontSize: 13.5, color: INK, lineSpacing: 22, margin: 0 });
card(s, 6.85, 1.95, 5.9, 1.95, "FBF1E0");
s.addShape(p.shapes.RECTANGLE, { x: 6.85, y: 1.95, w: 0.12, h: 1.95, fill: { color: OE } });
s.addText("OpenEvolve = the prospector", { x: 7.15, y: 2.15, w: 5.4, h: 0.45, fontFace: HF, fontSize: 18, bold: true, color: "B5791F", margin: 0 });
s.addText("Intentionless mutation + selection · knows only “what”\nmassive · low leverage · by sheer numbers", { x: 7.15, y: 2.65, w: 5.5, h: 1.1, fontFace: BF, fontSize: 13, color: INK, lineSpacing: 22, margin: 0 });
const cyc = [["① Design the space", "evolvable scope + guardrails", CLAUDE], ["② Explore at scale", "iter22 · 8 crashes", OE], ["③ Analyze & adjust", "diagnose → fix the frame", CLAUDE]];
cyc.forEach((c, i) => {
  const x = 0.6 + i * 4.25;
  card(s, x, 4.35, 3.6, 1.45, WHITE);
  s.addText(c[0], { x: x + 0.2, y: 4.55, w: 3.25, h: 0.5, fontFace: HF, fontSize: 14.5, bold: true, color: c[2], margin: 0 });
  s.addText(c[1], { x: x + 0.2, y: 5.05, w: 3.25, h: 0.6, fontFace: BF, fontSize: 12, color: MUTE, margin: 0 });
  if (i < 2) arrow(s, x + 3.62, 4.65, 0.6, NAVY);
});
s.addText("↺ Next round: use the findings to adjust the search space", { x: 0.6, y: 6.05, w: 12.15, h: 0.4, fontFace: BF, fontSize: 13, italic: true, color: NAVY, align: "center", margin: 0 });
s.addText("Not who’s stronger — different species, each filling a gap: Claude designs precisely but can’t blind-search; OpenEvolve blind-searches but doesn’t grasp what it found.", { x: 0.6, y: 6.5, w: 12.15, h: 0.5, fontFace: BF, fontSize: 13, color: INK, margin: 0 });
codeRef(s, "Claude builds the frame src/tools/tool_loader.py (77 AST / 120 sandbox) · OpenEvolve explores in evolvable_tools.py:18-58 EVOLVE-BLOCK");

// ============================================================ 6 AUTONOMY vs GUARDRAILS
s = p.addSlide();
header(s, "Part 1 · Architecture", "Each layer’s “autonomy vs guardrail”");
const gv = [
  ["Layer", "Autonomy", "Guardrail"],
  ["I (Human)", "final decisions", "my own judgment, domain knowledge"],
  ["Claude", "implement + analyze", "my review, git PR flow, honest reporting"],
  ["OpenEvolve LLM", "mutate + invent", "Failure Taxonomy (clamp / sandbox)"],
];
const rc = [HUMAN, CLAUDE, OE];
const td = [];
for (let ri = 0; ri < gv.length; ri++) {
  const row = [];
  for (let ci = 0; ci < 3; ci++) {
    row.push({
      text: gv[ri][ci],
      options: {
        fontFace: ri === 0 ? HF : (ci === 0 ? HF : BF), fontSize: ri === 0 ? 15 : 14,
        bold: ri === 0 || ci === 0,
        color: ri === 0 ? WHITE : (ci === 0 ? rc[ri - 1] : INK),
        fill: { color: ri === 0 ? NAVY : (ri % 2 ? WHITE : LIGHT) },
        align: "left", valign: "middle",
      },
    });
  }
  td.push(row);
}
s.addTable(td, { x: 0.6, y: 2.1, w: 12.15, colW: [3.0, 3.4, 5.75], rowH: [0.6, 0.9, 0.9, 0.9], border: { pt: 1, color: "E2E8F0" } });
card(s, 0.6, 5.95, 12.15, 0.95, NAVY);
s.addText("Maxim: the more I let it act autonomously, the stronger the guardrail I build first — “worst case is degradation, not a crash”.", { x: 0.95, y: 5.95, w: 11.5, h: 0.95, fontFace: HF, fontSize: 16, bold: true, color: AMBER, valign: "middle", margin: 0 });
codeRef(s, "Guardrails: retrieval_executor.py:53 normalize_policy (clamp) · tool_loader.py:77-177 (AST→sandbox→wrap)");

// ============================================================ 7 COLLABORATION LOOP
s = p.addSlide();
header(s, "Part 1 · Architecture", "The collaboration loop: every PR, every experiment");
const ring = [
  ["My intent", HUMAN], ["Claude builds", CLAUDE], ["Verify", CLAUDE],
  ["Report honestly", CLAUDE], ["I decide", HUMAN],
];
const cx = 6.66, cy = 4.15, radX = 3.95, radY = 1.7, cw = 2.5, ch = 0.85;
ring.forEach((r, i) => {
  const ang = -90 + i * (360 / ring.length);
  const rx = cx + radX * Math.cos(ang * Math.PI / 180) - cw / 2;
  const ry = cy + radY * Math.sin(ang * Math.PI / 180) - ch / 2;
  card(s, rx, ry, cw, ch, WHITE);
  s.addShape(p.shapes.RECTANGLE, { x: rx, y: ry, w: 0.1, h: ch, fill: { color: r[1] } });
  s.addText(r[0], { x: rx + 0.18, y: ry, w: cw - 0.25, h: ch, fontFace: HF, fontSize: 14, bold: true, color: r[1], valign: "middle", align: "center", margin: 0 });
});
s.addText("↻", { x: cx - 0.6, y: cy - 0.65, w: 1.2, h: 1.2, fontFace: HF, fontSize: 50, bold: true, color: AMBER, align: "center", valign: "middle", margin: 0 });
s.addText("(next intent)", { x: cx - 1.0, y: cy + 0.5, w: 2.0, h: 0.4, fontFace: BF, fontSize: 11, italic: true, color: MUTE, align: "center", margin: 0 });
codeRef(s, "Workflow in CLAUDE.md “Git workflow” (main only takes PRs) · landed PRs in docs/evolution_design_notes.md §11");

// ============================================================ 8 WHY WORTH LEARNING
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("WHY THIS ARCHITECTURE IS WORTH LEARNING", { x: 1, y: 1.7, w: 11.5, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 2, margin: 0 });
s.addText("AI increasingly\n“uses other AIs / tools”", { x: 0.95, y: 2.3, w: 11.5, h: 1.8, fontFace: HF, fontSize: 38, bold: true, color: WHITE, lineSpacing: 46, margin: 0 });
s.addText("Collaboration is no longer single-layer. I want this project to show: how to safely delegate autonomy, layer by layer.", { x: 1, y: 4.7, w: 11.5, h: 1, fontFace: BF, fontSize: 18, color: ICE, margin: 0 });
codeRef(s, "Overall goal in docs/evolution_design_notes.md §1 (background & goals)", true);

// ============================================================ 9 MY ROLE
s = p.addSlide();
header(s, "Part 2 · Roles", "My role: the steering wheel and the brake");
const me = [
  ["Set direction", "“optimize every facet of the agent crew”"],
  ["Make irreversible calls", "whether to merge, which experiment to run, whether to change the system"],
  ["Ask & challenge", "drive design deeper with questions"],
  ["Gatekeep the process", "insist on the git PR flow"],
];
me.forEach((m, i) => {
  const y = 1.95 + i * 1.0;
  card(s, 0.6, y, 12.15, 0.86);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 0.86, fill: { color: HUMAN } });
  s.addText(m[0], { x: 0.95, y, w: 3.5, h: 0.86, fontFace: HF, fontSize: 16, bold: true, color: HUMAN, valign: "middle", margin: 0 });
  s.addText(m[1], { x: 4.5, y, w: 8.1, h: 0.86, fontFace: BF, fontSize: 14, color: INK, valign: "middle", margin: 0 });
});
s.addText("Real example: I insist “main only takes PRs” — once Claude forgot to branch, and I corrected it on the spot.", { x: 0.6, y: 6.05, w: 12.15, h: 0.5, fontFace: BF, fontSize: 14, italic: true, color: BLUE, margin: 0 });
codeRef(s, "Rule written in CLAUDE.md “Git workflow: main only takes PR merges, no direct commits”");

// ============================================================ 10 CLAUDE'S ROLE
s = p.addSlide();
header(s, "Part 2 · Roles", "Claude’s role: implementation and judgment");
const cl = [
  "Turn my intent into code + tests",
  "Read the source to “verify” — don’t trust the docs blindly",
  "Run experiments, analyze data",
  "Report honestly — proactively surface bugs and limits",
  "Maintain docs / PRs",
];
cl.forEach((t, i) => {
  const y = 1.95 + i * 0.82;
  s.addShape(p.shapes.OVAL, { x: 0.7, y: y + 0.12, w: 0.16, h: 0.16, fill: { color: CLAUDE } });
  s.addText(t, { x: 1.0, y, w: 11.5, h: 0.5, fontFace: BF, fontSize: 16.5, color: INK, valign: "middle", margin: 0 });
});
card(s, 0.6, 6.1, 12.15, 0.95, NAVY);
s.addText("Real example: Claude read OpenEvolve’s source and found that “exactly one EVOLVE-BLOCK” is a recommendation, not a hard limit.", { x: 0.95, y: 6.1, w: 11.5, h: 0.95, fontFace: BF, fontSize: 14, color: WHITE, valign: "middle", margin: 0 });
codeRef(s, "Read-the-source finding in docs/evolution_design_notes.md §9 (EVOLVE-BLOCK truth: parse_evolve_blocks is never called)");

// ============================================================ 11 OPENEVOLVE'S ROLE
s = p.addSlide();
header(s, "Part 2 · Roles", "OpenEvolve’s role: the autonomous explorer");
s.addText([
  { text: "Inside the safe frame Claude built, it ", options: { color: INK } },
  { text: "mutates autonomously", options: { bold: true, color: OE } },
  { text: " — evolving the agent prompt, inventing tools, exploring paths.", options: { color: INK } },
], { x: 0.6, y: 2.1, w: 12, h: 0.6, fontFace: BF, fontSize: 18, margin: 0 });
card(s, 0.6, 3.0, 12.15, 2.4, "FBF1E0");
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 3.0, w: 0.12, h: 2.4, fill: { color: OE } });
s.addText("Real example", { x: 0.95, y: 3.2, w: 11.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: "B5791F", margin: 0 });
s.addText("It evolved a rating formula that splits on user_std into 4 segments — nobody taught it; neither I nor Claude ever wrote it.", { x: 0.95, y: 3.75, w: 11.4, h: 1.4, fontFace: BF, fontSize: 18, color: INK, lineSpacing: 28, margin: 0 });
s.addText("It can “find”, but it doesn’t know what it found — exactly the line between prospector and architect.", { x: 0.6, y: 5.7, w: 12, h: 0.5, fontFace: BF, fontSize: 15, italic: true, color: BLUE, margin: 0 });
codeRef(s, "Evolution space: config/agents_evolving.yaml:1-44 EVOLVE-BLOCK (prompt) + evolvable_tools.py:18-58 (tools)");

// ============================================================ 12 COMPLEMENTARY
s = p.addSlide();
header(s, "Part 2 · Roles", "Three complements — none is optional");
const miss = [
  ["Only me (Human)", "no time / energy to do all the implementation", HUMAN],
  ["Only Claude", "no direction or final judgment; makes irreversible mistakes", CLAUDE],
  ["Only OpenEvolve", "breaks itself (the earlier run failed 36% of the time)", OE],
];
miss.forEach((m, i) => {
  const y = 2.1 + i * 1.4;
  card(s, 0.6, y, 12.15, 1.2);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 1.2, fill: { color: m[2] } });
  s.addText(m[0], { x: 0.95, y, w: 4.0, h: 1.2, fontFace: HF, fontSize: 17, bold: true, color: m[2], valign: "middle", margin: 0 });
  s.addText(m[1], { x: 5.1, y, w: 7.5, h: 1.2, fontFace: BF, fontSize: 15.5, color: INK, valign: "middle", margin: 0 });
});
s.addText("Each layer fills a gap — remove my layer, and there’s no direction.", { x: 0.6, y: 6.5, w: 12, h: 0.4, fontFace: BF, fontSize: 15, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "“earlier run 36% crash → full architecture 0” comparison in docs/evolution_design_notes.md §12.7");

// ============================================================ 13 PATTERN 1
s = p.addSlide();
header(s, "Part 3 · Patterns", "Pattern 1: questions that deepen the design");
card(s, 0.6, 1.95, 5.9, 4.5, "EAF0FA");
s.addText("The good question I asked", { x: 0.9, y: 2.2, w: 5.4, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: HUMAN, margin: 0 });
s.addText("“How can an agent safely evolve, use different tools, even create new tools — without crashing on tool calling?”", { x: 0.9, y: 2.7, w: 5.4, h: 2.2, fontFace: HF, fontSize: 17, italic: true, color: NAVY, lineSpacing: 28, margin: 0 });
s.addText("Not “fix my bug”, but a design question that pushes deeper.", { x: 0.9, y: 5.5, w: 5.4, h: 0.8, fontFace: BF, fontSize: 13, color: MUTE, margin: 0 });
card(s, 6.8, 1.95, 5.95, 4.5, WHITE);
s.addText("The answer it forced: a failure taxonomy", { x: 7.1, y: 2.2, w: 5.5, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: CLAUDE, margin: 0 });
s.addText([
  { text: "Instead of try/except, Claude layered it first:", options: { color: INK, breakLine: true } },
  { text: "L1 protocol · L2 params · L3 strategy · L4 digestion · L5 contract", options: { fontFace: CF, fontSize: 11.5, bold: true, color: BLUE, breakLine: true } },
  { text: "→ constitution: graceful degradation, not crash", options: { color: INK, breakLine: true } },
  { text: "→ landed: L0 observe + L1 clamp + L2 sandbox", options: { color: INK } },
], { x: 7.1, y: 2.75, w: 5.5, h: 2.3, fontSize: 13.5, lineSpacing: 24, margin: 0 });
s.addText([{ text: "Result   ", options: { bold: true, color: GREEN } }, { text: "tool-crash rate 36% → 0", options: { bold: true, color: GREEN } }], { x: 7.1, y: 5.7, w: 5.4, h: 0.5, fontFace: HF, fontSize: 16, margin: 0 });
s.addText("A good question beats a good answer — by asking deeper, I turned a quick patch into a transferable layered framework.", { x: 0.6, y: 6.6, w: 12.15, h: 0.4, fontFace: BF, fontSize: 13.5, italic: true, color: AMBER, align: "center", margin: 0 });
codeRef(s, "5-layer taxonomy docs/evolution_design_notes.md §3 ｜ landed in src/tools/{interaction_tool_wrapper,retrieval_executor,tool_loader}.py");

// ============================================================ 14 PATTERN 2
s = p.addSlide();
header(s, "Part 3 · Patterns", "Pattern 2: honest reporting, catching the bug");
card(s, 0.6, 2.1, 5.95, 3.4, "F7E9E7");
s.addText("Looked perfect", { x: 0.9, y: 2.35, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "combined_score", options: { fontFace: CF, fontSize: 16, bold: true, color: INK, breakLine: true } },
  { text: "= 0.8452", options: { fontFace: CF, fontSize: 30, bold: true, color: RED } },
], { x: 0.9, y: 2.9, w: 5.4, h: 1.6, lineSpacing: 36, margin: 0 });
s.addText("Pretty score — nobody would suspect it.", { x: 0.9, y: 4.7, w: 5.4, h: 0.6, fontFace: BF, fontSize: 14, italic: true, color: MUTE, margin: 0 });
card(s, 6.8, 2.1, 5.95, 3.4, "E7F2EC");
s.addText("Claude verified proactively", { x: 7.1, y: 2.35, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "Checked ", options: { color: INK } },
  { text: "agent.tools", options: { fontFace: CF, bold: true, color: NAVY } },
  { text: " directly → found ", options: { color: INK } },
  { text: "[]", options: { fontFace: CF, fontSize: 18, bold: true, color: RED, breakLine: true } },
  { text: "The tools never attached! Surfaced it + added regression tests.", options: { color: INK } },
], { x: 7.1, y: 2.9, w: 5.4, h: 1.8, fontSize: 15, lineSpacing: 26, margin: 0 });
card(s, 0.6, 5.6, 12.15, 1.35, NAVY);
s.addText("“ A healthy score ≠ correct behavior ”   AI’s honesty is the bedrock of collaboration.", { x: 0.95, y: 5.6, w: 11.5, h: 1.35, fontFace: HF, fontSize: 20, bold: true, color: AMBER, valign: "middle", margin: 0 });
codeRef(s, "Cause simulation_crew.py:21-30 graceful [] hides it · fix tool_loader.py:164 · regression tests tests/test_tool_loader.py:185-203");

// ============================================================ 15 PATTERN 3
s = p.addSlide();
header(s, "Part 3 · Patterns", "Pattern 3: I gatekeep irreversible actions");
s.addText("Claude asks me first, then acts — it never runs irreversible actions on its own.", { x: 0.6, y: 2.05, w: 12, h: 0.5, fontFace: BF, fontSize: 18, color: INK, margin: 0 });
const irr = ["merge PR", "4-hour experiment", "brew install", "change system settings", "create a new GitHub repo", "install LibreOffice"];
irr.forEach((t, i) => {
  const x = 0.6 + (i % 3) * 4.15, y = 2.9 + Math.floor(i / 3) * 1.2;
  card(s, x, y, 3.9, 0.95);
  s.addShape(p.shapes.RECTANGLE, { x, y, w: 0.1, h: 0.95, fill: { color: RED } });
  s.addText(t, { x: x + 0.25, y, w: 3.55, h: 0.95, fontFace: CF, fontSize: 13.5, bold: true, color: NAVY, valign: "middle", margin: 0 });
});
s.addText("Real example: before creating a repo or installing LibreOffice, Claude asked me first. Gatekeeping the irreversible is my layer’s core job.", { x: 0.6, y: 5.7, w: 12.15, h: 0.6, fontFace: BF, fontSize: 14, italic: true, color: BLUE, margin: 0 });
codeRef(s, "Principle in CLAUDE.md “Git workflow” (main only takes PR merges, no direct commits)");

// ============================================================ 16 PATTERN 4
s = p.addSlide();
header(s, "Part 3 · Patterns", "Pattern 4: complementary human-AI knowledge");
card(s, 0.6, 2.2, 5.95, 3.5, "E7F2EC");
s.addText("I fill Claude’s blind spot", { x: 0.9, y: 2.45, w: 5.3, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: HUMAN, margin: 0 });
s.addText("Claude didn’t know “closing my Mac’s lid kills background processes” — that’s physical / environmental knowledge.", { x: 0.9, y: 3.0, w: 5.45, h: 2.4, fontFace: BF, fontSize: 15.5, color: INK, lineSpacing: 26, margin: 0 });
card(s, 6.8, 2.2, 5.95, 3.5, "EAF0FA");
s.addText("Claude fills mine", { x: 7.1, y: 2.45, w: 5.3, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: CLAUDE, margin: 0 });
s.addText("Once I mentioned it, Claude explained caffeinate and set it up (prevent system sleep but let the screen rest) — that’s tooling detail.", { x: 7.1, y: 3.0, w: 5.45, h: 2.4, fontFace: BF, fontSize: 15.5, color: INK, lineSpacing: 26, margin: 0 });
s.addText("My “environmental knowledge” × Claude’s “tooling detail” — complementary; without either, the run won’t finish.", { x: 0.6, y: 6.0, w: 12.15, h: 0.6, fontFace: BF, fontSize: 15, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "How the full 50-iter run finished: docs/evolution_design_notes.md §12.7(b) (nohup detach harness + caffeinate -i -s)");

// ============================================================ 17 PATTERN 5
s = p.addSlide();
header(s, "Part 3 · Patterns", "Pattern 5: layered delegation of autonomy (the core)");
s.addText("I had Claude build a safe frame (L0/L1/L2 Failure Taxonomy) for OpenEvolve — only with the frame in place did I dare let go.", { x: 0.6, y: 2.0, w: 12.15, h: 0.6, fontFace: BF, fontSize: 16, color: INK, margin: 0 });
card(s, 0.6, 2.9, 5.95, 2.9, "F7E9E7");
s.addText("No frame (earlier run)", { x: 0.9, y: 3.15, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([{ text: "36%", options: { fontFace: HF, fontSize: 52, bold: true, color: RED, breakLine: true } }, { text: "of iterations crash", options: { color: INK } }], { x: 0.9, y: 3.7, w: 5.4, h: 1.8, lineSpacing: 36, margin: 0 });
card(s, 6.8, 2.9, 5.95, 2.9, "E7F2EC");
s.addText("Full architecture", { x: 7.1, y: 3.15, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([{ text: "0", options: { fontFace: HF, fontSize: 52, bold: true, color: GREEN, breakLine: true } }, { text: "tool-calling crashes", options: { color: INK } }], { x: 7.1, y: 3.7, w: 5.4, h: 1.8, lineSpacing: 36, margin: 0 });
s.addText("My precondition for delegating autonomy: first build a “worst case is only degradation” guardrail.", { x: 0.6, y: 6.1, w: 12.15, h: 0.5, fontFace: HF, fontSize: 17, bold: true, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "Three guardrails: interaction_tool_wrapper.py(L0) · retrieval_executor.py(L1) · tool_loader.py(L2) ｜ data §12.7");

// ============================================================ 18 FIVE PATTERNS RECAP
s = p.addSlide();
header(s, "Part 3 · Patterns", "Five patterns · one-page recap");
const pat = [
  ["1", "Questions deepen design", "my open question → the failure taxonomy"],
  ["2", "Honest reporting catches bugs", "agent.tools == [] surfaced proactively"],
  ["3", "I gatekeep irreversibles", "merge / brew / new repo — ask before acting"],
  ["4", "Complementary knowledge", "my environment sense × Claude’s tooling detail"],
  ["5", "Layered delegation", "build guardrails first, then let it evolve"],
];
pat.forEach((r, i) => {
  const y = 1.9 + i * 0.98;
  card(s, 0.6, y, 12.15, 0.84);
  chip(s, 0.85, y + 0.17, r[0], NAVY);
  s.addText(r[1], { x: 1.55, y, w: 4.3, h: 0.84, fontFace: HF, fontSize: 15, bold: true, color: NAVY, valign: "middle", margin: 0 });
  s.addText(r[2], { x: 6.0, y, w: 6.6, h: 0.84, fontFace: BF, fontSize: 13.5, color: INK, valign: "middle", margin: 0 });
});
s.addText("💬 Which pattern could you use in your own project tomorrow?", { x: 0.6, y: 6.78, w: 12, h: 0.3, fontFace: BF, fontSize: 14, italic: true, color: AMBER, margin: 0 });
codeRef(s, "Full five-pattern version in docs/collaboration_workflow_outline.md (Part 3)");

// ============================================================ 19 THREE LAYERS PRODUCE ITER22
s = p.addSlide();
header(s, "Part 4 · Climax", "Three layers collaborate to produce one evolved artifact");
const contrib = [
  ["I (Human)", "decided to run 50 iters on the full\narchitecture; set caffeinate to run overnight", HUMAN],
  ["Claude", "built the L0/L1/L2 frame, launched\nevolution, detached harness, analyzed", CLAUDE],
  ["OpenEvolve", "autonomously evolved iter22’s\n“segmented rating formula” (0.842)", OE],
];
contrib.forEach((c, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.1, 3.85, 2.6);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.1, w: 3.85, h: 0.12, fill: { color: c[2] } });
  s.addText(c[0], { x: x + 0.25, y: 2.4, w: 3.35, h: 0.5, fontFace: HF, fontSize: 16, bold: true, color: c[2], margin: 0 });
  s.addText(c[1], { x: x + 0.25, y: 2.95, w: 3.45, h: 1.6, fontFace: BF, fontSize: 12.5, color: INK, lineSpacing: 19, margin: 0 });
});
card(s, 0.6, 5.0, 12.15, 1.9, "11183B");
s.addText("iter22 formula (excerpt)", { x: 0.9, y: 5.15, w: 6, h: 0.4, fontFace: HF, fontSize: 14, bold: true, color: AMBER, margin: 0 });
s.addText([
  { text: "if user_std < 0.7:  predicted = user_mean + 0.55·(item_mean − user_mean)", options: { color: WHITE, breakLine: true } },
  { text: "elif < 1.0: +0.45·…   elif < 1.3: +0.30·…   else: user_median + 0.20·…", options: { color: ICE, breakLine: true } },
  { text: "clamp [1,5] · round 0.5", options: { color: WHITE } },
], { x: 0.9, y: 5.6, w: 11.5, h: 1.2, fontFace: CF, fontSize: 13, lineSpacing: 22, margin: 0 });
codeRef(s, "Evolution target config/agents_evolving.yaml EVOLVE-BLOCK · iter22 data docs/evolution_design_notes.md §12.7(b)");

// ============================================================ 20 NO LAYER ALONE
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("ITER22 IS AN EMERGENT PRODUCT OF THREE-LAYER COLLABORATION", { x: 1, y: 1.6, w: 11.8, h: 0.4, fontFace: BF, fontSize: 14, bold: true, color: ICE, charSpacing: 1, margin: 0 });
const none = [
  ["Me", "wouldn’t hand-write that formula", HUMAN],
  ["Claude", "wouldn’t think of that formula itself", CLAUDE],
  ["OpenEvolve", "without the frame, breaks itself", OE],
];
none.forEach((n, i) => {
  const y = 2.4 + i * 1.3;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 1, y, w: 2.9, h: 1.0, rectRadius: 0.08, fill: { color: n[2] } });
  s.addText(n[0], { x: 1, y, w: 2.9, h: 1.0, align: "center", valign: "middle", fontFace: HF, fontSize: 20, bold: true, color: WHITE, margin: 0 });
  s.addText(n[1], { x: 4.3, y, w: 8.3, h: 1.0, fontFace: HF, fontSize: 21, color: WHITE, valign: "middle", margin: 0 });
});
s.addText("No single layer could have done it alone.", { x: 1, y: 6.4, w: 11, h: 0.5, fontFace: HF, fontSize: 20, bold: true, italic: true, color: AMBER, margin: 0 });
codeRef(s, "Three-layer data docs/evolution_design_notes.md §12.7 (baseline 0.72 → best 0.842, crash rate 16%)", true);

// ============================================================ 21 AFTER ITER22
s = p.addSlide();
header(s, "Part 4 · Climax", "The deeper part: what happened “after” iter22");
s.addText("I had Claude trace every descendant of iter22 (de559de9) — conclusion: no better offspring appeared after it.", { x: 0.6, y: 1.95, w: 12.15, h: 0.5, fontFace: BF, fontSize: 15.5, color: INK, margin: 0 });
const aft = [
  ["Over-engineering", "4-segment formula → 5, 6 segments, more parameters"],
  ["Sub-metrics trade off", "preference wobbles, review_generation regresses → score stalls"],
  ["Islands converge", "migration spreads iter22’s genes across 3 islands → diversity collapses"],
];
aft.forEach((a, i) => {
  const y = 2.6 + i * 1.05;
  card(s, 0.6, y, 12.15, 0.92);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 0.92, fill: { color: OE } });
  s.addText(a[0], { x: 0.95, y, w: 3.5, h: 0.92, fontFace: HF, fontSize: 14.5, bold: true, color: "B5791F", valign: "middle", margin: 0 });
  s.addText(a[1], { x: 4.6, y, w: 8.0, h: 0.92, fontFace: BF, fontSize: 13.5, color: INK, valign: "middle", margin: 0 });
});
card(s, 0.6, 5.85, 12.15, 1.25, NAVY);
s.addText([
  { text: "Claude’s diagnosis for me: ", options: { bold: true, color: AMBER } },
  { text: "iter22 is a local optimum. OpenEvolve can “find” it, but “why it’s stuck here and how to escape” is structurally beyond a prospector — it has no concept of “local optimum”.", options: { color: WHITE } },
], { x: 0.95, y: 5.85, w: 11.5, h: 1.25, fontFace: BF, fontSize: 14, valign: "middle", lineSpacing: 22, margin: 0 });
codeRef(s, "Island/migration config/openevolve_config.yaml:71-78 (num_islands:3, migration_interval/rate) · data §12.7(b)");

// ============================================================ 22 FAILURE AS INSIGHT
s = p.addSlide();
header(s, "Part 4 · Climax", "Even “failure” is a shared insight");
s.addText("8 low-score crashes → I had Claude comb the data for causes:", { x: 0.6, y: 2.1, w: 12, h: 0.5, fontFace: BF, fontSize: 18, color: INK, margin: 0 });
card(s, 0.6, 3.0, 5.95, 2.4, "F7E9E7");
s.addText([{ text: "5×", options: { fontFace: HF, fontSize: 44, bold: true, color: RED, breakLine: true } }, { text: "broken YAML syntax", options: { color: INK } }, { text: "(full-rewrite risk, bypasses clamp)", options: { fontSize: 12, color: MUTE } }], { x: 0.9, y: 3.3, w: 5.4, h: 1.9, lineSpacing: 30, margin: 0 });
card(s, 6.8, 3.0, 5.95, 2.4, "FBF1E0");
s.addText([{ text: "3×", options: { fontFace: HF, fontSize: 44, bold: true, color: "B5791F", breakLine: true } }, { text: "rate limit 429", options: { color: INK } }, { text: "(NVIDIA NIM throttling)", options: { fontSize: 12, color: MUTE } }], { x: 7.1, y: 3.3, w: 5.4, h: 1.9, lineSpacing: 30, margin: 0 });
s.addText("Collaboration produces not only successes but shared understanding of failure — both read together across all three layers.", { x: 0.6, y: 5.9, w: 12.15, h: 0.6, fontFace: HF, fontSize: 16, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "8/50 low-score causes docs/evolution_design_notes.md §12.7(b) · diff_based_evolution:false (full-rewrite) see openevolve_config.yaml:18");

// ============================================================ 23 WHO DOES WHAT
s = p.addSlide();
header(s, "Part 5 · Reflection", "Who should do what?");
const who = [
  ["I (Human) do it myself", "direction · value judgments\nirreversible decisions · domain/physical knowledge", HUMAN],
  ["Delegate to Claude", "implement · verify · analyze\ndocs · honest reporting", CLAUDE],
  ["Hand to evolution (OpenEvolve)", "large-scale exploration & invention\nwithin a safe frame", OE],
];
who.forEach((c, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.2, 3.85, 3.0);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.2, w: 3.85, h: 0.14, fill: { color: c[2] } });
  s.addText(c[0], { x: x + 0.22, y: 2.5, w: 3.45, h: 0.8, fontFace: HF, fontSize: 15, bold: true, color: c[2], margin: 0 });
  s.addText(c[1], { x: x + 0.22, y: 3.35, w: 3.5, h: 1.7, fontFace: BF, fontSize: 13.5, color: INK, lineSpacing: 22, margin: 0 });
});
s.addText("I split the work by three criteria: reversibility · whether value judgment is needed · size of the search space.", { x: 0.6, y: 5.6, w: 12, h: 0.6, fontFace: HF, fontSize: 16, bold: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "Mapping: Me→config/*.yaml ｜ Claude→src/ + tests/ ｜ evolution→EVOLVE-BLOCK (agents_evolving.yaml / evolvable_tools.py)");

// ============================================================ 24 KEY TAKEAWAYS
s = p.addSlide();
header(s, "Part 5 · Reflection", "Key takeaways");
const tk = [
  "AI collaboration is going multi-layer — “delegating autonomy” is a new skill",
  "The deeper the layer, the stronger the guardrail (worst case is degradation, not a crash)",
  "Honest reporting + human gatekeeping of irreversibles = the safety bedrock",
  "Good questions drive good design; even failures can be understood together",
];
tk.forEach((t, i) => {
  const y = 2.0 + i * 1.1;
  card(s, 0.6, y, 12.15, 0.95);
  chip(s, 0.9, y + 0.22, `${i + 1}`, AMBER, NAVY);
  s.addText(t, { x: 1.6, y, w: 11.0, h: 0.95, fontFace: BF, fontSize: 15.5, color: INK, valign: "middle", margin: 0 });
});
s.addText("💬 Back to the opening: is your AI a tool, or a partner?", { x: 0.6, y: 6.6, w: 12, h: 0.35, fontFace: BF, fontSize: 14, italic: true, color: AMBER, margin: 0 });
codeRef(s, "Sources docs/evolution_design_notes.md §3 (taxonomy) · §4 (protocol/policy) · §12.7 (data)");

// ============================================================ 25 CLOSING
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("Thank you · Q & A", { x: 0.95, y: 1.9, w: 11.5, h: 1, fontFace: HF, fontSize: 42, bold: true, color: WHITE, margin: 0 });
s.addText("The real product of this project isn’t just a 0.842 agent —\nit’s the “human + AI + evolution” safe-collaboration workflow I take home.", { x: 1, y: 3.2, w: 11.5, h: 1.4, fontFace: HF, fontSize: 19, italic: true, color: ICE, lineSpacing: 34, margin: 0 });
chain.forEach((c, i) => {
  const x = 1.0 + i * 3.5;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 5.0, w: 2.6, h: 0.7, rectRadius: 0.08, fill: { color: c[1] } });
  s.addText(c[0], { x, y: 5.0, w: 2.6, h: 0.7, align: "center", valign: "middle", fontFace: HF, fontSize: 16, bold: true, color: WHITE, margin: 0 });
  if (i < 2) s.addText("▶", { x: x + 2.65, y: 5.0, w: 0.7, h: 0.7, align: "center", valign: "middle", fontFace: BF, fontSize: 14, color: AMBER, margin: 0 });
});
s.addText([
  { text: "Resources   ", options: { bold: true, color: AMBER } },
  { text: "docs/collaboration_workflow_outline.md · docs/evolution_design_notes.md · docs/teaching_slides_outline.md", options: { color: ICE } },
], { x: 1, y: 6.3, w: 11.5, h: 0.6, fontFace: BF, fontSize: 13, margin: 0 });
codeRef(s, "Two outlines docs/collaboration_workflow_outline.md · docs/teaching_slides_outline.md ｜ technical docs/evolution_design_notes.md", true);

p.writeFile({ fileName: "/tmp/deck/Three-Layer_Collaboration_EN.pptx" }).then(f => console.log("WROTE", f));
