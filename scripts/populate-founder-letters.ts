/**
 * Script: Populate Founder Letters
 * 
 * Generates AI-powered founder letters for existing founders
 * These letters build trust, authenticity, competence, and consistency
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Founder {
  name: string;
  email?: string;
  city?: string;
  ideaCount: number;
  ideas: Array<{
    title: string;
    problem_statement: string;
    category: string;
  }>;
}

async function generateFounderLetter(founder: Founder): Promise<string> {
  const ideasSummary = founder.ideas
    .slice(0, 3)
    .map((idea, i) => `${i + 1}. ${idea.title} (${idea.category})`)
    .join('\n');

  const prompt = `Tu es un expert en rédaction de lettres de présentation pour entrepreneurs marocains. 

Génère une lettre de présentation authentique et convaincante pour un fondateur qui:
- Nom: ${founder.name}
- Ville: ${founder.city || 'Non spécifiée'}
- Nombre d'idées: ${founder.ideaCount}
- Idées principales:
${ideasSummary}

La lettre doit:
1. Construire la CONFIANCE (montrer l'engagement, la transparence)
2. Montrer l'AUTHENTICITÉ (parcours personnel, motivations réelles)
3. Démontrer la COMPÉTENCE (expérience, vision, capacité d'exécution)
4. Assurer la COHÉRENCE (alignement entre les idées et la vision globale)

Style: Professionnel mais chaleureux, en français, 200-300 mots maximum.
Tone: Passionné mais réaliste, ambitieux mais humble.

Génère UNIQUEMENT le texte de la lettre, sans introduction ni conclusion formelle.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }
    throw new Error('Unexpected response format');
  } catch (error) {
    console.error(`Error generating letter for ${founder.name}:`, error);
    // Fallback letter
    return `Bonjour,

Je suis ${founder.name}${founder.city ? `, basé(e) à ${founder.city}` : ''}. 

J'ai ${founder.ideaCount} ${founder.ideaCount === 1 ? 'idée' : 'idées'} que je développe avec passion et détermination. Mon objectif est de créer des solutions qui ont un impact réel sur la vie des Marocains.

Je cherche des mentors et investisseurs qui partagent ma vision et peuvent m'aider à transformer ces idées en entreprises durables.

Merci de votre intérêt.

${founder.name}`;
  }
}

async function populateFounderLetters() {
  console.log('🚀 Starting founder letter population...\n');

  // Get all founders
  const foundersMap = new Map<string, Founder>();

  // Get from ideas (submitters)
  const { data: ideas } = await supabase
    .from('marrai_ideas')
    .select('submitter_name, submitter_email, location, title, problem_statement, category')
    .is('deleted_at', null)
    .not('submitter_name', 'is', null);

  if (ideas) {
    for (const idea of ideas) {
      if (!idea.submitter_name) continue;
      const identifier = idea.submitter_email || idea.submitter_name;
      const existing = foundersMap.get(identifier);

      if (existing) {
        existing.ideaCount += 1;
        existing.ideas.push({
          title: idea.title,
          problem_statement: idea.problem_statement,
          category: idea.category || 'other',
        });
      } else {
        foundersMap.set(identifier, {
          name: idea.submitter_name,
          email: idea.submitter_email || undefined,
          city: idea.location || undefined,
          ideaCount: 1,
          ideas: [{
            title: idea.title,
            problem_statement: idea.problem_statement,
            category: idea.category || 'other',
          }],
        });
      }
    }
  }

  // Get from claims
  const { data: claims } = await supabase
    .from('marrai_idea_claims')
    .select('claimer_name, claimer_email, claimer_city, idea_id')
    .is('deleted_at', null);

  if (claims) {
    for (const claim of claims) {
      if (!claim.claimer_name) continue;
      const identifier = claim.claimer_email || claim.claimer_name;
      const existing = foundersMap.get(identifier);

      if (existing) {
        existing.ideaCount += 1;
      } else {
        // Get idea details
        const { data: idea } = await supabase
          .from('marrai_ideas')
          .select('title, problem_statement, category')
          .eq('id', claim.idea_id)
          .single();

        foundersMap.set(identifier, {
          name: claim.claimer_name,
          email: claim.claimer_email || undefined,
          city: claim.claimer_city || undefined,
          ideaCount: 1,
          ideas: idea ? [{
            title: idea.title,
            problem_statement: idea.problem_statement,
            category: idea.category || 'other',
          }] : [],
        });
      }
    }
  }

  const founders = Array.from(foundersMap.values());
  console.log(`📊 Found ${founders.length} founders\n`);

  // Generate and save letters
  let successCount = 0;
  let skipCount = 0;

  for (const founder of founders) {
    try {
      // Check if letter already exists
      const { data: existing } = await supabase
        .from('marrai_founder_profiles')
        .select('founder_letter')
        .eq(founder.email ? 'founder_email' : 'founder_name', founder.email || founder.name)
        .single();

      if (existing?.founder_letter) {
        console.log(`⏭️  Skipping ${founder.name} (letter already exists)`);
        skipCount++;
        continue;
      }

      console.log(`📝 Generating letter for ${founder.name}...`);
      const letter = await generateFounderLetter(founder);

      // Upsert founder profile
      const { error } = await supabase
        .from('marrai_founder_profiles')
        .upsert({
          founder_name: founder.name,
          founder_email: founder.email || null,
          founder_city: founder.city || null,
          founder_letter: letter,
          total_ideas: founder.ideaCount,
        } as any, {
          onConflict: founder.email ? 'founder_email' : 'founder_name',
        });

      if (error) {
        console.error(`❌ Error saving letter for ${founder.name}:`, error);
      } else {
        console.log(`✅ Letter saved for ${founder.name}`);
        successCount++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error processing ${founder.name}:`, error);
    }
  }

  console.log(`\n✅ Complete!`);
  console.log(`   Generated: ${successCount}`);
  console.log(`   Skipped: ${skipCount}`);
  console.log(`   Total: ${founders.length}`);
}

populateFounderLetters().catch(console.error);

