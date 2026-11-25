import { describe, expect, it } from 'vitest';
import { eventRecorder } from '../../src/fairplay/eventRecorder';
import { purgeExpiredIntegrityData } from '../../src/fairplay/retention';
import { reviewQueueManager } from '../../src/fairplay/reviewQueue';
import { inspectPuzzleSolveMatch, inspectSolveCadence, shouldEscalateToReviewQueue } from '../../src/fairplay/rules';
import { GameplayEvent, PlayerIntegrityRecord } from '../../src/fairplay/types';
import { Digit } from '../../src/timely/types';

describe('Fair Play and Anti-Cheat Escalation Rules', () => {
  it('detects inhuman solve cadence anomaly', () => {
    const baseTime = Date.now();
    // Simulate 10 placements with only 50ms interval between placements (inhuman speed)
    const fakeEvents: GameplayEvent[] = Array.from({ length: 10 }, (_, i) => ({
      id: `evt_${i}`,
      matchId: 'm1',
      playerId: 'cheater_bot',
      eventType: 'digit_placed',
      timestamp: baseTime + i * 50,
      cell: { row: Math.floor(i / 9), col: i % 9 },
      digit: ((i % 9) + 1) as Digit,
    }));

    const signals = inspectSolveCadence(fakeEvents);
    expect(signals.length).toBeGreaterThan(0);
    expect(signals.some((s) => s.type === 'inhuman_speed')).toBe(true);
  });

  it('proves a single fast solve alone is NEVER escalated without multiple anomalies', () => {
    const cleanPlayerRecord: PlayerIntegrityRecord = {
      playerId: 'honest_player',
      totalMatches: 15,
      flaggedMatchesCount: 0,
      anomaliesHistory: [],
      trustScore: 100,
    };

    // Single fast solve triggered
    const singleAnomaly = [
      {
        type: 'inhuman_speed' as const,
        severity: 'high' as const,
        description: 'Fast solve on lucky board.',
        timestamp: Date.now(),
      },
    ];

    // Single anomaly must NOT escalate to review queue!
    const escalateSingle = shouldEscalateToReviewQueue(cleanPlayerRecord, singleAnomaly);
    expect(escalateSingle).toBe(false);

    // Multi-match history with second anomaly DOES escalate
    const suspectPlayerRecord: PlayerIntegrityRecord = {
      playerId: 'suspect_player',
      totalMatches: 15,
      flaggedMatchesCount: 1,
      anomaliesHistory: [singleAnomaly[0]], // Prior anomaly
      trustScore: 80,
    };

    const escalateMultiple = shouldEscalateToReviewQueue(suspectPlayerRecord, singleAnomaly);
    expect(escalateMultiple).toBe(true);
  });

  it('enqueues flagged matches for human review without automated bans', () => {
    const signals = [
      {
        type: 'uniform_burst_cadence' as const,
        severity: 'high' as const,
        description: 'Robotic input cadence detected.',
        timestamp: Date.now(),
      },
    ];

    const entry = reviewQueueManager.enqueueMatch('match_999', 'user_abc', signals);
    expect(entry.status).toBe('pending');
    expect(entry.anomalyScore).toBeGreaterThan(0);

    // Maintainer resolves as verified clean
    const resolved = reviewQueueManager.resolveEntry(entry.id, 'verified_clean', 'admin_1', 'Verified human stream');
    expect(resolved).toBe(true);

    const pending = reviewQueueManager.getPendingEntries();
    expect(pending.some((e) => e.id === entry.id)).toBe(false);
  });

  it('purges telemetry data according to retention policy', () => {
    // Record an event with old timestamp
    const oldEvent = eventRecorder.recordEvent('old_match', 'p1', 'puzzle_assigned');
    oldEvent.timestamp = Date.now() - 35 * 24 * 60 * 60 * 1000; // 35 days ago

    const purgeResult = purgeExpiredIntegrityData({
      eventLogRetentionDays: 30,
      reviewQueueRetentionDays: 90,
    });

    expect(purgeResult.purgedEventsCount).toBeGreaterThanOrEqual(1);
  });
});
