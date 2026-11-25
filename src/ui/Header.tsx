import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { matchStore } from '../server/matchStore';
import { useTheme } from '../theme/themeContext';

export type GameModeTab = 'solo' | 'live' | 'async';

interface HeaderProps {
  activeMode: GameModeTab;
  onSelectMode: (mode: GameModeTab) => void;
  onOpenGuide: () => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  onSelectMode,
  onOpenGuide,
  onOpenAbout,
}) => {
  const { t, locale, toggleLocale } = useI18n();
  const { theme, toggleTheme, tokens } = useTheme();
  const [rating, setRating] = useState<number>(() => matchStore.getUserProfile().rating);

  useEffect(() => {
    setRating(matchStore.getUserProfile().rating);
    return matchStore.subscribe(() => {
      setRating(matchStore.getUserProfile().rating);
    });
  }, []);

  const navButtonStyle = (isActive: boolean, isPrimary = false): React.CSSProperties => ({
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    border: isActive
      ? `1px solid ${isPrimary ? tokens.brandPrimary : tokens.borderStrong}`
      : `1px solid transparent`,
    backgroundColor: isActive
      ? isPrimary
        ? tokens.brandPrimary
        : tokens.bgSelected
      : 'transparent',
    color: isActive && isPrimary ? '#ffffff' : tokens.textPrimary,
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.85rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  });

  const utilityButtonStyle: React.CSSProperties = {
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    border: `1px solid ${tokens.borderSubtle}`,
    backgroundColor: tokens.bgSecondary,
    color: tokens.textPrimary,
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  return (
    <header
      style={{
        backgroundColor: tokens.bgElevated,
        borderBottom: `1px solid ${tokens.borderSubtle}`,
        padding: '0.6rem 1rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}
    >
      {/* Brand and Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            aria-hidden="true"
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '6px',
              backgroundColor: tokens.brandPrimary,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '-0.03em',
            }}
          >
            Z
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.15rem',
              fontWeight: 700,
              color: tokens.textPrimary,
              lineHeight: 1.1,
            }}
          >
            {t.common.appName}
          </h1>
        </div>

        <div
          aria-label={`${t.common.rating}: ${rating}`}
          style={{
            backgroundColor: tokens.bgSecondary,
            border: `1px solid ${tokens.borderSubtle}`,
            padding: '0.2rem 0.55rem',
            borderRadius: '4px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: tokens.textMuted,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {t.common.rating}{' '}
          <span style={{ color: tokens.textPrimary, fontWeight: 700 }}>{rating}</span>
        </div>
      </div>

      {/* Primary Game Modes */}
      <nav aria-label="Game modes" style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => onSelectMode('solo')}
          aria-current={activeMode === 'solo' ? 'page' : undefined}
          style={navButtonStyle(activeMode === 'solo', true)}
        >
          {t.nav.solo}
        </button>
        <button
          onClick={() => onSelectMode('live')}
          aria-current={activeMode === 'live' ? 'page' : undefined}
          style={navButtonStyle(activeMode === 'live')}
        >
          {t.nav.liveH2H}
        </button>
        <button
          onClick={() => onSelectMode('async')}
          aria-current={activeMode === 'async' ? 'page' : undefined}
          style={navButtonStyle(activeMode === 'async')}
        >
          {t.nav.asyncH2H}
        </button>
      </nav>

      {/* Utility Controls: Guide, About, Language, Theme */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={onOpenGuide} style={utilityButtonStyle}>
          {t.nav.rules}
        </button>
        <button onClick={onOpenAbout} style={utilityButtonStyle}>
          {t.nav.about}
        </button>
        <button
          onClick={toggleLocale}
          aria-label={t.nav.switchLanguage}
          style={utilityButtonStyle}
        >
          {locale === 'en' ? 'Yorùbá' : 'English'}
        </button>
        <button
          onClick={toggleTheme}
          aria-label={t.nav.switchTheme}
          style={utilityButtonStyle}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>
    </header>
  );
};
