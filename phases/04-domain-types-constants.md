# Phase 4 — Domain Types & Constants

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 3](./03-static-app-shell-layout.md) · [Phase 5 →](./05-zustand-store-scaffolding.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 1 — Environment & Repo Scaffolding](./01-environment-repo-scaffolding.md)

Independent of Phase 3's UI work — it defines the domain model (PRD.md §13) that Phase 5's store and every later data-handling phase will type against.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 5 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** `PRD.md` §13's TypeScript model exists verbatim in the domain layer, importable by nothing but itself (no React, no store).

## 3. What to Build

**Files to create:** `src/domain/types.ts`.

**Step-by-step:**
1. Transcribe every interface and type alias from `PRD.md` §13 **exactly** — `ClassKind`, `RelationshipType`, `Visibility`, `Language`, `Difficulty`, `IssueSeverity`, `Attribute`, `Method`, `ClassNode`, `Relationship`, `StickyNote`, `InkStroke`, `Diagram`, `Problem`, `Issue`, `Workspace`.
2. Add no extra fields "for convenience" — if something is needed later that isn't in §13, that's a signal to re-check the PRD before inventing a field.
3. Add a single `CodeOptions` type matching the `Workspace.ui.codeOptions` shape inline in §13.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** none beyond the base tokens — this phase is non-visual.

**UI consistency checklist:** N/A — no UI.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:** N/A — no UI yet.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `tsc --noEmit` on this file alone. **Expected:** zero errors.
2. Manually diff `types.ts` against `PRD.md` §13 line by line. **Expected:** every field name, optionality (`?`), and type matches exactly (e.g. `Attribute.defaultValue` is optional, `Attribute.name` is not).

### Definition of Done (Exit Criteria)

**Definition of Done:** file compiles standalone; §13 invariants list (§13.2) is copied as a comment block at the bottom of the file so later phases enforcing them can reference it.

### Scope Boundaries — Do NOT

**Do NOT:** import React or any store here — `PRD.md` §22.2 rule 1 is non-negotiable: the domain layer stays framework-free.

---

## 6. Next Phase

Continue to [Phase 5 — Zustand Store Scaffolding](./05-zustand-store-scaffolding.md).
