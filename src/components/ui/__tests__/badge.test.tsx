/**
 * @fileoverview Tests for Badge component
 */

import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
    it('should render badge element', () => {
        render(<Badge data-testid="badge">Badge</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent('Badge');
    });

    it('should render as div element', () => {
        render(<Badge data-testid="badge">Badge</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge.tagName).toBe('DIV');
    });

    it('should apply default badge classes', () => {
        render(<Badge data-testid="badge">Badge</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border', 'px-2.5', 'py-0.5', 'text-xs', 'font-semibold');
    });

    it('should render with default variant', () => {
        render(<Badge data-testid="badge">Default</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground', 'hover:bg-primary/80');
    });

    it('should render with secondary variant', () => {
        render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('border-transparent', 'bg-secondary', 'text-secondary-foreground', 'hover:bg-secondary/80');
    });

    it('should render with destructive variant', () => {
        render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('border-transparent', 'bg-destructive', 'text-destructive-foreground', 'hover:bg-destructive/80');
    });

    it('should render with outline variant', () => {
        render(<Badge variant="outline" data-testid="badge">Outline</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('text-foreground');
        expect(badge).not.toHaveClass('bg-primary');
    });

    it('should apply custom className', () => {
        render(<Badge className="custom-badge" data-testid="badge">Badge</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('custom-badge', 'inline-flex');
    });

    it('should merge custom className with variant classes', () => {
        render(<Badge variant="secondary" className="text-lg" data-testid="badge">Badge</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('text-lg', 'bg-secondary');
    });

    it('should render children correctly', () => {
        render(<Badge>Test Content</Badge>);

        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render with icon and text', () => {
        render(
            <Badge data-testid="badge">
                <span>🔔</span>
                <span>Notification</span>
            </Badge>
        );

        expect(screen.getByText('🔔')).toBeInTheDocument();
        expect(screen.getByText('Notification')).toBeInTheDocument();
    });

    it('should support data attributes', () => {
        render(<Badge data-custom="value" data-testid="badge">Badge</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveAttribute('data-custom', 'value');
    });

    it('should support ARIA attributes', () => {
        render(<Badge aria-label="Status badge" data-testid="badge">Active</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });

    it('should apply transition classes', () => {
        render(<Badge data-testid="badge">Badge</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('transition-colors');
    });

    it('should apply focus ring styles', () => {
        render(<Badge data-testid="badge">Badge</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2');
    });

    it('should support onClick handler', () => {
        const handleClick = jest.fn();

        render(<Badge onClick={handleClick} data-testid="badge">Clickable</Badge>);

        const badge = screen.getByTestId('badge');
        badge.click();

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render with number content', () => {
        render(<Badge data-testid="badge">42</Badge>);

        const badge = screen.getByTestId('badge');
        expect(badge).toHaveTextContent('42');
    });

    it('should render empty badge', () => {
        render(<Badge data-testid="badge" />);

        const badge = screen.getByTestId('badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('inline-flex');
    });

    it('should support multiple badges with different variants', () => {
        render(
            <>
                <Badge variant="default" data-testid="badge1">Default</Badge>
                <Badge variant="secondary" data-testid="badge2">Secondary</Badge>
                <Badge variant="destructive" data-testid="badge3">Destructive</Badge>
                <Badge variant="outline" data-testid="badge4">Outline</Badge>
            </>
        );

        expect(screen.getByTestId('badge1')).toHaveClass('bg-primary');
        expect(screen.getByTestId('badge2')).toHaveClass('bg-secondary');
        expect(screen.getByTestId('badge3')).toHaveClass('bg-destructive');
        expect(screen.getByTestId('badge4')).toHaveClass('text-foreground');
    });
});
