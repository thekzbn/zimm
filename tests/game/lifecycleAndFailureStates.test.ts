import { describe, expect, it } from 'vitest';
import { canTransitionMatch } from '../../src/game/lifecycle';
import { validatePlayerPlacement } from '../../src/game/moveValidator';
import { initializeBoard } from '../../src/game/boardState';
import { createEmptyGrid } from '../../src/timely/grid';
import { Digit } from '../../src/timely/types';

describe('Game Lifecycle and Failure States', () => {
  it('enforces legal match lifecycle state transitions', () => {
    // Legal path: idle -> waiting -> ready -> playing -> completed
    expect(canTransitionMatch('idle', 'waiting').allowed).toBe(true);
    expect(canTransitionMatch('waiting', 'ready').allowed).toBe(true);
    expect(canTransitionMatch('ready', 'playing').allowed).toBe(true);
    expect(canTransitionMatch('playing', 'completed').allowed).toBe(true);

    // Illegal jump: idle cannot directly become completed
    expect(canTransitionMatch('idle', 'completed').allowed).toBe(false);

    // Terminal states cannot transition further
    expect(canTransitionMatch('completed', 'playing').allowed).toBe(false);
    expect(canTransitionMatch('forfeited', 'ready').allowed).toBe(false);
    expect(canTransitionMatch('abandoned', 'playing').allowed).toBe(false);
  });

  it('handles forfeits and abandonment gracefully', () => {
    expect(canTransitionMatch('playing', 'forfeited').allowed).toBe(true);
    expect(canTransitionMatch('playing', 'abandoned').allowed).toBe(true);
    expect(canTransitionMatch('waiting', 'abandoned').allowed).toBe(true);
  });

  it('rejects invalid moves on given cells and detects mistakes', () => {
    const grid = createEmptyGrid();
    grid[0][0] = 5; // Given clue
    const solutionGrid = createEmptyGrid();
    solutionGrid[0][0] = 5;
    solutionGrid[0][1] = 8; // Solution for (0, 1) is 8

    const board = initializeBoard(grid);

    // Attempting to overwrite given cell (0, 0)
    const givenCheck = validatePlayerPlacement(board, solutionGrid, 0, 0, 9 as Digit);
    expect(givenCheck.valid).toBe(false);
    expect(givenCheck.isGiven).toBe(true);

    // Attempting wrong digit 2 on empty cell (0, 1)
    const mistakeCheck = validatePlayerPlacement(board, solutionGrid, 0, 1, 2 as Digit);
    expect(mistakeCheck.valid).toBe(true);
    expect(mistakeCheck.isCorrect).toBe(false);

    // Placing correct digit 8 on empty cell (0, 1)
    const correctCheck = validatePlayerPlacement(board, solutionGrid, 0, 1, 8 as Digit);
    expect(correctCheck.valid).toBe(true);
    expect(correctCheck.isCorrect).toBe(true);
  });
});
