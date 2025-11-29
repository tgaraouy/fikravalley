'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CategorizationStats {
  total: number;
  coverage: {
    moroccan_priorities: { count: number; percentage: number };
    budget_tier: { count: number; percentage: number };
    location_type: { count: number; percentage: number };
    complexity: { count: number; percentage: number };
    sdg_alignment: { count: number; percentage: number };
  };
  distributions: {
    priorities: Record<string, number>;
    budget_tiers: Record<string, number>;
    complexities: Record<string, number>;
  };
  uncategorized: Array<{ id: string; title: string; created_at: string }>;
}

const PRIORITY_NAMES: Record<string, string> = {
  green_morocco: 'Green Morocco',
  digital_morocco: 'Digital Morocco',
  vision_2030: 'Vision 2030',
  youth_employment: 'Youth Employment',
  women_entrepreneurship: 'Women Entrepreneurship',
  rural_development: 'Rural Development',
  healthcare_improvement: 'Healthcare Improvement',
};

export default function CategorizationStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<CategorizationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/categorization-stats');
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        setStats(data);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching stats:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Erreur lors du chargement des statistiques</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Statistiques de Catégorisation</h1>
          <p className="text-slate-600">Couverture et distribution des catégorisations d'idées</p>
        </div>

        {/* Coverage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <CoverageCard
            title="Priorités Marocaines"
            count={stats.coverage.moroccan_priorities.count}
            total={stats.total}
            percentage={stats.coverage.moroccan_priorities.percentage}
          />
          <CoverageCard
            title="Budget Tier"
            count={stats.coverage.budget_tier.count}
            total={stats.total}
            percentage={stats.coverage.budget_tier.percentage}
          />
          <CoverageCard
            title="Location Type"
            count={stats.coverage.location_type.count}
            total={stats.total}
            percentage={stats.coverage.location_type.percentage}
          />
          <CoverageCard
            title="Complexity"
            count={stats.coverage.complexity.count}
            total={stats.total}
            percentage={stats.coverage.complexity.percentage}
          />
          <CoverageCard
            title="SDG Alignment"
            count={stats.coverage.sdg_alignment.count}
            total={stats.total}
            percentage={stats.coverage.sdg_alignment.percentage}
          />
        </div>

        {/* Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <DistributionCard
            title="Priorités Marocaines"
            data={stats.distributions.priorities}
            labelMap={PRIORITY_NAMES}
          />
          <DistributionCard
            title="Budget Tiers"
            data={stats.distributions.budget_tiers}
          />
          <DistributionCard
            title="Complexity Levels"
            data={stats.distributions.complexities}
          />
        </div>

        {/* Uncategorized Ideas */}
        {stats.uncategorized.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Idées Non Catégorisées ({stats.uncategorized.length})
            </h2>
            <div className="space-y-2">
              {stats.uncategorized.map((idea) => (
                <div
                  key={idea.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-slate-900">{idea.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(idea.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <a
                    href={`/admin/categorize-ideas?search=${encodeURIComponent(idea.title)}`}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Catégoriser →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CoverageCard({
  title,
  count,
  total,
  percentage,
}: {
  title: string;
  count: number;
  total: number;
  percentage: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-sm font-semibold text-slate-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-slate-900">{percentage}%</span>
        <span className="text-sm text-slate-500">({count}/{total})</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function DistributionCard({
  title,
  data,
  labelMap,
}: {
  title: string;
  data: Record<string, number>;
  labelMap?: Record<string, string>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {entries.map(([key, count]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700 capitalize">
                {labelMap?.[key] || key}
              </span>
              <span className="text-sm text-slate-500">{count}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

