/**
 * Settings Component
 * 
 * Configuration and thresholds
 */

'use client';

import { useState, useEffect } from 'react';

interface Settings {
  scoringWeights: {
    problemStatement: number;
    asIsAnalysis: number;
    benefitStatement: number;
    operationalNeeds: number;
    strategicFit: number;
    feasibility: number;
    differentiation: number;
    evidenceOfDemand: number;
  };
  thresholds: {
    clarityMin: number;
    decisionMin: number;
    exceptionalMin: number;
    qualifiedMin: number;
  };
  sdgs: number[];
  sectors: string[];
}

export function Settings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <div className="text-center py-12 text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Scoring Weights */}
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Scoring Weights</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(settings.scoringWeights).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    scoringWeights: {
                      ...settings.scoringWeights,
                      [key]: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thresholds */}
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Thresholds</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(settings.thresholds).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    thresholds: {
                      ...settings.thresholds,
                      [key]: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* SDGs */}
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">SDG Configuration</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((sdg) => (
            <label key={sdg} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sdgs.includes(sdg)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSettings({
                      ...settings,
                      sdgs: [...settings.sdgs, sdg],
                    });
                  } else {
                    setSettings({
                      ...settings,
                      sdgs: settings.sdgs.filter((s) => s !== sdg),
                    });
                  }
                }}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm">SDG {sdg}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

