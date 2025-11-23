import { toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers with jest-axe matchers
expect.extend(toHaveNoViolations);

// Add custom matchers type declaration
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R> {
            toHaveNoViolations(): R;
        }
    }
}
