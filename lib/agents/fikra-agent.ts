/**
 * FIKRA AGENT - Idea Clarifier
 * 
 * Based on John Locke's insight: "Reading furnishes the mind with materials of knowledge. 
 * It is thinking makes what we read ours."
 * 
 * FIKRA forces users to THINK deeply about their problem, not just describe it superficially.
 * Users must become INTIMATE with the problem (Locke's "true knowing"), not just "know of" it.
 */

import Anthropic from '@anthropic-ai/sdk';

// ==================== INTERFACES ====================

export interface ProblemDraft {
  text: string;
  wordCount: number;
  lastUpdated: Date;
}

export interface Gap {
  type: 'who' | 'frequency' | 'current_solution' | 'why_fails' | 'beneficiaries' | 'lived_experience';
  severity: 'critical' | 'important' | 'nice_to_have';
  detected: boolean;
  keywords?: string[]; // Keywords that indicate gap is filled
}

export interface AgentQuestion {
  gap: Gap['type'];
  question: {
    darija: string;
    french: string;
    arabic: string;
  };
  why: string; // Why this question matters
  examples: string[]; // 3-5 good examples
  badExamples?: string[]; // What NOT to say
  followUp?: string; // If they answer well, ask this next
}

export interface IntimacySignal {
  type: 'personal_experience' | 'specific_person' | 'quantified_frequency' | 'named_location' | 'concrete_example';
  detected: boolean;
  evidence?: string; // Quote from user's text
  score: number; // 0-1 contribution to intimacy
}

export interface FikraResponse {
  mode: 'listening' | 'questioning' | 'suggesting' | 'validating' | 'celebrating';
  
  // Current state
  gapsRemaining: Gap[];
  intimacyScore: number; // 0-10 (Locke's "true knowing")
  clarityScore: number; // 0-10 (traditional metric)
  
  // Agent response
  message: {
    darija: string;
    french: string;
    tone: 'curious' | 'encouraging' | 'challenging' | 'celebratory';
  };
  
  // Actionable guidance
  nextQuestion?: AgentQuestion;
  suggestions?: string[];
  examples?: {
    current: string; // What user wrote
    improved: string; // How to make it better
  };
  
  // Motivation
  progress: number; // 0-100 percentage
  milestone?: string; // "Great! You've identified WHO"
}

export interface ThinkingJourney {
  original: any;
  final: any;
  revisions: any[];
  totalThinkingTime: number;
  intimacyEvolution: number[];
}

// ==================== MAIN CLASS ====================

export class FikraAgent {
  private claudeAPI: Anthropic;
  
  constructor(apiKey?: string) {
    this.claudeAPI = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
    });
  }

  /**
   * Main analysis method - analyzes problem draft and returns agent response
   */
  async analyze(draft: ProblemDraft, previousResponses?: AgentQuestion[]): Promise<FikraResponse> {
    // 1. DETECT GAPS using NLP + pattern matching
    const gaps = this.detectGaps(draft.text);
    
    // 2. MEASURE INTIMACY (Locke's "true knowing")
    const intimacySignals = this.detectIntimacySignals(draft.text);
    const intimacyScore = this.calculateIntimacyScore(intimacySignals);
    
    // 3. CALCULATE CLARITY (traditional metric)
    const clarityScore = this.calculateClarityScore(draft.text, gaps);
    
    // 4. DETERMINE AGENT MODE
    if (draft.text.length < 20) {
      return this.listeningMode();
    }
    
    if (gaps.some(g => g.severity === 'critical' && !g.detected)) {
      return this.questioningMode(gaps, intimacySignals);
    }
    
    if (clarityScore >= 6 && intimacyScore < 7) {
      return this.challengingMode(intimacySignals); // Push for deeper intimacy
    }
    
    if (clarityScore >= 8 && intimacyScore >= 7) {
      return this.validatingMode(clarityScore, intimacyScore);
    }
    
    return this.suggestingMode(draft.text, gaps);
  }

  // ==================== GAP DETECTION ====================

  /**
   * Detect gaps in problem statement using pattern matching
   */
  private detectGaps(text: string): Gap[] {
    const gaps: Gap[] = [
      {
        type: 'who',
        severity: 'critical',
        detected: hasSpecificWho(text),
        keywords: ['infirmières', 'étudiants', 'commerçants', 'agriculteurs']
      },
      {
        type: 'frequency',
        severity: 'critical',
        detected: hasFrequency(text),
        keywords: ['kol nhar', 'kol yom', 'chaque jour', 'quotidien', 'fois par']
      },
      {
        type: 'current_solution',
        severity: 'important',
        detected: hasCurrentSolution(text),
        keywords: ['actuellement', 'daba', 'maintenant', 'kay dir', 'utilise']
      },
      {
        type: 'why_fails',
        severity: 'important',
        detected: hasWhyFails(text),
        keywords: ['ma-kaykhdamsh', 'ne marche pas', 'échoue', 'problème', 'ma-kaynsh']
      },
      {
        type: 'beneficiaries',
        severity: 'nice_to_have',
        detected: hasBeneficiaries(text),
        keywords: ['ghadi ystafd', 'bénéficie', 'aide', 'impact']
      },
      {
        type: 'lived_experience',
        severity: 'critical', // Locke's intimacy requirement!
        detected: hasLivedExperience(text),
        keywords: ['3andi', 'j\'ai vu', 'je', 'mon', 'ma', 'expérience']
      }
    ];
    
    return gaps;
  }

  // ==================== INTIMACY DETECTION ====================

  /**
   * Detect intimacy signals (Locke's "true knowing")
   */
  private detectIntimacySignals(text: string): IntimacySignal[] {
    const signals: IntimacySignal[] = [];
    
    // Personal experience (strongest signal of intimacy)
    const personalMarkers = ['3andi', 'kont', 'sheft', 'j\'ai vu', 'j\'ai vécu', 'mon expérience'];
    if (personalMarkers.some(m => text.toLowerCase().includes(m))) {
      signals.push({
        type: 'personal_experience',
        detected: true,
        score: 0.4, // Worth 4 points out of 10
        evidence: this.extractQuote(text, personalMarkers)
      });
    }
    
    // Specific person (not "people" but "Nurse Fatima at CHU")
    if (/\b[A-Z][a-z]+ (à|chez|du|de la) [A-Z][a-z]+/.test(text)) {
      signals.push({
        type: 'specific_person',
        detected: true,
        score: 0.2,
        evidence: this.extractQuote(text, [])
      });
    }
    
    // Quantified frequency (not "often" but "6 times per day")
    if (/\d+\s*(fois|times|مرات|مرة)\s*(par|par|في)/.test(text)) {
      signals.push({
        type: 'quantified_frequency',
        detected: true,
        score: 0.2
      });
    }
    
    // Named location (not "hospital" but "CHU Ibn Sina")
    const namedLocationPattern = /(CHU|Hôpital|Université|École|Souk|Marché)\s+[A-Z][a-z]+/;
    if (namedLocationPattern.test(text)) {
      signals.push({
        type: 'named_location',
        detected: true,
        score: 0.1
      });
    }
    
    // Concrete example (story, anecdote)
    if (text.length > 200 && /par exemple|مثلا|like when|last week/.test(text)) {
      signals.push({
        type: 'concrete_example',
        detected: true,
        score: 0.1
      });
    }
    
    return signals;
  }

  /**
   * Calculate intimacy score (0-10) from signals
   */
  private calculateIntimacyScore(signals: IntimacySignal[]): number {
    const total = signals.reduce((sum, s) => sum + (s.detected ? s.score : 0), 0);
    return Math.min(10, total * 10); // Convert to 0-10 scale
  }

  /**
   * Calculate clarity score based on completeness
   */
  private calculateClarityScore(text: string, gaps: Gap[]): number {
    const totalGaps = gaps.length;
    const filledGaps = gaps.filter(g => g.detected).length;
    
    // Weight by severity
    const criticalFilled = gaps.filter(g => g.severity === 'critical' && g.detected).length;
    const criticalTotal = gaps.filter(g => g.severity === 'critical').length;
    
    const basicScore = (filledGaps / totalGaps) * 10;
    const criticalBonus = (criticalFilled / criticalTotal) * 2;
    
    // Word count bonus (completeness)
    const wordCountBonus = Math.min(2, text.split(/\s+/).length / 100);
    
    return Math.min(10, basicScore + criticalBonus + wordCountBonus);
  }

  // ==================== AGENT MODES ====================

  /**
   * LISTENING MODE - User just started typing
   */
  private listeningMode(): FikraResponse {
    return {
      mode: 'listening',
      gapsRemaining: [],
      intimacyScore: 0,
      clarityScore: 0,
      message: {
        darija: "Ana hna... Kteb bzaf, gol liya kolchi 3la had l-mochkil 🎯",
        french: "Je vous écoute... Écrivez autant que vous voulez, dites-moi tout sur ce problème 🎯",
        tone: 'encouraging'
      },
      progress: 0
    };
  }

  /**
   * QUESTIONING MODE - Socratic method to fill gaps
   */
  private questioningMode(gaps: Gap[], intimacySignals: IntimacySignal[]): FikraResponse {
    // Prioritize critical gaps, especially lived_experience
    const criticalGaps = gaps.filter(g => g.severity === 'critical' && !g.detected);
    const targetGap = criticalGaps.find(g => g.type === 'lived_experience') || criticalGaps[0];
    
    const questions = this.getQuestionBank();
    const nextQuestion = questions[targetGap.type];
    
    return {
      mode: 'questioning',
      gapsRemaining: criticalGaps,
      intimacyScore: this.calculateIntimacyScore(intimacySignals),
      clarityScore: 0,
      message: {
        darija: nextQuestion.question.darija,
        french: nextQuestion.question.french,
        tone: 'curious'
      },
      nextQuestion,
      progress: ((6 - criticalGaps.length) / 6) * 100,
      milestone: criticalGaps.length === 5 ? "Premier pas!" : undefined
    };
  }

  /**
   * CHALLENGING MODE - Push for deeper intimacy (Locke's insight)
   */
  private challengingMode(signals: IntimacySignal[]): FikraResponse {
    const lackingIntimacy = signals.filter(s => !s.detected);
    const challenge = this.generateChallenge(lackingIntimacy[0]?.type);
    
    return {
      mode: 'questioning',
      gapsRemaining: [],
      intimacyScore: this.calculateIntimacyScore(signals),
      clarityScore: 7.5,
      message: {
        darija: challenge.darija,
        french: challenge.french,
        tone: 'challenging'
      },
      suggestions: [
        "Racontez UNE histoire concrète vécue personnellement",
        "Donnez UN exemple précis avec noms, dates, lieux",
        "Décrivez la DERNIÈRE fois que vous avez vu ce problème (hier? la semaine dernière?)"
      ],
      progress: 70
    };
  }

  /**
   * SUGGESTING MODE - Provide concrete improvements
   */
  private suggestingMode(text: string, gaps: Gap[]): FikraResponse {
    const suggestions: string[] = [];
    
    if (!gaps.find(g => g.type === 'who')?.detected) {
      suggestions.push("Soyez plus précis sur QUI a le problème (profession + lieu)");
    }
    if (!gaps.find(g => g.type === 'frequency')?.detected) {
      suggestions.push("Ajoutez la FRÉQUENCE (combien de fois par jour/semaine?)");
    }
    
    return {
      mode: 'suggesting',
      gapsRemaining: gaps.filter(g => !g.detected),
      intimacyScore: 3,
      clarityScore: 4,
      message: {
        darija: "Mezyan, wakha ymken tzid t3ammer chchwiya... 💡",
        french: "Bien, mais vous pouvez encore améliorer... 💡",
        tone: 'encouraging'
      },
      suggestions,
      progress: 40
    };
  }

  /**
   * VALIDATING MODE - User achieved true knowing
   */
  private validatingMode(clarityScore: number, intimacyScore: number): FikraResponse {
    return {
      mode: 'celebrating',
      gapsRemaining: [],
      intimacyScore,
      clarityScore,
      message: {
        darija: `🎉 Bravo! Waccha nta FAHM l-mochkil b mazyan! Score dial clarity: ${clarityScore.toFixed(1)}/10, Intimacy: ${intimacyScore.toFixed(1)}/10.

John Locke kan ghadi ykoun فخور بك - nta ma-qritish ghi 3la l-mochkil, nta 3asht had l-mochkil o khlitiه dyalk!

Daba nmshيو l-étape jaya: ch7al kay-khsar had l-mochkil daba?`,
        french: `🎉 Excellent! Vous CONNAISSEZ vraiment ce problème! Score de clarté: ${clarityScore.toFixed(1)}/10, Intimité: ${intimacyScore.toFixed(1)}/10.

John Locke serait fier - vous n'avez pas juste LU à propos du problème, vous l'avez VÉCU et fait VÔTRE!

Passons à l'étape suivante: combien ce problème coûte-t-il actuellement?`,
        tone: 'celebratory'
      },
      progress: 100,
      milestone: "🏆 Intimité atteinte! (Locke's true knowing)"
    };
  }

  // ==================== QUESTION BANK ====================

  private getQuestionBank(): Record<Gap['type'], AgentQuestion> {
    return {
      who: {
        gap: 'who',
        question: {
          darija: "Shkoun b zzabt li 3andu had l-mochkil? Ma-tgolich 'les gens' - gol liya مثلا: 'les infirmières dial CHU Ibn Sina' wla 'les étudiants 2ème Bac Maths'.",
          french: "Qui EXACTEMENT a ce problème? Ne dites pas 'les gens' - dites-moi par exemple: 'les infirmières du CHU Ibn Sina' ou 'les étudiants en 2ème Bac Maths'.",
          arabic: "من بالضبط لديه هذه المشكلة؟ لا تقل 'الناس' - قل مثلا: 'الممرضات في CHU ابن سينا'"
        },
        why: "Plus vous êtes précis sur QUI, plus votre idée sera crédible. Locke: vous devez CONNAÎTRE intimement qui souffre, pas juste 'savoir de' qui souffre.",
        examples: [
          "Les infirmières du service cardiologie au CHU Ibn Sina à Rabat",
          "Les étudiants en 2ème année Bac Sciences Maths dans les lycées ruraux",
          "Les petits agriculteurs (5-15 hectares) de la région Saïs",
          "Les restaurateurs de Fès médina (50-200 couverts/jour)"
        ],
        badExamples: [
          "❌ Les gens au Maroc",
          "❌ Les professionnels",
          "❌ Tout le monde",
          "❌ La population"
        ]
      },
      
      frequency: {
        gap: 'frequency',
        question: {
          darija: "Ch7al men mara kay-wqa3 had l-mochkil? Gol liya b raqm: 'kol nhar' wla '3 marat f simana' wla 'مرة كل شهر'?",
          french: "Combien de fois ce problème arrive? Donnez-moi un chiffre: 'chaque jour' ou '3 fois par semaine' ou 'une fois par mois'?",
          arabic: "كم مرة تحدث هذه المشكلة؟ أعطني رقم"
        },
        why: "La fréquence prouve la gravité. Un problème quotidien ≠ un problème mensuel. Locke: vous devez CONNAÎTRE le rythme intimement.",
        examples: [
          "6-8 fois par shift de 8 heures",
          "Quotidiennement pendant la période des examens (3 mois)",
          "Chaque jour de marché (mardi et samedi)",
          "2-3 heures perdues chaque matin"
        ],
        badExamples: [
          "❌ Souvent",
          "❌ Régulièrement",
          "❌ De temps en temps",
          "❌ Parfois"
        ]
      },
      
      lived_experience: {
        gap: 'lived_experience',
        question: {
          darija: "Wach NTA/NTI شخصياً 3andi/3andek had l-mochkil? Wla shefti b 3inik shi 7ed 3andu? Gol liya story wa9i3a.",
          french: "Avez-VOUS personnellement vécu ce problème? Ou l'avez-vous vu de vos propres yeux? Racontez-moi une histoire vraie.",
          arabic: "هل عشت أنت شخصيا هذه المشكلة؟ أو رأيتها بعينك؟"
        },
        why: "Locke: 'Thinking makes what we read OURS.' Vous devez avoir une relation INTIME avec le problème. Pas juste lire à propos. VIVRE.",
        examples: [
          "Oui, j'ai passé 4 heures hier à chercher un défibrillateur pendant une urgence",
          "Ma sœur a raté son Bac parce qu'elle ne comprenait pas les cours en français",
          "J'ai vu mon père vendre ses tomates à 0.50 DH/kg après une semaine de travail",
          "Chaque matin, je perds 45 minutes dans les embouteillages à Casablanca"
        ],
        badExamples: [
          "❌ J'ai lu que les gens ont ce problème",
          "❌ On m'a dit que c'est un problème",
          "❌ J'ai vu dans les actualités",
          "❌ Tout le monde sait que..."
        ],
        followUp: "Racontez-moi la DERNIÈRE fois (date précise) où vous avez vu ce problème. Que s'est-il passé exactement?"
      },
      
      current_solution: {
        gap: 'current_solution',
        question: {
          darija: "Ash kay-dirou daba bach y-7alو had l-mochkil? Wasaf liya étape par étape.",
          french: "Que font-ils MAINTENANT pour résoudre ce problème? Décrivez-moi étape par étape.",
          arabic: "ماذا يفعلون الآن لحل هذه المشكلة؟"
        },
        why: "Comprendre la solution actuelle révèle pourquoi elle échoue. C'est là qu'est l'opportunité.",
        examples: [
          "Ils appellent 3-4 services par téléphone, souvent sans réponse (10 min perdues)",
          "Ils regardent des vidéos YouTube en français qu'ils ne comprennent pas",
          "Ils vendent aux intermédiaires qui prennent 75% du prix",
          "Ils écrivent dans un cahier papier qui est perdu 50% du temps"
        ]
      },
      
      why_fails: {
        gap: 'why_fails',
        question: {
          darija: "3lash l-7al li kayn daba ma-kaykhdamsh? Ash l-mochkil fih?",
          french: "Pourquoi la solution actuelle NE MARCHE PAS? Quel est le problème avec elle?",
          arabic: "لماذا الحل الحالي لا يعمل؟"
        },
        why: "C'est ici que vous montrez votre compréhension INTIME. Pas d'intimacy = pas de vraie solution.",
        examples: [
          "Le cahier n'est jamais à jour car personne ne prend le temps d'écrire pendant les urgences",
          "Les explications sont en français académique, pas en Darija que les élèves comprennent",
          "Les intermédiaires contrôlent le marché, pas de concurrence possible",
          "Le téléphone ne répond pas car les gens sont occupés avec les patients"
        ]
      },
      
      beneficiaries: {
        gap: 'beneficiaries',
        question: {
          darija: "Shkoun ghadi y-stafd mn l-7al? Direct o indirect?",
          french: "Qui va bénéficier de la solution? Directement et indirectement?",
          arabic: "من سيستفيد من الحل؟"
        },
        why: "Montrez l'impact complet. Plus large l'impact, plus forte l'opportunité.",
        examples: [
          "Direct: 450 infirmières + 120 médecins. Indirect: 2,500 patients/jour",
          "Direct: 280,000 lycéens ruraux. Indirect: leurs familles + le système éducatif national",
          "Direct: 1,200 agriculteurs. Indirect: 350 restaurants + consommateurs finaux"
        ]
      }
    };
  }

  // ==================== HELPER METHODS ====================

  private generateChallenge(missingSignal?: IntimacySignal['type']): { darija: string; french: string } {
    const challenges = {
      personal_experience: {
        darija: "Nta katgol 'les gens 3andhom had l-mochkil'... Wakha, mais NTA شخصياً? Wach shefti b 3aynik? Locke galلنا: ma-kafiش t9ra 3la shi 7aja, khassek t3ichها!",
        french: "Vous dites 'les gens ont ce problème'... OK, mais VOUS personnellement? L'avez-vous VU de vos yeux? Locke nous dit: il ne suffit pas de LIRE à propos de quelque chose, il faut le VIVRE!"
      },
      specific_person: {
        darija: "Katgol 'les professionnels'... Shkoun b ssmiya? Locke kan ghadi ygol: ma-3arfتش شي 7اجة 7atta t3raf person précis.",
        french: "Vous dites 'les professionnels'... Qui NOMMÉMENT? Locke dirait: vous ne CONNAISSEZ pas quelque chose jusqu'à ce que vous connaissiez une personne précise."
      },
      concrete_example: {
        darija: "Katgol mزyan... Wakha gol liya story wa9i3a. John Locke: l-m3rifa الحقيقية جات من تجارب محددة, machi كلام عام.",
        french: "Vous expliquez bien... Mais racontez-moi UNE histoire vraie. John Locke: la vraie connaissance vient d'expériences CONCRÈTES, pas de généralités."
      },
      quantified_frequency: {
        darija: "Katgol 'bzaf'... Ch7al b zzabt? Locke: l-m3rifa الحقيقية kayna f détails.",
        french: "Vous dites 'souvent'... Combien EXACTEMENT? Locke: la vraie connaissance est dans les détails."
      },
      named_location: {
        darija: "Katgol 'f l-hopital'... Shkoun l-hopital? Locke: ma-t3rafش shi 7aja 7atta t3raf blasa b ssmiya.",
        french: "Vous dites 'à l'hôpital'... QUEL hôpital? Locke: vous ne connaissez pas quelque chose tant que vous ne connaissez pas le lieu précis."
      }
    };
    
    return challenges[missingSignal || 'personal_experience'];
  }

  private extractQuote(text: string, markers: string[]): string {
    // Extract sentence containing marker
    const sentences = text.split(/[.!?]+/);
    for (const marker of markers) {
      const sentence = sentences.find(s => s.toLowerCase().includes(marker.toLowerCase()));
      if (sentence) {
        return sentence.trim();
      }
    }
    return text.slice(0, 100);
  }

  // ==================== DATABASE METHODS ====================

  /**
   * Save user's "pencil marks" (Locke's method)
   */
  async saveMarginNote(ideaId: string, section: string, note: string): Promise<void> {
    // TODO: Implement database save
    console.log('Margin note saved:', { ideaId, section, note });
  }

  /**
   * Show evolution of user's thinking (like Locke's annotated Bleak House)
   */
  async getThinkingJourney(ideaId: string): Promise<ThinkingJourney> {
    // TODO: Implement database fetch
    return {
      original: {},
      final: {},
      revisions: [],
      totalThinkingTime: 0,
      intimacyEvolution: []
    };
  }

  private calculateThinkingTime(revisions: any[]): number {
    if (revisions.length < 2) return 0;
    const first = new Date(revisions[0].timestamp);
    const last = new Date(revisions[revisions.length - 1].timestamp);
    return Math.floor((last.getTime() - first.getTime()) / 1000 / 60); // minutes
  }
}

// ==================== HELPER FUNCTIONS ====================

export function hasSpecificWho(text: string): boolean {
  // Check for specific professions, organizations, demographics
  const specificPatterns = [
    /infirmières?\s+(du|de|à|dial)\s+\w+/i,
    /étudiants?\s+(en|de|dial)\s+\w+/i,
    /agriculteurs?\s+(de|région|dial)\s+\w+/i,
    /commerçants?\s+(de|du|dial)\s+\w+/i,
    /\b[A-Z][a-z]+\s+(du|de|à)\s+[A-Z][a-z]+/,
    /(professeurs?|médecins?|enseignants?)\s+(de|du|à)\s+\w+/i
  ];
  
  return specificPatterns.some(p => p.test(text));
}

export function hasFrequency(text: string): boolean {
  const frequencyPatterns = [
    /\d+\s*(fois|times|مرات)/i,
    /(kol|chaque|every)\s+(nhar|yom|jour|day)/i,
    /(quotidien|daily|يومي)/i,
    /\d+\s*heures?\s*par\s*(jour|shift|day)/i,
    /(matin|soir|après-midi)\s*chaque/i,
    /\d+\s*(fois|مرات)\s*(par|f)\s*(jour|yom|semaine|simana)/i
  ];
  
  return frequencyPatterns.some(p => p.test(text));
}

export function hasLivedExperience(text: string): boolean {
  const personalMarkers = [
    /(j'ai|3andi|kont|sheft|عندي|كنت|شفت)\s+/i,
    /(mon|ma|mes|dyali|ديالي)\s+/i,
    /(hier|l-bar7|البارح|la semaine dernière|last week)/i,
    /(je|ana|أنا)\s+(travaille|khdamt|kount|كنت)/i,
    /j'ai\s+(vu|vécu|expérimenté|connu)/i,
    /personnellement/i
  ];
  
  return personalMarkers.some(p => p.test(text));
}

export function hasCurrentSolution(text: string): boolean {
  const currentSolutionPatterns = [
    /(actuellement|daba|maintenant|currently)/i,
    /(ils?\s+|on\s+)?(utilisent?|kay\s*dir|kay\s*dirou|font)/i,
    /solution\s+(actuelle|daba|courante)/i,
    /(pour\s+résoudre|bach\s+y-?7al)/i,
    /étape\s*par\s*étape/i
  ];
  
  return currentSolutionPatterns.some(p => p.test(text));
}

export function hasWhyFails(text: string): boolean {
  const failurePatterns = [
    /(ma-?kay\s*khdamش|ne\s+marche\s+pas|doesn't\s+work)/i,
    /(échoue|فشل|fail)/i,
    /(problème|مشكل|مشكلة|problem)\s+(avec|m3a|في)/i,
    /ma-?kaynش/i,
    /pourquoi.*pas/i,
    /parce\s+que/i
  ];
  
  return failurePatterns.some(p => p.test(text));
}

export function hasBeneficiaries(text: string): boolean {
  const beneficiaryPatterns = [
    /(ghadi\s+y-?stafd|bénéfici|يستفيد)/i,
    /(aide|ساعد|help)/i,
    /(impact|تأثير|effect)\s+(sur|3la|على)/i,
    /(pour|l)\s+(aider|m3awen)/i,
    /direct.*indirect/i
  ];
  
  return beneficiaryPatterns.some(p => p.test(text));
}

// Export everything
export default FikraAgent;

