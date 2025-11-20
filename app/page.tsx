import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import SuccessStream from '@/components/success/SuccessStream';
import HowItWorks from '@/components/how-it-works/HowItWorks';
import SocialProofWall from '@/components/social-proof/SocialProofWall';
import { formatCurrency } from '@/lib/utils';

export const revalidate = 60;

type Stats = {
  totalIdeas: number;
  aiAnalyses: number;
  feasibilityRate: number | null;
  totalFunding: number;
};

type FeaturedIdea = {
  id: string;
  title: string;
  category: string | null;
  feasibilityScore: number | null;
  problemStatement: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  health: 'Santé',
  education: 'Éducation',
  agriculture: 'Agriculture',
  tech: 'Technologie',
  infrastructure: 'Infrastructures',
  administration: 'Administration',
  logistics: 'Logistique',
  finance: 'Finance',
  customer_service: 'Service client',
  inclusion: 'Inclusion',
  other: 'Autre',
};

const COMPLETED_STATUSES = new Set([
  'analyzed',
  'matched',
  'funded',
  'in_progress',
  'completed',
]);

async function getDashboardData(): Promise<{ stats: Stats; featured: FeaturedIdea[] }> {
  try {
    // Dynamically import supabase to handle missing env vars gracefully
    const { supabase } = await import('@/lib/supabase');

    const { data, error } = await supabase
      .from('marrai_ideas')
      .select('id,title,status,ai_feasibility_score,roi_cost_saved_eur,category,problem_statement')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Erreur lors du chargement des idées:', error);
      return {
        stats: {
          totalIdeas: 0,
          aiAnalyses: 0,
          feasibilityRate: null,
          totalFunding: 0,
        },
        featured: [],
      };
    }

    const totalIdeas = data.length;
    const analyzedIdeas = data.filter((idea: any) => COMPLETED_STATUSES.has(idea.status ?? ''));

    const scoredIdeas = data.filter((idea: any) => typeof idea.ai_feasibility_score === 'number');
    const totalScore = scoredIdeas.reduce((sum: number, idea: any) => sum + (idea.ai_feasibility_score ?? 0), 0);
    const feasibilityRate = scoredIdeas.length > 0 ? Math.round((totalScore / (scoredIdeas.length * 10)) * 100) : null;

    const totalFunding = data.reduce((sum: number, idea: any) => sum + (idea.roi_cost_saved_eur ?? 0), 0);

    const featured = scoredIdeas
      .filter((idea: any) => typeof idea.ai_feasibility_score === 'number')
      .sort((a: any, b: any) => (b.ai_feasibility_score ?? 0) - (a.ai_feasibility_score ?? 0))
      .slice(0, 3)
      .map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        category: idea.category,
        feasibilityScore: idea.ai_feasibility_score ?? null,
        problemStatement: idea.problem_statement ?? null,
      }));

    return {
      stats: {
        totalIdeas,
        aiAnalyses: analyzedIdeas.length,
        feasibilityRate,
        totalFunding,
      },
      featured,
    };
  } catch (error) {
    console.error('Erreur inattendue lors du chargement du tableau de bord:', error);
    return {
      stats: {
        totalIdeas: 0,
        aiAnalyses: 0,
        feasibilityRate: null,
        totalFunding: 0,
      },
      featured: [],
    };
  }
}

export default async function HomePage() {
  const { stats, featured } = await getDashboardData();

  const statsItems = [
    {
      label: 'Idées soumises',
      value: stats.totalIdeas.toLocaleString('fr-FR'),
      description: 'Depuis le lancement de Fikra Valley',
      icon: '💡',
    },
    {
      label: 'Analyses IA réalisées',
      value: stats.aiAnalyses.toLocaleString('fr-FR'),
      description: 'Architectures d’agents générées',
      icon: '🤖',
    },
    {
      label: 'Taux de faisabilité',
      value: stats.feasibilityRate !== null ? `${stats.feasibilityRate.toFixed(0)}%` : '—',
      description: 'Basé sur les scores IA',
      icon: '🎯',
    },
    {
      label: 'Économies potentielles',
      value: formatCurrency(stats.totalFunding ?? 0),
      description: 'ROI estimé sur 12 mois',
      icon: '💰',
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 md:px-10 lg:px-12">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/40 p-10 shadow-soft backdrop-blur-xl">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-terracotta-100 blur-3xl opacity-60" aria-hidden />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-brand-100 blur-3xl opacity-60" aria-hidden />
        <div className="relative flex flex-col gap-6 md:w-3/4 mx-auto text-center items-center">
          <div className="flex items-center gap-4 mb-2">
            <Logo size="lg" showText={false} className="hidden sm:flex" />
            <Logo size="md" showText={false} className="sm:hidden" />
          </div>
          <Badge variant="outline" className="w-fit border-terracotta-200 bg-terracotta-50 text-terracotta-700 font-medium">
            Fikra Valley 2025
          </Badge>
          <h1 className="font-heading text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Transformez vos Idées en Réalité
          </h1>
          <p className="text-lg leading-relaxed text-slate-700 sm:text-xl max-w-2xl">
            Obtenez une validation technique instantanée et accédez à un réseau d'experts pour concrétiser vos projets au Maroc.
          </p>
          <p className="text-base text-slate-600 max-w-2xl">
            Rejoignez les 25% d'innovateurs qui passent de l'idée au financement grâce à notre écosystème d'accompagnement.
          </p>
          <div className="flex flex-col gap-4 pt-4 items-center">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-terracotta-600 hover:bg-terracotta-700 text-white border-none shadow-lg shadow-terracotta-500/20">
                <Link href="/submit">Tester mon Idée Gratuitement</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="bg-white/80 hover:bg-white text-slate-700 border border-sand-200">
                <Link href="/ideas">Explorer les Projets</Link>
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Accès restreint pour le premier atelier • Demande d'accès requise
            </p>
          </div>
        </div>
      </section>

      {/* Success Stream - LIVE user wins feed */}
      <div className="-mx-6 md:-mx-10 lg:-mx-12">
        <SuccessStream />
      </div>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Impact en temps réel</h2>
          <span className="text-sm text-slate-500">Statistiques mises à jour chaque minute</span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {statsItems.map((item) => (
            <Card key={item.label} className="border-white/40 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors duration-300">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-sm font-medium text-terracotta-600">{item.description}</span>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold text-slate-900 font-heading">{item.value}</CardTitle>
                <CardDescription className="text-base text-slate-600">{item.label}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Interactive How It Works - with live demos */}
      <div className="-mx-6 md:-mx-10 lg:-mx-12">
        <HowItWorks />
      </div>

      {/* Social Proof Wall - Pinterest-style success stories */}
      <div className="-mx-6 md:-mx-10 lg:-mx-12">
        <SocialProofWall />
      </div>
    </main>
  );
}
