# Getting Started with TrustWork

Welcome to TrustWork! This guide will help you set up the development environment and get the application running locally.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Project Structure](#project-structure)
6. [Development Workflow](#development-workflow)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Tool | Minimum Version | Download |
|------|----------------|----------|
| **Node.js** | 18.x or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x or higher | Included with Node.js |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### Recommended Tools

- **VS Code**: Code editor ([code.visualstudio.com](https://code.visualstudio.com/))
- **VS Code Extensions**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript + JavaScript Grammar
  - GitLens

### Accounts

- **Supabase Account**: Sign up at [supabase.com](https://supabase.com/)
- **GitHub Account**: For version control and collaboration

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 8 GB minimum (16 GB recommended)
- **Disk Space**: 2 GB for project and dependencies

---

## Installation

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/mrlucas679/trust-work.git

# Or via SSH (if configured)
git clone git@github.com:mrlucas679/trust-work.git

# Navigate to project directory
cd trust-work
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - React, TypeScript, Vite (build tooling)
# - Supabase client
# - TanStack Query
# - shadcn/ui components
# - Testing libraries (Jest, Playwright)
```

**Installation Time:** ~2-3 minutes depending on internet speed

---

## Configuration

### 1. Set Up Supabase Project

1. **Create a new project:**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Fill in project details (name, database password, region)
   - Wait for project to provision (~2 minutes)

2. **Get API credentials:**
   - Navigate to Project Settings → API
   - Copy the following:
     - `Project URL` (e.g., `https://abcdef.supabase.co`)
     - `anon/public` key (long string starting with `eyJ...`)

3. **Run database migrations:**
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents of `supabase/schema.sql` from your local project
   - Paste into SQL Editor and run
   - Verify tables were created (profiles, notifications, business_verifications)

4. **Set up storage:**
   - Copy contents of `supabase/storage-setup.sql`
   - Run in SQL Editor
   - Verify buckets were created (avatars, attachments, documents)

### 2. Configure Environment Variables

1. **Create `.env` file:**

   ```bash
   # Copy example file
   cp .env.example .env
   ```

2. **Edit `.env` with your credentials:**

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here

   # Optional: Development Configuration
   VITE_DEV_MODE=true
   ```

3. **Verify configuration:**

   ```bash
   # Check env variables are loaded
   npm run dev
   # If you see connection errors, double-check your credentials
   ```

**⚠️ Important:** Never commit `.env` to version control. It's already in `.gitignore`.

---

## Running the Application

### Development Server

```bash
# Start development server
npm run dev

# Server starts on http://localhost:8080
# - Hot Module Replacement (HMR) enabled
# - TypeScript type checking in terminal
# - Automatic browser reload on changes
```

Open your browser and navigate to [http://localhost:8080](http://localhost:8080).

### Build for Production

```bash
# Create optimized production build
npm run build

# Output: dist/ directory with static files
# - Minified JavaScript
# - Optimized CSS
# - Code splitting for smaller bundles
```

### Preview Production Build

```bash
# Build and preview locally
npm run build
npm run preview

# Preview server starts on http://localhost:4173
```

---

## Project Structure

```
trust-work/
├── .github/                    # GitHub Actions workflows, PR templates
├── docs/                       # Documentation
│   ├── adr/                    # Architecture Decision Records
│   ├── API.md                  # API documentation
│   ├── ARCHITECTURE.md         # System architecture
│   ├── DATABASE.md             # Database schema
│   ├── DESIGN.md               # UI/UX design system
│   ├── DEVELOPMENT_WORKFLOW.md # Coding standards
│   ├── SECURITY.md             # Security policy
│   └── TESTING.md              # Testing guide
├── public/                     # Static assets
│   └── robots.txt
├── src/                        # Source code
│   ├── components/             # React components
│   │   ├── auth/               # Authentication components
│   │   ├── layout/             # Layout components
│   │   └── ui/                 # shadcn/ui components
│   ├── data/                   # Mock data and types
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and config
│   │   ├── api.ts              # API client functions
│   │   ├── supabaseClient.ts   # Supabase client singleton
│   │   └── utils.ts            # Utility functions
│   ├── pages/                  # Page components
│   ├── providers/              # Context providers
│   ├── types/                  # TypeScript types
│   ├── App.tsx                 # Main App component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── supabase/                   # Supabase configuration
│   ├── schema.sql              # Database schema
│   └── storage-setup.sql       # Storage bucket setup
├── .env                        # Environment variables (not in Git)
├── .env.example                # Example env file
├── .gitignore                  # Git ignore rules
├── CHANGELOG.md                # Version history
├── CONTRIBUTING.md             # Contribution guidelines
├── README.md                   # Project overview
├── jest.config.ts              # Jest configuration
├── package.json                # npm dependencies and scripts
├── playwright.config.ts        # Playwright E2E config
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
└── vite.config.ts              # Vite bundler config
```

### Key Directories

- **`src/components/`**: All React components organized by feature
- **`src/hooks/`**: Custom React hooks (e.g., `use-debounce`, `use-async-operation`)
- **`src/lib/`**: Utilities, API clients, validation schemas
- **`src/pages/`**: Top-level page components mapped to routes
- **`src/providers/`**: Context providers (e.g., `SupabaseProvider`)
- **`src/types/`**: TypeScript type definitions

---

## Development Workflow

### Creating a New Feature

1. **Create a branch:**

   ```bash
   git checkout -b feature/123-new-feature
   ```

2. **Make changes:**
   - Write code following [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
   - Add tests for new functionality
   - Update documentation if needed

3. **Verify changes:**

   ```bash
   # Type check
   npm run type-check

   # Lint
   npm run lint

   # Run tests
   npm test

   # Run all checks
   npm run validate
   ```

4. **Commit changes:**

   ```bash
   git add .
   git commit -m "feat(feature): add new feature"
   ```

5. **Push and create PR:**

   ```bash
   git push origin feature/123-new-feature
   # Then create Pull Request on GitHub
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Examples:**

```bash
git commit -m "feat(auth): add OAuth login"
git commit -m "fix(dashboard): resolve chart rendering bug"
git commit -m "docs(api): update endpoint documentation"
```

---

## Common Tasks

### Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-run on changes)
npm run test:watch

# With coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Code Quality Checks

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Run all validations
npm run validate
```

### Database Tasks

```bash
# Apply schema changes
# 1. Update supabase/schema.sql
# 2. Run in Supabase SQL Editor

# Check profiles table
npx tsx scripts/check-profiles.ts

# Create test data
# Edit supabase/seed.sql, then run in SQL Editor
```

### Working with Components

```bash
# Create new component (manual)
mkdir src/components/feature-name
touch src/components/feature-name/ComponentName.tsx
touch src/components/feature-name/__tests__/ComponentName.test.tsx

# Follow component structure from docs/DESIGN.md
```

---

## Troubleshooting

### Common Issues

#### 1. "Supabase connection failed"

**Solution:**

- Verify `.env` file exists and contains correct credentials
- Check Supabase project is active (not paused)
- Restart dev server: `Ctrl+C`, then `npm run dev`

#### 2. "Module not found: Can't resolve '@/...'"

**Solution:**

- Ensure `tsconfig.json` has path alias configured
- Restart TypeScript server in VS Code: `Cmd+Shift+P` → "Restart TS Server"

#### 3. "Type errors in components"

**Solution:**

```bash
# Update types from Supabase schema
npm run type-check
# Check for any missing imports or type definitions
```

#### 4. "Tests failing after dependency update"

**Solution:**

```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 5. "Port 8080 already in use"

**Solution:**

```bash
# Kill process on port 8080 (Windows)
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or change port in vite.config.ts
```

For more troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

---

## Next Steps

Now that you have the project running, explore these resources:

### Learn the Codebase

- **[DESIGN.md](./DESIGN.md)**: UI/UX design system and component patterns
- **[API.md](./API.md)**: API endpoints and authentication
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System architecture and diagrams
- **[DATABASE.md](./DATABASE.md)**: Database schema and RLS policies

### Development Resources

- **[DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)**: Coding standards and Git workflow
- **[TESTING.md](./TESTING.md)**: Testing strategy and examples
- **[CONTRIBUTING.md](../CONTRIBUTING.md)**: Contribution guidelines

### Build Features

1. **Create a user profile:** Sign up and complete onboarding
2. **Explore the UI:** Navigate through different pages
3. **Inspect components:** Check `src/components/` for examples
4. **Run tests:** Understand how tests are structured
5. **Make a small change:** Try modifying a component and seeing it update

### Join the Community

- **GitHub Issues**: Report bugs or suggest features
- **GitHub Discussions**: Ask questions and share ideas
- **Pull Requests**: Contribute code improvements

---

## Additional Resources

### Documentation

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vite.dev/guide/)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)

### Tutorials

- [React Tutorial](https://react.dev/learn)
- [TypeScript for Beginners](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check existing documentation** in `docs/` folder
2. **Search GitHub Issues** for similar problems
3. **Ask in GitHub Discussions** for community help
4. **Contact maintainers** via email or GitHub

---

**Welcome to the TrustWork team! Happy coding! 🎉**

---

**Document Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Engineering Team
