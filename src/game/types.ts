import { CellCoord, CellValue, Digit } from '../timely/types';

export type GameMode = 'solo' | 'live_h2h' | 'async_h2h';

export type MatchStatus =
  | 'idle'
  | 'waiting'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'completed'
  | 'forfeited'
  | 'abandoned';

export type InputMode = 'value' | 'notes';

export interface BoardCellState {
  row: number;
  col: number;
  value: CellValue;
  isGiven: boolean;
  notes: Set<Digit>; // Pencil notes for candidate digits
  isError: boolean;
  isHintTarget: boolean;
}

export type BoardMatrix = BoardCellState[][];

export interface PlayerGameState {
  playerId: string;
  board: BoardMatrix;
  selectedCell: CellCoord | null;
  inputMode: InputMode;
  mistakesCount: number;
  hintsUsedCount: number; // Max 3 in head-to-head
  activeHintStage: 1 | 2 | 3 | null;
  elapsedSeconds: number;
  isFinished: boolean;
}
