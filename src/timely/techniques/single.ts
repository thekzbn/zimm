import { BOX_SIZE, getBoxStart, GRID_SIZE } from '../grid';
import { Digit, Grid, LogicalDeduction } from '../types';

/**
 * Finds a Naked Single: an empty cell that has only one candidate digit.
 */
export function findNakedSingle(
  grid: Grid,
  candidateMap: Map<string, Digit[]>
): LogicalDeduction | null {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        const key = `${r},${c}`;
        const cands = candidateMap.get(key) || [];
        if (cands.length === 1) {
          const val = cands[0];
          return {
            technique: 'naked_single',
            difficultyWeight: 1.0,
            targetCell: { row: r, col: c },
            value: val,
            explanation: {
              en: `Row ${r + 1}, Column ${c + 1} has only one possible candidate: ${val}.`,
              yo: `Àkópọ̀ lórí Ìlà ${r + 1}, Ọ̀wọ́ ${c + 1} ní nọ́ḿbà kan ṣoṣo tó ṣeé fi síbẹ̀: ${val}.`,
            },
          };
        }
      }
    }
  }
  return null;
}

/**
 * Finds a Hidden Single: a digit that appears as a candidate in only one cell
 * of a unit (row, column, or 3x3 block).
 */
export function findHiddenSingle(
  grid: Grid,
  candidateMap: Map<string, Digit[]>
): LogicalDeduction | null {
  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;
      const possibleCols: number[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) {
          const cands = candidateMap.get(`${r},${c}`) || [];
          if (cands.includes(digit)) {
            possibleCols.push(c);
          }
        }
      }
      if (possibleCols.length === 1) {
        const col = possibleCols[0];
        return {
          technique: 'hidden_single',
          difficultyWeight: 1.5,
          targetCell: { row: r, col },
          value: digit,
          explanation: {
            en: `In row ${r + 1}, digit ${digit} can only fit in column ${col + 1}.`,
            yo: `Ní ìlà ${r + 1}, nọ́ḿbà ${digit} lè wọ ọ̀wọ́ ${col + 1} nìkan.`,
          },
        };
      }
    }
  }

  // Check columns
  for (let c = 0; c < GRID_SIZE; c++) {
    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;
      const possibleRows: number[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r][c] === 0) {
          const cands = candidateMap.get(`${r},${c}`) || [];
          if (cands.includes(digit)) {
            possibleRows.push(r);
          }
        }
      }
      if (possibleRows.length === 1) {
        const row = possibleRows[0];
        return {
          technique: 'hidden_single',
          difficultyWeight: 1.5,
          targetCell: { row, col: c },
          value: digit,
          explanation: {
            en: `In column ${c + 1}, digit ${digit} can only fit in row ${row + 1}.`,
            yo: `Ní ọ̀wọ́ ${c + 1}, nọ́ḿbà ${digit} lè wọ ìlà ${row + 1} nìkan.`,
          },
        };
      }
    }
  }

  // Check 3x3 blocks
  for (let b = 0; b < GRID_SIZE; b++) {
    const { row: br, col: bc } = getBoxStart(b);
    for (let d = 1; d <= 9; d++) {
      const digit = d as Digit;
      const possibleCells: { row: number; col: number }[] = [];
      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          const cr = br + r;
          const cc = bc + c;
          if (grid[cr][cc] === 0) {
            const cands = candidateMap.get(`${cr},${cc}`) || [];
            if (cands.includes(digit)) {
              possibleCells.push({ row: cr, col: cc });
            }
          }
        }
      }
      if (possibleCells.length === 1) {
        const target = possibleCells[0];
        return {
          technique: 'hidden_single',
          difficultyWeight: 1.5,
          targetCell: target,
          value: digit,
          explanation: {
            en: `In 3x3 block ${b + 1}, digit ${digit} can only fit at row ${target.row + 1}, col ${target.col + 1}.`,
            yo: `Ní àpótí ${b + 1}, nọ́ḿbà ${digit} lè wọ ìlà ${target.row + 1}, ọ̀wọ́ ${target.col + 1} nìkan.`,
          },
        };
      }
    }
  }

  return null;
}
