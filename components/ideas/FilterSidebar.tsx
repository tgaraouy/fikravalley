/**
 * Filter Sidebar Component
 * 
 * Provides filtering options for the idea bank
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { MOROCCO_PRIORITIES } from '@/lib/idea-bank/scoring/morocco-priorities';
import { getAllSDGNumbers, getSDGInfo } from '@/lib/constants/sdg-info';
// Icons - using simple text for now

interface Filters {
  priorities: string[]; // Morocco priorities (primary)
  sectors: string[];
  location: string;
  scoreMin: number;
  scoreMax: number;
  budget_tiers: string[];
  location_types: string[];
  // complexities and sdg_tags removed - internal matching only, not user-facing
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  defaultCollapsed?: boolean; // Allow parent to control initial state
}


const MOROCCO_CITIES = [
  'Casablanca',
  'Rabat',
  'Fes',
  'Marrakech',
  'Tangier',
  'Agadir',
  'Meknes',
  'Oujda',
  'Kenitra',
  'Tetouan',
  'Safi',
  'Mohammedia',
  'El Jadida',
  'Nador',
  'Beni Mellal',
  'Taza',
  'Khouribga',
  'Settat',
  'Larache',
  'Khemisset',
  'Other',
];

export function FilterSidebar({ filters, onChange, defaultCollapsed }: FilterSidebarProps) {
  // On mobile, collapse by default; on desktop, use prop or default to expanded
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [isCollapsed, setIsCollapsed] = useState(
    defaultCollapsed !== undefined ? defaultCollapsed : isMobile
  );

  // Update collapsed state when mobile state changes
  useEffect(() => {
    if (defaultCollapsed === undefined) {
      setIsCollapsed(isMobile);
    }
  }, [isMobile, defaultCollapsed]);
  const [expandedSections, setExpandedSections] = useState({
    priorities: true, // Morocco priorities - always prominent
    budget: false,
    locationType: false,
    location: true,
    score: true,
    // skill and sdg removed - internal matching only, not user-facing
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleArrayFilter = (key: keyof Filters, value: string) => {
    const current = (filters[key] as string[]) || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateFilter(key, next as any);
  };

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleSector = (sectorId: string) => {
    const newSectors = filters.sectors.includes(sectorId)
      ? filters.sectors.filter((s) => s !== sectorId)
      : [...filters.sectors, sectorId];
    updateFilter('sectors', newSectors);
  };

  const togglePriority = (priorityId: string) => {
    const newPriorities = (filters.priorities || []).includes(priorityId)
      ? (filters.priorities || []).filter((p) => p !== priorityId)
      : [...(filters.priorities || []), priorityId];
    updateFilter('priorities', newPriorities);
  };

  const clearFilters = () => {
    onChange({
      priorities: [],
      sectors: [],
      location: '',
      scoreMin: 15,
      scoreMax: 40,
      budget_tiers: [],
      location_types: [],
      // complexities and sdg_tags removed - internal matching only
    });
  };

  const hasActiveFilters =
    (filters.priorities && filters.priorities.length > 0) ||
    (filters.sectors && filters.sectors.length > 0) ||
    (filters.budget_tiers && filters.budget_tiers.length > 0) ||
    (filters.location_types && filters.location_types.length > 0) ||
    filters.location ||
    filters.scoreMin !== 15 ||
    filters.scoreMax !== 40;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header - Always Visible */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-200">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 text-slate-900 hover:text-green-600 transition-colors group flex-1"
          >
            <Filter className="w-5 h-5" />
            <h2 className="text-lg md:text-xl font-bold">Filters</h2>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {[
                  filters.priorities?.length || 0,
                  filters.sectors?.length || 0,
                  filters.budget_tiers?.length || 0,
                  filters.location_types?.length || 0,
                  filters.location ? 1 : 0,
                  filters.scoreMin !== 15 || filters.scoreMax !== 40 ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
            <div className="ml-auto">
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
              )}
            </div>
          </button>
          {hasActiveFilters && !isCollapsed && (
            <button
              onClick={clearFilters}
              className="text-sm text-green-600 hover:text-green-700 font-medium hidden md:block ml-2"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="p-4 md:p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* Clear All Button - Mobile Only */}
          {hasActiveFilters && (
            <div className="md:hidden pb-4 border-b border-slate-200">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          <div className="space-y-6">
        {/* PRIMARY: Morocco Priorities */}
        <div>
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-xl">🇲🇦</span>
            Priorités Marocaines
          </h3>
          <div className="space-y-2">
            {MOROCCO_PRIORITIES.map((priority) => (
              <label
                key={priority.id}
                className="flex items-center gap-2 cursor-pointer hover:text-green-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(filters.priorities || []).includes(priority.id)}
                  onChange={() => togglePriority(priority.id)}
                  className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">{priority.name}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{priority.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 💰 Budget Tier */}
        <div>
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>💰</span>
            Budget Requis
          </h3>
          <div className="space-y-1 text-sm">
            {['<1K', '1K-5K', '5K-10K', '10K+'].map((tier) => (
              <label key={tier} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.budget_tiers || []).includes(tier)}
                  onChange={() => toggleArrayFilter('budget_tiers', tier)}
                  className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                />
                <span className="text-xs">
                  {tier === '<1K' && '<1K DH'}
                  {tier === '1K-5K' && '1K–5K DH'}
                  {tier === '5K-10K' && '5K–10K DH'}
                  {tier === '10K+' && '10K+ DH'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 🎯 Skill Level - HIDDEN from public UI (internal matching only) */}
        {/* Complexity filter removed - used for internal mentor matching, not user-facing */}

        {/* 📍 Location Type */}
        <div>
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>📍</span>
            Localisation
          </h3>
          <div className="space-y-1 text-sm mb-3">
            <select
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="w-full px-3 py-2 mb-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-sm"
            >
              <option value="">Toutes les villes</option>
              {MOROCCO_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {['urban', 'rural', 'both'].map((lt) => (
              <label key={lt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.location_types || []).includes(lt)}
                  onChange={() => toggleArrayFilter('location_types', lt)}
                  className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                />
                <span className="capitalize text-xs">
                  {lt === 'urban' && 'Urbain'}
                  {lt === 'rural' && 'Rural'}
                  {lt === 'both' && 'Les deux'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 🌍 SDG Alignment - HIDDEN from public UI (background metadata only) */}
        {/* SDG tags are used internally for funder matching, not user-facing filters */}

        {/* Score Range */}
        <div>
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>⭐</span>
            Score
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="15"
                max="40"
                value={filters.scoreMin}
                onChange={(e) => updateFilter('scoreMin', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-semibold w-12 text-right">
                {filters.scoreMin}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="15"
                max="40"
                value={filters.scoreMax}
                onChange={(e) => updateFilter('scoreMax', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-semibold w-12 text-right">
                {filters.scoreMax}
              </span>
            </div>
            <div className="text-xs text-slate-500 text-center">
              {filters.scoreMin} - {filters.scoreMax} / 40
            </div>
          </div>
        </div>

          </div>
        </div>
      )}
    </div>
  );
}

