/**
 * @fileoverview Tests for Checkbox component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
    it('should render checkbox', () => {
        render(<Checkbox data-testid="checkbox" />);

        expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });

    it('should have role checkbox', () => {
        render(<Checkbox data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveAttribute('role', 'checkbox');
    });

    it('should apply default checkbox classes', () => {
        render(<Checkbox data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveClass('peer', 'h-4', 'w-4', 'shrink-0', 'rounded-sm', 'border', 'border-primary');
    });

    it('should be unchecked by default', () => {
        render(<Checkbox data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should handle checked state', () => {
        render(<Checkbox checked data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should handle user click', async () => {
        const user = userEvent.setup();
        const handleCheckedChange = jest.fn();

        render(<Checkbox onCheckedChange={handleCheckedChange} data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        await user.click(checkbox);

        expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should toggle between checked and unchecked', async () => {
        const user = userEvent.setup();
        const handleCheckedChange = jest.fn();

        render(<Checkbox onCheckedChange={handleCheckedChange} data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');

        await user.click(checkbox);
        expect(handleCheckedChange).toHaveBeenCalledWith(true);

        await user.click(checkbox);
        expect(handleCheckedChange).toHaveBeenCalledWith(false);
    });

    it('should be disabled when disabled prop is true', () => {
        render(<Checkbox disabled data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toBeDisabled();
    });

    it('should apply disabled classes when disabled', () => {
        render(<Checkbox disabled data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should not respond to clicks when disabled', async () => {
        const user = userEvent.setup();
        const handleCheckedChange = jest.fn();

        render(<Checkbox disabled onCheckedChange={handleCheckedChange} data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        await user.click(checkbox);

        expect(handleCheckedChange).not.toHaveBeenCalled();
    });

    it('should apply checked background classes', () => {
        render(<Checkbox checked data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveClass('data-[state=checked]:bg-primary', 'data-[state=checked]:text-primary-foreground');
    });

    it('should apply focus-visible classes', () => {
        render(<Checkbox data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring');
    });

    it('should apply custom className', () => {
        render(<Checkbox className="custom-checkbox" data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveClass('custom-checkbox', 'h-4', 'w-4');
    });

    it('should support required attribute', () => {
        render(<Checkbox required data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveAttribute('aria-required', 'true');
    });

    it('should support name attribute', () => {
        render(<Checkbox name="terms" data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveAttribute('name', 'terms');
    });

    it('should support value attribute', () => {
        render(<Checkbox value="agreed" data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveAttribute('value', 'agreed');
    });

    it('should support data attributes', () => {
        render(<Checkbox data-custom="value" data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveAttribute('data-custom', 'value');
    });

    it('should support ARIA label', () => {
        render(<Checkbox aria-label="Accept terms" data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveAttribute('aria-label', 'Accept terms');
    });

    it('should handle keyboard interaction - Space key', async () => {
        const user = userEvent.setup();
        const handleCheckedChange = jest.fn();

        render(<Checkbox onCheckedChange={handleCheckedChange} data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        checkbox.focus();
        await user.keyboard(' ');

        expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should be keyboard focusable', () => {
        render(<Checkbox data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        checkbox.focus();

        expect(checkbox).toHaveFocus();
    });

    it('should support defaultChecked prop', () => {
        render(<Checkbox defaultChecked data-testid="checkbox" />);

        const checkbox = screen.getByTestId('checkbox');
        expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should render check indicator when checked', () => {
        const { container } = render(<Checkbox checked data-testid="checkbox" />);

        const indicator = container.querySelector('[data-state="checked"]');
        expect(indicator).toBeInTheDocument();
    });
});
