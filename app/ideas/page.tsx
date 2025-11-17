/**
 * Public Searchable Idea Bank
 * 
 * All ideas (≥15/40 or opt-in) are publicly searchable
 * to build Morocco's innovation knowledge base
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// Icons - using simple SVG or text for now
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { FilterSidebar } from '@/components/ideas/FilterSidebar';
import { SearchSuggestions } from '@/components/ideas/SearchSuggestions';

interface Idea {
  id: string;
  title: string;
  title_darija?: string;
  problem_statement: string;
  proposed_solution?: string;
  location: string;
  category: string;
  total_score?: number;
  stage1_total?: number;
  stage2_total?: number;
  receipt_count?: number;
  upvote_count?: number;
  sdg_alignment?: number[];
  funding_status?: string;
  qualification_tier?: 'exceptional' | 'qualified' | 'developing';
  created_at: string;
  submitter_name?: string;
  has_receipts?: boolean;
}

interface IdeasResponse {
  items: Idea[];
  total: number;
  page: number;
  totalPages: number;
}

export default function IdeasPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    priorities: searchParams.get('priorities')?.split(',') || [],
    sectors: searchParams.get('sectors')?.split(',') || [],
    location: searchParams.get('location') || '',
    scoreMin: parseInt(searchParams.get('scoreMin') || '0'),
    scoreMax: parseInt(searchParams.get('scoreMax') || '100'),
    hasReceipts: searchParams.get('hasReceipts') === 'true',
    sdgs: searchParams.get('sdgs')?.split(',') || [],
    fundingStatus: searchParams.get('fundingStatus') || '',
    qualificationTier: searchParams.get('qualificationTier') || '',
  });
  const [sort, setSort] = useState(searchParams.get('sort') || 'score_desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [ideas, setIdeas] = useState<IdeasResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch ideas
  useEffect(() => {
    const fetchIdeas = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: debouncedSearch,
          page: page.toString(),
          sort,
          ...Object.fromEntries(
            Object.entries(filters).map(([key, value]) => [
              key,
              Array.isArray(value) ? value.join(',') : value.toString(),
            ])
          ),
        });

        const response = await fetch(`/api/ideas/search?${params}`);
        const data = await response.json();
        
        // Handle error response
        if (data.error) {
          console.error('Error fetching ideas:', data.error);
          setIdeas({ items: [], total: 0, page: 1, totalPages: 0 });
        } else {
          setIdeas(data);
        }
      } catch (error) {
        console.error('Error fetching ideas:', error);
        setIdeas({ items: [], total: 0, page: 1, totalPages: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, [debouncedSearch, filters, sort, page]);

  // Fetch search suggestions
  useEffect(() => {
    if (search && search.length > 2) {
      fetch(`/api/ideas/suggestions?q=${encodeURIComponent(search)}`)
        .then((res) => res.json())
        .then((data) => setSearchSuggestions(data.suggestions || []))
        .catch(() => setSearchSuggestions([]));
    } else {
      setSearchSuggestions([]);
    }
  }, [search]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (filters.priorities && filters.priorities.length > 0) params.set('priorities', filters.priorities.join(','));
    if (filters.sectors && filters.sectors.length > 0) params.set('sectors', filters.sectors.join(','));
    if (filters.location) params.set('location', filters.location);
    if (filters.scoreMin !== 15) params.set('scoreMin', filters.scoreMin.toString());
    if (filters.scoreMax !== 40) params.set('scoreMax', filters.scoreMax.toString());
    if (filters.hasReceipts) params.set('hasReceipts', 'true');
    if (filters.sdgs && filters.sdgs.length > 0) params.set('sdgs', filters.sdgs.join(','));
    if (filters.fundingStatus) params.set('fundingStatus', filters.fundingStatus);
    if (filters.qualificationTier) params.set('qualificationTier', filters.qualificationTier);
    if (sort !== 'score_desc') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());

    router.replace(`/ideas?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, filters, sort, page, router]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 via-green-500 to-blue-600 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
              Morocco's Innovation Database
            </h1>
            <p className="text-xl md:text-2xl mb-2 opacity-95">
              {ideas?.total || 0} validated ideas building Morocco's future
            </p>
            <p className="text-lg opacity-90">
              Discover, validate, and support innovative solutions for Morocco
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 border border-slate-200">
          <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">🔍</span>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search ideas in Darija, French, or Arabic... (e.g., 'santé', 'صحة', 'صحة')"
              className="w-full text-lg p-4 pl-12 border-2 border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            />
            {showSuggestions && searchSuggestions && searchSuggestions.length > 0 && (
              <SearchSuggestions
                suggestions={searchSuggestions}
                onSelect={(suggestion) => {
                  setSearch(suggestion);
                  setShowSuggestions(false);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-4">
              <FilterSidebar filters={filters} onChange={handleFilterChange} />
            </div>
          </div>

          {/* Ideas Grid */}
          <div className="lg:col-span-9">
            {/* Sort + Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-semibold text-slate-900">
                  {ideas?.total || 0}
                </span>
                <span>ideas found</span>
                {isLoading && (
                  <span className="text-sm text-slate-400">(loading...)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none bg-white"
                >
                  <option value="score_desc">Highest Score</option>
                  <option value="receipts_desc">Most Receipts</option>
                  <option value="upvotes_desc">Most Upvotes</option>
                  <option value="created_desc">Newest First</option>
                  <option value="created_asc">Oldest First</option>
                  <option value="title_asc">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-lg p-6 animate-pulse"
                  >
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Ideas Grid */}
            {!isLoading && ideas && (
              <>
                {(!ideas.items || ideas.items.length === 0) ? (
                  <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      No ideas found
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Try adjusting your search or filters
                    </p>
                    <button
                      onClick={() => {
                        setSearch('');
            setFilters({
              priorities: [],
              sectors: [],
              location: '',
              scoreMin: 15,
              scoreMax: 40,
              hasReceipts: false,
              sdgs: [],
              fundingStatus: '',
              qualificationTier: '',
            });
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ideas.items?.map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {ideas.totalPages && ideas.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-slate-600">
                      Page {page} of {ideas.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(ideas.totalPages, p + 1))}
                      disabled={page === ideas.totalPages}
                      className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Have an idea to share?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Join Morocco's innovation community and get your idea validated
          </p>
          <Link
            href="/submit"
            className="inline-block px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-slate-100 transition-colors shadow-lg"
          >
            Submit Your Idea
          </Link>
        </div>
      </section>
    </div>
  );
}
