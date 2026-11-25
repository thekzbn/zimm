# Maintainer Guide: Reserve Pool and Difficulty Spike Compensation

> **Audience:** Maintainers and core engine developers only.

---

## 1. Concept and Rationale

In conventional competitive Sudoku platforms where players solve identical boards, speed alone determines the winner. In Zimm, players compete on **different Sudoku puzzles** generated in real time.

While `tiMely` rigorously profiles puzzle difficulty, occasional puzzles require logical deductions that exceed the typical difficulty envelope of that tier (a *difficulty spike*). To prevent unfair rating losses caused by unlucky puzzle assignment, the `Endgame` engine incorporates a hidden rating tax and spike-compensation reserve pool:

1. **Tax Collection:** Every rated head-to-head match collects a nominal rating tax into the reserve pool:
   - Winner pays: **1.0 point**
   - Loser pays: **2.0 points** (the loser contributes more)
   - Draw: **1.5 points** each
2. **Spike Compensation:** If a player is assigned a puzzle containing an out-of-profile difficulty spike (e.g., an intermediate puzzle that unexpectedly demands a complex claiming pair deduction), that player receives **+3.0 compensation points** directly from the reserve pool.
3. **Outcome Independence:** Spike compensation is paid whether the player wins or loses.

---

## 2. Public-Source Disclosure Risk

> [!WARNING] **Public Repository Visibility Conflict**
> The source repository for Zimm is public and licensed under the GNU Affero General Public License version 3 (AGPLv3).
>
> While this mechanic is **hidden from player-facing interfaces, match modals, and help pages**, it **cannot be kept secret from anyone who reads the source code or this documentation**. Maintainers must not make claims of mathematical secrecy in public forums.
>
> The owner reserves the right to retain, rebalance, or deprecate this mechanic if public awareness alters player behavior.

---

## 3. Mathematical Solvency and Simulation

Because each match generates **3.0 points** of reserve tax ($1.0 + 2.0 = 3.0$) and spikes occur on approximately $10\%\text{--}15\%$ of boards:
- Expected tax collected per match: $E[T] = 3.0$ points.
- Expected payout per match with spike rate $p = 0.15$:
  $$E[\text{Payout}] = 2 \times p \times C_{\text{spike}} = 2 \times 0.15 \times 3.0 = 0.90 \text{ points}$$
- Net pool accumulation:
  $$E[\Delta \text{Pool}] = 3.0 - 0.90 = +2.10 \text{ points/match}$$

Monte-Carlo simulations (`src/endgame/simulator.ts`, tested in `tests/endgame/simulationStability.test.ts`) demonstrate that with an initial seed of 50.0 points, the reserve pool maintains a solvency ratio $> 1.0$ under all test cohorts.

---

## 4. Configuration and Tuning Knobs

All parameters are centralized in [`src/endgame/config.ts`](../src/endgame/config.ts#L1-L47):

```typescript
export const DEFAULT_ENDGAME_CONFIG = {
  winnerTaxPoints: 1.0,
  loserTaxPoints: 2.0,
  spikeCompensationPoints: 3.0,
  initialPoolBalance: 50.0,
};
```
