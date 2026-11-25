import { describe, expect, it } from 'vitest';
import { DEFAULT_ENDGAME_CONFIG } from '../../src/endgame/config';
import { calculateExpectedScore } from '../../src/endgame/expectedScore';
import { evaluateMatchOutcome } from '../../src/endgame/outcome';
import { calculateMatchRating } from '../../src/endgame/ratingUpdate';
import { createInitialPoolState } from '../../src/endgame/reservePool';
import { PlayerSolveRecord } from '../../src/endgame/types';

describe('Endgame Elo Rating Math and Expected Score', () => {
  it('verifies standard logistic expected score properties', () => {
    // Equal ratings: expected score is exactly 0.5 for both
    const equal = calculateExpectedScore(1200, 1200);
    expect(equal.expectedA).toBeCloseTo(0.5, 4);
    expect(equal.expectedB).toBeCloseTo(0.5, 4);
    expect(equal.expectedA + equal.expectedB).toBeCloseTo(1.0, 4);

    // 400 point difference: higher rated player expects ~0.909
    const unequal = calculateExpectedScore(1600, 1200);
    expect(unequal.expectedA).toBeCloseTo(0.909, 2);
    expect(unequal.expectedB).toBeCloseTo(0.091, 2);
    expect(unequal.expectedA + unequal.expectedB).toBeCloseTo(1.0, 4);
  });

  it('guarantees that a finisher unconditionally beats a non-finisher', () => {
    const recordFinisher: PlayerSolveRecord = {
      playerId: 'p1',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 400, // Took 400s
      expectedBenchmarkSeconds: 300,
      mistakesCount: 2,
      hintsUsedCount: 1,
      hasDifficultySpike: false,
      isAsync: false,
    };

    const recordNonFinisher: PlayerSolveRecord = {
      playerId: 'p2',
      rating: 1200,
      finished: false, // Did not finish (abandon/timeout/forfeit)
      solveDurationSeconds: 150,
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 0,
      hasDifficultySpike: false,
      isAsync: false,
    };

    const outcome = evaluateMatchOutcome(recordFinisher, recordNonFinisher);
    expect(outcome.outcomeA).toBe('win');
    expect(outcome.outcomeB).toBe('loss');
    expect(outcome.scoreA).toBe(1.0);
    expect(outcome.scoreB).toBe(0.0);
  });

  it('computes correct net Elo delta on equal rating match', () => {
    const pool = createInitialPoolState(DEFAULT_ENDGAME_CONFIG);

    const recordA: PlayerSolveRecord = {
      playerId: 'pA',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 200,
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 0,
      hasDifficultySpike: false,
      isAsync: false,
    };

    const recordB: PlayerSolveRecord = {
      playerId: 'pB',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 300,
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 0,
      hasDifficultySpike: false,
      isAsync: false,
    };

    const result = calculateMatchRating(recordA, recordB, pool);

    expect(result.playerA.outcome).toBe('win');
    expect(result.playerB.outcome).toBe('loss');

    // Base delta = 32 * (1 - 0.5) = +16 for A, -16 for B
    expect(result.playerA.baseEloDelta).toBe(16);
    expect(result.playerB.baseEloDelta).toBe(-16);

    // Winner pays 1pt tax, loser pays 2pt tax
    expect(result.playerA.taxPaid).toBe(1);
    expect(result.playerB.taxPaid).toBe(2);

    expect(result.playerA.netDelta).toBe(15); // +16 - 1
    expect(result.playerB.netDelta).toBe(-18); // -16 - 2
  });
});
