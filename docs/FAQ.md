# TrustWork Frequently Asked Questions (FAQ)

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Engineering Team

---

## Table of Contents

1. [General Questions](#general-questions)
2. [Development Setup](#development-setup)
3. [Contributing](#contributing)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)
7. [Architecture & Design](#architecture--design)
8. [Security](#security)

---

## General Questions

### What is TrustWork?

TrustWork is a modern freelance platform connecting skilled freelancers with clients seeking quality services. Built with React, TypeScript, and Supabase, it provides a seamless experience for job seekers and employers.

**Key Features:**

- User profiles for freelancers and clients
- Assignment creation and application system
- Real-time notifications
- Business verification for employers
- Mobile-responsive design

**Tech Stack:**

- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime)
- Testing: Jest + Playwright
- Deployment: Vercel

### What is the project status?

TrustWork v1.0.0 (MVP) was released on November 1, 2024. The platform is actively maintained and accepting contributions.

**Current Focus:**

- Improving test coverage (target: 80%)
- Enhancing accessibility (WCAG 2.1 AA)
- Performance optimization
- Security hardening

### Who maintains TrustWork?

TrustWork is maintained by the Engineering Team. For questions:

- **General**: GitHub Discussions
- **Bugs**: GitHub Issues
- **Security**: <security@trustwork.com> (private)
- **Private inquiries**: <support@trustwork.com>

### What license does TrustWork use?

TBD. See `LICENSE` file in repository root (to be added).

---

## Development Setup

### What are the prerequisites?

**Required:**

- Node.js 18 or higher
- npm 9 or higher
- Git
- Supabase account (free tier works)
- GitHub account

**Recommended:**

- VS Code with extensions (ESLint, Prettier, Tailwind IntelliSense)
- 8GB RAM
- 2GB free disk space

### How do I set up the project locally?

```bash
# 1. Clone repository
git clone https://github.com/mrlucas679/trust-work.git
cd trust-work

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Run development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:8080
```

**Detailed guide:** [GETTING_STARTED.md](./GETTING_STARTED.md)

### Where do I get Supabase credentials?

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
5. Paste into `.env` file
6. Run database migrations from `supabase/schema.sql`

### Why does `npm install` take so long?

Installing 50+ dependencies takes 2-3 minutes on first run. This is normal.

**Speed up subsequent installs:**

- Use `npm ci` (faster, uses lockfile)
- Clear cache: `npm cache clean --force` (if corrupted)
- Check internet connection (downloads from npm registry)

### How do I update dependencies?

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update <package-name>

# Update all packages (be careful)
npm update

# Or use npm-check-updates
npx npm-check-updates -u
npm install
```

**Important:** Always test after updating dependencies. Run `npm run validate`.

---

## Contributing

### How can I contribute?

We welcome contributions! Here's how to start:

1. **Read documentation:**
   - [CONTRIBUTING.md](../CONTRIBUTING.md)
   - [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
   - [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) (when available)

2. **Find an issue:**
   - Browse [GitHub Issues](https://github.com/mrlucas679/trust-work/issues)
   - Look for `good first issue` or `help wanted` labels

3. **Make changes:**
   - Fork repository
   - Create feature branch
   - Write code and tests
   - Submit pull request

**First-time contributors:** Start with documentation improvements or small bug fixes.

### What should I work on?

**Good First Issues:**

- Documentation improvements
- UI polish (spacing, colors, fonts)
- Adding tests for existing code
- Fixing minor bugs

**More Involved:**

- New features (check roadmap)
- Performance optimization
- Accessibility improvements
- Security enhancements

**Check:** [GitHub Projects](https://github.com/mrlucas679/trust-work/projects) for prioritized work.

### What is the branching strategy?

- **`main`**: Production-ready code, always deployable
- **`working-version`**: Integration branch, where features merge
- **`feature/*`**: New features (e.g., `feature/123-oauth-login`)
- **`bugfix/*`**: Bug fixes (e.g., `bugfix/124-layout-gap`)
- **`chore/*`**: Maintenance (e.g., `chore/update-deps`)

**Workflow:**

1. Branch from `working-version`
2. Make changes
3. Create PR to `working-version`
4. After review, merge to `working-version`
5. Periodically merge `working-version` → `main` for releases

### How do I write a good commit message?

Follow **Conventional Commits** format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**

```
feat(auth): add Google OAuth login
fix(dashboard): resolve chart rendering issue
docs(api): update endpoint documentation
test(profile): add ProfileForm integration tests
```

---

## Testing

### How do I run tests?

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (Playwright)
npx playwright test

# Run specific test file
npm test -- ProfileForm.test.tsx
```

### What is the test coverage requirement?

**80% coverage** for:

- Branches
- Functions
- Lines
- Statements

**Check coverage:**

```bash
npm run test:coverage
# Opens HTML report in browser
```

**Focus on:**

- Business logic functions
- React components (user interactions)
- API integration code
- Critical user flows

### How do I write tests?

**Unit test example:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits form with email and password', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });
});
```

**Detailed guide:** [TESTING.md](./TESTING.md)

### Do I need to write E2E tests?

E2E tests are **recommended** for:

- New user-facing features
- Critical user flows (auth, payments)
- Complex multi-step processes

Not required for:

- Small UI tweaks
- Documentation changes
- Internal utilities

**When in doubt:** Ask in PR review.

---

## Deployment

### How is TrustWork deployed?

**Automated deployment:**

1. Push to `main` branch
2. GitHub Actions runs CI/CD pipeline:
   - Type check
   - Lint
   - Tests
   - Security scan (Snyk)
3. If all checks pass, deploy to Vercel
4. Vercel builds and deploys to production

**Manual deployment:**

```bash
vercel --prod
```

### How do I deploy to staging?

Push to `working-version` branch:

```bash
git push origin working-version
```

GitHub Actions automatically deploys to staging environment.

### What if deployment fails?

1. **Check GitHub Actions logs:**
   - Go to repository → Actions tab
   - Click failed workflow
   - Review error logs

2. **Common failures:**
   - Type errors: Run `npm run type-check` locally
   - Test failures: Run `npm test` locally
   - Security issues: Run `snyk test` locally

3. **Rollback if needed:**
   - Go to Vercel Dashboard
   - Find previous working deployment
   - Click "Promote to Production"

**Detailed guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

### Can I deploy my own instance?

Yes! Fork the repository and deploy to your own Vercel account:

1. Fork repository on GitHub
2. Create Vercel account
3. Import project from GitHub
4. Set environment variables in Vercel
5. Deploy

**Note:** You'll need your own Supabase project.

---

## Troubleshooting

### Module not found: @/

**Problem:** Import with `@/` alias fails.

**Solution:**

1. Verify `tsconfig.json` has path alias
2. Restart TypeScript server (VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server")
3. Restart dev server: `npm run dev`

**Detailed guide:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#module-not-found-)

### Supabase connection failed

**Problem:** Cannot connect to Supabase.

**Solution:**

1. Check `.env` file exists with correct values
2. Verify Supabase project is active (not paused)
3. Restart dev server after `.env` changes
4. Test connection in Supabase Dashboard

**Detailed guide:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#supabase-connection-failed-during-setup)

### Tests are failing

**Problem:** Tests pass locally but fail in CI, or vice versa.

**Solution:**

1. Clear Jest cache: `npx jest --clearCache`
2. Delete `node_modules` and reinstall: `npm install`
3. Check environment variables in CI
4. Run tests with CI flag: `CI=true npm test`

**Detailed guide:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#testing-issues)

### Port 8080 already in use

**Problem:** Dev server won't start.

**Solution (Windows PowerShell):**

```powershell
# Find process using port 8080
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess

# Kill process (replace <PID> with actual ID)
Stop-Process -Id <PID> -Force
```

**Alternative:** Change port in `vite.config.ts` to 3000 or 5173.

### Where can I get help?

1. **Search documentation:** Check relevant .md files in `docs/`
2. **Search issues:** [GitHub Issues](https://github.com/mrlucas679/trust-work/issues)
3. **Ask in Discussions:** [GitHub Discussions](https://github.com/mrlucas679/trust-work/discussions)
4. **Create issue:** If bug or feature request
5. **Email:** <support@trustwork.com> (non-public questions)

---

## Architecture & Design

### Why React instead of Vue or Angular?

**Reasons for React:**

- Large ecosystem and community
- Mature tooling (Vite, Testing Library, DevTools)
- Strong TypeScript support
- Team expertise
- Great for SPAs

**See:** [ADR 0002](./adr/0002-use-react-frontend.md) (if available)

### Why Supabase instead of Firebase?

**Reasons for Supabase:**

- Open source (can self-host)
- PostgreSQL (powerful SQL database)
- Row Level Security (RLS) for data access
- RESTful and real-time APIs
- Lower cost at scale

**See:** [ADR 0001](./adr/0001-use-supabase-for-backend.md)

### What is the folder structure?

```
src/
├── components/       # React components by feature
│   ├── auth/        # Authentication components
│   ├── layout/      # Layout components (navbar, sidebar)
│   └── ui/          # Reusable UI components (shadcn/ui)
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configuration
├── pages/           # Page components (routes)
├── providers/       # Context providers
└── types/           # TypeScript type definitions
```

**Detailed guide:** [ARCHITECTURE.md](./ARCHITECTURE.md)

### How does authentication work?

1. User submits email/password or clicks OAuth button
2. Request sent to Supabase Auth
3. Supabase validates credentials and returns JWT
4. JWT stored in localStorage
5. JWT sent with all API requests in Authorization header
6. Supabase verifies JWT and enforces RLS policies

**Flow diagram:** [ARCHITECTURE.md - Authentication Flow](./ARCHITECTURE.md#authentication-flow)

### How does the layout system work?

**Fixed navbar + scrolling content:**

```tsx
<div className="pt-16 overflow-hidden">
  {/* Fixed navbar (always at top) */}
  <nav className="fixed top-0 left-0 right-0 z-50 h-16">
    Navbar
  </nav>
  
  {/* Main content (scrolls independently) */}
  <main className="h-[calc(100vh-4rem)] overflow-y-auto">
    Page content
  </main>
</div>
```

**Key points:**

- Root has `pt-16` to offset fixed navbar
- Navbar uses `fixed top-0` to stay at top
- Main uses `h-[calc(100vh-4rem)]` for full viewport height minus navbar
- **Never** add extra `pt-16` to pages

**Detailed guide:** [DESIGN.md - Layout System](./DESIGN.md#layout-system)

---

## Security

### How is user data protected?

**Security measures:**

1. **Encryption:** All data encrypted in transit (HTTPS) and at rest
2. **Row Level Security:** Database policies restrict data access per user
3. **Authentication:** JWT tokens with expiration
4. **Input validation:** Zod schemas validate all form inputs
5. **XSS prevention:** React escapes output automatically
6. **CSRF protection:** Supabase includes CSRF tokens
7. **Rate limiting:** API requests limited to prevent abuse

**Detailed guide:** [SECURITY.md](./SECURITY.md)

### How do I report a security vulnerability?

**DO NOT** open a public GitHub issue.

**Email:** <security@trustwork.com>

**Include:**

- Description of vulnerability
- Steps to reproduce
- Impact assessment
- Suggested fix (if any)

**Response time:** Within 48 hours

**Detailed guide:** [SECURITY.md - Reporting](./SECURITY.md#reporting-vulnerabilities)

### Is my Supabase anon key secret?

**No.** The anon key is public and sent to the browser.

**Security comes from:**

- Row Level Security (RLS) policies in database
- JWT verification for authenticated requests
- Rate limiting on API endpoints

**Keep secret:**

- Supabase service role key (never commit or expose)
- User passwords
- JWT tokens

**Never commit:**

- `.env` file
- API keys
- Database passwords

---

## Need More Help?

### Documentation

- **Getting Started:** [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Contributing:** [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Development Workflow:** [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
- **Testing Guide:** [TESTING.md](./TESTING.md)
- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **API Reference:** [API.md](./API.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Design System:** [DESIGN.md](./DESIGN.md)
- **Security:** [SECURITY.md](./SECURITY.md)
- **Database:** [DATABASE.md](./DATABASE.md)
- **Performance:** [PERFORMANCE.md](./PERFORMANCE.md)
- **Monitoring:** [MONITORING.md](./MONITORING.md)
- **Glossary:** [GLOSSARY.md](./GLOSSARY.md)

### Community

- **GitHub Discussions:** Ask questions, share ideas
- **GitHub Issues:** Report bugs, request features
- **Pull Requests:** Contribute code
- **Email:** <support@trustwork.com>

---

**Document Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Engineering Team

_Can't find your question? Ask in GitHub Discussions or create an issue._
