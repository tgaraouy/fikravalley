/**
 * Overview Stats Component
 * 
 * Displays key metrics and statistics
 */

'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalIdeas: number;
  ideasByTier: {
    exceptional: number;
    qualified: number;
    developing: number;
    pending: number;
  };
  totalReceipts: number;
  verifiedReceipts: number;
  fundingSuccessRate: number;
  totalUsers: number;
  activeUsers: number;
  totalUpvotes: number;
  problemValidations: number;
  priorityStats: Array<{
    id: string;
    name: string;
    count: number;
    percentage: number;
  }>;
  sdgCoverage: {
    uniqueSDGsCovered: number;
    totalSDGs: number;
    coveredSDGs: number[];
  };
}

export function OverviewStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-3 animate-pulse">
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const StatCard = ({ title, value, subtitle, icon, color = 'green' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: 'green' | 'blue' | 'yellow' | 'purple' | 'red';
  }) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
    };

    return (
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-medium text-slate-600">{title}</h3>
          <span className={`text-lg sm:text-xl ${colorClasses[color]}`}>{icon}</span>
        </div>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-0.5">{value}</div>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <StatCard
          title="Total Ideas"
          value={stats.totalIdeas.toLocaleString()}
          subtitle="All submissions"
          icon="💡"
          color="blue"
        />
        <StatCard
          title="Verified Receipts"
          value={`${stats.verifiedReceipts}/${stats.totalReceipts}`}
          subtitle={`${stats.totalReceipts > 0 ? ((stats.verifiedReceipts / stats.totalReceipts) * 100).toFixed(1) : 0}% verified`}
          icon="📝"
          color="green"
        />
        <StatCard
          title="Funding Success Rate"
          value={`${stats.fundingSuccessRate.toFixed(1)}%`}
          subtitle="Ideas that received funding"
          icon="💰"
          color="yellow"
        />
        <StatCard
          title="Active Users"
          value={`${stats.activeUsers}/${stats.totalUsers}`}
          subtitle="Users in last 30 days"
          icon="👥"
          color="purple"
        />
      </div>

      {/* Morocco Priority & SDG Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
        {/* Top Morocco Priorities */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border border-slate-200">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 sm:mb-3 flex items-center gap-1.5">
            <span className="text-lg sm:text-xl">🇲🇦</span>
            <span className="hidden sm:inline">Top Priorities</span>
            <span className="sm:hidden">Priorities</span>
          </h3>
          <div className="space-y-1 sm:space-y-1.5">
            {stats.priorityStats && stats.priorityStats.length > 0 ? (
              stats.priorityStats.slice(0, 3).map((stat) => (
                <div key={stat.id} className="mb-1.5 sm:mb-2">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs sm:text-sm font-medium text-slate-700 truncate pr-2">{stat.name}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 flex-shrink-0">{stat.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{stat.percentage.toFixed(0)}%</div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No priority data</p>
            )}
          </div>
        </div>

        {/* SDG Coverage */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border border-slate-200">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 sm:mb-3 flex items-center gap-1.5">
            <span className="text-lg sm:text-xl">🌍</span>
            <span className="hidden sm:inline">SDG Coverage</span>
            <span className="sm:hidden">SDGs</span>
          </h3>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
            {stats.sdgCoverage.uniqueSDGsCovered}/{stats.sdgCoverage.totalSDGs}
          </div>
          <div className="text-xs text-slate-600 mb-2 sm:mb-3 hidden sm:block">
            SDGs represented
          </div>
          <div className="grid grid-cols-9 sm:grid-cols-9 gap-0.5 sm:gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((sdg) => (
              <div
                key={sdg}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-[9px] sm:text-[10px] font-semibold ${
                  stats.sdgCoverage.coveredSDGs.includes(sdg)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
                title={`SDG ${sdg}`}
              >
                {sdg}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Qualification Tiers */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 border border-slate-200">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2 sm:mb-3">Qualification Tiers</h2>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600 mb-0.5">
              {stats.ideasByTier.exceptional}
            </div>
            <div className="text-[10px] sm:text-xs text-yellow-700 font-medium">Exceptional</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg sm:text-2xl font-bold text-green-600 mb-0.5">
              {stats.ideasByTier.qualified}
            </div>
            <div className="text-[10px] sm:text-xs text-green-700 font-medium">Qualified</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-0.5">
              {stats.ideasByTier.developing}
            </div>
            <div className="text-[10px] sm:text-xs text-blue-700 font-medium">Developing</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-lg sm:text-2xl font-bold text-slate-600 mb-0.5">
              {stats.ideasByTier.pending}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-700 font-medium">Pending</div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border border-slate-200">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-2 sm:mb-3">Engagement</h3>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Upvotes</span>
              <span className="text-base sm:text-lg font-bold text-slate-900">
                {stats.totalUpvotes.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Validations</span>
              <span className="text-base sm:text-lg font-bold text-slate-900">
                {stats.problemValidations.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border border-slate-200">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-2 sm:mb-3">Quick Actions</h3>
          <div className="space-y-1 sm:space-y-1.5">
            <button className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 hover:bg-green-100 rounded text-green-700 text-xs sm:text-sm font-medium transition-colors">
              ⚡ Review
            </button>
            <button className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 rounded text-blue-700 text-xs sm:text-sm font-medium transition-colors">
              📝 Receipts
            </button>
            <button className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-50 hover:bg-purple-100 rounded text-purple-700 text-xs sm:text-sm font-medium transition-colors">
              📊 Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

