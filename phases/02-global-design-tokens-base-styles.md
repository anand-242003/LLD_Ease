# Phase 2 — Global Design Tokens & Base Styles

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 1](./01-environment-repo-scaffolding.md) · [Phase 3 →](./03-static-app-shell-layout.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 1 — Environment & Repo Scaffolding](./01-environment-repo-scaffolding.md)

Builds directly on Phase 1's empty scaffold by giving the app its one and only source of visual truth — the DESIGN.md token file — before any real component exists to misuse a hardcoded value.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 3 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** `DESIGN.md` §2's token file exists verbatim and is the only source of color/spacing/type in the app from this point forward.

## 3. What to Build

**Files to create/modify:** `src/styles/tokens.css`, `src/styles/globals.css` (resets: box-sizing, `html,body,#root{height:100%}`, `body{background:var(--bg);color:var(--text);font-family:var(--font-sans)}`, scrollbar styling for dark mode), `tailwind.config.ts` (map theme to variables).

**Step-by-step:**
1. Copy `DESIGN.md` §2's CSS block into `src/styles/tokens.css` **exactly**, character for character.
2. Import `tokens.css` then `globals.css` in `src/main.tsx`, before `App` renders.
3. Load Inter and JetBrains Mono (self-hosted via `@font-face` or a pinned CDN import) with system fallbacks per `DESIGN.md` §2's `--font-sans`/`--font-mono`.
4. Wire `tailwind.config.ts` `theme.extend.colors/spacing/borderRadius` to read from the CSS variables, per `DESIGN.md` §12.
5. Style native scrollbars and native `<select>` for dark mode so nothing "leaks" a light-mode default (`DESIGN.md` §10 checklist item).

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §2, §12, §10.

**UI consistency checklist:** every token in `DESIGN.md` §2 is present in `tokens.css` with no value drift; no component file exists yet to check further.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Open devtools, inspect `<body>`. **Expected:** `background-color` computes to `#0E0E10`, `color` to `#E9E9EC`.
2. Render a throwaway `<button className="bg-primary">` in `App.tsx` temporarily. **Expected:** it renders teal `#22C7C7`. Remove it after confirming.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. In devtools console: `getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()`. **Expected:** `#22C7C7`.
2. Repeat for `--r-md`, `--sp-4`, `--font-mono`. **Expected:** `10px`, `16px`, the mono stack.

### Definition of Done (Exit Criteria)

**Definition of Done:** all tokens resolve correctly in the live DOM; fonts load without FOUT flashing to a visibly different fallback shape.

### Scope Boundaries — Do NOT

**Do NOT:** define any color/spacing outside this file going forward — every later phase assumes this is the only source.

---

## 6. Next Phase

Continue to [Phase 3 — Static App Shell Layout](./03-static-app-shell-layout.md).
