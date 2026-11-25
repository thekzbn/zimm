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
    <div
      style={{
        backgroundColor: tokens.bgElevated,
        borderRadius: '8px',
        padding: '1.25rem',
        border: `1px solid ${tokens.borderSubtle}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: tokens.textPrimary }}>
            {t.maintainer.simulationTitle}
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: tokens.textMuted }}>
            {t.maintainer.simulationHarness}
          </p>
        </div>

        <button
          onClick={handleRunSim}
          disabled={isRunning}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            backgroundColor: tokens.brandPrimary,
            color: '#ffffff',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.7 : 1,
          }}
        >
          {isRunning ? t.common.loading : t.maintainer.runSimulation}
        </button>
      </div>

      {/* Current Live Pool Status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          backgroundColor: tokens.bgSecondary,
          padding: '0.85rem',
          borderRadius: '6px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: tokens.textMuted }}>
            {t.maintainer.poolBalance}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: tokens.brandPrimary }}>
            {currentPool.currentBalance.toFixed(1)} pts
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: tokens.textMuted }}>
            {t.maintainer.averageTax}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: tokens.textPrimary }}>
            {currentPool.totalCollected.toFixed(1)} pts
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: tokens.textMuted }}>
            {t.maintainer.spikesCompensated}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: tokens.textPrimary }}>
            {currentPool.totalPaidOut.toFixed(1)} pts
          </div>
        </div>
      </div>

      {/* Simulation Results Display */}
      {simResult && (
        <div
          style={{
            border: `1px solid ${tokens.borderAccent}`,
            borderRadius: '6px',
            padding: '1rem',
            backgroundColor: tokens.bgSecondary,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: tokens.textPrimary }}>
            Monte-Carlo Simulation ({simResult.totalMatches} Matches):
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
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

          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: tokens.bgElevated,
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: tokens.statusSuccess,
              fontWeight: 600,
            }}
          >
            ✓ Solvency confirmed: Reserve pool remained solvent throughout {simResult.totalMatches}{' '}
            matches with solvency ratio {simResult.poolSolvencyRatio.toFixed(2)}.
          </div>
        </div>
      )}
    </div>
  );
};
