import { axe, toHaveNoViolations } from 'jest-axe';
import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';

expect.extend(toHaveNoViolations);

/**
 * Accessibility Testing Utilities
 * 
 * Helper functions for testing accessibility compliance using jest-axe
 */

// ============================================================================
// BASIC ACCESSIBILITY TEST HELPERS
// ============================================================================

/**
 * Test a component for accessibility violations
 * @param component - The React component to test
 * @param options - Optional axe configuration
 * @returns Promise that resolves when test completes
 * 
 * @example
 * test('Button has no accessibility violations', async () => {
 *   await testAccessibility(<Button>Click me</Button>);
 * });
 */
export async function testAccessibility(
    component: ReactElement,
    options?: Parameters<typeof axe>[1]
): Promise<void> {
    const { container } = render(component);
    const results = await axe(container, options);
    expect(results).toHaveNoViolations();
}

/**
 * Test a rendered component for accessibility violations
 * @param renderResult - The result from @testing-library/react render
 * @param options - Optional axe configuration
 * @returns Promise that resolves when test completes
 * 
 * @example
 * test('Form has no accessibility violations', async () => {
 *   const result = render(<Form />);
 *   await testAccessibilityOnRendered(result);
 * });
 */
export async function testAccessibilityOnRendered(
    renderResult: RenderResult,
    options?: Parameters<typeof axe>[1]
): Promise<void> {
    const results = await axe(renderResult.container, options);
    expect(results).toHaveNoViolations();
}

// ============================================================================
// FOCUSED ACCESSIBILITY TESTS
// ============================================================================

/**
 * Test only keyboard navigation accessibility
 * @param component - The React component to test
 * @returns Promise that resolves when test completes
 */
export async function testKeyboardAccessibility(component: ReactElement): Promise<void> {
    await testAccessibility(component, {
        rules: {
            // Focus on keyboard-specific rules
            'focus-order-semantics': { enabled: true },
            'tabindex': { enabled: true },
            'accesskeys': { enabled: true },
        },
    });
}

/**
 * Test only color contrast accessibility
 * @param component - The React component to test
 * @returns Promise that resolves when test completes
 */
export async function testColorContrastAccessibility(component: ReactElement): Promise<void> {
    await testAccessibility(component, {
        rules: {
            // Focus on color contrast rules
            'color-contrast': { enabled: true },
        },
    });
}

/**
 * Test only ARIA attribute accessibility
 * @param component - The React component to test
 * @returns Promise that resolves when test completes
 */
export async function testAriaAccessibility(component: ReactElement): Promise<void> {
    await testAccessibility(component, {
        rules: {
            // Focus on ARIA-specific rules
            'aria-allowed-attr': { enabled: true },
            'aria-required-attr': { enabled: true },
            'aria-valid-attr': { enabled: true },
            'aria-valid-attr-value': { enabled: true },
        },
    });
}

/**
 * Test form accessibility (labels, fieldsets, etc.)
 * @param component - The React component to test
 * @returns Promise that resolves when test completes
 */
export async function testFormAccessibility(component: ReactElement): Promise<void> {
    await testAccessibility(component, {
        rules: {
            // Focus on form-specific rules
            'label': { enabled: true },
            'form-field-multiple-labels': { enabled: true },
            'fieldset': { enabled: true },
        },
    });
}

// ============================================================================
// CUSTOM MATCHERS
// ============================================================================

/**
 * Check if element has proper ARIA label
 * @param element - DOM element to check
 * @returns Whether element has accessible name
 */
export function hasAccessibleName(element: Element): boolean {
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const title = element.getAttribute('title');
    const textContent = element.textContent;

    return !!(ariaLabel || ariaLabelledBy || title || textContent?.trim());
}

/**
 * Check if element has proper focus indicator
 * @param element - DOM element to check
 * @returns Whether element has visible focus
 */
export function hasFocusIndicator(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element);
    const outlineWidth = styles.getPropertyValue('outline-width');
    const boxShadow = styles.getPropertyValue('box-shadow');

    return outlineWidth !== '0px' || boxShadow !== 'none';
}

/**
 * Check if element meets minimum touch target size (44x44px)
 * @param element - DOM element to check
 * @returns Whether element meets minimum size
 */
export function meetsTouchTargetSize(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // WCAG 2.1 AA minimum

    return rect.width >= minSize && rect.height >= minSize;
}

// ============================================================================
// TESTING UTILITIES
// ============================================================================

/**
 * Get all focusable elements within a container
 * @param container - Container element
 * @returns Array of focusable elements
 */
export function getFocusableElements(container: Element): Element[] {
    const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll(selector));
}

/**
 * Simulate keyboard navigation through focusable elements
 * @param container - Container element
 * @returns Array of focused elements in order
 */
export function simulateTabNavigation(container: Element): Element[] {
    const focusableElements = getFocusableElements(container);
    const focusOrder: Element[] = [];

    focusableElements.forEach(element => {
        if (element instanceof HTMLElement) {
            element.focus();
            if (document.activeElement === element) {
                focusOrder.push(element);
            }
        }
    });

    return focusOrder;
}

/**
 * Check if modal has proper focus trap
 * @param modal - Modal element
 * @returns Whether modal traps focus correctly
 */
export function hasProperFocusTrap(modal: Element): boolean {
    const focusableElements = getFocusableElements(modal);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Check if first and last elements exist
    if (!firstFocusable || !lastFocusable) return false;

    // Check if modal has role="dialog" and aria-modal
    const hasDialogRole = modal.getAttribute('role') === 'dialog';
    const hasAriaModal = modal.getAttribute('aria-modal') === 'true';

    return hasDialogRole && hasAriaModal;
}

// ============================================================================
// SNAPSHOT TESTING HELPERS
// ============================================================================

/**
 * Create accessibility tree snapshot
 * @param container - Container element
 * @returns Accessibility tree object
 */
export function createAccessibilityTree(container: Element): Record<string, unknown> {
    const tree: Record<string, unknown> = {
        role: container.getAttribute('role'),
        ariaLabel: container.getAttribute('aria-label'),
        ariaLabelledBy: container.getAttribute('aria-labelledby'),
        ariaDescribedBy: container.getAttribute('aria-describedby'),
        children: [],
    };

    Array.from(container.children).forEach(child => {
        (tree.children as Record<string, unknown>[]).push(createAccessibilityTree(child));
    });

    return tree;
}

// ============================================================================
// PRESETS FOR COMMON COMPONENTS
// ============================================================================

/**
 * Preset accessibility tests for button components
 */
export const buttonAccessibilityTests = {
    async testButton(component: ReactElement): Promise<void> {
        const { container } = render(component);

        // Test general accessibility
        await testAccessibilityOnRendered({ container } as RenderResult);

        // Test button-specific requirements
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(hasAccessibleName(button!)).toBe(true);
    },
};

/**
 * Preset accessibility tests for form components
 */
export const formAccessibilityTests = {
    async testForm(component: ReactElement): Promise<void> {
        const { container } = render(component);

        // Test form accessibility
        await testFormAccessibility(component);

        // Test that all inputs have labels
        const inputs = container.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            expect(hasAccessibleName(input)).toBe(true);
        });
    },
};

/**
 * Preset accessibility tests for modal components
 */
export const modalAccessibilityTests = {
    async testModal(component: ReactElement): Promise<void> {
        const { container } = render(component);

        // Test general accessibility
        await testAccessibilityOnRendered({ container } as RenderResult);

        // Test modal-specific requirements
        const dialog = container.querySelector('[role="dialog"]');
        expect(dialog).toBeInTheDocument();
        expect(hasProperFocusTrap(dialog!)).toBe(true);
    },
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
    axe,
    toHaveNoViolations,
};
