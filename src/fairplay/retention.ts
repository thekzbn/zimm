import { eventRecorder } from './eventRecorder';

export interface RetentionPolicy {
  eventLogRetentionDays: number; // 30 days default
  reviewQueueRetentionDays: number; // 90 days default
}

export const DEFAULT_RETENTION_POLICY: RetentionPolicy = {
  eventLogRetentionDays: 30,
  reviewQueueRetentionDays: 90,
};

/**
 * Executes routine garbage collection of expired match telemetry events.
 */
export function purgeExpiredIntegrityData(
  policy: RetentionPolicy = DEFAULT_RETENTION_POLICY
): { purgedEventsCount: number } {
  const windowMs = policy.eventLogRetentionDays * 24 * 60 * 60 * 1000;
  const purgedEventsCount = eventRecorder.clearExpiredEvents(windowMs);

  return { purgedEventsCount };
}
