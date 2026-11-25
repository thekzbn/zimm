import { cloneGrid, getCandidates, GRID_SIZE } from './grid';
import { Digit, Grid } from './types';

/**
 * Counts the number of valid solutions for a given grid up to a maximum cap.
 * Used to prove uniqueness (cap = 2). As soon as the count reaches 2,
 * the search halts early to minimize computational overhead.
 */
export function countSolutions(initialGrid: Grid, cap: number = 2): number {
  const grid = cloneGrid(initialGrid);
  let solutions = 0;

  function findMRV(): { row: number; col: number; candidates: Digit[] } | null {
    let minCandidates = 10;
    let bestCell: { row: number; col: number; candidates: Digit[] } | null = null;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) {
          const cand = getCandidates(grid, r, c);
          if (cand.length === 0) {
            return { row: r, col: c, candidates: [] }; // Dead end
          }
          if (cand.length < minCandidates) {
            minCandidates = cand.length;
            bestCell = { row: r, col: c, candidates: cand };
            if (minCandidates === 1) return bestCell;
          }
        }
      }
    }

    return bestCell;
  }

  function backtrack(): boolean {
    if (solutions >= cap) return true; // Stop early if cap reached

    const mrv = findMRV();
    if (!mrv) {
      solutions++;
      return solutions >= cap;
    }

    if (mrv.candidates.length === 0) {
      return false;
    }

    for (const val of mrv.candidates) {
      grid[mrv.row][mrv.col] = val;
      const shouldStop = backtrack();
      grid[mrv.row][mrv.col] = 0;
      if (shouldStop) return true;
    }

    return false;
  }

  backtrack();
  return solutions;
}

/**
 * Returns true if and only if the grid has exactly one unique solution.
 */
export function hasUniqueSolution(grid: Grid): boolean {
  return countSolutions(grid, 2) === 1;
}
