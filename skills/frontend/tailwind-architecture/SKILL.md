---
name: tailwind-architecture
description: Tailwind CSS architecture, design systems, component extraction patterns, and optimization for production-scale applications.
category: frontend
---

# Tailwind Architecture

## Design System Setup
- Configure theme tokens in `tailwind.config.js`: colors, spacing, fonts, breakpoints
- Use CSS custom properties for runtime-themeable values
- Extend, don't override: use `extend: {}` to keep framework defaults

## Component Extraction
- Extract repeated utility patterns into components (React, Vue, etc.)
- Use `@apply` sparingly — only for truly repetitive base styles
- Prefer composition over `@apply`: build small utility components
- Group related utilities with `@layer components` for overrides

## Organization
```
src/
  components/ui/    # Base UI atoms (Button, Input, Card)
  components/       # Composed molecules and organisms
  styles/
    globals.css     # @tailwind directives + custom base styles
    components.css  # @layer component styles
```

## Optimization
- Purge unused styles: always configure `content` paths correctly
- Use JIT mode (default in v3+) for smallest builds
- Avoid dynamic class construction: `bg-${color}-500` won't be purged — use full class names
- Group related responsive variants: `md:flex md:items-center md:gap-4`

## Best Practices
- Mobile-first: base classes first, responsive overrides with `sm:`, `md:`, `lg:`
- Dark mode: use `dark:` prefix with `class` strategy
- State variants: `hover:`, `focus:`, `active:`, `disabled:`
- Animations: use Tailwind's built-in `animate-*` or extend with custom keyframes
