import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log('Testing service role key...\n');
  console.log('URL:', process.env.VITE_SUPABASE_URL);
  console.log('Key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length, 'chars\n');
  
  const { data, error, count } = await supabase
    .from('skill_test_templates')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  } else {
    console.log('✅ Success! Found', count, 'templates');
    console.log('First template:', data[0]?.name);
  }
}

test();
