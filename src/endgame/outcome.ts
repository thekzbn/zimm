import { DEFAULT_ENDGAME_CONFIG, EndgameConfig } from './config';
import { calculatePerformance } from './performance';
import { MatchOutcomeType, PerformanceMetrics, PlayerSolveRecord } from './types';

export interface MatchOutcomeEvaluation {
  outcomeA: MatchOutcomeType;
  outcomeB: MatchOutcomeType;
  scoreA: number; // 1.0 (win), 0.5 (draw), 0.0 (loss)
  scoreB: number;
  perfA: PerformanceMetrics;
  perfB: PerformanceMetrics;
}

/**
 * Evaluates the match outcome between two players solving different puzzles.
 * Rules:
 * 1. Finisher beats non-finisher unconditionally.
 * 2. If neither finishes, match resolves as a neutral draw.
 * 3. If both finish, the player with the higher difficulty-adjusted normalized performance wins.
 *    If the performance difference is within config.drawEpsilon, it resolves as a draw.
 */
export function evaluateMatchOutcome(
  recordA: PlayerSolveRecord,
  recordB: PlayerSolveRecord,
  config: EndgameConfig = DEFAULT_ENDGAME_CONFIG
): MatchOutcomeEvaluation {
  const perfA = calculatePerformance(recordA, config);
  const perfB = calculatePerformance(recordB, config);

  // Case 1: One player finishes, the other does not
  if (recordA.finished && !recordB.finished) {
    return {
      outcomeA: 'win',
      outcomeB: 'loss',
      scoreA: 1.0,
      scoreB: 0.0,
      perfA,
      perfB,
    };
  }
  if (!recordA.finished && recordB.finished) {
    return {
      outcomeA: 'loss',
      outcomeB: 'win',
      scoreA: 0.0,
      scoreB: 1.0,
      perfA,
      perfB,
    };
  }

  // Case 2: Neither player finished (e.g. mutual timeout / abandonment)
  if (!recordA.finished && !recordB.finished) {
    return {
      outcomeA: 'draw',
      outcomeB: 'draw',
      scoreA: 0.5,
      scoreB: 0.5,
      perfA,
      perfB,
    };
  }

  // Case 3: Both players finished: compare difficulty-adjusted performances
  const pA = perfA.normalizedPerformance;
  const pB = perfB.normalizedPerformance;
  const maxPerf = Math.max(pA, pB, 0.0001);
  const diffRatio = Math.abs(pA - pB) / maxPerf;

  if (diffRatio <= config.drawEpsilon) {
    return {
      outcomeA: 'draw',
      outcomeB: 'draw',
      scoreA: 0.5,
      scoreB: 0.5,
      perfA,
      perfB,
    };
  }

  if (pA > pB) {
    return {
      outcomeA: 'win',
      outcomeB: 'loss',
      scoreA: 1.0,
      scoreB: 0.0,
      perfA,
      perfB,
    };
  } else {
    return {
      outcomeA: 'loss',
      outcomeB: 'win',
      scoreA: 0.0,
      scoreB: 1.0,
      perfA,
      perfB,
    };
  }
}
