import React, { useMemo, useState } from 'react';
import { initializeBoard } from '../game/boardState';
import { useI18n } from '../i18n/i18nContext';
import { CellCoord, Grid } from '../timely/types';
import { GameModeTab } from './Header';
import { SudokuGrid } from './SudokuGrid';

interface LandingViewProps {
  onSelectMode: (mode: Exclude<GameModeTab, 'home'>) => void;
}

const SHOWCASE_GRID: Grid = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

export const LandingView: React.FC<LandingViewProps> = ({ onSelectMode }) => {
  const { t } = useI18n();
  const board = useMemo(() => initializeBoard(SHOWCASE_GRID), []);
  const [selectedCell, setSelectedCell] = useState<CellCoord | null>({ row: 4, col: 4 });

  return (
    <section className="zimm-landing" aria-label={t.common.appName}>
      <div className="zimm-grid-wrap">
        <SudokuGrid
          board={board}
          selectedCell={selectedCell}
          onSelectCell={(row, col) => setSelectedCell({ row, col })}
          onDigitInput={() => {}}
          onErase={() => {}}
          onToggleNotesMode={() => {}}
        />
      </div>

      <div className="zimm-landing__hero">
        <h2 className="zimm-landing__title">{t.landing.headline}</h2>
        <p className="zimm-landing__subtitle">{t.landing.subtitle}</p>

        <div className="zimm-landing__actions">
          <button
            type="button"
            className="zimm-btn-primary"
            onClick={() => onSelectMode('live')}
          >
            {t.landing.primaryCta}
          </button>

          <div className="zimm-landing__secondary">
            <button
              type="button"
              className="zimm-btn-secondary"
              onClick={() => onSelectMode('async')}
            >
              {t.landing.secondaryAsync}
            </button>
            <button
              type="button"
              className="zimm-btn-secondary"
              onClick={() => onSelectMode('solo')}
            >
              {t.landing.secondarySolo}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
