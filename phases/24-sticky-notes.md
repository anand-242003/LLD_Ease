# Phase 24 — Sticky Notes

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 23](./23-submission-history-repeated-practice.md) · [Phase 25 →](./25-ink-drawing-layer.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 23 — Submission History & Repeated Practice](./23-submission-history-repeated-practice.md)

The first annotation layer — independent of the practice/feedback work in Phases 20-23, it extends Phase 3's palette and Phase 7's canvas with a new draggable content type.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 25 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the annotation layer from `PRD.md` §9.14/§10.4/§11 — repositionable, resizable, rich-text (bold/italic only), colored notes that render above nodes.

## 3. What to Build

**Files to create:** `src/components/canvas/StickyNoteLayer.tsx`, `StickyNote.tsx`. Extend `documentSlice.ts` with `addStickyNote`/`updateStickyNote`/`removeStickyNote` (respecting the read-only guard from Phase 6).

**Step-by-step:**
1. Drag "Sticky note" from the palette's ANNOTATE section onto the canvas (reuse Phase 9's drag-to-canvas hook) → `addStickyNote(documentId, position)` with default size ~275×200, default color `--sticky-default` (yellow), empty content.
2. `StickyNote` component: header strip with 7 color dots (`DESIGN.md` §2 `--sticky-*` tokens), `B`/`I` buttons, `×`; body is `contenteditable` bound to `content`, showing the exact placeholder from `PRD.md` Appendix B when empty (`"Write a note… (⌘/Ctrl+B bold · ⌘/Ctrl+I italic)"`).
3. `⌘/Ctrl+B` and `⌘/Ctrl+I` toggle bold/italic on the current selection inside the note (standard `document.execCommand` or a minimal manual implementation — keep it to bold/italic only, nothing more).
4. **Sanitize on every write**: run content through `dompurify` with an allowlist of `<b> <i> <br> <div>` only, before it ever reaches the store (`PRD.md` §17.5 — this is called out as the single most important security control in the app; do not skip it).
5. Dragging the header moves the note (`position` update); selecting it shows corner resize handles (`size` update) — both live-bound, no commit step, consistent with Phase 11's interaction philosophy.
6. Z-order: sticky notes render in a layer **above** the node/edge layer (confirms `PRD.md` §5.2's layer ordering).
7. `×` deletes the note immediately, no confirmation (cheap/reversible, BR31's spirit).
8. Disable creation/editing when the active document is read-only.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §2.

**UI consistency checklist:** the 7 color dots map exactly to `DESIGN.md` §2's `--sticky-*` tokens; note surface uses `--r-lg`-ish rounding consistent with cards (verify against the observed screenshot description in `PRD.md`, adjust if it specifies otherwise).

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Drag "Sticky note" onto the canvas. **Expected:** a yellow note appears at the drop point with the exact placeholder text and all header controls.
2. Type into it, select some text, press `⌘B`. **Expected:** bold applied.
3. Click a different color dot. **Expected:** note background changes.
4. Drag the header. **Expected:** note moves; drag a corner handle. **Expected:** note resizes.
5. Click elsewhere then click the note once (not into the body). **Expected:** resize handles appear.
6. Paste (or console-inject) content containing `<img src=x onerror=alert(1)>` into a note. **Expected:** it renders completely inert — no script execution, no `onerror` attribute surviving (§17.5's mandatory check).
7. Click ×. **Expected:** note deleted immediately.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `window.__store.getState().documents...stickyNotes[0].content` after the XSS-attempt paste. **Expected:** contains no `onerror`, no `<img>` at all if it's outside the allowlist, or a stripped-of-attributes `<img>` at most if images were ever intended (per the allowlist, images are **not** allowed at all — confirm it's fully stripped).

### Definition of Done (Exit Criteria)

**Definition of Done:** AC 28, 29 (`PRD.md` §21.1) pass; AC 44 (§21.2, sanitization) passes with a real malicious-content test.

### Scope Boundaries — Do NOT

**Do NOT:** build any rich-text feature beyond bold/italic — no lists, links, headings, or font-size controls; the placeholder text itself documents the full feature set.

---

## 6. Next Phase

Continue to [Phase 25 — Ink Drawing Layer](./25-ink-drawing-layer.md).
