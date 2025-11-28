/**
 * Skill Tests Type Definitions
 * 
 * Separate system from Assignments/Certifications
 * Used for filtering unqualified applicants during job/gig applications
 */

// ============================================================
// ENUMS & CONSTANTS
// ============================================================

export type SkillTestDifficulty = 'entry' | 'mid' | 'senior';

export type SkillTestStatus = 'in_progress' | 'completed' | 'failed_cheat' | 'expired';

export type SkillTestCategory = 
  | 'Digital Marketing'
  | 'Web Development'
  | 'Graphic Design'
  | 'Content Writing'
  | 'Video Editing'
  | 'Social Media Management'
  | 'Data Entry'
  | 'Virtual Assistant'
  | 'Customer Service'
  | 'Business';

export const DIFFICULTY_CONFIG = {
  entry: {
    label: 'Entry Level',
    description: '5 questions - Basic concepts (0-1 years experience)',
    questionCount: 5,
    icon: 'award',
    color: 'green'
  },
  mid: {
    label: 'Mid Level',
    description: '10 questions - Practical application (2-4 years experience)',
    questionCount: 10,
    icon: 'award',
    color: 'blue'
  },
  senior: {
    label: 'Senior Level',
    description: '15 questions - Advanced problem-solving (5+ years experience)',
    questionCount: 15,
    icon: 'award',
    color: 'purple'
  }
} as const;

export const DEFAULT_PASSING_SCORE = 70;
export const TEST_TIME_LIMIT_MINUTES = 40;

// ============================================================
// CORE INTERFACES
// ============================================================

export interface SkillTestTemplate {
  id: string;
  name: string;
  category: SkillTestCategory;
  description: string;
  icon: string;
  totalQuestions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillTestQuestion {
  id: string;
  templateId: string;
  difficulty: SkillTestDifficulty;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillTestConfig {
  required: boolean;
  templateId: string | null;
  template?: SkillTestTemplate;
  difficulty: SkillTestDifficulty | null;
  passingScore: number;
}

export interface SkillTestAnswer {
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  pointsEarned: number;
}

export interface SkillTestAttempt {
  id: string;
  applicantId: string;
  templateId: string;
  template?: SkillTestTemplate;
  gigId: string | null;
  jobId: string | null;
  difficulty: SkillTestDifficulty;
  questionsData: SkillTestQuestion[];
  answersData: SkillTestAnswer[];
  score: number;
  passed: boolean;
  passingScore: number;
  timeTakenSeconds: number | null;
  tabSwitches: number;
  status: SkillTestStatus;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}

// ============================================================
// API REQUEST/RESPONSE TYPES
// ============================================================

export interface StartSkillTestRequest {
  templateId: string;
  difficulty: SkillTestDifficulty;
  gigId?: string;
  jobId?: string;
}

export interface StartSkillTestResponse {
  attemptId: string;
  questions: SkillTestQuestion[];
  timeLimit: number; // in seconds
  passingScore: number;
  startedAt: string;
}

export interface SubmitSkillTestRequest {
  attemptId: string;
  answers: Array<{
    questionId: string;
    selectedAnswer: 'A' | 'B' | 'C' | 'D';
  }>;
  timeTakenSeconds: number;
  tabSwitches: number;
}

export interface SubmitSkillTestResponse {
  attemptId: string;
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  passingScore: number;
  timeTakenSeconds: number;
}

export interface SkillTestReviewResponse {
  attempt: SkillTestAttempt;
  questions: Array<{
    question: SkillTestQuestion;
    userAnswer: 'A' | 'B' | 'C' | 'D';
    isCorrect: boolean;
  }>;
}

export interface CanAttemptTestResponse {
  canAttempt: boolean;
  reason?: string;
  nextAttemptDate?: string;
  lastAttempt?: {
    score: number;
    passed: boolean;
    attemptedAt: string;
  };
}

// ============================================================
// COMPONENT PROPS
// ============================================================

export interface SkillTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  difficulty: SkillTestDifficulty;
  passingScore: number;
  gigId?: string;
  jobId?: string;
  onTestComplete: (attemptId: string, passed: boolean, score: number) => void;
}

export interface SkillTestWarningProps {
  templateName: string;
  difficulty: SkillTestDifficulty;
  questionCount: number;
  timeLimit: number;
  passingScore: number;
  onAgree: () => void;
  onCancel: () => void;
}

export interface SkillTestQuizProps {
  attemptId: string;
  questions: SkillTestQuestion[];
  timeLimit: number;
  onSubmit: (answers: SubmitSkillTestRequest) => void;
  onCheatDetected: () => void;
}

export interface SkillTestResultsProps {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  passingScore: number;
  timeTaken: number;
  onReview: () => void;
  onClose: () => void;
}

export interface SkillTestSelectorProps {
  category?: SkillTestCategory;
  value: SkillTestConfig;
  onChange: (config: SkillTestConfig) => void;
  disabled?: boolean;
}

// ============================================================
// EXTENDED TYPES (with Skill Test data)
// ============================================================

export interface GigWithSkillTest {
  id: string;
  title: string;
  requiresSkillTest: boolean;
  skillTestTemplateId: string | null;
  skillTestTemplate?: SkillTestTemplate;
  skillTestDifficulty: SkillTestDifficulty | null;
  skillTestPassingScore: number;
  // ... other gig fields
}

export interface JobWithSkillTest {
  id: string;
  title: string;
  requiresSkillTest: boolean;
  skillTestTemplateId: string | null;
  skillTestTemplate?: SkillTestTemplate;
  skillTestDifficulty: SkillTestDifficulty | null;
  skillTestPassingScore: number;
  // ... other job fields
}

export interface ApplicationWithSkillTest {
  id: string;
  skillTestAttemptId: string | null;
  skillTestAttempt?: SkillTestAttempt;
  // ... other application fields
}

// ============================================================
// UTILITY TYPES
// ============================================================

export interface SkillTestStats {
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  averageScore: number;
  averageTimeTaken: number;
  passRate: number;
}

export interface SkillTestAttemptWithApplicant extends SkillTestAttempt {
  applicant: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}
