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
- **Background Elevated (`#ffffff`):** Pure white for cards and 9x9 cells.
- **Selection Highlight (`#fadcdb`):** Selected cell highlight tint.
- **Muted Text (`#6d4c47`):** Secondary labels and timers.
- **Border Subtle (`#dfd2cd`):** Soft cell separators.

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

- **Contrast Verification:** Verified by automated tests in [`tests/theme/themeContrast.test.ts`](../tests/theme/themeContrast.test.ts#L1-L47). All primary text, given digits, and action buttons exceed the WCAG AA requirement of **4.5:1** contrast against their respective backgrounds in both light and dark modes.
- **Keyboard Navigation:** Full arrow-key navigation, numerical keys 1-9, Delete/Backspace for clearing, `N` for toggling notes mode, `H` for requesting staged hints, and `Escape` for closing overlay modals.
- **Focus Visibility:** All interactive controls apply `:focus-visible` high-contrast outlines (`2px solid #a61b19`) via `src/index.css`.
- **Responsive Play Area:** Uses a two-column workspace (`zimm-workspace`) on viewports `>= 820px` and a compact stacked layout on smaller screens so the board and controls fit without clipping.
- **ARIA Grid Semantics:** The 9x9 grid implements `role="grid"` with individual buttons as `role="gridcell"`, `aria-selected`, and descriptive screen-reader coordinates including active pencil notes.
