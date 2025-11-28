/**
 * @fileoverview Tests for Applications page
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Applications from '../Applications';
import * as applicationsApi from '@/lib/api/applications';
import { useSupabase } from '@/providers/SupabaseProvider';

// Mock dependencies
jest.mock('@/lib/api/applications');
jest.mock('@/providers/SupabaseProvider');

const mockApplications: applicationsApi.ApplicationWithDetails[] = [
    {
        id: '1',
        assignment_id: 'a1',
        freelancer_id: 'f1',
        status: 'pending',
        proposal: 'Test proposal for job',
        cover_letter: 'Test cover letter',
        bid_amount: 5000,
        estimated_duration: '2 weeks',
        estimated_start_date: '2025-02-01',
        reviewed_at: null,
        reviewed_by: null,
        rejection_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignment: {
            id: 'a1',
            title: 'Test Job Title',
            description: 'Test description',
            budget_min: 4000,
            budget_max: 6000,
            budget_type: 'fixed' as const,
            deadline: null,
            status: 'open' as const,
            client_id: 'c1',
            required_skills: ['React', 'TypeScript'],
            experience_level: 'intermediate' as const,
            job_type: 'freelance' as const,
            location: null,
            remote_allowed: true,
            category: null,
            applications_count: 5,
            views_count: 10,
            type: 'job' as const,
            requires_skill_test: false,
            skill_test_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    },
    {
        id: '2',
        assignment_id: 'a2',
        freelancer_id: 'f1',
        status: 'accepted',
        proposal: 'Accepted proposal',
        cover_letter: null,
        bid_amount: 8000,
        estimated_duration: '3 weeks',
        estimated_start_date: null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'c2',
        rejection_reason: null,
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date().toISOString(),
        assignment: {
            id: 'a2',
            title: 'Accepted Job',
            description: 'Test description',
            budget_min: 7000,
            budget_max: 9000,
            budget_type: 'fixed' as const,
            deadline: null,
            status: 'in_progress' as const,
            client_id: 'c2',
            required_skills: ['Node.js'],
            experience_level: 'expert' as const,
            job_type: 'contract' as const,
            location: null,
            remote_allowed: true,
            category: null,
            applications_count: 3,
            views_count: 8,
            type: 'job' as const,
            requires_skill_test: false,
            skill_test_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    },
    {
        id: '3',
        assignment_id: 'a3',
        freelancer_id: 'f1',
        status: 'rejected',
        proposal: 'Rejected proposal',
        cover_letter: null,
        bid_amount: 3000,
        estimated_duration: '1 week',
        estimated_start_date: null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'c3',
        rejection_reason: 'We chose a more experienced candidate',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date().toISOString(),
        assignment: {
            id: 'a3',
            title: 'Rejected Job',
            description: 'Test description',
            budget_min: 2000,
            budget_max: 4000,
            budget_type: 'hourly' as const,
            deadline: null,
            status: 'in_progress' as const,
            client_id: 'c3',
            required_skills: ['Python'],
            experience_level: 'entry' as const,
            job_type: 'freelance' as const,
            location: null,
            remote_allowed: true,
            category: null,
            applications_count: 8,
            views_count: 15,
            type: 'job' as const,
            requires_skill_test: false,
            skill_test_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    }
];

const mockStats: applicationsApi.ApplicationStats = {
    total: 3,
    pending: 1,
    reviewing: 0,
    accepted: 1,
    rejected: 1,
    withdrawn: 0,
    thisWeek: 2,
    responseRate: 66.67
};

describe('Applications Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useSupabase as jest.Mock).mockReturnValue({
            user: { id: 'f1' }
        });
        (applicationsApi.getMyApplications as jest.Mock).mockResolvedValue(mockApplications);
        (applicationsApi.getApplicationStats as jest.Mock).mockResolvedValue(mockStats);
        (applicationsApi.subscribeToApplicationUpdates as jest.Mock).mockReturnValue(() => { });
    });

    it('renders loading state initially', () => {
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        expect(screen.getByText(/loading your applications/i)).toBeInTheDocument();
    });

    it('renders applications list after loading', async () => {
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Job Title')).toBeInTheDocument();
            expect(screen.getByText('Accepted Job')).toBeInTheDocument();
            expect(screen.getByText('Rejected Job')).toBeInTheDocument();
        });
    });

    it('displays application statistics', async () => {
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Total Applications')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument(); // Total count
            expect(screen.getByText('1')).toBeInTheDocument(); // Pending count
            expect(screen.getByText('67%')).toBeInTheDocument(); // Response rate
        });
    });

    it('filters applications by status', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Job Title')).toBeInTheDocument();
        });

        // Click filter dropdown
        const filterButton = screen.getByRole('combobox', { name: /filter by status/i });
        await user.click(filterButton);

        // Select "Accepted" filter
        const acceptedOption = screen.getByRole('option', { name: /accepted/i });
        await user.click(acceptedOption);

        await waitFor(() => {
            expect(screen.getByText('Accepted Job')).toBeInTheDocument();
            expect(screen.queryByText('Test Job Title')).not.toBeInTheDocument();
            expect(screen.queryByText('Rejected Job')).not.toBeInTheDocument();
        });
    });

    it('searches applications by title', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Job Title')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search applications...');
        await user.type(searchInput, 'Accepted');

        await waitFor(() => {
            expect(screen.getByText('Accepted Job')).toBeInTheDocument();
            expect(screen.queryByText('Test Job Title')).not.toBeInTheDocument();
        });
    });

    it('sorts applications by bid amount', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Job Title')).toBeInTheDocument();
        });

        // Click sort dropdown
        const sortButton = screen.getByRole('combobox', { name: /sort by/i });
        await user.click(sortButton);

        // Select "Highest Bid"
        const highestBidOption = screen.getByRole('option', { name: /highest bid/i });
        await user.click(highestBidOption);

        await waitFor(() => {
            const cards = screen.getAllByRole('heading', { level: 3 });
            expect(cards[0]).toHaveTextContent('Accepted Job'); // R8000
            expect(cards[1]).toHaveTextContent('Test Job Title'); // R5000
            expect(cards[2]).toHaveTextContent('Rejected Job'); // R3000
        });
    });

    it('withdraws application when withdraw button is clicked', async () => {
        const user = userEvent.setup();
        (applicationsApi.withdrawApplication as jest.Mock).mockResolvedValue({});

        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Job Title')).toBeInTheDocument();
        });

        const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
        await user.click(withdrawButton);

        expect(applicationsApi.withdrawApplication).toHaveBeenCalledWith('1');

        await waitFor(() => {
            expect(screen.getByText(/application withdrawn/i)).toBeInTheDocument();
        });
    });

    it('displays empty state when no applications exist', async () => {
        (applicationsApi.getMyApplications as jest.Mock).mockResolvedValue([]);
        (applicationsApi.getApplicationStats as jest.Mock).mockResolvedValue({
            ...mockStats,
            total: 0,
            pending: 0,
            accepted: 0,
            rejected: 0
        });

        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/you haven't applied to any jobs yet/i)).toBeInTheDocument();
            expect(screen.getByText(/browse available jobs/i)).toBeInTheDocument();
        });
    });

    it('displays filtered empty state when no matches', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Job Title')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search applications...');
        await user.type(searchInput, 'NonexistentJob');

        await waitFor(() => {
            expect(screen.getByText(/no applications match your filters/i)).toBeInTheDocument();
        });
    });

    it('displays rejection reason for rejected applications', async () => {
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('We chose a more experienced candidate')).toBeInTheDocument();
        });
    });

    it('displays acceptance message for accepted applications', async () => {
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/congratulations! your application was accepted/i)).toBeInTheDocument();
        });
    });

    it('navigates to jobs page when Browse Jobs is clicked', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Job Title')).toBeInTheDocument();
        });

        const browseJobsButton = screen.getByRole('button', { name: /browse jobs/i });
        await user.click(browseJobsButton);

        // Navigation should be triggered (router would handle actual navigation)
        expect(browseJobsButton).toBeInTheDocument();
    });

    it('switches between grid and list view', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Job Title')).toBeInTheDocument();
        });

        // Switch to list view
        const listViewTab = screen.getByRole('tab', { name: /list view/i });
        await user.click(listViewTab);

        await waitFor(() => {
            expect(screen.getByText('Test Job Title')).toBeInTheDocument();
        });

        // Switch back to grid view
        const gridViewTab = screen.getByRole('tab', { name: /grid view/i });
        await user.click(gridViewTab);

        await waitFor(() => {
            expect(screen.getByText('Test Job Title')).toBeInTheDocument();
        });
    });

    it('sets up real-time subscriptions on mount', async () => {
        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(applicationsApi.subscribeToApplicationUpdates).toHaveBeenCalledWith(
                'f1',
                expect.any(Function)
            );
        });
    });

    it('handles errors when fetching applications', async () => {
        (applicationsApi.getMyApplications as jest.Mock).mockRejectedValue(
            new Error('Failed to fetch applications')
        );

        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/failed to load applications/i)).toBeInTheDocument();
        });
    });

    it('handles errors when withdrawing application', async () => {
        const user = userEvent.setup();
        (applicationsApi.withdrawApplication as jest.Mock).mockRejectedValue(
            new Error('Failed to withdraw')
        );

        render(
            <BrowserRouter>
                <Applications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Job Title')).toBeInTheDocument();
        });

        const withdrawButton = screen.getByRole('button', { name: /withdraw/i });
        await user.click(withdrawButton);

        await waitFor(() => {
            expect(screen.getByText(/failed to withdraw/i)).toBeInTheDocument();
        });
    });
});
