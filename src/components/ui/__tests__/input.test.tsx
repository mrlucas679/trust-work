/**
 * @fileoverview Tests for Input component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input', () => {
    it('should render input element', () => {
        render(<Input data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toBeInTheDocument();
        expect(input.tagName).toBe('INPUT');
    });

    it('should apply default input classes', () => {
        render(<Input data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-input', 'bg-background');
    });

    it('should render with type text by default', () => {
        render(<Input data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('type', 'text');
    });

    it('should support different input types', () => {
        const { rerender } = render(<Input type="email" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');

        rerender(<Input type="password" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');

        rerender(<Input type="number" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');

        rerender(<Input type="tel" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('type', 'tel');
    });

    it('should render with placeholder', () => {
        render(<Input placeholder="Enter text..." data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('placeholder', 'Enter text...');
    });

    it('should render with value', () => {
        render(<Input value="Test value" onChange={() => { }} data-testid="input" />);

        const input = screen.getByTestId('input') as HTMLInputElement;
        expect(input.value).toBe('Test value');
    });

    it('should handle onChange event', async () => {
        const user = userEvent.setup();
        const handleChange = jest.fn();

        render(<Input onChange={handleChange} data-testid="input" />);

        const input = screen.getByTestId('input');
        await user.type(input, 'test');

        expect(handleChange).toHaveBeenCalled();
        expect(handleChange).toHaveBeenCalledTimes(4); // 4 characters typed
    });

    it('should handle user typing', async () => {
        const user = userEvent.setup();

        render(<Input data-testid="input" />);

        const input = screen.getByTestId('input') as HTMLInputElement;
        await user.type(input, 'Hello World');

        expect(input.value).toBe('Hello World');
    });

    it('should be disabled when disabled prop is true', () => {
        render(<Input disabled data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toBeDisabled();
    });

    it('should apply disabled cursor classes when disabled', () => {
        render(<Input disabled data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should not allow typing when disabled', async () => {
        const user = userEvent.setup();

        render(<Input disabled data-testid="input" />);

        const input = screen.getByTestId('input') as HTMLInputElement;
        await user.type(input, 'test');

        expect(input.value).toBe('');
    });

    it('should be readonly when readonly prop is true', () => {
        render(<Input readOnly data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('readonly');
    });

    it('should not allow typing when readonly', async () => {
        const user = userEvent.setup();

        render(<Input readOnly value="Initial" data-testid="input" />);

        const input = screen.getByTestId('input') as HTMLInputElement;
        await user.type(input, 'test');

        expect(input.value).toBe('Initial');
    });

    it('should apply custom className', () => {
        render(<Input className="custom-input" data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveClass('custom-input', 'flex', 'h-10');
    });

    it('should merge custom className with default classes', () => {
        render(<Input className="text-red-500" data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveClass('text-red-500', 'rounded-md', 'border');
    });

    it('should support ARIA attributes', () => {
        render(
            <Input
                aria-label="Username"
                aria-describedby="username-help"
                aria-required="true"
                data-testid="input"
            />
        );

        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('aria-label', 'Username');
        expect(input).toHaveAttribute('aria-describedby', 'username-help');
        expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should support data attributes', () => {
        render(<Input data-custom="value" data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('data-custom', 'value');
    });

    it('should support name attribute', () => {
        render(<Input name="username" data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('name', 'username');
    });

    it('should support id attribute', () => {
        render(<Input id="username-input" data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('id', 'username-input');
    });

    it('should support required attribute', () => {
        render(<Input required data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toBeRequired();
    });

    it('should support maxLength attribute', () => {
        render(<Input maxLength={10} data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should support min and max for number inputs', () => {
        render(<Input type="number" min={0} max={100} data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('min', '0');
        expect(input).toHaveAttribute('max', '100');
    });

    it('should support pattern attribute', () => {
        render(<Input pattern="[0-9]*" data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('pattern', '[0-9]*');
    });

    it('should apply focus-visible ring styles', () => {
        render(<Input data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring');
    });

    it('should apply placeholder styles', () => {
        render(<Input placeholder="Type here..." data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveClass('placeholder:text-muted-foreground');
    });

    it('should support autoComplete attribute', () => {
        render(<Input autoComplete="email" data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveAttribute('autocomplete', 'email');
    });

    it('should support autoFocus attribute', () => {
        render(<Input autoFocus data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveFocus();
    });

    it('should apply file input specific styles', () => {
        render(<Input type="file" data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toHaveClass('file:border-0', 'file:bg-transparent', 'file:text-sm', 'file:font-medium');
    });

    it('should handle onFocus and onBlur events', async () => {
        const user = userEvent.setup();
        const handleFocus = jest.fn();
        const handleBlur = jest.fn();

        render(<Input onFocus={handleFocus} onBlur={handleBlur} data-testid="input" />);

        const input = screen.getByTestId('input');
        await user.click(input);

        expect(handleFocus).toHaveBeenCalledTimes(1);

        await user.tab(); // Move focus away

        expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle onKeyDown event', async () => {
        const user = userEvent.setup();
        const handleKeyDown = jest.fn();

        render(<Input onKeyDown={handleKeyDown} data-testid="input" />);

        const input = screen.getByTestId('input');
        await user.type(input, 'a');

        expect(handleKeyDown).toHaveBeenCalled();
    });
});
