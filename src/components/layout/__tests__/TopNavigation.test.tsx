/**
 * @fileoverview Tests for TopNavigation component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TopNavigation } from '../TopNavigation';

// Mock child components
jest.mock('../BackNavigationButton', () => ({
    BackNavigationButton: () => <button data-testid="back-button">Back</button>
}));

jest.mock('@/components/search/InlineSearch', () => ({
    InlineSearch: () => <input data-testid="inline-search" placeholder="Search..." />
}));

jest.mock('@/components/ui/sidebar', () => ({
    SidebarTrigger: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
        <button data-testid="sidebar-trigger" onClick={onClick}>{children}</button>
    )
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// Mock window.location.reload
delete (window as { location?: typeof window.location }).location;
window.location = { reload: jest.fn() } as unknown as Location;

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('TopNavigation', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        (window.location.reload as jest.Mock).mockClear();
    });

    it('should render header element with correct attributes', () => {
        renderWithRouter(<TopNavigation />);

        const header = screen.getByRole('banner');
        expect(header).toBeInTheDocument();
        expect(header).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should render menu button', () => {
        renderWithRouter(<TopNavigation />);

        const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
        expect(menuButton).toBeInTheDocument();
    });

    it('should call onMenuClick when menu button is clicked', () => {
        const onMenuClick = jest.fn();
        renderWithRouter(<TopNavigation onMenuClick={onMenuClick} />);

        const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
        fireEvent.click(menuButton);

        expect(onMenuClick).toHaveBeenCalledTimes(1);
    });

    it('should render TrustWork logo', () => {
        renderWithRouter(<TopNavigation />);

        const logo = screen.getByText('TrustWork');
        expect(logo).toBeInTheDocument();
    });

    it('should navigate to dashboard and reload when logo is clicked', () => {
        renderWithRouter(<TopNavigation />);

        const logoButton = screen.getByRole('button', { name: /go to home page/i });
        fireEvent.click(logoButton);

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/job-seeker');
        expect(window.location.reload).toHaveBeenCalledTimes(1);
    });

    it('should render InlineSearch component', () => {
        renderWithRouter(<TopNavigation />);

        const search = screen.getByTestId('inline-search');
        expect(search).toBeInTheDocument();
    });

    it('should render BackNavigationButton component', () => {
        renderWithRouter(<TopNavigation />);

        const backButton = screen.getByTestId('back-button');
        expect(backButton).toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
        const customClass = 'custom-nav-class';
        const { container } = renderWithRouter(<TopNavigation className={customClass} />);

        const header = container.querySelector('header');
        expect(header).toHaveClass(customClass);
    });

    it('should have fixed positioning', () => {
        const { container } = renderWithRouter(<TopNavigation />);

        const header = container.querySelector('header');
        expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
    });

    it('should have correct height classes', () => {
        const { container } = renderWithRouter(<TopNavigation />);

        const header = container.querySelector('header');
        expect(header).toHaveClass('h-16');
    });

    it('should render search area with correct role', () => {
        renderWithRouter(<TopNavigation />);

        const searchContainer = screen.getByRole('search');
        expect(searchContainer).toBeInTheDocument();
    });

    it('should render secondary navigation with correct label', () => {
        renderWithRouter(<TopNavigation />);

        const secondaryNav = screen.getByRole('navigation', { name: /secondary navigation/i });
        expect(secondaryNav).toBeInTheDocument();
    });

    it('should have backdrop blur styling', () => {
        const { container } = renderWithRouter(<TopNavigation />);

        const header = container.querySelector('header');
        expect(header).toHaveClass('backdrop-blur', 'bg-background/95');
    });

    it('should hide in print media', () => {
        const { container } = renderWithRouter(<TopNavigation />);

        const header = container.querySelector('header');
        expect(header).toHaveClass('print:hidden');
    });

    it('should have border bottom', () => {
        const { container } = renderWithRouter(<TopNavigation />);

        const header = container.querySelector('header');
        expect(header).toHaveClass('border-b');
    });

    it('should handle missing onMenuClick prop gracefully', () => {
        renderWithRouter(<TopNavigation />);

        const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

        expect(() => {
            fireEvent.click(menuButton);
        }).not.toThrow();
    });

    it('should have accessibility attributes on menu button', () => {
        renderWithRouter(<TopNavigation />);

        const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
        expect(menuButton).toHaveAttribute('aria-label', 'Toggle navigation menu');
        expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have touch manipulation styles on menu button', () => {
        const { container } = renderWithRouter(<TopNavigation />);

        const menuButton = container.querySelector('[aria-label="Toggle navigation menu"]');
        expect(menuButton).toHaveClass('touch-manipulation');
        expect(menuButton).toHaveStyle({ touchAction: 'manipulation' });
    });

    it('should render logo with shield icon', () => {
        const { container } = renderWithRouter(<TopNavigation />);

        // Check for Shield icon (Lucide renders SVGs)
        const logoButton = screen.getByRole('button', { name: /go to home page/i });
        const svg = logoButton.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('should hide TrustWork text on small screens', () => {
        renderWithRouter(<TopNavigation />);

        const logoText = screen.getByText('TrustWork');
        expect(logoText).toHaveClass('hidden', 'sm:block');
    });
});
