/**
 * Filter Sidebar Component
 * 
 * Provides filtering options for the idea bank
 */

'use client';

import { useState } from 'react';
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
  complexities: string[];
  location_types: string[];
  sdg_tags: string[];
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
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

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    priorities: true, // Morocco priorities - always prominent
    budget: false,
    skill: false,
    locationType: false,
    location: true,
    sdg: false, // SDG filter - collapsed by default (secondary)
    score: true,
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
      complexities: [],
      location_types: [],
      sdg_tags: [],
    });
  };

  const hasActiveFilters =
    (filters.priorities && filters.priorities.length > 0) ||
    (filters.sectors && filters.sectors.length > 0) ||
    (filters.budget_tiers && filters.budget_tiers.length > 0) ||
    (filters.complexities && filters.complexities.length > 0) ||
    (filters.location_types && filters.location_types.length > 0) ||
    (filters.sdg_tags && filters.sdg_tags.length > 0) ||
    filters.location ||
    filters.scoreMin !== 15 ||
    filters.scoreMax !== 40;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Filters</span>
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

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

        {/* 🎯 Skill Level */}
        <div>
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>🎯</span>
            Niveau de Compétence
          </h3>
          <div className="space-y-1 text-sm">
            {['beginner', 'intermediate', 'advanced'].map((lvl) => (
              <label key={lvl} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.complexities || []).includes(lvl)}
                  onChange={() => toggleArrayFilter('complexities', lvl)}
                  className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                />
                <span className="capitalize text-xs">{lvl}</span>
              </label>
            ))}
          </div>
        </div>

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

        {/* 🌍 SDG Alignment (Secondary) */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('sdg')}
            className="w-full flex items-center justify-between text-sm font-semibold text-slate-800 mb-2"
          >
            <div className="flex items-center gap-2">
              <span>🌍</span>
              <span>ODD (secondaire)</span>
            </div>
            <span className="text-xs text-slate-500">{expandedSections.sdg ? '−' : '+'}</span>
          </button>
          {expandedSections.sdg && (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {getAllSDGNumbers().map((sdgNum) => {
                const sdgInfo = getSDGInfo(sdgNum);
                if (!sdgInfo) return null;
                return (
                  <label
                    key={sdgNum}
                    className="flex items-center gap-2 cursor-pointer hover:text-green-600 transition-colors text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={(filters.sdg_tags || []).includes(sdgNum.toString())}
                      onChange={() => toggleArrayFilter('sdg_tags', sdgNum.toString())}
                      className="w-3.5 h-3.5 text-green-600 border-slate-300 rounded focus:ring-green-500"
                    />
                    <div className="flex items-center gap-1.5 flex-1">
                      <span>{sdgInfo.icon}</span>
                      <span className="font-medium">ODD {sdgNum}</span>
                      <span className="text-slate-500 text-xs truncate">{sdgInfo.nameFr}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

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
  );
}

