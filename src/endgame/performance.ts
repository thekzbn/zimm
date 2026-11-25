import { DEFAULT_ENDGAME_CONFIG, EndgameConfig } from './config';
import { PerformanceMetrics, PlayerSolveRecord } from './types';

/**
 * Computes difficulty-adjusted performance.
 *
 * Formula:
 * EffectiveSolveTime = ActualTime * (1 + mistakes * mistakePenaltyRate) * (1 + hints * hintPenaltyRate)
 * NormalizedPerformance = (ExpectedBenchmarkSeconds / EffectiveSolveTime) * asyncFactor
 *
 * Higher performance score indicates stronger, cleaner, faster solving.
 */
export function calculatePerformance(
  record: PlayerSolveRecord,
  config: EndgameConfig = DEFAULT_ENDGAME_CONFIG
): PerformanceMetrics {
  const rawSpeedSeconds = Math.max(1, record.solveDurationSeconds);
  const mistakeMultiplier = 1 + Math.max(0, record.mistakesCount) * config.mistakePenaltyRate;
  const hintMultiplier = 1 + Math.max(0, record.hintsUsedCount) * config.hintPenaltyRate;

  const effectiveSolveTimeSeconds = rawSpeedSeconds * mistakeMultiplier * hintMultiplier;

  const asyncFactor = record.isAsync ? config.asyncPerformanceFactor : 1.0;

  const normalizedPerformance =
    (record.expectedBenchmarkSeconds / effectiveSolveTimeSeconds) * asyncFactor;

  return {
    rawSpeedSeconds,
    expectedBenchmarkSeconds: record.expectedBenchmarkSeconds,
    mistakeMultiplier,
    hintMultiplier,
    effectiveSolveTimeSeconds,
    normalizedPerformance,
  };
}
