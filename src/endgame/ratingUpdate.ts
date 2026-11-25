import { DEFAULT_ENDGAME_CONFIG, EndgameConfig } from './config';
import { calculateExpectedScore } from './expectedScore';
import { evaluateMatchOutcome } from './outcome';
import { calculateTax, updateReservePool } from './reservePool';
import { analyzeDifficultySpike } from './spikeDetector';
import { MatchRatingCalculationResult, PlayerSolveRecord, RatingDelta, ReservePoolState } from './types';

/**
 * Executes the complete Endgame rating update pipeline for a head-to-head match.
 *
 * Algorithm:
 * 1. Calculate difficulty-adjusted performances and evaluate match outcome (win/loss/draw).
 * 2. Calculate conventional Elo expected score for both players based on current ratings.
 * 3. Compute base Elo delta: delta_base = K * (ActualScore - ExpectedScore).
 * 4. Calculate hidden tax: winner pays winnerTaxPoints, loser pays loserTaxPoints.
 * 5. Calculate independent spike compensation for any player whose puzzle had a difficulty spike.
 * 6. Compute net delta: netDelta = round(delta_base - tax + spikeCompensation).
 * 7. Apply floor rating constraint (minRating).
 * 8. Update maintainer reserve pool ledger.
 */
export function calculateMatchRating(
  recordA: PlayerSolveRecord,
  recordB: PlayerSolveRecord,
  currentPool: ReservePoolState,
  config: EndgameConfig = DEFAULT_ENDGAME_CONFIG
): MatchRatingCalculationResult {
  // 1. Evaluate performance and outcome
  const outcomeResult = evaluateMatchOutcome(recordA, recordB, config);

  // 2. Expected score
  const { expectedA, expectedB } = calculateExpectedScore(recordA.rating, recordB.rating);

  // 3. Base Elo delta
  const baseDeltaA = config.kFactor * (outcomeResult.scoreA - expectedA);
  const baseDeltaB = config.kFactor * (outcomeResult.scoreB - expectedB);

  // 4. Tax
  const taxA = calculateTax(outcomeResult.outcomeA, config);
  const taxB = calculateTax(outcomeResult.outcomeB, config);

  // 5. Spike compensation (independent of outcome)
  const spikeA = analyzeDifficultySpike(recordA.hasDifficultySpike, config);
  const spikeB = analyzeDifficultySpike(recordB.hasDifficultySpike, config);

  // 6. Net delta & new rating
  const netDeltaA = Math.round(baseDeltaA - taxA + spikeA.compensationPoints);
  const netDeltaB = Math.round(baseDeltaB - taxB + spikeB.compensationPoints);

  const newRatingA = Math.max(config.minRating, recordA.rating + netDeltaA);
  const newRatingB = Math.max(config.minRating, recordB.rating + netDeltaB);

  const deltaA: RatingDelta = {
    playerId: recordA.playerId,
    outcome: outcomeResult.outcomeA,
    baseEloDelta: Math.round(baseDeltaA * 10) / 10,
    taxPaid: taxA,
    spikeCompensation: spikeA.compensationPoints,
    netDelta: netDeltaA,
    newRating: newRatingA,
    performance: outcomeResult.perfA,
  };

  const deltaB: RatingDelta = {
    playerId: recordB.playerId,
    outcome: outcomeResult.outcomeB,
    baseEloDelta: Math.round(baseDeltaB * 10) / 10,
    taxPaid: taxB,
    spikeCompensation: spikeB.compensationPoints,
    netDelta: netDeltaB,
    newRating: newRatingB,
    performance: outcomeResult.perfB,
  };

  // 7. Update reserve pool
  const totalTax = taxA + taxB;
  const totalComp = spikeA.compensationPoints + spikeB.compensationPoints;
  const newPoolState = updateReservePool(currentPool, totalTax, totalComp);

  return {
    playerA: deltaA,
    playerB: deltaB,
    newPoolState,
  };
}
