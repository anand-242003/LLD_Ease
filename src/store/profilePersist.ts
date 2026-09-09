import { Attempt } from '../domain/types';
import { Profile } from '../domain/profile/types';

/**
 * Phase 35 — local profile persistence. Profile metadata and each profile's
 * submission history live in their own localStorage keys, separate from the
 * shared workspace blob (`classforge.v1`) which holds documents/canvas state
 * that stays common to every profile on this browser.
 */
export const PROFILES_STORAGE_KEY = 'classforge.profiles.v1';
const ATTEMPTS_KEY_PREFIX = 'classforge.attempts.v1.';

export interface ProfilesMeta {
  profiles: Profile[];
  activeProfileId: string;
}

function isValidProfilesMeta(value: unknown): value is ProfilesMeta {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as ProfilesMeta).profiles) &&
    typeof (value as ProfilesMeta).activeProfileId === 'string'
  );
}

export function loadProfilesMeta(): ProfilesMeta | null {
  try {
    const raw = window.localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidProfilesMeta(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveProfilesMeta(meta: ProfilesMeta): void {
  try {
    window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(meta));
  } catch (err) {
    console.warn('Failed to save profile metadata:', err);
  }
}

export function loadProfileAttempts(profileId: string): Attempt[] {
  try {
    const raw = window.localStorage.getItem(`${ATTEMPTS_KEY_PREFIX}${profileId}`);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Attempt[]) : [];
  } catch {
    return [];
  }
}

export function saveProfileAttempts(profileId: string, attempts: Attempt[]): void {
  try {
    window.localStorage.setItem(`${ATTEMPTS_KEY_PREFIX}${profileId}`, JSON.stringify(attempts));
  } catch (err) {
    console.warn('Failed to save profile attempts:', err);
  }
}

export function deleteProfileAttempts(profileId: string): void {
  try {
    window.localStorage.removeItem(`${ATTEMPTS_KEY_PREFIX}${profileId}`);
  } catch {
    // Best-effort cleanup; not worth surfacing to the user.
  }
}
