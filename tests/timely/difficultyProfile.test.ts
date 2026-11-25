import { describe, expect, it } from 'vitest';
import { DIFFICULTY_PROFILES } from '../../src/timely/profiles';
import { DifficultyTier } from '../../src/timely/types';

describe('tiMely Difficulty Profiles and Pacing', () => {
  it('enforces monotonic scaling of target clues and benchmark seconds', () => {
    const tiers: DifficultyTier[] = ['beginner', 'intermediate', 'advanced', 'expert'];

    for (let i = 0; i < tiers.length - 1; i++) {
      const current = DIFFICULTY_PROFILES[tiers[i]];
      const next = DIFFICULTY_PROFILES[tiers[i + 1]];

      // Target clues must decrease as difficulty increases
      expect(current.targetClues).toBeGreaterThan(next.targetClues);
      expect(current.minClues).toBeGreaterThan(next.minClues);

      // Expected benchmark solve seconds must increase as difficulty increases
      expect(current.expectedBenchmarkSeconds).toBeLessThan(next.expectedBenchmarkSeconds);

      // Maximum technique ceiling must not decrease
      expect(current.maxTechniqueDifficulty).toBeLessThanOrEqual(next.maxTechniqueDifficulty);
    }
  });

  it('defines valid allowed techniques for each tier', () => {
    expect(DIFFICULTY_PROFILES.beginner.allowedTechniques).toEqual([
      'naked_single',
      'hidden_single',
    ]);
    expect(DIFFICULTY_PROFILES.intermediate.allowedTechniques).toContain('pointing_pair');
    expect(DIFFICULTY_PROFILES.expert.allowedTechniques).toContain('hidden_pair');
  });
});
