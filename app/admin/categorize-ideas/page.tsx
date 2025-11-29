'use client';

import { useEffect, useMemo, useState } from 'react';
import { MOROCCAN_PRIORITIES, type MoroccanPriorityCode } from '@/lib/constants/moroccan-priorities';

interface AdminIdea {
  id: string;
  title: string;
  problem_statement: string;
  proposed_solution?: string;
  category: string;
  location: string;
  moroccan_priorities?: string[] | null;
  sdg_alignment?: any;
  budget_tier?: string | null;
  location_type?: string | null;
  complexity?: string | null;
  adoption_count?: number | null;
  created_at: string;
}

interface FilterState {
  moroccan_priorities: MoroccanPriorityCode[];
  budget_tier: string[];
  location_type: string[];
  complexity: string[];
}

const BUDGET_TIERS = ['<1K', '1K-5K', '5K-10K', '10K+'] as const;
const LOCATION_TYPES = ['urban', 'rural', 'both'] as const;
const COMPLEXITY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

function FilterSection({
  title,
  children,
  isDefaultExpanded = false,
}: {
  title: string;
  children: React.ReactNode;
  isDefaultExpanded?: boolean;
}) {
  const [open, setOpen] = useState(isDefaultExpanded);
  return (
    <div className="border-b border-slate-200 pb-4 mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm font-semibold text-slate-800"
      >
        <span>{title}</span>
        <span className="text-xs text-slate-500">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

export default function AdminCategorizeIdeasPage() {
  const [ideas, setIdeas] = useState<AdminIdea[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    moroccan_priorities: [],
    budget_tier: [],
    location_type: [],
    complexity: [],
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchIdeas = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        const res = await fetch(`/api/admin/ideas/categorize?${params.toString()}`);
        const data = await res.json();
        setIdeas(data.ideas || []);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching ideas for categorization:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, [search]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleFilter = (field: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const current = new Set(prev[field]);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      return { ...prev, [field]: Array.from(current) as any };
    });
  };

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const priorities = (idea.moroccan_priorities || []) as string[];
      if (filters.moroccan_priorities.length > 0) {
        const hasAny = filters.moroccan_priorities.some((p) => priorities.includes(p));
        if (!hasAny) return false;
      }
      if (filters.budget_tier.length > 0 && idea.budget_tier && !filters.budget_tier.includes(idea.budget_tier)) {
        return false;
      }
      if (filters.location_type.length > 0 && idea.location_type && !filters.location_type.includes(idea.location_type)) {
        return false;
      }
      if (filters.complexity.length > 0 && idea.complexity && !filters.complexity.includes(idea.complexity)) {
        return false;
      }
      return true;
    });
  }, [ideas, filters]);

  const getCountByPriority = (code: MoroccanPriorityCode) => {
    return ideas.filter((idea) => (idea.moroccan_priorities || []).includes(code)).length;
  };

  const handleBulkUpdate = async (payload: Partial<Pick<AdminIdea, 'moroccan_priorities' | 'budget_tier' | 'location_type' | 'complexity'>>) => {
    if (selectedIds.size === 0) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/ideas/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaIds: Array.from(selectedIds),
          ...payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update ideas');
        return;
      }
      // Refresh ideas
      const refreshed = await fetch('/api/admin/ideas/categorize');
      const refreshedData = await refreshed.json();
      setIdeas(refreshedData.ideas || []);
      setSelectedIds(new Set());
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in bulk update:', error);
      }
      alert('Error updating ideas. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatBudgetTier = (tier?: string | null) => {
    if (!tier) return 'Budget ?';
    switch (tier) {
      case '<1K':
        return '< 1K DH';
      case '1K-5K':
        return '1K–5K DH';
      case '5K-10K':
        return '5K–10K DH';
      case '10K+':
        return '10K+ DH';
      default:
        return tier;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Categorisation Maroc-First des Idées</h1>
            <p className="text-sm text-slate-600 mt-1">
              Associez chaque idée aux priorités nationales, budget, niveau de compétence et type de localisation.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Rechercher une idée..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none bg-white"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <aside className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:col-span-1">
            <FilterSection title="🇲🇦 Priorités Marocaines (Primary)" isDefaultExpanded={true}>
              {MOROCCAN_PRIORITIES.map((priority) => (
                <label key={priority.code} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                    checked={filters.moroccan_priorities.includes(priority.code)}
                    onChange={() => toggleFilter('moroccan_priorities', priority.code)}
                  />
                  <span className="flex items-center gap-1">
                    <span>{priority.icon}</span>
                    <span>{priority.name}</span>
                  </span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] ${priority.color}`}>
                    {getCountByPriority(priority.code)}
                  </span>
                </label>
              ))}
            </FilterSection>

            <FilterSection title="💰 Budget Tier">
              {BUDGET_TIERS.map((tier) => (
                <label key={tier} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                    checked={filters.budget_tier.includes(tier)}
                    onChange={() => toggleFilter('budget_tier', tier)}
                  />
                  <span>{formatBudgetTier(tier)}</span>
                </label>
              ))}
            </FilterSection>

            <FilterSection title="🎯 Skill Level">
              {COMPLEXITY_LEVELS.map((lvl) => (
                <label key={lvl} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                    checked={filters.complexity.includes(lvl)}
                    onChange={() => toggleFilter('complexity', lvl)}
                  />
                  <span className="capitalize">{lvl}</span>
                </label>
              ))}
            </FilterSection>

            <FilterSection title="📍 Location Type">
              {LOCATION_TYPES.map((loc) => (
                <label key={loc} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                    checked={filters.location_type.includes(loc)}
                    onChange={() => toggleFilter('location_type', loc)}
                  />
                  <span className="capitalize">{loc}</span>
                </label>
              ))}
            </FilterSection>

            <FilterSection title="🌍 SDG Alignment (Secondary)" isDefaultExpanded={false}>
              <p className="text-xs text-slate-500">
                À implémenter : filtres ODD secondaires après priorités marocaines.
              </p>
            </FilterSection>
          </aside>

          {/* Main content */}
          <section className="lg:col-span-3 space-y-4">
            {/* Bulk actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="text-sm text-slate-700">
                <span className="font-semibold">{filteredIdeas.length}</span> idées affichées •{' '}
                <span className="font-semibold">{selectedIds.size}</span> sélectionnées
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {/* Simple bulk presets for Moroccan priorities */}
                {MOROCCAN_PRIORITIES.slice(0, 3).map((priority) => (
                  <button
                    key={priority.code}
                    type="button"
                    disabled={selectedIds.size === 0 || isSaving}
                    onClick={() => handleBulkUpdate({ moroccan_priorities: [priority.code] })}
                    className="px-3 py-1 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <span>{priority.icon}</span>
                    <span>{priority.name}</span>
                  </button>
                ))}
                <button
                  type="button"
                  disabled={selectedIds.size === 0 || isSaving}
                  onClick={() => handleBulkUpdate({ budget_tier: '1K-5K' })}
                  className="px-3 py-1 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Set Budget 1K–5K
                </button>
              </div>
            </div>

            {/* Ideas list */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              {isLoading ? (
                <div className="p-6 text-center text-slate-500 text-sm">Chargement des idées...</div>
              ) : filteredIdeas.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">Aucune idée trouvée pour ces filtres.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredIdeas.map((idea) => {
                    const isSelected = selectedIds.has(idea.id);
                    const priorities = (idea.moroccan_priorities || []) as string[];
                    return (
                      <div key={idea.id} className="p-4 flex gap-3 items-start hover:bg-slate-50">
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                            checked={isSelected}
                            onChange={() => toggleSelect(idea.id)}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-slate-900 text-sm">
                              {idea.title}
                            </h3>
                            <span className="text-[11px] text-slate-500">
                              {new Date(idea.created_at).toLocaleDateString('fr-MA')}
                            </span>
                          </div>

                          {/* Moroccan priorities badges */}
                          <div className="flex gap-1 flex-wrap mb-1">
                            {priorities.length === 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                                + Ajouter priorité marocaine
                              </span>
                            )}
                            {priorities.slice(0, 3).map((code) => {
                              const priority = MOROCCAN_PRIORITIES.find((p) => p.code === code);
                              if (!priority) return null;
                              return (
                                <span
                                  key={code}
                                  className={`px-2 py-0.5 rounded-full text-[10px] ${priority.color}`}
                                  title={priority.description}
                                >
                                  {priority.icon} {priority.name.split(' ')[0]}
                                </span>
                              );
                            })}
                            {priorities.length > 3 && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                                +{priorities.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Budget / complexity / location */}
                          <div className="flex gap-2 flex-wrap text-[11px]">
                            {idea.budget_tier && (
                              <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                                {formatBudgetTier(idea.budget_tier)}
                              </span>
                            )}
                            {idea.complexity && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 capitalize">
                                {idea.complexity}
                              </span>
                            )}
                            {idea.location_type && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                                {idea.location_type}
                              </span>
                            )}
                            {idea.adoption_count && idea.adoption_count > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px]">
                                🔥 {idea.adoption_count} adoptions
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2">
                            {idea.problem_statement}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


