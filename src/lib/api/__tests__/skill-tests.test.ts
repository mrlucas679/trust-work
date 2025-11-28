/**
 * Unit tests for Skill Tests API
 * 
 * Tests all skill test API functions including:
 * - Template fetching
 * - Test eligibility checking
 * - Test lifecycle (start, submit, review)
 * - Employer views
 */

import {
  getSkillTestTemplates,
  getSkillTestTemplate,
  canAttemptSkillTest,
  startSkillTest,
  submitSkillTest,
  getSkillTestReview,
  getGigSkillTestAttempts,
  getJobSkillTestAttempts
} from '../skill-tests';
import { supabase } from '@/lib/supabaseClient';
import type { SkillTestTemplate, SkillTestCategory, SkillTestDifficulty } from '@/types/skill-tests';

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    },
    rpc: jest.fn()
  }
}));

describe('Skill Tests API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // TEMPLATES
  // ============================================================

  describe('getSkillTestTemplates', () => {
    it('should fetch all active templates successfully', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Frontend Development',
          category: 'web-development',
          description: 'Test frontend skills',
          icon: '🎨',
          total_questions: 50,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'SEO Specialist',
          category: 'digital-marketing',
          description: 'Test SEO knowledge',
          icon: '🔍',
          total_questions: 50,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis()
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);
      mockQuery.order.mockResolvedValue({ data: mockTemplates, error: null });

      const result = await getSkillTestTemplates();

      expect(supabase.from).toHaveBeenCalledWith('skill_test_templates');
      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Frontend Development');
      expect(result[1].name).toBe('SEO Specialist');
    });

    it('should filter templates by category', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Frontend Development',
          category: 'web-development',
          description: 'Test frontend skills',
          icon: '🎨',
          total_questions: 50,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis()
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);
      mockQuery.order.mockResolvedValue({ data: mockTemplates, error: null });

      const result = await getSkillTestTemplates('web-development' as SkillTestCategory);

      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true);
      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'web-development');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('web-development');
    });

    it('should throw error when fetch fails', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis()
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);
      mockQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(getSkillTestTemplates()).rejects.toThrow('Failed to fetch templates');
    });
  });

  describe('getSkillTestTemplate', () => {
    it('should fetch single template by ID', async () => {
      const mockTemplate = {
        id: '1',
        name: 'Frontend Development',
        category: 'web-development',
        description: 'Test frontend skills',
        icon: '🎨',
        total_questions: 50,
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockTemplate, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getSkillTestTemplate('1');

      expect(supabase.from).toHaveBeenCalledWith('skill_test_templates');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true);
      expect(result.name).toBe('Frontend Development');
    });

    it('should throw error when template not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      await expect(getSkillTestTemplate('999')).rejects.toThrow('Failed to fetch template');
    });
  });

  // ============================================================
  // TEST ELIGIBILITY
  // ============================================================

  describe('canAttemptSkillTest', () => {
    beforeEach(() => {
      jest.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } as any },
        error: null
      });
    });

    it('should allow first-time test attempt', async () => {
      jest.mocked(supabase.rpc).mockResolvedValue({
        data: true,
        error: null
      } as any);

      const result = await canAttemptSkillTest('gig-123');

      expect(supabase.rpc).toHaveBeenCalledWith('can_attempt_skill_test', {
        p_applicant_id: 'user-123',
        p_gig_id: 'gig-123',
        p_job_id: null
      });
      expect(result.canAttempt).toBe(true);
    });

    it('should block test attempt within 7-day cooldown', async () => {
      jest.mocked(supabase.rpc).mockResolvedValue({
        data: false,
        error: null
      } as any);

      const mockLastAttempt = {
        score: 65,
        passed: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockLastAttempt, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await canAttemptSkillTest('gig-123');

      expect(result.canAttempt).toBe(false);
      expect(result.reason).toContain('7 days');
      expect(result.lastAttempt).toBeDefined();
      expect(result.lastAttempt?.score).toBe(65);
    });

    it('should throw error when user not authenticated', async () => {
      jest.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(canAttemptSkillTest('gig-123')).rejects.toThrow('User not authenticated');
    });

    it('should throw error when no gig or job ID provided', async () => {
      await expect(canAttemptSkillTest()).rejects.toThrow('Either gigId or jobId must be provided');
    });
  });

  // ============================================================
  // TEST LIFECYCLE
  // ============================================================

  describe('startSkillTest', () => {
    beforeEach(() => {
      jest.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } as any },
        error: null
      });
    });

    it('should start test successfully', async () => {
      // Mock eligibility check
      jest.mocked(supabase.rpc).mockResolvedValueOnce({
        data: true,
        error: null
      } as any);

      // Mock get_random_test_questions RPC
      const mockQuestions = [
        {
          id: 'q1',
          template_id: 'template-123',
          difficulty: 'entry',
          question_text: 'What is React?',
          option_a: 'Library',
          option_b: 'Framework',
          option_c: 'Language',
          option_d: 'Tool',
          correct_answer: 0,
          explanation: 'React is a JavaScript library',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ];

      jest.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockQuestions,
        error: null
      } as any);

      // Mock insert attempt
      const mockAttempt = {
        id: 'attempt-123',
        started_at: new Date().toISOString()
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAttempt, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await startSkillTest({
        templateId: 'template-123',
        gigId: 'gig-123',
        difficulty: 'entry' as SkillTestDifficulty
      });

      expect(result.attemptId).toBe('attempt-123');
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].questionText).toBe('What is React?');
      expect(result.timeLimit).toBe(2400); // 40 minutes in seconds
    });

    it('should throw error when not eligible', async () => {
      jest.mocked(supabase.rpc).mockResolvedValue({
        data: false,
        error: null
      } as any);

      const mockLastAttempt = {
        score: 65,
        passed: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockLastAttempt, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      await expect(
        startSkillTest({
          templateId: 'template-123',
          gigId: 'gig-123',
          difficulty: 'entry' as SkillTestDifficulty
        })
      ).rejects.toThrow('Cannot attempt test at this time');
    });
  });

  describe('submitSkillTest', () => {
    beforeEach(() => {
      jest.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } as any },
        error: null
      });
    });

    it('should submit test and calculate score correctly', async () => {
      const mockQuestions = [
        {
          id: 'q1',
          template_id: 'template-123',
          difficulty: 'entry',
          question_text: 'What is React?',
          option_a: 'Library',
          option_b: 'Framework',
          option_c: 'Language',
          option_d: 'Tool',
          correct_answer: 0,
          explanation: 'React is a JavaScript library',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'q2',
          template_id: 'template-123',
          difficulty: 'entry',
          question_text: 'What is JSX?',
          option_a: 'JavaScript',
          option_b: 'Syntax Extension',
          option_c: 'Library',
          option_d: 'Framework',
          correct_answer: 1,
          explanation: 'JSX is a syntax extension',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ];

      const mockAttempt = {
        id: 'attempt-123',
        applicant_id: 'user-123',
        questions_data: mockQuestions,
        passing_score: 70,
        status: 'in_progress'
      };

      // Mock fetch attempt
      const selectMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAttempt, error: null })
      };

      // Mock update
      const updateMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      jest.mocked(supabase.from)
        .mockReturnValueOnce(selectMock as any)
        .mockReturnValueOnce(updateMock as any);

      const result = await submitSkillTest({
        attemptId: 'attempt-123',
        answers: [
          { questionId: 'q1', selectedAnswer: 0 }, // Correct
          { questionId: 'q2', selectedAnswer: 0 }  // Incorrect
        ],
        timeTakenSeconds: 600,
        tabSwitches: 0
      });

      expect(result.score).toBe(50); // 1 out of 2 correct = 50%
      expect(result.passed).toBe(false); // Below 70% threshold
      expect(result.correctAnswers).toBe(1);
      expect(result.totalQuestions).toBe(2);
    });

    it('should fail test when tab switches detected', async () => {
      const mockAttempt = {
        id: 'attempt-123',
        applicant_id: 'user-123',
        questions_data: [
          {
            id: 'q1',
            correct_answer: 0
          }
        ],
        passing_score: 70,
        status: 'in_progress'
      };

      const selectMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAttempt, error: null })
      };

      const updateMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      jest.mocked(supabase.from)
        .mockReturnValueOnce(selectMock as any)
        .mockReturnValueOnce(updateMock as any);

      const result = await submitSkillTest({
        attemptId: 'attempt-123',
        answers: [{ questionId: 'q1', selectedAnswer: 0 }],
        timeTakenSeconds: 600,
        tabSwitches: 2
      });

      expect(result.passed).toBe(false);
      expect(updateMock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed_cheat',
          tab_switches: 2
        })
      );
    });

    it('should throw error when attempt not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      await expect(
        submitSkillTest({
          attemptId: 'invalid-id',
          answers: [],
          timeTakenSeconds: 0,
          tabSwitches: 0
        })
      ).rejects.toThrow('Test attempt not found or already completed');
    });
  });

  describe('getSkillTestReview', () => {
    beforeEach(() => {
      jest.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } as any },
        error: null
      });
    });

    it('should fetch test review with questions and answers', async () => {
      const mockAttempt = {
        id: 'attempt-123',
        applicant_id: 'user-123',
        template_id: 'template-123',
        gig_id: 'gig-123',
        job_id: null,
        difficulty: 'entry',
        questions_data: [
          {
            id: 'q1',
            template_id: 'template-123',
            difficulty: 'entry',
            question_text: 'What is React?',
            option_a: 'Library',
            option_b: 'Framework',
            option_c: 'Language',
            option_d: 'Tool',
            correct_answer: 0,
            explanation: 'React is a JavaScript library',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z'
          }
        ],
        answers_data: [
          {
            questionId: 'q1',
            selectedAnswer: 'A',
            isCorrect: true
          }
        ],
        score: 100,
        passed: true,
        passing_score: 70,
        time_taken_seconds: 600,
        tab_switches: 0,
        status: 'completed',
        started_at: '2025-01-01T00:00:00Z',
        completed_at: '2025-01-01T00:10:00Z',
        created_at: '2025-01-01T00:00:00Z',
        skill_test_templates: {
          id: 'template-123',
          name: 'Frontend Development',
          category: 'web-development',
          description: 'Test frontend skills',
          icon: '🎨',
          total_questions: 50,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAttempt, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getSkillTestReview('attempt-123');

      expect(result.attempt.id).toBe('attempt-123');
      expect(result.attempt.score).toBe(100);
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].isCorrect).toBe(true);
      expect(result.attempt.template).toBeDefined();
      expect(result.attempt.template?.name).toBe('Frontend Development');
    });

    it('should throw error when review not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      await expect(getSkillTestReview('invalid-id')).rejects.toThrow('Test attempt not found');
    });
  });

  // ============================================================
  // EMPLOYER VIEWS
  // ============================================================

  describe('getGigSkillTestAttempts', () => {
    beforeEach(() => {
      jest.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'employer-123' } as any },
        error: null
      });
    });

    it('should fetch all attempts for a gig', async () => {
      const mockAttempts = [
        {
          id: 'attempt-1',
          applicant_id: 'user-1',
          template_id: 'template-123',
          gig_id: 'gig-123',
          job_id: null,
          difficulty: 'entry',
          questions_data: [],
          answers_data: [],
          score: 85,
          passed: true,
          passing_score: 70,
          time_taken_seconds: 600,
          tab_switches: 0,
          status: 'completed',
          started_at: '2025-01-01T00:00:00Z',
          completed_at: '2025-01-01T00:10:00Z',
          created_at: '2025-01-01T00:00:00Z',
          skill_test_templates: {
            id: 'template-123',
            name: 'Frontend Development',
            category: 'web-development',
            description: 'Test',
            icon: '🎨',
            total_questions: 50,
            is_active: true,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z'
          },
          profiles: {
            id: 'user-1',
            display_name: 'John Doe'
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockAttempts, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getGigSkillTestAttempts('gig-123');

      expect(mockQuery.eq).toHaveBeenCalledWith('gig_id', 'gig-123');
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'completed');
      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(85);
      expect(result[0].applicant.displayName).toBe('John Doe');
    });
  });

  describe('getJobSkillTestAttempts', () => {
    beforeEach(() => {
      jest.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'employer-123' } as any },
        error: null
      });
    });

    it('should fetch all attempts for a job', async () => {
      const mockAttempts = [
        {
          id: 'attempt-1',
          applicant_id: 'user-1',
          template_id: 'template-123',
          gig_id: null,
          job_id: 'job-123',
          difficulty: 'mid',
          questions_data: [],
          answers_data: [],
          score: 75,
          passed: true,
          passing_score: 70,
          time_taken_seconds: 800,
          tab_switches: 0,
          status: 'completed',
          started_at: '2025-01-01T00:00:00Z',
          completed_at: '2025-01-01T00:13:20Z',
          created_at: '2025-01-01T00:00:00Z',
          skill_test_templates: {
            id: 'template-123',
            name: 'Backend Development',
            category: 'web-development',
            description: 'Test',
            icon: '⚙️',
            total_questions: 50,
            is_active: true,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z'
          },
          profiles: {
            id: 'user-1',
            display_name: 'Jane Smith'
          }
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockAttempts, error: null })
      };

      jest.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await getJobSkillTestAttempts('job-123');

      expect(mockQuery.eq).toHaveBeenCalledWith('job_id', 'job-123');
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'completed');
      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(75);
      expect(result[0].applicant.displayName).toBe('Jane Smith');
    });

    it('should throw error when not authenticated', async () => {
      jest.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(getJobSkillTestAttempts('job-123')).rejects.toThrow('User not authenticated');
    });
  });
});
