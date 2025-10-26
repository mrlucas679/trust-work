---
applyTo: "**"
description: Project workflow and pre-merge checks for TrustWork
---

# TrustWork project workflow and pre-merge checks

This guidance helps keep layout behavior consistent, wire Supabase safely, and ensure quality/security before merge or release.

## Layout and scrolling (navbar + sidebar + main)
- Keep the top navbar fixed at the very top at all times:
  - Navbar element should use: `fixed top-0 left-0 right-0 z-50 w-full h-16`.
- Offset the page for the fixed navbar at the wrapper, not inside content:
  - Root wrapper uses: `pt-16 overflow-hidden`.
- Main content must scroll independently of the navbar and sidebar:
  - Main container uses: `h-[calc(100vh-4rem)] overflow-y-auto supports-[height:100dvh]:h-[calc(100dvh-4rem)]`.
- Sidebar must be independently scrollable and respect the navbar height:
  - Sidebar container uses: `fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] overflow-y-auto`.
- Don’t add extra top padding/margins (`pt-16`/`mt-16`) to pages inside the main area; the layout already offsets for the navbar.
- Verify at multiple breakpoints to ensure no gap appears on scroll.

## Supabase usage
- Environment variables: ensure `.env` contains valid values and is not committed:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Client: use the singleton from `src/lib/supabaseClient.ts`.
- Context: consume `{ supabase, session, user, loading }` from `SupabaseProvider` (wraps the app in `src/main.tsx`).
- Routing guard: use `src/components/auth/ProtectedRoute.tsx` to protect private routes. Unauthed users are redirected to `/auth`.
- Auth page should use `supabase.auth.signInWithPassword`, `signUp`, and navigate after success. Handle loading and error states.
- Never log or commit secrets. Use `.env` and Vite env access via `import.meta.env` only.

## Quality gates (run before merge)
1. Type-check: `npm run -s type-check` must pass.
2. Lint (if configured): `npm run -s lint` must pass.
3. Unit tests (if present): `npm test` must pass locally.
4. Manual run: start the dev server and verify no console errors; ensure navbar/sidebar scroll behavior is correct across screen sizes.
5. Security: run SAST on modified code and verify no new issues.
   - Use Snyk Code scan at repo root with medium severity or above.

## Definition of done (per PR)
- Layout: no scroll-gap between navbar and content at any size; sidebar scrolls independently; navbar remains fixed and on top.
- Supabase: auth flows function; protected routes are enforced; no secrets in repo.
- Accessibility: interactive elements have discernible labels; keyboard navigation works for main flows.
- DX: no TypeScript errors; minimal console warnings; updated docs if behavior changed.

## Notes
- Prefer CSS calc() and Tailwind utility classes for heights/offsets.
- Prefer `100dvh` support for modern browsers with a fallback to `100vh`.
- Keep auth redirects minimal and deterministic; avoid long chains.