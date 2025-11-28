# TrustWork Troubleshooting Guide

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Engineering Team

---

## Table of Contents

1. [Installation & Setup Issues](#installation--setup-issues)
2. [Development Issues](#development-issues)
3. [Database Issues](#database-issues)
4. [Authentication Issues](#authentication-issues)
5. [UI & Layout Issues](#ui--layout-issues)
6. [Performance Issues](#performance-issues)
7. [Testing Issues](#testing-issues)
8. [Deployment Issues](#deployment-issues)
9. [Quick Reference](#quick-reference)

---

## Installation & Setup Issues

### npm install fails with dependency conflicts

**Problem:** Installation fails with peer dependency warnings or conflicts.

**Symptoms:**

```
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! Found: react@18.3.1
npm ERR! Could not resolve dependency
```

**Root Cause:** Package version incompatibilities or corrupted npm cache.

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps

# If still failing, try
npm install --force
```

**Prevention:**

- Keep dependencies up to date
- Use exact versions in package.json for critical packages
- Document any `--legacy-peer-deps` requirements

---

### Supabase connection failed during setup

**Problem:** Cannot connect to Supabase project after setup.

**Symptoms:**

```
Error: Invalid Supabase URL
FetchError: request to https://xxx.supabase.co failed
```

**Root Cause:** Incorrect environment variables or paused Supabase project.

**Solution:**

1. **Verify environment variables:**

   ```bash
   # Check .env file exists and has correct values
   cat .env
   ```

2. **Verify Supabase project:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Check if project is active (not paused)
   - Verify API credentials match .env

3. **Test connection:**

   ```typescript
   // Add to src/main.tsx temporarily
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Has anon key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

4. **Restart dev server:**

   ```bash
   # Vite requires restart after .env changes
   npm run dev
   ```

**Prevention:**

- Use `.env.example` as template
- Document setup in README
- Add validation in `src/lib/envValidation.ts`

---

### Module not found: @/

**Problem:** Import statements with `@/` alias fail.

**Symptoms:**

```
Error: Cannot find module '@/components/ui/button'
Module not found: Error: Can't resolve '@/lib/utils'
```

**Root Cause:** TypeScript/Vite path alias not configured or IDE not recognizing it.

**Solution:**

1. **Verify tsconfig.json:**

   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **Verify vite.config.ts:**

   ```typescript
   import path from 'path';
   
   export default defineConfig({
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   });
   ```

3. **Restart TypeScript server:**
   - VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

4. **Restart dev server:**

   ```bash
   npm run dev
   ```

**Prevention:**

- Use consistent import style throughout project
- Document path alias in GETTING_STARTED.md

---

### Port 8080 already in use

**Problem:** Dev server won't start because port is occupied.

**Symptoms:**

```
Error: listen EADDRINUSE: address already in use :::8080
```

**Root Cause:** Another process is using port 8080 or previous dev server didn't terminate.

**Solution:**

1. **Find process using port:**

   ```powershell
   # Windows PowerShell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess
   
   # Or use netstat
   netstat -ano | findstr :8080
   ```

2. **Kill process:**

   ```powershell
   # Replace <PID> with actual process ID
   Stop-Process -Id <PID> -Force
   ```

3. **Or change port in vite.config.ts:**

   ```typescript
   export default defineConfig({
     server: {
       port: 3000, // Use different port
     },
   });
   ```

**Prevention:**

- Always stop dev server with `Ctrl+C`
- Use task manager to close orphaned Node processes

---

## Development Issues

### TypeScript errors in IDE but build succeeds

**Problem:** Red squiggly lines in editor but `npm run build` works.

**Symptoms:**

- IDE shows type errors
- `npm run type-check` passes
- Build succeeds

**Root Cause:** IDE using different TypeScript version or stale cache.

**Solution:**

1. **Restart TypeScript server:**
   - VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

2. **Verify TypeScript version:**

   ```bash
   # Check project version
   npm list typescript
   
   # Check IDE version (VS Code: bottom right corner)
   ```

3. **Select correct TypeScript version:**
   - VS Code: Click TypeScript version in bottom right
   - Select "Use Workspace Version"

4. **Clear TypeScript cache:**

   ```bash
   Remove-Item -Recurse -Force node_modules/.cache
   ```

**Prevention:**

- Use workspace TypeScript version
- Keep IDE extensions updated

---

### Hot reload not working

**Problem:** Changes to files don't trigger browser refresh.

**Symptoms:**

- Edit file and save
- Browser doesn't update
- No errors in console

**Root Cause:** Vite HMR connection lost or file watcher issue.

**Solution:**

1. **Check browser console:**
   - Look for HMR connection errors
   - Network tab: verify WebSocket connection

2. **Restart dev server:**

   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R`

4. **Check file watcher limits (Linux/WSL):**

   ```bash
   # Increase limit
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

**Prevention:**

- Don't exceed file watcher limits
- Keep browser console open to catch errors

---

### Infinite re-render loop

**Problem:** Component re-renders infinitely, browser freezes.

**Symptoms:**

```
Maximum update depth exceeded. This can happen when a component
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
```

**Root Cause:** State update in useEffect without dependencies or in render.

**Solution:**

1. **Check useEffect dependencies:**

   ```typescript
   // BAD: Missing dependency
   useEffect(() => {
     setCount(count + 1); // Infinite loop
   });
   
   // GOOD: Empty dependency array for one-time effect
   useEffect(() => {
     fetchData();
   }, []);
   
   // GOOD: Specific dependencies
   useEffect(() => {
     setDerivedValue(computeValue(prop));
   }, [prop]);
   ```

2. **Avoid state updates in render:**

   ```typescript
   // BAD: setState in render
   function Component() {
     setState(newValue); // Infinite loop
     return <div>...</div>;
   }
   
   // GOOD: setState in event handler or useEffect
   function Component() {
     useEffect(() => {
       setState(newValue);
     }, []);
     return <div>...</div>;
   }
   ```

3. **Use React DevTools Profiler:**
   - Install React DevTools extension
   - Check component re-render causes

**Prevention:**

- Always specify useEffect dependencies
- Use ESLint rule `react-hooks/exhaustive-deps`
- Never call setState during render

---

### Supabase client undefined error

**Problem:** `supabase` is undefined when accessed in component.

**Symptoms:**

```
TypeError: Cannot read properties of undefined (reading 'from')
TypeError: supabase is undefined
```

**Root Cause:** Component not wrapped in SupabaseProvider or provider not initialized.

**Solution:**

1. **Verify SupabaseProvider wraps app:**

   ```typescript
   // src/main.tsx
   <React.StrictMode>
     <SupabaseProvider>
       <BrowserRouter>
         <App />
       </BrowserRouter>
     </SupabaseProvider>
   </React.StrictMode>
   ```

2. **Use singleton client directly:**

   ```typescript
   // Import from lib instead of context
   import { supabase } from '@/lib/supabaseClient';
   
   // Use directly
   const { data } = await supabase.from('profiles').select();
   ```

3. **Check environment variables:**

   ```bash
   # Verify .env has Supabase credentials
   cat .env
   ```

**Prevention:**

- Document SupabaseProvider requirement
- Use singleton client for simpler components
- Add validation to supabaseClient.ts

---

## Database Issues

### RLS policy prevents data access

**Problem:** Query returns no data despite rows existing in database.

**Symptoms:**

```typescript
// Returns empty array []
const { data } = await supabase.from('profiles').select();

// But SQL Editor shows rows exist
```

**Root Cause:** Row Level Security (RLS) policy blocking access.

**Solution:**

1. **Check if user is authenticated:**

   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User:', user); // Should not be null
   ```

2. **Review RLS policies:**
   - Go to Supabase Dashboard → Authentication → Policies
   - Check policies for the table
   - Verify policy logic matches your query

3. **Test policy in SQL Editor:**

   ```sql
   -- Run as authenticated user
   SELECT * FROM profiles WHERE id = auth.uid();
   
   -- Check what auth.uid() returns
   SELECT auth.uid();
   ```

4. **Temporarily disable RLS (TESTING ONLY):**

   ```sql
   -- Disable RLS (DO NOT USE IN PRODUCTION)
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   
   -- Re-enable after testing
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ```

**Prevention:**

- Test RLS policies thoroughly
- Document policies in DATABASE.md
- Write RLS policy tests

---

### Migration fails with duplicate key

**Problem:** Migration fails when creating table or index.

**Symptoms:**

```sql
ERROR: relation "profiles" already exists
ERROR: index "profiles_email_idx" already exists
```

**Root Cause:** Migration already run or manual table creation.

**Solution:**

1. **Use IF NOT EXISTS:**

   ```sql
   -- Safe migration
   CREATE TABLE IF NOT EXISTS profiles (...);
   CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
   ```

2. **Check existing tables:**

   ```sql
   -- List all tables
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- Check specific table
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'profiles';
   ```

3. **Drop and recreate (CAREFUL):**

   ```sql
   -- Backup data first!
   DROP TABLE IF EXISTS profiles CASCADE;
   CREATE TABLE profiles (...);
   ```

**Prevention:**

- Always use `IF NOT EXISTS`
- Document applied migrations
- Use migration tracking system

---

### Foreign key constraint violation

**Problem:** Insert/update fails with constraint error.

**Symptoms:**

```sql
ERROR: insert or update on table "applications" violates foreign key 
constraint "applications_assignment_id_fkey"
ERROR: Key (assignment_id)=(xxx) is not present in table "assignments"
```

**Root Cause:** Referenced record doesn't exist or was deleted.

**Solution:**

1. **Verify referenced record exists:**

   ```sql
   -- Check if assignment exists
   SELECT id FROM assignments WHERE id = 'xxx';
   ```

2. **Insert referenced record first:**

   ```sql
   -- Insert parent first
   INSERT INTO assignments (id, title) VALUES ('xxx', 'Test');
   
   -- Then child
   INSERT INTO applications (assignment_id) VALUES ('xxx');
   ```

3. **Use ON DELETE CASCADE (if appropriate):**

   ```sql
   ALTER TABLE applications 
   DROP CONSTRAINT applications_assignment_id_fkey,
   ADD CONSTRAINT applications_assignment_id_fkey 
     FOREIGN KEY (assignment_id) 
     REFERENCES assignments(id) 
     ON DELETE CASCADE;
   ```

**Prevention:**

- Validate IDs before insert
- Handle deletion cascades appropriately
- Document table relationships

---

## Authentication Issues

### User gets logged out randomly

**Problem:** Session expires unexpectedly, user redirected to login.

**Symptoms:**

- User logged in
- Navigate to different page
- Suddenly logged out

**Root Cause:** Session not persisted or token expired.

**Solution:**

1. **Check session storage:**

   ```typescript
   // Verify storage is set to 'local'
   const { data, error } = await supabase.auth.getSession();
   console.log('Session:', data.session);
   ```

2. **Verify token refresh:**

   ```typescript
   // Supabase should auto-refresh, but you can manually:
   const { data, error } = await supabase.auth.refreshSession();
   ```

3. **Check Supabase Auth settings:**
   - Go to Supabase Dashboard → Authentication → Settings
   - Check "JWT expiry limit" (default 3600 seconds)
   - Ensure "Enable automatic reloading" is on

**Prevention:**

- Use `localStorage` for session persistence
- Implement session refresh logic
- Handle token expiry gracefully

---

### OAuth redirect not working

**Problem:** Google/GitHub OAuth redirects back but user not authenticated.

**Symptoms:**

- Click "Sign in with Google"
- Redirected to Google
- Return to app but not logged in
- No error message

**Root Cause:** Redirect URL mismatch or missing callback handling.

**Solution:**

1. **Verify redirect URLs in Supabase:**
   - Dashboard → Authentication → URL Configuration
   - Add: `http://localhost:8080/auth/callback`
   - Add: `https://yourapp.com/auth/callback`

2. **Check callback handling:**

   ```typescript
   // src/pages/AuthCallback.tsx
   useEffect(() => {
     const handleCallback = async () => {
       const { data, error } = await supabase.auth.getSession();
       if (error) console.error('Auth error:', error);
       if (data.session) navigate('/dashboard');
     };
     handleCallback();
   }, []);
   ```

3. **Verify OAuth provider config:**
   - Google: Check OAuth consent screen
   - GitHub: Check callback URL in app settings

**Prevention:**

- Test OAuth in both dev and prod
- Document redirect URLs
- Add error handling for auth failures

---

### Password reset email not received

**Problem:** User requests password reset but email doesn't arrive.

**Symptoms:**

- Click "Forgot password"
- Enter email
- No email received

**Root Cause:** Email not configured or going to spam.

**Solution:**

1. **Check Supabase email settings:**
   - Dashboard → Authentication → Email Templates
   - Verify "Reset Password" template enabled
   - Check "Email Configuration" has SMTP setup

2. **Check spam folder:**
   - Look for email from `noreply@mail.app.supabase.io`

3. **Use custom SMTP (production):**

   ```
   Dashboard → Project Settings → Auth → SMTP Settings
   - SMTP Host: smtp.sendgrid.net
   - Port: 587
   - Username: apikey
   - Password: <SendGrid API Key>
   ```

4. **Test email sending:**

   ```typescript
   const { error } = await supabase.auth.resetPasswordForEmail('user@example.com', {
     redirectTo: 'http://localhost:8080/reset-password',
   });
   console.log('Reset email error:', error);
   ```

**Prevention:**

- Configure custom SMTP for production
- Test password reset flow regularly
- Add user feedback for email sent

---

## UI & Layout Issues

### Fixed navbar creates gap on scroll

**Problem:** White space appears between navbar and content when scrolling.

**Symptoms:**

- Scroll down page
- Gap appears at top
- Navbar doesn't stay flush with top

**Root Cause:** Missing `pt-16` on main container or extra margin/padding.

**Solution:**

1. **Verify layout structure:**

   ```tsx
   // Root wrapper
   <div className="pt-16 overflow-hidden">
     {/* Navbar */}
     <nav className="fixed top-0 left-0 right-0 z-50 h-16">...</nav>
     
     {/* Main content */}
     <main className="h-[calc(100vh-4rem)] overflow-y-auto">
       {/* Page content - NO extra pt-16 */}
       {children}
     </main>
   </div>
   ```

2. **Remove duplicate padding:**

   ```tsx
   // BAD: Extra padding
   <div className="pt-16">
     <AppLayout>
       <div className="pt-16">Content</div> {/* Remove this */}
     </AppLayout>
   </div>
   
   // GOOD: Padding only at root
   <div className="pt-16">
     <AppLayout>
       <div>Content</div>
     </AppLayout>
   </div>
   ```

3. **Check for margin-top:**

   ```tsx
   // Remove any mt-16 from pages
   // The layout handles offset
   ```

**Prevention:**

- Follow layout rules in DESIGN.md
- Never add extra top padding to pages
- Test scrolling at different screen sizes

---

### Sidebar not scrolling independently

**Problem:** Scrolling sidebar scrolls entire page or vice versa.

**Symptoms:**

- Scroll in sidebar
- Main content also scrolls
- Or sidebar doesn't scroll at all

**Root Cause:** Missing `overflow-y-auto` or incorrect positioning.

**Solution:**

1. **Verify sidebar structure:**

   ```tsx
   <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] overflow-y-auto">
     {/* Sidebar content */}
   </aside>
   ```

2. **Verify main has its own scroll:**

   ```tsx
   <main className="h-[calc(100vh-4rem)] overflow-y-auto">
     {/* Main content */}
   </main>
   ```

3. **Check z-index stacking:**
   - Navbar: `z-50`
   - Sidebar: `z-30`
   - Main: no z-index (or lower)

**Prevention:**

- Use layout components from components/layout/
- Test scrolling with long content
- Verify at different screen sizes

---

### Mobile menu not closing

**Problem:** Mobile sidebar stays open after clicking link.

**Symptoms:**

- Open mobile menu
- Click navigation link
- Menu stays open, overlaying content

**Root Cause:** Missing click handler to close menu.

**Solution:**

1. **Add onClick handler:**

   ```tsx
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   
   <MobileNavLink 
     to="/dashboard" 
     onClick={() => setIsMobileMenuOpen(false)}
   >
     Dashboard
   </MobileNavLink>
   ```

2. **Use React Router's useNavigate:**

   ```tsx
   const navigate = useNavigate();
   
   const handleNavigation = (path: string) => {
     setIsMobileMenuOpen(false);
     navigate(path);
   };
   ```

3. **Close on route change:**

   ```tsx
   const location = useLocation();
   
   useEffect(() => {
     setIsMobileMenuOpen(false);
   }, [location]);
   ```

**Prevention:**

- Always close mobile menu on navigation
- Test mobile interactions thoroughly
- Use consistent navigation patterns

---

### Dark mode flicker on page load

**Problem:** Page loads in light mode then switches to dark mode.

**Symptoms:**

- User has dark mode enabled
- Refresh page
- Brief flash of light mode
- Then switches to dark mode

**Root Cause:** Theme applied after initial render.

**Solution:**

1. **Add inline script in index.html:**

   ```html
   <script>
     // Run before React loads
     const theme = localStorage.getItem('theme');
     if (theme === 'dark') {
       document.documentElement.classList.add('dark');
     }
   </script>
   ```

2. **Set default in CSS:**

   ```css
   /* Assume dark by default if preferred */
   @media (prefers-color-scheme: dark) {
     :root {
       --background: 222.2 84% 4.9%;
       --foreground: 210 40% 98%;
     }
   }
   ```

3. **Use blocking script:**

   ```tsx
   // ThemeProvider should sync with localStorage immediately
   useLayoutEffect(() => {
     const theme = localStorage.getItem('theme');
     if (theme) document.documentElement.classList.add(theme);
   }, []);
   ```

**Prevention:**

- Initialize theme before React render
- Test theme switching thoroughly
- Document dark mode setup in DESIGN.md

---

## Performance Issues

### Slow initial page load

**Problem:** First page load takes >5 seconds.

**Symptoms:**

- User visits app
- White screen for several seconds
- Then content appears

**Root Cause:** Large bundle size, no code splitting, or slow API calls.

**Solution:**

1. **Analyze bundle size:**

   ```bash
   npm run build
   # Check dist/ folder sizes
   
   # Or use bundle analyzer
   npm install --save-dev rollup-plugin-visualizer
   ```

2. **Implement code splitting:**

   ```typescript
   // Use React.lazy for routes
   const Dashboard = lazy(() => import('@/pages/Dashboard'));
   const Profile = lazy(() => import('@/pages/Profile'));
   
   // Wrap in Suspense
   <Suspense fallback={<LoadingSpinner />}>
     <Routes>
       <Route path="/dashboard" element={<Dashboard />} />
     </Routes>
   </Suspense>
   ```

3. **Optimize images:**
   - Compress with tools like TinyPNG
   - Use WebP format
   - Lazy load images below fold

4. **Defer non-critical scripts:**

   ```typescript
   // Load analytics after page interactive
   useEffect(() => {
     setTimeout(() => {
       import('./analytics').then(({ init }) => init());
     }, 2000);
   }, []);
   ```

**Prevention:**

- Monitor bundle size in CI
- Set size budgets
- Lazy load non-critical features

---

### React Query refetching too frequently

**Problem:** Same API called multiple times in short period.

**Symptoms:**

- Network tab shows repeated requests
- Data doesn't change between requests
- Wasted bandwidth

**Root Cause:** Aggressive refetch settings or missing staleTime.

**Solution:**

1. **Set appropriate staleTime:**

   ```typescript
   // Data considered fresh for 5 minutes
   const { data } = useQuery({
     queryKey: ['profile'],
     queryFn: fetchProfile,
     staleTime: 5 * 60 * 1000, // 5 minutes
   });
   ```

2. **Disable aggressive refetching:**

   ```typescript
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         refetchOnWindowFocus: false, // Don't refetch on tab switch
         refetchOnReconnect: false,   // Don't refetch on reconnect
         retry: 1,                     // Only retry once
       },
     },
   });
   ```

3. **Use cached data while revalidating:**

   ```typescript
   const { data } = useQuery({
     queryKey: ['profile'],
     queryFn: fetchProfile,
     staleTime: 5 * 60 * 1000,
     cacheTime: 10 * 60 * 1000, // Keep in cache for 10 min
   });
   ```

**Prevention:**

- Set staleTime for all queries
- Monitor network requests in dev
- Document caching strategy

---

### Memory leak warning

**Problem:** Console shows memory leak warning.

**Symptoms:**

```
Warning: Can't perform a React state update on an unmounted component.
This is a no-op, but it indicates a memory leak in your application.
```

**Root Cause:** Async operation updates state after component unmounts.

**Solution:**

1. **Cancel async operations on unmount:**

   ```typescript
   useEffect(() => {
     let isCancelled = false;
     
     const fetchData = async () => {
       const data = await api.getData();
       if (!isCancelled) {
         setData(data);
       }
     };
     
     fetchData();
     
     return () => {
       isCancelled = true;
     };
   }, []);
   ```

2. **Clean up subscriptions:**

   ```typescript
   useEffect(() => {
     const subscription = supabase
       .channel('notifications')
       .on('INSERT', handleInsert)
       .subscribe();
     
     return () => {
       subscription.unsubscribe();
     };
   }, []);
   ```

3. **Use AbortController:**

   ```typescript
   useEffect(() => {
     const controller = new AbortController();
     
     fetch('/api/data', { signal: controller.signal })
       .then(res => res.json())
       .then(setData);
     
     return () => controller.abort();
   }, []);
   ```

**Prevention:**

- Always clean up effects
- Use `isCancelled` flags
- Test component unmounting

---

## Testing Issues

### Jest tests failing with module errors

**Problem:** Tests fail with "Cannot find module" errors.

**Symptoms:**

```
Cannot find module '@/components/ui/button' from 'src/components/LoginForm.test.tsx'
Cannot find module 'src/index.css'
```

**Root Cause:** Jest doesn't understand Vite aliases or CSS imports.

**Solution:**

1. **Verify Jest config has moduleNameMapper:**

   ```typescript
   // jest.config.ts
   export default {
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1',
       '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
     },
   };
   ```

2. **Clear Jest cache:**

   ```bash
   npx jest --clearCache
   ```

3. **Reinstall dependencies:**

   ```bash
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

**Prevention:**

- Keep Jest config in sync with Vite config
- Test setup after config changes
- Document testing setup in TESTING.md

---

### Tests pass locally but fail in CI

**Problem:** Tests pass on your machine but fail in GitHub Actions.

**Symptoms:**

- Run `npm test` locally: all pass
- Push to GitHub
- CI fails with test errors

**Root Cause:** Environment differences (timezone, locale, environment variables).

**Solution:**

1. **Check environment variables:**

   ```yaml
   # .github/workflows/test.yml
   env:
     VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
     VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
   ```

2. **Match Node version:**

   ```yaml
   - uses: actions/setup-node@v3
     with:
       node-version: 18 # Same as local
   ```

3. **Set timezone:**

   ```yaml
   env:
     TZ: 'UTC'
   ```

4. **Run tests in CI mode locally:**

   ```bash
   CI=true npm test
   ```

**Prevention:**

- Use consistent Node versions
- Avoid timezone-dependent tests
- Test with CI=true locally

---

### Playwright tests timing out

**Problem:** E2E tests fail with timeout errors.

**Symptoms:**

```
Timeout exceeded while waiting for element
Test timeout of 30000ms exceeded
```

**Root Cause:** Slow page load, element not found, or wrong selector.

**Solution:**

1. **Increase timeout for slow operations:**

   ```typescript
   // playwright.config.ts
   export default defineConfig({
     timeout: 60000, // 60 seconds
     expect: {
       timeout: 10000, // 10 seconds
     },
   });
   ```

2. **Use explicit waits:**

   ```typescript
   // Wait for element
   await page.waitForSelector('[data-testid="login-button"]');
   
   // Wait for navigation
   await page.waitForURL('/dashboard');
   
   // Wait for network idle
   await page.waitForLoadState('networkidle');
   ```

3. **Verify selectors:**

   ```typescript
   // Use more reliable selectors
   await page.getByRole('button', { name: 'Login' }).click();
   await page.getByLabel('Email').fill('user@example.com');
   ```

**Prevention:**

- Use semantic selectors (role, label)
- Add data-testid for dynamic elements
- Test with network throttling

---

## Deployment Issues

### Build fails with "out of memory"

**Problem:** Production build fails with heap error.

**Symptoms:**

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Root Cause:** Large bundle, insufficient memory for build process.

**Solution:**

1. **Increase Node memory:**

   ```bash
   # Windows
   $env:NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   
   # Or in package.json
   "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
   ```

2. **Optimize bundle:**

   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             ui: ['@radix-ui/react-dialog'],
           },
         },
       },
     },
   });
   ```

3. **Remove unused dependencies:**

   ```bash
   npm uninstall <unused-package>
   ```

**Prevention:**

- Monitor bundle size
- Lazy load heavy components
- Use dynamic imports

---

### Environment variables not working in production

**Problem:** App works locally but fails in production with missing env vars.

**Symptoms:**

```
Supabase URL is undefined
Cannot read environment variable
```

**Root Cause:** Environment variables not set in Vercel/Netlify.

**Solution:**

1. **Verify variables in Vercel:**
   - Dashboard → Settings → Environment Variables
   - Ensure variables exist for Production
   - Redeploy after adding variables

2. **Check variable names:**
   - Must start with `VITE_`
   - Case-sensitive
   - No typos

3. **Build locally with prod env:**

   ```bash
   # Create .env.production
   VITE_SUPABASE_URL=https://prod.supabase.co
   VITE_SUPABASE_ANON_KEY=prod-key
   
   # Build
   npm run build
   npm run preview
   ```

**Prevention:**

- Document all required env vars
- Use .env.example as template
- Validate env vars at build time

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview build

# Quality Checks
npm run type-check       # TypeScript validation
npm run lint             # ESLint
npm test                 # Jest tests
npm run test:coverage    # Coverage report
npm run validate         # All checks

# Fixes
npm cache clean --force  # Clear npm cache
npx jest --clearCache    # Clear Jest cache
Remove-Item -Recurse node_modules  # Delete node_modules
```

### Debug Checklist

- [ ] Check browser console for errors
- [ ] Verify .env file has all variables
- [ ] Restart dev server after .env changes
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Verify Supabase project is active
- [ ] Check network tab for failed requests
- [ ] Restart TypeScript server in IDE
- [ ] Clear Jest cache if tests failing
- [ ] Verify Node and npm versions match requirements

### Getting Help

1. **Check documentation:**
   - [GETTING_STARTED.md](./GETTING_STARTED.md)
   - [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
   - [TESTING.md](./TESTING.md)

2. **Search issues:**
   - [GitHub Issues](https://github.com/mrlucas679/trust-work/issues)
   - Search for error message

3. **Ask for help:**
   - GitHub Discussions
   - Create new issue with reproduction steps
   - Email: <support@trustwork.com>

---

## References

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
- [Supabase Debugging](https://supabase.com/docs/guides/platform/troubleshooting)
- [Jest Troubleshooting](https://jestjs.io/docs/troubleshooting)

---

**Document Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Engineering Team

_When in doubt, restart everything and clear all caches._
