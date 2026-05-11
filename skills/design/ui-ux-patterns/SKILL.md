---
name: ui-ux-patterns
description: UI/UX design patterns including layout principles, interaction design, visual hierarchy, design systems, and user-centered design workflows.
category: design
---

# UI/UX Patterns

## Visual Hierarchy
- Size and weight establish importance — critical actions should be visually prominent
- Use whitespace to group related elements (closer = related)
- Color draws attention — use sparingly for CTAs and alerts
- Typography scale: establish a modular scale (1.25 ratio) for consistency

## Layout Principles
- F-pattern for content-heavy pages (articles, search results)
- Z-pattern for landing pages (top-left to bottom-right scan)
- Grid systems: 12-column for complex layouts, 4-column for mobile
- Consistent gutter and margin spacing

## Interaction Design
- Feedback for every action: loading states, success/error toasts, optimistic UI
- Gestalt principles: proximity, similarity, closure for natural grouping
- Gestures: swipe, pull-to-refresh, pinch (mobile) — provide visible affordances
- Transitions should be meaningful (200-300ms, easing functions)

## Design Systems
- Establish a token system: colors, typography, spacing, shadows, radii
- Component library: Button, Input, Card, Modal, Toast, Select
- Consistency over novelty — users should feel familiar across pages
- Document usage guidelines inline with components

## User-Centered Workflow
1. Understand the problem (user research, analytics, feedback)
2. Ideate (sketches, wireframes, low-fidelity prototypes)
3. Design (high-fidelity mockups, interactive prototypes)
4. Test (usability testing, A/B testing, heatmaps)
5. Iterate (gather feedback, refine, ship)

## Accessibility in Design
- Color contrast: WCAG AA minimum (4.5:1 for normal text, 3:1 for large)
- Touch targets: minimum 44x44px for interactive elements
- Don't rely solely on color to convey information
- Provide descriptive labels for form fields, not just placeholders
