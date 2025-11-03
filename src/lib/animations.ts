import { Variants } from 'framer-motion';

/**
 * Framer Motion Animation Presets
 * Reusable animation variants for consistent motion throughout the app
 */

// Fade animations
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
};

export const fadeInDown: Variants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export const fadeInLeft: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

export const fadeInRight: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
};

// Scale animations
export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};

export const scaleUp: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
};

// Slide animations
export const slideInFromBottom: Variants = {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
};

export const slideInFromTop: Variants = {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
};

export const slideInFromLeft: Variants = {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
};

export const slideInFromRight: Variants = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
};

// List animations (staggered children)
export const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

// Card animations
export const cardHover: Variants = {
    initial: { scale: 1 },
    hover: {
        scale: 1.02,
        transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 },
};

// Modal/Dialog animations
export const modalBackdrop: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const modalContent: Variants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            duration: 0.3,
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: {
            duration: 0.2,
        }
    },
};

// Button animations
export const buttonTap = {
    scale: 0.95,
};

export const buttonHover = {
    scale: 1.05,
    transition: { duration: 0.2 },
};

// Page transition animations
export const pageTransition = {
    type: 'tween',
    duration: 0.3,
    ease: 'easeInOut',
};

export const pageVariants: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: {
        opacity: 1,
        x: 0,
        transition: pageTransition,
    },
    exit: {
        opacity: 0,
        x: 20,
        transition: pageTransition,
    },
};

// Notification/Toast animations
export const notificationSlideIn: Variants = {
    initial: { x: '100%', opacity: 0 },
    animate: {
        x: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 500, damping: 30 }
    },
    exit: {
        x: '100%',
        opacity: 0,
        transition: { duration: 0.2 }
    },
};

// Skeleton pulse animation
export const skeletonPulse: Variants = {
    animate: {
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// Rotation animations
export const rotate360: Variants = {
    animate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

// Bounce animation
export const bounce: Variants = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// Shake animation (for errors)
export const shake: Variants = {
    animate: {
        x: [0, -10, 10, -10, 10, 0],
        transition: {
            duration: 0.4,
        },
    },
};

// Common transition presets
export const transitions = {
    default: { duration: 0.3, ease: 'easeInOut' as const },
    fast: { duration: 0.15, ease: 'easeOut' as const },
    slow: { duration: 0.5, ease: 'easeInOut' as const },
    spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
    springy: { type: 'spring' as const, stiffness: 500, damping: 25 },
};