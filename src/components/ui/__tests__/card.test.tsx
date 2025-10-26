/**
 * @fileoverview Tests for Card component and subcomponents
 */

import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card', () => {
    it('should render card container', () => {
        const { container } = render(<Card data-testid="card">Card Content</Card>);

        const card = screen.getByTestId('card');
        expect(card).toBeInTheDocument();
    });

    it('should apply default card classes', () => {
        const { container } = render(<Card data-testid="card">Content</Card>);

        const card = screen.getByTestId('card');
        expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm');
    });

    it('should render children correctly', () => {
        render(<Card>Test Card Content</Card>);

        expect(screen.getByText('Test Card Content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
        const { container } = render(<Card className="custom-card" data-testid="card">Content</Card>);

        const card = screen.getByTestId('card');
        expect(card).toHaveClass('custom-card', 'rounded-lg');
    });

    it('should render as div element', () => {
        const { container } = render(<Card data-testid="card">Content</Card>);

        const card = screen.getByTestId('card');
        expect(card.tagName).toBe('DIV');
    });

    it('should support data attributes', () => {
        render(<Card data-custom="value" data-testid="card">Content</Card>);

        const card = screen.getByTestId('card');
        expect(card).toHaveAttribute('data-custom', 'value');
    });
});

describe('CardHeader', () => {
    it('should render card header', () => {
        render(<CardHeader data-testid="header">Header Content</CardHeader>);

        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('should apply header classes', () => {
        render(<CardHeader data-testid="header">Header</CardHeader>);

        const header = screen.getByTestId('header');
        expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('should apply custom className', () => {
        render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>);

        const header = screen.getByTestId('header');
        expect(header).toHaveClass('custom-header', 'flex', 'flex-col');
    });
});

describe('CardTitle', () => {
    it('should render card title as h3', () => {
        render(<CardTitle>Card Title</CardTitle>);

        const title = screen.getByRole('heading', { level: 3 });
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent('Card Title');
    });

    it('should apply title classes', () => {
        render(<CardTitle>Title</CardTitle>);

        const title = screen.getByRole('heading');
        expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    it('should apply custom className', () => {
        render(<CardTitle className="custom-title">Title</CardTitle>);

        const title = screen.getByRole('heading');
        expect(title).toHaveClass('custom-title', 'text-2xl');
    });
});

describe('CardDescription', () => {
    it('should render card description as paragraph', () => {
        render(<CardDescription>Description text</CardDescription>);

        const description = screen.getByText('Description text');
        expect(description).toBeInTheDocument();
        expect(description.tagName).toBe('P');
    });

    it('should apply description classes', () => {
        render(<CardDescription data-testid="description">Description</CardDescription>);

        const description = screen.getByTestId('description');
        expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should apply custom className', () => {
        render(<CardDescription className="custom-desc" data-testid="description">Desc</CardDescription>);

        const description = screen.getByTestId('description');
        expect(description).toHaveClass('custom-desc', 'text-sm');
    });
});

describe('CardContent', () => {
    it('should render card content', () => {
        render(<CardContent data-testid="content">Content Area</CardContent>);

        expect(screen.getByTestId('content')).toBeInTheDocument();
        expect(screen.getByText('Content Area')).toBeInTheDocument();
    });

    it('should apply content classes', () => {
        render(<CardContent data-testid="content">Content</CardContent>);

        const content = screen.getByTestId('content');
        expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('should apply custom className', () => {
        render(<CardContent className="custom-content" data-testid="content">Content</CardContent>);

        const content = screen.getByTestId('content');
        expect(content).toHaveClass('custom-content', 'p-6');
    });
});

describe('CardFooter', () => {
    it('should render card footer', () => {
        render(<CardFooter data-testid="footer">Footer Content</CardFooter>);

        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('should apply footer classes', () => {
        render(<CardFooter data-testid="footer">Footer</CardFooter>);

        const footer = screen.getByTestId('footer');
        expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('should apply custom className', () => {
        render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>);

        const footer = screen.getByTestId('footer');
        expect(footer).toHaveClass('custom-footer', 'flex');
    });
});

describe('Card Complete Structure', () => {
    it('should render complete card with all subcomponents', () => {
        render(
            <Card data-testid="card">
                <CardHeader>
                    <CardTitle>Test Title</CardTitle>
                    <CardDescription>Test Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Main content area</p>
                </CardContent>
                <CardFooter>
                    <button>Action</button>
                </CardFooter>
            </Card>
        );

        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /test title/i })).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('Main content area')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('should render card with only title and content', () => {
        render(
            <Card>
                <CardTitle>Simple Card</CardTitle>
                <CardContent>Simple content</CardContent>
            </Card>
        );

        expect(screen.getByRole('heading', { name: /simple card/i })).toBeInTheDocument();
        expect(screen.getByText('Simple content')).toBeInTheDocument();
    });

    it('should support nested content', () => {
        render(
            <Card data-testid="card">
                <CardContent>
                    <div>
                        <span>Nested</span>
                        <span>Content</span>
                    </div>
                </CardContent>
            </Card>
        );

        expect(screen.getByText('Nested')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
    });
});
