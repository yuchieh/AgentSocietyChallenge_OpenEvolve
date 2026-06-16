const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "AgentSocietyChallenge_OpenEvolve";
p.title = "Evolving an LLM Agent Crew with OpenEvolve";

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
  s.addText(title, { x: 0.55, y: 0.78, w: 12.4, h: 0.85, fontFace: HF, fontSize: 27, bold: true, color: NAVY, margin: 0 });
}
function card(s, x, y, w, h, fill) {
  s.addShape(p.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill || WHITE }, line: { color: "E2E8F0", width: 1 }, shadow: sh() });
}
function chip(s, x, y, txt, fill, tcolor) {
  s.addShape(p.shapes.OVAL, { x, y, w: 0.5, h: 0.5, fill: { color: fill } });
  s.addText(txt, { x, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: HF, fontSize: 18, bold: true, color: tcolor || WHITE, margin: 0 });
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
  "src/utils/create_sampled_dataset.py": "src/utils/create_sampled_dataset.py", "create_sampled_dataset.py": "src/utils/create_sampled_dataset.py",
  "scripts/validate_holdout.py": "scripts/validate_holdout.py", "validate_holdout.py": "scripts/validate_holdout.py",
  "tests/test_tool_loader.py": "tests/test_tool_loader.py", "test_tool_loader.py": "tests/test_tool_loader.py",
  "tests/test_retrieval_executor.py": "tests/test_retrieval_executor.py", "test_retrieval_executor.py": "tests/test_retrieval_executor.py",
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
s.addText("OPENEVOLVE × CREWAI", { x: 1, y: 1.9, w: 11, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 3, margin: 0 });
s.addText("Evolving an\nLLM Agent Crew", { x: 0.95, y: 2.3, w: 11.5, h: 2, fontFace: HF, fontSize: 46, bold: true, color: WHITE, lineSpacing: 50, margin: 0 });
s.addText("From “crash-prone tool calling” to a “safely evolvable multi-agent system”", { x: 1, y: 4.5, w: 11.5, h: 0.5, fontFace: BF, fontSize: 19, color: ICE, margin: 0 });
s.addText("AgentSociety Challenge · Tool Calling Failure Taxonomy", { x: 1, y: 6.4, w: 11, h: 0.4, fontFace: BF, fontSize: 13, color: "8FA3C8", margin: 0 });
codeRef(s, "Entry points: config/openevolve_config.yaml · openevolve_evaluator.py · config/agents_evolving.yaml", true);

// ============================================================ 2 AGENDA
s = p.addSlide();
header(s, "Agenda", "Agenda & learning goals");
const parts = [
  ["1", "Background", "Task, CrewAI, OpenEvolve"],
  ["2", "Incident & taxonomy", "5 layers of tool-calling failure"],
  ["3", "Layered solution", "L0 / L1 / L2"],
  ["4", "Trust mechanisms", "Overfitting, MAP-Elites, rate limit"],
  ["5", "Engineering lessons", "Two real bugs, one maxim"],
  ["6", "Results & outlook", "Data, full picture, future"],
];
parts.forEach((it, i) => {
  const x = 0.55 + (i % 3) * 4.15, y = 1.9 + Math.floor(i / 3) * 1.55;
  card(s, x, y, 3.9, 1.35);
  chip(s, x + 0.25, y + 0.25, it[0], NAVY);
  s.addText(it[1], { x: x + 0.9, y: y + 0.2, w: 2.85, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: NAVY, margin: 0 });
  s.addText(it[2], { x: x + 0.9, y: y + 0.62, w: 2.85, h: 0.6, fontFace: BF, fontSize: 11.5, color: MUTE, margin: 0 });
});
s.addText([
  { text: "Learning goals   ", options: { bold: true, color: AMBER } },
  { text: "How evolutionary optimization applies to agent design · 5 failure layers & defenses · protocol/policy split + graceful degradation · making auto-optimization trustworthy", options: { color: INK } },
], { x: 0.55, y: 5.25, w: 12.2, h: 0.8, fontFace: BF, fontSize: 13, valign: "middle", margin: 0 });
codeRef(s, "Reference throughout: docs/evolution_design_notes.md (full design & validation record)");

// ============================================================ 3 TASK
s = p.addSlide();
header(s, "Part 1 · Background", "The task: simulate user behavior");
s.addText([
  { text: "Track 1: ", options: { bold: true, color: NAVY } },
  { text: "predict the ", options: { color: INK } },
  { text: "{stars, review}", options: { fontFace: CF, color: BLUE, bold: true } },
  { text: " a given user would give a given business", options: { color: INK } },
], { x: 0.6, y: 2.0, w: 12, h: 0.5, fontFace: BF, fontSize: 17, margin: 0 });
card(s, 0.6, 2.8, 5.9, 3.4);
s.addText("How fitness is computed", { x: 0.9, y: 3.05, w: 5.5, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "overall_quality", options: { fontFace: CF, bold: true, color: BLUE, breakLine: true } },
  { text: "  = (preference_estimation", options: { fontFace: CF, color: INK, breakLine: true } },
  { text: "     + review_generation) / 2", options: { fontFace: CF, color: INK, breakLine: true } },
], { x: 0.9, y: 3.55, w: 5.3, h: 1.2, fontSize: 13, margin: 0 });
s.addText([
  { text: "preference_estimation", options: { fontFace: CF, bold: true, color: GREEN } },
  { text: " — rating accuracy (1 − normalized star MAE)", options: { color: INK, breakLine: true } },
  { text: "review_generation", options: { fontFace: CF, bold: true, color: AMBER } },
  { text: " — text similarity (sentiment + emotion + topic)", options: { color: INK } },
], { x: 0.9, y: 4.75, w: 5.4, h: 1.2, fontSize: 12, lineSpacing: 18, margin: 0 });
card(s, 6.8, 2.8, 5.95, 3.4, NAVY);
s.addText("These two often trade off", { x: 7.1, y: 3.1, w: 5.4, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: WHITE, margin: 0 });
s.addText("“Accurate rating but plain text” vs “vivid text but off rating” — #6 later exploits this tension.", { x: 7.1, y: 3.65, w: 5.4, h: 1, fontFace: BF, fontSize: 14, color: ICE, margin: 0 });
s.addText("“ We predict not the truth, but how this user would react ”", { x: 7.1, y: 4.9, w: 5.4, h: 1, fontFace: HF, fontSize: 15, italic: true, color: AMBER, margin: 0 });
codeRef(s, "openevolve_evaluator.py:96 evaluate() · :106-108 combined_score = overall_quality · :149-151 sub-metrics");

// ============================================================ 4 CREWAI PIPELINE
s = p.addSlide();
header(s, "Part 1 · Background", "The base: a 3-agent CrewAI pipeline");
const ag = [
  ["data_retriever", "fetches 4 query types", BLUE],
  ["psychological_analyst", "analyzes preference / habits", BLUE],
  ["behavior_simulator", "outputs {stars, review}", BLUE],
];
ag.forEach((a, i) => {
  const x = 0.7 + i * 4.25;
  card(s, x, 2.6, 3.6, 2.1);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.6, w: 3.6, h: 0.12, fill: { color: a[2] } });
  s.addText(a[0], { x: x + 0.22, y: 3.0, w: 3.2, h: 0.7, fontFace: CF, fontSize: 13.5, bold: true, color: NAVY, margin: 0 });
  s.addText(a[1], { x: x + 0.22, y: 3.75, w: 3.2, h: 0.7, fontFace: BF, fontSize: 13, color: MUTE, margin: 0 });
  if (i < 2) s.addText("→", { x: x + 3.65, y: 3.1, w: 0.55, h: 1, fontFace: HF, fontSize: 30, bold: true, color: AMBER, align: "center", margin: 0 });
});
s.addText("Process.sequential — each agent’s output is the next one’s context", { x: 0.7, y: 5.1, w: 12, h: 0.4, fontFace: BF, fontSize: 14, italic: true, color: BLUE, margin: 0 });
s.addText("OpenEvolve’s job: not just evolve prompt text, but optimize every facet of this pipeline — tool use, task design, even topology.", { x: 0.7, y: 5.7, w: 12, h: 0.6, fontFace: BF, fontSize: 14, color: INK, margin: 0 });
codeRef(s, "src/crews/simulation_crew.py:42 data_retriever · :53 analyst · :65 behavior_simulator · :89 crew(Process.sequential)");

// ============================================================ 5 OPENEVOLVE
s = p.addSlide();
header(s, "Part 1 · Background", "OpenEvolve: evolving programs with an LLM");
s.addText("Open-source take on Google AlphaEvolve — repeated “mutate → score → select”", { x: 0.6, y: 1.95, w: 12, h: 0.4, fontFace: BF, fontSize: 16, color: INK, margin: 0 });
const loop = [["sample", "draw a parent from the pool"], ["mutate", "LLM mutates the program"], ["evaluate", "evaluator scores it"], ["select", "MAP-Elites keeps elites"]];
loop.forEach((l, i) => {
  const x = 0.7 + i * 3.15;
  card(s, x, 2.7, 2.75, 1.7);
  chip(s, x + 0.25, 2.95, `${i + 1}`, AMBER, NAVY);
  s.addText(l[0], { x: x + 0.9, y: 2.95, w: 1.7, h: 0.4, fontFace: CF, fontSize: 15, bold: true, color: NAVY, margin: 0 });
  s.addText(l[1], { x: x + 0.25, y: 3.55, w: 2.4, h: 0.8, fontFace: BF, fontSize: 12, color: MUTE, margin: 0 });
  if (i < 3) s.addText("→", { x: x + 2.78, y: 3.1, w: 0.4, h: 0.8, fontFace: HF, fontSize: 24, bold: true, color: AMBER, align: "center", margin: 0 });
});
s.addText([
  { text: "Key components   ", options: { bold: true, color: AMBER } },
  { text: "MAP-Elites archive · island model · EVOLVE-BLOCK markers · combined_score as fitness", options: { color: INK } },
], { x: 0.7, y: 4.9, w: 12, h: 0.5, fontFace: BF, fontSize: 14, margin: 0 });
s.addText("The core question: how to let the system “design itself” — without letting it break itself?", { x: 0.7, y: 5.6, w: 12, h: 0.5, fontFace: HF, fontSize: 17, bold: true, italic: true, color: NAVY, margin: 0 });
codeRef(s, "config/openevolve_config.yaml:10 max_iterations · :18 diff_based_evolution:false · :71-88 database(islands/MAP-Elites)");

// ============================================================ 6 TEN DIRECTIONS
s = p.addSlide();
header(s, "Part 1 · Background", "10 directions to optimize (novelty × feasibility)");
s.addChart(p.charts.SCATTER, [
  { name: "X", values: [4.5, 4.5, 3.5, 5, 3, 3, 3, 4.5, 2.5, 5] },
  { name: "dir", values: [4.5, 4, 4.5, 3, 5, 5, 5, 3, 5, 2] },
], {
  x: 0.6, y: 1.9, w: 7.2, h: 5.0,
  chartColors: [BLUE], lineSize: 0, lineDataSymbol: "circle", lineDataSymbolSize: 14,
  catAxisTitle: "novelty →", showCatAxisTitle: true, valAxisTitle: "feasibility →", showValAxisTitle: true,
  catAxisMinVal: 2, catAxisMaxVal: 5.5, valAxisMinVal: 1.5, valAxisMaxVal: 5.5,
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { color: "E2E8F0", size: 0.5 },
  catAxisLabelColor: MUTE, valAxisLabelColor: MUTE, showLegend: false,
});
card(s, 8.1, 1.95, 4.65, 4.95, WHITE);
s.addText("Today’s main thread", { x: 8.35, y: 2.2, w: 4.2, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "#2 deterministic retrieval  ", options: { fontFace: CF, bold: true, color: BLUE } },
  { text: "→ landed via L1", options: { color: INK, breakLine: true } },
  { text: "#7 Train/Val split  ", options: { fontFace: CF, bold: true, color: GREEN, breakLine: true } },
  { text: "#6 MAP-Elites dimensions  ", options: { fontFace: CF, bold: true, color: AMBER, breakLine: true } },
], { x: 8.35, y: 2.75, w: 4.2, h: 1.6, fontSize: 12.5, lineSpacing: 22, margin: 0 });
s.addShape(p.shapes.RECTANGLE, { x: 8.35, y: 4.5, w: 4.15, h: 0.02, fill: { color: "E2E8F0" } });
s.addText([
  { text: "Shared constraint  ", options: { bold: true, color: RED } },
  { text: "NVIDIA NIM rate limit — the earlier run had ", options: { color: INK } },
  { text: "36% of iterations fail", options: { bold: true, color: RED } },
  { text: ". Anything that cuts LLM calls has double value.", options: { color: INK } },
], { x: 8.35, y: 4.7, w: 4.2, h: 2, fontFace: BF, fontSize: 13, valign: "top", margin: 0 });
codeRef(s, "docs/evolution_design_notes.md §2 (10 directions) · §10 rate-limit defenses · openevolve_config.yaml:32 retries");

// ============================================================ 7 INCIDENT
s = p.addSlide();
header(s, "Part 2 · Incident", "The crash site: evolution broke the system");
s.addText("In an earlier run, a mutation to the agent prompt broke tool calling → the whole pipeline crashed", { x: 0.6, y: 1.95, w: 12.15, h: 0.4, fontFace: BF, fontSize: 15.5, color: INK, margin: 0 });
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
s.addText("fallback score", { x: 9.15, y: 3.95, w: 3.4, h: 0.4, fontFace: BF, fontSize: 13, color: ICE, margin: 0 });
s.addText("Many iterations keep hitting this floor — one broken tool call and the whole prediction flow collapses.", { x: 9.15, y: 4.5, w: 3.45, h: 1.8, fontFace: BF, fontSize: 14, color: WHITE, valign: "top", margin: 0 });
codeRef(s, "openevolve_evaluator.py:133-137 timeout fallback · :179-184 exception fallback (both return _result(0.0))");

// ============================================================ 8 TAXONOMY
s = p.addSlide();
header(s, "Part 2 · Incident", "Tool Calling Failure Taxonomy");
const tax = [
  ["①", "Call protocol", "tool-call text format broken → parser misses it", RED],
  ["②", "Param correctness", "query_type made up", AMBER],
  ["③", "Call strategy", "“skip the query, just guess”", AMBER],
  ["④", "Result digestion", "how to sample thousands of reviews", BLUE],
  ["⑤", "Downstream contract", "summary structure mangled", BLUE],
];
tax.forEach((t, i) => {
  const y = 1.85 + i * 1.0;
  card(s, 0.6, y, 12.15, 0.86);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 0.86, fill: { color: t[3] } });
  s.addText(t[0], { x: 0.9, y, w: 1.0, h: 0.86, fontFace: HF, fontSize: 24, bold: true, color: t[3], align: "center", valign: "middle", margin: 0 });
  s.addText(t[1], { x: 2.0, y, w: 3.4, h: 0.86, fontFace: HF, fontSize: 16, bold: true, color: NAVY, valign: "middle", margin: 0 });
  s.addText(t[2], { x: 5.5, y, w: 7.2, h: 0.86, fontFace: BF, fontSize: 13.5, color: INK, valign: "middle", margin: 0 });
});
s.addText("Originally only ① was protected (tasks.yaml frozen); ②–⑤ were exposed — this is the backbone of the talk (the defenses use L0/L1/L2; don’t confuse them with these 5 layers).", { x: 0.6, y: 6.8, w: 12.15, h: 0.3, fontFace: BF, fontSize: 11.5, italic: true, color: MUTE, margin: 0 });
codeRef(s, "docs/evolution_design_notes.md §3 (5-layer table) · defenses: interaction_tool_wrapper.py · retrieval_executor.py · tool_loader.py");

// ============================================================ 9 INSIGHT
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("KEY INSIGHT", { x: 1, y: 1.7, w: 11, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: ICE, charSpacing: 3, margin: 0 });
s.addText("fitness tells you\nit “broke” — not\n“where it broke”", { x: 0.95, y: 2.4, w: 11.5, h: 2.6, fontFace: HF, fontSize: 40, bold: true, color: WHITE, lineSpacing: 48, margin: 0 });
s.addText("That’s why some seemingly harmless mutations cause crashes — a single scalar score can’t do credit assignment.", { x: 1, y: 5.5, w: 11, h: 0.8, fontFace: BF, fontSize: 17, color: ICE, margin: 0 });
codeRef(s, "docs/evolution_design_notes.md §3 (key insight) — the fix is L0: turn the blind spot into signal", true);

// ============================================================ 10 PROTOCOL/POLICY
s = p.addSlide();
header(s, "Part 2 · Principle", "Design principle: separate protocol from policy");
card(s, 0.6, 2.0, 12.15, 1.9, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 2.0, w: 0.12, h: 1.9, fill: { color: NAVY } });
s.addText("Protocol layer — frozen, machine-verified, code-enforced", { x: 0.95, y: 2.2, w: 11.6, h: 0.5, fontFace: HF, fontSize: 18, bold: true, color: NAVY, margin: 0 });
s.addText("“How a tool is called”: function signature, parameter schema, call format, return format, registration", { x: 0.95, y: 2.85, w: 11.6, h: 0.9, fontFace: BF, fontSize: 14.5, color: INK, margin: 0 });
card(s, 0.6, 4.1, 12.15, 1.9, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 4.1, w: 0.12, h: 1.9, fill: { color: AMBER } });
s.addText("Policy layer — freely evolved", { x: 0.95, y: 4.3, w: 11.6, h: 0.5, fontFace: HF, fontSize: 18, bold: true, color: AMBER, margin: 0 });
s.addText("“How a tool is used”: what to fetch, how much, when, how to digest results, even “what new tool is needed”", { x: 0.95, y: 4.95, w: 11.6, h: 0.9, fontFace: BF, fontSize: 14.5, color: INK, margin: 0 });
s.addText([{ text: "Safety constitution  ", options: { bold: true, color: RED } }, { text: "worst case = graceful degradation, never a catastrophic crash.", options: { color: INK } }], { x: 0.6, y: 6.3, w: 12, h: 0.5, fontFace: BF, fontSize: 15, margin: 0 });
codeRef(s, "Protocol: retrieval_executor.py:28-30 ALLOWED_QUERIES/STRATEGIES (frozen) ｜ Policy: config/agents_evolving.yaml:11-16 retrieval_policy (evolved)");

// ============================================================ 11 SOLUTION OVERVIEW
s = p.addSlide();
header(s, "Part 3 · Solution", "Layered solution: L0 → L1 → L2");
const lay = [
  ["L0", "See it", "Tool-call observability — turn blind spots into signal", GREEN],
  ["L1", "Use it safely", "Take tool calling away from the LLM → deterministic executor", BLUE],
  ["L2", "Build it safely", "Let evolution invent new tools — a four-gate sandbox", NAVY],
];
lay.forEach((l, i) => {
  const y = 1.95 + i * 1.55;
  card(s, 0.6, y, 12.15, 1.35);
  chip(s, 0.95, y + 0.42, l[0][1], l[3]);
  s.addText(l[0], { x: 1.6, y: y + 0.2, w: 2, h: 0.5, fontFace: HF, fontSize: 22, bold: true, color: l[3], margin: 0 });
  s.addText(l[1], { x: 1.6, y: y + 0.72, w: 2.3, h: 0.4, fontFace: BF, fontSize: 12.5, color: MUTE, margin: 0 });
  s.addText(l[2], { x: 4.1, y, w: 8.5, h: 1.35, fontFace: BF, fontSize: 15.5, color: INK, valign: "middle", margin: 0 });
});
s.addText("Every layer obeys the same constitution: worst case is a low score, not a crash.", { x: 0.6, y: 6.68, w: 12, h: 0.3, fontFace: BF, fontSize: 13, italic: true, color: MUTE, margin: 0 });
codeRef(s, "L0 interaction_tool_wrapper.py · L1 retrieval_executor.py · L2 tool_loader.py (all in src/tools/)");

// ============================================================ 12 L0
s = p.addSlide();
header(s, "Part 3 · L0", "L0: tool-call observability");
card(s, 0.6, 2.0, 6.0, 4.6);
s.addText("What it does", { x: 0.9, y: 2.25, w: 5, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "thread-safe call log", options: { bold: true, color: NAVY, breakLine: true } },
  { text: "each path records (query_type, ok)", options: { color: INK, breakLine: true } },
  { text: "evaluator rolls it up into artifacts", options: { bold: true, color: NAVY, breakLine: true } },
  { text: "total_calls / coverage / missing_essential …", options: { fontFace: CF, fontSize: 11, color: MUTE } },
], { x: 0.9, y: 2.75, w: 5.4, h: 2, fontSize: 14, lineSpacing: 22, margin: 0 });
s.addText("The next mutation’s prompt can see diagnostics like “missing_essential: [user]”", { x: 0.9, y: 5.2, w: 5.4, h: 1, fontFace: BF, fontSize: 13, italic: true, color: BLUE, margin: 0 });
card(s, 6.9, 2.0, 5.85, 4.6, NAVY);
s.addText("Why it’s the foundation", { x: 7.2, y: 2.25, w: 5, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: AMBER, margin: 0 });
s.addText("Without L0, L1’s clamp and L2’s quarantine are invisible — you’re flying blind.", { x: 7.2, y: 2.8, w: 5.3, h: 1.2, fontFace: BF, fontSize: 15, color: WHITE, margin: 0 });
s.addText([{ text: "Design note  ", options: { bold: true, color: ICE } }, { text: "pure observability add-on / env-var opt-in — default behavior unchanged bit-for-bit.", options: { color: WHITE } }], { x: 7.2, y: 4.5, w: 5.3, h: 1.5, fontFace: BF, fontSize: 14, valign: "top", margin: 0 });
codeRef(s, "interaction_tool_wrapper.py:17 _TOOL_CALL_LOG · :21 _record · :26 drain_tool_log ｜ openevolve_evaluator.py:31 _summarize_tool_use");

// ============================================================ 13 L1 executor
s = p.addSlide();
header(s, "Part 3 · L1", "L1: take tool calling out of the LLM’s hands");
s.addText([
  { text: "The evolution side declares ", options: { color: INK } },
  { text: "retrieval_policy", options: { fontFace: CF, bold: true, color: BLUE } },
  { text: " (what to fetch, sampling, truncation); the frozen executor interprets it.", options: { color: INK } },
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
  { text: "Project illegal values back into the legal space, ", options: { color: INK } },
  { text: "never raise", options: { bold: true, color: GREEN } },
  { text: ".", options: { color: INK, breakLine: true } },
  { text: "k=999999 → 50 · bogus query → filtered · all garbage → default", options: { fontFace: CF, fontSize: 11, color: MUTE } },
], { x: 7.2, y: 3.4, w: 5.3, h: 1.4, fontSize: 14, lineSpacing: 20, margin: 0 });
s.addText("Worst case = degrade to baseline retrieval; the pipeline never crashes.", { x: 7.2, y: 5.2, w: 5.3, h: 1, fontFace: BF, fontSize: 13.5, italic: true, color: BLUE, margin: 0 });
codeRef(s, "src/tools/retrieval_executor.py:44 _clamp_int · :53 normalize_policy (clamp) · :103 _sample_reviews · :140 execute_policy");

// ============================================================ 14 whitelist != no space
s = p.addSlide();
header(s, "Part 3 · L1", "Big misconception: a whitelist ≠ no room to evolve");
card(s, 0.6, 2.1, 12.15, 1.5, NAVY);
s.addText([
  { text: "ALLOWED_QUERIES", options: { fontFace: CF, bold: true, color: ICE } },
  { text: " = the alphabet (what is permitted)   frozen", options: { color: WHITE, breakLine: true } },
  { text: "retrieval_policy", options: { fontFace: CF, bold: true, color: AMBER } },
  { text: " = a sentence built from that alphabet (what is chosen)   evolved", options: { color: WHITE } },
], { x: 0.95, y: 2.4, w: 11.5, h: 1, fontSize: 15.5, lineSpacing: 26, valign: "middle", margin: 0 });
s.addText("26 letters are fixed, yet you can write infinitely many sentences. Under the same whitelist, different policies (which subset, what order, sampling, k, truncation) feed wildly different context downstream.", { x: 0.6, y: 3.9, w: 12.15, h: 1.0, fontFace: BF, fontSize: 15.5, color: INK, margin: 0 });
s.addText([
  { text: "The real ceiling is the dataset", options: { bold: true, color: RED } },
  { text: " (only user / item / review — three tables), not the whitelist, which merely mirrors the data boundary.", options: { color: INK } },
], { x: 0.6, y: 5.1, w: 12.15, h: 1.2, fontFace: BF, fontSize: 15.5, margin: 0 });
codeRef(s, "src/tools/retrieval_executor.py:29 ALLOWED_QUERIES (alphabet) · :33-37 DEFAULT_POLICY · :53 normalize_policy (compose sentence)");

// ============================================================ 15 L1 wiring
s = p.addSlide();
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

// ============================================================ 16 L2 four gates
s = p.addSlide();
header(s, "Part 3 · L2", "L2: let evolution invent tools — a four-gate sandbox");
s.addText("Data is fixed (3 tables) → a “new tool” = bounded feature engineering, not unbounded code generation", { x: 0.6, y: 1.95, w: 12.15, h: 0.4, fontFace: BF, fontSize: 14.5, italic: true, color: BLUE, margin: 0 });
const gates = [
  ["1", "AST safety scan", "block import / open / exec / dunder escapes"],
  ["2", "Signature check", "only tool_* + (kit, user_id, item_id)"],
  ["3", "Sandbox trial", "5s timeout; bad tools silently dropped"],
  ["4", "Wrap & register", "docstring → the tool description the agent sees"],
];
gates.forEach((g, i) => {
  const x = 0.6 + (i % 2) * 6.15, y = 2.6 + Math.floor(i / 2) * 1.75;
  card(s, x, y, 5.9, 1.5);
  chip(s, x + 0.28, y + 0.5, g[0], NAVY);
  s.addText(g[1], { x: x + 0.95, y: y + 0.22, w: 4.7, h: 0.5, fontFace: HF, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText(g[2], { x: x + 0.95, y: y + 0.72, w: 4.75, h: 0.6, fontFace: BF, fontSize: 12.5, color: MUTE, margin: 0 });
});
s.addText([{ text: "ReadOnlyKit  ", options: { bold: true, color: AMBER } }, { text: "exposes only get_user / get_item / get_reviews — everything funnels to read-only data; no filesystem / network / ground truth.", options: { color: INK } }], { x: 0.6, y: 6.25, w: 12.15, h: 0.6, fontFace: BF, fontSize: 13, margin: 0 });
codeRef(s, "src/tools/tool_loader.py:77 ast_safety_scan · :106 signature_ok · :120 trial_run · :156 _wrap_as_crewai_tool · :60 ReadOnlyKit");

// ============================================================ 17 docstring + placement
s = p.addSlide();
header(s, "Part 3 · L2", "docstring co-evolution + tools at the “decision point”");
card(s, 0.6, 2.0, 6.0, 4.6);
s.addText("docstring co-evolution", { x: 0.9, y: 2.25, w: 5.4, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "docstring quality", options: { fontFace: CF, fontSize: 12, bold: true, color: BLUE, breakLine: true } },
  { text: "  ↓ agent calls / doesn’t call", options: { color: INK, breakLine: true } },
  { text: "  ↓ info enters reasoning or not", options: { color: INK, breakLine: true } },
  { text: "  ↓ combined_score", options: { color: INK, breakLine: true } },
  { text: "  ↓ OpenEvolve selection", options: { color: INK, breakLine: true } },
  { text: "  ↓ gene survives", options: { color: INK } },
], { x: 0.9, y: 2.8, w: 5.4, h: 2.6, fontSize: 13.5, lineSpacing: 22, margin: 0 });
s.addText("A tool’s “discoverability” is under evolutionary pressure too.", { x: 0.9, y: 5.7, w: 5.4, h: 0.6, fontFace: BF, fontSize: 13, italic: true, color: BLUE, margin: 0 });
card(s, 6.9, 2.0, 5.85, 4.6, NAVY);
s.addText("Mounted on psychological_analyst", { x: 7.2, y: 2.25, w: 5.4, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: AMBER, margin: 0 });
s.addText([
  { text: "data point → decision point → output point", options: { color: ICE, breakLine: true } },
  { text: "Tools go where judgment happens.", options: { color: WHITE } },
], { x: 7.2, y: 2.8, w: 5.3, h: 1, fontSize: 14, lineSpacing: 22, margin: 0 });
s.addText([
  { text: "Why not data_retriever?", options: { bold: true, color: ICE, breakLine: true } },
  { text: "It would reintroduce the crash risk L1 just removed · muddy responsibilities · too early (no analysis context yet)", options: { color: WHITE } },
], { x: 7.2, y: 4.0, w: 5.3, h: 2.4, fontFace: BF, fontSize: 13, valign: "top", lineSpacing: 18, margin: 0 });
codeRef(s, "src/tools/tool_loader.py:156-177 _wrap_as_crewai_tool (docstring→description) · simulation_crew.py:53-62 analyst tools=_load_analyst_tools()");

// ============================================================ 18 #7 train/val
s = p.addSlide();
header(s, "Part 4 · Trust mechanisms", "#7 Train / Val split: the overfitting mirror");
s.addText("Evolution “memorizes the answers” — specializes to those train tasks without generalizing. A disjoint holdout catches it.", { x: 0.6, y: 1.95, w: 12.15, h: 0.4, fontFace: BF, fontSize: 14.5, color: INK, margin: 0 });
card(s, 0.6, 2.7, 5.95, 3.6, "F7E9E7");
s.addText("Overfit (false champion)", { x: 0.9, y: 2.95, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: RED, margin: 0 });
s.addText([
  { text: "train  0.90", options: { fontFace: CF, fontSize: 20, bold: true, color: INK, breakLine: true } },
  { text: "holdout  0.40", options: { fontFace: CF, fontSize: 20, bold: true, color: RED, breakLine: true } },
  { text: "gap 0.50 → 🚨 alarm", options: { color: RED, bold: true } },
], { x: 0.9, y: 3.6, w: 5.4, h: 2, fontSize: 15, lineSpacing: 30, margin: 0 });
card(s, 6.8, 2.7, 5.95, 3.6, "E7F2EC");
s.addText("Generalizes (trustworthy)", { x: 7.1, y: 2.95, w: 5.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: GREEN, margin: 0 });
s.addText([
  { text: "train  0.75", options: { fontFace: CF, fontSize: 20, bold: true, color: INK, breakLine: true } },
  { text: "holdout  0.72", options: { fontFace: CF, fontSize: 20, bold: true, color: GREEN, breakLine: true } },
  { text: "gap 0.03 → ✅ really learned", options: { color: GREEN, bold: true } },
], { x: 7.1, y: 3.6, w: 5.4, h: 2, fontSize: 15, lineSpacing: 30, margin: 0 });
s.addText("make validate-holdout — disjoint verified, overlap = 0", { x: 0.6, y: 6.5, w: 12, h: 0.4, fontFace: CF, fontSize: 13, color: MUTE, margin: 0 });
codeRef(s, "openevolve_evaluator.py:83-84 OPENEVOLVE_TASK_DIR · scripts/validate_holdout.py:25 switch to holdout · create_sampled_dataset.py:8 disjoint");

// ============================================================ 19 #6 MAP-Elites
s = p.addSlide();
header(s, "Part 4 · Trust mechanisms", "#6 MAP-Elites custom dimensions");
s.addText("A single combined_score squashes two extreme specialists to a mediocre middle. Use the two sub-metrics as diversity dimensions instead.", { x: 0.6, y: 1.95, w: 12.15, h: 0.4, fontFace: BF, fontSize: 14.5, color: INK, margin: 0 });
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
  { text: " decides who wins (fitness)", options: { color: WHITE, breakLine: true } },
  { text: "preference × review", options: { fontFace: CF, bold: true, color: ICE } },
  { text: " only sets coordinates (diversity)", options: { color: WHITE } },
], { x: 7.8, y: 3.5, w: 4.7, h: 1.6, fontSize: 13.5, lineSpacing: 22, margin: 0 });
s.addText("Keeps elites across the trade-off frontier and breeds hybrids.", { x: 7.8, y: 5.3, w: 4.7, h: 1, fontFace: BF, fontSize: 13, italic: true, color: ICE, margin: 0 });
codeRef(s, "config/openevolve_config.yaml:85-88 feature_dimensions (8×8) · openevolve_evaluator.py:47-59 _result(extra_metrics) · :174-177");

// ============================================================ 20 engineering lessons
s = p.addSlide();
header(s, "Part 5 · Engineering lessons", "Two real bugs, one maxim");
card(s, 0.6, 2.0, 6.0, 2.3);
s.addText("Bug #1 — __import__ in the restricted sandbox", { x: 0.9, y: 2.25, w: 5.4, h: 0.4, fontFace: HF, fontSize: 14.5, bold: true, color: NAVY, margin: 0 });
s.addText("Removing __import__ broke even the whitelisted `import statistics`. Defense in depth must leave a “safe door”.", { x: 0.9, y: 2.75, w: 5.4, h: 1.4, fontFace: BF, fontSize: 13.5, color: INK, margin: 0 });
card(s, 6.9, 2.0, 5.85, 2.3);
s.addText("Bug #2 — @tool needs a docstring", { x: 7.2, y: 2.25, w: 5.3, h: 0.4, fontFace: HF, fontSize: 14.5, bold: true, color: NAVY, margin: 0 });
s.addText("combined_score=0.8452 looked perfect, but agent.tools == [] — the tools never attached.", { x: 7.2, y: 2.75, w: 5.3, h: 1.4, fontFace: BF, fontSize: 13.5, color: INK, margin: 0 });
card(s, 0.6, 4.5, 12.15, 2.1, NAVY);
s.addText("“ A healthy score ≠ correct behavior ”", { x: 0.95, y: 4.75, w: 11.5, h: 0.7, fontFace: HF, fontSize: 27, bold: true, color: AMBER, margin: 0 });
s.addText("Graceful fallback disguises “tools never attached” as “score looks fine”. Verify the feature itself (the tools list), not just the score.", { x: 0.95, y: 5.55, w: 11.5, h: 0.9, fontFace: BF, fontSize: 15, color: WHITE, margin: 0 });
codeRef(s, "tool_loader.py:139-146 _safe_import (bug#1) · :156-177 docstring transfer (bug#2) · simulation_crew.py:21-30 graceful [] hides the failure", true);

// ============================================================ 21 results
s = p.addSlide();
header(s, "Part 6 · Results", "Before vs after L1 wiring: the stability shift");
const rows = [
  ["Metric", "Before (earlier run)", "After L1 wiring"],
  ["LLM calls per task", "~7 (incl. ReAct round-trips)", "~3"],
  ["tool-calling crashes", "many", "0"],
  ["tool_use coverage", "unstable", "stable 1.0"],
  ["429 rate limit", "59 times", "greatly reduced"],
];
const tableData = [];
for (let ri = 0; ri < rows.length; ri++) {
  const rowCells = [];
  for (let ci = 0; ci < rows[ri].length; ci++) {
    rowCells.push({
      text: rows[ri][ci],
      options: {
        fontFace: ri === 0 ? HF : (ci === 0 ? BF : CF), fontSize: ri === 0 ? 15 : 13.5,
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
  { text: "Evolution runs: ", options: { bold: true, color: NAVY } },
  { text: " v1 best 0.79 · earlier run best 0.64 (rate-limit hit) · L1 validation 0.78 · 46 unit tests all green", options: { color: INK } },
], { x: 0.6, y: 6.4, w: 12.15, h: 0.5, fontFace: BF, fontSize: 13.5, margin: 0 });
codeRef(s, "docs/evolution_design_notes.md §12.4 (before/after) · §12.3 (evolution-run history)");

// ============================================================ 22 full picture / takeaways
s = p.addSlide();
header(s, "Part 6 · Results", "Full picture + key takeaways");
card(s, 0.6, 2.0, 4.0, 4.7, NAVY);
s.addText("Taxonomy progress", { x: 0.85, y: 2.25, w: 3.5, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: AMBER, margin: 0 });
s.addText([
  { text: "✅ L0  observability", options: { color: WHITE, breakLine: true } },
  { text: "✅ L1  clamp + wiring", options: { color: WHITE, breakLine: true } },
  { text: "✅ #7  Train-Val", options: { color: WHITE, breakLine: true } },
  { text: "✅ #6  MAP-Elites", options: { color: WHITE, breakLine: true } },
  { text: "✅ L2  tool generation", options: { color: WHITE, breakLine: true } },
  { text: "⬜ Tier C  RagTool", options: { color: ICE } },
], { x: 0.85, y: 2.85, w: 3.5, h: 3.5, fontFace: CF, fontSize: 13.5, lineSpacing: 30, margin: 0 });
const tk = [
  "Evolution can design agents, but must be stopped from breaking itself",
  "Protocol/policy split + graceful degradation = safely-evolvable terrain",
  "Auto-optimization needs trust mechanisms (holdout, MAP-Elites) to avoid self-deception",
  "A healthy score ≠ correct behavior; don’t trust docs, read the source",
];
tk.forEach((t, i) => {
  const y = 2.0 + i * 1.2;
  card(s, 4.85, y, 7.9, 1.05);
  chip(s, 5.1, y + 0.28, `${i + 1}`, AMBER, NAVY);
  s.addText(t, { x: 5.75, y, w: 6.85, h: 1.05, fontFace: BF, fontSize: 13.5, color: INK, valign: "middle", margin: 0 });
});
codeRef(s, "docs/evolution_design_notes.md §11 (progress & PRs) · §12.7 (full-architecture data: baseline 0.72 → best 0.842)");

// ============================================================ 23 closing
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.28, h: H, fill: { color: AMBER } });
s.addText("Thank you · Q & A", { x: 0.95, y: 2.6, w: 11.5, h: 1, fontFace: HF, fontSize: 42, bold: true, color: WHITE, margin: 0 });
s.addText([
  { text: "repo   ", options: { bold: true, color: AMBER } },
  { text: "github.com/yuchieh/AgentSocietyChallenge_OpenEvolve", options: { color: ICE, breakLine: true } },
  { text: "deeper   ", options: { bold: true, color: AMBER } },
  { text: "docs/evolution_design_notes.md · docs/student_integration_guide.md", options: { color: ICE } },
], { x: 1, y: 4.0, w: 11.5, h: 1.4, fontFace: BF, fontSize: 16, lineSpacing: 30, margin: 0 });
codeRef(s, "tests/test_retrieval_executor.py + tests/test_tool_loader.py (46 green) · docs/evolution_design_notes.md", true);

p.writeFile({ fileName: "/tmp/deck/OpenEvolve_CrewAI_Teaching_EN.pptx" }).then(f => console.log("WROTE", f));
