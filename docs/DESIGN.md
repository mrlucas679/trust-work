# TrustWork App Design Document

## 1. Design Principles & Goals

### Core Principles

- **Mobile-first, responsive UI** - Design for mobile devices first, then enhance for larger screens
- **Accessibility for all users** - WCAG 2.1 AA compliance minimum
- **Consistent layout and navigation** - Predictable user experience across all pages
- **Clean, modern aesthetic** - Using Tailwind CSS and shadcn/ui components
- **Maintainable, scalable component structure** - Follow atomic design principles
- **Performance-first** - Optimize for fast load times and smooth interactions
- **User-centric design** - Prioritize user needs and workflows

### Design Goals

- Achieve sub-3-second initial page load
- Support offline-first functionality where applicable
- Ensure 100% keyboard navigability
- Maintain visual consistency across all components
- Provide clear feedback for all user actions
- Support dark mode throughout the application

---

## 2. Architecture Overview

### Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **State Management:** TanStack Query (server state), React Context (UI state)
- **Backend:** Supabase (authentication, PostgreSQL database, real-time subscriptions)
- **Styling:** Tailwind CSS v3 + shadcn/ui components
- **Testing:** Jest + React Testing Library + Playwright (E2E)
- **Build Tool:** Vite (with SWC for faster compilation)

### Layout System (Critical Rules)

#### Global Layout Structure

```tsx
// Fixed Navbar
className="fixed top-0 left-0 right-0 z-50 w-full h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"

// Root Wrapper (for all pages)
className="pt-16 overflow-hidden min-h-screen"

// Main Content Area
className="h-[calc(100vh-4rem)] overflow-y-auto supports-[height:100dvh]:h-[calc(100dvh-4rem)]"

// Sidebar (Desktop)
className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r bg-background/95 backdrop-blur"

// Mobile Sidebar (Sheet overlay)
className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
```

#### Important Layout Rules

- **Never add extra padding/margin** to compensate for navbar - use the root wrapper's `pt-16`
- **Sidebar width:** Desktop: `w-64` (256px), collapsed: `w-16` (64px)
- **Main content left offset** when sidebar is open: `md:ml-64` or `md:ml-16`
- **Z-index layers:** Navbar (50), Sidebar (30), Modals/Dialogs (50), Toasts/Notifications (100)
- **Scrolling:** Only main content area scrolls, navbar and sidebar remain fixed

---

## 3. Design System

### Color Palette

```typescript
// Base colors (using CSS variables)
--background: 0 0% 100%;           // White
--foreground: 222.2 84% 4.9%;     // Near black

--card: 0 0% 100%;
--card-foreground: 222.2 84% 4.9%;

--primary: 222.2 47.4% 11.2%;     // Dark blue-gray
--primary-foreground: 210 40% 98%;

--secondary: 210 40% 96.1%;       // Light blue-gray
--secondary-foreground: 222.2 47.4% 11.2%;

--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;

--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;

--destructive: 0 84.2% 60.2%;     // Red
--destructive-foreground: 210 40% 98%;

--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 222.2 84% 4.9%;

// Dark mode (when implemented)
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
```

### Typography Scale

```typescript
// Font families
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

// Scale (Tailwind classes)
text-xs:   12px / 16px
text-sm:   14px / 20px
text-base: 16px / 24px
text-lg:   18px / 28px
text-xl:   20px / 28px
text-2xl:  24px / 32px
text-3xl:  30px / 36px
text-4xl:  36px / 40px

// Font weights
font-normal:  400
font-medium:  500
font-semibold: 600
font-bold:    700
```

### Spacing System

```typescript
// Use Tailwind's default 4px scale
0.5: 2px    | 1: 4px     | 2: 8px     | 3: 12px
4: 16px     | 5: 20px    | 6: 24px    | 8: 32px
10: 40px    | 12: 48px   | 16: 64px   | 20: 80px
24: 96px    | 32: 128px  | 40: 160px  | 48: 192px

// Component spacing patterns
Card padding: p-6 (24px)
Section gaps: space-y-6 (24px)
Form fields: space-y-4 (16px)
Button padding: px-4 py-2 (16px × 8px)
```

### Border Radius

```typescript
rounded-sm:   2px   // Small elements (badges, pills)
rounded:      4px   // Inputs, small buttons
rounded-md:   6px   // Cards, larger buttons (DEFAULT)
rounded-lg:   8px   // Modals, large containers
rounded-xl:   12px  // Hero sections, featured cards
rounded-2xl:  16px  // Page-level containers
rounded-full: 9999px // Avatars, circular buttons
```

### Shadows & Elevation

```typescript
// Subtle elevation
shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:     0 1px 3px 0 rgb(0 0 0 / 0.1)
shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1)

// Prominent elevation (modals, dropdowns)
shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1)
shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1)
shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

### Animation & Transitions

```typescript
// Duration
duration-75:   75ms   // Micro-interactions
duration-100:  100ms  // Hover effects
duration-150:  150ms  // DEFAULT for most transitions
duration-200:  200ms  // Opening/closing small elements
duration-300:  300ms  // Opening/closing modals
duration-500:  500ms  // Page transitions

// Easing
ease-in:     cubic-bezier(0.4, 0, 1, 1)
ease-out:    cubic-bezier(0, 0, 0.2, 1)   // DEFAULT
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)

// Common patterns
transition-colors:    color, background-color, border-color
transition-opacity:   opacity
transition-transform: transform
transition-all:       all properties (use sparingly)
```

---

## 4. UI/UX Guidelines

### Component Usage

- **Always use shadcn/ui components** from `src/components/ui/` as base
- **Style with Tailwind utilities** and the `cn()` helper for conditional classes
- **Use `useIsMobile()` hook** for responsive breakpoints (default: 768px)
- **Compose components** following atomic design: atoms → molecules → organisms

### Responsive Design Strategy

```typescript
// Breakpoint system (Tailwind defaults)
sm:  640px  // Small tablets
md:  768px  // Tablets, main mobile/desktop breakpoint
lg:  1024px // Small desktops
xl:  1280px // Large desktops
2xl: 1536px // Extra large screens

// Mobile-first approach
// Base styles: mobile (< 768px)
// Then add: md:, lg:, xl: for larger screens

// Example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Accessibility Requirements

#### Keyboard Navigation

- All interactive elements must be focusable
- Use `tabIndex={0}` for custom interactive elements
- Provide visible focus indicators: `focus:ring-2 focus:ring-primary focus:ring-offset-2`
- Implement skip links: `<a href="#main-content" className="sr-only focus:not-sr-only">`
- Support common keyboard shortcuts (Esc, Enter, Space, Arrow keys)

#### Screen Readers

- Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<section>`)
- Add ARIA labels: `aria-label`, `aria-labelledby`, `aria-describedby`
- Indicate loading states: `aria-busy="true"`, `aria-live="polite"`
- Mark decorative images: `alt=""` or `role="presentation"`
- Provide status announcements for dynamic content

#### Color & Contrast

- Maintain WCAG AA contrast ratios (4.5:1 for text, 3:1 for large text)
- Never rely on color alone to convey information
- Support dark mode with appropriate contrast adjustments
- Test with color blindness simulators

### Form Design

```typescript
// Use React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Form component pattern
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="you@example.com" {...field} />
        </FormControl>
        <FormDescription>
          We'll never share your email.
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>

// Validation patterns
- Show errors inline below fields
- Use FormDescription for helpful hints
- Disable submit button while submitting
- Show loading state in button
- Provide success feedback after submission
```

### Loading States

```typescript
// Skeleton screens (preferred for initial loads)
<Skeleton className="h-4 w-full" />
<Skeleton className="h-20 w-full rounded-lg" />

// Spinners (for actions/refetching)
<Loader2 className="h-4 w-4 animate-spin" />

// Optimistic updates (use TanStack Query)
const mutation = useMutation({
  onMutate: async (newData) => {
    // Optimistically update UI
  },
});
```

### Error Handling

```typescript
// Toast notifications (temporary feedback)
import { useToast } from '@/components/ui/use-toast';
toast({
  title: "Error",
  description: "Something went wrong. Please try again.",
  variant: "destructive",
});

// Error boundaries (catch React errors)
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>

// Empty states (no data)
<div className="flex flex-col items-center justify-center py-12">
  <Inbox className="h-12 w-12 text-muted-foreground" />
  <h3 className="mt-4 text-lg font-semibold">No messages yet</h3>
  <p className="text-sm text-muted-foreground">
    Start a conversation to see messages here.
  </p>
</div>
```

### Feedback Mechanisms

- **Hover states:** Use `hover:bg-accent` for clickable elements
- **Active states:** Use `active:scale-95` for buttons
- **Disabled states:** Use `disabled:opacity-50 disabled:cursor-not-allowed`
- **Success:** Green checkmarks, success toasts
- **Warnings:** Yellow/orange alert icons, warning toasts
- **Errors:** Red X icons, destructive toasts
- **Progress:** Progress bars, step indicators

---

## 5. Common Components & Patterns

### Layout Components

#### AppLayout

```typescript
// Main application wrapper
<AppLayout>
  <Navbar />
  <div className="flex">
    <Sidebar />
    <main className="flex-1 p-6">
      {children}
    </main>
  </div>
</AppLayout>
```

#### DashboardLayout

```typescript
// Dashboard-specific layout with sidebar
<DashboardLayout>
  <DashboardSidebar />
  <main className="ml-64 p-8">
    {children}
  </main>
</DashboardLayout>
```

### Navigation Components

#### Navbar

- Sticky at top, semi-transparent with backdrop blur
- Contains logo, primary navigation, user menu
- Mobile: Hamburger menu that opens sidebar overlay

#### Sidebar

- Fixed on desktop (left side)
- Sheet overlay on mobile
- Collapsible (wide ↔ narrow)
- Active link highlighting
- Organized by feature sections

### Feature Folders

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types.ts
│   ├── matching/
│   ├── payments/
│   ├── notifications/
│   └── profile/
```

### Custom Hooks

```typescript
// Common hooks in src/hooks/
useAuth()          // Authentication state
useIsMobile()      // Responsive breakpoint
useDebounce()      // Debounce input values
useLocalStorage()  // Persist to localStorage
useMediaQuery()    // Custom media queries
useOnClickOutside() // Detect clicks outside element
```

### Shared Components

```
src/components/
├── ui/           // shadcn/ui base components
├── layout/       // Layout components (Navbar, Sidebar, etc.)
├── forms/        // Reusable form components
└── common/       // Shared business components (Avatar, Card, etc.)
```

---

## 6. Performance Optimization

### Code Splitting

```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));

<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### Image Optimization

- Use modern formats (WebP, AVIF)
- Implement lazy loading: `loading="lazy"`
- Provide responsive images with `srcset`
- Use CDN for static assets
- Optimize image dimensions before upload

### Bundle Optimization

- Tree-shake unused code
- Minimize third-party dependencies
- Use dynamic imports for heavy libraries
- Enable gzip/brotli compression
- Monitor bundle size with `vite-plugin-bundle-analyzer`

### Caching Strategy

```typescript
// TanStack Query cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

---

## 7. Testing Strategy

### Unit Tests (Jest + RTL)

```typescript
// Test user interactions, component rendering, hooks
describe('LoginForm', () => {
  it('should display validation errors', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText('Sign In'));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
  });
});
```

### Integration Tests

- Test feature workflows (e.g., complete booking flow)
- Mock API calls with MSW (Mock Service Worker)
- Test error states and loading states

### E2E Tests (Playwright)

```typescript
// Test critical user journeys
test('user can create a booking', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('text=Create Booking');
  await page.fill('input[name="title"]', 'Test Booking');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Booking created')).toBeVisible();
});
```

### Accessibility Tests

- Use `jest-axe` for automated a11y checks
- Manual testing with screen readers (NVDA, VoiceOver)
- Keyboard navigation testing

---

## 8. Known Issues & Roadmap

### Current Issues

- [ ] **Layout gaps on some breakpoints** → Audit all pages using layout checklist
- [ ] **Inconsistent sidebar scroll behavior** → Standardize fixed positioning
- [ ] **Missing focus indicators** → Add consistent focus styles globally
- [ ] **Insufficient error boundaries** → Wrap all routes with error boundaries
- [ ] **No loading states for mutations** → Add loading indicators to all forms
- [ ] **Inconsistent spacing** → Create spacing tokens and enforce usage

### Planned Improvements

- [ ] **Dark mode implementation** → Add theme toggle and dark color palette
- [ ] **Offline support** → Implement service worker for PWA capabilities
- [ ] **Animation library** → Add Framer Motion for complex animations
- [ ] **Storybook integration** → Document all components in Storybook
- [ ] **Design tokens** → Extract colors/spacing to JSON for design-dev handoff
- [ ] **Component library documentation** → Create internal component docs site
- [ ] **Accessibility audit** → Conduct full WCAG 2.1 AA audit
- [ ] **Performance monitoring** → Add Sentry/LogRocket for real-user monitoring

---

## 9. Component Catalog

### Real Component Examples

This section provides concrete examples from the TrustWork codebase to serve as references for new components.

#### Authentication Components

**Location:** `src/components/auth/`

```tsx
// Example: ProtectedRoute component
// File: src/components/auth/ProtectedRoute.tsx
// Purpose: Wraps routes that require authentication

import { useSupabase } from '@/providers/SupabaseProvider';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabase();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
```

**Key patterns:**

- Hook-based authentication check
- Loading state handling
- Redirect for unauthorized users
- Type-safe children prop

#### Form Components

**Location:** `src/components/ui/form.tsx` + feature folders

```tsx
// Example: AssignmentForm with React Hook Form + Zod
// File: src/components/matching/AssignmentForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const assignmentSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budget: z.number().positive('Budget must be positive'),
  deadline: z.date().min(new Date(), 'Deadline must be in the future'),
  required_skills: z.array(z.string()).min(1, 'Select at least one skill'),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

export function AssignmentForm() {
  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      required_skills: [],
    },
  });

  const onSubmit = async (data: AssignmentFormData) => {
    // API call logic
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignment Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields... */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create Assignment'}
        </Button>
      </form>
    </Form>
  );
}
```

**Key patterns:**

- Zod schema validation
- Type inference from schema
- Controlled inputs with React Hook Form
- Loading states on submit buttons
- Accessible form structure (FormLabel, FormMessage)

#### Layout Components

**Location:** `src/components/layout/`

```tsx
// Example: AppLayout with fixed navbar + scrollable main
// File: src/components/layout/AppLayout.tsx

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full h-16 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-full px-4">
          <Logo />
          <UserMenu />
        </div>
      </nav>

      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 z-50"
      >
        Skip to main content
      </a>

      {/* Main content with pt-16 offset and scroll */}
      <main
        id="main-content"
        className="pt-16 h-[calc(100vh-4rem)] overflow-y-auto supports-[height:100dvh]:h-[calc(100dvh-4rem)]"
      >
        {children}
      </main>
    </div>
  );
}
```

**Key patterns:**

- Fixed navbar with z-50
- pt-16 offset for navbar height (h-16 = 4rem)
- Scrollable main content with calc()
- Skip link for accessibility
- Backdrop blur effect

#### Data Display Components

**Location:** `src/components/matching/`, `src/components/notifications/`

```tsx
// Example: NotificationList with Realtime subscription
// File: src/components/notifications/NotificationList.tsx

import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useEffect } from 'react';

export function NotificationList() {
  const { supabase, user } = useSupabase();

  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, refetch]);

  if (!notifications?.length) {
    return <EmptyState message="No notifications yet" />;
  }

  return (
    <div className="space-y-2">
      {notifications.map((notif) => (
        <NotificationCard key={notif.id} notification={notif} />
      ))}
    </div>
  );
}
```

**Key patterns:**

- TanStack Query for data fetching
- Realtime subscriptions for live updates
- Empty state handling
- Cleanup function for subscriptions
- Optimistic UI updates via refetch

---

## 10. Mobile Testing Guide

### Device Coverage

Test on these minimum device configurations:

| Device Type | Screen Size | OS | Browser |
|-------------|-------------|-----|---------|
| iPhone SE | 375x667 | iOS 15+ | Safari |
| iPhone 14 Pro | 393x852 | iOS 16+ | Safari |
| Samsung Galaxy S22 | 360x800 | Android 12+ | Chrome |
| iPad Pro | 1024x1366 | iPadOS 16+ | Safari |
| Desktop | 1920x1080 | Windows/Mac | Chrome/Firefox |

### Testing Checklist

#### Layout & Responsiveness

- [ ] Navbar stays fixed on scroll (no gap)
- [ ] Sidebar transforms to sheet on mobile
- [ ] Main content scrolls independently
- [ ] No horizontal overflow at any breakpoint
- [ ] Touch targets are at least 44x44px
- [ ] Form inputs are not obscured by keyboard

#### Interactions

- [ ] Tap/click targets work as expected
- [ ] Swipe gestures (if applicable) function
- [ ] Forms submit correctly on mobile
- [ ] Date pickers use native controls on mobile
- [ ] File uploads work on mobile devices
- [ ] Modals/dialogs are scrollable on small screens

#### Performance

- [ ] Initial load < 3 seconds on 3G
- [ ] No layout shift (CLS < 0.1)
- [ ] Smooth scrolling (60fps)
- [ ] Images lazy-load correctly
- [ ] Font loading doesn't cause FOIT/FOUT

#### Accessibility

- [ ] Zoom to 200% without breaking layout
- [ ] Touch targets don't overlap
- [ ] Skip links work on focus
- [ ] Screen reader announces page changes
- [ ] Color contrast passes WCAG AA

### Testing Tools

- **Chrome DevTools:** Device emulation + throttling
- **BrowserStack:** Real device testing
- **Lighthouse:** Performance audits (mobile profile)
- **Playwright:** Automated mobile E2E tests

```typescript
// Example: Playwright mobile test config
// File: playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

---

## 11. Dark Mode Implementation Guide

### Setup

TrustWork uses CSS variables for theming. Dark mode requires updating these variables and providing a toggle.

#### Step 1: Define Dark Mode Colors

Add to `src/index.css`:

```css
/* Light mode (default) - already exists */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... existing colors */
}

/* Dark mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

#### Step 2: Create Theme Provider

Create `src/providers/ThemeProvider.tsx`:

```tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem('theme', newTheme);
      setTheme(newTheme);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

#### Step 3: Add Theme Toggle Component

Create `src/components/ui/theme-toggle.tsx`:

```tsx
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

#### Step 4: Integrate into App

Update `src/main.tsx`:

```tsx
import { ThemeProvider } from '@/providers/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SupabaseProvider>
        <App />
      </SupabaseProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

Add toggle to navbar:

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

// In your navbar component
<nav>
  {/* ... other elements */}
  <ThemeToggle />
</nav>
```

---

## 12. Storybook Setup Guide

### Installation

```powershell
npm install --save-dev @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-a11y
npx storybook@latest init --type react-vite
```

### Configuration

Create `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': path.resolve(__dirname, '../src'),
        },
      },
    };
  },
};

export default config;
```

Create `.storybook/preview.tsx`:

```typescript
import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

### Example Story

Create `src/components/ui/button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};
```

### Run Storybook

```powershell
npm run storybook
```

---

## 13. Design Checklist

### Before Implementing New Features

- [ ] Design mobile layout first
- [ ] Create desktop/tablet variations
- [ ] Document component API and props
- [ ] Add to Storybook (if available)
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Verify color contrast ratios
- [ ] Add loading and error states
- [ ] Write unit tests
- [ ] Update this design document

### Before Deploying

- [ ] Run full test suite
- [ ] Check bundle size
- [ ] Test on real devices (iOS, Android)
- [ ] Verify accessibility with tools (Lighthouse, axe)
- [ ] Review error tracking setup
- [ ] Check performance metrics (Lighthouse)
- [ ] Update documentation

---

## 10. References & Resources

### Documentation

- [Project Workflow Instructions](../.github/instructions/project_workflow.instructions.md)
- [Copilot Instructions](../.github/copilot-instructions.md)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [React Docs](https://react.dev/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)

### Design Inspiration

- [Dribbble](https://dribbble.com/) - UI/UX inspiration
- [Mobbin](https://mobbin.com/) - Mobile app patterns
- [Refactoring UI](https://www.refactoringui.com/) - Design tips

### Tools

- [Figma](https://figma.com) - Design mockups and prototyping
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - WCAG contrast verification
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing

---

**Document Version:** 3.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Development Team

_This document should be treated as a living document. All major UI/UX changes, new patterns, and design decisions should be reflected here._
