/**
 * tiMely Puzzle Engine Type Definitions
 * Note: tiMely is an internal engineering name only.
 */

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellValue = Digit | 0; // 0 denotes an empty cell

export type Grid = CellValue[][]; // 9x9 grid of numbers 0..9

export type DifficultyTier = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type TechniqueName =
  | 'naked_single'
  | 'hidden_single'
  | 'pointing_pair'
  | 'claiming_pair'
  | 'naked_pair'
  | 'hidden_pair';

export interface CellCoord {
  row: number; // 0..8
  col: number; // 0..8
}

export interface LogicalDeduction {
  technique: TechniqueName;
  difficultyWeight: number; // Quantitative weight of the deduction
  targetCell: CellCoord;
  value: Digit;
  eliminatedCandidates?: { cell: CellCoord; digit: Digit }[];
  explanation: {
    en: string;
    yo: string;
  };
}

export interface DifficultyProfile {
  tier: DifficultyTier;
  targetClues: number;
  minClues: number;
  allowedTechniques: TechniqueName[];
  maxTechniqueDifficulty: number;
  expectedBenchmarkSeconds: number; // T_expected benchmark solve duration
}

export interface StagedHint {
  stage: 1 | 2 | 3;
  targetCell: CellCoord;
  techniqueName?: string;
  deducedValue?: Digit;
  message: {
    en: string;
    yo: string;
  };
}

export interface PuzzleValidationResult {
  valid: boolean;
  tier: DifficultyTier;
  unique: boolean;
  requiredTechniques: TechniqueName[];
  totalDeductions: number;
  highestWeight: number;
  hasSpike: boolean;
  deductionLog: LogicalDeduction[];
}

export interface GeneratedPuzzle {
  id: string;
  tier: DifficultyTier;
  initialGrid: Grid;
  solutionGrid: Grid;
  clueCount: number;
  expectedBenchmarkSeconds: number;
  hasSpike: boolean;
  deductionLog: LogicalDeduction[];
}
