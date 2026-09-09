# Phase 22 — Explainable Feedback Engine (Responsibilities, Abstractions, Relationships, Trade-offs)

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 21](./21-scoring-engine-score-result-modal.md) · [Phase 23 →](./23-submission-history-repeated-practice.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 21 — Scoring Engine + Score Result Modal](./21-scoring-engine-score-result-modal.md)

Takes Phase 21's raw ScoreResult and the same diagram it was computed from, and adds the qualitative, explainable analysis layer §0.8 demands — this phase does not replace Phase 21, it sits beside it in the same modal.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 23 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** deepen Phase 21's numeric score into the actual product mandate from §0.8 — four independent, explainable analyzers that inspect the learner's submitted diagram and produce specific, node/edge-anchored findings a learner can act on, not just a percentage.

**Context carried forward:** `PRD.md` §9.6 (scoring, the quantitative floor this phase builds on top of), §16.2 (`ScoreResult` shape, extended here rather than replaced), §14.3 (lint rule grammar — reuse its "subject + explanation" tone), Appendix A (Parking Lot reference — the primary fixture for verifying findings are correct). §0.8 above is the governing brief for this phase; do not undershoot it by collapsing these four lenses back into a single number.

## 3. What to Build

**Files to create:** `src/domain/feedback/types.ts`, `index.ts` (`buildFeedbackReport`), `responsibilities.ts`, `abstractions.ts`, `relationships.ts`, `tradeoffs.ts`; modify `src/components/practice/ScoreResultModal.tsx`; create `FeedbackSection.tsx`, `FindingCard.tsx`.

**Step-by-step:**
1. `types.ts`: `FeedbackFinding { id, lens: 'responsibilities'|'abstractions'|'relationships'|'tradeoffs', severity: 'positive'|'suggestion'|'concern', subjectNodeIds: Id[], subjectEdgeIds: Id[], title: string, explanation: string, suggestedFix?: string }`. `FeedbackReport { findings: FeedbackFinding[], summaryByLens: Record<Lens, {positive:number, suggestion:number, concern:number}> }`.
2. **Responsibilities analyzer** (`responsibilities.ts`, pure, no reference diagram needed): flag a node whose member count (attributes + methods) is far above the diagram's median (e.g. > 2× median **and** ≥ 8 members) as an oversized/god-class `concern`. Flag a method whose name strongly matches another node's domain (simple string/keyword heuristic — e.g. a `calculateFee` method sitting on `ParkingLot` when a fee-shaped node exists elsewhere) as a misplaced-responsibility `suggestion`. Emit a `positive` finding for classes with a small, name-cohesive member set — reinforcement, not just criticism, matching the "matched" positive-first pattern already established in `PRD.md` §9.6.
3. **Abstractions analyzer** (`abstractions.ts`, diffs against the problem's `referenceDiagram`): for every `INTERFACE`/`ABSTRACT` node in the reference with ≥2 concrete realizers/subclasses (a strong signal "this domain varies, and the reference modelled that variation as an abstraction"), check via Phase 21's `nameMatch` whether the user's diagram has an equivalent abstraction. If the user instead handles that variation with a single concrete class (or an enum-typed attribute with no corresponding interface), emit a `concern`: name the missing abstraction, explain *why* the reference introduced it, e.g. *"The reference introduces a `FeeStrategy` interface because pricing varies by strategy — your design doesn't have an equivalent; consider extracting an interface so a new pricing scheme doesn't require editing `ParkingLot`."* If the user has a matching abstraction, emit a `positive`.
4. **Relationships analyzer** (`relationships.ts`, diffs against the reference, reusing Phase 21's node matching): for every matched node pair, compare relationship **type**, **direction**, and **multiplicity** between user and reference. Turn each mismatch into a specific worded finding rather than the bare percentage Phase 21 already computes — e.g. *"You connected `ParkingLot` to `HourlyFeeStrategy` directly with Associate; the reference associates through the `FeeStrategy` interface instead — connecting to the concrete class couples the lot to one pricing scheme."* A relationship present in the reference but entirely absent from the user's diagram is a `concern`; a present-but-wrong-type relationship is a `suggestion`; a correct match is a `positive`.
5. **Trade-offs analyzer** (`tradeoffs.ts`, heuristic, works with or without a reference): detect (a) a **hard-coded-variant smell** — 3+ concrete classes inheriting one abstract/interface with near-identical single-field differences and no strategy-shaped collaborator → suggest Strategy/Factory; (b) a **missing-factory smell** — a class whose methods appear to select and return one of several concrete subtypes by a parameter → suggest a factory; (c) a **tight-coupling smell** — a class directly associated to more than a small threshold (e.g. 3) of *concrete* (non-abstract/interface) classes → suggest depending on an abstraction instead. Emit a `positive` when a Strategy/Factory-shaped pattern **is** present (an interface with ≥2 realizers referenced by another class) — acknowledge the good trade-off explicitly, don't just stay silent on things done right.
6. `buildFeedbackReport(userDiagram, referenceDiagram)`: runs all four analyzers, concatenates findings, computes `summaryByLens` by counting severities per lens. Pure function, no store/React imports (same domain-layer discipline as Phase 13/14).
7. Wire into `ScoreResultModal` (from Phase 21): add four collapsible `FeedbackSection`s (one per lens), each rendering its `FindingCard`s. Each card reuses `IssueRow`'s visual grammar from Phase 13 (severity dot + mono subject + sans explanation) — `positive` uses `--success`, `suggestion` uses `--warning-soft`/`--warning`, `concern` uses `--warning` (reserve `--danger` for structural lint errors already surfaced in Issues, not for practice feedback — keep the tone constructive, not alarming). Clicking a card selects and centers its subject node(s)/edge(s) on canvas, reusing Phase 13's issue-row-click pattern.
8. Sort findings **concerns → suggestions → positives** within each lens, and surface a flattened, deduplicated, ranked **"Top 3 things to improve next"** list (concerns/suggestions only) at the top of the modal, above the four lens sections — this directly satisfies §0.8 point 5 ("a concrete, prioritized what-to-change-next list").

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.

**UI consistency checklist:** `FindingCard` must look and read like `IssueRow` (same component family, `DESIGN.md` §5's row conventions) — the app should have exactly one visual language for "here's something about your design," not two competing ones between the Issues panel and this modal.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Model a Parking Lot attempt where `FeeStrategy` is skipped (hourly-fee logic hard-coded as a method directly on `ParkingLot`). Submit for scoring. **Expected:** the Abstractions section shows a `concern` naming `FeeStrategy` specifically with a real explanation; clicking it centers the `ParkingLot` node on canvas.
2. Model one class with ~15 attributes/methods. **Expected:** Responsibilities flags it as oversized.
3. Connect `ParkingLot` directly to a concrete payment class instead of through `PaymentStrategy`. **Expected:** Relationships explains the specific mismatch in words, referencing both class names.
4. Model the vehicle hierarchy correctly (matching the reference's `Vehicle`/`Car`/`Bike`/`Truck` abstraction). **Expected:** a `positive` finding appears acknowledging the correct use of inheritance — not silence, not a false concern.
5. Confirm the "Top 3 things to improve next" list appears above the four lens sections, is ranked, deduplicated, and every item is clickable to jump to its subject node.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Scratch-script (§0.2): `buildFeedbackReport(fixtureMissingFeeStrategy, parkingLotReference)`. **Expected:** the findings array contains exactly one `abstractions` finding with `severity:'concern'`, naming `FeeStrategy`, and `subjectNodeIds` pointing at the correct `ParkingLot` node id. Delete the script after confirming.
2. Call `buildFeedbackReport` twice on identical input. **Expected:** deep-equal output both times (purity, matching the discipline established in Phase 13/14).

### Definition of Done (Exit Criteria)

**Definition of Done:** all four lenses each produce at least one *verifiably correct* finding against both a deliberately-flawed and a well-done version of the Parking Lot fixture; the Top-3 summary is present, ranked, and correct.

### Scope Boundaries — Do NOT

**Do NOT:** promote any of these findings into hard Issues-panel lint errors (Phase 13) — these are softer, pedagogical, and scoped only to a scored submission, not to general modelling at all times. Do NOT collapse the four lenses back into Phase 21's single score — they must remain separately visible, per §0.8.

---

## 6. Next Phase

Continue to [Phase 23 — Submission History & Repeated Practice](./23-submission-history-repeated-practice.md).
