import React from 'react';
import { BoardCellState } from '../game/types';
import { useTheme } from '../theme/themeContext';
import { PencilNotesDisplay } from './PencilNotesDisplay';

interface SudokuCellProps {
  cell: BoardCellState;
  isSelected: boolean;
  isPeerOfSelected: boolean;
  isSameDigitAsSelected: boolean;
  onClick: (row: number, col: number) => void;
}

export const SudokuCell: React.FC<SudokuCellProps> = React.memo(({
  cell,
  isSelected,
  isPeerOfSelected,
  isSameDigitAsSelected,
  onClick,
}) => {
  const { tokens } = useTheme();

  // Determine border styles for 3x3 block separation
  const borderRight = cell.col % 3 === 2 && cell.col !== 8
    ? `2px solid ${tokens.borderStrong}`
    : `1px solid ${tokens.borderSubtle}`;
  const borderBottom = cell.row % 3 === 2 && cell.row !== 8
    ? `2px solid ${tokens.borderStrong}`
    : `1px solid ${tokens.borderSubtle}`;

  // Background priority: error > hint target > selected > same digit > peer > base
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

  // Digit color
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
      role="gridcell"
      aria-selected={isSelected}
      aria-label={ariaLabel}
      onClick={() => onClick(cell.row, cell.col)}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        backgroundColor,
        border: 'none',
        borderRight,
        borderBottom,
        padding: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        outline: isSelected ? `2px solid ${tokens.borderFocus}` : 'none',
        outlineOffset: '-2px',
        zIndex: isSelected ? 2 : 1,
        transition: 'background-color 0.15s ease',
      }}
    >
      {cell.value !== 0 ? (
        <span
          style={{
            fontSize: '1.45rem',
            fontWeight: cell.isGiven ? 700 : 600,
            color: digitColor,
            fontFamily: 'inherit',
            userSelect: 'none',
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
