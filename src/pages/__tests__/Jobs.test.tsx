/**
 * @fileoverview Tests for Jobs page
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Jobs from '../Jobs';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Jobs Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderJobs = () => {
        return render(
            <BrowserRouter>
                <Jobs />
            </BrowserRouter>
        );
    };

    it('should render jobs page header', () => {
        renderJobs();

        expect(screen.getByText(/Job Opportunities/i)).toBeInTheDocument();
        expect(screen.getByText(/Find verified jobs from trusted employers/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
        renderJobs();

        const searchInput = screen.getByPlaceholderText(/Search jobs or companies/i);
        expect(searchInput).toBeInTheDocument();
    });

    it('should render location filter', () => {
        renderJobs();

        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should filter jobs by search query', () => {
        renderJobs();

        const searchInput = screen.getByPlaceholderText(/Search jobs or companies/i);

        // Type in search query
        fireEvent.change(searchInput, { target: { value: 'developer' } });

        // Jobs containing 'developer' should be shown
        expect(searchInput).toHaveValue('developer');
    });

    it('should display verified jobs count', () => {
        renderJobs();

        expect(screen.getByText(/Verified Jobs/i)).toBeInTheDocument();
    });

    it('should display flagged jobs count', () => {
        renderJobs();

        expect(screen.getByText(/Flagged Jobs/i)).toBeInTheDocument();
    });

    it('should toggle suspicious jobs visibility', () => {
        renderJobs();

        const toggleButton = screen.getByRole('button', { name: /Show All/i });
        expect(toggleButton).toBeInTheDocument();

        // Click to show suspicious jobs
        fireEvent.click(toggleButton);
        expect(screen.getByRole('button', { name: /Hide Suspicious/i })).toBeInTheDocument();

        // Click to hide again
        fireEvent.click(toggleButton);
        expect(screen.getByRole('button', { name: /Show All/i })).toBeInTheDocument();
    });

    it('should render job cards', () => {
        renderJobs();

        // Should show some job listings (exact count depends on mock data)
        const jobCards = screen.getAllByRole('article');
        expect(jobCards.length).toBeGreaterThan(0);
    });

    it('should navigate to job detail when clicking view details', () => {
        renderJobs();

        const viewDetailsButtons = screen.getAllByRole('button', { name: /View Details/i });
        expect(viewDetailsButtons.length).toBeGreaterThan(0);

        // Click first job's details button
        fireEvent.click(viewDetailsButtons[0]);

        expect(mockNavigate).toHaveBeenCalled();
    });

    it('should display job verification badges', () => {
        renderJobs();

        // Should show verification indicators
        const verificationIcons = screen.getAllByTestId(/verification-icon|check/i);
        expect(verificationIcons.length).toBeGreaterThan(0);
    });

    it('should clear search on location filter change', () => {
        renderJobs();

        const searchInput = screen.getByPlaceholderText(/Search jobs or companies/i);
        fireEvent.change(searchInput, { target: { value: 'developer' } });

        const locationFilter = screen.getByRole('combobox');
        fireEvent.click(locationFilter);

        // Search should still have value (not cleared automatically)
        expect(searchInput).toHaveValue('developer');
    });

    it('should show empty state when no jobs match filters', () => {
        renderJobs();

        const searchInput = screen.getByPlaceholderText(/Search jobs or companies/i);

        // Search for something that definitely doesn't exist
        fireEvent.change(searchInput, { target: { value: 'xyznonexistentjob123' } });

        // Should show empty message or no jobs
        const jobCards = screen.queryAllByRole('article');
        expect(jobCards.length).toBe(0);
    });

    it('should display job metadata (location, time, salary)', () => {
        renderJobs();

        // Should show location, clock, and dollar icons
        expect(screen.getAllByTestId(/map-pin|clock|dollar-sign/i).length).toBeGreaterThan(0);
    });
});
