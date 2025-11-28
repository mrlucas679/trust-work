/**
 * Design Tokens
 * 
 * This file contains all design system tokens for TrustWork.
 * These tokens ensure consistency across the application and facilitate
 * design-development handoff.
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
    // Brand Colors
    brand: {
        primary: 'hsl(217 91% 60%)',
        primaryForeground: 'hsl(0 0% 100%)',
        secondary: 'hsl(214 32% 91%)',
        secondaryForeground: 'hsl(220 13% 18%)',
    },

    // Semantic Colors
    semantic: {
        success: 'hsl(142 76% 36%)',
        successForeground: 'hsl(0 0% 100%)',
        warning: 'hsl(38 92% 50%)',
        warningForeground: 'hsl(0 0% 100%)',
        destructive: 'hsl(0 84% 60%)',
        destructiveForeground: 'hsl(0 0% 100%)',
        verified: 'hsl(142 76% 36%)',
        verifiedForeground: 'hsl(0 0% 100%)',
        flagged: 'hsl(0 84% 60%)',
        flaggedForeground: 'hsl(0 0% 100%)',
    },

    // Surface Colors (Light Mode)
    light: {
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(220 13% 18%)',
        card: 'hsl(0 0% 100%)',
        cardForeground: 'hsl(220 13% 18%)',
        popover: 'hsl(0 0% 100%)',
        popoverForeground: 'hsl(220 13% 18%)',
        muted: 'hsl(220 14% 96%)',
        mutedForeground: 'hsl(220 9% 46%)',
        accent: 'hsl(217 91% 60%)',
        accentForeground: 'hsl(0 0% 100%)',
        border: 'hsl(220 13% 91%)',
        input: 'hsl(220 13% 91%)',
        ring: 'hsl(217 91% 60%)',
    },

    // Surface Colors (Dark Mode)
    dark: {
        background: 'hsl(222.2 84% 4.9%)',
        foreground: 'hsl(210 40% 98%)',
        card: 'hsl(222.2 84% 4.9%)',
        cardForeground: 'hsl(210 40% 98%)',
        popover: 'hsl(222.2 84% 4.9%)',
        popoverForeground: 'hsl(210 40% 98%)',
        muted: 'hsl(217.2 32.6% 17.5%)',
        mutedForeground: 'hsl(215 20.2% 65.1%)',
        accent: 'hsl(217.2 32.6% 17.5%)',
        accentForeground: 'hsl(210 40% 98%)',
        border: 'hsl(217.2 32.6% 17.5%)',
        input: 'hsl(217.2 32.6% 17.5%)',
        ring: 'hsl(212.7 26.8% 83.9%)',
    },

    // Sidebar Colors
    sidebar: {
        light: {
            background: 'hsl(0 0% 98%)',
            foreground: 'hsl(240 5.3% 26.1%)',
            primary: 'hsl(240 5.9% 10%)',
            primaryForeground: 'hsl(0 0% 98%)',
            accent: 'hsl(240 4.8% 95.9%)',
            accentForeground: 'hsl(240 5.9% 10%)',
            border: 'hsl(220 13% 91%)',
            ring: 'hsl(217.2 91.2% 59.8%)',
        },
        dark: {
            background: 'hsl(240 5.9% 10%)',
            foreground: 'hsl(240 4.8% 95.9%)',
            primary: 'hsl(224.3 76.3% 48%)',
            primaryForeground: 'hsl(0 0% 100%)',
            accent: 'hsl(240 3.7% 15.9%)',
            accentForeground: 'hsl(240 4.8% 95.9%)',
            border: 'hsl(240 3.7% 15.9%)',
            ring: 'hsl(217.2 91.2% 59.8%)',
        },
    },
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

/**
 * Spacing scale based on Tailwind's default spacing (4px base unit)
 * Use these for consistent spacing throughout the application
 */
export const spacing = {
    /** 0px */
    none: '0',
    /** 1px */
    px: '1px',
    /** 2px */
    0.5: '0.125rem',
    /** 4px */
    1: '0.25rem',
    /** 6px */
    1.5: '0.375rem',
    /** 8px */
    2: '0.5rem',
    /** 10px */
    2.5: '0.625rem',
    /** 12px */
    3: '0.75rem',
    /** 14px */
    3.5: '0.875rem',
    /** 16px */
    4: '1rem',
    /** 20px */
    5: '1.25rem',
    /** 24px */
    6: '1.5rem',
    /** 28px */
    7: '1.75rem',
    /** 32px */
    8: '2rem',
    /** 36px */
    9: '2.25rem',
    /** 40px */
    10: '2.5rem',
    /** 44px */
    11: '2.75rem',
    /** 48px */
    12: '3rem',
    /** 56px */
    14: '3.5rem',
    /** 64px */
    16: '4rem',
    /** 80px */
    20: '5rem',
    /** 96px */
    24: '6rem',
    /** 112px */
    28: '7rem',
    /** 128px */
    32: '8rem',
    /** 144px */
    36: '9rem',
    /** 160px */
    40: '10rem',
    /** 176px */
    44: '11rem',
    /** 192px */
    48: '12rem',
    /** 208px */
    52: '13rem',
    /** 224px */
    56: '14rem',
    /** 240px */
    60: '15rem',
    /** 256px */
    64: '16rem',
    /** 288px */
    72: '18rem',
    /** 320px */
    80: '20rem',
    /** 384px */
    96: '24rem',
} as const;

/**
 * Component-specific spacing presets for common patterns
 */
export const componentSpacing = {
    // Card spacing
    card: {
        padding: spacing[6],       // 24px
        gap: spacing[4],           // 16px
        headerGap: spacing[2],     // 8px
    },

    // Form spacing
    form: {
        fieldGap: spacing[4],      // 16px
        labelGap: spacing[2],      // 8px
        buttonGap: spacing[3],     // 12px
    },

    // Layout spacing
    layout: {
        sectionGap: spacing[8],    // 32px
        containerPadding: spacing[6], // 24px
        navbarHeight: spacing[16], // 64px
        sidebarWidth: '16rem',     // 256px
    },

    // List spacing
    list: {
        itemGap: spacing[2],       // 8px
        itemPadding: spacing[4],   // 16px
    },

    // Modal spacing
    modal: {
        padding: spacing[6],       // 24px
        gap: spacing[4],           // 16px
    },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

/**
 * Font family tokens
 */
export const fontFamily = {
    sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

/**
 * Font size tokens with corresponding line heights
 */
export const fontSize = {
    xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px / 16px
    sm: { size: '0.875rem', lineHeight: '1.25rem' },  // 14px / 20px
    base: { size: '1rem', lineHeight: '1.5rem' },     // 16px / 24px
    lg: { size: '1.125rem', lineHeight: '1.75rem' },  // 18px / 28px
    xl: { size: '1.25rem', lineHeight: '1.75rem' },   // 20px / 28px
    '2xl': { size: '1.5rem', lineHeight: '2rem' },    // 24px / 32px
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px / 36px
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' }, // 36px / 40px
    '5xl': { size: '3rem', lineHeight: '1' },         // 48px / 48px
    '6xl': { size: '3.75rem', lineHeight: '1' },      // 60px / 60px
    '7xl': { size: '4.5rem', lineHeight: '1' },       // 72px / 72px
    '8xl': { size: '6rem', lineHeight: '1' },         // 96px / 96px
    '9xl': { size: '8rem', lineHeight: '1' },         // 128px / 128px
} as const;

/**
 * Font weight tokens
 */
export const fontWeight = {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
} as const;

/**
 * Letter spacing tokens
 */
export const letterSpacing = {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
} as const;

/**
 * Line height tokens
 */
export const lineHeight = {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

/**
 * Border radius scale
 */
export const borderRadius = {
    none: '0',
    sm: 'calc(0.5rem - 4px)',  // ~4px
    md: 'calc(0.5rem - 2px)',  // ~6px
    lg: '0.5rem',               // 8px
    xl: '0.75rem',              // 12px
    '2xl': '1rem',              // 16px
    '3xl': '1.5rem',            // 24px
    full: '9999px',
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

/**
 * Box shadow scale
 */
export const boxShadow = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
} as const;

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

/**
 * Z-index scale for consistent layering
 */
export const zIndex = {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    offcanvas: 1050,
    modal: 1060,
    popover: 1070,
    tooltip: 1080,
} as const;

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

/**
 * Transition duration tokens
 */
export const transitionDuration = {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
} as const;

/**
 * Transition timing function tokens
 */
export const transitionTimingFunction = {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

/**
 * Responsive breakpoints
 */
export const breakpoints = {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

// ============================================================================
// ACCESSIBILITY TOKENS
// ============================================================================

/**
 * Minimum touch target sizes for mobile (WCAG 2.1 AA)
 */
export const touchTarget = {
    minimum: '44px',    // WCAG 2.1 AA minimum
    recommended: '48px', // iOS/Android recommended
} as const;

/**
 * Focus ring styles for accessibility
 */
export const focusRing = {
    width: '2px',
    offset: '2px',
    color: 'hsl(217 91% 60%)', // Primary color
    style: 'solid',
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Complete design system token export
 */
export const designTokens = {
    colors,
    spacing,
    componentSpacing,
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
    borderRadius,
    boxShadow,
    zIndex,
    transitionDuration,
    transitionTimingFunction,
    breakpoints,
    touchTarget,
    focusRing,
} as const;

/**
 * Type for design token keys
 */
export type DesignTokens = typeof designTokens;
