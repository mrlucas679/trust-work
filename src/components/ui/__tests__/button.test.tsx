/**
 * @fileoverview Tests for Button component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
    it('should render button element by default', () => {
        render(<Button>Click me</Button>);

        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
    });

    it('should render children correctly', () => {
        render(<Button>Test Content</Button>);

        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply default variant classes', () => {
        render(<Button>Default</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should apply destructive variant classes', () => {
        render(<Button variant="destructive">Delete</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('should apply outline variant classes', () => {
        render(<Button variant="outline">Outline</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('border', 'border-input', 'bg-background');
    });

    it('should apply secondary variant classes', () => {
        render(<Button variant="secondary">Secondary</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('should apply ghost variant classes', () => {
        render(<Button variant="ghost">Ghost</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
    });

    it('should apply link variant classes', () => {
        render(<Button variant="link">Link</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });

    it('should apply default size classes', () => {
        render(<Button>Default Size</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('h-10', 'px-4', 'py-2');
    });

    it('should apply small size classes', () => {
        render(<Button size="sm">Small</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('h-9', 'px-3');
    });

    it('should apply large size classes', () => {
        render(<Button size="lg">Large</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('h-11', 'px-8');
    });

    it('should apply icon size classes', () => {
        render(<Button size="icon" aria-label="Icon button">+</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('h-10', 'w-10');
    });

    it('should handle onClick events', () => {
        const onClick = jest.fn();
        render(<Button onClick={onClick}>Click me</Button>);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('should not fire onClick when disabled', () => {
        const onClick = jest.fn();
        render(<Button disabled onClick={onClick}>Disabled</Button>);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(onClick).not.toHaveBeenCalled();
    });

    it('should apply custom className', () => {
        render(<Button className="custom-class">Custom</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
    });

    it('should preserve base classes when custom className is provided', () => {
        render(<Button className="custom-class">Custom</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
        expect(button).toHaveClass('custom-class');
    });

    it('should support type attribute', () => {
        render(<Button type="submit">Submit</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'submit');
    });

    it('should support aria attributes', () => {
        render(<Button aria-label="Accessible button" aria-pressed="true">Button</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Accessible button');
        expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should support data attributes', () => {
        render(<Button data-testid="custom-test-id">Button</Button>);

        expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });

    it('should render with icon and text', () => {
        render(
            <Button>
                <span data-testid="icon">🔍</span>
                Search
            </Button>
        );

        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('should combine variant and size classes', () => {
        render(<Button variant="outline" size="lg">Large Outline</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('border', 'border-input'); // outline variant
        expect(button).toHaveClass('h-11', 'px-8'); // large size
    });

    it('should have transition classes for smooth interactions', () => {
        render(<Button>Transition</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('transition-colors');
    });

    it('should have focus-visible styles', () => {
        render(<Button>Focus</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('should have rounded corners', () => {
        render(<Button>Rounded</Button>);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('rounded-md');
    });

    it('should support multiple clicks', () => {
        const onClick = jest.fn();
        render(<Button onClick={onClick}>Multi Click</Button>);

        const button = screen.getByRole('button');
        fireEvent.click(button);
        fireEvent.click(button);
        fireEvent.click(button);

        expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('should render as child component when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        );

        const link = screen.getByRole('link');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/test');
        expect(link).toHaveClass('bg-primary'); // Button classes applied to anchor
    });
});
