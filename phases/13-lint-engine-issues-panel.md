# Phase 13 — Lint Engine + Issues Panel

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 12](./12-inspector-edge-form-delete-flows.md) · [Phase 14 →](./14-codegen-core-java-python.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 12 — Inspector — Edge Form + Delete Flows](./12-inspector-edge-form-delete-flows.md)

Reads the live model that Phases 6-12 can now fully construct and turns it into the app's first derived view — lint findings — completing the model-to-derivation pipeline from PRD.md §5.3.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 14 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the pure `lint()` function from `PRD.md` §14.3/§16.2 exists with **R1 implemented verbatim** plus the proposed R2–R14, wired live to the Issues tab and its tab-badge.

## 3. What to Build

**Files to create:** `src/domain/lint/index.ts`, `registry.ts`, `rules/*.ts` (one file per rule, per `PRD.md` §23's structure), `src/components/panel/IssuesPanel.tsx`, `IssueRow.tsx`, `src/store/selectors.ts` (`useIssues()` selector, memoized on the active document).

**Step-by-step:**
1. Each rule file exports a pure function `(diagram: Diagram) => Issue[]`. Implement **R1 first, exactly**: `REALIZE` edge whose target's `kind !== 'INTERFACE'` → `{severity:'warning', subjectName: target.name, message: \`"${source.name}" realizes "${target.name}" which is not an interface.\`}` — the message string must match `PRD.md` §14.3/Appendix B **character for character**, including the trailing period and the quote placement (subject = target, not source).
2. Implement R2–R14 per the `PRD.md` §14.3 table (duplicate names, empty name, inheritance cycle, multiple inheritance, interface non-public member, interface with attributes, unimplemented abstract method, enum without literals, empty class, self-inheritance, abstract method in concrete class, invalid identifier for the selected codegen language, inherit-targeting-an-interface).
3. `registry.ts` composes all rules: `lint(diagram) = rules.flatMap(r => r(diagram))`, sorted **errors → warnings → info**, then stably by node vertical position (BR — sort rule from `PRD.md` §14.3's "Execution" note).
4. `useIssues()` selector recomputes on every document mutation (memoized by document reference/version, not on a timer) — this is the "recompute on every mutation" architecture rule from `PRD.md` §5.3.
5. `IssuesPanel`: tab badge shows `issues.length`, neutral at 0 / success-tinted at >0 (`DESIGN.md` §5.6). Body shows the green-check "No problems" / "Your diagram is valid and ready to generate." empty state at 0, else a list of `IssueRow`s in the exact format from `PRD.md` §10.5.2 (severity dot · monospace subject · sans message).
6. Clicking an `IssueRow` selects and centers the offending node on canvas (`fitView` to that single node or `setCenter`).

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.6, §5.

**UI consistency checklist:** issue row surface/radius per `DESIGN.md` §5 general card rules; severity dot colors exactly `--warning`/`--danger`/`--primary`(info); subject is mono, message is sans (mixed-font row — get this exactly right, it's called out explicitly in `PRD.md`).

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Start with zero issues. **Expected:** Issues tab badge reads `0`, panel shows the green-check empty state with the exact two-line copy.
2. Create a Realize edge to a non-interface (reusing Phase 10/11). **Expected:** badge becomes `1` **immediately**, no explicit "validate" click (AC13/AC-IS4).
3. Open Issues. **Expected:** the row reads exactly `NewClsdsd — "NewClass0" realizes "NewClsdsd" which is not an interface.` (or the equivalent for your test names) — subject is the **target**.
4. Change the target's KIND to Interface via the Inspector. **Expected:** badge returns to `0`, green-check state returns.
5. Click an issue row (recreate one first). **Expected:** the offending node is selected and centered on canvas.
6. Trigger R2 (rename two nodes identically). **Expected:** a duplicate-name warning appears for both/either.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Via the dev exposure, call `lint(diagram)` directly on a hand-built fixture matching `PRD.md`'s scratch example (`NewClass0` CLASS realizing `NewClsdsd` ABSTRACT). **Expected:** returns exactly one `Issue` object matching the shape and string in step 3 above — assert this with a scratch script per §0.2, then delete the script.
2. Confirm `lint()` is pure: call it twice on the identical diagram object. **Expected:** deep-equal results both times, no mutation of the input.

### Definition of Done (Exit Criteria)

**Definition of Done:** AC 13, 14, 15 (`PRD.md` §21.1) pass exactly; the R1 message string matches byte-for-byte.

### Scope Boundaries — Do NOT

**Do NOT:** debounce the lint computation so heavily that the badge visibly lags a user action — `PRD.md` explicitly shows this as instantaneous (a short ~150ms debounce per §22.3 is fine since it's imperceptible, but don't gate it behind any explicit user action).

---

## 6. Next Phase

Continue to [Phase 14 — Codegen Core + Java/Python](./14-codegen-core-java-python.md).
