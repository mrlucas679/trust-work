/**
 * Generate Skill Test Questions using AI
 * 
 * This script generates 50 questions per template (1,250 total questions)
 * using Google Gemini 1.5 Flash (FREE: 15 req/min, 1500 req/day)
 * 
 * Question Distribution per Template:
 * - 20 Entry Level (basic concepts, 0-1 years exp)
 * - 20 Mid Level (practical application, 2-4 years exp)  
 * - 10 Senior Level (advanced problem-solving, 5+ years exp)
 * 
 * Usage:
 * 1. Set GEMINI_API_KEY environment variable
 * 2. Deploy database migrations first (supabase/migrations/20251124_create_skill_tests.sql)
 * 3. Run: npx tsx scripts/generateSkillTestQuestions.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://sojjizqahgphybdijqaj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is required');
    console.log('\nGet a free API key from: https://aistudio.google.com/app/apikey');
    process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    console.log('\nGet your service role key from: https://app.supabase.com/project/sojjizqahgphybdijqaj/settings/api');
    console.log('⚠️  This script needs the service role key to bypass RLS and insert questions.');
    process.exit(1);
}

// Initialize Supabase client with SERVICE ROLE KEY (bypasses RLS for admin operations)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface Question {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
}

interface Template {
    id: string;
    name: string;
    category: string;
    description: string;
}

/**
 * Generate questions using Google Gemini 1.5 Flash
 */
async function generateQuestionsWithGemini(
    templateName: string,
    templateDescription: string,
    difficulty: 'entry' | 'mid' | 'senior',
    count: number
): Promise<Question[]> {
    const difficultyDescriptions = {
        entry: 'Entry Level (0-1 years experience): Basic concepts, terminology, and fundamental knowledge. Test understanding of core principles.',
        mid: 'Mid Level (2-4 years experience): Practical application, problem-solving, and best practices. Test real-world scenarios and implementation knowledge.',
        senior: 'Senior Level (5+ years experience): Advanced problem-solving, architecture decisions, optimization, and expert-level knowledge. Test deep understanding and leadership capabilities.'
    };

    const prompt = `Generate ${count} multiple-choice questions for a ${templateName} skill test at ${difficulty} level.

Template Description: ${templateDescription}

Level Requirements: ${difficultyDescriptions[difficulty]}

CRITICAL REQUIREMENTS:
1. Exactly 4 options (A, B, C, D) per question
2. Only ONE correct answer per question
3. Questions must test PRACTICAL job skills, not theory
4. Clear, unambiguous questions - no tricks
5. 2-sentence explanation for each correct answer
6. Professional tone, appropriate for hiring assessment

Return ONLY valid JSON array with NO markdown formatting, NO code blocks, NO extra text:
[
  {
    "questionText": "Question text here?",
    "optionA": "First option",
    "optionB": "Second option",
    "optionC": "Third option",
    "optionD": "Fourth option",
    "correctAnswer": "A",
    "explanation": "Two-sentence explanation of why this answer is correct."
  }
]`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ 
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates[0]?.content?.parts[0]?.text;
        
        if (!text) {
            throw new Error('No text response from Gemini');
        }

        // Clean response - remove markdown code blocks if present
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\n?/, '').replace(/\n?```$/, '');
        }

        const questions: Question[] = JSON.parse(cleanedText);

        // Validate and auto-correct questions
        if (!Array.isArray(questions)) {
            throw new Error(`Response is not an array`);
        }

        const validQuestions: Question[] = [];

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            
            // Check for required fields
            if (!q.questionText || !q.optionA || !q.optionB || !q.optionC || !q.optionD || 
                !q.correctAnswer || !q.explanation) {
                console.log(`   ⚠️  Skipping question ${i + 1}: missing required fields`);
                continue;
            }
            
            // Auto-correct common correctAnswer issues
            const upperAnswer = q.correctAnswer.toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(upperAnswer)) {
                q.correctAnswer = upperAnswer as 'A' | 'B' | 'C' | 'D';
                validQuestions.push(q);
            } else {
                // Try to map common mistakes
                const mapping: Record<string, 'A' | 'B' | 'C' | 'D'> = {
                    '1': 'A', 'ONE': 'A', 'FIRST': 'A',
                    '2': 'B', 'TWO': 'B', 'SECOND': 'B',
                    '3': 'C', 'THREE': 'C', 'THIRD': 'C',
                    '4': 'D', 'FOUR': 'D', 'FOURTH': 'D',
                    'U': 'D', // Common typo: U instead of D
                    'V': 'B', // Common typo: V instead of B
                };
                if (mapping[upperAnswer]) {
                    console.log(`   ⚠️  Auto-corrected question ${i + 1}: "${q.correctAnswer}" → "${mapping[upperAnswer]}"`);
                    q.correctAnswer = mapping[upperAnswer];
                    validQuestions.push(q);
                } else {
                    console.log(`   ⚠️  Skipping question ${i + 1}: invalid correctAnswer "${q.correctAnswer}"`);
                    continue;
                }
            }
        }

        if (validQuestions.length === 0) {
            throw new Error(`No valid questions generated`);
        }

        if (validQuestions.length < count) {
            console.log(`   ⚠️  Generated ${validQuestions.length}/${count} valid questions (some were invalid)`);
        }

        return validQuestions;
    } catch (error) {
        console.error(`Error generating questions:`, error);
        throw error;
    }
}

/**
 * Insert questions into database
 */
async function insertQuestions(templateId: string, difficulty: string, questions: Question[]): Promise<void> {
    const questionsData = questions.map(q => ({
        template_id: templateId,
        difficulty,
        question_text: q.questionText,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        correct_answer: q.correctAnswer,
        explanation: q.explanation
    }));

    const { error } = await supabase
        .from('skill_test_questions')
        .insert(questionsData);

    if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
    }
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main execution
 */
/**
 * Get templates with their current progress
 */
async function getTemplatesWithProgress() {
    console.log('📋 Fetching templates and their progress...');
    
    const { data: templates, error } = await supabase
        .from('skill_test_templates')
        .select('id, name, category, description')
        .eq('is_active', true)
        .order('category', { ascending: true });

    if (error || !templates) {
        throw new Error(`Failed to fetch templates: ${error?.message}`);
    }

    // Remove duplicates by name (keep first occurrence)
    const uniqueTemplates = templates.reduce((acc: Template[], template) => {
        if (!acc.find(t => t.name === template.name)) {
            acc.push(template);
        }
        return acc;
    }, []);

    console.log(`✅ Found ${uniqueTemplates.length} unique templates (${templates.length} total in DB)`);
    
    // Get progress for each template
    const templatesWithProgress = await Promise.all(
        uniqueTemplates.map(async (template) => {
            const { count } = await supabase
                .from('skill_test_questions')
                .select('*', { count: 'exact', head: true })
                .eq('template_id', template.id);

            return {
                ...template,
                existingQuestions: count || 0,
                isComplete: (count || 0) >= 50
            };
        })
    );

    // Filter out completed templates
    const incompleteTemplates = templatesWithProgress.filter(t => !t.isComplete);
    
    console.log(`\n📊 Progress Summary:`);
    console.log(`   Complete: ${templatesWithProgress.length - incompleteTemplates.length}/${uniqueTemplates.length}`);
    console.log(`   Remaining: ${incompleteTemplates.length}\n`);

    return incompleteTemplates;
}

/**
 * Get existing question counts by difficulty for a template
 */
async function getExistingQuestionsByDifficulty(templateId: string) {
    const { data, error } = await supabase
        .from('skill_test_questions')
        .select('difficulty')
        .eq('template_id', templateId);

    if (error) throw error;

    const counts = {
        entry: data.filter(q => q.difficulty === 'entry').length,
        mid: data.filter(q => q.difficulty === 'mid').length,
        senior: data.filter(q => q.difficulty === 'senior').length
    };

    return counts;
}

async function main() {
    console.log('🚀 Starting Skill Test Question Generation\n');
    console.log('Using Google Gemini 1.5 Flash (FREE tier)');
    console.log('Rate limit: 5 requests/minute (12 second delay)\n');

    const templates = await getTemplatesWithProgress();

    if (templates.length === 0) {
        console.log('✅ All templates are complete!');
        return;
    }

    console.log(`🎯 Processing ${templates.length} incomplete templates...\n`);

    let totalGenerated = 0;
    let totalErrors = 0;
    const startTime = Date.now();

    // Process each template
    for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        console.log(`\n[${ i + 1}/${templates.length}] Processing: ${template.name}`);
        console.log(`   Category: ${template.category}`);
        console.log(`   Existing: ${(template as any).existingQuestions}/50 questions`);

        // Get existing counts by difficulty
        const existingCounts = await getExistingQuestionsByDifficulty(template.id);
        
        // Generate questions for each difficulty level
        const difficulties: Array<{ level: 'entry' | 'mid' | 'senior', target: number }> = [
            { level: 'entry', target: 20 },
            { level: 'mid', target: 20 },
            { level: 'senior', target: 10 }
        ];

        for (const { level, target } of difficulties) {
            const existing = existingCounts[level];
            const needed = target - existing;

            if (needed <= 0) {
                console.log(`   ✓ ${level} questions complete (${existing}/${target})`);
                continue;
            }

            console.log(`   → Generating ${needed} ${level} questions (${existing}/${target} exist)...`);
            
            try {
                const questions = await generateQuestionsWithGemini(
                    template.name,
                    template.description,
                    level,
                    needed
                );

                console.log(`   ✓ Generated ${questions.length} questions`);
                
                // Insert into database
                await insertQuestions(template.id, level, questions);
                console.log(`   ✓ Inserted into database`);
                
                totalGenerated += questions.length;

                // Rate limiting: 5 req/min = 12 seconds between requests
                console.log('   ⏳ Waiting 12 seconds (rate limit protection)...');
                await sleep(12000);

            } catch (error: any) {
                console.error(`   ❌ Error generating ${level} questions:`, error.message);
                totalErrors++;
                
                // If rate limited, wait even longer
                if (error.message && error.message.includes('429')) {
                    console.log('   ⏳ Rate limited - waiting 60 seconds before continuing...');
                    await sleep(60000);
                } else {
                    await sleep(12000);
                }
            }
        }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    console.log('\n' + '='.repeat(60));
    console.log('📊 Generation Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully generated: ${totalGenerated} questions`);
    console.log(`❌ Failed attempts: ${totalErrors}`);
    console.log(`⏱️  Time taken: ${minutes}m ${seconds}s`);
    console.log('='.repeat(60));

    if (totalErrors > 0) {
        console.log('\n💡 To resume incomplete templates, run this script again.');
        console.log('   The script will automatically skip completed questions.\n');
    } else {
        console.log('\n🎉 All questions generated successfully!');
        console.log('💡 To check for any remaining templates, run this script again.\n');
    }
}

// Run the script
main().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
