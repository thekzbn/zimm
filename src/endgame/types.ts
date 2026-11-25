/**
 * Endgame Rating Engine Type Definitions
 * Note: Endgame is an internal engineering name only.
 */

export type MatchOutcomeType = 'win' | 'loss' | 'draw';

export interface PlayerSolveRecord {
  playerId: string;
  rating: number;
  finished: boolean;
  solveDurationSeconds: number;
  expectedBenchmarkSeconds: number;
  mistakesCount: number;
  hintsUsedCount: number; // 0..3
  hasDifficultySpike: boolean;
  isAsync: boolean;
}

export interface PerformanceMetrics {
  rawSpeedSeconds: number;
  expectedBenchmarkSeconds: number;
  mistakeMultiplier: number;
  hintMultiplier: number;
  effectiveSolveTimeSeconds: number;
  normalizedPerformance: number; // Ratio: T_expected / T_effective
}

export interface SpikeAnalysis {
  spikeDetected: boolean;
  spikeReason?: string;
  compensationPoints: number;
}

export interface ReservePoolState {
  currentBalance: number;
  totalCollected: number;
  totalPaidOut: number;
}

export interface RatingDelta {
  playerId: string;
  outcome: MatchOutcomeType;
  baseEloDelta: number;
  taxPaid: number;
  spikeCompensation: number;
  netDelta: number;
  newRating: number;
  performance: PerformanceMetrics;
}

export interface MatchRatingCalculationResult {
  playerA: RatingDelta;
  playerB: RatingDelta;
  newPoolState: ReservePoolState;
}
