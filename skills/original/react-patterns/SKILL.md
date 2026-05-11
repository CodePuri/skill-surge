---
name: react-patterns
description: Build React applications with best practices. Use when building components, managing state, optimizing performance, or setting up data fetching. Triggers on: react, component, state, hooks, redux, tanstack, render, performance.
---

# React Patterns

Production React patterns. Opinionated. Specific.

## Component Structure

**Single responsibility:** One component, one job.

```typescript
// BAD: component that does too much
function UserDashboard() {
  return (
    <div>
      <UserProfile />
      <UserOrders />
      <UserNotifications />
      <UserSettings />
    </div>
  );
}

// GOOD: each component has one clear purpose
function Dashboard() {
  return (
    <div>
      <UserProfile />
      <OrdersSection />
      <NotificationPanel />
      <SettingsPanel />
    </div>
  );
}
```

## State Management

**Rule: Lift state to the lowest common ancestor, not higher.**

```typescript
// BAD: prop drilling
<App>
  <Page>
    <Section>
      <Panel>
        <Button onClick={handleClick} /> // passed through 4 levels
      </Panel>
    </Section>
  </Page>
</App>

// GOOD: composed components, context, or state management
function Panel({ onAction }) {
  return <Button onClick={onAction} />;
}
```

**Use the right tool for the state type:**

| State Type | Tool |
|-----------|------|
| Server data (API) | TanStack Query / SWR |
| Global UI state | Zustand / Jotai |
| Form state | React Hook Form + Zod |
| URL state | react-router search params |
| Animation state | Framer Motion internal state |
| Component-local | `useState` |

**TanStack Query** is the default for server data. It handles caching, refetching, loading states, error states, and background updates automatically.

## Hooks Patterns

**Custom hooks for reusable logic:**

```typescript
// BAD: duplicate logic in multiple components
function UserCard() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser(id).then(setUser);
  }, [id]);
  // ...
}

function UserList() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser(id).then(setUser);
  }, [id]);
  // ...
}

// GOOD: extracted into a hook
function useUser(id: string) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetchUser(id)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [id]);
  return { user, loading };
}
```

**Memoization rules:**
- `useMemo` for expensive calculations
- `useCallback` for functions passed as props to memoized children
- `React.memo` for components that re-render unnecessarily

**Don't memoize prematurely.** Profile first, then optimize.

## Data Fetching

**TanStack Query pattern:**

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  return <Profile user={data} />;
}

// Mutations
function useUpdateUser() {
  return useMutation({
    mutationFn: (data: UserUpdate) => updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
```

## Performance Patterns

**Code splitting:**

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

**Virtualization for long lists:**

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div key={item.key} style={{ position: 'absolute', top: item.start }}>
            <ListItem data={items[item.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Component Patterns

**Compound component pattern:**

```typescript
// BAD: props soup
function Dropdown({ isOpen, onToggle, onSelect, options }) { ... }

// GOOD: composed
function Dropdown({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DropdownContext.Provider value={{ isOpen, toggle: () => setIsOpen(o => !o) }}>
      {children}
    </DropdownContext.Provider>
  );
}

<Dropdown.Trigger asChild>
  <button>Open</button>
</Dropdown.Trigger>
<Dropdown.Menu>
  <Dropdown.Item onSelect={...}>Option 1</Dropdown.Item>
  <Dropdown.Item onSelect={...}>Option 2</Dropdown.Item>
</Dropdown.Menu>
```

## Error Boundaries

**Wrap sections that can fail independently:**

```typescript
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error} onRetry={...} />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
<ErrorBoundary>
  <Sidebar />
</ErrorBoundary>
```

**Error boundary isolates failures.** One component failing doesn't crash the whole page.

## Anti-Patterns

**DO NOT:**
- Use Redux for simple server data (use TanStack Query)
- Use `useEffect` for data fetching in modern React (use TanStack Query or SWR)
- Create functions inside JSX render: `{items.map(i => <Item onClick={() => handle(i)} />)}` → extract to `useCallback`
- Use default exports from barrel files: `export * from './components'` is slow for tree-shaking
- Use `index.js` barrel files at component level — explicit imports are faster
- Mutate state directly: `state.push(...)` → `setState(s => [...s, ...])`
- Leave `key={index}` on dynamic lists — use stable IDs
