import React from 'react';
import { useI18n } from '../i18n/i18nContext';
import { useModalFocusTrap } from './useModalFocusTrap';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const dialogRef = useModalFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  const modes = [
    { title: t.modes.soloTitle, badge: t.modes.soloBadge, desc: t.modes.soloSubtitle },
    { title: t.modes.liveTitle, badge: t.modes.liveBadge, desc: t.modes.liveSubtitle },
    { title: t.modes.asyncTitle, badge: t.modes.asyncBadge, desc: t.modes.asyncSubtitle },
  ];

  const sections = [
    { title: t.rules.differentPuzzlesTitle, body: t.rules.differentPuzzlesBody },
    { title: t.rules.pencilNotesTitle, body: t.rules.pencilNotesBody },
    { title: t.rules.hintsTitle, body: t.rules.hintsBody },
    { title: t.rules.scoringTitle, body: t.rules.scoringBody },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
      className="zimm-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className="zimm-modal zimm-modal--lg" tabIndex={-1}>
        <div className="zimm-modal__header">
          <div>
            <h2 id="guide-modal-title" className="zimm-modal__title">
              {t.rules.title}
            </h2>
            <p className="zimm-mode-header__desc" style={{ marginTop: 'var(--space-1)' }}>
              {t.rules.intro}
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) 0',
            borderTop: '1px solid var(--color-borderSubtle)',
            borderBottom: '1px solid var(--color-borderSubtle)',
          }}
        >
          {modes.map((m) => (
            <div key={m.title}>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: 'var(--color-textPrimary)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                {m.title}{' '}
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-textMuted)' }}>
                  ({m.badge})
                </span>
              </div>
              <p className="zimm-mode-header__desc" style={{ fontSize: 'var(--text-xs)' }}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {sections.map((sec) => (
            <div key={sec.title}>
              <h3
                style={{
                  margin: '0 0 var(--space-1)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 700,
                  color: 'var(--color-textPrimary)',
                }}
              >
                {sec.title}
              </h3>
              <p className="zimm-mode-header__desc">{sec.body}</p>
            </div>
          ))}
        </div>

        <div className="zimm-modal__footer">
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
