/**
 * @fileoverview Tests for Label component
 */

import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label', () => {
    it('should render label element', () => {
        render(<Label>Label text</Label>);

        expect(screen.getByText('Label text')).toBeInTheDocument();
    });

    it('should render as label element', () => {
        render(<Label data-testid="label">Label</Label>);

        const label = screen.getByTestId('label');
        expect(label.tagName).toBe('LABEL');
    });

    it('should apply default label classes', () => {
        render(<Label data-testid="label">Label</Label>);

        const label = screen.getByTestId('label');
        expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none');
    });

    it('should apply peer-disabled classes', () => {
        render(<Label data-testid="label">Label</Label>);

        const label = screen.getByTestId('label');
        expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
    });

    it('should apply custom className', () => {
        render(<Label className="custom-label" data-testid="label">Label</Label>);

        const label = screen.getByTestId('label');
        expect(label).toHaveClass('custom-label', 'text-sm');
    });

    it('should support htmlFor attribute', () => {
        render(<Label htmlFor="input-id" data-testid="label">Username</Label>);

        const label = screen.getByTestId('label');
        expect(label).toHaveAttribute('for', 'input-id');
    });

    it('should associate with input via htmlFor', () => {
        render(
            <>
                <Label htmlFor="username">Username</Label>
                <input id="username" />
            </>
        );

        const label = screen.getByText('Username');
        const input = screen.getByRole('textbox');

        expect(label).toHaveAttribute('for', 'username');
        expect(input).toHaveAttribute('id', 'username');
    });

    it('should render with nested content', () => {
        render(
            <Label data-testid="label">
                <span>Required</span>
                <span className="text-red-500">*</span>
            </Label>
        );

        expect(screen.getByText('Required')).toBeInTheDocument();
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should support data attributes', () => {
        render(<Label data-custom="value" data-testid="label">Label</Label>);

        const label = screen.getByTestId('label');
        expect(label).toHaveAttribute('data-custom', 'value');
    });

    it('should support ARIA attributes', () => {
        render(<Label aria-label="Form label" data-testid="label">Label</Label>);

        const label = screen.getByTestId('label');
        expect(label).toHaveAttribute('aria-label', 'Form label');
    });

    it('should render multiple labels', () => {
        render(
            <>
                <Label data-testid="label1">Label 1</Label>
                <Label data-testid="label2">Label 2</Label>
                <Label data-testid="label3">Label 3</Label>
            </>
        );

        expect(screen.getByTestId('label1')).toHaveTextContent('Label 1');
        expect(screen.getByTestId('label2')).toHaveTextContent('Label 2');
        expect(screen.getByTestId('label3')).toHaveTextContent('Label 3');
    });

    it('should work with form field pattern', () => {
        render(
            <div>
                <Label htmlFor="email">Email</Label>
                <input id="email" type="email" />
            </div>
        );

        const label = screen.getByText('Email');
        const input = screen.getByRole('textbox');

        expect(label).toBeInTheDocument();
        expect(input).toBeInTheDocument();
    });

    it('should merge className with default styles', () => {
        render(<Label className="text-lg text-blue-500" data-testid="label">Label</Label>);

        const label = screen.getByTestId('label');
        expect(label).toHaveClass('text-lg', 'text-blue-500', 'font-medium');
    });

    it('should handle onClick event', () => {
        const handleClick = jest.fn();

        render(<Label onClick={handleClick} data-testid="label">Clickable Label</Label>);

        const label = screen.getByTestId('label');
        label.click();

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render with icon', () => {
        render(
            <Label data-testid="label">
                <svg data-testid="icon" />
                Label with icon
            </Label>
        );

        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(screen.getByText('Label with icon')).toBeInTheDocument();
    });

    it('should support id attribute', () => {
        render(<Label id="label-id" data-testid="label">Label</Label>);

        const label = screen.getByTestId('label');
        expect(label).toHaveAttribute('id', 'label-id');
    });
});
