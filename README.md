# TrustWork

Welcome to TrustWork — a freelance platform built with React + TypeScript + Vite and Supabase.

## Documentation

All active, project-level documentation lives in the `docs/` folder. Please check these first:

- `docs/DESIGN.md` — App design, UI system, layout rules, accessibility and patterns
- `docs/SECURITY.md` — Security policies, threat model, Snyk scan instructions
- `docs/API.md` — API endpoint specs, authentication, formats, error handling
- `docs/DEVELOPMENT_WORKFLOW.md` — Coding standards, branching, testing, and pre-merge checklist
- `docs/ARCHITECTURE.md` — (New) High-level architecture diagram and explanations

## Keep docs up to date

- Update the relevant `docs/*.md` file whenever you:
  - Add or change public-facing behavior (APIs, authentication, feature flows)
  - Change UI layout or component APIs
  - Modify security-sensitive code or dependencies
- Include a short note in the PR description describing the documentation change.

## Diagrams

- Architecture and flow diagrams live in `docs/` (Mermaid `.md` or image files). Use Mermaid when possible so diagrams stay text-editable.

## Enforcing docs in PRs

We require documentation updates for feature or breaking changes. See the PR checklist in `.github/PULL_REQUEST_TEMPLATE.md` for the policy enforced during reviews.

## Quick validation steps (before merging)

1. Type-check: `npm run type-check`
2. Lint: `npm run lint`
3. Unit tests: `npm test`
4. Coverage: `npm run test:coverage` (ensure coverage threshold)
5. Snyk scans: `snyk code test` and `snyk test`

---

**Where to start:** open `docs/DESIGN.md` to review design rules and the layout system.
