# Phase 1 — Environment & Repo Scaffolding

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [Phase 2 →](./02-global-design-tokens-base-styles.md)

---

## 1. Relationship to Previous Phase

**Depends on:** nothing — this is the first phase.

This is the foundation phase — nothing precedes it. It establishes the repository, toolchain, and dependency set that every later phase builds inside.

There is no prior phase to assume anything from. Read `PRD.md` and `DESIGN.md` in full before starting here.

**What the next phase assumes:** Phase 2 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** a running, empty Vite/React/TS app with the exact dependency set `PRD.md` §22.1 recommends, and nothing else.

**Context carried forward:** `PRD.md` §22.1 (library choices and rationale), §22.2 (architectural rules), §23 (project structure).

## 3. What to Build

**Files to create:**
```
package.json, vite.config.ts, tsconfig.json, tailwind.config.ts, index.html,
src/main.tsx, src/App.tsx (renders "ClassForge" placeholder text only),
.eslintrc / eslint config, .prettierrc, .gitignore
```

**Step-by-step:**
1. `npm create vite@latest . -- --template react-ts`.
2. Install: `@xyflow/react`, `zustand`, `zundo`, `perfect-freehand`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`, `@radix-ui/react-select`, `@radix-ui/react-tooltip`, `@radix-ui/react-toggle`, `lucide-react`, `dompurify`, `nanoid`, `html-to-image`, `tailwindcss` + `postcss` + `autoprefixer`.
3. Configure strict TypeScript (`"strict": true`, `"noUncheckedIndexedAccess": true`).
4. Configure Tailwind v4 with the `src/styles/tokens.css` import wired in (file itself is written in Phase 2).
5. Create the full folder skeleton from `PRD.md` §23 as **empty directories with a `.gitkeep`** — do not populate component files yet, that happens per-phase.
6. `App.tsx` renders only `<div>ClassForge</div>` for now.
7. Add root `README.md` pointing future readers at `PRD.md` → `DESIGN.md` → `PHASES.md` in that order.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** none beyond the base tokens — this phase is non-visual.

**UI consistency checklist:** N/A (no UI yet) — but confirm `tokens.css` import point exists and is empty/ready for Phase 2.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Run `npm run dev`. **Expected:** dev server starts, browser shows "ClassForge" on a blank page, no console errors.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `npm run build`. **Expected:** clean TypeScript build, zero errors.
2. Confirm `node_modules/@xyflow/react/package.json` version is `^12.x`. **Expected:** matches `PRD.md` §22.1's pinned recommendation.

### Definition of Done (Exit Criteria)

**Definition of Done:** dev server boots clean; build is clean; folder skeleton matches `PRD.md` §23.

### Scope Boundaries — Do NOT

**Do NOT:** write any component logic yet; do not pick different libraries than §22.1 lists without a documented reason.

---

## 6. Next Phase

Continue to [Phase 2 — Global Design Tokens & Base Styles](./02-global-design-tokens-base-styles.md).
