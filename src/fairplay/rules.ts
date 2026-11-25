import { AnomalySignal, GameplayEvent, PlayerIntegrityRecord } from './types';

/**
 * Evaluates match gameplay events against deterministic, explainable heuristic rules.
 *
 * Principles:
 * - Start with explainable rules, not black-box machine learning.
 * - A single unusually fast solve is never sufficient proof of wrongdoing.
 * - Require multiple independent anomalies across matches before queue escalation.
 */

export function inspectSolveCadence(events: GameplayEvent[]): AnomalySignal[] {
  const signals: AnomalySignal[] = [];

  const placements = events.filter((e) => e.eventType === 'digit_placed');
  if (placements.length < 5) return signals;

  // Measure time intervals between consecutive placements
  const intervals: number[] = [];
  for (let i = 1; i < placements.length; i++) {
    intervals.push(placements[i].timestamp - placements[i - 1].timestamp);
  }

  // 1. Check for superhuman average placement speed (< 250ms per deduction)
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (avgInterval < 250) {
    signals.push({
      type: 'inhuman_speed',
      severity: 'high',
      description: `Inhuman placement pace: average ${Math.round(avgInterval)}ms between deductions.`,
      timestamp: Date.now(),
    });
  }

  // 2. Check for robotic cadence (near-zero standard deviation in intervals, e.g. scripted bot)
  if (intervals.length >= 10) {
    const variance =
      intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 35 && avgInterval < 800) {
      signals.push({
        type: 'uniform_burst_cadence',
        severity: 'high',
        description: `Robotic uniform input cadence detected: standard deviation ${Math.round(stdDev)}ms.`,
        timestamp: Date.now(),
      });
    }
  }

  return signals;
}

export function inspectPuzzleSolveMatch(
  events: GameplayEvent[],
  expectedBenchmarkSeconds: number,
  actualDurationSeconds: number,
  tier: string
): AnomalySignal[] {
  const signals = inspectSolveCadence(events);

  // Inhuman speed check relative to verified profile
  const speedRatio = actualDurationSeconds / expectedBenchmarkSeconds;
  if (speedRatio < 0.1 && actualDurationSeconds < 20) {
    signals.push({
      type: 'inhuman_speed',
      severity: 'high',
      description: `Solved ${tier} puzzle in ${Math.round(actualDurationSeconds)}s against expected ${expectedBenchmarkSeconds}s (${Math.round(speedRatio * 100)}% of benchmark).`,
      timestamp: Date.now(),
    });
  }

  return signals;
}

/**
 * Checks if a player's cumulative anomaly record warrants escalation to the maintainer review queue.
 * Escalates ONLY when multiple independent anomalies exist across matches.
 */
export function shouldEscalateToReviewQueue(
  playerRecord: PlayerIntegrityRecord,
  currentMatchSignals: AnomalySignal[]
): boolean {
  if (currentMatchSignals.length === 0) return false;

  const totalAnomalies = playerRecord.anomaliesHistory.length + currentMatchSignals.length;

  // Single fast solve is NEVER flagged for punishment. Requires multiple independent anomalies.
  return totalAnomalies >= 2;
}
