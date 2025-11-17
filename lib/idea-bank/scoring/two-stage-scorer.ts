/**
 * Two-Stage Idea Scoring System
 * 
 * Based on ITONICS methodology, adapted for Morocco
 * Hybrid approach: Morocco priorities (primary) + SDG tags (secondary)
 * 
 * Stage 1: Clarity (must score ≥6/10)
 * - Problem Statement (0-10)
 * - As-Is Analysis (0-10)
 * - Benefit Statement (0-10)
 * - Operational Needs (0-10)
 * 
 * Stage 2: Decision (must score ≥25/40)
 * - Strategic Fit (1-5) - Morocco priorities + SDG alignment
 * - Feasibility (1-5)
 * - Differentiation (1-5)
 * - Evidence of Demand (1-5)
 */

import { MOROCCO_PRIORITIES, type MoroccoPriority, detectMoroccoPriorities } from './morocco-priorities';

/**
 * Alignment data for strategic scoring
 */
export interface IdeaAlignment {
  // PRIMARY (user selects these)
  moroccoPriorities: string[]; // IDs from MOROCCO_PRIORITIES
  
  // SECONDARY (auto-generated, user can edit)
  sdgTags: number[]; // Auto-mapped from priorities + NLP
  sdgAutoTagged: boolean;
  sdgConfidence: { [sdg: number]: number }; // 0-1 confidence scores
  
  // Optional manual additions
  ministryPriorities?: string[]; // Free text
  otherAlignment?: string; // Free text
}

/**
 * Input data for scoring
 */
export interface IdeaScoringInput {
  // Problem & Context
  problemStatement: string;
  asIsAnalysis: string;
  benefitStatement: string;
  operationalNeeds: string;
  
  // Strategic & Market
  strategicFit?: string;
  feasibility?: string;
  differentiation?: string;
  evidenceOfDemand?: string;
  
  // Alignment (NEW - hybrid Morocco/SDG approach)
  alignment?: IdeaAlignment;
  
  // Financial
  estimatedCost?: number | string;
  roiTimeSavedHours?: number;
  roiCostSavedEur?: number;
  
  // Context
  location?: string;
  category?: string;
  frequency?: string;
  urgency?: string;
  
  // Additional context
  dataSources?: string[];
  integrationPoints?: string[];
  aiCapabilitiesNeeded?: string[];
}

/**
 * Stage 1 Clarity Scores
 */
export interface Stage1Scores {
  problemStatement: number; // 0-10
  asIsAnalysis: number; // 0-10
  benefitStatement: number; // 0-10
  operationalNeeds: number; // 0-10
  total: number; // 0-40
  percentage: number; // 0-100
  passed: boolean; // ≥6/10 = ≥24/40
}

/**
 * Stage 2 Decision Scores
 */
export interface Stage2Scores {
  strategicFit: number; // 1-5
  feasibility: number; // 1-5
  differentiation: number; // 1-5
  evidenceOfDemand: number; // 1-5
  total: number; // 4-20 (weighted to 0-40)
  percentage: number; // 0-100
  passed: boolean; // ≥25/40
}

/**
 * Complete scoring result
 */
export interface IdeaScoringResult {
  stage1: Stage1Scores;
  stage2: Stage2Scores | null;
  overall: {
    passed: boolean;
    stage1Passed: boolean;
    stage2Passed: boolean | null;
    recommendation: 'approve' | 'reject' | 'needs_revision';
  };
  breakEven?: {
    months: number | null;
    feasible: boolean;
  };
  metadata: {
    darijaDetected: boolean;
    darijaKeywords: string[];
    scoringDate: string;
  };
}

/**
 * Darija keywords for Morocco-specific context detection
 */
const DARIJA_KEYWORDS = [
  // Common phrases
  'bghiti', 'bghit', 'kayna', 'kayn', 'fiha', 'fih', '3and', '3andi',
  'daba', 'dakchi', 'dak', 'had', 'hadi', 'homa', 'hna', 'fina',
  'kifach', 'kif', 'wach', 'walo', 'mashi', 'mach', 'khass', 'khassna',
  // Numbers (Darija style)
  'wahd', 'juj', 'tlata', 'rb3a', 'khamsa', 'sitta', 'sba3', 'tmania', 'ts3ud', '3achra',
  // Common words
  'blad', 'bled', 'wlad', 'bent', 'rajel', 'mra', 'dar', 'dari', 'khouya', 'ukhti',
  // Expressions
  'inshallah', 'mashallah', 'hamdullah', 'bismillah', 'allah y3awn',
  // Locations
  'casablanca', 'casa', 'rabat', 'fes', 'marrakech', 'tanger', 'agadir',
  // Government/Institutions
  'makhzen', 'wilaya', 'commune', 'baladiya', 'ministère', 'ministry',
  // Common problems
  'mouchkil', 'machakil', 'problème', 'problem', '7aja', 'haja',
];

/**
 * Score Problem Statement (0-10)
 * 
 * Evaluates:
 * - Clarity of problem description
 * - Specificity (numbers, metrics)
 * - Relevance to Morocco context
 * - Impact description
 */
export function scoreProblemStatement(input: IdeaScoringInput): number {
  const text = (input.problemStatement || '').toLowerCase();
  let score = 0;

  // Base score for having content (0-2)
  if (text.length >= 20) score += 1;
  if (text.length >= 100) score += 1;

  // Specificity indicators (0-3)
  const hasNumbers = /\d+/.test(text);
  const hasMetrics = /(heure|hour|jour|day|semaine|week|mois|month|an|year|euro|eur|dh|dirham|personne|person|utilisateur|user)/i.test(text);
  const hasQuantifiers = /(chaque|each|tous|all|plusieurs|several|beaucoup|many|souvent|often|toujours|always)/i.test(text);
  
  if (hasNumbers) score += 1;
  if (hasMetrics) score += 1;
  if (hasQuantifiers) score += 1;

  // Problem clarity (0-2)
  const problemKeywords = /(problème|problem|difficulté|difficulty|défi|challenge|issue|mouchkil|machakil)/i.test(text);
  const impactKeywords = /(impact|effet|effect|conséquence|consequence|résultat|result|affecte|affects)/i.test(text);
  
  if (problemKeywords) score += 1;
  if (impactKeywords) score += 1;

  // Morocco context (0-2)
  const moroccoKeywords = /(maroc|morocco|marocain|moroccan|maghreb|mghrib|darija|arabic|français|french)/i.test(text);
  const locationKeywords = /(casablanca|casa|rabat|fes|marrakech|tanger|agadir|wilaya|commune|baladiya)/i.test(text);
  
  if (moroccoKeywords || locationKeywords) score += 1;
  if (input.location && input.location.length > 0) score += 1;

  // Urgency/Frequency context (0-1)
  if (input.frequency && input.urgency) score += 1;

  return Math.min(10, Math.round(score * 10) / 10);
}

/**
 * Score As-Is Analysis (0-10)
 * 
 * Evaluates:
 * - Description of current process
 * - Pain points identified
 * - Stakeholders mentioned
 * - Process flow clarity
 */
export function scoreAsIsAnalysis(input: IdeaScoringInput): number {
  const text = (input.asIsAnalysis || '').toLowerCase();
  let score = 0;

  // Base score for having content (0-2)
  if (text.length >= 30) score += 1;
  if (text.length >= 150) score += 1;

  // Process description (0-3)
  const processKeywords = /(processus|process|étape|step|procédure|procedure|méthode|method|façon|way|comment|how)/i.test(text);
  const sequenceKeywords = /(d'abord|first|ensuite|then|après|after|puis|finally|enfin|avant|before)/i.test(text);
  const currentKeywords = /(actuellement|currently|maintenant|now|aujourd'hui|today|actuel|current)/i.test(text);
  
  if (processKeywords) score += 1;
  if (sequenceKeywords) score += 1;
  if (currentKeywords) score += 1;

  // Pain points (0-2)
  const painKeywords = /(difficile|difficult|long|slow|lent|fast|rapide|compliqué|complicated|problème|problem|erreur|error|bug|retard|delay)/i.test(text);
  const timeKeywords = /(temps|time|heure|hour|jour|day|semaine|week|mois|month)/i.test(text);
  
  if (painKeywords) score += 1;
  if (timeKeywords) score += 1;

  // Stakeholders (0-2)
  const stakeholderKeywords = /(utilisateur|user|client|customer|patient|citoyen|citizen|employé|employee|agent|fonctionnaire|officer|admin|administrateur)/i.test(text);
  const organizationKeywords = /(hôpital|hospital|école|school|université|university|ministère|ministry|service|department)/i.test(text);
  
  if (stakeholderKeywords) score += 1;
  if (organizationKeywords) score += 1;

  // Data sources mentioned (0-1)
  if (input.dataSources && input.dataSources.length > 0) score += 1;

  return Math.min(10, Math.round(score * 10) / 10);
}

/**
 * Score Benefit Statement (0-10)
 * 
 * Evaluates:
 * - Clear benefits description
 * - Quantified benefits
 * - Stakeholder benefits
 * - Impact measurement
 */
export function scoreBenefitStatement(input: IdeaScoringInput): number {
  const text = (input.benefitStatement || '').toLowerCase();
  let score = 0;

  // Base score for having content (0-2)
  if (text.length >= 30) score += 1;
  if (text.length >= 150) score += 1;

  // Benefit keywords (0-2)
  const benefitKeywords = /(bénéfice|benefit|avantage|advantage|amélioration|improvement|gain|gain|économie|saving|réduction|reduction|augmentation|increase)/i.test(text);
  const impactKeywords = /(impact|effet|effect|résultat|result|changement|change|transformation|transformation)/i.test(text);
  
  if (benefitKeywords) score += 1;
  if (impactKeywords) score += 1;

  // Quantified benefits (0-3)
  const hasNumbers = /\d+/.test(text);
  const hasROI = input.roiTimeSavedHours || input.roiCostSavedEur;
  const hasMetrics = /(heure|hour|jour|day|semaine|week|mois|month|euro|eur|dh|dirham|%|percent|pourcent)/i.test(text);
  
  if (hasNumbers) score += 1;
  if (hasROI) score += 1;
  if (hasMetrics) score += 1;

  // Stakeholder benefits (0-2)
  const stakeholderKeywords = /(utilisateur|user|client|customer|patient|citoyen|citizen|employé|employee|équipe|team|organisation|organization)/i.test(text);
  const experienceKeywords = /(expérience|experience|qualité|quality|satisfaction|satisfaction|facilité|ease|simplicité|simplicity)/i.test(text);
  
  if (stakeholderKeywords) score += 1;
  if (experienceKeywords) score += 1;

  // Solution clarity (0-1)
  const solutionKeywords = /(solution|solution|système|system|outil|tool|plateforme|platform|application|app|automatisation|automation)/i.test(text);
  if (solutionKeywords) score += 1;

  return Math.min(10, Math.round(score * 10) / 10);
}

/**
 * Score Operational Needs (0-10)
 * 
 * Evaluates:
 * - Integration requirements
 * - Data sources identified
 * - Technical requirements
 * - Resource needs
 */
export function scoreOperationalNeeds(input: IdeaScoringInput): number {
  const text = (input.operationalNeeds || '').toLowerCase();
  let score = 0;

  // Base score for having content (0-2)
  if (text.length >= 20) score += 1;
  if (text.length >= 100) score += 1;

  // Data sources (0-2)
  if (input.dataSources && input.dataSources.length > 0) {
    score += Math.min(2, input.dataSources.length * 0.5);
  }

  // Integration points (0-2)
  if (input.integrationPoints && input.integrationPoints.length > 0) {
    score += Math.min(2, input.integrationPoints.length * 0.5);
  }

  // Technical requirements (0-2)
  const techKeywords = /(api|database|base de données|système|system|intégration|integration|connecteur|connector|interface)/i.test(text);
  const aiKeywords = /(ia|ai|intelligence artificielle|artificial intelligence|machine learning|ml|nlp|vision|speech)/i.test(text);
  
  if (techKeywords) score += 1;
  if (aiKeywords || (input.aiCapabilitiesNeeded && input.aiCapabilitiesNeeded.length > 0)) score += 1;

  // Resource needs (0-2)
  const resourceKeywords = /(ressource|resource|équipe|team|personnel|staff|budget|coût|cost|temps|time|formation|training)/i.test(text);
  const infrastructureKeywords = /(infrastructure|infrastructure|serveur|server|cloud|hébergement|hosting|sécurité|security)/i.test(text);
  
  if (resourceKeywords) score += 1;
  if (infrastructureKeywords) score += 1;

  return Math.min(10, Math.round(score * 10) / 10);
}

/**
 * Score Stage 1: Clarity
 */
export function scoreStage1(input: IdeaScoringInput): Stage1Scores {
  const problemStatement = scoreProblemStatement(input);
  const asIsAnalysis = scoreAsIsAnalysis(input);
  const benefitStatement = scoreBenefitStatement(input);
  const operationalNeeds = scoreOperationalNeeds(input);

  const total = problemStatement + asIsAnalysis + benefitStatement + operationalNeeds;
  const percentage = (total / 40) * 100;
  const passed = percentage >= 60; // ≥6/10 = ≥24/40 = ≥60%

  return {
    problemStatement,
    asIsAnalysis,
    benefitStatement,
    operationalNeeds,
    total,
    percentage,
    passed,
  };
}

/**
 * Auto-tag SDGs from Morocco priorities and text analysis
 */
export function autoTagSDGs(input: IdeaScoringInput): {
  sdgTags: number[];
  sdgConfidence: { [sdg: number]: number };
} {
  const sdgScores: { [sdg: number]: number } = {};
  
  // 1. From Morocco Priorities (high confidence = 0.9)
  if (input.alignment?.moroccoPriorities) {
    input.alignment.moroccoPriorities.forEach(priorityId => {
      const priority = MOROCCO_PRIORITIES.find(p => p.id === priorityId);
      if (priority) {
        priority.sdgMapping.forEach(sdg => {
          sdgScores[sdg] = Math.max(sdgScores[sdg] || 0, 0.9);
        });
      }
    });
  }
  
  // 2. From Text Analysis (medium confidence, max 0.8)
  const text = `${input.problemStatement || ''} ${input.benefitStatement || ''}`.toLowerCase();
  
  const sdgKeywords: { [sdg: number]: string[] } = {
    1: ['poverty', 'poor', 'fqir', 'fqr', 'income', 'dakhel', 'pauvreté'],
    2: ['hunger', 'food', 'makla', 'ta3am', 'agriculture', 'filaha', 'faim'],
    3: ['health', 'si7a', 'hospital', 'sbitar', 'medical', 'doctor', 'tbib', 'nurse', 'santé', 'patient'],
    4: ['education', 'ta3lim', 'school', 'madrasa', 'university', 'student', 'talib', 'éducation', 'teacher'],
    5: ['women', 'mra', 'nisa', 'female', 'gender', 'equality', 'mosawat', 'femme', 'égalité'],
    6: ['water', 'ma', 'clean', 'nqi', 'sanitation', 'eau', 'assainissement'],
    7: ['energy', 'taqa', 'solar', 'shamsi', 'renewable', 'electricity', 'kahraba', 'énergie', 'solaire'],
    8: ['work', 'khdma', 'job', 'employment', 'tashghil', 'entrepreneur', 'startup', 'travail', 'emploi'],
    9: ['industry', 'sina3a', 'innovation', 'technology', 'tech', 'infrastructure', 'industrie', 'infrastructure'],
    10: ['inequality', 'equality', 'reduced', 'fair', '3adl', 'inégalité', 'équité'],
    11: ['city', 'mdina', 'urban', 'hadari', 'transport', 'naql', 'parking', 'traffic', 'ville', 'transport'],
    12: ['consumption', 'istihlak', 'responsible', 'waste', 'nfayat', 'recycle', 'consommation', 'déchet'],
    13: ['climate', 'manakh', 'environment', 'bi2a', 'carbon', 'green', 'akhdar', 'climat', 'environnement'],
    14: ['ocean', 'sea', 'b7ar', 'marine', 'water', 'fishing', 'océan', 'mer', 'pêche'],
    15: ['land', 'ard', 'forest', 'ghaba', 'biodiversity', 'wildlife', 'terre', 'forêt', 'biodiversité'],
    16: ['peace', 'salam', 'justice', '3adala', 'institution', 'mo2assasa', 'paix', 'justice'],
    17: ['partnership', 'sharaka', 'cooperation', 'ta3awon', 'global', 'partenariat', 'coopération']
  };
  
  Object.entries(sdgKeywords).forEach(([sdg, keywords]) => {
    const matches = keywords.filter(k => text.includes(k)).length;
    if (matches > 0) {
      const confidence = Math.min(0.8, matches * 0.2); // Max 0.8 from text
      sdgScores[parseInt(sdg)] = Math.max(sdgScores[parseInt(sdg)] || 0, confidence);
    }
  });
  
  // 3. Return top 3 SDGs with confidence > 0.5
  const sortedSDGs = Object.entries(sdgScores)
    .filter(([_, score]) => score >= 0.5)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3);
  
  return {
    sdgTags: sortedSDGs.map(([sdg, _]) => parseInt(sdg)),
    sdgConfidence: Object.fromEntries(sortedSDGs) as { [sdg: number]: number }
  };
}

/**
 * Score Strategic Fit (1-5)
 * 
 * Evaluates alignment with Morocco's strategic priorities (primary)
 * SDG tags are secondary metadata for funders
 */
export function scoreStrategicFit(input: IdeaScoringInput): number {
  // Initialize alignment if not provided
  if (!input.alignment) {
    input.alignment = {
      moroccoPriorities: [],
      sdgTags: [],
      sdgAutoTagged: false,
      sdgConfidence: {}
    };
  }
  
  // Auto-detect Morocco priorities from text if not provided
  if (!input.alignment.moroccoPriorities || input.alignment.moroccoPriorities.length === 0) {
    const text = `${input.problemStatement || ''} ${input.benefitStatement || ''} ${input.category || ''}`;
    input.alignment.moroccoPriorities = detectMoroccoPriorities(text);
  }
  
  // Auto-tag SDGs if not already done
  if (!input.alignment.sdgTags || input.alignment.sdgTags.length === 0) {
    const sdgData = autoTagSDGs(input);
    input.alignment.sdgTags = sdgData.sdgTags;
    input.alignment.sdgConfidence = sdgData.sdgConfidence;
    input.alignment.sdgAutoTagged = true;
  }
  
  // Base score from Morocco priorities (1-5)
  const priorityCount = input.alignment.moroccoPriorities.length;
  let baseScore = 1;
  
  if (priorityCount === 0) baseScore = 1;
  else if (priorityCount === 1) baseScore = 2;
  else if (priorityCount === 2) baseScore = 3;
  else if (priorityCount === 3) baseScore = 4;
  else baseScore = 5;
  
  // Bonuses (+0.2 each, max +1.0)
  let bonus = 0;
  
  // Has SDG tags (auto or manual)
  if (input.alignment.sdgTags.length > 0) bonus += 0.2;
  
  // High-priority sectors get bonus
  const highPriority = ['youth_employment', 'women_empowerment', 'green_morocco'];
  const hasHighPriority = input.alignment.moroccoPriorities.some(p => highPriority.includes(p));
  if (hasHighPriority) bonus += 0.3;
  
  // Multiple SDGs (shows broad impact)
  if (input.alignment.sdgTags.length >= 2) bonus += 0.2;
  
  // High SDG confidence (shows clear alignment)
  const confidenceValues = Object.values(input.alignment.sdgConfidence);
  if (confidenceValues.length > 0) {
    const avgConfidence = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length;
    if (avgConfidence >= 0.8) bonus += 0.3;
  }
  
  // Cap at 5
  return Math.min(5, Math.max(1, Math.round((baseScore + bonus) * 10) / 10));
}

/**
 * Score Feasibility (1-5)
 * 
 * Evaluates technical and operational feasibility
 */
export function scoreFeasibility(input: IdeaScoringInput): number {
  let score = 1; // Base score

  // Cost feasibility (0-1)
  const cost = parseCost(input.estimatedCost);
  if (cost !== null) {
    if (cost < 1000) score += 1;
    else if (cost < 5000) score += 0.7;
    else if (cost < 10000) score += 0.4;
    else score += 0.2;
  }

  // Technical complexity (0-1)
  const hasSimpleTech = !input.integrationPoints || input.integrationPoints.length <= 2;
  const hasBasicAI = !input.aiCapabilitiesNeeded || input.aiCapabilitiesNeeded.length <= 2;
  if (hasSimpleTech && hasBasicAI) score += 1;
  else if (hasSimpleTech || hasBasicAI) score += 0.5;

  // Data availability (0-1)
  if (input.dataSources && input.dataSources.length > 0) {
    const hasCommonSources = input.dataSources.some((s) => 
      ['Excel', 'Email', 'PDF', 'Forms'].includes(s)
    );
    if (hasCommonSources) score += 1;
    else score += 0.5;
  }

  // Human in loop (assumed true if not specified)
  score += 1; // Default assumption

  // ROI indicators (0-1)
  if (input.roiTimeSavedHours || input.roiCostSavedEur) {
    const timeSaved = input.roiTimeSavedHours || 0;
    const costSaved = input.roiCostSavedEur || 0;
    if (timeSaved > 20 || costSaved > 200) score += 1;
    else if (timeSaved > 10 || costSaved > 100) score += 0.5;
  }

  return Math.min(5, Math.max(1, Math.round(score * 10) / 10));
}

/**
 * Score Differentiation (1-5)
 * 
 * Evaluates uniqueness and competitive advantage
 */
export function scoreDifferentiation(input: IdeaScoringInput): number {
  const text = ((input.differentiation || '') + ' ' + (input.benefitStatement || '')).toLowerCase();
  let score = 1; // Base score

  // Innovation keywords (0-1)
  const innovationKeywords = /(nouveau|new|innovant|innovative|unique|unique|différent|different|premier|first|pionnier|pioneer)/i.test(text);
  if (innovationKeywords) score += 1;

  // Morocco-specific (0-1)
  const moroccoSpecific = /(maroc|morocco|spécifique|specific|local|locale|context|contexte|darija|arabic|français)/i.test(text);
  if (moroccoSpecific) score += 1;

  // AI/Technology advantage (0-1)
  const aiAdvantage = /(ia|ai|intelligence artificielle|automatisation|automation|efficacité|efficiency|rapidité|speed)/i.test(text);
  if (aiAdvantage) score += 0.5;

  // Problem specificity (0-1)
  const hasSpecificProblem = (input.problemStatement || '').length > 100;
  const hasSpecificSolution = (input.benefitStatement || '').length > 100;
  if (hasSpecificProblem && hasSpecificSolution) score += 1;
  else if (hasSpecificProblem || hasSpecificSolution) score += 0.5;

  // Category uniqueness (0-0.5)
  const uniqueCategories = ['inclusion', 'agriculture', 'infrastructure'];
  if (input.category && uniqueCategories.includes(input.category.toLowerCase())) score += 0.5;

  return Math.min(5, Math.max(1, Math.round(score * 10) / 10));
}

/**
 * Score Evidence of Demand (1-5)
 * 
 * Evaluates market need and user demand
 */
export function scoreEvidenceOfDemand(input: IdeaScoringInput): number {
  let score = 1; // Base score

  // Frequency indicator (0-1)
  const frequency = input.frequency;
  if (frequency === 'multiple_daily' || frequency === 'daily') score += 1;
  else if (frequency === 'weekly') score += 0.7;
  else if (frequency === 'monthly') score += 0.4;

  // Urgency indicator (0-1)
  const urgency = input.urgency;
  if (urgency === 'critical') score += 1;
  else if (urgency === 'high') score += 0.7;
  else if (urgency === 'medium') score += 0.4;

  // Stakeholder impact (0-1)
  const text = (input.problemStatement || '').toLowerCase();
  const stakeholderCount = (text.match(/(utilisateur|user|client|customer|patient|citoyen|citizen|employé|employee)/gi) || []).length;
  if (stakeholderCount >= 3) score += 1;
  else if (stakeholderCount >= 1) score += 0.5;

  // ROI evidence (0-1)
  if (input.roiTimeSavedHours || input.roiCostSavedEur) {
    const timeSaved = input.roiTimeSavedHours || 0;
    const costSaved = input.roiCostSavedEur || 0;
    if (timeSaved > 40 || costSaved > 500) score += 1;
    else if (timeSaved > 20 || costSaved > 200) score += 0.5;
  }

  // Problem severity (0-1)
  const severityKeywords = /(critique|critical|urgent|urgent|important|important|majeur|major|grave|serious)/i.test(text);
  if (severityKeywords) score += 0.5;

  const evidenceText = (input.evidenceOfDemand || '').toLowerCase();
  if (evidenceText.length > 50) score += 0.5;

  return Math.min(5, Math.max(1, Math.round(score * 10) / 10));
}

/**
 * Score Stage 2: Decision
 */
export function scoreStage2(input: IdeaScoringInput): Stage2Scores {
  const strategicFit = scoreStrategicFit(input);
  const feasibility = scoreFeasibility(input);
  const differentiation = scoreDifferentiation(input);
  const evidenceOfDemand = scoreEvidenceOfDemand(input);

  // Weighted calculation: each score (1-5) is worth 10 points, total 40
  const total = (strategicFit + feasibility + differentiation + evidenceOfDemand) * 2;
  const percentage = (total / 40) * 100;
  const passed = total >= 25; // ≥25/40

  return {
    strategicFit,
    feasibility,
    differentiation,
    evidenceOfDemand,
    total,
    percentage,
    passed,
  };
}

/**
 * Detect Darija keywords in text
 */
export function detectDarija(text: string): { detected: boolean; keywords: string[] } {
  const lowerText = text.toLowerCase();
  const foundKeywords: string[] = [];

  DARIJA_KEYWORDS.forEach((keyword) => {
    if (lowerText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  });

  return {
    detected: foundKeywords.length > 0,
    keywords: [...new Set(foundKeywords)],
  };
}

/**
 * Calculate break-even point
 */
export function calculateBreakEven(input: IdeaScoringInput): { months: number | null; feasible: boolean } {
  const cost = parseCost(input.estimatedCost);
  const monthlySavings = (input.roiCostSavedEur || 0) / 12; // Annual to monthly

  if (!cost || cost === 0 || monthlySavings === 0) {
    return { months: null, feasible: false };
  }

  const months = cost / monthlySavings;
  const feasible = months <= 24; // Break-even within 2 years is feasible

  return { months: Math.round(months * 10) / 10, feasible };
}

/**
 * Parse cost from various formats
 */
function parseCost(cost: number | string | undefined): number | null {
  if (typeof cost === 'number') return cost;
  if (!cost) return null;

  const str = String(cost).toLowerCase().trim();

  // Handle range formats like "1K-3K", "3K-5K"
  if (str.includes('-')) {
    const parts = str.split('-');
    const first = parseCost(parts[0]);
    const second = parseCost(parts[1]);
    if (first !== null && second !== null) {
      return (first + second) / 2; // Average
    }
  }

  // Handle "K" suffix
  if (str.endsWith('k')) {
    const num = parseFloat(str.slice(0, -1));
    if (!isNaN(num)) return num * 1000;
  }

  // Handle "<1K", "10K+"
  if (str.startsWith('<')) {
    const num = parseFloat(str.slice(1));
    if (!isNaN(num)) return num * 0.5; // Use half as estimate
  }
  if (str.endsWith('+')) {
    const num = parseFloat(str.slice(0, -1));
    if (!isNaN(num)) return num * 1.5; // Use 1.5x as estimate
  }

  // Direct number
  const num = parseFloat(str);
  if (!isNaN(num)) return num;

  return null;
}

/**
 * Calculate Intilaka funding probability
 */
function calculateIntilaqaProbability(score: number, breakEven: number | null): number {
  let prob = 0;
  
  if (score >= 32) prob = 0.8;
  else if (score >= 28) prob = 0.6;
  else if (score >= 25) prob = 0.4;
  else if (score >= 20) prob = 0.2;
  else prob = 0.1;
  
  // Reduce if break-even too long
  if (breakEven !== null) {
    if (breakEven > 9) prob *= 0.7;
    if (breakEven > 12) prob *= 0.5;
  }
  
  return prob;
}

/**
 * Complete two-stage scoring
 */
export function scoreIdea(input: IdeaScoringInput): IdeaScoringResult {
  // Initialize alignment if not provided
  if (!input.alignment) {
    input.alignment = {
      moroccoPriorities: [],
      sdgTags: [],
      sdgAutoTagged: false,
      sdgConfidence: {}
    };
  }
  
  // Auto-detect Morocco priorities from text if not provided
  if (!input.alignment.moroccoPriorities || input.alignment.moroccoPriorities.length === 0) {
    const text = `${input.problemStatement || ''} ${input.benefitStatement || ''} ${input.category || ''}`;
    input.alignment.moroccoPriorities = detectMoroccoPriorities(text);
  }
  
  // Auto-tag SDGs if not already done
  if (!input.alignment.sdgTags || input.alignment.sdgTags.length === 0) {
    const sdgData = autoTagSDGs(input);
    input.alignment.sdgTags = sdgData.sdgTags;
    input.alignment.sdgConfidence = sdgData.sdgConfidence;
    input.alignment.sdgAutoTagged = true;
  }
  
  // Stage 1: Clarity
  const stage1 = scoreStage1(input);

  // Only proceed to Stage 2 if Stage 1 passes
  let stage2: Stage2Scores | null = null;
  if (stage1.passed) {
    stage2 = scoreStage2(input);
  }

  // Break-even analysis
  const breakEven = calculateBreakEven(input);

  // Darija detection
  const allText = [
    input.problemStatement,
    input.asIsAnalysis,
    input.benefitStatement,
    input.operationalNeeds,
  ].join(' ');
  const darija = detectDarija(allText);

  // Overall recommendation
  let recommendation: 'approve' | 'reject' | 'needs_revision';
  if (!stage1.passed) {
    recommendation = 'needs_revision';
  } else if (stage2 && stage2.passed) {
    recommendation = 'approve';
  } else if (stage2 && !stage2.passed) {
    recommendation = 'needs_revision';
  } else {
    recommendation = 'needs_revision';
  }

  return {
    stage1,
    stage2,
    overall: {
      passed: stage1.passed && (stage2?.passed ?? false),
      stage1Passed: stage1.passed,
      stage2Passed: stage2?.passed ?? null,
      recommendation,
    },
    breakEven,
    metadata: {
      darijaDetected: darija.detected,
      darijaKeywords: darija.keywords,
      scoringDate: new Date().toISOString(),
    },
  };
}

/**
 * Complete scoring result with funding eligibility
 */
export interface CompleteScoringResult extends IdeaScoringResult {
  funding?: {
    intilaqaProbability: number;
    euGrantEligible: boolean;
    climateFundEligible: boolean;
  };
  alignment?: IdeaAlignment;
}

/**
 * Complete scoring with funding eligibility (enhanced version)
 */
export function scoreIdeaComplete(input: IdeaScoringInput): CompleteScoringResult {
  // Initialize alignment
  if (!input.alignment) {
    input.alignment = {
      moroccoPriorities: [],
      sdgTags: [],
      sdgAutoTagged: false,
      sdgConfidence: {}
    };
  }
  
  // Auto-detect Morocco priorities
  if (!input.alignment.moroccoPriorities || input.alignment.moroccoPriorities.length === 0) {
    const text = `${input.problemStatement || ''} ${input.benefitStatement || ''} ${input.category || ''}`;
    input.alignment.moroccoPriorities = detectMoroccoPriorities(text);
  }
  
  // Auto-tag SDGs
  if (!input.alignment.sdgTags || input.alignment.sdgTags.length === 0) {
    const sdgData = autoTagSDGs(input);
    input.alignment.sdgTags = sdgData.sdgTags;
    input.alignment.sdgConfidence = sdgData.sdgConfidence;
    input.alignment.sdgAutoTagged = true;
  }
  
  // Get base scoring result
  const baseResult = scoreIdea(input);
  
  // Calculate funding eligibility
  const stage2Score = baseResult.stage2?.total || 0;
  const breakEvenMonths = baseResult.breakEven?.months || null;
  
  const funding = {
    intilaqaProbability: calculateIntilaqaProbability(stage2Score, breakEvenMonths),
    euGrantEligible: (input.alignment.sdgTags.length >= 2), // Needs 2+ SDGs
    climateFundEligible: input.alignment.sdgTags.includes(13) || // SDG 13: Climate
                         input.alignment.moroccoPriorities.includes('green_morocco')
  };
  
  return {
    ...baseResult,
    funding,
    alignment: input.alignment
  };
}

/**
 * Get scoring explanation/recommendations
 * Morocco-focused feedback (SDGs in background)
 */
export function getScoringRecommendations(result: IdeaScoringResult, alignment?: IdeaAlignment): string[] {
  const recommendations: string[] = [];

  if (!result.stage1.passed) {
    recommendations.push('Stage 1 (Clarity) non réussi. Améliorez la clarté de votre idée.');
    
    if (result.stage1.problemStatement < 6) {
      recommendations.push('- Problème: Ajoutez plus de détails spécifiques avec des chiffres et métriques.');
    }
    if (result.stage1.asIsAnalysis < 6) {
      recommendations.push('- Analyse As-Is: Décrivez mieux le processus actuel avec les étapes et les problèmes.');
    }
    if (result.stage1.benefitStatement < 6) {
      recommendations.push('- Bénéfices: Quantifiez les bénéfices avec des chiffres concrets.');
    }
    if (result.stage1.operationalNeeds < 6) {
      recommendations.push('- Besoins opérationnels: Identifiez les sources de données et intégrations nécessaires.');
    }
  }

  if (result.stage2 && !result.stage2.passed) {
    recommendations.push('Stage 2 (Decision) non réussi. Renforcez la viabilité de votre idée.');
    
    if (result.stage2.strategicFit < 3) {
      recommendations.push('- Fit stratégique: Mettez en avant l\'alignement avec les priorités nationales du Maroc (ex: Green Morocco Plan, Digital Morocco 2025, Vision 2030).');
    }
    if (result.stage2.feasibility < 3) {
      recommendations.push('- Faisabilité: Réduisez la complexité technique ou justifiez mieux les coûts.');
    }
    if (result.stage2.differentiation < 3) {
      recommendations.push('- Différenciation: Expliquez ce qui rend votre idée unique.');
    }
    if (result.stage2.evidenceOfDemand < 3) {
      recommendations.push('- Demande: Fournissez plus d\'indices sur la fréquence et l\'urgence du problème.');
    }
  }

  // Morocco-focused alignment feedback
  if (alignment && alignment.moroccoPriorities.length > 0) {
    const priorities = alignment.moroccoPriorities.map(id => {
      const priority = MOROCCO_PRIORITIES.find(p => p.id === id);
      return priority ? priority.name : id;
    });

    if (alignment.moroccoPriorities.includes('green_morocco')) {
      recommendations.push(`✓ Votre idée s'aligne avec le Green Morocco Plan, ce qui aidera pour l'éligibilité aux fonds climatiques.`);
    } else if (alignment.moroccoPriorities.includes('digital_morocco')) {
      recommendations.push(`✓ Votre idée s'aligne avec Digital Morocco 2025, priorité nationale pour la transformation numérique.`);
    } else if (alignment.moroccoPriorities.includes('youth_employment')) {
      recommendations.push(`✓ Votre idée s'aligne avec la priorité nationale d'emploi des jeunes, secteur hautement prioritaire.`);
    } else if (alignment.moroccoPriorities.includes('women_empowerment')) {
      recommendations.push(`✓ Votre idée s'aligne avec la priorité nationale d'entrepreneuriat féminin, secteur hautement prioritaire.`);
    } else if (priorities.length > 0) {
      recommendations.push(`✓ Votre idée s'aligne avec ${priorities.join(', ')}, ce qui renforce votre candidature.`);
    }
  }

  // Climate/renewable energy feedback (Morocco-focused)
  if (alignment) {
    const text = `${alignment.moroccoPriorities.join(' ')}`.toLowerCase();
    if (text.includes('green') || text.includes('climate') || text.includes('renewable') || text.includes('solar') || text.includes('energy')) {
      recommendations.push(`💡 Votre focus sur l'énergie renouvelable et l'environnement se connecte aux objectifs climatiques du Maroc (Green Morocco Plan).`);
    }
  }

  if (result.breakEven && !result.breakEven.feasible && result.breakEven.months) {
    recommendations.push(`Break-even: ${result.breakEven.months} mois est trop long. Ciblez <24 mois.`);
  }

  return recommendations;
}

/**
 * Generate Morocco-focused feedback about alignment
 * Never mentions SDGs directly to users
 */
export function generateAlignmentFeedback(alignment: IdeaAlignment): string[] {
  const feedback: string[] = [];
  
  if (!alignment || alignment.moroccoPriorities.length === 0) {
    return feedback;
  }

  alignment.moroccoPriorities.forEach(priorityId => {
    const priority = MOROCCO_PRIORITIES.find(p => p.id === priorityId);
    if (!priority) return;

    switch (priorityId) {
      case 'green_morocco':
        feedback.push(`Votre idée s'aligne avec le Green Morocco Plan, ce qui aidera pour l'éligibilité aux fonds climatiques.`);
        break;
      case 'digital_morocco':
        feedback.push(`Votre idée s'aligne avec Digital Morocco 2025, priorité nationale pour la transformation numérique.`);
        break;
      case 'youth_employment':
        feedback.push(`Votre idée s'aligne avec la priorité nationale d'emploi des jeunes, secteur hautement prioritaire.`);
        break;
      case 'women_empowerment':
        feedback.push(`Votre idée s'aligne avec la priorité nationale d'entrepreneuriat féminin, secteur hautement prioritaire.`);
        break;
      case 'rural_development':
        feedback.push(`Votre idée s'aligne avec la priorité de développement rural, essentiel pour le Maroc.`);
        break;
      case 'health_system':
        feedback.push(`Votre idée s'aligne avec l'amélioration du système de santé, priorité nationale.`);
        break;
      case 'education_quality':
        feedback.push(`Votre idée s'aligne avec l'amélioration de la qualité de l'éducation, priorité nationale.`);
        break;
      case 'vision_2030':
        feedback.push(`Votre idée s'aligne avec Vision 2030, stratégie de développement économique du Maroc.`);
        break;
      default:
        feedback.push(`Votre idée s'aligne avec ${priority.name}, ce qui renforce votre candidature.`);
    }
  });

  // Climate/renewable energy specific feedback (Morocco-focused, not SDG-focused)
  const hasGreenMorocco = alignment.moroccoPriorities.includes('green_morocco');
  const hasClimateKeywords = alignment.moroccoPriorities.some(id => {
    const priority = MOROCCO_PRIORITIES.find(p => p.id === id);
    return priority?.keywords.some(k => ['climate', 'energy', 'solar', 'renewable', 'environment'].includes(k.toLowerCase()));
  });

  if (hasGreenMorocco || hasClimateKeywords) {
    feedback.push(`💡 Votre focus sur l'énergie renouvelable et l'environnement se connecte aux objectifs climatiques du Maroc (Green Morocco Plan).`);
  }

  return feedback;
}

