import React from 'react';
import { useI18n } from '../i18n/i18nContext';
import { useModalFocusTrap } from './useModalFocusTrap';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMaintainer: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenMaintainer,
}) => {
  const { t } = useI18n();
  const dialogRef = useModalFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="zimm-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="zimm-modal zimm-modal--md" tabIndex={-1}>
        <div className="zimm-modal__header">
          <h2 id="about-modal-title" className="zimm-modal__title">
            {t.about.title}
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

        <p
          style={{
            margin: 0,
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--lh-normal)',
            color: 'var(--color-textPrimary)',
          }}
        >
          {t.about.description}
        </p>

        <div
          style={{
            padding: 'var(--space-3) 0',
            borderTop: '1px solid var(--color-borderSubtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <span style={{ color: 'var(--color-textMuted)' }}>{t.about.licenceLabel}</span>
            <span style={{ color: 'var(--color-textPrimary)', fontWeight: 600, textAlign: 'right' }}>
              {t.about.licenceValue}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <span style={{ color: 'var(--color-textMuted)' }}>{t.about.sourceLabel}</span>
            <a
              href="https://github.com/thekzbn/zimm"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--color-brandPrimary)', fontWeight: 600 }}
            >
              {t.about.sourceValue}
            </a>
          </div>
        </div>

        <div
          className="zimm-modal__footer"
          style={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <button
            type="button"
            className="zimm-btn-util"
            onClick={() => {
              onClose();
              onOpenMaintainer();
            }}
          >
            {t.about.maintainerTools}
          </button>
          <button
            type="button"
            className="zimm-btn-primary"
            style={{ width: 'auto' }}
            onClick={onClose}
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
