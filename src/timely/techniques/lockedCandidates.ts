import { BOX_SIZE, getBoxIndex, getBoxStart, GRID_SIZE } from '../grid';
import { CellCoord, Digit, Grid, LogicalDeduction } from '../types';

/**
 * Pointing Pair/Triple:
 * When all candidates for a digit inside a 3x3 block lie within the same row or column,
 * that digit can be eliminated from the rest of that row or column outside the block.
 */
export function findPointing(
  grid: Grid,
  candidateMap: Map<string, Digit[]>
): LogicalDeduction | null {
  for (let b = 0; b < GRID_SIZE; b++) {
    const { row: br, col: bc } = getBoxStart(b);

    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;
      const occurrences: CellCoord[] = [];

      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          const cr = br + r;
          const cc = bc + c;
          if (grid[cr][cc] === 0) {
            const cands = candidateMap.get(`${cr},${cc}`) || [];
            if (cands.includes(digit)) {
              occurrences.push({ row: cr, col: cc });
            }
          }
        }
      }

      if (occurrences.length >= 2 && occurrences.length <= 3) {
        // Check if all in same row
        const sameRow = occurrences.every((cell) => cell.row === occurrences[0].row);
        if (sameRow) {
          const targetRow = occurrences[0].row;
          const eliminated: { cell: CellCoord; digit: Digit }[] = [];

          for (let c = 0; c < GRID_SIZE; c++) {
            if (Math.floor(c / BOX_SIZE) !== Math.floor(bc / BOX_SIZE) && grid[targetRow][c] === 0) {
              const cands = candidateMap.get(`${targetRow},${c}`) || [];
              if (cands.includes(digit)) {
                eliminated.push({ cell: { row: targetRow, col: c }, digit });
              }
            }
          }

          if (eliminated.length > 0) {
            return {
              technique: 'pointing_pair',
              difficultyWeight: 2.2,
              targetCell: occurrences[0],
              value: digit,
              eliminatedCandidates: eliminated,
              explanation: {
                en: `In block ${b + 1}, candidate ${digit} is confined to row ${targetRow + 1}, pointing along the row.`,
                yo: `Ní àpótí ${b + 1}, nọ́ḿbà ${digit} wà lórí ìlà ${targetRow + 1} nìkan, ó ń tọ́ka sí ìyókù ìlà náà.`,
              },
            };
          }
        }

        // Check if all in same col
        const sameCol = occurrences.every((cell) => cell.col === occurrences[0].col);
        if (sameCol) {
          const targetCol = occurrences[0].col;
          const eliminated: { cell: CellCoord; digit: Digit }[] = [];

          for (let r = 0; r < GRID_SIZE; r++) {
            if (Math.floor(r / BOX_SIZE) !== Math.floor(br / BOX_SIZE) && grid[r][targetCol] === 0) {
              const cands = candidateMap.get(`${r},${targetCol}`) || [];
              if (cands.includes(digit)) {
                eliminated.push({ cell: { row: r, col: targetCol }, digit });
              }
            }
          }

          if (eliminated.length > 0) {
            return {
              technique: 'pointing_pair',
              difficultyWeight: 2.2,
              targetCell: occurrences[0],
              value: digit,
              eliminatedCandidates: eliminated,
              explanation: {
                en: `In block ${b + 1}, candidate ${digit} is confined to column ${targetCol + 1}, pointing along the column.`,
                yo: `Ní àpótí ${b + 1}, nọ́ḿbà ${digit} wà lórí ọ̀wọ́ ${targetCol + 1} nìkan, ó ń tọ́ka sí ìyókù ọ̀wọ́ náà.`,
              },
            };
          }
        }
      }
    }
  }
  return null;
}

/**
 * Claiming Pair/Triple (Box-Line Reduction):
 * When candidate occurrences in a row or col all fall within a single 3x3 block,
 * that digit can be eliminated from other cells in that block.
 */
export function findClaiming(
  grid: Grid,
  candidateMap: Map<string, Digit[]>
): LogicalDeduction | null {
  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;
      const occurrences: CellCoord[] = [];

      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) {
          const cands = candidateMap.get(`${r},${c}`) || [];
          if (cands.includes(digit)) {
            occurrences.push({ row: r, col: c });
          }
        }
      }

      if (occurrences.length >= 2 && occurrences.length <= 3) {
        const firstBox = getBoxIndex(occurrences[0].row, occurrences[0].col);
        const allSameBox = occurrences.every(
          (cell) => getBoxIndex(cell.row, cell.col) === firstBox
        );

        if (allSameBox) {
          const { row: br, col: bc } = getBoxStart(firstBox);
          const eliminated: { cell: CellCoord; digit: Digit }[] = [];

          for (let ro = 0; ro < BOX_SIZE; ro++) {
            for (let co = 0; co < BOX_SIZE; co++) {
              const cr = br + ro;
              const cc = bc + co;
              if (cr !== r && grid[cr][cc] === 0) {
                const cands = candidateMap.get(`${cr},${cc}`) || [];
                if (cands.includes(digit)) {
                  eliminated.push({ cell: { row: cr, col: cc }, digit });
                }
              }
            }
          }

          if (eliminated.length > 0) {
            return {
              technique: 'claiming_pair',
              difficultyWeight: 2.5,
              targetCell: occurrences[0],
              value: digit,
              eliminatedCandidates: eliminated,
              explanation: {
                en: `In row ${r + 1}, digit ${digit} is claimed by block ${firstBox + 1}.`,
                yo: `Ní ìlà ${r + 1}, nọ́ḿbà ${digit} wà nínú àpótí ${firstBox + 1} nìkan.`,
              },
            };
          }
        }
      }
    }
  }

  return null;
}
