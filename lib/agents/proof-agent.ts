/**
 * PROOF AGENT - Evidence Collector
 * 
 * The 3-DH receipt = Locke's pencil mark.
 * It's physical proof that user has ENGAGED with the problem intimately.
 * Not just "knowing of" demand, but PROVING demand through action.
 * 
 * Core Principle:
 * - Personalized receipt collection strategy based on idea
 * - Real-time validation and fraud detection
 * - Progress coaching and motivation
 * - Gamification of validation process
 */

import Anthropic from '@anthropic-ai/sdk';

// ==================== INTERFACES ====================

export interface IdeaStatement {
  problem: {
    who: string;
    where: string;
    painIntensity: number; // 1-5
    frequency: string;
  };
  solution: string;
  category: string;
}

export interface ReceiptStrategy {
  method: 'in_person_pitch' | 'online_survey' | 'community_outreach' | 'prototype_demo' | 'waitlist';
  
  reasoning: string; // Why this method for this idea
  
  steps: Array<{
    step: number;
    action: string;
    script?: string; // Exact words to say
    tip: string;
    estimatedTime: string; // "30 minutes"
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  
  materials: {
    needed: string[];
    templates: {
      receipt?: string; // URL to template
      pitch?: string; // Pitch script
      survey?: string; // Google Form link
    };
  };
  
  expectedResults: {
    timeframe: string; // "3-5 days"
    receipts: string; // "100-150 receipts"
    successRate: number; // 0-1 probability
    confidence: 'low' | 'medium' | 'high';
  };
  
  // Locke-inspired insights
  intimacyRequirement: string; // "You must talk face-to-face to truly understand"
  thinkingPrompts: string[]; // Questions to ask yourself during collection
}

export interface ReceiptValidation {
  receiptId: string;
  valid: boolean;
  confidence: number; // 0-1 OCR confidence
  
  extracted: {
    amount: number | null;
    date: Date | null;
    signature: boolean;
    name?: string;
  };
  
  issues: string[];
  autoApproved: boolean;
  
  fraudFlags: Array<{
    type: 'duplicate_image' | 'incorrect_amount' | 'too_old' | 'low_confidence' | 'suspicious_pattern';
    severity: 'warning' | 'error';
    message: string;
  }>;
}

export interface ProgressCoaching {
  currentCount: number;
  targetMilestone: number | null; // Next goal (10, 50, 200)
  score: number; // 1-5 willingness-to-pay score
  
  message: {
    darija: string;
    french: string;
    tone: 'motivating' | 'celebrating' | 'challenging';
  };
  
  encouragement: string;
  nextAction: string;
  
  // Locke-inspired reflection
  intimacyInsight?: string; // "These conversations are making the problem YOURS"
}

interface ExtractedReceiptData {
  amount: number | null;
  date: Date | null;
  signature: boolean;
  name?: string;
  confidence: number;
}

interface ExistingReceipt {
  id: string;
  imageHash?: string;
  amount: number;
  created_at: Date;
}

// ==================== MOCK SERVICES (to be replaced with real implementations) ====================

class MockOCRService {
  async extractReceiptData(photo: File): Promise<ExtractedReceiptData> {
    // Mock OCR - would use real OCR service
    return {
      amount: 3.0,
      date: new Date(),
      signature: true,
      name: "Test User",
      confidence: 0.9
    };
  }
}

class MockFraudDetector {
  async analyze(photo: File, existingReceipts: ExistingReceipt[]): Promise<Array<{
    type: 'duplicate_image' | 'incorrect_amount' | 'too_old' | 'low_confidence' | 'suspicious_pattern';
    severity: 'warning' | 'error';
    message: string;
  }>> {
    // Mock fraud detection - would use real image comparison
    return [];
  }
}

// ==================== MAIN CLASS ====================

export class ProofAgent {
  private claudeAPI: Anthropic;
  private ocrService: MockOCRService;
  private fraudDetector: MockFraudDetector;
  
  constructor(apiKey?: string) {
    this.claudeAPI = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
    });
    this.ocrService = new MockOCRService();
    this.fraudDetector = new MockFraudDetector();
  }

  // ==================== STRATEGY GENERATION ====================

  /**
   * Generate personalized receipt collection strategy based on idea characteristics
   */
  async generateStrategy(idea: IdeaStatement): Promise<ReceiptStrategy> {
    // Analyze idea characteristics
    const analysis = {
      targetAudience: idea.problem.who,
      location: idea.problem.where,
      painLevel: idea.problem.painIntensity,
      techSavviness: this.assessTechSavviness(idea.problem.who),
      accessibility: this.assessAccessibility(idea.problem.where)
    };
    
    // Choose best method based on analysis
    if (analysis.painLevel > 4.0 && analysis.accessibility === 'high') {
      return this.inPersonPitchStrategy(analysis);
    }
    
    if (analysis.techSavviness === 'high' && analysis.painLevel < 3.0) {
      return this.onlineSurveyStrategy(analysis);
    }
    
    if (analysis.targetAudience.toLowerCase().includes('student') || 
        analysis.targetAudience.toLowerCase().includes('étudiant') ||
        analysis.targetAudience.toLowerCase().includes('jeune')) {
      return this.communityOutreachStrategy(analysis);
    }
    
    // Default: hybrid approach
    return this.hybridStrategy(analysis);
  }

  // ==================== STRATEGY IMPLEMENTATIONS ====================

  /**
   * IN-PERSON PITCH STRATEGY (Best for high-pain problems)
   */
  private inPersonPitchStrategy(analysis: any): ReceiptStrategy {
    return {
      method: 'in_person_pitch',
      reasoning: `Votre problème a une intensité de douleur élevée (${analysis.painLevel}/5) et votre audience est accessible.

Locke dirait: Vous devez RENCONTRER ces personnes face-à-face pour vraiment CONNAÎTRE leur problème. Pas juste lire à propos. VIVRE avec eux.`,
      
      steps: [
        {
          step: 1,
          action: "Préparez votre pitch de 90 secondes",
          script: `Bonjour, je développe [VOTRE SOLUTION]. Si ça vous économise [BÉNÉFICE], paieriez-vous 3 DH aujourd'hui pour le réserver?`,
          tip: `${analysis.targetAudience} sont occupés. Soyez DIRECT et RAPIDE. Respectez leur temps.`,
          estimatedTime: "30 minutes de préparation",
          difficulty: 'easy'
        },
        {
          step: 2,
          action: `Identifiez les meilleurs moments à ${analysis.location}`,
          script: this.getTimingScript(analysis.targetAudience),
          tip: "Notez les patterns pendant 2 jours avant d'approcher",
          estimatedTime: "2-3 jours d'observation",
          difficulty: 'medium'
        },
        {
          step: 3,
          action: "Première vague: 10 personnes",
          script: `Commencez par 10 personnes. Écoutez leurs réactions. Ajustez votre pitch basé sur leurs questions.`,
          tip: `Locke: C'est ICI que vous commencez à vraiment CONNAÎTRE le problème. Pas dans les livres. Dans les CONVERSATIONS.`,
          estimatedTime: "2-3 heures",
          difficulty: 'medium'
        },
        {
          step: 4,
          action: "Demandez introductions (effet réseau)",
          script: `Après 10 reçus: "Connaissez-vous d'autres collègues qui ont ce problème?" Le réseau s'active.`,
          tip: "Les gens font confiance aux recommandations. Utilisez ça.",
          estimatedTime: "1 heure",
          difficulty: 'easy'
        },
        {
          step: 5,
          action: "Sprint final: Objectif 100 reçus",
          tip: "Momentum! Quand les gens voient que d'autres ont payé, ils suivent.",
          estimatedTime: "2-3 jours",
          difficulty: 'medium'
        }
      ],
      
      materials: {
        needed: [
          "Carnet de reçus pré-numérotés (imprimer template)",
          "Smartphone pour photos",
          "Prototype visuel (même sur papier)",
          "Badge d'identification / carte d'étudiant"
        ],
        templates: {
          receipt: "/templates/receipt-book.pdf",
          pitch: "/templates/pitch-script.md"
        }
      },
      
      expectedResults: {
        timeframe: "5-7 jours",
        receipts: "100-150 receipts",
        successRate: 0.75,
        confidence: 'high'
      },
      
      intimacyRequirement: `🎯 Locke's Insight:

Ces conversations face-à-face sont ESSENTIELLES. Vous n'allez pas juste collecter des reçus.

Vous allez VIVRE le problème à travers leurs yeux.
Vous allez ENTENDRE leurs frustrations.
Vous allez SENTIR l'urgence.

Après 100 conversations, ce problème ne sera plus "leur" problème.
Ce sera VOTRE problème.

C'est ça, la vraie connaissance. C'est ça, l'intimité.`,

      thinkingPrompts: [
        "Après chaque conversation, notez: Qu'ai-je appris de nouveau?",
        "Cette personne a-t-elle décrit le problème différemment? Pourquoi?",
        "Quelle objection ai-je entendue 3 fois? C'est important.",
        "Qui a refusé de payer? Pourquoi exactement?",
        "Qui a payé IMMÉDIATEMENT? Qu'est-ce qui les a convaincus?"
      ]
    };
  }

  /**
   * ONLINE SURVEY STRATEGY (For tech-savvy, lower-pain problems)
   */
  private onlineSurveyStrategy(analysis: any): ReceiptStrategy {
    return {
      method: 'online_survey',
      reasoning: `Votre audience est tech-savvy mais le problème a une intensité modérée. 
L'approche en ligne vous permettra de toucher plus de gens rapidement.

Mais ATTENTION (Locke): L'online = moins d'intimité. Compensez avec des questions approfondies.`,
      
      steps: [
        {
          step: 1,
          action: "Créez Google Form avec questions approfondies",
          script: `Ne demandez PAS juste "Voulez-vous ça?"

Demandez:
- Décrivez la DERNIÈRE fois que vous avez eu ce problème
- Qu'avez-vous fait pour le résoudre?
- Combien de temps avez-vous perdu?
- Sur échelle 1-10, quelle est votre frustration?`,
          tip: "Questions ouvertes = insights profonds (Locke: thinking makes it yours)",
          estimatedTime: "1 heure",
          difficulty: 'easy'
        },
        {
          step: 2,
          action: "Postez dans groupes Facebook / WhatsApp ciblés",
          script: `Trouvez groupes spécifiques à ${analysis.targetAudience}.

Message: "Je développe [SOLUTION] pour résoudre [PROBLÈME]. 
Prenez 3 min pour me dire si ça vous aiderait. 
Ceux qui valident avec 3 DH entrent dans tirage au sort: 3×50 DH!"`,
          tip: "Incentive moral: tirage au sort (pas achat de réponses)",
          estimatedTime: "2 heures",
          difficulty: 'medium'
        },
        {
          step: 3,
          action: "Collectez paiements via mobile money",
          script: `Ceux qui disent OUI → envoyez lien Barid Cash / Orange Money.

"Pour confirmer votre intérêt, envoyez 3 DH à ce numéro: [VOTRE NUMERO]
Référence: [VOTRE NOM]"`,
          tip: "Photo/screenshot du paiement = votre reçu",
          estimatedTime: "3-5 jours",
          difficulty: 'medium'
        }
      ],
      
      materials: {
        needed: [
          "Compte Orange Money / Barid Cash",
          "Google Form créé",
          "Liste de groupes Facebook/WhatsApp"
        ],
        templates: {
          survey: "/templates/google-form-template.md",
          pitch: "/templates/social-media-post.md"
        }
      },
      
      expectedResults: {
        timeframe: "7-10 jours",
        receipts: "30-50 receipts",
        successRate: 0.4,
        confidence: 'medium'
      },
      
      intimacyRequirement: `⚠️ Locke's Warning:

L'online est RAPIDE mais SUPERFICIEL.

Vous n'aurez pas les conversations profondes.
Vous ne verrez pas leurs visages.
Vous ne sentirez pas l'urgence.

Pour compenser:
1. Appelez 10 personnes qui ont répondu
2. Demandez: "Racontez-moi la dernière fois..."
3. Notez TOUT ce qu'ils disent

Ces 10 appels = votre intimité avec le problème.`,

      thinkingPrompts: [
        "Regardez les réponses ouvertes: quels mots reviennent?",
        "Qui a écrit le plus long message? Appelez cette personne!",
        "Quelqu'un a décrit le problème mieux que vous? Utilisez leurs mots!",
        "Comparez réponses online vs vos assumptions. Surprises?"
      ]
    };
  }

  /**
   * COMMUNITY OUTREACH STRATEGY (For students, young people)
   */
  private communityOutreachStrategy(analysis: any): ReceiptStrategy {
    return {
      method: 'community_outreach',
      reasoning: `Votre audience (${analysis.targetAudience}) répond bien aux approches communautaires.

Locke: Les jeunes apprennent par l'expérience collective. Créez un mouvement, pas juste une collecte.`,
      
      steps: [
        {
          step: 1,
          action: "Organisez un mini-événement (2 heures)",
          script: `"Workshop gratuit: Comment résoudre [PROBLÈME]"

Présentez votre solution. Ceux qui valident paient 3 DH pour rejoindre la beta.`,
          tip: "Les jeunes adorent les événements. Faites-en une expérience sociale.",
          estimatedTime: "1 semaine de préparation",
          difficulty: 'hard'
        },
        {
          step: 2,
          action: "Créez buzz sur réseaux sociaux",
          script: `TikTok/Instagram: Montrez le problème de façon dramatique/humoristique.

"Si tu vis ça aussi, rejoins notre mouvement pour le résoudre!"`,
          tip: "Contenu viral = reach exponentiel",
          estimatedTime: "3-5 jours",
          difficulty: 'medium'
        },
        {
          step: 3,
          action: "Programme ambassadeurs (peer-to-peer)",
          script: `Premiers 10 qui paient → deviennent ambassadeurs.

Ils collectent 10 reçus chacun = 100 reçus total!`,
          tip: "Les jeunes font confiance à leurs pairs, pas aux adultes",
          estimatedTime: "1 semaine",
          difficulty: 'easy'
        }
      ],
      
      materials: {
        needed: [
          "Lieu pour événement (café, espace coworking)",
          "Flyers imprimés",
          "Compte réseaux sociaux actif",
          "Reçus pré-imprimés"
        ],
        templates: {
          pitch: "/templates/event-pitch.md",
          survey: "/templates/social-media-content.md"
        }
      },
      
      expectedResults: {
        timeframe: "10-14 jours",
        receipts: "80-120 receipts",
        successRate: 0.65,
        confidence: 'high'
      },
      
      intimacyRequirement: `🎓 Locke for Youth:

Les jeunes créent leur identité par l'action collective.

Ce n'est pas juste un problème à résoudre.
C'est un MOUVEMENT à créer.
C'est une CAUSE à défendre.

Après 100 conversations avec des jeunes, vous ne verrez plus jamais le problème pareil.
Leur énergie, leurs idées, leur urgence - tout ça devient VÔTRE.`,

      thinkingPrompts: [
        "Quels jeunes sont les plus passionnés? Faites-en des ambassadeurs!",
        "Quelle idée folle un jeune a suggérée? Peut-être qu'elle marche!",
        "Comment les jeunes décrivent-ils le problème différemment?",
        "Quel format de contenu a le plus engagé?"
      ]
    };
  }

  /**
   * HYBRID STRATEGY (Balanced approach)
   */
  private hybridStrategy(analysis: any): ReceiptStrategy {
    return {
      method: 'prototype_demo',
      reasoning: `Approche équilibrée: combinez online (reach) + offline (intimité).

Locke: La connaissance vient de multiples expériences. Diversifiez vos sources.`,
      
      steps: [
        {
          step: 1,
          action: "Online: Créez landing page + formulaire",
          tip: "Testez l'intérêt rapidement",
          estimatedTime: "2 jours",
          difficulty: 'medium'
        },
        {
          step: 2,
          action: "Offline: Allez sur le terrain (50 reçus minimum)",
          tip: "C'est ici que vous gagnez l'intimité",
          estimatedTime: "5 jours",
          difficulty: 'medium'
        },
        {
          step: 3,
          action: "Combinez: Utilisez insights offline pour améliorer online",
          tip: "L'intimité du terrain nourrit l'efficacité online",
          estimatedTime: "3 jours",
          difficulty: 'easy'
        }
      ],
      
      materials: {
        needed: [
          "Landing page simple",
          "Reçus papier",
          "Compte mobile money"
        ],
        templates: {
          receipt: "/templates/receipt-book.pdf",
          survey: "/templates/landing-page.html"
        }
      },
      
      expectedResults: {
        timeframe: "10-12 jours",
        receipts: "60-100 receipts",
        successRate: 0.6,
        confidence: 'medium'
      },
      
      intimacyRequirement: `⚖️ Locke's Balance:

Online = données quantitatives (combien?)
Offline = données qualitatives (pourquoi?)

Les deux sont nécessaires pour TRUE KNOWING.

Sans online: vous manquez de scale
Sans offline: vous manquez de profondeur`,

      thinkingPrompts: [
        "Les réponses online matchent-elles avec ce que les gens disent face-à-face?",
        "Quelles insights du terrain devraient changer votre questionnaire online?",
        "Où est le gap entre perception (online) et réalité (offline)?"
      ]
    };
  }

  // ==================== RECEIPT VALIDATION ====================

  /**
   * Validate receipt with OCR + fraud detection
   */
  async validateReceipt(photo: File, ideaId: string, existingReceipts: ExistingReceipt[] = []): Promise<ReceiptValidation> {
    // 1. OCR Extraction
    const extracted = await this.ocrService.extractReceiptData(photo);
    
    // 2. Basic Validation
    const issues: string[] = [];
    
    if (extracted.amount !== 3.0) {
      issues.push(`Montant incorrect: ${extracted.amount} DH (doit être 3 DH)`);
    }
    
    if (extracted.date && this.isOlderThan90Days(extracted.date)) {
      issues.push(`Reçu trop ancien: ${extracted.date.toLocaleDateString()}`);
    }
    
    if (extracted.confidence < 0.6) {
      issues.push(`Photo floue (confiance: ${Math.round(extracted.confidence * 100)}%)`);
    }
    
    // 3. Fraud Detection
    const fraudFlags = await this.fraudDetector.analyze(photo, existingReceipts);
    
    // 4. Auto-Approve if clean
    const autoApproved = issues.length === 0 && 
                         fraudFlags.length === 0 && 
                         extracted.confidence > 0.8;
    
    return {
      receiptId: this.generateReceiptId(),
      valid: issues.length === 0 && fraudFlags.filter(f => f.severity === 'error').length === 0,
      confidence: extracted.confidence,
      extracted,
      issues,
      autoApproved,
      fraudFlags
    };
  }

  // ==================== PROGRESS COACHING ====================

  /**
   * Provide motivational coaching based on current progress
   */
  async provideCoaching(currentCount: number, target: number = 50): Promise<ProgressCoaching> {
    const score = this.calculateWillingnessScore(currentCount);
    
    // Milestone-based messaging
    if (currentCount === 0) {
      return this.coachingZeroReceipts();
    }
    
    if (currentCount >= 1 && currentCount < 10) {
      return this.coaching1to9Receipts(currentCount);
    }
    
    if (currentCount >= 10 && currentCount < 50) {
      return this.coaching10to49Receipts(currentCount);
    }
    
    if (currentCount >= 50 && currentCount < 200) {
      return this.coaching50to199Receipts(currentCount);
    }
    
    // 200+ receipts
    return this.coaching200PlusReceipts(currentCount);
  }

  // ==================== HELPER METHODS ====================

  private assessTechSavviness(audience: string): 'low' | 'medium' | 'high' {
    const highTech = ['developer', 'étudiant', 'student', 'entrepreneur', 'startup'];
    const lowTech = ['agriculteur', 'farmer', 'commerçant', 'vendor'];
    
    const audienceLower = audience.toLowerCase();
    
    if (highTech.some(term => audienceLower.includes(term))) {
      return 'high';
    }
    
    if (lowTech.some(term => audienceLower.includes(term))) {
      return 'low';
    }
    
    return 'medium';
  }

  private assessAccessibility(location: string): 'low' | 'medium' | 'high' {
    const highAccess = ['CHU', 'université', 'école', 'university', 'school', 'marché', 'market'];
    const lowAccess = ['rural', 'village', 'montagne', 'mountain'];
    
    const locationLower = location.toLowerCase();
    
    if (highAccess.some(term => locationLower.includes(term))) {
      return 'high';
    }
    
    if (lowAccess.some(term => locationLower.includes(term))) {
      return 'low';
    }
    
    return 'medium';
  }

  private getTimingScript(audience: string): string {
    const audienceLower = audience.toLowerCase();
    
    if (audienceLower.includes('nurse') || audienceLower.includes('infirmière')) {
      return "Heures de pause: 10h30, 15h00. Évitez 8h-9h et 12h-14h (trop occupés)";
    }
    
    if (audienceLower.includes('student') || audienceLower.includes('étudiant')) {
      return "Entre les cours: 10h-11h, 14h-15h. Évitez heures de cours.";
    }
    
    return "Observez le flux - identifiez moments calmes";
  }

  private isOlderThan90Days(date: Date): boolean {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    return date < ninetyDaysAgo;
  }

  private generateReceiptId(): string {
    return `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateWillingnessScore(count: number): number {
    if (count >= 200) return 5;
    if (count >= 50) return 4;
    if (count >= 10) return 3;
    if (count >= 1) return 2;
    return 1;
  }

  // ==================== COACHING METHODS ====================

  private coachingZeroReceipts(): ProgressCoaching {
    return {
      currentCount: 0,
      targetMilestone: 10,
      score: 1,
      message: {
        darija: `🎯 Hadaf: Jam3 au moins 10 reçus bach tbda l-validation.

Locke gal: "Thinking makes what we read ours."

Daba, nta ghadi t-KHDM machi ghi t-9RA. Ghadi tmshi t-hdar m3a les gens. Hadchi ghadi y-khlik t-3raf l-mochkil b-sa77.`,
        french: `🎯 Objectif: Collecter au moins 10 reçus pour validation initiale.

Locke a dit: "C'est la pensée qui rend nôtre ce que nous lisons."

Maintenant, vous allez AGIR pas juste LIRE. Vous allez parler aux gens. Cela va vous faire CONNAÎTRE le problème vraiment.`,
        tone: 'motivating'
      },
      encouragement: "Les premiers reçus sont les plus difficiles. Commencez par votre réseau proche.",
      nextAction: "Identifiez 3 personnes que vous connaissez qui ont ce problème. Appelez-les aujourd'hui."
    };
  }

  private coaching1to9Receipts(currentCount: number): ProgressCoaching {
    return {
      currentCount,
      targetMilestone: 10,
      score: 2,
      message: {
        darija: `💪 Mezyan! ${currentCount} reçus déjà! Kamel 7tta ${10 - currentCount} o nwasl0 10.

Chaque conversation kay-3almك shi 7aja jdida. Locke كان غادي يقول: "Nta daba kay-t9ala3 m3a l-mochkil."`,
        french: `💪 Bien! ${currentCount} reçus déjà! Plus que ${10 - currentCount} pour atteindre 10.

Chaque conversation vous APPREND quelque chose de nouveau. Locke dirait: "Vous êtes en train de vous FAMILIARISER intimement avec le problème."`,
        tone: 'motivating'
      },
      encouragement: `${currentCount} conversations = ${currentCount} perspectives. Vous CONNAISSEZ déjà mieux le problème que 95% des entrepreneurs!`,
      nextAction: "Après chaque reçu, notez: Qu'ai-je appris? (méthode Locke)",
      intimacyInsight: "Ces conversations font que le problème devient VÔTRE. C'est ça, la vraie connaissance."
    };
  }

  private coaching10to49Receipts(currentCount: number): ProgressCoaching {
    return {
      currentCount,
      targetMilestone: 50,
      score: 3,
      message: {
        darija: `🔥 Tbarkelah! ${currentCount} reçus = Validation initiale (3/5)!

Locke: "Ownership is the most intimate relationship."

Daba had l-mochkil wlla DYALK. Ma-3ad-sh mochkil dial les gens. Wlla MOCHKIL DYALK.`,
        french: `🔥 Excellent! ${currentCount} reçus = Validation initiale (3/5)!

Locke: "La propriété est la relation la plus intime."

Maintenant ce problème est VÔTRE. Ce n'est plus le problème "des gens". C'est VOTRE problème.`,
        tone: 'celebrating'
      },
      encouragement: `Avec ${currentCount} reçus, vous êtes dans le top 20% des soumissions Fikra Valley!`,
      nextAction: `Continuez le momentum! Avec 50 reçus, vous passez à 'Strong Validation' (4/5). Il vous manque ${50 - currentCount}.`,
      intimacyInsight: `Vous avez eu ${currentCount} conversations. Ce problème vit en vous maintenant. Vous le CONNAISSEZ.`
    };
  }

  private coaching50to199Receipts(currentCount: number): ProgressCoaching {
    return {
      currentCount,
      targetMilestone: 200,
      score: 4,
      message: {
        darija: `🚀 Ma-ydakch! ${currentCount} reçus = Strong Validation (4/5)!

Nta daba من أكثر الناس معرفة بهذا المشكل f Morocco!

Locke kan ghadi ykoun فخور. Nta ma-qritish ghi. NTA 3ISHT had l-mochkil m3a ${currentCount} wa7din!`,
        french: `🚀 Incroyable! ${currentCount} reçus = Validation forte (4/5)!

Vous êtes maintenant PARMI LES PLUS CONNAISSEURS de ce problème au Maroc!

Locke serait fier. Vous n'avez pas juste LU. Vous avez VÉCU ce problème avec ${currentCount} personnes!`,
        tone: 'celebrating'
      },
      encouragement: `Les investisseurs ADORENT voir ${currentCount} reçus. C'est une preuve béton!`,
      nextAction: `Plus que ${200 - currentCount} pour 5/5 (Market Proven)! Mais même maintenant, vous êtes TRÈS fundable.`,
      intimacyInsight: `${currentCount} conversations = ${currentCount} angles différents sur le même problème. Votre compréhension est PROFONDE maintenant.`
    };
  }

  private coaching200PlusReceipts(currentCount: number): ProgressCoaching {
    return {
      currentCount,
      targetMilestone: null,
      score: 5,
      message: {
        darija: `🏆 LEGENDARY! ${currentCount} reçus = Market Proven (5/5)!

John Locke: "The pencil is the most sovereign of all human influence."

Nta كتابت ${currentCount} "pencil marks" f la réalité. ${currentCount} preuves concrètes.

Hadchi machi "knowing OF". Hadchi "TRUE KNOWING".`,
        french: `🏆 LÉGENDAIRE! ${currentCount} reçus = Marché prouvé (5/5)!

John Locke: "Le crayon est le plus souverain de toutes les influences humaines."

Vous avez écrit ${currentCount} "marques de crayon" dans la réalité. ${currentCount} preuves concrètes.

Ce n'est pas "connaître DE". C'est "VRAIMENT CONNAÎTRE".`,
        tone: 'celebrating'
      },
      encouragement: `Top 1% des soumissions! Financement quasi-garanti! Les investisseurs vont se BATTRE pour vous!`,
      nextAction: "Passez à l'étape suivante: Opérations et budgétisation.",
      intimacyInsight: `${currentCount} personnes vous ont fait confiance avec 3 DH. Ce problème est INTIMEMENT vôtre maintenant. Personne ne le connaît mieux que vous.`
    };
  }
}

// Export everything
export default ProofAgent;

