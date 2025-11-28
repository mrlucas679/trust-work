/**
 * @fileoverview Tests for Switch component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../switch';

describe('Switch', () => {
    it('should render switch', () => {
        render(<Switch data-testid="switch" />);

        expect(screen.getByTestId('switch')).toBeInTheDocument();
    });

    it('should have role switch', () => {
        render(<Switch data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveAttribute('role', 'switch');
    });

    it('should apply default switch classes', () => {
        render(<Switch data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveClass('peer', 'inline-flex', 'h-6', 'w-11', 'shrink-0', 'cursor-pointer');
    });

    it('should be unchecked by default', () => {
        render(<Switch data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('should handle checked state', () => {
        render(<Switch checked data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('should handle user click', async () => {
        const user = userEvent.setup();
        const handleCheckedChange = jest.fn();

        render(<Switch onCheckedChange={handleCheckedChange} data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        await user.click(switchElement);

        expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should toggle between on and off', async () => {
        const user = userEvent.setup();
        const handleCheckedChange = jest.fn();

        render(<Switch onCheckedChange={handleCheckedChange} data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');

        await user.click(switchElement);
        expect(handleCheckedChange).toHaveBeenCalledWith(true);

        await user.click(switchElement);
        expect(handleCheckedChange).toHaveBeenCalledWith(false);
    });

    it('should be disabled when disabled prop is true', () => {
        render(<Switch disabled data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toBeDisabled();
    });

    it('should apply disabled classes when disabled', () => {
        render(<Switch disabled data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should not respond to clicks when disabled', async () => {
        const user = userEvent.setup();
        const handleCheckedChange = jest.fn();

        render(<Switch disabled onCheckedChange={handleCheckedChange} data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        await user.click(switchElement);

        expect(handleCheckedChange).not.toHaveBeenCalled();
    });

    it('should apply checked background classes', () => {
        render(<Switch checked data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveClass('data-[state=checked]:bg-primary');
    });

    it('should apply unchecked background classes', () => {
        render(<Switch data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveClass('data-[state=unchecked]:bg-input');
    });

    it('should apply focus-visible classes', () => {
        render(<Switch data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring');
    });

    it('should apply custom className', () => {
        render(<Switch className="custom-switch" data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveClass('custom-switch', 'h-6', 'w-11');
    });

    it('should support name attribute', () => {
        render(<Switch name="notifications" data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveAttribute('name', 'notifications');
    });

    it('should support value attribute', () => {
        render(<Switch value="on" data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveAttribute('value', 'on');
    });

    it('should support data attributes', () => {
        render(<Switch data-custom="value" data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveAttribute('data-custom', 'value');
    });

    it('should support ARIA label', () => {
        render(<Switch aria-label="Enable notifications" data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveAttribute('aria-label', 'Enable notifications');
    });

    it('should handle keyboard interaction - Space key', async () => {
        const user = userEvent.setup();
        const handleCheckedChange = jest.fn();

        render(<Switch onCheckedChange={handleCheckedChange} data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        switchElement.focus();
        await user.keyboard(' ');

        expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should be keyboard focusable', () => {
        render(<Switch data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        switchElement.focus();

        expect(switchElement).toHaveFocus();
    });

    it('should support defaultChecked prop', () => {
        render(<Switch defaultChecked data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('should apply transition classes', () => {
        render(<Switch data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveClass('transition-colors');
    });

    it('should render with rounded-full shape', () => {
        render(<Switch data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveClass('rounded-full');
    });

    it('should support required attribute', () => {
        render(<Switch required data-testid="switch" />);

        const switchElement = screen.getByTestId('switch');
        expect(switchElement).toHaveAttribute('aria-required', 'true');
    });
});
