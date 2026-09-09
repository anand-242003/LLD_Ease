# AI Usage — LLDSIM (LLD Studio)

> **AI tools used:** Google Gemini via Antigravity IDE (`gemini-2.5-pro` / Claude Sonnet)  
> **Scope:** Full product lifecycle — PRD authoring → 37-phase implementation → UI polish → landing page

---

## Overview

LLDSIM was built through AI-assisted development using Google's Antigravity IDE as the primary engineering environment. The human contributor provided product vision, feature requirements, design direction, and real-time feedback. The AI agent authored, verified, debugged, and iterated on all source code and documentation.

---

## Decision 1 — Scoring Algorithm Design (Fuzzy Bipartite Matching)

**What the AI suggested:**  
Design the scoring engine as a 5-dimension weighted system using normalised Levenshtein-ratio fuzzy name matching and greedy bipartite node pairing, rather than exact string matching.

**Why this came up:**  
The product requirement only stated "scored against the reference solution" — no algorithm, no weights, no scoring dimensions were specified.

**What I accepted:**  
The full approach. Fuzzy matching (with a 0.6 similarity threshold) correctly handles the reality that interview candidates rarely copy class names exactly from a reference — `ParkingFloor` vs `Floor` should get partial credit. Greedy bipartite matching (O(n²)) was chosen over the optimal Hungarian algorithm because n < 30 for any real LLD problem, making the simpler approach entirely sufficient.

**What I questioned:**  
The fuzzy threshold of 0.6 was AI-calibrated based on judgment, not measured data. I accepted it but acknowledged this is an assumption that would need tuning with real user data.

---

## Decision 2 — Domain Logic as Pure Functions, Decoupled from React

**What the AI suggested:**  
Implement all domain logic — `lint()`, `generateCode()`, `scoreAgainstReference()`, `buildFeedbackReport()` — as pure TypeScript functions in `src/domain/` with zero React or Zustand imports.

**Why this came up:**  
The AI identified early that mixing business logic into React components or Zustand slices would make verification and reuse difficult. It proposed a clean separation proactively.

**What I accepted:**  
The full architecture. The lint engine runs live as the user edits (via debounced selectors) *and* at submission time inside the scoring engine — shared without duplication precisely because it's a pure function. This also made browser-console verification (`window.__store.getState()`) trivially effective throughout the 37-phase build.

**What I rejected / modified:**  
Nothing in this decision — it was clearly the right call from the start. The only cost is slightly more boilerplate (functions receive full `Diagram` objects), which is the right tradeoff for testability and reuse.

---

## Decision 3 — Zustand + Zundo Slice Architecture

**What the AI suggested:**  
Use Zustand composed from 6 slices (`documentSlice`, `workspaceSlice`, `practiceSlice`, `profileSlice`, `uiSlice`, `toastSlice`), with Zundo's `temporal` middleware layered only over document mutations for undo/redo.

**Why this came up:**  
The AI evaluated Redux Toolkit and Jotai as alternatives before settling on Zustand.

**What I accepted:**  
The Zustand + Zundo combination. Zundo's key design choice — tracking only document mutations and excluding transient UI state (`selectedElement`, `activeModal`, zoom level) — prevents a subtle class of bugs where "undo" accidentally un-selects the user's current element or closes an open panel.

**What I considered rejecting:**  
Redux Toolkit was a genuine alternative worth considering. It offers stronger DevTools and action replay. The AI's argument — that RTK's boilerplate overhead is net-negative for a single-contributor, client-only app — was sound, so I accepted Zustand.

---

## Decision 4 — Explainable Feedback Engine with 4 Analytical Lenses

**What the AI suggested:**  
Implement the feedback system as 4 separate pure analyzers — Abstractions, Relationships, Responsibilities, Trade-offs — each emitting node-anchored `Finding[]` objects with `nodeId`, `severity`, `title`, and `explanation`.

**Why this came up:**  
The requirement said "useful, explainable feedback" — with no further specification of what that means structurally.

**What I accepted:**  
The 4-lens decomposition and the node-anchoring design. Generic advice ("use more interfaces") is not emitted — every finding is anchored to a specific class in the user's diagram. The AI's rationale was that actionable, class-specific feedback is more useful for learning than global observations. The separation of the Trade-offs lens from the Relationships lens was particularly good: coupling violations (DIP, high fan-out to concretes) are meaningfully different from simply missing edges.

**What I accepted with caveats:**  
Positive findings are included (things the user did *well*). This was an AI-generated idea not in the original requirement — I accepted it because it supports realistic self-assessment and motivation, not just deficiency reporting.

---

## Decision 5 — GSAP + Lenis for Landing Page Motion

**What the AI suggested:**  
Use GSAP (reading all 8 installed GSAP skill files for authoritative API reference) with Lenis smooth scroll, wiring a `ScrollTrigger.scrollerProxy` so scroll-triggered animations stay in sync with Lenis's virtual scroll position.

**Why this came up:**  
The landing page direction was "make it premium." The AI identified that CSS-only animations cannot produce scroll-linked, staggered, clip-path reveal effects at the fidelity required.

**What I accepted:**  
The full approach. The AI correctly scoped all GSAP animations inside `gsap.context()` with `ctx.revert()` on React `useEffect` cleanup — preventing memory leaks and stale ScrollTriggers. `gsap.quickTo()` was used for high-frequency event handlers (magnetic button, mouse parallax) to avoid creating a new tween on every `mousemove` event.

**What I flagged as a risk:**  
When the design prompt is directional ("make it premium, inspired by siteinspire.com") the AI makes many aesthetic choices autonomously — noise textures, ambient orbs, clip-path reveals, marquee tickers, magnetic buttons. These worked well here, but for any future feature with aesthetic impact, I would ask for a mockup before full implementation rather than accepting an autonomous build.

---

## Summary Table

| Decision | AI Suggested | Accepted | Rejected / Modified |
|---|---|---|---|
| Scoring algorithm | Fuzzy bipartite matching, 5 dimensions | ✅ Full approach | Threshold (0.6) accepted with caveat — needs data |
| Domain architecture | Pure functions, zero React deps | ✅ Full approach | Nothing |
| State management | Zustand + Zundo, 6 slices | ✅ Full approach | RTK considered and consciously rejected |
| Feedback engine | 4-lens, node-anchored findings | ✅ Full approach + positive findings | Accepted positive findings (not in original spec) |
| Landing page motion | GSAP + Lenis + ScrollTrigger proxy | ✅ Full approach | Process risk noted — mockup first next time |

---

*The AI functioned as the sole engineer — designing systems, writing code, running verification, and fixing bugs — with the human acting as product owner, directing priorities and approving direction.*
