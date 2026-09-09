# ClassForge — Build Phases
## A step-by-step execution plan for a low-level coding agent

**Read order for this repository: `PRD.md` → `DESIGN.md` → this file.** `PRD.md` is product truth (what exists, what it does, exact copy, exact observed behavior — tagged `[OBS]`/`[INF]`/`[ASM]`). `DESIGN.md` is visual/interaction truth (tokens, component recipes, the consistency audit). This file is **sequencing and execution instructions only** — it does not redefine anything from either document; every "what to build" here points back at a PRD section, and every "how it should look" points back at a DESIGN.md recipe. If you find yourself inventing a behavior or a color that isn't traceable to one of those two files, stop and re-check §27 of `PRD.md` (Open Questions) for the sanctioned assumption before improvising your own.

---

## 0. Pre-Instructions for the Coding Agent — read this fully before Phase 1

### 0.1 What "done" means for a phase
A phase is done only when **all four** are true:
1. The files listed under "Files to create/modify" exist and contain what the step-by-step instructions describe.
2. The **Data contracts** in that phase match `PRD.md` §13 exactly — no field renamed, no field dropped, no type loosened.
3. **Both** verification passes (black-box §0.3 and white-box §0.4) succeed, with every step's expected result actually observed — not assumed.
4. The phase's **UI Consistency Audit** items are checked against `DESIGN.md` §10.

Do not start phase N+1 until phase N is done by this definition. Phases are ordered so each one is independently demonstrable — if a phase can't be manually driven and inspected on its own, something upstream was skipped.

### 0.2 No test files — what this means precisely
**Do not add any automated test files to the codebase.** Concretely: no `*.test.ts`, `*.test.tsx`, `*.spec.ts`, no `__tests__/` directory, no Vitest/Jest/Playwright config, no test runner as a dependency. This **supersedes** `PRD.md` §25's `__tests__/` project-structure entry and its Vitest/Playwright recommendations — treat `PRD.md` §25 as a description of *what to verify*, not *how to store the verification*. Every verification in this document is **manual and ephemeral**: run the dev server, drive the UI yourself (black-box) or inspect live state through the browser devtools console (white-box), confirm the expected result, then move on. Nothing about the act of verifying should leave a file behind in `src/`.

**Exception — scratch scripts for pure functions are allowed but must never be committed.** Some phases (lint, codegen, scoring) are pure functions that are painful to verify by clicking through the UI alone. For those, you may write a throwaway script (e.g. `scratch-verify.ts`) **outside `src/`**, in the environment's scratchpad/temp directory, run it once with `tsx scratch-verify.ts` or in the browser console by pasting the function output, read the result, and then **delete the scratch file**. It must never be committed, never live under `src/`, and never be referenced by any import in the app.

### 0.3 Black-box verification — what it means
Drive the running app exactly as a user would (mouse/keyboard against the rendered UI in a real browser via the dev server) and confirm what you **observe** — on screen, not in code — matches the expected result. Each phase gives you a numbered click-sequence with an expected result per step. If a step's expected result doesn't happen, the phase is not done — fix it before moving on. This is the same lens as `PRD.md` §9 (Complete User Flows) and §21 (Acceptance Criteria); phases below cite AC numbers directly.

### 0.4 White-box verification — what it means, and how to do it without test files
Inspect the **internal state and pure-function outputs** directly, using the browser's devtools console against the running app (no separate test harness needed):
1. In `src/main.tsx` (or store init), add a **dev-only** escape hatch: `if (import.meta.env.DEV) { (window as any).__store = useAppStore; }`. This is a permanent, tiny piece of app code (not a test file) that only exists in dev builds — it is how you and any future developer inspect state live. Keep it.
2. In the browser console, `window.__store.getState()` returns the live store — inspect `documents`, `activeDocumentId`, `ui`, etc. directly. `window.__store.getState().someAction(...)` can invoke actions directly to test edge cases the mouse can't easily reach (e.g. rapid-fire duplicate edge creation).
3. For pure domain functions (`lint`, `generateCode`, `scoreAgainstReference`, `serialize`/`deserialize`), either call them the same way (they should be pure and importable, so temporarily `window.__lint = lint` in dev bootstrap, or just use the scratch-script exception in §0.2) and inspect the returned value directly against the expected shape/value given in the phase.
4. White-box checks are about **correctness of internals that black-box clicking can't easily see** — exact object shape, exact string values, absence of extra/missing fields, idempotency, pure-function determinism (call twice with the same input, confirm identical output).

### 0.5 Ambiguity resolution protocol
If an instruction here is underspecified, resolve it in this order: (1) the exact behavior/copy in `PRD.md` (search for `[OBS]` first), (2) `PRD.md` §27 Open Questions for the sanctioned `[ASM]`, (3) the closest existing recipe in `DESIGN.md` §5, (4) if truly novel, make the smallest reasonable decision, note it inline as a comment `// ASM:` in the code, and continue — do not block on it.

### 0.6 File and commit hygiene
- One phase = one logical commit (or a small tight series). Commit message states the phase number and title.
- Never leave the app in a broken (won't-boot) state at a phase boundary.
- Do not jump ahead and half-implement a later phase's feature "while you're in there" — each phase's scope is deliberately bounded so verification stays meaningful.

### 0.7 Phase index

| # | Phase | Depends on |
|---|---|---|
| [1](phases/01-environment-repo-scaffolding.md) | [Environment & Repo Scaffolding](phases/01-environment-repo-scaffolding.md) | — |
| [2](phases/02-global-design-tokens-base-styles.md) | [Global Design Tokens & Base Styles](phases/02-global-design-tokens-base-styles.md) | 1 |
| [3](phases/03-static-app-shell-layout.md) | [Static App Shell Layout](phases/03-static-app-shell-layout.md) | 2 |
| [4](phases/04-domain-types-constants.md) | [Domain Types & Constants](phases/04-domain-types-constants.md) | 1 |
| [5](phases/05-zustand-store-scaffolding.md) | [Zustand Store Scaffolding](phases/05-zustand-store-scaffolding.md) | 4 |
| [6](phases/06-workspace-document-lifecycle-logic.md) | [Workspace & Document Lifecycle Logic](phases/06-workspace-document-lifecycle-logic.md) | 5 |
| [7](phases/07-react-flow-canvas-foundation.md) | [React Flow Canvas Foundation](phases/07-react-flow-canvas-foundation.md) | 3, 6 |
| [8](phases/08-classnode-component.md) | [ClassNode Component](phases/08-classnode-component.md) | 7 |
| [9](phases/09-palette-sidebar-drag-to-create.md) | [Palette Sidebar + Drag-to-Create](phases/09-palette-sidebar-drag-to-create.md) | 8 |
| [10](phases/10-relationship-edges.md) | [Relationship Edges (types, markers, arming, connect flow, labels/multiplicities)](phases/10-relationship-edges.md) | 9 |
| [11](phases/11-inspector-node-form.md) | [Inspector — Node Form](phases/11-inspector-node-form.md) | 10 |
| [12](phases/12-inspector-edge-form-delete-flows.md) | [Inspector — Edge Form + Delete Flows](phases/12-inspector-edge-form-delete-flows.md) | 11 |
| [13](phases/13-lint-engine-issues-panel.md) | [Lint Engine + Issues Panel](phases/13-lint-engine-issues-panel.md) | 12 |
| [14](phases/14-codegen-core-java-python.md) | [Codegen Core + Java/Python](phases/14-codegen-core-java-python.md) | 13 |
| [15](phases/15-codegen-remaining-languages-code-panel-ui.md) | [Codegen Remaining Languages + Code Panel UI](phases/15-codegen-remaining-languages-code-panel-ui.md) | 14 |
| [16](phases/16-persistence-layer.md) | [Persistence Layer](phases/16-persistence-layer.md) | 15 |
| [17](phases/17-document-tabs-notes-panel.md) | [Document Tabs + Notes Panel](phases/17-document-tabs-notes-panel.md) | 16 |
| [18](phases/18-problem-library-data-modal.md) | [Problem Library Data + Modal](phases/18-problem-library-data-modal.md) | 17 |
| [19](phases/19-load-reference-solution-flow.md) | [Load Reference Solution Flow](phases/19-load-reference-solution-flow.md) | 18 |
| [20](phases/20-practice-mode.md) | [Practice Mode](phases/20-practice-mode.md) | 19 |
| [21](phases/21-scoring-engine-score-result-modal.md) | [Scoring Engine + Score Result Modal](phases/21-scoring-engine-score-result-modal.md) | 20 |
| [22](phases/22-explainable-feedback-engine.md) | [Explainable Feedback Engine (Responsibilities, Abstractions, Relationships, Trade-offs)](phases/22-explainable-feedback-engine.md) | 21 |
| [23](phases/23-submission-history-repeated-practice.md) | [Submission History & Repeated Practice](phases/23-submission-history-repeated-practice.md) | 22 |
| [24](phases/24-sticky-notes.md) | [Sticky Notes](phases/24-sticky-notes.md) | 23 |
| [25](phases/25-ink-drawing-layer.md) | [Ink Drawing Layer](phases/25-ink-drawing-layer.md) | 24 |
| [26](phases/26-export-import-clear.md) | [Export / Import / Clear](phases/26-export-import-clear.md) | 25 |
| [27](phases/27-undo-redo-keyboard-shortcuts.md) | [Undo/Redo + Keyboard Shortcuts](phases/27-undo-redo-keyboard-shortcuts.md) | 26 |
| [28](phases/28-responsive-accessibility-pass.md) | [Responsive + Accessibility Pass](phases/28-responsive-accessibility-pass.md) | 27 |
| [29](phases/29-final-polish-e2e-simulation-ui-audit.md) | [Final Polish + Full E2E Simulation & UI Consistency Audit](phases/29-final-polish-e2e-simulation-ui-audit.md) | 28 |
| [30](phases/30.remove-import-export.md) | [Remove Import / Export](phases/30.remove-import-export.md) | 29 |
| [31](phases/31.problem-context-sidebar-panel.md) | [Problem Context Sidebar Panel](phases/31.problem-context-sidebar-panel.md) | 30 |
| [32](phases/32.remove-brief-dialog.md) | [Remove the Brief Dialog](phases/32.remove-brief-dialog.md) | 31 |
| [33](phases/33.consolidate-solution-access.md) | [Consolidate Solution Access (Remove Sample, Single Reference Entry Point)](phases/33.consolidate-solution-access.md) | 31, 32 |
| [34](phases/34.remove-practice-exit-control.md) | [Remove the Practice "Exit" Control](phases/34.remove-practice-exit-control.md) | 33 |
| [35](phases/35.local-profile-switcher-history.md) | [Local User Profile Switcher for History](phases/35.local-profile-switcher-history.md) | 34 |
| [36](phases/36.expand-problem-library.md) | [Expand the Problem Library — New Problems & Reference Solutions](phases/36.expand-problem-library.md) | 35 |
| [37](phases/37.homepage-landing-page.md) | [Marketing Homepage](phases/37.homepage-landing-page.md) | 36 |

---

### 0.9 Phase 30+ — Post-Launch Iteration Set (read before Phase 30)

Phases 1–29 shipped the release described by `PRD.md`/`DESIGN.md` as originally reverse-engineered. Phases 30–37 are a **second wave**, driven directly by real usage of that release, not by new screenshots. They intentionally **supersede** specific parts of `PRD.md` and `DESIGN.md` — where they conflict, this section and the phase files it introduces win, and the superseded `PRD.md`/`DESIGN.md` passages should be read as historical record of what shipped in v1, not as current truth. Each phase below states exactly what it supersedes.

**Why these eight, in this order:**

1. **Phase 30 — Remove Import/Export.** Cuts a whole feature (`PRD.md` §9.12/§9.13, Phase 26). Purely subtractive, zero UI dependents elsewhere, so it goes first as the cleanest possible starting point.
2. **Phase 31 — Problem Context Sidebar Panel.** Net-new: gives the left `PaletteSidebar` (`PRD.md` §10.3) a persistent, always-visible view of the active problem's brief when one is in scope. This is additive and must land *before* Phases 32–33 because those two phases remove UI whose content this phase relocates.
3. **Phase 32 — Remove the Brief Dialog.** Depends on 31: once the sidebar shows the problem's brief persistently, the modal `Brief` button in `PracticeBanner` (`PRD.md` §10.4.1, flagged as low-confidence in §27-U11 to begin with) is a redundant second place to read the same information, so it is removed.
4. **Phase 33 — Consolidate Solution Access.** Depends on 31, 32: the header `Sample` button (`PRD.md` §9.3, flagged low-confidence in §27-U10) and the `Reveal reference` / `Load solution →` flows (§9.2/§9.5) currently give three different entry points to "see a solution," one of which (`Sample`) is also functionally broken — it hardcodes the Parking Lot diagram regardless of which problem is active. This phase removes `Sample` and makes the reference tab the **single** way to view any problem's solution, surfaced from the one place a user is already looking at problem context: the Phase 31 sidebar panel.
5. **Phase 34 — Remove the Practice "Exit" Control.** Depends on 33 (same `PracticeBanner` file, sequenced right after its sibling cleanups). Practice sessions stop being something the user must explicitly dismiss; they persist quietly until replaced by starting a new one, matching how every other piece of app state in this product already survives silently in the background.
6. **Phase 35 — Local User Profile Switcher for History.** A genuinely new, larger feature: since `PRD.md` §5.4/§8.1 already establish there is no account system and never will be, "profile" here means a **named local slot in `localStorage`**, not an account. Placed after the UI cleanups so it lands on a stable app rather than churning alongside them.
7. **Phase 36 — Expand the Problem Library.** Audited first (see the phase file): all 6 existing problems already have complete, stat-matching reference solutions — there is no unfinished solution to add. "The remaining problems" is therefore reinterpreted as **problems the library doesn't yet cover** — this phase adds new canonical LLD interview problems with fully authored reference solutions, growing the catalogue past 6. This reframing is called out explicitly in the phase file; if it doesn't match intent, redirect before building it.
8. **Phase 37 — Marketing Homepage.** The biggest, most self-contained change: an entirely new pre-app landing route, explicitly exempted from `DESIGN.md` §1's "not a marketing surface" rule, built with motion via GSAP (see the phase file for the exact package and scope). Sequenced last because it depends on nothing above and everything above should be stable before layering a new entry route on top of the app shell.

**A note on testing convention for Phases 30–37:** `PHASES.md` §0.2 above (no automated test files, manual black-box/white-box verification only) is a deliberate, explicit choice for this project, restated at the top of every phase file including 30–37. This is a **project-specific override** the user has set for this repository and is followed here for consistency with Phases 1–29 — it does not reflect a global testing policy and should not be read as one.

---

### 0.8 Product mandate: the Practice & Feedback loop (read before Phases 21-23)

The following is the governing brief for the app's core value proposition. Everything in Phases 21-23 exists to satisfy it, and it takes priority over the thinner `PRD.md` section 9.6 sketch wherever the two differ in ambition -- section 9.6's five-dimension score is the *floor*, not the *ceiling*, of what these phases build:

> Design and build a small practice experience that helps a learner practice Low-Level Design, submit a solution, and receive useful, explainable feedback. LLD practice is often easy to start but difficult to evaluate. A learner can design a Parking Lot, Elevator, Vending Machine, or similar problem and still be unsure whether the responsibilities, abstractions, relationships, and trade-offs are actually good. We want to explore a focused product that helps learners practice LLD repeatedly and understand where their design can improve.

Translated into concrete requirements this codebase must satisfy:

1. **Submit a solution** -- "Score my solution" (scaffolded in Phase 21) is the submit action. A submission is a first-class event: timestamped, stored, and part of a history (Phase 23), not a disposable UI interaction.
2. **Useful, explainable feedback** -- a numeric score alone ("72/100") is not explainable. Every score must be traceable to specific, named reasons that point at specific classes/edges in the learner's own diagram. "Your Relationships score is 60%" is not acceptable on its own; "Your `ParkingLot` associates directly with `HourlyFeeStrategy` instead of the `FeeStrategy` interface -- this couples the lot to one pricing scheme" is the bar.
3. **Four explicit evaluation lenses**, named directly in the brief -- Phase 22 builds one analyzer per lens, each producing its own explainable findings, not folded into a single opaque number:
   - **Responsibilities** -- is each class doing one cohesive job, or is it a god-class / a misplaced-method dumping ground?
   - **Abstractions** -- where the problem domain calls for one (payment methods, pricing, dispatch strategy), did the learner introduce an interface/abstract class, or hard-code a concrete choice?
   - **Relationships** -- are the relationship *types* (inherit vs realize vs compose vs aggregate vs associate vs depend), *directions*, and *multiplicities* the right ones for the domain, not just "is an edge present"?
   - **Trade-offs** -- does the design make an explicit extensibility/coupling choice, and is it a defensible one (e.g., Strategy over a switch statement; composition over inheritance where variation is runtime, not compile-time)?
4. **Practice repeatedly** -- the product must support attempting the *same* problem more than once and seeing whether the learner's design is actually improving, not just re-showing a fresh unrelated score each time. Phase 23 builds this as attempt history + a trend view.
5. **Understand where the design can improve** -- feedback must end in a concrete, prioritized "what to change next" list, not just a diagnosis.

This mandate does not replace anything already built (Phases 1-20) -- it deepens Phase 21's scoring engine (which stays as the structural/quantitative layer: name matching, the 5 weighted dimensions, matched/missing/extra) by adding Phase 22 (qualitative, explainable analysis on top of that same diagram) and Phase 23 (persistence + repetition across attempts). Build them in that order; each depends on the previous.

---

---

## How this document is organized

Every phase now lives as its own file under [`phases/`](phases/), linked from the table above. Each phase file is self-contained and includes:

1. **Relationship to Previous Phase** — what it depends on, one sentence on why, and what the next phase will assume it delivered.
2. **Overview** — the phase's goal and the `PRD.md`/`DESIGN.md` context it carries forward.
3. **What to Build** — the exact files and step-by-step build instructions.
4. **UI & Design Requirements** — which `DESIGN.md` sections govern this phase's visuals, plus its consistency checklist.
5. **Testing Framework** — Black-Box (user simulation) and White-Box (internal state inspection) verification, Definition of Done, and explicit scope boundaries. The no-test-files rule from §0.2 above is restated at the top of every phase's Testing Framework section so each file is readable standalone.
6. **Next Phase** — a direct link to continue the sequence.

This file (`PHASES.md`) stays the single entry point: read §0.1–§0.8 above first — they are global and apply to every phase — then follow the table into [`phases/01-environment-repo-scaffolding.md`](phases/01-environment-repo-scaffolding.md) and proceed in order. Do not start a phase file out of sequence; each one's Relationship section assumes everything before it is already done.
