---
name: accessibility-first
description: Build accessible applications from the start. Use when building UI components, forms, modals, navigation, or ensuring WCAG compliance. Triggers on: accessibility, a11y, wcag, aria, keyboard, screen-reader, contrast, semantic-html.
---

# Accessibility First

Build accessible interfaces by default. Opinionated. Specific.

## Why It Matters

- 1 in 5 people have a disability
- Accessibility improves UX for everyone (keyboard users, power users, mobile users)
- Many countries have legal requirements (ADA, EAA, Section 508)
- Accessible sites rank better in search

## WCAG 2.1 AA Checklist

**The 4 principles (POUR):**

1. **Perceivable** — Content must be presentable to users in ways they can perceive
2. **Operable** — Interface must be operable by all users
3. **Understandable** — Information and operation must be understandable
4. **Robust** — Content must be interpretable by assistive technologies

**Minimum requirements:**
- Color contrast ratio: 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold)
- All functionality keyboard accessible
- Focus indicators visible (never `outline: none` without replacement)
- No keyboard traps
- Images have alt text
- Form inputs have labels
- Error messages are accessible

## Semantic HTML

**Use the right element for the right job.**

```html
<!-- BAD -->
<div onclick="submit()">Submit</div>
<div class="btn">Click here</div>
<div class="nav"><a href="/">Home</a></div>

<!-- GOOD -->
<button type="submit">Submit</button>
<button type="button" class="btn">Click here</button>
<nav><a href="/">Home</a></nav>
```

**Semantic elements and their use:**
- `<button>` — interactive control
- `<a href="...">` — navigation links
- `<nav>` — navigation regions
- `<main>` — main content (one per page)
- `<article>` — self-contained content
- `<aside>` — sidebar, tangentially related content
- `<header>` / `<footer>` — header/footer of section or page
- `<h1>` to `<h6>` — document outline (skip levels, e.g. h2→h4 is fine, h2→h1 is not)

## Forms

**Every input needs a label.**

```html
<!-- BAD -->
<input type="text" placeholder="Enter email">
<div class="label">Email</div>
<input type="text" aria-label="Search">

<!-- GOOD -->
<label for="email">Email address</label>
<input type="text" id="email" name="email" autocomplete="email">

<!-- If visual label isn't possible -->
<label for="search">Search</label>
<input type="text" id="search" aria-label="Search">
```

**Error messages must be associated with inputs:**

```html
<label for="password">Password</label>
<input
  type="password"
  id="password"
  aria-describedby="password-error"
  aria-invalid="true"
/>
<span id="password-error" role="alert">
  Password must be at least 8 characters
</span>
```

**Use `autocomplete` attributes:**
- `autocomplete="email"` for email
- `autocomplete="given-name"` for first name
- `autocomplete="tel"` for phone
- `autocomplete="cc-number"` for card numbers

## Focus Management

**Visible focus is mandatory.** Never suppress it.

```css
/* BAD: removes focus indicator */
*:focus { outline: none; }

/* GOOD: custom focus indicator */
*:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

**Manage focus for modals and dialogs:**

```typescript
function openModal(modal: HTMLElement) {
  const previousFocus = document.activeElement as HTMLElement;
  modal.removeAttribute('hidden');
  const firstFocusable = modal.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusable?.focus();

  // Trap focus inside modal
  modal.addEventListener('keydown', trapFocus);

  // Restore on close
  return () => {
    previousFocus?.focus();
    modal.setAttribute('hidden', '');
    modal.removeEventListener('keydown', trapFocus);
  };
}
```

**On route change in SPAs:** Focus the main heading or first interactive element. Don't leave focus on the previous page's elements.

## ARIA Usage

**Use ARIA only when native HTML isn't enough.** ARIA doesn't add behavior — it only enhances existing semantics.

**When to use ARIA:**
- Custom interactive widgets (dropdown menus, tabs, accordions)
- Live regions (status updates, notifications)
- Custom landmarks (when you can't use semantic HTML)

**Never use ARIA on non-interactive elements to make them "accessible":**

```html
<!-- BAD: adds no real functionality -->
<div role="button">Click me</div>

<!-- GOOD: native semantics -->
<button type="button">Click me</button>
```

**ARIA live regions:**

```html
<!-- Polite: waits for idle -->
<div aria-live="polite">Status: saving...</div>

<!-- Assertive: announces immediately (use sparingly) -->
<div aria-live="assertive" role="alert">Error: submission failed</div>
```

## Keyboard Navigation

**Every interactive element must be keyboard accessible.**

**Standard keyboard patterns:**
- `Tab` — move focus forward
- `Shift+Tab` — move focus backward
- `Enter` — activate buttons and links
- `Space` — activate buttons
- `Escape` — close modals, dropdowns, menus
- Arrow keys — navigate within menus, tabs, sliders

**Skip links for single-page navigation:**

```html
<!-- First element in body -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<nav>...</nav>
<main id="main-content" tabindex="-1">
  <!-- main content -->
</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 9999;
}
.skip-link:focus { top: 0; }
```

## Color and Contrast

**Check contrast ratios with a tool.**

```bash
# Use browser DevTools, or:
npx axe-cli https://yoursite.com
```

**Tools to use:**
- Browser DevTools color picker → accessibility tab
- https://whocanuse.com — contrast checker
- https://webaim.org/resources/contrastchecker — contrast checker
- browser extension: axe DevTools

**Don't convey information through color alone.** Use icons, labels, or patterns alongside color:

```html
<!-- BAD: color is the only indicator -->
<span class="status error">Error</span>

<!-- GOOD: icon + text -->
<span class="status error">
  <svg aria-hidden="true">...</svg>
  Error: submission failed
</span>
```

## Images and Media

**Meaningful images need descriptive alt text:**

```html
<img src="user-avatar.jpg" alt="Sarah Chen's profile photo">

<!-- If image is decorative -->
<img src="decoration.svg" alt="" aria-hidden="true">
```

**Complex images need long descriptions:**

```html
<img
  src="chart.png"
  alt="Bar chart showing Q3 sales"
  aria-describedby="chart-desc"
/>
<p id="chart-desc">
  Q3 sales increased 34% from $2.1M to $2.8M.
  October: $850K, November: $950K, December: $1M.
</p>
```

## Motion and Animation

**Respect `prefers-reduced-motion`:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Always provide a way to pause animations.** Never autoplay video or complex animations.

## Testing Accessibility

**Automated testing catches ~30% of issues.** You need both automated and manual testing.

**Automated:**
```bash
npm install -D @axe-core/playwright
npx playwright test --project=accessibility
```

**Manual:**
- Navigate your app with keyboard only (no mouse)
- Test with a screen reader (VoiceOver on Mac, NVDA on Windows)
- Zoom to 200% and use at 400% width
- Test with Windows High Contrast mode

## Checklist

- [ ] Color contrast 4.5:1 (text) and 3:1 (large text)
- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Focus is visible and managed
- [ ] Keyboard navigation works for all features
- [ ] Modals trap focus and restore on close
- [ ] Error messages are associated with inputs
- [ ] No keyboard traps
- [ ] Skip link at top of page
- [ ] `prefers-reduced-motion` respected
- [ ] Semantic HTML used throughout
