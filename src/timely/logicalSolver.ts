import { cloneGrid, getCandidates, GRID_SIZE, isGridCompleteAndValid } from './grid';
import { DIFFICULTY_PROFILES } from './profiles';
import { findClaiming, findPointing } from './techniques/lockedCandidates';
import { findNakedPair } from './techniques/pairs';
import { findHiddenSingle, findNakedSingle } from './techniques/single';
import {
  DifficultyTier,
  Digit,
  Grid,
  LogicalDeduction,
  PuzzleValidationResult,
  TechniqueName,
} from './types';

/**
 * Builds a map of all candidates for empty cells.
 */
export function buildCandidateMap(grid: Grid): Map<string, Digit[]> {
  const map = new Map<string, Digit[]>();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        map.set(`${r},${c}`, getCandidates(grid, r, c));
      }
    }
  }
  return map;
}

/**
 * Solves a puzzle purely logically using allowed techniques.
 * Records every deduction and its reason. If a puzzle cannot be solved
 * with logical steps alone (requires guessing / backtracking), it stalls.
 */
export function solveLogically(
  initialGrid: Grid,
  tier: DifficultyTier
): PuzzleValidationResult {
  const grid = cloneGrid(initialGrid);
  const profile = DIFFICULTY_PROFILES[tier];
  const deductionLog: LogicalDeduction[] = [];
  const requiredTechniques = new Set<TechniqueName>();
  let highestWeight = 1.0;
  let hasSpike = false;

  let progress = true;

  while (progress) {
    progress = false;

    if (isGridCompleteAndValid(grid)) {
      break;
    }

    const candidateMap = buildCandidateMap(grid);

    // 1. Naked Single
    const nakedSingle = findNakedSingle(grid, candidateMap);
    if (nakedSingle) {
      grid[nakedSingle.targetCell.row][nakedSingle.targetCell.col] = nakedSingle.value;
      deductionLog.push(nakedSingle);
      requiredTechniques.add(nakedSingle.technique);
      progress = true;
      continue;
    }

    // 2. Hidden Single
    const hiddenSingle = findHiddenSingle(grid, candidateMap);
    if (hiddenSingle) {
      grid[hiddenSingle.targetCell.row][hiddenSingle.targetCell.col] = hiddenSingle.value;
      deductionLog.push(hiddenSingle);
      requiredTechniques.add(hiddenSingle.technique);
      progress = true;
      continue;
    }

    // 3. Pointing Pairs / Locked Candidates (if allowed or checking for spike)
    const pointing = findPointing(grid, candidateMap);
    if (pointing) {
      deductionLog.push(pointing);
      requiredTechniques.add(pointing.technique);
      highestWeight = Math.max(highestWeight, pointing.difficultyWeight);

      if (pointing.difficultyWeight > profile.maxTechniqueDifficulty) {
        hasSpike = true;
      }

      // Eliminate candidates
      if (pointing.eliminatedCandidates) {
        let eliminatedCount = 0;
        for (const elim of pointing.eliminatedCandidates) {
          const key = `${elim.cell.row},${elim.cell.col}`;
          const current = candidateMap.get(key) || [];
          const updated = current.filter((d) => d !== elim.digit);
          if (updated.length < current.length) {
            candidateMap.set(key, updated);
            eliminatedCount++;
          }
        }
        if (eliminatedCount > 0) {
          progress = true;
          continue;
        }
      }
    }

    // 4. Claiming Pairs (if allowed or checking for spike)
    const claiming = findClaiming(grid, candidateMap);
    if (claiming) {
      deductionLog.push(claiming);
      requiredTechniques.add(claiming.technique);
      highestWeight = Math.max(highestWeight, claiming.difficultyWeight);

      if (claiming.difficultyWeight > profile.maxTechniqueDifficulty) {
        hasSpike = true;
      }

      if (claiming.eliminatedCandidates) {
        let eliminatedCount = 0;
        for (const elim of claiming.eliminatedCandidates) {
          const key = `${elim.cell.row},${elim.cell.col}`;
          const current = candidateMap.get(key) || [];
          const updated = current.filter((d) => d !== elim.digit);
          if (updated.length < current.length) {
            candidateMap.set(key, updated);
            eliminatedCount++;
          }
        }
        if (eliminatedCount > 0) {
          progress = true;
          continue;
        }
      }
    }

    // 5. Naked Pairs
    const nakedPair = findNakedPair(grid, candidateMap);
    if (nakedPair) {
      deductionLog.push(nakedPair);
      requiredTechniques.add(nakedPair.technique);
      highestWeight = Math.max(highestWeight, nakedPair.difficultyWeight);

      if (nakedPair.difficultyWeight > profile.maxTechniqueDifficulty) {
        hasSpike = true;
      }

      if (nakedPair.eliminatedCandidates) {
        let eliminatedCount = 0;
        for (const elim of nakedPair.eliminatedCandidates) {
          const key = `${elim.cell.row},${elim.cell.col}`;
          const current = candidateMap.get(key) || [];
          const updated = current.filter((d) => d !== elim.digit);
          if (updated.length < current.length) {
            candidateMap.set(key, updated);
            eliminatedCount++;
          }
        }
        if (eliminatedCount > 0) {
          progress = true;
          continue;
        }
      }
    }
  }

  const complete = isGridCompleteAndValid(grid);

  return {
    valid: complete,
    tier,
    unique: true,
    requiredTechniques: Array.from(requiredTechniques),
    totalDeductions: deductionLog.length,
    highestWeight,
    hasSpike,
    deductionLog,
  };
}
