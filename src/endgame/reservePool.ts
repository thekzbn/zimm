import { DEFAULT_ENDGAME_CONFIG, EndgameConfig } from './config';
import { MatchOutcomeType, ReservePoolState } from './types';

export function createInitialPoolState(
  config: EndgameConfig = DEFAULT_ENDGAME_CONFIG
): ReservePoolState {
  return {
    currentBalance: config.initialPoolBalance,
    totalCollected: config.initialPoolBalance,
    totalPaidOut: 0,
  };
}

/**
 * Calculates the tax points collected from a player based on their match outcome.
 * The loser contributes more than the winner into the reserve pool.
 */
export function calculateTax(
  outcome: MatchOutcomeType,
  config: EndgameConfig = DEFAULT_ENDGAME_CONFIG
): number {
  if (outcome === 'win') {
    return config.winnerTaxPoints;
  }
  if (outcome === 'loss') {
    return config.loserTaxPoints;
  }
  // On a draw, split the difference
  return (config.winnerTaxPoints + config.loserTaxPoints) / 2;
}

/**
 * Updates the reserve pool balance when tax is collected and spike compensation is paid.
 */
export function updateReservePool(
  currentPool: ReservePoolState,
  taxCollected: number,
  compensationPaid: number
): ReservePoolState {
  const newBalance = currentPool.currentBalance + taxCollected - compensationPaid;

  return {
    currentBalance: Math.max(0, newBalance),
    totalCollected: currentPool.totalCollected + taxCollected,
    totalPaidOut: currentPool.totalPaidOut + compensationPaid,
  };
}
