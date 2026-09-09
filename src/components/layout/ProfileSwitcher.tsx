import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store';
import { loadProfileAttempts } from '../../store/profilePersist';
import ConfirmDialog from '../ui/ConfirmDialog';

/**
 * Phase 35 — local profile switcher (named local slots, no accounts).
 * Switching profiles changes only which submission history is visible;
 * the canvas/workspace stays shared (see phases/35.*.md).
 */
export function ProfileSwitcher() {
  const profiles = useAppStore((state) => state.profiles);
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const activeAttempts = useAppStore((state) => state.attempts);
  const createProfile = useAppStore((state) => state.createProfile);
  const renameProfile = useAppStore((state) => state.renameProfile);
  const deleteProfile = useAppStore((state) => state.deleteProfile);
  const switchProfile = useAppStore((state) => state.switchProfile);

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  // Other profiles' counts are read from their own storage key on demand
  // (cheap, small) rather than kept in memory — only the active profile's
  // attempts ever live in the store, per the swap-on-switch design.
  const attemptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of profiles) {
      counts[p.id] =
        p.id === activeProfileId ? activeAttempts.length : loadProfileAttempts(p.id).length;
    }
    return counts;
  }, [profiles, activeProfileId, activeAttempts, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setRenamingId(null);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const initial = (activeProfile?.name || '?').trim().charAt(0).toUpperCase();

  const handleCreateSubmit = () => {
    if (newName.trim()) {
      createProfile(newName.trim());
    }
    setNewName('');
    setIsCreating(false);
  };

  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) {
      renameProfile(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const pendingDeleteProfile = profiles.find((p) => p.id === pendingDeleteId);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        id="profile-switcher-trigger"
        data-testid="profile-switcher-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-[38px] px-3 rounded-[10px] border border-border bg-surface-2 text-text text-[13px] font-medium flex items-center gap-2 hover:bg-surface-3 hover:border-border-strong transition-colors cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
          {initial}
        </span>
        <span className="max-w-[100px] truncate">{activeProfile?.name ?? 'Profile'}</span>
        <ChevronDown
          size={14}
          className={`opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id="profile-switcher-menu"
          data-testid="profile-switcher-menu"
          className="absolute top-full left-0 mt-1.5 w-64 bg-surface-1 border border-border shadow-md rounded-lg py-1 z-50 flex flex-col select-none"
        >
          {profiles.map((p) => (
            <div
              key={p.id}
              className={`px-3 py-2 flex items-center gap-2 text-[13px] ${
                p.id === activeProfileId
                  ? 'bg-primary/10 text-primary'
                  : 'text-text hover:bg-surface-2'
              }`}
            >
              {renamingId === p.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(p.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  onBlur={() => handleRenameSubmit(p.id)}
                  className="flex-1 h-7 px-2 rounded-md bg-surface-2 border border-border text-text text-[13px] outline-none focus:border-primary"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    switchProfile(p.id);
                    setIsOpen(false);
                  }}
                  className="flex-1 text-left truncate cursor-pointer"
                  data-testid={`profile-switcher-item-${p.id}`}
                >
                  {p.name}
                </button>
              )}

              <span className="text-[11px] text-text-muted font-mono shrink-0">
                {attemptCounts[p.id] ?? 0}
              </span>

              <button
                type="button"
                title="Rename profile"
                aria-label={`Rename ${p.name}`}
                onClick={() => {
                  setRenamingId(p.id);
                  setRenameValue(p.name);
                }}
                className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-3 shrink-0 cursor-pointer"
              >
                <Pencil size={12} />
              </button>

              <button
                type="button"
                title={profiles.length <= 1 ? 'At least one profile must remain' : 'Delete profile'}
                aria-label={`Delete ${p.name}`}
                disabled={profiles.length <= 1}
                onClick={() => setPendingDeleteId(p.id)}
                className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger/10 shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          <div className="w-full h-px bg-border my-1" />

          {isCreating ? (
            <div className="px-3 py-2 flex items-center gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSubmit();
                  if (e.key === 'Escape') {
                    setIsCreating(false);
                    setNewName('');
                  }
                }}
                onBlur={handleCreateSubmit}
                placeholder="Profile name"
                className="flex-1 h-7 px-2 rounded-md bg-surface-2 border border-border text-text text-[13px] outline-none focus:border-primary"
              />
            </div>
          ) : (
            <button
              type="button"
              id="profile-switcher-new"
              data-testid="profile-switcher-new"
              onClick={() => setIsCreating(true)}
              className="w-full px-3 py-2 text-left text-[13px] text-primary hover:bg-surface-2 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={14} />
              <span>New profile</span>
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Delete profile"
        message={
          pendingDeleteProfile
            ? `Delete "${pendingDeleteProfile.name}"? This permanently deletes their submission history. This can't be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (pendingDeleteId) deleteProfile(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}

export default ProfileSwitcher;
