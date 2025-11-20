/**
 * Multi-Language Search Utilities
 * 
 * Supports French, Darija (Latin script), Arabic, and English
 * with fuzzy matching and intelligent suggestions
 */

// ============================================================================
// TEXT NORMALIZATION
// ============================================================================

/**
 * Normalize text for searching across languages
 * - Converts to lowercase
 * - Removes diacritics (accents)
 * - Handles Arabic text
 * - Preserves Darija transliteration
 * - Removes punctuation
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose characters with diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s\u0600-\u06FF0-9]/g, ' ') // Keep alphanumeric + Arabic + numbers
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Normalize Arabic text specifically
 * Handles different forms of Hamza and Alef
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/[أإآ]/g, 'ا') // Normalize different forms of Alef
    .replace(/[ىئ]/g, 'ي') // Normalize different forms of Ya
    .replace(/ة/g, 'ه') // Normalize Ta Marbuta
    .replace(/[ًٌٍَُِّْ]/g, '') // Remove diacritics
    .trim();
}

// ============================================================================
// FUZZY MATCHING (Levenshtein Distance)
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * (minimum number of edits needed to transform one string into another)
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Check if two strings are similar within a threshold
 */
export function isFuzzyMatch(
  query: string, 
  text: string, 
  threshold: number = 2
): boolean {
  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);
  
  // Exact match
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }
  
  // Fuzzy match on individual words
  const words = normalizedText.split(' ');
  for (const word of words) {
    if (word.length >= 3) { // Only check words with 3+ chars
      const distance = levenshteinDistance(normalizedQuery, word);
      if (distance <= threshold) {
        return true;
      }
    }
  }
  
  return false;
}

// ============================================================================
// KEYWORD MAPPINGS (Cross-Language Dictionary)
// ============================================================================

export const keywordMappings: Record<string, {
  fr: string[];
  darija: string[];
  ar: string[];
  en: string[];
}> = {
  health: {
    fr: ['santé', 'médical', 'hôpital', 'clinique', 'médecine', 'docteur', 'soins'],
    darija: ['sseha', 'sbitar', 'tbib', 'dwwa', 'dawini', '3yada'],
    ar: ['صحة', 'طب', 'مستشفى', 'عيادة', 'طبيب', 'دواء', 'علاج'],
    en: ['health', 'medical', 'hospital', 'clinic', 'medicine', 'doctor', 'healthcare']
  },
  education: {
    fr: ['éducation', 'école', 'université', 'cours', 'formation', 'apprentissage', 'enseignement'],
    darija: ['t3lim', 'mdrasa', 'jami3a', 'dars', 'takwin', 'drous'],
    ar: ['تعليم', 'مدرسة', 'جامعة', 'درس', 'تكوين', 'تعلم', 'تدريس'],
    en: ['education', 'school', 'university', 'course', 'training', 'learning', 'teaching']
  },
  agriculture: {
    fr: ['agriculture', 'ferme', 'agriculteur', 'récolte', 'culture', 'plantation'],
    darija: ['filaha', 'ferma', 'fallah', 'hsad', 'zar3', 'mazra3a'],
    ar: ['فلاحة', 'مزرعة', 'فلاح', 'حصاد', 'زراعة', 'محصول'],
    en: ['agriculture', 'farm', 'farmer', 'harvest', 'cultivation', 'crops']
  },
  technology: {
    fr: ['technologie', 'tech', 'numérique', 'digital', 'informatique', 'logiciel'],
    darija: ['teknolojia', 'tech', 'internet', 'ordinateur', 'application'],
    ar: ['تكنولوجيا', 'تقنية', 'رقمي', 'حاسوب', 'برمجيات', 'تطبيق'],
    en: ['technology', 'tech', 'digital', 'software', 'computer', 'application']
  },
  fintech: {
    fr: ['fintech', 'finance', 'banque', 'paiement', 'argent', 'bancaire'],
    darija: ['banque', 'flous', 'drahim', 'khlas', 'lmahal'],
    ar: ['تكنولوجيا مالية', 'مالية', 'بنك', 'دفع', 'مال', 'نقود'],
    en: ['fintech', 'finance', 'bank', 'payment', 'money', 'banking']
  },
  ecommerce: {
    fr: ['e-commerce', 'commerce', 'vente', 'achat', 'boutique', 'magasin'],
    darija: ['tijara', 'bi3', 'chra', 'mahal', 'dukan'],
    ar: ['تجارة إلكترونية', 'تجارة', 'بيع', 'شراء', 'متجر', 'محل'],
    en: ['e-commerce', 'commerce', 'sale', 'purchase', 'shop', 'store']
  },
  tourism: {
    fr: ['tourisme', 'voyage', 'hôtel', 'vacances', 'destination', 'visite'],
    darija: ['siyaha', 'safar', 'hotel', '3otla', 'rihla'],
    ar: ['سياحة', 'سفر', 'فندق', 'عطلة', 'رحلة', 'زيارة'],
    en: ['tourism', 'travel', 'hotel', 'vacation', 'trip', 'visit']
  },
  environment: {
    fr: ['environnement', 'écologie', 'vert', 'durable', 'recyclage', 'propre'],
    darija: ['bi2a', 'khadra', 'nqi', 'recyclage'],
    ar: ['بيئة', 'إيكولوجيا', 'أخضر', 'مستدام', 'إعادة تدوير', 'نظيف'],
    en: ['environment', 'ecology', 'green', 'sustainable', 'recycling', 'clean']
  },
  social: {
    fr: ['social', 'communauté', 'solidarité', 'aide', 'association'],
    darija: ['ijtima3i', 'jam3iya', 'm3awna', 'mosa3ada'],
    ar: ['اجتماعي', 'مجتمع', 'تضامن', 'مساعدة', 'جمعية'],
    en: ['social', 'community', 'solidarity', 'help', 'association']
  },
  food: {
    fr: ['alimentation', 'nourriture', 'restaurant', 'cuisine', 'gastronomie'],
    darija: ['makla', 'ghda', 'restaurant', 'tabkh'],
    ar: ['طعام', 'غذاء', 'مطعم', 'طبخ', 'أكل'],
    en: ['food', 'nutrition', 'restaurant', 'cooking', 'gastronomy']
  }
};

/**
 * Find keyword domain for a search term
 */
export function findKeywordDomain(query: string): string | null {
  const normalized = normalizeText(query);
  
  for (const [domain, languages] of Object.entries(keywordMappings)) {
    for (const words of Object.values(languages)) {
      for (const word of words) {
        if (normalizeText(word) === normalized || 
            normalizeText(word).includes(normalized) ||
            normalized.includes(normalizeText(word))) {
          return domain;
        }
      }
    }
  }
  
  return null;
}

/**
 * Get all related keywords for a domain
 */
export function getRelatedKeywords(domain: string): string[] {
  const mapping = keywordMappings[domain];
  if (!mapping) return [];
  
  return [
    ...mapping.fr,
    ...mapping.darija,
    ...mapping.ar,
    ...mapping.en
  ];
}

// ============================================================================
// LANGUAGE DETECTION
// ============================================================================

/**
 * Detect the language of a search query
 */
export function detectLanguage(text: string): 'fr' | 'darija' | 'ar' | 'en' {
  if (!text) return 'fr';
  
  // Check for Arabic characters
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'ar';
  }
  
  // Check for French diacritics
  if (/[àâäéèêëïîôùûüÿç]/i.test(text)) {
    return 'fr';
  }
  
  // Check for common Darija transliterations (numbers as letters)
  if (/[0-9]/.test(text) && /[a-z]/i.test(text)) {
    return 'darija';
  }
  
  // Check for common English words
  const commonEnglish = ['the', 'and', 'for', 'with', 'from'];
  const words = text.toLowerCase().split(' ');
  if (words.some(w => commonEnglish.includes(w))) {
    return 'en';
  }
  
  // Default to French
  return 'fr';
}

// ============================================================================
// SEARCH SCORING
// ============================================================================

export interface SearchMatch {
  field: string;
  matchType: 'exact' | 'fuzzy' | 'keyword' | 'partial';
  position: number;
  score: number;
}

/**
 * Calculate relevance score for a search result
 */
export function calculateRelevanceScore(
  idea: any,
  query: string,
  matches: SearchMatch[]
): number {
  let score = 0;
  
  const normalizedQuery = normalizeText(query);
  
  // Title matches (highest weight)
  if (normalizeText(idea.title || '').includes(normalizedQuery)) {
    score += 100;
  }
  if (idea.title_darija && normalizeText(idea.title_darija).includes(normalizedQuery)) {
    score += 100;
  }
  
  // Description matches
  if (normalizeText(idea.problem_statement || '').includes(normalizedQuery)) {
    score += 50;
  }
  if (idea.proposed_solution && normalizeText(idea.proposed_solution).includes(normalizedQuery)) {
    score += 40;
  }
  
  // Sector/Category matches
  if (normalizeText(idea.category || '').includes(normalizedQuery)) {
    score += 30;
  }
  
  // Location matches
  if (normalizeText(idea.location || '').includes(normalizedQuery)) {
    score += 20;
  }
  
  // Add match scores
  matches.forEach(match => {
    score += match.score;
  });
  
  // Boost by idea quality metrics
  score += (idea.total_score || 0) * 0.5; // Base score weight
  score += (idea.receipt_count || 0) * 0.2; // Receipt weight
  score += (idea.upvote_count || 0) * 0.1; // Like weight
  
  // Position bonus (earlier in text = better)
  const minPosition = matches.length > 0 
    ? Math.min(...matches.map(m => m.position)) 
    : 0;
  if (minPosition < 50) {
    score += 10;
  }
  
  // Exact match bonus
  if (matches.some(m => m.matchType === 'exact')) {
    score += 20;
  }
  
  return score;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a field matches the query
 */
export function matchesField(query: string, field: string | null | undefined): boolean {
  if (!field) return false;
  const normalized = normalizeText(field);
  return normalized.includes(query);
}

/**
 * Extract search terms from query
 */
export function extractSearchTerms(query: string): string[] {
  return normalizeText(query)
    .split(' ')
    .filter(term => term.length >= 2); // Minimum 2 characters
}

/**
 * Highlight matching terms in text
 */
export function highlightMatches(text: string, query: string): string {
  if (!query) return text;
  
  const normalized = normalizeText(query);
  const regex = new RegExp(`(${normalized})`, 'gi');
  
  return text.replace(regex, '<mark>$1</mark>');
}

