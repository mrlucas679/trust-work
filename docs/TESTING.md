# TrustWork Testing Guide

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Quality Assurance Team

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Testing Stack](#testing-stack)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [End-to-End Testing](#end-to-end-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [Test Coverage](#test-coverage)
11. [CI/CD Integration](#cicd-integration)
12. [Best Practices](#best-practices)

---

## Overview

This document provides comprehensive guidance on testing practices for the TrustWork application. Our testing strategy follows the **Testing Pyramid** principle:

```
          /\
         /  \  E2E Tests (10%)
        /____\
       /      \
      /        \ Integration Tests (30%)
     /__________\
    /            \
   /              \ Unit Tests (60%)
  /________________\
```

### Testing Goals

- **Prevent Regressions:** Catch bugs before they reach production
- **Document Behavior:** Tests serve as living documentation
- **Enable Refactoring:** Confidently refactor code with test coverage
- **Improve Code Quality:** Tests force better design decisions
- **Reduce Manual Testing:** Automate repetitive testing tasks

---

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation:** Focus on what the code does, not how it does it
2. **Write Tests First (TDD):** Consider writing tests before implementation when appropriate
3. **Keep Tests Simple:** Tests should be easier to understand than the code they test
4. **Test One Thing:** Each test should verify a single behavior
5. **Use Descriptive Names:** Test names should clearly describe what is being tested
6. **Avoid Test Interdependence:** Tests should run independently in any order

### What to Test

✅ **Do Test:**

- Public APIs and interfaces
- User interactions and workflows
- Edge cases and error conditions
- Accessibility requirements
- Security-critical functionality

❌ **Don't Test:**

- Third-party library internals
- Framework code (React, Supabase)
- Trivial getters/setters
- Implementation details

---

## Testing Stack

### Unit & Integration Tests

- **Test Runner:** Jest 29
- **React Testing:** React Testing Library (RTL)
- **Assertions:** Jest matchers + `@testing-library/jest-dom`
- **Mocking:** Jest mock functions
- **Coverage:** Istanbul (built into Jest)

### End-to-End Tests

- **Framework:** Playwright
- **Browsers:** Chromium, Firefox, WebKit
- **Test Isolation:** Each test in fresh browser context
- **Parallelization:** Tests run in parallel

### Accessibility Tests

- **Automated:** `jest-axe` + Playwright's accessibility API
- **Manual:** Screen readers (NVDA, VoiceOver)
- **Tooling:** axe DevTools browser extension

### Performance Tests

- **Lighthouse:** Performance audits
- **Web Vitals:** Core Web Vitals monitoring
- **Bundle Analysis:** Vite rollup-plugin-visualizer

---

## Unit Testing

### Setup

Tests are located in `__tests__` directories or alongside source files with `.test.ts(x)` or `.spec.ts(x)` extensions.

**Jest Configuration:** `jest.config.ts`

```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Writing Unit Tests

#### Testing Components

```typescript
// LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur
    
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
    render(<LoginForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(screen.getByRole('button')).toHaveTextContent(/signing in/i);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### Testing Hooks

```typescript
// use-debounce.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    expect(result.current).toBe('initial');
    
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Still old value
    
    await waitFor(() => expect(result.current).toBe('updated'), {
      timeout: 600,
    });
  });
});
```

#### Testing Utility Functions

```typescript
// validations.test.ts
import { validateEmail, validatePassword } from './validations';

describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user+tag@domain.co.uk')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts strong passwords', () => {
    expect(validatePassword('StrongP@ssw0rd')).toBe(true);
  });

  it('rejects weak passwords', () => {
    expect(validatePassword('weak')).toBe(false);
    expect(validatePassword('NoNumbers!')).toBe(false);
    expect(validatePassword('12345678')).toBe(false);
  });
});
```

### Mocking

#### Mocking Supabase

```typescript
// __mocks__/supabaseClient.ts
export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: {}, error: null }),
  })),
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
  },
};

// In test file
jest.mock('@/lib/supabaseClient', () => ({
  supabase: mockSupabase,
}));
```

#### Mocking React Router

```typescript
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};
```

---

## Integration Testing

Integration tests verify that multiple components work together correctly.

### Example: Form Submission with API

```typescript
// ProfileForm.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from './ProfileForm';
import { mockSupabase } from '@/__mocks__/supabaseClient';

describe('ProfileForm Integration', () => {
  it('successfully updates profile', async () => {
    const user = userEvent.setup();
    mockSupabase.from.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: { id: '123', display_name: 'John Doe' },
          error: null,
        }),
      }),
    });

    render(<ProfileForm />);

    await user.clear(screen.getByLabelText(/display name/i));
    await user.type(screen.getByLabelText(/display name/i), 'John Doe');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/profile updated/i)).toBeInTheDocument();
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    mockSupabase.from.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Network error' },
        }),
      }),
    });

    render(<ProfileForm />);

    await user.type(screen.getByLabelText(/display name/i), 'John Doe');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
```

---

## End-to-End Testing

E2E tests verify complete user workflows in a real browser environment.

### Playwright Configuration

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Writing E2E Tests

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Sign Up');

    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'SecureP@ssw0rd');
    await page.fill('input[name="confirmPassword"]', 'SecureP@ssw0rd');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/setup');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('user can sign in', async ({ page }) => {
    await page.goto('/auth');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('nav')).toContainText('Dashboard');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/invalid credentials/i')).toBeVisible();
  });
});
```

### Page Object Model

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/auth');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// Usage in test
import { LoginPage } from './pages/LoginPage';

test('user can sign in using page object', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
  
  await expect(page).toHaveURL(/\/dashboard/);
});
```

---

## Accessibility Testing

### Automated A11y Tests

```typescript
// LoginForm.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LoginForm } from './LoginForm';

expect.extend(toHaveNoViolations);

describe('LoginForm Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<LoginForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Playwright Accessibility Tests

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage should not have any accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/auth');
    
    // Tab through form
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
    
    // Submit with Enter
    await page.keyboard.press('Enter');
  });
});
```

---

## Performance Testing

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:8080
            http://localhost:8080/dashboard
          uploadArtifacts: true
```

### Web Vitals Monitoring

```typescript
// src/lib/web-vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to analytics service
  console.log(metric);
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

---

## Security Testing

### Snyk Integration

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=medium
```

### Manual Security Testing

```typescript
// Test RLS policies
test('user cannot access other user data', async () => {
  // Attempt to fetch another user's profile
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', 'different-user-id')
    .single();

  expect(error).toBeTruthy();
  expect(data).toBeNull();
});
```

---

## Test Coverage

### Coverage Requirements

Minimum coverage thresholds (enforced by Jest):

- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%
- **Statements:** 80%

### Generating Coverage Reports

```bash
# Run tests with coverage
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

### Coverage Reports

```bash
# Terminal output
npm test -- --coverage

# HTML report
npm test -- --coverage --coverageReporters=html

# CI-friendly format
npm test -- --coverage --coverageReporters=json-summary
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Unit tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      
      - name: E2E tests
        run: npx playwright test
      
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Best Practices

### General Testing Best Practices

1. **Arrange-Act-Assert Pattern:**

   ```typescript
   it('adds two numbers', () => {
     // Arrange
     const a = 2;
     const b = 3;
     
     // Act
     const result = add(a, b);
     
     // Assert
     expect(result).toBe(5);
   });
   ```

2. **Use Descriptive Test Names:**

   ```typescript
   // ❌ Bad
   it('works', () => { ... });
   
   // ✅ Good
   it('displays error message when email is invalid', () => { ... });
   ```

3. **Test Error Cases:**

   ```typescript
   it('handles network errors gracefully', async () => {
     // Mock network failure
     // Verify error is displayed to user
   });
   ```

4. **Avoid Testing Implementation Details:**

   ```typescript
   // ❌ Bad - testing internal state
   expect(component.state.isLoading).toBe(true);
   
   // ✅ Good - testing user-visible behavior
   expect(screen.getByText(/loading/i)).toBeInTheDocument();
   ```

5. **Keep Tests Isolated:**

   ```typescript
   beforeEach(() => {
     // Reset mocks and state before each test
     jest.clearAllMocks();
   });
   ```

### React Testing Library Best Practices

1. **Query by Accessibility Role:**

   ```typescript
   // ✅ Preferred
   screen.getByRole('button', { name: /submit/i });
   
   // ⚠️ Less accessible
   screen.getByTestId('submit-button');
   ```

2. **Use User-Event Over FireEvent:**

   ```typescript
   // ✅ Preferred (simulates real user interaction)
   await user.click(button);
   
   // ⚠️ Less realistic
   fireEvent.click(button);
   ```

3. **Wait for Async Updates:**

   ```typescript
   await waitFor(() => {
     expect(screen.getByText(/success/i)).toBeInTheDocument();
   });
   ```

### Playwright Best Practices

1. **Use Page Object Model for Complex Flows**
2. **Take Screenshots on Failure:**

   ```typescript
   test.afterEach(async ({ page }, testInfo) => {
     if (testInfo.status === 'failed') {
       await page.screenshot({ path: `screenshots/${testInfo.title}.png` });
     }
   });
   ```

3. **Use Auto-Waiting:**

   ```typescript
   // Playwright automatically waits for element to be actionable
   await page.click('button'); // No need for manual waits
   ```

---

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [jest-axe GitHub](https://github.com/nickcolley/jest-axe)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Document Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Quality Assurance Team

_Testing is not optional. Write tests for all new code and maintain existing test suites._
