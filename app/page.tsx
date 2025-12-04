/**
 * COMPACT HOME PAGE - Light Moroccan Colors
 * 
 * All information visible immediately with small navigation buttons
 * Production-ready, multilingual, information-dense
 * Moroccan color scheme: Light red, green, and gold
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { APP_TAGLINE } from '@/lib/constants/tagline';
import { 
  Mic, 
  Lightbulb, 
  Users, 
  Search, 
  UserPlus, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Target,
  Brain,
  FileText,
  ChevronRight,
  Trophy,
  Medal,
  Award
} from 'lucide-react';

interface IdeaStats {
  totalIdeas: number;
  ideasThisWeek: number;
  topCity: string;
}

interface TopIdea {
  id: string;
  title: string;
  location: string;
  category: string;
  engagement_score: number;
  upvote_count: number;
  receipt_count: number;
  claim_count: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<IdeaStats | null>(null);
  const [topIdeas, setTopIdeas] = useState<TopIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch on client side to avoid hydration mismatch
    if (typeof window === 'undefined') return;

    const fetchData = async () => {
      try {
        // Fetch statistics
        const statsRes = await fetch('/api/ideas/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch top 3 ideas
        const topRes = await fetch('/api/ideas/top?limit=3');
        if (topRes.ok) {
          const topData = await topRes.json();
          setTopIdeas(topData.items || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set defaults on error
        setStats({
          totalIdeas: 0,
          ideasThisWeek: 0,
          topCity: 'Casablanca',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-green-50">
      {/* Hero Section with Background Image & Glassmorphism */}
      <section className="relative w-full overflow-hidden min-h-[60vh] md:min-h-[80vh]">
        {/* Background Image Layer - Adjusted to show person's head and phone */}
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/png/men_dictating_idea.png')",
            backgroundPosition: 'center top'
          }}
        />
        
        {/* Lighter Gradient Overlay - Less opacity to show person */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        
        {/* Content Layer - Above Overlay */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          {/* Main Headlines - Frosted Glass Container */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-6 md:p-8 mb-8 relative z-10">
            {/* Language Cards - Always Visible */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Darija */}
              <div className="text-center md:text-left">
                <h2 className="text-xl md:text-2xl text-white mb-2" dir="rtl">
                  {APP_TAGLINE.main.darija.headline}
                </h2>
                <p className="text-sm md:text-base text-white/80" dir="rtl">
                  {APP_TAGLINE.main.darija.subtext}
                </p>
              </div>

              {/* Tamazight */}
              <div className="text-center md:text-left">
                <h2 className="text-xl md:text-2xl text-white mb-2" dir="rtl" style={{ fontSize: '1.15em' }}>
                  {APP_TAGLINE.main.tamazight.headline}
                </h2>
                {APP_TAGLINE.main.tamazight.headlineLatin && (
                  <p className="text-xs md:text-sm text-white/80 mb-2 font-medium" style={{ fontSize: '1.1em' }}>
                    {APP_TAGLINE.main.tamazight.headlineLatin}
                  </p>
                )}
                <p className="text-sm md:text-base text-white/80" dir="rtl" style={{ fontSize: '1.1em' }}>
                  {APP_TAGLINE.main.tamazight.subtext}
                </p>
              </div>

              {/* French */}
              <div className="text-center md:text-left">
                <h2 className="text-xl md:text-2xl text-white mb-2">
                  {APP_TAGLINE.main.fr.headline}
                </h2>
                <p className="text-sm md:text-base text-white/80">
                  {APP_TAGLINE.main.fr.subtext}
                </p>
              </div>
            </div>
          </div>

          {/* Real Statistics Counter - At Top */}
          <div className="text-center mb-6">
            {isLoading || !stats ? (
              <p className="text-white/80 text-sm md:text-base font-medium tracking-wide animate-pulse">
                Chargement...
              </p>
            ) : (
              <p className="text-white/90 text-base md:text-lg font-semibold tracking-wide animate-fade-in">
                <span className="text-green-300 font-bold">{stats.ideasThisWeek.toLocaleString()}</span> Idées Analysées cette semaine
              </p>
            )}
          </div>

          {/* Heartbeat Microphone Button - Hero */}
          <div className="text-center mb-6">
            <Link href="/submit-voice">
              <button className="relative w-24 h-24 md:w-28 md:h-28 bg-[#006837] hover:bg-emerald-800 rounded-full shadow-[0_0_40px_-10px_rgba(0,104,55,0.6)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group mx-auto z-20">
                {/* Breathing Ring Animation */}
                <div className="absolute inset-0 rounded-full bg-[#006837] animate-pulse opacity-75"></div>
                <Mic className="w-12 h-12 md:w-14 md:h-14 text-white relative z-10" />
                <span className="sr-only">Enregistre ton idée</span>
              </button>
            </Link>
          </div>

          {/* Top 3 Leaderboard */}
          <div className="space-y-6">

            {/* Top 3 Leaderboard */}
            {!isLoading && topIdeas.length > 0 && (
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                <h3 className="text-white/90 text-sm md:text-base font-bold mb-4 text-center flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Top 3 Idées
                </h3>
                <div className="space-y-3">
                  {topIdeas.map((idea, index) => {
                    const medals = [
                      <Medal key="gold" className="w-5 h-5 text-yellow-400" />,
                      <Medal key="silver" className="w-5 h-5 text-gray-300" />,
                      <Award key="bronze" className="w-5 h-5 text-amber-600" />,
                    ];
                    return (
                      <Link
                        key={idea.id}
                        href={`/ideas/${idea.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex-shrink-0">
                          {medals[index]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 text-sm font-semibold truncate group-hover:text-white">
                            {idea.title}
                          </p>
                          <p className="text-white/60 text-xs mt-0.5">
                            {idea.location} • {idea.category}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-yellow-400 text-xs font-bold">
                            {idea.engagement_score}
                          </div>
                          <div className="text-white/50 text-xs">
                            score
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Rest of Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Benefits - One Line (3 Languages) */}
        <div className="text-center mb-6 space-y-2">
          <p className="text-base text-slate-800 font-medium" dir="rtl">
            وكلاء ذكاء اصطناعي كيستمعو لصوتك، كيحللوا فكرتك، وكيخلقو خطة عمل مخصصة.
          </p>
          <p className="text-sm text-amber-800 font-medium" dir="rtl">
            {APP_TAGLINE.valueProposition.tamazight}
          </p>
          {APP_TAGLINE.main.tamazight.subtextLatin && (
            <p className="text-xs text-amber-700 italic">
              {APP_TAGLINE.valueProposition.tamazight}
            </p>
          )}
          <p className="text-sm text-slate-700">
            7 agents IA écoutent ta voix, analysent ton idée, et créent un plan d'action sur mesure.
          </p>
        </div>

        {/* Quick Benefits - Icons Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm">
          <div className="flex items-center gap-2 text-slate-800">
            <Zap className="w-4 h-4 text-amber-600" />
            <span><strong>7 agents IA</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-800">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span><strong>بلا فلوس</strong> (Gratuit)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-800">
            <Shield className="w-4 h-4 text-red-600" />
            <span>Confidentiel</span>
          </div>
          <div className="flex items-center gap-2 text-slate-800">
            <Target className="w-4 h-4 text-amber-600" />
            <span>Solutions concrètes</span>
          </div>
        </div>

        {/* Quick Navigation - Grid of Small Buttons with Moroccan Colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Button
            asChild
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all"
          >
            <Link href="/submit-voice" className="w-full">
              <Mic className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium">Soumettre</span>
              <span className="text-xs text-slate-600">Idée vocale</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-amber-300 hover:border-amber-400 hover:bg-amber-50 transition-all"
          >
            <Link href="/ideas" className="w-full">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium">Idées</span>
              <span className="text-xs text-slate-600">Parcourir</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-green-300 hover:border-green-400 hover:bg-green-50 transition-all"
          >
            <Link href="/matching" className="w-full">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Matching</span>
              <span className="text-xs text-slate-600">Mentor-Idée</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all"
          >
            <Link href="/become-mentor" className="w-full">
              <UserPlus className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium">Mentor</span>
              <span className="text-xs text-slate-600">Devenir</span>
            </Link>
          </Button>
        </div>

        {/* Mentor Value Proposition - Prominent CTA */}
        <section className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-2xl p-6 md:p-8 mb-8 border-2 border-green-200 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-green-900 mb-2">
              👨‍🏫 Devenez Mentor en 1 Clic
            </h2>
            <p className="text-green-700 font-medium">
              Partagez votre expérience et aidez les entrepreneurs marocains à réussir
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-green-900">Impact réel</p>
              <p className="text-xs text-green-700">Aidez des entrepreneurs</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-green-900">Réseau</p>
              <p className="text-xs text-green-700">Connectez-vous</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-sm font-semibold text-green-900">Flexibilité</p>
              <p className="text-xs text-green-700">Choisissez vos heures</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-green-900">1 clic LinkedIn</p>
              <p className="text-xs text-green-700">Inscription rapide</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 px-8 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Link href="/become-mentor">
                <UserPlus className="w-5 h-5 mr-2" />
                Devenir Mentor (1 clic LinkedIn)
              </Link>
            </Button>
            <p className="text-xs text-green-700 mt-3">
              ⚡ 90% de votre profil rempli automatiquement • 2-3 minutes seulement
            </p>
          </div>
        </section>

        {/* Gen Z Founder Story - 50/50 Grid Layout */}
        <section className="bg-white/95 backdrop-blur rounded-2xl border-2 border-green-200 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Image Section - Left 50% */}
            <div className="order-2 lg:order-1">
              <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/png/genz-woman_story1.png"
                  alt="Gen Z Founder Story"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover h-full w-full"
                />
              </div>
            </div>

            {/* Text Section - Right 50% */}
            <div className="order-1 lg:order-2 space-y-4 text-slate-700">
              <p className="text-xs font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full w-fit">
                Gen Z Agadir
              </p>
              <h3 className="text-2xl md:text-3xl text-slate-900 flex items-center gap-2 flex-wrap">
                <span>Inspiration</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <span>Mentor Call</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <span>Plan d&apos;action</span>
              </h3>
              <p className="text-sm md:text-base leading-relaxed">
                في مقهى فكازا جاتها شرارة الإلهام. خدمت مع مرشدتها من الدياسبورا عبر فيديو كول، 
                وباش شعارنا <strong>وليناها مشروع</strong> يتحقق، خدمو ف coworking space وخداو فكرتها نحو خطة تشغيل واضحة.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Une idée fulgurante dans un café d&apos;Agadir se transforme en sketch rapide sur carnet.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Users className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Elle partage tout de suite sa vision en visio avec sa mentor de la diaspora, tableau blanc à l&apos;appui pour co-designer l&apos;app.
                  </span>
                </li>
                <li className="flex gap-3">
                  <TrendingUp className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Ensemble dans un coworking, elles transforment le concept en plan produit, chiffres et roadmap prêts pour l&apos;agent IA.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works - Premium 3 Steps with Connecting Line */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 md:p-8 border-2 border-amber-200 shadow-sm mb-8 relative">
          <h3 className="text-lg md:text-xl text-slate-900 text-center mb-8">
            كيفاش كيخدم؟ (Comment ça marche ?)
          </h3>
          
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connecting Line - Desktop Only */}
            <div className="hidden md:block absolute top-1/2 left-10 right-10 border-t-2 border-dashed border-gray-300 -z-10" />
            
            {/* Step 1 */}
            <div className="text-center relative z-10">
              <div className="relative w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm p-6 flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-[#006837]" />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#006837] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
              </div>
              <p className="font-extrabold text-sm mb-1 text-red-900" dir="rtl">دير كليك و دير الصوت</p>
              <p className="text-xs text-slate-600">Clique et parle</p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center relative z-10">
              <div className="relative w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm p-6 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-[#006837]" />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#006837] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
              </div>
              <p className="font-extrabold text-sm mb-1 text-amber-900" dir="rtl">7 وكلاء ذكاء اصطناعي</p>
              <p className="text-xs text-slate-600">7 agents IA analysent</p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center relative z-10">
              <div className="relative w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm p-6 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-[#006837]" />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#006837] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
              </div>
              <p className="font-extrabold text-sm mb-1 text-green-900" dir="rtl">خطة عمل مخصصة</p>
              <p className="text-xs text-slate-600">Plan d'action sur mesure</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-amber-200 text-center space-y-1">
            <p className="text-xs text-slate-700" dir="rtl">
              ⚡ كيخدم بلا كتابة. فقط صوتك. كيتم التسجيل تلقائياً.
            </p>
            <p className="text-xs text-amber-700" dir="rtl">
              ⚡ {APP_TAGLINE.main.tamazight.subtext}
            </p>
            {APP_TAGLINE.main.tamazight.subtextLatin && (
              <p className="text-xs text-amber-600 italic">
                ⚡ {APP_TAGLINE.main.tamazight.subtextLatin}
              </p>
            )}
            <p className="text-xs text-slate-600">
              ⚡ Fonctionne sans écrire. Juste ta voix. L'enregistrement est automatique.
            </p>
          </div>
        </div>

        {/* Additional Quick Links - Small Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs hover:bg-green-50 hover:text-green-700"
          >
            <Link href="/find-mentor">
              <Search className="w-3 h-3 mr-1" />
              Trouver Mentor
            </Link>
          </Button>
          
          <span className="text-slate-300">•</span>
          
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs hover:bg-amber-50 hover:text-amber-700"
          >
            <Link href="/ideas">
              <TrendingUp className="w-3 h-3 mr-1" />
              Idées Populaires
            </Link>
          </Button>
        </div>

        {/* Footer Logo - Small */}
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <Image
              src="/png/FikraValley_flag_logo.png"
              alt="Fikra Valley"
              fill
              sizes="64px"
              className="object-contain opacity-80"
              priority
            />
          </div>
        </div>

      </div>
    </main>
  );
}
