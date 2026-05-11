---
name: react-patterns
description: React best practices, hooks patterns, state management, performance optimization, and component architecture for production-grade React applications.
category: frontend
---

# React Patterns

## Component Architecture
- Use functional components with hooks exclusively — no class components
- Extract custom hooks for reusable stateful logic (e.g., `useDebounce`, `useLocalStorage`)
- Keep components under 200 lines; split into smaller presentational and container components
- Use composition over inheritance — prefer `children` and render props

## State Management
- Local state: `useState` for simple values, `useReducer` for complex state
- Shared state: Context API for small apps (fewer than 5 contexts), Zustand for medium, Redux Toolkit for large
- Server state: Always use TanStack Query (React Query) or SWR — never fetch in `useEffect`
- Form state: React Hook Form + Zod for validation

## Performance
- `React.memo` for expensive pure components that re-render often
- `useMemo` for heavy computations
- `useCallback` for stable callback references passed to child components
- Lazy load routes with `React.lazy` + `Suspense`
- Virtualize long lists with `react-window` or `tanstack-virtual`

## Testing
- Component tests: React Testing Library (test behavior, not implementation)
- Hook tests: `renderHook` from React Testing Library
- E2E: Playwright for critical user flows

## Project Structure
```
src/
  components/    # Reusable UI components
  features/      # Feature-specific modules (each with own components, hooks, api)
  hooks/         # Shared custom hooks
  lib/           # Utilities, helpers
  pages/         # Route page components
  types/         # TypeScript types
```
