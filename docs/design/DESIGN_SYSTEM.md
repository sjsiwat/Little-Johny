# DESIGN_SYSTEM.md
# JohnyMemo — Extracted Design Language & Principles
> Derived from: DashStack Admin UI Kit · Nextcent Landing Page · Notion Library · Widgets & Cards Kit
> Purpose: Redesign JohnyMemo with a coherent, professional design language

---

## 1. Design Philosophy

### Core Principle: Clarity through Restraint
The references collectively establish a **"functional minimalism"** philosophy — every visual element earns its place by reducing cognitive load, not adding decoration. The design language is:

- **Data-first**: UI surfaces exist to surface information, not to impress
- **Spatial breathing**: Generous whitespace is the primary luxury
- **Progressive disclosure**: Complex information is layered — summary cards first, detail on demand
- **Trust through consistency**: Predictable patterns, not clever one-offs
- **System-thinking**: Components are atoms that compose into molecules; molecules into organisms

### Tone
Professional but approachable. Clean lines, soft shadows, restrained color. The visual weight sits in the *content*, not the chrome around it.

---

## 2. Layout System

### Macro Structure (from DashStack)
```
┌─────────────────────────────────────────────────┐
│  Topbar (60px fixed)                            │
├────────────┬────────────────────────────────────┤
│            │                                    │
│  Sidebar   │  Main Content Area                 │
│  (240px)   │  (fluid)                           │
│            │                                    │
│            │                                    │
└────────────┴────────────────────────────────────┘
```

### Sidebar Collapsed State
- Icon-only: 64px wide
- Expanded: 240px wide
- Transition: smooth slide, 200ms ease-out
- Active state: filled accent background on nav item

### Content Area
- Max content width: 1200px centered
- Content padding: 24px (desktop), 16px (tablet), 12px (mobile)
- Section spacing: 32px between major sections

### Mobile
- Sidebar becomes bottom navigation (5 items max) or hamburger overlay
- Cards stack to full-width single column
- Topbar simplifies to logo + hamburger + avatar

---

## 3. Grid System

### Desktop Grid (from widget kit analysis)
- Columns: 12-column grid
- Gutter: 24px
- Margin: 24px

### Common Column Spans
| Component | Columns |
|---|---|
| Stat card (4-up row) | 3 col each |
| Stat card (3-up row) | 4 col each |
| Main chart | 8 col |
| Side panel / list | 4 col |
| Full-width section | 12 col |
| Form field (half) | 6 col |
| Form field (third) | 4 col |

### Tablet (768–1024px)
- Shift to 8-column grid
- Stat cards: 4 col (2 per row)
- Charts: full width

### Mobile (<768px)
- Single column
- All cards: full width
- All charts: full width, height reduced

---

## 4. Spacing Scale

### Base unit: 4px

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Icon internal gap, tag internal padding |
| `space-2` | 8px | Inline element gap, tight padding |
| `space-3` | 12px | Component internal padding (compact) |
| `space-4` | 16px | Default component padding, list item height |
| `space-5` | 20px | Card padding (compact) |
| `space-6` | 24px | Card padding (default), section gap |
| `space-8` | 32px | Between card rows, section top padding |
| `space-10` | 40px | Large section spacing |
| `space-12` | 48px | Hero/page-level spacing |
| `space-16` | 64px | Major layout divisions |

### Application Rules
- **Within a component**: use space-2 to space-4
- **Between related components**: space-4 to space-6
- **Between sections**: space-8 to space-12
- **Never use odd spacing values** — everything is a multiple of 4

---

## 5. Typography Scale

### Sourced from: Nextcent landing page system + DashStack admin

### Type Roles
```
Display     — 40–64px, Semi-bold (600) — Hero headlines only
H1          — 36px, Semi-bold (600)
H2          — 28px, Semi-bold (600)
H3          — 20px, Semi-bold (600)
H4          — 16px, Medium (500)
Body Large  — 18px, Regular (400), line-height 28px
Body Base   — 16px, Regular (400), line-height 24px
Body Small  — 14px, Regular (400), line-height 20px
Caption     — 12px, Regular (400), line-height 16px
Label       — 12px, Medium (500), letter-spacing +0.3px — form labels, tags
Stat Number — 28–40px, Semi-bold (600) — KPI cards
```

### Font Stack
- **Primary (UI)**: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  - Reason: Inter is engineered for screen readability, used pervasively in modern dashboards
- **Mono (code/data)**: `'JetBrains Mono', 'Fira Code', monospace`
  - Used for IDs, timestamps, code snippets only

### Rules
- **Never use more than 2 font weights per view**
- Body text: always 400 or 500, never 600+
- Headings: 600 only
- Line-height: always 1.4–1.6× font-size
- Max line length: 72 characters (640px at 16px)

---

## 6. Border Radius

### Scale
| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Badges, tags, input fields, table row highlights |
| `radius-md` | 8px | Buttons, dropdown items, tooltips |
| `radius-lg` | 12px | Cards, modal dialogs, panels |
| `radius-xl` | 16px | Large feature cards, hero sections |
| `radius-full` | 9999px | Avatars, status dots, pill buttons |

### Rules
- Cards always use `radius-lg` (12px)
- Buttons always use `radius-md` (8px)
- Inputs always use `radius-sm` (6px) — a slightly softer 4px variant
- **Consistency rule**: all cards on the same surface share the same radius
- Never mix `radius-xl` and `radius-sm` in the same card

---

## 7. Shadow System

### Sourced directly from: Nextcent effects page (#ABBED1 shadow system)

| Token | Value | Usage |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(171,190,209,0.60)` | Hover lift on interactive rows |
| `shadow-sm` | `0 2px 4px rgba(171,190,209,0.40)` | Cards at rest (default) |
| `shadow-md` | `0 4px 6px rgba(171,190,209,0.30)` | Elevated cards, dropdowns |
| `shadow-lg` | `0 8px 16px rgba(171,190,209,0.40)` | Modals, popovers |
| `shadow-xl` | `0 16px 32px rgba(171,190,209,0.30)` | Floating action buttons |

### Rules
- **Cards rest at `shadow-sm`**, lift to `shadow-md` on hover
- No shadows on flat backgrounds or sidebar
- Modals always use `shadow-lg`
- Never use black-tinted shadows — always use the blue-grey tint (`#ABBED1`) as the shadow color
- Shadow direction: always downward (no inner shadows on cards)
- **Dark mode**: reduce shadow opacity by 50%, or remove entirely (use border instead)

---

## 8. Color System

### Sourced from: Nextcent color system + DashStack + adapted for JohnyMemo's blue identity

### Neutral Scale
| Token | Hex | Usage |
|---|---|---|
| `neutral-900` | `#263238` | Primary text, sidebar icons active |
| `neutral-700` | `#4D4D4D` | Secondary text, labels |
| `neutral-500` | `#717171` | Tertiary text, placeholders |
| `neutral-400` | `#89939E` | Disabled text, captions |
| `neutral-300` | `#ABBED1` | Borders, dividers, shadow tint |
| `neutral-100` | `#F5F7FA` | Page background, input background |
| `neutral-000` | `#FFFFFF` | Card surfaces, modal backgrounds |

### Brand Colors (Adapted for JohnyMemo blue identity)
| Token | Hex | Usage |
|---|---|---|
| `brand-500` | `#3B82F6` | Primary actions, active nav, links |
| `brand-600` | `#2563EB` | Button hover, pressed state |
| `brand-400` | `#60A5FA` | Brand tint, chart accents |
| `brand-100` | `#EFF6FF` | Subtle brand backgrounds, tag bg |
| `brand-50` | `#F0F7FF` | Active nav item background |

### Semantic Colors
| Token | Hex | Usage |
|---|---|---|
| `success-500` | `#22C55E` | Positive trends, completion, income |
| `success-100` | `#DCFCE7` | Success background badges |
| `warning-500` | `#EAB308` | Caution states, pending items |
| `warning-100` | `#FEF9C3` | Warning background badges |
| `error-500` | `#EF4444` | Negative trends, errors, deletions |
| `error-100` | `#FEE2E2` | Error background badges |
| `info-500` | `#3B82F6` | Informational states |
| `info-100` | `#EFF6FF` | Info background badges |

### Trend Indicators (from widget kit)
- Positive delta: `success-500` with `↑` arrow
- Negative delta: `error-500` with `↓` arrow
- Neutral: `neutral-400`

### Color Rules
- **Max 3 colors per component** (background + text + accent)
- Never use raw color values in components — always use tokens
- Semantic colors are only for meaning, not decoration
- Brand color is used sparingly: primary buttons, active states, key data points
- **Dark mode strategy**: invert neutral scale (900↔100), keep semantic colors, desaturate brand slightly

---

## 9. Navigation Patterns

### Primary: Left Sidebar (Desktop)

**Structure:**
```
[Logo / Brand]           ← 56px header
[Search bar]             ← optional

[Section Label]          ← uppercase, 11px, letter-spacing +1px, neutral-400
  ● Dashboard            ← active: brand-50 bg, brand-500 icon+text, 3px left accent bar
  ○ Tasks
  ○ Notes
  ○ Expenses

[Section Label]
  ○ Settings
  ○ Profile
```

**Interaction States:**
- Default: icon neutral-500, text neutral-700, no background
- Hover: neutral-100 background, icon brand-400
- Active: brand-50 background, brand-500 text+icon, left border accent (3px solid brand-500)
- Collapsed: icon only (24px), tooltip on hover

**Topbar (always visible):**
```
[Hamburger]  [Page title]  ————————  [Search] [Notifications] [Avatar + Name]
```
- Height: 60px
- Border-bottom: 1px solid neutral-300
- Background: white (light), neutral-900 (dark)

### Mobile Navigation
- Bottom tab bar: max 5 icons
- Icons: 24px, labels: 10px below
- Active: brand-500 filled icon

---

## 10. Card Patterns

### Stat Card (KPI)
```
┌────────────────────────────────┐
│  Label text (neutral-400, 13px)│  Icon (40px circle, brand-100 bg)
│  Big Number (32px, 700)        │  [icon in brand-500]
│  ↑ 8.5% up from yesterday      │
└────────────────────────────────┘
```
- Padding: 20px
- Shadow: `shadow-sm`
- Radius: `radius-lg`
- Trend line: 12px text, success-500 or error-500
- Icon: right-aligned, 40×40 circle

### Content Card
```
┌────────────────────────────────┐
│  Title (H4)         [action]   │
│  ─────────────────────────     │
│  [content area]                │
└────────────────────────────────┘
```
- Padding: 24px
- Header divider: 1px solid neutral-100
- Action: text button or icon button, right-aligned

### List Card (Tasks/Notes)
```
┌────────────────────────────────┐
│  [checkbox/icon] Title   [tag] │  ← row: 48px min-height
│  Subtitle / metadata           │
│  ─────────────────────────     │
│  [checkbox/icon] Title   [tag] │
└────────────────────────────────┘
```
- Row hover: neutral-50 background
- Selected row: brand-50 background
- Divider: 1px neutral-100 (not full-width — inset 16px left)

### Product/Item Card (from widget kit)
- Always has: image area, title, subtitle, price/value, action
- Hover: lift with `shadow-md`, slight scale(1.01) transform
- Image: fixed aspect ratio (1:1 or 4:3), object-fit cover

---

## 11. Form Patterns

### Input Fields
```
[Label — 12px, medium, neutral-700]
┌──────────────────────────────┐
│  Placeholder or value        │  ← 40px height, 12px horizontal padding
└──────────────────────────────┘
[Helper text — 12px, neutral-400]
```
- Border: 1px solid neutral-300 (rest)
- Border focus: 2px solid brand-500, no shadow
- Border error: 1px solid error-500
- Background: neutral-100 (rest), white (focus)
- Radius: 6px (`radius-sm` variant)
- Label always above, never placeholder-as-label

### Form Layout
- Full-width fields for primary inputs (name, content, amount)
- Half-width fields on desktop for pairs (date + category)
- Form sections separated by 24px gap
- Submit button: right-aligned or full-width (mobile)

### Button Hierarchy (from Nextcent button system)
| Variant | Usage | Style |
|---|---|---|
| Primary | Main CTA, submit, confirm | brand-500 fill, white text |
| Secondary | Cancel, secondary action | white fill, brand-500 border+text |
| Tertiary | Destructive, ghost actions | transparent, neutral-700 text |
| Danger | Delete, irreversible | error-500 fill, white text |
| Link | Navigation, inline actions | no border, brand-500 text, underline on hover |

**Button sizing:**
- Large: 48px height, 20–24px padding, 16px text
- Default: 40px height, 16–20px padding, 14px text
- Small: 32px height, 12–16px padding, 12px text

---

## 12. Empty State Patterns

### Anatomy
```
        [Illustration — 120px]
        
   Nothing here yet
   [Subtitle explaining why + what to do]
   
   [Primary CTA button]
```

- Illustration: simple SVG, monochrome or brand-tinted, no detail
- Title: H3, neutral-700
- Subtitle: Body Small, neutral-400, max 2 lines
- CTA: Primary button
- Container: centered, min-height 240px

### Variants
- **No data**: empty chart/list placeholder
- **Search no results**: magnifying glass icon, offer to clear filters
- **First-time**: onboarding-flavored, more enthusiastic tone
- **Error state**: warning icon, retry action

---

## 13. Dashboard Patterns

### Page Anatomy (from DashStack)
```
[Page Title H2]                           [Date / Filter / Action]
────────────────────────────────────────────────────────────────
[Stat Card] [Stat Card] [Stat Card] [Stat Card]   ← 4-col KPI row

[Large Chart Card — 8col]   [Summary/List Card — 4col]

[Table / Detail Section — full width]
```

### Dashboard Rules
1. KPI cards always first — give the number before the detail
2. Primary chart is the largest visual element on the page
3. Tables are below-the-fold — summary cards and charts are above
4. Every chart has a title, a date filter, and a legend
5. Loading states: skeleton placeholders (not spinners) for card content
6. Real-time data: pulse animation on stat numbers, subtle

### Chart Conventions (from widget kit)
- Line charts: single or dual line, filled area at 10% opacity
- Bar charts: brand-400 bars, hover highlight brand-500
- Donut charts: brand-500 primary segment, neutral-200 background ring
- All charts: grid lines neutral-100, axis labels caption size

---

## 14. Interaction Patterns

### Hover States
- Cards: shadow escalation + `translateY(-2px)` (2px lift)
- List rows: background neutral-50
- Buttons: 10% darker fill
- Nav items: neutral-100 background, icon color shift
- Links: underline appears, color darkens

### Focus States
- All interactive elements: 2px outline, brand-500, 2px offset
- Never remove focus outlines — they just look different from hover
- Keyboard users get same information as mouse users

### Active / Pressed States
- Buttons: `scale(0.98)`, darker fill
- Cards: shadow decreases (pressed feeling)

### Loading States
- Button: spinner icon replaces label, text hides, width locked (no layout shift)
- Cards: skeleton (grey shimmer) placeholders matching card anatomy
- Full page: top progress bar (2px, brand-500) at page edge

### Notifications / Toasts
- Position: top-right, 16px from edge
- Auto-dismiss: 4s (success), 6s (error), persistent (warning)
- Types: success (green icon), error (red icon), info (blue icon), warning (amber icon)
- Stack: newest on top, max 3 visible

### Modals / Dialogs
- Overlay: `rgba(38,50,56,0.5)` (neutral-900 at 50%)
- Modal: white, radius-xl, shadow-lg, max-width 480–640px
- Animation: fade + `scale(0.96 → 1.0)`, 150ms ease-out
- Dismiss: overlay click, Escape key, explicit close button
- Danger confirmation: modal always required — never inline

---

## 15. Motion Principles

### Philosophy
Motion communicates state change, never decorates. Every animation has a functional reason.

### Timing Scale
| Token | Duration | Curve | Usage |
|---|---|---|---|
| `motion-instant` | 0ms | — | Toggle visibility (no animation) |
| `motion-fast` | 100ms | ease-out | Hover states, button press |
| `motion-base` | 200ms | ease-out | Card hover lift, dropdown open |
| `motion-slow` | 300ms | ease-in-out | Modal enter, sidebar expand |
| `motion-crawl` | 500ms | ease-in-out | Page transitions, chart draw |

### Easing
- **ease-out** for elements entering the viewport (decelerate into place)
- **ease-in** for elements leaving (accelerate away)
- **ease-in-out** for elements moving within the viewport
- Never use linear except for looping animations (spinners)

### What to Animate
✅ Hover lift (shadow + transform)
✅ Button press (scale)
✅ Modal enter/exit (fade + scale)
✅ Sidebar expand/collapse (width)
✅ Tab/state transitions (opacity)
✅ Chart data drawing (stroke-dashoffset)
✅ Number counter animations on KPI cards

### What NOT to Animate
❌ Color changes (instant is fine)
❌ Font weight changes
❌ Background color on page load
❌ Scroll position
❌ Continuous/ambient loops (except loading spinners)

### Reduced Motion
Always respect `prefers-reduced-motion: reduce` — disable all transforms and transitions, keep opacity fades at 50% duration maximum.

---

## Appendix: JohnyMemo-Specific Application Notes

1. **Cat mascot** appears in empty states and onboarding — not in every view
2. **Blue identity** (`#3B82F6`) maps to `brand-500` above — keep all references consistent
3. **Three modules** (Tasks, Notes, Expenses) each get a distinct secondary accent: Tasks → brand-500, Notes → `#8B5CF6` (purple), Expenses → `#22C55E` (green)
4. **Privacy-first** means no social sharing icons, no analytics dashboards — keep UI focused on personal data
5. **PWA** means bottom navigation on mobile is required (installable app pattern)
