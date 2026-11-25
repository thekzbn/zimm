# Endgame Technical Reference

> **Notice:** `Endgame` is an internal engineering name for Zimm's rating engine. It must **never** appear in player-facing UI, in-game help, notifications, or user documentation.

---

## 1. Mathematical Architecture

Endgame evaluates head-to-head Sudoku matches where competitors solve **different puzzles**. To ensure mathematical fairness, the engine decouples raw completion time from performance by normalizing solve speed against verified logical difficulty profiles.

---

## 2. Mathematical Equations and Symbols

### 2.1 Standard Elo Expected Score
Given player ratings $R_A$ and $R_B$:
$$E_A = \frac{1}{1 + 10^{\frac{R_B - R_A}{400}}}$$
$$E_B = 1 - E_A$$

### 2.2 Difficulty-Adjusted Effective Solve Time
Let:
- $T_{\text{raw}}$: Actual elapsed solve time in seconds ($T_{\text{raw}} \ge 1$).
- $m$: Number of mistakes committed ($m \ge 0$).
- $c_m$: Mistake penalty coefficient ($c_m = 0.05$, i.e. $+5\%$ effective time per mistake).
- $h$: Number of staged hints requested ($0 \le h \le 3$).
- $c_h$: Hint penalty coefficient ($c_h = 0.15$, i.e. $+15\%$ effective time per hint).

The effective solve time $T_{\text{effective}}$ is computed multiplicatively:
$$T_{\text{effective}} = T_{\text{raw}} \times (1 + m \cdot c_m) \times (1 + h \cdot c_h)$$

### 2.3 Normalized Performance
Let:
- $T_{\text{expected}}$: Benchmark solve time determined by the puzzle's difficulty profile.
- $\alpha_{\text{async}}$: Format factor ($\alpha_{\text{async}} = 1.0$ provisional default to ensure zero format-based bias between live and async head-to-head matches).

$$P = \left( \frac{T_{\text{expected}}}{T_{\text{effective}}} \right) \times \alpha_{\text{async}}$$

### 2.4 Match Outcome Resolution ($S_A, S_B$)
1. **Finisher Priority:** If player $A$ completes their puzzle and player $B$ does not:
   $$S_A = 1.0, \quad S_B = 0.0$$
2. **Mutual Incompletion:** If neither player finishes (mutual abandonment/timeout):
   $$S_A = 0.5, \quad S_B = 0.5$$
3. **Both Finish:** Compare normalized performance:
   $$\delta_P = \frac{|P_A - P_B|}{\max(P_A, P_B)}$$
   - If $\delta_P \le \varepsilon_{\text{draw}}$ ($\varepsilon_{\text{draw}} = 0.005$):
     $$S_A = 0.5, \quad S_B = 0.5$$
   - Else if $P_A > P_B$:
     $$S_A = 1.0, \quad S_B = 0.0$$
   - Else:
     $$S_A = 0.0, \quad S_B = 1.0$$

### 2.5 Base Elo Delta
With $K = 32$:
$$\Delta R_{\text{base}, A} = K \cdot (S_A - E_A)$$
$$\Delta R_{\text{base}, B} = K \cdot (S_B - E_B)$$

### 2.6 Hidden Reserve Pool Tax and Spike Compensation
- **Asymmetric Tax ($T$):** Collected from players into a maintainer reserve pool. The loser contributes more:
  $$T(\text{win}) = 1.0, \quad T(\text{loss}) = 2.0, \quad T(\text{draw}) = 1.5$$
- **Spike Compensation ($C_{\text{spike}}$):** If a puzzle's required logical solving path contains an out-of-profile difficulty spike, the player receives:
  $$C_{\text{spike}} = 3.0$$
  Compensation is granted independently of whether the player wins or loses the match.

### 2.7 Net Rating Update
$$\Delta R_{\text{net}} = \text{round}(\Delta R_{\text{base}} - T + C_{\text{spike}})$$
$$R_{\text{new}} = \max(R_{\text{min}}, R_{\text{current}} + \Delta R_{\text{net}})$$

---

## 3. Worked Numerical Example

### Scenario:
- **Player A:** Rating $R_A = 1200$, solved puzzle with $T_{\text{expected}} = 360\text{s}$ in $T_{\text{raw}} = 180\text{s}$, with $m=0$ mistakes, but $h=2$ hints. Puzzle contained no spike.
- **Player B:** Rating $R_B = 1200$, solved puzzle with $T_{\text{expected}} = 360\text{s}$ in $T_{\text{raw}} = 220\text{s}$, with $m=1$ mistake and $h=0$ hints. Puzzle contained a difficulty spike.

### Step-by-Step Calculation:
1. **Effective Solve Times:**
   - $T_{\text{effective}, A} = 180 \times (1 + 0) \times (1 + 2 \times 0.15) = 180 \times 1.30 = 234.0\text{s}$
   - $T_{\text{effective}, B} = 220 \times (1 + 1 \times 0.05) \times (1 + 0) = 220 \times 1.05 = 231.0\text{s}$

2. **Normalized Performance:**
   - $P_A = 360 / 234.0 \approx 1.5385$
   - $P_B = 360 / 231.0 \approx 1.5584$

3. **Outcome:**
   - Because $P_B > P_A$, Player B wins ($S_B = 1.0$), Player A loses ($S_A = 0.0$).
   *(Player A was faster in raw time, but Player A's 2 hints imposed a heavy performance penalty that allowed cleaner-solving Player B to win!)*

4. **Expected Scores and Base Deltas:**
   - $E_A = E_B = 0.5$
   - $\Delta R_{\text{base}, A} = 32 \times (0.0 - 0.5) = -16.0$
   - $\Delta R_{\text{base}, B} = 32 \times (1.0 - 0.5) = +16.0$

5. **Tax & Spike Compensation:**
   - Player A (loser): Tax $T_A = 2.0$, Spike $C_A = 0.0$
   - Player B (winner): Tax $T_B = 1.0$, Spike $C_B = 3.0$

6. **Net Rating Deltas:**
   - $\Delta R_{\text{net}, A} = \text{round}(-16.0 - 2.0 + 0.0) = -18$
   - $\Delta R_{\text{net}, B} = \text{round}(+16.0 - 1.0 + 3.0) = +18$
   - New Ratings: $R_A = 1182, \quad R_B = 1218$.

7. **Reserve Pool Ledger:**
   - Tax Collected: $2.0 + 1.0 = 3.0$
   - Compensation Paid: $3.0$
   - Net Pool Impact: $3.0 - 3.0 = 0.0$ points.

---

## 4. Code-Level Source Map

| Feature / Algorithm | Implementation File | Line Range | Test File |
| :--- | :--- | :--- | :--- |
| **Centralized Config & Knobs** | `src/endgame/config.ts` | [L1-L47](../src/endgame/config.ts#L1-L47) | `tests/endgame/ratingMathAndExpectedScore.test.ts` |
| **Elo Expected Score Formula** | `src/endgame/expectedScore.ts` | [L1-L15](../src/endgame/expectedScore.ts#L1-L15) | `tests/endgame/ratingMathAndExpectedScore.test.ts` |
| **Performance Normalization** | `src/endgame/performance.ts` | [L1-L36](../src/endgame/performance.ts#L1-L36) | `tests/endgame/hintCostAndPerformance.test.ts` |
| **Match Outcome Resolution** | `src/endgame/outcome.ts` | [L1-L100](../src/endgame/outcome.ts#L1-L100) | `tests/endgame/ratingMathAndExpectedScore.test.ts` |
| **Spike Detector** | `src/endgame/spikeDetector.ts` | [L1-L27](../src/endgame/spikeDetector.ts#L1-L27) | `tests/endgame/reservePoolAndSpikes.test.ts` |
| **Reserve Pool Accounting** | `src/endgame/reservePool.ts` | [L1-L47](../src/endgame/reservePool.ts#L1-L47) | `tests/endgame/reservePoolAndSpikes.test.ts` |
| **Net Rating Update Pipeline** | `src/endgame/ratingUpdate.ts` | [L1-L84](../src/endgame/ratingUpdate.ts#L1-L84) | `tests/endgame/ratingMathAndExpectedScore.test.ts` |
| **Monte-Carlo Simulation Harness**| `src/endgame/simulator.ts` | [L1-L117](../src/endgame/simulator.ts#L1-L117) | `tests/endgame/simulationStability.test.ts` |
