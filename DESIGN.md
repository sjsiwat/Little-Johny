# Johny OS Design System v2

## Design Vision

Johny OS is not a typical productivity dashboard.

The feeling should be:

- Notion simplicity
- Studio Ghibli watercolor illustration
- Personal notebook
- Calm workspace
- Cozy digital desk
- Soft paper texture
- Handmade feeling
- Warm and human

The UI should feel like:

> "A small personal workspace inside a Ghibli sketchbook."

Avoid:

- SaaS startup style
- Corporate dashboard
- Neon colors
- Sharp edges
- Heavy shadows
- Glassmorphism
- Cyberpunk aesthetics

---

# Visual Style

## Theme

Watercolor + Sketchbook + Nature

Imagine:

- old notebook paper
- watercolor paint
- hand-drawn illustrations
- soft green garden
- calm morning sunlight

Color palette must feel:

- soft
- natural
- organic
- low contrast

---

# Color Palette

Background:

```css
#f7f5f0
#f3f0e8
#ede8de
```

Primary Green:

```css
#6f8f6d
#7ea37d
#94b394
```

Accent Brown:

```css
#8f7761
#a3876a
```

Soft Orange:

```css
#d8a36a
```

Text:

```css
#2d2a26
#5e5a54
```

Borders:

```css
#e5dfd4
```

---

# Typography

Heading:

- Caveat
- Kalam
- Patrick Hand

Body:

- Inter
- Noto Sans Thai

Rules:

- Handwritten font only for headings
- All content uses Inter
- Large spacing
- Comfortable reading

---

# Layout

Desktop:

```text
┌─────────────┬──────────────────────┐
│             │                      │
│ Sidebar     │   Dashboard          │
│             │                      │
│             │                      │
└─────────────┴──────────────────────┘
```

Sidebar width:

```css
220px
```

Content max width:

```css
1400px
```

Spacing system:

```css
8px
16px
24px
32px
48px
```

---

# Sidebar

The sidebar should feel like a notebook margin.

Contains:

- Logo
- Theme toggle
- Cat illustration
- Navigation
- User profile
- Decorative plant illustration

Visual style:

- very light background
- subtle border
- watercolor decorations

---

# Mascot

A black Ghibli-style cat.

Position:

- Left sidebar
- Near top section

Behavior:

- Slow floating animation
- Blink every 4–6 seconds
- Tail moves gently
- Ear twitch occasionally

Never use:

- Cartoon mascot
- Emoji style
- Gaming mascot

The cat should feel alive but subtle.

---

# Hero Section

Large welcome card.

Layout:

```text
┌─────────────────────────────┐
│                             │
│ Headline                    │
│ Description                 │
│ Buttons                      🐱
│                             │
│ Today Focus                 │
└─────────────────────────────┘
```

Background:

- watercolor paper
- soft nature illustration
- light trees
- grass
- clouds

Top-right corner:

- watercolor tree branch
- soft leaves

Bottom section:

- small walking cats illustration

The hero should feel like:

> opening a page inside a Ghibli journal.

---

# Cards

All cards should look like paper notes.

Style:

```css
border-radius: 18px;
border: 1px solid #e5dfd4;
background: #ffffff;
```

Shadow:

```css
0 2px 8px rgba(0,0,0,0.04)
```

No strong shadows.

---

# Stats Cards

Display:

- Tasks
- Pending
- Completed
- Expenses

Style:

- soft icon background
- rounded corners
- minimal information

Icons:

- outlined
- hand-drawn feeling
- muted colors

---

# Task Section

Feels like a handwritten to-do list.

Features:

- checkbox
- due date
- priority tag

Priority colors:

Critical:
#d96b5f

High:
#d8a36a

Medium:
#7ea37d

Low:
#a8b0a0

---

# Notes Section

Looks like small notebook pages.

Cards should feel:

- personal
- scrapbook-like
- warm

Each note card:

- title
- preview text
- category tag
- timestamp

---

# Expense Section

Minimal financial tracking.

Avoid:

- financial software look
- trading dashboard look

Use:

- soft progress bars
- muted colors
- friendly icons

Should feel:

> household notebook

not

> accounting software

---

# Animations

Very subtle.

Allowed:

- cat floating
- blinking
- tail wag
- leaf sway
- cloud drifting
- fade in

Animation duration:

```css
3s - 12s
```

Avoid:

- bouncing
- spinning
- flashy transitions

---

# Decorative Elements

Add watercolor illustrations:

- leaves
- grass
- flowers
- clouds
- paper textures

Opacity:

```css
0.08 - 0.25
```

Never distract from content.

---

# Overall Feeling

If Notion is:

"Professional productivity"

Johny OS should be:

"Personal productivity inside a Ghibli sketchbook"

The application should feel warm, calm, handmade, and comforting.