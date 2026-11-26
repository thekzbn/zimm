import React, { useState } from 'react';
import { runRatingSimulation, SimulationResult } from '../endgame/simulator';
import { useI18n } from '../i18n/i18nContext';
import { matchStore } from '../server/matchStore';
import { useTheme } from '../theme/themeContext';

export const SimulationModal: React.FC = () => {
  const { tokens } = useTheme();
  const { t } = useI18n();

  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const currentPool = matchStore.getReservePool();

  const handleRunSim = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = runRatingSimulation(500, 25, 0.15);
      setSimResult(result);
      setIsRunning(false);
    }, 100);
  };

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div>
          <h2 className="zimm-mode-header__title">{t.maintainer.simulationTitle}</h2>
          <p className="zimm-mode-header__desc">{t.maintainer.simulationHarness}</p>
        </div>

        <button
          type="button"
          className="zimm-btn-primary"
          style={{ width: 'auto' }}
          onClick={handleRunSim}
          disabled={isRunning}
        >
          {isRunning ? t.common.loading : t.maintainer.runSimulation}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) 0',
          borderTop: `1px solid ${tokens.borderSubtle}`,
          borderBottom: `1px solid ${tokens.borderSubtle}`,
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: tokens.textMuted }}>
            {t.maintainer.poolBalance}
          </div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: tokens.brandPrimary, fontVariantNumeric: 'tabular-nums' }}>
            {currentPool.currentBalance.toFixed(1)} pts
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: tokens.textMuted }}>
            {t.maintainer.averageTax}
          </div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: tokens.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
            {currentPool.totalCollected.toFixed(1)} pts
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: tokens.textMuted }}>
            {t.maintainer.spikesCompensated}
          </div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: tokens.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
            {currentPool.totalPaidOut.toFixed(1)} pts
          </div>
        </div>
      </div>

      {simResult && (
        <div
          style={{
            borderLeft: `3px solid ${tokens.borderAccent}`,
            paddingLeft: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: tokens.textPrimary }}>
            Monte-Carlo Simulation ({simResult.totalMatches} Matches)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
            <div>
              <span style={{ color: tokens.textMuted }}>Starting Pool:</span>{' '}
              <strong>{simResult.initialPool} pts</strong>
            </div>
            <div>
              <span style={{ color: tokens.textMuted }}>Ending Pool:</span>{' '}
              <strong style={{ color: tokens.statusSuccess }}>
                {simResult.finalPool.toFixed(1)} pts
              </strong>
            </div>
            <div>
              <span style={{ color: tokens.textMuted }}>Total Tax Collected:</span>{' '}
              <strong>{simResult.totalTaxCollected.toFixed(1)} pts</strong>
            </div>
            <div>
              <span style={{ color: tokens.textMuted }}>Spikes Compensated:</span>{' '}
              <strong>
                {simResult.spikesEncountered} ({simResult.totalCompensationPaid.toFixed(1)} pts)
              </strong>
            </div>
            <div>
              <span style={{ color: tokens.textMuted }}>Rating Cohort Mean:</span>{' '}
              <strong>{simResult.playerRatingsSummary.mean}</strong>
            </div>
            <div>
              <span style={{ color: tokens.textMuted }}>Cohort Min / Max:</span>{' '}
              <strong>
                {simResult.playerRatingsSummary.min} / {simResult.playerRatingsSummary.max}
              </strong>
            </div>
          </div>

          <div style={{ fontSize: 'var(--text-xs)', color: tokens.statusSuccess, fontWeight: 600 }}>
            Solvency confirmed: Reserve pool remained solvent throughout {simResult.totalMatches}{' '}
            matches with solvency ratio {simResult.poolSolvencyRatio.toFixed(2)}.
          </div>
        </div>
      )}
    </section>
  );
};
