/**
 * @fileoverview Tests for Alert component and subcomponents
 */

import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '../alert';

describe('Alert', () => {
    it('should render alert element', () => {
        render(<Alert data-testid="alert">Alert content</Alert>);

        const alert = screen.getByTestId('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('Alert content');
    });

    it('should have role alert', () => {
        render(<Alert data-testid="alert">Alert</Alert>);

        const alert = screen.getByTestId('alert');
        expect(alert).toHaveAttribute('role', 'alert');
    });

    it('should apply default alert classes', () => {
        render(<Alert data-testid="alert">Alert</Alert>);

        const alert = screen.getByTestId('alert');
        expect(alert).toHaveClass('relative', 'w-full', 'rounded-lg', 'border', 'p-4');
    });

    it('should render with default variant', () => {
        render(<Alert data-testid="alert">Default</Alert>);

        const alert = screen.getByTestId('alert');
        expect(alert).toHaveClass('bg-background', 'text-foreground');
    });

    it('should render with destructive variant', () => {
        render(<Alert variant="destructive" data-testid="alert">Destructive</Alert>);

        const alert = screen.getByTestId('alert');
        expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
    });

    it('should apply custom className', () => {
        render(<Alert className="custom-alert" data-testid="alert">Alert</Alert>);

        const alert = screen.getByTestId('alert');
        expect(alert).toHaveClass('custom-alert', 'relative', 'w-full');
    });

    it('should render as div element', () => {
        render(<Alert data-testid="alert">Alert</Alert>);

        const alert = screen.getByTestId('alert');
        expect(alert.tagName).toBe('DIV');
    });

    it('should support data attributes', () => {
        render(<Alert data-custom="value" data-testid="alert">Alert</Alert>);

        const alert = screen.getByTestId('alert');
        expect(alert).toHaveAttribute('data-custom', 'value');
    });

    it('should support ARIA attributes', () => {
        render(<Alert aria-live="polite" data-testid="alert">Alert</Alert>);

        const alert = screen.getByTestId('alert');
        expect(alert).toHaveAttribute('aria-live', 'polite');
    });
});

describe('AlertTitle', () => {
    it('should render alert title', () => {
        render(<AlertTitle>Alert Title</AlertTitle>);

        const title = screen.getByRole('heading', { level: 5 });
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent('Alert Title');
    });

    it('should render as h5 element', () => {
        render(<AlertTitle data-testid="title">Title</AlertTitle>);

        const title = screen.getByTestId('title');
        expect(title.tagName).toBe('H5');
    });

    it('should apply title classes', () => {
        render(<AlertTitle data-testid="title">Title</AlertTitle>);

        const title = screen.getByTestId('title');
        expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight');
    });

    it('should apply custom className', () => {
        render(<AlertTitle className="custom-title" data-testid="title">Title</AlertTitle>);

        const title = screen.getByTestId('title');
        expect(title).toHaveClass('custom-title', 'font-medium');
    });
});

describe('AlertDescription', () => {
    it('should render alert description', () => {
        render(<AlertDescription>Description text</AlertDescription>);

        expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('should render as div element', () => {
        render(<AlertDescription data-testid="description">Description</AlertDescription>);

        const description = screen.getByTestId('description');
        expect(description.tagName).toBe('DIV');
    });

    it('should apply description classes', () => {
        render(<AlertDescription data-testid="description">Description</AlertDescription>);

        const description = screen.getByTestId('description');
        expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed');
    });

    it('should apply custom className', () => {
        render(<AlertDescription className="custom-desc" data-testid="description">Desc</AlertDescription>);

        const description = screen.getByTestId('description');
        expect(description).toHaveClass('custom-desc', 'text-sm');
    });

    it('should render paragraph content with relaxed leading', () => {
        render(
            <AlertDescription data-testid="description">
                <p>Paragraph text</p>
            </AlertDescription>
        );

        expect(screen.getByText('Paragraph text')).toBeInTheDocument();
    });
});

describe('Alert Complete Structure', () => {
    it('should render complete alert with title and description', () => {
        render(
            <Alert data-testid="alert">
                <AlertTitle>Alert Title</AlertTitle>
                <AlertDescription>Alert description text</AlertDescription>
            </Alert>
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /alert title/i })).toBeInTheDocument();
        expect(screen.getByText('Alert description text')).toBeInTheDocument();
    });

    it('should render destructive alert with complete structure', () => {
        render(
            <Alert variant="destructive" data-testid="alert">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong</AlertDescription>
            </Alert>
        );

        const alert = screen.getByTestId('alert');
        expect(alert).toHaveClass('text-destructive');
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render alert with icon', () => {
        render(
            <Alert data-testid="alert">
                <svg data-testid="icon" />
                <AlertTitle>Title</AlertTitle>
                <AlertDescription>Description</AlertDescription>
            </Alert>
        );

        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should apply icon positioning classes', () => {
        render(<Alert data-testid="alert">Alert</Alert>);

        const alert = screen.getByTestId('alert');
        expect(alert).toHaveClass('[&>svg]:absolute', '[&>svg]:left-4', '[&>svg]:top-4');
    });
});
