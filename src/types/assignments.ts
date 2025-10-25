// Assignment System Types

export type SkillCategory = 'digital-marketing' | 'graphic-design' | 'content-writing';

export type AssignmentLevel = 'foundation' | 'developer' | 'advanced' | 'expert';

export type AssignmentStatus = 'locked' | 'unlocked' | 'passed' | 'failed' | 'in-progress';

export type AttemptStatus = 'completed' | 'failed-tab-switch' | 'failed-timeout';

export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string; // 'A', 'B', 'C', or 'D'
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topics: string[];
    learningResources?: {
        title: string;
        url: string;
    }[];
}

export interface UserAnswer {
    questionId: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    userAnswer: string | null;
    isCorrect: boolean;
    timeSpentOnQuestion: number; // seconds
}

export interface DiscountVoucher {
    voucherId: string;
    discountPercent: number;
    earnedFrom: {
        skill: SkillCategory;
        level: AssignmentLevel;
        score: number;
    };
    earnedAt: string;
    expiresAt: string;
    used: boolean;
    usedOn: {
        skill: SkillCategory;
        level: AssignmentLevel;
    } | null;
}

export interface AssignmentAttempt {
    assignmentId: string;
    skill: SkillCategory;
    skillDisplayName: string;
    level: AssignmentLevel;
    levelDisplayName: string;
    attemptNumber: number;
    status: AttemptStatus;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    scorePercentage: number;
    passed: boolean; // true if >= 70%
    timeAllowed: number; // seconds (2400 = 40 minutes)
    timeTaken: number; // seconds
    startedAt: string;
    completedAt: string;
    creditsCost: number;
    creditsRefunded: number;
    questionsAsked: UserAnswer[];
    deviceType: string;
    browserInfo: string;
    abandoned: boolean;
    tabSwitchDetected: boolean;
}

export interface CertificationLevel {
    bestScore: number | null;
    passed: boolean;
    attempts: number;
    lastAttemptDate?: string;
    nextRetakeAvailable?: string;
}

export interface UserAssignmentProfile {
    userId: string;
    userName: string;
    gigsCompleted: number;
    assignmentCredits: number;
    discountVouchers: DiscountVoucher[];
    assignments: AssignmentAttempt[];
    certifications: {
        [key in SkillCategory]: {
            [key in AssignmentLevel]: CertificationLevel;
        };
    };
}

export interface QuestionBank {
    skill: SkillCategory;
    level: AssignmentLevel;
    questions: Question[];
}

export interface AssignmentLevelRequirements {
    level: AssignmentLevel;
    totalGigsRequired: number;
    previousLevelRequired: AssignmentLevel | null;
    retakeCost: number;
    passScore: number; // percentage
    totalQuestions: number;
    questionPoolSize: number;
    timeAllowed: number; // minutes
}

export const LEVEL_REQUIREMENTS: Record<AssignmentLevel, AssignmentLevelRequirements> = {
    foundation: {
        level: 'foundation',
        totalGigsRequired: 3,
        previousLevelRequired: null,
        retakeCost: 10,
        passScore: 70,
        totalQuestions: 12,
        questionPoolSize: 25,
        timeAllowed: 40,
    },
    developer: {
        level: 'developer',
        totalGigsRequired: 6,
        previousLevelRequired: 'foundation',
        retakeCost: 15,
        passScore: 70,
        totalQuestions: 12,
        questionPoolSize: 28,
        timeAllowed: 40,
    },
    advanced: {
        level: 'advanced',
        totalGigsRequired: 9,
        previousLevelRequired: 'developer',
        retakeCost: 20,
        passScore: 70,
        totalQuestions: 12,
        questionPoolSize: 30,
        timeAllowed: 40,
    },
    expert: {
        level: 'expert',
        totalGigsRequired: 12,
        previousLevelRequired: 'advanced',
        retakeCost: 25,
        passScore: 70,
        totalQuestions: 12,
        questionPoolSize: 30,
        timeAllowed: 40,
    },
};

export const SKILL_DISPLAY_NAMES: Record<SkillCategory, string> = {
    'digital-marketing': 'Digital Marketing',
    'graphic-design': 'Graphic Design',
    'content-writing': 'Content Writing',
};

export const LEVEL_DISPLAY_NAMES: Record<AssignmentLevel, string> = {
    foundation: 'Foundation',
    developer: 'Developer',
    advanced: 'Advanced',
    expert: 'Expert',
};
