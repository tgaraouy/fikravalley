/**
 * SCORE AGENT - Real-Time Analyst
 * 
 * Locke: "Reading furnishes the mind with materials. Thinking makes what we read ours."
 * 
 * The SCORE agent measures BOTH:
 * 1. Clarity (traditional metric) - Do you explain well?
 * 2. Intimacy (Locke's metric) - Do you KNOW intimately or just "know of"?
 * 
 * Users see their thinking quality in real-time.
 * Forces constant reflection and improvement.
 */

import FikraAgent from './fikra-agent';
import ProofAgent from './proof-agent';
import {
  hasSpecificWho,
  hasFrequency,
  hasLivedExperience,
  hasCurrentSolution,
  hasWhyFails,
  hasBeneficiaries
} from './fikra-agent';

// ==================== INTERFACES ====================

export interface IdeaStatement {
  problem?: {
    description: string;
    who?: string;
    where?: string;
    frequency?: string;
  };
  asIs?: {
    description: string;
  };
  benefits?: {
    description: string;
  };
  solution?: {
    description: string;
  };
  operations?: {
    description: string;
  };
  receipts?: Array<{ id: string; amount: number }>;
  revisions?: Array<{ timestamp: Date; content: string }>;
  marginNotes?: Array<{ timestamp: Date; note: string }>;
  strategicAlignment?: {
    moroccoPriorities?: string[];
    sdgs?: number[];
  };
}

export interface LiveScore {
  current: {
    clarity: number; // 0-10
    decision: number; // 0-40
    total: number; // 0-50
    intimacy: number; // 0-10 (Locke's metric)
  };
  
  potential: {
    clarity: number; // Maximum possible
    decision: number;
    total: number;
    intimacy: number;
  };
  
  breakdown: {
    clarity: ClarityBreakdown;
    decision: DecisionBreakdown;
    intimacy: IntimacyBreakdown;
  };
  
  gaps: ScoringGap[];
  qualification: QualificationTier;
  nextBestAction: ScoringGap; // Highest impact action
  
  // Locke insights
  thinkingQuality: 'superficial' | 'developing' | 'intimate' | 'profound';
  marginNoteCount: number; // Pencil marks!
  revisionCount: number; // Thinking iterations
}

export interface ClarityBreakdown {
  problemStatement: {
    score: number; // 0-10
    weight: number; // 2.5/10
    completed: boolean;
    missing: string[];
    explanation: string;
  };
  asIsAnalysis: {
    score: number;
    weight: number; // 2.5/10
    completed: boolean;
    missing: string[];
  };
  benefitsStatement: {
    score: number;
    weight: number; // 2.5/10
    completed: boolean;
    missing: string[];
  };
  operationsNeeds: {
    score: number;
    weight: number; // 2.5/10
    completed: boolean;
    missing: string[];
  };
}

export interface DecisionBreakdown {
  strategicAlignment: {
    score: number; // 0-5
    moroccoPriorities: string[]; // Which priorities matched
    sdgs: Array<{ goal: number; confidence: number }>;
  };
  feasibility: {
    score: number; // 0-5
    technical: number; // 0-5
    regulatory: 'green' | 'yellow' | 'red';
    payment: boolean; // Barid Cash compatible?
  };
  differentiation: {
    score: number; // 0-5
    moroccanAdvantage: boolean;
    impossibleToCopy: boolean;
    tenXImprovement: boolean;
    networkEffects: boolean;
  };
  demandProof: {
    score: number; // 0-5
    receiptsCount: number;
    willingnessScore: number; // 1-5
    painLevel: number; // 0-5
  };
}

export interface IntimacyBreakdown {
  // Locke's "true knowing" metrics
  livedExperience: {
    detected: boolean;
    score: number; // 0-3 points
    evidence: string[];
  };
  conversationCount: {
    count: number; // How many people talked to
    score: number; // 0-3 points
  };
  iterationDepth: {
    revisions: number;
    marginNotes: number;
    score: number; // 0-2 points
  };
  specificityLevel: {
    hasNames: boolean;
    hasNumbers: boolean;
    hasLocations: boolean;
    score: number; // 0-2 points
  };
  
  total: number; // 0-10
  verdict: 'knowing_of' | 'becoming_intimate' | 'true_knowing';
}

export interface ScoringGap {
  field: string;
  section: 'clarity' | 'decision' | 'intimacy';
  currentScore: number;
  potentialScore: number;
  potentialGain: number; // Points gained if filled
  
  effort: 'low' | 'medium' | 'high';
  priority: number; // 0-100 (gain/effort ratio)
  
  action: {
    darija: string;
    french: string;
  };
  
  why: string; // Why this matters
  example?: string; // What good looks like
  
  // Locke insight
  intimacyImpact?: string; // How this deepens understanding
}

export interface QualificationTier {
  tier: 'unqualified' | 'developing' | 'promising' | 'qualified' | 'exceptional';
  score: number;
  
  intilaqaEligible: boolean;
  intilaqaProbability: number; // 0-100%
  
  message: {
    darija: string;
    french: string;
  };
  
  nextTier: {
    name: string;
    requiredScore: number;
    gap: number;
  } | null;
}

// ==================== MAIN CLASS ====================

export class ScoreAgent {
  private fikraAgent: FikraAgent;
  private proofAgent: ProofAgent;
  
  constructor(fikraAgent?: FikraAgent, proofAgent?: ProofAgent) {
    this.fikraAgent = fikraAgent || new FikraAgent();
    this.proofAgent = proofAgent || new ProofAgent();
  }

  // ==================== REAL-TIME SCORING ====================

  /**
   * Calculate live score (called on every keystroke with debounce)
   */
  async calculateLiveScore(partialIdea: Partial<IdeaStatement>): Promise<LiveScore> {
    // 1. CLARITY SCORING
    const clarityBreakdown = await this.scoreClaritySection(partialIdea);
    const clarityTotal = this.sumClarityScore(clarityBreakdown);
    
    // 2. DECISION SCORING
    const decisionBreakdown = await this.scoreDecisionSection(partialIdea);
    const decisionTotal = this.sumDecisionScore(decisionBreakdown);
    
    // 3. INTIMACY SCORING (Locke's metric)
    const intimacyBreakdown = await this.scoreIntimacy(partialIdea);
    
    // 4. IDENTIFY GAPS
    const gaps = this.identifyGaps(partialIdea, clarityBreakdown, decisionBreakdown, intimacyBreakdown);
    
    // 5. PREDICT POTENTIAL
    const potential = this.calculatePotential(gaps, clarityTotal, decisionTotal, intimacyBreakdown.total);
    
    // 6. DETERMINE QUALIFICATION
    const qualification = this.determineQualification(clarityTotal + decisionTotal, intimacyBreakdown.total);
    
    // 7. THINKING QUALITY ASSESSMENT
    const thinkingQuality = this.assessThinkingQuality(intimacyBreakdown, partialIdea.marginNotes?.length || 0);
    
    return {
      current: {
        clarity: clarityTotal,
        decision: decisionTotal,
        total: clarityTotal + decisionTotal,
        intimacy: intimacyBreakdown.total
      },
      potential,
      breakdown: {
        clarity: clarityBreakdown,
        decision: decisionBreakdown,
        intimacy: intimacyBreakdown
      },
      gaps: gaps.sort((a, b) => b.priority - a.priority), // Highest priority first
      qualification,
      nextBestAction: gaps[0] || this.createDefaultGap(), // Highest ROI action
      thinkingQuality,
      marginNoteCount: partialIdea.marginNotes?.length || 0,
      revisionCount: partialIdea.revisions?.length || 0
    };
  }

  // ==================== CLARITY SCORING ====================

  /**
   * Score clarity section (10 points total)
   */
  private async scoreClaritySection(idea: Partial<IdeaStatement>): Promise<ClarityBreakdown> {
    // Problem Statement (2.5 points)
    const problemScore = this.scoreProblemStatement(idea.problem);
    
    // As-Is Analysis (2.5 points)
    const asIsScore = this.scoreAsIsAnalysis(idea.asIs);
    
    // Benefits Statement (2.5 points)
    const benefitsScore = this.scoreBenefitsStatement(idea.benefits);
    
    // Operations Needs (2.5 points)
    const operationsScore = this.scoreOperationsNeeds(idea.operations);
    
    return {
      problemStatement: problemScore,
      asIsAnalysis: asIsScore,
      benefitsStatement: benefitsScore,
      operationsNeeds: operationsScore
    };
  }

  /**
   * Score problem statement
   */
  private scoreProblemStatement(problem?: Partial<IdeaStatement['problem']>): ClarityBreakdown['problemStatement'] {
    if (!problem?.description) {
      return {
        score: 0,
        weight: 2.5,
        completed: false,
        missing: ['Everything - start describing the problem'],
        explanation: "Vous n'avez pas encore décrit le problème. Locke: commencez par OBSERVER."
      };
    }
    
    const checks = {
      hasWho: hasSpecificWho(problem.description),
      hasFrequency: hasFrequency(problem.description),
      hasCurrentSolution: hasCurrentSolution(problem.description),
      hasWhyFails: hasWhyFails(problem.description),
      hasBeneficiaries: hasBeneficiaries(problem.description)
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const score = (passedChecks / 5) * 10; // 0-10 scale
    
    const missing: string[] = [];
    if (!checks.hasWho) missing.push("Qui EXACTEMENT a ce problème?");
    if (!checks.hasFrequency) missing.push("À quelle fréquence (chiffres)?");
    if (!checks.hasCurrentSolution) missing.push("Que font-ils actuellement?");
    if (!checks.hasWhyFails) missing.push("Pourquoi ça échoue?");
    if (!checks.hasBeneficiaries) missing.push("Qui bénéficie de la solution?");
    
    return {
      score,
      weight: 2.5,
      completed: score >= 8.0,
      missing,
      explanation: this.explainProblemScore(score, checks)
    };
  }

  /**
   * Explain problem score with Locke-inspired feedback
   */
  private explainProblemScore(score: number, checks: any): string {
    const percentage = score * 10;
    
    if (percentage >= 90) {
      return `🎉 Parfait! Vous avez clairement défini qui, quoi, fréquence, solution actuelle, et pourquoi ça échoue.

Locke serait fier: Vous ne parlez pas de "les gens ont des problèmes". Vous parlez de PERSONNES SPÉCIFIQUES avec un problème QUANTIFIÉ.

C'est la différence entre "knowing OF" et "KNOWING".`;
    }
    
    if (percentage >= 70) {
      return `👍 Bien! Votre problème est assez clair (${score.toFixed(1)}/10).

Mais pour atteindre l'excellence (9-10/10), ajoutez:
${!checks.hasWho ? '\n- Qui EXACTEMENT (noms, lieux, professions)' : ''}
${!checks.hasFrequency ? '\n- Combien de fois (chiffres précis)' : ''}
${!checks.hasWhyFails ? '\n- Pourquoi la solution actuelle échoue' : ''}

Locke: Plus de SPÉCIFICITÉ = Plus d'INTIMITÉ avec le problème.`;
    }
    
    if (percentage >= 50) {
      return `🤔 Bon début (${score.toFixed(1)}/10), mais trop vague encore.

Vous "connaissez DE" ce problème (knowing OF).
Pour vraiment le CONNAÎTRE (true knowing):

1. QUI exactement? Pas "les gens" - donnez profession, lieu, contexte
2. COMBIEN de fois? Pas "souvent" - donnez chiffres
3. Que font-ils MAINTENANT? Décrivez la solution actuelle
4. Pourquoi ça NE MARCHE PAS?

Locke: "Thinking makes what we read ours."
Pensez PRÉCISÉMENT. Soyez SPÉCIFIQUE.`;
    }
    
    return `⚠️ Trop vague (${score.toFixed(1)}/10).

Actuellement, vous "connaissez DE" un problème général.
Locke dirait: Vous n'avez pas encore fait ce problème VÔTRE.

Commencez par:
1. Racontez-moi la DERNIÈRE fois que vous avez VU ce problème
2. QUI était impliqué? (nom, lieu, contexte)
3. Qu'ont-ils FAIT exactement?
4. Combien de TEMPS ça a pris?

Écrivez comme si vous racontiez une histoire VRAIE.
Parce que ça DOIT être une histoire vraie.`;
  }

  /**
   * Score as-is analysis
   */
  private scoreAsIsAnalysis(asIs?: IdeaStatement['asIs']): ClarityBreakdown['asIsAnalysis'] {
    if (!asIs?.description) {
      return {
        score: 0,
        weight: 2.5,
        completed: false,
        missing: ['Décrivez la situation actuelle (processus manuel, outils utilisés)']
      };
    }
    
    const checks = {
      hasSteps: /étape|step|d'abord|ensuite|puis|finally/i.test(asIs.description),
      hasTime: /\d+\s*(heure|minute|jour|semaine)/i.test(asIs.description),
      hasCost: /\d+\s*(DH|dirham|euro|coût|cost)/i.test(asIs.description),
      hasPain: /difficile|pénible|frustrant|problème|slow|lent/i.test(asIs.description)
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const score = (passedChecks / 4) * 10;
    
    const missing: string[] = [];
    if (!checks.hasSteps) missing.push("Décrivez les étapes du processus actuel");
    if (!checks.hasTime) missing.push("Combien de temps ça prend?");
    if (!checks.hasCost) missing.push("Quel est le coût actuel?");
    if (!checks.hasPain) missing.push("Pourquoi c'est problématique?");
    
    return {
      score,
      weight: 2.5,
      completed: score >= 8.0,
      missing
    };
  }

  /**
   * Score benefits statement
   */
  private scoreBenefitsStatement(benefits?: IdeaStatement['benefits']): ClarityBreakdown['benefitsStatement'] {
    if (!benefits?.description) {
      return {
        score: 0,
        weight: 2.5,
        completed: false,
        missing: ['Décrivez les bénéfices (gain de temps, économies, impact)']
      };
    }
    
    const checks = {
      hasTimeSaved: /économi.*temps|gain.*temps|save.*time|\d+\s*heures?\s*(économisées|saved)/i.test(benefits.description),
      hasCostSaved: /économi.*\d+|save.*\d+|réduction.*coût|\d+\s*DH\s*(économisés|saved)/i.test(benefits.description),
      hasImpact: /impact|bénéfice|amélioration|improvement|personnes?\s*affectées/i.test(benefits.description),
      hasQuantified: /\d+%|\d+x|\d+\s*(fois|times)/i.test(benefits.description)
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const score = (passedChecks / 4) * 10;
    
    const missing: string[] = [];
    if (!checks.hasTimeSaved) missing.push("Combien de temps économisé?");
    if (!checks.hasCostSaved) missing.push("Combien d'argent économisé?");
    if (!checks.hasImpact) missing.push("Quel est l'impact sur les bénéficiaires?");
    if (!checks.hasQuantified) missing.push("Quantifiez les bénéfices (%, x fois)");
    
    return {
      score,
      weight: 2.5,
      completed: score >= 8.0,
      missing
    };
  }

  /**
   * Score operations needs
   */
  private scoreOperationsNeeds(operations?: IdeaStatement['operations']): ClarityBreakdown['operationsNeeds'] {
    if (!operations?.description) {
      return {
        score: 0,
        weight: 2.5,
        completed: false,
        missing: ['Décrivez les besoins opérationnels (équipe, ressources, partenaires)']
      };
    }
    
    const checks = {
      hasTeam: /équipe|team|personnes?|membres?|rôles?/i.test(operations.description),
      hasBudget: /budget|coût|financement|\d+\s*DH/i.test(operations.description),
      hasTimeline: /\d+\s*(mois|semaines?|années?)|timeline|planning/i.test(operations.description),
      hasResources: /ressources?|matériel|outils?|infrastructure/i.test(operations.description)
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const score = (passedChecks / 4) * 10;
    
    const missing: string[] = [];
    if (!checks.hasTeam) missing.push("Qui dans l'équipe? Quels rôles?");
    if (!checks.hasBudget) missing.push("Quel budget nécessaire?");
    if (!checks.hasTimeline) missing.push("Timeline de mise en œuvre?");
    if (!checks.hasResources) missing.push("Quelles ressources nécessaires?");
    
    return {
      score,
      weight: 2.5,
      completed: score >= 8.0,
      missing
    };
  }

  // ==================== DECISION SCORING ====================

  /**
   * Score decision section (40 points total)
   */
  private async scoreDecisionSection(idea: Partial<IdeaStatement>): Promise<DecisionBreakdown> {
    return {
      strategicAlignment: this.scoreStrategicAlignment(idea),
      feasibility: this.scoreFeasibility(idea),
      differentiation: this.scoreDifferentiation(idea),
      demandProof: this.scoreDemandProof(idea)
    };
  }

  private scoreStrategicAlignment(idea: Partial<IdeaStatement>): DecisionBreakdown['strategicAlignment'] {
    const moroccoPriorities = idea.strategicAlignment?.moroccoPriorities || [];
    const sdgs = (idea.strategicAlignment?.sdgs || []).map(goal => ({ goal, confidence: 0.8 }));
    
    const score = Math.min(5, moroccoPriorities.length * 1.5 + sdgs.length * 0.5);
    
    return {
      score,
      moroccoPriorities,
      sdgs
    };
  }

  private scoreFeasibility(idea: Partial<IdeaStatement>): DecisionBreakdown['feasibility'] {
    const technical = 3.5; // Default moderate
    const regulatory = 'green' as const;
    const payment = true;
    
    const score = Math.min(5, technical + (regulatory === 'green' ? 1 : 0) + (payment ? 0.5 : 0));
    
    return {
      score,
      technical,
      regulatory,
      payment
    };
  }

  private scoreDifferentiation(idea: Partial<IdeaStatement>): DecisionBreakdown['differentiation'] {
    const checks = {
      moroccanAdvantage: false,
      impossibleToCopy: false,
      tenXImprovement: false,
      networkEffects: false
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const score = (passedChecks / 4) * 5;
    
    return {
      score,
      ...checks
    };
  }

  private scoreDemandProof(idea: Partial<IdeaStatement>): DecisionBreakdown['demandProof'] {
    const receiptsCount = idea.receipts?.length || 0;
    
    let willingnessScore = 1;
    if (receiptsCount >= 200) willingnessScore = 5;
    else if (receiptsCount >= 50) willingnessScore = 4;
    else if (receiptsCount >= 10) willingnessScore = 3;
    else if (receiptsCount >= 1) willingnessScore = 2;
    
    const painLevel = 3; // Default moderate
    const score = Math.min(5, willingnessScore * 0.6 + painLevel * 0.4);
    
    return {
      score,
      receiptsCount,
      willingnessScore,
      painLevel
    };
  }

  // ==================== INTIMACY SCORING ====================

  /**
   * Score intimacy (Locke's core metric)
   */
  private async scoreIntimacy(idea: Partial<IdeaStatement>): Promise<IntimacyBreakdown> {
    const text = this.getAllText(idea);
    
    // 1. LIVED EXPERIENCE (0-3 points)
    const livedExperience = this.detectLivedExperience(text);
    
    // 2. CONVERSATION COUNT (0-3 points)
    const conversationCount = {
      count: idea.receipts?.length || 0,
      score: Math.min(3, (idea.receipts?.length || 0) / 30) // 30 conversations = 3 points
    };
    
    // 3. ITERATION DEPTH (0-2 points)
    const iterationDepth = {
      revisions: idea.revisions?.length || 0,
      marginNotes: idea.marginNotes?.length || 0,
      score: Math.min(2, ((idea.revisions?.length || 0) * 0.3) + ((idea.marginNotes?.length || 0) * 0.1))
    };
    
    // 4. SPECIFICITY LEVEL (0-2 points)
    const specificityLevel = {
      hasNames: /\b[A-Z][a-z]+ [A-Z][a-z]+/.test(text), // "CHU Ibn Sina"
      hasNumbers: /\d+\s*(heures?|minutes?|DH|fois|personnes?)/.test(text),
      hasLocations: /\b(à|chez|dans|au)\s+[A-Z][a-z]+/.test(text),
      score: 0
    };
    specificityLevel.score = [
      specificityLevel.hasNames,
      specificityLevel.hasNumbers,
      specificityLevel.hasLocations
    ].filter(Boolean).length * 0.67; // Each worth ~0.67 points
    
    const total = livedExperience.score + 
                  conversationCount.score + 
                  iterationDepth.score + 
                  specificityLevel.score;
    
    // Verdict based on total
    let verdict: IntimacyBreakdown['verdict'];
    if (total < 4) verdict = 'knowing_of';
    else if (total < 7) verdict = 'becoming_intimate';
    else verdict = 'true_knowing';
    
    return {
      livedExperience,
      conversationCount,
      iterationDepth,
      specificityLevel,
      total: Math.min(10, total),
      verdict
    };
  }

  /**
   * Detect lived experience markers
   */
  private detectLivedExperience(text: string): IntimacyBreakdown['livedExperience'] {
    const personalMarkers = [
      { pattern: /\b(j'ai|3andi|kont|عندي|كنت)\s+/i, points: 1.0 },
      { pattern: /\b(mon|ma|mes|dyali|ديالي)\s+/i, points: 0.5 },
      { pattern: /\b(hier|l-bar7|البارح|la semaine dernière)\s+/i, points: 1.0 },
      { pattern: /\b(je|ana|أنا)\s+(travaille|vis|suis|khdamt)\s+/i, points: 0.8 }
    ];
    
    let score = 0;
    const evidence: string[] = [];
    
    for (const marker of personalMarkers) {
      const match = text.match(marker.pattern);
      if (match) {
        score += marker.points;
        // Extract sentence containing the match
        const sentences = text.split(/[.!?]/);
        const sentence = sentences.find(s => marker.pattern.test(s));
        if (sentence) evidence.push(sentence.trim());
      }
    }
    
    return {
      detected: score > 0,
      score: Math.min(3, score), // Cap at 3 points
      evidence
    };
  }

  // ==================== GAP IDENTIFICATION ====================

  /**
   * Identify all gaps and prioritize them
   */
  private identifyGaps(
    idea: Partial<IdeaStatement>,
    clarity: ClarityBreakdown,
    decision: DecisionBreakdown,
    intimacy: IntimacyBreakdown
  ): ScoringGap[] {
    const gaps: ScoringGap[] = [];
    
    // CLARITY GAPS
    if (clarity.problemStatement.score < 8) {
      clarity.problemStatement.missing.forEach(missing => {
        gaps.push({
          field: missing,
          section: 'clarity',
          currentScore: clarity.problemStatement.score,
          potentialScore: 10,
          potentialGain: (10 - clarity.problemStatement.score) * 0.25,
          effort: 'low',
          priority: 90,
          action: {
            darija: `Zid: ${missing}`,
            french: `Ajoutez: ${missing}`
          },
          why: "Plus de spécificité = meilleure clarté = meilleur score",
          intimacyImpact: "Être spécifique force à PENSER profondément (Locke)"
        });
      });
    }
    
    // INTIMACY GAPS
    if (!intimacy.livedExperience.detected) {
      gaps.push({
        field: "Expérience vécue personnellement",
        section: 'intimacy',
        currentScore: intimacy.total,
        potentialScore: intimacy.total + 3,
        potentialGain: 3,
        effort: 'low',
        priority: 95, // HIGHEST priority!
        action: {
          darija: "Gol liya story wa9i3a من تجربتك الشخصية. Wach NTA شخصياً 3andek had l-mochkil?",
          french: "Racontez-moi UNE histoire vraie de votre expérience personnelle. Avez-VOUS vécu ce problème?"
        },
        why: "Locke: 'Ownership is the most intimate relationship.' Sans expérience vécue, c'est juste de la théorie.",
        example: "❌ 'Les infirmières perdent du temps' → ✅ 'Hier, j'ai passé 4 heures à chercher...'",
        intimacyImpact: "L'expérience personnelle = 3 POINTS d'intimité (30% du score total!)"
      });
    }
    
    if (intimacy.conversationCount.count < 10) {
      gaps.push({
        field: "Conversations avec utilisateurs",
        section: 'intimacy',
        currentScore: intimacy.conversationCount.score,
        potentialScore: 3,
        potentialGain: 3 - intimacy.conversationCount.score,
        effort: 'medium',
        priority: 85,
        action: {
          darija: `Khassek thdar m3a au moins 10 personnes o tjm3 reçus dyalhom. Daba 3andek ${intimacy.conversationCount.count}.`,
          french: `Vous devez parler à au moins 10 personnes et collecter leurs reçus. Vous en avez ${intimacy.conversationCount.count} actuellement.`
        },
        why: "Chaque conversation = plus d'intimité avec le problème. 10 conversations = minimum viable intimacy.",
        intimacyImpact: "Locke: Ces conversations FONT que le problème devient VÔTRE. Pas de conversations = pas d'intimité."
      });
    }
    
    if (intimacy.iterationDepth.marginNotes < 5) {
      gaps.push({
        field: "Notes de réflexion (margin notes)",
        section: 'intimacy',
        currentScore: intimacy.iterationDepth.score,
        potentialScore: 2,
        potentialGain: 2 - intimacy.iterationDepth.score,
        effort: 'low',
        priority: 70,
        action: {
          darija: "Kteb notes sur ce que tu penses pendant que tu écris. Style Locke m3a l-pencil!",
          french: "Écrivez des notes sur ce que vous PENSEZ pendant que vous rédigez. Comme Locke avec son crayon!"
        },
        why: "Les margin notes = preuve que vous PENSEZ, pas juste que vous écrivez.",
        example: "💭 'Après avoir parlé à 5 infirmières, je réalise que...'",
        intimacyImpact: "Locke: 'Always read with a pencil.' Vos notes = vos marques de crayon = votre pensée visible."
      });
    }
    
    // DECISION GAPS
    if (decision.demandProof.receiptsCount < 10) {
      gaps.push({
        field: "Preuve de demande (reçus)",
        section: 'decision',
        currentScore: decision.demandProof.score,
        potentialScore: 5,
        potentialGain: 5 - decision.demandProof.score,
        effort: 'high',
        priority: 80,
        action: {
          darija: `Jam3 reçus! Khassek au moins 10. Daba 3andek ${decision.demandProof.receiptsCount}.`,
          french: `Collectez des reçus! Vous avez besoin d'au moins 10. Vous en avez ${decision.demandProof.receiptsCount}.`
        },
        why: "Preuve > Théorie. 10 reçus = début de validation. 50+ = forte validation.",
        intimacyImpact: "Collecter des reçus = conversations = intimité croissante avec le problème."
      });
    }
    
    return gaps.filter(gap => gap.potentialGain > 0);
  }

  // ==================== QUALIFICATION ====================

  /**
   * Determine qualification tier based on scores
   */
  private determineQualification(totalScore: number, intimacyScore: number): QualificationTier {
    // Special case: High score but low intimacy
    if (totalScore >= 25 && intimacyScore < 5) {
      return {
        tier: 'promising',
        score: totalScore,
        intilaqaEligible: false,
        intilaqaProbability: 30,
        message: {
          darija: `⚠️ Score: ${totalScore}/50 (bon!) mais Intimacy: ${intimacyScore}/10 (faible).

Locke dirait: Vous "connaissez DE" votre idée, mais vous ne la CONNAISSEZ pas intimement encore.

Problème: Sans intimité, les investisseurs doutent de votre compréhension réelle.`,
          french: `⚠️ Score: ${totalScore}/50 (bien!) mais Intimité: ${intimacyScore}/10 (faible).

Locke dirait: Vous "savez DE" votre idée, mais ne la CONNAISSEZ pas intimement encore.

Problème: Sans intimité, les investisseurs doutent de votre compréhension réelle.`
        },
        nextTier: {
          name: 'qualified',
          requiredScore: 25,
          gap: 0
        }
      };
    }
    
    // Standard tiers
    if (totalScore >= 32 && intimacyScore >= 7) {
      return {
        tier: 'exceptional',
        score: totalScore,
        intilaqaEligible: true,
        intilaqaProbability: 85,
        message: {
          darija: `🏆 EXCEPTIONAL! Score: ${totalScore}/50, Intimacy: ${intimacyScore}/10

Locke serait fier. Vous CONNAISSEZ vraiment votre problème.
Pas juste "knowing OF" - TRUE KNOWING.

Intilaka: 85% de chances de financement!`,
          french: `🏆 EXCEPTIONNEL! Score: ${totalScore}/50, Intimité: ${intimacyScore}/10

Locke serait fier. Vous CONNAISSEZ vraiment votre problème.
Pas juste "connaître DE" - VRAIE CONNAISSANCE.

Intilaka: 85% de probabilité de financement!`
        },
        nextTier: null
      };
    }
    
    if (totalScore >= 25 && intimacyScore >= 6) {
      return {
        tier: 'qualified',
        score: totalScore,
        intilaqaEligible: true,
        intilaqaProbability: 65,
        message: {
          darija: `✅ QUALIFIÉ! Score: ${totalScore}/50, Intimacy: ${intimacyScore}/10

Vous avez atteint l'intimité suffisante (Locke's standard).
Eligible pour Intilaka!

Probabilité: 65%`,
          french: `✅ QUALIFIÉ! Score: ${totalScore}/50, Intimité: ${intimacyScore}/10

Vous avez atteint l'intimité suffisante (standard de Locke).
Éligible pour Intilaka!

Probabilité: 65%`
        },
        nextTier: {
          name: 'exceptional',
          requiredScore: 32,
          gap: 32 - totalScore
        }
      };
    }
    
    if (totalScore >= 20 && intimacyScore >= 4) {
      return {
        tier: 'promising',
        score: totalScore,
        intilaqaEligible: false,
        intilaqaProbability: 35,
        message: {
          darija: `💪 PROMETTEUR! Score: ${totalScore}/50, Intimacy: ${intimacyScore}/10

Bon progrès! Mais encore ${25 - totalScore} points pour qualification.

Locke: Vous "devenez intime" avec le problème. Continuez!`,
          french: `💪 PROMETTEUR! Score: ${totalScore}/50, Intimité: ${intimacyScore}/10

Bon progrès! Mais encore ${25 - totalScore} points pour qualification.

Locke: Vous "devenez intime" avec le problème. Continuez!`
        },
        nextTier: {
          name: 'qualified',
          requiredScore: 25,
          gap: 25 - totalScore
        }
      };
    }
    
    if (totalScore >= 15 || intimacyScore >= 3) {
      return {
        tier: 'developing',
        score: totalScore,
        intilaqaEligible: false,
        intilaqaProbability: 15,
        message: {
          darija: `🌱 EN DÉVELOPPEMENT. Score: ${totalScore}/50, Intimacy: ${intimacyScore}/10

Vous commencez à construire votre compréhension.
Locke: Vous êtes en train de "faire vôtre" ce problème.

Encore ${25 - totalScore} points pour qualification.`,
          french: `🌱 EN DÉVELOPPEMENT. Score: ${totalScore}/50, Intimité: ${intimacyScore}/10

Vous commencez à construire votre compréhension.
Locke: Vous êtes en train de "faire vôtre" ce problème.

Encore ${25 - totalScore} points pour qualification.`
        },
        nextTier: {
          name: 'promising',
          requiredScore: 20,
          gap: 20 - totalScore
        }
      };
    }
    
    // Unqualified
    return {
      tier: 'unqualified',
      score: totalScore,
      intilaqaEligible: false,
      intilaqaProbability: 5,
      message: {
        darija: `⚠️ PAS ENCORE PRÊT. Score: ${totalScore}/50, Intimacy: ${intimacyScore}/10

Locke dirait: Vous "connaissez DE" quelque chose, mais ne l'avez pas fait VÔTRE.

Commencez par:
1. Raconter UNE histoire vraie vécue
2. Parler à 10 personnes minimum
3. Être SPÉCIFIQUE (noms, chiffres, lieux)`,
        french: `⚠️ PAS ENCORE PRÊT. Score: ${totalScore}/50, Intimité: ${intimacyScore}/10

Locke dirait: Vous "savez DE" quelque chose, mais ne l'avez pas fait VÔTRE.

Commencez par:
1. Raconter UNE histoire vraie vécue
2. Parler à 10 personnes minimum
3. Être SPÉCIFIQUE (noms, chiffres, lieux)`
      },
      nextTier: {
        name: 'developing',
        requiredScore: 15,
        gap: 15 - totalScore
      }
    };
  }

  // ==================== HELPER METHODS ====================

  private calculatePotential(gaps: ScoringGap[], currentClarity: number, currentDecision: number, currentIntimacy: number) {
    const clarityGain = gaps.filter(g => g.section === 'clarity').reduce((sum, g) => sum + g.potentialGain, 0);
    const decisionGain = gaps.filter(g => g.section === 'decision').reduce((sum, g) => sum + g.potentialGain, 0);
    const intimacyGain = gaps.filter(g => g.section === 'intimacy').reduce((sum, g) => sum + g.potentialGain, 0);
    
    return {
      clarity: Math.min(10, currentClarity + clarityGain),
      decision: Math.min(40, currentDecision + decisionGain),
      total: Math.min(50, currentClarity + currentDecision + clarityGain + decisionGain),
      intimacy: Math.min(10, currentIntimacy + intimacyGain)
    };
  }

  private assessThinkingQuality(intimacy: IntimacyBreakdown, marginNoteCount: number): LiveScore['thinkingQuality'] {
    const signals = [
      intimacy.livedExperience.detected,
      intimacy.conversationCount.count >= 10,
      intimacy.iterationDepth.revisions >= 3,
      marginNoteCount >= 5,
      intimacy.specificityLevel.hasNames && intimacy.specificityLevel.hasNumbers
    ];
    
    const depth = signals.filter(Boolean).length;
    
    if (depth >= 4) return 'profound';
    if (depth === 3) return 'intimate';
    if (depth === 2) return 'developing';
    return 'superficial';
  }

  private sumClarityScore(breakdown: ClarityBreakdown): number {
    return (
      (breakdown.problemStatement.score * 0.25) +
      (breakdown.asIsAnalysis.score * 0.25) +
      (breakdown.benefitsStatement.score * 0.25) +
      (breakdown.operationsNeeds.score * 0.25)
    );
  }

  private sumDecisionScore(breakdown: DecisionBreakdown): number {
    return (
      breakdown.strategicAlignment.score +
      breakdown.feasibility.score +
      breakdown.differentiation.score +
      breakdown.demandProof.score
    );
  }

  private getAllText(idea: Partial<IdeaStatement>): string {
    return [
      idea.problem?.description,
      idea.asIs?.description,
      idea.benefits?.description,
      idea.solution?.description,
      idea.operations?.description
    ].filter(Boolean).join(' ');
  }

  private createDefaultGap(): ScoringGap {
    return {
      field: "Problem description",
      section: 'clarity',
      currentScore: 0,
      potentialScore: 10,
      potentialGain: 10,
      effort: 'low',
      priority: 100,
      action: {
        darija: "Wsaf l-mochkil b détail",
        french: "Décrivez le problème en détail"
      },
      why: "Commencer par définir le problème clairement",
      intimacyImpact: "Une description claire = première étape vers l'intimité"
    };
  }
}

// Export everything
export default ScoreAgent;

