# tiMely Technical Reference

> **Notice:** `tiMely` (exact casing: lowercase `t`, lowercase `i`, uppercase `M`, lowercase `ely`) is an internal engineering name. It must **never** appear in player-facing UI, in-game help, notifications, or user documentation.

---

## 1. Engine Overview

`tiMely` is Zimm's deterministic Sudoku generation, uniqueness validation, and logical deduction engine. It is responsible for:
1. Generating complete, valid 9x9 Sudoku grids via recursive backtracking with the Minimum Remaining Values (MRV) heuristic.
2. Carving clues while strictly proving single-solution uniqueness with a solution counter capped at two.
3. Executing a tiered logical solver that simulates human deductive reasoning (Naked Singles, Hidden Singles, Pointing Pairs, Claiming Pairs, Naked Pairs).
4. Emitting structured deduction logs used for difficulty profile validation and staged in-game hints.
5. Providing precomputed verified fallbacks when runtime generation retry limits are reached.

---

## 2. Pipeline and Generation Algorithm

The generator executes the following six-step pipeline:

```
[Start]
   │
   ▼
1. Fetch Profile ──► Target clues, technique ceilings, expected benchmark seconds
   │
   ▼
2. Full Grid Gen ──► MRV backtracking with randomized ties & candidate shuffling
   │
   ▼
3. Clue Removal  ──► Shuffled coordinate elimination with capped uniqueness test (cap = 2)
   │
   ▼
4. Logical Solve ──► Pure deductive solver without guessing; logs techniques & weights
   │
   ▼
5. Profile Check ──► Does puzzle match tier constraints and difficulty ceiling?
   ├── Yes ──────► Return GeneratedPuzzle
   └── No  ──────► Retry (up to maxRetries); fallback to verified precomputed grid on exhaustion
```

---

## 3. Core Algorithms and Mathematical Proofs

### 3.1 MRV Recursive Backtracking
- **Search Space:** $9 \times 9 = 81$ cells with candidate domains $D(r, c) \subseteq \{1..9\}$.
- **Variable Selection:** Selects an empty cell $(r, c)$ where $|D(r, c)|$ is minimized (Minimum Remaining Values heuristic). Ties where multiple cells have identical minimum remaining candidates are resolved with a uniform random choice:
  $$\text{cell} = \text{UniformRandom}(\{c \in \text{Empty} \mid |D(c)| = \min |D|\})$$
- **Candidate Ordering:** Candidates within $D(r, c)$ are shuffled randomly to ensure variety across generated boards.

### 3.2 Solution Counter and Uniqueness Proof
- A Sudoku puzzle is valid for competitive play if and only if it has **exactly one solution**:
  $$N_{\text{solutions}}(\text{Grid}) = 1$$
- To verify this without searching the entire solution space, the backtracking solution counter is **capped at 2**:
  - If counter reaches 2, the branch immediately halts and rejects the clue removal.
  - If the search completes with `count === 1`, uniqueness is mathematically proven, and the removal is retained.

### 3.3 Logical Solver Techniques
The logical solver operates without guessing. It evaluates deductions in ascending difficulty:
1. **Naked Single (Weight: 1.0):** Cell $(r, c)$ has $|D(r, c)| = 1$.
2. **Hidden Single (Weight: 1.5):** A candidate digit $d$ appears in exactly one cell within a row, column, or $3 \times 3$ block.
3. **Pointing Pair/Triple (Weight: 2.2):** Candidate $d$ within a $3 \times 3$ block is confined to a single row or column, eliminating $d$ from other cells along that line outside the block.
4. **Claiming Pair/Triple (Weight: 2.5):** Candidate $d$ along a row or column is confined to a single $3 \times 3$ block, eliminating $d$ from other cells in that block.
5. **Naked Pair (Weight: 2.8):** Two cells in the same unit have identical candidate sets $\{d_1, d_2\}$, eliminating $d_1, d_2$ from all other cells in that unit.

---

## 4. Difficulty Profiles and Pacing

| Tier | Target Clues | Min Clues | Max Technique Weight | Benchmark Expected Time ($T_{\text{expected}}$) |
| :--- | :---: | :---: | :---: | :---: |
| **Beginner** | 40 | 36 | 1.8 (Naked/Hidden Singles) | 180 seconds (3 min) |
| **Intermediate** | 33 | 30 | 2.3 (Pointing Pairs) | 360 seconds (6 min) |
| **Advanced** | 28 | 26 | 3.0 (Claiming/Naked Pairs) | 600 seconds (10 min) |
| **Expert** | 24 | 22 | 3.5 (Hidden Pairs/Advanced) | 900 seconds (15 min) |

---

## 5. Staged Hints Design

Hints reuse the solver's deduction log and progress through three discrete stages:
- **Stage 1 (Nudge):** Highlights the target cell coordinate without revealing the digit or technique.
- **Stage 2 (Technique):** Identifies the logical deduction technique (e.g. *Hidden Single* or *Pointing Pair*).
- **Stage 3 (Exact Placement):** Reveals the concrete digit and full explanation.

Each hint requested incurs a **15% penalty** to difficulty-adjusted effective solve time, enforcing a tactical trade-off.

---

## 6. Code-Level Source Map

The following table maps the `tiMely` engine specification to actual implementation files and exact line ranges:

| Subsystem / Feature | Implementation File | Line Range | Test File |
| :--- | :--- | :--- | :--- |
| **Grid Operations & Coordinates** | `src/timely/grid.ts` | [L1-L116](../src/timely/grid.ts#L1-L116) | `tests/timely/validityAndUniqueness.test.ts` |
| **MRV Recursive Backtracker** | `src/timely/mrvBacktracker.ts` | [L1-L76](../src/timely/mrvBacktracker.ts#L1-L76) | `tests/timely/validityAndUniqueness.test.ts` |
| **Capped Solution Counter (Cap = 2)** | `src/timely/solutionCounter.ts` | [L1-L68](../src/timely/solutionCounter.ts#L1-L68) | `tests/timely/validityAndUniqueness.test.ts` |
| **Clue Removal & Uniqueness Loop** | `src/timely/clueRemover.ts` | [L1-L63](../src/timely/clueRemover.ts#L1-L63) | `tests/timely/validityAndUniqueness.test.ts` |
| **Naked & Hidden Singles** | `src/timely/techniques/single.ts` | [L1-L136](../src/timely/techniques/single.ts#L1-L136) | `tests/timely/solverDeductions.test.ts` |
| **Locked Candidates (Pointing/Claiming)** | `src/timely/techniques/lockedCandidates.ts` | [L1-L165](../src/timely/techniques/lockedCandidates.ts#L1-L165) | `tests/timely/solverDeductions.test.ts` |
| **Naked Pairs Technique** | `src/timely/techniques/pairs.ts` | [L1-L102](../src/timely/techniques/pairs.ts#L1-L102) | `tests/timely/solverDeductions.test.ts` |
| **Tiered Logical Solver** | `src/timely/logicalSolver.ts` | [L1-L178](../src/timely/logicalSolver.ts#L1-L178) | `tests/timely/solverDeductions.test.ts` |
| **Difficulty Profiles & Pacing** | `src/timely/profiles.ts` | [L1-L49](../src/timely/profiles.ts#L1-L49) | `tests/timely/difficultyProfile.test.ts` |
| **Staged Hint Generator** | `src/timely/hintStager.ts` | [L1-L59](../src/timely/hintStager.ts#L1-L59) | `tests/timely/solverDeductions.test.ts` |
| **Precomputed Verified Fallbacks** | `src/timely/precomputedFallbacks.ts` | [L1-L128](../src/timely/precomputedFallbacks.ts#L1-L128) | `tests/timely/fallbacksAndExhaustion.test.ts` |
| **End-to-End Pipeline & Retries** | `src/timely/pipeline.ts` | [L1-L70](../src/timely/pipeline.ts#L1-L70) | `tests/timely/validityAndUniqueness.test.ts` |
