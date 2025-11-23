/**
 * Content Moderation System
 * 
 * Filters abusive content, bad words, and ensures respect for traditional norms
 * Works for both voice transcripts and text inputs
 */

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  flaggedWords?: string[];
  suggestions?: string[];
}

// Blocked words and phrases (respecting Moroccan/Muslim cultural context)
const BLOCKED_WORDS = {
  // Explicit profanity (English, French, Darija)
  profanity: [
    // English
    'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard',
    // French
    'merde', 'putain', 'salope', 'connard', 'enculé',
    // Darija/Arabic (transliterated)
    'kess', 'zbel', '7mar', 'kelb'
  ],
  
  // Hate speech and discrimination
  hateSpeech: [
    'nazi', 'hitler', 'terrorist', 'jihad', 'islamist',
    'antisemitic', 'racist', 'sexist'
  ],
  
  // Violence and threats
  violence: [
    'kill', 'murder', 'bomb', 'attack', 'violence',
    'tuer', 'assassiner', 'bombe', 'attaque',
    'قتل', 'تفجير' // Arabic (transliterated)
  ],
  
  // Illegal activities
  illegal: [
    'drugs', 'cocaine', 'heroin', 'marijuana', 'cannabis',
    'drogue', 'cocaïne', 'haschich',
    'قنب', 'مخدرات' // Arabic (transliterated)
  ],
  
  // Sexual content (inappropriate for platform)
  sexual: [
    'porn', 'sex', 'xxx', 'nude', 'naked',
    'porno', 'sexe', 'nu',
    'إباحية' // Arabic (transliterated)
  ],
  
  // Scams and fraud
  scams: [
    'scam', 'fraud', 'pyramid', 'ponzi', 'get rich quick',
    'arnaque', 'fraude', 'pyramide'
  ]
};

// Cultural sensitivity patterns (things to flag for review)
const CULTURAL_SENSITIVITY = {
  // Religious references (flag for context review)
  religious: [
    'allah', 'god', 'jesus', 'bible', 'quran', 'koran',
    'الله', 'رب', 'دين' // Arabic
  ],
  
  // Political content (flag for review)
  political: [
    'president', 'government', 'politics', 'election',
    'président', 'gouvernement', 'politique'
  ]
};

// Positive patterns (things that are encouraged)
const POSITIVE_PATTERNS = [
  'innovation', 'entrepreneur', 'startup', 'business',
  'solution', 'problem', 'help', 'support', 'community',
  'morocco', 'maroc', 'développement', 'croissance'
];

/**
 * Normalize text for comparison (remove accents, lowercase, etc.)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with space
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Check if text contains blocked words
 */
function containsBlockedWords(text: string): { found: boolean; words: string[] } {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);
  const foundWords: string[] = [];
  
  // Check all categories
  const allBlocked = [
    ...BLOCKED_WORDS.profanity,
    ...BLOCKED_WORDS.hateSpeech,
    ...BLOCKED_WORDS.violence,
    ...BLOCKED_WORDS.illegal,
    ...BLOCKED_WORDS.sexual,
    ...BLOCKED_WORDS.scams
  ];
  
  for (const word of words) {
    for (const blocked of allBlocked) {
      if (word.includes(blocked.toLowerCase()) || blocked.toLowerCase().includes(word)) {
        foundWords.push(blocked);
      }
    }
  }
  
  return {
    found: foundWords.length > 0,
    words: [...new Set(foundWords)] // Remove duplicates
  };
}

/**
 * Check for cultural sensitivity (flag for review, don't block)
 */
function checkCulturalSensitivity(text: string): string[] {
  const normalized = normalizeText(text);
  const flagged: string[] = [];
  
  const allSensitive = [
    ...CULTURAL_SENSITIVITY.religious,
    ...CULTURAL_SENSITIVITY.political
  ];
  
  for (const pattern of allSensitive) {
    if (normalized.includes(pattern.toLowerCase())) {
      flagged.push(pattern);
    }
  }
  
  return flagged;
}

/**
 * Check text length and content quality
 */
function checkContentQuality(text: string): { valid: boolean; reason?: string } {
  // Minimum length
  if (text.trim().length < 10) {
    return { valid: false, reason: 'Le texte est trop court' };
  }
  
  // Maximum length (prevent spam)
  if (text.length > 10000) {
    return { valid: false, reason: 'Le texte est trop long' };
  }
  
  // Check for excessive repetition (spam detection)
  const words = text.split(/\s+/);
  const wordCounts = new Map<string, number>();
  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }
  
  // If any word appears more than 20% of the time, flag as spam
  const maxCount = Math.max(...Array.from(wordCounts.values()));
  if (maxCount > words.length * 0.2 && words.length > 10) {
    return { valid: false, reason: 'Contenu répétitif détecté' };
  }
  
  return { valid: true };
}

/**
 * Main moderation function
 */
export function moderateContent(
  text: string,
  context?: {
    type?: 'voice' | 'text' | 'idea' | 'comment';
    userId?: string;
    strict?: boolean; // If true, also flag cultural sensitivity
  }
): ModerationResult {
  // Empty content
  if (!text || text.trim().length === 0) {
    return {
      allowed: false,
      reason: 'Le contenu est vide',
      severity: 'low'
    };
  }
  
  // Quality check
  const qualityCheck = checkContentQuality(text);
  if (!qualityCheck.valid) {
    return {
      allowed: false,
      reason: qualityCheck.reason,
      severity: 'medium'
    };
  }
  
  // Check for blocked words
  const blockedCheck = containsBlockedWords(text);
  if (blockedCheck.found) {
    return {
      allowed: false,
      reason: 'Contenu inapproprié détecté',
      severity: 'high',
      flaggedWords: blockedCheck.words,
      suggestions: [
        'Veuillez reformuler votre message en respectant les normes de la communauté',
        'Utilisez un langage professionnel et respectueux'
      ]
    };
  }
  
  // Check cultural sensitivity (flag but don't block unless strict mode)
  const culturalFlags = checkCulturalSensitivity(text);
  if (culturalFlags.length > 0 && context?.strict) {
    return {
      allowed: false,
      reason: 'Contenu nécessitant une révision',
      severity: 'medium',
      flaggedWords: culturalFlags,
      suggestions: [
        'Votre contenu contient des références qui nécessitent une révision',
        'Veuillez reformuler de manière plus neutre'
      ]
    };
  }
  
  // Check for positive patterns (encouraged content)
  const normalized = normalizeText(text);
  const hasPositiveContent = POSITIVE_PATTERNS.some(pattern =>
    normalized.includes(pattern.toLowerCase())
  );
  
  // All checks passed
  return {
    allowed: true,
    severity: culturalFlags.length > 0 ? 'low' : 'low',
    flaggedWords: culturalFlags.length > 0 ? culturalFlags : undefined
  };
}

/**
 * Sanitize text (remove potentially harmful content while keeping meaning)
 */
export function sanitizeContent(text: string): string {
  let sanitized = text;
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Remove excessive punctuation
  sanitized = sanitized.replace(/[!]{3,}/g, '!');
  sanitized = sanitized.replace(/[?]{3,}/g, '?');
  sanitized = sanitized.replace(/[.]{4,}/g, '...');
  
  // Remove potential script injection
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  return sanitized;
}

/**
 * Rate limit check (prevent spam)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    // Reset or create new limit
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + windowMs
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs
    };
  }
  
  if (userLimit.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: userLimit.resetAt
    };
  }
  
  userLimit.count++;
  return {
    allowed: true,
    remaining: maxRequests - userLimit.count,
    resetAt: userLimit.resetAt
  };
}

