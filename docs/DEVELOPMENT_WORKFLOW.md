# TrustWork Development Workflow

## 1. Coding Standards

### TypeScript & Type Safety

- Use TypeScript for all frontend code with strict mode enabled
- Define explicit interfaces and types for all function parameters and return values
- Avoid `any` type; use `unknown` when type is truly uncertain
- Use path alias `@/` for internal imports

### Code Style & Organization

- **Naming Conventions:**
  - `camelCase` for variables and functions
  - `PascalCase` for components, interfaces, and types
  - `UPPER_SNAKE_CASE` for constants
  - Use descriptive names, avoid abbreviations
- **File Structure:**
  - Place components in feature folders with index.tsx, types.ts, and utils.ts
  - Keep components under 250 lines; extract subcomponents if larger
  - Prefer named exports over default exports
- **Import Order:**
  1. External dependencies (React, third-party libraries)
  2. Internal modules (`@/` aliases)
  3. Types and interfaces
  4. Styles

### Styling & Components

- Style with Tailwind CSS and shadcn/ui components
- Use `cn()` utility for conditional classes
- Write mobile-first, responsive code
- Follow WCAG 2.1 AA accessibility standards

### Code Quality

- Document all exported functions and components with JSDoc
- Implement proper error boundaries for React components
- Use `memo`, `useCallback`, and `useMemo` for performance-critical operations
- Handle errors consistently with try-catch and user-friendly messages

---

## 2. Git Workflow & Branching

### Branch Naming

- `feature/<issue-number>-<short-description>` for new features
- `bugfix/<issue-number>-<short-description>` for bug fixes
- `chore/<description>` for maintenance tasks
- `hotfix/<critical-issue>` for production emergencies
- **Example:** `feature/123-oauth-login`

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Examples:**

- `feat(auth): add OAuth2 login flow`
- `fix(dashboard): resolve chart rendering issue`
- `docs(api): update endpoint documentation`

### Pull Requests

- **Size:** Keep PRs under 400 lines of changes; split large features into smaller PRs
- **Title:** Use conventional commit format
- **Description Must Include:**
  - Link to related issue(s)
  - Summary of changes and motivation
  - Screenshots/GIFs for UI changes
  - Testing instructions
  - Breaking changes (if any)
  - Link to updated documentation
- **Draft PRs:** Use for work-in-progress to get early feedback
- **Labels:** Apply appropriate labels (feature, bugfix, documentation, etc.)

### Code Review

- At least one approval required before merging
- Reviewers must check:
  - Code quality and adherence to standards
  - Test coverage and quality
  - Performance implications
  - Security concerns
  - Accessibility compliance
- Address all review comments before merging
- Use GitHub suggestions for minor fixes
- Re-request review after significant changes

### Merge Strategy

- Use **squash and merge** for clean Git history
- Ensure commit message follows conventional format
- Delete branch immediately after merge
- **Branch Lifetime:** Close stale branches after 14 days of inactivity

### CI/CD Requirements

All checks must pass before merging:

- TypeScript type checking
- ESLint (no errors, warnings acceptable with justification)
- Unit and integration tests
- Build succeeds
- Security scan (Snyk)
- Lighthouse CI (performance ≥90)

---

## 3. Testing Strategy

### Unit Tests

- **Framework:** Jest + React Testing Library
- **Location:** `src/**/__tests__/` or alongside components as `*.spec.tsx`
- **Coverage Requirements:**
  - Branches: ≥80%
  - Functions: ≥80%
  - Lines: ≥80%
  - Statements: ≥80%
- **Naming Pattern:**

  ```typescript
  describe('ComponentName', () => {
    it('should render correctly when given valid props', () => {
      // test implementation
    });
  });
  ```

- **Best Practices:**
  - Test behavior, not implementation
  - Use `screen` queries from Testing Library
  - Avoid snapshot tests except for static content
  - Mock external dependencies only (APIs, third-party services)
  - Keep tests focused and independent

### Integration Tests

- Test complete feature workflows and component interactions
- Use MSW (Mock Service Worker) for API mocking
- Test user journeys across multiple components
- Verify data flow and state management

### End-to-End Tests

- **Framework:** Playwright
- **Scope:** Critical user journeys only
  - Authentication flows
  - Primary user workflows
  - Payment processes
  - Data submission and retrieval
- **Best Practices:**
  - Keep E2E tests stable and fast
  - Use test IDs (`data-testid`) for reliable selectors
  - Run against staging environment
  - Parallel execution where possible

### Accessibility Tests

- **Automated:** Use `jest-axe` for WCAG 2.1 AA compliance
- **Manual Testing:**
  - Keyboard navigation (tab order, focus management)
  - Screen reader testing (NVDA/JAWS on Windows, VoiceOver on Mac)
  - Color contrast verification
  - Zoom to 200% without loss of functionality
- **Target:** Zero WCAG AA violations

### Performance Testing

- **Bundle Size:** Maximum 200KB for initial JS bundle
- **Tools:** webpack-bundle-analyzer, Lighthouse CI
- **Metrics:**
  - Largest Contentful Paint (LCP) < 2.5s
  - First Input Delay (FID) < 100ms
  - Cumulative Layout Shift (CLS) < 0.1

### Test Data Management

- Use factories or fixtures for test data
- Never use production data in tests
- Clean up test data after each test run
- Seed databases consistently for integration tests

### Handling Flaky Tests

- Quarantine flaky tests immediately
- Fix within 48 hours or remove the test
- Document known flakes in test comments
- Never merge with failing or skipped tests

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run all validations
npm run validate
```

---

## 4. Pre-Merge Checklist

### Code Quality

- [ ] TypeScript type-check passes (`npm run type-check`)
- [ ] ESLint passes with no errors (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] Test coverage ≥80% for new code (`npm run test:coverage`)
- [ ] No console errors or warnings in development

### Functionality & UI

- [ ] Feature works as expected in development
- [ ] Layout verified at breakpoints: mobile (375px), tablet (768px), desktop (1024px+)
- [ ] Tested in latest Chrome, Firefox, and Safari
- [ ] Dark mode support verified (if applicable)
- [ ] Loading and error states implemented and tested

### Performance

- [ ] Lighthouse score ≥90 for Performance, Accessibility, Best Practices
- [ ] No new bundle size regressions
- [ ] Images optimized and lazy-loaded where appropriate
- [ ] No unnecessary re-renders (check React DevTools Profiler)

### Accessibility

- [ ] Keyboard navigation works correctly
- [ ] Focus indicators visible and logical
- [ ] Screen reader tested (basic flow)
- [ ] Color contrast meets WCAG AA standards
- [ ] No new accessibility violations (`jest-axe` passes)
- [ ] ARIA labels present where needed

### Security

- [ ] Snyk security scan run, no high or critical vulnerabilities
- [ ] No sensitive data in logs or error messages
- [ ] Input validation and sanitization implemented
- [ ] Authentication/authorization verified (if applicable)

### Documentation & Communication

- [ ] Code comments added for complex logic
- [ ] JSDoc documentation for exported functions/components
- [ ] README or docs updated for major changes
- [ ] API documentation updated (if applicable)
- [ ] Changelog entry added
- [ ] Related issues linked in PR

### Database & Infrastructure

- [ ] Database migrations tested and reversible
- [ ] Environment variables documented
- [ ] Feature flags implemented for high-risk changes
- [ ] Rollback plan documented for breaking changes

---

## 5. Definition of Done

A feature is considered "done" when:

1. **Code Complete:**
   - All acceptance criteria met
   - Code reviewed and approved by at least one team member
   - All review comments addressed

2. **Quality Assured:**
   - Unit tests written and passing (≥80% coverage)
   - Integration tests passing
   - E2E tests passing for critical flows
   - No regressions introduced

3. **Standards Met:**
   - Follows coding standards and best practices
   - Accessibility requirements met (WCAG 2.1 AA)
   - Performance budgets maintained
   - Security scan passed

4. **Documented:**
   - Code documentation complete
   - User-facing documentation updated
   - Changelog updated

5. **Deployed & Verified:**
   - Deployed to staging environment
   - Smoke tested in staging
   - Product owner/stakeholder accepts feature
   - Analytics/monitoring configured

---

## 6. Release Process

### Versioning

- Follow Semantic Versioning (semver): `MAJOR.MINOR.PATCH`
  - **MAJOR:** Breaking changes
  - **MINOR:** New features (backward compatible)
  - **PATCH:** Bug fixes

### Release Checklist

- [ ] Version number updated in package.json
- [ ] CHANGELOG.md updated with all changes
- [ ] Release notes drafted (include breaking changes)
- [ ] All tests passing on main branch
- [ ] Security scan clean
- [ ] Staging environment validated
- [ ] Rollback plan documented
- [ ] Team notified of deployment schedule

### Deployment

- Deploy during low-traffic hours when possible
- Monitor error rates and performance metrics
- Keep team available for 30 minutes post-deployment
- Document any issues encountered

### Post-Release

- Verify production deployment
- Monitor dashboards for anomalies
- Close related issues and PRs
- Communicate release to stakeholders

---

## 7. Communication & Process

### Issue Severity & Response SLA

- **P0 (Critical):** Production down, data loss
  - Response: < 1 hour
  - Examples: Service outage, security breach
  
- **P1 (High):** Major feature broken, significant user impact
  - Response: < 4 hours
  - Examples: Login broken, payment processing down
  
- **P2 (Medium):** Feature partially broken, workaround exists
  - Response: < 1 business day
  - Examples: UI bugs, minor functionality issues
  
- **P3 (Low):** Minor issues, cosmetic problems
  - Response: < 1 week
  - Examples: Typos, small styling issues

### Team Rituals

- **Daily Standups:** Async or sync (15 min max)
  - What did you complete?
  - What are you working on today?
  - Any blockers?
  
- **Sprint Planning:** Bi-weekly
  - Review backlog
  - Estimate and commit to work
  
- **Retrospectives:** Bi-weekly
  - What went well?
  - What could improve?
  - Action items for next sprint

### Code Review Expectations

- Respond to review requests within 24 hours
- Provide constructive, actionable feedback
- Approve only when confident in changes
- Block merges for: security issues, broken tests, missing documentation

---

## 8. Developer Onboarding Checklist

### Week 1: Environment Setup & Access

#### Day 1: Accounts & Tools

- [ ] **GitHub Access:** Added to `mrlucas679/trust-work` repository with write permissions
- [ ] **Supabase Access:** Invited to TrustWork project (<https://app.supabase.com>)
  - Access to database dashboard
  - Access to authentication settings
  - Access to storage buckets
- [ ] **Development Tools Installed:**
  - Node.js 18.x or higher (`node --version`)
  - npm 9.x or higher (`npm --version`)
  - Git 2.x or higher (`git --version`)
  - VS Code with extensions:
    - ESLint (`dbaeumer.vscode-eslint`)
    - Prettier (`esbenp.prettier-vscode`)
    - Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
    - TypeScript Vue Plugin (`Vue.vscode-typescript-vue-plugin`)
    - GitLens (`eamodio.gitlens`)
    - Snyk Security (`snyk-security.snyk-vulnerability-scanner`)
- [ ] **Communication Channels:** Added to team Slack/Discord channels
- [ ] **Project Documentation:** Read README.md and GETTING_STARTED.md

#### Day 2: Local Development Setup

- [ ] **Fork & Clone Repository:**

  ```bash
  git clone https://github.com/[YOUR_USERNAME]/trust-work.git
  cd trust-work
  git remote add upstream https://github.com/mrlucas679/trust-work.git
  ```

- [ ] **Install Dependencies:**

  ```bash
  npm install
  ```

- [ ] **Environment Configuration:**
  - Copy `.env.example` to `.env`
  - Add Supabase credentials:
    - `VITE_SUPABASE_URL` from Supabase dashboard
    - `VITE_SUPABASE_ANON_KEY` from Supabase dashboard
  - Verify environment: `npm run dev` should start without errors
- [ ] **Database Access:** Verify Supabase connection by logging into the app
- [ ] **Run Validation Suite:**

  ```bash
  npm run type-check  # Should pass
  npm run lint        # Should pass
  npm test            # All tests should pass
  npm run validate    # Full validation
  ```

#### Day 3: Codebase Orientation

- [ ] **Architecture Review:**
  - Read `docs/ARCHITECTURE.md` - understand system design
  - Review `docs/DATABASE.md` - understand data model
  - Study `docs/DESIGN.md` - understand UI/UX patterns
- [ ] **Code Exploration:**
  - Navigate `src/components/` - understand component structure
  - Review `src/lib/supabaseClient.ts` - database client
  - Explore `src/providers/SupabaseProvider.tsx` - auth context
  - Check `src/types/` - type definitions
- [ ] **Test Exploration:**
  - Run tests with coverage: `npm run test:coverage`
  - Review test files in `src/**/__tests__/`
  - Understand test patterns (Jest + React Testing Library)

#### Day 4: Development Process

- [ ] **Workflow Understanding:**
  - Read `docs/DEVELOPMENT_WORKFLOW.md` thoroughly
  - Understand branching strategy (feature/bugfix branches)
  - Review commit message format (Conventional Commits)
  - Read `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] **Security Practices:**
  - Read `docs/SECURITY.md` - security requirements
  - Review `.github/instructions/snyk_rules.instructions.md`
  - Understand Snyk scanning process
  - Review RLS policies in `supabase/schema.sql`
- [ ] **Quality Standards:**
  - Read `docs/TESTING.md` - testing strategy
  - Understand 80% coverage requirement
  - Review accessibility standards (WCAG 2.1 AA)
  - Check performance budgets in `docs/PERFORMANCE.md`

#### Day 5: First Contribution

- [ ] **Choose First Issue:**
  - Look for issues labeled `good-first-issue` or `documentation`
  - Suggested starter tasks:
    - Fix a typo in documentation
    - Add unit test for existing component
    - Improve error message or loading state
    - Add accessibility labels to UI elements
- [ ] **Create Feature Branch:**

  ```bash
  git checkout -b feature/[issue-number]-[description]
  ```

- [ ] **Make Changes:** Follow coding standards
- [ ] **Test Changes:**

  ```bash
  npm run type-check
  npm run lint
  npm test
  npm run test:coverage  # Verify 80% coverage maintained
  ```

- [ ] **Commit & Push:**

  ```bash
  git add .
  git commit -m "feat(component): add descriptive message"
  git push origin feature/[branch-name]
  ```

- [ ] **Create Pull Request:** Use PR template, request review
- [ ] **Address Review Feedback:** Make requested changes
- [ ] **Celebrate:** First contribution merged! 🎉

### Week 2: Deep Dive

- [ ] **Pick Medium-Complexity Issue:** Label `good-second-issue` or consult mentor
- [ ] **Pair Programming Session:** Shadow experienced developer
- [ ] **Code Review Others:** Start reviewing PRs to learn codebase
- [ ] **Attend Standup:** Participate in daily team sync
- [ ] **Documentation Contribution:** Fix gaps you found as new developer

### Month 1: Full Contributor

- [ ] **Independent Feature Work:** Take on feature from planning to deployment
- [ ] **Review PRs Regularly:** 2-3 reviews per week
- [ ] **Participate in Retrospective:** Share onboarding experience
- [ ] **Mentor Next New Developer:** Share what you learned

---

## 9. Development Troubleshooting

### Common Setup Issues

#### Issue: `npm install` Fails

**Symptoms:**

- Error: "EACCES: permission denied"
- Error: "Unsupported engine"

**Solutions:**

1. **Check Node.js version:**

   ```bash
   node --version  # Should be 18.x or higher
   ```

   If wrong version, install correct version from [nodejs.org](https://nodejs.org)

2. **Clear npm cache:**

   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check file permissions:**

   ```bash
   # Windows (PowerShell as Admin):
   icacls "node_modules" /reset /T
   
   # Mac/Linux:
   sudo chown -R $USER:$GROUP ~/.npm
   sudo chown -R $USER:$GROUP node_modules
   ```

#### Issue: Supabase Connection Fails

**Symptoms:**

- "Invalid API key" error
- "Failed to fetch" when logging in
- Authentication redirects fail

**Solutions:**

1. **Verify environment variables:**

   ```bash
   # Check .env file exists and has correct values
   cat .env
   ```

   Should contain:

   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Restart dev server after .env changes:**

   ```bash
   # Stop server (Ctrl+C)
   npm run dev  # Start again
   ```

3. **Verify Supabase project is active:**
   - Go to <https://app.supabase.com>
   - Check project status (should be "Active")
   - Verify API URL and anon key in Settings > API

4. **Check network/firewall:**
   - Disable VPN temporarily
   - Check corporate firewall isn't blocking Supabase
   - Try different network

#### Issue: TypeScript Errors

**Symptoms:**

- Red squiggles in VS Code
- `npm run type-check` fails
- Import paths not resolving

**Solutions:**

1. **Restart TypeScript server in VS Code:**
   - Cmd/Ctrl + Shift + P
   - Type "TypeScript: Restart TS Server"
   - Press Enter

2. **Verify path aliases configuration:**

   ```bash
   # Check tsconfig.json has correct paths
   cat tsconfig.json | grep "@/*"
   ```

   Should show: `"@/*": ["./src/*"]`

3. **Regenerate TypeScript cache:**

   ```bash
   rm -rf node_modules/.cache
   npm run type-check
   ```

4. **Check for type definition issues:**

   ```bash
   npm install --save-dev @types/node @types/react @types/react-dom
   ```

#### Issue: Tests Failing Locally

**Symptoms:**

- Tests pass in CI but fail locally
- "Module not found" errors in tests
- Mock not working as expected

**Solutions:**

1. **Clear Jest cache:**

   ```bash
   npm test -- --clearCache
   npm test
   ```

2. **Check test environment setup:**

   ```bash
   # Verify setupTests.ts is configured
   cat src/setupTests.ts
   ```

3. **Update snapshots if needed:**

   ```bash
   npm test -- -u
   ```

4. **Run single test file for debugging:**

   ```bash
   npm test -- src/components/auth/__tests__/LoginForm.spec.tsx
   ```

#### Issue: Hot Reload Not Working

**Symptoms:**

- Changes not reflected in browser
- Need to manually refresh
- Dev server stops responding

**Solutions:**

1. **Restart dev server:**

   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

3. **Check for syntax errors:**
   - Look for console errors
   - Run `npm run lint` to find issues

4. **Increase file watcher limit (Linux/Mac):**

   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

#### Issue: Deployment Preview Fails

**Symptoms:**

- Vercel preview deployment fails
- Build succeeds locally but fails in CI

**Solutions:**

1. **Check environment variables in Vercel:**
   - Go to Vercel dashboard > Project Settings > Environment Variables
   - Ensure all `VITE_*` variables are set for Preview environment

2. **Verify build command:**

   ```bash
   # Run production build locally
   npm run build
   ```

3. **Check build logs in Vercel dashboard**

4. **Ensure dependencies are in package.json:**

   ```bash
   # Check for missing dependencies
   npm run type-check
   ```

### Getting Help

If you're still stuck after trying these solutions:

1. **Check Documentation:**
   - `docs/TROUBLESHOOTING.md` - Comprehensive troubleshooting guide
   - `docs/FAQ.md` - Common questions and answers

2. **Search Existing Issues:**
   - <https://github.com/mrlucas679/trust-work/issues>
   - Someone may have encountered the same problem

3. **Ask the Team:**
   - Post in team Slack/Discord channel
   - Tag relevant developer for specific areas
   - Include error messages and what you've tried

4. **Create GitHub Issue:**
   - Use "bug" label
   - Include: OS, Node version, error message, steps to reproduce
   - Attach screenshots if relevant

---

## 10. References & Resources

### Internal Documentation

- [Project Workflow Instructions](../.github/instructions/project_workflow.instructions.md)
- [GitHub Copilot Instructions](../.github/copilot-instructions.md)
- [Testing Guide](../TESTING_GUIDE.md)
- [Snyk Security Rules](../.github/instructions/snyk_rules.instructions.md)
- [Architecture Decision Records (ADRs)](../docs/adr/)

### External Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**Document Version:** 2.0  
**Last Updated:** October 29, 2025  
**Maintained By:** TrustWork Dev Team  
**Review Cycle:** Quarterly

---
