"""Unit tests for the L2 tool sandbox (src/tools/tool_loader.py).

Proves the safety contract: malicious code is blocked by the AST scan, broken
tools are silently dropped by the sandbox trial, good tools pass, and a mixed
file degrades gracefully (survivors load, the rest are dropped, nothing raises).

Run: uv run python -m unittest tests.test_tool_loader
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.tools.tool_loader import (  # noqa: E402
    ast_safety_scan,
    signature_ok,
    trial_run,
    load_evolved_tools,
    ReadOnlyKit,
)


class FakeInteractionTool:
    def get_user(self, user_id):
        return {"user_id": user_id, "average_stars": 3.5}

    def get_item(self, item_id):
        return {"item_id": item_id, "categories": "Pizza, Restaurants"}

    def get_reviews(self, user_id=None, item_id=None):
        return [
            {"stars": 5.0, "item_id": "i1", "text": "great"},
            {"stars": 2.0, "item_id": "i2", "text": "meh"},
            {"stars": 4.0, "item_id": "i1", "text": "good"},
        ]


# ── Gate 1: AST safety scan ──
class TestAstSafetyScan(unittest.TestCase):
    def test_clean_code_passes(self):
        src = "import statistics\ndef tool_x(kit, u, i):\n    return 'ok'\n"
        self.assertEqual(ast_safety_scan(src), [])

    def test_forbidden_import_os(self):
        v = ast_safety_scan("import os\ndef tool_x(kit,u,i):\n    return 'x'\n")
        self.assertTrue(any("forbidden import: os" in x for x in v))

    def test_forbidden_import_from(self):
        v = ast_safety_scan("from subprocess import run\ndef tool_x(kit,u,i):\n    return 'x'\n")
        self.assertTrue(any("subprocess" in x for x in v))

    def test_forbidden_open(self):
        v = ast_safety_scan("def tool_x(kit,u,i):\n    return open('/etc/passwd').read()\n")
        self.assertTrue(any("forbidden call: open" in x for x in v))

    def test_forbidden_exec_eval(self):
        self.assertTrue(ast_safety_scan("def tool_x(k,u,i):\n    exec('x')\n    return 'a'\n"))
        self.assertTrue(ast_safety_scan("def tool_x(k,u,i):\n    return eval('1')\n"))

    def test_forbidden_dunder_escape(self):
        # classic sandbox escape via __class__/__globals__
        v = ast_safety_scan("def tool_x(k,u,i):\n    return ().__class__.__bases__\n")
        self.assertTrue(any("dunder" in x for x in v))

    def test_allowed_imports_pass(self):
        for mod in ("statistics", "math", "json", "re", "collections"):
            self.assertEqual(ast_safety_scan(f"import {mod}\n"), [], mod)

    def test_syntax_error_reported(self):
        self.assertTrue(ast_safety_scan("def tool_x(:\n"))


# ── Gate 2: signature ──
class TestSignatureOk(unittest.TestCase):
    def test_three_params_ok(self):
        self.assertTrue(signature_ok(lambda kit, user_id, item_id: "x"))

    def test_wrong_arity_rejected(self):
        self.assertFalse(signature_ok(lambda kit, user_id: "x"))
        self.assertFalse(signature_ok(lambda a, b, c, d: "x"))

    def test_varargs_rejected(self):
        self.assertFalse(signature_ok(lambda *args: "x"))


# ── Gate 3: sandbox trial run ──
class TestTrialRun(unittest.TestCase):
    def setUp(self):
        self.kit = ReadOnlyKit(FakeInteractionTool())

    def test_good_tool_passes(self):
        ok, reason = trial_run(lambda k, u, i: "result", self.kit, "u", "i")
        self.assertTrue(ok, reason)

    def test_non_str_return_dropped(self):
        ok, reason = trial_run(lambda k, u, i: 42, self.kit, "u", "i")
        self.assertFalse(ok)
        self.assertIn("non-str", reason)

    def test_empty_return_dropped(self):
        ok, reason = trial_run(lambda k, u, i: "", self.kit, "u", "i")
        self.assertFalse(ok)
        self.assertIn("empty", reason)

    def test_oversized_return_dropped(self):
        ok, reason = trial_run(lambda k, u, i: "x" * 99999, self.kit, "u", "i")
        self.assertFalse(ok)
        self.assertIn("oversized", reason)

    def test_exception_dropped(self):
        def boom(k, u, i):
            raise ValueError("nope")
        ok, reason = trial_run(boom, self.kit, "u", "i")
        self.assertFalse(ok)
        self.assertIn("exception", reason)

    def test_timeout_dropped(self):
        def slow(k, u, i):
            import time
            time.sleep(10)
            return "late"
        ok, reason = trial_run(slow, self.kit, "u", "i", timeout=1)
        self.assertFalse(ok)
        self.assertIn("timeout", reason)


# ── End-to-end load (Gates 1-4) ──
class TestLoadEvolvedTools(unittest.TestCase):
    def setUp(self):
        self.tool = FakeInteractionTool()

    def test_malicious_file_rejected_whole(self):
        src = "import os\ndef tool_x(kit,u,i):\n    return 'x'\n"
        tools, report = load_evolved_tools(src, self.tool, wrap=False)
        self.assertEqual(tools, [])
        self.assertIn("rejected_all", report)

    def test_good_tools_load(self):
        src = (
            "import statistics\n"
            "def tool_a(kit, user_id, item_id):\n"
            "    '''mean stars'''\n"
            "    rs=[r['stars'] for r in kit.get_reviews(user_id=user_id)]\n"
            "    return f'mean={statistics.mean(rs):.2f}'\n"
        )
        tools, report = load_evolved_tools(src, self.tool, fixture=("u", "i"), wrap=False)
        self.assertEqual(report["loaded"], ["tool_a"])
        self.assertEqual(len(tools), 1)

    def test_mixed_file_degrades_gracefully(self):
        # 1 good + 3 broken (non-str / exception / wrong-sig-not-tool)
        src = (
            "def tool_good(kit, user_id, item_id):\n"
            "    return 'fine'\n"
            "def tool_badret(kit, user_id, item_id):\n"
            "    return 123\n"
            "def tool_boom(kit, user_id, item_id):\n"
            "    raise RuntimeError('x')\n"
            "def tool_wrongsig(kit, user_id):\n"   # gate-2 reject (not 3 params)
            "    return 'y'\n"
        )
        tools, report = load_evolved_tools(src, self.tool, fixture=("u", "i"), wrap=False)
        self.assertEqual(report["loaded"], ["tool_good"])       # only the good one
        self.assertEqual(len(tools), 1)                          # pipeline survives
        dropped_names = " ".join(report["dropped"])
        self.assertIn("tool_badret", dropped_names)
        self.assertIn("tool_boom", dropped_names)
        # tool_wrongsig never becomes a candidate (gate-2), so not in dropped either
        self.assertNotIn("tool_wrongsig", dropped_names)

    def test_non_tool_prefix_ignored(self):
        src = (
            "def helper(kit, user_id, item_id):\n"   # no tool_ prefix
            "    return 'x'\n"
            "def tool_real(kit, user_id, item_id):\n"
            "    return 'y'\n"
        )
        tools, report = load_evolved_tools(src, self.tool, fixture=("u", "i"), wrap=False)
        self.assertEqual(report["loaded"], ["tool_real"])


# ── Gate 4: wrap=True produces usable CrewAI tools (regression: @tool needs docstring) ──
class TestWrapIntegration(unittest.TestCase):
    def test_wrap_true_produces_crewai_tool(self):
        src = ("def tool_x(kit, user_id, item_id):\n"
               "    '''my tool doc'''\n"
               "    return 'ok'\n")
        tools, report = load_evolved_tools(src, FakeInteractionTool(), fixture=("u", "i"), wrap=True)
        self.assertEqual(report["loaded"], ["tool_x"])
        self.assertEqual(len(tools), 1)
        self.assertEqual(tools[0].name, "tool_x")
        self.assertIn("my tool doc", tools[0].description)

    def test_wrap_true_tool_without_docstring_still_wraps(self):
        # the exact bug hit in Phase 2: CrewAI @tool requires a docstring;
        # the wrapper must supply a fallback so a docstring-less tool still wraps.
        src = ("def tool_nodoc(kit, user_id, item_id):\n"
               "    return 'ok'\n")
        tools, report = load_evolved_tools(src, FakeInteractionTool(), fixture=("u", "i"), wrap=True)
        self.assertEqual(len(tools), 1)
        self.assertEqual(tools[0].name, "tool_nodoc")


# ── The shipped seed tools must actually load ──
class TestSeedTools(unittest.TestCase):
    def test_seed_file_loads(self):
        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        with open(os.path.join(root, "evolvable_tools.py"), encoding="utf-8") as f:
            src = f.read()
        tools, report = load_evolved_tools(src, FakeInteractionTool(),
                                           fixture=("u1", "i1"), wrap=False)
        self.assertIn("tool_rating_variance", report["loaded"])
        self.assertIn("tool_category_affinity", report["loaded"])
        self.assertEqual(report["dropped"], [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
