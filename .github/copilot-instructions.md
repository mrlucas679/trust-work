# TrustWork AI Coding Agent Instructions

## Architecture Overview

TrustWork is a React + TypeScript + Vite freelance platform using Supabase for backend services. The app follows a layered architecture with strict layout constraints and comprehensive testing requirements.

### Core Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **State**: TanStack Query for server state, React Context for auth
- **Backend**: Supabase (auth, database, real-time subscriptions)
- **Testing**: Jest + React Testing Library (80% coverage threshold)
- **Deployment**: Static hosting with `.env` configuration

## Critical Layout Rules (STRICT)

The layout system has specific requirements that must be followed exactly:

1. **Fixed Navbar**: Always use `fixed top-0 left-0 right-0 z-50 w-full h-16`
2. **Root Wrapper**: Must use `pt-16 overflow-hidden` to offset navbar
3. **Main Content**: Use `h-[calc(100vh-4rem)] overflow-y-auto supports-[height:100dvh]:h-[calc(100dvh-4rem)]`
4. **Sidebar**: Use `fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] overflow-y-auto`
5. **Never add extra `pt-16`/`mt-16` to pages** - the layout already handles navbar offset

## Authentication Architecture

- **Provider**: `SupabaseProvider` wraps entire app, provides `{ supabase, session, user, loading }`
- **Protection**: Use `ProtectedRoute` component for private routes
- **Client**: Import singleton from `@/lib/supabaseClient.ts`
- **Environment**: Access via `import.meta.env.VITE_SUPABASE_*` only
- **Flow**: Unauthenticated users redirect to `/auth`, authenticated users go to role-specific dashboards

## Key Patterns

### Component Organization
```
src/components/
├── auth/           # Authentication components
├── layout/         # Layout components (AppLayout, DashboardLayout, etc.)
├── ui/             # shadcn/ui components (80+ reusable components)
└── feature/        # Feature-specific components (matching/, payments/, etc.)
```

### Data Flow
- **Mock Data**: `src/data/mockData.ts` contains comprehensive type definitions
- **Types**: Domain types in `src/types/` (user.ts, assignments.ts)
- **Hooks**: Custom hooks in `src/hooks/` for reusable logic
- **API**: Centralized in `src/lib/api.ts`

### Route Structure
- **Public**: `/`, `/welcome`, `/auth`, `/setup`
- **Protected**: All other routes wrapped in `ProtectedRoute`
- **Layout**: Most routes use `<AppLayout>`, some standalone (auth, assignments)
- **Lazy Loading**: All non-critical pages are lazy-loaded with `Suspense`

## Development Workflow

### Commands (Windows PowerShell)
```powershell
npm run dev              # Start dev server (port 8080)
npm run type-check       # TypeScript validation (required)
npm run lint             # ESLint validation
npm test                 # Jest test suite
npm run test:coverage    # Coverage report (80% threshold)
npm run validate         # Full validation pipeline
```

### Pre-merge Requirements
1. `npm run type-check` must pass
2. `npm run lint` must pass (address critical issues)
3. `npm test` must pass with 80% coverage
4. Manual verification: no console errors, layout works across breakpoints
5. **Security scan**: Run SAST on modified code (medium+ severity)

### Database Integration
- **Schema**: `supabase/schema.sql` defines profiles, notifications tables
- **RLS**: Row-level security enabled with policies
- **Real-time**: Notifications use Supabase subscriptions
- **Environment**: Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Testing Strategy

- **Location**: `src/**/__tests__/**` or `src/**/*.{spec,test}.{ts,tsx}`
- **Setup**: `src/setupTests.ts` configures Jest + React Testing Library
- **Coverage**: 80% threshold for branches, functions, lines, statements
- **Mocking**: CSS imports mocked with `identity-obj-proxy`
- **Aliases**: `@/` maps to `src/` in both Jest and Vite

## Component Development

### UI Components
- Use shadcn/ui components from `@/components/ui/`
- Custom components follow the `cn()` utility pattern for styling
- Mobile-first responsive design with `useIsMobile()` hook
- Accessibility: includes skip links, proper ARIA labels

### Form Handling
- React Hook Form + Zod validation (`@hookform/resolvers`)
- Form components in `@/components/ui/form.tsx`
- Validation schemas in `src/lib/validations.ts`

### State Management
- **Server State**: TanStack Query for API calls
- **Client State**: React Context + hooks
- **Local State**: useState for component-specific state
- **Async Operations**: Custom `use-async-operation.ts` hook

## Security & Performance

### Security
- No secrets in repository (use `.env` file)
- Supabase RLS policies enforce data access
- Input validation with Zod schemas
- SAST scanning required for security issues

### Performance
- Lazy loading for all non-critical routes
- Component code splitting with `React.lazy()`
- Optimized bundling with Vite
- Image optimization and responsive loading

## Common Gotchas

1. **Layout Issues**: Never add extra navbar padding to pages - use the layout system
2. **Environment Variables**: Must prefix with `VITE_` and restart dev server after changes
3. **Path Aliases**: Use `@/` for all internal imports, configured in both Vite and Jest
4. **Mobile Breakpoint**: Use `useIsMobile()` hook, breakpoint is 768px
5. **Styling**: Use `cn()` utility for conditional classes, prefer Tailwind utilities
6. **Testing Coverage**: 80% threshold is enforced - write tests for new components

## File Modification Priorities

When editing existing code, preserve:
1. Layout system integrity (navbar + sidebar + main structure)
2. Authentication flow and route protection
3. Type safety and existing interfaces
4. Test coverage requirements
5. Accessibility features (skip links, ARIA labels)

Always run the validation pipeline (`npm run validate`) before submitting changes.