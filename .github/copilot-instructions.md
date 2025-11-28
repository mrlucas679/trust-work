# TrustWork AI Coding Agent Instructions

## Architecture Overview

TrustWork is a **safety-focused job marketplace** that connects job seekers with verified employers. The platform is built as a React + TypeScript + Vite application using Supabase for backend services, with emphasis on trust, security, and user safety throughout.

### Business Context
- **Verified employer profiles** with trust badges and business verification
- **Job and gig posting** capabilities for flexible work arrangements
- **User safety features** including scam prevention and reporting tools
- **Application tracking system** with skill assessments
- **Messaging system** with secure communication
- **Payment protection** for secure transactions
- **Review and rating system** for transparency
- **Safety center** with comprehensive reporting tools

### Core Stack
- **Frontend**: React 18.3 + TypeScript + Vite 5.4 + Tailwind CSS + shadcn/ui
- **UI Components**: Radix UI primitives for accessibility + Lucide React icons
- **State**: TanStack Query (React Query) for server state, React Context for auth
- **Forms**: React Hook Form + Zod validation with @hookform/resolvers
- **Theming**: next-themes for dark/light mode
- **Backend**: Supabase (auth, database, real-time subscriptions, storage)
- **Testing**: Jest + React Testing Library (80% coverage threshold) + Playwright (E2E)
- **Visualization**: Recharts for data visualization
- **Monitoring**: Web Vitals for performance monitoring, Sentry for error tracking
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

### Naming Conventions
- **Component files**: PascalCase (e.g., `VerificationBadge.tsx`)
- **Interface names**: PascalCase with Props suffix (e.g., `VerificationBadgeProps`)
- **Hook files**: camelCase with 'use' prefix (e.g., `use-toast.ts`)
- **Utility files**: kebab-case (e.g., `web-vitals.ts`)

### Component Organization
```
src/components/
├── analytics/      # Dashboard analytics components
├── applications/   # Application tracking components
├── auth/           # Authentication & business verification
├── certifications/ # Certification display
├── error/          # Error boundaries
├── layout/         # Layout components (AppLayout, DashboardLayout, etc.)
├── matching/       # Job/freelancer matching engine
├── notifications/  # Notification center & bell
├── payments/       # Payment-related components
├── portfolio/      # Portfolio management
├── pwa/            # PWA install prompts
├── quiz/           # Skills assessment quizzes
├── reviews/        # Review cards & ratings
├── search/         # Search filters & results
├── trust/          # Trust badges & verification
└── ui/             # shadcn/ui components (80+ reusable components)
```

### Component Composition Principles
- **Compound components** for complex UIs (e.g., Card with CardHeader, CardContent)
- **Render props** for flexible component APIs
- **HOCs** for shared functionality (error boundaries, route protection)
- **Composition over inheritance** - build complex UIs by composing simpler components

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

### Styling Best Practices
- **Tailwind CSS** for all styling (utility-first approach)
- **CSS Modules** for component-specific styles when needed
- **CSS variables** for theming (defined in `index.css`)
- **Responsive design** using Tailwind breakpoints (sm, md, lg, xl, 2xl)
- **CSS animations** with tailwindcss-animate plugin
- Use `cn()` utility for conditional classes, prefer Tailwind utilities

### Form Handling
- React Hook Form + Zod validation (`@hookform/resolvers`)
- Form components in `@/components/ui/form.tsx`
- Validation schemas in `src/lib/validations.ts`
- User-friendly error messages for all validation failures

### State Management
- **Server State**: TanStack Query for API calls
- **Client State**: React Context + hooks
- **Local State**: useState for component-specific state
- **Form State**: React Hook Form for form management
- **Theme State**: next-themes for dark/light mode
- **Async Operations**: Custom `use-async-operation.ts` hook

### Error Handling Patterns
- **Global error boundary** for uncaught errors
- **Component-specific error boundaries** (e.g., `SidebarErrorBoundary`)
- **Form validation errors** with React Hook Form
- **API error handling** with proper user feedback
- **User-friendly error messages** - never expose technical details

## Security & Performance

### Security
- No secrets in repository (use `.env` file)
- Supabase RLS policies enforce data access
- Input validation with Zod schemas
- SAST scanning required for security issues
- **XSS prevention** through React's built-in escaping
- **CSRF protection** implementation required
- **Secure routing** with proper authentication checks
- **Safe storage** of sensitive data
- **Two-factor authentication** support
- **User verification system** for employer trust badges

### Performance
- Lazy loading for all non-critical routes
- Component code splitting with `React.lazy()`
- Optimized bundling with Vite
- Image optimization and responsive loading
- **Web Vitals monitoring** for real-time metrics
- **Memoization** for expensive computations (React.memo, useMemo, useCallback)
- **Efficient re-rendering** strategies

### Accessibility Requirements
- **ARIA attributes** for all interactive elements
- **Keyboard navigation** support (Tab, Enter, Escape, Arrow keys)
- **Color contrast** compliance (WCAG AA minimum)
- **Screen reader** compatibility
- **Focus management** (visible focus indicators, logical tab order)
- **Skip links** for main content navigation

## Common Gotchas

1. **Layout Issues**: Never add extra navbar padding to pages - use the layout system
2. **Environment Variables**: Must prefix with `VITE_` and restart dev server after changes
3. **Path Aliases**: Use `@/` for all internal imports, configured in both Vite and Jest
4. **Mobile Breakpoint**: Use `useIsMobile()` hook, breakpoint is 768px
5. **Styling**: Use `cn()` utility for conditional classes, prefer Tailwind utilities
6. **Testing Coverage**: 80% threshold is enforced - write tests for new components

## Git Workflow & CI/CD

### Branch Strategy
- **Feature branches**: `feature/feature-name`
- **Bugfix branches**: `bugfix/issue-description`
- **Hotfix branches**: `hotfix/critical-fix`

### Commit Standards
- **Format**: `type(scope): description`
- **Types**: feat, fix, docs, style, refactor, test, chore
- **Examples**: 
  - `feat(auth): add social login buttons`
  - `fix(layout): correct navbar z-index on mobile`
  - `docs(api): update authentication flow diagram`

### Pull Request Process
- Use `.github/PULL_REQUEST_TEMPLATE.md` template
- Link related issues with keywords (Closes #123, Fixes #456)
- Ensure all CI checks pass before requesting review
- At least one approval required for merge
- Squash and merge to keep history clean

### CI/CD Considerations
- **Build optimization**: Production builds use Vite optimization
- **Environment configs**: Separate `.env` files for dev/staging/production
- **Dependency management**: Regular updates via Dependabot
- **Version control**: Semantic versioning (MAJOR.MINOR.PATCH)

## File Modification Priorities

When editing existing code, preserve:
1. Layout system integrity (navbar + sidebar + main structure)
2. Authentication flow and route protection
3. Type safety and existing interfaces
4. Test coverage requirements
5. Accessibility features (skip links, ARIA labels)

Always run the validation pipeline (`npm run validate`) before submitting changes.