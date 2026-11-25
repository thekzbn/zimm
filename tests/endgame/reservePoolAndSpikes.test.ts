import { describe, expect, it } from 'vitest';
import { calculateMatchRating } from '../../src/endgame/ratingUpdate';
import { createInitialPoolState } from '../../src/endgame/reservePool';
import { analyzeDifficultySpike } from '../../src/endgame/spikeDetector';
import { PlayerSolveRecord } from '../../src/endgame/types';

describe('Endgame Reserve Pool, Asymmetric Tax, and Spike Compensation', () => {
  it('deducts more tax from the loser than the winner', () => {
    const pool = createInitialPoolState();

    const recordWinner: PlayerSolveRecord = {
      playerId: 'pWin',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 150,
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 0,
      hasDifficultySpike: false,
      isAsync: false,
    };

    const recordLoser: PlayerSolveRecord = {
      playerId: 'pLose',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 250,
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 0,
      hasDifficultySpike: false,
      isAsync: false,
    };

    const result = calculateMatchRating(recordWinner, recordLoser, pool);

    expect(result.playerA.taxPaid).toBe(1.0); // Winner contributes 1
    expect(result.playerB.taxPaid).toBe(2.0); // Loser contributes 2
    expect(result.playerB.taxPaid).toBeGreaterThan(result.playerA.taxPaid);
  });

  it('compensates a player assigned a difficulty spike whether they win or lose', () => {
    const pool = createInitialPoolState();

    // Player A loses, but had a difficulty spike in their assigned puzzle
    const recordAWithSpike: PlayerSolveRecord = {
      playerId: 'pA',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 280,
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 0,
      hasDifficultySpike: true, // Spike present!
      isAsync: false,
    };

    const recordBWithoutSpike: PlayerSolveRecord = {
      playerId: 'pB',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 180,
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 0,
      hasDifficultySpike: false,
      isAsync: false,
    };

    const result = calculateMatchRating(recordAWithSpike, recordBWithoutSpike, pool);

    expect(result.playerA.outcome).toBe('loss');
    // Player A receives +3 spike compensation from the reserve pool
    expect(result.playerA.spikeCompensation).toBe(3.0);
    expect(result.playerB.spikeCompensation).toBe(0.0);

    // Player A's net delta is offset by the +3 compensation:
    // baseDelta = -16, tax = 2, compensation = 3 => netDelta = -15
    expect(result.playerA.netDelta).toBe(-15);
  });

  it('updates reserve pool balance correctly after tax collection and spike payout', () => {
    const pool = { currentBalance: 50, totalCollected: 50, totalPaidOut: 0 };

    const recordA: PlayerSolveRecord = {
      playerId: 'pA',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 200,
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 0,
      hasDifficultySpike: true, // +3 payout
      isAsync: false,
    };

    const recordB: PlayerSolveRecord = {
      playerId: 'pB',
      rating: 1200,
      finished: true,
      solveDurationSeconds: 250,
      expectedBenchmarkSeconds: 300,
      mistakesCount: 0,
      hintsUsedCount: 0,
      hasDifficultySpike: false,
      isAsync: false,
    };

    const result = calculateMatchRating(recordA, recordB, pool);

    // Total tax collected: winner (1) + loser (2) = 3
    // Total compensation paid: 3 (for player A)
    // Net pool change = +3 - 3 = 0
    expect(result.newPoolState.currentBalance).toBe(50);
    expect(result.newPoolState.totalCollected).toBe(53);
    expect(result.newPoolState.totalPaidOut).toBe(3);
  });
});
