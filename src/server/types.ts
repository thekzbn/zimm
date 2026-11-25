import { RatingDelta } from '../endgame/types';
import { MatchStatus } from '../game/types';
import { GeneratedPuzzle } from '../timely/types';

export interface UserProfile {
  id: string;
  username: string;
  rating: number;
  matchesPlayed: number;
  matchesWon: number;
}

export interface LiveMatchSession {
  id: string;
  playerAId: string;
  playerBId: string;
  puzzleA: GeneratedPuzzle;
  puzzleB: GeneratedPuzzle;
  status: MatchStatus;
  startTime: number;
  playerAFinished: boolean;
  playerBFinished: boolean;
  playerAElapsedSeconds: number;
  playerBElapsedSeconds: number;
  playerAMistakes: number;
  playerBMistakes: number;
  playerAHints: number;
  playerBHints: number;
  result?: {
    playerADelta: RatingDelta;
    playerBDelta: RatingDelta;
  };
}

export interface AsyncChallenge {
  code: string;
  creatorId: string;
  creatorRating: number;
  tier: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  puzzleA: GeneratedPuzzle; // Creator's puzzle
  puzzleB: GeneratedPuzzle; // Opponent's puzzle
  creatorSolveTimeSeconds?: number;
  creatorMistakes?: number;
  creatorHints?: number;
  creatorFinished?: boolean;
  opponentId?: string;
  opponentRating?: number;
  opponentSolveTimeSeconds?: number;
  opponentMistakes?: number;
  opponentHints?: number;
  opponentFinished?: boolean;
  status: 'pending' | 'resolved';
  result?: {
    creatorDelta: RatingDelta;
    opponentDelta: RatingDelta;
  };
}
