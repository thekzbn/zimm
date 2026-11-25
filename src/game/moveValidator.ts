import { Digit, Grid } from '../timely/types';
import { BoardMatrix } from './types';

export interface MoveValidationOutcome {
  valid: boolean;
  isCorrect: boolean;
  isGiven: boolean;
  previousValue: number;
}

export function validatePlayerPlacement(
  board: BoardMatrix,
  solutionGrid: Grid,
  row: number,
  col: number,
  digit: Digit
): MoveValidationOutcome {
  const cell = board[row][col];
  if (cell.isGiven) {
    return {
      valid: false,
      isCorrect: false,
      isGiven: true,
      previousValue: cell.value,
    };
  }

  const isCorrect = solutionGrid[row][col] === digit;

  return {
    valid: true,
    isCorrect,
    isGiven: false,
    previousValue: cell.value,
  };
}
