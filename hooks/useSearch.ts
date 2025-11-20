/**
 * useSearch Hook
 * 
 * React hook for multi-language search with debouncing,
 * suggestions, and result management
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { searchIdeas, generateSuggestions, type SearchResult, type SearchOptions } from '@/lib/search/searchEngine';
import { detectLanguage } from '@/lib/search/searchUtils';

// ============================================================================
// TYPES
// ============================================================================

export interface UseSearchOptions extends SearchOptions {
  debounceMs?: number;       // Default: 300ms
  minQueryLength?: number;   // Default: 2
  autoSuggest?: boolean;     // Default: true
  maxSuggestions?: number;   // Default: 5
}

export interface UseSearchReturn {
  // Query state
  query: string;
  setQuery: (query: string) => void;
  
  // Results
  results: SearchResult[];
  isSearching: boolean;
  hasResults: boolean;
  
  // Suggestions
  suggestions: string[];
  selectedSuggestion: number;
  selectSuggestion: (index: number) => void;
  applySuggestion: (suggestion: string) => void;
  
  // Metadata
  resultCount: number;
  language: 'fr' | 'darija' | 'ar' | 'en';
  searchTime: number;
  
  // Actions
  clearSearch: () => void;
  refineSearch: (newQuery: string) => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSearch(
  ideas: any[],
  options: UseSearchOptions = {}
): UseSearchReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    autoSuggest = true,
    maxSuggestions = 5,
    ...searchOptions
  } = options;

  // State
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Perform search
  useEffect(() => {
    if (debouncedQuery.length < minQueryLength) {
      setResults([]);
      setSuggestions([]);
      setSearchTime(0);
      return;
    }

    setIsSearching(true);
    const startTime = performance.now();

    try {
      // Perform search
      const searchResults = searchIdeas(ideas, debouncedQuery, searchOptions);
      setResults(searchResults);

      // Generate suggestions
      if (autoSuggest) {
        const newSuggestions = generateSuggestions(
          ideas,
          debouncedQuery,
          maxSuggestions
        );
        setSuggestions(newSuggestions);
      }

      const endTime = performance.now();
      setSearchTime(endTime - startTime);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedQuery, ideas, minQueryLength, autoSuggest, maxSuggestions]);

  // Detect language
  const language = useMemo(() => {
    return detectLanguage(query);
  }, [query]);

  // Computed values
  const hasResults = results.length > 0;
  const resultCount = results.length;

  // Actions
  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setSuggestions([]);
    setSelectedSuggestion(-1);
    setSearchTime(0);
  }, []);

  const refineSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setSelectedSuggestion(-1);
  }, []);

  const selectSuggestion = useCallback((index: number) => {
    setSelectedSuggestion(index);
  }, []);

  const applySuggestion = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    setSelectedSuggestion(-1);
  }, []);

  // Keyboard navigation for suggestions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestion]);
      } else if (e.key === 'Escape') {
        setSuggestions([]);
        setSelectedSuggestion(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedSuggestion, applySuggestion]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasResults,
    suggestions,
    selectedSuggestion,
    selectSuggestion,
    applySuggestion,
    resultCount,
    language,
    searchTime,
    clearSearch,
    refineSearch
  };
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useSearch;

