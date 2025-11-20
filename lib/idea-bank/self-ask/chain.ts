/**
 * Conversational Self-Ask Chain for WhatsApp Idea Refinement
 * 
 * Asks 8 follow-up questions in Darija to refine ideas
 * Processes responses with NLP and adaptive questioning
 */

import { createClient } from '@/lib/supabase-server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { randomUUID } from 'crypto';
import { MOROCCO_PRIORITIES } from '@/lib/idea-bank/scoring/morocco-priorities';

/**
 * Question definition
 */
export interface Question {
  id: string;
  order: number;
  questionText: {
    darija: string;
    fr: string;
    ar: string;
  };
  questionType: 'target_segment' | 'willingness_to_pay' | 'revenue_model' | 'team' | 'morocco_priorities' | 'cost_structure' | 'quick_win' | 'regulatory';
  required: boolean;
  followUpQuestions?: string[];
}

/**
 * User response
 */
export interface UserResponse {
  questionId: string;
  originalText: string; // Original Darija/French/Arabic response
  extractedData: Record<string, any>;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number; // 0-1
  entities: {
    prices?: number[];
    names?: string[];
    locations?: string[];
    numbers?: number[];
  };
  timestamp: string;
}

/**
 * Progress tracking
 */
export interface Progress {
  ideaId: string;
  currentQuestion: number;
  completedQuestions: string[];
  skippedQuestions: string[];
  totalQuestions: number;
  percentage: number;
  estimatedTimeRemaining: number; // minutes
}

/**
 * Structured data extracted from all responses
 */
export interface StructuredData {
  targetSegment?: string;
  willingnessToPay?: {
    amount: number;
    currency: string;
    frequency: string;
  };
  revenueModel?: string;
  team?: {
    members: string[];
    partnerships: string[];
  };
  localMoat?: string;
  costStructure?: {
    initial: number;
    monthly: number;
    currency: string;
  };
  quickWin?: string;
  regulatory?: {
    approvals: string[];
    notes: string;
  };
  confidence: number;
  completeness: number; // 0-100
}

/**
 * The 8 core questions
 */
export const CORE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    order: 1,
    questionText: {
      darija: 'Shkoun 3andu had l-mochkil bzaf? (منين كيتأثر بزاف؟)',
      fr: 'Qui est le plus affecté par ce problème ?',
      ar: 'من الأكثر تأثراً بهذه المشكلة؟',
    },
    questionType: 'target_segment',
    required: true,
  },
  {
    id: 'q2',
    order: 2,
    questionText: {
      darija: 'Ch7al ta-ykhlass bach y7al had l-mochkil? (قداش كيخلي يدفع باش يحل المشكل؟)',
      fr: 'Combien serait prêt à payer pour résoudre ce problème ?',
      ar: 'كم سيكون مستعداً للدفع لحل هذه المشكلة؟',
    },
    questionType: 'willingness_to_pay',
    required: true,
  },
  {
    id: 'q3',
    order: 3,
    questionText: {
      darija: 'Kifash ghadi ndakhlo l-flouss kol shahar? (كيفاش غادي ندخلو الفلوس كل شهر؟)',
      fr: 'Comment allez-vous générer des revenus chaque mois ?',
      ar: 'كيف ستحقق إيرادات كل شهر؟',
    },
    questionType: 'revenue_model',
    required: true,
  },
  {
    id: 'q4',
    order: 4,
    questionText: {
      darija: 'Shkoun ghadi ybanilna f\'l-awwal? (منين غادي يبان لنا فالأول؟)',
      fr: 'Qui va vous aider au début ? (équipe, partenaires)',
      ar: 'من سيساعدك في البداية؟ (فريق، شركاء)',
    },
    questionType: 'team',
    required: false,
  },
  {
    id: 'q5',
    order: 5,
    questionText: {
      darija: 'Wash fikrtak kat-sada9 m3a shi awlawiya men dawla?\n\nKhtar wahd wla bzzaf:\n1. Green Morocco / L-Maghrib l-akhdar\n2. Digital 2025 / L-Maghrib r-raqami\n3. Youth Employment / Tashghil sh-shabab\n4. Women Entrepreneurship / Riyada n-nisa\n5. Rural Development / Tanmiya l-qrawiya\n6. Healthcare / Si7a\n7. Education / Ta3lim\n8. None / Walo',
      fr: 'Votre idée s\'aligne-t-elle avec des priorités gouvernementales ?\n\nChoisissez une ou plusieurs:\n1. Green Morocco Plan\n2. Digital Morocco 2025\n3. Emploi des Jeunes\n4. Entrepreneuriat Féminin\n5. Développement Rural\n6. Santé\n7. Éducation\n8. Aucune',
      ar: 'هل تتماشى فكرتك مع أولويات حكومية؟\n\nاختر واحدة أو أكثر:\n1. المغرب الأخضر\n2. المغرب الرقمي 2025\n3. تشغيل الشباب\n4. ريادة الأعمال النسائية\n5. التنمية القروية\n6. الصحة\n7. التعليم\n8. لا شيء',
    },
    questionType: 'morocco_priorities',
    required: false,
  },
  {
    id: 'q6',
    order: 6,
    questionText: {
      darija: 'Fin ghadi n9addo l-flouss? (فين غادي نقصدو الفلوس؟)',
      fr: 'Où allez-vous dépenser l\'argent ? (structure des coûts)',
      ar: 'أين ستنفق المال؟ (هيكل التكاليف)',
    },
    questionType: 'cost_structure',
    required: true,
  },
  {
    id: 'q7',
    order: 7,
    questionText: {
      darija: 'Ash ghadi nbiwo f 3 ashor? (أش غادي نبينو ف 3 أشهر؟)',
      fr: 'Que pouvez-vous accomplir en 3 mois ? (victoire rapide)',
      ar: 'ماذا يمكنك إنجازه في 3 أشهر؟ (نصر سريع)',
    },
    questionType: 'quick_win',
    required: true,
  },
  {
    id: 'q8',
    order: 8,
    questionText: {
      darija: 'Shkoun khasso l-government yawafeq? (منين خاصو الحكومة يوافق؟)',
      fr: 'Qui au gouvernement doit approuver ? (vérification réglementaire)',
      ar: 'من في الحكومة يجب أن يوافق؟ (التحقق التنظيمي)',
    },
    questionType: 'regulatory',
    required: false,
  },
];

/**
 * Darija number mapping
 */
const DARIJA_NUMBERS: Record<string, number> = {
  'wahd': 1, 'wahed': 1, 'w7ed': 1,
  'juj': 2, 'joj': 2, 'j2': 2,
  'tlata': 3, 'tlatha': 3, 't3': 3,
  'rb3a': 4, 'rba3a': 4, 'r4': 4,
  'khamsa': 5, 'kh5': 5,
  'sitta': 6, 's6': 6,
  'sba3': 7, 's7': 7,
  'tmania': 8, 't8': 8,
  'ts3ud': 9, 't9': 9,
  '3ashra': 10, '3chra': 10, '10': 10,
  '3ashrin': 20, '3chrin': 20,
  'tlatin': 30, 'tlathin': 30,
  'rb3in': 40, 'rba3in': 40,
  'khamsin': 50, 'khmsin': 50,
  'sittin': 60,
  'sab3in': 70,
  'tmanin': 80,
  'ts3in': 90,
  'miya': 100, 'meya': 100,
  'alf': 1000, 'alef': 1000,
};

/**
 * Extract entities from text
 */
export function extractEntities(text: string): {
  prices: number[];
  names: string[];
  locations: string[];
  numbers: number[];
} {
  const lower = text.toLowerCase();
  const entities = {
    prices: [] as number[],
    names: [] as string[],
    locations: [] as string[],
    numbers: [] as number[],
  };

  // Extract prices (EUR, DH, dirham, euro)
  const pricePatterns = [
    /(\d+)\s*(euro|eur|dh|dirham|درهم|يورو)/gi,
    /(euro|eur|dh|dirham|درهم|يورو)\s*(\d+)/gi,
  ];
  pricePatterns.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const num = parseInt(match[1] || match[2]);
      if (!isNaN(num)) entities.prices.push(num);
    }
  });

  // Extract regular numbers
  const numberMatches = text.match(/\d+/g);
  if (numberMatches) {
    entities.numbers = numberMatches.map((n) => parseInt(n));
  }

  // Extract Darija numbers
  Object.entries(DARIJA_NUMBERS).forEach(([word, num]) => {
    if (lower.includes(word)) {
      entities.numbers.push(num);
    }
  });

  // Extract locations (common Moroccan cities)
  const moroccoCities = [
    'casablanca', 'casa', 'rabat', 'fes', 'fès', 'marrakech', 'tanger', 'agadir',
    'casablanca', 'الدار البيضاء', 'الرباط', 'فاس', 'مراكش', 'طنجة', 'أغادير',
  ];
  moroccoCities.forEach((city) => {
    if (lower.includes(city)) {
      entities.locations.push(city);
    }
  });

  // Extract names (capitalized words, common patterns)
  const namePattern = /\b([A-ZÀ-ÿ][a-zà-ÿ]+)\b/g;
  const nameMatches = text.match(namePattern);
  if (nameMatches) {
    entities.names = nameMatches.filter((name) => name.length > 2);
  }

  return entities;
}

/**
 * Detect sentiment
 */
export function detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lower = text.toLowerCase();

  const positiveKeywords = [
    'mzyan', 'mzyana', 'bghiti', 'bghit', 'khass', 'khassna', 'm7im', 'm7ima',
    'bien', 'bon', 'excellent', 'parfait', 'génial', 'super',
    'جيد', 'ممتاز', 'رائع', 'ممتاز',
  ];

  const negativeKeywords = [
    'mashi', 'mach', 'walo', 'ma kaynach', 'ma kaynch', 's3ib', 's3iba',
    'non', 'pas', 'difficile', 'compliqué', 'problème',
    'لا', 'صعب', 'مشكلة', 'صعب',
  ];

  const positiveCount = positiveKeywords.filter((kw) => lower.includes(kw)).length;
  const negativeCount = negativeKeywords.filter((kw) => lower.includes(kw)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  text: string,
  entities: ReturnType<typeof extractEntities>,
  questionType: Question['questionType']
): number {
  let confidence = 0.5; // Base confidence

  // Length indicator
  if (text.length >= 20) confidence += 0.1;
  if (text.length >= 50) confidence += 0.1;

  // Entity presence
  if (questionType === 'willingness_to_pay' && entities.prices.length > 0) confidence += 0.2;
  if (questionType === 'cost_structure' && entities.prices.length > 0) confidence += 0.2;
  if (questionType === 'target_segment' && entities.names.length > 0) confidence += 0.1;
  if (questionType === 'team' && entities.names.length > 0) confidence += 0.2;
  if (questionType === 'morocco_priorities' && text.match(/\b([1-8]|green|digital|youth|women|rural|health|education|akhdar|raqami|shabab|nisa|qrawi|si7a|ta3lim)\b/i)) confidence += 0.3;

  // Numbers present
  if (entities.numbers.length > 0) confidence += 0.1;

  // Sentiment
  const sentiment = detectSentiment(text);
  if (sentiment === 'positive') confidence += 0.1;

  return Math.min(1, confidence);
}

/**
 * Parse response based on question type
 */
export function parseResponse(
  text: string,
  questionType: Question['questionType']
): Record<string, any> {
  const entities = extractEntities(text);
  const sentiment = detectSentiment(text);

  switch (questionType) {
    case 'target_segment':
      return {
        segment: text,
        entities: entities.names,
        sentiment,
      };

    case 'willingness_to_pay':
      return {
        amount: entities.prices[0] || entities.numbers[0] || null,
        currency: text.includes('dh') || text.includes('dirham') || text.includes('درهم') ? 'MAD' :
          text.includes('eur') || text.includes('euro') || text.includes('يورو') ? 'EUR' : 'MAD',
        frequency: text.includes('shahar') || text.includes('mois') || text.includes('شهر') ? 'monthly' :
          text.includes('sana') || text.includes('an') || text.includes('سنة') ? 'yearly' : 'one_time',
        sentiment,
      };

    case 'revenue_model':
      return {
        model: text,
        mentionsSubscription: text.includes('abonnement') || text.includes('subscription') || text.includes('اشتراك'),
        mentionsOneTime: text.includes('une fois') || text.includes('one time') || text.includes('مرة واحدة'),
        sentiment,
      };

    case 'team':
      return {
        members: entities.names,
        partnerships: text,
        sentiment,
      };

    case 'morocco_priorities':
      // Extract Morocco priority IDs from response
      const detectedPriorities: string[] = [];
      const lowerText = text.toLowerCase();

      // Map user input to priority IDs
      const priorityMap: Record<string, string> = {
        // Green Morocco
        'green': 'green_morocco',
        'akhdar': 'green_morocco',
        'climate': 'green_morocco',
        'environment': 'green_morocco',
        'solar': 'green_morocco',
        'renewable': 'green_morocco',
        '1': 'green_morocco',
        // Digital Morocco
        'digital': 'digital_morocco',
        'raqami': 'digital_morocco',
        'tech': 'digital_morocco',
        'technology': 'digital_morocco',
        '2': 'digital_morocco',
        // Youth Employment
        'youth': 'youth_employment',
        'shabab': 'youth_employment',
        'jeune': 'youth_employment',
        'employment': 'youth_employment',
        'tashghil': 'youth_employment',
        '3': 'youth_employment',
        // Women Empowerment
        'women': 'women_empowerment',
        'nisa': 'women_empowerment',
        'femme': 'women_empowerment',
        'entrepreneuriat': 'women_empowerment',
        'riyada': 'women_empowerment',
        '4': 'women_empowerment',
        // Rural Development
        'rural': 'rural_development',
        'qrawi': 'rural_development',
        'qrawiya': 'rural_development',
        'village': 'rural_development',
        'tanmiya': 'rural_development',
        '5': 'rural_development',
        // Health
        'health': 'health_system',
        'si7a': 'health_system',
        'santé': 'health_system',
        'hospital': 'health_system',
        '6': 'health_system',
        // Education
        'education': 'education_quality',
        'ta3lim': 'education_quality',
        'école': 'education_quality',
        'school': 'education_quality',
        '7': 'education_quality',
        // None
        'none': '',
        'walo': '',
        'la': '',
        '8': '',
      };

      // Check for priority mentions
      Object.entries(priorityMap).forEach(([keyword, priorityId]) => {
        if (lowerText.includes(keyword) && priorityId && !detectedPriorities.includes(priorityId)) {
          detectedPriorities.push(priorityId);
        }
      });

      // Also check for numbers (1-8) - handle multiple numbers
      const numberMatches = text.match(/\b([1-8])\b/g);
      if (numberMatches) {
        numberMatches.forEach(num => {
          const priorityId = priorityMap[num];
          if (priorityId && !detectedPriorities.includes(priorityId)) {
            detectedPriorities.push(priorityId);
          }
        });
      }

      return {
        moroccoPriorities: detectedPriorities,
        rawText: text,
        sentiment,
      };

    case 'cost_structure':
      return {
        initial: entities.prices[0] || entities.numbers[0] || null,
        monthly: entities.prices[1] || entities.numbers[1] || null,
        currency: text.includes('dh') || text.includes('dirham') ? 'MAD' : 'EUR',
        breakdown: text,
      };

    case 'quick_win':
      return {
        milestone: text,
        mentions3Months: text.includes('3') || text.includes('tlata') || text.includes('trois') || text.includes('ثلاثة'),
        sentiment,
      };

    case 'regulatory':
      return {
        approvals: entities.names,
        notes: text,
        mentionsGovernment: text.includes('government') || text.includes('gouvernement') || text.includes('حكومة'),
      };

    default:
      return { raw: text };
  }
}

/**
 * Self-Ask Chain Class
 */
export class SelfAskChain {
  private supabase: Awaited<ReturnType<typeof createClient>> | null = null;

  constructor() {
    // Lazy initialization
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  /**
   * Ask next question
   */
  async askNext(ideaId: string, userPhone: string): Promise<Question | null> {
    const supabase = await this.getSupabase() as any;

    // Get progress
    const progress = await this.getProgress(ideaId);

    // Find next unanswered question
    const nextQuestion = CORE_QUESTIONS.find(
      (q) => !progress.completedQuestions.includes(q.id) && !progress.skippedQuestions.includes(q.id)
    );

    if (!nextQuestion) {
      // All questions answered
      await sendWhatsAppMessage(
        userPhone,
        'Mzyan bzaf! 🎉 Kolchi t3amna. Ghadi n3awenok bach nkammlo l-idea dyalek. Chwiya dyal patience...'
      );
      return null;
    }

    // Check if question should be skipped (adaptive)
    if (await this.shouldSkipQuestion(ideaId, nextQuestion)) {
      // Mark as skipped and ask next
      await this.markQuestionSkipped(ideaId, nextQuestion.id);
      return this.askNext(ideaId, userPhone);
    }

    // Store question in database
    await supabase.from('marrai_self_ask_questions').insert({
      id: randomUUID(),
      idea_id: ideaId,
      question_id: nextQuestion.id,
      question_order: nextQuestion.order,
      question_text: nextQuestion.questionText.darija,
      status: 'asked',
      asked_at: new Date().toISOString(),
    });

    // Send question via WhatsApp
    // For Q5, include options in the message
    let messageToSend = nextQuestion.questionText.darija;
    if (nextQuestion.id === 'q5') {
      // Message already includes options in questionText
      messageToSend = nextQuestion.questionText.darija;
    }
    await sendWhatsAppMessage(userPhone, messageToSend);

    return nextQuestion;
  }

  /**
   * Process user response
   */
  async processResponse(
    ideaId: string,
    questionId: string,
    response: string
  ): Promise<void> {
    const supabase = await this.getSupabase() as any;

    // Find question
    const question = CORE_QUESTIONS.find((q) => q.id === questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    // Extract entities and parse
    const entities = extractEntities(response);
    const parsedData = parseResponse(response, question.questionType);
    const sentiment = detectSentiment(response);
    const confidence = calculateConfidence(response, entities, question.questionType);

    // Store response
    const responseId = randomUUID();
    await supabase.from('marrai_self_ask_responses').insert({
      id: responseId,
      idea_id: ideaId,
      question_id: questionId,
      original_text: response,
      extracted_data: parsedData,
      entities: entities,
      sentiment,
      confidence,
      created_at: new Date().toISOString(),
    });

    // If this is Q5 (morocco_priorities), update idea alignment
    if (question.questionType === 'morocco_priorities' && parsedData.moroccoPriorities) {
      const priorities = parsedData.moroccoPriorities as string[];
      if (priorities.length > 0) {
        // Get current idea alignment or create new
        const { data: idea } = await supabase
          .from('marrai_ideas')
          .select('alignment')
          .eq('id', ideaId)
          .single();

        const currentAlignment = idea?.alignment || {};
        const updatedAlignment = {
          ...currentAlignment,
          moroccoPriorities: priorities,
          // SDGs will be auto-tagged later during scoring
        };

        await supabase
          .from('marrai_ideas')
          .update({ alignment: updatedAlignment })
          .eq('id', ideaId);
      }
    }

    // Update question status
    await supabase
      .from('marrai_self_ask_questions')
      .update({
        status: 'answered',
        answered_at: new Date().toISOString(),
      })
      .eq('idea_id', ideaId)
      .eq('question_id', questionId)
      .eq('status', 'asked');

    // Check if follow-up needed
    if (confidence < 0.6 && question.required) {
      await this.askFollowUp(ideaId, question, response);
    } else if (sentiment === 'positive' && confidence >= 0.7) {
      // Celebrate good answer
      await sendWhatsAppMessage(
        await this.getUserPhone(ideaId),
        'Mzyan bzaf! 💪 Had jjawab mzyan. Yallah nkamlo...'
      );
    }

    // Auto-ask next question if confidence is good
    if (confidence >= 0.6) {
      const userPhone = await this.getUserPhone(ideaId);
      setTimeout(() => {
        this.askNext(ideaId, userPhone);
      }, 2000); // Wait 2 seconds before next question
    }
  }

  /**
   * Ask follow-up question if response unclear
   */
  private async askFollowUp(
    ideaId: string,
    question: Question,
    response: string
  ): Promise<void> {
    const userPhone = await this.getUserPhone(ideaId);
    let followUp = '';

    switch (question.questionType) {
      case 'willingness_to_pay':
        followUp = 'Bghiti t9ol lina ch7al b7al? (Ex: 50 dh kol shahar, 500 dh mara wahda)';
        break;
      case 'target_segment':
        followUp = 'Bghiti t9ol lina bzaf dyal tafsil. (Ex: L-fellahin f l-qarya, l-mra dyal l-7ay, etc.)';
        break;
      case 'revenue_model':
        followUp = 'Kifash ghadi tbay3o? (Ex: Abonnement, bay3 mara wahda, commission, etc.)';
        break;
      case 'morocco_priorities':
        followUp = 'Khtar ra9m wla kteb l-ism kaml. Matal: "1" wla "Green Morocco" wla "L-Maghrib l-akhdar"';
        break;
      default:
        followUp = 'Bghiti t9ol lina bzaf dyal tafsil?';
    }

    await sendWhatsAppMessage(userPhone, followUp);
  }

  /**
   * Get progress
   */
  async getProgress(ideaId: string): Promise<Progress> {
    const supabase = await this.getSupabase();

    const { data: questions } = await (supabase as any)
      .from('marrai_self_ask_questions')
      .select('question_id, status')
      .eq('idea_id', ideaId);

    const completedQuestions = (questions as any[])?.filter((q: any) => q.status === 'answered').map((q: any) => q.question_id) || [];
    const skippedQuestions = (questions as any[])?.filter((q: any) => q.status === 'skipped').map((q: any) => q.question_id) || [];

    const currentQuestion = CORE_QUESTIONS.find(
      (q) => !completedQuestions.includes(q.id) && !skippedQuestions.includes(q.id)
    );

    const percentage = (completedQuestions.length / CORE_QUESTIONS.length) * 100;
    const estimatedTimeRemaining = (CORE_QUESTIONS.length - completedQuestions.length) * 2; // 2 min per question

    return {
      ideaId,
      currentQuestion: currentQuestion?.order || CORE_QUESTIONS.length + 1,
      completedQuestions,
      skippedQuestions,
      totalQuestions: CORE_QUESTIONS.length,
      percentage,
      estimatedTimeRemaining,
    };
  }

  /**
   * Generate structured data from all responses
   */
  async generateStructuredData(ideaId: string): Promise<StructuredData> {
    const supabase = await this.getSupabase();

    const { data: responses } = await (supabase as any)
      .from('marrai_self_ask_responses')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });

    if (!responses || responses.length === 0) {
      return {
        confidence: 0,
        completeness: 0,
      };
    }

    const structured: StructuredData = {
      confidence: 0,
      completeness: 0,
    };

    let totalConfidence = 0;

    (responses as any[]).forEach((response: any) => {
      const question = CORE_QUESTIONS.find((q) => q.id === response.question_id);
      if (!question) return;

      totalConfidence += response.confidence || 0;

      switch (question.questionType) {
        case 'target_segment':
          structured.targetSegment = response.extracted_data?.segment || response.original_text;
          break;
        case 'willingness_to_pay':
          structured.willingnessToPay = {
            amount: response.extracted_data?.amount || 0,
            currency: response.extracted_data?.currency || 'MAD',
            frequency: response.extracted_data?.frequency || 'one_time',
          };
          break;
        case 'revenue_model':
          structured.revenueModel = response.extracted_data?.model || response.original_text;
          break;
        case 'team':
          structured.team = {
            members: response.extracted_data?.members || [],
            partnerships: response.extracted_data?.partnerships || [],
          };
          break;
        case 'morocco_priorities':
          // Morocco priorities are already stored in idea.alignment
          // This is just for structured data completeness
          if (response.extracted_data?.moroccoPriorities) {
            structured.localMoat = `Morocco Priorities: ${response.extracted_data.moroccoPriorities.join(', ')}`;
          }
          break;
        case 'cost_structure':
          structured.costStructure = {
            initial: response.extracted_data?.initial || 0,
            monthly: response.extracted_data?.monthly || 0,
            currency: response.extracted_data?.currency || 'EUR',
          };
          break;
        case 'quick_win':
          structured.quickWin = response.extracted_data?.milestone || response.original_text;
          break;
        case 'regulatory':
          structured.regulatory = {
            approvals: response.extracted_data?.approvals || [],
            notes: response.extracted_data?.notes || response.original_text,
          };
          break;
      }
    });

    structured.confidence = totalConfidence / responses.length;
    structured.completeness = (responses.length / CORE_QUESTIONS.length) * 100;

    return structured;
  }

  /**
   * Check if question should be skipped
   */
  private async shouldSkipQuestion(ideaId: string, question: Question): Promise<boolean> {
    // Skip regulatory if no government involvement mentioned
    if (question.questionType === 'regulatory') {
      const { data: idea } = await ((await this.getSupabase()) as any)
        .from('marrai_ideas')
        .select('problem_statement, proposed_solution')
        .eq('id', ideaId)
        .single();

      if (idea) {
        const ideaData = idea as any;
        const text = ((ideaData.problem_statement || '') + ' ' + (ideaData.proposed_solution || '')).toLowerCase();
        const hasGovernment = /(gouvernement|government|ministère|ministry|wilaya|commune|baladiya|حكومة|وزارة)/i.test(text);
        if (!hasGovernment) return true;
      }
    }

    // Skip team if already mentioned
    if (question.questionType === 'team') {
      const { data: responses } = await ((await this.getSupabase()) as any)
        .from('marrai_self_ask_responses')
        .select('original_text')
        .eq('idea_id', ideaId);

      const hasTeamMention = (responses as any[])?.some((r: any) =>
        /(équipe|team|partenaire|partner|شريك|فريق)/i.test(r.original_text)
      );
      if (hasTeamMention) return true;
    }

    return false;
  }

  /**
   * Mark question as skipped
   */
  private async markQuestionSkipped(ideaId: string, questionId: string): Promise<void> {
    const supabase = await this.getSupabase();
    await (supabase as any).from('marrai_self_ask_questions').insert({
      id: randomUUID(),
      idea_id: ideaId,
      question_id: questionId,
      question_order: CORE_QUESTIONS.find((q) => q.id === questionId)?.order || 0,
      question_text: CORE_QUESTIONS.find((q) => q.id === questionId)?.questionText.darija || '',
      status: 'skipped',
      asked_at: new Date().toISOString(),
    });
  }

  /**
   * Get user phone from idea
   */
  async getUserPhone(ideaId: string): Promise<string> {
    const supabase = await this.getSupabase();
    const { data: idea } = await (supabase as any)
      .from('marrai_ideas')
      .select('submitter_phone')
      .eq('id', ideaId)
      .single();

    return (idea as any)?.submitter_phone || '';
  }
}

/**
 * Start self-ask chain for an idea
 */
export async function startSelfAskChain(ideaId: string, userPhone: string): Promise<void> {
  const chain = new SelfAskChain();
  await chain.askNext(ideaId, userPhone);
}

/**
 * Process incoming WhatsApp message as response
 */
export async function processSelfAskResponse(
  ideaId: string,
  message: string
): Promise<{ nextQuestion: Question | null; progress: Progress }> {
  const chain = new SelfAskChain();

  // Get current question using public method
  const progress = await chain.getProgress(ideaId);
  const currentQuestionId = CORE_QUESTIONS.find(
    (q) => q.order === progress.currentQuestion && !progress.completedQuestions.includes(q.id)
  )?.id;

  if (currentQuestionId) {
    await chain.processResponse(ideaId, currentQuestionId, message);
  }

  // Get user phone from idea
  const supabase = await createClient();
  const { data: idea } = await (supabase as any)
    .from('marrai_ideas')
    .select('submitter_phone')
    .eq('id', ideaId)
    .single();

  const userPhone = (idea as any)?.submitter_phone || '';
  const nextQuestion = await chain.askNext(ideaId, userPhone);
  const updatedProgress = await chain.getProgress(ideaId);

  return { nextQuestion, progress: updatedProgress };
}

