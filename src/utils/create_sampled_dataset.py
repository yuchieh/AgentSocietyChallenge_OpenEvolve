import json
import os
import glob
import random
import argparse


def _load_excluded_pairs(exclude_dir):
    """Read (user_id, item_id) pairs from an existing task dir, to keep a new
    sample disjoint from it (e.g. holdout must not overlap train)."""
    pairs = set()
    if not exclude_dir or not os.path.isdir(exclude_dir):
        return pairs
    for path in glob.glob(os.path.join(exclude_dir, "task_*.json")):
        try:
            with open(path, "r", encoding="utf-8") as f:
                t = json.load(f)
            pairs.add((t.get("user_id"), t.get("item_id")))
        except Exception:
            continue
    return pairs


def create_sample(input_path, output_task_dir, output_gt_dir, n_samples,
                  exclude_dir=None, seed=42):
    os.makedirs(output_task_dir, exist_ok=True)
    os.makedirs(output_gt_dir, exist_ok=True)

    records = []
    with open(input_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line))

    # Optionally exclude pairs already used elsewhere (keeps train/holdout disjoint)
    excluded = _load_excluded_pairs(exclude_dir)
    if excluded:
        before = len(records)
        records = [r for r in records if (r["user_id"], r["item_id"]) not in excluded]
        print(f"Excluded {before - len(records)} records overlapping with {exclude_dir}")

    # ensure stability for reproduction
    random.seed(seed)
    sampled = random.sample(records, min(n_samples, len(records)))

    for i, rec in enumerate(sampled, start=1):
        task_data = {
            "type": "user_behavior_simulation",
            "user_id": rec["user_id"],
            "item_id": rec["item_id"]
        }
        gt_data = {
            "stars": rec["stars"],
            "review": rec["text"]
        }

        with open(os.path.join(output_task_dir, f"task_{i}.json"), 'w', encoding='utf-8') as f:
            json.dump(task_data, f, indent=2)

        with open(os.path.join(output_gt_dir, f"groundtruth_{i}.json"), 'w', encoding='utf-8') as f:
            json.dump(gt_data, f, indent=2)

    print(f"Successfully generated {len(sampled)} sample tasks in {output_task_dir} and {output_gt_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="dummy_dataset/test_review_subset.json")
    parser.add_argument("--task-dir", default="dummy_tasks")
    parser.add_argument("--gt-dir", default="dummy_groundtruth")
    parser.add_argument("--n", type=int, default=5)
    parser.add_argument("--exclude", default=None,
                        help="Task dir whose (user_id,item_id) pairs to exclude (e.g. dummy_tasks for a disjoint holdout)")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    create_sample(args.input, args.task_dir, args.gt_dir, args.n,
                  exclude_dir=args.exclude, seed=args.seed)
