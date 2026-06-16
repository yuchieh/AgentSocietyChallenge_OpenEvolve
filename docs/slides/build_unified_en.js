const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "AgentSocietyChallenge_OpenEvolve";
p.title = "Human × AI × Evolution — Building a Safely-Evolvable Agent System";

const NAVY = "1E2761", BLUE = "3A5BA0", ICE = "CADCFC";
const AMBER = "E8A33D", GREEN = "2E9E6B", RED = "C0453B";
const INK = "23272E", MUTE = "6B7280", LIGHT = "F4F7FB", WHITE = "FFFFFF";
const HF = "Georgia", BF = "Calibri", CF = "Consolas";
const HUMAN = GREEN, CLAUDE = BLUE, OE = AMBER;
const W = 13.33, H = 7.5;
const sh = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 135, opacity: 0.12 });
const NOTES = [
  "One talk covering both the system we built and the collaboration that built it.",
  "Lead with results: baseline 0.28 to 0.72, best 0.842, tool crashes 36% to zero — by three agents together.",
  "The collaboration story is the shell; the technical taxonomy is the worked case embedded inside.",
  "Introduce the three players — me, Claude, OpenEvolve — two AI in very different roles.",
  "Autonomy rises inward and guardrails must too — delegation down a three-layer chain.",
  "Claude the architect knows why; OpenEvolve the prospector only knows what — complementary.",
  "Each layer's autonomy is matched by a guardrail under one constitution: graceful degradation, never a crash.",
  "Before building, I keep all three on the same context — the bedrock that lets us reconnect after any interruption.",
  "Set the scene: the task, the three-agent CrewAI pipeline, and OpenEvolve's mutate-score-select loop.",
  "An earlier unprotected run crashed to the 0.35 floor about a third of the time.",
  "The seam: my question forced Claude's failure taxonomy — five failure modes, each with its own defense.",
  "The principle behind every defense: freeze the protocol, free the policy — like a power socket.",
  "Three defenses L0/L1/L2; L0 makes every tool call visible so the next mutation can act on it.",
  "L1 clamps illegal values and never raises; the whitelist is the alphabet, the policy the sentence.",
  "Wiring turns data_retriever from caller to extractor, removing the crash risk.",
  "Four sandbox gates let evolution invent tools safely, and docstrings co-evolve for discoverability.",
  "A disjoint holdout is the overfitting mirror — a big gap means memorized, not generalized.",
  "Use the two sub-metrics as diversity dimensions to keep extreme specialists alive.",
  "Honest reporting caught it: a 0.84 score hid that the tools never attached.",
  "I gatekeep irreversibles, and our knowledge is complementary — environment sense plus tooling detail.",
  "Build guardrails first, then delegate — 36% crashes became zero.",
  "Recap the five collaboration patterns and ask which they'd use tomorrow.",
  "iter22 is an emergent product — my decision, Claude's frame, OpenEvolve's formula.",
  "After iter22 it stalled into a local optimum — over-engineering, trade-offs, island convergence.",
  "Escaping isn't more generations; it's three knobs — more tasks, diverse island seeds, tool evolution.",
  "Even the eight crashes became insight: five broken YAML, three rate limits.",
  "A rubric by reversibility, whether value judgment is needed, and search-space size.",
  "Delegating autonomy is a new skill; honesty plus gatekeeping is the bedrock; a healthy score isn't correctness.",
  "The real product is a reusable human-plus-AI-plus-evolution workflow.",
];
let _ni = 0;
function mkSlide() { const sl = p.addSlide(); if (NOTES[_ni]) sl.addNotes(NOTES[_ni]); _ni++; return sl; }

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
  "evolvable_tools.py": "evolvable_tools.py", "CLAUDE.md": "CLAUDE.md",
  "src/tools/interaction_tool_wrapper.py": "src/tools/interaction_tool_wrapper.py", "interaction_tool_wrapper.py": "src/tools/interaction_tool_wrapper.py",
  "src/tools/retrieval_executor.py": "src/tools/retrieval_executor.py", "retrieval_executor.py": "src/tools/retrieval_executor.py",
  "src/tools/tool_loader.py": "src/tools/tool_loader.py", "tool_loader.py": "src/tools/tool_loader.py",
  "src/crews/simulation_crew.py": "src/crews/simulation_crew.py", "simulation_crew.py": "src/crews/simulation_crew.py",
  "src/flows/serving_flow.py": "src/flows/serving_flow.py", "serving_flow.py": "src/flows/serving_flow.py",
  "src/utils/create_sampled_dataset.py": "src/utils/create_sampled_dataset.py", "create_sampled_dataset.py": "src/utils/create_sampled_dataset.py",
  "scripts/validate_holdout.py": "scripts/validate_holdout.py", "validate_holdout.py": "scripts/validate_holdout.py",
  "tests/test_tool_loader.py": "tests/test_tool_loader.py", "test_tool_loader.py": "tests/test_tool_loader.py",
  "tests/test_retrieval_executor.py": "tests/test_retrieval_executor.py", "test_retrieval_executor.py": "tests/test_retrieval_executor.py",
  "config/openevolve_config.yaml": "config/openevolve_config.yaml", "openevolve_config.yaml": "config/openevolve_config.yaml",
  "config/agents_evolving.yaml": "config/agents_evolving.yaml", "agents_evolving.yaml": "config/agents_evolving.yaml",
  "config/agents.yaml": "config/agents.yaml", "agents.yaml": "config/agents.yaml",
  "config/tasks.yaml": "config/tasks.yaml", "tasks.yaml": "config/tasks.yaml",
  "docs/evolution_design_notes.md": "docs/evolution_design_notes.md", "evolution_design_notes.md": "docs/evolution_design_notes.md",
  "docs/collaboration_workflow_outline.md": "docs/collaboration_workflow_outline.md", "collaboration_workflow_outline.md": "docs/collaboration_workflow_outline.md",
  "docs/teaching_slides_outline.md": "docs/teaching_slides_outline.md", "teaching_slides_outline.md": "docs/teaching_slides_outline.md",
  "docs/unified_deck_outline.md": "docs/unified_deck_outline.md", "unified_deck_outline.md": "docs/unified_deck_outline.md",
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
const chain = [["Me", HUMAN], ["Claude", CLAUDE], ["OpenEvolve", OE]];

// ============================================================ S1 TITLE
let s = mkSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("HUMAN × CLAUDE CODE × OPENEVOLVE", { x: 1, y: 1.75, w: 11.5, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 3, margin: 0 });
s.addText("Human × AI × Evolution", { x: 0.95, y: 2.2, w: 11.8, h: 1.1, fontFace: HF, fontSize: 44, bold: true, color: WHITE, margin: 0 });
s.addText("Collaborating to build an agent system that “evolves safely”", { x: 1, y: 3.55, w: 11.5, h: 0.6, fontFace: BF, fontSize: 20, color: ICE, margin: 0 });
chain.forEach((c, i) => {
  const x = 1.0 + i * 3.7;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 5.0, w: 2.8, h: 0.8, rectRadius: 0.1, fill: { color: c[1] } });
  s.addText(c[0], { x, y: 5.0, w: 2.8, h: 0.8, align: "center", valign: "middle", fontFace: HF, fontSize: 18, bold: true, color: WHITE, margin: 0 });
  if (i < 2) s.addText("▶", { x: x + 2.85, y: 5.0, w: 0.8, h: 0.8, align: "center", valign: "middle", fontFace: BF, fontSize: 16, color: AMBER, margin: 0 });
});
s.addText("One talk covering both “how the system was built” and “how human + AI collaborated to build it”", { x: 1, y: 6.3, w: 11.8, h: 0.4, fontFace: BF, fontSize: 13, color: "8FA3C8", margin: 0 });
codeRef(s, "repo · entry points openevolve_evaluator.py · config/openevolve_config.yaml · config/agents_evolving.yaml", true);

// ============================================================ S2 RESULT TEASER
s = mkSlide();
header(s, "Opening", "What did we build?");
const stats = [
  ["baseline", "0.28 → 0.72", "stability dividend from the deterministic executor", HUMAN],
  ["best", "0.842", "iter22 (evolved to gen 22) grew the rating formula", CLAUDE],
  ["tool crashes", "36% → 0", "from breaking itself to zero tool-calling crashes", OE],
];
stats.forEach((t, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.2, 3.85, 3.0);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.2, w: 3.85, h: 0.14, fill: { color: t[3] } });
  s.addText(t[0], { x: x + 0.25, y: 2.5, w: 3.35, h: 0.4, fontFace: BF, fontSize: 14, color: MUTE, margin: 0 });
  s.addText(t[1], { x: x + 0.25, y: 2.95, w: 3.35, h: 0.9, fontFace: HF, fontSize: 29, bold: true, color: t[3], margin: 0 });
  s.addText(t[2], { x: x + 0.25, y: 4.0, w: 3.45, h: 1.0, fontFace: BF, fontSize: 13, color: INK, lineSpacing: 20, margin: 0 });
});
s.addText("And no single person wrote it — it’s the work of three agents collaborating: Me + Claude + OpenEvolve.", { x: 0.6, y: 5.6, w: 12, h: 0.6, fontFace: HF, fontSize: 17, italic: true, color: NAVY, align: "center", margin: 0 });

// ============================================================ S3 AGENDA
s = mkSlide();
header(s, "Agenda", "Agenda & learning goals");
const parts = [
  ["1", "Collaboration architecture", "three agents · autonomy vs guardrails"],
  ["2", "Problem & the seam", "evolution breaks itself → failure taxonomy"],
  ["3", "Technical core", "L0 / L1 / L2 layered solution"],
  ["4", "Trust mechanisms", "Train/Val · MAP-Elites"],
  ["5", "Collaboration patterns", "5 transferable patterns"],
  ["6", "Climax: iter22", "an emergent product of three layers"],
];
parts.forEach((it, i) => {
  const x = 0.55 + (i % 3) * 4.15, y = 1.9 + Math.floor(i / 3) * 1.5;
  card(s, x, y, 3.9, 1.3);
  chip(s, x + 0.25, y + 0.25, it[0], NAVY);
  s.addText(it[1], { x: x + 0.9, y: y + 0.18, w: 2.85, h: 0.5, fontFace: HF, fontSize: 13.5, bold: true, color: NAVY, margin: 0 });
  s.addText(it[2], { x: x + 0.9, y: y + 0.66, w: 2.9, h: 0.6, fontFace: BF, fontSize: 11, color: MUTE, margin: 0 });
});
s.addText([
  { text: "Learning goals   ", options: { bold: true, color: AMBER } },
  { text: "a three-layer collaboration architecture · how to set autonomy/guardrails · understand the failure taxonomy & L0/L1/L2 · 5 patterns · a rubric for what I do / delegate to AI / hand to evolution", options: { color: INK } },
], { x: 0.55, y: 5.2, w: 12.2, h: 0.8, fontFace: BF, fontSize: 12.5, valign: "middle", margin: 0 });
s.addText("Main thread: the collaboration story is the shell; the technical taxonomy is the worked case embedded inside.", { x: 0.55, y: 6.15, w: 12, h: 0.4, fontFace: BF, fontSize: 13, italic: true, color: BLUE, margin: 0 });

// ============================================================ S4 THREE ROLES
s = mkSlide();
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
codeRef(s, "Me+Claude write config/agents.yaml (production) · agents_evolving.yaml (seed) ｜ OpenEvolve edits evolvable_tools.py:18-58");

// ============================================================ S5 NESTED LAYERS
s = mkSlide();
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
codeRef(s, "Me→config/*.yaml ｜ Claude→src/tools/ + src/crews/ + src/flows/ ｜ OpenEvolve→agents_evolving.yaml EVOLVE-BLOCK");

// ============================================================ S6 ARCHITECT vs PROSPECTOR
s = mkSlide();
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
s.addText("Not who’s stronger — different species filling gaps: Claude designs precisely but can’t blind-search; OpenEvolve blind-searches but doesn’t grasp what it found.", { x: 0.6, y: 6.5, w: 12.15, h: 0.5, fontFace: BF, fontSize: 13, color: INK, margin: 0 });
codeRef(s, "Claude builds the frame src/tools/tool_loader.py (77 AST / 120 sandbox) · OpenEvolve explores in evolvable_tools.py:18-58 EVOLVE-BLOCK");

// ============================================================ S7 AUTONOMY vs GUARDRAIL + CONSTITUTION
s = mkSlide();
header(s, "Part 1 · Architecture", "Higher autonomy, stronger guardrail + the safety constitution");
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
s.addTable(td, { x: 0.6, y: 2.05, w: 12.15, colW: [3.0, 3.4, 5.75], rowH: [0.55, 0.82, 0.82, 0.82], border: { pt: 1, color: "E2E8F0" } });
card(s, 0.6, 5.55, 12.15, 1.35, NAVY);
s.addText("SAFETY CONSTITUTION", { x: 0.95, y: 5.7, w: 11, h: 0.4, fontFace: BF, fontSize: 13, bold: true, color: ICE, charSpacing: 2, margin: 0 });
s.addText("The more I let it act autonomously, the stronger the guardrail I build first — “worst case = graceful degradation, never a catastrophic crash”.", { x: 0.95, y: 6.05, w: 11.5, h: 0.7, fontFace: HF, fontSize: 16, bold: true, color: AMBER, margin: 0 });
codeRef(s, "Guardrails: retrieval_executor.py:53 normalize_policy (clamp) · tool_loader.py:77-177 (AST→sandbox→wrap)");

// ============================================================ S7b ALIGN CONTEXT FIRST
s = mkSlide();
header(s, "Part 1 · Architecture", "Where collaboration starts: align context first");
s.addText("Before anything, I (Human) keep all three on the same context — the bedrock of all collaboration.", { x: 0.6, y: 1.62, w: 12.15, h: 0.4, fontFace: BF, fontSize: 13.5, color: BLUE, margin: 0 });
const ctx = [
  ["Understand first, then act", "“Read & summarize this repo” / “Is the current block set up right?” — I state my understanding, you confirm, then we move", 0.6, 2.1],
  ["Recall key history", "“How can an agent evolve safely without crashing on tool calling?” — carries the earlier crash’s lesson into the present", 6.8, 2.1],
  ["Align state before acting", "“Where would this push go?” “Why no branch this time?” — never act on a fuzzy premise", 0.6, 4.1],
  ["Write a living doc to rebuild later", "evolution_design_notes as a living doc + “refer to our earlier design notes” — any interruption can be picked back up", 6.8, 4.1],
];
ctx.forEach((c) => {
  card(s, c[2], c[3], 5.95, 1.85);
  s.addShape(p.shapes.RECTANGLE, { x: c[2], y: c[3], w: 0.12, h: 1.85, fill: { color: HUMAN } });
  s.addText(c[0], { x: c[2] + 0.35, y: c[3] + 0.18, w: 5.4, h: 0.5, fontFace: HF, fontSize: 15, bold: true, color: HUMAN, margin: 0 });
  s.addText(c[1], { x: c[2] + 0.35, y: c[3] + 0.7, w: 5.45, h: 1.05, fontFace: BF, fontSize: 12, color: INK, lineSpacing: 18, margin: 0 });
});
card(s, 0.6, 6.2, 12.15, 0.82, NAVY);
s.addText("I act as the “owner” of context: align at the start, recall history, confirm continuously, write it down — so any interruption can be reconnected from the record.", { x: 0.95, y: 6.2, w: 11.5, h: 0.82, fontFace: HF, fontSize: 13.5, bold: true, color: AMBER, valign: "middle", margin: 0 });

// ============================================================ S8 THE STAGE
s = mkSlide();
header(s, "Part 2 · Problem", "The stage: the task + CrewAI + OpenEvolve");
s.addText([
  { text: "Track 1: ", options: { bold: true, color: NAVY } },
  { text: "predict a user’s ", options: { color: INK } },
  { text: "{stars, review}", options: { fontFace: CF, bold: true, color: BLUE } },
  { text: " for a business   fitness = overall_quality = (rating accuracy + text similarity) / 2", options: { color: INK } },
], { x: 0.6, y: 1.9, w: 12.15, h: 0.4, fontFace: BF, fontSize: 14.5, margin: 0 });
const ag = [["data_retriever", "fetch / extract data"], ["psychological_analyst", "analyze preference · habits"], ["behavior_simulator", "output {stars, review}"]];
ag.forEach((a, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.6, 3.6, 1.7);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.6, w: 3.6, h: 0.12, fill: { color: BLUE } });
  s.addText(a[0], { x: x + 0.22, y: 2.95, w: 3.2, h: 0.6, fontFace: CF, fontSize: 13, bold: true, color: NAVY, margin: 0 });
  s.addText(a[1], { x: x + 0.22, y: 3.5, w: 3.2, h: 0.6, fontFace: BF, fontSize: 12.5, color: MUTE, margin: 0 });
  if (i < 2) s.addText("→", { x: x + 3.62, y: 3.0, w: 0.5, h: 0.9, fontFace: HF, fontSize: 26, bold: true, color: AMBER, align: "center", margin: 0 });
});
s.addText("A 3-agent CrewAI pipeline (Process.sequential) — each agent’s output is the next one’s context", { x: 0.6, y: 4.5, w: 12, h: 0.4, fontFace: BF, fontSize: 13.5, italic: true, color: BLUE, margin: 0 });
card(s, 0.6, 5.1, 12.15, 1.55, NAVY);
s.addText("OpenEvolve = repeated “mutate → score → select” with an LLM", { x: 0.95, y: 5.3, w: 11.5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: WHITE, margin: 0 });
s.addText("MAP-Elites archive · island model · EVOLVE-BLOCK markers · combined_score as fitness. Core question: how to let the system “design itself” without breaking itself?", { x: 0.95, y: 5.75, w: 11.5, h: 0.8, fontFace: BF, fontSize: 13.5, color: ICE, margin: 0 });
codeRef(s, "evaluator.py:96 evaluate · :106-108 fitness ｜ simulation_crew.py:42-89 three agents ｜ openevolve_config.yaml:10-88");

// ============================================================ S9 THE CRASH SITE
s = mkSlide();
header(s, "Part 2 · Problem", "The crash site: evolution broke itself");
s.addText("In an earlier “unprotected” run, a mutation to the agent prompt broke tool calling → the whole flow crashed", { x: 0.6, y: 1.9, w: 12.15, h: 0.4, fontFace: BF, fontSize: 15, color: INK, margin: 0 });
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
s.addText("fallback score", { x: 9.15, y: 3.85, w: 3.4, h: 0.4, fontFace: BF, fontSize: 13, color: ICE, margin: 0 });
s.addText("That run hit this floor ~36% of the time — one broken tool call and the prediction flow collapses.", { x: 9.15, y: 4.35, w: 3.45, h: 1.9, fontFace: BF, fontSize: 13.5, color: WHITE, valign: "top", margin: 0 });
codeRef(s, "openevolve_evaluator.py:133-137 timeout fallback · :179-184 exception fallback (both return _result(0.0))");

// ============================================================ S10 SEAM: failure taxonomy
s = mkSlide();
header(s, "Part 2 · The seam", "Pattern 1: Claude’s “failure taxonomy”");
s.addText([
  { text: "Failure taxonomy = ", options: { bold: true, color: NAVY } },
  { text: "instead of patching each broken tool ad hoc, Claude first sorts “how tool calling can break” into 5 failure modes, each with its own defense.", options: { color: INK } },
], { x: 0.6, y: 1.62, w: 12.15, h: 0.4, fontFace: BF, fontSize: 13, margin: 0 });
card(s, 0.6, 2.12, 4.5, 4.2, "EAF0FA");
s.addText("The good question I asked", { x: 0.85, y: 2.3, w: 4.1, h: 0.4, fontFace: HF, fontSize: 14, bold: true, color: HUMAN, margin: 0 });
s.addText("“How can an agent safely evolve, use different tools, even create new tools — without crashing on tool calling?”", { x: 0.85, y: 2.78, w: 4.05, h: 2.5, fontFace: HF, fontSize: 15.5, italic: true, color: NAVY, lineSpacing: 26, margin: 0 });
s.addText("Not “fix my bug”, but a design question that pushes deeper.", { x: 0.85, y: 5.6, w: 4.05, h: 0.7, fontFace: BF, fontSize: 12, color: MUTE, margin: 0 });
const tax = [
  ["①", "Call protocol", "tool-call text format broken", RED],
  ["②", "Param correctness", "query_type filled in wrong", AMBER],
  ["③", "Call strategy", "“skip the query, just guess”", AMBER],
  ["④", "Result digestion", "thousands of reviews, no idea how to sample", BLUE],
  ["⑤", "Downstream contract", "the summary handed on is mangled", BLUE],
];
tax.forEach((t, i) => {
  const y = 2.12 + i * 0.72;
  card(s, 5.3, y, 7.45, 0.62);
  s.addShape(p.shapes.RECTANGLE, { x: 5.3, y, w: 0.1, h: 0.62, fill: { color: t[3] } });
  s.addText(t[0], { x: 5.5, y, w: 0.55, h: 0.62, fontFace: HF, fontSize: 17, bold: true, color: t[3], valign: "middle", align: "center", margin: 0 });
  s.addText(t[1], { x: 6.15, y, w: 2.55, h: 0.62, fontFace: HF, fontSize: 13, bold: true, color: NAVY, valign: "middle", margin: 0 });
  s.addText(t[2], { x: 8.75, y, w: 3.9, h: 0.62, fontFace: BF, fontSize: 11, color: INK, valign: "middle", margin: 0 });
});
s.addText("Upside: break any one layer and worst case is degradation, not a total crash. Insight — fitness tells you it “broke”, not “where”; layering lets you treat the right thing.", { x: 5.3, y: 5.78, w: 7.45, h: 0.75, fontFace: BF, fontSize: 11, italic: true, color: BLUE, lineSpacing: 15, margin: 0 });
codeRef(s, "Landed in src/tools/{interaction_tool_wrapper,retrieval_executor,tool_loader}.py");

// ============================================================ S11 PROTOCOL/POLICY
s = mkSlide();
header(s, "Part 3 · Solution", "Design principle: separate protocol from policy");
card(s, 0.6, 2.0, 12.15, 1.9, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 2.0, w: 0.12, h: 1.9, fill: { color: NAVY } });
s.addText("Protocol layer — frozen, evolution can’t touch it", { x: 0.95, y: 2.18, w: 11.6, h: 0.5, fontFace: HF, fontSize: 18, bold: true, color: NAVY, margin: 0 });
s.addText("“How a tool is called”: function signature, parameter format, return format, registration", { x: 0.95, y: 2.72, w: 11.6, h: 0.5, fontFace: BF, fontSize: 14, color: INK, margin: 0 });
s.addText([
  { text: "e.g. ", options: { bold: true, color: NAVY } },
  { text: "“you may only query user / item / review” — fixed, nobody can change it.", options: { color: INK } },
], { x: 0.95, y: 3.25, w: 11.6, h: 0.5, fontFace: BF, fontSize: 14, italic: true, margin: 0 });
card(s, 0.6, 4.1, 12.15, 1.9, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 4.1, w: 0.12, h: 1.9, fill: { color: AMBER } });
s.addText("Policy layer — freely evolved", { x: 0.95, y: 4.28, w: 11.6, h: 0.5, fontFace: HF, fontSize: 18, bold: true, color: AMBER, margin: 0 });
s.addText("“How a tool is used”: which to fetch, how many, when, how to digest, even what new tool is needed", { x: 0.95, y: 4.82, w: 11.6, h: 0.5, fontFace: BF, fontSize: 14, color: INK, margin: 0 });
s.addText([
  { text: "e.g. ", options: { bold: true, color: "B5791F" } },
  { text: "“this round, query user + review, take 15 each, sort by recency” — let evolution try.", options: { color: INK } },
], { x: 0.95, y: 5.35, w: 11.6, h: 0.5, fontFace: BF, fontSize: 14, italic: true, margin: 0 });
s.addText("Like a power outlet: the socket shape is the “protocol” (fixed); what you plug in is the “policy” (free) — one shape, infinite uses.", { x: 0.6, y: 6.25, w: 12.15, h: 0.4, fontFace: BF, fontSize: 13.5, italic: true, color: BLUE, margin: 0 });
codeRef(s, "Protocol retrieval_executor.py:28-30 ALLOWED_QUERIES/STRATEGIES (frozen) ｜ Policy agents_evolving.yaml:11-16 retrieval_policy");

// ============================================================ S12 OVERVIEW + L0
s = mkSlide();
header(s, "Part 3 · Solution", "The three-layer solution + L0 observability");
const lay = [
  ["L0", "See it", "tool-call observability — turn blind spots into signal", GREEN],
  ["L1", "Use safely", "take tool calling away from the LLM → deterministic executor", BLUE],
  ["L2", "Build safely", "let evolution invent new tools — a four-gate sandbox", NAVY],
];
lay.forEach((l, i) => {
  const y = 1.95 + i * 1.15;
  card(s, 0.6, y, 12.15, 1.0);
  chip(s, 0.9, y + 0.25, l[0][1], l[3]);
  s.addText(l[0], { x: 1.55, y: y + 0.12, w: 1.5, h: 0.45, fontFace: HF, fontSize: 20, bold: true, color: l[3], margin: 0 });
  s.addText(l[1], { x: 1.55, y: y + 0.56, w: 1.9, h: 0.35, fontFace: BF, fontSize: 11.5, color: MUTE, margin: 0 });
  s.addText(l[2], { x: 3.6, y, w: 9.0, h: 1.0, fontFace: BF, fontSize: 14.5, color: INK, valign: "middle", margin: 0 });
});
card(s, 0.6, 5.5, 12.15, 1.35, "EAF7F0");
s.addText([
  { text: "L0 detail   ", options: { bold: true, color: GREEN } },
  { text: "thread-safe call log (query_type, ok) → evaluator rolls it into artifacts → the next mutation’s prompt sees diagnostics like “missing_essential: [user]”. Pure add-on, default behavior unchanged.", options: { color: INK } },
], { x: 0.95, y: 5.5, w: 11.5, h: 1.35, fontFace: BF, fontSize: 13, valign: "middle", lineSpacing: 20, margin: 0 });
codeRef(s, "interaction_tool_wrapper.py:21 _record · :26 drain_tool_log ｜ openevolve_evaluator.py:31 _summarize_tool_use");

// ============================================================ S13 L1 clamp + whitelist
s = mkSlide();
header(s, "Part 3 · L1", "L1: clamp executor + “a whitelist ≠ no room to evolve”");
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
  { text: "Project illegal values back into the legal space, ", options: { color: INK } },
  { text: "never raise", options: { bold: true, color: GREEN } },
  { text: ". k=999999→50 · bogus query→filtered · all garbage→default.", options: { color: INK } },
], { x: 7.2, y: 2.75, w: 5.3, h: 1.4, fontSize: 13.5, lineSpacing: 22, margin: 0 });
s.addShape(p.shapes.RECTANGLE, { x: 7.2, y: 4.35, w: 5.3, h: 0.02, fill: { color: "E2E8F0" } });
s.addText([
  { text: "Whitelist ≠ no room:", options: { bold: true, color: AMBER, breakLine: true } },
  { text: "ALLOWED_QUERIES is the “alphabet”, policy is the “sentence”. 26 letters are fixed, yet infinitely many sentences. The real ceiling is the dataset, not the whitelist.", options: { color: INK } },
], { x: 7.2, y: 4.5, w: 5.3, h: 1.5, fontSize: 12.5, lineSpacing: 18, valign: "top", margin: 0 });
codeRef(s, "retrieval_executor.py:44 _clamp_int · :53 normalize_policy · :29 ALLOWED_QUERIES · :140 execute_policy");

// ============================================================ S14 L1 wiring
s = mkSlide();
header(s, "Part 3 · L1", "Wiring: data_retriever from “caller” to “extractor”");
card(s, 0.6, 2.2, 5.95, 3.9);
s.addText("Before", { x: 0.9, y: 2.5, w: 5, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "data_retriever [has tool]", options: { fontFace: CF, bold: true, color: NAVY, breakLine: true } },
  { text: "  ↓ LLM calls wrapper ×4 (text format)", options: { color: INK, breakLine: true } },
  { text: "  ↓ assembles a summary", options: { color: INK } },
], { x: 0.9, y: 3.15, w: 5.4, h: 1.7, fontSize: 13.5, lineSpacing: 30, margin: 0 });
s.addText("The caller is the LLM — the crash-prone kind.", { x: 0.9, y: 5.35, w: 5.4, h: 0.6, fontFace: BF, fontSize: 14, italic: true, color: RED, margin: 0 });
card(s, 6.8, 2.2, 5.95, 3.9, NAVY);
s.addText("After", { x: 7.1, y: 2.5, w: 5, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "executor: deterministic retrieval (pre-crew)", options: { color: ICE, breakLine: true } },
  { text: "  ↓ retrieved_context injected", options: { color: WHITE, breakLine: true } },
  { text: "data_retriever [no tool]", options: { fontFace: CF, bold: true, color: AMBER, breakLine: true } },
  { text: "  ↓ just extracts {retrieved_context}", options: { color: WHITE } },
], { x: 7.1, y: 3.15, w: 5.4, h: 1.9, fontSize: 13.5, lineSpacing: 30, margin: 0 });
s.addText("A pure-text task — can’t crash on tool calling.", { x: 7.1, y: 5.35, w: 5.4, h: 0.6, fontFace: BF, fontSize: 14, italic: true, color: ICE, margin: 0 });
codeRef(s, "src/flows/serving_flow.py:85-93 execute_policy → inject retrieved_context ｜ simulation_crew.py:42-50 data_retriever has no tools");

// ============================================================ S15 L2 four gates
s = mkSlide();
header(s, "Part 3 · L2", "L2: a four-gate sandbox + docstring co-evolution");
const gates = [
  ["1", "AST safety scan", "block import / open / exec / dunder"],
  ["2", "Signature check", "only tool_* + (kit, user_id, item_id)"],
  ["3", "Sandbox trial", "5s timeout; bad tools silently dropped"],
  ["4", "Wrap & register", "docstring → the description the agent sees"],
];
gates.forEach((g, i) => {
  const x = 0.6 + (i % 2) * 6.15, y = 1.95 + Math.floor(i / 2) * 1.5;
  card(s, x, y, 5.9, 1.3);
  chip(s, x + 0.28, y + 0.4, g[0], NAVY);
  s.addText(g[1], { x: x + 0.95, y: y + 0.18, w: 4.7, h: 0.5, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText(g[2], { x: x + 0.95, y: y + 0.65, w: 4.75, h: 0.55, fontFace: BF, fontSize: 12, color: MUTE, margin: 0 });
});
card(s, 0.6, 5.0, 12.15, 1.65, "FBF1E0");
s.addText([
  { text: "Two key points   ", options: { bold: true, color: "B5791F" } },
  { text: "① docstring co-evolution: a vague docstring → the agent won’t call it → zero fitness → selected out; discoverability is under evolutionary pressure. ② Tools mount at the “decision point” psychological_analyst (not data_retriever, so we don’t reintroduce the crash risk L1 just removed). ReadOnlyKit exposes only get_user/get_item/get_reviews.", options: { color: INK } },
], { x: 0.95, y: 5.1, w: 11.5, h: 1.5, fontFace: BF, fontSize: 12.5, valign: "middle", lineSpacing: 18, margin: 0 });
codeRef(s, "tool_loader.py:77/:106/:120/:156 gates · :60 ReadOnlyKit · :164 docstring ｜ simulation_crew.py:53-62 attach to analyst");

// ============================================================ S16 #7 train/val
s = mkSlide();
header(s, "Part 4 · Trust mechanisms", "Train / Val split: the overfitting mirror");
s.addText("Evolution “memorizes the answers” — specializes to those train tasks without generalizing. A disjoint holdout catches it.", { x: 0.6, y: 1.95, w: 12.15, h: 0.4, fontFace: BF, fontSize: 14.5, color: INK, margin: 0 });
card(s, 0.6, 2.7, 5.95, 3.4, "F7E9E7");
s.addText("Overfit (false champion)", { x: 0.9, y: 2.95, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "train  0.90", options: { fontFace: CF, fontSize: 20, bold: true, color: INK, breakLine: true } },
  { text: "holdout  0.40", options: { fontFace: CF, fontSize: 20, bold: true, color: RED, breakLine: true } },
  { text: "gap 0.50 → 🚨 alarm", options: { color: RED, bold: true } },
], { x: 0.9, y: 3.6, w: 5.4, h: 2, fontSize: 15, lineSpacing: 30, margin: 0 });
card(s, 6.8, 2.7, 5.95, 3.4, "E7F2EC");
s.addText("Generalizes (trustworthy)", { x: 7.1, y: 2.95, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "train  0.75", options: { fontFace: CF, fontSize: 20, bold: true, color: INK, breakLine: true } },
  { text: "holdout  0.72", options: { fontFace: CF, fontSize: 20, bold: true, color: GREEN, breakLine: true } },
  { text: "gap 0.03 → ✅ really learned", options: { color: GREEN, bold: true } },
], { x: 7.1, y: 3.6, w: 5.4, h: 2, fontSize: 15, lineSpacing: 30, margin: 0 });
s.addText("make validate-holdout — disjoint verified, overlap = 0", { x: 0.6, y: 6.45, w: 12, h: 0.4, fontFace: CF, fontSize: 13, color: MUTE, margin: 0 });
codeRef(s, "evaluator.py:83-84 OPENEVOLVE_TASK_DIR · scripts/validate_holdout.py:25 switch to holdout · create_sampled_dataset.py:8 disjoint");

// ============================================================ S17 #6 MAP-Elites
s = mkSlide();
header(s, "Part 4 · Trust mechanisms", "MAP-Elites custom dimensions");
s.addText("A single combined_score squashes two extreme specialists into a mediocre middle. Use the two sub-metrics as diversity dimensions.", { x: 0.6, y: 1.95, w: 12.15, h: 0.4, fontFace: BF, fontSize: 14.5, color: INK, margin: 0 });
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
card(s, 7.5, 2.7, 5.25, 4.0, NAVY);
s.addText("fitness vs feature", { x: 7.8, y: 2.95, w: 4.7, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: AMBER, margin: 0 });
s.addText([
  { text: "combined_score", options: { fontFace: CF, bold: true, color: ICE } },
  { text: " decides who wins (fitness)", options: { color: WHITE, breakLine: true } },
  { text: "preference × review", options: { fontFace: CF, bold: true, color: ICE } },
  { text: " only sets coordinates (diversity)", options: { color: WHITE } },
], { x: 7.8, y: 3.5, w: 4.7, h: 1.6, fontSize: 13.5, lineSpacing: 22, margin: 0 });
s.addText("Keeps elites across the trade-off frontier and breeds hybrids.", { x: 7.8, y: 5.3, w: 4.7, h: 1, fontFace: BF, fontSize: 13.5, italic: true, color: ICE, margin: 0 });
codeRef(s, "config/openevolve_config.yaml:85-88 feature_dimensions (8×8) · openevolve_evaluator.py:47-59 _result(extra_metrics)");

// ============================================================ S18 honest bug
s = mkSlide();
header(s, "Part 5 · Patterns", "Pattern 2: honest reporting — a healthy score ≠ correct behavior");
card(s, 0.6, 1.95, 5.95, 2.5, "F7E9E7");
s.addText("Looked perfect", { x: 0.9, y: 2.15, w: 5, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "combined_score = ", options: { fontFace: CF, fontSize: 15, bold: true, color: INK } },
  { text: "0.8452", options: { fontFace: CF, fontSize: 24, bold: true, color: RED, breakLine: true } },
  { text: "Pretty score — nobody would suspect it.", options: { color: MUTE } },
], { x: 0.9, y: 2.65, w: 5.4, h: 1.6, lineSpacing: 28, margin: 0 });
card(s, 6.8, 1.95, 5.95, 2.5, "E7F2EC");
s.addText("Claude verified proactively", { x: 7.1, y: 2.15, w: 5.4, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "Checked agent.tools directly → found ", options: { color: INK } },
  { text: "[]", options: { fontFace: CF, fontSize: 18, bold: true, color: RED, breakLine: true } },
  { text: "Two real bugs: _safe_import removed / @tool needs a docstring → graceful [] hid the failure.", options: { color: INK } },
], { x: 7.1, y: 2.65, w: 5.4, h: 1.7, fontSize: 13, lineSpacing: 20, margin: 0 });
card(s, 0.6, 4.65, 12.15, 1.5, NAVY);
s.addText("“ A healthy score ≠ correct behavior ”", { x: 0.95, y: 4.8, w: 11.5, h: 0.6, fontFace: HF, fontSize: 23, bold: true, color: AMBER, margin: 0 });
s.addText("Graceful fallback disguises “tools never attached” as “score looks fine”. Verify the feature itself (the tools list), not just the score.", { x: 0.95, y: 5.45, w: 11.5, h: 0.6, fontFace: BF, fontSize: 14, color: WHITE, margin: 0 });
codeRef(s, "tool_loader.py:139-146 _safe_import · :164 docstring · simulation_crew.py:21-30 graceful [] · tests/test_tool_loader.py:185-203");

// ============================================================ S19 gatekeep + complementary
s = mkSlide();
header(s, "Part 5 · Patterns", "Patterns 3 & 4: gatekeep irreversibles + complementary knowledge");
card(s, 0.6, 2.1, 5.95, 4.0, "F7ECEC");
s.addText("③ I gatekeep irreversible actions", { x: 0.9, y: 2.35, w: 5.5, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "Claude asks me first, then acts:", options: { color: INK, breakLine: true } },
  { text: "merge PR · brew install · system settings · new GitHub repo · install LibreOffice", options: { fontFace: CF, fontSize: 11.5, color: NAVY, breakLine: true } },
  { text: "Gatekeeping the irreversible is my layer’s core job.", options: { color: INK } },
], { x: 0.9, y: 2.95, w: 5.45, h: 2.8, fontSize: 13.5, lineSpacing: 24, margin: 0 });
card(s, 6.8, 2.1, 5.95, 4.0, "EAF0FA");
s.addText("④ Complementary human-AI knowledge", { x: 7.1, y: 2.35, w: 5.5, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: CLAUDE, margin: 0 });
s.addText([
  { text: "I fill Claude’s gap: ", options: { bold: true, color: HUMAN } },
  { text: "“closing the Mac lid kills background processes” (environment)", options: { color: INK, breakLine: true } },
  { text: "Claude fills mine: ", options: { bold: true, color: CLAUDE } },
  { text: "explains caffeinate & sets it up (no sleep, but screen rests) (tooling)", options: { color: INK } },
], { x: 7.1, y: 2.95, w: 5.45, h: 2.8, fontSize: 13.5, lineSpacing: 24, margin: 0 });
s.addText("Two kinds of knowledge, complementary — without either, the run won’t finish.", { x: 0.6, y: 6.25, w: 12, h: 0.4, fontFace: BF, fontSize: 14, italic: true, color: NAVY, align: "center", margin: 0 });

// ============================================================ S20 layered delegation
s = mkSlide();
header(s, "Part 5 · Patterns", "Pattern 5: layered delegation of autonomy (the core)");
s.addText("I had Claude build a safe frame (L0/L1/L2) for OpenEvolve — only with it in place did I dare let go. Back to the safety constitution.", { x: 0.6, y: 2.0, w: 12.15, h: 0.6, fontFace: BF, fontSize: 16, color: INK, margin: 0 });
card(s, 0.6, 2.9, 5.95, 2.9, "F7E9E7");
s.addText("Unprotected earlier run", { x: 0.9, y: 3.15, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([{ text: "36%", options: { fontFace: HF, fontSize: 52, bold: true, color: RED, breakLine: true } }, { text: "of iterations crash", options: { color: INK } }], { x: 0.9, y: 3.7, w: 5.4, h: 1.8, lineSpacing: 36, margin: 0 });
card(s, 6.8, 2.9, 5.95, 2.9, "E7F2EC");
s.addText("Full architecture", { x: 7.1, y: 3.15, w: 5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([{ text: "0", options: { fontFace: HF, fontSize: 52, bold: true, color: GREEN, breakLine: true } }, { text: "tool-calling crashes", options: { color: INK } }], { x: 7.1, y: 3.7, w: 5.4, h: 1.8, lineSpacing: 36, margin: 0 });
s.addText("My precondition for delegating autonomy: first build a “worst case is only degradation” guardrail.", { x: 0.6, y: 6.1, w: 12.15, h: 0.5, fontFace: HF, fontSize: 17, bold: true, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "Three guardrails interaction_tool_wrapper.py(L0) · retrieval_executor.py(L1) · tool_loader.py(L2)");

// ============================================================ S21 five patterns recap
s = mkSlide();
header(s, "Part 5 · Patterns", "Five collaboration patterns · one-page recap");
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

// ============================================================ S22 three layers + formula
s = mkSlide();
header(s, "Part 6 · Climax", "iter22: an emergent product of three-layer collaboration");
const contrib = [
  ["I (Human)", "decided to run 50 iters\nset caffeinate to run overnight", HUMAN],
  ["Claude", "built the L0/L1/L2 frame\nlaunched evolution, analyzed", CLAUDE],
  ["OpenEvolve", "evolved iter22\nrating formula (0.842)", OE],
];
contrib.forEach((c, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.0, 3.85, 2.3);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.0, w: 3.85, h: 0.12, fill: { color: c[2] } });
  s.addText(c[0], { x: x + 0.25, y: 2.3, w: 3.35, h: 0.5, fontFace: HF, fontSize: 16, bold: true, color: c[2], margin: 0 });
  s.addText(c[1], { x: x + 0.25, y: 2.85, w: 3.45, h: 1.3, fontFace: BF, fontSize: 13, color: INK, lineSpacing: 20, margin: 0 });
});
card(s, 0.6, 4.6, 12.15, 2.05, "11183B");
s.addText("iter22 formula (excerpt) — nobody taught it; only three-layer collaboration grows it", { x: 0.9, y: 4.75, w: 11.4, h: 0.4, fontFace: HF, fontSize: 14, bold: true, color: AMBER, margin: 0 });
s.addText([
  { text: "if user_std < 0.7:  predicted = user_mean + 0.55·(item_mean − user_mean)", options: { color: WHITE, breakLine: true } },
  { text: "elif < 1.0: +0.45·…   elif < 1.3: +0.30·…   else: user_median + 0.20·…", options: { color: ICE, breakLine: true } },
  { text: "clamp [1,5] · round 0.5", options: { color: WHITE } },
], { x: 0.9, y: 5.2, w: 11.5, h: 1.3, fontFace: CF, fontSize: 13, lineSpacing: 22, margin: 0 });
codeRef(s, "Evolution target config/agents_evolving.yaml EVOLVE-BLOCK");

// ============================================================ S23 after iter22
s = mkSlide();
header(s, "Part 6 · Climax", "The deeper part: “after” iter22 — a local optimum");
s.addText("I had Claude trace every descendant of iter22 — conclusion: no better offspring appeared after it.", { x: 0.6, y: 1.95, w: 12.15, h: 0.5, fontFace: BF, fontSize: 16, color: INK, margin: 0 });
const aft = [
  ["Over-engineering", "4-segment formula → 5, 6 segments, more parameters"],
  ["Sub-metrics trade off", "preference wobbles, review_generation regresses → score stalls"],
  ["Islands converge", "OpenEvolve splits the pool into 3 independent “islands”; migration then spreads iter22’s genes across them → diversity collapses"],
];
aft.forEach((a, i) => {
  const y = 2.6 + i * 1.0;
  card(s, 0.6, y, 12.15, 0.88);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 0.88, fill: { color: OE } });
  s.addText(a[0], { x: 0.95, y, w: 3.3, h: 0.88, fontFace: HF, fontSize: 14.5, bold: true, color: "B5791F", valign: "middle", margin: 0 });
  s.addText(a[1], { x: 4.4, y, w: 8.2, h: 0.88, fontFace: BF, fontSize: 13, color: INK, valign: "middle", margin: 0 });
});
card(s, 0.6, 5.75, 12.15, 1.3, NAVY);
s.addText([
  { text: "Claude’s diagnosis for me: ", options: { bold: true, color: AMBER } },
  { text: "iter22 is a local optimum. OpenEvolve can “find” it, but “why it’s stuck and how to escape” is structurally beyond a prospector — it has no concept of “local optimum”.", options: { color: WHITE } },
], { x: 0.95, y: 5.75, w: 11.5, h: 1.3, fontFace: BF, fontSize: 14, valign: "middle", lineSpacing: 21, margin: 0 });
codeRef(s, "Island/migration config/openevolve_config.yaml:71-78 (num_islands:3, migration)");

// ============================================================ S23b how to escape
s = mkSlide();
header(s, "Part 6 · Climax", "So how do you escape the local optimum?");
s.addText("Escaping isn’t “run more generations” (that just over-complicates the formula) — it’s turning three knobs at once:", { x: 0.6, y: 1.62, w: 12.15, h: 0.4, fontFace: BF, fontSize: 13.5, color: BLUE, margin: 0 });
const fixes = [
  ["①", "More TASKS", "treats: weak fitness signal", "more tasks per evaluate; grow the train set (198 available, only 5 used now)"],
  ["②", "Diversify island seeds", "treats: island convergence", "seed each island with a different design philosophy; longer migration_interval, lower migration_rate"],
  ["③", "Start tool evolution", "treats: search space exhausted", "let evolvable_tools.py truly evolve (+ n_tools dimension) — new raw material for the search"],
];
fixes.forEach((f, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.15, 3.85, 3.1);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.15, w: 3.85, h: 0.12, fill: { color: NAVY } });
  chip(s, x + 0.22, 2.4, f[0], AMBER, NAVY);
  s.addText(f[1], { x: x + 0.85, y: 2.42, w: 2.85, h: 0.5, fontFace: HF, fontSize: 15, bold: true, color: NAVY, valign: "middle", margin: 0 });
  s.addText(f[2], { x: x + 0.25, y: 3.05, w: 3.4, h: 0.4, fontFace: BF, fontSize: 12, italic: true, color: RED, margin: 0 });
  s.addText(f[3], { x: x + 0.25, y: 3.5, w: 3.4, h: 1.55, fontFace: BF, fontSize: 12.5, color: INK, lineSpacing: 18, margin: 0 });
  s.addText("status: to-do", { x: x + 0.25, y: 4.9, w: 3.4, h: 0.3, fontFace: CF, fontSize: 11, color: MUTE, margin: 0 });
});
card(s, 0.6, 5.5, 12.15, 1.4, NAVY);
s.addText([
  { text: "Ready-made safety net: ", options: { bold: true, color: AMBER } },
  { text: "holdout confirms gains are real generalization; MAP-Elites keeps review_generation as a dimension to protect text quality.", options: { color: WHITE } },
  { text: "  First two treat “stuck in place”, the third gives “a new direction”.", options: { color: ICE } },
], { x: 0.95, y: 5.5, w: 11.5, h: 1.4, fontFace: BF, fontSize: 13, valign: "middle", lineSpacing: 21, margin: 0 });
codeRef(s, "more tasks openevolve_evaluator.py:115 · islands/migration openevolve_config.yaml:71-78 · tool evolution evolvable_tools.py:18-58");

// ============================================================ S24 failure as insight
s = mkSlide();
header(s, "Part 6 · Climax", "Even “failure” is a shared insight");
s.addText("8 low-score crashes → I had Claude comb the data for causes:", { x: 0.6, y: 2.1, w: 12, h: 0.5, fontFace: BF, fontSize: 18, color: INK, margin: 0 });
card(s, 0.6, 3.0, 5.95, 2.4, "F7E9E7");
s.addText([{ text: "5×", options: { fontFace: HF, fontSize: 44, bold: true, color: RED, breakLine: true } }, { text: "broken YAML syntax", options: { color: INK } }, { text: "(full-rewrite risk, bypasses clamp)", options: { fontSize: 12, color: MUTE } }], { x: 0.9, y: 3.3, w: 5.4, h: 1.9, lineSpacing: 30, margin: 0 });
card(s, 6.8, 3.0, 5.95, 2.4, "FBF1E0");
s.addText([{ text: "3×", options: { fontFace: HF, fontSize: 44, bold: true, color: "B5791F", breakLine: true } }, { text: "rate limit 429", options: { color: INK } }, { text: "(NVIDIA NIM throttling)", options: { fontSize: 12, color: MUTE } }], { x: 7.1, y: 3.3, w: 5.4, h: 1.9, lineSpacing: 30, margin: 0 });
s.addText("Collaboration produces not only successes but shared understanding of failure — both read together across all three layers.", { x: 0.6, y: 5.9, w: 12.15, h: 0.6, fontFace: HF, fontSize: 16, italic: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "diff_based_evolution:false (full-rewrite risk) see openevolve_config.yaml:18");

// ============================================================ S25 who does what
s = mkSlide();
header(s, "Part 7 · Reflection", "Who should do what?");
const who = [
  ["I (Human) do it myself", "direction · value judgments\nirreversible decisions · domain/physical knowledge", HUMAN],
  ["Delegate to Claude", "implement · verify · analyze\ndocs · honest reporting", CLAUDE],
  ["Hand to evolution (OpenEvolve)", "large-scale exploration & invention\nwithin a safe frame", OE],
];
who.forEach((c, i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.2, 3.85, 3.0);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.2, w: 3.85, h: 0.14, fill: { color: c[2] } });
  s.addText(c[0], { x: x + 0.22, y: 2.5, w: 3.45, h: 0.8, fontFace: HF, fontSize: 14.5, bold: true, color: c[2], margin: 0 });
  s.addText(c[1], { x: x + 0.22, y: 3.35, w: 3.5, h: 1.7, fontFace: BF, fontSize: 13.5, color: INK, lineSpacing: 22, margin: 0 });
});
s.addText("I split the work by three criteria: reversibility · whether value judgment is needed · size of the search space.", { x: 0.6, y: 5.6, w: 12, h: 0.6, fontFace: HF, fontSize: 16, bold: true, color: NAVY, align: "center", margin: 0 });
codeRef(s, "Mapping: Me→config/*.yaml ｜ Claude→src/ + tests/ ｜ evolution→EVOLVE-BLOCK (agents_evolving.yaml / evolvable_tools.py)");

// ============================================================ S26 key takeaways
s = mkSlide();
header(s, "Part 7 · Reflection", "Key takeaways");
const tk = [
  "Evolution can design agents, but must be stopped from breaking itself → guardrails stronger the deeper you go (worst case = degradation)",
  "Protocol/policy split + graceful degradation = safely-evolvable terrain",
  "Honest reporting + human gatekeeping of irreversibles = the safety bedrock; a healthy score ≠ correct behavior",
  "Good questions drive good design; even failures can be understood together; don’t trust docs, read the source",
];
tk.forEach((t, i) => {
  const y = 2.0 + i * 1.1;
  card(s, 0.6, y, 12.15, 0.95);
  chip(s, 0.9, y + 0.22, `${i + 1}`, AMBER, NAVY);
  s.addText(t, { x: 1.6, y, w: 11.0, h: 0.95, fontFace: BF, fontSize: 13.5, color: INK, valign: "middle", margin: 0 });
});
s.addText("💬 Back to the opening: is your AI a tool, or a partner?", { x: 0.6, y: 6.6, w: 12, h: 0.35, fontFace: BF, fontSize: 14, italic: true, color: AMBER, margin: 0 });

// ============================================================ S27 closing
s = mkSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("Thank you · Q & A", { x: 0.95, y: 1.9, w: 11.5, h: 1, fontFace: HF, fontSize: 42, bold: true, color: WHITE, margin: 0 });
s.addText("The real product isn’t just a 0.842 agent —\nit’s a “human + AI + evolution” safe-collaboration workflow.", { x: 1, y: 3.2, w: 11.8, h: 1.4, fontFace: HF, fontSize: 20, italic: true, color: ICE, lineSpacing: 34, margin: 0 });
chain.forEach((c, i) => {
  const x = 1.0 + i * 3.5;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 5.0, w: 2.6, h: 0.7, rectRadius: 0.08, fill: { color: c[1] } });
  s.addText(c[0], { x, y: 5.0, w: 2.6, h: 0.7, align: "center", valign: "middle", fontFace: HF, fontSize: 16, bold: true, color: WHITE, margin: 0 });
  if (i < 2) s.addText("▶", { x: x + 2.65, y: 5.0, w: 0.7, h: 0.7, align: "center", valign: "middle", fontFace: BF, fontSize: 14, color: AMBER, margin: 0 });
});
s.addText([
  { text: "Resources   ", options: { bold: true, color: AMBER } },
  { text: "docs/{collaboration_workflow_outline, teaching_slides_outline, unified_deck_outline, evolution_design_notes}.md", options: { color: ICE } },
], { x: 1, y: 6.3, w: 11.5, h: 0.6, fontFace: BF, fontSize: 13, margin: 0 });

p.writeFile({ fileName: "/tmp/deck/Human_AI_Evolution_EN.pptx" }).then(f => console.log("WROTE", f));
