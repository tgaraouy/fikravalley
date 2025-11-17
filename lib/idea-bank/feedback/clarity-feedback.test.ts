/**
 * Test Suite for Clarity Feedback System
 */

import {
  generateClarityFeedback,
  formatFeedbackAsText,
  formatFeedbackAsHTML,
  formatFeedbackAsWhatsApp,
  formatFeedbackAsMarkdown,
  type FeedbackInput,
} from './clarity-feedback';

/**
 * Test Case 1: Low-clarity idea (needs improvement)
 */
const lowClarityIdea: FeedbackInput = {
  problemStatement: 'C\'est difficile.',
  asIsAnalysis: 'C\'est compliqué actuellement.',
  benefitStatement: 'Ça sera mieux.',
  operationalNeeds: 'Besoin d\'un système.',
  dataSources: [],
  integrationPoints: [],
  aiCapabilitiesNeeded: [],
};

/**
 * Test Case 2: Medium-clarity idea
 */
const mediumClarityIdea: FeedbackInput = {
  problemStatement: 'Les hôpitaux ont des problèmes avec les dossiers.',
  asIsAnalysis: 'Actuellement, ils utilisent des classeurs. C\'est long.',
  benefitStatement: 'Avec un système digital, ce sera plus rapide.',
  operationalNeeds: 'Besoin d\'Excel et d\'une base de données.',
  dataSources: ['Excel'],
  integrationPoints: [],
  aiCapabilitiesNeeded: [],
  roiTimeSavedHours: 20,
  roiCostSavedEur: 300,
};

/**
 * Test Case 3: High-clarity idea (should pass)
 */
const highClarityIdea: FeedbackInput = {
  problemStatement: 'Les hôpitaux perdent 2 heures par jour à chercher des dossiers patients. Chaque infirmière passe 30 minutes par jour à remplir des formulaires papier. Cela affecte 500 patients par jour dans un hôpital moyen.',
  asIsAnalysis: 'Actuellement, le processus est le suivant: 1) Le patient arrive avec un papier, 2) L\'infirmière cherche le dossier dans des classeurs (5 minutes), 3) Elle remplit un formulaire papier (10 minutes), 4) Le dossier est rangé manuellement (2 minutes). Total: 17 minutes par patient.',
  benefitStatement: 'Avec un système digital, nous économiserons 2 heures par jour par infirmière, soit 40 heures par mois. Cela représente 500 EUR d\'économies mensuelles par hôpital.',
  operationalNeeds: 'Sources de données: Excel (dossiers existants), Forms (nouveaux patients). Intégrations: Système hospitalier ERP. IA nécessaire: NLP pour extraction de texte.',
  dataSources: ['Excel', 'Forms'],
  integrationPoints: ['Hospital ERP'],
  aiCapabilitiesNeeded: ['NLP', 'Classification'],
  roiTimeSavedHours: 40,
  roiCostSavedEur: 500,
  estimatedCost: '3K-5K',
  processSteps: [
    { description: 'Patient arrive', timeMinutes: 2, costEur: 0 },
    { description: 'Cherche dossier', timeMinutes: 5, costEur: 0.5 },
    { description: 'Remplit formulaire', timeMinutes: 10, costEur: 0.2 },
  ],
};

/**
 * Run feedback tests
 */
export function runFeedbackTests() {
  console.log('=== Clarity Feedback System Tests ===\n');

  // Test 1: Low clarity
  console.log('Test 1: Low Clarity Idea');
  const feedback1 = generateClarityFeedback(lowClarityIdea);
  console.log('Overall Score:', feedback1.overall.score.toFixed(1));
  console.log('Status:', feedback1.overall.status);
  console.log('Items needing improvement:', feedback1.items.filter((i) => i.score < 6).length);
  console.log('Quick Wins:', feedback1.quickWins);
  console.log('Estimated Time:', feedback1.estimatedTotalTime, 'minutes');
  console.log('\n');

  // Test 2: Medium clarity
  console.log('Test 2: Medium Clarity Idea');
  const feedback2 = generateClarityFeedback(mediumClarityIdea);
  console.log('Overall Score:', feedback2.overall.score.toFixed(1));
  console.log('Status:', feedback2.overall.status);
  console.log('Items needing improvement:', feedback2.items.filter((i) => i.score < 6).length);
  console.log('\n');

  // Test 3: High clarity
  console.log('Test 3: High Clarity Idea');
  const feedback3 = generateClarityFeedback(highClarityIdea);
  console.log('Overall Score:', feedback3.overall.score.toFixed(1));
  console.log('Status:', feedback3.overall.status);
  console.log('Items needing improvement:', feedback3.items.filter((i) => i.score < 6).length);
  console.log('\n');

  // Test formatting
  console.log('=== Format Tests ===\n');
  console.log('Text Format:');
  console.log(formatFeedbackAsText(feedback1, 'fr').substring(0, 200) + '...');
  console.log('\n');

  console.log('WhatsApp Format:');
  console.log(formatFeedbackAsWhatsApp(feedback1, 'fr'));
  console.log('\n');

  return {
    lowClarity: feedback1,
    mediumClarity: feedback2,
    highClarity: feedback3,
  };
}

// Export test data
export const testIdeas = {
  lowClarity: lowClarityIdea,
  mediumClarity: mediumClarityIdea,
  highClarity: highClarityIdea,
};

