import { DifficultyProfile, DifficultyTier } from './types';

export const DIFFICULTY_PROFILES: Record<DifficultyTier, DifficultyProfile> = {
  beginner: {
    tier: 'beginner',
    targetClues: 40,
    minClues: 36,
    allowedTechniques: ['naked_single', 'hidden_single'],
    maxTechniqueDifficulty: 1.8,
    expectedBenchmarkSeconds: 180, // 3 minutes
  },
  intermediate: {
    tier: 'intermediate',
    targetClues: 33,
    minClues: 30,
    allowedTechniques: ['naked_single', 'hidden_single', 'pointing_pair'],
    maxTechniqueDifficulty: 2.3,
    expectedBenchmarkSeconds: 360, // 6 minutes
  },
  advanced: {
    tier: 'advanced',
    targetClues: 28,
    minClues: 26,
    allowedTechniques: [
      'naked_single',
      'hidden_single',
      'pointing_pair',
      'claiming_pair',
      'naked_pair',
    ],
    maxTechniqueDifficulty: 3.0,
    expectedBenchmarkSeconds: 600, // 10 minutes
  },
  expert: {
    tier: 'expert',
    targetClues: 24,
    minClues: 22,
    allowedTechniques: [
      'naked_single',
      'hidden_single',
      'pointing_pair',
      'claiming_pair',
      'naked_pair',
      'hidden_pair',
    ],
    maxTechniqueDifficulty: 3.5,
    expectedBenchmarkSeconds: 900, // 15 minutes
  },
};
