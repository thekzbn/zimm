import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { AboutModal } from './AboutModal';
import { AsyncMatchView } from './AsyncMatchView';
import { ErrorBoundary } from './ErrorBoundary';
import { GameModeTab, Header } from './Header';
import { HowToPlayModal } from './HowToPlayModal';
import { LandingView } from './LandingView';
import { LiveMatchView } from './LiveMatchView';
import { ReviewQueueView } from './ReviewQueueView';
import { SimulationModal } from './SimulationModal';
import { SoloGameView } from './SoloGameView';

export const App: React.FC = () => {
  const { t } = useI18n();
  const [activeMode, setActiveMode] = useState<GameModeTab>('home');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState<number>(0);
  const [isMaintainerRoute, setIsMaintainerRoute] = useState<boolean>(
    () => typeof window !== 'undefined' && window.location.hash === '#maintainer'
  );

  useEffect(() => {
    const handleHashChange = () => {
      setIsMaintainerRoute(window.location.hash === '#maintainer');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openMaintainerConsole = () => {
    window.location.hash = 'maintainer';
    setIsMaintainerRoute(true);
  };

  const closeMaintainerConsole = () => {
    window.location.hash = '';
    setIsMaintainerRoute(false);
  };

  if (isMaintainerRoute) {
    return (
      <div className="zimm-app" style={{ display: 'flex', flexDirection: 'column' }}>
        <header className="zimm-header" style={{ position: 'static', height: 'auto', flexDirection: 'row', borderRight: 'none', borderBottom: '1px solid var(--color-borderSubtle)' }}>
          <h1 className="zimm-header__wordmark">{t.maintainer.title}</h1>
          <button
            type="button"
            className="zimm-btn-util"
            style={{ width: 'auto' }}
            onClick={closeMaintainerConsole}
          >
            {t.nav.backToGame}
          </button>
        </header>
        <main className="zimm-main">
          <div className="zimm-lobby" style={{ maxWidth: '780px' }}>
            <ErrorBoundary
              fallbackTitle={t.common.error}
              fallbackActionLabel={t.game.restart}
              onReset={() => setResetKey((k) => k + 1)}
            >
              <SimulationModal />
              <ReviewQueueView />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="zimm-app">
      <Header
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      <main className="zimm-main">
        <ErrorBoundary
          key={`${activeMode}-${resetKey}`}
          fallbackTitle={t.common.error}
          fallbackActionLabel={t.game.restart}
          onReset={() => setResetKey((k) => k + 1)}
        >
          {activeMode === 'home' && <LandingView onSelectMode={setActiveMode} />}
          {activeMode === 'live' && <LiveMatchView />}
          {activeMode === 'async' && <AsyncMatchView />}
          {activeMode === 'solo' && <SoloGameView />}
        </ErrorBoundary>
      </main>

      <HowToPlayModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenMaintainer={openMaintainerConsole}
      />
    </div>
  );
};
