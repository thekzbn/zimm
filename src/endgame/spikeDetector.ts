import { DEFAULT_ENDGAME_CONFIG, EndgameConfig } from './config';
import { SpikeAnalysis } from './types';

/**
 * Detects if a puzzle contained an out-of-profile difficulty spike
 * and calculates the compensation points from the reserve pool.
 *
 * Spike assignment is strictly independent for each player's puzzle
 * and evaluates the puzzle's required logical solving path, not match outcome.
 */
export function analyzeDifficultySpike(
  hasSpike: boolean,
  config: EndgameConfig = DEFAULT_ENDGAME_CONFIG
): SpikeAnalysis {
  if (hasSpike) {
    return {
      spikeDetected: true,
      spikeReason: 'Encountered deduction exceeding profile difficulty ceiling.',
      compensationPoints: config.spikeCompensationPoints,
    };
  }

  return {
    spikeDetected: false,
    compensationPoints: 0,
  };
}
