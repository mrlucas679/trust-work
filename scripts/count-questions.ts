import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS and read all questions
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

async function countQuestions() {
  // Get total count
  const { count: totalCount } = await supabase
    .from('skill_test_questions')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total questions generated: ${totalCount}/1,250\n`);

  // Get count per template
  const { data: templates } = await supabase
    .from('skill_test_templates')
    .select('id, name, category');

  if (!templates) {
    console.error('Failed to fetch templates');
    return;
  }

  console.log('📋 Questions per template:\n');

  let completeCount = 0;
  for (const template of templates) {
    const { count } = await supabase
      .from('skill_test_questions')
      .select('*', { count: 'exact', head: true })
      .eq('template_id', template.id);

    const status = count === 50 ? '✅' : count && count > 0 ? '⏳' : '❌';
    console.log(`${status} ${template.name} (${template.category}): ${count || 0}/50`);
    
    if (count === 50) completeCount++;
  }

  console.log(`\n📈 Progress: ${Math.round((totalCount || 0) / 1250 * 100)}% complete`);
  console.log(`✅ Complete templates: ${completeCount}/25`);
}

countQuestions().catch(console.error);
