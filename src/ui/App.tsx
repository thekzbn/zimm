import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { useTheme } from '../theme/themeContext';
import { AboutModal } from './AboutModal';
import { AsyncMatchView } from './AsyncMatchView';
import { GameModeTab, Header } from './Header';
import { HowToPlayModal } from './HowToPlayModal';
import { LiveMatchView } from './LiveMatchView';
import { ReviewQueueView } from './ReviewQueueView';
import { SimulationModal } from './SimulationModal';
import { SoloGameView } from './SoloGameView';

export const App: React.FC = () => {
  const { tokens } = useTheme();
  const { t } = useI18n();
  const [activeMode, setActiveMode] = useState<GameModeTab>('solo');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
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
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: tokens.bgPrimary,
          color: tokens.textPrimary,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            backgroundColor: tokens.bgElevated,
            borderBottom: `1px solid ${tokens.borderSubtle}`,
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
            {t.maintainer.title}
          </h1>
          <button
            onClick={closeMaintainerConsole}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              border: `1px solid ${tokens.borderSubtle}`,
              backgroundColor: tokens.bgSecondary,
              color: tokens.textPrimary,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.nav.backToGame}
          </button>
        </header>
        <main className="zimm-main">
          <div
            style={{
              maxWidth: '800px',
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <SimulationModal />
            <ReviewQueueView />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: tokens.bgPrimary,
        color: tokens.textPrimary,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      <main className="zimm-main">
        {activeMode === 'solo' && <SoloGameView />}
        {activeMode === 'live' && <LiveMatchView />}
        {activeMode === 'async' && <AsyncMatchView />}
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
