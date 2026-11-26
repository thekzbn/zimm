# Theme, Typography, and Accessibility Guide

## 1. The `numb` Brand Palette

The palette name is **`numb`** (all lowercase). Its core brand colors are:

| Name | Hex Code | Role |
| :--- | :---: | :--- |
| **Brown Derby** | `#4a1815` | Dark accent, active borders, secondary text |
| **Falu Red** | `#821917` | Primary brand accent, button backgrounds |
| **Tamarillo** | `#a61b19` | Hover states, focus rings, status indicators |
| **Zeus** | `#211914` | Primary dark text, deep backgrounds |

---

## 2. Documented Neutral Colors

In addition to the supplied brand colors, the following neutral tokens are formally documented:

### Light Mode Neutrals
- **Background Primary (`#fbf8f7`):** Warm off-white page background.
- **Background Secondary (`#f3ece8`):** Subtle tinted container background.
- **Background Elevated (`#ffffff`):** Pure white for modals and 9x9 cells.
- **Selection Highlight (`#fadcdb`):** Selected cell highlight tint.
- **Muted Text (`#5e423e`):** Secondary labels, subtitles, and timers (verified >= 4.5:1 on light surfaces).
- **Border Subtle (`#dfd2cd`):** Soft cell separators and flat 1px section dividers.

### Dark Mode Neutrals
- **Background Primary (`#140f0d`):** Deep warm obsidian canvas.
- **Background Secondary (`#211914`):** Container background (Zeus).
- **Background Elevated (`#2a201b`):** Elevated card surfaces.
- **Text Primary (`#fbf8f7`):** High contrast white-warm text.
- **Muted Text (`#af9994`):** Subtitle text and status metrics.
- **Border Subtle (`#3d2e29`):** Dark grid cell dividers.

---

## 3. Typography Setup

Inter is loaded via the official stylesheet in the document head:
```html
<link rel="preconnect" href="https://rsms.me/">
<link rel="stylesheet" href="https://rsms.me/inter/inter.css">
```

Applied in CSS:
```css
:root {
  font-family: Inter, sans-serif;
  font-feature-settings: 'liga' 1, 'calt' 1;
}

@supports (font-variation-settings: normal) {
  :root {
    font-family: InterVariable, sans-serif;
  }
}
```

---

## 4. Accessibility and WCAG AA Compliance

- **Contrast Verification:** Verified by automated tests in [`tests/theme/themeContrast.test.ts`](../tests/theme/themeContrast.test.ts#L1-L55). Primary text, muted text, error alerts, given digits, and action buttons exceed the WCAG AA requirement of **4.5:1** contrast against their respective backgrounds in both light and dark modes.
- **Constrained Type Scale:** Four prose sizes (`0.75rem`, `0.875rem`, `1rem`, `1.25rem`) plus two board-functional digit sizes (`1.5rem` cell digit, `0.625rem` pencil note).
- **Keyboard Navigation & Focus Trapping:** Full arrow-key navigation (with direct `tabIndex={0}` grid entry), numerical keys 1-9, Delete/Backspace for clearing, `U` or `Ctrl+Z` for undo, `N` for toggling notes mode, `H` for requesting staged hints, and `Escape` with focus trapping inside modal dialogs.
- **Reduced Motion:** `prefers-reduced-motion: reduce` collapses transition durations globally in `src/index.css`.
- **Focus Visibility:** All interactive controls apply `:focus-visible` high-contrast outlines (`2px solid #a61b19`) via `src/index.css`.
- **Responsive Play Area:** Uses a `chess.com`-inspired persistent left sidebar on viewports `>= 860px` (collapsing to a compact top bar on mobile) and a two-column workspace (`zimm-workspace`) on viewports `>= 820px` with a 3x3 digit pad so touch targets remain >= 44px even on narrow viewports.
- **ARIA Grid Semantics:** The 9x9 grid implements `role="grid"` with individual buttons as `role="gridcell"`, `aria-selected`, and descriptive screen-reader coordinates including active pencil notes.
