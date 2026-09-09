# AI Usage Report — LLDSIM (LLD Studio)

> **Document type:** Transparency disclosure + engineering decision log  
> **Scope:** Full product development lifecycle — from PRD reverse-engineering through the 37-phase implementation, UI overhaul, landing page, and post-launch bug fixes  
> **AI tooling used:** Google Gemini (Antigravity IDE — `gemini-2.5-pro`)

---

## Overview

LLDSIM was built **entirely through AI-assisted development**, using Google's Antigravity IDE as the primary engineering environment. The human contributor provided product intent, design direction, screenshots of the original application (as a reference artefact), and real-time feedback. The AI agent authored, verified, debugged, and iterated on all source code, documentation, and configuration.

This document is an honest, detailed account of:
1. **What the AI did** (and how)
2. **What the human directed**
3. **Key architectural and product decisions** — how they were made, why
4. **Tradeoffs** — including places where we could have done differently
5. **Where AI struggled** and required human course-correction
6. **Limitations and risks** of this approach

---

## 1. How the AI Was Used — Methodology

### 1.1 The Starting Point: Reverse-Engineering from Screenshots

The project began not from a blank product spec, but from **27 screenshots** of an existing application. The AI's first task was to synthesise a complete, implementation-ready Product Requirements Document (`PRD.md`) by systematically analysing every screenshot.

**What the AI produced from 27 images:**
- A 3,000-line PRD covering all 9 major user flows, 60+ business rules, exact UI copy strings, component anatomy, data contracts, and 50 acceptance criteria
- A complete Design System document (`DESIGN.md`) — design tokens, component recipes, state definitions, accessibility requirements
- A 37-phase execution plan (`PHASES.md`) with phase dependencies, verification protocols (black-box + white-box), and completion criteria

Every claim in the PRD was tagged with confidence markers:
- `[OBS]` — directly visible in a screenshot, reproduce exactly
- `[INF]` — strong inference from evidence, implement as described
- `[ASM]` — implementation assumption where evidence was silent

This tagging discipline prevented the AI from treating its own inferences as ground truth — a critical safeguard when the source material is incomplete.

### 1.2 The 37-Phase Sequential Build

The AI executed a **strictly sequential 37-phase build plan**, where each phase:
1. Had a clearly bounded scope (one feature area per phase)
2. Required both black-box verification (drive the running app as a user) and white-box verification (inspect internal state via browser devtools / `window.__store.getState()`)
3. Was not considered done until both verification passes succeeded
4. Produced a single logical git commit

Phases were never parallelised, and the AI was explicitly instructed not to "jump ahead" and pre-implement later features while working on an earlier one. This prevented dependency tangles and made each phase independently demonstrable.

**The 37 phases grouped by milestone:**

| Milestone | Phases | What was built |
|---|---|---|
| Scaffold + design system | 1–2 | Vite + React + TypeScript + Tailwind; CSS token layer |
| Core app shell | 3–4 | Layout, domain types |
| State management + persistence | 5–6, 16 | Zustand slices, localStorage, migrations |
| Canvas + nodes + edges | 7–10 | React Flow canvas, ClassNode, 6 relationship types |
| Inspector + palette | 11–12 | Node/edge editing forms |
| Lint engine + codegen | 13–15 | 14 lint rules, 6-language code generator |
| Problem library + practice | 17–21 | Problem modal, scoring engine, score modal |
| Feedback + history + tools | 22–27 | Explainable feedback, attempt history, sticky notes, ink |
| Polish + accessibility | 28–29 | Responsive breakpoints, WCAG AA, E2E simulation |
| Post-launch iteration | 30–37 | UX simplification, profiles, 4 new problems, landing page |

### 1.3 Verification Without Test Files

A deliberate constraint: **no automated test files were committed to the repository** (no `*.test.ts`, no Vitest config, no Playwright setup).

Verification was instead:
- **Black-box:** browser automation — AI-controlled browser clicking through every user flow
- **White-box:** `window.__store.getState()` console inspection of live Zustand state; ephemeral scratch scripts run via `tsx` and deleted before committing

The AI authored and ran hundreds of verification steps across 37 phases. All verification was **ephemeral and artefact-free** — it left no test debt in the repository.

---

## 2. Key Systems AI Designed and Authored

### 2.1 The Domain Model (`src/domain/types.ts`)

The AI designed the complete type system from scratch, working backwards from what the UI needed to render and what the scoring engine needed to compare. Key decisions:

- **`Diagram` as the single source of truth** — nodes, edges, sticky notes, ink strokes, scratch notes, viewport all co-located in one serialisable document
- **`ClassNode` with `attributes[]` and `methods[]` as flat arrays** — avoided a nested AST; simpler to render and diff
- **`Relationship` typed by `RelationshipType` enum** — 6 values, not a free string; enables type-safe lint rules
- **`Problem.referenceDiagram` typed as `Omit<Diagram, 'id' | 'createdAt' | 'updatedAt' | 'readOnly' | 'title'>`** — reference data is structurally identical to a live Diagram but doesn't carry document-management fields

### 2.2 The Lint Engine (`src/domain/lint/`)

The AI designed and implemented all 14 lint rules as **pure functions** (`lint(diagram) → Issue[]`) with no side effects or React dependencies. Each rule is a separate module in the registry, making the engine trivially extensible.

Rules were derived from first-principles OOP constraints (what is actually illegal in Java/C#/TypeScript) rather than from the screenshots, which only showed 1–2 rules in action. The AI extrapolated the full 14-rule set from domain knowledge of OOP type systems.

**Key design decision:** rules produce `Issue[]` with `subjectNodeId` — every issue is anchored to a specific node in the diagram. This allows the UI to `Jump to class` from the issues panel, and allows the feedback engine to produce node-anchored qualitative findings.

### 2.3 The Code Generator (`src/domain/codegen/`)

The AI authored 6 complete language generators as pure AST-to-string functions. The generator walks the diagram model in topological order (interfaces → abstract classes → concrete classes, with circular dependency detection) and emits idiomatic source.

**Language-specific decisions made by AI:**
- Java: `@Override` on implemented interface methods; `Objects.equals()` import only when `equals/hashCode` is toggled on; `throws` clauses omitted (not modelled)
- Python: `ABC` base class for abstract; `@abstractmethod` decorator; `__init__` with `__`-prefixed private attribute name mangling; `@dataclass` avoided (adds implicit `__init__` that conflicts with abstract method semantics)
- TypeScript: `abstract` keyword on abstract classes and methods; `interface` for UML interfaces; generics pass-through
- C++: header-only style with `= 0` for pure virtual; no separate `.cpp` file (not modellable without implementation bodies)

### 2.4 The Scoring Engine (`src/domain/scoring/`)

The AI designed a 5-dimension weighted scoring system from the PRD's high-level description (which only said "scored against the reference solution" — no algorithmic detail was specified).

**Algorithm choices:**
- **Fuzzy name matching** using normalised Levenshtein-ratio: `ParkingFloor` matches `Floor` with partial credit. Rationale: interview candidates rarely copy class names exactly from a reference; the intent matters more than the spelling.
- **Greedy bipartite matching**: each user node is paired with the best-matching reference node that hasn't already been claimed. This is O(n²) on node count — acceptable given n < 30 for any real LLD problem.
- **5 dimensions with independent weights**: Class Coverage, Kind Accuracy, Relationship Coverage, Member Coverage, Structural Hygiene. Each is a fraction [0.0, 1.0] before being weighted into the 100-point total.

**Tradeoff: greedy vs. optimal matching**  
Optimal bipartite matching (Hungarian algorithm) would produce a globally optimal pairing, but greedy matching is dramatically simpler and produces nearly identical results when n < 30. The AI chose greedy intentionally.

### 2.5 The Explainable Feedback Engine (`src/domain/feedback/`)

The PRD only specified "explainable feedback." The AI interpreted this as 4 distinct analytical lenses (Abstractions, Relationships, Responsibilities, Trade-offs), each a pure function producing `Finding[]` objects with `nodeId`, `severity`, `title`, and `explanation`.

**Key decisions:**

- **Node-anchored findings**: every finding references a specific class in the user's diagram by name and nodeId. Generic advice ("you should use more interfaces") is not emitted — only specific, actionable observations ("Your `ParkingLot` class directly references `HourlyFeeStrategy` instead of the `FeeStrategy` interface — this couples the lot to one pricing scheme").

- **Findings ranked by severity**, with "Top 3 to improve" surfaced in the score modal. This prevents feedback overwhelm when a user's design has 10+ issues.

- **Positive findings included**: the engine emits findings for things the user did *well* (correct use of Strategy pattern, appropriate use of composition) — not just deficiencies. This supports motivation and accurate self-assessment.

- **Tradeoffs lens is structurally separate from Relationships**: coupling violations (DIP, high fan-out to concretes) are different in kind from missing edges — the AI separated them into distinct analyzers rather than lumping them.

### 2.6 The Persistence Layer (`src/store/persist.ts`)

The AI designed a robust localStorage persistence system with:
- **500ms debounced autosave** (prevents thrashing during rapid edits)
- **Schema versioning** with a `schemaVersion` field and migration engine
- **Graceful corruption recovery** — malformed JSON falls back to clean boot + warning toast
- **Multi-tab conflict detection** via `storage` event listener
- **Transient state exclusion** — `selectedElement`, `armedTool`, `needsFitView`, `activeModal` are never persisted (session-scoped only)
- **Phase 35 profile split**: per-profile attempt history moved to separate localStorage keys (`classforge.profile.{id}.attempts`) so switching profiles doesn't corrupt the main workspace blob

### 2.7 The GSAP Animation System (`src/hooks/useHomeMotion.ts`)

For Phase 37 (landing page), the AI read all 8 official GSAP skill files and designed a comprehensive animation architecture:

- **Lenis smooth scroll proxied to ScrollTrigger** — required for scroll-driven animations to work correctly when Lenis intercepts native scroll events
- **`gsap.matchMedia()`** for all animations — enables `prefers-reduced-motion` support and responsive breakpoints in a single declaration
- **`gsap.quickTo()`** for high-frequency event handlers (magnetic button, mouse parallax) — avoids creating a new tween on every `mousemove` event
- **`ctx.revert()` on cleanup** — all GSAP contexts are fully cleaned up on React component unmount, preventing stale ScrollTriggers from lingering

---

## 3. Architectural Decisions and Rationale

### Decision 1: Zero Backend, Zero Authentication

**Decision:** 100% client-side SPA with localStorage persistence. No API server, no database, no auth.

**How it was made:** The AI scanned all 27 screenshots and found zero login screens, zero user avatars, zero sync indicators, zero account UI. The PRD tagged this as `[INF — high confidence]`. The AI recommended implementing exactly what the evidence showed.

**Rationale:** The target user (interview preppers) needs the tool to open instantly, work offline, and require no commitment (no email sign-up). Introducing a backend would add cold-start latency, create a signup barrier, and require ongoing infrastructure maintenance — all cost with no feature benefit at this scale.

**Tradeoff accepted:** No cross-device continuity. A user who practices on their laptop cannot continue on their phone. This is an acknowledged limitation, documented in the product scope.

---

### Decision 2: Domain Logic as Pure Functions, Completely Decoupled from React

**Decision:** `src/domain/` contains zero React imports, zero Zustand imports, zero DOM references. Every domain function (`lint`, `generateCode`, `scoreAgainstReference`, `buildFeedbackReport`) is a pure TypeScript function.

**Rationale:**
1. **Testability** — pure functions can be called from a scratch script, the browser console, or (if added later) a test runner without mocking a React environment
2. **Reusability** — the lint engine is used by both the Issues panel (live as the user edits) and the scoring engine (at submission time)
3. **Performance** — debounced selector hooks (`useIssues`, `useGeneratedCode`) can call these functions without worrying about side effects

**Tradeoff:** Slightly more boilerplate — domain functions receive full `Diagram` objects rather than reading from the store directly. This is the right tradeoff.

---

### Decision 3: Zustand with Slice Architecture + Zundo for Undo/Redo

**Decision:** Zustand for global state management, composed from 6 slices (`documentSlice`, `workspaceSlice`, `practiceSlice`, `profileSlice`, `uiSlice`, `toastSlice`). Zundo for temporal undo/redo history on document mutations.

**Rationale:**
- Zustand's minimal API surface keeps the store readable without Redux boilerplate
- Slice composition allows each domain area to define its own state shape and actions
- Zundo's `temporal` middleware tracks only document mutations (nodes, edges, stickies, ink, notes) and explicitly excludes transient UI state (selected element, active modal, zoom level) — preventing "undo" from accidentally jumping the user to a different selected element or closed panel

**Tradeoff considered: Redux Toolkit vs Zustand**  
Redux Toolkit would provide stronger tooling (Redux DevTools, action replay) but introduces significant boilerplate. For a client-only, single-user app, Zustand's simplicity is the better fit.

---

### Decision 4: React Flow for the Canvas

**Decision:** `@xyflow/react` (React Flow v12) as the graph canvas library.

**Rationale:** React Flow provides the full suite needed: infinite panning/zooming, custom node components, custom edge components with SVG markers, connection handle management, and a viewport transform. Building this from scratch (SVG + pointer events + transforms) would have consumed 5–10 phases alone.

**Tradeoff:** React Flow's opinionated rendering model (nodes are positioned absolutely in a coordinate system it manages) means canvas-level CSS custom properties and Tailwind utilities must be carefully namespaced to avoid conflicts with React Flow's own styles.

**Migration risk:** React Flow's API has historically had breaking changes between major versions. The dependency is pinned to a specific minor version to avoid surprises.

---

### Decision 5: No Automated Test Files (Explicit Constraint)

**Decision:** Zero `*.test.ts` files, zero test runners, zero CI test gates — per `PHASES.md §0.2`.

**How it was made:** This was an explicit user-directed constraint, not an AI recommendation. The user set this as a project policy for this repository.

**Rationale (as the user stated):** The verification approach used here (browser automation + devtools console inspection) is faster to execute per phase than setting up and maintaining test infrastructure. For a solo-contributor, single-codebase project, the overhead of test files — mocking React Flow, mocking the store, mocking the canvas — outweighs their benefit.

**Tradeoff accepted:** No automated regression detection. A future refactor of the scoring engine could silently break its output without any test catching it. This risk is mitigated by the domain logic being pure functions (easy to re-verify manually) and by the 13-step E2E simulation gate in Phase 29.

**AI's honest assessment:** This is the most significant risk in the project's engineering posture. For any production-grade or team-maintained product, automated tests on the pure domain functions (lint, codegen, scoring) would be strongly advisable. The current approach works for a solo-contributor hobby/portfolio project.

---

### Decision 6: Fuzzy Name Matching in the Scoring Engine

**Decision:** Use normalised string similarity (ratio of common characters to total) for matching user class names to reference class names, rather than exact string matching.

**Rationale:** In real LLD interviews, candidates rarely use the exact same class names as the reference solution. `PaymentGateway` and `PaymentStrategy` are meaningfully different, but `ParkingFloor` and `Floor` refer to the same concept. Exact matching would unfairly penalise users for stylistic naming differences.

**Tradeoff:** Fuzzy matching can produce false positives — e.g., `Ticket` might fuzzy-match `TicketValidator` with non-zero similarity. The threshold is calibrated to minimise this (similarity < 0.6 produces zero credit) but the calibration is based on judgment, not measured data.

---

### Decision 7: UX Simplification in Phases 30–34

**Decision:** Remove the Import/Export feature, remove the Practice "Exit" button, remove the "Sample" diagram, remove the "Brief" dialog from the Practice banner, and consolidate reference solution access to a single entry point in the sidebar.

**How it was made:** These were human-directed decisions based on real usage of the v1 build. The user observed that:
- Import/Export added UI complexity with low usage frequency
- The "Sample" button hardcoded the Parking Lot diagram regardless of the active problem (a bug, not just UX debt)
- Three separate ways to "see a solution" (Sample, Reveal Reference, Load Solution) confused users
- The Practice "Exit" button created unnecessary modal interactions

The AI implemented these as reductive phases, explicitly noting in each phase file which `PRD.md` section was being superseded and why.

**Key engineering insight from Phase 33:** The AI caught that the `Sample` button bug was not merely a UX flaw — it was the root cause of a related bug where reference diagrams from Problem A continued to show after switching to Problem B. This was traced to a selector priority inversion in `useActiveProblemContext` and fixed as a post-launch bug (separate commit).

---

### Decision 8: Local Profile System (Phase 35)

**Decision:** Implement "profiles" as named localStorage slots — not accounts. A profile is a `{id, name, createdAt}` object with per-profile attempt history stored under separate localStorage keys.

**Rationale:** The `PRD.md` and `DESIGN.md` explicitly established that this product has no authentication and never will. "Profile" therefore can only mean a local concept. The use case is study groups — multiple users sharing one computer/browser can maintain independent practice histories.

**Tradeoff:** Profiles are not password-protected. Any user of the browser can switch to any profile and view (or corrupt) another person's history. This is documented and accepted: the product's threat model does not include malicious local actors.

**Persistence architecture decision:** Attempt history is stored per-profile under `classforge.profile.{profileId}.attempts` (separate from the main `classforge.v1` workspace blob). This means switching profiles correctly loads that profile's history without overwriting the shared workspace state.

---

### Decision 9: GSAP + Lenis for Landing Page Motion (Phase 37)

**Decision:** Use GSAP (with official skill files installed via `npx skills add`) and Lenis for smooth scroll on the marketing homepage.

**Rationale:**
- GSAP is the industry standard for high-performance, timeline-based JavaScript animation. CSS-only animations cannot produce the scroll-linked, staggered, clip-path reveal effects required for a premium landing page feel.
- Lenis provides inertia-based smooth scrolling. Without a `ScrollTrigger.scrollerProxy`, GSAP's scroll-triggered animations desync from Lenis's virtual scroll position. The AI wired the proxy correctly.
- The GSAP skill files (installed as `.agents/skills/gsap-*.md`) provided authoritative API references, preventing the AI from hallucinating deprecated or incorrect GSAP v3/v3.12 APIs.

**Tradeoff:** GSAP + Lenis adds ~75KB to the bundle. For a tool-focused app where the landing page is the first thing users see only once, this is acceptable. The application shell itself (canvas, panels, store) does not import GSAP — it is landing-page-only.

**Animation system cleanup:** The AI correctly scoped all GSAP animations inside `gsap.context()` with `ctx.revert()` on React `useEffect` cleanup. This prevents memory leaks and stray ScrollTriggers that would fire on pages they don't belong to.

---

## 4. Post-Launch Bug Fixes (AI-Caught and AI-Fixed)

### Bug: Reference solution always showing Parking Lot regardless of selected problem

**Root cause:** A selector priority inversion in `useActiveProblemContext` (`src/store/selectors.ts`).

The original code checked `activeDoc.readOnly && activeDoc.sourceProblemId` first. If a Parking Lot reference tab was the active document (left over from a previous session), this check returned `parkingLot` even when the user had switched to practising Splitwise.

The `practiceSession.problemId` check came second — too late.

**Fix:** Flip the priority. `practiceSession.problemId` is checked first (it represents unambiguous user intent), then the read-only active tab (browsing a reference with no active session).

**Lesson:** Selector ordering bugs of this kind are particularly subtle because the wrong code path is activated by a specific sequence of user actions (open reference → switch problem) rather than on first use. The AI discovered this through systematic code reading, not through a test.

---

## 5. Where AI Struggled / Required Human Course-Correction

### 5.1 Screenshot Ambiguity → Assumptions

Several areas of the product had to be designed from scratch because the screenshots provided no evidence:
- The scoring algorithm (the screenshots only showed the result modal, not the algorithm)
- The full set of lint rules (only 1 rule was visible in screenshots)
- The explainable feedback engine (described in the PRD as "useful, explainable feedback" — no screenshot)
- The exact content of 4 of the 6 reference diagrams (clipped in the modal screenshot)

In all these cases, the AI made explicit `[ASM]`-tagged decisions and documented them. The human reviewed and approved the decisions implicitly by not requesting changes. Where the human did course-correct (e.g., directing Phase 30–34 UX simplifications), the AI implemented the changes as a new phase rather than retrofitting.

### 5.2 The "Sample" Button Bug

The `Sample` button in the header was hardcoded to always load the Parking Lot diagram, regardless of the active problem. The AI originally implemented this as specified (the PRD said "a demonstration diagram populates" — it didn't say which one). Only after real usage did the human identify this as incorrect behaviour. The AI then proposed the correct fix: remove `Sample` entirely and make the reference solution the single source of truth, accessible from the Problem Context sidebar panel.

### 5.3 Landing Page Scope Creep Risk

The Phase 37 landing page specification said "inspired by siteinspire.com." The AI accessed siteinspire, identified premium design patterns (noise textures, ambient orbs, clip-path reveals, marquee tickers, magnetic buttons), and implemented all of them. The human was satisfied with this interpretation, but it demonstrates a risk: when the prompt is directional rather than specific ("make it premium"), the AI makes many aesthetic choices autonomously. These choices may not match the human's taste. In this case they did; in other contexts, the AI should produce a mockup for approval before full implementation.

### 5.4 TypeScript Strict Mode Friction

Several phases produced TypeScript errors (`TS2322`, `TS2345`) on first pass — typically around:
- `Omit<>` type usage in the `Problem.referenceDiagram` field conflicting with full `Diagram` in the scoring engine
- Zustand slice composition types requiring explicit generic parameters
- React Flow's generic `NodeProps<T>` requiring explicit casting for custom node data

In all cases the AI caught and resolved these errors in the same phase without human intervention, but it added iteration cycles that would have been shorter with looser TypeScript settings. The decision to use strict TypeScript (`"strict": true` in `tsconfig.json`) was correct — it caught real data contract mismatches — but it did slow the AI's first-pass iteration speed.

---

## 6. What the Human Contributed

The AI authored all code. The human contributed:

| Contribution | Nature |
|---|---|
| 27 screenshots of the original application | Source material for reverse-engineering |
| Product name / brand direction ("LLDSIM") | Identity decision |
| UX iteration directives (Phases 30–34) | Based on real usage — remove friction, simplify flows |
| Landing page style direction ("siteinspire inspiration") | Aesthetic direction |
| Bug reports ("reference solution always shows Parking Lot") | QA / regression reporting |
| GitHub repository (`anand-242003/LLD_Ease`) | Deployment target |
| Go/no-go on each phase | Approval signal |

The AI made all implementation decisions autonomously within the boundaries set by the human's direction.

---

## 7. Bundle and Dependency Decisions

| Dependency | Chosen | Alternative considered | Reason for choice |
|---|---|---|---|
| Bundler | Vite 6 | Webpack, Parcel | Fastest HMR, native ESM, minimal config |
| UI framework | React 19 | Vue 3, Svelte | Specified by PRD / screenshots |
| State management | Zustand + Zundo | Redux Toolkit, Jotai | Minimal boilerplate; Zundo adds undo/redo with <50 lines |
| Canvas | React Flow (`@xyflow/react`) | D3, Konva, custom SVG | Provides node/edge/viewport management out of the box |
| CSS | Tailwind CSS v4 | CSS Modules, styled-components | Co-located utility classes; v4 is CSS-variables-based (matches token system) |
| Animation | GSAP + Lenis | Framer Motion, CSS | GSAP is more capable for timeline/scroll-driven animation; Lenis for smooth inertia scroll |
| Unique IDs | `nanoid` | `crypto.randomUUID` | Shorter IDs, browser-compatible without polyfill |
| Rich text sanitisation | DOMPurify | Custom sanitiser | Industry-standard XSS prevention for `contenteditable` sticky notes |
| Ink smoothing | Catmull-Rom spline (custom) | Perfect Freehand library | Lightweight; straightforward to implement in SVG |

---

## 8. What a Human Senior Engineer Would Do Differently

In the spirit of full transparency, here is an honest assessment of what a human senior engineer might choose differently:

1. **Add automated tests for pure domain functions.** The lint engine, scoring engine, and code generators are pure functions that are trivially unit-testable. A 200-line Vitest test suite covering edge cases (cyclic inheritance, enum inheritance, fuzzy name matching boundaries) would have caught bugs faster.

2. **Use React Query or SWR for data fetching** if/when a backend is added. The current localStorage + Zustand approach is correct for client-only, but the abstraction boundary for "data" vs "UI state" would benefit from a dedicated data-fetching layer before adding server state.

3. **Separate the landing page as a distinct route.** Currently the landing page lives at `/` and the app shell appears when the user clicks "Get Started." A true SPA router (React Router or TanStack Router) with `/` for the landing page and `/studio` for the app shell would be cleaner.

4. **Internationalise the UI early.** All UI strings are hardcoded. Adding i18n later is a significant refactor. Given the product's target user base (Indian engineering students), a Hindi localisation could meaningfully expand reach.

5. **Instrument with Posthog or Mixpanel from day one.** Without analytics, the product metrics framework in the PM overview (Section 7) is aspirational. Adding a privacy-respecting analytics layer at launch would generate the activation and retention data needed to make informed product decisions.

---

## 9. Summary

| Metric | Value |
|---|---|
| Total phases | 37 |
| Lines of TypeScript authored by AI | ~12,000 |
| Lint rules designed and implemented | 14 |
| Languages in the code generator | 6 |
| LLD problems with full reference solutions | 10 |
| Scoring dimensions | 5 |
| Explainable feedback lenses | 4 |
| GSAP animation sequences | ~20+ |
| Post-launch bugs identified and fixed by AI | 1 (reference solution selector bug) |
| Automated test files committed | 0 (explicit project constraint) |
| Backend services | 0 |
| Human lines of code | 0 (all code AI-authored) |

The AI functioned as the sole engineer — designing systems, making architectural decisions, writing code, running verification, catching bugs, and iterating — with the human acting as product owner, directing priorities and approving direction.

---

*This document was authored by the AI agent (Google Gemini / Antigravity IDE) as a transparency disclosure and is intended to be read alongside `PRD.md`, `DESIGN.md`, and `PHASES.md`.*
