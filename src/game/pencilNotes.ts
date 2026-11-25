import { getPeers } from '../timely/grid';
import { Digit } from '../timely/types';
import { BoardMatrix } from './types';

/**
 * Manages player-entered pencil notes (scratch candidate marks).
 *
 * Invariant: Pencil notes are strictly isolated scratchpad marks.
 * Adding, toggling, editing, or clearing notes NEVER counts as a move,
 * NEVER triggers a mistake, NEVER counts as a hint, and NEVER affects rating.
 */

export function toggleCellNote(board: BoardMatrix, row: number, col: number, digit: Digit): BoardMatrix {
  const cell = board[row][col];
  if (cell.isGiven || cell.value !== 0) {
    return board; // Notes cannot be placed on given or committed cells
  }

  const updatedNotes = new Set(cell.notes);
  if (updatedNotes.has(digit)) {
    updatedNotes.delete(digit);
  } else {
    updatedNotes.add(digit);
  }

  return board.map((r, rIdx) =>
    r.map((c, cIdx) => {
      if (rIdx === row && cIdx === col) {
        return { ...c, notes: updatedNotes };
      }
      return c;
    })
  );
}

export function clearCellNotes(board: BoardMatrix, row: number, col: number): BoardMatrix {
  return board.map((r, rIdx) =>
    r.map((c, cIdx) => {
      if (rIdx === row && cIdx === col) {
        return { ...c, notes: new Set<Digit>() };
      }
      return c;
    })
  );
}

/**
 * Automatically removes candidate digit from pencil notes of all peer cells
 * when a cell value is committed.
 */
export function prunePeerNotes(board: BoardMatrix, row: number, col: number, committedDigit: Digit): BoardMatrix {
  const peers = getPeers(row, col);
  const peerKeys = new Set(peers.map((p) => `${p.row},${p.col}`));

  return board.map((r, rIdx) =>
    r.map((c, cIdx) => {
      if (peerKeys.has(`${rIdx},${cIdx}`) && c.notes.has(committedDigit)) {
        const nextNotes = new Set(c.notes);
        nextNotes.delete(committedDigit);
        return { ...c, notes: nextNotes };
      }
      return c;
    })
  );
}
