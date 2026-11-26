import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { matchStore } from '../server/matchStore';
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
  const [rating, setRating] = useState<number>(() => matchStore.getUserProfile().rating);

  useEffect(() => {
    setRating(matchStore.getUserProfile().rating);
    return matchStore.subscribe(() => {
      setRating(matchStore.getUserProfile().rating);
    });
  }, []);

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

        <span className="zimm-header__rating" aria-label={`${t.common.rating}: ${rating}`}>
          {t.common.rating} <strong>{rating}</strong>
        </span>
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
        <button type="button" className="zimm-btn-util" onClick={onOpenGuide}>
          {t.nav.rules}
        </button>
        <button type="button" className="zimm-btn-util" onClick={onOpenAbout}>
          {t.nav.about}
        </button>
        <button
          type="button"
          className="zimm-btn-util"
          onClick={toggleLocale}
          aria-label={t.nav.switchLanguage}
        >
          {locale === 'en' ? 'Yorùbá' : 'English'}
        </button>
        <button
          type="button"
          className="zimm-btn-util"
          onClick={toggleTheme}
          aria-label={t.nav.switchTheme}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>
    </header>
  );
};
