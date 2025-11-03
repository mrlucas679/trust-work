import { spacing, componentSpacing } from './design-tokens';

/**
 * Spacing Utilities
 * 
 * Helper functions and utilities for consistent spacing throughout the application.
 * These utilities work in conjunction with design tokens to ensure spacing consistency.
 */

// ============================================================================
// SPACING HELPERS
// ============================================================================

/**
 * Get spacing value by key
 * @param key - The spacing key from the design tokens
 * @returns The spacing value in rem
 * 
 * @example
 * const padding = getSpacing('4'); // '1rem'
 * const margin = getSpacing('8'); // '2rem'
 */
export function getSpacing(key: keyof typeof spacing): string {
    return spacing[key];
}

/**
 * Get multiple spacing values
 * @param keys - Array of spacing keys
 * @returns Array of spacing values
 * 
 * @example
 * const [padding, margin] = getSpacingMultiple(['4', '8']); // ['1rem', '2rem']
 */
export function getSpacingMultiple(...keys: (keyof typeof spacing)[]): string[] {
    return keys.map(key => spacing[key]);
}

/**
 * Create a spacing scale (useful for consistent gaps/padding)
 * @param base - Base spacing key
 * @param multiplier - Multiplier for the scale
 * @returns Spacing value
 * 
 * @example
 * const spacing = createSpacingScale('4', 2); // Returns 2rem (16px * 2)
 */
export function createSpacingScale(base: keyof typeof spacing, multiplier: number): string {
    const baseValue = parseFloat(spacing[base]);
    if (isNaN(baseValue)) return spacing[base];
    return `${baseValue * multiplier}rem`;
}

// ============================================================================
// COMPONENT SPACING HELPERS
// ============================================================================

/**
 * Get card spacing configuration
 */
export const getCardSpacing = () => componentSpacing.card;

/**
 * Get form spacing configuration
 */
export const getFormSpacing = () => componentSpacing.form;

/**
 * Get layout spacing configuration
 */
export const getLayoutSpacing = () => componentSpacing.layout;

/**
 * Get list spacing configuration
 */
export const getListSpacing = () => componentSpacing.list;

/**
 * Get modal spacing configuration
 */
export const getModalSpacing = () => componentSpacing.modal;

// ============================================================================
// CSS CLASS GENERATORS
// ============================================================================

/**
 * Generate padding classes based on spacing tokens
 * @param value - Spacing key
 * @param sides - Which sides to apply padding (top, right, bottom, left)
 * @returns CSS class string
 * 
 * @example
 * generatePaddingClass('4'); // 'p-4'
 * generatePaddingClass('4', ['x']); // 'px-4'
 * generatePaddingClass('4', ['t', 'b']); // 'pt-4 pb-4'
 */
export function generatePaddingClass(
    value: keyof typeof spacing,
    sides?: ('t' | 'r' | 'b' | 'l' | 'x' | 'y')[]
): string {
    if (!sides || sides.length === 0) {
        return `p-${value}`;
    }
    return sides.map(side => `p${side}-${value}`).join(' ');
}

/**
 * Generate margin classes based on spacing tokens
 * @param value - Spacing key
 * @param sides - Which sides to apply margin (top, right, bottom, left)
 * @returns CSS class string
 * 
 * @example
 * generateMarginClass('4'); // 'm-4'
 * generateMarginClass('4', ['x']); // 'mx-4'
 * generateMarginClass('4', ['t', 'b']); // 'mt-4 mb-4'
 */
export function generateMarginClass(
    value: keyof typeof spacing,
    sides?: ('t' | 'r' | 'b' | 'l' | 'x' | 'y')[]
): string {
    if (!sides || sides.length === 0) {
        return `m-${value}`;
    }
    return sides.map(side => `m${side}-${value}`).join(' ');
}

/**
 * Generate gap class based on spacing tokens
 * @param value - Spacing key
 * @returns CSS class string
 * 
 * @example
 * generateGapClass('4'); // 'gap-4'
 */
export function generateGapClass(value: keyof typeof spacing): string {
    return `gap-${value}`;
}

/**
 * Generate space between classes based on spacing tokens
 * @param value - Spacing key
 * @param axis - Which axis to apply spacing (x or y)
 * @returns CSS class string
 * 
 * @example
 * generateSpaceClass('4', 'y'); // 'space-y-4'
 * generateSpaceClass('4', 'x'); // 'space-x-4'
 */
export function generateSpaceClass(
    value: keyof typeof spacing,
    axis: 'x' | 'y'
): string {
    return `space-${axis}-${value}`;
}

// ============================================================================
// INLINE STYLE HELPERS
// ============================================================================

/**
 * Create inline padding style
 * @param value - Spacing key
 * @param sides - Which sides to apply padding
 * @returns CSS style object
 * 
 * @example
 * createPaddingStyle('4'); // { padding: '1rem' }
 * createPaddingStyle('4', ['top', 'bottom']); // { paddingTop: '1rem', paddingBottom: '1rem' }
 */
export function createPaddingStyle(
    value: keyof typeof spacing,
    sides?: ('top' | 'right' | 'bottom' | 'left')[]
): React.CSSProperties {
    const spacingValue = spacing[value];

    if (!sides || sides.length === 0) {
        return { padding: spacingValue };
    }

    const style: React.CSSProperties = {};
    sides.forEach(side => {
        const key = `padding${side.charAt(0).toUpperCase()}${side.slice(1)}` as keyof React.CSSProperties;
        (style as Record<string, string>)[key as string] = spacingValue;
    });

    return style;
}

/**
 * Create inline margin style
 * @param value - Spacing key
 * @param sides - Which sides to apply margin
 * @returns CSS style object
 * 
 * @example
 * createMarginStyle('4'); // { margin: '1rem' }
 * createMarginStyle('4', ['top', 'bottom']); // { marginTop: '1rem', marginBottom: '1rem' }
 */
export function createMarginStyle(
    value: keyof typeof spacing,
    sides?: ('top' | 'right' | 'bottom' | 'left')[]
): React.CSSProperties {
    const spacingValue = spacing[value];

    if (!sides || sides.length === 0) {
        return { margin: spacingValue };
    }

    const style: React.CSSProperties = {};
    sides.forEach(side => {
        const key = `margin${side.charAt(0).toUpperCase()}${side.slice(1)}` as keyof React.CSSProperties;
        (style as Record<string, string>)[key as string] = spacingValue;
    });

    return style;
}

/**
 * Create inline gap style
 * @param value - Spacing key
 * @returns CSS style object
 * 
 * @example
 * createGapStyle('4'); // { gap: '1rem' }
 */
export function createGapStyle(value: keyof typeof spacing): React.CSSProperties {
    return { gap: spacing[value] };
}

// ============================================================================
// RESPONSIVE SPACING
// ============================================================================

/**
 * Create responsive padding classes
 * @param values - Spacing values for different breakpoints
 * @returns CSS class string
 * 
 * @example
 * createResponsivePadding({ default: '4', md: '6', lg: '8' }); // 'p-4 md:p-6 lg:p-8'
 */
export function createResponsivePadding(values: {
    default: keyof typeof spacing;
    sm?: keyof typeof spacing;
    md?: keyof typeof spacing;
    lg?: keyof typeof spacing;
    xl?: keyof typeof spacing;
    '2xl'?: keyof typeof spacing;
}): string {
    const classes = [`p-${values.default}`];

    if (values.sm) classes.push(`sm:p-${values.sm}`);
    if (values.md) classes.push(`md:p-${values.md}`);
    if (values.lg) classes.push(`lg:p-${values.lg}`);
    if (values.xl) classes.push(`xl:p-${values.xl}`);
    if (values['2xl']) classes.push(`2xl:p-${values['2xl']}`);

    return classes.join(' ');
}

/**
 * Create responsive margin classes
 * @param values - Spacing values for different breakpoints
 * @returns CSS class string
 * 
 * @example
 * createResponsiveMargin({ default: '4', md: '6', lg: '8' }); // 'm-4 md:m-6 lg:m-8'
 */
export function createResponsiveMargin(values: {
    default: keyof typeof spacing;
    sm?: keyof typeof spacing;
    md?: keyof typeof spacing;
    lg?: keyof typeof spacing;
    xl?: keyof typeof spacing;
    '2xl'?: keyof typeof spacing;
}): string {
    const classes = [`m-${values.default}`];

    if (values.sm) classes.push(`sm:m-${values.sm}`);
    if (values.md) classes.push(`md:m-${values.md}`);
    if (values.lg) classes.push(`lg:m-${values.lg}`);
    if (values.xl) classes.push(`xl:m-${values.xl}`);
    if (values['2xl']) classes.push(`2xl:m-${values['2xl']}`);

    return classes.join(' ');
}

/**
 * Create responsive gap classes
 * @param values - Spacing values for different breakpoints
 * @returns CSS class string
 * 
 * @example
 * createResponsiveGap({ default: '4', md: '6', lg: '8' }); // 'gap-4 md:gap-6 lg:gap-8'
 */
export function createResponsiveGap(values: {
    default: keyof typeof spacing;
    sm?: keyof typeof spacing;
    md?: keyof typeof spacing;
    lg?: keyof typeof spacing;
    xl?: keyof typeof spacing;
    '2xl'?: keyof typeof spacing;
}): string {
    const classes = [`gap-${values.default}`];

    if (values.sm) classes.push(`sm:gap-${values.sm}`);
    if (values.md) classes.push(`md:gap-${values.md}`);
    if (values.lg) classes.push(`lg:gap-${values.lg}`);
    if (values.xl) classes.push(`xl:gap-${values.xl}`);
    if (values['2xl']) classes.push(`2xl:gap-${values['2xl']}`);

    return classes.join(' ');
}

// ============================================================================
// PRESET SPACING CONFIGURATIONS
// ============================================================================

/**
 * Common spacing presets for quick use
 */
export const spacingPresets = {
    // Card presets
    cardPadding: 'p-6',
    cardGap: 'gap-4',
    cardHeaderGap: 'gap-2',

    // Form presets
    formFieldGap: 'gap-4',
    formLabelGap: 'gap-2',
    formButtonGap: 'gap-3',

    // Layout presets
    sectionGap: 'gap-8',
    containerPadding: 'p-6',

    // List presets
    listItemGap: 'gap-2',
    listItemPadding: 'p-4',

    // Modal presets
    modalPadding: 'p-6',
    modalGap: 'gap-4',

    // Common patterns
    tightSpacing: 'gap-1',
    normalSpacing: 'gap-4',
    relaxedSpacing: 'gap-8',
    wideSpacing: 'gap-12',
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SpacingKey = keyof typeof spacing;
export type ComponentSpacingKey = keyof typeof componentSpacing;
export type SpacingPresetKey = keyof typeof spacingPresets;
