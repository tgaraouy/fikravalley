/**
 * Multi-Language Search Engine
 * 
 * Main search functionality with cross-language support,
 * fuzzy matching, and intelligent ranking
 */

import { 
  normalizeText, 
  normalizeArabic, 
  isFuzzyMatch,
  findKeywordDomain,
  getRelatedKeywords,
  detectLanguage,
  calculateRelevanceScore,
  matchesField,
  extractSearchTerms,
  type SearchMatch
} from './searchUtils';

// ============================================================================
// TYPES
// ============================================================================

export interface Idea {
  id: string;
  title: string;
  title_darija?: string;
  problem_statement?: string;
  problem_statement_darija?: string;
  proposed_solution?: string;
  proposed_solution_darija?: string;
  category?: string;
  location?: string;
  target_demographic?: string;
  market_size?: string;
  implementation_timeframe?: string;
  tags?: string[];
  total_score?: number;
  receipt_count?: number;
  upvote_count?: number;
}

export interface SearchResult {
  idea: Idea;
  score: number;
  matches: SearchMatch[];
  matchedFields: string[];
  language: 'fr' | 'darija' | 'ar' | 'en';
}

export interface SearchOptions {
  fuzzyThreshold?: number;  // Default: 2
  minScore?: number;        // Default: 0
  maxResults?: number;      // Default: 100
  includePartialMatches?: boolean; // Default: true
  boostRecent?: boolean;    // Default: false
}

// ============================================================================
// MAIN SEARCH FUNCTION
// ============================================================================

/**
 * Search ideas with multi-language support
 */
export function searchIdeas(
  ideas: Idea[],
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const {
    fuzzyThreshold = 2,
    minScore = 0,
    maxResults = 100,
    includePartialMatches = true
  } = options;

  const normalizedQuery = normalizeText(query);
  const language = detectLanguage(query);
  const searchTerms = extractSearchTerms(query);
  
  // Find keyword domain for cross-language expansion
  const keywordDomain = findKeywordDomain(query);
  const expandedKeywords = keywordDomain 
    ? getRelatedKeywords(keywordDomain) 
    : [];

  // Search each idea
  const results: SearchResult[] = [];

  for (const idea of ideas) {
    const matches: SearchMatch[] = [];
    const matchedFields = new Set<string>();

    // Search in title (French)
    if (idea.title) {
      const titleMatches = searchInField(
        idea.title, 
        normalizedQuery, 
        searchTerms,
        expandedKeywords,
        'title',
        fuzzyThreshold
      );
      matches.push(...titleMatches);
      if (titleMatches.length > 0) matchedFields.add('title');
    }

    // Search in title (Darija)
    if (idea.title_darija) {
      const titleDarijaMatches = searchInField(
        idea.title_darija, 
        normalizedQuery, 
        searchTerms,
        expandedKeywords,
        'title_darija',
        fuzzyThreshold
      );
      matches.push(...titleDarijaMatches);
      if (titleDarijaMatches.length > 0) matchedFields.add('title_darija');
    }

    // Search in problem statement (French)
    if (idea.problem_statement) {
      const problemMatches = searchInField(
        idea.problem_statement, 
        normalizedQuery, 
        searchTerms,
        expandedKeywords,
        'problem_statement',
        fuzzyThreshold
      );
      matches.push(...problemMatches);
      if (problemMatches.length > 0) matchedFields.add('problem_statement');
    }

    // Search in problem statement (Darija)
    if (idea.problem_statement_darija) {
      const problemDarijaMatches = searchInField(
        idea.problem_statement_darija, 
        normalizedQuery, 
        searchTerms,
        expandedKeywords,
        'problem_statement_darija',
        fuzzyThreshold
      );
      matches.push(...problemDarijaMatches);
      if (problemDarijaMatches.length > 0) matchedFields.add('problem_statement_darija');
    }

    // Search in solution (French)
    if (idea.proposed_solution) {
      const solutionMatches = searchInField(
        idea.proposed_solution, 
        normalizedQuery, 
        searchTerms,
        expandedKeywords,
        'proposed_solution',
        fuzzyThreshold
      );
      matches.push(...solutionMatches);
      if (solutionMatches.length > 0) matchedFields.add('proposed_solution');
    }

    // Search in solution (Darija)
    if (idea.proposed_solution_darija) {
      const solutionDarijaMatches = searchInField(
        idea.proposed_solution_darija, 
        normalizedQuery, 
        searchTerms,
        expandedKeywords,
        'proposed_solution_darija',
        fuzzyThreshold
      );
      matches.push(...solutionDarijaMatches);
      if (solutionDarijaMatches.length > 0) matchedFields.add('proposed_solution_darija');
    }

    // Search in category
    if (idea.category && matchesField(normalizedQuery, idea.category)) {
      matches.push({
        field: 'category',
        matchType: 'exact',
        position: 0,
        score: 30
      });
      matchedFields.add('category');
    }

    // Search in location
    if (idea.location && matchesField(normalizedQuery, idea.location)) {
      matches.push({
        field: 'location',
        matchType: 'exact',
        position: 0,
        score: 20
      });
      matchedFields.add('location');
    }

    // Search in tags
    if (idea.tags && Array.isArray(idea.tags)) {
      for (const tag of idea.tags) {
        if (matchesField(normalizedQuery, tag)) {
          matches.push({
            field: 'tags',
            matchType: 'exact',
            position: 0,
            score: 15
          });
          matchedFields.add('tags');
          break;
        }
      }
    }

    // If we found matches, calculate score and add to results
    if (matches.length > 0 || (includePartialMatches && matchedFields.size > 0)) {
      const score = calculateRelevanceScore(idea, normalizedQuery, matches);
      
      if (score >= minScore) {
        results.push({
          idea,
          score,
          matches,
          matchedFields: Array.from(matchedFields),
          language
        });
      }
    }
  }

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  // Limit results
  return results.slice(0, maxResults);
}

// ============================================================================
// FIELD SEARCH HELPER
// ============================================================================

/**
 * Search within a specific field
 */
function searchInField(
  fieldValue: string,
  normalizedQuery: string,
  searchTerms: string[],
  expandedKeywords: string[],
  fieldName: string,
  fuzzyThreshold: number
): SearchMatch[] {
  const matches: SearchMatch[] = [];
  const normalizedField = normalizeText(fieldValue);

  // Exact match
  const exactPosition = normalizedField.indexOf(normalizedQuery);
  if (exactPosition !== -1) {
    matches.push({
      field: fieldName,
      matchType: 'exact',
      position: exactPosition,
      score: getFieldWeight(fieldName) * 2
    });
  }

  // Partial matches for each term
  for (const term of searchTerms) {
    if (term.length >= 2) {
      const position = normalizedField.indexOf(term);
      if (position !== -1) {
        matches.push({
          field: fieldName,
          matchType: 'partial',
          position,
          score: getFieldWeight(fieldName) * 0.5
        });
      }
    }
  }

  // Fuzzy matches
  if (isFuzzyMatch(normalizedQuery, normalizedField, fuzzyThreshold)) {
    matches.push({
      field: fieldName,
      matchType: 'fuzzy',
      position: 0,
      score: getFieldWeight(fieldName) * 0.3
    });
  }

  // Keyword matches (cross-language)
  for (const keyword of expandedKeywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedField.includes(normalizedKeyword)) {
      matches.push({
        field: fieldName,
        matchType: 'keyword',
        position: normalizedField.indexOf(normalizedKeyword),
        score: getFieldWeight(fieldName) * 0.8
      });
    }
  }

  return matches;
}

/**
 * Get weight for different fields
 */
function getFieldWeight(field: string): number {
  const weights: Record<string, number> = {
    'title': 100,
    'title_darija': 100,
    'problem_statement': 50,
    'problem_statement_darija': 50,
    'proposed_solution': 40,
    'proposed_solution_darija': 40,
    'category': 30,
    'location': 20,
    'tags': 15
  };
  
  return weights[field] || 10;
}

// ============================================================================
// SEARCH SUGGESTIONS
// ============================================================================

/**
 * Generate search suggestions based on partial query
 */
export function generateSuggestions(
  ideas: Idea[],
  partialQuery: string,
  maxSuggestions: number = 5
): string[] {
  if (!partialQuery || partialQuery.length < 2) {
    return [];
  }

  const normalizedQuery = normalizeText(partialQuery);
  const suggestions = new Set<string>();

  // Extract unique words from all searchable fields
  const words = new Set<string>();

  for (const idea of ideas) {
    // Add words from titles
    if (idea.title) {
      extractWords(idea.title, words);
    }
    if (idea.title_darija) {
      extractWords(idea.title_darija, words);
    }
    
    // Add categories
    if (idea.category) {
      words.add(normalizeText(idea.category));
    }
    
    // Add locations
    if (idea.location) {
      words.add(normalizeText(idea.location));
    }
    
    // Add tags
    if (idea.tags) {
      idea.tags.forEach(tag => words.add(normalizeText(tag)));
    }
  }

  // Find matching words
  for (const word of words) {
    if (word.startsWith(normalizedQuery) && word.length > normalizedQuery.length) {
      suggestions.add(word);
      if (suggestions.size >= maxSuggestions) break;
    }
  }

  return Array.from(suggestions).slice(0, maxSuggestions);
}

/**
 * Extract words from text
 */
function extractWords(text: string, words: Set<string>): void {
  const normalized = normalizeText(text);
  const tokens = normalized.split(' ');
  
  for (const token of tokens) {
    if (token.length >= 3) { // Only words with 3+ characters
      words.add(token);
    }
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  searchIdeas,
  generateSuggestions,
  detectLanguage,
  normalizeText
};

