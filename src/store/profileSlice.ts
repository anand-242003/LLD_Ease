import { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import { Profile } from '../domain/profile/types';
import { PracticeSlice } from './practiceSlice';
import {
  loadProfileAttempts,
  saveProfileAttempts,
  saveProfilesMeta,
  deleteProfileAttempts,
} from './profilePersist';

export interface ProfileSlice {
  profiles: Profile[];
  activeProfileId: string;
  createProfile: (name: string) => void;
  renameProfile: (id: string, name: string) => void;
  deleteProfile: (id: string) => void;
  switchProfile: (id: string) => void;
}

/**
 * Phase 35 — local profile switcher. Profiles scope ONLY submission history
 * (state.attempts) — documents/canvas state stay shared across all profiles
 * on this browser (a deliberate scope decision, see phases/35.*.md).
 *
 * The in-memory `attempts` array (owned by PracticeSlice) always holds the
 * ACTIVE profile's history. Switching profiles persists the outgoing
 * profile's attempts to its own storage key, then loads the incoming
 * profile's attempts into memory — the "swap on switch" pattern — so every
 * existing consumer of `state.attempts` keeps working unmodified.
 */
export const createProfileSlice: StateCreator<
  ProfileSlice & PracticeSlice,
  [],
  [],
  ProfileSlice
> = (set, get) => ({
  profiles: [],
  activeProfileId: '',

  createProfile: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newProfile: Profile = {
      id: nanoid(),
      name: trimmed,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const profiles = [...state.profiles, newProfile];
      saveProfilesMeta({ profiles, activeProfileId: state.activeProfileId });
      saveProfileAttempts(newProfile.id, []);
      return { profiles };
    });
  },

  renameProfile: (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    set((state) => {
      const profiles = state.profiles.map((p) => (p.id === id ? { ...p, name: trimmed } : p));
      saveProfilesMeta({ profiles, activeProfileId: state.activeProfileId });
      return { profiles };
    });
  },

  deleteProfile: (id: string) => {
    const state = get();
    // Guardrail: never delete the last remaining profile.
    if (state.profiles.length <= 1) return;

    const profiles = state.profiles.filter((p) => p.id !== id);
    deleteProfileAttempts(id);

    if (state.activeProfileId === id) {
      // Deleting the active profile: fall back to the first remaining one
      // and load its attempts into memory (same swap-on-switch mechanism).
      // `profiles` is guaranteed non-empty here — we returned above if
      // state.profiles.length <= 1, so filtering out one id leaves >= 1.
      const nextActive = profiles[0]!;
      const nextAttempts = loadProfileAttempts(nextActive.id);
      saveProfilesMeta({ profiles, activeProfileId: nextActive.id });
      set({ profiles, activeProfileId: nextActive.id, attempts: nextAttempts });
    } else {
      saveProfilesMeta({ profiles, activeProfileId: state.activeProfileId });
      set({ profiles });
    }
  },

  switchProfile: (id: string) => {
    const state = get();
    if (id === state.activeProfileId) return;
    if (!state.profiles.some((p) => p.id === id)) return;

    // Persist the outgoing profile's current attempts before swapping.
    saveProfileAttempts(state.activeProfileId, state.attempts);

    const incomingAttempts = loadProfileAttempts(id);
    saveProfilesMeta({ profiles: state.profiles, activeProfileId: id });
    set({ activeProfileId: id, attempts: incomingAttempts });
  },
});
