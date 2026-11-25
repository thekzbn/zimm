import { AnomalySignal, ReviewQueueEntry } from './types';

class ReviewQueueManager {
  private queue: ReviewQueueEntry[] = [];

  public enqueueMatch(
    matchId: string,
    playerId: string,
    signals: AnomalySignal[]
  ): ReviewQueueEntry {
    const entry: ReviewQueueEntry = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      matchId,
      playerId,
      status: 'pending',
      anomalyScore: Math.min(100, signals.length * 35),
      signals,
      timestamp: Date.now(),
    };

    this.queue.unshift(entry);
    return entry;
  }

  public getPendingEntries(): ReviewQueueEntry[] {
    return this.queue.filter((e) => e.status === 'pending');
  }

  public getAllEntries(): ReviewQueueEntry[] {
    return [...this.queue];
  }

  public resolveEntry(
    entryId: string,
    resolution: 'verified_clean' | 'confirmed_abuse' | 'dismissed',
    reviewerId: string,
    notes?: string
  ): boolean {
    const entry = this.queue.find((e) => e.id === entryId);
    if (!entry) return false;

    entry.status = resolution;
    entry.reviewedBy = reviewerId;
    entry.reviewNotes = notes;
    return true;
  }
}

export const reviewQueueManager = new ReviewQueueManager();
