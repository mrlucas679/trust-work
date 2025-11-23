# TrustWork Glossary

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Documentation Team

---

## Overview

This glossary defines technical terms, acronyms, and concepts used throughout the TrustWork project and documentation.

---

## A

### A11y

**Accessibility.** "A11y" is a numeronym (numerically-based abbreviation) for accessibility, where "11" represents the 11 letters between "a" and "y".

### ADR

**Architecture Decision Record.** A document that captures an important architectural decision along with its context and consequences. See `docs/adr/` for TrustWork's ADRs.

### API

**Application Programming Interface.** A set of rules and protocols for building and interacting with software. TrustWork uses Supabase's RESTful API for data access.

### Auth

**Authentication.** The process of verifying the identity of a user. TrustWork uses Supabase Auth with email/password and OAuth providers (Google, GitHub).

---

## B

### Bundle

The compiled JavaScript file(s) sent to the browser. TrustWork uses Vite to create optimized bundles with code splitting.

### Bundle Size

The total size of JavaScript and CSS files loaded by the browser. Target: <500KB gzipped for initial load.

---

## C

### CDN

**Content Delivery Network.** A distributed network of servers that delivers content to users based on their geographic location. Vercel's edge network acts as TrustWork's CDN.

### CI/CD

**Continuous Integration/Continuous Deployment.** Automated processes for testing and deploying code. TrustWork uses GitHub Actions for CI/CD pipelines.

### CLS

**Cumulative Layout Shift.** A Core Web Vital that measures visual stability. Target: <0.1. Tracks unexpected layout shifts during page load.

### Code Splitting

Breaking a large JavaScript bundle into smaller chunks that are loaded on demand, improving initial page load time.

### Component

A reusable piece of UI in React. TrustWork components are located in `src/components/` organized by feature.

### Core Web Vitals

Google's standardized metrics for measuring user experience:

- **LCP** (Largest Contentful Paint): Loading performance
- **FID** (First Input Delay): Interactivity
- **CLS** (Cumulative Layout Shift): Visual stability

### CSP

**Content Security Policy.** HTTP headers that help prevent XSS attacks by controlling which resources can be loaded. TrustWork configures CSP headers in `vercel.json`.

### CSRF

**Cross-Site Request Forgery.** An attack that tricks users into performing unwanted actions. Supabase includes CSRF protection automatically.

---

## D

### DAST

**Dynamic Application Security Testing.** Security testing performed on running applications. Example tools: OWASP ZAP, Burp Suite.

### Dark Mode

A color scheme using dark backgrounds and light text, easier on the eyes in low-light conditions. TrustWork supports dark mode through Tailwind CSS classes.

### Database Migration

A script that modifies database schema (tables, columns, indexes). TrustWork migrations are documented in `docs/DATABASE.md`.

### Dev Server

Local development server that serves the application with hot module replacement (HMR). Start with `npm run dev`.

### Deployment

The process of making application changes available to users. TrustWork deploys to Vercel via GitHub Actions.

---

## E

### E2E

**End-to-End (Testing).** Testing complete user workflows from start to finish. TrustWork uses Playwright for E2E tests.

### Edge Network

Distributed servers that cache and serve content close to users, reducing latency. Vercel uses a global edge network.

### Environment Variables

Configuration values stored outside of code. TrustWork uses `.env` files and Vercel environment settings. Must prefix with `VITE_`.

### ESLint

A JavaScript linter that identifies and fixes code quality issues. Configured in `eslint.config.js`.

---

## F

### FID

**First Input Delay.** A Core Web Vital measuring interactivity. Target: <100ms. Time from user interaction to browser response.

### Freelancer

A TrustWork user who applies for assignments and provides services. Stored in `profiles` table with `role='freelancer'`.

---

## G

### Git

Version control system for tracking code changes. TrustWork uses Git with GitHub as the remote repository.

### GitHub Actions

GitHub's CI/CD platform for automating workflows. TrustWork workflows are in `.github/workflows/`.

---

## H

### HMR

**Hot Module Replacement.** Development feature that updates modules in the browser without full page reload. Enabled by Vite.

### Hook

React function that lets you use state and lifecycle features in functional components. Custom hooks are in `src/hooks/`.

### HTTP/2

Network protocol that improves performance through multiplexing and header compression. Vercel uses HTTP/2 automatically.

### HTTPS

**Hypertext Transfer Protocol Secure.** Encrypted HTTP using TLS. All TrustWork connections use HTTPS.

---

## I

### IaC

**Infrastructure as Code.** Managing infrastructure through code rather than manual processes. TrustWork uses `vercel.json` for deployment config.

### Idempotent

An operation that produces the same result regardless of how many times it's executed. Important for API design and database migrations.

### Index (Database)

Data structure that improves query performance. TrustWork indexes are documented in `docs/DATABASE.md`.

---

## J

### Jest

JavaScript testing framework. TrustWork uses Jest with React Testing Library for unit and integration tests.

### JSX

**JavaScript XML.** Syntax extension for JavaScript used in React to describe UI structure. Files use `.tsx` extension (TypeScript JSX).

### JWT

**JSON Web Token.** Compact token format for securely transmitting information. Supabase uses JWTs for authentication.

---

## K

### Kebab-case

Naming convention using lowercase letters separated by hyphens. Example: `user-profile-page`. Used for file names and CSS classes.

---

## L

### Lazy Loading

Deferring loading of resources until they're needed. TrustWork lazy loads routes and images to improve initial page load.

### LCP

**Largest Contentful Paint.** A Core Web Vital measuring loading performance. Target: <2.5s. Time to render the largest visible element.

### Linter

Tool that analyzes code for potential errors and style issues. TrustWork uses ESLint.

### LocalStorage

Browser API for storing key-value pairs persistently. Used for theme preferences and session tokens.

---

## M

### Memoization

Optimization technique that caches function results to avoid redundant calculations. React provides `useMemo` and `useCallback` hooks.

### Migration

See **Database Migration**.

### Mock

Simulated object used in testing to replace real dependencies. TrustWork mocks Supabase client in tests.

### MVP

**Minimum Viable Product.** The simplest version of a product with core features. TrustWork v1.0.0 is the MVP.

---

## N

### Node.js

JavaScript runtime for server-side execution. Required version: 18+.

### npm

**Node Package Manager.** Tool for installing and managing JavaScript packages. TrustWork uses npm (not yarn or pnpm).

---

## O

### OAuth

**Open Authorization.** Protocol for third-party authentication. TrustWork supports Google and GitHub OAuth.

### ORM

**Object-Relational Mapping.** Technique for interacting with databases using objects rather than SQL. Supabase client provides ORM-like interface.

---

## P

### Path Alias

Shortcut for import paths. TrustWork uses `@/` to reference `src/`. Example: `import Button from '@/components/ui/button'`.

### Playwright

End-to-end testing framework. TrustWork uses Playwright for automated browser testing.

### Polling

Repeatedly checking for updates at regular intervals. Less efficient than push-based updates like Supabase Realtime.

### PostgreSQL

Open-source relational database. Supabase uses PostgreSQL 15 with extensions.

### PR

**Pull Request.** Proposed code changes submitted for review. TrustWork uses PR template in `.github/PULL_REQUEST_TEMPLATE.md`.

### Props

**Properties.** Data passed from parent to child components in React. Should be typed with TypeScript interfaces.

### PWA

**Progressive Web App.** Web applications that provide app-like experiences. TrustWork has PWA capabilities through Vite.

---

## Q

### Query

1. Database query to retrieve or modify data
2. TanStack Query: Library for fetching, caching, and updating server state

### Query Client

TanStack Query's client that manages cache and requests. Configured in `src/providers/QueryProvider.tsx`.

---

## R

### Rate Limiting

Restricting the number of requests a user can make in a time period. TrustWork implements rate limiting in Supabase functions.

### React

JavaScript library for building user interfaces. TrustWork uses React 18 with functional components.

### React Query

See **TanStack Query**.

### Realtime

Supabase feature for receiving live database changes via WebSockets. Used for notifications in TrustWork.

### Refactor

Restructuring code without changing its behavior, typically to improve readability or performance.

### Repository (Repo)

Storage location for code and version history. TrustWork repo: `mrlucas679/trust-work`.

### REST API

**Representational State Transfer API.** Architectural style for APIs using HTTP methods. Supabase provides RESTful API.

### RLS

**Row Level Security.** PostgreSQL feature that restricts data access at the row level. All TrustWork tables use RLS policies.

### RPO

**Recovery Point Objective.** Maximum acceptable data loss in disaster recovery. TrustWork target: 1 hour.

### RTO

**Recovery Time Objective.** Maximum acceptable downtime in disaster recovery. TrustWork target: 4 hours.

### RTL

**React Testing Library.** Library for testing React components by simulating user interactions.

---

## S

### SAST

**Static Application Security Testing.** Security analysis of source code without execution. TrustWork uses Snyk Code for SAST.

### SCA

**Software Composition Analysis.** Security scanning of open-source dependencies. TrustWork uses Snyk Open Source for SCA.

### Schema

Structure of database tables, columns, and relationships. Defined in `supabase/schema.sql`.

### SDK

**Software Development Kit.** Collection of tools for developing applications. Supabase JavaScript SDK: `@supabase/supabase-js`.

### Seed Data

Initial data loaded into database for testing or development. Example: `supabase/seed.sql`.

### SEO

**Search Engine Optimization.** Practices for improving search engine rankings. TrustWork uses semantic HTML and meta tags.

### SPA

**Single Page Application.** Web app that loads a single HTML page and dynamically updates content. TrustWork is an SPA.

### SQL

**Structured Query Language.** Language for managing relational databases. TrustWork uses SQL for migrations and complex queries.

### SSR

**Server-Side Rendering.** Rendering HTML on the server rather than in the browser. TrustWork uses client-side rendering (CSR).

### State

Data that changes over time in an application. React manages state with hooks like `useState` and `useReducer`.

### Supabase

Open-source Firebase alternative providing database, auth, storage, and realtime features. TrustWork's backend platform.

---

## T

### Tailwind CSS

Utility-first CSS framework. TrustWork uses Tailwind v3 for styling. Configuration: `tailwind.config.ts`.

### TanStack Query

Powerful data synchronization library for React (formerly React Query). Manages server state in TrustWork.

### TDD

**Test-Driven Development.** Development approach where tests are written before code. Recommended but not required for TrustWork.

### Technical Debt

Shortcuts or suboptimal solutions that need future refactoring. Tracked in GitHub Issues with `tech-debt` label.

### Tree Shaking

Build optimization that removes unused code. Vite performs tree shaking automatically.

### TTFB

**Time to First Byte.** Time from request to receiving the first byte of response. Target: <600ms.

### Type Safety

Using TypeScript to catch type errors at compile time rather than runtime. TrustWork has strict mode enabled.

### TypeScript

JavaScript superset that adds static typing. TrustWork uses TypeScript 5.8+ with strict mode.

---

## U

### UI

**User Interface.** Visual elements users interact with. TrustWork uses shadcn/ui component library.

### Unit Test

Test that verifies a single function or component in isolation. TrustWork unit tests use Jest + RTL.

### Uptime

Percentage of time a system is operational. TrustWork target: 99.9% (43 minutes downtime per month).

### UX

**User Experience.** Overall experience of using the application, including usability and satisfaction.

---

## V

### Validation

Checking data for correctness before processing. TrustWork uses Zod for runtime validation.

### Vercel

Cloud platform for hosting static sites and serverless functions. TrustWork's hosting provider.

### Virtual DOM

In-memory representation of actual DOM elements. React uses Virtual DOM for efficient updates.

### Virtualization

Rendering only visible items in long lists. TrustWork uses `@tanstack/react-virtual` for performance.

### Vite

Next-generation frontend build tool. TrustWork uses Vite 5 for fast development and optimized builds.

---

## W

### WCAG

**Web Content Accessibility Guidelines.** Standards for making web content accessible. TrustWork targets WCAG 2.1 Level AA.

### WebSocket

Protocol for full-duplex communication between client and server. Supabase Realtime uses WebSockets.

### Web Vitals

See **Core Web Vitals**.

---

## X

### XSS

**Cross-Site Scripting.** Security vulnerability where attackers inject malicious scripts. TrustWork prevents XSS through:

- React's automatic escaping
- Content Security Policy (CSP)
- Input sanitization

---

## Z

### Zod

TypeScript-first schema validation library. TrustWork uses Zod for form validation and API response validation.

---

## Acronyms Quick Reference

| Acronym | Full Form |
|---------|-----------|
| A11y | Accessibility |
| ADR | Architecture Decision Record |
| API | Application Programming Interface |
| CDN | Content Delivery Network |
| CI/CD | Continuous Integration/Continuous Deployment |
| CLS | Cumulative Layout Shift |
| CORS | Cross-Origin Resource Sharing |
| CSP | Content Security Policy |
| CSRF | Cross-Site Request Forgery |
| DAST | Dynamic Application Security Testing |
| E2E | End-to-End |
| FID | First Input Delay |
| HMR | Hot Module Replacement |
| HTTP | Hypertext Transfer Protocol |
| HTTPS | Hypertext Transfer Protocol Secure |
| IaC | Infrastructure as Code |
| JSX | JavaScript XML |
| JWT | JSON Web Token |
| LCP | Largest Contentful Paint |
| MVP | Minimum Viable Product |
| OAuth | Open Authorization |
| ORM | Object-Relational Mapping |
| PR | Pull Request |
| PWA | Progressive Web App |
| REST | Representational State Transfer |
| RLS | Row Level Security |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| RTL | React Testing Library |
| SAST | Static Application Security Testing |
| SCA | Software Composition Analysis |
| SDK | Software Development Kit |
| SEO | Search Engine Optimization |
| SPA | Single Page Application |
| SQL | Structured Query Language |
| SSR | Server-Side Rendering |
| TDD | Test-Driven Development |
| TTFB | Time to First Byte |
| UI | User Interface |
| UX | User Experience |
| WCAG | Web Content Accessibility Guidelines |
| XSS | Cross-Site Scripting |

---

## References

- [React Glossary](https://react.dev/learn/glossary)
- [MDN Web Docs Glossary](https://developer.mozilla.org/en-US/docs/Glossary)
- [Supabase Glossary](https://supabase.com/docs/guides/platform/glossary)
- [Web.dev Glossary](https://web.dev/glossary/)

---

**Document Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Documentation Team

_This glossary is a living document. Suggest additions via PR._
