import { CellCoord, Digit } from '../timely/types';

export type GameplayEventType =
  | 'puzzle_assigned'
  | 'digit_placed'
  | 'digit_erased'
  | 'note_toggled'
  | 'mistake_incurred'
  | 'hint_requested'
  | 'puzzle_completed'
  | 'match_forfeited';

export interface GameplayEvent {
  id: string;
  matchId: string;
  playerId: string;
  eventType: GameplayEventType;
  timestamp: number; // Milliseconds epoch
  cell?: CellCoord;
  digit?: Digit;
  hintStage?: 1 | 2 | 3;
}

export type AnomalyType =
  | 'inhuman_speed'
  | 'uniform_burst_cadence'
  | 'zero_notes_expert_speed'
  | 'telepathic_first_move';

export interface AnomalySignal {
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: number;
}

export interface ReviewQueueEntry {
  id: string;
  matchId: string;
  playerId: string;
  status: 'pending' | 'verified_clean' | 'confirmed_abuse' | 'dismissed';
  anomalyScore: number; // 0..100
  signals: AnomalySignal[];
  timestamp: number;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface PlayerIntegrityRecord {
  playerId: string;
  totalMatches: number;
  flaggedMatchesCount: number;
  anomaliesHistory: AnomalySignal[];
  trustScore: number; // 0..100, default 100
}
