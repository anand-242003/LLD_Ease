# Phase 3 — Static App Shell Layout

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 2](./02-global-design-tokens-base-styles.md) · [Phase 4 →](./04-domain-types-constants.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 2 — Global Design Tokens & Base Styles](./02-global-design-tokens-base-styles.md)

Uses Phase 2's tokens to lay out the static three-column shell every later phase's UI lives inside; still has zero state or interactivity.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 4 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the non-functional three-column shell from `PRD.md` §5.1/§10.1, pixel-structurally correct, with hardcoded placeholder content — no state, no interactivity.

**Context:** `PRD.md` §10.1 (Workspace page spec), §10.2 (AppHeader), §10.3 (PaletteSidebar), §10.4 (CanvasStage), §10.5 (RightPanel), §10.6 (DocumentTabBar). `DESIGN.md` §5.1–5.4.

## 3. What to Build

**Files to create:** `src/components/layout/AppShell.tsx`, `AppHeader.tsx`, `PaletteSidebar.tsx` (static rows, no drag yet), `DocumentTabBar.tsx` (one static "My Design" tab), `CanvasStage.tsx` (empty dark canvas div with dot-grid CSS background), `RightPanel.tsx` (four static tab labels, Inspector empty-state copy shown).

**Step-by-step:**
1. `AppShell` sets the `grid-template-rows: 56px 1fr; grid-template-columns: 265px 1fr 510px;` layout, `height:100vh; overflow:hidden`, per `PRD.md` §10.1.
2. `AppHeader`: brand mark + wordmark (left), the 5 header buttons in exact order from `PRD.md` §10.2 (all `Button` variant per `DESIGN.md` §5.1, all functionally inert for now), "Buy me a coffee" pinned right. `Score my solution` is **not rendered** (practice mode doesn't exist yet — this is correct per the conditional-visibility rule in `PRD.md` §14.6, don't render a placeholder for it).
3. `PaletteSidebar`: the three sections and exact labels/helper text from `PRD.md` §10.3, five kind rows + six relationship rows + one sticky row, all static (no drag, no arming).
4. `CanvasStage`: `background:var(--canvas)` with a repeating-radial-gradient or SVG dot pattern at 16px spacing, `var(--grid-dot)` colored, per `DESIGN.md` §5.10's surrounding context and `PRD.md` §10.4.
5. `RightPanel`: four tabs (`Inspector` active by default), Inspector shows its exact two-line empty-state copy from `PRD.md` Appendix B.
6. `DocumentTabBar`: one active, non-closable "My Design" pill tab.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.1–5.4, §5.1, §5.10, §10.

**UI consistency checklist:** run `DESIGN.md` §10 fully — this is the first real screen. Confirm no hardcoded values snuck in; confirm `--r-md` on rows/buttons; confirm mono/sans split (palette labels sans, nothing mono yet since no model content exists).

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Load the app. **Expected:** layout matches `PRD.md` §5.1's ASCII diagram — palette left (265px), canvas center, panel right (510px), header on top, tab bar between header and canvas.
2. Resize the window to 1280×720. **Expected:** no page-level scrollbar appears (AC-W2 in `PRD.md` §10.1).
3. Visually diff against the screenshot descriptions in `PRD.md` §4.2 (S2-style layout). **Expected:** structural match.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Inspect the root grid element's computed `grid-template-columns`. **Expected:** `265px [canvas]fr 510px` (or equivalent computed pixel values at a known viewport width).
2. Confirm `document.body.scrollHeight === window.innerHeight` (no overflow). **Expected:** true.

### Definition of Done (Exit Criteria)

**Definition of Done:** shell renders correctly at ≥1280px with zero interactivity and zero state; matches AC-W1/W2 from `PRD.md` §21.1.

### Scope Boundaries — Do NOT

**Do NOT:** wire up any click handlers, drag, or state yet — this phase is purely structural/visual.

---

## 6. Next Phase

Continue to [Phase 4 — Domain Types & Constants](./04-domain-types-constants.md).
