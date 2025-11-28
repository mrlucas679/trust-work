# GitHub Actions CI/CD Setup for TrustWork

This project uses GitHub Actions for continuous integration and deployment.

## 🚀 Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` or `develop` branches.

**Jobs:**

- **Test & Lint**: Runs tests, TypeScript checks, and linting on Node 18.x and 20.x
- **Build**: Creates production build and uploads artifacts
- **Security Scan**: Runs Snyk and npm audit for vulnerabilities
- **Lighthouse**: Performance checks on pull requests

### 2. Deploy Preview (`.github/workflows/deploy-preview.yml`)

Creates preview deployments for pull requests.

**Features:**

- Automatic preview URL on every PR
- Comments PR with deployment link
- Isolated preview environment

### 3. Deploy Production (`.github/workflows/deploy-production.yml`)

Deploys to production on push to `main` branch.

**Features:**

- Full validation before deploy
- Production environment protection
- Manual trigger option

## 📋 Setup Instructions

### Step 1: Add GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions → New repository secret

**Required Secrets:**

1. **Supabase Configuration:**

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Vercel Configuration (if using Vercel):**

   ```
   VERCEL_TOKEN=your-vercel-token
   VERCEL_ORG_ID=your-org-id
   VERCEL_PROJECT_ID=your-project-id
   ```

   Get these from:

   - Token: https://vercel.com/account/tokens
   - Org/Project IDs: `vercel link` command or Vercel dashboard

3. **Optional - Snyk Security (for vulnerability scanning):**
   ```
   SNYK_TOKEN=your-snyk-token
   ```
   Get from: https://snyk.io/account

### Step 2: Enable GitHub Actions

1. Go to repository → Actions tab
2. Enable workflows if prompted
3. Workflows will run automatically on next push

### Step 3: Configure Branch Protection (Recommended)

1. Go to Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Status checks: `Test & Lint`, `Build Application`
4. Save changes

## 🔄 Workflow Triggers

| Workflow          | Trigger                 | Purpose                   |
| ----------------- | ----------------------- | ------------------------- |
| CI                | Push/PR to main/develop | Run tests, lint, build    |
| Deploy Preview    | PR opened/updated       | Create preview deployment |
| Deploy Production | Push to main            | Deploy to production      |

## 📊 Status Badges

Add these to your README.md:

```markdown
![CI Status](https://github.com/mrlucas679/trust-work/workflows/CI%2FCD%20Pipeline/badge.svg)
![Deploy Status](https://github.com/mrlucas679/trust-work/workflows/Deploy%20Production/badge.svg)
```

## 🛠️ Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
choco install act-cli

# Run CI workflow locally
act push

# Run specific job
act -j test
```

## 🔒 Security Best Practices

1. ✅ Secrets are encrypted and never exposed in logs
2. ✅ Dependencies are cached for faster builds
3. ✅ Security scans run on every push
4. ✅ Production deployments require manual approval
5. ✅ Artifacts are retained for 7 days only

## 📈 Monitoring

- **Test Coverage**: Reports uploaded to Codecov (if configured)
- **Build Artifacts**: Available in Actions tab for 7 days
- **Lighthouse Scores**: Performance metrics on each PR
- **Security Alerts**: Dependabot and Snyk notifications

## 🚨 Troubleshooting

### Build fails with "Secret not found"

- Verify secrets are added in repository settings
- Check secret names match exactly (case-sensitive)

### Tests timeout or fail

- Increase timeout in workflow file: `timeout-minutes: 10`
- Check test commands in package.json

### Deployment fails

- Verify Vercel tokens are valid
- Check build output for errors
- Ensure environment variables are set

## 🎯 Next Steps

1. ✅ Workflows created
2. ⏳ Add GitHub secrets (follow Step 1 above)
3. ⏳ Push to trigger first workflow run
4. ⏳ Configure branch protection rules
5. ⏳ Connect Vercel/deployment platform
6. ⏳ Add status badges to README

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [Snyk GitHub Actions](https://docs.snyk.io/integrations/ci-cd-integrations/github-actions-integration)
