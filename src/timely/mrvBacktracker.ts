import { createEmptyGrid, getCandidates, GRID_SIZE } from './grid';
import { CellCoord, Digit, Grid } from './types';

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Finds the empty cell with the Minimum Remaining Values (MRV).
 * Randomizes ties when multiple cells share the minimum candidate count.
 */
export function findMRVCell(grid: Grid): { cell: CellCoord; candidates: Digit[] } | null {
  let minCount = 10;
  let tiedCells: { cell: CellCoord; candidates: Digit[] }[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        const candidates = getCandidates(grid, r, c);
        const count = candidates.length;

        if (count === 0) {
          // Dead end: empty cell with no valid candidate
          return { cell: { row: r, col: c }, candidates: [] };
        }

        if (count < minCount) {
          minCount = count;
          tiedCells = [{ cell: { row: r, col: c }, candidates }];
        } else if (count === minCount) {
          tiedCells.push({ cell: { row: r, col: c }, candidates });
        }
      }
    }
  }

  if (tiedCells.length === 0) return null;

  // Break ties randomly
  const randomIndex = Math.floor(Math.random() * tiedCells.length);
  return tiedCells[randomIndex];
}

/**
 * Generates a complete valid 9x9 Sudoku grid using MRV backtracking
 * with randomized tie breaking and randomized candidate ordering.
 */
export function generateFullGrid(): Grid {
  const grid = createEmptyGrid();

  function solve(currentGrid: Grid): boolean {
    const mrv = findMRVCell(currentGrid);
    if (!mrv) return true; // All cells filled validly
    if (mrv.candidates.length === 0) return false; // Dead end

    const randomizedCandidates = shuffle(mrv.candidates);

    for (const val of randomizedCandidates) {
      currentGrid[mrv.cell.row][mrv.cell.col] = val;
      if (solve(currentGrid)) {
        return true;
      }
      currentGrid[mrv.cell.row][mrv.cell.col] = 0;
    }

    return false;
  }

  solve(grid);
  return grid;
}
