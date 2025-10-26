/**
 * @fileoverview Tests for Separator component
 */

import { render, screen } from '@testing-library/react';
import { Separator } from '../separator';

describe('Separator', () => {
    it('should render separator element', () => {
        render(<Separator data-testid="separator" />);

        expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should have role separator', () => {
        render(<Separator data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveAttribute('role', 'separator');
    });

    it('should apply default separator classes', () => {
        render(<Separator data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('shrink-0', 'bg-border');
    });

    it('should render horizontal by default', () => {
        render(<Separator data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveAttribute('data-orientation', 'horizontal');
        expect(separator).toHaveClass('h-[1px]', 'w-full');
    });

    it('should render vertical when orientation is vertical', () => {
        render(<Separator orientation="vertical" data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveAttribute('data-orientation', 'vertical');
        expect(separator).toHaveClass('h-full', 'w-[1px]');
    });

    it('should be decorative by default', () => {
        render(<Separator data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveAttribute('aria-hidden', 'true');
    });

    it('should not be decorative when decorative is false', () => {
        render(<Separator decorative={false} data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).not.toHaveAttribute('aria-hidden', 'true');
    });

    it('should apply custom className', () => {
        render(<Separator className="custom-separator" data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('custom-separator', 'shrink-0', 'bg-border');
    });

    it('should merge custom className with orientation classes', () => {
        render(<Separator orientation="vertical" className="bg-red-500" data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('bg-red-500', 'h-full', 'w-[1px]');
    });

    it('should support data attributes', () => {
        render(<Separator data-custom="value" data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveAttribute('data-custom', 'value');
    });

    it('should support ARIA label when not decorative', () => {
        render(<Separator decorative={false} aria-label="Content separator" data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveAttribute('aria-label', 'Content separator');
    });

    it('should render multiple horizontal separators', () => {
        render(
            <>
                <div>Section 1</div>
                <Separator data-testid="sep1" />
                <div>Section 2</div>
                <Separator data-testid="sep2" />
                <div>Section 3</div>
            </>
        );

        expect(screen.getByTestId('sep1')).toHaveClass('h-[1px]', 'w-full');
        expect(screen.getByTestId('sep2')).toHaveClass('h-[1px]', 'w-full');
    });

    it('should render multiple vertical separators', () => {
        render(
            <>
                <span>Item 1</span>
                <Separator orientation="vertical" data-testid="sep1" />
                <span>Item 2</span>
                <Separator orientation="vertical" data-testid="sep2" />
                <span>Item 3</span>
            </>
        );

        expect(screen.getByTestId('sep1')).toHaveClass('h-full', 'w-[1px]');
        expect(screen.getByTestId('sep2')).toHaveClass('h-full', 'w-[1px]');
    });

    it('should work in flex layouts', () => {
        render(
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>Left</span>
                <Separator orientation="vertical" data-testid="separator" />
                <span>Right</span>
            </div>
        );

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('h-full', 'w-[1px]');
    });

    it('should work in block layouts', () => {
        render(
            <div>
                <div>Top</div>
                <Separator data-testid="separator" />
                <div>Bottom</div>
            </div>
        );

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('h-[1px]', 'w-full');
    });

    it('should support custom height for horizontal separator', () => {
        render(<Separator className="h-[2px]" data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('h-[2px]');
    });

    it('should support custom width for vertical separator', () => {
        render(<Separator orientation="vertical" className="w-[2px]" data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('w-[2px]');
    });

    it('should support custom color', () => {
        render(<Separator className="bg-primary" data-testid="separator" />);

        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('bg-primary');
    });
});
