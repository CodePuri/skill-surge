---
name: css-mastery
description: Modern CSS patterns including layouts, animations, responsive design, and CSS architecture for maintainable stylesheets.
category: frontend
---

# CSS Mastery

## Layout Patterns
- Flexbox: 1-dimensional layouts (nav bars, centering, card rows)
- CSS Grid: 2-dimensional layouts (page shells, dashboard grids, galleries)
- `auto-fill` / `auto-fit` for responsive grids without media queries

## Responsive Design
- Mobile-first: write base styles for mobile, add `@media (min-width: ...)` for larger screens
- Use `clamp()` for fluid typography: `font-size: clamp(1rem, 2.5vw, 2rem)`
- Use logical properties (`margin-inline`, `padding-block`) for RTL support
- Common breakpoints: 480px, 768px, 1024px, 1280px

## Animations
- `transition` for simple state changes (hover, active, focus)
- `@keyframes` for complex sequences
- Use `prefers-reduced-motion` to respect user accessibility settings
- GPU-accelerated properties only: `transform`, `opacity`, `filter`

## Architecture (CUBE CSS or ITCSS)
- **Utilities**: Single-purpose classes (`.text-center`, `.flex`)
- **Components**: BEM naming for reusable UI pieces (`.card__title--featured`)
- **Global**: CSS custom properties for theme tokens (colors, spacing, typography)
- Use `@layer` to manage cascade: `reset`, `base`, `components`, `utilities`

## Custom Properties
```css
:root {
  --color-primary: #6366f1;
  --spacing-md: 1rem;
  --radius-sm: 4px;
}
```
