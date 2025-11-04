// Application Skill Test Types

export type SkillCategory =
    // Programming
    | 'JavaScript' | 'TypeScript' | 'React' | 'Node.js' | 'Python'
    | 'Java' | 'C#' | 'PHP' | 'Ruby' | 'Go'
    // Web Technologies
    | 'HTML' | 'CSS' | 'Tailwind' | 'Bootstrap' | 'REST API'
    // Design
    | 'Figma' | 'Adobe XD' | 'Photoshop' | 'UI/UX Design'
    // Marketing
    | 'SEO' | 'Social Media Marketing' | 'Content Marketing' | 'Google Analytics'
    // Business
    | 'Project Management' | 'Excel' | 'Data Analysis' | 'Customer Service';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface ApplicationTestQuestion {
    id: string;
    skill: SkillCategory;
    difficulty: QuestionDifficulty;
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct option (0-3)
    explanation: string;
}

export interface UserTestAnswer {
    questionId: string;
    questionText: string;
    skill: SkillCategory;
    options: string[];
    correctAnswer: string;
    userAnswer: string | null;
    isCorrect: boolean;
    timeSpentSeconds: number;
}

export interface SkillTestResult {
    testId: string;
    jobId: string;
    userId: string;
    score: number; // percentage
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    timeTaken: number; // seconds
    startedAt: string;
    completedAt: string;
    answers: UserTestAnswer[];
    cheatingDetected: boolean;
    cheatingReason?: string;
}

export interface JobApplication {
    id: string;
    jobId: string;
    userId: string;
    cvUrl: string;
    coverLetter: string;
    skillTestResult?: SkillTestResult;
    status: 'draft' | 'pending_test' | 'test_failed' | 'under_review' | 'accepted' | 'rejected';
    submittedAt?: string;
    createdAt: string;
}

export interface QuestionBank {
    [skill: string]: ApplicationTestQuestion[];
}
