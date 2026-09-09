#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# Phased git commit + push script for LLD_Ease
# Groups 37 phases into 10 logical commits matching the PRD milestones.
# Run from the repo root. Safe to re-run — each commit is idempotent
# since it only stages exactly the listed files.
# ─────────────────────────────────────────────────────────────────
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# ── helpers ──────────────────────────────────────────────────────
commit() {
  local MSG="$1"
  shift
  git add "$@"
  git commit -m "$MSG"
  echo "✅  committed: $MSG"
}

push() {
  git push -u origin main
  echo "🚀  pushed to origin"
}

echo "📦  Starting phased commit sequence…"
echo ""

# ─────────────────────────────────────────────────────────────────
# PHASE GROUP 1 — Project scaffold & config (phases 01–02)
# ─────────────────────────────────────────────────────────────────
commit "feat(phase-01-02): scaffold project + design tokens

- Initialise Vite + React + TypeScript + Tailwind project
- Add ESLint, Prettier, PostCSS config
- Add global CSS reset and dark-mode design-token layer (tokens.css)
- Add globals.css with React Flow theme overrides and scrollbar styling
- Add index.html entry point and tsconfig

Refs: phases/01-environment-repo-scaffolding.md
      phases/02-global-design-tokens-base-styles.md" \
  package.json package-lock.json vite.config.ts tsconfig.json \
  eslint.config.js postcss.config.js tailwind.config.ts \
  index.html .gitignore .prettierrc \
  src/styles/tokens.css src/styles/globals.css \
  src/main.tsx \
  phases/01-environment-repo-scaffolding.md \
  phases/02-global-design-tokens-base-styles.md \
  README.md DESIGN.md PRD.md PHASES.md INFO.MD skills-lock.json

# ─────────────────────────────────────────────────────────────────
# PHASE GROUP 2 — Domain types + static app shell (phases 03–04)
# ─────────────────────────────────────────────────────────────────
commit "feat(phase-03-04): static app shell layout + domain types

- AppShell: 3-column grid (sidebar | canvas | panel), header, tab bar
- AppHeader with brand mark and action buttons
- DocumentTab, DocumentTabBar components
- Domain types: Diagram, ClassNode, RelationshipEdge, Member, Visibility
- Button, ConfirmDialog, ToastContainer base UI components

Refs: phases/03-static-app-shell-layout.md
      phases/04-domain-types-constants.md" \
  src/App.tsx \
  src/domain/types.ts \
  src/components/layout/AppShell.tsx \
  src/components/layout/AppHeader.tsx \
  src/components/layout/DocumentTab.tsx \
  src/components/layout/DocumentTabBar.tsx \
  src/components/ui/Button.tsx \
  src/components/ui/ConfirmDialog.tsx \
  src/components/ui/ToastContainer.tsx \
  phases/03-static-app-shell-layout.md \
  phases/04-domain-types-constants.md

# ─────────────────────────────────────────────────────────────────
# PHASE GROUP 3 — Zustand store + persistence (phases 05–06 + 16)
# ─────────────────────────────────────────────────────────────────
commit "feat(phase-05-06-16): zustand store scaffolding + localStorage persistence

- Zustand store with document, workspace, practice, toast, ui slices
- Store selectors (useActiveDocument etc.)
- localStorage persistence with version migration
- Serialization / deserialization with schema validation
- Sanitization helpers

Refs: phases/05-zustand-store-scaffolding.md
      phases/06-workspace-document-lifecycle-logic.md
      phases/16-persistence-layer.md" \
  src/store/index.ts \
  src/store/documentSlice.ts \
  src/store/workspaceSlice.ts \
  src/store/practiceSlice.ts \
  src/store/toastSlice.ts \
  src/store/uiSlice.ts \
  src/store/selectors.ts \
  src/store/persist.ts \
  src/domain/sanitization.ts \
  src/domain/serialization/serialize.ts \
  src/domain/serialization/deserialize.ts \
  src/domain/serialization/migrations.ts \
  phases/05-zustand-store-scaffolding.md \
  phases/06-workspace-document-lifecycle-logic.md \
  phases/16-persistence-layer.md

# ─────────────────────────────────────────────────────────────────
# PHASE GROUP 4 — Canvas: React Flow + ClassNode + edges (phases 07–10)
# ─────────────────────────────────────────────────────────────────
commit "feat(phase-07-10): react-flow canvas, ClassNode, relationship edges

- React Flow canvas stage with drag-and-drop support
- ClassNode component: kind badges, attribute/method rows, selection ring
- Edge markers: arrow heads for all 6 UML relationship types
- RelationshipEdge custom component with label and selection
- ZoomControls overlay
- useDragToCanvas hook

Refs: phases/07-react-flow-canvas-foundation.md
      phases/08-classnode-component.md
      phases/09-palette-sidebar-drag-to-create.md
      phases/10-relationship-edges.md" \
  src/components/canvas/CanvasStage.tsx \
  src/components/canvas/ClassNode.tsx \
  src/components/canvas/RelationshipEdge.tsx \
  src/components/canvas/edgeMarkers.tsx \
  src/components/canvas/ZoomControls.tsx \
  src/hooks/useDragToCanvas.ts \
  src/hooks/useDocumentSync.ts \
  phases/07-react-flow-canvas-foundation.md \
  phases/08-classnode-component.md \
  phases/09-palette-sidebar-drag-to-create.md \
  phases/10-relationship-edges.md

# ─────────────────────────────────────────────────────────────────
# PHASE GROUP 5 — Palette sidebar + Inspector panels (phases 09 + 11–12)
# ─────────────────────────────────────────────────────────────────
commit "feat(phase-11-12): palette sidebar + node/edge inspector panels

- PaletteSidebar with draggable class-kind rows
- PaletteRow component
- NodeInspector: inline name/kind/member editing
- EdgeInspector: relationship type selector
- Inspector host with tab switching
- MemberRow, AddRowButton, VisibilityButton, ChipToggle, MiniToggle,
  PillGroup, DangerButton panel UI atoms

Refs: phases/11-inspector-node-form.md
      phases/12-inspector-edge-form-delete-flows.md" \
  src/components/layout/PaletteSidebar.tsx \
  src/components/layout/PaletteRow.tsx \
  src/components/panel/Inspector.tsx \
  src/components/panel/NodeInspector.tsx \
  src/components/panel/EdgeInspector.tsx \
  src/components/panel/MemberRow.tsx \
  src/components/panel/AddRowButton.tsx \
  src/components/panel/VisibilityButton.tsx \
  src/components/panel/ChipToggle.tsx \
  src/components/panel/MiniToggle.tsx \
  src/components/panel/PillGroup.tsx \
  src/components/panel/DangerButton.tsx \
  src/components/panel/RightPanel.tsx \
  phases/11-inspector-node-form.md \
  phases/12-inspector-edge-form-delete-flows.md

# ─────────────────────────────────────────────────────────────────
# PHASE GROUP 6 — Lint engine + codegen (phases 13–15)
# ─────────────────────────────────────────────────────────────────
commit "feat(phase-13-15): lint engine, issues panel, code generation

- Lint rule engine with registry and 14 rule implementations
- IssuesPanel with live error/warning list
- IssueRow component
- Codegen core: Java, Python, TypeScript, JavaScript, C++, C#
- CodePanel with language tabs and copy button
- CodeViewer with syntax-highlighted output
- NotesPanel

Refs: phases/13-lint-engine-issues-panel.md
      phases/14-codegen-core-java-python.md
      phases/15-codegen-remaining-languages-code-panel-ui.md" \
  src/domain/lint/index.ts \
  src/domain/lint/registry.ts \
  src/domain/lint/rules/ \
  src/domain/codegen/index.ts \
  src/domain/codegen/ordering.ts \
  src/domain/codegen/typeMap.ts \
  src/domain/codegen/types.ts \
  src/domain/codegen/languages/ \
  src/components/panel/IssuesPanel.tsx \
  src/components/panel/IssueRow.tsx \
  src/components/panel/CodePanel.tsx \
  src/components/panel/CodeViewer.tsx \
  src/components/panel/NotesPanel.tsx \
  phases/13-lint-engine-issues-panel.md \
  phases/14-codegen-core-java-python.md \
  phases/15-codegen-remaining-languages-code-panel-ui.md

# ─────────────────────────────────────────────────────────────────
# PHASE GROUP 7 — Problem library + practice mode (phases 17–21)
# ─────────────────────────────────────────────────────────────────
commit "feat(phase-17-21): problem library, practice mode, scoring engine

- ProblemLibraryModal with card grid
- ProblemCard component
- Problem data: Parking Lot, Splitwise, Elevator, Vending Machine,
  LRU Cache, Chess Game, Movie Tickets, Library, Restaurant, Tic-Tac-Toe
- Practice mode: PracticeBanner, practice session lifecycle
- Scoring engine: structural + name-match dimensions
- ScoreResultModal with dimension bars
- Document tabs + notes panel

Refs: phases/17-document-tabs-notes-panel.md
      phases/18-problem-library-data-modal.md
      phases/19-load-reference-solution-flow.md
      phases/20-practice-mode.md
      phases/21-scoring-engine-score-result-modal.md" \
  src/domain/problems/index.ts \
  src/domain/problems/data/ \
  src/domain/scoring/index.ts \
  src/domain/scoring/dimensions.ts \
  src/domain/scoring/nameMatch.ts \
  src/domain/practice/attempts.ts \
  src/components/library/ProblemLibraryModal.tsx \
  src/components/library/ProblemCard.tsx \
  src/components/canvas/PracticeBanner.tsx \
  src/components/practice/ScoreResultModal.tsx \
  src/components/practice/ScoreDimensionBar.tsx \
  src/components/practice/FeedbackSection.tsx \
  src/components/practice/FindingCard.tsx \
  phases/17-document-tabs-notes-panel.md \
  phases/18-problem-library-data-modal.md \
  phases/19-load-reference-solution-flow.md \
  phases/20-practice-mode.md \
  phases/21-scoring-engine-score-result-modal.md

# ─────────────────────────────────────────────────────────────────
# PHASE GROUP 8 — Feedback, history, canvas tools (phases 22–27)
# ─────────────────────────────────────────────────────────────────
commit "feat(phase-22-27): feedback engine, attempt history, sticky notes, ink drawing

- Explainable feedback engine: abstractions, relationships, responsibilities,
  tradeoffs analysis with per-class findings
- AttemptHistoryPanel + AttemptTrendChart for repeated practice tracking
- Sticky notes: StickyNote, StickyNoteLayer components
- Ink drawing layer: InkLayer, InkToolbar, useInkDrawing hook
- Keyboard shortcuts: useKeyboardShortcuts hook
- Undo/redo via zundo middleware

Refs: phases/22-explainable-feedback-engine.md
      phases/23-submission-history-repeated-practice.md
      phases/24-sticky-notes.md
      phases/25-ink-drawing-layer.md
      phases/26-export-import-clear.md
      phases/27-undo-redo-keyboard-shortcuts.md" \
  src/domain/feedback/ \
  src/components/practice/AttemptHistoryPanel.tsx \
  src/components/practice/AttemptTrendChart.tsx \
  src/components/canvas/StickyNote.tsx \
  src/components/canvas/StickyNoteLayer.tsx \
  src/components/canvas/InkLayer.tsx \
  src/components/canvas/InkToolbar.tsx \
  src/hooks/useInkDrawing.ts \
  src/hooks/useKeyboardShortcuts.ts \
  phases/22-explainable-feedback-engine.md \
  phases/23-submission-history-repeated-practice.md \
  phases/24-sticky-notes.md \
  phases/25-ink-drawing-layer.md \
  phases/26-export-import-clear.md \
  phases/27-undo-redo-keyboard-shortcuts.md

# ─────────────────────────────────────────────────────────────────
# PHASE GROUP 9 — Polish + profiles + problem context (phases 28–36)
# ─────────────────────────────────────────────────────────────────
commit "feat(phase-28-36): responsive pass, local profiles, problem context panel

- Responsive + accessibility audit: mobile notice, focus rings, ARIA labels
- useMediaQuery / useBreakpoint hook
- Remove import/export in favour of streamlined UX
- ProblemContextPanel: inline brief in sidebar
- Removed brief dialog and consolidated solution access
- ProfileSwitcher: local named slots with per-profile attempt history
- Profile persistence (profilePersist, profileSlice)
- Expanded problem library to 10 LLD problems

Refs: phases/28-responsive-accessibility-pass.md
      phases/29-final-polish-e2e-simulation-ui-audit.md
      phases/30.remove-import-export.md
      phases/31.problem-context-sidebar-panel.md
      phases/32.remove-brief-dialog.md
      phases/33.consolidate-solution-access.md
      phases/34.remove-practice-exit-control.md
      phases/35.local-profile-switcher-history.md
      phases/36.expand-problem-library.md" \
  src/hooks/useMediaQuery.ts \
  src/components/layout/ProfileSwitcher.tsx \
  src/components/layout/ProblemContextPanel.tsx \
  src/store/profileSlice.ts \
  src/store/profilePersist.ts \
  src/domain/profile/types.ts \
  phases/28-responsive-accessibility-pass.md \
  phases/29-final-polish-e2e-simulation-ui-audit.md \
  phases/30.remove-import-export.md \
  phases/31.problem-context-sidebar-panel.md \
  phases/32.remove-brief-dialog.md \
  phases/33.consolidate-solution-access.md \
  phases/34.remove-practice-exit-control.md \
  phases/35.local-profile-switcher-history.md \
  phases/36.expand-problem-library.md

# ─────────────────────────────────────────────────────────────────
# PHASE GROUP 10 — Marketing homepage + GSAP animations (phase 37 +)
# ─────────────────────────────────────────────────────────────────
commit "feat(phase-37): marketing homepage with GSAP + Lenis smooth scroll

- HomePage: pre-app landing route (App.tsx view-toggle, not a router)
- HeroSection: word-by-word headline, micro-interactive UML diagram,
  floating status badge, ambient glow orbs, noise grain texture,
  traveling-dot edge animation, node hover glow, mousemove parallax
- ProblemStatementSection: A/B cards, animated gradient divider
- FeatureShowcaseSection: numbered tags, alternating slide-in layout
- StatsStripSection: infinite marquee ticker with count-up numbers
- LibraryTeaserSection: staggered card entrance + hover lift
- HomeFooter: gradient CTA + magnetic button effect
- useHomeMotion hook: Lenis + ScrollTrigger proxy, gsap.matchMedia()
  for reduced-motion, clip-path section reveals, quickTo magnetic footer
- All 8 GSAP skills applied (core, timeline, scrolltrigger, performance,
  plugins, react, frameworks, utils)
- Brand renamed: ClassForge → LLDSIM
- ProfileSwitcher moved to header right; Buy me a coffee removed
- Lenis installed (npm install lenis)

Refs: phases/37.homepage-landing-page.md" \
  src/components/home/ \
  src/hooks/useHomeMotion.ts \
  .agents/ \
  phases/37.homepage-landing-page.md

# ─────────────────────────────────────────────────────────────────
# Push all commits to origin in one shot
# ─────────────────────────────────────────────────────────────────
push

echo ""
echo "✨  All 10 phase-commits pushed to https://github.com/anand-242003/LLD_Ease.git"
