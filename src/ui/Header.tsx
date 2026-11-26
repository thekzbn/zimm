import React from 'react';
import { useI18n } from '../i18n/i18nContext';
import { useTheme } from '../theme/themeContext';

export type GameModeTab = 'home' | 'live' | 'async' | 'solo';

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
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="zimm-header">
      <div className="zimm-header__top">
        <button
          type="button"
          className="zimm-header__brand"
          onClick={() => onSelectMode('home')}
          aria-label={t.nav.home}
        >
          <span className="zimm-header__mark" aria-hidden="true">
            Z
          </span>
          <h1 className="zimm-header__wordmark">{t.common.appName}</h1>
        </button>
      </div>

      <nav className="zimm-nav" aria-label="Game modes">
        <button
          type="button"
          className="zimm-nav__tab"
          onClick={() => onSelectMode('home')}
          aria-current={activeMode === 'home' ? 'page' : undefined}
        >
          {t.nav.home}
        </button>
        <button
          type="button"
          className="zimm-nav__tab"
          onClick={() => onSelectMode('live')}
          aria-current={activeMode === 'live' ? 'page' : undefined}
        >
          {t.nav.liveH2H}
        </button>
        <button
          type="button"
          className="zimm-nav__tab"
          onClick={() => onSelectMode('async')}
          aria-current={activeMode === 'async' ? 'page' : undefined}
        >
          {t.nav.asyncH2H}
        </button>
        <button
          type="button"
          className="zimm-nav__tab"
          onClick={() => onSelectMode('solo')}
          aria-current={activeMode === 'solo' ? 'page' : undefined}
        >
          {t.nav.solo}
        </button>
      </nav>

      <div className="zimm-header__utils">
        <button
          type="button"
          className="zimm-icon-btn"
          onClick={onOpenGuide}
          aria-label={t.nav.rules}
          title={t.nav.rules}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        <button
          type="button"
          className="zimm-icon-btn"
          onClick={onOpenAbout}
          aria-label={t.nav.about}
          title={t.nav.about}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>

        <button
          type="button"
          className="zimm-icon-btn"
          onClick={toggleLocale}
          aria-label={t.nav.switchLanguage}
          title={locale === 'en' ? 'Yorùbá' : 'English'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </button>

        <button
          type="button"
          className="zimm-icon-btn"
          onClick={toggleTheme}
          aria-label={t.nav.switchTheme}
          title={theme === 'light' ? 'Dark' : 'Light'}
        >
          {theme === 'light' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
