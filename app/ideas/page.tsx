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
import Image from 'next/image';
// Icons - using simple SVG or text for now
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { FilterSidebar } from '@/components/ideas/FilterSidebar';
import { SearchSuggestions } from '@/components/ideas/SearchSuggestions';
import IdeasDatabaseHero from '@/components/database/IdeasDatabaseHero';

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
  sdg_alignment?: number[] | { sdgTags?: number[] } | null;
  funding_status?: string;
  qualification_tier?: 'exceptional' | 'qualified' | 'developing';
  created_at: string;
  submitter_name?: string;
  has_receipts?: boolean;
  moroccan_priorities?: string[];
  budget_tier?: string | null;
  location_type?: string | null;
  complexity?: string | null;
  adoption_count?: number | null;
  engagement_score?: number;
  claim_count?: number;
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
    budget_tiers: searchParams.get('budget_tiers')?.split(',').filter(Boolean) || [],
    location_types: searchParams.get('location_types')?.split(',').filter(Boolean) || [],
    // complexities and sdg_tags removed - internal matching only, not user-facing
  });
  const [sort, setSort] = useState(searchParams.get('sort') || 'score_desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [ideas, setIdeas] = useState<IdeasResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trending, setTrending] = useState<Idea[]>([]);
  const [topIdeas, setTopIdeas] = useState<Idea[]>([]);
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

  // Fetch trending & top ideas (once on load)
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const [trendingRes, topRes] = await Promise.all([
          fetch('/api/ideas/trending?limit=6'),
          fetch('/api/ideas/top?limit=5'),
        ]);
        const trendingData = await trendingRes.json();
        const topData = await topRes.json();
        setTrending(trendingData.items || []);
        setTopIdeas(topData.items || []);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching trending/top ideas:', error);
        }
      }
    };

    fetchHighlights();
  }, []);

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
      {/* Hero Section with Integrated Search */}
      <IdeasDatabaseHero
        totalIdeas={ideas?.total || 0}
        searchQuery={search}
        onSearchChange={(query) => {
          setSearch(query);
          setShowSuggestions(true);
        }}
        onSearchFocus={() => setShowSuggestions(true)}
        onSearchBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      {/* Incentives & Featured (New) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-terracotta-100">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-bold text-slate-900">Get Your AI Score</h3>
            <p className="text-sm text-slate-600 mt-1">Submit your idea to get an instant feasibility score from 7 AI agents.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-brand-100">
            <div className="text-3xl mb-2">🤝</div>
            <h3 className="font-bold text-slate-900">Find Co-Founders</h3>
            <p className="text-sm text-slate-600 mt-1">Connect with others working on similar problems in your city.</p>
          </div>
          <div className="bg-gradient-to-br from-terracotta-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold">Intilaka Ready</h3>
            <p className="text-sm text-white/90 mt-1">Generate a bank-ready PDF dossier automatically.</p>
            <Link href="/submit-voice" className="inline-block mt-3 text-xs bg-white text-red-600 px-3 py-1 rounded-full font-bold">
              Start Now ➡️
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Trending & Top 5 */}
        {(trending.length > 0 || topIdeas.length > 0) && (
          <div className="mb-10 grid lg:grid-cols-3 gap-6">
            {trending.length > 0 && (
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-amber-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>🔥 Trending Ideas</span>
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                      Top {trending.length}
                    </span>
                  </h2>
                  <span className="text-xs text-slate-500">
                    Basé sur likes, validations et claims GenZ
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {trending.map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))}
                </div>
              </div>
            )}

            {topIdeas.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-green-100 p-5">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>🏆 Top 5</span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                    Plus engageantes
                  </span>
                </h2>
                <div className="space-y-3">
                  {topIdeas.map((idea, index) => (
                    <button
                      key={idea.id}
                      onClick={() => {
                        window.location.href = `/ideas/${idea.id}`;
                      }}
                      className="w-full flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                            {idea.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {idea.location} • {idea.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 text-right">
                        <div>🔥 score</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
                          budget_tiers: [],
                          location_types: [],
                          // complexities and sdg_tags removed - internal matching only
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

      {/* SolarGuard Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-slate-700">
              <p className="text-xs uppercase tracking-[0.2em] text-green-600 font-semibold">
                Mission SolarGuard • Khouribga
              </p>
              <h3 className="text-3xl font-bold text-slate-900">
                Du champ solaire poussiéreux à une startup climat
              </h3>
              <p className="text-sm leading-relaxed">
                Une bande d&apos;amis de Khouribga a vu les panneaux solaires couverts de poussière. 
                Leur idée? Construire <strong>SolarGuard</strong>, un système de maintenance prédictive avec 
                capteurs IoT, IA et drones. Grâce à leur mentore Khadija El Ouafi, ils sont passés de l&apos;observation à un prototype validé sur le terrain.
              </p>
              <ol className="space-y-3 text-sm list-decimal list-inside">
                <li>
                  <strong>Observation terrain :</strong> visite du site, photos des panneaux poussiéreux, idée de nettoyage prédictif.
                </li>
                <li>
                  <strong>Pitch mentor :</strong> appel vidéo avec Khadija pour montrer les maquettes, ROI et nom officiel &quot;SolarGuard&quot;.
                </li>
                <li>
                  <strong>Prototype & test :</strong> drone + IA détectent un besoin de nettoyage deux semaines à l&apos;avance → validation live.
                </li>
                <li>
                  <strong>Lancement :</strong> identité pro, storytelling climat et dossier prêt pour Intilaka.
                </li>
              </ol>
              <p className="text-xs text-slate-500">
                هذه القصة كتأكد بلي Gen Z المغربي قادر يحول ملاحظة بسيطة إلى شركة خضراء.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { src: '/png/SolarGard-story1.png', label: 'Inspection terrain', detail: 'Khouribga · panneaux poussiéreux' },
                { src: '/png/SolarGard-story2.png', label: 'Prototype & drone', detail: 'Données live sur laptop' },
                { src: '/png/SolarGard-story3.png', label: 'Pitch mentor', detail: 'Visio avec Khadija El Ouafi' },
              ].map((shot) => (
                <figure key={shot.src} className="bg-slate-50 rounded-xl border border-amber-100 p-3 flex flex-col">
                  <div className="relative w-full h-36 rounded-lg overflow-hidden mb-3">
                    <Image
                      src={shot.src}
                      alt={shot.label}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption>
                    <p className="text-sm font-semibold text-slate-900">{shot.label}</p>
                    <p className="text-xs text-slate-600">{shot.detail}</p>
                  </figcaption>
                </figure>
              ))}
              <figure className="bg-green-50 rounded-xl border border-green-100 p-4 flex flex-col items-center justify-center text-center">
                <div className="relative w-28 h-20 mb-3">
                  <Image
                    src="/png/SolarGard-story-logo.png"
                    alt="SolarGuard Brand"
                    fill
                    sizes="120px"
                    className="object-contain"
                  />
                </div>
                <p className="text-sm font-semibold text-green-800">Marque SolarGuard</p>
                <p className="text-xs text-green-600">Protection des investissements solaires</p>
              </figure>
            </div>
          </div>
        </div>
      </section>

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
