/**
 * Multi-Language Search Component
 * 
 * Example implementation of the search system with:
 * - Real-time search
 * - Auto-suggestions
 * - Language detection
 * - Result highlighting
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

interface MultiLanguageSearchProps {
  ideas: any[];
  onResultClick?: (idea: any) => void;
  placeholder?: string;
  className?: string;
}

// ============================================================================
// LANGUAGE NAMES
// ============================================================================

const languageNames = {
  fr: '🇫🇷 Français',
  darija: '🇲🇦 Darija',
  ar: '🇸🇦 العربية',
  en: '🇬🇧 English'
};

const languageExamples = {
  fr: 'Ex: santé, éducation, agriculture',
  darija: 'Ex: sseha, t3lim, filaha',
  ar: 'مثال: صحة، تعليم، فلاحة',
  en: 'Ex: health, education, agriculture'
};

// ============================================================================
// COMPONENT
// ============================================================================

export function MultiLanguageSearch({
  ideas,
  onResultClick,
  placeholder = '🔍 Search in any language... (FR/Darija/AR/EN)',
  className = ''
}: MultiLanguageSearchProps) {
  const {
    query,
    setQuery,
    results,
    isSearching,
    hasResults,
    suggestions,
    selectedSuggestion,
    applySuggestion,
    resultCount,
    language,
    searchTime,
    clearSearch
  } = useSearch(ideas, {
    debounceMs: 300,
    minQueryLength: 2,
    autoSuggest: true,
    maxSuggestions: 5,
    fuzzyThreshold: 2,
    maxResults: 50
  });

  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show results when we have query and results
  useEffect(() => {
    if (query.length >= 2 && (hasResults || suggestions.length > 0)) {
      setShowResults(true);
    } else if (query.length < 2) {
      setShowResults(false);
    }
  }, [query, hasResults, suggestions]);

  const handleClear = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  const handleResultClick = (idea: any) => {
    setShowResults(false);
    setIsFocused(false);
    onResultClick?.(idea);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className={`relative transition-all ${isFocused ? 'shadow-lg' : 'shadow'}`}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-lg"
        />
        
        {/* Loading/Clear Button */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
          {isSearching && (
            <div className="animate-spin text-green-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
          
          {query && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Language & Stats */}
      {isFocused && query.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-200 flex items-center justify-between text-sm z-10"
        >
          <div className="flex items-center gap-4">
            <span className="font-semibold">{languageNames[language]}</span>
            {resultCount > 0 && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-green-600 font-semibold">{resultCount} results</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">{searchTime.toFixed(1)}ms</span>
              </>
            )}
          </div>
          <span className="text-gray-400 text-xs">{languageExamples[language]}</span>
        </motion.div>
      )}

      {/* Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-16 bg-white rounded-xl shadow-2xl border-2 border-gray-200 max-h-[600px] overflow-y-auto z-50"
          >
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="border-b border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => applySuggestion(suggestion)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedSuggestion === index
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {hasResults ? (
              <div className="divide-y divide-gray-200">
                {results.map((result) => (
                  <button
                    key={result.idea.id}
                    onClick={() => handleResultClick(result.idea)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors focus:bg-gray-50 focus:outline-none"
                  >
                    {/* Title */}
                    <h4 className="font-bold text-lg mb-1 line-clamp-1">
                      {result.idea.title}
                    </h4>
                    
                    {/* Darija Title */}
                    {result.idea.title_darija && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {result.idea.title_darija}
                      </p>
                    )}
                    
                    {/* Problem Statement */}
                    {result.idea.problem_statement && (
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {result.idea.problem_statement}
                      </p>
                    )}
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="font-semibold text-green-600">
                        Score: {result.score.toFixed(1)}
                      </span>
                      
                      {result.idea.category && (
                        <>
                          <span>|</span>
                          <span>📂 {result.idea.category}</span>
                        </>
                      )}
                      
                      {result.idea.location && (
                        <>
                          <span>|</span>
                          <span>📍 {result.idea.location}</span>
                        </>
                      )}
                      
                      <span>|</span>
                      <span className="text-gray-400">
                        Matched: {result.matchedFields.slice(0, 2).join(', ')}
                        {result.matchedFields.length > 2 && ` +${result.matchedFields.length - 2}`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 && !isSearching ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try different keywords or check for typos
                </p>
                <div className="text-sm text-gray-400">
                  <p>💡 Tips:</p>
                  <p>• Try searching in different languages</p>
                  <p>• Use simpler keywords (e.g., "santé" instead of "services de santé")</p>
                  <p>• Check category names or locations</p>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default MultiLanguageSearch;

