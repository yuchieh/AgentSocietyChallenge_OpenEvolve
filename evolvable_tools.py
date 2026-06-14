# L2 evolvable tools — seed population for OpenEvolve.
#
# OpenEvolve evolves the tool_* functions inside the EVOLVE-BLOCK below. Each
# tool computes a DERIVED analysis over the fixed dataset and returns a short
# text string that psychological_analyst can read.
#
# Contract (enforced by src/tools/tool_loader.py — do not break it):
#   - name must start with `tool_`
#   - signature must be exactly (kit, user_id, item_id)
#   - `kit` is a ReadOnlyKit exposing only: get_user(user_id),
#     get_item(item_id), get_reviews(user_id=..., item_id=...)
#   - must RETURN a short non-empty str (<= 4000 chars); never print
#   - allowed imports: statistics, math, json, re, collections, datetime,
#     itertools, functools   (no os/sys/open/exec/etc — they are blocked)
#   - the docstring is the tool's "advertisement": it is shown to the agent,
#     so describe clearly WHEN and WHY the tool is useful.

# EVOLVE-BLOCK-START
import statistics


def tool_rating_variance(kit, user_id, item_id):
    """Report how consistent vs erratic this user's past star ratings are
    (variance + min/max). Useful when deciding how much to trust their
    historical average as a predictor."""
    reviews = kit.get_reviews(user_id=user_id)
    stars = [r["stars"] for r in reviews if isinstance(r, dict) and "stars" in r]
    if len(stars) < 2:
        return "rating_variance: insufficient history (<2 reviews)"
    return (f"rating_variance={statistics.variance(stars):.2f}, "
            f"mean={statistics.mean(stars):.2f}, "
            f"min={min(stars)}, max={max(stars)}, n={len(stars)}")


def tool_category_affinity(kit, user_id, item_id):
    """Compare the user's average rating on items sharing THIS item's categories
    vs their overall average. Useful for judging whether the user tends to like
    or dislike this kind of place."""
    item = kit.get_item(item_id=item_id)
    cats = set(str(item.get("categories", "")).split(", ")) if isinstance(item, dict) else set()
    reviews = kit.get_reviews(user_id=user_id)
    all_stars, cat_stars = [], []
    for r in reviews:
        if not isinstance(r, dict) or "stars" not in r:
            continue
        all_stars.append(r["stars"])
        r_item = kit.get_item(item_id=r.get("item_id", ""))
        r_cats = set(str(r_item.get("categories", "")).split(", ")) if isinstance(r_item, dict) else set()
        if cats & r_cats:
            cat_stars.append(r["stars"])
    if not all_stars:
        return "category_affinity: no rating history"
    overall = statistics.mean(all_stars)
    if not cat_stars:
        return f"category_affinity: no prior ratings in these categories; overall mean={overall:.2f}"
    return (f"category_affinity: mean_in_category={statistics.mean(cat_stars):.2f} "
            f"(n={len(cat_stars)}) vs overall={overall:.2f}")
# EVOLVE-BLOCK-END
