import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import * as animations from '@/lib/animations';

interface AnimatedProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode;
    animation?: keyof typeof animations;
    delay?: number;
}

/**
 * Animated component wrapper using Framer Motion
 * Provides easy access to predefined animation variants
 * 
 * @example
 * <Animated animation="fadeInUp" delay={0.2}>
 *   <Card>Content</Card>
 * </Animated>
 */
export function Animated({
    children,
    animation = 'fadeIn',
    delay = 0,
    ...props
}: AnimatedProps) {
    const variants = animations[animation];

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={typeof variants === 'object' && 'initial' in variants ? variants : undefined}
            transition={{ ...animations.transitions.default, delay }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Animated list container with staggered children
 * 
 * @example
 * <AnimatedList>
 *   {items.map(item => (
 *     <AnimatedListItem key={item.id}>
 *       <Card>{item.content}</Card>
 *     </AnimatedListItem>
 *   ))}
 * </AnimatedList>
 */
export function AnimatedList({ children, ...props }: HTMLMotionProps<'div'>) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={animations.staggerContainer}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedListItem({ children, ...props }: HTMLMotionProps<'div'>) {
    return (
        <motion.div
            variants={animations.staggerItem}
            transition={animations.transitions.default}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Animated card with hover effects
 */
export function AnimatedCard({ children, ...props }: HTMLMotionProps<'div'>) {
    return (
        <motion.div
            variants={animations.cardHover}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Animated modal/dialog backdrop
 */
export function AnimatedBackdrop({ children, ...props }: HTMLMotionProps<'div'>) {
    return (
        <motion.div
            variants={animations.modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={animations.transitions.fast}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Animated modal/dialog content
 */
export function AnimatedModalContent({ children, ...props }: HTMLMotionProps<'div'>) {
    return (
        <motion.div
            variants={animations.modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Page transition wrapper
 * Use with React Router route transitions
 */
export function AnimatedPage({ children, ...props }: HTMLMotionProps<'div'>) {
    return (
        <motion.div
            variants={animations.pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            {...props}
        >
            {children}
        </motion.div>
    );
}
