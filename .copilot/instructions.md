# TrustWork Project Instructions

## Project Overview

TrustWork is a safety-focused job marketplace application that connects job seekers with verified employers. The platform emphasizes trust and security in the job search process, featuring:

- Verified employer profiles with trust badges
- Job and gig posting capabilities
- User safety features and scam prevention
- Application tracking system
- Messaging system
- Payment protection
- Review and rating system
- Skills assessment platform
- Safety center and reporting tools

## Detected Tech Stack

### Frontend

- React 18.3 with TypeScript
- Vite 5.4 as build tool
- React Router v6 for routing
- TanStack Query (React Query) for data management
- Tailwind CSS with shadcn/ui components
- Radix UI primitives for accessible components
- Lucide React for icons
- Next-themes for theming
- React Hook Form with Zod for form validation
- Recharts for data visualization
- Web Vitals for performance monitoring

### Development Tools

- TypeScript
- ESLint with TypeScript configuration
- PostCSS with Autoprefixer
- SWC for fast compilation

## Coding Conventions

### TypeScript & React

- Functional components with TypeScript interfaces
- Hooks for state management and side effects
- Lazy loading for route components
- Error boundaries for fault tolerance
- Props interfaces prefixed with component name (e.g., `VerificationBadgeProps`)

### File & Component Organization

- PascalCase for component files and folders
- Feature-based folder structure
- Components grouped by domain (`trust/`, `payments/`, etc.)
- Shared UI components in `components/ui/`
- Page components in `pages/`
- Hooks in `hooks/` directory
- Utility functions in `lib/`

### Naming Conventions

- Interface names: PascalCase with Props suffix (e.g., `ComponentNameProps`)
- Component files: PascalCase (e.g., `VerificationBadge.tsx`)
- Hook files: camelCase with 'use' prefix (e.g., `use-toast.ts`)
- Utility files: kebab-case (e.g., `web-vitals.ts`)

## Frontend Patterns

### Component Architecture

- Shared layout components in `layout/`
- Feature-specific components in domain folders
- Reusable UI components in `ui/`
- Pages as route components in `pages/`
- Lazy loading for non-critical routes

### State Management

- React Query for server state
- Local state with React hooks
- Form state with React Hook Form
- Theme state with next-themes

### Styling

- Tailwind CSS for styling
- CSS Modules for component-specific styles
- CSS variables for theming
- Responsive design using Tailwind breakpoints
- CSS animations with tailwindcss-animate

### Component Composition

- Compound components for complex UIs
- Render props for flexible component APIs
- HOCs for shared functionality
- Component composition over inheritance

## Security & Performance Guidelines

### Security

- Input validation using Zod schemas
- XSS prevention through React's built-in escaping
- CSRF protection implementation required
- Secure routing with proper authentication checks
- Safe storage of sensitive data
- Two-factor authentication support
- User verification system

### Performance

- Code splitting with React.lazy()
- Route-based chunking
- Web Vitals monitoring
- Image optimization required
- Proper error boundaries implementation
- Memoization for expensive computations
- Efficient re-rendering strategies

## File Structure Overview

```text
src/
├── components/       # Reusable components
│   ├── layout/      # Layout components
│   ├── trust/       # Trust-related components
│   ├── payments/    # Payment-related components
│   └── ui/          # Common UI components
├── pages/           # Route components
├── hooks/           # Custom hooks
├── lib/             # Utility functions
└── data/           # Mock data and constants
```

## Additional Guidelines

### Testing Patterns

- Unit tests for utility functions
- Component testing with React Testing Library
- E2E testing with Cypress (to be implemented)
- Test coverage reporting

### Error Handling

- Global error boundary implementation
- Form validation error handling
- API error handling patterns
- User-friendly error messages

### Accessibility

- ARIA attributes usage
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility
- Focus management

### Documentation

- Component documentation with prop types
- Inline comments for complex logic
- JSDoc for utility functions
- README updates for new features

### Git Workflow

- Feature branch naming: `feature/feature-name`
- Commit message format: `type(scope): description`
- PR templates usage
- Code review guidelines

### CI/CD Considerations

- Build optimization
- Environment-specific configurations
- Dependency management
- Version control

Remember to maintain the existing patterns and enhance security features, as this is a trust-focused platform. All new features should prioritize user safety and data protection.
