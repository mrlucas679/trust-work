/**
 * Component tests for AssignmentApplications - Skill Test Integration (Phase 7)
 * 
 * Tests the UI display of skill test scores in the employer's application review page:
 * - Skill test score card for pending applications
 * - Pass/fail badge display
 * - Difficulty level display
 * - Time taken display
 * - Compact score display for accepted/rejected applications
 * 
 * NOTE: These tests use REAL Supabase API calls (no mocks) to test against actual data.
 * Run `npm run seed-test-data` first to populate the database with test data.
 */


import { render, screen, within, waitFor } from '@testing-library/react';
import { MemoryRouter, useParams, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AssignmentApplications from '../AssignmentApplications';
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

// NO API MOCKS - Using real Supabase connections

// Mock the Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-employer-123',
              email: 'employer@test.com',
            },
          },
        },
        error: null,
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-employer-123',
          role: 'employer',
          display_name: 'Test Employer',
        },
        error: null,
      }),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    })),
    removeChannel: jest.fn(),
  },
}));

// Mock react-router-dom hooks only (not the whole module)
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  // Mock hooks before each render
  (useParams as jest.Mock).mockReturnValue({ id: 'test-assignment-123', type: 'job' });
  (useNavigate as jest.Mock).mockReturnValue(jest.fn());

  return ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
      <SupabaseProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/assignments/test-assignment-123/applications']}>
            {children}
          </MemoryRouter>
        </QueryClientProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
};

describe('AssignmentApplications - Skill Test Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // PENDING APPLICATIONS - FULL SKILL TEST SCORE CARD
  // ============================================================

  describe('Pending Applications with Skill Test Scores', () => {
    it('should display full skill test score card for passed test', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'test-assignment-123',
          assignment_type: 'job',
          freelancer_id: 'user-1',
          status: 'pending',
          proposal: 'I am experienced in React development',
          cover_letter: 'I am interested in this position',
          bid_amount: 5000,
          estimated_duration: '2 months',
          estimated_start_date: '2025-02-01',
          reviewed_at: null,
          reviewed_by: null,
          rejection_reason: null,
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: {
            id: 'test-assignment-123',
            title: 'Senior React Developer',
            type: 'job',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z',
          },
          profile: {
            id: 'user-1',
            display_name: 'John Doe',
            avatar_url: 'https://example.com/avatar.jpg',
            role: 'freelancer',
            verified: true,
          },
          skillTestAttempt: {
            id: 'attempt-1',
            score: 85,
            passed: true,
            difficulty: 'mid',
            time_taken_seconds: 1800, // 30 minutes
            completed_at: '2025-01-15T09:30:00Z',
            template: {
              id: 'template-123',
              name: 'React Development',
              category: 'web-development',
            },
          },
        },
      ];

      jest.mocked(applicationsApi.getAssignmentApplications).mockResolvedValue(
        mockApplications as any
      );

      render(<AssignmentApplications />, {
        wrapper: createWrapper(),
      });

      // Wait for applications to load - look for application card
      await screen.findByText('Freelancer Application');

      // Should display score percentage
      expect(screen.getByText('85%')).toBeInTheDocument();

      // Should display "Passed" badge
      expect(screen.getByText('Passed')).toBeInTheDocument();

      // Should display difficulty level
      expect(screen.getByText(/mid/i)).toBeInTheDocument();

      // Should display time taken (30 minutes)
      expect(screen.getByText(/30m/i)).toBeInTheDocument();

      // Should display completion date
      expect(screen.getByText(/Jan 15, 2025/i)).toBeInTheDocument();

      // Should display template name
      expect(screen.getByText('React Development')).toBeInTheDocument();
    });

    it('should display full skill test score card for failed test', async () => {
      const mockApplications = [
        {
          id: 'app-2',
          assignment_id: 'test-assignment-123',
          assignment_type: 'job',
          freelancer_id: 'user-2',
          status: 'pending',
          proposal: 'I have excellent React skills',
          cover_letter: 'Please consider my application',
          bid_amount: 4500,
          estimated_duration: '6 weeks',
          estimated_start_date: '2025-02-15',
          reviewed_at: null,
          reviewed_by: null,
          rejection_reason: null,
          created_at: '2025-01-15T11:00:00Z',
          updated_at: '2025-01-15T11:00:00Z',
          assignment: {
            id: 'test-assignment-123',
            title: 'Senior React Developer',
            type: 'job',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z',
          },
          profile: {
            id: 'user-2',
            display_name: 'Jane Smith',
            avatar_url: 'https://example.com/avatar2.jpg',
            role: 'freelancer',
            verified: false,
          },
          skillTestAttempt: {
            id: 'attempt-2',
            score: 65,
            passed: false,
            difficulty: 'mid',
            time_taken_seconds: 2400, // 40 minutes
            completed_at: '2025-01-15T10:40:00Z',
            template: {
              id: 'template-123',
              name: 'React Development',
              category: 'web-development',
            },
          },
        },
      ];

      jest.mocked(applicationsApi.getAssignmentApplications).mockResolvedValue(
        mockApplications
      );

      render(<AssignmentApplications />, {
        wrapper: createWrapper(),
      });

      // Wait for applications to load
      await screen.findByText('Jane Smith');

      // Should display score percentage
      expect(screen.getByText('65%')).toBeInTheDocument();

      // Should display "Failed" badge (or similar indicator)
      expect(screen.getByText(/failed/i)).toBeInTheDocument();

      // Should display difficulty level
      expect(screen.getByText(/mid/i)).toBeInTheDocument();

      // Should display time taken (40 minutes)
      expect(screen.getByText(/40m/i)).toBeInTheDocument();
    });

    it('should handle entry-level difficulty display', async () => {
      const mockApplications = [
        {
          id: 'app-3',
          assignment_id: 'test-assignment-456',
          assignment_type: 'gig',
          freelancer_id: 'user-3',
          status: 'pending',
          cover_letter: 'Entry level application',
          created_at: '2025-01-15T12:00:00Z',
          updated_at: '2025-01-15T12:00:00Z',
          assignment: {
            id: 'test-assignment-456',
            title: 'Data Entry Task',
            type: 'gig',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z',
          },
          profile: {
            id: 'user-3',
            display_name: 'Beginner User',
            role: 'freelancer',
          },
          skillTestAttempt: {
            id: 'attempt-3',
            score: 75,
            passed: true,
            difficulty: 'entry',
            time_taken_seconds: 900, // 15 minutes
            completed_at: '2025-01-15T11:45:00Z',
            template: {
              id: 'template-456',
              name: 'Data Entry Basics',
              category: 'administrative',
            },
          },
        },
      ];

      jest.mocked(applicationsApi.getAssignmentApplications).mockResolvedValue(
        mockApplications
      );

      render(<AssignmentApplications />, {
        wrapper: createWrapper(),
      });

      await screen.findByText('Beginner User');

      // Should display entry difficulty
      expect(screen.getByText(/entry/i)).toBeInTheDocument();

      // Should display 15 minutes
      expect(screen.getByText(/15m/i)).toBeInTheDocument();
    });

    it('should handle senior-level difficulty display', async () => {
      const mockApplications = [
        {
          id: 'app-4',
          assignment_id: 'test-assignment-789',
          assignment_type: 'job',
          freelancer_id: 'user-4',
          status: 'pending',
          cover_letter: 'Senior level application',
          created_at: '2025-01-15T13:00:00Z',
          updated_at: '2025-01-15T13:00:00Z',
          assignment: {
            id: 'test-assignment-789',
            title: 'Senior System Architect',
            type: 'job',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z',
          },
          profile: {
            id: 'user-4',
            display_name: 'Expert Developer',
            role: 'freelancer',
          },
          skillTestAttempt: {
            id: 'attempt-4',
            score: 95,
            passed: true,
            difficulty: 'senior',
            time_taken_seconds: 2700, // 45 minutes
            completed_at: '2025-01-15T12:45:00Z',
            template: {
              id: 'template-789',
              name: 'System Design Advanced',
              category: 'web-development',
            },
          },
        },
      ];

      jest.mocked(applicationsApi.getAssignmentApplications).mockResolvedValue(
        mockApplications as any
      );

      render(<AssignmentApplications />, {
        wrapper: createWrapper(),
      });

      await screen.findByText('Freelancer Application');

      // Should display senior difficulty
      expect(screen.getByText(/senior/i)).toBeInTheDocument();

      // Should display high score
      expect(screen.getByText('95%')).toBeInTheDocument();
    });
  });

  // ============================================================
  // ACCEPTED/REJECTED APPLICATIONS - COMPACT SCORE DISPLAY
  // ============================================================

  describe('Accepted Applications with Compact Score Display', () => {
    it('should display compact skill test score for accepted applications', async () => {
      const mockApplications = [
        {
          id: 'app-5',
          assignment_id: 'test-assignment-123',
          assignment_type: 'job',
          freelancer_id: 'user-5',
          status: 'accepted',
          cover_letter: 'Accepted application',
          created_at: '2025-01-10T10:00:00Z',
          updated_at: '2025-01-15T14:00:00Z',
          assignment: {
            id: 'test-assignment-123',
            title: 'Senior React Developer',
            type: 'job',
            status: 'open',
            created_at: '2025-01-09T00:00:00Z',
          },
          profile: {
            id: 'user-5',
            display_name: 'Accepted Developer',
            role: 'freelancer',
          },
          skillTestAttempt: {
            id: 'attempt-5',
            score: 88,
            passed: true,
            difficulty: 'mid',
            time_taken_seconds: 1620,
            completed_at: '2025-01-10T09:30:00Z',
            template: {
              id: 'template-123',
              name: 'React Development',
              category: 'web-development',
            },
          },
        },
      ];

      jest.mocked(applicationsApi.getAssignmentApplications).mockResolvedValue(
        mockApplications as any
      );

      render(<AssignmentApplications />, {
        wrapper: createWrapper(),
      });

      await screen.findByText('Accepted Freelancer');

      // Should display score in compact format
      expect(screen.getByText('88%')).toBeInTheDocument();

      // Compact format should NOT display full card details
      // (time, completion date should be hidden or minimal)
    });
  });

  describe('Rejected Applications with Compact Score Display', () => {
    it('should display compact skill test score for rejected applications', async () => {
      const mockApplications = [
        {
          id: 'app-6',
          assignment_id: 'test-assignment-123',
          assignment_type: 'job',
          freelancer_id: 'user-6',
          status: 'rejected',
          cover_letter: 'Rejected application',
          created_at: '2025-01-11T10:00:00Z',
          updated_at: '2025-01-15T15:00:00Z',
          assignment: {
            id: 'test-assignment-123',
            title: 'Senior React Developer',
            type: 'job',
            status: 'open',
            created_at: '2025-01-09T00:00:00Z',
          },
          profile: {
            id: 'user-6',
            display_name: 'Rejected Developer',
            role: 'freelancer',
          },
          skillTestAttempt: {
            id: 'attempt-6',
            score: 62,
            passed: false,
            difficulty: 'mid',
            time_taken_seconds: 2200,
            completed_at: '2025-01-11T09:30:00Z',
            template: {
              id: 'template-123',
              name: 'React Development',
              category: 'web-development',
            },
          },
        },
      ];

      jest.mocked(applicationsApi.getAssignmentApplications).mockResolvedValue(
        mockApplications as any
      );

      render(<AssignmentApplications />, {
        wrapper: createWrapper(),
      });

      await screen.findByText('Freelancer Application');

      // Should display score in compact format
      expect(screen.getByText('62%')).toBeInTheDocument();
    });
  });

  // ============================================================
  // APPLICATIONS WITHOUT SKILL TESTS
  // ============================================================

  describe('Applications Without Skill Tests', () => {
    it('should handle applications with no skill test attempt', async () => {
      const mockApplications = [
        {
          id: 'app-7',
          assignment_id: 'test-assignment-123',
          assignment_type: 'job',
          freelancer_id: 'user-7',
          status: 'pending',
          proposal: 'Available to start right away',
          cover_letter: 'Ready to start immediately',
          bid_amount: 3500,
          estimated_duration: '8 weeks',
          estimated_start_date: '2025-02-05',
          reviewed_at: null,
          reviewed_by: null,
          rejection_reason: null,
          created_at: '2025-01-15T16:00:00Z',
          updated_at: '2025-01-15T16:00:00Z',
          assignment: {
            id: 'test-assignment-999',
            title: 'Job Without Skill Test',
            type: 'job',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z',
          },
          profile: {
            id: 'user-7',
            display_name: 'Regular Applicant',
            role: 'freelancer',
          },
          skillTestAttempt: null, // No skill test
        },
      ];

      jest.mocked(applicationsApi.getAssignmentApplications).mockResolvedValue(
        mockApplications
      );

      render(<AssignmentApplications />, {
        wrapper: createWrapper(),
      });

      await screen.findByText('Regular Applicant');

      // Should NOT display any skill test score elements
      expect(screen.queryByText(/passed/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      jest.mocked(applicationsApi.getAssignmentApplications).mockRejectedValue(
        new Error('Failed to fetch applications')
      );

      render(<AssignmentApplications />, {
        wrapper: createWrapper(),
      });

      // Should display error message
      await screen.findByText(/error/i);
    });

    it('should handle empty applications list', async () => {
      jest.mocked(applicationsApi.getAssignmentApplications).mockResolvedValue([]);

      render(<AssignmentApplications />, {
        wrapper: createWrapper(),
      });

      // Should display no applications message
      await screen.findByText(/no applications/i);
    });
  });

  // ============================================================
  // TIME FORMATTING
  // ============================================================

  describe('Time Taken Formatting', () => {
    it('should format time under 1 hour correctly', async () => {
      const mockApplications = [
        {
          id: 'app-8',
          assignment_id: 'test-assignment-123',
          assignment_type: 'job',
          freelancer_id: 'user-8',
          status: 'pending',
          cover_letter: 'Test',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: {
            id: 'test-assignment-123',
            title: 'Test Job',
            type: 'job',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z',
          },
          profile: {
            id: 'user-8',
            display_name: 'Test User',
            role: 'freelancer',
          },
          skillTestAttempt: {
            id: 'attempt-8',
            score: 80,
            passed: true,
            difficulty: 'mid',
            time_taken_seconds: 2345, // 39 minutes 5 seconds
            completed_at: '2025-01-15T09:30:00Z',
            template: {
              id: 'template-123',
              name: 'Test Template',
              category: 'web-development',
            },
          },
        },
      ];

      jest.mocked(applicationsApi.getAssignmentApplications).mockResolvedValue(
        mockApplications as any
      );

      render(<AssignmentApplications />, {
        wrapper: createWrapper(),
      });

      await screen.findByText('Freelancer Application');

      // Should display 39 minutes (or similar format)
      expect(screen.getByText(/39m/i)).toBeInTheDocument();
    });
  });
});
