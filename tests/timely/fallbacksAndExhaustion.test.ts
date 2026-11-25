import { describe, expect, it } from 'vitest';
import { generatePuzzle } from '../../src/timely/pipeline';
import { PRECOMPUTED_FALLBACKS } from '../../src/timely/precomputedFallbacks';
import { hasUniqueSolution } from '../../src/timely/solutionCounter';
import { DifficultyTier } from '../../src/timely/types';

describe('tiMely Fallbacks and Generation Exhaustion Handling', () => {
  it('verifies that all precomputed fallbacks possess verified unique solutions', () => {
    const tiers: DifficultyTier[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    for (const tier of tiers) {
      const fallback = PRECOMPUTED_FALLBACKS[tier];
      expect(hasUniqueSolution(fallback.initialGrid)).toBe(true);
      expect(fallback.solutionGrid.length).toBe(9);
      expect(fallback.expectedBenchmarkSeconds).toBeGreaterThan(0);
    }
  });

  it('safely falls back to verified puzzle when maxRetries is zero', () => {
    const puzzle = generatePuzzle('beginner', { maxRetries: 0 });
    expect(puzzle).toBeDefined();
    expect(puzzle.tier).toBe('beginner');
    expect(hasUniqueSolution(puzzle.initialGrid)).toBe(true);
  });
});
