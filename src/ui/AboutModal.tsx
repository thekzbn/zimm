import React, { useEffect } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { useTheme } from '../theme/themeContext';

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
  const { tokens } = useTheme();
  const { t } = useI18n();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
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
        zIndex: 110,
      }}
    >
      <div
        style={{
          backgroundColor: tokens.bgElevated,
          borderRadius: '8px',
          padding: '1.5rem',
          maxWidth: '460px',
          width: '100%',
          border: `1px solid ${tokens.borderSubtle}`,

          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2
            id="about-modal-title"
            style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: tokens.textPrimary }}
          >
            {t.about.title}
          </h2>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            style={{
              background: 'none',
              border: `1px solid ${tokens.borderSubtle}`,
              borderRadius: '4px',
              fontSize: '0.9rem',
              color: tokens.textMuted,
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
            }}
          >
            {t.common.close}
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: tokens.textPrimary }}>
          {t.about.description}
        </p>

        <div
          style={{
            backgroundColor: tokens.bgSecondary,
            padding: '0.85rem',
            borderRadius: '6px',
            border: `1px solid ${tokens.borderSubtle}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ color: tokens.textMuted }}>{t.about.licenceLabel}</span>
            <span style={{ color: tokens.textPrimary, fontWeight: 600, textAlign: 'right' }}>
              {t.about.licenceValue}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ color: tokens.textMuted }}>{t.about.sourceLabel}</span>
            <a
              href="https://github.com/thekzbn/zimm"
              target="_blank"
              rel="noreferrer"
              style={{ color: tokens.brandPrimary, fontWeight: 600 }}
            >
              {t.about.sourceValue}
            </a>
          </div>
        </div>

        <div
          style={{
            borderTop: `1px solid ${tokens.borderSubtle}`,
            paddingTop: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => {
              onClose();
              onOpenMaintainer();
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.25rem 0',
              color: tokens.textMuted,
              fontSize: '0.8rem',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            {t.about.maintainerTools}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: tokens.brandPrimary,
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
