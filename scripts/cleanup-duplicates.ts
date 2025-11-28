import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanupDuplicates() {
  console.log('🔍 Finding duplicate templates...\n');

  // Get all templates
  const { data: templates, error } = await supabase
    .from('skill_test_templates')
    .select('id, name, category')
    .order('name');

  if (error || !templates) {
    console.error('Failed to fetch templates:', error);
    return;
  }

  // Group templates by name
  const templateGroups = new Map<string, typeof templates>();
  
  for (const template of templates) {
    const key = `${template.name}|${template.category}`;
    if (!templateGroups.has(key)) {
      templateGroups.set(key, []);
    }
    templateGroups.get(key)!.push(template);
  }

  console.log(`Found ${templateGroups.size} unique templates`);
  console.log(`Total templates in DB: ${templates.length}\n`);

  // For each group, keep the first one and delete the rest
  for (const [key, group] of templateGroups) {
    if (group.length === 1) continue;

    const [name, category] = key.split('|');
    console.log(`\n📦 Processing: ${name} (${category})`);
    console.log(`   Found ${group.length} duplicates`);

    // Keep the first template
    const keepTemplate = group[0];
    const deleteTemplates = group.slice(1);

    console.log(`   ✅ Keeping template: ${keepTemplate.id}`);

    // Get questions for templates to delete
    for (const template of deleteTemplates) {
      const { data: questions } = await supabase
        .from('skill_test_questions')
        .select('id')
        .eq('template_id', template.id);

      if (questions && questions.length > 0) {
        console.log(`   📝 Migrating ${questions.length} questions from ${template.id}`);
        
        // Update questions to point to the kept template
        const { error: updateError } = await supabase
          .from('skill_test_questions')
          .update({ template_id: keepTemplate.id })
          .eq('template_id', template.id);

        if (updateError) {
          console.error(`   ❌ Error migrating questions:`, updateError.message);
        } else {
          console.log(`   ✅ Migrated successfully`);
        }
      }

      // Delete the duplicate template
      console.log(`   🗑️  Deleting template: ${template.id}`);
      const { error: deleteError } = await supabase
        .from('skill_test_templates')
        .delete()
        .eq('id', template.id);

      if (deleteError) {
        console.error(`   ❌ Error deleting template:`, deleteError.message);
      } else {
        console.log(`   ✅ Deleted successfully`);
      }
    }
  }

  console.log('\n\n✨ Cleanup complete! Running verification...\n');

  // Verify final state
  const { count: finalCount } = await supabase
    .from('skill_test_templates')
    .select('*', { count: 'exact', head: true });

  const { count: questionCount } = await supabase
    .from('skill_test_questions')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Final state:`);
  console.log(`   Templates: ${finalCount}`);
  console.log(`   Questions: ${questionCount}`);
}

cleanupDuplicates().catch(console.error);
