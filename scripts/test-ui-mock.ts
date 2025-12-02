/**
 * Test UI Mock Generation
 * 
 * Tests the /api/ideas/[id]/ui-mock endpoint to generate a UI mockup
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

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

async function testUIMock() {
  console.log('🧪 Testing UI Mock Generation...\n');

  try {
    // 1. Get a valid idea from the database
    console.log('📋 Step 1: Fetching a test idea...');
    const { data: ideas, error: fetchError } = await supabase
      .from('marrai_ideas')
      .select('id, title, problem_statement, proposed_solution, category')
      .eq('visible', true)
      .limit(1)
      .single();

    if (fetchError || !ideas) {
      // Try without single() to get array
      const { data: ideasArray, error: arrayError } = await supabase
        .from('marrai_ideas')
        .select('id, title, problem_statement, proposed_solution, category')
        .eq('visible', true)
        .limit(1);

      if (arrayError || !ideasArray || ideasArray.length === 0) {
        console.error('❌ No ideas found in database:', arrayError?.message || 'No data');
        process.exit(1);
      }

      const idea = ideasArray[0];
      console.log(`✅ Found idea: "${(idea as any).title}"`);
      console.log(`   ID: ${(idea as any).id}\n`);

      // 2. Test the UI mock API endpoint
      console.log('🎨 Step 2: Generating UI mockup...');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const ideaId = (idea as any).id;

      const response = await fetch(`${baseUrl}/api/ideas/${ideaId}/ui-mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale: 'fr' }),
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        process.exit(1);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        process.exit(1);
      }

      const data = await response.json();
      console.log('✅ UI Mock generated successfully!\n');

      // 3. Display the mockup structure
      console.log('📱 UI Mock Structure:');
      console.log('━'.repeat(60));
      if (data.uiMock?.layout) {
        const layout = data.uiMock.layout;
        console.log(`\n📺 Screen Title: ${layout.screen_title || 'N/A'}`);
        if (layout.description) {
          console.log(`📝 Description: ${layout.description}`);
        }
        console.log(`\n📦 Sections (${layout.sections?.length || 0}):`);
        
        if (layout.sections && Array.isArray(layout.sections)) {
          layout.sections.forEach((section: any, index: number) => {
            console.log(`\n   ${index + 1}. ${section.title || 'Untitled Section'}`);
            if (section.description) {
              console.log(`      ${section.description}`);
            }
            if (section.suggested_components && section.suggested_components.length > 0) {
              console.log(`      Components: ${section.suggested_components.join(', ')}`);
            }
            if (section.cta_buttons && section.cta_buttons.length > 0) {
              console.log(`      CTAs:`);
              section.cta_buttons.forEach((btn: any) => {
                console.log(`         - "${btn.label}" ${btn.action_hint ? `(${btn.action_hint})` : ''}`);
              });
            }
          });
        }
      } else {
        console.log('⚠️  No layout found in response');
        console.log('Response:', JSON.stringify(data, null, 2));
      }

      console.log('\n' + '━'.repeat(60));
      console.log('\n✅ Test completed successfully!');
      console.log(`\n💡 To view this in the UI, visit: ${baseUrl}/ideas/${ideaId}`);

    } else {
      const idea = ideas;
      console.log(`✅ Found idea: "${(idea as any).title}"`);
      console.log(`   ID: ${(idea as any).id}\n`);

      // 2. Test the UI mock API endpoint
      console.log('🎨 Step 2: Generating UI mockup...');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const ideaId = (idea as any).id;

      const response = await fetch(`${baseUrl}/api/ideas/${ideaId}/ui-mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale: 'fr' }),
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        process.exit(1);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        process.exit(1);
      }

      const data = await response.json();
      console.log('✅ UI Mock generated successfully!\n');

      // 3. Display the mockup structure
      console.log('📱 UI Mock Structure:');
      console.log('━'.repeat(60));
      if (data.uiMock?.layout) {
        const layout = data.uiMock.layout;
        console.log(`\n📺 Screen Title: ${layout.screen_title || 'N/A'}`);
        if (layout.description) {
          console.log(`📝 Description: ${layout.description}`);
        }
        console.log(`\n📦 Sections (${layout.sections?.length || 0}):`);
        
        if (layout.sections && Array.isArray(layout.sections)) {
          layout.sections.forEach((section: any, index: number) => {
            console.log(`\n   ${index + 1}. ${section.title || 'Untitled Section'}`);
            if (section.description) {
              console.log(`      ${section.description}`);
            }
            if (section.suggested_components && section.suggested_components.length > 0) {
              console.log(`      Components: ${section.suggested_components.join(', ')}`);
            }
            if (section.cta_buttons && section.cta_buttons.length > 0) {
              console.log(`      CTAs:`);
              section.cta_buttons.forEach((btn: any) => {
                console.log(`         - "${btn.label}" ${btn.action_hint ? `(${btn.action_hint})` : ''}`);
              });
            }
          });
        }
      } else {
        console.log('⚠️  No layout found in response');
        console.log('Response:', JSON.stringify(data, null, 2));
      }

      console.log('\n' + '━'.repeat(60));
      console.log('\n✅ Test completed successfully!');
      console.log(`\n💡 To view this in the UI, visit: ${baseUrl}/ideas/${ideaId}`);
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testUIMock();

