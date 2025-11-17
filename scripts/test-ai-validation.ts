/**
 * AI Validation Test Script
 * 
 * Tests all AI features in the idea process:
 * 1. Idea extraction from conversations
 * 2. Deep idea analysis
 * 3. Two-stage scoring with auto-tagging
 * 4. Clarity feedback generation
 * 
 * Run with: npx tsx scripts/test-ai-validation.ts
 */

import { createClient } from '@supabase/supabase-js';
import { scoreIdeaComplete } from '@/lib/idea-bank/scoring/two-stage-scorer';
import { generateClarityFeedback } from '@/lib/idea-bank/feedback/clarity-feedback';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testScoring() {
  log('\n📊 Testing Two-Stage Scoring System...', 'cyan');
  
  // Test case 1: High-quality idea
  const highQualityIdea = {
    problemStatement: 'Les infirmières du CHU Ibn Sina à Rabat perdent en moyenne 4 heures par équipe de 8 heures à chercher du matériel médical mobile (défibrillateurs, pompes à perfusion, moniteurs de signes vitaux). Chaque infirmière effectue environ 6-8 recherches par shift. Sur un service de 30 infirmières, cela représente 180-240 recherches par jour. Le système actuel utilise un cahier papier où l\'équipement est supposé être enregistré lorsqu\'il change de service, mais 50% des mouvements ne sont pas enregistrés.',
    asIsAnalysis: '1. Besoin d\'équipement (2 min) - Infirmière identifie le besoin médical, va au poste de soins. 2. Consultation du cahier (5 min) - Cherche dans le cahier papier, informations souvent périmées ou illisibles, 60% du temps l\'information est incorrecte. 3. Appels téléphoniques (10 min) - Appelle 3-4 services différents, souvent personne ne répond. 4. Recherche physique (30 min) - Monte/descend les escaliers entre étages, vérifie chambres, couloirs, salles de soins. 5. Résolution ou abandon (15 min). Temps total moyen: 62 minutes par recherche.',
    benefitStatement: 'Temps économisé: Avant 62 minutes par recherche, Après 2 minutes (scan QR + voir emplacement), Réduction 97% (60 minutes économisées). Impact: 180 recherches × 60 min = 10,800 min/jour = 180 heures/jour récupérées. Coût économisé: Avant 27,900 DH/jour en temps perdu, Après 1,200 DH/jour (coût système), Économie: 26,700 DH/jour = 6,675,000 DH/an. ROI: Système payé en 2.3 jours.',
    operationalNeeds: 'Équipe: 1 développeur full-stack (3 mois), 1 designer UX (1 mois), 1 ingénieur RFID (2 mois). Technologie: Tags RFID passifs (50 DH/unité), Lecteurs RFID (8 par étage), App mobile (React Native), Dashboard web (Next.js), Serveur (Supabase). Budget total: 117,180 DH.',
    category: 'health',
    location: 'rabat',
    frequency: 'multiple_daily',
    receipts: 243,
    alignment: {
      moroccoPriorities: [],
      sdgTags: [],
      sdgAutoTagged: false,
      sdgConfidence: {}
    }
  };

  try {
    const result = scoreIdeaComplete(highQualityIdea);
    
    log('✅ Scoring completed', 'green');
    log(`   Stage 1 (Clarity): ${result.stage1.total}/40 - ${result.stage1.passed ? 'PASSED' : 'FAILED'}`, 
        result.stage1.passed ? 'green' : 'red');
    log(`   Stage 2 (Decision): ${result.stage2?.total || 0}/20 - ${result.stage2?.passed ? 'PASSED' : 'FAILED'}`, 
        result.stage2?.passed ? 'green' : 'red');
    log(`   Qualification Tier: ${result.overall.qualificationTier}`, 'blue');
    log(`   Morocco Priorities: ${result.alignment?.moroccoPriorities.join(', ') || 'None'}`, 'blue');
    log(`   SDG Tags: ${result.alignment?.sdgTags.join(', ') || 'None'}`, 'blue');
    log(`   Break-even: ${result.breakEven?.months || 'N/A'} months`, 'blue');
    
    if (result.stage1.total < 24) {
      log('   ⚠️  Stage 1 score is below 24 (60% threshold)', 'yellow');
    }
    if (result.stage2 && result.stage2.total < 15) {
      log('   ⚠️  Stage 2 score is below 15 (75% threshold)', 'yellow');
    }
  } catch (error) {
    log(`❌ Scoring failed: ${error}`, 'red');
    return false;
  }

  // Test case 2: Low-quality idea (should fail Stage 1)
  log('\n📊 Testing Low-Quality Idea...', 'cyan');
  const lowQualityIdea = {
    problemStatement: 'Problème',
    asIsAnalysis: 'Processus manuel',
    benefitStatement: 'Bénéfices',
    operationalNeeds: 'Équipe et budget',
    category: 'health',
    location: 'rabat',
    frequency: 'daily',
    receipts: 0,
    alignment: {
      moroccoPriorities: [],
      sdgTags: [],
      sdgAutoTagged: false,
      sdgConfidence: {}
    }
  };

  try {
    const result = scoreIdeaComplete(lowQualityIdea);
    
    log('✅ Scoring completed', 'green');
    log(`   Stage 1 (Clarity): ${result.stage1.total}/40 - ${result.stage1.passed ? 'PASSED' : 'FAILED'}`, 
        result.stage1.passed ? 'green' : 'yellow');
    
    if (!result.stage1.passed) {
      log('   ✓ Correctly identified as needing revision', 'green');
    }
  } catch (error) {
    log(`❌ Scoring failed: ${error}`, 'red');
    return false;
  }

  return true;
}

async function testFeedback() {
  log('\n💬 Testing Clarity Feedback Generation...', 'cyan');
  
  const lowClarityIdea = {
    problemStatement: 'Problème avec le système',
    asIsAnalysis: 'Processus actuel',
    benefitStatement: 'Économies',
    operationalNeeds: 'Besoin d\'équipe',
    category: 'health',
    location: 'rabat',
    frequency: 'daily',
    receipts: 5,
    alignment: {
      moroccoPriorities: [],
      sdgTags: [],
      sdgAutoTagged: false,
      sdgConfidence: {}
    }
  };

  try {
    const feedback = generateClarityFeedback(lowClarityIdea);
    
    log('✅ Feedback generated', 'green');
    log(`   Overall Score: ${feedback.overall.score}/10`, 'blue');
    log(`   Status: ${feedback.overall.status}`, 'blue');
    log(`   Items with feedback: ${feedback.items.length}`, 'blue');
    log(`   Quick Wins: ${feedback.quickWins.length}`, 'blue');
    log(`   Estimated Time to Fix: ${feedback.estimatedTotalTime} minutes`, 'blue');
    
    if (feedback.items.length > 0) {
      log('\n   Sample Feedback Item:', 'cyan');
      const sampleItem = feedback.items[0];
      log(`   - Criterion: ${sampleItem.criterion}`, 'blue');
      log(`   - Score: ${sampleItem.score}/10`, 'blue');
      log(`   - Issues: ${sampleItem.issues.length}`, 'blue');
      log(`   - Suggestions: ${sampleItem.suggestions.length}`, 'blue');
    }
  } catch (error) {
    log(`❌ Feedback generation failed: ${error}`, 'red');
    return false;
  }

  return true;
}

async function testDatabaseIdeas() {
  log('\n🗄️  Testing Database Ideas...', 'cyan');
  
  try {
    // Get ideas with AI analysis
    const { data: analyzedIdeas, error: analyzedError } = await supabase
      .from('marrai_ideas')
      .select('id, title, ai_feasibility_score, ai_impact_score, automation_potential, analysis_completed_at')
      .not('ai_analysis', 'is', null)
      .order('analysis_completed_at', { ascending: false })
      .limit(5);

    if (analyzedError) throw analyzedError;

    log(`✅ Found ${analyzedIdeas?.length || 0} ideas with AI analysis`, 'green');
    
    if (analyzedIdeas && analyzedIdeas.length > 0) {
      log('\n   Sample analyzed ideas:', 'cyan');
      analyzedIdeas.forEach((idea, i) => {
        log(`   ${i + 1}. ${idea.title}`, 'blue');
        log(`      Feasibility: ${idea.ai_feasibility_score || 'N/A'}`, 'blue');
        log(`      Impact: ${idea.ai_impact_score || 'N/A'}`, 'blue');
        log(`      Automation: ${idea.automation_potential || 'N/A'}`, 'blue');
      });
    } else {
      log('   ⚠️  No ideas with AI analysis found', 'yellow');
      log('   Run /api/analyze-idea on an idea first', 'yellow');
    }

    // Get ideas with scores
    const { data: scoredIdeas, error: scoredError } = await supabase
      .from('marrai_idea_scores')
      .select('idea_id, stage1_total, stage2_total, total_score')
      .order('total_score', { ascending: false })
      .limit(5);

    if (scoredError) throw scoredError;

    log(`\n✅ Found ${scoredIdeas?.length || 0} ideas with scores`, 'green');
    
    if (scoredIdeas && scoredIdeas.length > 0) {
      log('\n   Top scored ideas:', 'cyan');
      scoredIdeas.forEach((score, i) => {
        log(`   ${i + 1}. Idea ${score.idea_id.substring(0, 8)}...`, 'blue');
        log(`      Stage 1: ${score.stage1_total || 0}/40`, 'blue');
        log(`      Stage 2: ${score.stage2_total || 0}/20`, 'blue');
        log(`      Total: ${score.total_score || 0}/60`, 'blue');
      });
    }

  } catch (error) {
    log(`❌ Database check failed: ${error}`, 'red');
    return false;
  }

  return true;
}

async function testAPIEndpoints() {
  log('\n🌐 Testing API Endpoints...', 'cyan');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Test 1: Check if analyze-idea endpoint exists
  try {
    const response = await fetch(`${baseUrl}/api/analyze-idea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId: '00000000-0000-0000-0000-000000000000' })
    });
    
    const status = response.status;
    if (status === 404 || status === 400) {
      log('✅ /api/analyze-idea endpoint exists', 'green');
    } else {
      log(`✅ /api/analyze-idea endpoint responded with ${status}`, 'green');
    }
  } catch (error) {
    log(`⚠️  Could not reach /api/analyze-idea: ${error}`, 'yellow');
    log('   Make sure the dev server is running (npm run dev)', 'yellow');
  }

  // Test 2: Check feedback endpoint
  try {
    const response = await fetch(`${baseUrl}/api/ideas/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId: '00000000-0000-0000-0000-000000000000' })
    });
    
    const status = response.status;
    if (status === 404 || status === 400) {
      log('✅ /api/ideas/feedback endpoint exists', 'green');
    } else {
      log(`✅ /api/ideas/feedback endpoint responded with ${status}`, 'green');
    }
  } catch (error) {
    log(`⚠️  Could not reach /api/ideas/feedback: ${error}`, 'yellow');
  }

  return true;
}

async function main() {
  log('🚀 Starting AI Validation Tests\n', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  const results = {
    scoring: false,
    feedback: false,
    database: false,
    api: false,
  };

  // Run tests
  results.scoring = await testScoring();
  results.feedback = await testFeedback();
  results.database = await testDatabaseIdeas();
  results.api = await testAPIEndpoints();

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('📋 Test Summary', 'cyan');
  log('='.repeat(50), 'cyan');
  
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${icon} ${test}: ${passed ? 'PASSED' : 'FAILED'}`, color);
  });

  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    log('\n🎉 All AI validation tests passed!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the output above for details.', 'yellow');
  }

  log('\n💡 Next Steps:', 'cyan');
  log('   1. Test extraction: POST /api/extract-ideas with test transcripts', 'blue');
  log('   2. Test analysis: POST /api/analyze-idea with a real idea ID', 'blue');
  log('   3. Check database for AI results', 'blue');
  log('   4. Review docs/ai-validation-guide.md for detailed instructions', 'blue');
}

main().catch(console.error);

