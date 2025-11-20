/**
 * Search Engine Tests
 * 
 * Comprehensive tests for multi-language search functionality
 */

import { searchIdeas, generateSuggestions } from '../searchEngine';
import { 
  normalizeText, 
  normalizeArabic, 
  levenshteinDistance,
  isFuzzyMatch,
  findKeywordDomain,
  detectLanguage 
} from '../searchUtils';

// ============================================================================
// TEST DATA
// ============================================================================

const mockIdeas = [
  {
    id: '1',
    title: 'Application mobile de santé',
    title_darija: 'Application mobile dial sseha',
    problem_statement: 'Les gens ont du mal à accéder aux services de santé',
    problem_statement_darija: 'Nass kay3an9o bach ywaslo l services de sseha',
    proposed_solution: 'Créer une application mobile pour réserver des consultations',
    category: 'Santé',
    location: 'Casablanca',
    tags: ['santé', 'mobile', 'tech'],
    total_score: 85,
    receipt_count: 10,
    upvote_count: 25
  },
  {
    id: '2',
    title: 'Plateforme d\'éducation en ligne',
    problem_statement: 'Manque d\'accès à l\'éducation de qualité dans les zones rurales',
    proposed_solution: 'Développer une plateforme d\'apprentissage en ligne',
    category: 'Éducation',
    location: 'Marrakech',
    tags: ['éducation', 'digital', 'rural'],
    total_score: 92,
    receipt_count: 15,
    upvote_count: 40
  },
  {
    id: '3',
    title: 'Système de gestion agricole',
    problem_statement: 'Les agriculteurs manquent d\'outils modernes pour gérer leurs fermes',
    proposed_solution: 'Un système IoT pour surveiller les cultures',
    category: 'Agriculture',
    location: 'Fès',
    tags: ['agriculture', 'iot', 'tech'],
    total_score: 78,
    receipt_count: 8,
    upvote_count: 20
  },
  {
    id: '4',
    title: 'تطبيق صحي للهواتف الذكية',
    problem_statement: 'صعوبة الوصول إلى الخدمات الصحية',
    proposed_solution: 'تطبيق لحجز المواعيد الطبية',
    category: 'صحة',
    location: 'الرباط',
    tags: ['صحة', 'تطبيق', 'تكنولوجيا'],
    total_score: 80,
    receipt_count: 12,
    upvote_count: 30
  }
];

// ============================================================================
// TEXT NORMALIZATION TESTS
// ============================================================================

describe('normalizeText', () => {
  test('converts to lowercase', () => {
    expect(normalizeText('HELLO')).toBe('hello');
    expect(normalizeText('HeLLo')).toBe('hello');
  });

  test('removes diacritics', () => {
    expect(normalizeText('café')).toBe('cafe');
    expect(normalizeText('éducation')).toBe('education');
    expect(normalizeText('naïve')).toBe('naive');
  });

  test('removes punctuation', () => {
    expect(normalizeText('hello, world!')).toBe('hello world');
    expect(normalizeText('test-case')).toBe('test case');
  });

  test('collapses multiple spaces', () => {
    expect(normalizeText('hello    world')).toBe('hello world');
    expect(normalizeText('test  case  example')).toBe('test case example');
  });

  test('handles Arabic text', () => {
    const result = normalizeText('صحة');
    expect(result).toContain('ص');
  });
});

describe('normalizeArabic', () => {
  test('normalizes different forms of Alef', () => {
    expect(normalizeArabic('أحمد')).toBe('احمد');
    expect(normalizeArabic('إبراهيم')).toBe('ابراهيم');
    expect(normalizeArabic('آمن')).toBe('امن');
  });

  test('normalizes different forms of Ya', () => {
    expect(normalizeArabic('على')).toBe('علي');
  });

  test('removes diacritics', () => {
    expect(normalizeArabic('مَرْحَباً')).toBe('مرحبا');
  });
});

// ============================================================================
// FUZZY MATCHING TESTS
// ============================================================================

describe('levenshteinDistance', () => {
  test('calculates distance correctly', () => {
    expect(levenshteinDistance('cat', 'cat')).toBe(0);
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
    expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
  });

  test('handles empty strings', () => {
    expect(levenshteinDistance('', '')).toBe(0);
    expect(levenshteinDistance('hello', '')).toBe(5);
    expect(levenshteinDistance('', 'world')).toBe(5);
  });
});

describe('isFuzzyMatch', () => {
  test('matches exact strings', () => {
    expect(isFuzzyMatch('health', 'health care')).toBe(true);
    expect(isFuzzyMatch('santé', 'services de santé')).toBe(true);
  });

  test('matches with typos', () => {
    expect(isFuzzyMatch('helth', 'health care', 2)).toBe(true);
    expect(isFuzzyMatch('educaton', 'education platform', 2)).toBe(true);
  });

  test('does not match very different strings', () => {
    expect(isFuzzyMatch('cat', 'elephant', 2)).toBe(false);
    expect(isFuzzyMatch('santé', 'agriculture', 2)).toBe(false);
  });
});

// ============================================================================
// KEYWORD DOMAIN TESTS
// ============================================================================

describe('findKeywordDomain', () => {
  test('finds French keywords', () => {
    expect(findKeywordDomain('santé')).toBe('health');
    expect(findKeywordDomain('éducation')).toBe('education');
    expect(findKeywordDomain('agriculture')).toBe('agriculture');
  });

  test('finds Darija keywords', () => {
    expect(findKeywordDomain('sseha')).toBe('health');
    expect(findKeywordDomain('t3lim')).toBe('education');
  });

  test('finds Arabic keywords', () => {
    expect(findKeywordDomain('صحة')).toBe('health');
    expect(findKeywordDomain('تعليم')).toBe('education');
  });

  test('finds English keywords', () => {
    expect(findKeywordDomain('health')).toBe('health');
    expect(findKeywordDomain('education')).toBe('education');
  });

  test('returns null for unknown keywords', () => {
    expect(findKeywordDomain('xyz123')).toBe(null);
    expect(findKeywordDomain('random')).toBe(null);
  });
});

// ============================================================================
// LANGUAGE DETECTION TESTS
// ============================================================================

describe('detectLanguage', () => {
  test('detects French', () => {
    expect(detectLanguage('santé éducation')).toBe('fr');
    expect(detectLanguage('café résumé')).toBe('fr');
  });

  test('detects Arabic', () => {
    expect(detectLanguage('صحة')).toBe('ar');
    expect(detectLanguage('تعليم')).toBe('ar');
  });

  test('detects Darija (with numbers)', () => {
    expect(detectLanguage('salam 3likom')).toBe('darija');
    expect(detectLanguage('m3aya')).toBe('darija');
  });

  test('detects English', () => {
    expect(detectLanguage('the health system')).toBe('en');
    expect(detectLanguage('for education')).toBe('en');
  });

  test('defaults to French', () => {
    expect(detectLanguage('hello')).toBe('en'); // Common English word
    expect(detectLanguage('bonjour')).toBe('fr'); // Defaults
  });
});

// ============================================================================
// SEARCH TESTS
// ============================================================================

describe('searchIdeas', () => {
  test('finds ideas by French title', () => {
    const results = searchIdeas(mockIdeas, 'santé');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].idea.id).toBe('1');
  });

  test('finds ideas by Darija title', () => {
    const results = searchIdeas(mockIdeas, 'sseha');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].matchedFields).toContain('title_darija');
  });

  test('finds ideas by Arabic text', () => {
    const results = searchIdeas(mockIdeas, 'صحة');
    expect(results.length).toBeGreaterThan(0);
    const arabicIdea = results.find(r => r.idea.id === '4');
    expect(arabicIdea).toBeDefined();
  });

  test('finds ideas by category', () => {
    const results = searchIdeas(mockIdeas, 'éducation');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].idea.category).toBe('Éducation');
  });

  test('finds ideas by location', () => {
    const results = searchIdeas(mockIdeas, 'Casablanca');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].idea.location).toBe('Casablanca');
  });

  test('searches in problem statement', () => {
    const results = searchIdeas(mockIdeas, 'accès');
    expect(results.length).toBeGreaterThan(0);
  });

  test('searches in solution', () => {
    const results = searchIdeas(mockIdeas, 'application mobile');
    expect(results.length).toBeGreaterThan(0);
  });

  test('handles typos with fuzzy matching', () => {
    const results = searchIdeas(mockIdeas, 'sante'); // Missing accent
    expect(results.length).toBeGreaterThan(0);
  });

  test('returns empty for non-matching query', () => {
    const results = searchIdeas(mockIdeas, 'xyz123notfound');
    expect(results.length).toBe(0);
  });

  test('returns empty for empty query', () => {
    const results = searchIdeas(mockIdeas, '');
    expect(results.length).toBe(0);
  });

  test('limits results to maxResults', () => {
    const results = searchIdeas(mockIdeas, 'tech', { maxResults: 1 });
    expect(results.length).toBeLessThanOrEqual(1);
  });

  test('respects minScore threshold', () => {
    const results = searchIdeas(mockIdeas, 'tech', { minScore: 1000 });
    expect(results.length).toBe(0);
  });

  test('ranks results by relevance', () => {
    const results = searchIdeas(mockIdeas, 'santé');
    expect(results.length).toBeGreaterThan(0);
    // First result should have highest score
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  test('cross-language search with keywords', () => {
    const results = searchIdeas(mockIdeas, 'health');
    expect(results.length).toBeGreaterThan(0);
    // Should find French "santé" ideas
    const healthIdea = results.find(r => r.idea.category === 'Santé');
    expect(healthIdea).toBeDefined();
  });
});

// ============================================================================
// SUGGESTIONS TESTS
// ============================================================================

describe('generateSuggestions', () => {
  test('generates suggestions for partial query', () => {
    const suggestions = generateSuggestions(mockIdeas, 'san');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some(s => s.includes('sante'))).toBe(true);
  });

  test('returns empty for very short query', () => {
    const suggestions = generateSuggestions(mockIdeas, 'a');
    expect(suggestions.length).toBe(0);
  });

  test('limits suggestions to maxSuggestions', () => {
    const suggestions = generateSuggestions(mockIdeas, 'a', 3);
    expect(suggestions.length).toBeLessThanOrEqual(3);
  });

  test('returns unique suggestions', () => {
    const suggestions = generateSuggestions(mockIdeas, 'san');
    const unique = new Set(suggestions);
    expect(unique.size).toBe(suggestions.length);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration: Full Search Flow', () => {
  test('multi-language search finds relevant ideas', () => {
    // French search
    const frenchResults = searchIdeas(mockIdeas, 'santé');
    expect(frenchResults.length).toBeGreaterThan(0);

    // Darija search
    const darijaResults = searchIdeas(mockIdeas, 'sseha');
    expect(darijaResults.length).toBeGreaterThan(0);

    // Arabic search
    const arabicResults = searchIdeas(mockIdeas, 'صحة');
    expect(arabicResults.length).toBeGreaterThan(0);

    // All should find health-related ideas
    expect(frenchResults[0].idea.category).toContain('Sant');
  });

  test('search with multiple terms', () => {
    const results = searchIdeas(mockIdeas, 'application mobile santé');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0);
  });

  test('search handles mixed language input', () => {
    const results = searchIdeas(mockIdeas, 'health application');
    expect(results.length).toBeGreaterThan(0);
  });
});

