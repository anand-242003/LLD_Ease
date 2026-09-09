# Phase 15 — Codegen Remaining Languages + Code Panel UI

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 14](./14-codegen-core-java-python.md) · [Phase 16 →](./16-persistence-layer.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 14 — Codegen Core + Java/Python](./14-codegen-core-java-python.md)

Extends Phase 14's codegen interface to the remaining four languages and finally gives it a UI, reusing Phase 13's tab-badge/panel conventions.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 16 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** TypeScript, JavaScript, C++, C# generators exist (following the Java/Python pattern, since no screenshots pin their exact output — `PRD.md` §9.10's type-map table is the spec), and the full Code tab UI is wired live.

## 3. What to Build

**Files to create/modify:** `languages/typescript.ts`, `javascript.ts`, `cpp.ts`, `csharp.ts`, `src/components/panel/CodePanel.tsx`, `CodeViewer.tsx`, `PillGroup.tsx`, `ChipToggle.tsx`.

**Step-by-step:**
1. Implement the four remaining generators following the same architectural pattern as Java/Python (member ordering, options wiring, per-language idiom — e.g. TS uses `interface`/`class` with `implements`/`extends`, C++ emits header-style class blocks with `virtual`/`= 0` for abstract methods, C# mirrors Java's shape closely). Use `PRD.md` §9.10's type-map table for every type conversion.
2. `CodePanel`: language pill row (6 pills, exclusive selection via `PillGroup`), action row (`Copy`, `Download` buttons), option chip row (5 independent `ChipToggle`s with the exact default states from `PRD.md` §9.10), then `CodeViewer` (mono, `line-height:1.6`, vertical scroll, **horizontal clip, no wrap** — matches the observed S4 cutoff behavior).
3. Wire `codeLanguage`/`codeOptions` from `uiSlice` (Phase 5); every pill/chip click updates state and the displayed code regenerates via `generateCode()` (memoized selector, same pattern as `useIssues()`).
4. `Copy` writes the exact displayed string to the clipboard (`navigator.clipboard.writeText`), shows a 2s "Copied!" confirmation; falls back to select-and-hint if the Clipboard API is denied (`PRD.md` §17.2).
5. `Download` saves the code as a file with the correct extension per language (`.java`, `.py`, `.ts`, `.js`, `.cpp`, `.cs`).
6. Empty-diagram state: "Add a class to generate code." (`PRD.md` §9.10 edge case), not a blank panel.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.5.

**UI consistency checklist:** pills use the exclusive-selection recipe, chips the independent-toggle recipe (`DESIGN.md` §5.5) — do not let these two ever look or behave the same.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Open Code tab with a diagram present. **Expected:** Java selected by default, Constructor+Getters/Setters+Doc comments chips on, toString+equals/hashCode off (AC17).
2. Click Python pill. **Expected:** Java deselects, Python selects, code regenerates instantly (AC-CO1).
3. Toggle each chip independently. **Expected:** all five are independently controllable, output updates on each toggle (AC18).
4. With Java + equals/hashCode on: **Expected:** `import java.util.Objects;` appears (AC19/AC-CO3).
5. Click Copy, then paste elsewhere. **Expected:** exact displayed text (AC-CO4).
6. Click Download. **Expected:** a file downloads with the correct extension and content.
7. Clear the diagram, reopen Code. **Expected:** "Add a class to generate code." empty state.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Confirm `generateCode` is called through the memoized selector, not on every keystroke of unrelated UI (performance sanity, §22.3).

### Definition of Done (Exit Criteria)

**Definition of Done:** AC 16–22 from `PRD.md` §21.1 all pass.

### Scope Boundaries — Do NOT

**Do NOT:** add syntax highlighting unless trivially available — `PRD.md` §22.1 explicitly says start plain (`<pre>`), highlighting is optional polish, not core scope.

---

## 6. Next Phase

Continue to [Phase 16 — Persistence Layer](./16-persistence-layer.md).
