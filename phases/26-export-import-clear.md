# Phase 26 — Export / Import / Clear

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 25](./25-ink-drawing-layer.md) · [Phase 27 →](./27-undo-redo-keyboard-shortcuts.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 25 — Ink Drawing Layer](./25-ink-drawing-layer.md)

Gives the user a way out of the app (Export) and back in (Import), and formalizes Clear's exact semantics — including the Phase 24 sticky-note-survives rule observed in the source product.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 27 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the three export formats, JSON import with validation, and Clear's exact (sticky-preserving) semantics from `PRD.md` §9.11/§9.12/§9.13.

## 3. What to Build

**Files to create:** `src/lib/download.ts`, `src/domain/serialization/serialize.ts`, `deserialize.ts`, `migrations.ts`, `src/hooks/useExport.ts`, `useImport.ts`, modify `AppHeader.tsx` (wire Export dropdown, Import, Clear).

**Step-by-step:**
1. **Export dropdown**: exactly three items — `PNG image`, `SVG vector`, `JSON (reloadable)` (`PRD.md` §9.12). PNG/SVG use `html-to-image`'s `toPng`/`toSvg` against the full canvas content (not just the visible viewport — temporarily fit-to-content or compute the full bounding box first), covering all three layers (nodes, ink, stickies), with the canvas background included (no transparent-PNG trap).
2. JSON export: `serialize(diagram)` → a `Blob` → downloaded as `<sanitized-title>.json`. This must be **losslessly reloadable**.
3. **Import**: triggers a hidden `<input type="file" accept=".json">` (native OS picker, per `PRD.md` §9.13/S26 — do not build a custom file browser). On file selection: `FileReader` → `deserialize()` → validate shape/`schemaVersion` per `PRD.md` §17.2's exact error cases (not-JSON, wrong-shape, version-too-new) → each produces its own toast message. If `My Design` is currently non-empty, confirm before replacing (`ConfirmDialog`).
4. **Clear**: confirm first (`PRD.md` §14.1 BR31), then empties `nodes`, `edges`, **and `inkStrokes`** — but **preserves `stickyNotes`, `scratchNotes`, `practiceSession`, and `viewport`** (BR32 — this is the single most counter-intuitive, explicitly-observed rule in the whole PRD; get it exactly right). Issues recomputes to 0 immediately after.
5. Export/Import/Clear are all disabled when the active document is read-only.
6. Guard against duplicate-submission per `PRD.md` §15.6 — disable the triggering button while the operation is in flight.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** none beyond the base tokens — this phase is non-visual.

**UI consistency checklist:** Export dropdown uses `DESIGN.md`'s dropdown-menu pattern with shadow-md; each item has a leading icon per `PRD.md` §9.12's observed set (picture / code-in-box / `{}`).

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Build a diagram with nodes, edges, a sticky note, and an ink stroke. Export PNG. **Expected:** downloaded file visually contains all of it, with the dark canvas background (not transparent/white).
2. Export SVG. **Expected:** a valid, openable SVG with the same content.
3. Export JSON, then Clear (confirm), then Import that JSON file. **Expected:** the diagram is restored **identically** — nodes, edges, sticky, ink, notes, viewport (AC10 in `PRD.md` §9.12's flow / matches F1 story).
4. Rebuild nodes+edges+sticky+ink, click Clear, confirm. **Expected:** nodes and edges and ink are gone, Issues shows 0, but **the sticky note is still there** (AC32 — the exact S24→S27 behavior).
5. Attempt Import with a non-JSON file. **Expected:** toast "That file isn't valid JSON."; nothing changes.
6. Attempt Import with valid-but-wrong-shape JSON. **Expected:** toast "That doesn't look like a ClassForge diagram."
7. Attempt Import over a non-empty `My Design`. **Expected:** confirm dialog first.
8. All three actions on a read-only tab. **Expected:** disabled.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `deserialize(serialize(diagram))` deep-equals the original `diagram` object (field for field) via a scratch script — this is the round-trip guarantee the "(reloadable)" label promises.
2. After Clear: confirm `stickyNotes.length` is unchanged while `nodes.length === 0 && edges.length === 0 && inkStrokes.length === 0`.

### Definition of Done (Exit Criteria)

**Definition of Done:** AC 30, 31, 32 (`PRD.md` §21.1) pass exactly, including the sticky-preservation nuance.

### Scope Boundaries — Do NOT

**Do NOT:** let Clear touch `scratchNotes` or the practice session — only nodes/edges/ink are in scope for Clear, per BR32.

---

## 6. Next Phase

Continue to [Phase 27 — Undo/Redo + Keyboard Shortcuts](./27-undo-redo-keyboard-shortcuts.md).
