# Phase 14 — Codegen Core + Java/Python

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 13](./13-lint-engine-issues-panel.md) · [Phase 15 →](./15-codegen-remaining-languages-code-panel-ui.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 13 — Lint Engine + Issues Panel](./13-lint-engine-issues-panel.md)

Reads that same live model, via the same derivation pattern Phase 13 established, and turns it into generated source instead of lint findings.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 15 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the pure `generateCode()` function exists with the `CodeGenerator` interface from `PRD.md` §22.2 rule 4, and Java + Python implemented to match the exact observed outputs in `PRD.md` §9.10 (these two are pinned by real screenshots — get them byte-exact before moving to the other four languages).

## 3. What to Build

**Files to create:** `src/domain/codegen/index.ts`, `types.ts`, `typeMap.ts`, `ordering.ts`, `languages/java.ts`, `languages/python.ts`.

**Step-by-step:**
1. `ordering.ts`: implement dependency-first ordering — enums, then interfaces, then abstract classes, then concrete classes (BR41), stable within each group by creation order.
2. `typeMap.ts`: the cross-language type table from `PRD.md` §9.10 (`String→str`, `long→int`, `void→None`, etc. for Python; identity mapping for Java).
3. `CodeGenerator` interface: `generate(diagram: Diagram, options: CodeOptions): string`.
4. **Java generator** — reproduce `PRD.md` §9.10's exact contract: enums as `public enum X { LITERAL_A, LITERAL_B; }`; abstract classes as `public abstract class X { ... }`; Realize → `implements`; Inherit → `extends`; constructor emits all-args when the `constructor` option is on; getters/setters follow immediately after; every method body is `// TODO`; `toString` is `@Override`-annotated, format `ClassName{field=value, ...}`; `equals/hashCode` on adds `import java.util.Objects;` as the first line; imports only emitted when needed.
5. **Python generator** — reproduce §9.10's exact contract: `from abc import ABC, abstractmethod` only when an abstract/interface class exists; private attributes get a single-underscore prefix; attributes initialize to type-appropriate zero values (`0`, `""`, not bare declarations); `toString`→`__repr__`; method bodies are `pass`; **Getters/Setters option is ignored** (produces no accessor methods) — this is an intentional per-language override, implement it as such, not as a bug.
6. `generateCode(diagram, language, options)` dispatches to the matching generator; unsupported languages (Phase 15's remaining four) can throw/return a placeholder for now.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** none beyond the base tokens — this phase is non-visual.

**UI consistency checklist:** N/A — pure domain layer, no UI yet (wired in Phase 15).

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:** N/A — no UI wired yet.

### White-Box Testing (Internal State Inspection)

**Verification — White-box (this phase is almost entirely white-box):**
1. Scratch-script (per §0.2): build the `Vehicle`/`VehicleType`/`Car` fixture from `PRD.md` Appendix A, call `generate(fixture, 'java', defaultOptions)`. **Expected:** output matches `PRD.md` §9.10's Java block **exactly** — same import line, same enum formatting, same constructor/getter/setter shape. Diff line by line.
2. Same fixture with the `NewClass0 implements NewClsdsd` scenario from `PRD.md` §9.10, `toString`+`equals/hashCode` on. **Expected:** output matches that exact block, including `@Override`, the `Objects` import, and the `toString` body format.
3. Call `generate(fixture, 'python', {..., gettersSetters:true})`. **Expected:** output matches §9.10's Python block exactly, **and confirms no getter/setter methods appear** despite the option being on.
4. Call `generate(fixture, 'java', options)` twice. **Expected:** byte-identical output both times (purity).
5. Delete the scratch script when done.

### Definition of Done (Exit Criteria)

**Definition of Done:** Java and Python outputs are **byte-for-byte** matches to `PRD.md` §9.10's quoted blocks on the reference fixture. This is the highest-precision verification in the whole plan — do not approximate.

### Scope Boundaries — Do NOT

**Do NOT:** wire this to any UI yet, and do not implement TypeScript/JavaScript/C++/C# yet — Phase 15 does that once the pattern is proven correct on the two pinned languages.

---

## 6. Next Phase

Continue to [Phase 15 — Codegen Remaining Languages + Code Panel UI](./15-codegen-remaining-languages-code-panel-ui.md).
