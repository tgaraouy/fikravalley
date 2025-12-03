/**
 * Mobile Search Component
 * 
 * Full-screen search experience optimized for mobile
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Mic } from 'lucide-react';

interface MobileSearchProps {
  onClose: () => void;
  initialQuery?: string;
}

export function MobileSearch({ onClose, initialQuery = '' }: MobileSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Focus input on mount
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));

    // Navigate to ideas page with query
    router.push(`/ideas?q=${encodeURIComponent(searchQuery)}`);
    onClose();
  };

  const handleVoiceSearch = () => {
    // Redirect to voice submission page
    router.push('/submit-voice');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 md:hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(query);
              }
            }}
            placeholder="Rechercher des idées..."
            className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white text-slate-900"
            autoComplete="off"
          />
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg"
          aria-label="Fermer"
        >
          <X className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100vh-80px)] p-4">
        {/* Quick Actions */}
        <div className="mb-6">
          <button
            onClick={handleVoiceSearch}
            className="w-full flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-colors"
          >
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-900">Recherche vocale</div>
              <div className="text-sm text-slate-600">Parlez votre recherche</div>
            </div>
          </button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Recherches récentes</h3>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left"
                >
                  <span className="text-slate-700">{search}</span>
                  <Search className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Filters */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Filtres rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Santé', query: 'category:health' },
              { label: 'Éducation', query: 'category:education' },
              { label: 'Tech', query: 'category:tech' },
              { label: 'Agriculture', query: 'category:agriculture' },
            ].map((filter) => (
              <button
                key={filter.label}
                onClick={() => handleSearch(filter.query)}
                className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 font-medium"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

