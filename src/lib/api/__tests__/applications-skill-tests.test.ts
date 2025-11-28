/**
 * Unit tests for Applications API - Skill Test Integration (Phase 7)
 * 
 * Tests the integration between applications and skill test attempts:
 * - ApplicationWithDetails.skillTestAttempt property
 * - getAssignmentApplications with skill test data
 * - getMyApplications with skill test data
 * - getApplication with skill test data
 */


import {
  getAssignmentApplications,
  getMyApplications,
  getApplication
} from '../applications';
import { supabase } from '@/lib/supabaseClient';
import type { ApplicationWithDetails } from '../applications';

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  }
}));

describe('Applications API - Skill Test Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } as any },
      error: null
    });
  });

  // ============================================================
  // APPLICATION WITH SKILL TEST DATA
  // ============================================================

  describe('getAssignmentApplications - Skill Test Integration', () => {
    it('should include skill test attempt data for applications with completed tests', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'job-123',
          assignment_type: 'job',
          freelancer_id: 'user-1',
          status: 'pending',
          cover_letter: 'I am interested',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: {
            id: 'job-123',
            title: 'Senior React Developer',
            type: 'job',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z'
          },
          profile: {
            id: 'user-1',
            display_name: 'John Doe',
            avatar_url: 'https://example.com/avatar.jpg',
            role: 'freelancer',
            verified: true
          },
          skillTestAttempt: {
            id: 'attempt-1',
            score: 85,
            passed: true,
            difficulty: 'mid',
            time_taken_seconds: 1800,
            completed_at: '2025-01-15T09:30:00Z',
            template: {
              id: 'template-123',
              name: 'React Development',
              category: 'web-development'
            }
          }
        },
        {
          id: 'app-2',
          assignment_id: 'job-123',
          assignment_type: 'job',
          freelancer_id: 'user-2',
          status: 'pending',
          cover_letter: 'Very interested',
          created_at: '2025-01-15T11:00:00Z',
          updated_at: '2025-01-15T11:00:00Z',
          assignment: {
            id: 'job-123',
            title: 'Senior React Developer',
            type: 'job',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z'
          },
          profile: {
            id: 'user-2',
            display_name: 'Jane Smith',
            avatar_url: 'https://example.com/avatar2.jpg',
            role: 'freelancer',
            verified: true
          },
          skillTestAttempt: {
            id: 'attempt-2',
            score: 65,
            passed: false,
            difficulty: 'mid',
            time_taken_seconds: 2400,
            completed_at: '2025-01-15T10:40:00Z',
            template: {
              id: 'template-123',
              name: 'React Development',
              category: 'web-development'
            }
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockApplications, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getAssignmentApplications('job-123', 'job');

      // Verify query structure
      expect(supabase.from).toHaveBeenCalledWith('applications');
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('skillTestAttempt:skill_test_attempts')
      );
      expect(mockQuery.eq).toHaveBeenCalledWith('assignment_id', 'job-123');
      expect(mockQuery.eq).toHaveBeenCalledWith('assignment_type', 'job');

      // Verify results
      expect(result).toHaveLength(2);

      // First application - passed test
      expect(result[0].skillTestAttempt).toBeDefined();
      expect(result[0].skillTestAttempt?.score).toBe(85);
      expect(result[0].skillTestAttempt?.passed).toBe(true);
      expect(result[0].skillTestAttempt?.difficulty).toBe('mid');
      expect(result[0].skillTestAttempt?.time_taken_seconds).toBe(1800);
      expect(result[0].skillTestAttempt?.template?.name).toBe('React Development');

      // Second application - failed test
      expect(result[1].skillTestAttempt).toBeDefined();
      expect(result[1].skillTestAttempt?.score).toBe(65);
      expect(result[1].skillTestAttempt?.passed).toBe(false);
    });

    it('should handle applications without skill test attempts', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'job-123',
          assignment_type: 'job',
          freelancer_id: 'user-1',
          status: 'pending',
          cover_letter: 'I am interested',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: {
            id: 'job-123',
            title: 'Senior React Developer',
            type: 'job',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z'
          },
          profile: {
            id: 'user-1',
            display_name: 'John Doe',
            avatar_url: 'https://example.com/avatar.jpg',
            role: 'freelancer',
            verified: true
          },
          skillTestAttempt: null // No test attempt
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockApplications, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getAssignmentApplications('job-123', 'job');

      expect(result).toHaveLength(1);
      expect(result[0].skillTestAttempt).toBeNull();
    });

    it('should properly format time_taken_seconds for display', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'gig-456',
          assignment_type: 'gig',
          freelancer_id: 'user-1',
          status: 'pending',
          cover_letter: 'Interested',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: {
            id: 'gig-456',
            title: 'Logo Design',
            type: 'gig',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z'
          },
          profile: {
            id: 'user-1',
            display_name: 'Designer Pro',
            role: 'freelancer'
          },
          skillTestAttempt: {
            id: 'attempt-1',
            score: 90,
            passed: true,
            difficulty: 'entry',
            time_taken_seconds: 615, // 10 minutes 15 seconds
            completed_at: '2025-01-15T09:10:15Z',
            template: {
              id: 'template-456',
              name: 'Graphic Design Basics',
              category: 'creative'
            }
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockApplications, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getAssignmentApplications('gig-456', 'gig');

      expect(result[0].skillTestAttempt?.time_taken_seconds).toBe(615);
      
      // Verify minutes and seconds calculation for UI
      const timeTaken = result[0].skillTestAttempt?.time_taken_seconds || 0;
      const minutes = Math.floor(timeTaken / 60);
      const seconds = timeTaken % 60;
      
      expect(minutes).toBe(10);
      expect(seconds).toBe(15);
    });
  });

  describe('getMyApplications - Skill Test Integration', () => {
    it('should include skill test attempts for user applications', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'job-123',
          assignment_type: 'job',
          freelancer_id: 'user-123',
          status: 'pending',
          cover_letter: 'My application',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: {
            id: 'job-123',
            title: 'React Developer',
            type: 'job',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z'
          },
          profile: {
            id: 'user-123',
            display_name: 'Me',
            role: 'freelancer'
          },
          skillTestAttempt: {
            id: 'attempt-1',
            score: 88,
            passed: true,
            difficulty: 'mid',
            time_taken_seconds: 1620,
            completed_at: '2025-01-15T09:30:00Z',
            template: {
              id: 'template-123',
              name: 'React Development',
              category: 'web-development'
            }
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockApplications, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getMyApplications();

      expect(mockQuery.eq).toHaveBeenCalledWith('freelancer_id', 'user-123');
      expect(result).toHaveLength(1);
      expect(result[0].skillTestAttempt).toBeDefined();
      expect(result[0].skillTestAttempt?.score).toBe(88);
      expect(result[0].skillTestAttempt?.passed).toBe(true);
    });
  });

  describe('getApplication - Skill Test Integration', () => {
    it('should include skill test attempt data for single application', async () => {
      const mockApplication = {
        id: 'app-1',
        assignment_id: 'job-123',
        assignment_type: 'job',
        freelancer_id: 'user-1',
        status: 'pending',
        cover_letter: 'Application letter',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
        assignment: {
          id: 'job-123',
          title: 'Backend Engineer',
          type: 'job',
          status: 'open',
          created_at: '2025-01-14T00:00:00Z'
        },
        profile: {
          id: 'user-1',
          display_name: 'Developer',
          role: 'freelancer'
        },
        skillTestAttempt: {
          id: 'attempt-1',
          score: 92,
          passed: true,
          difficulty: 'senior',
          time_taken_seconds: 2100,
          completed_at: '2025-01-15T09:35:00Z',
          template: {
            id: 'template-789',
            name: 'Node.js Backend',
            category: 'web-development'
          }
        }
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockApplication, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getApplication('app-1');

      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('skillTestAttempt:skill_test_attempts')
      );
      expect(result.skillTestAttempt).toBeDefined();
      expect(result.skillTestAttempt?.score).toBe(92);
      expect(result.skillTestAttempt?.difficulty).toBe('senior');
      expect(result.skillTestAttempt?.template?.name).toBe('Node.js Backend');
    });
  });

  // ============================================================
  // SKILL TEST DIFFICULTY LEVELS
  // ============================================================

  describe('Skill Test Difficulty Levels', () => {
    it('should handle entry-level difficulty tests', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'gig-123',
          assignment_type: 'gig',
          freelancer_id: 'user-1',
          status: 'pending',
          cover_letter: 'Entry level application',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: {
            id: 'gig-123',
            title: 'Simple Data Entry',
            type: 'gig',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z'
          },
          profile: {
            id: 'user-1',
            display_name: 'Beginner User',
            role: 'freelancer'
          },
          skillTestAttempt: {
            id: 'attempt-1',
            score: 75,
            passed: true,
            difficulty: 'entry',
            time_taken_seconds: 900,
            completed_at: '2025-01-15T09:15:00Z',
            template: {
              id: 'template-001',
              name: 'Data Entry Basics',
              category: 'administrative'
            }
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockApplications, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getAssignmentApplications('gig-123', 'gig');

      expect(result[0].skillTestAttempt?.difficulty).toBe('entry');
    });

    it('should handle mid-level difficulty tests', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'job-456',
          assignment_type: 'job',
          freelancer_id: 'user-2',
          status: 'pending',
          cover_letter: 'Mid level application',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: {
            id: 'job-456',
            title: 'React Developer',
            type: 'job',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z'
          },
          profile: {
            id: 'user-2',
            display_name: 'Mid Developer',
            role: 'freelancer'
          },
          skillTestAttempt: {
            id: 'attempt-2',
            score: 82,
            passed: true,
            difficulty: 'mid',
            time_taken_seconds: 1800,
            completed_at: '2025-01-15T09:30:00Z',
            template: {
              id: 'template-002',
              name: 'React Intermediate',
              category: 'web-development'
            }
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockApplications, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getAssignmentApplications('job-456', 'job');

      expect(result[0].skillTestAttempt?.difficulty).toBe('mid');
    });

    it('should handle senior-level difficulty tests', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'job-789',
          assignment_type: 'job',
          freelancer_id: 'user-3',
          status: 'pending',
          cover_letter: 'Senior level application',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: {
            id: 'job-789',
            title: 'Senior Architect',
            type: 'job',
            status: 'open',
            created_at: '2025-01-14T00:00:00Z'
          },
          profile: {
            id: 'user-3',
            display_name: 'Senior Expert',
            role: 'freelancer'
          },
          skillTestAttempt: {
            id: 'attempt-3',
            score: 95,
            passed: true,
            difficulty: 'senior',
            time_taken_seconds: 2700,
            completed_at: '2025-01-15T09:45:00Z',
            template: {
              id: 'template-003',
              name: 'System Design Advanced',
              category: 'web-development'
            }
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockApplications, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getAssignmentApplications('job-789', 'job');

      expect(result[0].skillTestAttempt?.difficulty).toBe('senior');
    });
  });

  // ============================================================
  // PASSED VS FAILED TESTS
  // ============================================================

  describe('Test Pass/Fail Status', () => {
    it('should correctly identify passed tests above threshold', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'job-123',
          assignment_type: 'job',
          freelancer_id: 'user-1',
          status: 'pending',
          cover_letter: 'Application',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: { id: 'job-123', title: 'Job', type: 'job', status: 'open', created_at: '2025-01-14T00:00:00Z' },
          profile: { id: 'user-1', display_name: 'User', role: 'freelancer' },
          skillTestAttempt: {
            id: 'attempt-1',
            score: 70, // Exactly at threshold
            passed: true,
            difficulty: 'mid',
            time_taken_seconds: 1800,
            completed_at: '2025-01-15T09:30:00Z',
            template: { id: 'template-1', name: 'Test', category: 'web-development' }
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockApplications, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getAssignmentApplications('job-123', 'job');

      expect(result[0].skillTestAttempt?.score).toBe(70);
      expect(result[0].skillTestAttempt?.passed).toBe(true);
    });

    it('should correctly identify failed tests below threshold', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'job-123',
          assignment_type: 'job',
          freelancer_id: 'user-1',
          status: 'pending',
          cover_letter: 'Application',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: { id: 'job-123', title: 'Job', type: 'job', status: 'open', created_at: '2025-01-14T00:00:00Z' },
          profile: { id: 'user-1', display_name: 'User', role: 'freelancer' },
          skillTestAttempt: {
            id: 'attempt-1',
            score: 69, // Just below threshold
            passed: false,
            difficulty: 'mid',
            time_taken_seconds: 1800,
            completed_at: '2025-01-15T09:30:00Z',
            template: { id: 'template-1', name: 'Test', category: 'web-development' }
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockApplications, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getAssignmentApplications('job-123', 'job');

      expect(result[0].skillTestAttempt?.score).toBe(69);
      expect(result[0].skillTestAttempt?.passed).toBe(false);
    });
  });

  // ============================================================
  // TEMPLATE DATA
  // ============================================================

  describe('Template Data Integration', () => {
    it('should include complete template information', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'gig-123',
          assignment_type: 'gig',
          freelancer_id: 'user-1',
          status: 'pending',
          cover_letter: 'Application',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: { id: 'gig-123', title: 'Gig', type: 'gig', status: 'open', created_at: '2025-01-14T00:00:00Z' },
          profile: { id: 'user-1', display_name: 'User', role: 'freelancer' },
          skillTestAttempt: {
            id: 'attempt-1',
            score: 85,
            passed: true,
            difficulty: 'entry',
            time_taken_seconds: 1200,
            completed_at: '2025-01-15T09:20:00Z',
            template: {
              id: 'template-456',
              name: 'WordPress Development',
              category: 'web-development'
            }
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockApplications, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getAssignmentApplications('gig-123', 'gig');

      const template = result[0].skillTestAttempt?.template;
      expect(template).toBeDefined();
      expect(template?.id).toBe('template-456');
      expect(template?.name).toBe('WordPress Development');
      expect(template?.category).toBe('web-development');
    });

    it('should handle missing template data gracefully', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          assignment_id: 'job-123',
          assignment_type: 'job',
          freelancer_id: 'user-1',
          status: 'pending',
          cover_letter: 'Application',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          assignment: { id: 'job-123', title: 'Job', type: 'job', status: 'open', created_at: '2025-01-14T00:00:00Z' },
          profile: { id: 'user-1', display_name: 'User', role: 'freelancer' },
          skillTestAttempt: {
            id: 'attempt-1',
            score: 80,
            passed: true,
            difficulty: 'mid',
            time_taken_seconds: 1500,
            completed_at: '2025-01-15T09:25:00Z',
            template: null // Template data missing
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockApplications, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getAssignmentApplications('job-123', 'job');

      expect(result[0].skillTestAttempt).toBeDefined();
      expect(result[0].skillTestAttempt?.template).toBeNull();
    });
  });

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  describe('Error Handling', () => {
    it('should throw error when fetching applications fails', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      await expect(getAssignmentApplications('job-123', 'job')).rejects.toThrow();
    });

    it('should throw error when user not authenticated', async () => {
      jest.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(getMyApplications()).rejects.toThrow();
    });
  });
});
