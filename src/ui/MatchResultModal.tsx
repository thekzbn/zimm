import React from 'react';
import { RatingDelta } from '../endgame/types';
import { useI18n } from '../i18n/i18nContext';
import { useTheme } from '../theme/themeContext';

interface MatchResultModalProps {
  deltaA: RatingDelta;
  deltaB?: RatingDelta;
  onPlayAgain: () => void;
  onClose: () => void;
  isHeadToHead: boolean;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  deltaA,
  onPlayAgain,
  onClose,
  isHeadToHead,
}) => {
  const { tokens } = useTheme();
  const { t } = useI18n();

  const outcomeTitle =
    deltaA.outcome === 'win'
      ? t.result.victory
      : deltaA.outcome === 'loss'
      ? t.result.defeat
      : t.result.draw;

  const outcomeColor =
    deltaA.outcome === 'win'
      ? tokens.statusSuccess
      : deltaA.outcome === 'loss'
      ? tokens.statusError
      : tokens.statusWarning;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(33, 25, 20, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 100,
      }}
    >
      <div
        style={{
          backgroundColor: tokens.bgElevated,
          borderRadius: '8px',
          padding: '1.75rem',
          maxWidth: '480px',
          width: '100%',

          border: `1px solid ${tokens.borderAccent}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '1.8rem',
              fontWeight: 800,
              color: outcomeColor,
              letterSpacing: '-0.02em',
            }}
          >
            {outcomeTitle}
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: tokens.textMuted }}>
            {t.result.matchSummary}
          </p>
        </div>

        {/* Rating adjustment banner (for H2H) */}
        {isHeadToHead && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              backgroundColor: tokens.bgSecondary,
              padding: '0.85rem',
              borderRadius: '6px',
              border: `1px solid ${tokens.borderSubtle}`,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: tokens.textMuted }}>
                {t.result.ratingChange}
              </div>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: deltaA.netDelta >= 0 ? tokens.statusSuccess : tokens.statusError,
                }}
              >
                {deltaA.netDelta >= 0 ? `+${deltaA.netDelta}` : deltaA.netDelta}
              </div>
            </div>
            <div style={{ height: '2rem', width: '1px', backgroundColor: tokens.borderSubtle }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: tokens.textMuted }}>
                {t.result.newRating}
              </div>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: tokens.brandPrimary,
                }}
              >
                {deltaA.newRating}
              </div>
            </div>
          </div>
        )}

        {/* Difficulty-adjusted performance breakdown table */}
        <div
          style={{
            backgroundColor: tokens.bgSecondary,
            padding: '1rem',
            borderRadius: '6px',
            border: `1px solid ${tokens.borderSubtle}`,
          }}
        >
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: tokens.textPrimary,
              marginBottom: '0.65rem',
            }}
          >
            {t.result.yourPerformance}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: tokens.textMuted }}>
                {t.result.solveTime}:
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: tokens.textPrimary }}>
                {Math.round(deltaA.performance.rawSpeedSeconds)}s
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: tokens.textMuted }}>
                {t.result.expectedTime}:
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: tokens.textPrimary }}>
                {Math.round(deltaA.performance.expectedBenchmarkSeconds)}s
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: tokens.textMuted }}>
                {t.result.accuracyScore}:
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: tokens.textPrimary }}>
                x{deltaA.performance.mistakeMultiplier.toFixed(2)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: tokens.textMuted }}>
                {t.result.hintPenalty}:
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: tokens.statusWarning }}>
                x{deltaA.performance.hintMultiplier.toFixed(2)}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '0.75rem',
              paddingTop: '0.5rem',
              borderTop: `1px solid ${tokens.borderSubtle}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: tokens.textPrimary }}>
              {t.result.netPerformance}:
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: tokens.brandPrimary }}>
              {deltaA.performance.normalizedPerformance.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '4px',
              border: `1px solid ${tokens.borderSubtle}`,
              backgroundColor: tokens.bgSecondary,
              color: tokens.textPrimary,
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {t.common.close}
          </button>
          <button
            onClick={onPlayAgain}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '4px',
              backgroundColor: tokens.brandPrimary,
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {t.result.playAgain}
          </button>
        </div>
      </div>
    </div>
  );
};
