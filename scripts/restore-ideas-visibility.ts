/**
 * Restore Ideas Visibility
 * 
 * Sets all ideas to visible=true if they were accidentally hidden
 * USE WITH CAUTION - Only run if you're sure ideas should be visible
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreVisibility() {
  console.log('🔍 Checking ideas visibility...\n');

  try {
    // Count hidden ideas
    const { count: hiddenCount } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .eq('visible', false);

    const { count: totalCount } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total ideas: ${totalCount}`);
    console.log(`👁️  Hidden ideas: ${hiddenCount || 0}\n`);

    if ((hiddenCount || 0) === 0) {
      console.log('✅ All ideas are already visible!');
      return;
    }

    // Ask for confirmation (in a real script, you'd use readline)
    console.log('⚠️  WARNING: This will set ALL ideas to visible=true');
    console.log('   This script should only be run if ideas were accidentally hidden.\n');
    
    // For safety, we'll only show what would happen
    // Uncomment the update section if you're sure
    console.log('📝 To restore visibility, uncomment the update section in this script.\n');

    // UNCOMMENT THIS SECTION TO ACTUALLY UPDATE:
    /*
    const { error: updateError } = await supabase
      .from('marrai_ideas')
      .update({ visible: true })
      .eq('visible', false);

    if (updateError) {
      console.error('❌ Error updating visibility:', updateError);
      return;
    }

    console.log(`✅ Successfully set ${hiddenCount} ideas to visible=true`);
    */

    // Show sample of hidden ideas
    const { data: hiddenIdeas } = await supabase
      .from('marrai_ideas')
      .select('id, title, created_at')
      .eq('visible', false)
      .limit(10);

    if (hiddenIdeas && hiddenIdeas.length > 0) {
      console.log('📋 Sample of hidden ideas:');
      hiddenIdeas.forEach((idea: any, idx: number) => {
        console.log(`  ${idx + 1}. ${idea.title || '(no title)'} (${idea.id})`);
      });
    }

  } catch (error: any) {
    console.error('❌ Error:', error);
  }
}

restoreVisibility()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

