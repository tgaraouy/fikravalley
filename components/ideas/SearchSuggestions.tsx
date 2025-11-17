/**
 * Search Suggestions Component
 * 
 * Displays search suggestions as user types
 */

interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function SearchSuggestions({ suggestions, onSelect }: SearchSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
      {suggestions.map((suggestion: string, index: number) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="w-full text-left px-4 py-2 hover:bg-green-50 hover:text-green-700 transition-colors border-b border-slate-100 last:border-b-0"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

