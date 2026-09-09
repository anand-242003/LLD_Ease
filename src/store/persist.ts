import { StoreApi } from 'zustand';
import { nanoid } from 'nanoid';
import { Workspace } from '../domain/types';
import { migrateWorkspace } from '../domain/serialization/migrations';
import { Profile } from '../domain/profile/types';
import {
  loadProfilesMeta,
  loadProfileAttempts,
  saveProfilesMeta,
  saveProfileAttempts,
} from './profilePersist';
import type { AppStoreState } from './index';

export const STORAGE_KEY = 'classforge.v1';

export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    const testKey = '__classforge_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function initPersistence(store: StoreApi<AppStoreState>): () => void {
  // 1. Storage availability check (Private mode / cookies blocked)
  if (!isStorageAvailable()) {
    store.getState().addToast({
      message:
        "Your browser is blocking local storage — this diagram won't survive a refresh. Export to JSON to keep it.",
      severity: 'error',
      persistent: true,
    });
    return () => {};
  }

  // 2. Hydrate from storage on boot
  const legacyAttempts = hydrateStore(store);

  // 2.5 Bootstrap/hydrate local profiles (Phase 35). Runs after workspace
  // hydration so a pre-Phase-35 install's legacy `attempts` array (if any)
  // can be migrated into a new default profile in the same pass.
  hydrateProfiles(store, legacyAttempts);

  // 3. Multi-tab conflict listener (PRD §17.6)
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      store.getState().addToast({
        message: 'LLDSIM is open in another tab — changes may overwrite each other.',
        severity: 'info',
      });
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  // 4. Debounced subscriber for auto-saving (500ms debounce per BR10)
  const unsubscribe = store.subscribe((state) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      saveWorkspace(state, store);
      // Phase 35: persist the ACTIVE profile's attempts to its own key.
      // switchProfile/deleteProfile already save the outgoing profile's
      // attempts synchronously before swapping, so this only ever writes
      // under the currently-active profile id — never stale data.
      if (state.activeProfileId) {
        saveProfileAttempts(state.activeProfileId, state.attempts);
      }
    }, 500);
  });

  return () => {
    unsubscribe();
    window.removeEventListener('storage', handleStorageEvent);
  };
}

/**
 * Hydrates documents/activeDocumentId/practiceSession/ui from the shared
 * workspace blob. Returns the blob's legacy `attempts` array (present only
 * on installs saved before Phase 35), if any, so the caller can migrate it
 * into a new default profile — the blob itself stops carrying `attempts`
 * going forward (see `saveWorkspace` below).
 */
function hydrateStore(store: StoreApi<AppStoreState>): Workspace['attempts'] | undefined {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First boot: no saved data, clean startup
      return undefined;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // JSON parse error -> corrupt
      store.getState().addToast({
        message: "Couldn't restore your last session — starting fresh.",
        severity: 'error',
      });
      return;
    }

    const migration = migrateWorkspace(parsed);

    if (migration.error === 'newer') {
      store.getState().addToast({
        message: 'This session was saved by a newer version of LLDSIM.',
        severity: 'error',
      });
      return;
    }

    if (migration.error === 'corrupt' || !migration.workspace) {
      store.getState().addToast({
        message: "Couldn't restore your last session — starting fresh.",
        severity: 'error',
      });
      return;
    }

    // Successfully validated and migrated workspace
    const ws = migration.workspace;

    store.setState((prev) => ({
      ...prev,
      documents: ws.documents,
      activeDocumentId: ws.activeDocumentId,
      practiceSession: ws.practiceSession,
      attempts: ws.attempts ?? [],
      ui: {
        ...prev.ui,
        rightPanelTab: ws.ui.rightPanelTab,
        codeLanguage: ws.ui.codeLanguage,
        codeOptions: ws.ui.codeOptions,
        inkColor: ws.ui.inkColor,
        inkWidth: ws.ui.inkWidth,
        selectedElement: null, // Transient: reset on boot
        armedTool: null, // Transient: reset on boot
        inkTool: null, // Transient: reset on boot
      },
    }));

    // Reset undo/redo history to make hydrated state the baseline
    const temporalStore = (
      store as unknown as { temporal?: { getState: () => { clear: () => void } } }
    ).temporal;
    if (temporalStore?.getState) {
      temporalStore.getState().clear();
    }

    return ws.attempts;
  } catch (err) {
    console.error('Failed to hydrate workspace from localStorage:', err);
    store.getState().addToast({
      message: "Couldn't restore your last session — starting fresh.",
      severity: 'error',
    });
    return undefined;
  }
}

/**
 * Phase 35 — bootstraps or hydrates local profiles. If profile metadata
 * already exists (a normal reload), loads the active profile's attempts
 * into memory. Otherwise this is either a fresh install or a pre-Phase-35
 * install: create one default profile named "You", migrating any legacy
 * `attempts` array found in the workspace blob into it. This runs exactly
 * once per install by construction — once `classforge.profiles.v1` exists,
 * this function always takes the "existing meta" branch and never looks at
 * the legacy array again.
 */
function hydrateProfiles(
  store: StoreApi<AppStoreState>,
  legacyAttempts: Workspace['attempts']
): void {
  const existingMeta = loadProfilesMeta();

  if (existingMeta && existingMeta.profiles.length > 0) {
    const attempts = loadProfileAttempts(existingMeta.activeProfileId);
    store.setState({
      profiles: existingMeta.profiles,
      activeProfileId: existingMeta.activeProfileId,
      attempts,
    });
    return;
  }

  const defaultProfile: Profile = {
    id: nanoid(),
    name: 'You',
    createdAt: new Date().toISOString(),
  };
  const attempts = legacyAttempts ?? [];

  saveProfileAttempts(defaultProfile.id, attempts);
  saveProfilesMeta({ profiles: [defaultProfile], activeProfileId: defaultProfile.id });
  store.setState({
    profiles: [defaultProfile],
    activeProfileId: defaultProfile.id,
    attempts,
  });
}

function saveWorkspace(state: AppStoreState, store: StoreApi<AppStoreState>): void {
  try {
    // Construct strictly defined Workspace (derived fields like issues & generatedCode are omitted)
    const payload: Workspace = {
      schemaVersion: 1,
      documents: state.documents,
      activeDocumentId: state.activeDocumentId,
      practiceSession: state.practiceSession,
      // Phase 35: attempts now live per-profile (see profilePersist.ts /
      // the debounced subscriber below), no longer in the shared blob.
      ui: {
        rightPanelTab: state.ui.rightPanelTab,
        codeLanguage: state.ui.codeLanguage,
        codeOptions: state.ui.codeOptions,
        inkColor: state.ui.inkColor,
        inkWidth: state.ui.inkWidth,
      },
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err: unknown) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      store.getState().addToast({
        message: 'Not enough browser storage to autosave. Try clearing old tabs or exporting.',
        severity: 'error',
      });
    } else {
      console.warn('LocalStorage save failed:', err);
    }
  }
}
