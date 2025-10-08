import Dexie, { Table } from 'dexie';
import type { Session, Profile } from '@/engine/types';

export class TypingCoachDB extends Dexie {
  sessions!: Table<Session>;
  
  constructor() {
    super('TypingCoachDB');
    this.version(1).stores({
      sessions: 'id, startedAt, mode'
    });
  }
}

export const db = new TypingCoachDB();

// Profile storage using localStorage
const PROFILE_KEY = 'typing-coach-profile';

export function getProfile(): Profile {
  const stored = localStorage.getItem(PROFILE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    layout: 'QWERTY',
    keyStats: {},
    bigramStats: {},
    confusion: {},
    history: []
  };
}

export function saveProfile(profile: Profile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function resetProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

export async function saveSession(session: Session): Promise<void> {
  await db.sessions.add(session);
  
  const profile = getProfile();
  profile.history.push(session.id);
  // Keep only last 100 sessions
  if (profile.history.length > 100) {
    profile.history = profile.history.slice(-100);
  }
  saveProfile(profile);
}

export async function getRecentSessions(limit = 10): Promise<Session[]> {
  return await db.sessions
    .orderBy('startedAt')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function exportData(): Promise<{
  profile: Profile;
  sessions: Session[];
}> {
  const profile = getProfile();
  const sessions = await db.sessions.toArray();
  
  return {
    profile,
    sessions
  };
}

export async function importData(data: {
  profile: Profile;
  sessions: Session[];
}): Promise<void> {
  // Clear existing data
  await db.sessions.clear();
  resetProfile();

  // Import new data
  saveProfile(data.profile);
  await db.sessions.bulkAdd(data.sessions);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.sessions.delete(sessionId);

  // Also remove from profile history
  const profile = getProfile();
  profile.history = profile.history.filter(id => id !== sessionId);
  saveProfile(profile);
}

export async function deleteAllSessions(): Promise<void> {
  await db.sessions.clear();

  // Clear profile history and reset stats
  const profile = getProfile();
  profile.history = [];
  profile.keyStats = {};
  profile.bigramStats = {};
  profile.confusion = {};
  saveProfile(profile);
}

export async function getSessionById(sessionId: string): Promise<Session | undefined> {
  return await db.sessions.get(sessionId);
}