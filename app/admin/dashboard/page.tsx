'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import StatCard from '@/components/StatCard';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

type IdeaRow = Database['public']['Tables']['marrai_ideas']['Row'];

const CATEGORY_LABELS: Record<string, string> = {
  health: 'Santé',
  education: 'Éducation',
  agriculture: 'Agriculture',
  tech: 'Technologie',
  infrastructure: 'Infrastructure',
  administration: 'Administration',
  logistics: 'Logistique',
  finance: 'Finance',
  customer_service: 'Service Client',
  inclusion: 'Inclusion',
  other: 'Autre',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Soumis',
  analyzing: 'Analyse en cours',
  analyzed: 'Analysé',
  matched: 'Apparié',
  funded: 'Financé',
  in_progress: 'En cours',
  completed: 'Terminé',
  rejected: 'Rejeté',
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

export default function AdminDashboard() {
  const [ideas, setIdeas] = useState<IdeaRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch ideas
  useEffect(() => {
    async function fetchIdeas() {
      setIsLoading(true);
      setError(null);

      try {
        let query = supabase.from('marrai_ideas').select('*');

        // Apply date filters
        if (dateFrom) {
          query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
          query = query.lte('created_at', dateTo);
        }
        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }
        if (selectedStatus !== 'all') {
          query = query.eq('status', selectedStatus);
        }

        const { data, error: fetchError } = await query.order('created_at', { ascending: false });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setIdeas(data || []);
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    }

    fetchIdeas();
  }, [dateFrom, dateTo, selectedCategory, selectedStatus]);

  // Subscribe to real-time updates
  useEffect(() => {
    async function refetchIdeas() {
      try {
        let query = supabase.from('marrai_ideas').select('*');

        if (dateFrom) {
          query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
          query = query.lte('created_at', dateTo);
        }
        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }
        if (selectedStatus !== 'all') {
          query = query.eq('status', selectedStatus);
        }

        const { data } = await query.order('created_at', { ascending: false });
        if (data) {
          setIdeas(data);
        }
      } catch (err) {
        console.error('Error refetching ideas:', err);
      }
    }

    const channel = supabase
      .channel('admin-dashboard-ideas')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marrai_ideas',
        },
        () => {
          refetchIdeas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateFrom, dateTo, selectedCategory, selectedStatus]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = ideas.length;
    const analyzed = ideas.filter((i) => i.status === 'analyzed' || i.status === 'matched' || i.status === 'funded').length;
    const analyzedPercent = total > 0 ? Math.round((analyzed / total) * 100) : 0;
    
    const scores = ideas.filter((i) => i.ai_feasibility_score !== null).map((i) => i.ai_feasibility_score!);
    const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';
    
    const totalSavings = ideas.reduce((sum, idea) => {
      const costSaved = idea.roi_cost_saved_eur || 0;
      return sum + costSaved;
    }, 0);

    return {
      total,
      analyzed,
      analyzedPercent,
      avgScore,
      totalSavings,
    };
  }, [ideas]);

  // Prepare chart data
  const categoryData = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    ideas.forEach((idea) => {
      const cat = idea.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([name, value]) => ({
      name: CATEGORY_LABELS[name] || name,
      value,
    }));
  }, [ideas]);

  const timelineData = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    ideas.forEach((idea) => {
      const date = new Date(idea.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    return Object.entries(dateCounts)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count }));
  }, [ideas]);

  const feasibilityDistribution = useMemo(() => {
    const ranges = [
      { range: '0-2', min: 0, max: 2 },
      { range: '2-4', min: 2, max: 4 },
      { range: '4-6', min: 4, max: 6 },
      { range: '6-8', min: 6, max: 8 },
      { range: '8-10', min: 8, max: 10 },
    ];

    return ranges.map(({ range, min, max }) => ({
      range,
      count: ideas.filter((i) => {
        const score = i.ai_feasibility_score ?? 0;
        return score >= min && score < max;
      }).length,
    }));
  }, [ideas]);

  const locationData = useMemo(() => {
    const locationCounts: Record<string, number> = {};
    ideas.forEach((idea) => {
      const loc = idea.location || 'other';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    return Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([location, count]) => ({
        location: location.charAt(0).toUpperCase() + location.slice(1),
        count,
      }));
  }, [ideas]);

  // Top ideas by score
  const topIdeas = useMemo(() => {
    return [...ideas]
      .filter((i) => i.ai_feasibility_score !== null)
      .sort((a, b) => (b.ai_feasibility_score ?? 0) - (a.ai_feasibility_score ?? 0))
      .slice(0, 10);
  }, [ideas]);

  // Recent submissions
  const recentSubmissions = useMemo(() => {
    return [...ideas].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  }, [ideas]);

  // Ideas needing review
  const needsReview = useMemo(() => {
    return ideas.filter((i) => i.status === 'submitted' || i.status === 'analyzing').slice(0, 10);
  }, [ideas]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">Erreur: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord Administrateur</h1>
        <p className="mt-2 text-slate-600">Vue d'ensemble des idées et statistiques</p>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-white/80 bg-white/95">
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label htmlFor="dateFrom">Date de début</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Date de fin</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="all">Toutes</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select id="status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="all">Tous</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="secondary" onClick={clearFilters} className="w-full">
                Effacer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="💡"
          label="Total Idées"
          value={kpis.total}
          color="blue"
        />
        <StatCard
          icon="🤖"
          label="Idées Analysées"
          value={`${kpis.analyzedPercent}%`}
          trend={{ value: kpis.analyzed, isPositive: true }}
          color="green"
        />
        <StatCard
          icon="🎯"
          label="Score Moyen"
          value={kpis.avgScore}
          color="indigo"
        />
        <StatCard
          icon="💰"
          label="Économies Potentielles"
          value={formatCurrency(kpis.totalSavings)}
          color="emerald"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Pie Chart - Ideas by Category */}
        <Card className="border-white/80 bg-white/95">
          <CardHeader>
            <CardTitle>Idées par Catégorie</CardTitle>
            <CardDescription>Répartition des idées par domaine</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart - Ideas Over Time */}
        <Card className="border-white/80 bg-white/95">
          <CardHeader>
            <CardTitle>Idées dans le Temps</CardTitle>
            <CardDescription>Évolution des soumissions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} name="Nombre d'idées" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Bar Chart - Feasibility Distribution */}
        <Card className="border-white/80 bg-white/95">
          <CardHeader>
            <CardTitle>Distribution des Scores de Faisabilité</CardTitle>
            <CardDescription>Répartition par tranche de score</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feasibilityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" name="Nombre d'idées" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Horizontal Bar Chart - Top Locations */}
        <Card className="border-white/80 bg-white/95">
          <CardHeader>
            <CardTitle>Top Localisations</CardTitle>
            <CardDescription>Villes les plus représentées</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Nombre d'idées" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Ideas by Score */}
        <Card className="border-white/80 bg-white/95">
          <CardHeader>
            <CardTitle>Top Idées par Score</CardTitle>
            <CardDescription>Meilleures idées selon la faisabilité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topIdeas.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune idée analysée</p>
              ) : (
                topIdeas.map((idea, idx) => (
                  <div key={idea.id} className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {idx + 1}. {idea.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {idea.category ? CATEGORY_LABELS[idea.category] : 'Autre'}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {idea.ai_feasibility_score?.toFixed(1)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card className="border-white/80 bg-white/95">
          <CardHeader>
            <CardTitle>Soumissions Récentes</CardTitle>
            <CardDescription>Dernières idées soumises</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubmissions.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune soumission</p>
              ) : (
                recentSubmissions.map((idea) => (
                  <div key={idea.id} className="border-b border-slate-200 pb-2">
                    <p className="text-sm font-semibold text-slate-900">{idea.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {idea.status ? STATUS_LABELS[idea.status] : 'Inconnu'}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(idea.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ideas Needing Review */}
        <Card className="border-white/80 bg-white/95">
          <CardHeader>
            <CardTitle>À Réviser</CardTitle>
            <CardDescription>Idées nécessitant une attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsReview.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune idée à réviser</p>
              ) : (
                needsReview.map((idea) => (
                  <div key={idea.id} className="border-b border-slate-200 pb-2">
                    <p className="text-sm font-semibold text-slate-900">{idea.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                        {idea.status ? STATUS_LABELS[idea.status] : 'Inconnu'}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(idea.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

