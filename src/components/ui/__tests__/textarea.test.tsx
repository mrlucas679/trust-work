/**
 * @fileoverview Tests for Textarea component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../textarea';

describe('Textarea', () => {
    it('should render textarea element', () => {
        render(<Textarea data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toBeInTheDocument();
        expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should apply default textarea classes', () => {
        render(<Textarea data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border', 'border-input', 'bg-background');
    });

    it('should render with placeholder', () => {
        render(<Textarea placeholder="Enter text..." data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveAttribute('placeholder', 'Enter text...');
    });

    it('should render with value', () => {
        render(<Textarea value="Test value" onChange={() => { }} data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
        expect(textarea.value).toBe('Test value');
    });

    it('should handle onChange event', async () => {
        const user = userEvent.setup();
        const handleChange = jest.fn();

        render(<Textarea onChange={handleChange} data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        await user.type(textarea, 'test');

        expect(handleChange).toHaveBeenCalled();
        expect(handleChange).toHaveBeenCalledTimes(4); // 4 characters typed
    });

    it('should handle user typing', async () => {
        const user = userEvent.setup();

        render(<Textarea data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
        await user.type(textarea, 'Hello World');

        expect(textarea.value).toBe('Hello World');
    });

    it('should handle multiline text', async () => {
        const user = userEvent.setup();

        render(<Textarea data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
        await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');

        expect(textarea.value).toContain('Line 1\nLine 2\nLine 3');
    });

    it('should be disabled when disabled prop is true', () => {
        render(<Textarea disabled data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toBeDisabled();
    });

    it('should apply disabled cursor classes when disabled', () => {
        render(<Textarea disabled data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should not allow typing when disabled', async () => {
        const user = userEvent.setup();

        render(<Textarea disabled data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
        await user.type(textarea, 'test');

        expect(textarea.value).toBe('');
    });

    it('should be readonly when readonly prop is true', () => {
        render(<Textarea readOnly data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveAttribute('readonly');
    });

    it('should not allow typing when readonly', async () => {
        const user = userEvent.setup();

        render(<Textarea readOnly value="Initial" data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
        await user.type(textarea, 'test');

        expect(textarea.value).toBe('Initial');
    });

    it('should apply custom className', () => {
        render(<Textarea className="custom-textarea" data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveClass('custom-textarea', 'flex', 'min-h-[80px]');
    });

    it('should merge custom className with default classes', () => {
        render(<Textarea className="text-red-500 min-h-[200px]" data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveClass('text-red-500', 'min-h-[200px]', 'rounded-md');
    });

    it('should support ARIA attributes', () => {
        render(
            <Textarea
                aria-label="Description"
                aria-describedby="description-help"
                aria-required="true"
                data-testid="textarea"
            />
        );

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveAttribute('aria-label', 'Description');
        expect(textarea).toHaveAttribute('aria-describedby', 'description-help');
        expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('should support data attributes', () => {
        render(<Textarea data-custom="value" data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveAttribute('data-custom', 'value');
    });

    it('should support name attribute', () => {
        render(<Textarea name="description" data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveAttribute('name', 'description');
    });

    it('should support id attribute', () => {
        render(<Textarea id="description-textarea" data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveAttribute('id', 'description-textarea');
    });

    it('should support required attribute', () => {
        render(<Textarea required data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toBeRequired();
    });

    it('should support maxLength attribute', () => {
        render(<Textarea maxLength={100} data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveAttribute('maxLength', '100');
    });

    it('should support rows attribute', () => {
        render(<Textarea rows={10} data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveAttribute('rows', '10');
    });

    it('should support cols attribute', () => {
        render(<Textarea cols={50} data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveAttribute('cols', '50');
    });

    it('should apply focus-visible ring styles', () => {
        render(<Textarea data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring');
    });

    it('should apply placeholder styles', () => {
        render(<Textarea placeholder="Type here..." data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveClass('placeholder:text-muted-foreground');
    });

    it('should handle onFocus and onBlur events', async () => {
        const user = userEvent.setup();
        const handleFocus = jest.fn();
        const handleBlur = jest.fn();

        render(<Textarea onFocus={handleFocus} onBlur={handleBlur} data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        await user.click(textarea);

        expect(handleFocus).toHaveBeenCalledTimes(1);

        await user.tab(); // Move focus away

        expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle onKeyDown event', async () => {
        const user = userEvent.setup();
        const handleKeyDown = jest.fn();

        render(<Textarea onKeyDown={handleKeyDown} data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        await user.type(textarea, 'a');

        expect(handleKeyDown).toHaveBeenCalled();
    });

    it('should support autoFocus attribute', () => {
        render(<Textarea autoFocus data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveFocus();
    });

    it('should apply text-sm class', () => {
        render(<Textarea data-testid="textarea" />);

        const textarea = screen.getByTestId('textarea');
        expect(textarea).toHaveClass('text-sm');
    });
});
