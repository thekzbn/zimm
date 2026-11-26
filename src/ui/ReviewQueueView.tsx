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
    <section
      style={{
        paddingTop: 'var(--space-4)',
        borderTop: `1px solid ${tokens.borderSubtle}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 className="zimm-mode-header__title">{t.maintainer.reviewQueueTitle}</h2>
        <span style={{ fontSize: 'var(--text-xs)', color: tokens.textMuted, fontVariantNumeric: 'tabular-nums' }}>
          {entries.length} items
        </span>
      </div>

      {entries.length === 0 ? (
        <div
          style={{
            padding: 'var(--space-6) var(--space-4)',
            textAlign: 'center',
            color: tokens.textMuted,
            fontSize: 'var(--text-sm)',
          }}
        >
          {t.maintainer.noFlaggedMatches}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: 'var(--space-3) 0',
                borderTop: `1px solid ${tokens.borderSubtle}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: tokens.brandPrimary }}>
                    Match: {entry.matchId}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: tokens.textMuted, marginLeft: 'var(--space-2)' }}>
                    Player: {entry.playerId}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: entry.status === 'pending' ? tokens.statusError : tokens.textMuted,
                  }}
                >
                  {entry.status.toUpperCase()} (Score: {entry.anomalyScore})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                {entry.signals.map((sig, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: tokens.textSecondary,
                      lineHeight: 'var(--lh-normal)',
                    }}
                  >
                    <strong>{sig.type}</strong>: {sig.description}
                  </div>
                ))}
              </div>

              {entry.status === 'pending' && (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    className="zimm-btn-primary"
                    style={{ width: 'auto', minHeight: '34px', padding: '6px 12px', fontSize: 'var(--text-xs)' }}
                    onClick={() => handleResolve(entry.id, 'verified_clean')}
                  >
                    {t.maintainer.markReviewed}
                  </button>
                  <button
                    type="button"
                    className="zimm-btn-secondary"
                    style={{ minHeight: '34px', padding: '6px 12px', fontSize: 'var(--text-xs)' }}
                    onClick={() => handleResolve(entry.id, 'dismissed')}
                  >
                    {t.maintainer.dismiss}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
