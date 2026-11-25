import React, { useEffect } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { StagedHint } from '../timely/types';
import { useTheme } from '../theme/themeContext';

interface HintModalProps {
  hint: StagedHint | null;
  currentStage: 1 | 2 | 3;
  onAdvanceStage: () => void;
  onClose: () => void;
  hintsRemaining: number;
}

export const HintModal: React.FC<HintModalProps> = ({
  hint,
  currentStage,
  onAdvanceStage,
  onClose,
  hintsRemaining,
}) => {
  const { tokens } = useTheme();
  const { t, locale } = useI18n();

  useEffect(() => {
    if (!hint) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hint, onClose]);

  if (!hint) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(33, 25, 20, 0.65)',
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
          padding: '1.5rem',
          maxWidth: '440px',
          width: '100%',

          border: `1px solid ${tokens.borderAccent}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '1.15rem',
              fontWeight: 700,
              color: tokens.textPrimary,
            }}
          >
            {t.game.hint} ({hintsRemaining} {t.game.hintsRemaining})
          </h2>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              color: tokens.textMuted,
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Meaningful Performance Cost Warning */}
        <div
          style={{
            backgroundColor: tokens.bgError,
            borderLeft: `4px solid ${tokens.brandPrimary}`,
            padding: '0.65rem 0.85rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: tokens.statusError,
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          ⚠️ {t.game.hintCostWarning}
        </div>

        {/* Stage progress indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: s <= currentStage ? tokens.brandPrimary : tokens.borderSubtle,
              }}
            />
          ))}
        </div>

        {/* Hint content */}
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
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
              color: tokens.brandPrimary,
              marginBottom: '0.35rem',
            }}
          >
            {currentStage === 1 && t.game.hintStageNudge}
            {currentStage === 2 && t.game.hintStageTechnique}
            {currentStage === 3 && t.game.hintStageDeduction}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '0.92rem',
              lineHeight: 1.5,
              color: tokens.textPrimary,
            }}
          >
            {hint.message[locale]}
          </p>
        </div>

        {/* Footer buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {currentStage < 3 ? (
            <button
              onClick={onAdvanceStage}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                backgroundColor: tokens.brandPrimary,
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Next Stage ({currentStage + 1}/3)
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                backgroundColor: tokens.brandPrimary,
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {t.common.close}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
