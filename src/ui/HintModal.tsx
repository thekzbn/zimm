import React from 'react';
import { useI18n } from '../i18n/i18nContext';
import { StagedHint } from '../timely/types';
import { useTheme } from '../theme/themeContext';
import { useModalFocusTrap } from './useModalFocusTrap';

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
  const dialogRef = useModalFocusTrap(Boolean(hint), onClose);

  if (!hint) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hint-modal-title"
      className="zimm-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="zimm-modal zimm-modal--md" tabIndex={-1}>
        <div className="zimm-modal__header">
          <h2 id="hint-modal-title" className="zimm-modal__title">
            {t.game.hint} ({hintsRemaining} {t.game.hintsRemaining})
          </h2>
          <button
            type="button"
            className="zimm-modal__close"
            onClick={onClose}
            aria-label={t.common.close}
          >
            {t.common.close}
          </button>
        </div>

        <div className="zimm-alert">{t.game.hintCostWarning}</div>

        <div className="zimm-hint-pips" aria-hidden="true">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="zimm-hint-pip"
              style={{
                backgroundColor: s <= currentStage ? tokens.brandPrimary : tokens.borderSubtle,
              }}
            />
          ))}
        </div>

        <div
          style={{
            padding: 'var(--space-3) 0',
            borderTop: `1px solid ${tokens.borderSubtle}`,
            borderBottom: `1px solid ${tokens.borderSubtle}`,
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: tokens.brandPrimary,
              marginBottom: 'var(--space-1)',
            }}
          >
            {currentStage === 1 && t.game.hintStageNudge}
            {currentStage === 2 && t.game.hintStageTechnique}
            {currentStage === 3 && t.game.hintStageDeduction}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--lh-normal)',
              color: tokens.textPrimary,
            }}
          >
            {hint.message[locale]}
          </p>
        </div>

        <div className="zimm-modal__footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          {currentStage < 3 ? (
            <button
              type="button"
              className="zimm-btn-primary"
              style={{ width: 'auto' }}
              onClick={onAdvanceStage}
            >
              Next Stage ({currentStage + 1}/3)
            </button>
          ) : (
            <button
              type="button"
              className="zimm-btn-primary"
              style={{ width: 'auto' }}
              onClick={onClose}
            >
              {t.common.close}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
