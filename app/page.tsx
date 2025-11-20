import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
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

  const steps = [
    {
      title: 'Soumettez votre problème',
      description:
        "Décrivez votre contexte local et les contraintes terrain. Nous acceptons les idées en français, arabe ou darija.",
      icon: '1',
    },
    {
      title: 'Analyse IA Instantanée',
      description:
        "Recevez un score de faisabilité technique et une architecture de solution. Analyse générée par un LLM spécialisé et dédié.",
      icon: '2',
    },
    {
      title: 'Sélection Compétitive',
      description:
        "Les idées à fort potentiel (25% des soumissions) peuvent être considérées pour un appariement avec des experts et des opportunités de financement.",
      icon: '3',
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 md:px-10 lg:px-12">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 p-10 shadow-soft backdrop-blur-2xl">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-indigo-100 blur-3xl" aria-hidden />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-violet-100 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 md:w-3/4">
          <div className="flex items-center gap-4 mb-2">
            <Logo size="lg" showText={false} className="hidden sm:flex" />
            <Logo size="md" showText={false} className="sm:hidden" />
          </div>
          <Badge variant="outline" className="w-fit border-indigo-200 bg-indigo-50 text-indigo-700">
            Fikra Valley 2025
          </Badge>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Morocco&apos;s Valley of Ideas
          </h1>
          <p className="text-lg leading-relaxed text-slate-700 sm:text-xl">
            Where Moroccan ideas grow. Analyse instantanée de faisabilité technique pour vos problèmes locaux. Obtenez une évaluation IA.
          </p>
          <p className="text-base text-slate-600">
            Les idées à fort potentiel (25% des soumissions) peuvent être considérées pour un appariement avec des experts et des opportunités de financement.
          </p>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/submit">Soumettre pour Analyse IA Gratuite</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/ideas">Parcourir les Idées</Link>
              </Button>
            </div>
            <p className="text-xs text-slate-500 text-center sm:text-left">
              Accès restreint pour le premier atelier • Demande d'accès requise
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Impact en temps réel</h2>
          <span className="text-sm text-slate-500">Statistiques mises à jour chaque minute</span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {statsItems.map((item) => (
            <Card key={item.label} className="border-white/80 bg-white/90">
              <CardHeader className="flex-row items-center justify-between">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-sm font-medium text-indigo-600">{item.description}</span>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold text-slate-900">{item.value}</CardTitle>
                <CardDescription className="text-base text-slate-600">{item.label}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-8 rounded-[2rem] border border-indigo-100 bg-indigo-50/60 p-8 shadow-sm backdrop-blur xl:grid-cols-3">
        <div className="xl:col-span-1">
          <Badge variant="outline" className="border-indigo-200 bg-white text-indigo-700">
            Comment ça marche ?
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">Un parcours simple et transparent</h2>
            <p className="mt-2 text-base text-slate-600">
            Fikra Valley offre une évaluation professionnelle gratuite. Chaque soumission est examinée par notre équipe. 
            Les idées sélectionnées sont contactées dans un délai de 2-3 semaines.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 xl:col-span-2">
          {steps.map((step) => (
            <Card key={step.title} className="border-transparent bg-white/90 shadow-md">
              <CardHeader className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white shadow-lg">
                  {step.icon}
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Idées en lumière
            </Badge>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Les idées les plus prometteuses</h2>
            <p className="text-base text-slate-600">
              Idées analysées avec les meilleurs scores de faisabilité. En cours d&apos;évaluation pour la sélection.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="sm:self-end">
            <Link href="/ideas">Voir toutes les idées</Link>
          </Button>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-slate-600">
            Aucune analyse disponible pour le moment. Soumettez une nouvelle idée pour lancer l&apos;innovation !
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((idea) => (
              <Card key={idea.id} className="border-white/80 bg-white/95">
                <CardHeader className="gap-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="capitalize">
                      {idea.category ? CATEGORY_LABELS[idea.category] ?? idea.category : 'Idée Fikra Labs'}
                    </Badge>
                    {idea.feasibilityScore !== null && (
                      <Badge
                        variant={idea.feasibilityScore >= 8 ? 'success' : 'outline'}
                        className="font-medium text-sm"
                      >
                        Faisabilité {idea.feasibilityScore.toFixed(1)} / 10
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900">{idea.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {idea.problemStatement ?? 'Analyse détaillée en cours de préparation.'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
