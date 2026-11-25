import { describe, expect, it } from 'vitest';
import { countClues, isGridCompleteAndValid } from '../../src/timely/grid';
import { generateFullGrid } from '../../src/timely/mrvBacktracker';
import { generatePuzzle } from '../../src/timely/pipeline';
import { countSolutions, hasUniqueSolution } from '../../src/timely/solutionCounter';

describe('tiMely Puzzle Validity and Uniqueness', () => {
  it('generates a complete valid 9x9 grid via MRV backtracking', () => {
    const fullGrid = generateFullGrid();
    expect(isGridCompleteAndValid(fullGrid)).toBe(true);
    expect(countClues(fullGrid)).toBe(81);
  });

  it('proves uniqueness with solution counter capped at two', () => {
    // Solved grid has exactly 1 solution
    const fullGrid = generateFullGrid();
    expect(countSolutions(fullGrid, 2)).toBe(1);
    expect(hasUniqueSolution(fullGrid)).toBe(true);

    // Completely empty grid has > 1 solutions (caps at 2)
    const emptyGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
    expect(countSolutions(emptyGrid, 2)).toBe(2);
    expect(hasUniqueSolution(emptyGrid)).toBe(false);
  });

  it('generates a puzzle with proven uniqueness across difficulty tiers', () => {
    const tiers = ['beginner', 'intermediate'] as const;
    for (const tier of tiers) {
      const puzzle = generatePuzzle(tier, { maxRetries: 1 });
      expect(puzzle.clueCount).toBeGreaterThanOrEqual(25);
      expect(hasUniqueSolution(puzzle.initialGrid)).toBe(true);
      expect(isGridCompleteAndValid(puzzle.solutionGrid)).toBe(true);
    }
  });
});
