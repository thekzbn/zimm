import { BoardMatrix } from '../game/types';

/**
 * Checks whether placing a correct digit at (row, col) completed
 * its row, column, or 3x3 box, returning all cell keys ("r,c")
 * belonging to the newly completed unit(s).
 */
export function getCompletedUnitCells(
  board: BoardMatrix,
  row: number,
  col: number
): Set<string> {
  const completed = new Set<string>();
  if (board.length !== 9) return completed;

  const isFilledClean = (r: number, c: number) =>
    board[r][c].value !== 0 && !board[r][c].isError;

  // Check row
  let rowDone = true;
  for (let c = 0; c < 9; c++) {
    if (!isFilledClean(row, c)) {
      rowDone = false;
      break;
    }
  }
  if (rowDone) {
    for (let c = 0; c < 9; c++) completed.add(`${row},${c}`);
  }

  // Check column
  let colDone = true;
  for (let r = 0; r < 9; r++) {
    if (!isFilledClean(r, col)) {
      colDone = false;
      break;
    }
  }
  if (colDone) {
    for (let r = 0; r < 9; r++) completed.add(`${r},${col}`);
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  let boxDone = true;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (!isFilledClean(r, c)) {
        boxDone = false;
        break;
      }
    }
    if (!boxDone) break;
  }
  if (boxDone) {
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        completed.add(`${r},${c}`);
      }
    }
  }

  return completed;
}
