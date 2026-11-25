import { calculateMatchRating } from '../endgame/ratingUpdate';
import { PlayerSolveRecord } from '../endgame/types';
import { generatePuzzle } from '../timely/pipeline';
import { DifficultyTier } from '../timely/types';
import { matchStore } from './matchStore';
import { AsyncChallenge, LiveMatchSession } from './types';

export class ServerOrchestrator {
  /**
   * Creates a live head-to-head match session with two distinct puzzles
   * calibrated to the same difficulty tier.
   */
  public createLiveMatch(
    playerAId: string,
    playerBId: string,
    tier: DifficultyTier
  ): LiveMatchSession {
    const puzzleA = generatePuzzle(tier);
    const puzzleB = generatePuzzle(tier);

    return {
      id: `live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      playerAId,
      playerBId,
      puzzleA,
      puzzleB,
      status: 'ready',
      startTime: Date.now(),
      playerAFinished: false,
      playerBFinished: false,
      playerAElapsedSeconds: 0,
      playerBElapsedSeconds: 0,
      playerAMistakes: 0,
      playerBMistakes: 0,
      playerAHints: 0,
      playerBHints: 0,
    };
  }

  /**
   * Resolves a completed match between Player A and Player B,
   * calculates ratings, updates the player profile and maintainer reserve pool.
   */
  public resolveMatch(
    recordA: PlayerSolveRecord,
    recordB: PlayerSolveRecord
  ) {
    const currentPool = matchStore.getReservePool();
    const result = calculateMatchRating(recordA, recordB, currentPool);

    // Persist new reserve pool
    matchStore.saveReservePool(result.newPoolState);

    // Update player A rating
    const userProfile = matchStore.getUserProfile();
    if (userProfile.id === recordA.playerId) {
      matchStore.updateRating(result.playerA.newRating, result.playerA.outcome === 'win');
    }

    return result;
  }

  /**
   * Creates an asynchronous challenge code with two distinct puzzles.
   */
  public createAsyncChallenge(
    creatorId: string,
    creatorRating: number,
    tier: DifficultyTier
  ): AsyncChallenge {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const puzzleA = generatePuzzle(tier);
    const puzzleB = generatePuzzle(tier);

    const challenge: AsyncChallenge = {
      code,
      creatorId,
      creatorRating,
      tier,
      puzzleA,
      puzzleB,
      status: 'pending',
    };

    matchStore.saveAsyncChallenge(challenge);
    return challenge;
  }

  /**
   * Submits the creator's solve for an async challenge.
   */
  public submitCreatorSolve(
    code: string,
    durationSeconds: number,
    mistakes: number,
    hints: number,
    finished: boolean
  ): AsyncChallenge | null {
    const challenge = matchStore.getAsyncChallenge(code);
    if (!challenge) return null;

    challenge.creatorSolveTimeSeconds = durationSeconds;
    challenge.creatorMistakes = mistakes;
    challenge.creatorHints = hints;
    challenge.creatorFinished = finished;

    matchStore.saveAsyncChallenge(challenge);
    return challenge;
  }

  /**
   * Submits the opponent's solve for an async challenge,
   * resolving the match if the creator has also solved.
   */
  public submitOpponentSolve(
    code: string,
    opponentId: string,
    opponentRating: number,
    durationSeconds: number,
    mistakes: number,
    hints: number,
    finished: boolean
  ): AsyncChallenge | null {
    const challenge = matchStore.getAsyncChallenge(code);
    if (!challenge) return null;

    challenge.opponentId = opponentId;
    challenge.opponentRating = opponentRating;
    challenge.opponentSolveTimeSeconds = durationSeconds;
    challenge.opponentMistakes = mistakes;
    challenge.opponentHints = hints;
    challenge.opponentFinished = finished;

    // If both have solved, evaluate match
    if (challenge.creatorSolveTimeSeconds !== undefined) {
      const recordA: PlayerSolveRecord = {
        playerId: challenge.creatorId,
        rating: challenge.creatorRating,
        finished: challenge.creatorFinished ?? true,
        solveDurationSeconds: challenge.creatorSolveTimeSeconds,
        expectedBenchmarkSeconds: challenge.puzzleA.expectedBenchmarkSeconds,
        mistakesCount: challenge.creatorMistakes ?? 0,
        hintsUsedCount: challenge.creatorHints ?? 0,
        hasDifficultySpike: challenge.puzzleA.hasSpike,
        isAsync: true,
      };

      const recordB: PlayerSolveRecord = {
        playerId: opponentId,
        rating: opponentRating,
        finished,
        solveDurationSeconds: durationSeconds,
        expectedBenchmarkSeconds: challenge.puzzleB.expectedBenchmarkSeconds,
        mistakesCount: mistakes,
        hintsUsedCount: hints,
        hasDifficultySpike: challenge.puzzleB.hasSpike,
        isAsync: true,
      };

      const matchResult = this.resolveMatch(recordA, recordB);
      challenge.status = 'resolved';
      challenge.result = {
        creatorDelta: matchResult.playerA,
        opponentDelta: matchResult.playerB,
      };
    }

    matchStore.saveAsyncChallenge(challenge);
    return challenge;
  }
}

export const serverOrchestrator = new ServerOrchestrator();
