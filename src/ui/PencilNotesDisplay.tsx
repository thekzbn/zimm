import React from 'react';
import { Digit } from '../timely/types';
import { useTheme } from '../theme/themeContext';

interface PencilNotesDisplayProps {
  notes: Set<Digit>;
}

export const PencilNotesDisplay: React.FC<PencilNotesDisplayProps> = ({ notes }) => {
  const { tokens } = useTheme();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: '100%',
        height: '100%',
        padding: '2px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
        const hasNote = notes.has(num as Digit);
        return (
          <div
            key={num}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-digit-note)',
              fontWeight: 600,
              color: hasNote ? tokens.digitNote : 'transparent',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            {hasNote ? num : ''}
          </div>
        );
      })}
    </div>
  );
};
