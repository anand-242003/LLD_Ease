# Phase 28 — Responsive + Accessibility Pass

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 27](./27-undo-redo-keyboard-shortcuts.md) · [Phase 29 →](./29-final-polish-e2e-simulation-ui-audit.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 27 — Undo/Redo + Keyboard Shortcuts](./27-undo-redo-keyboard-shortcuts.md)

Takes every screen built in Phases 1-27 and re-lays it out per breakpoint, then re-audits all of it for the accessibility rules DESIGN.md §8 has required implicitly all along.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 29 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the breakpoint strategy from `PRD.md` §18 and the accessibility rules from `PRD.md` §19.7/`DESIGN.md` §8 are implemented across the whole app built so far.

## 3. What to Build

**Files to modify:** most layout components (`AppShell`, `AppHeader`, `PaletteSidebar`, `RightPanel`, `ProblemLibraryModal`), plus a new `src/hooks/useMediaQuery.ts`.

**Step-by-step (Responsive, `PRD.md` §18):**
1. **Laptop (1100–1439px):** right panel narrows to `--panel-w-lg` (420px); header buttons drop text labels below ~1200px, icon-only + tooltip, collapse priority order Clear→Import→Sample→Export→LLD Problems (last); "Buy me a coffee" collapses to icon-only.
2. **Tablet (768–1099px):** palette collapses to a ~64px icon rail (dots/glyphs + tooltips, no section labels); right panel becomes a slide-over drawer (auto-opens on node selection, dismissible, reopened via a persistent 4-icon edge tab strip); Practice banner drops its subtitle; library modal becomes single-column.
3. **Mobile (<768px):** header reduces to brand + `☰` menu; palette becomes a bottom sheet behind a `+` FAB; right panel becomes a full-screen sheet with tabs across the top; relationship drawing switches to two-tap (tap source, tap target) under `(pointer: coarse)`; one-time dismissible "works best on a larger screen" notice.
4. Page body never scrolls at any breakpoint; only inner regions do. All touch targets ≥44×44px on coarse pointers.

**Step-by-step (Accessibility, `DESIGN.md` §8):**
5. Audit every interactive element for a visible focus ring matching `DESIGN.md` §5.1's exact spec — fix any `outline:none` without a replacement.
6. Add `aria-live="polite"` to the Issues tab badge container so a screen-reader user is told when the count changes.
7. Every icon-only button (zoom controls, ink toolbar, tab ×, sticky-note controls) gets an `aria-label`.
8. Confirm the `ProblemLibraryModal` and `ScoreResultModal` both use proper `role="dialog" aria-modal="true"` with focus traps (should already hold from Phases 18/21 — verify, don't assume).
9. Run a contrast check on `--text-muted` over `--surface-1` and every other text/background pairing in active use; adjust tokens in `tokens.css` (Phase 2's file) if any pairing fails AA — this is the one place later phases are allowed to touch Phase 2's file, and only for a contrast fix.
10. Confirm color is never the sole signal anywhere (difficulty badges have text, severity dots pair with wording, read-only has 3 redundant signals) — this should already hold from earlier phases; this step is the audit, not new work.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §8, §5.1, §10.

**UI consistency checklist:** run the full `DESIGN.md` §10 checklist against the responsive layouts specifically — dark-only styling must hold at every breakpoint, not just desktop.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Resize the browser through 1440 → 1100 → 768 → 390px, checking each threshold. **Expected:** the described layout changes occur at the right points, nothing breaks, no horizontal scroll appears anywhere.
2. At mobile width, try to draw a relationship. **Expected:** the two-tap flow works (tap source class, tap target class) instead of requiring a drag.
3. Tab through the entire app with the mouse untouched — header, palette, canvas nodes, right panel, modal. **Expected:** every control is reachable and shows a visible focus ring; tab order is logical (left to right, top to bottom).
4. Open the problem library and screen-reader-test (or manually inspect the accessibility tree via devtools) the modal. **Expected:** announced as a dialog, focus trapped.
5. Trigger a lint issue, watch for the `aria-live` region update (inspect via devtools Accessibility pane). **Expected:** the count change is announced.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Run an automated contrast check (browser devtools' built-in contrast checker is fine — this is not "adding a test file," it's a one-off manual audit) on every `--text-*`/`--surface-*` pairing. **Expected:** all pass AA.
2. Inspect the DOM for any icon-only `<button>` lacking `aria-label`. **Expected:** none found.

### Definition of Done (Exit Criteria)

**Definition of Done:** AC 47, 48, 49, 50 (`PRD.md` §21.3) pass; the responsive strategy from §18 is fully implemented.

### Scope Boundaries — Do NOT

**Do NOT:** treat mobile as a second design system — it's the same tokens and components, just re-laid-out and re-prioritized, per `DESIGN.md`'s single-source-of-truth principle.

---

## 6. Next Phase

Continue to [Phase 29 — Final Polish + Full E2E Simulation & UI Consistency Audit](./29-final-polish-e2e-simulation-ui-audit.md).
