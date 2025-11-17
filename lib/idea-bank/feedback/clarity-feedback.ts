/**
 * Intelligent Clarity Feedback System
 * 
 * Provides actionable, bilingual feedback for low-clarity ideas
 * Analyzes each criterion and suggests specific improvements
 */

import {
  scoreProblemStatement,
  scoreAsIsAnalysis,
  scoreBenefitStatement,
  scoreOperationalNeeds,
  type IdeaScoringInput,
} from '../scoring/two-stage-scorer';

/**
 * Feedback item for a specific criterion
 */
export interface FeedbackItem {
  criterion: 'problem' | 'asIs' | 'benefits' | 'operations';
  criterionName: {
    fr: string;
    darija: string;
  };
  score: number;
  maxScore: number;
  issues: string[];
  suggestions: string[];
  examples: {
    current: string;
    improved: string;
  };
  estimatedTimeToFix: number; // minutes
}

/**
 * Overall feedback summary
 */
export interface OverallFeedback {
  score: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  message: {
    fr: string;
    darija: string;
  };
}

/**
 * Complete feedback response
 */
export interface ClarityFeedback {
  overall: OverallFeedback;
  items: FeedbackItem[];
  quickWins: string[];
  priorityOrder: string[];
  estimatedTotalTime: number; // minutes
}

/**
 * Analysis result for a criterion
 */
interface CriterionAnalysis {
  hasWho: boolean;
  hasFrequency: boolean;
  hasCurrentSolution: boolean;
  hasWhyFails: boolean;
  hasNumbers: boolean;
  hasMetrics: boolean;
  hasProcessSteps: boolean;
  hasCosts: boolean;
  hasTime: boolean;
  hasPainPoints: boolean;
  hasQuantification: boolean;
  hasROI: boolean;
  hasTeam: boolean;
  hasBudget: boolean;
  hasTimeline: boolean;
}

/**
 * Analyze problem statement
 */
function analyzeProblem(text: string): CriterionAnalysis {
  const lower = text.toLowerCase();
  
  return {
    hasWho: /(utilisateur|user|client|customer|patient|citoyen|citizen|employé|employee|étudiant|student|fellah|mra|rajel|wlad|bent)/i.test(text),
    hasFrequency: /(chaque|each|tous|all|quotidien|daily|hebdomadaire|weekly|mensuel|monthly|souvent|often|toujours|always|kol|kolchi|bzzaf|kayna)/i.test(text),
    hasCurrentSolution: /(actuellement|currently|maintenant|now|daba|hna|fina|kayna|processus|process|méthode|method|façon|way)/i.test(text),
    hasWhyFails: /(problème|problem|difficulté|difficulty|défi|challenge|mouchkil|machakil|erreur|error|retard|delay|échoue|fails|ma kaynach|ma kaynch)/i.test(text),
    hasNumbers: /\d+/.test(text),
    hasMetrics: /(heure|hour|jour|day|semaine|week|mois|month|an|year|euro|eur|dh|dirham|personne|person|utilisateur|user|%|pourcent)/i.test(text),
    hasProcessSteps: false,
    hasCosts: false,
    hasTime: false,
    hasPainPoints: false,
    hasQuantification: false,
    hasROI: false,
    hasTeam: false,
    hasBudget: false,
    hasTimeline: false,
  };
}

/**
 * Analyze As-Is analysis
 */
function analyzeAsIs(text: string, processSteps: any[], dataSources: string[]): CriterionAnalysis {
  const lower = text.toLowerCase();
  
  return {
    hasWho: false,
    hasFrequency: false,
    hasCurrentSolution: /(actuellement|currently|maintenant|now|daba|processus|process|étape|step|procédure|procedure)/i.test(text),
    hasWhyFails: /(difficile|difficult|long|slow|lent|compliqué|complicated|problème|problem|erreur|error|retard|delay)/i.test(text),
    hasNumbers: /\d+/.test(text),
    hasMetrics: /(heure|hour|jour|day|semaine|week|mois|month|minute|min)/i.test(text),
    hasProcessSteps: processSteps.length > 0 || /(étape|step|d'abord|first|ensuite|then|après|after|puis|finally|enfin)/i.test(text),
    hasCosts: /(coût|cost|prix|price|euro|eur|dh|dirham|budget)/i.test(text) || processSteps.some((s) => s.costEur > 0),
    hasTime: /(temps|time|heure|hour|jour|day|minute|min)/i.test(text) || processSteps.some((s) => s.timeMinutes > 0),
    hasPainPoints: /(difficile|difficult|long|slow|lent|compliqué|complicated|problème|problem|erreur|error|retard|delay|frustrant|frustrating)/i.test(text),
    hasQuantification: false,
    hasROI: false,
    hasTeam: false,
    hasBudget: false,
    hasTimeline: false,
  };
}

/**
 * Analyze benefits statement
 */
function analyzeBenefits(text: string, timeSaved: number, costSaved: number): CriterionAnalysis {
  const lower = text.toLowerCase();
  
  return {
    hasWho: false,
    hasFrequency: false,
    hasCurrentSolution: false,
    hasWhyFails: false,
    hasNumbers: /\d+/.test(text),
    hasMetrics: /(heure|hour|jour|day|semaine|week|mois|month|euro|eur|dh|dirham|%|pourcent|percent)/i.test(text),
    hasProcessSteps: false,
    hasCosts: /(coût|cost|prix|price|euro|eur|dh|dirham|économie|saving|réduction|reduction)/i.test(text),
    hasTime: /(temps|time|heure|hour|jour|day|semaine|week|mois|month)/i.test(text),
    hasPainPoints: false,
    hasQuantification: (timeSaved > 0 || costSaved > 0) || /\d+/.test(text),
    hasROI: timeSaved > 0 || costSaved > 0,
    hasTeam: false,
    hasBudget: false,
    hasTimeline: false,
  };
}

/**
 * Analyze operational needs
 */
function analyzeOperations(
  text: string,
  dataSources: string[],
  integrationPoints: string[],
  aiCapabilities: string[],
  teamSize: number,
  budget: string
): CriterionAnalysis {
  return {
    hasWho: false,
    hasFrequency: false,
    hasCurrentSolution: false,
    hasWhyFails: false,
    hasNumbers: false,
    hasMetrics: false,
    hasProcessSteps: false,
    hasCosts: budget.length > 0,
    hasTime: false,
    hasPainPoints: false,
    hasQuantification: false,
    hasROI: false,
    hasTeam: teamSize > 0,
    hasBudget: budget.length > 0,
    hasTimeline: false,
  };
}

/**
 * Generate feedback for problem statement
 */
function generateProblemFeedback(
  text: string,
  score: number,
  analysis: CriterionAnalysis
): FeedbackItem {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let estimatedTime = 5;

  if (!analysis.hasWho) {
    issues.push('Qui est affecté par le problème n\'est pas clair');
    suggestions.push('Ajoutez qui est touché: "Les patients attendent..." ou "Les citoyens perdent..." ou "L\'fellah kaybghi..."');
    estimatedTime += 2;
  }

  if (!analysis.hasFrequency) {
    issues.push('La fréquence du problème n\'est pas mentionnée');
    suggestions.push('Précisez la fréquence: "Chaque jour, 200 personnes..." ou "3 fois par semaine..." ou "Kol nhar, 200 nass..."');
    estimatedTime += 2;
  }

  if (!analysis.hasNumbers) {
    issues.push('Aucun chiffre concret n\'est fourni');
    suggestions.push('Ajoutez des chiffres: "2 heures par jour", "500 patients", "15% d\'erreurs" ou "2 sa3at kol nhar", "500 patient"');
    estimatedTime += 3;
  }

  if (!analysis.hasMetrics) {
    issues.push('Les métriques (temps, coût, nombre) manquent');
    suggestions.push('Quantifiez avec des unités: heures, euros, nombre de personnes, pourcentages (sa3at, euro, nass, %)');
    estimatedTime += 3;
  }

  if (!analysis.hasWhyFails) {
    issues.push('Pourquoi le problème existe n\'est pas expliqué');
    suggestions.push('Expliquez la cause: "Le processus manuel cause..." ou "L\'absence de système digital..." ou "L\'processus manuel kay3awen..."');
    estimatedTime += 3;
  }

  const currentExample = text || 'Le système est lent.';
  const improvedExample = 'Les hôpitaux perdent 2 heures par jour à chercher des dossiers patients. Chaque infirmière passe 30 minutes par jour à remplir des formulaires papier. Cela affecte 500 patients par jour dans un hôpital moyen.';

  return {
    criterion: 'problem',
    criterionName: {
      fr: 'Énoncé du problème',
      darija: 'وصف المشكل',
    },
    score,
    maxScore: 10,
    issues,
    suggestions,
    examples: {
      current: currentExample,
      improved: improvedExample,
    },
    estimatedTimeToFix: estimatedTime,
  };
}

/**
 * Generate feedback for As-Is analysis
 */
function generateAsIsFeedback(
  text: string,
  score: number,
  analysis: CriterionAnalysis,
  processSteps: any[]
): FeedbackItem {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let estimatedTime = 5;

  if (!analysis.hasProcessSteps && processSteps.length === 0) {
    issues.push('Les étapes du processus actuel ne sont pas décrites');
    suggestions.push('Listez les étapes: "1) Le patient arrive, 2) L\'agent cherche le dossier, 3) ..."');
    estimatedTime += 5;
  }

  if (!analysis.hasTime && processSteps.every((s) => s.timeMinutes === 0)) {
    issues.push('Le temps pris par chaque étape n\'est pas mentionné');
    suggestions.push('Ajoutez le temps: "Cette étape prend 15 minutes" ou utilisez le constructeur de processus');
    estimatedTime += 3;
  }

  if (!analysis.hasCosts && processSteps.every((s) => s.costEur === 0)) {
    issues.push('Les coûts du processus actuel ne sont pas identifiés');
    suggestions.push('Estimez les coûts: papier, temps de personnel, erreurs, etc.');
    estimatedTime += 5;
  }

  if (!analysis.hasPainPoints) {
    issues.push('Les points de douleur ne sont pas clairement identifiés');
    suggestions.push('Décrivez ce qui est difficile, lent, ou source d\'erreurs');
    estimatedTime += 3;
  }

  const currentExample = text || 'C\'est compliqué actuellement.';
  const improvedExample = 'Actuellement, le processus est le suivant: 1) Le patient arrive avec un papier, 2) L\'infirmière cherche le dossier dans des classeurs (5 minutes), 3) Elle remplit un formulaire papier (10 minutes), 4) Le dossier est rangé manuellement (2 minutes). Total: 17 minutes par patient. Ce processus cause des erreurs dans 15% des cas.';

  return {
    criterion: 'asIs',
    criterionName: {
      fr: 'Analyse de l\'état actuel',
      darija: 'تحليل الوضع الحالي',
    },
    score,
    maxScore: 10,
    issues,
    suggestions,
    examples: {
      current: currentExample,
      improved: improvedExample,
    },
    estimatedTimeToFix: estimatedTime,
  };
}

/**
 * Generate feedback for benefits statement
 */
function generateBenefitsFeedback(
  text: string,
  score: number,
  analysis: CriterionAnalysis,
  timeSaved: number,
  costSaved: number
): FeedbackItem {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let estimatedTime = 5;

  if (!analysis.hasQuantification) {
    issues.push('Les bénéfices ne sont pas quantifiés');
    suggestions.push('Ajoutez des chiffres: "Économie de 40 heures par mois" ou "Réduction de 50% du temps"');
    estimatedTime += 5;
  }

  if (!analysis.hasROI) {
    issues.push('Le retour sur investissement n\'est pas calculé');
    suggestions.push('Utilisez le calculateur de ROI pour estimer les économies de temps et d\'argent');
    estimatedTime += 3;
  }

  if (!analysis.hasMetrics) {
    issues.push('Les métriques de bénéfices manquent');
    suggestions.push('Précisez: heures économisées, euros économisés, pourcentage d\'amélioration');
    estimatedTime += 3;
  }

  if (text.length < 50) {
    issues.push('La description des bénéfices est trop courte');
    suggestions.push('Développez: qui bénéficie, comment, et dans quelle mesure');
    estimatedTime += 5;
  }

  const currentExample = text || 'Ça sera mieux.';
  const improvedExample = 'Avec un système digital, nous économiserons 2 heures par jour par infirmière, soit 40 heures par mois. Cela représente 500 EUR d\'économies mensuelles par hôpital. Les patients attendront 50% moins de temps (de 3h à 1h30).';

  return {
    criterion: 'benefits',
    criterionName: {
      fr: 'Énoncé des bénéfices',
      darija: 'وصف الفوائد',
    },
    score,
    maxScore: 10,
    issues,
    suggestions,
    examples: {
      current: currentExample,
      improved: improvedExample,
    },
    estimatedTimeToFix: estimatedTime,
  };
}

/**
 * Generate feedback for operational needs
 */
function generateOperationsFeedback(
  text: string,
  score: number,
  analysis: CriterionAnalysis,
  dataSources: string[],
  integrationPoints: string[],
  aiCapabilities: string[]
): FeedbackItem {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let estimatedTime = 5;

  if (dataSources.length === 0) {
    issues.push('Aucune source de données n\'est identifiée');
    suggestions.push('Sélectionnez au moins une source: Excel, Database, Email, PDF, etc.');
    estimatedTime += 2;
  }

  if (integrationPoints.length === 0 && text.length < 50) {
    issues.push('Les intégrations nécessaires ne sont pas mentionnées');
    suggestions.push('Indiquez les systèmes à intégrer: ERP, Email, WhatsApp, etc. (ou "Aucune" si pas nécessaire)');
    estimatedTime += 3;
  }

  if (aiCapabilities.length === 0 && text.length < 50) {
    issues.push('Les capacités IA nécessaires ne sont pas spécifiées');
    suggestions.push('Sélectionnez les capacités: NLP, Vision, Prediction, etc. (ou "Aucune" si pas nécessaire)');
    estimatedTime += 2;
  }

  if (!analysis.hasBudget) {
    issues.push('Le budget estimé n\'est pas fourni');
    suggestions.push('Estimez le coût: "<1K", "3K-5K", "10K+", etc.');
    estimatedTime += 3;
  }

  const currentExample = text || 'Besoin d\'un système.';
  const improvedExample = 'Sources de données: Excel (dossiers existants), Forms (nouveaux patients). Intégrations: Système hospitalier ERP. IA nécessaire: NLP pour extraction de texte, Classification pour catégorisation. Budget estimé: 3K-5K EUR.';

  return {
    criterion: 'operations',
    criterionName: {
      fr: 'Besoins opérationnels',
      darija: 'الاحتياجات التشغيلية',
    },
    score,
    maxScore: 10,
    issues,
    suggestions,
    examples: {
      current: currentExample,
      improved: improvedExample,
    },
    estimatedTimeToFix: estimatedTime,
  };
}

/**
 * Generate overall feedback message
 */
function generateOverallFeedback(score: number): OverallFeedback {
  if (score >= 8) {
    return {
      score,
      status: 'excellent',
      message: {
        fr: 'Excellent ! Votre idée est très claire. Vous pouvez passer à l\'étape suivante.',
        darija: 'ممتاز! فكرتك واضحة بزاف. تقدر تمشي للخطوة الجاية.',
      },
    };
  } else if (score >= 6) {
    return {
      score,
      status: 'good',
      message: {
        fr: 'Bien ! Votre idée est claire. Quelques améliorations mineures pourraient la renforcer.',
        darija: 'مزيان! فكرتك واضحة. شوية تحسينات صغيرة تقدر تزيدها قوة.',
      },
    };
  } else if (score >= 4) {
    return {
      score,
      status: 'needs_improvement',
      message: {
        fr: 'Votre idée a besoin d\'être clarifiée. Suivez les suggestions ci-dessous pour améliorer votre score.',
        darija: 'فكرتك محتاجة توضيح. تبع النصائح اللي فتحت باش تحسن النقطة ديالك.',
      },
    };
  } else {
    return {
      score,
      status: 'poor',
      message: {
        fr: 'Votre idée nécessite plus de détails. Ne vous inquiétez pas, nous allons vous guider étape par étape.',
        darija: 'فكرتك محتاجة تفاصيل أكثر. ما تقلقش، غادي نعاونوك خطوة بخطوة.',
      },
    };
    }
}

/**
 * Extended input for feedback (includes process steps)
 */
export interface FeedbackInput extends IdeaScoringInput {
  processSteps?: Array<{
    description: string;
    timeMinutes: number;
    costEur: number;
  }>;
  teamSize?: number;
  budget?: string;
}

/**
 * Generate clarity feedback for an idea
 */
export function generateClarityFeedback(input: FeedbackInput): ClarityFeedback {
  // Calculate scores
  const problemScore = scoreProblemStatement(input);
  const asIsScore = scoreAsIsAnalysis(input);
  const benefitScore = scoreBenefitStatement(input);
  const operationalScore = scoreOperationalNeeds(input);

  const overallScore = (problemScore + asIsScore + benefitScore + operationalScore) / 4;

  // Analyze each criterion
  const problemAnalysis = analyzeProblem(input.problemStatement || '');
  const asIsAnalysisResult = analyzeAsIs(
    input.asIsAnalysis || '',
    input.processSteps || [],
    input.dataSources || []
  );
  const benefitsAnalysis = analyzeBenefits(
    input.benefitStatement || '',
    input.roiTimeSavedHours || 0,
    input.roiCostSavedEur || 0
  );
  const operationsAnalysis = analyzeOperations(
    input.operationalNeeds || '',
    input.dataSources || [],
    input.integrationPoints || [],
    input.aiCapabilitiesNeeded || [],
    input.teamSize || 0,
    input.budget || ''
  );

  // Generate feedback items
  const items: FeedbackItem[] = [
    generateProblemFeedback(input.problemStatement || '', problemScore, problemAnalysis),
    generateAsIsFeedback(input.asIsAnalysis || '', asIsScore, asIsAnalysisResult, input.processSteps || []),
    generateBenefitsFeedback(
      input.benefitStatement || '',
      benefitScore,
      benefitsAnalysis,
      input.roiTimeSavedHours || 0,
      input.roiCostSavedEur || 0
    ),
    generateOperationsFeedback(
      input.operationalNeeds || '',
      operationalScore,
      operationsAnalysis,
      input.dataSources || [],
      input.integrationPoints || [],
      input.aiCapabilitiesNeeded || []
    ),
  ];

  // Identify quick wins (easiest fixes)
  const quickWins = items
    .filter((item) => item.estimatedTimeToFix <= 5 && item.score < 6)
    .sort((a, b) => a.estimatedTimeToFix - b.estimatedTimeToFix)
    .slice(0, 3)
    .map((item) => {
      if (item.criterion === 'problem') {
        return item.suggestions[0] || 'Ajoutez des chiffres concrets';
      } else if (item.criterion === 'asIs') {
        return item.suggestions[0] || 'Listez les étapes du processus';
      } else if (item.criterion === 'benefits') {
        return item.suggestions[0] || 'Utilisez le calculateur de ROI';
      } else {
        return item.suggestions[0] || 'Sélectionnez les sources de données';
      }
    });

  // Priority order (highest impact/effort ratio)
  const priorityOrder = items
    .filter((item) => item.score < 6)
    .sort((a, b) => {
      const impactA = 10 - a.score;
      const impactB = 10 - b.score;
      const ratioA = impactA / a.estimatedTimeToFix;
      const ratioB = impactB / b.estimatedTimeToFix;
      return ratioB - ratioA;
    })
    .map((item) => item.criterionName.fr);

  const estimatedTotalTime = items
    .filter((item) => item.score < 6)
    .reduce((sum, item) => sum + item.estimatedTimeToFix, 0);

  return {
    overall: generateOverallFeedback(overallScore),
    items,
    quickWins,
    priorityOrder,
    estimatedTotalTime,
  };
}

/**
 * Format feedback as plain text
 */
export function formatFeedbackAsText(feedback: ClarityFeedback, language: 'fr' | 'darija' = 'fr'): string {
  const t = feedback.overall.message[language];
  const lang = language === 'darija' ? 'darija' : 'fr';

  let text = `📊 Feedback de Clarté\n\n`;
  text += `Score global: ${feedback.overall.score.toFixed(1)}/10\n`;
  text += `${t}\n\n`;

  text += `=== Détails par critère ===\n\n`;

  feedback.items.forEach((item) => {
    if (item.score < 6) {
      text += `${item.criterionName[lang]}: ${item.score.toFixed(1)}/10\n`;
      text += `Problèmes identifiés:\n`;
      item.issues.forEach((issue) => {
        text += `  • ${issue}\n`;
      });
      text += `Suggestions:\n`;
      item.suggestions.forEach((suggestion) => {
        text += `  ✓ ${suggestion}\n`;
      });
      text += `Temps estimé: ${item.estimatedTimeToFix} minutes\n\n`;
    }
  });

  if (feedback.quickWins.length > 0) {
    text += `=== Corrections rapides ===\n`;
    feedback.quickWins.forEach((win, index) => {
      text += `${index + 1}. ${win}\n`;
    });
    text += `\n`;
  }

  text += `Temps total estimé: ${feedback.estimatedTotalTime} minutes\n`;

  return text;
}

/**
 * Format feedback as HTML
 */
export function formatFeedbackAsHTML(feedback: ClarityFeedback, language: 'fr' | 'darija' = 'fr'): string {
  const t = feedback.overall.message[language];
  const lang = language === 'darija' ? 'darija' : 'fr';

  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6366f1;">📊 Feedback de Clarté</h1>
      
      <div style="background: ${feedback.overall.score >= 6 ? '#10b981' : '#f59e0b'}; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin: 0 0 10px 0;">Score global: ${feedback.overall.score.toFixed(1)}/10</h2>
        <p style="margin: 0; font-size: 16px;">${t}</p>
      </div>

      <h2 style="color: #334155; margin-top: 30px;">Détails par critère</h2>
  `;

  feedback.items.forEach((item) => {
    if (item.score < 6) {
      html += `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 15px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">
            ${item.criterionName[lang]}: ${item.score.toFixed(1)}/10
          </h3>
          
          <div style="margin: 15px 0;">
            <h4 style="color: #dc2626; margin-bottom: 10px;">Problèmes identifiés:</h4>
            <ul style="color: #64748b;">
              ${item.issues.map((issue) => `<li>${issue}</li>`).join('')}
            </ul>
          </div>

          <div style="margin: 15px 0;">
            <h4 style="color: #059669; margin-bottom: 10px;">Suggestions:</h4>
            <ul style="color: #64748b;">
              ${item.suggestions.map((suggestion) => `<li>${suggestion}</li>`).join('')}
            </ul>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
            <div style="background: #fef2f2; padding: 15px; border-radius: 6px;">
              <strong style="color: #dc2626;">Exemple actuel:</strong>
              <p style="color: #64748b; margin: 5px 0 0 0;">${item.examples.current}</p>
            </div>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 6px;">
              <strong style="color: #059669;">Exemple amélioré:</strong>
              <p style="color: #64748b; margin: 5px 0 0 0;">${item.examples.improved}</p>
            </div>
          </div>

          <p style="color: #64748b; font-size: 14px;">
            ⏱️ Temps estimé pour corriger: ${item.estimatedTimeToFix} minutes
          </p>
        </div>
      `;
    }
  });

  if (feedback.quickWins.length > 0) {
    html += `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <h3 style="color: #92400e; margin-top: 0;">⚡ Corrections rapides</h3>
        <ol style="color: #78350f;">
          ${feedback.quickWins.map((win) => `<li>${win}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  html += `
      <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="color: #4338ca; margin: 0;">
          <strong>⏱️ Temps total estimé:</strong> ${feedback.estimatedTotalTime} minutes
        </p>
      </div>
    </div>
  `;

  return html;
}

/**
 * Format feedback as WhatsApp message
 */
export function formatFeedbackAsWhatsApp(feedback: ClarityFeedback, language: 'fr' | 'darija' = 'fr'): string {
  const t = feedback.overall.message[language];
  const lang = language === 'darija' ? 'darija' : 'fr';

  let message = `📊 *Feedback de Clarté*\n\n`;
  message += `Score: ${feedback.overall.score.toFixed(1)}/10\n`;
  message += `${t}\n\n`;

  if (feedback.quickWins.length > 0) {
    message += `⚡ *Corrections rapides:*\n`;
    feedback.quickWins.forEach((win, index) => {
      message += `${index + 1}. ${win}\n`;
    });
    message += `\n`;
  }

  feedback.items
    .filter((item) => item.score < 6)
    .slice(0, 2)
    .forEach((item) => {
      message += `\n*${item.criterionName[lang]}:* ${item.score.toFixed(1)}/10\n`;
      if (item.suggestions.length > 0) {
        message += `💡 ${item.suggestions[0]}\n`;
      }
    });

  message += `\n⏱️ Temps total: ${feedback.estimatedTotalTime} min`;

  return message;
}

/**
 * Format feedback as PDF-ready markdown
 */
export function formatFeedbackAsMarkdown(feedback: ClarityFeedback, language: 'fr' | 'darija' = 'fr'): string {
  const t = feedback.overall.message[language];
  const lang = language === 'darija' ? 'darija' : 'fr';

  let md = `# Feedback de Clarté\n\n`;
  md += `**Score global:** ${feedback.overall.score.toFixed(1)}/10\n\n`;
  md += `${t}\n\n`;
  md += `---\n\n`;

  md += `## Détails par critère\n\n`;

  feedback.items.forEach((item) => {
    if (item.score < 6) {
      md += `### ${item.criterionName[lang]}: ${item.score.toFixed(1)}/10\n\n`;
      md += `#### Problèmes identifiés\n\n`;
      item.issues.forEach((issue) => {
        md += `- ${issue}\n`;
      });
      md += `\n#### Suggestions\n\n`;
      item.suggestions.forEach((suggestion) => {
        md += `- ${suggestion}\n`;
      });
      md += `\n#### Exemples\n\n`;
      md += `**Actuel:**\n${item.examples.current}\n\n`;
      md += `**Amélioré:**\n${item.examples.improved}\n\n`;
      md += `**Temps estimé:** ${item.estimatedTimeToFix} minutes\n\n`;
      md += `---\n\n`;
    }
  });

  if (feedback.quickWins.length > 0) {
    md += `## Corrections rapides\n\n`;
    feedback.quickWins.forEach((win, index) => {
      md += `${index + 1}. ${win}\n`;
    });
    md += `\n`;
  }

  md += `**Temps total estimé:** ${feedback.estimatedTotalTime} minutes\n`;

  return md;
}

