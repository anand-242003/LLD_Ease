# ClassForge — Design System
## The single canonical design reference for this codebase

**Status:** Normative. **Authority order for this whole project: `PRD.md` (product truth) → `DESIGN.md` (visual/interaction truth) → `PHASES.md` (build sequence).** If a phase instruction and this file ever disagree on a visual detail, this file wins. If this file and `PRD.md` §19 ever disagree, `PRD.md` wins and this file has a bug — fix this file, not the component.

This document exists so that **no two components in the app are ever styled by eye twice.** Every value a component needs — color, spacing, radius, type, motion, state — is defined exactly once, here, as a token or a recipe. Components consume tokens; they never invent values.

---

## 0. How to use this document

1. Before building **any** visual component, find its recipe in §5. If it isn't there, derive it from §2–§4's tokens and add the recipe to §5 before shipping it — do not hand-pick a color or a padding value.
2. Every component's states (rest / hover / active / selected / disabled / focus / loading) must be implemented. A component that only has a "rest" style is unfinished.
3. `--primary` (teal) is the **only** color allowed to mean "this is active / armed / selected / primary." If you reach for teal to decorate something that isn't in one of those states, stop — that's a violation of §9.
4. Run the **§10 Consistency Audit** against every new screen or component before marking a phase done. This is not optional — `PHASES.md` gates each phase on it.
5. Tokens live in one file: `src/styles/tokens.css`, loaded once in `main.tsx`, never duplicated. Components reference them via CSS variables or the Tailwind config that maps to them (§12). **Never hardcode a hex value, a px spacing value, or a font-family in a component file.**

---

## 1. Design intent (read this before touching colors)

The product is a **dark, low-chroma, information-dense tool**, not a marketing surface. Its entire color budget is spent on **five roles**, applied with total consistency:

| Role | Color | Means |
|---|---|---|
| Primary / active | Teal | "This is on, armed, selected, or the main action." |
| Abstract / warning / monetisation | Amber | "This is abstract, needs attention, or is the donation button." |
| Success / easy | Green | "This is valid, or this is the easy difficulty." |
| Danger / hard | Red | "This destroys something, or this is the hard difficulty." |
| Everything else | Greyscale | Structure, chrome, text. |

Everything not listed above is achromatic. **If a new component needs a sixth color, that is a design decision, not an implementation detail — flag it rather than picking one.**

Typography carries a second, equally strict signal: **monospace = this is the user's model (class names, code, model text); sans = this is the tool's chrome (buttons, labels, prose).** Never mix these.

---

## 2. Design tokens — canonical CSS variables

Create `src/styles/tokens.css` with **exactly** this content (this is not a starting point — copy it verbatim, then extend only by adding new tokens beneath the relevant block, never by editing an existing value without updating this file first):

```css
:root {
  color-scheme: dark;

  /* ── Surfaces (dark, low-chroma stack, each one step lighter) ── */
  --canvas:        #0A0A0B;
  --bg:             #0E0E10;
  --surface-1:      #131316;   /* header, sidebar, right panel      */
  --surface-2:      #17171A;   /* palette rows, inputs, issue rows  */
  --surface-3:      #1C1C20;   /* node body, cards, modal           */
  --surface-4:      #242429;   /* node header band, active tab      */
  --surface-hover:  #2A2A2F;   /* generic hover lightening          */

  /* ── Borders ── */
  --border:         #2A2A2F;
  --border-strong:  #35353C;
  --grid-dot:       #26262B;

  /* ── Text ── */
  --text:           #E9E9EC;
  --text-muted:     #8A8A93;
  --text-faint:     #5E5E67;

  /* ── Primary (teal) — the ONLY "active/selected/primary" color ── */
  --primary:        #22C7C7;
  --primary-hover:  #2ADADA;
  --primary-fg:     #04292B;   /* text/icon ON a teal fill          */
  --primary-soft:   rgba(34,199,199,0.12);
  --primary-ring:   rgba(34,199,199,0.35);

  /* ── Semantic ── */
  --success:        #34D399;
  --success-soft:   rgba(52,211,153,0.12);
  --warning:        #F59E0B;
  --warning-soft:   rgba(245,158,11,0.12);
  --danger:         #EF4444;
  --danger-soft:    rgba(239,68,68,0.12);
  --accent:         #FBBF24;   /* donation button only               */

  /* ── Class-kind colors (palette dots + node stereotypes) ── */
  --kind-class:      #9CA3AF;
  --kind-abstract:   #F59E0B;
  --kind-interface:  #7DD3FC;
  --kind-enum:       #2DD4BF;
  --kind-record:     #34D399;

  /* ── Ink palette (5) ── */
  --ink-cyan:    #22D3EE;
  --ink-red:     #F43F5E;   /* exact — printed in-product */
  --ink-amber:   #FBBF24;
  --ink-purple:  #A78BFA;
  --ink-white:   #F8FAFC;

  /* ── Sticky-note palette (7) ── */
  --sticky-white:   #F8FAFC;
  --sticky-red:     #FCA5A5;
  --sticky-orange:  #FDBA74;
  --sticky-green:   #86EFAC;
  --sticky-teal:    #5EEAD4;
  --sticky-purple:  #C4B5FD;
  --sticky-pink:    #F9A8D4;
  --sticky-default: #FDE047;

  /* ── Typography ── */
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;

  /* ── Spacing scale (4px base) ── */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-5: 20px; --sp-6: 24px; --sp-8: 32px; --sp-10: 40px;

  /* ── Radius scale ── */
  --r-sm: 6px;  --r-md: 10px; --r-lg: 14px; --r-xl: 16px; --r-full: 9999px;

  /* ── Elevation (shadows — used sparingly, see §4) ── */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.35);
  --shadow-md: 0 8px 24px rgba(0,0,0,0.45);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.55);

  /* ── Motion ── */
  --ease-out:      cubic-bezier(0.2, 0, 0, 1);
  --dur-fast:      120ms;
  --dur-base:      180ms;
  --dur-modal:     220ms;

  /* ── Layout constants ── */
  --header-h:      56px;
  --palette-w:     265px;
  --panel-w:       510px;
  --panel-w-lg:    420px;  /* laptop breakpoint, §26 */
  --tabbar-h:      44px;
}
```

**Rule:** components import nothing else for color/spacing/type/motion. If Tailwind is used, map `tailwind.config.ts` `theme.extend` directly onto these variables (e.g. `colors.primary = 'var(--primary)'`) so utility classes and raw CSS never drift apart.

---

## 3. Typography

| Token | Family | Size | Weight | Tracking | Line-height | Used for |
|---|---|---|---|---|---|---|
| `display` | sans | 22px | 700 | −0.01em | 1.3 | Modal title |
| `h1` | sans | 20px | 600 | −0.01em | 1.3 | Problem card title |
| `h2` | sans | 17px | 600 | normal | 1.4 | Brand wordmark, practice title |
| `body` | sans | 15px | 400 | normal | 1.5 | Buttons, form labels, descriptions |
| `body-sm` | sans | 14px | 400 | normal | 1.5 | Card copy, helper text |
| `label` | sans | 11px | 600 | 0.08em UPPER | 1.4 | Section labels |
| `badge` | sans | 10.5px | 700 | 0.06em UPPER | 1 | `REF`, `MEDIUM`, `PRACTICE` |
| `caption` | sans | 12px | 400 | normal | 1.4 | "saved automatically", multiplicities |
| `mono-node` | mono | 13–15px | 400/700 | normal | 1.4 | Node names/members |
| `mono-code` | mono | 14px | 400 | normal | 1.6 | Code panel |
| `mono-stat` | mono | 13px | 400 | normal | 1.4 | "15 classes · 13 relationships" |

**The mono/sans rule, stated as a lint you must self-enforce:** if the text is *content the user authored into the model* (class name, attribute, method, generated code, scratch notes, stat counts) → `--font-mono`. If it's *chrome the app itself is saying* (button labels, section headers, dialog copy, error messages) → `--font-sans`. There is no third category.

---

## 4. Spacing, radius, elevation

- **Density:** comfortable, never cramped. Palette rows: 46px tall, 14px horizontal padding. Inspector field groups: 20px vertical gap. Modal: 28px padding, 24px grid gap.
- **Radius 10 (`--r-md`) is the signature value** — buttons, inputs, palette rows, nodes, issue rows, cards all use it. `--r-sm` (6px) is reserved for chips/badges. `--r-lg`/`--r-xl` only for cards and the modal. `--r-full` only for pills, dots, and badges.
- **Elevation is nearly flat.** Depth comes from `--surface-N` lightness stepping, not shadows. Only three things ever cast a shadow: the modal (`--shadow-lg`), dropdown menus (`--shadow-md`), floating canvas toolbars (`--shadow-sm`). A `ClassNode` never has a shadow — only a border.
- **Borders are 1px everywhere.** 2px is reserved exclusively for: the active-tab underline, and a selected node/edge's ring.

---

## 5. Component recipes

Each recipe is the **complete** spec for that component — build it once, reuse it everywhere it appears in PRD.md.

### 5.1 Button
```
Base:      height 38px, padding 0 16px, radius var(--r-md), font body,
           display flex, align-items center, gap 8px, transition var(--dur-fast) var(--ease-out)
Primary:   bg var(--primary), color var(--primary-fg)
           hover: bg var(--primary-hover)   active: translateY(1px)
Secondary: bg var(--surface-2), border 1px var(--border), color var(--text)
           hover: bg var(--surface-3)       active: translateY(1px)
Accent:    bg var(--accent), color #201400  (Buy me a coffee only)
Outline:   bg transparent, border 1px var(--primary), color var(--primary)
           hover: bg var(--primary-soft)
Danger:    bg transparent, border 1px var(--danger), color var(--danger)
           hover: bg var(--danger-soft)
Disabled (ALL variants): opacity 0.4, cursor not-allowed, pointer-events none, no hover/active
Focus (ALL variants):    outline 2px var(--primary), outline-offset 2px
```

### 5.2 Input / Select / Textarea
```
bg var(--surface-2), border 1px var(--border), radius var(--r-md),
height 38px (text/select) or auto (textarea, min 3 rows), padding 0 12px,
font body, color var(--text), placeholder color var(--text-faint)
hover:  border-color var(--border-strong)
focus:  border-color var(--primary), box-shadow 0 0 0 3px var(--primary-ring)
disabled/readonly: opacity 0.6, bg var(--surface-1), cursor not-allowed
```

### 5.3 Palette row (`PaletteRow`)
```
width 100%, height 46px, radius var(--r-md), padding 0 14px, gap 12px,
bg var(--surface-2), border 1px var(--border), font body
rest:     as above
hover:    bg var(--surface-3)
armed:    border-color var(--primary), color var(--primary),
          box-shadow 0 0 0 1px var(--primary) inset, bg var(--primary-soft)
dragging: opacity 0.6
disabled: opacity 0.4, cursor not-allowed
```
At most one `PaletteRow` across BOTH the kind group and the relationship group may be `armed` at once — this is a state-machine rule (PRD §12.2), not a style choice, but it must be visually obvious: only the armed row ever shows teal.

### 5.4 Tab (right-panel tabs, document tabs)
```
Right-panel tab:  padding 0 16px, height var(--tabbar-h), font body
  inactive: color var(--text-muted)
  hover:    color var(--text)
  active:   color var(--primary), border-bottom 2px solid var(--primary)
Document tab (editable, "My Design"):
  active:   bg var(--surface-4), color var(--text), radius var(--r-sm), padding 8px 14px
Document tab (reference):
  bg transparent, color var(--text-muted), lock icon + title + REF badge + × 
  hover: color var(--text)
```

### 5.5 Pill (exclusive) and Chip (independent toggle)
```
height 30px, padding 0 14px, radius var(--r-full) [pill] or var(--r-sm) [chip], font body-sm
off:  bg transparent, border 1px var(--border), color var(--text-muted)
hover: border-color var(--border-strong)
on:   bg var(--primary), color var(--primary-fg), border-color var(--primary)
```
Pills are **mutually exclusive** (language selector). Chips are **independent** (codegen options) — never let a chip group behave like radio buttons.

### 5.6 Badge
```
height 20px, padding 0 8px, radius var(--r-full), font badge
REF:      bg var(--primary-soft), color var(--primary)
EASY:     bg var(--success), color #04231A
MEDIUM:   bg var(--warning), color #2B1900
HARD:     bg var(--danger), color #2B0808
count(0): bg var(--surface-3), color var(--text-muted)
count(>0):bg var(--success-soft), color var(--success)
```

### 5.7 Card (`ProblemCard`)
```
bg var(--surface-3), border 1px var(--border), radius var(--r-lg), padding 24px, min-height 360px
hover: border-color var(--primary) at 40% opacity — a hint, not a full teal border
```

### 5.8 Modal (`Modal`)
```
Scrim:   fixed inset-0, bg rgba(0,0,0,0.55), backdrop click closes
Panel:   bg var(--surface-3) [technically --bg with a --surface-1 header], border 1px var(--border),
         radius var(--r-xl), shadow var(--shadow-lg), width 72vw (max 1240px), height 88vh
Header:  padding 24px 28px, border-bottom 1px var(--border), title=display, subtitle=body-sm muted
Enter:   opacity 0→1 + scale 0.98→1, var(--dur-modal) var(--ease-out); scrim fades in parallel
Close:   36px square, border 1px var(--border), radius var(--r-md), icon ×, top-right of header
```

### 5.9 Toast
```
position fixed, bottom 24px, centered or bottom-right, radius var(--r-md), padding 12px 16px,
shadow var(--shadow-md), font body-sm, max-width 360px
success: border-left 3px var(--success)
error:   border-left 3px var(--danger)
info:    border-left 3px var(--primary)
enter/exit: translateY(8px)+opacity, var(--dur-base) var(--ease-out)
auto-dismiss: 4s (success/info), manual-dismiss required (error)
```

### 5.10 ClassNode surface
```
bg var(--surface-3), border 1px var(--border), radius var(--r-md), min-width 200px, font mono-node
header band: bg var(--surface-4), padding 10px 14px, text-align center
  stereotype line (abstract/interface/enum only): italic, 11px, centered,
     color = --kind-abstract | --kind-interface | --kind-enum per kind
  name: 15px 700, centered; italic when kind is ABSTRACT or INTERFACE
compartments: padding 10px 14px, divided by 1px var(--border)
  attribute/method line: color var(--text), visibility sign var(--text-muted), type var(--text-muted)
  empty compartment: italic var(--text-faint) "no attributes" / "no operations"
selected: border 2px var(--primary), box-shadow 0 0 0 4px var(--primary-ring)
handle:   10px circle, bg var(--primary), positioned at left/right mid-edge
```

### 5.11 Edge
```
stroke var(--border-strong), 1.5px, hit-area 12px invisible stroke for selection
selected: stroke var(--primary), 2px
Inherit:   solid,  marker = hollow triangle at target
Realize:   dashed, marker = hollow triangle at target
Compose:   solid,  marker = filled diamond at source
Aggregate: solid,  marker = hollow diamond at source
Associate: solid,  marker = open arrow at target
Depend:    dashed, marker = open arrow at target
label chip: bg var(--surface-2), border 1px var(--border), radius var(--r-sm), padding 2px 6px,
            font caption mono, positioned at edge midpoint
```

### 5.12 Tooltip
```
bg var(--surface-4), border 1px var(--border), radius var(--r-sm), padding 6px 10px,
font caption, shadow var(--shadow-sm), appears after 400ms hover, mono when showing a hex/value
```

---

## 6. Iconography

- Style: 1.5px stroke, line icons (Lucide is the reference set — use it directly).
- Sizes: 18px in buttons and palette rows, 16px in menus/badges, 20px in the floating canvas toolbars.
- Icons never appear without an accessible name (`aria-label` when unlabeled, otherwise pair with visible text).
- Never mix icon styles (no filled icons alongside line icons).

---

## 7. Motion

- Hover/color transitions: `var(--dur-fast) var(--ease-out)`.
- Panel/dropdown entry: `var(--dur-base) var(--ease-out)`.
- Modal entry: `var(--dur-modal) var(--ease-out)`, scale 0.98→1 + scrim fade in parallel.
- **Never animate** canvas pan/zoom or node drag — these track the pointer 1:1, no easing, no lag.
- Respect `prefers-reduced-motion: reduce` — when set, collapse all durations to 1ms rather than removing the transition property (keeps event ordering identical).

---

## 8. Accessibility rules baked into the design

- Every focusable element gets the exact `--primary` focus ring from §5.1 — never `outline: none` without an explicit replacement.
- Minimum touch target 44×44px on `(pointer: coarse)` devices, even where the desktop target is visually smaller (pad hit-area, don't enlarge the visual).
- Text/background pairs must hit WCAG AA (4.5:1 body, 3:1 large/label). `--text-muted` (`#8A8A93`) on `--surface-1` (`#131316`) is the closest pairing to the line — verify it, don't assume.
- Color is **never** the only signal: difficulty badges carry text, not just color; issue severity pairs a dot with wording; read-only state pairs a lock icon **and** a `REF` badge **and** a text suffix.

---

## 9. The one-accent rule (re-stated because it is the most-violated rule in UIs like this)

Before shipping any component, ask: **"Does this use teal to mean anything other than 'active, armed, selected, or primary action'?"** If yes, change it. Teal is not a brand accent to sprinkle for visual interest — it is a **state signal**. The moment teal appears on something at rest, the user's ability to scan the screen for "what's currently on" breaks.

---

## 10. UI Consistency Audit Checklist

Run this against **every** screen or component before a phase is marked done (`PHASES.md` references this checklist by name — "Run the DESIGN.md Consistency Audit").

- [ ] No hardcoded hex/px/font values in the component — everything traces to a token in §2.
- [ ] All interactive elements have rest / hover / active / focus states; anything that can be disabled has a disabled state.
- [ ] Teal appears **only** on active/armed/selected/primary elements — nowhere else.
- [ ] Model content (names, members, code, stats) is monospace; chrome text is sans — no exceptions.
- [ ] Radius is `--r-md` (10px) unless the component is explicitly a chip/badge/dot (`--r-sm`/`--r-full`) or a card/modal (`--r-lg`/`--r-xl`).
- [ ] No new shadow was introduced outside the three sanctioned uses (modal, dropdown, floating toolbar).
- [ ] Spacing uses the `--sp-*` scale — no arbitrary `padding: 13px` style values.
- [ ] Buttons use one of the five defined variants (§5.1) — no bespoke button style.
- [ ] Every icon-only control has an `aria-label`.
- [ ] Focus rings are visible and consistent with §5.1/§8.
- [ ] Destructive actions (Clear, Delete class, overwrite via Sample/Import/Practice) use the Danger button style and require confirmation per PRD §14-BR31.
- [ ] The component behaves identically in light of the fact that this app is **dark-only** — no accidental light-mode fallback from an unstyled native control (style `<select>`, checkboxes, scrollbars explicitly).
- [ ] Empty/loading/error states exist and use `EmptyState`/`Toast`/skeleton conventions, not ad-hoc blank space.

---

## 11. Anti-patterns — do not do these

- ❌ Picking a "close enough" color instead of the token (`#20c0c0` instead of `var(--primary)`).
- ❌ Using teal for a hover state on a non-interactive or non-primary element.
- ❌ Adding a new font family, weight, or size not listed in §3.
- ❌ Giving a `ClassNode` a drop shadow "to make it pop."
- ❌ A button that isn't one of the five §5.1 variants.
- ❌ An inline `style={{ padding: '13px' }}` instead of a spacing token.
- ❌ Skipping the disabled state because "it's rare."
- ❌ A modal that doesn't trap focus or restore it on close.
- ❌ A chip group that behaves like a radio group (or vice versa) — chips are independent, pills are exclusive; never confuse the two.

---

## 12. File placement and enforcement

- `src/styles/tokens.css` — the file in §2, imported once in `src/main.tsx`, before any component CSS.
- If Tailwind is used, `tailwind.config.ts` must map every color/spacing/radius utility to these CSS variables (`theme.extend.colors.primary = 'var(--primary)'`, etc.) so `bg-primary` and `var(--primary)` are always the same pixel.
- `src/components/ui/` holds the primitive recipes of §5 (`Button`, `Input`, `Badge`, `Pill`, `Chip`, `Modal`, `Toast`, `Tooltip`) as the **only** place these are implemented. No feature component re-implements a button.
- Any new token must be added to §2 of this file in the same change that introduces it — a token that exists only in one component's CSS is a bug.

---

## 13. Post-launch additions (`PHASES.md` §0.9, Phases 30–37)

The three recipes below (§13.1–§13.3) exist because `PHASES.md` §0.9's second wave introduces UI with no §5 recipe yet. Same rule as §0 applies: build against these, don't hand-pick values. §13.4 is the one deliberate, scoped exception to this document's dark-tool-not-a-marketing-surface stance.

### 13.1 Problem Context Panel (`PaletteSidebar`, Phase 31)

A new persistent block at the **top** of `PaletteSidebar`, above the `ADD CLASS` section, rendered only when a problem is in scope (an active Practice session, or the active document is a Reference tab). Collapses to nothing (zero height, no reserved space) otherwise — it must never show a "no problem" empty state, since the ordinary My Design canvas with no problem in scope is the common case.

```
Container:  width 100% (fills the 265px palette column), bg var(--surface-2), border 1px var(--border),
            radius var(--r-md), padding var(--sp-4), margin-bottom var(--sp-4), display flex, flex-direction column, gap var(--sp-2)
Header row: difficulty badge (§5.6) left, problem title right-aligned truncation not needed here (own line below instead)
Title:      font h2, color var(--text), 2-line clamp with ellipsis
Patterns:   font body-sm, color var(--primary) (reuses the ProblemCard pattern-tag treatment, §5.7), middle-dot joined
Description: font body-sm, color var(--text-muted), 3-line clamp, "Show more" inline text button (font body-sm, color var(--primary), no background) expands to full text in place — no modal
Requirements: shown only when expanded; a plain unordered list, font body-sm, var(--text-muted), square/dash markers per PRD.md §9.1 card anatomy
Footer:     one PaletteRow-styled action, full width, label "View reference solution" (Phase 33) — same visual recipe as §5.3 but semantically a navigation action, not a tool-arm; disabled + tooltip-explained when the problem has no reference diagram
```

**States:** rest as above. **Loading:** not applicable (bundled static data, synchronous). **Reduced-motion respecting expand/collapse:** height auto-animates `var(--dur-base) var(--ease-out)`, collapses to 1ms under `prefers-reduced-motion: reduce` per §7.

### 13.2 Profile Switcher (Phase 35)

A control in the `AppHeader`, left of `LLD Problems`, since profile identity is the most global piece of state in the app (it scopes which submission history is visible).

```
Trigger:    ToolbarButton, variant secondary (§5.1/C3), icon = a simple circle-with-initial glyph (no photo, no external avatar service — see Phase 35 for why), label = the active profile's name, chevron-down 16px
Menu:       DropdownMenu (§C4 in PRD.md §11 component table), shadow var(--shadow-md), radius var(--r-md), same recipe as the Export dropdown it replaces in visual weight
Menu items: one row per existing profile (name + a small count badge of that profile's total attempts, badge recipe from §5.6 "count" variant), a 1px var(--border) divider, then "+ New profile" as its own row in var(--primary) text, then "Rename…" / "Delete…" as a secondary row only for the active profile
Active row: bg var(--primary-soft), color var(--primary) — this is a selection, so teal is correctly used per §9
New-profile input: inline text Input (§5.2) replacing the trigger label temporarily, Enter commits, Escape cancels
Delete confirm: uses the shared ConfirmDialog (Phase 29's polish pass), Danger button variant, copy states plainly that history for that profile is deleted, not "hidden"
```

**Acceptance:** switching profiles never touches `documents`/canvas state (§13.2 is a pure `attempts`/history scope switch, not a workspace switch) — see Phase 35 for the exact data-shape reasoning.

### 13.3 Motion additions to §7 (GSAP-scoped)

§7's existing CSS-transition rules are unchanged and remain the default for every in-app interaction (hover, panel switch, modal, toast). GSAP is introduced **only** where CSS transitions/keyframes cannot express the effect reasonably (scroll-driven scrubbing/pinning on the Phase 37 homepage, and coordinated multi-element reveal sequences). Rules:
- GSAP-driven animation is **scoped to the homepage route** (§13.4) by default. Do not reach for GSAP inside the app shell (canvas, panels, modals) where a CSS transition already does the job — that would violate the "don't animate what tracks the pointer" and "keep the tool boring" intents of §7/§1.
- Any GSAP timeline must register a cleanup (`gsap.context()` / revert on unmount) — no leaked ScrollTriggers across a client-side route change.
- `prefers-reduced-motion: reduce` disables GSAP scrubbing/pinning entirely (render the end state, no animation), same intent as §7's "collapse to 1ms" rule, not merely a shorter duration.
- The one place GSAP may reasonably touch the app shell is a **single, subtle** entrance animation the first time the app shell mounts after arriving from the homepage (Phase 37) — everything else inside the app stays exactly as specified in §7.

### 13.4 Marketing Homepage — the scoped exception to §1

`DESIGN.md` §1 says this product is "a dark, low-chroma, information-dense tool, not a marketing surface." The Phase 37 homepage is the **one deliberate exception**: a pre-app landing route allowed a more expressive, editorial layout (large type, generous whitespace, imagery/diagram illustrations, scroll-driven motion) in service of explaining the product to a first-time visitor — see the Phase 37 file for the full spec. It still **must**:
- Reuse the exact color tokens from §2 (teal primary, the same dark surface stack) — brand consistency, not a new palette.
- Reuse `--font-sans`/`--font-mono` from §3 with the same mono/sans content-vs-chrome rule (product screenshots/diagrams shown on the homepage are mono; marketing copy is sans).
- Never introduce authentication, signup, or payment UI (still no accounts, per `PRD.md` §3.2/N1).
- Transition into the real app shell via a same-tab client-side route change, not a full page reload, so the app's `localStorage` state is unaffected.

---

*End of DESIGN.md.*
