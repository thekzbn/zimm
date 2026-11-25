import { removeCluesPreservingUniqueness } from './clueRemover';
import { countClues } from './grid';
import { solveLogically } from './logicalSolver';
import { generateFullGrid } from './mrvBacktracker';
import { PRECOMPUTED_FALLBACKS } from './precomputedFallbacks';
import { DIFFICULTY_PROFILES } from './profiles';
import { DifficultyTier, GeneratedPuzzle } from './types';

export interface GenerationOptions {
  maxRetries?: number;
}

/**
 * End-to-end tiMely generation and logical validation pipeline.
 *
 * Algorithm:
 * 1. Fetch profile for the selected difficulty tier.
 * 2. Generate a complete, valid 9x9 grid using MRV backtracking with randomized candidate order.
 * 3. Remove clues in shuffled order, retaining removal only if countSolutions(grid, 2) === 1.
 * 4. Run logical solver, recording every deduction and technique used.
 * 5. Validate against profile constraints. If generation fails or stalls, retry up to maxRetries.
 * 6. If maxRetries is exhausted, safely serve a precomputed, verified fallback puzzle.
 */
export function generatePuzzle(
  tier: DifficultyTier,
  options: GenerationOptions = {}
): GeneratedPuzzle {
  const maxRetries = options.maxRetries ?? 5;
  const profile = DIFFICULTY_PROFILES[tier];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 1. Generate full solved grid
      const solutionGrid = generateFullGrid();

      // 2. Remove clues while strictly preserving uniqueness
      const initialGrid = removeCluesPreservingUniqueness(
        solutionGrid,
        profile.targetClues,
        profile.minClues
      );

      // 3. Logically solve to verify solvability and profile fit
      const validation = solveLogically(initialGrid, tier);

      if (validation.valid) {
        const id = `timely_${tier}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        return {
          id,
          tier,
          initialGrid,
          solutionGrid,
          clueCount: countClues(initialGrid),
          expectedBenchmarkSeconds: profile.expectedBenchmarkSeconds,
          hasSpike: validation.hasSpike,
          deductionLog: validation.deductionLog,
        };
      }
    } catch {
      // Retry on unexpected error
    }
  }

  // Fallback to verified precomputed puzzle if retry limit reached
  const fallback = PRECOMPUTED_FALLBACKS[tier];
  return {
    ...fallback,
    id: `fallback_${tier}_${Date.now()}`,
  };
}
