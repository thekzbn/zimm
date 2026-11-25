import { describe, expect, it } from 'vitest';
import { runRatingSimulation } from '../../src/endgame/simulator';

describe('Endgame Simulation Stability and Reserve Pool Solvency', () => {
  it('runs a 300-match simulation cohort and proves reserve pool solvency', () => {
    const sim = runRatingSimulation(300, 20, 0.15);

    expect(sim.totalMatches).toBe(300);
    // Reserve pool must remain solvent (balance > 0)
    expect(sim.finalPool).toBeGreaterThan(0);
    expect(sim.poolSolvencyRatio).toBeGreaterThan(1.0);

    // Rating cohort mean should remain stable around default (1200)
    expect(sim.playerRatingsSummary.mean).toBeGreaterThan(1000);
    expect(sim.playerRatingsSummary.mean).toBeLessThan(1400);
  });
});
