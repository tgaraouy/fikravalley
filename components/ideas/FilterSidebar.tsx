/**
 * Filter Sidebar Component
 * 
 * Provides filtering options for the idea bank
 */

'use client';

import { useState } from 'react';
import { MOROCCO_PRIORITIES } from '@/lib/idea-bank/scoring/morocco-priorities';
// Icons - using simple text for now

interface Filters {
  priorities: string[]; // Morocco priorities (primary)
  sectors: string[];
  location: string;
  scoreMin: number;
  scoreMax: number;
  hasReceipts: boolean;
  sdgs: string[]; // SDGs (secondary, advanced)
  fundingStatus: string;
  qualificationTier: string;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const SECTORS = [
  { id: 'health', label: 'Health / Santé' },
  { id: 'education', label: 'Education' },
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'tech', label: 'Technology' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'administration', label: 'Administration' },
];

const SDGS = [
  { id: '1', label: 'SDG 1: No Poverty' },
  { id: '2', label: 'SDG 2: Zero Hunger' },
  { id: '3', label: 'SDG 3: Good Health' },
  { id: '4', label: 'SDG 4: Quality Education' },
  { id: '5', label: 'SDG 5: Gender Equality' },
  { id: '6', label: 'SDG 6: Clean Water' },
  { id: '7', label: 'SDG 7: Clean Energy' },
  { id: '8', label: 'SDG 8: Decent Work' },
  { id: '9', label: 'SDG 9: Innovation' },
  { id: '10', label: 'SDG 10: Reduced Inequality' },
  { id: '11', label: 'SDG 11: Sustainable Cities' },
  { id: '12', label: 'SDG 12: Responsible Consumption' },
  { id: '13', label: 'SDG 13: Climate Action' },
  { id: '15', label: 'SDG 15: Life on Land' },
  { id: '16', label: 'SDG 16: Peace & Justice' },
  { id: '17', label: 'SDG 17: Partnerships' },
];

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
    location: true,
    score: true,
    receipts: true,
    advanced: false, // SDGs and other advanced filters
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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

  const toggleSDG = (sdgId: string) => {
    const newSDGs = filters.sdgs.includes(sdgId)
      ? filters.sdgs.filter((s) => s !== sdgId)
      : [...filters.sdgs, sdgId];
    updateFilter('sdgs', newSDGs);
  };

  const clearFilters = () => {
    onChange({
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
  };

  const hasActiveFilters =
    (filters.priorities && filters.priorities.length > 0) ||
    (filters.sectors && filters.sectors.length > 0) ||
    filters.location ||
    filters.scoreMin !== 15 ||
    filters.scoreMax !== 40 ||
    filters.hasReceipts ||
    (filters.sdgs && filters.sdgs.length > 0) ||
    filters.fundingStatus ||
    filters.qualificationTier;

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

        {/* Location */}
        <div>
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>📍</span>
            Location
          </h3>
          <select
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-sm"
          >
            <option value="">All Locations</option>
            {MOROCCO_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
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

        {/* Proof of Demand */}
        <div>
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>📝</span>
            Preuve de Demande
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasReceipts}
              onChange={(e) => updateFilter('hasReceipts', e.target.checked)}
              className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
            />
            <span className="text-sm">Has receipts</span>
          </label>
        </div>

        {/* ADVANCED FILTERS (collapsed by default) */}
        <details className="border-t border-slate-200 pt-4">
          <summary className="cursor-pointer font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Advanced Filters ▼
          </summary>

          <div className="mt-4 space-y-4">
            {/* SDG Filter (power users only) */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <span>🌍</span>
                SDG Tags
              </h4>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {SDGS.map((sdg) => (
                  <label
                    key={sdg.id}
                    className="flex items-center gap-1 text-xs cursor-pointer hover:text-green-600 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.sdgs.includes(sdg.id)}
                      onChange={() => toggleSDG(sdg.id)}
                      className="w-3 h-3 text-green-600 border-slate-300 rounded focus:ring-green-500"
                    />
                    <span>SDG {sdg.id}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sectors */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Sectors</h4>
              <div className="space-y-2">
                {SECTORS.map((sector) => (
                  <label
                    key={sector.id}
                    className="flex items-center gap-2 cursor-pointer hover:text-green-600 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.sectors.includes(sector.id)}
                      onChange={() => toggleSector(sector.id)}
                      className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm">{sector.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Funding Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Funding Status
              </label>
              <select
                value={filters.fundingStatus}
                onChange={(e) => updateFilter('fundingStatus', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-sm"
              >
                <option value="">All</option>
                <option value="applied">Applied</option>
                <option value="approved">Approved</option>
                <option value="funded">Funded</option>
                <option value="not_applied">Not Applied</option>
              </select>
            </div>

            {/* Qualification Tier */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Qualification Tier
              </label>
              <select
                value={filters.qualificationTier}
                onChange={(e) => updateFilter('qualificationTier', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-sm"
              >
                <option value="">All</option>
                <option value="exceptional">Exceptional (≥30)</option>
                <option value="qualified">Qualified (≥25)</option>
                <option value="developing">Developing (≥15)</option>
              </select>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

