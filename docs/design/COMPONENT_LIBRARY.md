# COMPONENT_LIBRARY.md
# JohnyMemo — Component Library Reference
> Derived from design analysis of 4 UI reference systems
> Companion to: DESIGN_SYSTEM.md

---

## Component Taxonomy

```
Atoms          → Tokens applied to single-element primitives
Molecules      → 2–5 atoms combined with a single purpose  
Organisms      → Molecules combined into a functional section
Templates      → Organisms arranged into a page layout
```

---

## ATOMS

### A-01 · Typography Atom

```
Usage classes:
.text-display   — 40px, 600, neutral-900
.text-h1        — 36px, 600, neutral-900
.text-h2        — 28px, 600, neutral-900
.text-h3        — 20px, 600, neutral-900
.text-h4        — 16px, 500, neutral-700
.text-body-lg   — 18px, 400, line-height 28px
.text-body      — 16px, 400, line-height 24px
.text-body-sm   — 14px, 400, line-height 20px
.text-caption   — 12px, 400, neutral-400
.text-label     — 12px, 500, letter-spacing 0.3px, neutral-700
.text-stat      — 32px, 600, neutral-900
.text-mono      — 14px, JetBrains Mono, neutral-700
```

---

### A-02 · Color Dot / Status Indicator

A 8px filled circle indicating status.

```
States: active (success-500), inactive (neutral-300), warning (warning-500), error (error-500)
Usage: next to user names, task states, sync status
```

---

### A-03 · Icon Wrapper

Standardized icon container.

```
Sizes:
  sm  — 16×16px, 1px stroke
  md  — 20×20px, 1.5px stroke (default)
  lg  — 24×24px, 1.5px stroke

Container variants:
  bare      — icon only
  circle-sm — 32px circle, brand-100 bg, brand-500 icon
  circle-md — 40px circle, brand-100 bg, brand-500 icon  (KPI card icon)
  circle-lg — 48px circle
```

---

### A-04 · Badge / Tag

Inline label for categories, states, priorities.

```
Anatomy: [icon?] [text]
Height: 22px
Padding: 4px 8px
Radius: radius-full (pill) or radius-sm (rectangular)
Font: text-label

Variants:
  default  — neutral-100 bg, neutral-700 text
  brand    — brand-100 bg, brand-600 text
  success  — success-100 bg, success-600 text
  warning  — warning-100 bg, warning-600 text
  error    — error-100 bg, error-600 text
  purple   — #EDE9FE bg, #7C3AED text  (Notes module)
```

---

### A-05 · Avatar

```
Sizes: 24px, 32px, 40px, 48px
Shape: radius-full (circle)
Fallback: initials on brand-100 bg, brand-500 text
States: online (status dot bottom-right, success-500)
```

---

### A-06 · Divider

```
Horizontal: 1px solid neutral-100, full width or inset-16px
Vertical: 1px solid neutral-100, 16px height (used in topbar between items)
With label: centered text-caption neutral-400, lines either side
```

---

### A-07 · Skeleton Loader

Matches the shape of the content it replaces.

```
Color: neutral-100
Animation: shimmer (linear-gradient sweep, 1.5s infinite)
Shapes:
  sk-text   — height matching text-body, various widths
  sk-circle — for avatars and icon circles
  sk-rect   — for images, chart areas
  sk-card   — full card skeleton
```

---

## MOLECULES

### M-01 · Button

Sourced from: Nextcent button system + DashStack

```
Variants: primary | secondary | tertiary | danger | link
Sizes: lg (48px) | md (40px, default) | sm (32px)

Anatomy: [icon-left?] [label] [icon-right?]
Icon size always 16px (sm), 20px (md), 20px (lg)
Icon gap: space-2 (8px)

States: default | hover | focus | active | loading | disabled

Loading: spinner replaces left-icon or prepends, label unchanged
Disabled: opacity 0.4, cursor not-allowed, no pointer events

Primary:
  bg brand-500, text white
  hover: bg brand-600
  active: bg brand-700, scale(0.98)
  focus: 2px outline brand-500, 2px offset

Secondary:
  bg white, border 1.5px brand-500, text brand-500
  hover: bg brand-50
  active: bg brand-100

Danger:
  bg error-500, text white
  hover: bg error-600
```

---

### M-02 · Input Field

```
Anatomy:
  [Label]
  [Prepend-icon?] [Input] [Append-icon / action?]
  [Helper text / error message]

Height: 40px
Padding: 0 12px (no icon), 0 12px 0 36px (with left icon)
Radius: 6px
Font: text-body (16px)
Border: 1px solid neutral-300

States:
  rest   — neutral-100 bg, neutral-300 border, neutral-400 placeholder
  focus  — white bg, 2px solid brand-500, neutral-900 text
  filled — white bg, neutral-300 border, neutral-900 text
  error  — white bg, 1px solid error-500, error-500 helper text
  disabled — neutral-50 bg, neutral-100 border, neutral-300 text

Label: text-label (12px, 500), neutral-700, 6px below label to input
Helper: text-caption (12px), neutral-400 or error-500, 4px above
```

---

### M-03 · Select / Dropdown

```
Identical shell to Input Field
Append: chevron-down icon (16px, neutral-400)
Open: dropdown panel below, shadow-md, radius-lg
Option height: 36px, padding 0 12px
Option hover: neutral-50 bg
Option selected: brand-50 bg, brand-500 text, checkmark right
Max visible: 6 options, then scroll
```

---

### M-04 · Checkbox

```
Size: 18×18px
Radius: radius-sm (4px)
States:
  unchecked — white bg, 1.5px neutral-300 border
  checked   — brand-500 bg, white checkmark, no border
  indeterminate — brand-500 bg, white dash
  disabled  — neutral-100 bg, neutral-200 border

Label: text-body (16px), 8px gap from box
Full row clickable
```

---

### M-05 · Toggle Switch

```
Track: 40×22px, radius-full
Thumb: 18px circle, white, shadow-sm
Off: neutral-300 track, thumb left
On: brand-500 track, thumb right
Transition: 200ms ease-out (thumb position + track color)
Disabled: opacity 0.4
```

---

### M-06 · Trend Chip

Used on KPI cards to show delta vs prior period.

```
Anatomy: [arrow-icon 14px] [percent text text-caption] [period label text-caption neutral-400]

Positive: success-500 icon+text, "↑ 8.5% vs yesterday"
Negative: error-500 icon+text, "↓ 4.3% vs yesterday"
Neutral: neutral-400 icon+text

Icon: ti-trending-up (success) | ti-trending-down (error)
```

---

### M-07 · Search Bar

```
Height: 40px
Width: 240px (topbar), full-width (mobile, filter panels)
Left icon: ti-search, 16px, neutral-400
Radius: radius-md (8px)
Background: neutral-100
Border: 1px solid transparent
Focus: border brand-500, bg white

Clear button: ti-x, appears when value is non-empty, right side
Shortcut hint: "⌘K" badge, right side (desktop only)
```

---

### M-08 · Notification Bell

```
Icon: ti-bell, 20px, neutral-500
Unread badge: red dot (8px) or count badge (brand-500)
Count badge: 18px circle, brand-500 bg, white text-label, top-right of icon
Interaction: click → popover (see O-03)
```

---

### M-09 · Date Picker

Sourced from: widget kit calendar pattern

```
Trigger: Input field with ti-calendar icon, displays formatted date
Panel: month grid, shadow-md, radius-lg, white bg

Header: [prev-chevron] [Month Year — H4] [next-chevron]
Grid: 7-col (Su Mo Tu We Th Fr Sa), day cells 36×36px
Today: brand-100 bg, brand-500 text, bold
Selected: brand-500 bg, white text
Range (if range mode): brand-100 bg for in-range days
Disabled days: neutral-100 text, no hover
```

---

### M-10 · Progress Bar

```
Track: neutral-100, height 6px, radius-full
Fill: brand-500 (or semantic color), radius-full
Label: text-caption above (title) and right (percent)
Animated: fill width transitions 400ms ease-out on mount
```

---

### M-11 · Rating / Star

```
Stars: 5 icons, ti-star (empty) / ti-star-filled (filled)
Color: warning-500 (filled), neutral-300 (empty)
Size: 14px (compact), 18px (default)
Numeric label: text-caption neutral-400 after stars
```

---

### M-12 · Amount / Price Display

From widget kit expense/price patterns.

```
Currency symbol: text-body-sm neutral-400, top-aligned
Amount: text-stat (32px, 600) or text-h2 (28px)
Period label: text-caption neutral-400 below amount

Variants:
  positive (income)  — success-500 amount
  negative (expense) — error-500 amount
  neutral (balance)  — neutral-900 amount
```

---

## ORGANISMS

### O-01 · Stat / KPI Card

Sourced from: DashStack dashboard cards

```
┌─────────────────────────────────────┐
│  Total Tasks          [icon circle] │
│  ← title: text-label neutral-400   │   ← icon: 40px circle, brand-100 bg
│                                     │
│  247                                │
│  ← text-stat (32px, 600)           │
│                                     │
│  ↑ 12% more than last week         │
│  ← M-06 Trend Chip                 │
└─────────────────────────────────────┘

Padding: space-6 (24px)
Shadow: shadow-sm
Radius: radius-lg
Hover: shadow-md + translateY(-2px), 200ms ease-out
Min-width: 200px
```

---

### O-02 · Line/Area Chart Card

```
┌─────────────────────────────────────────────────┐
│  Expense Overview          [Month ▾] [•••]      │
│  ─────────────────────────────────────────────  │
│                                                 │
│  [SVG Chart Area — height 200px]                │
│                                                 │
│  [Legend: ● Income  ● Expense]                  │
└─────────────────────────────────────────────────┘

Chart colors:
  Line 1 (Income): brand-500, fill brand-50 (10% opacity)
  Line 2 (Expense): error-500, fill error-100 (10% opacity)

Grid lines: neutral-100, horizontal only
Axis labels: text-caption neutral-400
Tooltip: white card, shadow-md, shows exact value + date

Padding: space-6 (24px)
Shadow: shadow-sm
Radius: radius-lg
```

---

### O-03 · Notification Popover

```
Width: 320px
Shadow: shadow-lg
Radius: radius-lg
Max-height: 400px, scrollable

Header:
  "Notifications"  [Mark all read]
  ─────────────────

Item (48px min-height):
  [Avatar or icon]  [Title text-body-sm bold]
                    [Subtitle text-caption neutral-400]
                    [Time text-caption neutral-300]
  Unread: brand-50 left border (3px), neutral-50 bg
  Read: white bg

Footer:
  ─────────────────
  [See all notifications → link button]
```

---

### O-04 · Task List Organism

```
┌─────────────────────────────────────┐
│  My Tasks          [+ Add]  [•••]   │
│  ─────────────────────────────────  │
│  □  Buy groceries          [today]  │
│  □  Write report           [!high]  │
│  ✓  Call doctor         (completed) │
│  ─────────────────────────────────  │
│  □  Team meeting            [work]  │
└─────────────────────────────────────┘

Row anatomy:
  Left: M-04 Checkbox (18px)
  Gap: 12px
  Title: text-body, neutral-900 (incomplete), line-through neutral-400 (complete)
  Right: M-04 Badge (category/priority) or M-09 date chip
  Row height: 48px min
  Row hover: neutral-50 bg
  Completed row: faded, strikethrough, checkbox success state

Padding: space-6 (24px)
Shadow: shadow-sm
Radius: radius-lg
```

---

### O-05 · Note Card (Grid View)

```
┌─────────────────────────────────────┐
│  [Category badge]                   │
│                                     │
│  Note Title                         │
│  ← text-h4                         │
│                                     │
│  Preview text of note content up    │
│  to 3 lines, then truncate...       │
│  ← text-body-sm, neutral-500       │
│                                     │
│  ─────────────────────────────────  │
│  [📅 Dec 14]        [edit] [delete] │
└─────────────────────────────────────┘

Width: 3-col on desktop (4-col grid), 2-col tablet, 1-col mobile
Min-height: 160px
Hover: shadow-md + 2px lift
Category badge: colored per M-04 variant (purple for notes)
```

---

### O-06 · Expense Row (List View)

Sourced from: widget kit product/price cards

```
┌──────────────────────────────────────────────────┐
│  [Category Icon]  Title             - ¥ 2,450    │
│  circle-sm        text-body-sm      text-body-sm  │
│                   Subtitle/date     error-500      │
└──────────────────────────────────────────────────┘

Row height: 56px
Divider: inset 56px left (after icon)
Amount: right-aligned, error-500 (expense), success-500 (income)
Category icon: 36px circle, tinted per category color
```

---

### O-07 · Expense Summary Card

```
┌─────────────────────────────────────┐
│  This Month          [Dec 2024 ▾]   │
│                                     │
│  ¥ 48,320                           │
│  Total Expenses                     │
│                                     │
│  ● Food      ▓▓▓▓░░░░  ¥ 12,400   │
│  ● Transport ▓▓░░░░░░  ¥ 8,200    │
│  ● Shopping  ▓░░░░░░░  ¥ 4,300    │
└─────────────────────────────────────┘

Total amount: text-stat + text-label below
Category rows: M-10 Progress bar with legend dot + label + amount right
Donut chart: optional, replaces progress bars in summary view
```

---

### O-08 · Sidebar Navigation Organism

```
Width: 240px (expanded) | 64px (collapsed)
Height: 100vh fixed

Header (56px):
  [Johny logo 28px]  [App name text-h4]     (expanded)
  [Johny logo 28px]                          (collapsed)

Nav body:
  [Section label — MAIN, 11px uppercase letter-spacing 1px, neutral-400]

  Nav Item (40px height):
    [Icon 20px]  [Label text-body]
    
    States:
      default  — neutral-500 icon, neutral-700 text, no bg
      hover    — neutral-100 bg, brand-400 icon
      active   — brand-50 bg, brand-500 icon+text, 3px solid brand-500 left border

  [Section label — ACCOUNT]
  Nav Item: Profile
  Nav Item: Settings

Footer (56px):
  [Avatar 32px]  [Name text-body-sm]  [logout icon]
```

---

### O-09 · Topbar Organism

```
Height: 60px, position sticky top-0, z-index 100
Border-bottom: 1px solid neutral-100
Background: white (light) | neutral-900 (dark)

Left:
  [Hamburger ti-menu-2 24px] (visible on mobile only)
  [Page title H3 neutral-900]

Right:
  [M-07 Search]    gap 12px
  [M-08 Bell]      gap 12px
  [A-06 Divider vertical]
  [A-05 Avatar 32px]  [Name text-body-sm, role text-caption]  [chevron-down]
```

---

### O-10 · Modal Dialog Organism

```
Overlay: rgba(38,50,56,0.5) full-screen
Modal: centered, white, radius-xl, shadow-lg
Max-width: 480px (default), 640px (large), 360px (confirm)
Max-height: 80vh, scrollable body

Header (56px):
  [Title text-h3]
  [Close button ti-x 20px, neutral-400, hover neutral-700]

Divider: 1px neutral-100

Body:
  padding: space-6 (24px)
  overflow-y: auto

Footer (optional, 60px):
  border-top: 1px neutral-100
  Right-aligned: [Cancel secondary] [gap 8px] [Confirm primary]

Animation enter:
  opacity: 0 → 1 (200ms)
  scale: 0.96 → 1.0 (200ms ease-out)
Animation exit:
  opacity: 1 → 0 (150ms)
  scale: 1.0 → 0.96 (150ms ease-in)
```

---

### O-11 · Empty State Organism

```
Container: flex-col, items-center, gap 16px
Min-height: 240px, centered vertically

[Johny cat mascot SVG — 100px]  ← small version of mascot
[Title — text-h3, neutral-700]
[Subtitle — text-body-sm, neutral-400, text-center, max-width 280px]
[Primary CTA button — M-01 primary md]

Variants:
  tasks-empty   — "No tasks yet" / "Add your first task"
  notes-empty   — "Nothing written" / "Start your first note"
  expense-empty — "No expenses" / "Track your first expense"
  search-empty  — "No results" / "Try different keywords"

Mascot: appears in empty states, onboarding, success celebrations
```

---

### O-12 · Data Table Organism

Sourced from: DashStack table patterns

```
┌────────────────────────────────────────────────────┐
│  [Table title]        [Search] [Filter▾] [Export]  │
│  ──────────────────────────────────────────────    │
│  ☐  Title       Category    Amount    Date    ⋮    │  ← header row
│  ─────────────────────────────────────────────     │
│  ☐  Grocery     Food        ¥1,200   Dec 14  ⋮    │  ← data row
│  ☐  Taxi        Transport   ¥450     Dec 13  ⋮    │
└────────────────────────────────────────────────────┘

Header row: neutral-50 bg, text-label neutral-400, 44px height
Data row: white bg, text-body-sm, 52px height, hover neutral-50
Selected row: brand-50 bg
Column sort: ti-chevrons-up-down icon, active column highlighted
Row action menu (⋮): dropdown with Edit, Duplicate, Delete
Pagination: below table, text-caption showing "1–20 of 128"
```

---

## TEMPLATES

### T-01 · Dashboard Page

```
Topbar (O-09)
└── Sidebar (O-08)
    └── Main Content
        ├── Page Header: title + date range filter
        ├── KPI Row: 4× O-01 Stat Cards
        ├── Chart Row: O-02 (8col) + O-07 Summary (4col)
        └── O-12 Table or O-04 Task List
```

---

### T-02 · List Page (Tasks / Notes / Expenses)

```
Topbar
└── Sidebar
    └── Main Content
        ├── Page Header: title + [+ New] button + [search] + [filter]
        ├── Filter Tabs: All | Active | Completed (tasks) / by category
        ├── List/Grid body:
        │   ├── List view: O-04 rows or O-06 expense rows
        │   └── Grid view: O-05 note cards
        └── O-11 Empty State (when no items)
```

---

### T-03 · Create / Edit Page

```
Topbar
└── Sidebar
    └── Main Content (max-width 640px, centered)
        ├── Page Header: "New Task" / "Edit Note" + [Cancel link]
        ├── Form body:
        │   ├── M-02 Title input (full width, large)
        │   ├── M-02 Content textarea (full width, 6 rows)
        │   ├── 2-col row: M-03 Category + M-09 Date
        │   └── M-02 Amount (expense only)
        └── Footer: [Cancel secondary] [Save primary]
```

---

### T-04 · Settings Page

```
Topbar
└── Sidebar
    └── Main Content
        ├── Section nav (left, vertical tabs)
        │   ├── Profile
        │   ├── Appearance
        │   ├── Data & Privacy
        │   └── About
        └── Section content (right, fluid)
            └── Form groups with section dividers
```

---

## Dark Mode Specification

### Color Mapping (light → dark)

| Light token | Dark value |
|---|---|
| neutral-000 (white bg) | `#1E2328` |
| neutral-100 (subtle bg) | `#252B33` |
| neutral-300 (border) | `#374151` |
| neutral-400 (tertiary text) | `#6B7280` |
| neutral-500 (secondary text) | `#9CA3AF` |
| neutral-700 (secondary text) | `#D1D5DB` |
| neutral-900 (primary text) | `#F9FAFB` |
| brand-500 | `#60A5FA` (slightly lighter for contrast) |
| brand-100 (tint bg) | `#1E3A5F` |
| shadow | Remove shadows, use `neutral-300` border instead |

### Dark Mode Rules
- Never use `filter: invert()` — map colors explicitly
- Sidebar in dark mode: `#161B22` (even darker than main bg)
- Cards in dark mode: 1px solid neutral-300 border instead of shadow
- Images, mascot SVG: unchanged (hardcoded colors)
- Charts: reduce fill area opacity from 10% → 5%

---

## Component Implementation Priority for JohnyMemo

### Phase 1 (MVP)
1. A-01 Typography + A-03 Icon Wrapper
2. M-01 Button (primary, secondary, danger)
3. M-02 Input Field + M-03 Select
4. M-04 Checkbox + M-05 Toggle
5. O-08 Sidebar + O-09 Topbar
6. O-04 Task List + O-05 Note Card + O-06 Expense Row
7. O-10 Modal + O-11 Empty State

### Phase 2 (Polish)
8. O-01 KPI Card + O-02 Chart Card
9. O-07 Expense Summary Card
10. O-12 Data Table
11. M-06 Trend Chip + M-10 Progress Bar
12. M-09 Date Picker
13. Dark mode token application

### Phase 3 (Delight)
14. Skeleton loaders (A-07)
15. Toast notification system
16. Motion refinement (all transitions)
17. Johny mascot empty states (O-11 full art version)
18. PWA install prompt component
