import { DEFAULT_ENDGAME_CONFIG } from '../endgame/config';
import { createInitialPoolState } from '../endgame/reservePool';
import { ReservePoolState } from '../endgame/types';
import { AsyncChallenge, UserProfile } from './types';

const USER_PROFILE_KEY = 'zimm_user_profile';
const ASYNC_CHALLENGES_KEY = 'zimm_async_challenges';
const RESERVE_POOL_KEY = 'zimm_reserve_pool';
const MAX_ASYNC_CHALLENGES = 25;

export class MatchStore {
  private userProfile: UserProfile;
  private asyncChallenges: Map<string, AsyncChallenge> = new Map();
  private reservePool: ReservePoolState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.userProfile = this.loadUserProfile();
    this.reservePool = this.loadReservePool();
    this.loadAsyncChallenges();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  private loadUserProfile(): UserProfile {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(USER_PROFILE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    const defaultUser: UserProfile = {
      id: `usr_${Math.random().toString(36).substring(2, 8)}`,
      username: 'Player 1',
      rating: DEFAULT_ENDGAME_CONFIG.defaultRating,
      matchesPlayed: 0,
      matchesWon: 0,
    };
    this.saveUserProfile(defaultUser);
    return defaultUser;
  }

  public saveUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    }
    this.notify();
  }

  public getUserProfile(): UserProfile {
    return { ...this.userProfile };
  }

  public updateRating(newRating: number, won: boolean): void {
    this.userProfile.rating = newRating;
    this.userProfile.matchesPlayed++;
    if (won) this.userProfile.matchesWon++;
    this.saveUserProfile(this.userProfile);
  }

  public getReservePool(): ReservePoolState {
    return { ...this.reservePool };
  }

  public saveReservePool(pool: ReservePoolState): void {
    this.reservePool = pool;
    if (typeof window !== 'undefined') {
      localStorage.setItem(RESERVE_POOL_KEY, JSON.stringify(pool));
    }
  }

  private loadReservePool(): ReservePoolState {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(RESERVE_POOL_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return createInitialPoolState(DEFAULT_ENDGAME_CONFIG);
  }

  private loadAsyncChallenges(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ASYNC_CHALLENGES_KEY);
      if (saved) {
        try {
          const list: AsyncChallenge[] = JSON.parse(saved);
          list.forEach((c) => this.asyncChallenges.set(c.code.toUpperCase(), c));
        } catch {}
      }
    }
  }

  public saveAsyncChallenge(challenge: AsyncChallenge): void {
    const key = challenge.code.toUpperCase();
    // Refresh insertion order so oldest entries are evicted first
    this.asyncChallenges.delete(key);
    this.asyncChallenges.set(key, challenge);
    while (this.asyncChallenges.size > MAX_ASYNC_CHALLENGES) {
      const oldestKey = this.asyncChallenges.keys().next().value;
      if (oldestKey !== undefined) {
        this.asyncChallenges.delete(oldestKey);
      } else {
        break;
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        ASYNC_CHALLENGES_KEY,
        JSON.stringify(Array.from(this.asyncChallenges.values()))
      );
    }
  }

  public getAsyncChallenge(code: string): AsyncChallenge | undefined {
    return this.asyncChallenges.get(code.toUpperCase());
  }
}

export const matchStore = new MatchStore();
