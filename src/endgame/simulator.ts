import { DEFAULT_ENDGAME_CONFIG, EndgameConfig } from './config';
import { calculateMatchRating } from './ratingUpdate';
import { createInitialPoolState } from './reservePool';
import { PlayerSolveRecord } from './types';

export interface SimulationResult {
  totalMatches: number;
  initialPool: number;
  finalPool: number;
  totalTaxCollected: number;
  totalCompensationPaid: number;
  spikesEncountered: number;
  poolSolvencyRatio: number; // totalCollected / totalPaidOut
  playerRatingsSummary: {
    min: number;
    max: number;
    mean: number;
  };
}

/**
 * Runs a monte-carlo simulation over a cohort of players to test
 * reserve pool sustainability, tax rates, and rating drift.
 */
export function runRatingSimulation(
  matchCount: number = 500,
  playerCount: number = 20,
  spikeProbability: number = 0.15,
  config: EndgameConfig = DEFAULT_ENDGAME_CONFIG
): SimulationResult {
  let pool = createInitialPoolState(config);

  // Initialize cohort of players
  const players = Array.from({ length: playerCount }, (_, i) => ({
    id: `player_${i + 1}`,
    rating: config.defaultRating + (Math.random() - 0.5) * 400,
    skillFactor: 0.8 + Math.random() * 0.4, // Skill affects speed & accuracy
  }));

  let spikesEncountered = 0;

  for (let m = 0; m < matchCount; m++) {
    // Pick two random distinct players
    const idxA = Math.floor(Math.random() * playerCount);
    let idxB = Math.floor(Math.random() * (playerCount - 1));
    if (idxB >= idxA) idxB++;

    const pA = players[idxA];
    const pB = players[idxB];

    const hasSpikeA = Math.random() < spikeProbability;
    const hasSpikeB = Math.random() < spikeProbability;
    if (hasSpikeA) spikesEncountered++;
    if (hasSpikeB) spikesEncountered++;

    const expectedTime = 360; // 6 minutes benchmark
    const durationA = (expectedTime / pA.skillFactor) * (0.9 + Math.random() * 0.2);
    const durationB = (expectedTime / pB.skillFactor) * (0.9 + Math.random() * 0.2);

    const mistakesA = Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0;
    const mistakesB = Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0;

    const hintsA = Math.random() < 0.2 ? 1 : 0;
    const hintsB = Math.random() < 0.2 ? 1 : 0;

    const recordA: PlayerSolveRecord = {
      playerId: pA.id,
      rating: pA.rating,
      finished: true,
      solveDurationSeconds: durationA,
      expectedBenchmarkSeconds: expectedTime,
      mistakesCount: mistakesA,
      hintsUsedCount: hintsA,
      hasDifficultySpike: hasSpikeA,
      isAsync: false,
    };

    const recordB: PlayerSolveRecord = {
      playerId: pB.id,
      rating: pB.rating,
      finished: true,
      solveDurationSeconds: durationB,
      expectedBenchmarkSeconds: expectedTime,
      mistakesCount: mistakesB,
      hintsUsedCount: hintsB,
      hasDifficultySpike: hasSpikeB,
      isAsync: false,
    };

    const result = calculateMatchRating(recordA, recordB, pool, config);

    pA.rating = result.playerA.newRating;
    pB.rating = result.playerB.newRating;
    pool = result.newPoolState;
  }

  const ratings = players.map((p) => p.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
  const meanRating = ratings.reduce((sum, r) => sum + r, 0) / playerCount;

  return {
    totalMatches: matchCount,
    initialPool: config.initialPoolBalance,
    finalPool: pool.currentBalance,
    totalTaxCollected: pool.totalCollected,
    totalCompensationPaid: pool.totalPaidOut,
    spikesEncountered,
    poolSolvencyRatio:
      pool.totalPaidOut > 0 ? pool.totalCollected / pool.totalPaidOut : 999.0,
    playerRatingsSummary: {
      min: Math.round(minRating),
      max: Math.round(maxRating),
      mean: Math.round(meanRating),
    },
  };
}
