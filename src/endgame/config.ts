/**
 * Centralized, Tunable Configuration for the Endgame Rating Engine.
 * All provisional constants and balancing knobs are declared here.
 */

export interface EndgameConfig {
  defaultRating: number;
  kFactor: number;
  minRating: number;

  // Penalties applied to effective solve time
  // T_effective = T_actual * (1 + mistakes * mistakePenaltyRate) * (1 + hints * hintPenaltyRate)
  mistakePenaltyRate: number; // 0.05 -> +5% time penalty per mistake
  hintPenaltyRate: number; // 0.15 -> +15% time penalty per hint (significant tradeoff)

  // Draw detection threshold
  // If |P_A - P_B| / max(P_A, P_B) < drawEpsilon, match is declared a draw
  drawEpsilon: number;

  // Format adjustment (provisional: 1.0 ensures zero format-based bias)
  asyncPerformanceFactor: number;

  // Hidden Rating Tax & Spike Compensation Reserve Pool Knobs
  // Note: Internal maintainer mechanic; never disclosed in player-facing UI
  winnerTaxPoints: number; // Tax collected from winner
  loserTaxPoints: number; // Tax collected from loser (loser contributes more)
  spikeCompensationPoints: number; // Points paid from reserve to player assigned a spike
  initialPoolBalance: number;
}

export const DEFAULT_ENDGAME_CONFIG: EndgameConfig = {
  defaultRating: 1200,
  kFactor: 32,
  minRating: 100,

  mistakePenaltyRate: 0.05,
  hintPenaltyRate: 0.15, // Meaningful cost: 3 hints add ~45% to effective solve time

  drawEpsilon: 0.005, // 0.5% performance differential threshold for a draw
  asyncPerformanceFactor: 1.0, // Neutral adjustment to prevent format bias

  // Hidden pool mechanics
  winnerTaxPoints: 1.0,
  loserTaxPoints: 2.0,
  spikeCompensationPoints: 3.0,
  initialPoolBalance: 50.0,
};
