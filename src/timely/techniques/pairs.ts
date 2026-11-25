import { GRID_SIZE } from '../grid';
import { CellCoord, Digit, Grid, LogicalDeduction } from '../types';

/**
 * Naked Pair:
 * Two cells in the same unit (row, col, block) contain the exact same two candidates.
 * Those two digits can be eliminated from all other cells in that unit.
 */
export function findNakedPair(
  grid: Grid,
  candidateMap: Map<string, Digit[]>
): LogicalDeduction | null {
  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    const pairCells: { col: number; cands: Digit[] }[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        const cands = candidateMap.get(`${r},${c}`) || [];
        if (cands.length === 2) {
          pairCells.push({ col: c, cands });
        }
      }
    }

    for (let i = 0; i < pairCells.length; i++) {
      for (let j = i + 1; j < pairCells.length; j++) {
        const c1 = pairCells[i].cands;
        const c2 = pairCells[j].cands;
        if (c1[0] === c2[0] && c1[1] === c2[1]) {
          const eliminated: { cell: CellCoord; digit: Digit }[] = [];
          for (let c = 0; c < GRID_SIZE; c++) {
            if (c !== pairCells[i].col && c !== pairCells[j].col && grid[r][c] === 0) {
              const cands = candidateMap.get(`${r},${c}`) || [];
              if (cands.includes(c1[0])) eliminated.push({ cell: { row: r, col: c }, digit: c1[0] });
              if (cands.includes(c1[1])) eliminated.push({ cell: { row: r, col: c }, digit: c1[1] });
            }
          }

          if (eliminated.length > 0) {
            return {
              technique: 'naked_pair',
              difficultyWeight: 2.8,
              targetCell: { row: r, col: pairCells[i].col },
              value: c1[0],
              eliminatedCandidates: eliminated,
              explanation: {
                en: `Naked pair (${c1[0]}, ${c1[1]}) found in row ${r + 1} at columns ${pairCells[i].col + 1} and ${pairCells[j].col + 1}.`,
                yo: `Àbá méjì tó dán (${c1[0]}, ${c1[1]}) lórí ìlà ${r + 1} ní ọ̀wọ́ ${pairCells[i].col + 1} àti ${pairCells[j].col + 1}.`,
              },
            };
          }
        }
      }
    }
  }

  // Check columns
  for (let c = 0; c < GRID_SIZE; c++) {
    const pairCells: { row: number; cands: Digit[] }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c] === 0) {
        const cands = candidateMap.get(`${r},${c}`) || [];
        if (cands.length === 2) {
          pairCells.push({ row: r, cands });
        }
      }
    }

    for (let i = 0; i < pairCells.length; i++) {
      for (let j = i + 1; j < pairCells.length; j++) {
        const c1 = pairCells[i].cands;
        const c2 = pairCells[j].cands;
        if (c1[0] === c2[0] && c1[1] === c2[1]) {
          const eliminated: { cell: CellCoord; digit: Digit }[] = [];
          for (let r = 0; r < GRID_SIZE; r++) {
            if (r !== pairCells[i].row && r !== pairCells[j].row && grid[r][c] === 0) {
              const cands = candidateMap.get(`${r},${c}`) || [];
              if (cands.includes(c1[0])) eliminated.push({ cell: { row: r, col: c }, digit: c1[0] });
              if (cands.includes(c1[1])) eliminated.push({ cell: { row: r, col: c }, digit: c1[1] });
            }
          }

          if (eliminated.length > 0) {
            return {
              technique: 'naked_pair',
              difficultyWeight: 2.8,
              targetCell: { row: pairCells[i].row, col: c },
              value: c1[0],
              eliminatedCandidates: eliminated,
              explanation: {
                en: `Naked pair (${c1[0]}, ${c1[1]}) in column ${c + 1} at rows ${pairCells[i].row + 1} and ${pairCells[j].row + 1}.`,
                yo: `Àbá méjì tó dán (${c1[0]}, ${c1[1]}) ní ọ̀wọ́ ${c + 1} lórí ìlà ${pairCells[i].row + 1} àti ${pairCells[j].row + 1}.`,
              },
            };
          }
        }
      }
    }
  }

  return null;
}
