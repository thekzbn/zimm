import React, { useEffect } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { useTheme } from '../theme/themeContext';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
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
          maxWidth: '620px',
          width: '100%',
          maxHeight: '88vh',
          overflowY: 'auto',
          border: `1px solid ${tokens.borderSubtle}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 8px 28px rgba(33, 25, 20, 0.28)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <h2
              id="guide-modal-title"
              style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: tokens.textPrimary }}
            >
              {t.rules.title}
            </h2>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: tokens.textMuted }}>
              {t.rules.intro}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            style={{
              background: 'none',
              border: `1px solid ${tokens.borderSubtle}`,
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: tokens.textMuted,
              cursor: 'pointer',
              padding: '0.3rem 0.6rem',
              flexShrink: 0,
            }}
          >
            {t.common.close}
          </button>
        </div>

        {/* Mode comparison summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.65rem',
          }}
        >
          {[
            { title: t.modes.soloTitle, badge: t.modes.soloBadge, desc: t.modes.soloSubtitle, rated: false },
            { title: t.modes.liveTitle, badge: t.modes.liveBadge, desc: t.modes.liveSubtitle, rated: true },
            { title: t.modes.asyncTitle, badge: t.modes.asyncBadge, desc: t.modes.asyncSubtitle, rated: true },
          ].map((m) => (
            <div
              key={m.title}
              style={{
                backgroundColor: tokens.bgSecondary,
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${tokens.borderSubtle}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.88rem', color: tokens.textPrimary }}>{m.title}</strong>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: m.rated ? tokens.brandPrimary : tokens.bgElevated,
                    color: m.rated ? '#ffffff' : tokens.textMuted,
                    border: m.rated ? 'none' : `1px solid ${tokens.borderSubtle}`,
                  }}
                >
                  {m.badge}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.4, color: tokens.textMuted }}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sections.map((section) => (
            <div
              key={section.title}
              style={{
                backgroundColor: tokens.bgSecondary,
                padding: '0.85rem 1rem',
                borderRadius: '6px',
                border: `1px solid ${tokens.borderSubtle}`,
              }}
            >
              <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.98rem', color: tokens.brandPrimary }}>
                {section.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5, color: tokens.textPrimary }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: tokens.textMuted }}>
          {t.game.shortcutsHelp}
        </div>
      </div>
    </div>
  );
};
