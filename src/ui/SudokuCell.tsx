import React from 'react';
import { BoardCellState } from '../game/types';
import { useTheme } from '../theme/themeContext';
import { PencilNotesDisplay } from './PencilNotesDisplay';

interface SudokuCellProps {
  cell: BoardCellState;
  isSelected: boolean;
  isPeerOfSelected: boolean;
  isSameDigitAsSelected: boolean;
  isUnitCompleted?: boolean;
  onClick: (row: number, col: number) => void;
}

export const SudokuCell: React.FC<SudokuCellProps> = React.memo(({
  cell,
  isSelected,
  isPeerOfSelected,
  isSameDigitAsSelected,
  isUnitCompleted = false,
  onClick,
}) => {
  const { tokens } = useTheme();

  const borderRight = cell.col % 3 === 2 && cell.col !== 8
    ? `2px solid ${tokens.borderStrong}`
    : `1px solid ${tokens.borderSubtle}`;
  const borderBottom = cell.row % 3 === 2 && cell.row !== 8
    ? `2px solid ${tokens.borderStrong}`
    : `1px solid ${tokens.borderSubtle}`;

  let backgroundColor = tokens.bgElevated;
  if (cell.isError) {
    backgroundColor = tokens.bgError;
  } else if (cell.isHintTarget) {
    backgroundColor = tokens.bgHighlight;
  } else if (isSelected) {
    backgroundColor = tokens.bgSelected;
  } else if (isSameDigitAsSelected && cell.value !== 0) {
    backgroundColor = tokens.bgHighlight;
  } else if (isPeerOfSelected) {
    backgroundColor = tokens.bgPeer;
  }

  let digitColor = tokens.digitPlayer;
  if (cell.isGiven) {
    digitColor = tokens.digitGiven;
  } else if (cell.isError) {
    digitColor = tokens.digitError;
  }

  const notesLabel = cell.notes.size > 0 ? `, notes ${Array.from(cell.notes).sort().join(' ')}` : '';
  const ariaLabel = `Row ${cell.row + 1}, Column ${cell.col + 1}${
    cell.value !== 0 ? `, value ${cell.value}` : `, empty${notesLabel}`
  }`;

  return (
    <button
      type="button"
      role="gridcell"
      tabIndex={-1}
      aria-selected={isSelected}
      aria-label={ariaLabel}
      className={isUnitCompleted ? 'zimm-cell--unit-complete' : undefined}
      onClick={() => onClick(cell.row, cell.col)}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        backgroundColor,
        border: 'none',
        borderRight: cell.col === 8 ? 'none' : borderRight,
        borderBottom: cell.row === 8 ? 'none' : borderBottom,
        padding: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        outline: isSelected ? `2px solid ${tokens.borderFocus}` : 'none',
        outlineOffset: '-2px',
        zIndex: isSelected ? 2 : 1,
        transition: 'background-color 0.15s cubic-bezier(0.57, -0.01, 0.21, 0.89)',
        animationDelay: isUnitCompleted ? `${((cell.row + cell.col) % 9) * 20}ms` : undefined,
      }}
    >
      {cell.value !== 0 ? (
        <span
          style={{
            fontSize: 'var(--text-digit)',
            fontWeight: cell.isGiven ? 700 : 600,
            color: digitColor,
            fontFamily: 'inherit',
            fontVariantNumeric: 'tabular-nums',
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          {cell.value}
        </span>
      ) : (
        <PencilNotesDisplay notes={cell.notes} />
      )}
    </button>
  );
});
