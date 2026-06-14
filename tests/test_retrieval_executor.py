"""Unit tests for the L1 retrieval-policy executor.

The point of these tests is to PROVE the safety contract: no matter how
malformed the evolved policy is, normalize_policy / execute_policy never
raise — they project the policy back into the legal space.

Run: uv run python -m unittest tests.test_retrieval_executor
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.tools.retrieval_executor import (  # noqa: E402
    ALLOWED_QUERIES,
    ALLOWED_STRATEGIES,
    DEFAULT_POLICY,
    normalize_policy,
    execute_policy,
    _sample_reviews,
)


class FakeInteractionTool:
    """Minimal stand-in for the official InteractionTool."""

    def __init__(self, reviews=None):
        self._reviews = reviews if reviews is not None else []

    def get_user(self, user_id):
        return {"user_id": user_id, "average_stars": 3.5}

    def get_item(self, item_id):
        return {"item_id": item_id, "stars": 4.0, "categories": "Pizza"}

    def get_reviews(self, user_id=None, item_id=None):
        return self._reviews


def _make_reviews():
    return [
        {"stars": 5.0, "text": "loved it, amazing", "date": "2023-01-01"},
        {"stars": 1.0, "text": "hated it", "date": "2024-06-01"},
        {"stars": 3.0, "text": "this is a much longer middling review " * 5, "date": "2022-03-01"},
        {"stars": 4.0, "text": "good", "date": "2025-02-01"},
    ]


class TestNormalizePolicy(unittest.TestCase):
    def test_none_returns_default(self):
        self.assertEqual(normalize_policy(None), DEFAULT_POLICY)

    def test_non_dict_returns_default(self):
        for junk in ["a string", 42, ["list"], 3.14]:
            self.assertEqual(normalize_policy(junk), DEFAULT_POLICY)

    def test_illegal_query_types_filtered(self):
        p = normalize_policy({"queries": ["telepathy", "user", "sql_injection", "item"]})
        self.assertEqual(p["queries"], ["user", "item"])

    def test_empty_queries_falls_back_to_default(self):
        p = normalize_policy({"queries": []})
        self.assertEqual(p["queries"], DEFAULT_POLICY["queries"])
        p2 = normalize_policy({"queries": ["nonsense_only"]})
        self.assertEqual(p2["queries"], DEFAULT_POLICY["queries"])

    def test_queries_dedupe_preserve_order(self):
        p = normalize_policy({"queries": ["item", "user", "item", "user"]})
        self.assertEqual(p["queries"], ["item", "user"])

    def test_all_legal_queries_pass_through(self):
        p = normalize_policy({"queries": list(ALLOWED_QUERIES)})
        self.assertEqual(p["queries"], list(ALLOWED_QUERIES))

    def test_illegal_strategy_falls_back(self):
        p = normalize_policy({"review_sampling": {"strategy": "telepathy", "k": 10}})
        self.assertEqual(p["review_sampling"]["strategy"], "recent")
        self.assertEqual(p["review_sampling"]["k"], 10)

    def test_k_clamped_high_and_low(self):
        self.assertEqual(normalize_policy({"review_sampling": {"k": 999999}})["review_sampling"]["k"], 50)
        self.assertEqual(normalize_policy({"review_sampling": {"k": -5}})["review_sampling"]["k"], 1)
        self.assertEqual(normalize_policy({"review_sampling": {"k": 0}})["review_sampling"]["k"], 1)

    def test_k_garbage_falls_back(self):
        p = normalize_policy({"review_sampling": {"k": "twelve"}})
        self.assertEqual(p["review_sampling"]["k"], DEFAULT_POLICY["review_sampling"]["k"])

    def test_review_sampling_non_dict(self):
        p = normalize_policy({"review_sampling": "recent please"})
        self.assertEqual(p["review_sampling"]["strategy"], "recent")
        self.assertEqual(p["review_sampling"]["k"], DEFAULT_POLICY["review_sampling"]["k"])

    def test_max_chars_clamped(self):
        self.assertEqual(normalize_policy({"max_chars_per_result": 9_999_999})["max_chars_per_result"], 20000)
        self.assertEqual(normalize_policy({"max_chars_per_result": 1})["max_chars_per_result"], 500)
        self.assertEqual(normalize_policy({"max_chars_per_result": "abc"})["max_chars_per_result"],
                         DEFAULT_POLICY["max_chars_per_result"])

    def test_all_strategies_recognized(self):
        for s in ALLOWED_STRATEGIES:
            p = normalize_policy({"review_sampling": {"strategy": s}})
            self.assertEqual(p["review_sampling"]["strategy"], s)


class TestSampleReviews(unittest.TestCase):
    def test_recent_orders_by_date_desc(self):
        out = _sample_reviews(_make_reviews(), {"strategy": "recent", "k": 2})
        self.assertEqual([r["date"] for r in out], ["2025-02-01", "2024-06-01"])

    def test_longest_orders_by_text_len_desc(self):
        out = _sample_reviews(_make_reviews(), {"strategy": "longest", "k": 1})
        self.assertEqual(out[0]["stars"], 3.0)  # the "much longer" one

    def test_extreme_ratings_furthest_from_3_first(self):
        out = _sample_reviews(_make_reviews(), {"strategy": "extreme_ratings", "k": 2})
        extremes = sorted(r["stars"] for r in out)
        self.assertEqual(extremes, [1.0, 5.0])

    def test_k_limits_count(self):
        out = _sample_reviews(_make_reviews(), {"strategy": "recent", "k": 3})
        self.assertEqual(len(out), 3)

    def test_non_list_returns_as_is(self):
        self.assertEqual(_sample_reviews("not a list", {"strategy": "recent", "k": 5}), "not a list")

    def test_malformed_review_elements_dont_crash(self):
        weird = [{"stars": "bad"}, "string_review", 42, {"text": None}]
        out = _sample_reviews(weird, {"strategy": "extreme_ratings", "k": 10})
        self.assertEqual(len(out), 4)  # no crash, all returned


class TestExecutePolicy(unittest.TestCase):
    def test_basic_execution_formats_sections(self):
        tool = FakeInteractionTool(_make_reviews())
        ctx = execute_policy(
            {"queries": ["user", "item", "review_by_user"]}, tool, "u1", "i1"
        )
        self.assertIn("## user", ctx)
        self.assertIn("## item", ctx)
        self.assertIn("## review_by_user", ctx)

    def test_garbage_policy_does_not_crash(self):
        tool = FakeInteractionTool(_make_reviews())
        for junk in [None, "string", 42, {"queries": ["evil"]}, {"review_sampling": {"k": -99}}]:
            ctx = execute_policy(junk, tool, "u1", "i1")
            self.assertIsInstance(ctx, str)
            self.assertTrue(len(ctx) > 0)  # falls back to default queries

    def test_max_chars_truncates(self):
        long_reviews = [{"stars": 5.0, "text": "x" * 100000, "date": "2023-01-01"}]
        tool = FakeInteractionTool(long_reviews)
        ctx = execute_policy(
            {"queries": ["review_by_user"], "max_chars_per_result": 500}, tool, "u1", "i1"
        )
        # section header + at most 500 chars of content
        self.assertLess(len(ctx), 600)

    def test_per_query_failure_isolated(self):
        class HalfBrokenTool(FakeInteractionTool):
            def get_item(self, item_id):
                raise RuntimeError("item store down")

        tool = HalfBrokenTool(_make_reviews())
        ctx = execute_policy({"queries": ["user", "item", "review_by_user"]}, tool, "u1", "i1")
        self.assertIn("## user", ctx)
        self.assertIn("retrieval error", ctx)        # item failed but annotated
        self.assertIn("## review_by_user", ctx)      # subsequent query still ran


if __name__ == "__main__":
    unittest.main(verbosity=2)
