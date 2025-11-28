/**
 * Skill Tests API
 * 
 * Backend service layer for skill test operations
 * Handles template fetching, test lifecycle, and attempt management
 */

import { supabase } from '@/lib/supabaseClient';
import type {
  SkillTestTemplate,
  SkillTestQuestion,
  SkillTestAttempt,
  StartSkillTestRequest,
  StartSkillTestResponse,
  SubmitSkillTestRequest,
  SubmitSkillTestResponse,
  SkillTestReviewResponse,
  CanAttemptTestResponse,
  SkillTestAttemptWithApplicant,
  SkillTestCategory,
  SkillTestDifficulty
} from '@/types/skill-tests';
import { DIFFICULTY_CONFIG, TEST_TIME_LIMIT_MINUTES } from '@/types/skill-tests';

// ============================================================
// TEMPLATES
// ============================================================

/**
 * Get all active skill test templates
 * @param category - Optional filter by category
 */
export async function getSkillTestTemplates(
  category?: SkillTestCategory
): Promise<SkillTestTemplate[]> {
  let query = supabase
    .from('skill_test_templates')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching skill test templates:', error);
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }

  return data.map(template => ({
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description,
    icon: template.icon,
    totalQuestions: template.total_questions,
    isActive: template.is_active,
    createdAt: template.created_at,
    updatedAt: template.updated_at
  }));
}

/**
 * Get a single template by ID
 */
export async function getSkillTestTemplate(
  templateId: string
): Promise<SkillTestTemplate> {
  const { data, error } = await supabase
    .from('skill_test_templates')
    .select('*')
    .eq('id', templateId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching skill test template:', error);
    throw new Error(`Failed to fetch template: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    description: data.description,
    icon: data.icon,
    totalQuestions: data.total_questions,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

// ============================================================
// TEST ELIGIBILITY
// ============================================================

/**
 * Check if user can attempt a skill test (7-day cooldown)
 */
export async function canAttemptSkillTest(
  gigId?: string,
  jobId?: string
): Promise<CanAttemptTestResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (!gigId && !jobId) {
    throw new Error('Either gigId or jobId must be provided');
  }

  // Call database function
  const { data, error } = await supabase
    .rpc('can_attempt_skill_test', {
      p_applicant_id: user.id,
      p_gig_id: gigId || null,
      p_job_id: jobId || null
    });

  if (error) {
    console.error('Error checking test eligibility:', error);
    throw new Error(`Failed to check eligibility: ${error.message}`);
  }

  const canAttempt = data as boolean;

  if (!canAttempt) {
    // Fetch last attempt details
    let query = supabase
      .from('skill_test_attempts')
      .select('score, passed, created_at')
      .eq('applicant_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (gigId) {
      query = query.eq('gig_id', gigId);
    } else if (jobId) {
      query = query.eq('job_id', jobId);
    }

    const { data: lastAttempt } = await query.single();

    if (lastAttempt) {
      const nextAttemptDate = new Date(lastAttempt.created_at);
      nextAttemptDate.setDate(nextAttemptDate.getDate() + 7);

      return {
        canAttempt: false,
        reason: 'You must wait 7 days between test attempts for the same job/gig',
        nextAttemptDate: nextAttemptDate.toISOString(),
        lastAttempt: {
          score: lastAttempt.score,
          passed: lastAttempt.passed,
          attemptedAt: lastAttempt.created_at
        }
      };
    }
  }

  return { canAttempt: true };
}

// ============================================================
// TEST LIFECYCLE
// ============================================================

/**
 * Start a new skill test attempt
 */
export async function startSkillTest(
  request: StartSkillTestRequest
): Promise<StartSkillTestResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check eligibility first
  const eligibility = await canAttemptSkillTest(request.gigId, request.jobId);
  if (!eligibility.canAttempt) {
    throw new Error(eligibility.reason || 'Cannot attempt test at this time');
  }

  // Get question count for difficulty
  const questionCount = DIFFICULTY_CONFIG[request.difficulty].questionCount;

  // Fetch random questions using database function
  const { data: questions, error: questionsError } = await supabase
    .rpc('get_random_test_questions', {
      p_template_id: request.templateId,
      p_difficulty: request.difficulty,
      p_count: questionCount
    });

  if (questionsError || !questions || questions.length === 0) {
    console.error('Error fetching test questions:', questionsError);
    throw new Error('Failed to fetch test questions');
  }

  // Create attempt record
  const { data: attempt, error: attemptError } = await supabase
    .from('skill_test_attempts')
    .insert({
      applicant_id: user.id,
      template_id: request.templateId,
      gig_id: request.gigId || null,
      job_id: request.jobId || null,
      difficulty: request.difficulty,
      questions_data: questions,
      answers_data: [],
      score: 0,
      passed: false,
      passing_score: 70,
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (attemptError || !attempt) {
    console.error('Error creating test attempt:', attemptError);
    throw new Error('Failed to start test');
  }

  return {
    attemptId: attempt.id,
    questions: questions.map((q) => ({
      id: q.id,
      templateId: q.template_id,
      difficulty: q.difficulty,
      questionText: q.question_text,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      createdAt: q.created_at,
      updatedAt: q.updated_at
    })),
    timeLimit: TEST_TIME_LIMIT_MINUTES * 60, // Convert to seconds
    passingScore: 70,
    startedAt: attempt.started_at
  };
}

/**
 * Submit skill test answers and calculate score
 */
export async function submitSkillTest(
  request: SubmitSkillTestRequest
): Promise<SubmitSkillTestResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Fetch attempt to get questions
  const { data: attempt, error: fetchError } = await supabase
    .from('skill_test_attempts')
    .select('*')
    .eq('id', request.attemptId)
    .eq('applicant_id', user.id)
    .eq('status', 'in_progress')
    .single();

  if (fetchError || !attempt) {
    console.error('Error fetching attempt:', fetchError);
    throw new Error('Test attempt not found or already completed');
  }

  const questions = attempt.questions_data as SkillTestQuestion[];
  const passingScore = attempt.passing_score;

  // Check for cheating (tab switches)
  const status = request.tabSwitches > 0 ? 'failed_cheat' : 'completed';
  const passed = status === 'completed'; // Will be updated after scoring

  // Calculate score
  let correctAnswers = 0;
  const answersData = request.answers.map(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    const isCorrect = question && question.correct_answer === answer.selectedAnswer;
    
    if (isCorrect) {
      correctAnswers++;
    }

    return {
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
      isCorrect,
      pointsEarned: isCorrect ? 1 : 0
    };
  });

  const score = Math.round((correctAnswers / questions.length) * 100);
  const finalPassed = status === 'completed' && score >= passingScore;

  // Update attempt record
  const { error: updateError } = await supabase
    .from('skill_test_attempts')
    .update({
      answers_data: answersData,
      score,
      passed: finalPassed,
      time_taken_seconds: request.timeTakenSeconds,
      tab_switches: request.tabSwitches,
      status,
      completed_at: new Date().toISOString()
    })
    .eq('id', request.attemptId);

  if (updateError) {
    console.error('Error updating test attempt:', updateError);
    throw new Error('Failed to submit test');
  }

  return {
    attemptId: request.attemptId,
    score,
    passed: finalPassed,
    correctAnswers,
    totalQuestions: questions.length,
    passingScore,
    timeTakenSeconds: request.timeTakenSeconds
  };
}

/**
 * Get test review (questions + user answers + explanations)
 */
export async function getSkillTestReview(
  attemptId: string
): Promise<SkillTestReviewResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: attempt, error } = await supabase
    .from('skill_test_attempts')
    .select('*, skill_test_templates(*)')
    .eq('id', attemptId)
    .eq('applicant_id', user.id)
    .single();

  if (error || !attempt) {
    console.error('Error fetching test review:', error);
    throw new Error('Test attempt not found');
  }

  const questions = attempt.questions_data as SkillTestQuestion[];
  const answers = attempt.answers_data as { questionId: string; selectedAnswer: string; isCorrect: boolean }[];

  return {
    attempt: {
      id: attempt.id,
      applicantId: attempt.applicant_id,
      templateId: attempt.template_id,
      template: attempt.skill_test_templates ? {
        id: attempt.skill_test_templates.id,
        name: attempt.skill_test_templates.name,
        category: attempt.skill_test_templates.category,
        description: attempt.skill_test_templates.description,
        icon: attempt.skill_test_templates.icon,
        totalQuestions: attempt.skill_test_templates.total_questions,
        isActive: attempt.skill_test_templates.is_active,
        createdAt: attempt.skill_test_templates.created_at,
        updatedAt: attempt.skill_test_templates.updated_at
      } : undefined,
      gigId: attempt.gig_id,
      jobId: attempt.job_id,
      difficulty: attempt.difficulty,
      questionsData: questions.map((q) => ({
        id: q.id,
        templateId: q.template_id,
        difficulty: q.difficulty,
        questionText: q.question_text,
        optionA: q.option_a,
        optionB: q.option_b,
        optionC: q.option_c,
        optionD: q.option_d,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        createdAt: q.created_at,
        updatedAt: q.updated_at
      })),
      answersData: answers,
      score: attempt.score,
      passed: attempt.passed,
      passingScore: attempt.passing_score,
      timeTakenSeconds: attempt.time_taken_seconds,
      tabSwitches: attempt.tab_switches,
      status: attempt.status,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at,
      createdAt: attempt.created_at
    },
    questions: questions.map((q) => {
      const userAnswer = answers.find((a) => a.questionId === q.id);
      return {
        question: {
          id: q.id,
          templateId: q.template_id,
          difficulty: q.difficulty,
          questionText: q.question_text,
          optionA: q.option_a,
          optionB: q.option_b,
          optionC: q.option_c,
          optionD: q.option_d,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          createdAt: q.created_at,
          updatedAt: q.updated_at
        },
        userAnswer: userAnswer?.selectedAnswer || 'A',
        isCorrect: userAnswer?.isCorrect || false
      };
    })
  };
}

// ============================================================
// EMPLOYER VIEWS
// ============================================================

/**
 * Get all test attempts for a specific gig (employer view)
 */
export async function getGigSkillTestAttempts(
  gigId: string
): Promise<SkillTestAttemptWithApplicant[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('skill_test_attempts')
    .select(`
      *,
      skill_test_templates(*),
      profiles:applicant_id(id, display_name)
    `)
    .eq('gig_id', gigId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gig test attempts:', error);
    throw new Error('Failed to fetch test attempts');
  }

  return data.map((attempt) => ({
    id: attempt.id,
    applicantId: attempt.applicant_id,
    templateId: attempt.template_id,
    template: attempt.skill_test_templates ? {
      id: attempt.skill_test_templates.id,
      name: attempt.skill_test_templates.name,
      category: attempt.skill_test_templates.category,
      description: attempt.skill_test_templates.description,
      icon: attempt.skill_test_templates.icon,
      totalQuestions: attempt.skill_test_templates.total_questions,
      isActive: attempt.skill_test_templates.is_active,
      createdAt: attempt.skill_test_templates.created_at,
      updatedAt: attempt.skill_test_templates.updated_at
    } : undefined,
    gigId: attempt.gig_id,
    jobId: attempt.job_id,
    difficulty: attempt.difficulty,
    questionsData: attempt.questions_data,
    answersData: attempt.answers_data,
    score: attempt.score,
    passed: attempt.passed,
    passingScore: attempt.passing_score,
    timeTakenSeconds: attempt.time_taken_seconds,
    tabSwitches: attempt.tab_switches,
    status: attempt.status,
    startedAt: attempt.started_at,
    completedAt: attempt.completed_at,
    createdAt: attempt.created_at,
    applicant: {
      id: attempt.profiles.id,
      displayName: attempt.profiles.display_name || 'Anonymous',
      avatarUrl: undefined
    }
  }));
}

/**
 * Get all test attempts for a specific job (employer view)
 */
export async function getJobSkillTestAttempts(
  jobId: string
): Promise<SkillTestAttemptWithApplicant[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('skill_test_attempts')
    .select(`
      *,
      skill_test_templates(*),
      profiles:applicant_id(id, display_name)
    `)
    .eq('job_id', jobId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching job test attempts:', error);
    throw new Error('Failed to fetch test attempts');
  }

  return data.map((attempt) => ({
    id: attempt.id,
    applicantId: attempt.applicant_id,
    templateId: attempt.template_id,
    template: attempt.skill_test_templates ? {
      id: attempt.skill_test_templates.id,
      name: attempt.skill_test_templates.name,
      category: attempt.skill_test_templates.category,
      description: attempt.skill_test_templates.description,
      icon: attempt.skill_test_templates.icon,
      totalQuestions: attempt.skill_test_templates.total_questions,
      isActive: attempt.skill_test_templates.is_active,
      createdAt: attempt.skill_test_templates.created_at,
      updatedAt: attempt.skill_test_templates.updated_at
    } : undefined,
    gigId: attempt.gig_id,
    jobId: attempt.job_id,
    difficulty: attempt.difficulty,
    questionsData: attempt.questions_data,
    answersData: attempt.answers_data,
    score: attempt.score,
    passed: attempt.passed,
    passingScore: attempt.passing_score,
    timeTakenSeconds: attempt.time_taken_seconds,
    tabSwitches: attempt.tab_switches,
    status: attempt.status,
    startedAt: attempt.started_at,
    completedAt: attempt.completed_at,
    createdAt: attempt.created_at,
    applicant: {
      id: attempt.profiles.id,
      displayName: attempt.profiles.display_name || 'Anonymous',
      avatarUrl: undefined
    }
  }));
}
