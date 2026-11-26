import React from 'react';
import { RatingDelta } from '../endgame/types';
import { useI18n } from '../i18n/i18nContext';
import { useTheme } from '../theme/themeContext';
import { useModalFocusTrap } from './useModalFocusTrap';

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
  const dialogRef = useModalFocusTrap(true, onClose);

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

  const netDelta = deltaA.netDelta ?? 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
      className="zimm-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="zimm-modal zimm-modal--md" tabIndex={-1}>
        <div className="zimm-modal__header">
          <div>
            <h2
              id="result-modal-title"
              className="zimm-modal__title"
              style={{ color: outcomeColor }}
            >
              {outcomeTitle}
            </h2>
            <p className="zimm-mode-header__desc" style={{ marginTop: 'var(--space-1)' }}>
              {t.result.matchSummary}
            </p>
          </div>
          <button
            type="button"
            className="zimm-modal__close"
            onClick={onClose}
            aria-label={t.common.close}
          >
            {t.common.close}
          </button>
        </div>

        {isHeadToHead && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) 0',
              borderTop: `1px solid ${tokens.borderSubtle}`,
              borderBottom: `1px solid ${tokens.borderSubtle}`,
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: tokens.textMuted }}>
                {t.result.ratingChange}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: netDelta >= 0 ? tokens.statusSuccess : tokens.statusError,
                }}
              >
                {netDelta >= 0 ? `+${netDelta}` : netDelta}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: tokens.textMuted }}>
                {t.result.newRating}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: tokens.brandPrimary,
                }}
              >
                {deltaA.newRating}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: tokens.textPrimary,
            }}
          >
            {t.result.yourPerformance}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-2) var(--space-4)',
            }}
          >
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: tokens.textMuted }}>
                {t.result.solveTime}
              </span>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(deltaA.performance.rawSpeedSeconds)}s
              </div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: tokens.textMuted }}>
                {t.result.expectedTime}
              </span>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(deltaA.performance.expectedBenchmarkSeconds)}s
              </div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: tokens.textMuted }}>
                {t.result.accuracyScore}
              </span>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                x{deltaA.performance.mistakeMultiplier.toFixed(2)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: tokens.textMuted }}>
                {t.result.hintPenalty}
              </span>
              <div
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  color: tokens.statusWarning,
                }}
              >
                x{deltaA.performance.hintMultiplier.toFixed(2)}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 'var(--space-2)',
              paddingTop: 'var(--space-2)',
              borderTop: `1px solid ${tokens.borderSubtle}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: tokens.textPrimary }}>
              {t.result.netPerformance}
            </span>
            <span
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
                color: tokens.brandPrimary,
              }}
            >
              {deltaA.performance.normalizedPerformance.toFixed(3)}
            </span>
          </div>
        </div>

        <div className="zimm-modal__footer">
          <button type="button" className="zimm-btn-secondary" onClick={onClose}>
            {t.common.close}
          </button>
          <button
            type="button"
            className="zimm-btn-primary"
            style={{ width: 'auto' }}
            onClick={onPlayAgain}
          >
            {t.result.playAgain}
          </button>
        </div>
      </div>
    </div>
  );
};
