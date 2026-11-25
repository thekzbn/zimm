import { describe, expect, it } from 'vitest';
import { calculatePerformance } from '../../src/endgame/performance';
import { evaluateMatchOutcome } from '../../src/endgame/outcome';
import { PlayerSolveRecord } from '../../src/endgame/types';

describe('Endgame Meaningful Hint Cost and Performance Normalization', () => {
  it('imposes a noticeable, meaningful penalty on difficulty-adjusted performance for each hint', () => {
    const baseRecord: PlayerSolveRecord = {
      playerId: 'p1',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 200,
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 0,
      hasDifficultySpike: false,
      isAsync: false,
    };

    const perf0Hints = calculatePerformance(baseRecord);

    const recordWith1Hint = { ...baseRecord, hintsUsedCount: 1 };
    const perf1Hint = calculatePerformance(recordWith1Hint);

    const recordWith3Hints = { ...baseRecord, hintsUsedCount: 3 };
    const perf3Hints = calculatePerformance(recordWith3Hints);

    // 1 hint imposes ~15% penalty (effective solve time is 230s instead of 200s)
    expect(perf1Hint.hintMultiplier).toBe(1.15);
    expect(perf1Hint.normalizedPerformance).toBeLessThan(perf0Hints.normalizedPerformance);

    // 3 hints impose ~45% penalty (effective solve time is 290s instead of 200s)
    expect(perf3Hints.hintMultiplier).toBe(1.45);
    expect(perf3Hints.normalizedPerformance).toBeLessThan(perf1Hint.normalizedPerformance);
    expect(perf3Hints.normalizedPerformance / perf0Hints.normalizedPerformance).toBeCloseTo(
      1 / 1.45,
      2
    );
  });

  it('proves hint usage can turn a raw time advantage into a match loss', () => {
    // Player A solved raw time faster (180s vs 200s), but used 3 hints!
    const recordA: PlayerSolveRecord = {
      playerId: 'pA',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 180, // Raw speed faster
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 3, // Heavy hint penalty: 180 * 1.45 = 261s effective
      hasDifficultySpike: false,
      isAsync: false,
    };

    // Player B solved raw time slower (200s), but used 0 hints!
    const recordB: PlayerSolveRecord = {
      playerId: 'pB',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 200, // Effective 200s
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 0,
      hasDifficultySpike: false,
      isAsync: false,
    };

    const outcome = evaluateMatchOutcome(recordA, recordB);
    // Player B wins because Player A's hint penalty degraded effective performance below Player B!
    expect(outcome.outcomeA).toBe('loss');
    expect(outcome.outcomeB).toBe('win');
  });

  it('penalizes mistakes alongside hints multiplicatively', () => {
    const recordWithBoth: PlayerSolveRecord = {
      playerId: 'p1',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 100,
      expectedBenchmarkSeconds: 300,
      mistakesCount: 2, // +10% penalty
      hintsUsedCount: 1, // +15% penalty
      hasDifficultySpike: false,
      isAsync: false,
    };

    const perf = calculatePerformance(recordWithBoth);
    expect(perf.mistakeMultiplier).toBe(1.1);
    expect(perf.hintMultiplier).toBe(1.15);
    // Effective time = 100 * 1.1 * 1.15 = 126.5s
    expect(perf.effectiveSolveTimeSeconds).toBeCloseTo(126.5, 2);
  });
});
