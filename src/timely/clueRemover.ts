import { cloneGrid, GRID_SIZE } from './grid';
import { hasUniqueSolution } from './solutionCounter';
import { CellCoord, Grid } from './types';

function shuffleCoords(coords: CellCoord[]): CellCoord[] {
  const result = [...coords];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Removes clues from a solved grid in shuffled order.
 * At each step, a clue is removed tentatively; if the puzzle still has
 * exactly one solution (countSolutions capped at 2 === 1), the removal
 * is retained; otherwise the clue is immediately restored.
 */
export function removeCluesPreservingUniqueness(
  solvedGrid: Grid,
  targetClueCount: number,
  minClueCount: number = 24
): Grid {
  const grid = cloneGrid(solvedGrid);

  // Collect all 81 cell coordinates and shuffle them
  const allCoords: CellCoord[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      allCoords.push({ row: r, col: c });
    }
  }

  const shuffled = shuffleCoords(allCoords);
  let currentClues = 81;

  for (const { row, col } of shuffled) {
    if (currentClues <= targetClueCount) {
      break;
    }

    const originalValue = grid[row][col];
    if (originalValue === 0) continue;

    // Tentatively remove clue
    grid[row][col] = 0;

    // Verify uniqueness using solution counter capped at 2
    if (hasUniqueSolution(grid)) {
      currentClues--;
    } else {
      // Multiple solutions possible; restore clue
      grid[row][col] = originalValue;
    }

    if (currentClues <= minClueCount) {
      break;
    }
  }

  return grid;
}
