/**
 * Generate 200-300 GenZ-Focused PUBLIC Ideas for Fikra Valley
 * 
 * Uses Claude API to generate complete, validated ideas that would interest GenZ
 * Focus: Sustainability, Climate, Social Impact, Tech, Innovation
 * 
 * These ideas are PUBLIC (visible=true) and meant to be shared and picked up by GenZ entrepreneurs.
 * User-submitted ideas remain private by default for privacy protection.
 */

// Load environment variables FIRST
import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// Try to load .env.local first, then .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Database } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Multiple API providers
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;

// Progress file to resume generation
const PROGRESS_FILE = 'scripts/genz-ideas-progress.json';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.error('\nPlease check your .env.local file.');
  process.exit(1);
}

// Check which providers are available
const availableProviders: string[] = [];
if (anthropicApiKey) availableProviders.push('anthropic');
if (openaiApiKey) availableProviders.push('openai');
if (geminiApiKey) availableProviders.push('gemini');
if (openRouterApiKey) availableProviders.push('openrouter');

if (availableProviders.length === 0) {
  console.error('❌ No API providers configured. Please set at least one:');
  console.error('   ANTHROPIC_API_KEY');
  console.error('   OPENAI_API_KEY');
  console.error('   GEMINI_API_KEY');
  console.error('   OPENROUTER_API_KEY');
  process.exit(1);
}

console.log(`✅ Available providers: ${availableProviders.join(', ')}`);

// Initialize clients
const anthropic = anthropicApiKey ? new Anthropic({ apiKey: anthropicApiKey }) : null;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
const gemini = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const openrouter = openRouterApiKey ? new OpenAI({ 
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: openRouterApiKey,
  defaultHeaders: {
    'HTTP-Referer': 'https://fikravalley.com',
    'X-Title': 'Fikra Valley GenZ Ideas Generator',
  },
}) : null;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface GenZIdea {
  title: string;
  problem_statement: string;
  proposed_solution: string;
  category: 'tech' | 'health' | 'education' | 'agriculture' | 'finance' | 'infrastructure' | 'inclusion' | 'media' | 'e-commerce' | 'other';
  location: 'casablanca' | 'rabat' | 'marrakech' | 'kenitra' | 'tangier' | 'agadir' | 'fes' | 'meknes' | 'oujda' | 'other';
  current_manual_process?: string;
  digitization_opportunity?: string;
  frequency?: 'multiple_daily' | 'daily' | 'weekly' | 'monthly' | 'occasional';
  data_sources?: string[];
  integration_points?: string[];
  ai_capabilities_needed?: string[];
  automation_potential?: 'high' | 'medium' | 'low';
  agent_type?: 'workflow_agent' | 'data_agent' | 'decision_agent' | 'interface_agent' | 'hybrid_agent';
  human_in_loop?: boolean;
  estimated_cost?: '<1K' | '1K-3K' | '3K-5K' | '5K-10K' | '10K+' | 'unknown';
  submitter_name: string;
  submitter_email: string;
  submitter_type: 'student' | 'professional' | 'diaspora' | 'entrepreneur' | 'government' | 'researcher' | 'other';
  submitter_skills?: string[];
  submitted_via: 'web' | 'whatsapp' | 'workshop';
  status: 'submitted' | 'analyzing' | 'analyzed';
  visible: boolean; // Public ideas for GenZ to discover and pick up
}

/**
 * Load progress from file
 */
function loadProgress(): { generated: number; lastBatch: number } {
  if (existsSync(PROGRESS_FILE)) {
    try {
      const data = JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
      return { generated: data.generated || 0, lastBatch: data.lastBatch || 0 };
    } catch (e) {
      return { generated: 0, lastBatch: 0 };
    }
  }
  return { generated: 0, lastBatch: 0 };
}

/**
 * Save progress to file
 */
function saveProgress(generated: number, lastBatch: number) {
  writeFileSync(PROGRESS_FILE, JSON.stringify({ generated, lastBatch, timestamp: new Date().toISOString() }, null, 2));
}

/**
 * Generate GenZ-focused ideas using multiple providers with fallback
 */
async function generateGenZIdeas(batchSize: number = 20, provider?: string): Promise<GenZIdea[]> {
  const prompt = `Tu es un expert en innovation marocaine et en tendances GenZ. Génère ${batchSize} idées de startups qui intéresseraient particulièrement la génération Z au Maroc (18-28 ans).

CONTEXTE GENZ MAROCAIN:
- Préoccupations: Climat, durabilité, justice sociale, inclusion, réseaux sociaux, contenu créatif
- Intérêts: Tech, IA, impact social, entrepreneuriat, création de contenu, influence digitale
- Valeurs: Authenticité, transparence, impact mesurable, expression créative
- Problèmes: Chômage, accès à l'éducation, changement climatique, monétisation de contenu, visibilité digitale
- Activités: Création de contenu (TikTok, Instagram, YouTube), influence digitale, e-commerce social, streaming

EXIGENCES POUR CHAQUE IDÉE:
1. Titre (en français, accrocheur pour GenZ)
2. Problem Statement (problème réel vécu par GenZ au Maroc, avec contexte spécifique)
3. Proposed Solution (solution innovante avec IA/tech)
4. Category (tech, health, education, agriculture, finance, infrastructure, inclusion, media, e-commerce, other)
5. Location (ville marocaine spécifique ou 'other')
6. Current Manual Process (processus actuel manuel)
7. Digitization Opportunity (comment la tech/IA peut aider)
8. Frequency (multiple_daily, daily, weekly, monthly, occasional)
9. Data Sources (sources de données nécessaires)
10. Integration Points (APIs/services à intégrer)
11. AI Capabilities Needed (capacités IA requises)
12. Automation Potential (high, medium, low)
13. Agent Type (workflow_agent, data_agent, decision_agent, interface_agent, hybrid_agent)
14. Human In Loop (true/false)
15. Estimated Cost (<1K, 1K-3K, 3K-5K, 5K-10K, 10K+, unknown)
16. Submitter Skills (compétences nécessaires)

THÈMES PRIORITAIRES GENZ:
- 🌱 Climat & Durabilité (énergies renouvelables, recyclage, agriculture durable)
- 💚 Impact Social (inclusion, égalité, accès)
- 📱 Tech & Innovation (IA, apps, plateformes)
- 🎓 Éducation & Formation (accès, qualité, nouvelles compétences)
- 💰 Finance & Inclusion (fintech, microfinance, accès)
- 📸 Réseaux Sociaux & Création de Contenu (plateformes créatives, outils pour créateurs, monétisation)
- 🎬 Média & Streaming (plateformes locales, podcasts, vidéo, audio)
- 🛍️ E-commerce Social (marketplace sociale, dropshipping, vente en ligne)
- 🎨 Créativité & Design (outils créatifs, design graphique, branding)
- 📊 Influence & Marketing Digital (outils pour influenceurs, analytics, collaboration)
- 🏥 Santé & Bien-être (télémédecine, santé mentale, prévention)
- 🏙️ Villes Intelligentes (mobilité, services, qualité de vie)

FORMAT DE RÉPONSE:
JSON array avec exactement ${batchSize} idées. Chaque idée doit être complète et validée.

Exemple de structure:
{
  "title": "EcoTrack - Traçabilité Carbone pour Startups",
  "problem_statement": "Les jeunes entrepreneurs marocains veulent mesurer leur impact carbone mais n'ont pas d'outils accessibles. Les solutions existantes coûtent 5000€+ et sont en anglais.",
  "proposed_solution": "App mobile avec IA qui calcule automatiquement l'empreinte carbone d'une startup, suggère des réductions, et génère des rapports pour investisseurs ESG.",
  "category": "tech",
  "location": "casablanca",
  "current_manual_process": "Calculs manuels sur Excel, pas de standardisation, difficile à vérifier",
  "digitization_opportunity": "IA pour analyser factures, trajets, consommation énergétique et calculer automatiquement",
  "frequency": "weekly",
  "data_sources": ["factures_energie", "factures_transport", "achats_equipement"],
  "integration_points": ["API_bancaires", "API_transport", "API_energie"],
  "ai_capabilities_needed": ["analyse_documents", "calcul_carbone", "recommandations"],
  "automation_potential": "high",
  "agent_type": "data_agent",
  "human_in_loop": true,
  "estimated_cost": "3K-5K",
  "submitter_skills": ["développement_mobile", "IA", "sustainability"]
}

IMPORTANT:
- Toutes les idées doivent être réalistes et faisables au Maroc
- Inclure des détails spécifiques marocains (villes, contextes, défis locaux)
- Focus sur problèmes réels que GenZ vit au quotidien
- Solutions doivent être innovantes mais réalisables
- Varier les catégories et localisations
- Assurer que chaque idée est complète avec TOUS les champs requis

Génère maintenant ${batchSize} idées complètes et validées.`;

  // Try providers in order: specified provider -> anthropic -> openai -> gemini -> openrouter
  const providerOrder = provider 
    ? [provider, ...availableProviders.filter(p => p !== provider)]
    : availableProviders;

  let lastError: Error | null = null;

  for (const currentProvider of providerOrder) {
    try {
      let responseText: string;

      switch (currentProvider) {
        case 'anthropic':
          if (!anthropic) continue;
          const anthropicResponse = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8000,
            temperature: 0.8,
            messages: [{ role: 'user', content: prompt }],
          });
          const anthropicContent = anthropicResponse.content[0];
          if (anthropicContent.type !== 'text') {
            throw new Error('Unexpected response type from Anthropic');
          }
          responseText = anthropicContent.text;
          break;

        case 'openai':
          if (!openai) continue;
          const openaiResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 8000,
            temperature: 0.8,
            messages: [{ role: 'user', content: prompt }],
          });
          responseText = openaiResponse.choices[0]?.message?.content || '';
          if (!responseText) throw new Error('Empty response from OpenAI');
          break;

        case 'gemini':
          if (!gemini) continue;
          const geminiModel = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const geminiResponse = await geminiModel.generateContent(prompt);
          responseText = geminiResponse.response.text();
          break;

        case 'openrouter':
          if (!openrouter) continue;
          const openrouterResponse = await openrouter.chat.completions.create({
            model: 'anthropic/claude-3.5-sonnet',
            max_tokens: 8000,
            temperature: 0.8,
            messages: [{ role: 'user', content: prompt }],
          });
          responseText = openrouterResponse.choices[0]?.message?.content || '';
          if (!responseText) throw new Error('Empty response from OpenRouter');
          break;

        default:
          continue;
      }

      console.log(`✅ Generated using ${currentProvider}`);

      // Parse response
      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      // Try to fix common JSON issues
      try {
        // Remove any trailing commas before closing brackets/braces
        jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
        
        const ideas = JSON.parse(jsonText) as GenZIdea[];
        
        if (!Array.isArray(ideas)) {
          throw new Error('Response is not an array');
        }
        
        // Success - return ideas
        return ideas.map(idea => ({
          ...idea,
          submitter_name: 'GenZ Research Team',
          submitter_email: 'genz-research@fikravalley.com',
          submitter_type: 'student' as const,
          submitted_via: 'web' as const,
          status: 'submitted' as const,
          visible: true,
          submitter_skills: idea.submitter_skills || [],
        }));
      } catch (parseError: any) {
        console.error('JSON parse error:', parseError.message);
        console.error('JSON text length:', jsonText.length);
        console.error('First 500 chars:', jsonText.substring(0, 500));
        console.error('Last 500 chars:', jsonText.substring(Math.max(0, jsonText.length - 500)));
        
        // Try to extract array from malformed JSON
        const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          try {
            const ideas = JSON.parse(arrayMatch[0]) as GenZIdea[];
            console.log(`✅ Recovered ${ideas.length} ideas from malformed JSON`);
            return ideas.map(idea => ({
              ...idea,
              submitter_name: 'GenZ Research Team',
              submitter_email: 'genz-research@fikravalley.com',
              submitter_type: 'student' as const,
              submitted_via: 'web' as const,
              status: 'submitted' as const,
              visible: true,
              submitter_skills: idea.submitter_skills || [],
            }));
          } catch (recoveryError) {
            console.error('Failed to recover from malformed JSON');
            throw parseError;
          }
        }
        
        throw parseError;
      }

    } catch (providerError: any) {
      console.error(`❌ Error with ${currentProvider}:`, providerError.message);
      lastError = providerError;
      
      // If rate limit, wait a bit before trying next provider
      if (providerError.status === 429 || providerError.message?.includes('rate limit')) {
        console.log(`⏳ Rate limit on ${currentProvider}, trying next provider...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      continue; // Try next provider
    }
  }

  // All providers failed
  throw lastError || new Error('All providers failed');
}

/**
 * Insert ideas into Supabase with validation
 */
async function insertIdeas(ideas: GenZIdea[]): Promise<{ success: number; errors: number }> {
  let success = 0;
  let errors = 0;

  for (const idea of ideas) {
    try {
      // Validate required fields
      if (!idea.title || !idea.problem_statement || !idea.proposed_solution) {
        console.error(`❌ Skipping incomplete idea: ${idea.title || 'Untitled'}`);
        errors++;
        continue;
      }

      const { data, error } = await supabase
        .from('marrai_ideas')
        .insert({
          title: idea.title,
          problem_statement: idea.problem_statement,
          proposed_solution: idea.proposed_solution,
          category: idea.category,
          location: idea.location,
          current_manual_process: idea.current_manual_process || null,
          digitization_opportunity: idea.digitization_opportunity || null,
          frequency: idea.frequency || null,
          data_sources: idea.data_sources || null,
          integration_points: idea.integration_points || null,
          ai_capabilities_needed: idea.ai_capabilities_needed || null,
          automation_potential: idea.automation_potential || null,
          agent_type: idea.agent_type || null,
          human_in_loop: idea.human_in_loop !== undefined ? idea.human_in_loop : true,
          estimated_cost: idea.estimated_cost || null,
          submitter_name: idea.submitter_name,
          submitter_email: idea.submitter_email,
          submitter_type: idea.submitter_type,
          submitter_skills: idea.submitter_skills || null,
          submitted_via: idea.submitted_via,
          status: idea.status,
          visible: idea.visible, // PUBLIC - Meant to be shared and picked up by GenZ
        } as any)
        .select('id, title')
        .single();

      if (error) {
        console.error(`❌ Error inserting "${idea.title}":`, error.message);
        errors++;
      } else {
        console.log(`✅ Inserted: ${idea.title} (ID: ${(data as any).id})`);
        success++;
      }
    } catch (err: any) {
      console.error(`❌ Exception inserting "${idea.title}":`, err.message);
      errors++;
    }
  }

  return { success, errors };
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🌱 Generating GenZ-Focused Ideas for Fikra Valley\n');
  console.log('📊 Target: 200-300 ideas\n');
  console.log(`✅ Available providers: ${availableProviders.join(', ')}\n`);

  // Load progress
  const progress = loadProgress();
  if (progress.generated > 0) {
    console.log(`📂 Resuming from previous session: ${progress.generated} ideas already generated\n`);
  }

  const totalTarget = 528; // Total: 528 ideas (278 already in DB, generating 250 more)
  const batchSize = 15; // Small batches to avoid rate limits
  
  // Calculate how many ideas we still need
  const remainingIdeas = totalTarget - progress.generated;
  const remainingBatches = Math.ceil(remainingIdeas / batchSize);

  console.log(`📊 Progress: ${progress.generated}/${totalTarget} ideas generated`);
  console.log(`📦 Remaining: ${remainingIdeas} ideas (${remainingBatches} batches)\n`);

  if (remainingIdeas <= 0) {
    console.log(`✅ Target already reached! All ${totalTarget} ideas have been generated.\n`);
    // Clear progress file if completed
    if (existsSync(PROGRESS_FILE)) {
      writeFileSync(PROGRESS_FILE, JSON.stringify({ generated: totalTarget, lastBatch: Math.ceil(totalTarget / batchSize), timestamp: new Date().toISOString() }, null, 2));
    }
    return;
  }

  let allIdeas: GenZIdea[] = [];
  let totalSuccess = 0;
  let totalErrors = 0;
  let currentProviderIndex = progress.lastBatch % availableProviders.length; // Continue provider rotation

  // Generate remaining batches
  for (let batchNum = 0; batchNum < remainingBatches; batchNum++) {
    // Calculate batch size - adjust for remaining ideas needed
    const alreadyGenerated = progress.generated + allIdeas.length;
    const remaining = totalTarget - alreadyGenerated;
    const currentBatchSize = remaining < batchSize ? remaining : batchSize;
    
    if (currentBatchSize <= 0) break; // We've reached the target
    
    const actualBatchNumber = progress.lastBatch + batchNum + 1;

    console.log(`\n📦 Batch ${actualBatchNumber} (${batchNum + 1}/${remainingBatches}) - Generating ${currentBatchSize} ideas...`);
    
    // Rotate providers to distribute load
    const provider = availableProviders[currentProviderIndex % availableProviders.length];
    currentProviderIndex++;
    
    try {
      const ideas = await generateGenZIdeas(currentBatchSize, provider);
      allIdeas.push(...ideas);
      console.log(`✅ Generated ${ideas.length} ideas`);
      
      // Save progress after each successful batch
      saveProgress(progress.generated + allIdeas.length, actualBatchNumber);
      
      // Shorter delay since we're rotating providers
      const delay = 10000; // 10 seconds between batches
      console.log(`⏳ Waiting ${delay/1000}s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error: any) {
      console.error(`❌ Error in batch ${actualBatchNumber}:`, error.message);
      totalErrors++;
      
      // If all providers failed, wait longer before retrying
      if (error.message?.includes('All providers failed')) {
        console.log('⏳ All providers failed, waiting 60s before retrying...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        batchNum--; // Retry this batch
      }
      continue;
    }
  }

  console.log(`\n📊 Total generated: ${allIdeas.length} ideas`);
  console.log(`\n💾 Inserting into Supabase...\n`);

  // Insert in smaller chunks to avoid overwhelming the database
  const chunkSize = 10; // Reduced chunk size
  for (let i = 0; i < allIdeas.length; i += chunkSize) {
    const chunk = allIdeas.slice(i, i + chunkSize);
    const result = await insertIdeas(chunk);
    totalSuccess += result.success;
    totalErrors += result.errors;
    
    // Small delay between chunks
    if (i + chunkSize < allIdeas.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n📊 Final Summary:`);
  console.log(`   ✅ Successfully inserted: ${totalSuccess}`);
  console.log(`   ❌ Errors: ${totalErrors}`);
  console.log(`   📦 Total processed: ${allIdeas.length}\n`);

  // Clear progress file if completed
  if (totalSuccess >= totalTarget * 0.9) { // 90% success rate
    if (existsSync(PROGRESS_FILE)) {
      writeFileSync(PROGRESS_FILE, JSON.stringify({ completed: true, timestamp: new Date().toISOString() }, null, 2));
      console.log('✅ Progress file marked as completed\n');
    }
  }

  console.log(`\n🌐 Public Ideas: All ideas inserted with visible=true (PUBLIC)`);
  console.log(`   These ideas are meant to be shared and picked up by GenZ entrepreneurs.\n`);
  console.log(`\n💡 Tip: You can resume generation by running this script again.\n`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { generateGenZIdeas, insertIdeas };

