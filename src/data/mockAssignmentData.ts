import { UserAssignmentProfile, SkillCategory, AssignmentLevel } from '@/types/assignments';

// Mock user assignment profile with some completed assignments
export const mockUserAssignmentProfile: UserAssignmentProfile = {
    userId: '1',
    userName: 'Sarah Johnson',
    gigsCompleted: 7,
    assignmentCredits: 45,
    discountVouchers: [
        {
            voucherId: 'voucher_001',
            discountPercent: 30,
            earnedFrom: {
                skill: 'digital-marketing',
                level: 'foundation',
                score: 92,
            },
            earnedAt: '2025-10-10T15:00:00Z',
            expiresAt: '2025-11-09T15:00:00Z',
            used: false,
            usedOn: null,
        },
    ],
    assignments: [
        {
            assignmentId: 'dm_foundation_attempt_1',
            skill: 'digital-marketing',
            skillDisplayName: 'Digital Marketing',
            level: 'foundation',
            levelDisplayName: 'Foundation',
            attemptNumber: 1,
            status: 'completed',
            totalQuestions: 12,
            correctAnswers: 11,
            incorrectAnswers: 1,
            scorePercentage: 92,
            passed: true,
            timeAllowed: 2400,
            timeTaken: 1800,
            startedAt: '2025-10-10T14:30:00Z',
            completedAt: '2025-10-10T15:00:00Z',
            creditsCost: 0,
            creditsRefunded: 0,
            questionsAsked: [],
            deviceType: 'desktop',
            browserInfo: 'Chrome',
            abandoned: false,
            tabSwitchDetected: false,
        },
        {
            assignmentId: 'gd_foundation_attempt_1',
            skill: 'graphic-design',
            skillDisplayName: 'Graphic Design',
            level: 'foundation',
            levelDisplayName: 'Foundation',
            attemptNumber: 1,
            status: 'completed',
            totalQuestions: 12,
            correctAnswers: 11,
            incorrectAnswers: 1,
            scorePercentage: 92,
            passed: true,
            timeAllowed: 2400,
            timeTaken: 1750,
            startedAt: '2025-10-12T10:00:00Z',
            completedAt: '2025-10-12T10:29:10Z',
            creditsCost: 0,
            creditsRefunded: 0,
            questionsAsked: [],
            deviceType: 'desktop',
            browserInfo: 'Chrome',
            abandoned: false,
            tabSwitchDetected: false,
        },
        {
            assignmentId: 'gd_developer_attempt_1',
            skill: 'graphic-design',
            skillDisplayName: 'Graphic Design',
            level: 'developer',
            levelDisplayName: 'Developer',
            attemptNumber: 1,
            status: 'completed',
            totalQuestions: 12,
            correctAnswers: 7,
            incorrectAnswers: 5,
            scorePercentage: 58,
            passed: false,
            timeAllowed: 2400,
            timeTaken: 2300,
            startedAt: '2025-10-22T14:00:00Z',
            completedAt: '2025-10-22T14:38:20Z',
            creditsCost: 0,
            creditsRefunded: 0,
            questionsAsked: [],
            deviceType: 'mobile',
            browserInfo: 'Safari',
            abandoned: false,
            tabSwitchDetected: false,
        },
        {
            assignmentId: 'gd_developer_attempt_2',
            skill: 'graphic-design',
            skillDisplayName: 'Graphic Design',
            level: 'developer',
            levelDisplayName: 'Developer',
            attemptNumber: 2,
            status: 'completed',
            totalQuestions: 12,
            correctAnswers: 8,
            incorrectAnswers: 4,
            scorePercentage: 67,
            passed: false,
            timeAllowed: 2400,
            timeTaken: 2200,
            startedAt: '2025-10-24T09:00:00Z',
            completedAt: '2025-10-24T09:36:40Z',
            creditsCost: 15,
            creditsRefunded: 0,
            questionsAsked: [],
            deviceType: 'desktop',
            browserInfo: 'Chrome',
            abandoned: false,
            tabSwitchDetected: false,
        },
        {
            assignmentId: 'cw_foundation_attempt_1',
            skill: 'content-writing',
            skillDisplayName: 'Content Writing',
            level: 'foundation',
            levelDisplayName: 'Foundation',
            attemptNumber: 1,
            status: 'completed',
            totalQuestions: 12,
            correctAnswers: 11,
            incorrectAnswers: 1,
            scorePercentage: 92,
            passed: true,
            timeAllowed: 2400,
            timeTaken: 1680,
            startedAt: '2025-10-15T11:00:00Z',
            completedAt: '2025-10-15T11:28:00Z',
            creditsCost: 0,
            creditsRefunded: 0,
            questionsAsked: [],
            deviceType: 'desktop',
            browserInfo: 'Firefox',
            abandoned: false,
            tabSwitchDetected: false,
        },
    ],
    certifications: {
        'digital-marketing': {
            foundation: {
                bestScore: 92,
                passed: true,
                attempts: 1,
                lastAttemptDate: '2025-10-10T15:00:00Z',
            },
            developer: {
                bestScore: null,
                passed: false,
                attempts: 0,
            },
            advanced: {
                bestScore: null,
                passed: false,
                attempts: 0,
            },
            expert: {
                bestScore: null,
                passed: false,
                attempts: 0,
            },
        },
        'graphic-design': {
            foundation: {
                bestScore: 92,
                passed: true,
                attempts: 1,
                lastAttemptDate: '2025-10-12T10:29:10Z',
            },
            developer: {
                bestScore: 67,
                passed: false,
                attempts: 2,
                lastAttemptDate: '2025-10-24T09:36:40Z',
                nextRetakeAvailable: '2025-10-25T09:36:40Z',
            },
            advanced: {
                bestScore: null,
                passed: false,
                attempts: 0,
            },
            expert: {
                bestScore: null,
                passed: false,
                attempts: 0,
            },
        },
        'content-writing': {
            foundation: {
                bestScore: 92,
                passed: true,
                attempts: 1,
                lastAttemptDate: '2025-10-15T11:28:00Z',
            },
            developer: {
                bestScore: null,
                passed: false,
                attempts: 0,
            },
            advanced: {
                bestScore: null,
                passed: false,
                attempts: 0,
            },
            expert: {
                bestScore: null,
                passed: false,
                attempts: 0,
            },
        },
    },
};

// Helper to check if a level is unlocked
export function isLevelUnlocked(
    skill: SkillCategory,
    level: AssignmentLevel,
    userProfile: UserAssignmentProfile
): boolean {
    const { gigsCompleted, certifications } = userProfile;

    // Check gig requirements
    const levelRequirements = {
        foundation: 3,
        developer: 6,
        advanced: 9,
        expert: 12,
    };

    if (gigsCompleted < levelRequirements[level]) {
        return false;
    }

    // Check previous level completion
    const previousLevelMap: Record<AssignmentLevel, AssignmentLevel | null> = {
        foundation: null,
        developer: 'foundation',
        advanced: 'developer',
        expert: 'advanced',
    };

    const previousLevel = previousLevelMap[level];
    if (previousLevel) {
        const prevLevelCert = certifications[skill][previousLevel];
        if (!prevLevelCert.passed) {
            return false;
        }
    }

    return true;
}

// Helper to get level status
export function getLevelStatus(
    skill: SkillCategory,
    level: AssignmentLevel,
    userProfile: UserAssignmentProfile
): 'locked' | 'unlocked' | 'passed' | 'failed' {
    const cert = userProfile.certifications[skill][level];

    if (!isLevelUnlocked(skill, level, userProfile)) {
        return 'locked';
    }

    if (cert.passed) {
        return 'passed';
    }

    if (cert.attempts > 0 && !cert.passed) {
        return 'failed';
    }

    return 'unlocked';
}

// Helper to check if retake is available
export function canRetakeNow(
    skill: SkillCategory,
    level: AssignmentLevel,
    userProfile: UserAssignmentProfile
): boolean {
    const cert = userProfile.certifications[skill][level];

    if (!cert.nextRetakeAvailable) {
        return true;
    }

    const now = new Date();
    const nextRetake = new Date(cert.nextRetakeAvailable);

    return now >= nextRetake;
}

// Helper to get time until next retake
export function getTimeUntilRetake(
    skill: SkillCategory,
    level: AssignmentLevel,
    userProfile: UserAssignmentProfile
): string | null {
    const cert = userProfile.certifications[skill][level];

    if (!cert.nextRetakeAvailable) {
        return null;
    }

    const now = new Date();
    const nextRetake = new Date(cert.nextRetakeAvailable);

    if (now >= nextRetake) {
        return null;
    }

    const diff = nextRetake.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
}
