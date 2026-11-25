import { CellCoord, Digit } from '../timely/types';
import { GameplayEvent, GameplayEventType } from './types';

/**
 * In-memory / persistent event recorder that collects only strictly necessary
 * gameplay events to enable server verification and fair-play inspection.
 */
const MAX_EVENTS = 2000;

class EventRecorder {
  private events: GameplayEvent[] = [];

  public recordEvent(
    matchId: string,
    playerId: string,
    eventType: GameplayEventType,
    details?: { cell?: CellCoord; digit?: Digit; hintStage?: 1 | 2 | 3 }
  ): GameplayEvent {
    const event: GameplayEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      matchId,
      playerId,
      eventType,
      timestamp: Date.now(),
      cell: details?.cell,
      digit: details?.digit,
      hintStage: details?.hintStage,
    };

    this.events.push(event);
    if (this.events.length > MAX_EVENTS) {
      this.events.splice(0, this.events.length - MAX_EVENTS);
    }
    return event;
  }

  public getMatchEvents(matchId: string, playerId?: string): GameplayEvent[] {
    return this.events.filter(
      (e) => e.matchId === matchId && (!playerId || e.playerId === playerId)
    );
  }

  public clearExpiredEvents(retentionWindowMs: number): number {
    const cutoff = Date.now() - retentionWindowMs;
    const initialCount = this.events.length;
    this.events = this.events.filter((e) => e.timestamp >= cutoff);
    return initialCount - this.events.length;
  }
}

export const eventRecorder = new EventRecorder();
