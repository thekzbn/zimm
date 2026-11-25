import { describe, expect, it } from 'vitest';
import { initializeBoard } from '../../src/game/boardState';
import { clearCellNotes, prunePeerNotes, toggleCellNote } from '../../src/game/pencilNotes';
import { createEmptyGrid } from '../../src/timely/grid';
import { Digit } from '../../src/timely/types';

describe('Pencil Notes Strict Isolation and Candidate Management', () => {
  it('allows adding, toggling, and clearing notes on uncommitted cells', () => {
    const grid = createEmptyGrid();
    let board = initializeBoard(grid);

    // Toggle note 3 into cell (0, 0)
    board = toggleCellNote(board, 0, 0, 3 as Digit);
    expect(board[0][0].notes.has(3)).toBe(true);

    // Toggle note 7 into cell (0, 0)
    board = toggleCellNote(board, 0, 0, 7 as Digit);
    expect(board[0][0].notes.has(3)).toBe(true);
    expect(board[0][0].notes.has(7)).toBe(true);

    // Toggle note 3 off
    board = toggleCellNote(board, 0, 0, 3 as Digit);
    expect(board[0][0].notes.has(3)).toBe(false);
    expect(board[0][0].notes.has(7)).toBe(true);

    // Clear cell notes
    board = clearCellNotes(board, 0, 0);
    expect(board[0][0].notes.size).toBe(0);
  });

  it('prohibits notes on given clues or committed cells', () => {
    const grid = createEmptyGrid();
    grid[0][0] = 5; // Given cell
    let board = initializeBoard(grid);

    board = toggleCellNote(board, 0, 0, 9 as Digit);
    expect(board[0][0].notes.size).toBe(0);
  });

  it('prunes notes from peer cells when digit is committed', () => {
    const grid = createEmptyGrid();
    let board = initializeBoard(grid);

    // Place note 4 in row 0 col 1 and row 0 col 2 (both peers of 0,0)
    board = toggleCellNote(board, 0, 1, 4 as Digit);
    board = toggleCellNote(board, 0, 2, 4 as Digit);
    // Also place note 4 in row 5 col 5 (not a peer of 0,0)
    board = toggleCellNote(board, 5, 5, 4 as Digit);

    expect(board[0][1].notes.has(4)).toBe(true);
    expect(board[0][2].notes.has(4)).toBe(true);
    expect(board[5][5].notes.has(4)).toBe(true);

    // Commit digit 4 to (0, 0)
    board = prunePeerNotes(board, 0, 0, 4 as Digit);

    // Peers must have note 4 pruned
    expect(board[0][1].notes.has(4)).toBe(false);
    expect(board[0][2].notes.has(4)).toBe(false);
    // Non-peer retains note 4
    expect(board[5][5].notes.has(4)).toBe(true);
  });
});
