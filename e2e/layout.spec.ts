import { test, expect } from '@playwright/test';

/**
 * E2E tests for layout system fixes:
 * - Single scrollbar (no multiple scrollbars)
 * - No content overflow/"crawling"
 * - Responsive behavior
 * - No nested container conflicts
 * 
 * Testing on public routes since app requires authentication
 */

test.describe('Layout System Validation', () => {

    test('welcome page should load successfully', async ({ page }) => {
        await page.goto('/welcome');
        await page.waitForLoadState('networkidle');

        // Page should load without redirect
        expect(page.url()).toContain('/welcome');
    });

    test('auth page should load successfully', async ({ page }) => {
        await page.goto('/auth');
        await page.waitForLoadState('networkidle');

        // Should have login form
        const emailInput = page.locator('input[type="email"]').first();
        await expect(emailInput).toBeVisible({ timeout: 10000 });
    });

    test('no horizontal overflow on public pages', async ({ page }) => {
        const routes = ['/', '/welcome', '/auth'];

        for (const route of routes) {
            await page.goto(route);
            await page.waitForLoadState('networkidle');

            const hasOverflow = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });

            expect(hasOverflow).toBe(false);
        }
    });

    test('limited scrollable elements on public pages', async ({ page }) => {
        const routes = ['/', '/welcome', '/auth'];

        for (const route of routes) {
            await page.goto(route);
            await page.waitForLoadState('networkidle');

            const scrollableCount = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.filter(el => {
                    const styles = window.getComputedStyle(el);
                    const hasOverflow = styles.overflowY === 'scroll' || styles.overflowY === 'auto';
                    return hasOverflow && el.scrollHeight > el.clientHeight;
                }).length;
            });

            // Should have at most 2 scrollable elements
            expect(scrollableCount).toBeLessThanOrEqual(2);
        }
    });

    test('responsive layout works at different breakpoints', async ({ page }) => {
        await page.goto('/welcome');

        // Desktop
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.waitForTimeout(300);
        let hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow).toBe(false);

        // Tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(300);
        hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow).toBe(false);

        // Mobile
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(300);
        hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow).toBe(false);
    });

    test('no min-h-screen inside fixed height containers', async ({ page }) => {
        await page.goto('/welcome');
        await page.waitForLoadState('networkidle');

        const hasConflict = await page.evaluate(() => {
            const minHeightScreenElements = Array.from(document.querySelectorAll('[class*="min-h-screen"]'));

            return minHeightScreenElements.some(el => {
                let parent = el.parentElement;
                while (parent) {
                    const styles = window.getComputedStyle(parent);
                    if (styles.height && styles.height.includes('calc') && styles.height.includes('vh')) {
                        return true;
                    }
                    parent = parent.parentElement;
                }
                return false;
            });
        });

        expect(hasConflict).toBe(false);
    });

    test('no critical console errors', async ({ page }) => {
        const errors: string[] = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/welcome');
        await page.waitForLoadState('networkidle');

        const criticalErrors = errors.filter(error =>
            !error.includes('favicon') &&
            !error.includes('DevTools') &&
            !error.includes('socket') &&
            !error.includes('WebSocket')
        );

        expect(criticalErrors.length).toBe(0);
    });

    test('navigation between public pages works', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.goto('/welcome');
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('/welcome');

        await page.goto('/auth');
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('/auth');
    });

    test('auth form is interactive', async ({ page }) => {
        await page.goto('/auth');
        await page.waitForLoadState('networkidle');

        const emailInput = page.locator('input[type="email"]').first();
        const passwordInput = page.locator('input[type="password"]').first();

        await expect(emailInput).toBeVisible({ timeout: 10000 });
        await expect(passwordInput).toBeVisible({ timeout: 10000 });

        await emailInput.click();
        await emailInput.fill('test@example.com');

        const value = await emailInput.inputValue();
        expect(value).toBe('test@example.com');
    });

    test('pages render without critical asset failures', async ({ page }) => {
        const failedRequests: string[] = [];

        page.on('requestfailed', request => {
            const url = request.url();
            // Only track critical failures (not analytics, ads, etc.)
            if (!url.includes('analytics') &&
                !url.includes('tracking') &&
                !url.includes('ads') &&
                !url.includes('gtag')) {
                failedRequests.push(url);
            }
        });

        await page.goto('/welcome');
        await page.waitForLoadState('networkidle');

        // Allow favicon to fail
        const criticalFailures = failedRequests.filter(url => !url.includes('favicon'));
        expect(criticalFailures.length).toBeLessThanOrEqual(1);
    });

    test('mobile viewport has appropriate touch targets', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/auth');
        await page.waitForLoadState('networkidle');

        // Check that interactive elements are large enough for touch
        const smallElements = await page.evaluate(() => {
            const interactiveSelectors = 'button, a, input[type="submit"], [role="button"]';
            const elements = Array.from(document.querySelectorAll(interactiveSelectors));

            return elements.filter(el => {
                const rect = el.getBoundingClientRect();
                // Touch targets should be at least 44x44px
                return (rect.width > 0 && rect.width < 44) || (rect.height > 0 && rect.height < 44);
            }).length;
        });

        // Most touch targets should be appropriately sized
        expect(smallElements).toBeLessThan(5);
    });
});

test.describe('Visual Regression - Public Routes', () => {
    test('landing page renders correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Should have content
        const body = await page.locator('body').textContent();
        expect(body).toBeTruthy();
        expect(body!.length).toBeGreaterThan(100);
    });

    test('welcome page renders correctly', async ({ page }) => {
        await page.goto('/welcome');
        await page.waitForLoadState('networkidle');

        const body = await page.locator('body').textContent();
        expect(body).toBeTruthy();
        expect(body!.length).toBeGreaterThan(100);
    });

    test('auth page renders correctly', async ({ page }) => {
        await page.goto('/auth');
        await page.waitForLoadState('networkidle');

        const body = await page.locator('body').textContent();
        expect(body).toBeTruthy();
        expect(body!.length).toBeGreaterThan(100);

        // Should have form elements
        await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 10000 });
    });
});
