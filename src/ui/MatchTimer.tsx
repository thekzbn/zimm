import React from 'react';
import { useTheme } from '../theme/themeContext';

interface MatchTimerProps {
  seconds: number;
  label?: string;
}

export const MatchTimer: React.FC<MatchTimerProps> = ({ seconds, label }) => {
  const { tokens } = useTheme();

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        backgroundColor: tokens.bgSecondary,
        padding: '0.35rem 0.75rem',
        borderRadius: '4px',
        border: `1px solid ${tokens.borderSubtle}`,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span style={{ fontSize: '0.9rem' }}>⏱️</span>
      {label && (
        <span style={{ fontSize: '0.8rem', color: tokens.textMuted, fontWeight: 500 }}>
          {label}:
        </span>
      )}
      <span
        style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: tokens.textPrimary,
          letterSpacing: '0.02em',
        }}
      >
        {formatted}
      </span>
    </div>
  );
};
