# 10 Representative Programs — 50-iter full-architecture run (checkpoint_50)

Source: `config/openevolve_output/checkpoints/checkpoint_50/programs/` (50 programs total).
Best = iter22 `de559de9`, combined_score **0.8419**. Baseline = iter0 `5e46d1b3`, **0.7152**.

| # | file | id | iter | island | combined | pref | review | why representative |
|---|------|----|----|----|----|----|----|----|
| 1 | 01_baseline_iter0 | 5e46d1b3 | 0 | 0 | 0.7152 | 0.60 | 0.830 | the seed everything descends from |
| 2 | 02_early_jump_iter3 | 73fedba3 | 3 | 2 | 0.8059 | 0.76 | 0.852 | first big jump; ancestor of the island-2 line |
| 3 | 03_island0_breakthrough_iter16 | c760a243 | 16 | 0 | 0.8262 | 0.80 | 0.852 | first 0.82+ on island 0 |
| 4 | 04_champion_parent_iter19 | ad0b3b7e | 19 | 0 | 0.8269 | 0.80 | 0.854 | direct parent of the champion |
| 5 | 05_CHAMPION_iter22 | de559de9 | 22 | 0 | **0.8419** | 0.80 | 0.884 | the best program — the quantized rating formula |
| 6 | 06_iter22_migrant_copy | 2c9750b1 | (mig) | 1 | 0.8419 | 0.80 | 0.884 | a migrated copy of iter22 → why islands converged |
| 7 | 07_text_specialist_iter37 | f5a32d5c | 37 | 0 | 0.7387 | 0.60 | 0.877 | high review / low pref — the MAP-Elites trade-off |
| 8 | 08_overengineering_peak_iter30 | d6b39a15 | 30 | 2 | 0.8108 | 0.80 | 0.822 | high point of the over-engineering branch |
| 9 | 09_CRASH_iter34 | 15ea412f | 34 | 0 | 0.2763 | 0.00 | 0.553 | a crash — its YAML is malformed (one of the 8) |
| 10 | 10_late_plateau_iter45 | 0026a198 | 45 | 2 | 0.8095 | 0.80 | 0.819 | late program near the champion → convergence/plateau |

## What the run teaches

**retrieval_policy evolved** (and then converged on iter22's recipe):

| program | strategy | k | max_chars |
|---|---|---|---|
| baseline (iter0) | recent | 15 | 6000 |
| early jump (iter3) | extreme_ratings | 20 | 8000 |
| champion's parent (iter19) | random | 25 | 8500 |
| **champion (iter22)** | **extreme_ratings** | **30** | **9000** |
| late plateau (iter45) | extreme_ratings | 30 | 9500 |

→ evolution discovered that sampling **extreme-rated reviews**, **more of them** (k 15→30), with a **bigger budget** (6000→9000) feeds richer context — and later programs cluster around this, a sign of convergence.

**The crash (#9)** literally fails to parse as YAML — full-rewrite produced broken indentation, which bypasses the L1 clamp and drops to the 0.2763 fallback (pref 0.0). This is concrete evidence for the "5 broken-YAML crashes" finding.

**Migration (#6)** is a verbatim copy of iter22 on island 1 — this is how the champion's genes spread and the three islands converged (see evolution_design_notes §12.7(b)).
