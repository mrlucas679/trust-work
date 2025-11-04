/**
 * @fileoverview Tests for DashboardLayout component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../DashboardLayout';

// Mock child components
jest.mock('../TopNavigation', () => ({
    TopNavigation: ({ onMenuClick }: { onMenuClick: () => void }) => (
        <nav data-testid="top-navigation">
            <button onClick={onMenuClick} data-testid="menu-button">Menu</button>
        </nav>
    )
}));

jest.mock('../AppSidebar', () => ({
    AppSidebar: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
        <aside data-testid="app-sidebar" data-open={isOpen}>
            <button onClick={onClose} data-testid="close-sidebar">Close</button>
        </aside>
    )
}));

jest.mock('@/components/ui/sidebar', () => ({
    SidebarProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="sidebar-provider">{children}</div>
    ),
    SidebarInset: ({ children, className, id, onClick }: { children: React.ReactNode; className?: string; id?: string; onClick?: () => void }) => (
        <main data-testid="sidebar-inset" className={className} id={id} onClick={onClick}>
            {children}
        </main>
    ),
    useSidebar: jest.fn(() => ({
        openMobile: false,
        setOpenMobile: jest.fn(),
        isMobile: false,
        open: true,
        setOpen: jest.fn(),
        state: 'expanded' as const,
        toggleSidebar: jest.fn()
    }))
}));

jest.mock('@/hooks/use-mobile', () => ({
    useIsMobile: jest.fn(() => false)
}));

import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';

const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;
const mockUseSidebar = useSidebar as jest.MockedFunction<typeof useSidebar>;

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('DashboardLayout', () => {
    beforeEach(() => {
        mockUseSidebar.mockReturnValue({
            openMobile: false,
            setOpenMobile: jest.fn(),
            isMobile: false,
            open: true,
            setOpen: jest.fn(),
            state: 'expanded' as const,
            toggleSidebar: jest.fn()
        });
        document.body.style.overflow = '';
        document.body.classList.remove('sidebar-open');
    });

    afterEach(() => {
        document.body.style.overflow = '';
        document.body.classList.remove('sidebar-open');
    });

    it('should render children correctly', () => {
        renderWithRouter(
            <DashboardLayout>
                <div data-testid="test-content">Test Content</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should render TopNavigation component', () => {
        renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId('top-navigation')).toBeInTheDocument();
    });

    it('should render AppSidebar component', () => {
        renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    });

    it('should render skip to content link', () => {
        renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        const skipLink = screen.getByText('Skip to content');
        expect(skipLink).toBeInTheDocument();
        expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should toggle sidebar when menu button is clicked', () => {
        renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        const menuButton = screen.getByTestId('menu-button');
        const sidebar = screen.getByTestId('app-sidebar');

        // Initially closed
        expect(sidebar).toHaveAttribute('data-open', 'false');

        // Click to open
        fireEvent.click(menuButton);
        expect(sidebar).toHaveAttribute('data-open', 'true');

        // Click again to close
        fireEvent.click(menuButton);
        expect(sidebar).toHaveAttribute('data-open', 'false');
    });

    it('should close sidebar when close button is clicked', () => {
        renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        const menuButton = screen.getByTestId('menu-button');
        const closeButton = screen.getByTestId('close-sidebar');
        const sidebar = screen.getByTestId('app-sidebar');

        // Open sidebar
        fireEvent.click(menuButton);
        expect(sidebar).toHaveAttribute('data-open', 'true');

        // Close sidebar
        fireEvent.click(closeButton);
        expect(sidebar).toHaveAttribute('data-open', 'false');
    });

    it('should render mobile overlay when sidebar is open on mobile', () => {
        const mockSetOpenMobile = jest.fn();
        mockUseSidebar.mockReturnValue({
            openMobile: true,
            setOpenMobile: mockSetOpenMobile,
            isMobile: true,
            open: true,
            setOpen: jest.fn(),
            state: 'expanded' as const,
            toggleSidebar: jest.fn()
        });

        const { container } = renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        // Check for overlay
        const overlay = container.querySelector('.fixed.inset-0.bg-black\\/50');
        expect(overlay).toBeInTheDocument();
    });

    it('should not render overlay when sidebar is closed on mobile', () => {
        mockUseSidebar.mockReturnValue({
            openMobile: false,
            setOpenMobile: jest.fn(),
            isMobile: true,
            open: true,
            setOpen: jest.fn(),
            state: 'expanded' as const,
            toggleSidebar: jest.fn()
        });

        const { container } = renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        const overlay = container.querySelector('.fixed.inset-0.bg-black\\/50');
        expect(overlay).not.toBeInTheDocument();
    });

    it('should close sidebar when overlay is clicked on mobile', () => {
        mockUseIsMobile.mockReturnValue(true);

        const { container } = renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        const menuButton = screen.getByTestId('menu-button');
        const sidebar = screen.getByTestId('app-sidebar');

        // Open sidebar
        fireEvent.click(menuButton);
        expect(sidebar).toHaveAttribute('data-open', 'true');

        // Click overlay
        const overlay = container.querySelector('.fixed.inset-0.bg-black\\/50');
        fireEvent.click(overlay!);

        expect(sidebar).toHaveAttribute('data-open', 'false');
    });

    it('should prevent body scroll when sidebar is open on mobile', () => {
        mockUseIsMobile.mockReturnValue(true);

        renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        const menuButton = screen.getByTestId('menu-button');

        // Initially no scroll prevention
        expect(document.body.style.overflow).toBe('');

        // Open sidebar - should prevent scroll
        fireEvent.click(menuButton);
        expect(document.body.style.overflow).toBe('hidden');

        // Close sidebar - should restore scroll
        fireEvent.click(menuButton);
        expect(document.body.style.overflow).toBe('');
    });

    it('should not prevent body scroll on desktop', () => {
        mockUseIsMobile.mockReturnValue(false);

        renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        const menuButton = screen.getByTestId('menu-button');

        // Open sidebar on desktop
        fireEvent.click(menuButton);

        // Should NOT prevent scroll on desktop
        expect(document.body.style.overflow).toBe('');
    });

    it('should render main content with correct ID', () => {
        renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        const mainContent = screen.getByTestId('sidebar-inset');
        expect(mainContent).toHaveAttribute('id', 'main-content');
    });

    it('should wrap children in container with padding', () => {
        renderWithRouter(
            <DashboardLayout>
                <div data-testid="child">Content</div>
            </DashboardLayout>
        );

        const child = screen.getByTestId('child');
        const container = child.parentElement;

        expect(container).toHaveClass('container', 'mx-auto', 'p-6');
    });

    it('should apply correct viewport height classes', () => {
        renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        const mainContent = screen.getByTestId('sidebar-inset');
        expect(mainContent).toHaveClass('h-[calc(100vh-4rem)]');
        expect(mainContent).toHaveClass('supports-[height:100dvh]:h-[calc(100dvh-4rem)]');
    });

    it('should render SidebarProvider wrapper', () => {
        renderWithRouter(
            <DashboardLayout>
                <div>Content</div>
            </DashboardLayout>
        );

        expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
    });
});
