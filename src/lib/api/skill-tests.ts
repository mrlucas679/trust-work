import { supabase } from '../supabaseClient';

export interface SkillTestQuestion {
    id: number;
    question: string;
    type: 'multiple_choice' | 'true_false' | 'code' | 'essay';
    options?: string[];
    correct_answer?: string;
    points: number;
}

export interface SkillTest {
    id: string;
    title: string;
    description: string | null;
    type: 'technical' | 'personality' | 'cognitive' | 'other';
    duration_minutes: number;
    passing_score: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: string | null;
    questions: SkillTestQuestion[];
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface SkillTestResult {
    id: string;
    job_seeker_id: string;
    skill_test_id: string;
    application_id: string | null;
    score: number;
    passed: boolean;
    time_taken_minutes: number | null;
    answers: Record<number, string | string[]> | null;
    completed_at: string;
    created_at: string;
}

export interface SubmitSkillTestData {
    skill_test_id: string;
    answers: Record<number, string | string[]>;
    time_taken_minutes: number;
    application_id?: string;
}

/**
 * Fetch all available skill tests
 */
export async function getSkillTests(filters?: {
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    type?: 'technical' | 'personality' | 'cognitive' | 'other';
}): Promise<Omit<SkillTest, 'questions'>[]> {
    let query = supabase
        .from('skill_tests')
        .select('id, title, description, type, duration_minutes, passing_score, difficulty, category, created_at, updated_at');

    if (filters?.category) {
        query = query.eq('category', filters.category);
    }

    if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
    }

    if (filters?.type) {
        query = query.eq('type', filters.type);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching skill tests:', error);
        throw new Error(`Failed to fetch skill tests: ${error.message}`);
    }

    return (data || []) as Omit<SkillTest, 'questions'>[];
}

/**
 * Fetch a single skill test with questions
 */
export async function getSkillTestById(testId: string): Promise<SkillTest | null> {
    const { data, error } = await supabase
        .from('skill_tests')
        .select('*')
        .eq('id', testId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found
        }
        console.error('Error fetching skill test:', error);
        throw new Error(`Failed to fetch skill test: ${error.message}`);
    }

    // Parse questions JSON
    const test = data as SkillTest;
    if (typeof test.questions === 'string') {
        test.questions = JSON.parse(test.questions);
    }

    return test;
}

/**
 * Submit a skill test result
 */
export async function submitSkillTestResult(data: SubmitSkillTestData): Promise<SkillTestResult> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to submit a skill test');
    }

    // Fetch the test to calculate score
    const test = await getSkillTestById(data.skill_test_id);
    if (!test) {
        throw new Error('Skill test not found');
    }

    // Calculate score
    let totalScore = 0;
    let maxScore = 0;

    test.questions.forEach((question) => {
        maxScore += question.points;
        const userAnswer = data.answers[question.id];

        if (question.correct_answer && userAnswer === question.correct_answer) {
            totalScore += question.points;
        }
    });

    const scorePercentage = Math.round((totalScore / maxScore) * 100);
    const passed = scorePercentage >= test.passing_score;

    // Insert result
    const { data: result, error } = await supabase
        .from('skill_test_results')
        .insert({
            job_seeker_id: user.id,
            skill_test_id: data.skill_test_id,
            application_id: data.application_id || null,
            score: scorePercentage,
            passed,
            time_taken_minutes: data.time_taken_minutes,
            answers: data.answers,
        })
        .select()
        .single();

    if (error) {
        console.error('Error submitting skill test result:', error);
        throw new Error(`Failed to submit skill test: ${error.message}`);
    }

    return result as SkillTestResult;
}

/**
 * Get skill test results for the current user
 */
export async function getMySkillTestResults(): Promise<SkillTestResult[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to view your test results');
    }

    const { data, error } = await supabase
        .from('skill_test_results')
        .select('*')
        .eq('job_seeker_id', user.id)
        .order('completed_at', { ascending: false });

    if (error) {
        console.error('Error fetching skill test results:', error);
        throw new Error(`Failed to fetch your test results: ${error.message}`);
    }

    return (data || []) as SkillTestResult[];
}

/**
 * Get a specific skill test result
 */
export async function getSkillTestResult(resultId: string): Promise<SkillTestResult | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to view test results');
    }

    const { data, error } = await supabase
        .from('skill_test_results')
        .select('*')
        .eq('id', resultId)
        .eq('job_seeker_id', user.id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found
        }
        console.error('Error fetching skill test result:', error);
        throw new Error(`Failed to fetch test result: ${error.message}`);
    }

    return data as SkillTestResult;
}

/**
 * Check if user has passed a specific skill test
 */
export async function hasPassedSkillTest(testId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return false;
    }

    const { data, error } = await supabase
        .from('skill_test_results')
        .select('passed')
        .eq('job_seeker_id', user.id)
        .eq('skill_test_id', testId)
        .eq('passed', true)
        .limit(1);

    if (error) {
        console.error('Error checking skill test status:', error);
        return false;
    }

    return (data && data.length > 0) || false;
}

/**
 * Get skill test results for a specific application (employer view)
 */
export async function getApplicationSkillTestResult(applicationId: string): Promise<SkillTestResult | null> {
    const { data, error } = await supabase
        .from('skill_test_results')
        .select('*')
        .eq('application_id', applicationId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found
        }
        console.error('Error fetching application skill test result:', error);
        throw new Error(`Failed to fetch test result: ${error.message}`);
    }

    return data as SkillTestResult;
}
