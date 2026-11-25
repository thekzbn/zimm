import React, { useState } from 'react';
import { reviewQueueManager } from '../fairplay/reviewQueue';
import { ReviewQueueEntry } from '../fairplay/types';
import { useI18n } from '../i18n/i18nContext';
import { useTheme } from '../theme/themeContext';

export const ReviewQueueView: React.FC = () => {
  const { tokens } = useTheme();
  const { t } = useI18n();

  const [entries, setEntries] = useState<ReviewQueueEntry[]>(() =>
    reviewQueueManager.getAllEntries()
  );

  const handleResolve = (
    entryId: string,
    resolution: 'verified_clean' | 'confirmed_abuse' | 'dismissed'
  ) => {
    reviewQueueManager.resolveEntry(entryId, resolution, 'maintainer_admin');
    setEntries(reviewQueueManager.getAllEntries());
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
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: tokens.textPrimary }}>
          {t.maintainer.reviewQueueTitle}
        </h3>
        <span
          style={{
            fontSize: '0.8rem',
            backgroundColor: tokens.bgSecondary,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            color: tokens.textMuted,
          }}
        >
          {entries.length} items
        </span>
      </div>

      {entries.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: tokens.textMuted,
            fontSize: '0.9rem',
          }}
        >
          {t.maintainer.noFlaggedMatches}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                backgroundColor: tokens.bgSecondary,
                padding: '0.85rem 1rem',
                borderRadius: '6px',
                border: `1px solid ${tokens.borderSubtle}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: tokens.brandPrimary }}>
                    Match: {entry.matchId}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: tokens.textMuted, marginLeft: '0.5rem' }}>
                    Player: {entry.playerId}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor:
                      entry.status === 'pending'
                        ? tokens.bgError
                        : tokens.bgElevated,
                    color:
                      entry.status === 'pending'
                        ? tokens.statusError
                        : tokens.textMuted,
                  }}
                >
                  {entry.status.toUpperCase()} (Score: {entry.anomalyScore})
                </div>
              </div>

              {/* Signals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {entry.signals.map((sig, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      fontSize: '0.78rem',
                      color: tokens.textSecondary,
                      lineHeight: 1.3,
                    }}
                  >
                    • <strong>{sig.type}</strong>: {sig.description}
                  </div>
                ))}
              </div>

              {/* Actions */}
              {entry.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button
                    onClick={() => handleResolve(entry.id, 'verified_clean')}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '4px',
                      backgroundColor: tokens.statusSuccess,
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {t.maintainer.markReviewed}
                  </button>
                  <button
                    onClick={() => handleResolve(entry.id, 'dismissed')}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '4px',
                      backgroundColor: tokens.bgElevated,
                      color: tokens.textPrimary,
                      border: `1px solid ${tokens.borderSubtle}`,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {t.maintainer.dismiss}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
