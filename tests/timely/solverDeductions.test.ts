import { describe, expect, it } from 'vitest';
import { createEmptyGrid } from '../../src/timely/grid';
import { createStagedHint } from '../../src/timely/hintStager';
import { buildCandidateMap, solveLogically } from '../../src/timely/logicalSolver';
import { PRECOMPUTED_FALLBACKS } from '../../src/timely/precomputedFallbacks';
import { findHiddenSingle, findNakedSingle } from '../../src/timely/techniques/single';
import { Digit } from '../../src/timely/types';

describe('tiMely Solver Deductions and Staged Hints', () => {
  it('correctly discovers Naked Single deductions', () => {
    const grid = createEmptyGrid();
    // Fill row 0 cells 1..8 with 1..8, leaving cell (0, 0) strictly restricted to candidate 9
    for (let c = 1; c < 9; c++) {
      grid[0][c] = c as Digit;
    }

    const candidateMap = buildCandidateMap(grid);
    const deduction = findNakedSingle(grid, candidateMap);

    expect(deduction).not.toBeNull();
    expect(deduction?.technique).toBe('naked_single');
    expect(deduction?.targetCell).toEqual({ row: 0, col: 0 });
    expect(deduction?.value).toBe(9);
  });

  it('correctly discovers Hidden Single deductions', () => {
    const grid = createEmptyGrid();
    // In row 0, prevent digit 5 from appearing in columns 0,1,2,3 and 5,6,7,8
    // by placing 5 in different rows (rows 3..8) of those columns.
    // Also place numbers in row 0 so (0,4) is empty but candidates include 5.
    const blockedCols = [0, 1, 2, 3, 5, 6, 7, 8];
    blockedCols.forEach((col, idx) => {
      // Place 5 in row (idx % 6) + 3 to avoid block/row conflict with row 0
      grid[3 + (idx % 6)][col] = 5;
    });

    const candidateMap = buildCandidateMap(grid);
    const deduction = findHiddenSingle(grid, candidateMap);

    expect(deduction).not.toBeNull();
    expect(deduction?.technique).toBe('hidden_single');
    expect(deduction?.targetCell.col).toBe(4);
    expect(deduction?.value).toBe(5);
  });

  it('generates accurate 3-stage hints from logical deductions', () => {
    const sampleDeduction = {
      technique: 'naked_single' as const,
      difficultyWeight: 1.0,
      targetCell: { row: 2, col: 5 },
      value: 7 as Digit,
      explanation: {
        en: 'Row 3, Column 6 has only one possible candidate: 7.',
        yo: 'Àkópọ̀ lórí Ìlà 3, Ọ̀wọ́ 6 ní nọ́ḿbà kan ṣoṣo tó ṣeé fi síbẹ̀: 7.',
      },
    };

    // Stage 1: Nudge
    const stage1 = createStagedHint(sampleDeduction, 1);
    expect(stage1.stage).toBe(1);
    expect(stage1.targetCell).toEqual({ row: 2, col: 5 });
    expect(stage1.message.en).toContain('Row 3, Column 6');
    expect(stage1.message.yo).toContain('Ìlà 3, Ọ̀wọ́ 6');

    // Stage 2: Technique
    const stage2 = createStagedHint(sampleDeduction, 2);
    expect(stage2.stage).toBe(2);
    expect(stage2.techniqueName).toBe('Naked Single');
    expect(stage2.message.en).toContain('Naked Single');

    // Stage 3: Exact deduction
    const stage3 = createStagedHint(sampleDeduction, 3);
    expect(stage3.stage).toBe(3);
    expect(stage3.deducedValue).toBe(7);
    expect(stage3.message.en).toContain('Place digit 7');
  });

  it('solves fallback puzzles logically without backtracking', () => {
    const beginner = PRECOMPUTED_FALLBACKS.beginner;
    const result = solveLogically(beginner.initialGrid, 'beginner');
    expect(result.valid).toBe(true);
    expect(result.deductionLog.length).toBeGreaterThan(0);
  });
});
