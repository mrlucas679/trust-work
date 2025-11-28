import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deduplicateQuestions() {
  console.log('🔍 Finding templates with excess questions...\n');

  const { data: templates } = await supabase
    .from('skill_test_templates')
    .select('id, name, category')
    .order('name');

  if (!templates) {
    console.error('Failed to fetch templates');
    return;
  }

  let totalDeleted = 0;

  for (const template of templates) {
    const { data: questions, count } = await supabase
      .from('skill_test_questions')
      .select('*', { count: 'exact' })
      .eq('template_id', template.id)
      .order('created_at');

    if (!count || count <= 50) continue;

    const excess = count - 50;
    console.log(`\n📦 ${template.name}: ${count} questions (${excess} excess)`);

    // Keep first 50 questions (oldest), delete the rest
    const questionsToDelete = questions!.slice(50);
    
    console.log(`   🗑️  Deleting ${questionsToDelete.length} excess questions...`);

    const { error } = await supabase
      .from('skill_test_questions')
      .delete()
      .in('id', questionsToDelete.map(q => q.id));

    if (error) {
      console.error(`   ❌ Error:`, error.message);
    } else {
      console.log(`   ✅ Deleted successfully`);
      totalDeleted += questionsToDelete.length;
    }
  }

  console.log(`\n\n✨ Cleanup complete!`);
  console.log(`   Deleted ${totalDeleted} excess questions\n`);

  // Verify final state
  const { count: finalCount } = await supabase
    .from('skill_test_questions')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Final question count: ${finalCount}`);
}

deduplicateQuestions().catch(console.error);
