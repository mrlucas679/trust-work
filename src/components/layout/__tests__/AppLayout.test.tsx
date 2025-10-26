/**
 * @fileoverview Tests for AppLayout component
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from '../AppLayout';

// Mock child components
jest.mock('../DashboardLayout', () => ({
    DashboardLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dashboard-layout">{children}</div>
    )
}));

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AppLayout', () => {
    it('should render children with navigation by default', () => {
        renderWithRouter(
            <AppLayout>
                <div data-testid="test-content">Test Content</div>
            </AppLayout>
        );

        expect(screen.getByTestId('test-content')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    });

    it('should render DashboardLayout when showNavigation is true', () => {
        renderWithRouter(
            <AppLayout showNavigation={true}>
                <div data-testid="test-content">Test Content</div>
            </AppLayout>
        );

        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    });

    it('should render without DashboardLayout when showNavigation is false', () => {
        renderWithRouter(
            <AppLayout showNavigation={false}>
                <div data-testid="test-content">Test Content</div>
            </AppLayout>
        );

        expect(screen.getByTestId('test-content')).toBeInTheDocument();
        expect(screen.queryByTestId('dashboard-layout')).not.toBeInTheDocument();
    });

    it('should render main element when showNavigation is false', () => {
        const { container } = renderWithRouter(
            <AppLayout showNavigation={false}>
                <div>Test Content</div>
            </AppLayout>
        );

        const mainElement = container.querySelector('main');
        expect(mainElement).toBeInTheDocument();
    });

    it('should apply min-h-screen and bg-background classes when showNavigation is false', () => {
        const { container } = renderWithRouter(
            <AppLayout showNavigation={false}>
                <div>Test Content</div>
            </AppLayout>
        );

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass('min-h-screen', 'bg-background');
    });

    it('should render multiple children correctly', () => {
        renderWithRouter(
            <AppLayout>
                <div data-testid="child1">Child 1</div>
                <div data-testid="child2">Child 2</div>
                <div data-testid="child3">Child 3</div>
            </AppLayout>
        );

        expect(screen.getByTestId('child1')).toBeInTheDocument();
        expect(screen.getByTestId('child2')).toBeInTheDocument();
        expect(screen.getByTestId('child3')).toBeInTheDocument();
    });

    it('should handle complex nested children', () => {
        renderWithRouter(
            <AppLayout>
                <div>
                    <section>
                        <article data-testid="nested-content">Nested Content</article>
                    </section>
                </div>
            </AppLayout>
        );

        expect(screen.getByTestId('nested-content')).toBeInTheDocument();
    });

    it('should render without errors when children is empty', () => {
        expect(() => {
            renderWithRouter(<AppLayout>{null}</AppLayout>);
        }).not.toThrow();
    });

    it('should render text children directly', () => {
        renderWithRouter(<AppLayout>Simple text content</AppLayout>);

        expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('should maintain children structure with DashboardLayout wrapper', () => {
        const testId = 'structured-content';
        renderWithRouter(
            <AppLayout>
                <div data-testid={testId}>
                    <h1>Title</h1>
                    <p>Paragraph</p>
                </div>
            </AppLayout>
        );

        const content = screen.getByTestId(testId);
        expect(content).toBeInTheDocument();
        expect(content.querySelector('h1')).toHaveTextContent('Title');
        expect(content.querySelector('p')).toHaveTextContent('Paragraph');
    });
});
