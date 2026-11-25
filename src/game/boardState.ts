import { GRID_SIZE } from '../timely/grid';
import { Digit, Grid } from '../timely/types';
import { prunePeerNotes } from './pencilNotes';
import { BoardCellState, BoardMatrix } from './types';

export function initializeBoard(initialGrid: Grid): BoardMatrix {
  const matrix: BoardMatrix = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    const row: BoardCellState[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = initialGrid[r][c];
      row.push({
        row: r,
        col: c,
        value: val,
        isGiven: val !== 0,
        notes: new Set<Digit>(),
        isError: false,
        isHintTarget: false,
      });
    }
    matrix.push(row);
  }

  return matrix;
}

export function commitDigitToBoard(
  board: BoardMatrix,
  row: number,
  col: number,
  digit: Digit,
  isCorrect: boolean
): BoardMatrix {
  let updated = board.map((r, rIdx) =>
    r.map((c, cIdx) => {
      if (rIdx === row && cIdx === col) {
        return {
          ...c,
          value: digit,
          isError: !isCorrect,
          notes: new Set<Digit>(), // Clear scratch notes in this cell
          isHintTarget: false,
        };
      }
      return c;
    })
  );

  if (isCorrect) {
    updated = prunePeerNotes(updated, row, col, digit);
  }

  return updated;
}

export function eraseCellFromBoard(board: BoardMatrix, row: number, col: number): BoardMatrix {
  return board.map((r, rIdx) =>
    r.map((c, cIdx) => {
      if (rIdx === row && cIdx === col && !c.isGiven) {
        return {
          ...c,
          value: 0,
          isError: false,
          notes: new Set<Digit>(),
          isHintTarget: false,
        };
      }
      return c;
    })
  );
}

export function isBoardCompleted(board: BoardMatrix, solutionGrid: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c].value !== solutionGrid[r][c]) {
        return false;
      }
    }
  }
  return true;
}

export function countFilledCells(board: BoardMatrix): number {
  let filled = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c].value !== 0) filled++;
    }
  }
  return filled;
}
