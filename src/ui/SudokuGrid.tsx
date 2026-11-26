import React, { useEffect, useRef } from 'react';
import { BoardMatrix } from '../game/types';
import { getPeers } from '../timely/grid';
import { CellCoord, Digit } from '../timely/types';
import { useTheme } from '../theme/themeContext';
import { SudokuCell } from './SudokuCell';

interface SudokuGridProps {
  board: BoardMatrix;
  selectedCell: CellCoord | null;
  completedUnitCells?: Set<string>;
  onSelectCell: (row: number, col: number) => void;
  onDigitInput: (digit: Digit) => void;
  onErase: () => void;
  onUndo?: () => void;
  onToggleNotesMode: () => void;
  onRequestHint?: () => void;
}

export const SudokuGrid: React.FC<SudokuGridProps> = React.memo(({
  board,
  selectedCell,
  completedUnitCells,
  onSelectCell,
  onDigitInput,
  onErase,
  onUndo,
  onToggleNotesMode,
  onRequestHint,
}) => {
  const { tokens } = useTheme();

  const peerKeys = React.useMemo(() => {
    if (!selectedCell) return new Set<string>();
    const peers = getPeers(selectedCell.row, selectedCell.col);
    return new Set(peers.map((p) => `${p.row},${p.col}`));
  }, [selectedCell]);

  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col].value : 0;

  const latestRef = useRef({
    selectedCell,
    onSelectCell,
    onDigitInput,
    onErase,
    onUndo,
    onToggleNotesMode,
    onRequestHint,
  });
  latestRef.current = {
    selectedCell,
    onSelectCell,
    onDigitInput,
    onErase,
    onUndo,
    onToggleNotesMode,
    onRequestHint,
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const {
        selectedCell: cell,
        onSelectCell: selectCell,
        onDigitInput: digitInput,
        onErase: erase,
        onUndo: undo,
        onToggleNotesMode: toggleNotes,
        onRequestHint: requestHint,
      } = latestRef.current;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (undo) {
          undo();
          e.preventDefault();
        }
        return;
      }

      if (!cell) {
        if (e.key.startsWith('Arrow')) {
          selectCell(0, 0);
          e.preventDefault();
        }
        return;
      }

      const { row, col } = cell;

      switch (e.key) {
        case 'ArrowUp':
          selectCell((row + 8) % 9, col);
          e.preventDefault();
          break;
        case 'ArrowDown':
          selectCell((row + 1) % 9, col);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          selectCell(row, (col + 8) % 9);
          e.preventDefault();
          break;
        case 'ArrowRight':
          selectCell(row, (col + 1) % 9);
          e.preventDefault();
          break;
        case 'Backspace':
        case 'Delete':
        case '0':
          erase();
          e.preventDefault();
          break;
        case 'n':
        case 'N':
          toggleNotes();
          e.preventDefault();
          break;
        case 'u':
        case 'U':
          if (undo) {
            undo();
            e.preventDefault();
          }
          break;
        case 'h':
        case 'H':
          if (requestHint) {
            requestHint();
            e.preventDefault();
          }
          break;
        default:
          if (/^[1-9]$/.test(e.key)) {
            digitInput(parseInt(e.key, 10) as Digit);
            e.preventDefault();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGridFocus = () => {
    if (!selectedCell) {
      onSelectCell(0, 0);
    }
  };

  return (
    <div
      role="grid"
      tabIndex={0}
      aria-label="Sudoku Board"
      onFocus={handleGridFocus}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(9, 1fr)',
        width: '100%',
        aspectRatio: '1 / 1',
        border: `2px solid ${tokens.borderStrong}`,
        backgroundColor: tokens.bgElevated,
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {board.map((rowArr, r) =>
        rowArr.map((cell, c) => {
          const isSelected = selectedCell?.row === r && selectedCell?.col === c;
          const isPeer = peerKeys.has(`${r},${c}`);
          const isSameDigit = selectedValue !== 0 && cell.value === selectedValue;
          const isUnitCompleted = completedUnitCells?.has(`${r},${c}`) ?? false;

          return (
            <SudokuCell
              key={`${r}-${c}`}
              cell={cell}
              isSelected={isSelected}
              isPeerOfSelected={isPeer}
              isSameDigitAsSelected={isSameDigit}
              isUnitCompleted={isUnitCompleted}
              onClick={onSelectCell}
            />
          );
        })
      )}
    </div>
  );
});
