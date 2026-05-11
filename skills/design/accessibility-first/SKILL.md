---
name: accessibility-first
description: Web accessibility (a11y) patterns, WCAG compliance strategies, ARIA best practices, and inclusive design principles.
category: design
---

# Accessibility First

## WCAG Compliance Levels
- **Level A**: Minimum — must support for legal compliance
- **Level AA**: Target — all new development should meet this (4.5:1 contrast, captions)
- **Level AAA**: Gold standard — strive for when possible

## Semantic HTML (Foundation of A11y)
- Use `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>` for landmarks
- Buttons: use `<button>` not `<div onClick>` — keyboard + screen reader support built in
- Headings: single `<h1>` per page, hierarchical nesting, no skipping levels
- Forms: every `<input>` needs a `<label>` with `for` attribute

## ARIA (Use Sparingly)
- "No ARIA is better than bad ARIA" — prefer semantic HTML first
- Use `aria-label` when visual label is missing (icon buttons)
- Use `aria-describedby` for additional instructions
- Use `aria-live` regions for dynamic content updates (toasts, loading)
- Use `role` only when HTML semantics are insufficient

## Keyboard Navigation
- All interactive elements must be keyboard accessible (Tab, Enter, Space)
- Visible focus indicators on all focusable elements
- Logical tab order matching visual order
- Skip-to-content links at page top
- No keyboard traps — user must be able to Tab away

## Screen Reader Testing
- Test with VoiceOver (Mac), NVDA (Windows), or JAWS
- Verify all images have meaningful alt text (or `alt=""` for decorative)
- Verify form errors are announced
- Verify dynamic content updates are announced via `aria-live`

## Inclusive Design Principles
- Color: never rely on color alone to convey information (add icons, patterns, text)
- Motion: respect `prefers-reduced-motion` — disable auto-playing animations
- Text: allow users to resize text up to 200% without loss of functionality
- Time: don't set time limits without warning and ability to extend
