---
inclusion: always
---

# HireWise Design System

Single source of truth for all visual decisions. Every spec, component, and code change must reference this document. Do not introduce colours, spacing, radii, or typography outside this system without updating this file first.

---

## 1. Philosophy

Two fully realised themes — not a colour inversion.

| | Light — "Clean & Airy" | Dark — "Premium Editor" |
|---|---|---|
| Feel | Paper, glass, natural light | Control room, editor, focused dark |
| Reference | Vercel dashboard (light), Linear (light) | Linear (dark), Raycast, VS Code |
| Depth via | Soft drop shadows | Layered surface background shades |
| Borders | Minimal — shadow does the work | 1px rgba(255,255,255,0.08) separates layers |
| Accent | #4F46E5 indigo, used sparingly | #818CF8 bright indigo, same hue family |

Default theme: **dark**. On first visit, detect `prefers-color-scheme`. Persist choice in `localStorage` key `hw-theme`.

---

## 2. CSS Custom Properties

Applied via `data-theme="light"` or `data-theme="dark"` on `<html>`. Default is dark.

```css
/* ── Dark (default) ────────────────────────────── */
[data-theme="dark"] {
  --bg:            #0A0A0B;
  --surface-0:     #141417;
  --surface-1:     #1C1C21;
  --surface-2:     #26262D;

  --border:        rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.14);
  --shadow-sm:     none;
  --shadow-md:     none;
  --shadow-lg:     none;
  --glow-accent:   0 0 24px rgba(129,140,248,0.18);
  --glow-success:  0 0 20px rgba(74,222,128,0.15);

  --text-primary:   #F4F4F5;
  --text-secondary: #A1A1AA;
  --text-tertiary:  #52525B;
  --text-disabled:  #3F3F46;

  --accent:         #818CF8;
  --accent-hover:   #A5B4FC;
  --accent-subtle:  rgba(129,140,248,0.10);
  --accent-border:  rgba(129,140,248,0.20);

  --success:        #4ADE80;
  --success-subtle: rgba(74,222,128,0.10);
  --success-border: rgba(74,222,128,0.20);
  --warning:        #FCD34D;
  --warning-subtle: rgba(252,211,77,0.10);
  --warning-border: rgba(252,211,77,0.20);
  --danger:         #F87171;
  --danger-subtle:  rgba(248,113,113,0.10);
  --danger-border:  rgba(248,113,113,0.20);

  --score-high-from: #4ADE80;
  --score-high-to:   #86EFAC;
  --score-mid-from:  #FCD34D;
  --score-mid-to:    #FDE68A;
  --score-low-bg:    #26262D;
  --score-low-text:  #52525B;
}

/* ── Light ─────────────────────────────────────── */
[data-theme="light"] {
  --bg:            #F7F7F8;
  --surface-0:     #FFFFFF;
  --surface-1:     #F4F4F6;
  --surface-2:     #EBEBED;

  --border:        rgba(0,0,0,0.07);
  --border-strong: rgba(0,0,0,0.14);
  --shadow-sm:     0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:     0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg:     0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05);
  --glow-accent:   none;
  --glow-success:  none;

  --text-primary:   #18181B;
  --text-secondary: #52525B;
  --text-tertiary:  #A1A1AA;
  --text-disabled:  #D4D4D8;

  --accent:         #4F46E5;
  --accent-hover:   #4338CA;
  --accent-subtle:  rgba(79,70,229,0.08);
  --accent-border:  rgba(79,70,229,0.20);

  --success:        #16A34A;
  --success-subtle: rgba(22,163,74,0.08);
  --success-border: rgba(22,163,74,0.20);
  --warning:        #D97706;
  --warning-subtle: rgba(217,119,6,0.08);
  --warning-border: rgba(217,119,6,0.20);
  --danger:         #DC2626;
  --danger-subtle:  rgba(220,38,38,0.08);
  --danger-border:  rgba(220,38,38,0.20);

  --score-high-from: #16A34A;
  --score-high-to:   #4ADE80;
  --score-mid-from:  #D97706;
  --score-mid-to:    #FCD34D;
  --score-low-bg:    #EBEBED;
  --score-low-text:  #A1A1AA;
}
```

---

## 3. Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `8px` | Buttons, badges, inputs, small chips |
| `--radius-md` | `12px` | Cards, dropdowns, modals |
| `--radius-lg` | `16px` | Large cards, panels |
| `--radius-xl` | `20px` | Hero cards, feature panels |
| `--radius-full` | `9999px` | Pills, avatars |

**Forbidden:** any radius not in this scale (e.g. 6px, 10px, 15px, 18px, 22px).

---

## 4. Spacing Scale

Use multiples of 4px (Tailwind default). Named references:

| Name | px | Tailwind | Use |
|---|---|---|---|
| space-1 | 4 | p-1 | Icon gap, tight inline spacing |
| space-2 | 8 | p-2 | Between related items |
| space-3 | 12 | p-3 | Compact card padding |
| space-4 | 16 | p-4 | Standard card padding |
| space-5 | 20 | p-5 | Comfortable card padding |
| space-6 | 24 | p-6 | Section internal padding |
| space-8 | 32 | p-8 | Between page sections |
| space-12 | 48 | p-12 | Page vertical rhythm |

Max content width: **900px** (candidate/company detail pages), **1100px** (dashboard, landing). Always `margin: 0 auto` + `padding: 0 24px`.

---

## 5. Typography

Fonts loaded via `next/font`:
- **Inter** — all body text, UI labels, buttons
- **Syne** — page headings, hero text only

| Role | Size | Weight | Letter-spacing | Font |
|---|---|---|---|---|
| Hero | 36–48px | 900 | -0.04em | Syne |
| Page title | 22–28px | 800 | -0.03em | Syne |
| Section heading | 18–20px | 700 | -0.02em | Inter |
| Card title | 15px | 600 | -0.01em | Inter |
| Body | 14px | 400 | 0 | Inter |
| Caption/meta | 13px | 400 | 0 | Inter |
| Label/overline | 11px | 700 | +0.06em, uppercase | Inter |
| Numeric/stat | 26–32px | 800 | -0.04em | Inter |

Font smoothing: always `-webkit-font-smoothing: antialiased`.

---

## 6. Elevation (Depth)

### Dark mode — surface layering (no shadows)
```
Layer 0: --bg         Page background
Layer 1: --surface-0  Cards, sidebars
Layer 2: --surface-1  Nested sections, inputs, dropdowns
Layer 3: --surface-2  Hover states, selected rows, tooltips
```

### Light mode — shadow-based depth
```
Layer 0: --bg         Page background
Layer 1: --surface-0  Cards (shadow-sm)
Layer 2: --surface-1  Nested inside cards (no shadow, slight bg)
Layer 3: (modal/popover) shadow-lg
```

**Glow** (dark mode only) — one element per screen maximum. Use on the match-score chip of the featured/top match or the primary CTA.

---

## 7. Component Conventions

### Buttons

```
Primary:   bg[--accent] color[white] radius[--radius-sm] px-4 py-2 text-[14px] font-600
           hover: bg[--accent-hover] dark: box-shadow[--glow-accent]
Secondary: bg[--surface-1] color[--text-primary] border[--border] radius[--radius-sm]
           hover: bg[--surface-2]
Ghost:     bg[transparent] color[--text-secondary] radius[--radius-sm]
           hover: bg[--surface-1] color[--text-primary]
Danger:    bg[--danger-subtle] color[--danger] border[--danger-border] radius[--radius-sm]
           hover: opacity 0.85
```

All buttons: `transition: background-color 150ms, box-shadow 150ms, color 150ms ease`.
Loading state: replace label with 14px inline spinner + "..." text. Keep same width.

### Cards

```
background: var(--surface-0)
border: 1px solid var(--border)
border-radius: var(--radius-md)   [or --radius-lg for featured cards]
box-shadow: var(--shadow-sm)
padding: 16px (compact) | 24px (comfortable)

hover:
  border-color: var(--accent-border)
  box-shadow: var(--shadow-md)
  transition: 200ms ease
```

### Inputs / Textarea / Select

```
background: var(--surface-1)
border: 1px solid var(--border)
border-radius: var(--radius-sm)
padding: 10px 12px
color: var(--text-primary)
font-size: 14px

focus:
  border-color: var(--accent-border)
  box-shadow: 0 0 0 3px var(--accent-subtle)
  outline: none

placeholder: color var(--text-tertiary)
```

### Badges

```
Applied:     bg[--accent-subtle]  color[--accent]  border[--accent-border]
Shortlisted: bg[--success-subtle] color[--success] border[--success-border]
Rejected:    bg[--danger-subtle]  color[--danger]  border[--danger-border]
Pending:     bg[--warning-subtle] color[--warning] border[--warning-border]

All: border-radius var(--radius-full), font-size 11px, font-weight 700,
     padding 2px 8px, display inline-flex align-center gap 4px
```

### Match Score Chip — Signature Element

```
≥ 80%:  background: linear-gradient(135deg, var(--score-high-from), var(--score-high-to))
        color: white (light) | #0A0A0B (dark — dark text on bright green)
        dark only: box-shadow var(--glow-success)

50–79%: background: linear-gradient(135deg, var(--score-mid-from), var(--score-mid-to))
        color: #18181B (always dark text — yellow needs dark text)

< 50%:  background: var(--score-low-bg)
        color: var(--score-low-text)
        no gradient, no glow

All: border-radius var(--radius-full), font-size 11px, font-weight 800,
     padding 3px 10px, tabular-nums, letter-spacing -0.01em
```

---

## 8. Loading States

**Skeleton** — use for content areas, not buttons. Never a bare Loader2 spinner in a list or card grid.

```
Skeleton block: background var(--surface-1), border-radius var(--radius-sm)
Animation: opacity pulse 0.8 → 1.0, 1.5s ease-in-out infinite
Light mode: background var(--surface-2)

Card skeleton anatomy:
  Row 1: avatar circle (44px) + title bar (60% width, 14px height)
  Row 2: padding-left 56px + subtitle bar (40% width, 12px height)
  Row 3: padding-left 56px + 3 tag bars (60px each, 10px height)
  Right: score chip placeholder (56px wide, 22px height, full radius)
```

**Inline spinner** — 14–16px, `border: 2px solid var(--accent-subtle); border-top-color: var(--accent)`, animation spin 600ms linear infinite. Only inside buttons.

**Page loader** — centered logo mark (H gradient icon), pulse animation. No text. Max 2s before showing error state.

---

## 9. Empty States

Required elements (all must be present):
1. Icon: Lucide 36px, `color: var(--text-tertiary)`, `opacity: 0.4`
2. Headline: 16px, font-weight 600, `color: var(--text-primary)`
3. Sub-line: 14px, `color: var(--text-secondary)`
4. CTA button (optional): primary button if there's a clear action

Example — no applications:
```
[Briefcase icon]
No applications yet
Apply to jobs to track your progress here.
[Browse jobs →]  ← primary button
```

Never: standalone "No data found" text.

---

## 10. Animation Rules

```css
/* Standard interaction transitions */
button, a, input, [role="button"] {
  transition: background-color 150ms ease,
              border-color 150ms ease,
              color 150ms ease,
              box-shadow 150ms ease;
}

/* Card hover */
.card {
  transition: border-color 200ms ease,
              box-shadow 200ms ease,
              transform 200ms ease;
}
.card:hover { transform: translateY(-2px); }

/* Theme crossfade — on html element */
html {
  transition: background-color 300ms ease,
              color 300ms ease;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

No `transition: all` on body or html (too expensive).

---

## 11. Focus States

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}
```

Never `outline: none` without an equivalent replacement. All interactive elements must be keyboard navigable.

---

## 12. Theme Toggle Implementation

- Read on mount: `localStorage.getItem('hw-theme')` → if null, check `window.matchMedia('(prefers-color-scheme: dark)')` → default to `dark`
- Apply: `document.documentElement.setAttribute('data-theme', theme)`
- Persist: `localStorage.setItem('hw-theme', theme)` on change
- Prevent FOUC: inline script in `<head>` before any CSS loads (see layout.tsx spec)
- Transition: 300ms crossfade on background-color and color — achieved via CSS transition on `html` element
- Toggle button: Sun/Moon icon, 34px, ghost button style, in Navbar right side

---

## 13. What is Forbidden

- Pure `#000000` or `#FFFFFF` backgrounds anywhere
- More than one gradient element per screen section
- `border-radius` values not in the scale
- Hardcoded hex colour values in component JSX — use CSS variables
- `font-weight: 900` on text longer than 4 words
- Multiple competing accent hues on the same screen
- `transition: all` on any element
- Glow on more than one element per screen
- Hard theme switch (flash) — always crossfade
- Shadows in dark mode or glow effects in light mode
