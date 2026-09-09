# ClassForge — LLD Interview Studio
### Reverse‑engineering & replication report

**Target:** https://lld-simulator-zeta.vercel.app/
**Product name (from page metadata):** ClassForge — LLD Interview Studio
**Date researched:** 2026-09-08

---

## 1. Executive summary

ClassForge is a browser-based, canvas-driven **UML class‑diagram editor purpose-built for Low‑Level‑Design (LLD) interview practice**. A candidate drags class-like "nodes" (Class / Abstract / Interface / Enum / Record) onto an infinite canvas, wires them together with typed UML relationship edges (Inherit, Realize, Compose, Aggregate, Associate, Depend), and the tool:

1. Live-validates the diagram (an "Issues" counter in the inspector),
2. Generates real source code (Java / Python / TypeScript / C#) from the diagram, and
3. Offers a library of **canonical LLD interview problems** (Parking Lot, Elevator, Rate Limiter, etc. — implied by the "LLD Problems" nav tab) that a candidate can attempt and get scored against a **verified reference solution**.

It's a single-page, client-heavy, no-login (or optional-login) tool — the presence of "Export / Import / Sample / Clear" buttons and a "Buy me a coffee" link strongly suggests a solo-built, freemium, **local-first** app (diagrams live in the browser and are exported/imported as files, not synced to server-side user accounts).

This report is organized as a set of **depth layers** — from what a user sees, down to the data model and engine you'd need to build to clone it — followed by a concrete replication plan.

---

## 2. Research method & what could and couldn't be verified

I don't have access to ClassForge's source repository, bundle, or API — only what a normal visitor's browser receives. So this report separates:

- **🟢 Observed** — literally present in the fetched page (copy, labels, meta tags, interaction hints).
- **🟡 Inferred (high confidence)** — not stated outright, but strongly implied by a specific technical fingerprint (e.g. exact wording that a known library injects automatically).
- **⚪ Inferred (design proposal)** — my own reasonable architecture for *how you'd build something that behaves like this*, since the JS bundle itself wasn't inspectable from here (only same-origin/whitelisted domains are fetchable, and no public GitHub repo for this exact project turned up in search).

No code was copied from the target — everything below is a fresh design based on observed *behavior*, not decompiled source, which is also just how you should approach cloning any product: mimic function, not scrape implementation.

---

## 3. Layer 0 — Product framing (what it *is*)

| Aspect | Detail |
|---|---|
| Category | Diagram-first developer tool / interview-prep SaaS |
| Core loop | Draw diagram → validate → generate code → (optionally) grade against a canonical LLD problem's reference solution |
| Audience | SDE-2/SDE-3 candidates prepping for "Machine Coding" / LLD rounds (Uber, Flipkart, Swiggy, Amazon-style rounds — the same genre as LeetCode but for OOP design) |
| Monetization signal | "Buy me a coffee" → indie, donation-based, not enterprise SaaS |
| Auth signal | No login/signup control visible in the shell → likely anonymous-by-default, browser-local state |
| Meta description (🟢 observed) | *"ClassForge is an interactive low-level-design studio — draw UML class diagrams on a canvas, generate Java/Python/TypeScript/C# code, practice classic LLD interview problems, and get scored against verified reference solutions."* |

---

## 4. Layer 1 — Presentation / chrome (🟢 observed)

Top nav bar:

- **Brand:** "ClassForge"
- **Mode switch (two tabs):** `LLD Studio` (the free-form diagram canvas) vs `LLD Problems` (the curated problem bank / practice mode)
- **Toolbar:** `Sample` (loads a demo diagram) · `Export` · `Import` · `Clear`
- **External link:** `Buy me a coffee`

This is a classic **two-mode IA**: a *sandbox* (Studio) and a *curriculum* (Problems), sharing the same canvas/editor engine underneath.

---

## 5. Layer 2 — Canvas / diagramming layer (🟢 observed, 🟡 inferred library)

### 5.1 Left palette — "Add class · drag onto canvas"
Draggable node kinds, each mapping to a real OOP construct:

| Kind | Meaning |
|---|---|
| Class | Concrete class |
| Abstract | Abstract class |
| Interface | Interface/protocol |
| Enum | Enumeration |
| Record | Immutable data carrier (Java 16+ `record` / C# `record` / Python `dataclass`) |

Including `Record` alongside the classic four is a deliberate, modern-OOP touch — it signals the code generator targets *current* language versions, not textbook-1999 UML.

### 5.2 Relationship palette — "Relationship · drag node → node"
Six canonical UML edge types, each with its own **glyph** (rendered as literal Unicode arrow glyphs in the DOM):

| Glyph | Relationship | UML meaning | Typical codegen mapping |
|---|---|---|---|
| ▷ | Inherit | Generalization | `extends` |
| ▷ (dashed) | Realize | Interface implementation | `implements` |
| ◆ | Compose | Composition (strong "owns", lifecycle-bound) | field + constructor-initialized, no external setter |
| ◇ | Aggregate | Aggregation (weak "has-a") | field with injected/settable reference |
| → | Associate | Plain association | field reference |
| ⇢ | Depend | Dependency (uses-a, e.g. method parameter) | method parameter / local usage only, no stored field |

Interaction model (🟢 observed instruction text): *"Pick a type, then drag from one class's edge to another to connect them."* — i.e., relationship type is selected **before** drawing, not chosen after (a small but important UX decision — avoids a post-hoc "what kind of arrow is this" modal).

### 5.3 Annotation tool
- **Sticky note** — free-text canvas annotation, not part of the formal class model (used for margin notes like "assume single-threaded" or interviewer hints).

### 5.4 Keyboard / accessibility model (🟡 inferred library = React Flow / `@xyflow/react`)
Observed hint text is close to verbatim boilerplate:

> *"Press enter or space to select a node. You can then use the arrow keys to move the node around. Press delete to remove it and escape to cancel."*
> *"Press enter or space to select an edge. You can then press delete to remove it or escape to cancel."*

This exact select→arrow-move→delete→escape pattern is the accessibility contract shipped by **React Flow (now `@xyflow/react`)**, the dominant open-source node/edge canvas library in the React ecosystem. Combined with:
- a Next.js fingerprint (`meta-next-size-adjust` — a tag Next.js auto-injects when you use `next/font`),
- a very dark `theme-color` (`#09090b`, i.e. Tailwind's `zinc-950`),
- `viewport-fit=cover, interactive-widget=resizes-content` (a modern mobile-keyboard-aware viewport meta, common in Tailwind + shadcn/ui stacks),

…the most probable stack is **Next.js (App Router) + React + `@xyflow/react` for the canvas + Tailwind CSS (+ likely shadcn/ui for the panel/button components)**, deployed on Vercel.

---

## 6. Layer 3 — Inspector / validation layer (🟢 observed shell, ⚪ inferred behavior)

Right-hand panel:

- **Header:** `inspector`
- **Live counter:** `Issues 0`
- **Tabs:** `code` · `notes`
- **Empty-state copy:** *"Select a class or arrow to edit it. Drag a kind from the left palette to add one."*

The `Issues` counter is the tell for a **rule-based linter running against the live diagram graph**, most plausibly checking things like:
- Orphan class (no relationships at all)
- Interface with zero `Realize` edges pointing at it
- Abstract class with zero children
- Circular `Inherit` chains
- Multiple inheritance where the target language doesn't support it (e.g. Java class extending two classes)
- Composition edge without a clear owning multiplicity
- Duplicate class/member names

This is effectively a **tiny static-analysis pass over a graph**, evaluated on every mutation (add node, add edge, rename, delete) — cheap enough to run synchronously client-side since diagrams are small (tens of nodes, not thousands).

---

## 7. Layer 4 — Code generation layer (🟢 observed target languages, ⚪ inferred engine design)

Target languages (🟢 from meta description): **Java, Python, TypeScript, C#**.

To support four languages from one diagram, the only sane architecture is a **two-stage pipeline**, not four hand-written generators:

```
[Canvas graph: nodes + typed edges]
        │  (serialize)
        ▼
[Intermediate Model — language-agnostic]
  ClassDef {
    name, kind: Class|Abstract|Interface|Enum|Record,
    fields: [{name, type, visibility, isReadonly}],
    methods: [{name, params, returnType, visibility, isAbstract}],
    relations: [{targetId, kind: Inherit|Realize|Compose|Aggregate|Associate|Depend, multiplicity?}]
  }
        │  (per-language emitter, template-based)
        ▼
[Java emitter] [Python emitter] [TS emitter] [C# emitter]
        │
        ▼
   syntax-highlighted code panel (the "code" tab in the inspector)
```

Each emitter is a small, mostly-mechanical mapper:
- `Inherit` → `extends` (Java/TS/C#) or base-class tuple (Python)
- `Realize` → `implements` (Java/TS/C#) or ABC/mixin (Python — no true interfaces)
- `Compose`/`Aggregate`/`Associate` → typed field + constructor param (with composition typically forcing the field to be constructed *inside* the owner rather than passed in)
- `Depend` → shows up only in a method signature, never as a stored field
- `Enum`/`Record` → native language constructs where they exist (Java 16+, C# 9+), or best-effort equivalents in Python/TS (`Enum` class / union type, `@dataclass` / plain interface+object)

The code panel almost certainly uses a browser code editor component (Monaco or CodeMirror) for syntax highlighting + read-only display, possibly with a copy-to-clipboard action.

---

## 8. Layer 5 — LLD Problems / practice layer (⚪ inferred, based on "LLD Problems" tab + meta description)

The meta description explicitly promises: *"practice classic LLD interview problems, and get scored against verified reference solutions."* A plausible internal shape:

```
Problem {
  id, title, difficulty, tags: [SOLID, "Strategy Pattern", concurrency…],
  promptMarkdown,            // functional + non-functional requirements
  starterGraph?,             // optional pre-seeded partial diagram
  referenceSolutionGraph,    // the canonical "answer" diagram
  scoringRubric: [
    { check: "Has Strategy-shaped interface for fee calculation", weight },
    { check: "No violation of SRP (class touches >1 responsibility)", weight },
    { check: "Uses Factory or equivalent for object creation", weight },
    …
  ]
}
```

Scoring is very likely **structural graph comparison + rule checks**, not free-text/LLM grading (though an LLM-based rubric grader is a very natural v2 feature — "does this design reasonably satisfy X" is a good fit for an LLM judge on top of the same rubric).

---

## 9. Layer 6 — Persistence layer (🟢 observed buttons, ⚪ inferred mechanics)

- **Sample** → loads a bundled demo `.json` diagram into canvas state.
- **Export** → serializes current canvas (nodes+edges+metadata) to a downloadable `.json` file.
- **Import** → file picker → parse `.json` → hydrate canvas state.
- **Clear** → wipes canvas state (with likely a confirm step, not observed).

No visible account system → state most likely lives in **React state + `localStorage`/`sessionStorage` autosave**, with Export/Import as the "real" save mechanism (portable, no backend required). This is consistent with a solo/Vercel-hobby-tier deployment — no DB, no auth, near-zero infra cost.

---

## 10. Full architecture (proposed, ⚪)

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App (Vercel)                                        │
│                                                                │
│  ┌───────────────┐   ┌────────────────────┐   ┌────────────┐ │
│  │ Palette panel │   │   Canvas (xyflow)   │   │ Inspector  │ │
│  │ (kinds/edges) │──▶️│  nodes + typed edges│──▶️│ code/notes │ │
│  └───────────────┘   └─────────┬───────────┘   └─────┬──────┘ │
│                                 │                      │        │
│                        ┌────────▼────────┐   ┌─────────▼─────┐ │
│                        │ Diagram state    │   │ Codegen engine │ │
│                        │ (Zustand/Context)│──▶️│ (IR → 4 langs) │ │
│                        └────────┬─────────┘   └────────────────┘│
│                                 │                                │
│                        ┌────────▼─────────┐                     │
│                        │ Validator/Linter  │  → "Issues N"       │
│                        └───────────────────┘                     │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ LLD Problems module: problem bank (MD/JSON) + reference    │  │
│  │ graphs + rubric scorer, reusing the same diagram engine    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Persistence: localStorage autosave + Export/Import (.json file) │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Suggested tech stack to replicate it

| Concern | Recommended choice | Why |
|---|---|---|
| Framework | **Next.js (App Router)** | Matches the fingerprint; great Vercel DX |
| Canvas / diagram engine | **`@xyflow/react` (React Flow)** | Purpose-built node/edge canvas, built-in a11y matching what's observed, custom node/edge renderers for UML glyphs |
| Styling | **Tailwind CSS** + **shadcn/ui** | Matches dark zinc theme, fast to build panel/toolbar UI |
| Diagram state | **Zustand** (React Flow's docs favor it) | Simple, fast, easy to serialize for Export/Import |
| Code editor / display | **Monaco Editor** or **CodeMirror 6** (read-only mode) | Syntax highlighting for 4 languages |
| Codegen engine | Hand-rolled **IR + per-language template emitters** (plain TS functions, no need for a heavy templating lib at this scale) | Diagrams are small; simplicity > power |
| Validation/linter | Pure functions over the graph, run on every state change | Cheap, synchronous, no server round-trip needed |
| Problem bank content | **MDX or JSON files in-repo** (no CMS needed at this scale) | Matches solo-dev, static-content pattern |
| Persistence | `localStorage` + file Export/Import (`.json`) | No backend/auth required for MVP |
| Hosting | **Vercel** (free tier) | Matches observed deployment |
| Optional v2 | Auth (Clerk/Supabase) + Postgres for saved diagrams across devices, LLM-based rubric grading for the Problems mode | Natural extension once there's a login |

Given your existing experience with **React Three Fiber / GSAP / Lenis** for animation-heavy front-ends, this project is very much in your wheelhouse — the hardest parts to get *right* (not just working) are:
1. **Custom React Flow node components** that look like real UML class boxes (name / attributes / methods sections, resize handles), and
2. **The IR → 4-language codegen layer**, which is the actual differentiator vs. a generic diagram tool.

---

## 12. Suggested build order (MVP → v1)

1. **Canvas skeleton** — React Flow wired up with 5 custom node types (Class/Abstract/Interface/Enum/Record) and 6 custom edge types with the correct UML arrowheads (triangle/diamond markers via SVG `marker-end`).
2. **Node editing** — click a node → inspector shows an attribute/method editor (name, type, visibility) that writes back into node data.
3. **Serialization** — Export/Import to JSON; Sample/Clear.
4. **Codegen v1** — start with **one** language (Java is the natural first target for LLD interviews) end-to-end through the IR, then add Python/TS/C# emitters.
5. **Linter v1** — 4–5 simple rules (orphan node, unrealized interface, duplicate names, cyclic inheritance) feeding the `Issues` counter.
6. **LLD Problems mode** — 5–10 hand-authored problems (Parking Lot, Elevator, Tic-Tac-Toe, Rate Limiter, Splitwise) each with a prompt + reference graph + a handful of rubric checks reusing the linter infrastructure.
7. **Polish** — sticky notes, keyboard a11y parity, dark theme, mobile viewport handling.

---

## 13. Open questions this research couldn't resolve

- Exact grading algorithm for "scored against verified reference solutions" (rule-based graph diff vs. LLM judge vs. hybrid) — not observable without exercising the Problems flow or the network calls it makes.
- Whether there's any backend at all (an API route for LLM-assisted grading would be the one plausible reason to have a server component beyond static hosting).
- Whether diagrams sync across devices (no login UI was visible, but that doesn't rule out an optional account).

These would require actually interacting with the live app (clicking into "LLD Problems," attempting a problem, and inspecting network requests) rather than a single static fetch — worth doing manually before you start building if you want 1:1 feature parity rather than a spiritual clone.\