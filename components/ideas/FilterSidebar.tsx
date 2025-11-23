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
    location: true,
    score: true,
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

  const clearFilters = () => {
    onChange({
      priorities: [],
      sectors: [],
      location: '',
      scoreMin: 15,
      scoreMax: 40,
    });
  };

  const hasActiveFilters =
    (filters.priorities && filters.priorities.length > 0) ||
    (filters.sectors && filters.sectors.length > 0) ||
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

      </div>
    </div>
  );
}

