/**
 * @fileoverview Tests for AppSidebar component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppSidebar } from '../AppSidebar';

// Mock child components
jest.mock('../sidebar/NavigationItem', () => ({
    NavigationItem: ({ title, to, badge, onClick }: { title: string; to: string; badge?: string; onClick: () => void }) => (
        <button data-testid={`nav-${title.toLowerCase().replace(/\s+/g, '-')}`} onClick={onClick}>
            {title} {badge && <span data-testid={`badge-${title}`}>{badge}</span>}
        </button>
    )
}));

jest.mock('../sidebar/ThemeToggle', () => ({
    ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

jest.mock('@/components/ui/sidebar', () => ({
    Sidebar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <aside data-testid="sidebar" className={className}>{children}</aside>
    ),
    SidebarContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div data-testid="sidebar-content" className={className}>{children}</div>
    ),
    SidebarGroup: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div data-testid="sidebar-group" className={className}>{children}</div>
    ),
    SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="sidebar-group-content">{children}</div>
    ),
    SidebarGroupLabel: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div data-testid="sidebar-group-label" className={className}>{children}</div>
    ),
    SidebarMenu: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <ul data-testid="sidebar-menu" className={className}>{children}</ul>
    )
}));

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AppSidebar', () => {
    it('should render sidebar container', () => {
        renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render all main navigation items', () => {
        renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('nav-my-space')).toBeInTheDocument();
        expect(screen.getByTestId('nav-jobs')).toBeInTheDocument();
        expect(screen.getByTestId('nav-gigs')).toBeInTheDocument();
        expect(screen.getByTestId('nav-applications')).toBeInTheDocument();
        expect(screen.getByTestId('nav-messages')).toBeInTheDocument();
        expect(screen.getByTestId('nav-assignments')).toBeInTheDocument();
    });

    it('should render all bottom navigation items', () => {
        renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('nav-profile')).toBeInTheDocument();
        expect(screen.getByTestId('nav-safety-center')).toBeInTheDocument();
        expect(screen.getByTestId('nav-settings')).toBeInTheDocument();
        expect(screen.getByTestId('nav-help')).toBeInTheDocument();
        expect(screen.getByTestId('nav-log-out')).toBeInTheDocument();
        expect(screen.getByTestId('nav-theme')).toBeInTheDocument();
    });

    it('should render notification badges', () => {
        renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('badge-Jobs')).toHaveTextContent('12');
        expect(screen.getByTestId('badge-Gigs')).toHaveTextContent('5');
        expect(screen.getByTestId('badge-Applications')).toHaveTextContent('3');
        expect(screen.getByTestId('badge-Messages')).toHaveTextContent('2');
    });

    it('should render zero badge for assignments', () => {
        renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('badge-Assignments')).toHaveTextContent('0');
    });

    it('should render Support section label', () => {
        renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByTestId('sidebar-group-label')).toHaveTextContent('Support');
    });

    it('should render Theme navigation item', () => {
        renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        // Theme is rendered as a navigation item
        expect(screen.getByTestId('nav-theme')).toBeInTheDocument();
    });

    it('should call onClose when navigation item is clicked', () => {
        const onClose = jest.fn();
        renderWithRouter(<AppSidebar isOpen={true} onClose={onClose} />);

        const jobsLink = screen.getByTestId('nav-jobs');
        fireEvent.click(jobsLink);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should apply translate-x-0 class when isOpen is true', () => {
        const { container } = renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        const sidebar = container.querySelector('[data-testid="sidebar"]');
        expect(sidebar?.className).toContain('translate-x-0');
    });

    it('should apply translate-x-[-100%] class when isOpen is false', () => {
        const { container } = renderWithRouter(<AppSidebar isOpen={false} onClose={jest.fn()} />);

        const sidebar = container.querySelector('[data-testid="sidebar"]');
        expect(sidebar?.className).toContain('translate-x-[-100%]');
    });

    it('should have fixed positioning', () => {
        const { container } = renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        const sidebar = container.querySelector('[data-testid="sidebar"]');
        expect(sidebar?.className).toContain('fixed');
        expect(sidebar?.className).toContain('left-0');
        expect(sidebar?.className).toContain('top-16');
    });

    it('should have correct height calculation', () => {
        const { container } = renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        const sidebar = container.querySelector('[data-testid="sidebar"]');
        expect(sidebar?.className).toContain('h-[calc(100vh-4rem)]');
    });

    it('should have transition classes for smooth animation', () => {
        const { container } = renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        const sidebar = container.querySelector('[data-testid="sidebar"]');
        expect(sidebar?.className).toContain('transition-transform');
        expect(sidebar?.className).toContain('duration-300');
        expect(sidebar?.className).toContain('ease-in-out');
    });

    it('should have backdrop blur styling', () => {
        const { container } = renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        const sidebar = container.querySelector('[data-testid="sidebar"]');
        expect(sidebar?.className).toContain('backdrop-blur');
        expect(sidebar?.className).toContain('bg-background/95');
    });

    it('should have shadow', () => {
        const { container } = renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        const sidebar = container.querySelector('[data-testid="sidebar"]');
        expect(sidebar?.className).toContain('shadow-lg');
    });

    it('should have correct width', () => {
        const { container } = renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        const sidebar = container.querySelector('[data-testid="sidebar"]');
        expect(sidebar?.className).toContain('w-[280px]');
    });

    it('should have border on the right', () => {
        const { container } = renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        const sidebar = container.querySelector('[data-testid="sidebar"]');
        expect(sidebar?.className).toContain('border-r');
    });

    it('should have proper z-index for layering', () => {
        const { container } = renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        const sidebar = container.querySelector('[data-testid="sidebar"]');
        expect(sidebar?.className).toContain('z-30');
    });

    it('should render sidebar content with overflow', () => {
        renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        const content = screen.getByTestId('sidebar-content');
        expect(content).toHaveClass('flex-1', 'overflow-y-auto');
    });

    it('should call onClose for each navigation item', () => {
        const onClose = jest.fn();
        renderWithRouter(<AppSidebar isOpen={true} onClose={onClose} />);

        // Click different navigation items
        fireEvent.click(screen.getByTestId('nav-my-space'));
        expect(onClose).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('nav-messages'));
        expect(onClose).toHaveBeenCalledTimes(2);

        fireEvent.click(screen.getByTestId('nav-settings'));
        expect(onClose).toHaveBeenCalledTimes(3);
    });

    it('should render TrustWork logo on mobile', () => {
        renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByText('TrustWork')).toBeInTheDocument();
    });

    it('should have logo section hidden on desktop', () => {
        const { container } = renderWithRouter(<AppSidebar isOpen={true} onClose={jest.fn()} />);

        const logoSection = container.querySelector('.md\\:hidden');
        expect(logoSection).toBeInTheDocument();
    });
});
