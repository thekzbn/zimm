import { MatchStatus } from './types';

export interface MatchLifecycleTransition {
  allowed: boolean;
  nextStatus: MatchStatus;
  reason?: string;
}

export function canTransitionMatch(current: MatchStatus, target: MatchStatus): MatchLifecycleTransition {
  // Terminal states cannot transition
  if (current === 'completed' || current === 'forfeited' || current === 'abandoned') {
    return {
      allowed: false,
      nextStatus: current,
      reason: 'Match is already in a terminal state.',
    };
  }

  switch (target) {
    case 'waiting':
      if (current === 'idle') return { allowed: true, nextStatus: target };
      break;

    case 'ready':
      if (current === 'waiting' || current === 'idle') return { allowed: true, nextStatus: target };
      break;

    case 'playing':
      if (current === 'ready' || current === 'paused') return { allowed: true, nextStatus: target };
      break;

    case 'paused':
      if (current === 'playing') return { allowed: true, nextStatus: target };
      break;

    case 'completed':
      if (current === 'playing') return { allowed: true, nextStatus: target };
      break;

    case 'forfeited':
      if (current === 'playing' || current === 'ready' || current === 'waiting') {
        return { allowed: true, nextStatus: target };
      }
      break;

    case 'abandoned':
      return { allowed: true, nextStatus: target };
  }

  return {
    allowed: false,
    nextStatus: current,
    reason: `Invalid lifecycle transition from ${current} to ${target}.`,
  };
}
