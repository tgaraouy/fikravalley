/**
 * Complete Example: Ideas Page with Multi-Language Search
 * 
 * This is a complete working example showing how to integrate
 * the multi-language search system into the ideas list page.
 * 
 * To use: Copy this content to app/ideas/page.tsx
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MultiLanguageSearch } from '@/components/search/MultiLanguageSearch';
import IdeaCard from '@/components/IdeaCard';
import { motion } from 'framer-motion';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function IdeasPageWithSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'score' | 'recent'>('relevance');
  
  // Filters
  const [filters, setFilters] = useState({
    status: ['approved'],
    categories: [] as string[],
    locations: [] as string[]
  });

  // Fetch ideas
  useEffect(() => {
    async function fetchIdeas() {
      try {
        setLoading(true);
        const res = await fetch('/api/ideas');
        const data = await res.json();
        
        if (data.success) {
          setIdeas(data.ideas || []);
        }
      } catch (error) {
        console.error('Failed to fetch ideas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchIdeas();
  }, []);

  // Handle search result click
  const handleResultClick = (idea: any) => {
    router.push(`/ideas/${idea.id}`);
  };

  // Get unique categories and locations for filters
  const categories = Array.from(new Set(ideas.map(i => i.category).filter(Boolean)));
  const locations = Array.from(new Set(ideas.map(i => i.location).filter(Boolean)));

  // Apply filters
  const filteredIdeas = ideas.filter(idea => {
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(idea.status)) {
      return false;
    }
    
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(idea.category)) {
      return false;
    }
    
    // Location filter
    if (filters.locations.length > 0 && !filters.locations.includes(idea.location)) {
      return false;
    }
    
    return true;
  });

  // Sort ideas
  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.total_score || 0) - (a.total_score || 0);
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                💡 Ideas Database
              </h1>
              <p className="text-gray-600 mt-1">
                Discover innovative ideas from Morocco and beyond
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => router.push('/submit')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              ✨ Submit Your Idea
            </button>
          </div>

          {/* Multi-Language Search */}
          <MultiLanguageSearch
            ideas={ideas}
            onResultClick={handleResultClick}
            placeholder="🔍 Search in any language... (FR/Darija/AR/EN)"
          />

          {/* Quick Stats */}
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <span><strong>{ideas.length}</strong> Total Ideas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span><strong>{ideas.filter(i => i.status === 'approved').length}</strong> Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <span><strong>{locations.length}</strong> Locations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📂</span>
              <span><strong>{categories.length}</strong> Categories</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-32">
              <h3 className="font-bold text-lg mb-4">🎛️ Filters</h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category: any) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={(e) => {
                          setFilters({
                            ...filters,
                            categories: e.target.checked
                              ? [...filters.categories, category]
                              : filters.categories.filter(c => c !== category)
                          });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Locations</h4>
                <div className="space-y-2">
                  {locations.slice(0, 8).map((location: any) => (
                    <label key={location} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(location)}
                        onChange={(e) => {
                          setFilters({
                            ...filters,
                            locations: e.target.checked
                              ? [...filters.locations, location]
                              : filters.locations.filter(l => l !== location)
                          });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(filters.categories.length > 0 || filters.locations.length > 0) && (
                <button
                  onClick={() => setFilters({ ...filters, categories: [], locations: [] })}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* Ideas Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between">
              {/* View Mode */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4h14M3 8h14M3 12h14M3 16h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="score">Highest Score</option>
                  <option value="recent">Most Recent</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                <strong>{sortedIdeas.length}</strong> {sortedIdeas.length === 1 ? 'idea' : 'ideas'}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin text-6xl mb-4">⏳</div>
                  <p className="text-gray-600">Loading ideas...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && sortedIdeas.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No ideas found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={() => setFilters({ status: ['approved'], categories: [], locations: [] })}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Ideas Grid */}
            {!loading && sortedIdeas.length > 0 && (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {sortedIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <IdeaCard idea={idea} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Load More (if needed) */}
            {sortedIdeas.length >= 50 && (
              <div className="mt-8 text-center">
                <button className="px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-xl font-bold hover:bg-green-50 transition-colors">
                  Load More Ideas
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p className="mb-2">
            💡 Powered by Multi-Language Search (FR/Darija/AR/EN)
          </p>
          <p className="text-sm">
            Built with Next.js, Supabase, and Framer Motion
          </p>
        </div>
      </footer>
    </div>
  );
}

