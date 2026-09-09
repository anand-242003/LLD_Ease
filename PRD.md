# ClassForge — LLD Studio
## Reverse-Engineered Product Requirements Document (Implementation-Ready)

**Document version:** 1.0
**Date:** 2026-09-08
**Source materials:** 27 screenshots (`images/`), `INFO.MD` (**empty — 0 bytes, contributed nothing**)
**Intended reader:** an engineer or coding LLM rebuilding this application from scratch with no access to original source, database, or design files.

---

### How to read this document

Every factual claim is tagged with one of three confidence markers. **Do not treat inference as fact.**

| Tag | Meaning |
|---|---|
| **[OBS]** | **Observed.** Directly visible in a screenshot. Reproduce exactly. |
| **[INF]** | **Strong inference.** Not directly visible, but the evidence makes it highly likely. Implement as described; deviation is a bug. |
| **[ASM]** | **Implementation assumption.** Evidence is silent. A reasonable choice is specified so the system is buildable. Free to change if a better option exists, but be consistent. |

Screenshots are referenced by index `S1`–`S27`, mapping to `images/` sorted by filename (timestamp order). The index table is in §4.

---

# 1. Executive Summary

**ClassForge — LLD Studio** is a single-page, browser-based **UML class-diagram editor purpose-built for practicing Low-Level Design (LLD) interview problems**. **[OBS]**

It combines four capabilities that are usually separate tools:

1. **A visual UML class-diagram editor.** Drag class-like nodes (Class, Abstract, Interface, Enum, Record) onto an infinite dotted canvas, edit their attributes and methods in a structured inspector, and connect them with the six standard UML relationships (Inherit, Realize, Compose, Aggregate, Associate, Depend). **[OBS]**
2. **A curated LLD problem library.** A modal catalogue of classic interview problems (Parking Lot, Splitwise, Elevator System, Vending Machine, Library Management, Tic-Tac-Toe), each with a difficulty rating, the design patterns it exercises, a requirements brief, and a **verified reference solution** that can be loaded as a read-only diagram tab. **[OBS]**
3. **A live code generator.** The diagram is continuously compiled into idiomatic source in six languages (Java, Python, TypeScript, JavaScript, C++, C#) with toggleable emission of constructors, getters/setters, `toString`, `equals`/`hashCode`, and doc comments. **[OBS]**
4. **A design linter and a practice/scoring loop.** A rules engine continuously validates the model and reports human-readable problems ("`NewClsdsd` — "NewClass0" realizes "NewClsdsd" which is not an interface."). In Practice mode the user models a problem from its brief alone and then asks to be **scored against the reference solution**. **[OBS]**

Around this sit whiteboard affordances — freehand ink annotation and repositionable rich-text sticky notes — so the canvas doubles as a thinking surface, not just a formal modeller. **[OBS]**

**The single most important architectural fact:** there is **no authentication, no account, no server-side persistence, and no multi-user concept anywhere in the 27 screenshots.** There is no login screen, no avatar, no user menu, no settings page, no sync indicator. Persistence is described in-product as *"saved automatically"* and *"persist across reloads"* — the vocabulary of local browser storage, not of a backend. **The application should be built as a 100% client-side SPA with `localStorage` persistence and zero required backend.** **[INF — high confidence, see §16 and §27-U1]**

### What the product is *for*

The user is an engineer preparing for an LLD/OOD interview round. The loop the product is designed around is:

> *Open the problem library → read a problem's requirements → attempt the design on a blank canvas from the brief alone → have the tool catch your UML mistakes as you go → ask to be scored against the verified solution → reveal the reference and compare → generate real code from your model to confirm it holds up.*

Every feature in the screenshots serves that loop. The code generator is not a codegen product — it is a **feedback mechanism** that proves the model is coherent. The linter is not a style checker — it is an **interview-mistake detector**. The reference tabs are locked because they are **answer keys**.

### Scale and shape

- **One page.** No routing between distinct pages in the traditional sense; the entire product is one workspace with one modal and one right-panel tab group. **[OBS/INF]**
- **Three floating layers over one canvas:** nodes+edges (React Flow), sticky notes, ink strokes. **[OBS]**
- **Four right-panel tabs:** Inspector, Issues, Code, Notes. **[OBS]**
- **Two document kinds:** the user's own editable "My Design", and any number of read-only "— Reference" tabs. **[OBS]**
- **Two canvas modes:** Normal and Practice. **[OBS]**

---

# 2. Product Overview

## 2.1 Product name and identity

- **Product name:** ClassForge **[OBS]**
- **Tagline / product line:** "LLD STUDIO", rendered beneath the wordmark in small uppercase letterspaced muted text. **[OBS]**
- **Logo:** a rounded-square tile (~36×36, radius ~10) with a teal→cyan gradient fill, containing a white line-art glyph of three connected circles (a molecule / node-graph mark). Sits at the far left of the header. **[OBS]**
- **Monetisation:** a single amber "Buy me a coffee" button in the header. There is no pricing page, no paywall, no subscription state, no locked feature. The product is free; the button is a donation link. **[OBS + INF]**

## 2.2 Target user

An engineer studying for low-level-design / object-oriented-design interviews. Secondary: a developer sketching a class model, or an educator demonstrating UML and design patterns. **[INF]** — derived from the problem set (all canonical LLD interview questions), the pattern tags (Strategy, Factory, Singleton, State, Aggregate Root), and the phrase *"practice and get scored"*. **[OBS]**

## 2.3 Core value proposition

Existing tools force a choice: *draw* UML (Lucidchart, draw.io — no semantics, no feedback) or *write* code (an IDE — no visual model, no problem set). ClassForge sits between them: the diagram is a **semantic model** that can be validated, compiled, and graded. **[INF]**

## 2.4 Terminology (use these exact terms in code and UI)

| Term | Meaning |
|---|---|
| **Diagram** / **Document** | One tab's worth of content: nodes, edges, notes, ink, scratch notes. |
| **My Design** | The user's own editable diagram. Exactly one exists, always present, never closable. **[OBS]** |
| **Reference tab** | A read-only diagram loaded from a problem's verified solution. Titled `"<Problem> — Reference"`, marked with a lock icon and a `REF` badge, closable. **[OBS]** |
| **Kind** | The classifier type of a node: Class, Abstract, Interface, Enum, Record. **[OBS]** |
| **Node** / **Class box** | One classifier rendered on canvas. |
| **Relationship** / **Edge** | A typed connection between two nodes. |
| **Relationship type** | Inherit, Realize, Compose, Aggregate, Associate, Depend. **[OBS]** |
| **Attribute** | A field on a classifier. **[OBS]** |
| **Method** / **Operation** | A behaviour on a classifier. Palette label is "method"; canvas section header concept is "operations" (empty placeholder reads *"no operations"*). **[OBS]** |
| **Issue** / **Problem** | One linter finding. Panel is "Issues"; empty state says "No problems". **[OBS]** |
| **Sticky note** | A repositionable coloured rich-text note on canvas. **[OBS]** |
| **Ink** / **Stroke** | A freehand pen annotation on canvas. **[OBS]** |
| **Scratch notes** | The free-text notepad in the Notes tab, one per diagram. **[OBS]** |
| **Practice mode** | Canvas state where the user models a problem from its brief with the reference hidden. **[OBS]** |
| **Brief** | A problem's requirement text. **[OBS]** |

## 2.5 Explicitly NOT part of the application

**Critical for the implementer.** The top ~44px of every screenshot — a dark purple-grey strip containing a 4-square grid icon on the left and a folder icon with the text "All Bookmarks" on the right — is **Google Chrome's bookmarks bar**. It is browser chrome captured in the screenshot, **not application UI**. Do not build it. **[OBS + INF, high confidence]**

Likewise, `S26` shows the **native macOS file picker** (Recents / Shared / Favorites / iCloud Drive / Google Drive, Cancel / Open buttons). This is the OS dialog raised by a hidden `<input type="file">`. Do not build a custom file browser. **[OBS]**

---

# 3. Goals and Non-Goals

## 3.1 Product goals

| # | Goal | Evidence |
|---|---|---|
| G1 | Let a user construct a semantically valid UML class model quickly, by direct manipulation. | Palette + canvas + inspector **[OBS]** |
| G2 | Catch UML/OOP modelling mistakes the moment they are made, in plain language. | Issues panel with live badge count **[OBS]** |
| G3 | Prove the model is real by compiling it to idiomatic code in the user's language of choice. | Code tab, 6 languages **[OBS]** |
| G4 | Provide a curated, difficulty-graded set of canonical LLD problems with verified solutions. | Problem library modal **[OBS]** |
| G5 | Support deliberate practice: attempt blind, then be scored against the reference. | Practice banner + "Score my solution" **[OBS]** |
| G6 | Let the canvas double as a thinking surface (ink, stickies, scratch notes). | Ink toolbar, sticky notes, Notes tab **[OBS]** |
| G7 | Never lose the user's work; survive refresh with zero user action. | "saved automatically", "persist across reloads" **[OBS]** |
| G8 | Let work leave the tool: PNG, SVG, reloadable JSON, and generated source files. | Export menu, Copy/Download in Code tab **[OBS]** |
| G9 | Require zero setup — no signup, no install, no configuration. | Absence of any auth UI **[INF]** |

## 3.2 Non-goals

| # | Non-goal | Rationale |
|---|---|---|
| N1 | User accounts, login, profiles. | No auth UI in any screenshot. **[INF]** |
| N2 | Real-time collaboration / multiplayer. | No presence, cursors, avatars, or share UI. **[INF]** |
| N3 | Cloud sync across devices. | Persistence language is local-only. **[INF]** |
| N4 | Round-tripping: importing existing source code into a diagram. | Import accepts the app's own JSON only. **[INF]** |
| N5 | Sequence, state, activity, ER, or component diagrams. | Only class diagrams evidenced. **[OBS]** |
| N6 | Compiling or executing generated code. | Code panel is read-only text. **[OBS]** |
| N7 | User-authored problems added to the library. | Library is a fixed curated set; no "add problem" affordance. **[INF]** |
| N8 | Commenting, reviews, or sharing a diagram by link. | No such affordance. **[INF]** |
| N9 | Undo/redo… **is a goal, not a non-goal** — see §14-BR40. Not visible in screenshots (likely keyboard-only) but mandatory for an editor of this class. **[ASM]** |
| N10 | Mobile-first authoring. | Layout is a fixed three-column desktop workspace; direct-manipulation graph editing is inherently desktop-oriented. Mobile gets a degraded read-oriented experience (§18). **[INF]** |

---

# 4. Source Material Analysis

## 4.1 The Markdown document

`INFO.MD` in the project root is **0 bytes**. Verified with `wc -c` and `file` (reports `empty`). **It contributed nothing to this PRD.**

Consequence: every claim here derives from the screenshots plus domain reasoning. Areas the Markdown would normally have settled — the scoring algorithm, the complete problem catalogue, the full lint rule set, exact copy strings, brand hex values — are correspondingly the weakest parts of this reconstruction and are the bulk of §27 (Open Questions). **If the real INFO.MD content exists elsewhere, reconcile it against §27 first.**

## 4.2 Screenshot index

All 27 are 3024×1674 (macOS Retina capture of a ~1512×837 CSS-pixel viewport). All show the same single workspace; none show a second page, a login, or a mobile layout.

| ID | Filename (`Screenshot 2026-09-08 at …`) | Primary subject | What it uniquely establishes |
|---|---|---|---|
| S1 | `11.48.30 PM` | LLD Problem Library modal | Modal layout, 6 problem cards, difficulty badges, pattern tags, stats line, Practice / Load solution buttons |
| S2 | `11.49.02 PM` | Reference tab, zoomed in, Inspector empty | Node visual anatomy at legible zoom, handles, palette, Inspector empty state |
| S3 | `11.49.11 PM` | Reference tab, fit view | Complete Parking Lot reference model: all 15 classes and edge topology |
| S4 | `11.49.25 PM` | Code tab, Java | Language pills, Copy/Download, option chips, Java output for enums + abstract class |
| S5 | `11.49.32 PM` | Issues tab, valid | Green-check "No problems" empty state |
| S6 | `11.49.38 PM` | Notes tab | Scratch notes textarea, "saved automatically", placeholder copy |
| S7 | `11.49.52 PM` | Practice mode, empty canvas | Practice banner anatomy; "Score my solution" appears in header |
| S8 | `11.50.02 PM` | Two new nodes just created | Default seeded node content (`- id: long`, `+ doWork(): void`), auto-names NewClass0/NewClass1 |
| S9 | `11.50.14 PM` | Inspector, class selected | Full Inspector form: Name, Kind, Generics, Attributes, Methods, Note, Delete |
| S10 | `11.50.26 PM` | Inspector, name being typed | Live rename: focused input, canvas node already shows new name |
| S11 | `11.50.32 PM` | Inspector, 2nd attribute added | Attribute row repetition; node grew a row |
| S12 | `11.50.45 PM` | Node selected at high zoom, Realize armed | Selection ring, `«abstract»` stereotype rendering, palette active state |
| S13 | `11.50.54 PM` | Realize edge created, Issues badge → 1 | Dashed + hollow-triangle edge; linter fires live |
| S14 | `11.51.01 PM` | Issues tab, 1 issue | Exact issue row format and message string |
| S15 | `11.51.08 PM` | Code tab, Java, with `implements` | Realize edge → `implements` in codegen |
| S16 | `11.51.14 PM` | Notes tab | (confirms Notes persists across tab switches) |
| S17 | `11.51.21 PM` | Ink toolbar expanded, colour tooltip | 5 colours, 3 widths, hex tooltip `#f43f5e` |
| S18 | `11.51.28 PM` | Eraser selected | Eraser active state (red-tinted) |
| S19 | `11.51.36 PM` | Code, toString on | `@Override public String toString()` output |
| S20 | `11.51.42 PM` | Code, equals/hashCode on | `import java.util.Objects;` appears at top |
| S21 | `11.51.58 PM` | Code, Python | Python output: ABC, `__init__`, `__repr__`, name-mangled `_id` |
| S22 | `11.52.11 PM` | Sticky note created | Sticky note anatomy: 7 colours, B / I, ×, placeholder |
| S23 | `11.52.26 PM` | Ink stroke drawn | A cyan freehand stroke on canvas; trash icon appears in ink toolbar |
| S24 | `11.52.43 PM` | Sticky note selected + moved | Corner resize handles; note is above nodes in z-order |
| S25 | `11.52.53 PM` | Export dropdown open | Exactly three export formats |
| S26 | `11.52.59 PM` | Import → native file picker | Import is a file-system open, not a URL/paste dialog |
| S27 | `11.53.05 PM` | Canvas cleared, Issues → 0 | Clear removes nodes/edges/ink but **keeps the sticky note**; Issues recomputes to 0 |

## 4.3 Screenshot groupings by flow

- **Problem library flow:** S1
- **Reference-solution viewing:** S2, S3
- **Right-panel exploration (on reference):** S4 (Code), S5 (Issues), S6 (Notes)
- **Practice mode:** S7 → S27 (all subsequent shots are inside Practice mode; the banner is present in every one)
- **Node creation & editing:** S8, S9, S10, S11, S12
- **Relationship creation & live linting:** S12, S13, S14
- **Code generation variations:** S4, S15, S19, S20, S21
- **Annotation layers:** S17, S18, S22, S23, S24
- **Import/export:** S25, S26
- **Destructive action:** S27

## 4.4 Repeated UI patterns identified

These recur across many screenshots and **must be built once as shared components** (§11):

1. **Header icon-button** (Sample / Export / Import / Clear) — dark surface, 1px border, icon + label, radius ~10.
2. **Teal filled primary button** (LLD Problems, Load solution, Practice-banner "Reveal reference").
3. **Teal outlined button** (Score my solution).
4. **Palette row** — full-width dark row, coloured dot or glyph + label, radius ~10, teal border + teal text when armed.
5. **Section label** — uppercase, ~11px, letterspaced ~0.08em, muted (`ADD CLASS · DRAG ONTO CANVAS`, `RELATIONSHIP · DRAG NODE → NODE`, `ANNOTATE`, `ATTRIBUTES`, `METHODS`, `SCRATCH NOTES`).
6. **Pill / chip toggle** — small rounded-full control, teal fill when on, dark outline when off (language pills, codegen option chips).
7. **Right-panel tab bar** — text tabs, teal underline + teal text on active, optional count badge.
8. **Empty state block** — centred, icon (optional) + bold line + muted explanatory line.
9. **Mono type treatment** — all model content (class names, attributes, methods, code, stats lines) is monospace; all chrome is sans.

---

# 5. Product Architecture

## 5.1 Runtime shape

A **single-page client-side application**. One HTML document, one JS bundle, no server round-trips during normal operation. **[INF]**

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser tab                                                     │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ AppHeader  (brand · LLD Problems · Sample · Export ·       │   │
│  │             Import · Clear ················ Score · Coffee)│   │
│  ├───────────────────────────────────────────────────────────┤   │
│  │ ┌──────────┬──────────────────────────────┬─────────────┐ │   │
│  │ │          │ DocumentTabBar               │             │ │   │
│  │ │ Palette  ├──────────────────────────────┤ RightPanel  │ │   │
│  │ │ Sidebar  │                              │ ┌─────────┐ │ │   │
│  │ │          │   CanvasStage                │ │Inspector│ │ │   │
│  │ │ ·Class   │   ┌──────────────────────┐   │ │Issues   │ │ │   │
│  │ │ ·Abstract│   │ PracticeBanner       │   │ │Code     │ │ │   │
│  │ │ ·Iface   │   └──────────────────────┘   │ │Notes    │ │ │   │
│  │ │ ·Enum    │                              │ └─────────┘ │ │   │
│  │ │ ·Record  │   [ink layer]                │             │ │   │
│  │ │          │   [sticky layer]             │             │ │   │
│  │ │ ·Inherit │   [node+edge layer]          │             │ │   │
│  │ │ ·Realize │                              │             │ │   │
│  │ │ ·Compose │   ⊞ zoom controls            │             │ │   │
│  │ │ ·Aggreg. │        ✎ ink toolbar         │             │ │   │
│  │ │ ·Associate                              │             │ │   │
│  │ │ ·Depend  │                              │             │ │   │
│  │ │ ·Sticky  │                              │             │ │   │
│  │ └──────────┴──────────────────────────────┴─────────────┘ │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Overlay: ProblemLibraryModal (S1)                               │
└─────────────────────────────────────────────────────────────────┘
```

## 5.2 The three canvas layers

The canvas is not one drawing surface — it is three co-registered layers sharing a single pan/zoom transform. All three must transform together so annotations stay glued to the diagram when the user pans or zooms. **[OBS — S23/S24 show ink and stickies positioned in world space alongside nodes]**

| z | Layer | Content | Interaction |
|---|---|---|---|
| 3 (top) | **Sticky layer** | Sticky notes | Drag to move, corner handles to resize, rich-text edit. Renders above nodes (S24: the note overlaps `NewClass0`). **[OBS]** |
| 2 | **Ink layer** | Freehand strokes | Only interactive while the pen or eraser tool is armed; otherwise `pointer-events: none` so it never blocks node interaction. **[INF — mandatory, else the canvas would be unusable after drawing]** |
| 1 (bottom) | **Graph layer** | Nodes + edges + dotted background | Standard graph editing. |

## 5.3 The model → derivations pipeline

This is the heart of the application. **The diagram model is the single source of truth; Issues and Code are pure derived views that recompute automatically.** Proven by S12→S13: adding an edge moved the Issues badge 0→1 with no explicit "validate" action, and by S13→S15 where the same edge produced `implements` in the Java output. **[OBS]**

```
                   ┌──────────────────┐
   user edits ───► │  DiagramModel    │  (nodes, edges, notes, ink, scratchNotes)
                   └────────┬─────────┘
                            │  (recompute on every mutation, debounced)
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
        ┌─────────┐   ┌──────────┐   ┌───────────┐
        │ Linter  │   │ CodeGen  │   │ Persist   │
        │ → Issue[]│  │ → string │   │ → local   │
        └────┬────┘   └────┬─────┘   │   Storage │
             │             │         └───────────┘
             ▼             ▼
        Issues tab     Code tab
        + tab badge
```

Implementation requirement: linting and codegen are **pure functions of the model**. `lint(model) → Issue[]` and `generate(model, language, options) → string`. No side effects, no component state. This makes both trivially testable and lets the scoring engine (§9.6) reuse the same model shape. **[ASM — but strongly recommended]**

## 5.4 Client-side only

| Concern | Resolution |
|---|---|
| Persistence | `localStorage`, autosaved, debounced. **[INF from "saved automatically" / "persist across reloads"]** |
| Problem library data | A static bundled TypeScript/JSON constant. Ships with the app. No fetch. **[INF]** |
| Reference solutions | Static, bundled alongside each problem as a full serialized diagram. **[INF]** |
| Codegen | Runs in the browser. **[INF]** |
| Linting | Runs in the browser. **[INF]** |
| Scoring | Runs in the browser (graph comparison against the bundled reference). **[INF — see §27-U4]** |
| Export PNG/SVG | Client-side canvas/SVG serialisation + `Blob` download. **[INF]** |
| Import | `FileReader` on a local `.json`. **[OBS — S26 shows the native picker]** |

**Therefore §16 defines no required HTTP API.** It documents the *logical contracts* as internal module boundaries, plus an optional server profile for teams that want one.

---

# 6. Information Architecture

## 6.1 Hierarchy

```
Workspace (the app; exactly one)
│
├── Documents (1..n open tabs)
│   ├── "My Design"            ← always present, editable, not closable
│   └── "<Problem> — Reference" ← 0..n, read-only, closable
│
├── Each Document contains
│   ├── nodes[]        (classifiers)
│   │   ├── attributes[]
│   │   └── methods[]
│   ├── edges[]        (relationships)
│   ├── stickyNotes[]
│   ├── inkStrokes[]
│   ├── scratchNotes   (string)
│   └── viewport       (x, y, zoom)
│
├── UI state (per workspace, not per document)
│   ├── activeDocumentId
│   ├── armedPaletteTool   (null | kind | relationshipType | 'sticky')
│   ├── inkTool            (null | 'pen' | 'eraser') + colour + width
│   ├── rightPanelTab      (inspector | issues | code | notes)
│   ├── selection          (nodeId | edgeId | stickyId | null)
│   ├── codeLanguage + codeOptions
│   └── practiceSession    (null | { problemId, startedAt })
│
└── Static bundled data
    └── problems[]  (id, title, difficulty, patterns, description,
                     requirements[], stats, brief, referenceDiagram)
```

## 6.2 Navigation model

The app has **no page-to-page navigation**. All movement is:

| Mechanism | Moves between | Evidence |
|---|---|---|
| **Document tabs** | Diagrams | S2–S27 tab bar **[OBS]** |
| **Right-panel tabs** | Inspector / Issues / Code / Notes | S4/S5/S6/S9 **[OBS]** |
| **Modal** | Workspace ↔ Problem Library | S1 **[OBS]** |
| **Mode** | Normal ↔ Practice (banner appears/disappears) | S7 **[OBS]** |
| **Dropdown** | Export format choice | S25 **[OBS]** |
| **Canvas viewport** | Pan / zoom within a diagram | S2 vs S3 **[OBS]** |

## 6.3 Content priority (desktop)

1. The canvas — largest region (~60% of width), the object of work.
2. The right panel (~34%) — the semantic detail of whatever is selected, plus the derived outputs.
3. The left palette (~17%, fixed 265px) — the verbs.
4. The header — global document-level actions.

---

# 7. Complete Route Map

## 7.1 Reality: a single route

The application is a **one-route SPA**. No screenshot shows a URL bar, and every screenshot shows the same workspace shell. **[OBS/INF]**

| Route | Purpose | Auth | Notes |
|---|---|---|---|
| `/` | The entire workspace. | None | Renders header + palette + tabs + canvas + right panel. Restores the last session from `localStorage`. |

**Implement this as a single route.** Do not introduce a router library for its own sake. **[ASM]**

## 7.2 Recommended URL state (optional enhancement)

Nothing in the screenshots shows URL state. However, deep-linking a problem is genuinely valuable and cheap. If implemented, use **query parameters only** so the base route is unchanged: **[ASM — entirely inferred, mark as optional]**

| Param | Values | Effect on load |
|---|---|---|
| `?problem=<id>` | e.g. `parking-lot` | Open the Problem Library modal scrolled to that card. |
| `?practice=<id>` | e.g. `elevator-system` | Start a Practice session for that problem immediately. |
| `?ref=<id>` | e.g. `splitwise` | Open that problem's reference tab and focus it. |
| `?panel=` | `inspector`\|`issues`\|`code`\|`notes` | Preselect the right-panel tab. |
| `?lang=` | `java`\|`python`\|`typescript`\|`javascript`\|`cpp`\|`csharp` | Preselect the codegen language. |

Rules if implemented:
- Params are **read on mount only**; subsequent in-app changes do **not** rewrite the URL (avoids polluting history on every tab click). **[ASM]**
- An unknown `problem`/`ref`/`practice` id is ignored silently; the app boots normally. Do not show a 404. **[ASM]**
- The user's existing `My Design` is **never** overwritten by a URL param. `?practice=` starts a session on the existing canvas; if the canvas is non-empty, prompt (§9.5). **[ASM]**

## 7.3 Behaviours that would otherwise be routing

| Question | Answer |
|---|---|
| Does the browser Back button move between right-panel tabs? | **No.** Panel tabs are local state. **[INF]** |
| Does Back close the Problem Library modal? | **Yes** — push a history entry when the modal opens and pop it on close, so Back closes the modal rather than leaving the app. **[ASM — standard, strongly recommended]** |
| Does Back undo a canvas edit? | **No.** Undo is `Cmd/Ctrl+Z` (§14-BR40). |
| Is there a 404 state? | **No.** There is one route. Any unknown path should serve the same SPA shell. **[ASM]** |
| Is there an unauthorised state? | **No.** There is no auth. **[INF]** |

---

# 8. User Roles and Permissions

## 8.1 Human roles

There is exactly **one** human role: **the local user**. There is no sign-in, no role selector, no permission UI anywhere in the 27 screenshots. **[INF — high confidence]**

Everyone who opens the app has identical capability. Do not build a roles system, a permissions table, or any `can()` helper keyed on identity.

## 8.2 Document-level permissions — the real permission model

Permissions in this product attach to **documents, not people**. This is the only access-control concept and it **must** be implemented. **[OBS]**

| Capability | `My Design` | Reference tab |
|---|---|---|
| View diagram | ✅ | ✅ |
| Pan / zoom / fit view | ✅ | ✅ |
| Select a node or edge | ✅ | ✅ (to inspect it) |
| **Edit name / kind / attributes / methods** | ✅ | ❌ |
| **Add node from palette** | ✅ | ❌ |
| **Draw a relationship** | ✅ | ❌ |
| **Move a node** | ✅ | ❌ |
| **Delete a node or edge** | ✅ | ❌ |
| **Add sticky note / ink** | ✅ | ❌ |
| **Clear** | ✅ | ❌ |
| **Import into this tab** | ✅ | ❌ |
| Edit scratch notes | ✅ | ❌ **[ASM]** |
| View Issues | ✅ | ✅ |
| View / copy / download Code | ✅ | ✅ |
| Export PNG / SVG / JSON | ✅ | ✅ **[ASM]** |
| Close the tab | ❌ (no × rendered) | ✅ |

**Visual signalling of read-only** — all three are required: **[OBS]**
1. A **lock glyph** immediately left of the tab title.
2. A teal **`REF` badge** immediately right of the tab title.
3. The tab title ends with the suffix `" — Reference"`.

**Behavioural signalling** when a reference tab is active: **[INF — required for coherence]**
- Palette rows (Class…Depend, Sticky note) render **disabled** (reduced opacity ~0.4, `cursor: not-allowed`, not focusable) and cannot be armed.
- `Import` and `Clear` header buttons render **disabled**.
- The ink toolbar is **hidden**.
- The Inspector shows fields **read-only** (values visible, inputs `readonly`/`disabled`) and **omits the "Delete class" button entirely**.
- Nodes are not draggable; connection handles are not rendered.
- Attempting a blocked action produces **no error toast** — the affordance is simply absent or disabled. Silent prevention, not error messaging. **[ASM]**

## 8.3 Mode-gated capability

Practice mode gates one header action: **[OBS]**

| Capability | Normal mode | Practice mode |
|---|---|---|
| "Score my solution" button in header | **Absent** (S2–S6) | **Present** (S7–S27) |
| Practice banner over canvas | Absent | Present |

---

# 9. Complete User Flows

Each flow below gives: goal, preconditions, starting state, then a numbered sequence where every step specifies **user action → UI response → state change → data change → persistence → failure/edge cases**.

---

## 9.0 Flow: First visit / cold boot

**Goal:** get a usable workspace with zero setup.
**Preconditions:** none. **Starting state:** empty `localStorage`.

| # | User action | UI response | State change | Data change |
|---|---|---|---|---|
| 1 | Navigates to `/` | App shell paints immediately: header, palette, tab bar, empty canvas, right panel on **Inspector** showing its empty state. | `documents = [MyDesign(empty)]`, `activeDocumentId = 'my-design'`, `rightPanelTab = 'inspector'`, `armedTool = null`, `practiceSession = null` | A fresh `MyDesign` document is created. |
| 2 | (automatic) | — | Persist layer writes the initial state. | `localStorage['classforge.v1']` created. |

**Returning visit:** read `localStorage['classforge.v1']`, rehydrate all open documents (including previously opened reference tabs), the active tab, the viewport per document, scratch notes, sticky notes, ink, the codegen language/options, and the practice session if one was active. **[INF from "persist across reloads"]**

**Edge cases:**
- **Corrupt / unparseable JSON in storage** → catch, discard, boot fresh as if first visit, and show a non-blocking toast: *"Couldn't restore your last session — starting fresh."* Never crash to a white screen. **[ASM]**
- **Storage from an older schema version** → run migrations by `schemaVersion`; if no migration path exists, treat as corrupt (above). **[ASM]**
- **`localStorage` unavailable** (private mode, disabled cookies, quota 0) → run fully in memory, and show a persistent subtle banner: *"Your browser is blocking local storage — this diagram won't survive a refresh. Export to JSON to keep it."* **[ASM]**
- **First visit with no problem loaded** → the canvas is genuinely empty. It **must** offer a way forward; see the canvas empty state in §10.4. **[ASM]**

---

## 9.1 Flow: Open the LLD Problem Library

**Goal:** browse curated problems. **Precondition:** none.

| # | Action | UI response | State | Notes |
|---|---|---|---|---|
| 1 | Click **"LLD Problems"** (teal, header) | Modal opens centred, page behind dims with a scrim; body scroll locks. Focus moves into the dialog. | `modal = 'problem-library'` | Push a history entry so Back closes it. **[ASM]** |
| 2 | — | Modal renders: title **"LLD Problem Library"**, subtitle **"Pick a classic low-level-design problem, load its verified solution, or practice and get scored."**, × close top-right, then a **2-column grid of problem cards** that scrolls within the modal. **[OBS]** | — | Header/subtitle are sticky; only the grid scrolls (S1 shows cards clipped at the modal's bottom edge). **[OBS]** |
| 3 | Scroll the grid | More cards reveal. | — | 6 problems observed; treat the list as data-driven and arbitrary-length. |
| 4 | Click × / press `Escape` / click the scrim | Modal closes, scrim clears, focus returns to the "LLD Problems" button. | `modal = null` | Nothing else changes — the canvas is untouched. **[INF]** |

**Card anatomy (exact, from S1):** **[OBS]**
- **Title** — sans, ~20px, semibold, white. e.g. *Parking Lot*.
- **Difficulty badge** — top-right of the card, rounded-full, uppercase, ~11px bold, dark text on a saturated fill: `EASY` green, `MEDIUM` amber, `HARD` red.
- **Pattern tags** — teal, ~14px, joined by a middle dot: `Strategy · Factory · Singleton`.
- **Description** — one or two sentences, muted body text. *"Design a multi-floor parking lot that admits different vehicle sizes, issues tickets, and charges a fee on exit."*
- **Requirements list** — 4 bullets, small square/dash markers, muted. *"Multiple floors, each with typed spots"* etc.
- **Stats line** — **monospace**, muted: `15 classes · 13 relationships`. **[OBS]**
- **Actions row** — `Practice` (secondary, outlined, ~30% width, left) and `Load solution →` (teal filled, ~70% width, right).

**Observed catalogue** — reproduce verbatim: **[OBS]**

| Problem | Difficulty | Patterns | Stats | Description |
|---|---|---|---|---|
| Parking Lot | MEDIUM | Strategy · Factory · Singleton | 15 classes · 13 relationships | Design a multi-floor parking lot that admits different vehicle sizes, issues tickets, and charges a fee on exit. |
| Splitwise (Expense Sharing) | MEDIUM | Strategy · Factory | 10 classes · 9 relationships | Design an expense-sharing app where a group of users can split bills equally, by exact amounts, or by percentage, and settle balances. |
| Elevator System | HARD | Strategy · State | 7 classes · 4 relationships | Design the control system for a bank of elevators serving a multi-storey building, dispatching cars to floor requests efficiently. |
| Vending Machine | MEDIUM | State | 8 classes · 6 relationships | Design a vending machine that accepts coins, lets the user pick a product, dispenses it, and returns change — modelled as a state machine. |
| Library Management | MEDIUM | Aggregate Root | *(not visible)* | *(clipped in S1)* |
| Tic-Tac-Toe | EASY | OOP fundamentals | *(not visible)* | *(clipped in S1)* |

Bullet lists observed: **Parking Lot** — Multiple floors, each with typed spots / Cars, bikes and trucks map to spot sizes / Ticket on entry, fee + payment on exit / Pluggable pricing and payment methods. **Splitwise** — Users belong to groups / An expense is split among members / Equal / exact / percent split types / Running balance sheet per group. **Elevator** — Several elevators, one controller / Up / down / idle movement / Queue of pending requests per car / Pluggable dispatch (scheduling) strategy. **Vending Machine** — Idle / has-money / dispensing states / Coin denominations / Product inventory with stock / Behaviour changes with current state. **[OBS]**

**Edge cases:** empty catalogue (should be impossible; render an empty state rather than a blank modal) **[ASM]**; very long description (clamp to 3 lines with ellipsis, full text available in the Brief) **[ASM]**.

---

## 9.2 Flow: Load a verified reference solution

**Goal:** study the model answer. **Precondition:** Problem Library modal open.

| # | Action | UI response | State change | Data change |
|---|---|---|---|---|
| 1 | Click **"Load solution →"** on a card | Modal closes immediately. | `modal = null` | — |
| 2 | (same tick) | A **new document tab** appears in the tab bar: lock icon + `"Parking Lot — Reference"` + teal `REF` badge + × close. It becomes **active**. | `documents.push(refDoc)`, `activeDocumentId = refDoc.id` | A full diagram is materialised from the bundled reference: 15 nodes, 13 edges, laid out at authored coordinates. **[OBS — S2/S3]** |
| 3 | (same tick) | Canvas renders the reference diagram and **fits it to the viewport**. Right panel keeps whatever tab was active; Inspector shows its empty state (nothing selected). | `selection = null`, `viewport = fitView()` | — **[OBS — S3 shows a fitted whole-graph view]** |
| 4 | — | All editing affordances disable per §8.2. | `activeDoc.readOnly = true` | — |

**Idempotency:** loading the same problem's solution twice must **not** create a duplicate tab — focus the existing one instead. **[ASM — important; §14-BR12]**

**Failure:** if the bundled reference is missing or malformed (a build/data error), do not open an empty tab. Keep the modal open and show an inline error on the card: *"This solution couldn't be loaded."* **[ASM]**

**Continuation not shown in screenshots but logically required:** the user then explores — selects nodes to read their members (Inspector, read-only), opens **Code** to see the reference compiled (S4), opens **Issues** to confirm it lints clean (S5 shows `0` / "No problems" on the reference — a good implicit assertion: **every bundled reference solution must lint clean**). **[OBS + INF → this is a build-time test, see §20]**

---

## 9.3 Flow: Load the Sample diagram

**Goal:** see a populated canvas instantly without choosing a problem. **[INF — "Sample" button, S2]**

| # | Action | UI response | State | Data |
|---|---|---|---|---|
| 1 | Click **"Sample"** in the header | A demonstration diagram populates the **current editable document**. | — | `MyDesign.nodes/edges` replaced. |
| 2 | — | Canvas fits to view. Issues and Code recompute. | `viewport = fitView()` | — |

**Guard:** if `MyDesign` already has content, confirm first — *"Replace your current diagram with the sample? This can't be undone."* / **Replace** · **Cancel**. **[ASM — consistent with Clear, §9.11]**
**Disabled** when a reference tab is active (§8.2). **[INF]**

---

## 9.4 Flow: Create a class node

**Goal:** add a classifier. **Precondition:** an editable document is active.

Two mechanisms, both must work: **[OBS palette label says "DRAG ONTO CANVAS"; INF for click-to-place]**

**9.4a — Drag (primary, explicitly labelled):**

| # | Action | UI response | State | Data |
|---|---|---|---|---|
| 1 | Press and hold on the **Class** palette row | Row shows a pressed/active style; a drag image follows the cursor. | `dragging = { kind: 'CLASS' }` | — |
| 2 | Drag over the canvas | Cursor shows a copy affordance. Optionally a ghost outline at the drop point. **[ASM]** | — | — |
| 3 | Release at point *(x, y)* | A new node appears **centred at the drop point**, and is **selected**. The right panel switches to **Inspector** showing the new node. **[INF — S8→S9 sequence]** | `selection = newNodeId`, `rightPanelTab = 'inspector'` | `nodes.push(newNode)` |
| 4 | (automatic) | Issues + Code recompute. Autosave fires. | — | `localStorage` updated. |

**9.4b — Click to place (fallback):** click a palette row → it arms (teal border + teal text, as `Associate` shows in S2 and `Inherit` in S9) → next click on empty canvas places the node there and disarms. **[INF]**

**The new node's seeded content — exact, and non-obvious: [OBS — S8]**

```
Name:       NewClass<N>      where N is a zero-based counter
Kind:       the palette kind that was dragged
Attributes: [ { visibility: 'private', name: 'id',     type: 'long' } ]
Methods:    [ { visibility: 'public',  name: 'doWork', params: '', returns: 'void' } ]
Note:       ''
Generics:   ''
```

Rendered on canvas as `- id: long` in the attribute compartment and `+ doWork(): void` in the operation compartment. **[OBS]**

**Naming counter rule:** S8 shows `NewClass0` then `NewClass1` — the counter is **zero-based** and increments per creation. It should pick the lowest integer `N` such that `NewClass<N>` is not already taken in the document, so that deleting and re-adding does not skip numbers or collide. **[OBS for the sequence; ASM for the collision rule]**

**Kind-specific seeding:** **[ASM]**
- `ENUM` — seed with **no** attributes and **no** methods; an enum body lists literals (S2: `CAR / BIKE / TRUCK` with no visibility signs). Enum literals are edited via the Attributes list, rendered without visibility marker or type. **[INF from S2 rendering]**
- `INTERFACE` — seed with no attributes and one public abstract method. **[ASM]**
- `RECORD` — seed with one attribute, no methods. **[ASM]**
- `ABSTRACT` / `CLASS` — as the observed default above. **[OBS]**

**Edge cases:** drop onto the palette or right panel → no node created, drag cancels **[ASM]**; drop while a reference tab is active → blocked (§8.2) **[INF]**; `Escape` mid-drag cancels **[ASM]**.

---

## 9.5 Flow: Start a Practice session

**Goal:** attempt a problem from its brief, unaided. **Precondition:** Problem Library open.

| # | Action | UI response | State change | Data change |
|---|---|---|---|---|
| 1 | Click **"Practice"** on a problem card | Modal closes. | `modal = null` | — |
| 2 | (same tick) | The active document becomes **`My Design`** (editable). | `activeDocumentId = 'my-design'` | — **[OBS — S7 shows My Design active with the REF tab still present but unfocused]** |
| 3 | (same tick) | The canvas is **cleared to empty** so the attempt starts blank. | — | `MyDesign.nodes = []`, `edges = []` **[INF — S7 shows an empty canvas immediately after entering Practice, while a reference tab already existed]** |
| 4 | (same tick) | The **Practice banner** appears, floating at top-centre of the canvas: a teal-bordered rounded card containing a teal **`PRACTICE`** pill, the problem **title** (`Parking Lot`, semibold), a truncated one-line **subtitle** (`Model the classes & relationships, th…`), and three buttons: **Brief**, **Reveal reference** (teal outlined), **Exit**. **[OBS — S7]** | `practiceSession = { problemId, startedAt }` | — |
| 5 | (same tick) | The header grows a **"Score my solution"** button (teal outlined, trophy icon) to the left of "Buy me a coffee". **[OBS — S7]** | — | — |

**Guard on step 3:** if `My Design` is non-empty, **confirm before clearing** — *"Start practising Parking Lot? Your current design will be cleared."* / **Start practice** · **Cancel**. Cancelling leaves everything untouched and reopens (or keeps) the modal. **[ASM — critical; silently destroying work is unacceptable, and §14-BR31 requires confirmation for destructive acts]**

**In-session sub-flows:**

| Control | Behaviour |
|---|---|
| **Brief** | Opens a dialog (or expands the banner) with the problem's full description + requirement bullets — the same content as the library card, un-truncated. Dismiss returns to the canvas with the session intact. **[INF — the banner subtitle is visibly truncated with "…", so a full-text affordance must exist, and "Brief" is it]** |
| **Reveal reference** | Opens (or focuses, if already open) that problem's read-only reference tab and switches to it. The practice session **stays active** — the banner and "Score my solution" remain, and returning to the `My Design` tab resumes the attempt. **[INF]** |
| **Exit** | Ends the session: banner disappears, "Score my solution" disappears. **The user's diagram is kept** — exiting is leaving the mode, not discarding work. Confirm only if a score has never been requested. **[INF for keeping work; ASM for the confirm]** |

**Edge cases:** starting a new Practice session while one is active → confirm and replace **[ASM]**; refresh mid-session → the session is restored from storage, banner and all **[INF from "persist across reloads"]**; scoring with an empty canvas → see §9.6.

---

## 9.6 Flow: Score my solution ⚠️ *largest inference in this document*

**Goal:** grade the user's attempt against the verified reference.
**Precondition:** `practiceSession != null`; the `My Design` tab is the subject.
**Evidence:** the button exists (S7–S27) and the library subtitle promises *"practice and get scored"* **[OBS]**. **No screenshot shows the result UI.** Everything below is **[ASM]** — a complete, buildable design. See §27-U4.

| # | Action | UI response | State |
|---|---|---|---|
| 1 | Click **"Score my solution"** | Button enters a loading state (spinner, label → "Scoring…", disabled to prevent double submit). | `scoring = 'running'` |
| 2 | (compute, <300 ms) | — | `scoring = 'done'`, `scoreResult = {...}` |
| 3 | — | A **Score result modal** opens. | `modal = 'score-result'` |

**Scoring algorithm (specified so it is reproducible):**

Compare the user's graph `U` against the reference graph `R` by **structure and semantics, never by coordinates, and never by exact name equality**. Names must be matched leniently — an interview answer that calls it `ParkingSpace` instead of `ParkingSpot` is not wrong.

```
normalise(name) = lowercase, strip non-alphanumerics, singularise
match(u, r)     = normalise(u.name) == normalise(r.name)
                  OR levenshtein_ratio(normalise(u.name), normalise(r.name)) >= 0.80
```

Score is a weighted sum over five dimensions, each 0–100, then rounded to an integer 0–100:

| Dimension | Weight | Measure |
|---|---|---|
| **Classes identified** | 30% | Fraction of reference classes matched by some user class. |
| **Correct kinds** | 15% | Of matched classes, fraction whose `kind` equals the reference kind (Interface vs Abstract vs Class matters). |
| **Relationships** | 30% | Fraction of reference edges reproduced between matched endpoints, with the correct relationship type. A present-but-wrong-type edge scores half. |
| **Members** | 15% | Of matched classes, mean fraction of reference attribute+method names present. |
| **Cleanliness** | 10% | `100 − 10 × (number of lint issues)`, floored at 0. |

Report **per-dimension sub-scores**, plus three explicit lists:
- **Matched** — what the user got right (positive reinforcement first).
- **Missing** — reference elements with no counterpart. *"The reference has an interface `FeeStrategy` that pluggable pricing depends on."*
- **Extra** — user elements with no reference counterpart, presented **neutrally, not as errors**: *"Not in the reference — that isn't necessarily wrong."* (Multiple valid designs exist; this must not read as a failure.)

**Result modal layout:** big numeric score with a grade band (`≥90 Excellent` / `≥75 Strong` / `≥60 Fair` / `<60 Keep going`), a five-row dimension breakdown with bars, then the three lists as collapsible sections, then footer actions: **Reveal reference** (opens the ref tab side-by-side), **Try again** (keeps the session, closes the modal), **Close**.

**Edge cases:**
- **Empty canvas** → do not run the comparison. Show *"Add some classes first, then score your design."* and keep the modal closed (or show a toast). **[ASM]**
- **Very large user diagram** → cap comparison work; the algorithm is O(|U|·|R|) on names, trivially fine at these sizes.
- **Reference missing** → disable "Score my solution" with a tooltip explaining why. **[ASM]**
- **Re-scoring** → always allowed, always recomputed fresh; do not cache. **[ASM]**

---

## 9.7 Flow: Edit a class through the Inspector

**Goal:** give a node real structure. **Precondition:** editable document; a node is selected.

| # | Action | UI response | State | Data |
|---|---|---|---|---|
| 1 | Click a node on the canvas | Node gets a **teal selection ring**. Right panel switches to **Inspector** and populates. **[OBS — S12]** | `selection = nodeId`, `rightPanelTab = 'inspector'` | — |
| 2 | Type in **NAME** | The **canvas node title updates on every keystroke** — no blur, no Enter, no Save. S10 shows the input mid-edit (`NewClsdsd|` with a text cursor) and the canvas node already reading `NewClsdsd`. **[OBS — this is a definitive observation: editing is live and uncommitted]** | — | `node.name` mutated per keystroke (debounce persistence, not state). |
| 3 | Change **KIND** via the select | Node re-renders with the new stereotype (`«abstract»` / `«interface»` / `«enumeration»`), italic title for Abstract, and the palette dot colour semantics. Issues and Code recompute. **[OBS — S12 shows `«abstract»` above an italic `NewClsdsd`]** | — | `node.kind` |
| 4 | Type in **TYPE PARAMETERS (GENERICS)** | Node title renders as `Name<T>`. **[INF]** Placeholder is `e.g. T or K, V`. **[OBS]** | — | `node.generics` |
| 5 | Click **`+ attribute`** (dashed full-width button) | A new attribute row group appends; its name input focuses. **[INF]** A new row appears in the node's attribute compartment. **[OBS — S11 shows `field: String` added as a second row]** | — | `node.attributes.push(...)` |
| 6 | Click the **visibility button** (shows `-`) | Cycles `- → + → # → ~ → -`. The canvas marker updates. **[INF — a compact single-glyph button in a form this dense is a cycler; §27-U7]** | — | `attribute.visibility` |
| 7 | Toggle **S** / **F** on an attribute | `S` = static, `F` = final. Toggled state is teal-filled. **[INF from position and single-letter labels]** | — | `attribute.isStatic` / `isFinal` |
| 8 | Click **×** on an attribute row | The row is removed immediately, no confirmation. The canvas row disappears. **[INF — × on a form row is immediate; the action is cheap and undoable]** | — | `attributes.splice(i,1)` |
| 9 | Click **`+ method`** | A method row group appends. | — | `node.methods.push(...)` |
| 10 | Toggle **S** / **A** on a method | `S` = static, `A` = abstract. An abstract method renders *italic* on canvas. **[INF]** | — | `method.isStatic` / `isAbstract` |
| 11 | Type in **NOTE / DOC COMMENT** | No canvas change. Feeds the codegen "Doc comments" option. **[INF — the two features are named for each other]** | — | `node.note` |
| 12 | Click **"Delete class"** (red, trash icon, bottom) | Node is removed **along with every edge touching it**. Selection clears; Inspector returns to its empty state. **[INF — orphan edges are impossible; §14-BR30]** | `selection = null` | `nodes` and `edges` filtered |

**Inspector form structure — exact field order [OBS — S9]:**
```
NAME  [text]                    KIND  [select ▾]     ← side by side, 2-col
TYPE PARAMETERS (GENERICS)  [text, placeholder "e.g. T or K, V"]
ATTRIBUTES
  ┌ [-] [name______________] [×] ┐
  │ [type_________________]      │   ← 3 stacked lines per attribute
  │ [= default value (optional)] [S] [F] │
  └──────────────────────────────┘
  [ + attribute ]   ← dashed border
METHODS
  ┌ [+] [name______________] [×] ┐
  │ [parameters — e.g. int id, String name] │
  │ returns [type_______] [S] [A]           │
  └──────────────────────────────┘
  [ + method ]      ← dashed border
NOTE / DOC COMMENT  [textarea, ~3 rows]
[ 🗑 Delete class ]  ← red text + red border, full width
```

**Persistence:** every mutation autosaves, debounced ~500 ms. There is **no Save button anywhere in the application.** **[OBS — none visible; INF]**

---

## 9.8 Flow: Create a relationship

**Goal:** connect two classifiers. **Precondition:** editable document; ≥2 nodes.

| # | Action | UI response | State | Data |
|---|---|---|---|---|
| 1 | Click a relationship row in the palette (e.g. **Realize**) | The row **arms**: teal 1px border + teal label. Any previously armed row disarms — **exactly one may be armed**. **[OBS — S12 shows only `Realize` armed; S2 only `Associate`; S22 only `Aggregate`]** | `armedRelationship = 'REALIZE'` | — |
| 2 | (helper text is always visible below the list) | *"Pick a type, then drag from one class's edge to another to connect them."* **[OBS]** | — | — |
| 3 | Hover a node | Its **connection handles** become prominent — teal filled circles at the left and right mid-edges. **[OBS — S12 shows handles on both nodes]** | — | — |
| 4 | Press on a source handle and drag | A live preview edge follows the cursor. **[INF]** | `connecting = { from: nodeId }` | — |
| 5 | Release on a target node | The edge is created with the armed type and its correct UML decoration. **[OBS — S13: dashed line, hollow triangle arrowhead at the target = Realize]** | — | `edges.push(edge)` |
| 6 | (automatic, same tick) | **Issues recomputes and the tab badge goes 0 → 1.** Code regenerates (`implements` appears). **[OBS — S12 badge `0` → S13 badge `1`; S15 shows `implements`]** | — | — |
| 7 | Release on empty canvas | No edge created; the preview vanishes. **[ASM]** | `connecting = null` | — |

**Does the armed type persist after use?** The palette still shows `Realize` armed in S13/S14/S15 *after* the edge was drawn — so **the armed tool stays armed**, enabling several edges of the same type in a row. **[OBS]**

**Relationship rendering — reproduce exactly [OBS]:**

| Type | Line | Decoration | Observed in |
|---|---|---|---|
| **Inherit** | solid | hollow (unfilled) triangle at the **target** | S2/S3 (Car→Vehicle, Bike→Vehicle, Truck→Vehicle) |
| **Realize** | **dashed** | hollow triangle at the **target** | S13 (NewClass0⇢NewClsdsd); S3 (CardPayment⇢PaymentStrategy, HourlyFeeStrategy⇢FeeStrategy) |
| **Compose** | solid | **filled** diamond at the **source** | S3 (ParkingLot◆—Ticket) |
| **Aggregate** | solid | **hollow** diamond at the source | palette glyph |
| **Associate** | solid | open arrowhead at the target | S3 (with labels) |
| **Depend** | dashed | open arrowhead at the target | palette glyph (`⇢`) |

**Edge labels and multiplicities [OBS — S2/S3]:** association edges carry a small mono **role label** near the midpoint (`vehicle`, `floor`, `paymentStrategy`) and **multiplicity strings** near the endpoints (`0..1`, `1`, `1..spo…` truncated — almost certainly `1..*`). These must be editable via the Inspector when an **edge** is selected (§10.5.2). **[OBS for rendering; INF for editing]**

**Edge cases:** self-loop (node → itself) — permit, render as a rounded loop **[ASM]**; duplicate edge of the same type between the same pair — prevent, keep the existing one **[ASM, §14-BR22]**; connecting to a node on a read-only tab — handles are not rendered (§8.2).

---

## 9.9 Flow: Live validation (Issues)

**Goal:** surface modelling mistakes without asking. **Precondition:** any document.

The linter runs **on every model mutation**, not on demand — proven by the badge changing between S12 and S13 with no intervening user action other than drawing an edge. **[OBS]**

| State | Tab badge | Panel content |
|---|---|---|
| No issues | `0`, muted/neutral chip | Centred: teal ✓-in-circle icon, **"No problems"** (teal, semibold), then muted *"Your diagram is valid and ready to generate."* **[OBS — S5, S27]** |
| ≥1 issue | count in a teal/green chip | A vertical list of issue rows. **[OBS — S14]** |

**Issue row format — exact [OBS — S14]:**
```
● NewClsdsd — "NewClass0" realizes "NewClsdsd" which is not an interface.
│  └ subject: monospace, teal        └ message: sans, white/near-white
└ severity dot: amber (warning)
```
The row sits on a slightly raised dark surface with a radius of ~10 and generous padding.

**Confirmed lint rule (the only one observed):** **[OBS]**
> **R1 — Realize target must be an interface.** If an edge of type `REALIZE` points at a node whose kind is not `INTERFACE`, emit a **warning** on the target node: `"<Source>" realizes "<Target>" which is not an interface.`

Note the exact grammar: subject is the **target** node's name; the message quotes both names; it ends with a full stop.

**Additional rules that the product's purpose demands [ASM — see §14.3 for the full proposed rule set]:** duplicate class names; empty class name; cycles in the inheritance graph; a class inheriting from multiple classes (in single-inheritance target languages); an interface declaring non-public members; a concrete class with unimplemented abstract methods; an enum with methods but no literals; dangling/self-inheriting edges; a name that isn't a valid identifier in the selected codegen language.

**Interaction:** clicking an issue row should **select and centre the offending node** on the canvas. **[ASM — standard and high-value; not observable in a still]**

**Edge cases:** dozens of issues → the panel scrolls; do not cap the list. **[ASM]** Issues on a **read-only reference tab** are shown, not suppressed — S5 proves the panel is live on a reference tab (and reads `0`). **[OBS]**

---

## 9.10 Flow: Generate code

**Goal:** compile the diagram into source. **Precondition:** any document.

| # | Action | UI response | State |
|---|---|---|---|
| 1 | Click the **Code** right-panel tab | Panel shows the language pills, action row, option chips, and the generated source. | `rightPanelTab = 'code'` |
| 2 | Click a **language pill** (`Java` `Python` `TypeScript` `JavaScript` `C++` `C#`) | The pill fills teal; all others revert to dark outline. The code body **regenerates immediately**. **[OBS — S4 Java selected, S21 Python selected]** | `codeLanguage` |
| 3 | Toggle an **option chip** | The chip fills teal when on. Code regenerates. Chips are **independent multi-select**, not radio: S4 shows `Constructor`+`Getters/Setters`+`Doc comments` on with `toString`+`equals/hashCode` off; S19 adds `toString`; S20 adds `equals/hashCode` — cumulative. **[OBS]** | `codeOptions[k]` |
| 4 | Click **Copy** | Full source → clipboard. Button should confirm ("Copied!" for ~2 s). **[OBS for the button; ASM for feedback]** | — |
| 5 | Click **Download** | Source saved as a file. **[OBS]** | — |

**Option chips (exact labels and default state) [OBS]:**

| Chip | Default | Effect |
|---|---|---|
| `Constructor` | **ON** | Emit an all-args constructor. |
| `Getters/Setters` | **ON** | Emit accessors for every attribute. |
| `toString` | OFF | Emit `toString` / `__repr__`. |
| `equals/hashCode` | OFF | Emit value equality; in Java adds `import java.util.Objects;`. **[OBS — S20]** |
| `Doc comments` | **ON** | Emit the node's NOTE as a doc comment. |

*(Defaults read from S4, which is an untouched Code tab: three chips teal, two dark.)*

**Java output contract — reproduce this shape exactly [OBS — S4, S15, S19, S20]:**
```java
import java.util.List;          // only when a collection type is used
import java.util.Objects;       // only when equals/hashCode is on

public enum VehicleType {
    CAR, BIKE, TRUCK;
}

public enum SpotType {
    COMPACT, LARGE, MOTORCYCLE;
}

public abstract class Vehicle {
    private String licensePlate;
    private VehicleType type;

    public Vehicle(String licensePlate, VehicleType type) {
        this.licensePlate = licensePlate;
        this.type = type;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }
}
```
With a Realize edge and `toString`+`equals/hashCode` on: **[OBS — S15/S19/S20]**
```java
public class NewClass0 implements NewClsdsd {
    private long id;

    public NewClass0(long id) {
        this.id = id;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public void doWork() {
        // TODO
    }

    @Override
    public String toString() {
        return "NewClass0{id=" + id + "}";
    }
}
```
Rules extracted: enum literals joined by `, ` and terminated with `;`; abstract kind → `abstract class`; Realize → `implements`; Inherit → `extends` **[INF]**; every method body is `// TODO`; `toString` is `@Override`-annotated and formats `ClassName{field=value, …}`; ordering is **enums → abstracts → classes** (S4) i.e. dependencies before dependents **[INF]**; getters/setters immediately follow the constructor; blank line between members.

**Python output contract [OBS — S21]:**
```python
from abc import ABC, abstractmethod

class NewClass0(NewClsdsd):
    def __init__(self):
        self._id: int = 0
    def doWork(self) -> None:
        pass
    def __repr__(self) -> str:
        return f"NewClass0(_id={self._id})"


class NewClsdsd(ABC):
    def __init__(self):
        self._id: int = 0
        self._field: str = ""
    def doWork(self) -> None:
        pass
    def __repr__(self) -> str:
        return f"NewClsdsd(_id={self._id}, _field={self._field})"
```
Rules extracted: `from abc import ABC, abstractmethod` emitted only when an abstract/interface exists; private attributes get a single-underscore prefix; **types are mapped** (`long → int`, `String → str`, `void → None`) **[OBS]**; attributes are initialised to type-appropriate zero values (`0`, `""`) rather than declared **[OBS]**; `toString` becomes `__repr__`; method bodies are `pass`; Realize/Inherit both become a base class in the class header. Note that in Python, `Getters/Setters` being on produced **no** accessor methods — Python codegen correctly ignores it as un-idiomatic. **[OBS — S21 has the chip on but no getters]**

**Per-language type map [ASM — required; extend as needed]:**

| Model | Java | Python | TypeScript | C++ | C# |
|---|---|---|---|---|---|
| `String` | `String` | `str` | `string` | `std::string` | `string` |
| `long` | `long` | `int` | `number` | `long` | `long` |
| `int` | `int` | `int` | `number` | `int` | `int` |
| `double` | `double` | `float` | `number` | `double` | `double` |
| `boolean` | `boolean` | `bool` | `boolean` | `bool` | `bool` |
| `void` | `void` | `None` | `void` | `void` | `void` |
| `List<T>` | `List<T>` | `list[T]` | `T[]` | `std::vector<T>` | `List<T>` |

**Edge cases:** empty diagram → show an empty state in the Code panel, not an empty box: *"Add a class to generate code."* **[ASM]**; a name that is a language keyword → the linter warns, but codegen still emits it verbatim **[ASM]**; clipboard API unavailable/denied → fall back to selecting the text and showing *"Press ⌘C to copy"* **[ASM]**.

---

## 9.11 Flow: Clear the canvas

**Goal:** start over. **Precondition:** editable document.

| # | Action | UI response | Data |
|---|---|---|---|
| 1 | Click **Clear** (trash icon, header) | A confirmation dialog. **[ASM — destructive and irreversible-looking; §14-BR31]** | — |
| 2 | Confirm | Nodes, edges, and **ink** are removed. Issues recomputes to `0` and the panel shows "No problems". | `nodes=[] edges=[] ink=[]` |

**Critical observed nuance:** compare S24 (a sticky note + two nodes + an ink stroke) with S27 (**the sticky note is still there**, nodes and edges gone, ink gone, Issues `0`). So **Clear removes the diagram, not the annotations-as-notes** — the sticky note survives. **[OBS — this is surprising and must be reproduced]**

> **Rule:** `Clear` empties `nodes`, `edges`, and `inkStrokes`. It **preserves** `stickyNotes`, `scratchNotes`, the practice session, and the viewport. **[OBS for stickies; INF for the rest]**

*(Caveat: it is possible the user manually erased the ink between S24 and S27 — a trash button is visible in the ink toolbar. Ink's fate under Clear is therefore **[INF]**, not [OBS]. See §27-U9. The sticky note's survival is [OBS] and unambiguous.)*

**Undo:** `Cmd/Ctrl+Z` must restore a Clear. **[ASM]**

---

## 9.12 Flow: Export

**Goal:** get the diagram out. **Precondition:** any document.

| # | Action | UI response |
|---|---|---|
| 1 | Click **Export ▾** | A dropdown opens directly beneath, left-aligned to the button, with exactly three items, each with a leading icon: **PNG image** (picture icon), **SVG vector** (code-in-box icon), **JSON (reloadable)** (`{}` icon). **[OBS — S25]** |
| 2 | Choose **PNG image** | The canvas renders to a raster and downloads as `<diagram-name>.png`. **[INF]** |
| 3 | Choose **SVG vector** | Downloads `<diagram-name>.svg`. **[INF]** |
| 4 | Choose **JSON (reloadable)** | Downloads `<diagram-name>.json` — the full serialized document, **round-trippable via Import**. The parenthetical "(reloadable)" is the product telling the user this is the lossless format. **[OBS + INF]** |

**Export requirements [ASM]:** exports must cover the **whole diagram**, not the visible viewport; include a background (transparent PNG on a dark site is a common trap — render the canvas background); render all three layers (nodes, ink, stickies); use 2× pixel ratio for PNG; embed fonts or convert text to paths in SVG so the file is portable; sanitise the filename.

**Edge cases:** exporting an empty diagram → allow, produce an empty-but-valid file **[ASM]**; very large diagram → PNG may exceed browser canvas limits, so cap at ~8000px on the long edge and scale down **[ASM]**.

---

## 9.13 Flow: Import

**Goal:** restore a previously exported JSON. **Precondition:** editable document.

| # | Action | UI response | Data |
|---|---|---|---|
| 1 | Click **Import** | The **native OS file picker** opens, filtered to `.json`. **[OBS — S26 shows the macOS dialog]** | — |
| 2 | Select a file → **Open** | The file is read client-side, parsed, validated. | — |
| 3 | Valid | The document is replaced by the imported content; canvas fits to view; Issues and Code recompute. | `MyDesign = imported` |
| 4 | Cancel | Nothing happens. **[OBS — Cancel button present]** | — |

**Validation and failure [ASM]:**
- Not JSON → toast *"That file isn't valid JSON."*
- JSON but wrong shape (missing `nodes`/`edges`, wrong `schemaVersion`) → toast *"That doesn't look like a ClassForge diagram."*
- Older `schemaVersion` → migrate silently.
- Newer `schemaVersion` → *"This file was made with a newer version of ClassForge."* and refuse.
- **Guard:** if the current diagram is non-empty, confirm before replacing. **[ASM]**
- Never `eval`; never trust the file. Clamp coordinates, cap node/edge counts (e.g. 2000), strip unknown keys, and sanitise all strings before rendering (sticky-note content is rich text — see §17 XSS note).

---

## 9.14 Flow: Sticky notes

**Goal:** annotate with prose. **Precondition:** editable document.

| # | Action | UI response | Data |
|---|---|---|---|
| 1 | Drag **Sticky note** from the ANNOTATE palette section onto the canvas | A yellow note appears at the drop point. **[OBS — S22]** | `stickyNotes.push(...)` |
| 2 | — | The note renders: a header strip with **7 colour dots** (white, red/pink, orange, green, teal, blue-purple, pink), a **B** button, an *I* button, and an **×** close button; below, a body with placeholder **"Write a note… (⌘/Ctrl+B bold · ⌘/Ctrl+I italic)"**. **[OBS — S22, S24]** | — |
| 3 | Click the body and type | Rich text entry. `⌘/Ctrl+B` bold, `⌘/Ctrl+I` italic — the placeholder documents its own shortcuts. **[OBS]** | `note.content` (HTML) |
| 4 | Click a colour dot | The note's background changes to that colour. **[INF]** | `note.color` |
| 5 | Drag the header | The note moves. **[INF]** | `note.x/y` |
| 6 | Click the note (not the body) | Selected: **8 small square resize handles** appear at the corners/edges. **[OBS — S24 shows corner handles]** | `selection = noteId` |
| 7 | Drag a handle | Resizes. **[INF]** | `note.width/height` |
| 8 | Click **×** | The note is deleted. **[INF]** | `stickyNotes.splice(...)` |

**Z-order:** stickies render **above** nodes (S24: the note overlaps `NewClass0`). **[OBS]**
**Default size:** ~275×200 CSS px at 100% zoom. **[OBS — measured from S24]**
**Default colour:** yellow/amber `#FDE047`-ish. **[OBS]**
**Survives Clear.** **[OBS — §9.11]**
**Sanitisation:** the body is `contenteditable`; on import/restore, sanitise to an allowlist of `<b> <i> <br> <div>` only. **[ASM — security-critical, §17]**

---

## 9.15 Flow: Ink annotation

**Goal:** sketch freely over the diagram. **Precondition:** editable document.

| # | Action | UI response | State |
|---|---|---|---|
| 1 | (default) | A small floating toolbar sits **bottom-centre** of the canvas with two icons: **pen** and **eraser**. **[OBS — S2..S16 show the collapsed 2-icon form]** | `inkTool = null` |
| 2 | Click the **pen** | The toolbar **expands** to reveal a divider, then **5 colour swatches** (cyan, red, amber, purple, white) and **3 stroke-width dots** (small, medium, large). The pen icon shows an active teal state. **[OBS — S17]** | `inkTool = 'pen'` |
| 3 | Hover a colour | A tooltip shows the **hex value** (`#f43f5e` observed above the red swatch). **[OBS — S17]** | — |
| 4 | Click a colour / width | It becomes the active selection (ring around the swatch; the active width dot sits on a raised chip). **[OBS]** | `inkColor`, `inkWidth` |
| 5 | Drag on the canvas | A smooth freehand stroke is drawn and stays. **[OBS — S23 shows a cyan stroke]** | `inkStrokes.push(...)` |
| 6 | (once ≥1 stroke exists) | A **trash icon** appears at the right end of the toolbar. **[OBS — compare S17 (no trash) with S23 (trash present)]** | — |
| 7 | Click **trash** | Deletes all ink on this document (confirm first). **[INF]** | `inkStrokes = []` |
| 8 | Click the **eraser** | Eraser arms; its icon takes a **red-tinted active state**. **[OBS — S18]** | `inkTool = 'eraser'` |
| 9 | Drag over a stroke | That stroke is removed (whole-stroke erase is simplest and matches the tool's granularity). **[INF]** | — |
| 10 | Click the active tool again / press `Escape` | Tool disarms, toolbar collapses to two icons, ink layer becomes click-through. **[INF]** | `inkTool = null` |

**Critical rule:** while `inkTool === null`, the ink layer **must not intercept pointer events**, or nodes underneath become unclickable. **[INF — mandatory]**

---

## 9.16 Flow: Switch documents / close a reference tab

| # | Action | UI response | State |
|---|---|---|---|
| 1 | Click a tab | That document becomes active. Canvas swaps to its nodes/edges/notes/ink and **restores that document's own viewport**. Right panel recomputes Issues and Code for the new document; Notes shows that document's scratch notes. Selection clears. **[INF — per-document viewport is standard and the tabs are independent documents]** |
| 2 | Click **×** on a reference tab | The tab closes without confirmation (nothing is lost — it's a read-only copy that can be reloaded from the library). If it was active, focus falls back to `My Design`. **[INF]** |
| 3 | — | `My Design` renders **no ×** and cannot be closed. **[OBS]** |

---

## 9.17 Flow: Pan, zoom, fit

| Control | Action | Result |
|---|---|---|
| **`+` button** (bottom-left stack) | click | Zoom in one step (~1.2×) about the viewport centre. **[OBS button; ASM step]** |
| **`−` button** | click | Zoom out one step. **[OBS]** |
| **Fit-view button** (⛶ corners icon) | click | Zoom/pan so the whole diagram fits with padding. **[OBS]** |
| **Lock button** (4th, partially cut off at the bottom of every screenshot) | toggle | Locks panning/zooming (or locks node dragging). **[OBS that a 4th control exists; INF for its function — §27-U8]** |
| Mouse wheel / trackpad pinch | — | Zoom about the cursor. **[ASM]** |
| Space+drag, middle-drag, or drag on empty canvas | — | Pan. **[ASM]** |

Zoom range: 0.1×–2.5×. **[ASM]** Viewport is persisted per document. **[INF]**

---

# 10. Detailed Page Specifications

The application is one page. This section therefore specifies the **workspace** and each of its **major regions** using the page-spec template, since each region is independently stateful.

---

## 10.1 Page: Workspace (the application)

**Purpose** — the single surface where all modelling, validation, generation, and practice happen.
**Route** — `/`. **Access** — public, no auth. **Entry** — direct navigation. **Exit** — closing the tab; "Buy me a coffee" (external, `target="_blank" rel="noopener noreferrer"`).

**Layout** — a full-viewport, non-scrolling three-column grid beneath a fixed header:
```
grid-template-rows:    56px 1fr           /* header, body            */
grid-template-columns: 265px 1fr 510px    /* palette, canvas, panel  */
```
`height: 100vh; overflow: hidden` — **the page itself never scrolls**; only the palette, right panel, and modal grid scroll internally. **[OBS — no page scrollbar in any screenshot]**

**Default state** — `My Design` active, empty canvas, Inspector empty state, nothing armed, no practice session.
**Loading state** — the shell is static; there is no network fetch, so no page-level spinner. If restoring a very large diagram, show a brief centred *"Restoring your diagram…"* over the canvas only. **[ASM]**
**Empty state** — see §10.4. **Error state** — see §9.0 corrupt-storage handling.

**Global keyboard shortcuts [ASM — none observable in stills, all standard for this app class]:**

| Key | Action |
|---|---|
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Delete` / `Backspace` | Delete the selected node/edge/note |
| `Escape` | Disarm palette tool / close modal / cancel drag / deselect |
| `Cmd/Ctrl + S` | Prevent the browser save dialog; trigger Export → JSON |
| `Cmd/Ctrl + B` / `+ I` | Bold / italic inside a sticky note |
| `Cmd/Ctrl + 0` | Fit view |
| `1` … `5` | Arm Class / Abstract / Interface / Enum / Record |

**Acceptance criteria**
- AC-W1: Loading `/` with empty storage renders the full shell in under 1s with no console errors.
- AC-W2: The page has no vertical or horizontal scrollbar at ≥1280×720.
- AC-W3: Reloading after any edit restores the diagram, viewport, open tabs, active tab, notes, stickies, ink, codegen language, and codegen options exactly.
- AC-W4: With a reference tab active, every editing affordance in §8.2 is disabled or absent.

---

## 10.2 Region: AppHeader

**Purpose** — brand identity plus document-level global actions.
**Layout** — fixed 56px tall, full width, dark surface with a 1px bottom border, `display:flex; align-items:center; gap:10px; padding:0 16px`.

**Left cluster (in order) [OBS]:**
1. **Brand** — 36×36 rounded-square teal→cyan gradient tile with a white 3-circle molecule glyph; to its right, two stacked lines: `ClassForge` (~17px, 700, white) over `LLD STUDIO` (~10px, 600, letter-spacing ~0.12em, muted).
2. **Vertical divider** — 1px, ~24px tall, muted.
3. **`LLD Problems`** — **primary teal filled**, folder icon, ~15px medium. The only teal-filled button on the left; it is the product's main entry point.
4. **`Sample`** — secondary, sparkle/graph icon.
5. **`Export ▾`** — secondary, download icon + chevron. Opens the dropdown (§9.12).
6. **`Import`** — secondary, upload icon.
7. **`Clear`** — secondary, trash icon.

**Right cluster [OBS]:**
8. **`Score my solution`** — **teal outlined**, trophy icon. **Rendered only while `practiceSession != null`.**
9. **`Buy me a coffee`** — **amber filled**, dark text, coffee-cup icon, rounded ~10.

**States**
- Secondary buttons: rest = `#1b1b1f` fill + `#2e2e33` border; hover = lighten fill ~6%; active = press down 1px; **disabled** (reference tab active, for Import/Clear/Sample) = opacity 0.4, `cursor:not-allowed`, not focusable.
- `Export ▾`: chevron rotates 180° while the menu is open; the button keeps a subtle active fill. **[INF]**

**Responsive** — see §18; below ~1100px the labels collapse to icon-only with tooltips.

**Acceptance criteria**
- AC-H1: "Score my solution" is absent in normal mode and present in practice mode.
- AC-H2: Export opens a 3-item menu; `Escape` and outside-click close it; the trigger regains focus.
- AC-H3: "Buy me a coffee" opens externally in a new tab and never navigates the SPA away.

---

## 10.3 Region: PaletteSidebar

**Purpose** — the verbs: what you can add and how you can connect.
**Layout** — fixed 265px, full body height, own vertical scroll, `padding:16px 14px`, dark surface, 1px right border.

**Sections [OBS]:**

**1. `ADD CLASS · DRAG ONTO CANVAS`** — section label, then 5 rows:

| Row | Dot colour | Meaning |
|---|---|---|
| `Class` | neutral grey/white | plain classifier |
| `Abstract` | **amber** `#F59E0B` | abstract class |
| `Interface` | **light blue** `#7DD3FC` | interface |
| `Enum` | **teal** `#2DD4BF` | enumeration |
| `Record` | **green** `#34D399` | record/data class |

**2. `RELATIONSHIP · DRAG NODE → NODE`** — section label, then 6 rows, each with a **glyph** rather than a dot:

| Row | Glyph |
|---|---|
| `Inherit` | ▷ hollow triangle |
| `Realize` | ▷ hollow triangle (dashed connotation) |
| `Compose` | ◆ filled diamond |
| `Aggregate` | ◇ hollow diamond |
| `Associate` | → arrow |
| `Depend` | ⇢ dashed arrow |

**3. Helper text** — muted, ~13px, `line-height:1.5`, directly below the relationship rows:
> *"Pick a type, then drag from one class's edge to another to connect them."* **[OBS]**

**4. `ANNOTATE`** — section label, then one row: `Sticky note` with an **amber** dot. **[OBS]**

**Row component spec** — full width, ~46px tall, radius ~10, fill `#17171A`, border 1px `#2A2A2E`, `display:flex; align-items:center; gap:12px; padding:0 14px`, label ~15px.
**States [OBS]:** rest as above; **armed** = 1px **teal** border + **teal** label text + faint teal glow (S2 `Associate`, S9/S12 `Inherit`/`Realize`, S22 `Aggregate`); hover = fill lightens; dragging = ~0.6 opacity ghost; disabled (read-only doc) = 0.4 opacity.

**Mutual exclusion:** at most **one** row across *both* the class and relationship groups is armed at any time. Arming a class row disarms a relationship row and vice versa. **[OBS — never more than one teal row in any screenshot]**

**Acceptance criteria**
- AC-P1: Clicking `Inherit` arms it and disarms any other armed row.
- AC-P2: Dragging `Abstract` onto the canvas creates a node with kind Abstract whose title renders italic under an `«abstract»` stereotype.
- AC-P3: With a reference tab active, no row can be armed and all rows appear disabled.

---

## 10.4 Region: CanvasStage

**Purpose** — the model, drawn and manipulated.
**Layout** — fills the centre column beneath the document tab bar. `position: relative; overflow: hidden`.

**Background [OBS]** — near-black `#0A0A0B` with a **dotted grid**: ~1px dots, ~16px spacing at 100% zoom, colour ~`#26262B`. The dot grid scales and translates with the viewport.

**Children (z-order, bottom → top):**
1. Dot-grid background
2. Edges (SVG)
3. Nodes
4. Ink layer
5. Sticky notes
6. **PracticeBanner** — floating, top-centre, ~24px from the top **[OBS]**
7. **ZoomControls** — floating, bottom-left, vertical stack **[OBS]**
8. **InkToolbar** — floating, bottom-centre **[OBS]**

**States**
- **Default (populated)** — nodes and edges rendered at the document's viewport.
- **Empty (`My Design`, no content, not practising)** — must not be a blank void. Show centred muted guidance: *"Drag a class from the left to start, or open the **LLD Problems** library to practise a classic design."* with the library word as a button. **[ASM — required for usability]**
- **Empty (in practice mode)** — the banner is present and is itself the instruction; keep the canvas clean and show at most a faint hint. **[OBS — S7 shows a genuinely empty canvas with only the banner]**
- **Read-only** — no handles, no dragging, no ink toolbar, disabled palette.
- **Loading** — not applicable (local data).

**Acceptance criteria**
- AC-C1: Panning or zooming moves nodes, edges, ink, and sticky notes together with no drift.
- AC-C2: With no ink tool armed, clicking through the area where a stroke was drawn selects the node underneath.
- AC-C3: The fit-view button frames all content, including sticky notes and ink, with padding.

### 10.4.1 Component: PracticeBanner

**Rendered when** `practiceSession != null`. **[OBS — S7]**
**Appearance** — rounded ~14 card, dark fill `#101014`, **1px teal border**, subtle outer glow, `padding:14px 16px`, `display:flex; align-items:center; gap:16px`, width ~700px, centred horizontally.
**Content, left→right [OBS]:**
- **`PRACTICE`** pill — teal fill, dark text, ~11px, 700, letterspaced, radius full.
- **Title** — the problem name, ~17px, 600, white (`Parking Lot`).
- **Subtitle** — ~14px muted, single line, **truncated with an ellipsis** (`Model the classes & relationships, th…`).
- Spacer.
- **`Brief`** — secondary button.
- **`Reveal reference`** — **teal outlined** button (the emphasised one).
- **`Exit`** — secondary button.

**Acceptance criteria**
- AC-PB1: The banner appears within one frame of clicking Practice and disappears on Exit.
- AC-PB2: It never overlaps the zoom controls or ink toolbar at ≥1280px width.
- AC-PB3: `Reveal reference` focuses an already-open reference tab rather than opening a second one.

### 10.4.2 Component: ZoomControls
Vertical stack, bottom-left, ~28px from each edge; four square ~34px buttons in a rounded ~10 column with 1px borders: **`+`**, **`−`**, **fit-view (⛶)**, **lock**. **[OBS]**

### 10.4.3 Component: InkToolbar
Floating pill, bottom-centre, dark fill, 1px border, radius ~12, ~8px padding. **[OBS]**
- **Collapsed:** `✎` pen · `⌫` eraser. **[OBS — S2]**
- **Expanded (pen armed):** `✎` `⌫` │ 5 colour dots │ 3 width dots │ *(trash, only when ink exists)*. **[OBS — S17, S23]**
- Colour dots ~20px circles; the active one carries a ring. Hovering shows a **hex tooltip** (`#f43f5e`). **[OBS]**
- Width dots are three filled circles of increasing radius on a shared chip; the active one sits on a raised background. **[OBS]**
- Eraser active state is **red-tinted**, distinct from the pen's teal. **[OBS — S18]**

---

## 10.5 Region: RightPanel

**Purpose** — semantic detail of the selection, plus the two derived views and a notepad.
**Layout** — fixed 510px, full body height, 1px left border. A tab bar (~46px) on top, then a scrolling body.

**Tab bar [OBS]** — four text tabs, evenly spaced, ~15px: `Inspector` · `Issues` *(count badge)* · `Code` · `Notes`.
- **Active:** teal text + a **2px teal underline** flush with the tab bar's bottom border.
- **Inactive:** muted text, no underline; hover lightens.
- **Issues badge:** a small rounded-full chip immediately right of the word, showing the integer count. Neutral/grey at `0`, teal/green when > 0. **[OBS — S12 `0`, S13 `1`]**

Tab choice is **workspace-level UI state**, not per document — switching documents keeps you on the same tab. **[INF]**

### 10.5.1 Tab: Inspector

**Empty state [OBS — S2]** — vertically centred, two muted lines:
> **"Select a class or arrow to edit it."**
> **"Drag a kind from the left palette to add one."**

**Node-selected state** — the form specified in §9.7, in exact field order. Section labels `ATTRIBUTES` and `METHODS` are uppercase muted. `+ attribute` / `+ method` are full-width **dashed-border** buttons. `Delete class` is full-width with red text and a red border and a leading trash icon. **[OBS — S9]**

**Edge-selected state [INF — the empty state explicitly says "or arrow", so this must exist; no screenshot shows it]:**
```
RELATIONSHIP TYPE  [select ▾: Inherit|Realize|Compose|Aggregate|Associate|Depend]
LABEL              [text]         ← the role name ("vehicle", "paymentStrategy")
SOURCE MULTIPLICITY [text]        ← "1", "0..1", "1..*"
TARGET MULTIPLICITY [text]
[ 🗑 Delete relationship ]
```
Justified by the observed edge labels and multiplicities in S2/S3.

**Sticky-selected state [ASM]** — colour, and a delete action. (The note's own header already provides colour/bold/italic/close, so the Inspector may simply show the empty state instead; choose one and be consistent.)

**Acceptance criteria**
- AC-I1: Selecting a node switches the panel to Inspector automatically and populates every field from the model.
- AC-I2: Typing in NAME updates the canvas node title on each keystroke, with no commit action.
- AC-I3: `+ attribute` appends a row and focuses its name input.
- AC-I4: `Delete class` removes the node and every edge touching it, then returns the panel to its empty state.
- AC-I5: On a read-only document, all inputs are non-editable and `Delete class` is absent.

### 10.5.2 Tab: Issues
Specified in §9.9. **Acceptance:** AC-IS1 badge equals list length; AC-IS2 valid diagram shows the green-check empty state; AC-IS3 the exact R1 message string is reproduced; AC-IS4 the badge updates within one frame of the mutation.

### 10.5.3 Tab: Code
Specified in §9.10.
**Layout [OBS — S4]:** row 1 = six language pills; row 2 = `Copy` and `Download` (secondary, with icons); row 3–4 = five option chips wrapping onto two lines; then a horizontal rule; then the code body — monospace ~14px, `line-height:1.6`, generous left padding, **scrolls vertically**, long lines **clip horizontally** (S4 shows `public Vehicle(String licensePlate, VehicleType t` cut at the panel edge, so there is no wrapping). **[OBS]**
**Acceptance:** AC-CO1 switching language regenerates instantly; AC-CO2 chips are independently toggleable and cumulative; AC-CO3 `equals/hashCode` on + Java adds `import java.util.Objects;`; AC-CO4 Copy places the identical string on the clipboard; AC-CO5 Python emits `__repr__`, not `toString`.

### 10.5.4 Tab: Notes
**Purpose** — a scratchpad for approach and trade-offs, saved with the diagram.
**Layout [OBS — S6]:** header row with `SCRATCH NOTES` (uppercase muted, left) and **`saved automatically`** (small muted, right). Below, a large **monospace** textarea filling the panel, dark fill, 1px border, radius ~10.
**Placeholder [OBS — exact, two paragraphs]:**
> *"Jot down your approach, trade-offs, edge cases, patterns to remember…"*
>
> *"These notes are saved with this diagram and persist across reloads."*

**Behaviour:** plain text; autosaves on a ~500 ms debounce; **one scratch-notes value per document**; no formatting toolbar; no character limit (cap at ~100k for storage safety **[ASM]**).
**Acceptance:** AC-N1 text survives a page reload; AC-N2 switching to a reference tab and back shows each document's own notes; AC-N3 no explicit save control exists.

---

## 10.6 Region: DocumentTabBar

Sits between the header and the canvas, ~44px tall, spanning the canvas column only (the palette and right panel run full height beside it). **[OBS]**

**Tab appearance [OBS]:**
- **`My Design`** (active) — raised pill, lighter fill `#232327`, white text, radius ~8. **No close button.**
- **Reference tab** — flat, muted text; a **lock glyph** before the title, the title `Parking Lot — Reference`, a teal **`REF`** badge (~10px, 700, letterspaced, teal text on a faint teal fill), then an **×**.
- Inactive tabs are muted; hover lightens; the × brightens on hover.

**Acceptance:** AC-T1 `My Design` renders no ×; AC-T2 closing the active reference tab falls back to `My Design`; AC-T3 loading the same solution twice focuses the existing tab; AC-T4 each tab restores its own viewport.

---

## 10.7 Overlay: ProblemLibraryModal
Specified in §9.1.
**Layout [OBS — S1]:** centred dialog, ~72% viewport width (max ~1240px) × ~88% height, radius ~16, dark `#101013` fill, 1px border, large drop shadow, over a ~55%-opacity scrim. Header block (title 22px 700 + 15px muted subtitle) with a 1px bottom border; × at top-right in a ~36px bordered square. Body = a **2-column grid**, ~24px gap, ~28px padding, scrolling.
**Card [OBS]:** radius ~14, fill `#141417`, 1px border `#2A2A2F`, ~24px padding, min-height ~360px. Hover raises the border toward teal. **[ASM]**
**Accessibility [ASM]:** `role="dialog" aria-modal="true"`, labelled by the title, focus trapped, focus restored on close, `Escape` closes, background inert.
**Acceptance:** AC-M1 `Escape`, ×, and scrim click all close it; AC-M2 focus is trapped; AC-M3 the grid scrolls while the header stays fixed; AC-M4 `Load solution` opens a REF tab and closes the modal in one action; AC-M5 `Practice` clears the canvas (after confirmation if non-empty), shows the banner, and reveals "Score my solution".

---

# 11. Detailed Component Specifications

Build these as shared, reusable units. Props are given in TypeScript.

| # | Component | Purpose | Key props | Variants | States |
|---|---|---|---|---|---|
| C1 | `AppHeader` | Global actions | `mode`, `readOnly`, handlers | — | practice / normal |
| C2 | `BrandMark` | Logo + wordmark | `size` | full / mark-only | — |
| C3 | `ToolbarButton` | Header action | `icon`, `label`, `variant`, `disabled`, `hasMenu` | `primary`(teal fill) · `secondary`(dark) · `accent`(amber) · `outline`(teal outline) | rest/hover/active/disabled/loading |
| C4 | `DropdownMenu` | Export menu | `items[{icon,label,onSelect}]`, `anchor` | — | open/closed |
| C5 | `PaletteSection` | Labelled palette group | `label`, `children` | — | — |
| C6 | `PaletteRow` | Draggable/armable tool | `icon\|dotColor`, `label`, `armed`, `disabled`, `onArm`, drag payload | dot (kinds) · glyph (relationships) | rest/hover/armed/dragging/disabled |
| C7 | `DocumentTabBar` | Tab strip | `documents[]`, `activeId` | — | — |
| C8 | `DocumentTab` | One tab | `title`, `active`, `readOnly`, `closable` | editable · reference | active/inactive/hover |
| C9 | `Badge` | Small status chip | `text`, `tone` | `REF`(teal) · `EASY`(green) · `MEDIUM`(amber) · `HARD`(red) · count | — |
| C10 | `CanvasStage` | Graph host + layers | `document`, `readOnly` | — | default/empty/read-only |
| C11 | `ClassNode` | One classifier | `node`, `selected` | class · abstract · interface · enum · record | default/selected/hover/dragging/read-only |
| C12 | `RelationshipEdge` | One relationship | `edge`, `selected` | 6 types | default/selected/hover |
| C13 | `ConnectionHandle` | Edge anchor | `side`, `nodeId` | left · right | idle/hover/connecting |
| C14 | `StickyNote` | Rich-text note | `note`, `selected` | 7 colours | idle/editing/selected/resizing |
| C15 | `InkLayer` | Freehand strokes | `strokes`, `tool`, `color`, `width` | — | inert(pointer-events:none)/drawing/erasing |
| C16 | `InkToolbar` | Ink controls | `tool`, `color`, `width`, `hasStrokes` | collapsed · expanded | — |
| C17 | `ZoomControls` | Viewport controls | handlers, `locked` | — | — |
| C18 | `PracticeBanner` | Session HUD | `problem`, handlers | — | — |
| C19 | `RightPanel` | Tabbed side panel | `activeTab`, `issueCount` | — | — |
| C20 | `TabBar` | Generic text tabs | `tabs[{id,label,badge}]`, `activeId` | underline | — |
| C21 | `Inspector` | Selection editor | `selection`, `readOnly` | node · edge · sticky · empty | populated/empty/read-only |
| C22 | `FormField` | Labelled input | `label`, `placeholder`, `value` | text · select · textarea | rest/focus/disabled/error |
| C23 | `MemberRow` | Attribute or method editor | `member`, `kind`, handlers | attribute (S/F) · method (S/A) | — |
| C24 | `VisibilityButton` | Cycles `- + # ~` | `value`, `onChange` | — | — |
| C25 | `MiniToggle` | One-letter flag | `letter`, `active` | S · F · A | on/off |
| C26 | `AddRowButton` | Dashed add control | `label` | — | rest/hover |
| C27 | `DangerButton` | Destructive action | `label`, `icon` | — | rest/hover/disabled |
| C28 | `IssuesPanel` | Lint results | `issues[]` | — | empty(valid)/populated |
| C29 | `IssueRow` | One finding | `issue` | warning(amber) · error(red) | rest/hover |
| C30 | `EmptyState` | Centred message | `icon?`, `title`, `description` | with-icon · text-only | — |
| C31 | `CodePanel` | Codegen view | `code`, `language`, `options` | — | populated/empty |
| C32 | `PillGroup` | Exclusive pills | `options[]`, `value` | — | — |
| C33 | `ChipToggle` | Independent chip | `label`, `active` | — | on/off |
| C34 | `CodeViewer` | Monospace output | `code`, `language` | — | — |
| C35 | `NotesPanel` | Scratchpad | `value`, `onChange` | — | empty(placeholder)/filled |
| C36 | `Modal` | Dialog shell | `title`, `subtitle`, `onClose` | — | open/closed |
| C37 | `ProblemCard` | One library entry | `problem`, handlers | — | rest/hover |
| C38 | `ConfirmDialog` | Destructive confirmation | `title`, `body`, `confirmLabel`, `tone` | danger · neutral | — |
| C39 | `Toast` | Transient feedback | `message`, `tone` | success · error · info | entering/visible/leaving |
| C40 | `ScoreResultModal` | Practice score | `result` | — | **[ASM]** |

## 11.1 `ClassNode` — the most important component

**Structure [OBS — S2, S12]:**
```
┌─────────────────────────────────┐
│          «abstract»             │  ← stereotype line, ~11px, ITALIC, AMBER,
│           Vehicle               │     centred; only for non-plain kinds
├─────────────────────────────────┤  ← header band, slightly lighter fill
│  - licensePlate: String         │
│  - type: VehicleType            │  ← attribute compartment
├─────────────────────────────────┤  ← 1px divider
│  + getType(): VehicleType       │  ← operation compartment
└─────────────────────────────────┘
   ●                           ●     ← teal connection handles, L/R mid-edge
```

**Rules:**
- Fill `#1C1C20`; header band `#242429`; border 1px `#2E2E34`; radius ~10; min-width ~200px; width grows with the longest line. **[OBS]**
- **All node text is monospace.** **[OBS]**
- Class name: ~15px, 700, centred, white. **Italic when kind is Abstract or Interface.** **[OBS — `Vehicle` and `NewClsdsd` are italic]**
- Stereotype line above the name, centred, italic, ~11px: `«abstract»` (amber), `«interface»` (light blue), `«enumeration»` (teal). **Plain Class and Record show no stereotype.** **[OBS — S2 shows `«enumeration»` on VehicleType/SpotType and `«abstract»` on Vehicle; Car/Bike/Truck/ParkingSpot show none]**
- Attribute line: `<vis> <name>: <Type>` — the visibility sign muted, the name white, the type teal/muted. **[OBS]**
- Method line: `<vis> <name>(<params>): <Return>`. **[OBS]**
- **Empty compartments render italic muted placeholders `no attributes` / `no operations`** — they do **not** collapse. **[OBS — S2 `Bike` and `Truck` show both placeholders]**
- **Enum body** lists bare literals with **no** visibility sign and **no** type (`CAR` / `BIKE` / `TRUCK`), and shows **no** operation compartment when empty. **[OBS — S2]**
- **Selected:** 2px teal border + soft teal outer glow. **[OBS — S12]**
- **Handles:** ~10px teal filled circles centred on the left and right edges, at the vertical midpoint. **[OBS]** Visible on hover/selection; always visible while a relationship tool is armed. **[INF]**

## 11.2 `RelationshipEdge`
Renders per the table in §9.8. Additional rules: routing is smooth bezier or orthogonal — the screenshots show **straight/gently-curved lines**, so use straight with a slight curve **[OBS]**; edges render **beneath** nodes; the label sits at the midpoint on a small dark chip so it stays legible over the grid **[OBS]**; multiplicities sit just inside each endpoint **[OBS]**; selected edges thicken and turn teal **[ASM]**; hit area is a ~12px invisible stroke for easy selection **[ASM]**.

---

# 12. State Machines

## 12.1 Application boot
```
        ┌──────────┐  storage empty        ┌───────┐
  ─────►│ BOOTING  │──────────────────────►│ READY │
        └────┬─────┘                       └───────┘
             │ storage present, parse ok         ▲
             ├──────────────────────────────────-┘
             │ parse fails
             ▼
        ┌──────────────────┐  discard + toast   ┌───────┐
        │ RESTORE_FAILED   │───────────────────►│ READY │
        └──────────────────┘                    └───────┘
```

## 12.2 Palette tool arming
```
IDLE ──click class row──► ARMED_KIND ──click canvas──► (node created) ARMED_KIND
IDLE ──click rel row────► ARMED_REL  ──complete drag─► (edge created)  ARMED_REL
ARMED_* ──Escape / click same row──► IDLE
ARMED_KIND ──click rel row──► ARMED_REL          (mutual exclusion)
ARMED_* ──switch to read-only doc──► IDLE
```
Note the self-loops: **the armed tool persists after use** (observed, §9.8).

## 12.3 Edge creation
```
IDLE ──pointerdown on handle (tool armed)──► CONNECTING
CONNECTING ──pointermove──► CONNECTING            (preview follows cursor)
CONNECTING ──pointerup on valid target──► VALIDATE
CONNECTING ──pointerup on empty canvas / Escape──► IDLE   (no edge)
VALIDATE ──duplicate edge exists──► IDLE          (silently keep existing)
VALIDATE ──ok──► CREATED ──► lint + codegen recompute ──► IDLE
```

## 12.4 Right panel / selection
```
                 ┌──────────────────┐
                 │ INSPECTOR_EMPTY  │◄─── deselect / delete selection
                 └────────┬─────────┘
        select node ──────┤────── select edge
                 ▼        ▼
        ┌──────────────┐ ┌───────────────┐
        │ NODE_SELECTED│ │ EDGE_SELECTED │
        └──────────────┘ └───────────────┘
   (selecting anything also forces rightPanelTab = 'inspector')
```

## 12.5 Practice session
```
   NONE ──Practice clicked──► [canvas non-empty?] ──yes──► CONFIRM_CLEAR
                                     │no                      │confirm
                                     ▼                        ▼
                                  ACTIVE ◄─────────────────────┘
                                     │cancel → NONE
   ACTIVE ──Brief──►        ACTIVE (modal over)
   ACTIVE ──Reveal reference──► ACTIVE (ref tab focused, session intact)
   ACTIVE ──Score my solution──► SCORING ──ok──► SCORED ──close──► ACTIVE
                                        └─empty canvas─► ACTIVE (+ hint)
   ACTIVE|SCORED ──Exit──► NONE   (diagram retained)
```

## 12.6 Ink tool
```
INERT ──click pen───► PEN ──drag──► DRAWING ──pointerup──► PEN
INERT ──click eraser► ERASER ──drag──► ERASING ──pointerup──► ERASER
PEN|ERASER ──click active tool again / Escape──► INERT
* ──switch to read-only doc──► INERT (toolbar hidden)
```
`INERT` ⇒ `pointer-events: none` on the ink layer.

## 12.7 Async operation template (Copy, Export, Import, Score)
```
IDLE ──trigger──► PENDING ──success──► SUCCESS ──2s──► IDLE
                     └────failure───► ERROR ──dismiss/retry──► IDLE
```
While `PENDING`, the trigger is **disabled** — this is the duplicate-submission guard (§15.6).

---

# 13. Domain / Data Model

TypeScript is normative. All ids are opaque strings (`nanoid`/`crypto.randomUUID`). **[ASM for the shape; every field is justified by an observation.]**

```ts
type Id = string;
type ISODate = string;                    // "2026-09-08T23:48:30.000Z"

/* ─── Enumerations ─────────────────────────────────────────────── */

type ClassKind =
  | 'CLASS' | 'ABSTRACT' | 'INTERFACE' | 'ENUM' | 'RECORD';        // [OBS]

type RelationshipType =
  | 'INHERIT' | 'REALIZE' | 'COMPOSE'
  | 'AGGREGATE' | 'ASSOCIATE' | 'DEPEND';                          // [OBS]

type Visibility = 'private' | 'public' | 'protected' | 'package';
// rendered as  '-'       '+'      '#'         '~'      [OBS: - and +; INF: # and ~]

type Language =
  | 'java' | 'python' | 'typescript'
  | 'javascript' | 'cpp' | 'csharp';                               // [OBS]

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';                      // [OBS]
type IssueSeverity = 'error' | 'warning' | 'info';                 // [OBS: warning=amber]

/* ─── Class members ────────────────────────────────────────────── */

interface Attribute {
  id: Id;
  visibility: Visibility;      // default 'private'          [OBS: seeded as '-']
  name: string;                // required, non-empty
  type: string;                // free text, e.g. 'long', 'List<Ticket>'
  defaultValue?: string;       // "= default value (optional)" [OBS]
  isStatic: boolean;           // the 'S' toggle               [INF]
  isFinal: boolean;            // the 'F' toggle               [INF]
}

interface Method {
  id: Id;
  visibility: Visibility;      // default 'public'           [OBS: seeded as '+']
  name: string;
  parameters: string;          // raw string, "int id, String name" [OBS: single input]
  returns: string;             // 'void' by default            [OBS]
  isStatic: boolean;           // 'S'                          [INF]
  isAbstract: boolean;         // 'A'                          [INF]
}

/* ─── Graph elements ───────────────────────────────────────────── */

interface ClassNode {
  id: Id;
  kind: ClassKind;
  name: string;                // unique within a document (lint rule)
  generics?: string;           // "T" or "K, V"                [OBS]
  attributes: Attribute[];
  methods: Method[];
  note?: string;               // NOTE / DOC COMMENT           [OBS]
  position: { x: number; y: number };
  size?: { width: number; height: number };   // auto unless resized
}

interface Relationship {
  id: Id;
  type: RelationshipType;
  sourceId: Id;                // → ClassNode.id
  targetId: Id;                // → ClassNode.id
  label?: string;              // "vehicle", "paymentStrategy" [OBS]
  sourceMultiplicity?: string; // "1", "0..1", "1..*"          [OBS]
  targetMultiplicity?: string;
}

/* ─── Annotation layers ────────────────────────────────────────── */

interface StickyNote {
  id: Id;
  content: string;             // sanitised HTML (b, i, br, div only)
  color: string;               // one of 7 presets             [OBS]
  position: { x: number; y: number };
  size: { width: number; height: number };  // default ~275×200 [OBS]
}

interface InkStroke {
  id: Id;
  points: Array<{ x: number; y: number; pressure?: number }>;
  color: string;               // one of 5 presets, e.g. '#f43f5e' [OBS]
  width: number;               // one of 3 presets              [OBS]
}

/* ─── Document ─────────────────────────────────────────────────── */

interface Diagram {
  id: Id;
  title: string;               // "My Design" | "Parking Lot — Reference"
  readOnly: boolean;           // true for reference tabs       [OBS]
  sourceProblemId?: Id;        // set on reference tabs
  nodes: ClassNode[];
  edges: Relationship[];
  stickyNotes: StickyNote[];
  inkStrokes: InkStroke[];
  scratchNotes: string;        // Notes tab, per document       [OBS]
  viewport: { x: number; y: number; zoom: number };
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ─── Static library data (bundled, not user data) ─────────────── */

interface Problem {
  id: Id;                      // 'parking-lot'
  title: string;               // "Parking Lot"                 [OBS]
  difficulty: Difficulty;                                     // [OBS]
  patterns: string[];          // ["Strategy","Factory","Singleton"] [OBS]
  description: string;         // card paragraph                [OBS]
  requirements: string[];      // 4 bullets                     [OBS]
  practicePrompt: string;      // "Model the classes & relationships, th…" [OBS]
  stats: { classes: number; relationships: number };  // "15 classes · 13 relationships" [OBS]
  referenceDiagram: Omit<Diagram,'id'|'createdAt'|'updatedAt'|'readOnly'|'title'>;
}

/* ─── Derived (never stored) ───────────────────────────────────── */

interface Issue {
  id: Id;
  severity: IssueSeverity;
  subjectNodeId?: Id;
  subjectName: string;         // rendered mono + teal          [OBS]
  message: string;             // full sentence, ends with '.'  [OBS]
  ruleId: string;              // 'realize-target-not-interface'
}

/* ─── Workspace (the persisted root) ───────────────────────────── */

interface Workspace {
  schemaVersion: number;                  // 1
  documents: Diagram[];
  activeDocumentId: Id;
  practiceSession: { problemId: Id; startedAt: ISODate } | null;  // [OBS]
  ui: {
    rightPanelTab: 'inspector' | 'issues' | 'code' | 'notes';
    codeLanguage: Language;                       // default 'java'  [OBS]
    codeOptions: {
      constructor: boolean;      // default true                    [OBS]
      gettersSetters: boolean;   // default true                    [OBS]
      toStringM: boolean;        // default false                   [OBS]
      equalsHashCode: boolean;   // default false                   [OBS]
      docComments: boolean;      // default true                    [OBS]
    };
    inkColor: string;            // default cyan                    [OBS]
    inkWidth: number;
  };
}
```

## 13.1 Relationships between entities

```
Workspace  1 ──── * Diagram              (open tabs)
Workspace  1 ──── 0..1 PracticeSession
Diagram    1 ──── * ClassNode
Diagram    1 ──── * Relationship
Diagram    1 ──── * StickyNote
Diagram    1 ──── * InkStroke
Diagram    1 ──── 1 scratchNotes (string)
ClassNode  1 ──── * Attribute            (composition — deleted with the node)
ClassNode  1 ──── * Method               (composition)
Relationship * ──── 1 ClassNode (source) (must exist — no dangling edges)
Relationship * ──── 1 ClassNode (target)
Problem    1 ──── 1 referenceDiagram     (bundled, static)
Problem    1 ──── * Diagram              (a REF tab records sourceProblemId)
Diagram    1 ──── * Issue                (derived, never persisted)
Diagram    1 ──── 1 generatedCode        (derived, never persisted)
```

## 13.2 Invariants (enforce in the store, not the UI)
1. Exactly one document has `id === 'my-design'`; it always exists and has `readOnly === false`.
2. `activeDocumentId` always references an existing document.
3. Every `Relationship.sourceId` and `.targetId` references a node **in the same document**.
4. Deleting a node deletes every edge referencing it, atomically. **[§14-BR30]**
5. `Issue[]` and generated code are **never** persisted — always recomputed from the model.
6. Node `name` should be unique within a document; violations are a lint warning, not a hard error (the user may be mid-typing).
7. `readOnly === true` ⇒ no mutation of that document is ever committed.

---

# 14. Business Logic

Rules are tagged **[C]** confirmed by observation, **[I]** inferred, **[A]** implementation assumption.

## 14.1 Document and workspace rules

| ID | Rule | Tag |
|---|---|---|
| BR01 | `My Design` always exists, is always editable, and can never be closed (no × is rendered). | **[C]** |
| BR02 | Reference tabs are permanently read-only; read-only-ness is a property of the document, not a toggle. | **[C]** |
| BR03 | A reference tab's title is exactly `"<Problem title> — Reference"`. | **[C]** |
| BR04 | A reference tab displays a lock glyph and a `REF` badge. | **[C]** |
| BR05 | Reference tabs are closable; closing one loses nothing (it can be reloaded from the library). | **[I]** |
| BR06 | Each document keeps its own viewport, scratch notes, stickies, and ink. | **[I]** |
| BR07 | The right-panel tab selection is workspace-level and survives document switches. | **[I]** |
| BR08 | Closing the active tab activates `My Design`. | **[I]** |
| BR09 | There is no "Save" control anywhere; all persistence is automatic. | **[C]** |
| BR10 | Autosave is debounced (~500 ms) and writes the whole workspace. | **[A]** |
| BR11 | Everything survives a page reload. | **[C]** |
| BR12 | Loading the same problem's solution twice focuses the existing tab rather than duplicating it. | **[A]** |

## 14.2 Modelling rules

| ID | Rule | Tag |
|---|---|---|
| BR20 | A new node is named `NewClass<N>` with a zero-based counter, choosing the lowest free N. | **[C]** name pattern / **[A]** free-N rule |
| BR21 | A new Class/Abstract node is seeded with `- id: long` and `+ doWork(): void`. | **[C]** |
| BR22 | Two nodes may not be joined twice by the same relationship type in the same direction. | **[A]** |
| BR23 | A relationship requires both endpoints to be nodes; dropping on empty canvas creates nothing. | **[A]** |
| BR24 | The armed relationship type persists after an edge is created, allowing repeat use. | **[C]** |
| BR25 | Exactly one palette row may be armed at a time, across both groups. | **[C]** |
| BR26 | Abstract and Interface node names render *italic*; both also render a stereotype line. | **[C]** |
| BR27 | Empty compartments render `no attributes` / `no operations`; they never collapse. | **[C]** |
| BR28 | Enum bodies list bare literals with no visibility marker and no type. | **[C]** |
| BR29 | Editing is live and uncommitted — the canvas reflects each keystroke; there is no commit step. | **[C]** |
| BR30 | Deleting a node deletes every edge that touches it, in one atomic operation. | **[I]** |
| BR31 | Destructive, non-obvious actions (Clear, Sample-over-existing, Import-over-existing, Practice-over-existing) require confirmation. Cheap reversible ones (removing an attribute row, deleting a node) do not. | **[A]** |
| BR32 | `Clear` empties nodes, edges, and ink but **preserves sticky notes**, scratch notes, the practice session, and the viewport. | **[C]** stickies / **[I]** rest |
| BR33 | Node names should be unique per document; a duplicate is a lint warning, not a block. | **[A]** |

## 14.3 Validation (lint) rules

**R1 is confirmed verbatim; the rest are the proposed rule set that the product's stated purpose requires.**

| ID | Severity | Condition | Message template | Tag |
|---|---|---|---|---|
| **R1** | warning | A `REALIZE` edge targets a node whose kind ≠ `INTERFACE` | `"<Source>" realizes "<Target>" which is not an interface.` — subject = **target** | **[C]** |
| R2 | error | Two nodes in one document share a name | `Duplicate class name "<Name>".` | **[A]** |
| R3 | error | A node's name is empty or whitespace | `This class has no name.` | **[A]** |
| R4 | error | The `INHERIT` graph contains a cycle | `"<A>" and "<B>" inherit from each other.` | **[A]** |
| R5 | warning | A node has more than one outgoing `INHERIT` edge | `"<Name>" inherits from more than one class.` | **[A]** |
| R6 | warning | An `INTERFACE` declares a non-public member | `Interface "<Name>" declares a non-public member "<M>".` | **[A]** |
| R7 | warning | An `INTERFACE` declares an attribute | `Interface "<Name>" declares an attribute "<A>" — interfaces should declare behaviour.` | **[A]** |
| R8 | warning | A concrete `CLASS` inherits an abstract method it doesn't override | `"<Name>" doesn't implement "<M>()" from "<Parent>".` | **[A]** |
| R9 | warning | An `ENUM` has no literals | `Enum "<Name>" has no values.` | **[A]** |
| R10 | warning | A node has neither attributes nor methods (and isn't an enum) | `"<Name>" is empty.` | **[A]** |
| R11 | error | An `INHERIT` or `REALIZE` edge points at itself | `"<Name>" can't inherit from itself.` | **[A]** |
| R12 | warning | A `CLASS` (not abstract/interface) declares an abstract method | `"<Name>" declares abstract "<M>()" but isn't abstract.` | **[A]** |
| R13 | info | An identifier isn't valid in the selected codegen language | `"<Name>" isn't a valid <Language> identifier.` | **[A]** |
| R14 | warning | An `INHERIT` edge targets an `INTERFACE` | `"<Source>" inherits from interface "<Target>" — use Realize instead.` | **[A]** (the mirror of R1) |

**Execution:** `lint(diagram) → Issue[]`, pure, synchronous, on every mutation. Order results **errors first, then warnings, then info**, and stably within each group by node position (top-to-bottom) so the list doesn't jump around while editing. **[A]**

## 14.4 Code generation rules

| ID | Rule | Tag |
|---|---|---|
| BR40 | Codegen is a pure function `(diagram, language, options) → string`, recomputed on any change. | **[C]** behaviour / **[A]** shape |
| BR41 | Emission order is dependency-first: enums → interfaces → abstract classes → concrete classes. | **[C]** (S4: enums, then abstract, then classes) |
| BR42 | `REALIZE` → `implements` (Java) / base class (Python). | **[C]** |
| BR43 | `INHERIT` → `extends` (Java) / base class (Python). | **[I]** |
| BR44 | `COMPOSE` / `AGGREGATE` / `ASSOCIATE` → a field on the source typed as the target, named from the edge label when present. | **[I]** |
| BR45 | `DEPEND` → no field; at most a comment or import. | **[A]** |
| BR46 | Every generated method body is a `// TODO` (Java-family) or `pass` (Python). | **[C]** |
| BR47 | Imports are emitted **only when needed** (`java.util.Objects` only with equals/hashCode). | **[C]** |
| BR48 | Type names are mapped per language (§9.10 table). | **[C]** for Python |
| BR49 | Options that are un-idiomatic in a language are ignored by that language's generator (Python emits no getters/setters). | **[C]** |
| BR50 | Generated code is never persisted and never editable. | **[I]** |

## 14.5 Practice and scoring rules

| ID | Rule | Tag |
|---|---|---|
| BR60 | "Score my solution" is rendered **iff** a practice session is active. | **[C]** |
| BR61 | The Practice banner is rendered **iff** a practice session is active. | **[C]** |
| BR62 | Starting a practice session clears `My Design` (after confirmation if non-empty). | **[I]** / **[A]** confirm |
| BR63 | `Reveal reference` opens or focuses the reference tab **without** ending the session. | **[I]** |
| BR64 | `Exit` ends the session and **keeps** the user's diagram. | **[I]** |
| BR65 | Scoring compares structure and semantics, never coordinates, using fuzzy name matching. | **[A]** |
| BR66 | Extra classes not in the reference are reported neutrally, never as errors. | **[A]** |
| BR67 | Scoring an empty canvas is refused with guidance rather than returning 0. | **[A]** |
| BR68 | A practice session survives a page reload. | **[I]** |

## 14.6 Conditional-visibility summary (single source of truth for the implementer)

| UI element | Rendered when |
|---|---|
| `Score my solution` | `practiceSession != null` **[C]** |
| Practice banner | `practiceSession != null` **[C]** |
| Ink toolbar | `!activeDoc.readOnly` **[I]** |
| Ink toolbar colour/width row | `inkTool !== null` **[C]** |
| Ink toolbar trash | `activeDoc.inkStrokes.length > 0` **[C]** |
| Tab × | `!doc.isMyDesign` **[C]** |
| Lock glyph + `REF` badge | `doc.readOnly` **[C]** |
| `Delete class` in Inspector | node selected **and** `!readOnly` **[I]** |
| Node connection handles | `!readOnly` **[I]** |
| Issues green-check empty state | `issues.length === 0` **[C]** |
| Inspector empty state | `selection === null` **[C]** |
| Sticky-note resize handles | that note is selected **[C]** |

---

# 15. Forms and Validation

## 15.1 Inspector — Class form

| Field | Control | Required | Default | Validation | Timing |
|---|---|---|---|---|---|
| **NAME** | text | Yes | `NewClass<N>` | non-empty; unique per document; should be a valid identifier | **live**, on every keystroke |
| **KIND** | select | Yes | the dragged kind | one of the 5 | on change |
| **TYPE PARAMETERS** | text, ph `e.g. T or K, V` | No | `''` | comma-separated identifiers | live |
| **Attribute · visibility** | cycling button | Yes | `-` private | one of 4 | on click |
| **Attribute · name** | text | Yes | `''` | non-empty; unique within the node | live |
| **Attribute · type** | text | Yes | `''` | non-empty | live |
| **Attribute · default** | text, ph `= default value (optional)` | No | `''` | — | live |
| **Attribute · S / F** | toggles | No | off | — | on click |
| **Method · visibility** | cycling button | Yes | `+` public | one of 4 | on click |
| **Method · name** | text | Yes | `''` | non-empty; valid identifier | live |
| **Method · parameters** | text, ph `parameters — e.g. int id, String name` | No | `''` | loosely parsed as `Type name` pairs | live |
| **Method · returns** | text | Yes | `void` | non-empty | live |
| **Method · S / A** | toggles | No | off | `A` forces the owning node toward Abstract/Interface (lint R12) | on click |
| **NOTE / DOC COMMENT** | textarea | No | `''` | — | live |

**Validation philosophy — important and non-standard:** this form has **no submit step and no blocking validation**. All problems surface in the **Issues panel**, not as inline red field errors. This is the observed behaviour: S10 shows a half-typed name (`NewClsdsd`) with no error styling, and the Issues panel is the app's dedicated validation surface. **[C]**

Consequences:
- **Never** disable an input because the model is invalid.
- **Never** block a keystroke.
- **Never** show an inline error message under an Inspector field.
- Do show the error in Issues, with the offending node identified.
- Exception: field-level affordances that are purely mechanical (e.g. trimming leading/trailing whitespace on blur) are fine. **[A]**

**Unsaved-changes behaviour:** there is no such concept — every keystroke is committed to the model and debounced to storage. Do **not** implement a `beforeunload` guard. **[I]**

## 15.2 Inspector — Relationship form
Fields per §10.5.1. Type is required; label and multiplicities are optional free text. Multiplicity should accept `1`, `0..1`, `1..*`, `*`, `n..m`; anything else is accepted but flagged as an info-level issue. **[A]**

## 15.3 Sticky note
`contenteditable` body. No validation. Bold/italic only. Content is sanitised on write and on import to `<b> <i> <br> <div>` only. **[A — security]**

## 15.4 Scratch notes
Plain textarea, no validation, autosaved, header says `saved automatically`. **[C]**

## 15.5 Import
The only true validating form. Rules in §9.13.

## 15.6 Duplicate-submission prevention
Applies to Copy, Download, Export, Import, and Score: while an operation is `PENDING`, its trigger is disabled (§12.7). Because everything is local these windows are milliseconds long, but the guard prevents double file downloads on a double-click. **[A]**

---

# 16. API / Backend Contracts

## 16.1 There is no required backend

Restating §5.4 because it is the most consequential architectural decision: **nothing in the 27 screenshots requires a server.** No spinner, no error toast, no empty-because-fetch-failed state, no auth, no sync indicator, no share affordance. The persistence copy (*"saved automatically"*, *"persist across reloads"*) describes local storage. **Build it with no backend.** **[I — high confidence; §27-U1]**

What follows is therefore the **internal module contract** — the boundaries to code against. Each is a pure, synchronous, testable function. If a server is added later, these signatures become the client of that server with no UI change.

## 16.2 Internal service contracts

```ts
// ─── Problem library (static, bundled) ────────────────────────────
function getProblems(): Problem[];
function getProblem(id: Id): Problem | undefined;

// ─── Diagram lifecycle ────────────────────────────────────────────
function createEmptyDiagram(title: string): Diagram;
function loadReferenceDiagram(problemId: Id): Diagram;   // readOnly: true
function loadSampleDiagram(): Pick<Diagram,'nodes'|'edges'>;

// ─── Derivations (pure) ───────────────────────────────────────────
function lint(diagram: Diagram): Issue[];
function generateCode(
  diagram: Diagram, language: Language, options: CodeOptions
): string;
function scoreAgainstReference(
  attempt: Diagram, reference: Diagram
): ScoreResult;

// ─── Serialisation ────────────────────────────────────────────────
function serialize(diagram: Diagram): string;            // JSON (reloadable)
function deserialize(json: string): Result<Diagram, ImportError>;

// ─── Rendering / files ────────────────────────────────────────────
function exportPng(diagram: Diagram): Promise<Blob>;
function exportSvg(diagram: Diagram): Promise<Blob>;
function downloadCode(code: string, language: Language, name: string): void;

// ─── Persistence ──────────────────────────────────────────────────
function saveWorkspace(w: Workspace): void;              // debounced
function loadWorkspace(): Result<Workspace, RestoreError>;
```

```ts
interface ScoreResult {
  total: number;                                   // 0–100
  dimensions: Array<{ key: string; label: string; score: number; weight: number }>;
  matched: Array<{ referenceName: string; userName: string }>;
  missing: Array<{ name: string; kind: ClassKind; hint: string }>;
  extra:   Array<{ name: string }>;
  issueCount: number;
}

type ImportError =
  | { kind: 'not-json' }
  | { kind: 'wrong-shape'; detail: string }
  | { kind: 'version-too-new'; found: number; supported: number };
```

## 16.3 Optional server profile

Only if a future requirement demands cross-device sync or shareable links. **Not required to match the screenshots.** **[A]**

| Method | Endpoint | Purpose | Request | Response | Auth |
|---|---|---|---|---|---|
| `GET` | `/api/problems` | Problem catalogue | — | `Problem[]` (without `referenceDiagram`) | none |
| `GET` | `/api/problems/:id/reference` | Verified solution | — | `Diagram` | none |
| `POST` | `/api/diagrams` | Persist a diagram | `Diagram` | `{ id, url }` | optional token |
| `GET` | `/api/diagrams/:id` | Fetch a shared diagram | — | `Diagram` | none if public |
| `POST` | `/api/score` | Server-side scoring | `{ problemId, diagram }` | `ScoreResult` | none |

Standard error envelope:
```json
{ "error": { "code": "NOT_FOUND", "message": "No such problem." } }
```
Status codes: `400` validation, `404` unknown id, `429` rate limit, `500` server. Client behaviour on failure: keep local state, show a toast, never discard the user's work, offer retry. Caching: problems are immutable — `Cache-Control: public, max-age=86400`.

---

# 17. Error and Edge Cases

For each: **trigger → UI state → message → recovery → underlying behaviour.**

## 17.1 Data and persistence

| Case | UI | Message | Recovery | Behaviour |
|---|---|---|---|---|
| Corrupt `localStorage` | Fresh empty workspace | *"Couldn't restore your last session — starting fresh."* toast | Continue working | Discard the bad blob; never crash **[A]** |
| Storage unavailable (private mode) | Normal, plus a persistent subtle banner | *"Your browser is blocking local storage — this diagram won't survive a refresh. Export to JSON to keep it."* | Export JSON | Run in memory **[A]** |
| Quota exceeded on write | Toast | *"Not enough browser storage to autosave. Try clearing old tabs or exporting."* | Close reference tabs / export | Keep in-memory state; retry on the next change **[A]** |
| Schema older than current | Silent | — | — | Migrate by `schemaVersion` **[A]** |
| Schema newer than current | Boot fresh + toast | *"This session was saved by a newer version of ClassForge."* | — | Do not attempt to read **[A]** |

## 17.2 Import / export

| Case | UI | Message | Recovery |
|---|---|---|---|
| Non-JSON file | Toast, nothing imported | *"That file isn't valid JSON."* | Pick another file |
| Valid JSON, wrong shape | Toast | *"That doesn't look like a ClassForge diagram."* | Pick another file |
| Import over a non-empty canvas | ConfirmDialog | *"Replace your current diagram? This can't be undone."* | Cancel |
| Picker cancelled | Nothing | — | — |
| Diagram too large (>2000 nodes) | Toast | *"That diagram is too large to open."* | — |
| PNG export exceeds canvas limits | Silent downscale + toast | *"Exported at reduced scale — the diagram is very large."* | Use SVG |
| Clipboard denied | Inline hint | *"Press ⌘C to copy"* with the text pre-selected | Manual copy |

## 17.3 Modelling

| Case | UI | Behaviour |
|---|---|---|
| Edge dropped on empty canvas | Preview vanishes | No edge; tool stays armed **[A]** |
| Duplicate edge, same type + direction | Nothing visible | Silently keep the existing edge **[A]** |
| Self-loop | Rendered as a loop | Allowed; R11 flags inherit/realize self-loops **[A]** |
| Node deleted while selected | Inspector → empty state | Selection cleared; incident edges removed **[I]** |
| Two nodes named identically | Both render; Issues shows R2 | Not blocked **[A]** |
| Empty class name | Node renders with an empty header; Issues shows R3 | Not blocked **[A]** |
| 100+ nodes | Canvas may slow | Virtualise / memoise nodes; see §22 **[A]** |
| Edit attempted on a reference tab | Affordance absent or disabled | **No error message** — silent prevention **[A]** |

## 17.4 Practice and scoring

| Case | UI | Message |
|---|---|---|
| Score with an empty canvas | Modal not opened | *"Add some classes first, then score your design."* **[A]** |
| Practice started over existing work | ConfirmDialog | *"Start practising <Problem>? Your current design will be cleared."* **[A]** |
| Reference tab already open on Reveal | Existing tab focused | — **[A]** |
| Reference data missing | Button disabled + tooltip | *"No reference solution available for this problem."* **[A]** |
| Session restored after reload | Banner reappears | — **[I]** |

## 17.5 Security

| Risk | Mitigation |
|---|---|
| **XSS via sticky-note HTML** — the note body is `contenteditable` and is persisted and re-rendered; an imported JSON file could carry `<img onerror=…>` | Sanitise on **write, import, and render** to an allowlist of `<b> <i> <br> <div>`. Strip every attribute. Prefer storing a structured representation over raw HTML. **This is the single most important security control in the app.** **[A]** |
| Malicious import | Never `eval`; parse with `JSON.parse` in a try/catch; validate against the schema; clamp numeric fields; cap array lengths **[A]** |
| Generated-code injection | Code is rendered as **text**, never `innerHTML` **[A]** |
| Donation link | `rel="noopener noreferrer"` **[A]** |
| Storage key collision | Namespace as `classforge.v1` **[A]** |

## 17.6 Browser and environment

| Case | Behaviour |
|---|---|
| Refresh mid-edit | Everything restores, including the practice session **[I]** |
| Two tabs of the app open at once | Last write wins. Optionally listen to the `storage` event and warn: *"ClassForge is open in another tab — changes may overwrite each other."* **[A]** |
| Browser Back with the modal open | Modal closes; app is not left **[A]** |
| Direct URL with an unknown query param | Ignored; app boots normally **[A]** |
| Offline | Fully functional — there is no network dependency **[I]** |
| `prefers-reduced-motion` | Disable transitions and the ink smoothing animation **[A]** |

---

# 18. Responsive Behavior

**Evidence is limited: every screenshot is a single ~1512×837 CSS-pixel desktop viewport.** All breakpoint behaviour below is **[A]**, offered as a coherent strategy rather than a reconstruction. **[§27-U6]**

## 18.1 Desktop (≥1440px) — the observed target
The three-column grid exactly as specified: `265px | 1fr | 510px` beneath a 56px header. The canvas gets the remaining ~660–740px. Everything is visible simultaneously; nothing collapses. **[C]**

## 18.2 Laptop (1100–1439px)
- Right panel narrows to `420px`; palette stays `265px`.
- Header buttons drop their text labels below ~1200px and become icon-only with `aria-label` + tooltip, in this priority order (last to collapse first): `Clear` → `Import` → `Sample` → `Export` → `LLD Problems`.
- "Buy me a coffee" collapses to the cup icon.
- Code panel keeps horizontal clipping; add a horizontal scrollbar.

## 18.3 Tablet (768–1099px)
- **The palette collapses to an icon rail (~64px)** — coloured dots and relationship glyphs only, with tooltips. Section labels are hidden.
- **The right panel becomes a slide-over drawer** from the right, ~440px, over the canvas with a scrim. It opens automatically when a node is selected and can be dismissed. A persistent right-edge tab strip (4 icons) reopens it.
- The Practice banner drops its subtitle, keeping the pill, title, and three buttons.
- Problem library modal becomes a **single-column** card list.

## 18.4 Mobile (<768px) — read-oriented, honestly degraded
Direct-manipulation graph authoring on a phone is a poor experience and is a stated non-goal (§3.2 N10). Provide a usable *viewing* experience rather than a broken editing one:
- Header reduces to brand + a `☰` menu holding every action.
- The palette becomes a **bottom sheet** opened by a `+` FAB.
- The right panel becomes a **full-screen sheet** with the four tabs across the top.
- The canvas is full-bleed; pan/pinch-zoom work; node dragging works but relationship drawing is switched to a **two-tap flow** (tap source → tap target) because dragging from a small handle is impractical.
- The Practice banner becomes a compact single-line bar with an overflow menu.
- Show a one-time dismissible notice: *"ClassForge works best on a larger screen."*

## 18.5 Cross-cutting responsive rules
- Never let the page body scroll; only inner regions.
- All touch targets ≥44×44px on coarse pointers.
- Detect the pointer type with `(pointer: coarse)` rather than width alone for the two-tap relationship flow.
- The dot grid keeps its 16px CSS spacing at all sizes.
- Modals go full-screen below 768px.

---

# 19. Design System

Colours are **sampled by eye from the screenshots** — treat the hex values as ±5% accurate starting points, not brand truth. Two values are exact because the UI printed them: the ink red `#f43f5e` (S17 tooltip). **[C for relationships and roles; A for precise hexes — §27-U5]**

## 19.1 Colour tokens

```css
:root {
  /* Surfaces — a dark, near-black, low-chroma stack */
  --canvas:        #0A0A0B;   /* canvas ground                      */
  --bg:            #0E0E10;   /* app background                     */
  --surface-1:     #131316;   /* panels, sidebar, header            */
  --surface-2:     #17171A;   /* palette rows, inputs               */
  --surface-3:     #1C1C20;   /* node body, cards                   */
  --surface-4:     #242429;   /* node header band, active tab       */

  /* Borders */
  --border:        #2A2A2F;
  --border-strong: #35353C;
  --grid-dot:      #26262B;

  /* Text */
  --text:          #E9E9EC;
  --text-muted:    #8A8A93;
  --text-faint:    #5E5E67;

  /* Brand — teal/cyan is the single accent that means "primary/active" */
  --primary:       #22C7C7;
  --primary-hover: #2ADADA;
  --primary-fg:    #04292B;   /* text on a teal fill                */
  --primary-soft:  rgba(34,199,199,0.12);

  /* Semantic */
  --success:       #34D399;   /* "No problems", EASY                */
  --warning:       #F59E0B;   /* Abstract, MEDIUM, issue dots       */
  --danger:        #EF4444;   /* HARD, Delete class                 */
  --accent:        #FBBF24;   /* Buy me a coffee, sticky note       */

  /* Kind colours (palette dots + stereotypes) */
  --kind-class:     #9CA3AF;
  --kind-abstract:  #F59E0B;
  --kind-interface: #7DD3FC;
  --kind-enum:      #2DD4BF;
  --kind-record:    #34D399;

  /* Ink palette — 5 swatches                                       */
  --ink-cyan:   #22D3EE;
  --ink-red:    #F43F5E;      /* EXACT — printed in the S17 tooltip */
  --ink-amber:  #FBBF24;
  --ink-purple: #A78BFA;
  --ink-white:  #F8FAFC;

  /* Sticky note palette — 7 swatches                               */
  --sticky-white:  #F8FAFC;
  --sticky-red:    #FCA5A5;
  --sticky-orange: #FDBA74;
  --sticky-green:  #86EFAC;
  --sticky-teal:   #5EEAD4;
  --sticky-purple: #C4B5FD;
  --sticky-pink:   #F9A8D4;
  --sticky-default:#FDE047;   /* the observed yellow                */
}
```

**Colour semantics — the rules that matter more than the hexes: [C]**
1. **Teal is the only "primary/active/selected" colour.** Primary buttons, armed palette rows, active tabs, tab underlines, selection rings, node handles, enabled option chips, `REF` badges, and code-language selection are all teal. Nothing else competes.
2. **Amber means "abstract" or "warning" or "monetisation".** The Abstract dot, the `«abstract»` stereotype, MEDIUM difficulty, issue severity dots, sticky notes, and "Buy me a coffee".
3. **Green means "valid/easy".** Only the Issues success state, the Record dot, and the EASY badge.
4. **Red means "destructive or hard".** Only `Delete class`, the HARD badge, and the eraser's active state.
5. **The interface is otherwise achromatic.** Colour is information, never decoration.

**Contrast:** verify every text/background pair against WCAG AA (4.5:1 body, 3:1 large). `--text-muted` on `--surface-1` is the pair most at risk — darken the surface or lighten the token until it passes.

## 19.2 Typography

Two families, used with strict discipline: **[C]**

| Role | Family | Usage |
|---|---|---|
| **UI / chrome** | Inter (or system sans) | Buttons, labels, tabs, headings, descriptions, issue messages |
| **Model / code** | JetBrains Mono (or `ui-monospace`) | **All** class names, attributes, methods, generated code, stats lines (`15 classes · 13 relationships`), scratch notes, issue subjects |

The mono/sans split is the app's strongest typographic signal: **monospace means "this is the model", sans means "this is the tool"**. Preserve it exactly. **[C]**

| Token | Size | Weight | Tracking | Used for |
|---|---|---|---|---|
| `display` | 22px | 700 | −0.01em | Modal title |
| `h1` | 20px | 600 | −0.01em | Problem card title |
| `h2` | 17px | 600 | — | Brand wordmark, practice title |
| `body` | 15px | 400 | — | Buttons, descriptions |
| `body-sm` | 14px | 400 | — | Card description, helper text |
| `label` | 11px | 600 | 0.08em, UPPERCASE | Section labels (`ATTRIBUTES`, `ANNOTATE`) |
| `badge` | 10–11px | 700 | 0.06em, UPPERCASE | `REF`, `MEDIUM`, `PRACTICE` |
| `caption` | 12px | 400 | — | `saved automatically`, multiplicities |
| `mono-node` | 13–15px | 400/700 | — | Node content |
| `mono-code` | 14px | 400 | — | Code panel, `line-height: 1.6` |

## 19.3 Spacing, radius, elevation

**Spacing scale (4px base):** `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40`.
Density is **comfortable, not compact** — palette rows are ~46px tall with 14px horizontal padding; Inspector field groups are separated by ~20px; the modal uses 28px padding and a 24px grid gap. **[C]**

**Radius:** `sm 6` (chips, badges) · `md 10` (buttons, inputs, palette rows, nodes, issue rows) · `lg 14` (cards, practice banner) · `xl 16` (modal) · `full` (pills, dots).
**Radius 10 is the app's signature value** — it appears on nearly every rectangle. **[C]**

**Elevation:** the UI is nearly flat; depth comes from surface lightness, not shadow. Only three things cast a shadow: the modal (large, soft), dropdown menus (medium), and floating canvas toolbars (small). Nodes use a border, not a shadow. **[C]**

**Borders:** 1px everywhere; 2px reserved exclusively for the active-tab underline and the selection ring.

## 19.4 Component styling

| Component | Rest | Hover | Active/Selected | Disabled |
|---|---|---|---|---|
| Primary button | teal fill, dark text | lighten 6% | translate-y 1px | 40% opacity |
| Secondary button | `--surface-2` + border | fill → `--surface-3` | translate-y 1px | 40% opacity, `not-allowed` |
| Accent button | amber fill, dark text | lighten 6% | — | — |
| Outline button | transparent + teal border, teal text | `--primary-soft` fill | — | 40% |
| Danger button | transparent + red border, red text | red 10% fill | — | 40% |
| Palette row | `--surface-2` + border | fill lightens | **teal border + teal text + faint glow** | 40% |
| Panel tab | muted text | text → `--text` | teal text + 2px teal underline | — |
| Pill (language) | transparent + border, muted | border lightens | **teal fill, dark text** | — |
| Chip (codegen option) | transparent + border, muted | border lightens | **teal fill, dark text** | — |
| Input | `--surface-2` + border | border → `--border-strong` | **teal border + faint teal ring** | 40% |
| Node | `--surface-3` + border | border lightens | **2px teal border + teal glow** | — |
| Issue row | `--surface-2` | fill lightens | — | — |
| Sticky note | coloured fill, dark text | — | corner resize handles appear | — |

## 19.5 Motion
Fast and unobtrusive. `120ms ease-out` for hover/colour; `180ms ease-out` for panel and dropdown entry; `220ms cubic-bezier(0.2,0,0,1)` for the modal (scale 0.98→1 with the scrim fading). Node drag and canvas pan are **not animated** — they track the pointer 1:1. Ink strokes render in real time. All of it respects `prefers-reduced-motion`. **[A]**

## 19.6 Iconography
Consistent 1.5px-stroke line icons (Lucide is an exact stylistic match for what the screenshots show). 18px in buttons, 16px in menus, 20px in the ink toolbar. Icons always pair with a label except in the canvas toolbars and the icon-only responsive collapse. **[C for the style; A for the library]**

## 19.7 Focus and accessibility
- Visible focus ring on every interactive element: 2px `--primary` at 2px offset. Never remove outlines without a replacement.
- Full keyboard operability of the header, palette, tabs, modal, and Inspector. The canvas is the one area where keyboard parity is hard; provide at minimum: `Tab` cycles nodes, `Enter` opens the Inspector for the focused node, arrow keys nudge it, `Delete` removes it. **[A]**
- `aria-live="polite"` on the Issues count so screen-reader users learn that the model became invalid.
- Icon-only buttons carry `aria-label`.
- The modal is a proper `role="dialog" aria-modal="true"` with a focus trap.
- Colour is never the only signal: difficulty badges carry text; issue severity pairs its dot with wording; the read-only tab uses a lock **and** a `REF` word **and** a title suffix.

---

# 20. User Stories

Each story includes acceptance criteria in Given/When/Then form.

### Epic A — Learn from verified solutions

**A1.** *As an interview candidate, I want to browse a library of classic LLD problems, so that I can pick one appropriate to my level.*
- **G** the app is open · **W** I click "LLD Problems" · **T** a modal lists problem cards, each showing title, difficulty badge, pattern tags, description, requirement bullets, and a `N classes · M relationships` stat line.
- **G** the modal is open · **W** I press `Escape` · **T** it closes and the canvas is unchanged.

**A2.** *As a candidate, I want to load a problem's verified solution, so that I can study how an expert modelled it.*
- **G** the modal is open · **W** I click "Load solution →" on Parking Lot · **T** the modal closes, a new tab titled "Parking Lot — Reference" opens with a lock icon and a `REF` badge, becomes active, and the diagram is fitted to the viewport.
- **G** that tab is active · **W** I try to drag a palette item · **T** nothing happens and the palette appears disabled.
- **G** that tab is active · **W** I open Issues · **T** it reads "No problems" — *every bundled reference must lint clean.*
- **G** the Parking Lot reference is already open · **W** I load it again · **T** the existing tab is focused; no duplicate is created.

**A3.** *As a candidate, I want to read the generated code for a reference solution, so that I can connect the diagram to real classes.*
- **G** a reference tab is active · **W** I open Code and pick Java · **T** the panel emits enums first, then abstract classes, then concrete classes, with constructors and accessors.

### Epic B — Model a design

**B1.** *As a user, I want to drag class kinds onto the canvas, so that I can build a model quickly.*
- **G** an editable document · **W** I drag "Class" onto the canvas · **T** a node named `NewClass0` appears at the drop point, seeded with `- id: long` and `+ doWork(): void`, is selected, and the Inspector opens.
- **G** `NewClass0` exists · **W** I drag another · **T** it is named `NewClass1`.

**B2.** *As a user, I want to edit a class's members in a structured form, so that I don't have to type UML syntax.*
- **G** a node is selected · **W** I type in NAME · **T** the canvas title updates on every keystroke with no save action.
- **G** a node is selected · **W** I click "+ attribute" · **T** a new row group appears and a new line appears in the node's attribute compartment.
- **G** a node is selected · **W** I set KIND to Abstract · **T** the node renders `«abstract»` above an italic title.

**B3.** *As a user, I want to connect classes with typed UML relationships.*
- **G** two nodes exist · **W** I click "Realize" then drag from one handle to the other · **T** a **dashed** edge with a **hollow triangle** arrowhead is created.
- **G** I just created an edge · **W** I look at the palette · **T** "Realize" is still armed, so I can draw another immediately.

**B4.** *As a user, I want empty classes to be visually obvious.*
- **G** a node with no members · **W** I look at it · **T** it shows italic muted `no attributes` and `no operations` rather than collapsing.

### Epic C — Get feedback

**C1.** *As a user, I want my modelling mistakes caught immediately, so that I don't practise bad habits.*
- **G** Issues reads `0` · **W** I draw a Realize edge to a non-interface · **T** the badge becomes `1` within one frame, with **no** explicit validate action.
- **G** that issue exists · **W** I open Issues · **T** I see exactly: `NewClsdsd — "NewClass0" realizes "NewClsdsd" which is not an interface.`
- **G** I fix the target's kind to Interface · **W** the model updates · **T** the badge returns to `0` and the panel shows the green-check "No problems" state.

**C2.** *As a user, I want to see my design as real code, so that I can sanity-check it.*
- **G** a diagram exists · **W** I switch from Java to Python · **T** the output regenerates as Python with `ABC`, `__init__`, and `__repr__`.
- **G** Java is selected · **W** I enable "equals/hashCode" · **T** `import java.util.Objects;` appears at the top.
- **G** any language · **W** I click Copy · **T** the exact displayed source is on the clipboard and the button confirms.

### Epic D — Practise and be scored

**D1.** *As a candidate, I want to attempt a problem from its brief alone.*
- **G** the modal is open · **W** I click "Practice" on Parking Lot · **T** the modal closes, `My Design` becomes active and empty, the Practice banner appears, and "Score my solution" appears in the header.
- **G** `My Design` was non-empty · **W** I click "Practice" · **T** I am asked to confirm before anything is cleared.

**D2.** *As a candidate, I want to peek at the reference without losing my attempt.*
- **G** a session is active · **W** I click "Reveal reference" · **T** the reference tab opens/focuses, the banner and "Score my solution" remain, and returning to `My Design` shows my work intact.

**D3.** *As a candidate, I want to be scored against the reference.*
- **G** a session is active and I have modelled some classes · **W** I click "Score my solution" · **T** a result modal shows an overall score, a per-dimension breakdown, and matched / missing / extra lists, with extras framed neutrally.
- **G** the canvas is empty · **W** I click "Score my solution" · **T** I am prompted to add classes rather than shown a score of 0.

**D4.** *As a candidate, I want to leave practice without losing my diagram.*
- **G** a session is active with work on the canvas · **W** I click "Exit" · **T** the banner and score button disappear and **my diagram remains**.

### Epic E — Think on the canvas

**E1.** *As a user, I want to sketch over my diagram.*
- **G** an editable document · **W** I click the pen · **T** the toolbar expands with 5 colours and 3 widths.
- **G** I have drawn a stroke · **W** I disarm the pen and click where the stroke is · **T** the node underneath is selected — ink does not block interaction.
- **G** ≥1 stroke exists · **W** I look at the toolbar · **T** a trash icon is present.

**E2.** *As a user, I want sticky notes for reminders.*
- **G** an editable document · **W** I drag "Sticky note" onto the canvas · **T** a yellow note appears with 7 colour dots, B/I buttons, an ×, and the placeholder "Write a note… (⌘/Ctrl+B bold · ⌘/Ctrl+I italic)".
- **G** a note exists · **W** I click "Clear" and confirm · **T** the nodes and edges are removed **but the sticky note remains**.

**E3.** *As a user, I want a scratchpad for my reasoning.*
- **G** the Notes tab · **W** I type and reload the page · **T** the text is still there, with no save action taken.

### Epic F — Get work out

**F1.** *As a user, I want to export my diagram.*
- **G** a diagram exists · **W** I click "Export" · **T** exactly three options appear: PNG image, SVG vector, JSON (reloadable).
- **G** I export JSON and later import it · **T** the diagram is restored identically, including notes, stickies, and ink.

**F2.** *As a user, I want my work to survive a refresh.*
- **G** any edit · **W** I reload · **T** the diagram, open tabs, active tab, viewport, notes, stickies, ink, codegen language, and options are all restored.

---

# 21. Acceptance Criteria (consolidated release gate)

A build ships only if **every** item below passes.

## 21.1 Must-pass — observed behaviour (regression against the screenshots)

| # | Criterion | Source |
|---|---|---|
| 1 | Header contains, in order: brand, LLD Problems, Sample, Export▾, Import, Clear; right side has Buy me a coffee. | S2 |
| 2 | "Score my solution" is **absent** in normal mode and **present** in practice mode. | S2 vs S7 |
| 3 | Palette shows 5 kinds, 6 relationships, 1 sticky, with the three exact section labels and the exact helper sentence. | S2 |
| 4 | Exactly one palette row is armed at a time; the armed row shows a teal border and teal text. | S2, S9, S12, S22 |
| 5 | The armed relationship stays armed after creating an edge. | S13–S15 |
| 6 | `My Design` has no close button; reference tabs show a lock, a `REF` badge, and an ×. | S2 |
| 7 | A new node is `NewClass<N>` (zero-based) seeded with `- id: long` and `+ doWork(): void`. | S8 |
| 8 | Typing in Inspector NAME updates the canvas node title per keystroke. | S10 |
| 9 | Abstract nodes render `«abstract»` in amber italic above an italic title. | S12 |
| 10 | Empty compartments render `no attributes` / `no operations` in italic muted text. | S2 |
| 11 | Enum nodes list bare literals with no visibility sign and no type. | S2 |
| 12 | Realize renders as a **dashed** line with a **hollow triangle** at the target. | S13 |
| 13 | Drawing a Realize edge to a non-interface moves the Issues badge 0→1 with no explicit validation step. | S12→S13 |
| 14 | The issue message is exactly `"NewClass0" realizes "NewClsdsd" which is not an interface.` with the **target** as the subject. | S14 |
| 15 | A valid diagram shows a teal check, "No problems", and "Your diagram is valid and ready to generate." | S5 |
| 16 | Code tab offers exactly Java, Python, TypeScript, JavaScript, C++, C#. | S4 |
| 17 | Code options default to Constructor + Getters/Setters + Doc comments ON; toString + equals/hashCode OFF. | S4 |
| 18 | Option chips are independently toggleable and cumulative. | S4→S19→S20 |
| 19 | Enabling equals/hashCode in Java adds `import java.util.Objects;`. | S20 |
| 20 | A Realize edge produces `implements` in Java. | S15 |
| 21 | Python emits `from abc import ABC, abstractmethod`, `__init__`, `__repr__`, and maps `long→int`, `String→str`, `void→None`. | S21 |
| 22 | Python ignores Getters/Setters even when the chip is on. | S21 |
| 23 | Notes shows `SCRATCH NOTES` + `saved automatically` and the exact two-paragraph placeholder. | S6 |
| 24 | Ink toolbar is collapsed to 2 icons by default and expands to 5 colours + 3 widths when the pen is armed. | S2 vs S17 |
| 25 | Hovering an ink colour shows its hex (e.g. `#f43f5e`). | S17 |
| 26 | The trash icon appears in the ink toolbar only once ≥1 stroke exists. | S17 vs S23 |
| 27 | The eraser's active state is red-tinted, distinct from the pen's teal. | S18 |
| 28 | A sticky note shows 7 colour dots, B, I, ×, and the exact placeholder. | S22 |
| 29 | Sticky notes render above nodes and show corner resize handles when selected. | S24 |
| 30 | Export offers exactly PNG image / SVG vector / JSON (reloadable). | S25 |
| 31 | Import opens the native OS file picker. | S26 |
| 32 | **Clear removes nodes and edges but preserves sticky notes**, and Issues recomputes to 0. | S24→S27 |
| 33 | The Problem Library modal shows the exact title and subtitle and a 2-column card grid. | S1 |
| 34 | Difficulty badges are EASY green, MEDIUM amber, HARD red. | S1 |
| 35 | The Practice banner shows a PRACTICE pill, title, truncated subtitle, and Brief / Reveal reference / Exit. | S7 |
| 36 | All model text is monospace; all chrome text is sans. | all |

## 21.2 Must-pass — inferred behaviour
37. Everything survives a page reload with no save action.
38. Deleting a node deletes its edges.
39. Read-only documents block every mutation with no error message.
40. Ink does not intercept pointer events when no ink tool is armed.
41. All three canvas layers pan and zoom together with no drift.
42. Clear, Sample-over-existing, Import-over-existing, and Practice-over-existing all confirm first.
43. Corrupt storage boots a fresh workspace with a toast, never a crash.
44. Sticky-note HTML is sanitised on write, import, and render.

## 21.3 Quality gates
45. No console errors or warnings in normal operation.
46. Interaction stays ≥50fps with 50 nodes and 60 edges.
47. Every interactive element has a visible focus ring.
48. Text contrast meets WCAG AA.
49. Keyboard-only users can reach every header, palette, tab, modal, and Inspector control.
50. The layout is usable at 1280×720 with no page-level scrollbar.

---

# 22. Implementation Architecture

## 22.1 Library research and recommendation

You asked specifically whether newer libraries such as React Flow could carry this build. **Yes — and it is the correct choice.** The application's entire canvas is a node-and-edge editor with custom nodes, typed edges, connection handles, pan/zoom, a minimap-less viewport, and a whiteboard overlay. That is precisely React Flow's problem domain, and building it from raw SVG would waste weeks.

**Recommended: [@xyflow/react](https://reactflow.dev) (React Flow 12, current release 12.11.2, July 2026).** MIT-licensed. The v12 rewrite renamed the package from `reactflow` to `@xyflow/react` and added SSR, computing flows, dark mode, and TSDoc typings. What it gives this project directly:

| ClassForge requirement | React Flow feature |
|---|---|
| Class boxes with custom compartments | `nodeTypes` — arbitrary React components as nodes |
| Teal connection dots on node edges | `<Handle position={Position.Left/Right} />` |
| Six UML relationship types | `edgeTypes` with custom SVG markers (hollow triangle, filled/hollow diamond, open arrow) and `strokeDasharray` for dashed |
| Edge labels and multiplicities | `EdgeLabelRenderer` — HTML labels positioned along an edge |
| Drag from palette onto canvas | The documented drag-and-drop pattern (`onDrop` + `screenToFlowPosition`) |
| Pan / zoom / fit view | Built in; `fitView()`, `zoomIn()`, `zoomOut()` from `useReactFlow` |
| The `+ − ⛶ 🔒` control stack | `<Controls />` — **which ships exactly those four buttons, including the lock**, strongly suggesting the original used it and resolving §27-U8 in favour of "lock = interactivity toggle" |
| The dotted grid | `<Background variant={BackgroundVariant.Dots} />` |
| Sticky notes above nodes | Another `nodeType` with a higher `zIndex`, or a custom layer |
| Freehand ink | React Flow publishes a [Freehand Draw example](https://reactflow.dev/examples/whiteboard/freehand-draw) built on **`perfect-freehand`**, plus a documented [Whiteboard Features](https://reactflow.dev/learn/advanced-use/whiteboard) guide covering eraser, lasso, and shapes |
| Selection ring, multi-select | Built in |

**Alternatives considered and rejected for this project:**
- **JointJS** — stronger "diagram intelligence" (ports, routing, geometry) and a more structured model layer, but heavier, its React story is a wrapper rather than native, and the commercial tier gates features. Worth it for enterprise diagramming; overkill here.
- **GoJS** — very capable but commercially licensed; wrong fit for a free tool with a "Buy me a coffee" button.
- **Cytoscape.js** — built for graph *analysis* and auto-layout, not for editable custom-HTML nodes with forms behind them.
- **react-diagrams / jsPlumb Toolkit** — smaller communities, less momentum than xyflow in 2026.
- **Hand-rolled SVG** — full control, but you would be reimplementing viewport math, hit-testing, and connection logic for no benefit.

**Supporting libraries:**

| Need | Recommendation | Why |
|---|---|---|
| Canvas graph | **`@xyflow/react` ^12** | As above |
| Freehand ink | **`perfect-freehand`** | The exact library React Flow's own whiteboard example uses; produces the smooth pressure-tapered strokes seen in S23 |
| State | **`zustand`** | React Flow itself uses zustand internally; tiny, no boilerplate, and its transient-update pattern suits high-frequency canvas state. Redux Toolkit is unnecessary here. |
| Undo/redo | **`zundo`** (zustand temporal middleware) | Drops history onto the existing store with almost no code |
| Persistence | `zustand/middleware` `persist` + a debounced custom storage | Handles versioning and migration natively (`version`, `migrate`) |
| Styling | **Tailwind CSS v4** with the tokens of §19.1 as CSS variables | The design is token-driven and utility-friendly |
| Headless UI primitives | **Radix UI** (`Dialog`, `DropdownMenu`, `Tabs`, `Select`, `Tooltip`, `Toggle`) | Gives the modal focus trap, the Export menu, the panel tabs, the Kind select, and the ink hex tooltip with correct a11y for free |
| Icons | **`lucide-react`** | Stylistically identical to the observed 1.5px line icons |
| Rich text (sticky notes) | `contenteditable` + **`dompurify`**, or **Tiptap** if it grows | Bold/italic only — Tiptap is likely overkill, but DOMPurify is **mandatory** either way |
| PNG/SVG export | **`html-to-image`** (`toPng`, `toSvg`) | The approach React Flow's own download-image example uses |
| Code display | Plain `<pre>` first; **`shiki`** only if syntax highlighting is wanted | The screenshots show largely unhighlighted mono text, so start plain |
| Ids | `nanoid` | — |
| Tests | **Vitest** + **React Testing Library** + **Playwright** | Unit for lint/codegen, component for panels, E2E for flows |
| Build | **Vite** + React 19 + TypeScript (strict) | — |

**Auto-layout (optional but valuable):** reference diagrams ship with authored coordinates, so layout is not required. If you later add an "Arrange" button, use **`elkjs`** (most configurable, `layered` algorithm suits class diagrams) or **`dagre`** (simpler, faster). React Flow documents both.

## 22.2 Architecture

**Layered, with the model at the centre and everything else derived:**

```
┌──────────── Presentation (React components) ────────────┐
│  AppHeader · PaletteSidebar · CanvasStage · RightPanel   │
└───────────────────────┬──────────────────────────────────┘
                        │ reads state, dispatches actions
┌───────────────────────▼──────────────────────────────────┐
│  Store (zustand + zundo + persist)                        │
│   workspaceSlice · documentSlice · uiSlice · practiceSlice│
└───────────────────────┬──────────────────────────────────┘
                        │ calls pure domain functions
┌───────────────────────▼──────────────────────────────────┐
│  Domain (pure, framework-free, 100% unit-testable)        │
│   lint/ · codegen/ · scoring/ · serialization/ · problems/ │
└──────────────────────────────────────────────────────────┘
```

**Non-negotiable architectural rules:**
1. **The domain layer imports nothing from React or the store.** `lint()`, `generateCode()`, and `scoreAgainstReference()` are pure functions over plain data. This is what makes the app testable and what lets scoring reuse the linter.
2. **Issues and code are never stored** — derive them with `useMemo` (or a zustand selector) keyed on the diagram. Storing derived state is how these apps rot.
3. **Debounce persistence, not state.** Model updates are synchronous and immediate (BR29 demands per-keystroke canvas updates); only the `localStorage` write is debounced.
4. **Codegen is one interface, six implementations.** `interface CodeGenerator { generate(d, opts): string }` with `JavaGenerator`, `PythonGenerator`, etc. Adding a language must not touch the UI.
5. **Lint rules are a registry**, each `(diagram) => Issue[]`, composed by `lint()`. Adding a rule is adding a file.
6. **Read-only is enforced in the store**, not in components. Every mutating action early-returns if the target document is read-only. UI disabling is a courtesy on top; the store is the guarantee.

## 22.3 Performance
- Memoise node components with `React.memo`; React Flow re-renders nodes aggressively otherwise.
- Keep node data minimal — don't pass the whole store into a node.
- Debounce lint and codegen by ~150ms so they don't run mid-keystroke, while the canvas itself updates instantly.
- Render ink to a single SVG (or a canvas element) rather than one element per stroke once stroke count is high.
- Virtualise nothing initially; revisit past ~200 nodes.

---

# 23. Recommended Project Structure

```text
classforge/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx                       # layout shell only
    │
    ├── domain/                       # PURE — no React, no store imports
    │   ├── types.ts                  # §13 model, verbatim
    │   ├── lint/
    │   │   ├── index.ts              # lint(diagram) → Issue[]
    │   │   ├── registry.ts
    │   │   └── rules/
    │   │       ├── realizeTargetNotInterface.ts   # R1 — the confirmed rule
    │   │       ├── duplicateClassName.ts          # R2
    │   │       ├── emptyClassName.ts              # R3
    │   │       ├── inheritanceCycle.ts            # R4
    │   │       ├── multipleInheritance.ts         # R5
    │   │       ├── interfaceNonPublicMember.ts    # R6
    │   │       ├── interfaceHasAttribute.ts       # R7
    │   │       ├── unimplementedAbstract.ts       # R8
    │   │       ├── enumWithoutLiterals.ts         # R9
    │   │       ├── emptyClass.ts                  # R10
    │   │       ├── selfInheritance.ts             # R11
    │   │       ├── abstractMethodInConcrete.ts    # R12
    │   │       ├── invalidIdentifier.ts           # R13
    │   │       └── inheritFromInterface.ts        # R14
    │   ├── codegen/
    │   │   ├── index.ts              # generateCode(d, lang, opts)
    │   │   ├── types.ts              # CodeGenerator interface
    │   │   ├── typeMap.ts            # §9.10 cross-language type table
    │   │   ├── ordering.ts           # enums → interfaces → abstract → class
    │   │   └── languages/
    │   │       ├── java.ts  python.ts  typescript.ts
    │   │       ├── javascript.ts  cpp.ts  csharp.ts
    │   ├── scoring/
    │   │   ├── index.ts              # scoreAgainstReference()
    │   │   ├── nameMatch.ts          # normalise + levenshtein
    │   │   └── dimensions.ts
    │   ├── serialization/
    │   │   ├── serialize.ts  deserialize.ts  migrations.ts
    │   └── problems/
    │       ├── index.ts              # getProblems / getProblem
    │       └── data/
    │           ├── parkingLot.ts     # brief + full reference diagram
    │           ├── splitwise.ts  elevatorSystem.ts
    │           ├── vendingMachine.ts  libraryManagement.ts  ticTacToe.ts
    │
    ├── store/
    │   ├── index.ts                  # composed zustand store
    │   ├── documentSlice.ts          # nodes, edges, notes, ink  (read-only guard here)
    │   ├── workspaceSlice.ts         # tabs, active document
    │   ├── uiSlice.ts                # armed tool, panel tab, ink tool, codegen prefs
    │   ├── practiceSlice.ts
    │   ├── persist.ts                # debounced localStorage + versioning
    │   └── selectors.ts              # derived: useIssues(), useGeneratedCode()
    │
    ├── components/
    │   ├── layout/        AppShell · AppHeader · PaletteSidebar · DocumentTabBar
    │   ├── canvas/        CanvasStage · ClassNode · RelationshipEdge · edgeMarkers
    │   │                  StickyNoteNode · InkLayer · InkToolbar · ZoomControls
    │   │                  PracticeBanner · CanvasEmptyState
    │   ├── panel/         RightPanel · Inspector (NodeInspector · EdgeInspector
    │   │                  MemberRow · VisibilityButton · MiniToggle)
    │   │                  IssuesPanel · IssueRow · CodePanel · CodeViewer · NotesPanel
    │   ├── library/       ProblemLibraryModal · ProblemCard · BriefDialog
    │   ├── practice/      ScoreResultModal · ScoreDimensionBar
    │   └── ui/            Button · IconButton · Pill · Chip · Badge · Tabs
    │                      Modal · ConfirmDialog · Dropdown · Toast · EmptyState
    │                      FormField · Tooltip
    │
    ├── hooks/             useDragToCanvas · useInkDrawing · useKeyboardShortcuts
    │                      useAutosave · useExport · useImport · useClipboard
    ├── lib/               ids.ts · download.ts · sanitize.ts · cn.ts · debounce.ts
    ├── styles/            globals.css   # §19.1 tokens as CSS variables
    └── __tests__/         unit/ · component/ · e2e/
```

---

# 24. Implementation Order

Ten phases. Each ends in something demonstrable; each depends only on what precedes it.

**Phase 1 — Foundation (½ day).** Vite + React 19 + TS strict + Tailwind v4. Drop in the §19.1 tokens. Build the three-column shell with a static header, palette, empty canvas, and right panel. *Done when:* the app looks like the screenshots with nothing functional. *Unblocks everything.*

**Phase 2 — Domain model and store (1 day).** Type §13 verbatim. Build the zustand store with document/workspace/ui/practice slices, the read-only guard, and undo via zundo. No UI yet. *Done when:* unit tests can create nodes, connect edges, and delete a node with its edges.

**Phase 3 — Canvas and nodes (2 days).** React Flow, `<Background variant="dots">`, `<Controls>`, the `ClassNode` custom node with compartments, stereotypes, italics, and empty placeholders, and drag-from-palette. *Done when:* AC 7, 9, 10, 11 pass. *The single highest-risk phase — do it early.*

**Phase 4 — Relationships (1 day).** Six edge types with correct SVG markers and dashing, handles, arming logic with mutual exclusion and persistence-after-use, labels and multiplicities. *Done when:* AC 4, 5, 12 pass.

**Phase 5 — Inspector (1½ days).** The full form of §9.7 with live per-keystroke binding, member rows, visibility cycling, S/F/A toggles, delete. *Done when:* AC 8 passes and a whole class can be modelled without touching code.

**Phase 6 — Derived views: Issues + Code (2 days).** The lint registry starting with **R1** (the one confirmed rule) then the rest; the codegen interface with Java and Python first (both are pinned by screenshots), then the other four. Wire the badge. *Done when:* AC 13–22 pass. *Depends on Phase 2's model, not on the UI — can be built in parallel with Phases 3–5 by a second developer.*

**Phase 7 — Persistence, Notes, tabs (1 day).** Debounced persist with versioning and migration, restore on boot, corrupt-storage recovery, the Notes tab, multi-tab documents with per-document viewport and read-only reference tabs. *Done when:* AC 23, 37, 43 pass.

**Phase 8 — Problem library and practice (2 days).** The modal and cards, the six bundled problems with authored reference diagrams (**author these carefully — they are the product's content and must lint clean**), Load solution, Practice mode, the banner, and the scoring engine + result modal. *Done when:* AC 33–35 pass and every reference lints clean.

**Phase 9 — Annotation and I/O (1½ days).** Ink layer with `perfect-freehand`, the collapsing toolbar, eraser, sticky notes with sanitisation, Export PNG/SVG/JSON, Import with validation, Clear with its sticky-preserving semantics. *Done when:* AC 24–32 pass.

**Phase 10 — Polish (2 days).** Responsive breakpoints, keyboard shortcuts, focus rings, ARIA, `aria-live` on the issue count, reduced-motion, toasts, confirm dialogs, empty states, and the performance pass. *Done when:* AC 45–50 pass.

**Total: ~15 working days for one developer**, ~9 with two working the Phase 3–5 / Phase 6 split.

**Critical path:** Phase 1 → 2 → 3 → 4 → 5. Phases 6 and 8's content authoring can run in parallel. Phase 9 is nearly independent and can slip without blocking anything else.

---

# 25. Testing Strategy

## 25.1 Test pyramid for this application

Because the domain layer is pure, the pyramid is unusually bottom-heavy — and that is the point. **Lint and codegen should be ~60% of the test count and are the cheapest, highest-value tests in the project.**

```
        ╱ E2E (Playwright) — 12 flows
      ╱   Component (RTL) — panels, inspector, modal
    ╱     Unit (Vitest) — lint rules, codegen, scoring, serialization
```

## 25.2 Unit tests (Vitest) — the backbone

**Lint (`domain/lint`)** — one describe block per rule, each with a positive case, a negative case, and the exact message string:
```ts
it('flags a Realize edge pointing at a non-interface', () => {
  const d = diagram()
    .node('NewClass0', 'CLASS')
    .node('NewClsdsd', 'ABSTRACT')
    .edge('NewClass0', 'NewClsdsd', 'REALIZE')
    .build();
  expect(lint(d)).toEqual([{
    ruleId: 'realize-target-not-interface',
    severity: 'warning',
    subjectName: 'NewClsdsd',
    message: '"NewClass0" realizes "NewClsdsd" which is not an interface.',
    subjectNodeId: expect.any(String),
    id: expect.any(String),
  }]);
});

it('does not flag a Realize edge pointing at an interface', () => { /* … */ });
```
Also: every bundled reference solution must lint clean —
```ts
it.each(getProblems())('reference for $title lints clean', (p) => {
  expect(lint(p.referenceDiagram as Diagram)).toEqual([]);
});
```
**This single test protects the product's core promise** and would have caught a bad reference before a user ever saw it.

**Codegen (`domain/codegen`)** — snapshot tests per language × option combination, seeded from the screenshots:
- Java with default options over the Parking Lot enums + `Vehicle` → must match the S4 output.
- Java with a Realize edge → contains `implements NewClsdsd`.
- Java with `equals/hashCode` on → first line is `import java.util.Objects;`.
- Java with `toString` on → contains `@Override` immediately before `public String toString()`.
- Python → contains `from abc import ABC, abstractmethod`, `self._id: int = 0`, `def __repr__`, and **no** getter methods even with the chip on.
- Ordering: enums appear before abstract classes, which appear before concrete classes.
- Empty diagram → returns the empty-state sentinel, not a crash.

**Scoring** — identical graphs → 100; empty attempt → refused; renamed-but-equivalent class (`ParkingSpace` vs `ParkingSpot`) → still matched; extra class → appears in `extra`, not in `missing`, and does not reduce the class-identification score.

**Serialization** — `deserialize(serialize(d))` deep-equals `d` for a diagram containing nodes, edges, stickies, ink, notes, and a viewport. Malformed inputs return the correct `ImportError` variant. Migrations move v1 fixtures forward.

**Store** — deleting a node removes its edges; mutations against a read-only document are no-ops; the `NewClass<N>` counter picks the lowest free integer; Clear preserves stickies and scratch notes.

## 25.3 Component tests (React Testing Library)

| Component | Cases |
|---|---|
| `Inspector` | Empty state copy; populates from a node; typing NAME fires the update per keystroke; `+ attribute` appends and focuses; `Delete class` calls the store; every input is `readonly` and `Delete class` is absent when read-only |
| `IssuesPanel` | Green-check empty state with exact copy; renders N rows; row shows subject in mono and the message verbatim |
| `CodePanel` | Six pills; selecting one is exclusive; chips toggle independently; default chip state is Constructor+Getters+Doc ON |
| `PaletteSidebar` | Arming is mutually exclusive across both groups; disabled when read-only |
| `ProblemLibraryModal` | Renders a card per problem with badge, tags, stats; Escape closes; focus is trapped and restored |
| `DocumentTabBar` | `My Design` renders no ×; reference tab renders lock + REF + × |
| `PracticeBanner` | Renders only with an active session; all three buttons dispatch |
| `StickyNote` | Placeholder copy; 7 colour dots; × deletes; content is sanitised (`<img onerror>` is stripped) |

## 25.4 E2E tests (Playwright) — the twelve flows that matter

| # | Flow | Assertion |
|---|---|---|
| E1 | Cold boot | Shell renders, no console errors, Inspector empty state visible |
| E2 | Open library → Load solution | REF tab appears, is active, is read-only, Issues reads 0 |
| E3 | Create two nodes → connect with Realize | Issues badge 0→1, exact message present |
| E4 | Fix kind to Interface | Badge returns to 0, "No problems" shown |
| E5 | Edit a class fully | Name, kind, 2 attributes, 1 method all reflected on canvas |
| E6 | Codegen matrix | Switch all 6 languages, toggle all 5 chips, no crash; Java+equals contains the Objects import |
| E7 | Practice round trip | Practice → banner + Score button appear → model 2 classes → Score → result modal → Exit → diagram retained |
| E8 | Reveal reference mid-practice | REF tab focuses, banner still present, returning shows work intact |
| E9 | Persistence | Edit → reload → everything restored (tabs, viewport, notes, stickies, ink, codegen prefs) |
| E10 | Export/Import round trip | Export JSON → Clear → Import → diagram identical |
| E11 | Clear semantics | Node + edge + sticky → Clear → **sticky remains**, nodes gone, Issues 0 |
| E12 | Read-only enforcement | On a REF tab: palette disabled, no handles, Inspector read-only, no Delete class |

## 25.5 Test matrix — high-value flows × states

| Flow | Happy | Empty | Invalid input | Read-only | After reload | Failure |
|---|---|---|---|---|---|---|
| Create node | E5 | — | — | E12 | E9 | — |
| Create edge | E3 | no nodes | dropped on empty canvas | E12 | E9 | duplicate edge |
| Lint | E3 | E1 | E3 | E2 | — | — |
| Codegen | E6 | empty diagram | keyword name | E2 | — | clipboard denied |
| Practice | E7 | score empty canvas | — | n/a | E9 | reference missing |
| Import | E10 | — | non-JSON, wrong shape | E12 | — | version too new |
| Export | E10 | empty diagram | — | allowed | — | oversized PNG |
| Persistence | E9 | E1 | corrupt blob | — | E9 | quota exceeded |

## 25.6 Non-functional testing
- **Performance:** a 50-node/60-edge fixture must keep pan/zoom ≥50fps and keep lint+codegen recompute under 100ms.
- **Accessibility:** `axe-core` on the workspace and on the open modal, zero critical violations; a keyboard-only pass through the header, palette, tabs, and Inspector.
- **Responsive:** visual checks at 1440, 1280, 1024, 768, 390 px.
- **Cross-browser:** Chrome, Safari, Firefox (Safari especially for `contenteditable` and clipboard behaviour).
- **Security:** an import fixture carrying `<img src=x onerror=alert(1)>` in a sticky note must render inert.

## 25.7 Regression watchlist
The behaviours most likely to break silently in future work: the Clear-preserves-stickies rule; ink `pointer-events` when disarmed; the armed-tool-persists-after-use rule; per-document viewport restoration; the codegen ordering rule; Python ignoring Getters/Setters; and the exact R1 message string. Pin each with a named test.

---

# 26. Analytics / Events

**No analytics is evidenced in any screenshot.** Everything here is **[A]** — a proposal, not a reconstruction. If the product stays local-first, the honest choice is **privacy-preserving, aggregate-only, opt-in** telemetry, or none at all.

If instrumented, these events answer real product questions:

| Event | Properties | Question it answers |
|---|---|---|
| `app_opened` | `returning: boolean`, `restored_nodes: number` | Retention; do people come back to their work? |
| `problem_library_opened` | — | Is the library discoverable? |
| `problem_solution_loaded` | `problem_id`, `difficulty` | Which problems do people study? |
| `practice_started` | `problem_id`, `difficulty` | **The key funnel top.** |
| `practice_scored` | `problem_id`, `score`, `duration_sec`, `node_count` | **The key funnel bottom — start→score conversion is the product's core metric.** |
| `practice_exited` | `problem_id`, `scored: boolean`, `duration_sec` | Abandonment rate; are problems too hard? |
| `reference_revealed` | `problem_id`, `during_practice: boolean` | Do people peek? Is the brief sufficient? |
| `node_created` | `kind` | Which kinds matter; is Record ever used? |
| `edge_created` | `type` | Which relationships are understood vs avoided |
| `issue_surfaced` | `rule_id` | **Which mistakes users actually make — directly informs which lint rules to add.** |
| `issue_resolved` | `rule_id`, `seconds_to_fix` | Are messages actionable? |
| `code_language_selected` | `language` | Which languages to invest in |
| `code_option_toggled` | `option`, `enabled` | Are the defaults right? |
| `code_copied` / `code_downloaded` | `language` | Is codegen used or ornamental? |
| `diagram_exported` | `format` | Which formats earn their keep |
| `diagram_imported` | `success`, `error_kind?` | Import reliability |
| `sticky_note_created` / `ink_stroke_drawn` | — | Are the whiteboard features used at all? |
| `clear_confirmed` | `node_count` | Frustration signal |
| `donation_clicked` | — | Monetisation |

**Rules if implemented:** no diagram content, class names, or note text ever leaves the device — counts and enums only. Opt-in, with a visible toggle and a plain-language explanation. Batch and send on idle. Respect Do Not Track. **[A]**

---

# 27. Open Questions / Uncertainties

The honest ledger. Each entry: what is known, what is not, the inference made, the recommended assumption, and confidence.

### U1 — Is there really no backend? · **Confidence: High (no backend)**
- **Known:** no auth UI, no user menu, no sync indicator, no loading spinner, no network error state in 27 screenshots. Persistence copy reads *"saved automatically"* and *"persist across reloads"*.
- **Unknown:** whether an analytics or problem-catalogue endpoint exists invisibly.
- **Inference:** fully client-side with `localStorage`.
- **Recommendation:** build with no backend. §16.3 documents an optional server profile if one is ever needed. **Verify before building if you can** — it is the single highest-leverage question in this document.

### U2 — What are the remaining lint rules? · **Confidence: Low**
- **Known:** exactly one rule, verbatim (R1).
- **Unknown:** everything else — how many rules, their severities, their wording.
- **Recommendation:** implement R1 exactly as observed; add R2–R14 (§14.3) as the plausible set, each behind the rule registry so they are trivial to add, remove, or reword. Match R1's message grammar: quote identifiers, end with a full stop, use the *target* as the subject.

### U3 — What is the complete problem catalogue? · **Confidence: Medium**
- **Known:** six problems visible; four fully legible, two (Library Management, Tic-Tac-Toe) clipped so their descriptions, bullets, and stats are unknown.
- **Unknown:** whether more exist below the fold; the exact reference diagrams for all six.
- **Recommendation:** ship the six named, authoring reference solutions consistent with the stated class/relationship counts (Parking Lot 15/13, Splitwise 10/9, Elevator 7/4, Vending Machine 8/6). Treat the catalogue as data so adding problems needs no code change. **The Parking Lot reference is fully visible in S3 and should be reproduced node-for-node** — it is free ground truth.

### U4 — How does scoring actually work? · **Confidence: Low — largest gap in this PRD**
- **Known:** the button exists only in practice mode; the library promises *"practice and get scored"*.
- **Unknown:** the algorithm, the weights, the result UI, whether it is a number or a rubric, whether it uses an LLM.
- **Recommendation:** implement §9.6 as specified (five weighted dimensions, fuzzy name matching, matched/missing/extra lists). Keep `scoreAgainstReference()` behind a clean interface so the algorithm can be swapped wholesale — including for an LLM-based grader — without touching the UI. **Flag this section for review with whoever knows the original.**

### U5 — Exact brand colours and fonts · **Confidence: Medium**
- **Known:** the palette's roles and relationships are unambiguous; one exact hex (`#f43f5e`) is printed in the UI.
- **Unknown:** precise hexes and the actual typefaces (screenshot compression shifts colour).
- **Recommendation:** use §19.1 as a starting point. **The semantic rules (§19.1, "colour semantics") matter far more than the hexes** — get teal-means-primary right and a 3% hue difference is invisible.

### U6 — Responsive behaviour · **Confidence: Low**
- **Known:** one desktop viewport, three times.
- **Unknown:** whether the original is responsive at all; it may simply be desktop-only.
- **Recommendation:** build §18. If time is short, ship desktop-perfect plus the mobile notice, and treat tablet/mobile as a follow-up. The product's nature (precise pointer manipulation) makes desktop-first defensible.

### U7 — Does the visibility button cycle or open a menu? · **Confidence: Medium (cycles)**
- **Known:** a compact square button showing `-` (attributes) or `+` (methods) with no visible chevron.
- **Unknown:** its interaction.
- **Recommendation:** cycle `- → + → # → ~` on click, with a tooltip naming the current visibility. Cheap to change to a dropdown later.

### U8 — What does the 4th zoom control (lock) do? · **Confidence: Medium-High**
- **Known:** a 4th button sits below fit-view, cut off at the bottom edge in every screenshot.
- **Resolved by research:** React Flow's stock `<Controls />` ships exactly `+`, `−`, `fitView`, and **`interactive` (a lock)**. The stack matches one-for-one.
- **Recommendation:** implement it as React Flow's interactivity lock — when locked, nodes can't be dragged or connected and the canvas can't be panned. This is now high confidence.

### U9 — Does Clear remove ink? · **Confidence: Medium**
- **Known:** the sticky note **survives** Clear (S24 → S27) — unambiguous. Nodes and edges are removed — unambiguous. Ink is absent in S27, but a trash button exists in the ink toolbar, so the user may have erased it manually between shots.
- **Recommendation:** Clear removes nodes, edges, **and ink**, preserving sticky notes and scratch notes. Rationale: ink is diagram annotation, stickies are standalone content. Make it a one-line change if wrong.

### U10 — What exactly does "Sample" load? · **Confidence: Low**
- **Known:** a header button labelled "Sample" with a graph icon.
- **Unknown:** its content, and whether it replaces or appends.
- **Recommendation:** load a small demonstration diagram (6–8 classes showing all five kinds and several relationship types) that replaces the current one after confirmation. It exists to show a new user what "good" looks like in one click.

### U11 — Does the Brief open a modal or expand the banner? · **Confidence: Low**
- **Known:** a "Brief" button; the banner subtitle is visibly truncated.
- **Recommendation:** a modal reusing the problem card's description and bullets. Dismissing returns to an intact session.

### U12 — Are attributes and methods reorderable? · **Confidence: Low**
- **Known:** no drag handles visible on Inspector rows.
- **Recommendation:** not in v1. Members render in insertion order. Add drag-to-reorder later if asked.

### U13 — Multi-select and group operations? · **Confidence: Low**
- **Known:** every screenshot shows at most one selected element.
- **Recommendation:** support marquee multi-select and group move (React Flow gives it nearly free), but scope the Inspector to single selection — show "N items selected" with only a Delete action for multi.

### U14 — Node auto-sizing vs manual resize · **Confidence: Medium**
- **Known:** node widths vary with content; sticky notes show explicit resize handles but **nodes do not**.
- **Recommendation:** nodes size automatically to content; only sticky notes are manually resizable. The `size` field on `ClassNode` is reserved for future use.

### U15 — Exact truncated strings · **Confidence: Medium**
- **Unknown:** the practice subtitle beyond *"Model the classes & relationships, th…"*, and the multiplicity rendered as `1..spo…`.
- **Recommendation:** use *"Model the classes & relationships, then score your design against the reference."* and `1..*`. Both are near-certain completions.

---

# 28. Traceability Matrix

How each requirement was derived. `S#` refers to §4.2.

| Source | Observation | Requirement derived | § | Confidence |
|---|---|---|---|---|
| S1 | Modal titled "LLD Problem Library" with 2-col card grid | ProblemLibraryModal spec, card anatomy | 9.1, 10.7 | High |
| S1 | Badges EASY/MEDIUM/HARD in green/amber/red | Difficulty badge variants | 19.4 | High |
| S1 | "15 classes · 13 relationships" in mono | `Problem.stats` field; mono-for-model rule | 13, 19.2 | High |
| S1 | Two buttons per card: Practice, Load solution → | Two distinct entry flows | 9.2, 9.5 | High |
| S1 | Subtitle "…load its verified solution, or practice and get scored." | Scoring feature exists | 9.6 | High |
| S2 | Palette: 5 kinds, 6 relationships, 1 sticky | `ClassKind`, `RelationshipType` enums | 13 | High |
| S2 | "Pick a type, then drag from one class's edge to another" | Edge creation interaction model | 9.8 | High |
| S2 | Only `Associate` has a teal border | Mutual-exclusion arming rule (BR25) | 14.2 | High |
| S2 | `«enumeration»`, `«abstract»`, italic titles, `no attributes` | ClassNode rendering rules | 11.1 | High |
| S2 | Inspector: "Select a class or arrow to edit it." | Inspector empty state; **edge selection must exist** | 10.5.1 | High |
| S2 | Teal dots on node left/right edges | ConnectionHandle placement | 11.1 | High |
| S2 | Lock icon + REF badge on the second tab | Document-level read-only permission model | 8.2 | High |
| S3 | Full 15-class Parking Lot model with labelled edges | Reference diagrams are authored data; edge labels + multiplicities | 13, 9.8 | High |
| S3 | `paymentStrategy`, `vehicle`, `floor` edge labels | `Relationship.label` field | 13 | High |
| S4 | Six language pills, Java active | `Language` enum | 13 | High |
| S4 | 3 chips teal, 2 dark, untouched panel | Codegen option defaults | 9.10 | High |
| S4 | Enums emitted before the abstract class | Dependency-first ordering (BR41) | 14.4 | Medium |
| S4 | Constructor + getters + setters present | Codegen contract | 9.10 | High |
| S5 | Green check, "No problems", "…valid and ready to generate." | Issues empty state copy | 9.9 | High |
| S5 | Issues panel is live on a read-only reference tab | References must lint clean | 9.2, 25.2 | High |
| S6 | "SCRATCH NOTES" + "saved automatically" + placeholder | NotesPanel spec; autosave with no Save button | 10.5.4, 14.1 | High |
| S6 | "…persist across reloads" | localStorage persistence | 5.4 | High |
| S7 | Practice banner + "Score my solution" appear together | Mode-gated visibility (BR60/61) | 14.5 | High |
| S7 | Canvas empty right after entering Practice | Practice clears the canvas (BR62) | 9.5 | Medium |
| S7 | Banner has Brief / Reveal reference / Exit | Three in-session sub-flows | 9.5 | High |
| S8 | `NewClass0` then `NewClass1` | Zero-based auto-naming counter (BR20) | 14.2 | High |
| S8 | Both seeded `- id: long`, `+ doWork(): void` | Node seeding rule (BR21) | 9.4 | High |
| S9 | Full Inspector form, field order, S/F and S/A toggles | Inspector spec; `isStatic`/`isFinal`/`isAbstract` fields | 9.7, 13 | High/Medium |
| S9 | "= default value (optional)" | `Attribute.defaultValue` | 13 | High |
| S10 | Name input mid-edit; canvas already updated | **Live per-keystroke binding, no commit** (BR29) | 15.1 | High |
| S11 | Second attribute row added and rendered | `+ attribute` behaviour | 9.7 | High |
| S12 | Selected node has a teal ring; `Realize` armed | Selection styling; arming | 11.1 | High |
| S12→S13 | Issues badge 0 → 1 after drawing an edge | **Live linting on every mutation** | 5.3, 9.9 | High |
| S13 | Dashed line + hollow triangle | Realize edge rendering | 9.8 | High |
| S14 | `NewClsdsd — "NewClass0" realizes "NewClsdsd" which is not an interface.` | **Lint rule R1, verbatim**; issue row format | 14.3 | High |
| S15 | `public class NewClass0 implements NewClsdsd` | Realize → `implements` (BR42) | 14.4 | High |
| S17 | Toolbar expands: 5 colours, 3 widths; tooltip `#f43f5e` | InkToolbar spec; exact ink red | 10.4.3, 19.1 | High |
| S17 vs S23 | Trash icon absent, then present | Trash appears only when ink exists | 14.6 | High |
| S18 | Eraser active state is red-tinted | Eraser distinct from pen | 10.4.3 | High |
| S19 | `@Override public String toString()` | toString option output | 9.10 | High |
| S20 | `import java.util.Objects;` added | Conditional imports (BR47) | 14.4 | High |
| S4→S19→S20 | Chips accumulate | Chips are independent multi-select | 9.10 | High |
| S21 | `ABC`, `__init__`, `__repr__`, `_id: int = 0` | Python codegen contract; type mapping | 9.10 | High |
| S21 | No getters despite the chip being on | Languages ignore un-idiomatic options (BR49) | 14.4 | High |
| S22 | 7 colour dots, B, I, ×, exact placeholder | StickyNote spec | 9.14 | High |
| S23 | Cyan freehand stroke over the canvas | Ink layer; `perfect-freehand` | 9.15 | High |
| S24 | Note overlaps a node; corner handles when selected | Sticky z-order above nodes; resizable | 5.2, 9.14 | High |
| S25 | PNG image / SVG vector / JSON (reloadable) | Exactly three export formats | 9.12 | High |
| S26 | Native macOS file picker | Import is a local file read | 9.13 | High |
| S24→S27 | Sticky survives; nodes/edges gone; Issues 0 | **Clear preserves stickies** (BR32) | 9.11 | High |
| All | No auth, avatar, settings, or sync UI | No accounts; single local user | 8.1 | High |
| All | Mono for model, sans for chrome | Typographic system rule | 19.2 | High |
| All | Fixed 3-column, no page scrollbar | Layout spec | 10.1 | High |
| All | Top strip = Chrome bookmarks bar | **Explicitly not app UI** | 2.5 | High |
| Research | React Flow `<Controls/>` = +/−/fit/**lock** | Resolves the 4th zoom button | 27-U8 | Medium-High |
| Inference | No save button anywhere + "saved automatically" | Debounced autosave architecture | 14.1 | High |
| Inference | Ink drawn but nodes still clickable afterwards | Ink layer must be pointer-events:none when disarmed | 5.2 | High |

---

# 29. Final Build Checklist

Tick every box before calling it done.

### Foundation
- [ ] Vite + React 19 + TypeScript (strict) + Tailwind v4
- [ ] §19.1 colour tokens as CSS variables, light-independent (this app is dark-only)
- [ ] Inter (sans) + JetBrains Mono (mono) loaded with fallbacks
- [ ] Three-column shell: `265px | 1fr | 510px` under a 56px header, `100vh`, no page scroll
- [ ] `@xyflow/react` v12, `zustand` + `zundo`, `perfect-freehand`, Radix UI, `lucide-react`, `dompurify`

### Domain (pure, no React imports)
- [ ] §13 types transcribed exactly
- [ ] Lint registry with **R1 verbatim** + R2–R14
- [ ] Codegen: `CodeGenerator` interface + 6 languages + type map + dependency-first ordering
- [ ] Scoring: 5 weighted dimensions, fuzzy name matching, matched/missing/extra
- [ ] Serialize / deserialize / migrations
- [ ] Six problems with authored reference diagrams **that all lint clean**

### Store
- [ ] Slices: document, workspace, ui, practice
- [ ] **Read-only guard enforced in the store**, not just the UI
- [ ] Undo/redo via zundo
- [ ] Debounced `localStorage` persist with `schemaVersion` + migration
- [ ] Corrupt-storage recovery boots fresh with a toast
- [ ] Issues and generated code are **derived, never persisted**

### Header
- [ ] Brand mark + ClassForge / LLD STUDIO
- [ ] LLD Problems (teal) · Sample · Export▾ · Import · Clear
- [ ] Score my solution — **only in practice mode**
- [ ] Buy me a coffee (amber, external, `rel="noopener noreferrer"`)
- [ ] Import/Clear/Sample disabled on read-only documents

### Palette
- [ ] 5 kinds with correct dot colours; 6 relationships with correct glyphs; Sticky note
- [ ] Three exact section labels + the exact helper sentence
- [ ] Mutually exclusive arming; teal border + teal text when armed
- [ ] Armed relationship **persists after use**
- [ ] Disabled on read-only documents

### Canvas
- [ ] Dotted background, correct spacing and colour
- [ ] `ClassNode`: stereotype line, italic names for Abstract/Interface, compartments, `no attributes`/`no operations`, enum bare literals
- [ ] Teal handles left and right; selection ring
- [ ] 6 edge types with correct dashing and markers; labels and multiplicities
- [ ] Ink layer with `pointer-events: none` when disarmed
- [ ] Sticky notes above nodes, resizable, sanitised
- [ ] All three layers share the viewport transform
- [ ] Zoom controls: `+ − ⛶ 🔒`
- [ ] Ink toolbar: collapsed → expanded, 5 colours with hex tooltips, 3 widths, conditional trash, red eraser
- [ ] Practice banner when a session is active
- [ ] Canvas empty state for a blank `My Design`

### Tabs
- [ ] `My Design` never closable; reference tabs with lock + REF + ×
- [ ] Per-document viewport, notes, stickies, ink
- [ ] Reloading the same solution focuses the existing tab

### Right panel
- [ ] Four tabs with a teal underline and an Issues count badge
- [ ] Inspector: empty / node / edge states, full form, live binding, Delete class
- [ ] Issues: green-check empty state, exact copy, issue rows, click-to-select
- [ ] Code: 6 pills, Copy/Download, 5 chips with correct defaults, mono output, no wrapping
- [ ] Notes: SCRATCH NOTES + saved automatically + exact placeholder

### Library and practice
- [ ] Modal with exact title/subtitle, 2-col grid, focus trap, Escape to close
- [ ] Cards with title, badge, tags, description, bullets, stats, two buttons
- [ ] Load solution → read-only REF tab, fitted
- [ ] Practice → clears (with confirm), banner, Score button
- [ ] Brief / Reveal reference / Exit
- [ ] Score modal with total, dimensions, matched/missing/extra

### I/O
- [ ] Export PNG / SVG / JSON with whole-diagram coverage and background
- [ ] Import with full validation and confirmation over existing work
- [ ] Copy with confirmation; Download with a sane filename
- [ ] **Clear preserves sticky notes**

### Quality
- [ ] All 50 acceptance criteria in §21 pass
- [ ] Unit tests for every lint rule and every codegen language
- [ ] `it.each` test asserting every bundled reference lints clean
- [ ] 12 Playwright flows green
- [ ] axe-core clean on the workspace and the open modal
- [ ] Visible focus rings; WCAG AA contrast; `aria-live` on the issue count
- [ ] Sticky-note XSS fixture renders inert
- [ ] 50 nodes / 60 edges stays ≥50fps
- [ ] Responsive at 1440 / 1280 / 1024 / 768 / 390
- [ ] No console errors or warnings

---

## Appendix A — Reference model: Parking Lot (from S3)

Reproduce this as `domain/problems/data/parkingLot.ts`. Node names, kinds, and members are read directly from S2 and S3; the stat line claims **15 classes · 13 relationships**, so a few members are inferred where the fit-view zoom made them illegible. **[C for names/kinds/topology; I for some member signatures]**

| Class | Kind | Members observed |
|---|---|---|
| `VehicleType` | ENUM | `CAR`, `BIKE`, `TRUCK` |
| `SpotType` | ENUM | `COMPACT`, `LARGE`, `MOTORCYCLE` |
| `Vehicle` | ABSTRACT | `- licensePlate: String`, `- type: VehicleType`; `+ getType(): VehicleType` |
| `Car` | CLASS | *(no attributes / no operations)* |
| `Bike` | CLASS | *(no attributes / no operations)* |
| `Truck` | CLASS | *(no attributes / no operations)* |
| `ParkingSpot` | CLASS | `- id: String`, `- type: SpotType`, `- occupied: boolean`; `+ assign(Vehicle v): boolean`, `+ free(): void` |
| `ParkingFloor` | CLASS | `- floorId: String`; `+ findSpot(SpotType type): ParkingSpot` |
| `ParkingLot` | CLASS | `- name: String`; `+ parkVehicle(Vehicle v): Ticket`, `+ unpark(Ticket t): double` |
| `Ticket` | CLASS | `- id: String`, `- entryTime: long`, `- amount: double`; `+ close(long exitTime): double` |
| `FeeStrategy` | INTERFACE | `+ calculate(Ticket t): double` |
| `HourlyFeeStrategy` | CLASS | *(realizes FeeStrategy)* |
| `PaymentStrategy` | INTERFACE | `+ pay(double amount): boolean` |
| `CardPayment` | CLASS | *(realizes PaymentStrategy)* |
| `CashPayment` | CLASS | *(realizes PaymentStrategy)* |

**Relationships (13):** `Car`→`Vehicle` inherit · `Bike`→`Vehicle` inherit · `Truck`→`Vehicle` inherit · `ParkingSpot`→`Vehicle` associate (label `vehicle`, `0..1`) · `ParkingFloor`→`ParkingSpot` compose (`1..*`) · `ParkingLot`→`ParkingFloor` compose (label `floor`) · `ParkingLot`→`Ticket` compose · `Ticket`→`ParkingSpot` associate · `Ticket`→`FeeStrategy` associate · `HourlyFeeStrategy`⇢`FeeStrategy` realize · `ParkingLot`→`PaymentStrategy` associate (label `paymentStrategy`) · `CardPayment`⇢`PaymentStrategy` realize · `CashPayment`⇢`PaymentStrategy` realize.

This model is also the best available fixture for codegen snapshot tests, because S4 shows its exact Java output.

---

## Appendix B — Exact UI copy strings

Reproduce verbatim. **[C]**

| Location | String |
|---|---|
| Brand | `ClassForge` / `LLD STUDIO` |
| Header buttons | `LLD Problems` · `Sample` · `Export` · `Import` · `Clear` · `Score my solution` · `Buy me a coffee` |
| Palette labels | `ADD CLASS · DRAG ONTO CANVAS` · `RELATIONSHIP · DRAG NODE → NODE` · `ANNOTATE` |
| Palette items | `Class` `Abstract` `Interface` `Enum` `Record` · `Inherit` `Realize` `Compose` `Aggregate` `Associate` `Depend` · `Sticky note` |
| Palette helper | `Pick a type, then drag from one class's edge to another to connect them.` |
| Panel tabs | `Inspector` · `Issues` · `Code` · `Notes` |
| Inspector empty | `Select a class or arrow to edit it.` / `Drag a kind from the left palette to add one.` |
| Inspector labels | `NAME` · `KIND` · `TYPE PARAMETERS (GENERICS)` · `ATTRIBUTES` · `METHODS` · `NOTE / DOC COMMENT` |
| Inspector placeholders | `e.g. T or K, V` · `= default value (optional)` · `parameters — e.g. int id, String name` · `returns` |
| Inspector buttons | `+ attribute` · `+ method` · `Delete class` |
| Issues empty | `No problems` / `Your diagram is valid and ready to generate.` |
| Issue R1 | `"<Source>" realizes "<Target>" which is not an interface.` |
| Code languages | `Java` `Python` `TypeScript` `JavaScript` `C++` `C#` |
| Code actions | `Copy` · `Download` |
| Code options | `Constructor` · `Getters/Setters` · `toString` · `equals/hashCode` · `Doc comments` |
| Notes | `SCRATCH NOTES` · `saved automatically` |
| Notes placeholder | `Jot down your approach, trade-offs, edge cases, patterns to remember…` ⏎⏎ `These notes are saved with this diagram and persist across reloads.` |
| Modal | `LLD Problem Library` / `Pick a classic low-level-design problem, load its verified solution, or practice and get scored.` |
| Card buttons | `Practice` · `Load solution →` |
| Practice banner | `PRACTICE` · `Brief` · `Reveal reference` · `Exit` |
| Practice subtitle | `Model the classes & relationships, th…` *(truncated — see U15)* |
| Export menu | `PNG image` · `SVG vector` · `JSON (reloadable)` |
| Sticky placeholder | `Write a note… (⌘/Ctrl+B bold · ⌘/Ctrl+I italic)` |
| Tab badge | `REF` |
| Node placeholders | `no attributes` · `no operations` |
| Stereotypes | `«abstract»` · `«interface»` · `«enumeration»` |

---

*End of document.*
