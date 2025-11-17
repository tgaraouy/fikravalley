/**
 * Darija Natural Language Processing Engine
 * 
 * Comprehensive NLP for Moroccan Darija with code-switching support
 * Handles Darija-French-Arabic mixed text
 */

/**
 * Analysis result
 */
export interface DarijaAnalysis {
  text: string;
  language: 'darija' | 'french' | 'arabic' | 'mixed';
  sentiment: 'positive' | 'negative' | 'neutral' | 'frustrated';
  sentimentScore: number; // -1 to 1
  keywords: {
    pain: string[];
    frequency: string[];
    willingness: string[];
    negation: string[];
  };
  moroccoPriorities?: string[]; // Detected Morocco priorities
  moroccoPrioritiesConfidence?: Array<{
    priorityId: string;
    matchCount: number;
    confidence: number;
    matchedKeywords: string[];
  }>;
  numbers: ParsedNumber[];
  entities: ExtractedEntities;
  intent: IntentType;
  intentConfidence: number;
  codeSwitching: CodeSwitch[];
}

/**
 * Parsed number
 */
export interface ParsedNumber {
  value: number;
  original: string;
  type: 'arabic_numeral' | 'darija_word' | 'french_word' | 'mixed';
  context?: string;
}

/**
 * Extracted entities
 */
export interface ExtractedEntities {
  locations: string[];
  organizations: string[];
  people: string[];
  amounts: {
    money: Array<{ value: number; currency: string; original: string }>;
    time: Array<{ value: number; unit: string; original: string }>;
    quantities: Array<{ value: number; unit: string; original: string }>;
  };
}

/**
 * Intent type
 */
export type IntentType =
  | 'problem_description'
  | 'solution_proposal'
  | 'question'
  | 'complaint'
  | 'feedback'
  | 'request'
  | 'unknown';

/**
 * Code switch detection
 */
export interface CodeSwitch {
  text: string;
  language: 'darija' | 'french' | 'arabic';
  start: number;
  end: number;
}

/**
 * Pain keywords (expressions of pain/frustration)
 */
const PAIN_KEYWORDS = [
  // Frustration
  'gal3a rasi',
  'gal3a',
  'telbara',
  's7ab',
  'khayb',
  'machakil',
  'mochkil',
  'mochakil',
  'problem',
  'problème',
  'مشكلة',
  'مشاكل',
  // Financial pain
  'nsawlo flouss',
  'ma kaynach flouss',
  'ma kaynach walo',
  'walo',
  'ma kaynach',
  'ma kaynch',
  // Time pain
  'kaykhdaw bzaf dyal wa9t',
  'kaykhdaw bzaf',
  'wa9t bzaf',
  // Effort pain
  'kaykhdaw bzaf dyal 7ra',
  '7ra bzaf',
  'machakil bzaf',
];

/**
 * Frequency keywords
 */
const FREQUENCY_KEYWORDS = [
  'kol nhar',
  'kol yom',
  'dima',
  'dima dima',
  'kol mara',
  'kol shi',
  'kol wa7d',
  'kol shi mara',
  'kol jom3a',
  'kol shahar',
  'kol sana',
  'kol youm',
  'chaque jour',
  'tous les jours',
  'chaque semaine',
  'chaque mois',
  'toujours',
  'كل يوم',
  'كل يوم',
  'دائما',
  'كل مرة',
];

/**
 * Willingness keywords
 */
const WILLINGNESS_KEYWORDS = [
  'khlass',
  'khlas',
  'dfa3',
  'shrit',
  'shriti',
  'bghiti',
  'bghit',
  'khass',
  'khassna',
  'yakhlas',
  'yadfa3',
  'prêt à payer',
  'prêt',
  'willing',
  'ready',
  'مستعد',
  'مستعدة',
  'أدفع',
  'أخلي',
];

/**
 * Negation keywords
 */
const NEGATION_KEYWORDS = [
  'ma',
  'machi',
  'ma kaynach',
  'ma kaynch',
  'ma kayn',
  'walo',
  'walu',
  'la',
  'non',
  'pas',
  'لا',
  'ما',
  'ماشي',
];

/**
 * Positive sentiment keywords
 */
const POSITIVE_KEYWORDS = [
  'mizyan',
  'mzyan',
  'mzyana',
  'zwwin',
  'zwin',
  'zwina',
  '7asan',
  '7asna',
  'bien',
  'bon',
  'bonne',
  'excellent',
  'parfait',
  'génial',
  'super',
  'جيد',
  'جيدة',
  'ممتاز',
  'رائع',
  'حسن',
];

/**
 * Negative sentiment keywords
 */
const NEGATIVE_KEYWORDS = [
  'khayb',
  'khayba',
  'ma-kaynsh',
  'machi',
  'walo',
  'problem',
  'problème',
  'mauvais',
  'mal',
  'bad',
  'سيء',
  'سيئة',
  'مشكلة',
  'مشاكل',
];

/**
 * Frustration keywords
 */
const FRUSTRATION_KEYWORDS = [
  'gal3a',
  'gal3a rasi',
  'telbara',
  's7ab',
  'machakil',
  'mochkil',
  'frustré',
  'frustration',
  'frustrated',
  'غضب',
  'إحباط',
];

/**
 * Darija number words
 */
const DARIJA_NUMBERS: Record<string, number> = {
  // 1-10
  'wa7d': 1,
  'wahed': 1,
  'w7ed': 1,
  'wahd': 1,
  'juj': 2,
  'joj': 2,
  'j2': 2,
  'tlata': 3,
  'tlatha': 3,
  't3': 3,
  'rb3a': 4,
  'rba3a': 4,
  'r4': 4,
  'khamsa': 5,
  'kh5': 5,
  'sitta': 6,
  's6': 6,
  'sba3': 7,
  's7': 7,
  'tmania': 8,
  't8': 8,
  'ts3ud': 9,
  't9': 9,
  '3ashra': 10,
  '3chra': 10,
  '10': 10,
  // 11-20
  '7dach': 11,
  'tnach': 12,
  'tltach': 13,
  'rb3tach': 14,
  'khmstach': 15,
  'sttach': 16,
  'sb3tach': 17,
  'tmntach': 18,
  'ts3tach': 19,
  '3ashrin': 20,
  '3chrin': 20,
  // Tens
  'tlatin': 30,
  'rb3in': 40,
  'khamsin': 50,
  'khmsin': 50,
  'sittin': 60,
  'sab3in': 70,
  'tmanin': 80,
  'ts3in': 90,
  // Hundreds/Thousands
  'miya': 100,
  'meya': 100,
  'miatayn': 200,
  'tlata miya': 300,
  'rb3a miya': 400,
  'khamsa miya': 500,
  'alf': 1000,
  'alef': 1000,
  'alfayn': 2000,
  'milyon': 1000000,
  'milion': 1000000,
};

/**
 * French number words
 */
const FRENCH_NUMBERS: Record<string, number> = {
  'un': 1,
  'une': 1,
  'deux': 2,
  'trois': 3,
  'quatre': 4,
  'cinq': 5,
  'six': 6,
  'sept': 7,
  'huit': 8,
  'neuf': 9,
  'dix': 10,
  'onze': 11,
  'douze': 12,
  'treize': 13,
  'quatorze': 14,
  'quinze': 15,
  'seize': 16,
  'dix-sept': 17,
  'dix-huit': 18,
  'dix-neuf': 19,
  'vingt': 20,
  'trente': 30,
  'quarante': 40,
  'cinquante': 50,
  'soixante': 60,
  'soixante-dix': 70,
  'quatre-vingt': 80,
  'quatre-vingt-dix': 90,
  'cent': 100,
  'mille': 1000,
  'million': 1000000,
};

/**
 * Arabic numerals (Eastern Arabic)
 */
const ARABIC_NUMERALS: Record<string, number> = {
  '٠': 0,
  '١': 1,
  '٢': 2,
  '٣': 3,
  '٤': 4,
  '٥': 5,
  '٦': 6,
  '٧': 7,
  '٨': 8,
  '٩': 9,
};

/**
 * Moroccan cities and regions
 */
const MOROCCO_LOCATIONS = [
  'casablanca',
  'casa',
  'الدار البيضاء',
  'rabat',
  'الرباط',
  'fes',
  'fès',
  'فاس',
  'marrakech',
  'مراكش',
  'tanger',
  'tanger',
  'طنجة',
  'agadir',
  'أغادير',
  'meknes',
  'مكناس',
  'oujda',
  'وجدة',
  'kenitra',
  'القنيطرة',
  'tetouan',
  'تطوان',
  'safi',
  'آسفي',
  'mohammedia',
  'المحمدية',
  'el jadida',
  'الجديدة',
  'nador',
  'الناظور',
  'beni mellal',
  'بني ملال',
  'taza',
  'تازة',
  'khouribga',
  'خريبكة',
  'settat',
  'سطات',
  'larache',
  'العرائش',
  'khemisset',
  'الخميسات',
  'morocco',
  'maroc',
  'المغرب',
  'maghreb',
];

/**
 * Common organizations
 */
const ORGANIZATIONS = [
  'ministère',
  'ministry',
  'وزارة',
  'wilaya',
  'ولاية',
  'commune',
  'baladiya',
  'بلدية',
  'gouvernement',
  'government',
  'حكومة',
  'hôpital',
  'hospital',
  'مستشفى',
  'école',
  'school',
  'مدرسة',
  'université',
  'university',
  'جامعة',
];

/**
 * Analyze Darija text
 */
export function analyzeDarijaText(text: string): DarijaAnalysis {
  const normalized = normalizeText(text);
  const language = detectLanguage(normalized);
  const sentiment = detectSentiment(normalized);
  const keywords = extractKeywords(normalized);
  const numbers = parseNumbers(normalized);
  const entities = extractEntities(normalized);
  const intent = detectIntent(normalized);
  const codeSwitching = detectCodeSwitching(text);
  
  // Detect Morocco priorities (synchronous import)
  const moroccoPriorities = detectMoroccoPriorities(text);
  const moroccoPrioritiesConfidence = detectMoroccoPrioritiesWithConfidence(text);

  return {
    text: normalized,
    language,
    sentiment: sentiment.type,
    sentimentScore: sentiment.score,
    keywords,
    moroccoPriorities,
    moroccoPrioritiesConfidence,
    numbers,
    entities,
    intent: intent.type,
    intentConfidence: intent.confidence,
    codeSwitching,
  };
}

/**
 * Normalize text
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[،,]/g, ' ')
    .replace(/[؟?]/g, '?')
    .replace(/[!！]/g, '!');
}

/**
 * Detect language
 */
function detectLanguage(text: string): 'darija' | 'french' | 'arabic' | 'mixed' {
  const darijaIndicators = /(wa7d|juj|tlata|mizyan|khayb|gal3a|khlass|bghiti|ma kaynach)/gi;
  const frenchIndicators = /\b(le|la|les|un|une|deux|trois|pour|avec|sans)\b/gi;
  const arabicIndicators = /[\u0600-\u06FF]/g;

  const hasDarija = darijaIndicators.test(text);
  const hasFrench = frenchIndicators.test(text);
  const hasArabic = arabicIndicators.test(text);

  const count = [hasDarija, hasFrench, hasArabic].filter(Boolean).length;

  if (count > 1) return 'mixed';
  if (hasDarija) return 'darija';
  if (hasFrench) return 'french';
  if (hasArabic) return 'arabic';
  return 'darija'; // Default
}

/**
 * Extract keywords
 */
export function extractKeywords(text: string): {
  pain: string[];
  frequency: string[];
  willingness: string[];
  negation: string[];
} {
  const lower = text.toLowerCase();

  return {
    pain: PAIN_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase())),
    frequency: FREQUENCY_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase())),
    willingness: WILLINGNESS_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase())),
    negation: NEGATION_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase())),
  };
}

/**
 * Detect sentiment
 */
export function detectSentiment(text: string): { type: 'positive' | 'negative' | 'neutral' | 'frustrated'; score: number } {
  const lower = text.toLowerCase();

  const positiveCount = POSITIVE_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  const negativeCount = NEGATIVE_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  const frustrationCount = FRUSTRATION_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  if (frustrationCount > 0) {
    return { type: 'frustrated', score: -0.8 };
  }

  if (positiveCount > negativeCount) {
    return { type: 'positive', score: Math.min(1, positiveCount * 0.3) };
  }

  if (negativeCount > positiveCount) {
    return { type: 'negative', score: Math.max(-1, -negativeCount * 0.3) };
  }

  return { type: 'neutral', score: 0 };
}

/**
 * Parse numbers from text
 */
export function parseNumbers(text: string): ParsedNumber[] {
  const numbers: ParsedNumber[] = [];
  const lower = text.toLowerCase();

  // Extract Arabic numerals
  const arabicNumeralPattern = /[٠١٢٣٤٥٦٧٨٩]+/g;
  const arabicMatches = text.match(arabicNumeralPattern);
  if (arabicMatches) {
    arabicMatches.forEach((match) => {
      const value = parseInt(
        match
          .split('')
          .map((char) => ARABIC_NUMERALS[char] || char)
          .join('')
      );
      if (!isNaN(value)) {
        numbers.push({
          value,
          original: match,
          type: 'arabic_numeral',
        });
      }
    });
  }

  // Extract Western numerals
  const westernNumeralPattern = /\b\d+\b/g;
  const westernMatches = text.match(westernNumeralPattern);
  if (westernMatches) {
    westernMatches.forEach((match) => {
      const value = parseInt(match);
      if (!isNaN(value) && !numbers.some((n) => n.value === value && n.original === match)) {
        numbers.push({
          value,
          original: match,
          type: 'arabic_numeral',
        });
      }
    });
  }

  // Extract Darija number words
  Object.entries(DARIJA_NUMBERS).forEach(([word, value]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lower)) {
      const matches = lower.matchAll(regex);
      for (const match of matches) {
        numbers.push({
          value,
          original: match[0],
          type: 'darija_word',
        });
      }
    }
  });

  // Extract French number words
  Object.entries(FRENCH_NUMBERS).forEach(([word, value]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lower)) {
      const matches = lower.matchAll(regex);
      for (const match of matches) {
        numbers.push({
          value,
          original: match[0],
          type: 'french_word',
        });
      }
    }
  });

  // Extract mixed numbers (e.g., "3 miliون")
  const mixedPattern = /(\d+)\s*(miliون|milion|alf|alef|miya|meya|ألف|مليون)/gi;
  const mixedMatches = text.matchAll(mixedPattern);
  for (const match of mixedMatches) {
    const base = parseInt(match[1]);
    const multiplier = match[2].toLowerCase();
    let multiplierValue = 1;

    if (multiplier.includes('mili') || multiplier.includes('مليون')) multiplierValue = 1000000;
    else if (multiplier.includes('alf') || multiplier.includes('alef') || multiplier.includes('ألف'))
      multiplierValue = 1000;
    else if (multiplier.includes('miya') || multiplier.includes('meya')) multiplierValue = 100;

    numbers.push({
      value: base * multiplierValue,
      original: match[0],
      type: 'mixed',
    });
  }

  return numbers;
}

/**
 * Extract entities
 */
export function extractEntities(text: string): ExtractedEntities {
  const lower = text.toLowerCase();
  const entities: ExtractedEntities = {
    locations: [],
    organizations: [],
    people: [],
    amounts: {
      money: [],
      time: [],
      quantities: [],
    },
  };

  // Extract locations
  MOROCCO_LOCATIONS.forEach((location) => {
    if (lower.includes(location.toLowerCase())) {
      entities.locations.push(location);
    }
  });

  // Extract organizations
  ORGANIZATIONS.forEach((org) => {
    if (lower.includes(org.toLowerCase())) {
      entities.organizations.push(org);
    }
  });

  // Extract people (capitalized words, common patterns)
  const namePattern = /\b([A-ZÀ-ÿ][a-zà-ÿ]+)\b/g;
  const nameMatches = text.match(namePattern);
  if (nameMatches) {
    entities.people = nameMatches.filter((name) => name.length > 2 && name.length < 20);
  }

  // Extract money amounts
  const moneyPatterns = [
    /(\d+)\s*(dh|dirham|درهم|euro|eur|يورو)/gi,
    /(dh|dirham|درهم|euro|eur|يورو)\s*(\d+)/gi,
  ];
  moneyPatterns.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const amount = parseInt(match[1] || match[2]);
      const currency = (match[2] || match[1]).toLowerCase();
      if (!isNaN(amount)) {
        entities.amounts.money.push({
          value: amount,
          currency: currency.includes('dh') || currency.includes('dirham') || currency.includes('درهم')
            ? 'MAD'
            : 'EUR',
          original: match[0],
        });
      }
    }
  });

  // Extract time amounts
  const timePatterns = [
    /(\d+)\s*(dqiqa|minute|ساعة|heure|hour|jour|day|يوم|shahar|mois|month|شهر|sana|an|year|سنة)/gi,
  ];
  timePatterns.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (!isNaN(value)) {
        entities.amounts.time.push({
          value,
          unit,
          original: match[0],
        });
      }
    }
  });

  // Extract quantities
  const quantityPatterns = [
    /(\d+)\s*(personne|person|شخص|familia|family|عائلة|mara|woman|woman|رجل|homme|man)/gi,
  ];
  quantityPatterns.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (!isNaN(value)) {
        entities.amounts.quantities.push({
          value,
          unit,
          original: match[0],
        });
      }
    }
  });

  return entities;
}

/**
 * Detect intent
 */
function detectIntent(text: string): { type: IntentType; confidence: number } {
  const lower = text.toLowerCase();

  // Problem description indicators
  const problemIndicators = [
    'mochkil',
    'machakil',
    'problem',
    'problème',
    'gal3a',
    'telbara',
    's7ab',
    'مشكلة',
    'مشاكل',
  ];
  const problemCount = problemIndicators.filter((ind) => lower.includes(ind)).length;

  // Solution proposal indicators
  const solutionIndicators = [
    'bghiti',
    'bghit',
    'khass',
    'khassna',
    'solution',
    'حل',
    'حلول',
    'proposition',
  ];
  const solutionCount = solutionIndicators.filter((ind) => lower.includes(ind)).length;

  // Question indicators
  const questionIndicators = ['ash', 'kifach', 'fin', 'shkoun', 'wach', '?', '؟', 'comment', 'comment', 'كيف', 'أين', 'من'];
  const questionCount = questionIndicators.filter((ind) => lower.includes(ind)).length;

  // Complaint indicators
  const complaintIndicators = ['khayb', 'machi', 'walo', 'ma kaynach', 'complaint', 'شكوى'];
  const complaintCount = complaintIndicators.filter((ind) => lower.includes(ind)).length;

  // Request indicators
  const requestIndicators = ['bghiti', 'bghit', '3aweni', '3awen', 'help', 'مساعدة', 'طلب'];
  const requestCount = requestIndicators.filter((ind) => lower.includes(ind)).length;

  const scores = {
    problem_description: problemCount,
    solution_proposal: solutionCount,
    question: questionCount,
    complaint: complaintCount,
    request: requestCount,
  };

  const maxScore = Math.max(...Object.values(scores));
  const maxIntent = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as IntentType;

  if (maxScore === 0) {
    return { type: 'unknown', confidence: 0 };
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = maxScore / Math.max(totalScore, 1);

  return {
    type: maxIntent || 'unknown',
    confidence: Math.min(1, confidence),
  };
}

/**
 * Detect code switching
 */
function detectCodeSwitching(text: string): CodeSwitch[] {
  const switches: CodeSwitch[] = [];
  const words = text.split(/\s+/);

  let currentLanguage: 'darija' | 'french' | 'arabic' | null = null;
  let start = 0;

  words.forEach((word, index) => {
    const wordLower = word.toLowerCase();
    const hasArabic = /[\u0600-\u06FF]/.test(word);
    const hasFrench = /\b(le|la|les|un|une|deux|pour|avec)\b/i.test(word);
    const hasDarija = /(wa7d|juj|mizyan|khayb|gal3a|khlass|bghiti)/i.test(word);

    let detectedLanguage: 'darija' | 'french' | 'arabic' | null = null;

    if (hasArabic) detectedLanguage = 'arabic';
    else if (hasFrench) detectedLanguage = 'french';
    else if (hasDarija) detectedLanguage = 'darija';

    if (detectedLanguage && detectedLanguage !== currentLanguage) {
      if (currentLanguage !== null) {
        switches.push({
          text: words.slice(start, index).join(' '),
          language: currentLanguage,
          start,
          end: index - 1,
        });
      }
      currentLanguage = detectedLanguage;
      start = index;
    }
  });

  // Add final segment
  if (currentLanguage !== null) {
    switches.push({
      text: words.slice(start).join(' '),
      language: currentLanguage,
      start,
      end: words.length - 1,
    });
  }

  return switches;
}

/**
 * Enhanced entity extraction with context
 */
export function extractEntitiesWithContext(text: string): ExtractedEntities {
  const basic = extractEntities(text);
  const numbers = parseNumbers(text);

  // Enhance money amounts with parsed numbers
  numbers.forEach((num) => {
    const context = getNumberContext(text, num.original);
    if (context.includes('dh') || context.includes('dirham') || context.includes('euro') || context.includes('درهم')) {
      basic.amounts.money.push({
        value: num.value,
        currency: context.includes('euro') || context.includes('eur') ? 'EUR' : 'MAD',
        original: num.original,
      });
    }
  });

  return basic;
}

/**
 * Get context around a number
 */
function getNumberContext(text: string, numberStr: string, windowSize: number = 10): string {
  const index = text.toLowerCase().indexOf(numberStr.toLowerCase());
  if (index === -1) return '';

  const start = Math.max(0, index - windowSize);
  const end = Math.min(text.length, index + numberStr.length + windowSize);
  return text.substring(start, end).toLowerCase();
}

/**
 * Batch analyze multiple texts
 */
export function batchAnalyzeDarijaTexts(texts: string[]): DarijaAnalysis[] {
  return texts.map((text) => analyzeDarijaText(text));
}

/**
 * Get summary statistics from analyses
 */
export function getAnalysisSummary(analyses: DarijaAnalysis[]): {
  totalTexts: number;
  languageDistribution: Record<string, number>;
  sentimentDistribution: Record<string, number>;
  mostCommonKeywords: Record<string, number>;
  averageSentimentScore: number;
  moroccoPrioritiesDistribution: Record<string, number>;
} {
  const languageDistribution: Record<string, number> = {};
  const sentimentDistribution: Record<string, number> = {};
  const keywordCounts: Record<string, number> = {};
  const priorityCounts: Record<string, number> = {};
  let totalSentiment = 0;

  analyses.forEach((analysis) => {
    languageDistribution[analysis.language] = (languageDistribution[analysis.language] || 0) + 1;
    sentimentDistribution[analysis.sentiment] = (sentimentDistribution[analysis.sentiment] || 0) + 1;
    totalSentiment += analysis.sentimentScore;

    Object.values(analysis.keywords).flat().forEach((keyword) => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });

    // Count Morocco priorities
    if (analysis.moroccoPriorities) {
      analysis.moroccoPriorities.forEach((priorityId) => {
        priorityCounts[priorityId] = (priorityCounts[priorityId] || 0) + 1;
      });
    }
  });

  const mostCommonKeywords = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, number>);

  return {
    totalTexts: analyses.length,
    languageDistribution,
    sentimentDistribution,
    mostCommonKeywords,
    averageSentimentScore: analyses.length > 0 ? totalSentiment / analyses.length : 0,
    moroccoPrioritiesDistribution: priorityCounts,
  };
}

/**
 * Detect Morocco priorities from text (standalone function)
 * Re-exported from morocco-priorities for convenience
 */
export function detectMoroccoPriorities(text: string): string[] {
  // Import synchronously to avoid async issues
  const moroccoPrioritiesModule = require('@/lib/idea-bank/scoring/morocco-priorities');
  return moroccoPrioritiesModule.detectMoroccoPriorities(text);
}

/**
 * Detect Morocco priorities with confidence scores (standalone function)
 * Re-exported from morocco-priorities for convenience
 */
export function detectMoroccoPrioritiesWithConfidence(text: string): Array<{
  priorityId: string;
  matchCount: number;
  confidence: number;
  matchedKeywords: string[];
}> {
  // Import synchronously to avoid async issues
  const moroccoPrioritiesModule = require('@/lib/idea-bank/scoring/morocco-priorities');
  return moroccoPrioritiesModule.detectMoroccoPrioritiesWithConfidence(text);
}

