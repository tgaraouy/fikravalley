'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  HeartIcon, 
  ShareIcon, 
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { shareIdeaViaWhatsApp } from '@/lib/share/whatsapp-share';
import {
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';
import { LikeButton } from '@/components/ideas/LikeButton';
import { CommentsSection } from '@/components/ideas/CommentsSection';
import { ReviewsSection } from '@/components/ideas/ReviewsSection';
import { GenerateMessageButton } from '@/components/ideas/GenerateMessageButton';
import { MarketAnalysisSection } from '@/components/ideas/MarketAnalysisSection';
import { SimilarIdeas } from '@/components/ideas/SimilarIdeas';
import { ProblemSharpness } from '@/components/ideas/ProblemSharpness';
import FounderInfo from '@/components/ideas/FounderInfo';
import { LeanCanvasViewer } from '@/components/canvas/LeanCanvasViewer';
import { CanvasScores } from '@/components/canvas/CanvasScores';

interface Idea {
  id: string;
  title: string;
  title_darija?: string;
  problem_statement: string;
  proposed_solution?: string;
  location: string;
  category: string;
  total_score?: number;
  stage1_total?: number;
  stage2_total?: number;
  receipt_count?: number;
  upvote_count?: number;
  funding_status?: string;
  qualification_tier?: 'exceptional' | 'qualified' | 'developing';
  created_at: string;
  submitter_name?: string;
  submitter_email?: string;
  has_receipts?: boolean;
  target_audience?: string;
  moroccan_priorities?: string[];
}

export default function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'validation' | 'scoring' | 'canvas'>('overview');
  const [canvas, setCanvas] = useState<any>(null);
  const [canvasScores, setCanvasScores] = useState<any>(null);
  const [isLoadingCanvas, setIsLoadingCanvas] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimForm, setClaimForm] = useState({
    claimer_name: '',
    claimer_email: '',
    claimer_city: '',
    claimer_type: 'solo',
    engagement_level: 'exploring',
    motivation: '',
  });
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [isUIMockOpen, setIsUIMockOpen] = useState(false);
  const [isUIMockLoading, setIsUIMockLoading] = useState(false);
  const [uiMockError, setUIMockError] = useState<string | null>(null);
  const [uiMock, setUIMock] = useState<{
    layout: {
      screen_title: string;
      description?: string;
      sections: Array<{
        id?: string;
        title: string;
        description?: string;
        suggested_components?: string[];
        cta_buttons?: Array<{
          label: string;
          action_hint?: string;
        }>;
      }>;
    };
  } | null>(null);
  const justSubmitted = searchParams?.get('submitted') === 'true';
  
  // Unwrap params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setIdeaId(resolvedParams.id);
    });
  }, [params]);
  
  useEffect(() => {
    if (!ideaId) return;
    
    // Fetch idea data
    const fetchIdea = async () => {
      try {
        const response = await fetch(`/api/ideas/${ideaId}`);
        const data = await response.json();
        setIdea(data);
        setLikes(data.upvote_count || 0);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching idea:', error);
        setIsLoading(false);
      }
    };
    
    fetchIdea();
  }, [ideaId]);

  // Fetch canvas when idea is loaded
  useEffect(() => {
    if (!ideaId) return;
    
    const fetchCanvas = async () => {
      setIsLoadingCanvas(true);
      try {
        const response = await fetch(`/api/ideas/${ideaId}/canvas`);
        if (response.ok) {
          const data = await response.json();
          setCanvas(data.canvas);
          setCanvasScores(data.scores);
        } else if (response.status === 404) {
          // No canvas yet, that's OK
          setCanvas(null);
          setCanvasScores(null);
        }
      } catch (error) {
        console.error('Error fetching canvas:', error);
      } finally {
        setIsLoadingCanvas(false);
      }
    };
    
    fetchCanvas();
  }, [ideaId]);
  
  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    // TODO: API call
    // try {
    //   await fetch(`/api/ideas/${params.id}/upvote`, { method: 'POST' });
    // } catch (error) {
    //   // Revert on error
    //   setIsLiked(isLiked);
    //   setLikes(idea?.upvote_count || 0);
    // }
  };
  
  const handleShare = async () => {
    if (idea) {
      // Use optimized WhatsApp share (viral loop)
      shareIdeaViaWhatsApp(idea.title, window.location.href);
    }
  };
  
  const handleWhatsAppShare = () => {
    if (idea) {
      shareIdeaViaWhatsApp(idea.title, window.location.href);
    }
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleGenerateUIMock = async () => {
    if (!ideaId) return;
    setIsUIMockLoading(true);
    setUIMockError(null);
    try {
      const res = await fetch(`/api/ideas/${ideaId}/ui-mock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: 'fr' }),
      });
      
      // Check if response is JSON before parsing (avoid "Unexpected token <" error)
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        // Response is HTML (404 page) or other non-JSON
        const text = await res.text();
        setUIMockError(`Route not found (${res.status}). Please restart dev server.`);
        return;
      }
      if (!res.ok) {
        setUIMockError(data.error || 'Impossible de générer le mock UI.');
      } else {
        // API returns: { uiMock: { layout: {...}, meta: {...} } }
        // Extract the uiMock object from the response
        if (data.uiMock) {
          setUIMock(data.uiMock);
        } else {
          // Fallback: if structure is different, use data directly
          setUIMock(data);
        }
        setIsUIMockOpen(true);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error generating UI mock:', error);
      }
      setUIMockError('Erreur réseau. Réessaie plus tard.');
    } finally {
      setIsUIMockLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💡</div>
          <div className="text-xl font-semibold text-gray-600">Loading idea...</div>
        </div>
      </div>
    );
  }
  
  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">Idea not found</div>
          <button 
            onClick={() => router.push('/ideas')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Back to Ideas
          </button>
        </div>
      </div>
    );
  }
  
  const clarityDecisionScore = (idea.stage1_total || 0) + (idea.stage2_total || 0);
  const intimacyScore = Math.round(((idea.total_score || 0) - clarityDecisionScore) * 10 / 10);
  const receipts = idea.receipt_count || 0;
  
  const getSectorIcon = (category: string | null | undefined): string => {
    if (!category) return '💡';
    const icons: Record<string, string> = {
      'agriculture': '🌾', 'education': '🎓', 'health': '🏥', 'healthcare': '🏥',
      'technology': '💻', 'fintech': '💳', 'finance': '💰', 'e-commerce': '🛒',
      'tourism': '✈️', 'environment': '🌍', 'social': '🤝', 'manufacturing': '🏭',
      'services': '🔧', 'energy': '⚡', 'transport': '🚗', 'food': '🍽️',
      'fashion': '👗', 'art': '🎨', 'sports': '⚽', 'media': '📺', 'other': '💡'
    };
    return icons[category.toLowerCase()] || '💡';
  };
  
  const getStatus = (): 'exceptional' | 'qualified' | 'funded' | 'launched' | 'promising' => {
    if (idea.funding_status === 'funded') return 'funded';
    if (idea.funding_status === 'launched') return 'launched';
    if (idea.qualification_tier === 'exceptional') return 'exceptional';
    if (idea.qualification_tier === 'qualified') return 'qualified';
    return 'promising';
  };
  
  const status = getStatus();
  const displayTitle = idea.title_darija || idea.title;
  
  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 mb-6">
            <button onClick={() => router.push('/ideas')} className="hover:text-green-600 transition-colors">
              Ideas
            </button>
            <span>/</span>
            <button onClick={() => router.push(`/ideas?sector=${idea.category}`)} className="hover:text-green-600 transition-colors">
              {idea.category}
            </button>
            <span>/</span>
            <span className="text-gray-900 truncate">{displayTitle}</span>
          </div>
          
          {/* Success Banner with Prominent Share Button */}
          {justSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-green-900 mb-2">
                    🎉 فكرتك تم قبولها! (Your idea was submitted!)
                  </h3>
                  <p className="text-green-700">
                    شارك فكرتك فالواتساب و خلي أصدقائك يشوفوها (Share your idea on WhatsApp)
                  </p>
                </div>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
                >
                  <span className="text-2xl">💬</span>
                  <span>شارك فالواتساب</span>
                  <span className="text-sm opacity-90">(Share on WhatsApp)</span>
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Score Badge */}
          <div className="mb-4">
            <div className={`
              inline-flex items-center gap-2 px-6 py-3
              bg-gradient-to-r ${getScoreGradient(clarityDecisionScore)}
              text-white rounded-full font-bold text-2xl shadow-xl
            `}>
              <span>{clarityDecisionScore}</span>
              <span className="opacity-75 text-xl">/40</span>
            </div>
          </div>
          
          {/* Status + Engagement */}
          <div className="flex items-center gap-4 flex-wrap mb-6">
            <StatusBadge status={status} large />
            
            {idea?.id && (
              <LikeButton 
                ideaId={idea.id}
                initialCount={likes}
                initialIsLiked={isLiked}
                onLikeChange={(count, isLiked) => {
                  setLikes(count);
                  setIsLiked(isLiked);
                }}
              />
            )}
            
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              <span className="text-lg">💬</span>
              <span>Share on WhatsApp</span>
            </button>

            {idea?.id && (
              <GenerateMessageButton
                ideaId={idea.id}
                ideaTitle={displayTitle}
                problemStatement={idea.problem_statement}
              />
            )}
            <button
              onClick={() => setIsClaiming(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              <span className="text-lg">🚀</span>
              <span>Je teste cette idée</span>
            </button>

            <button
              onClick={handleGenerateUIMock}
              disabled={isUIMockLoading}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-semibold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">🎨</span>
              <span>
                {isUIMockLoading ? 'Mock UI…' : 'Mock UI (AI)'}
              </span>
            </button>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {displayTitle}
          </h1>
          
          {/* Description */}
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            {idea.problem_statement}
          </p>
          
          {/* Metadata */}
          <div className="flex items-center gap-6 flex-wrap text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{idea.location}</span>
            </div>
            
            {idea.category && (
              <div className="flex items-center gap-1">
                <span>{getSectorIcon(idea.category)}</span>
                <span className="capitalize">{idea.category}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span>Submitted {formatDate(idea.created_at)}</span>
            </div>
          </div>

          {/* Founder Info */}
          {idea?.id && (
            <FounderInfo
              ideaId={idea.id}
              submitterName={idea.submitter_name}
              submitterEmail={idea.submitter_email}
            />
          )}
          
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2">
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto">
              {['overview', 'validation', 'scoring', 'canvas'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`
                    pb-4 font-semibold whitespace-nowrap transition-colors
                    ${activeTab === tab 
                      ? 'text-green-600 border-b-2 border-green-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {tab === 'canvas' ? 'Lean Canvas' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            {activeTab === 'overview' && <OverviewTab idea={idea} />}
            {activeTab === 'validation' && <ValidationTab receipts={receipts} />}
            {activeTab === 'scoring' && (
              <ScoringTab 
                clarity={idea.stage1_total || 0}
                decision={idea.stage2_total || 0}
                intimacy={intimacyScore}
              />
            )}
            {activeTab === 'canvas' && (
              <div className="space-y-6">
                {isLoadingCanvas ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading canvas...</p>
                  </div>
                ) : canvas ? (
                  <>
                    <LeanCanvasViewer canvasData={canvas.canvas_data} version={canvas.version} />
                    {canvasScores && (
                      <CanvasScores scores={canvasScores} />
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-600 mb-4">No Lean Canvas generated yet.</p>
                    <button
                      onClick={async () => {
                        setIsLoadingCanvas(true);
                        try {
                          const response = await fetch(`/api/ideas/${ideaId}/canvas`, {
                            method: 'POST',
                          });
                          if (response.ok) {
                            const data = await response.json();
                            setCanvas(data.canvas);
                            setCanvasScores(data.scores);
                          }
                        } catch (error) {
                          console.error('Error generating canvas:', error);
                        } finally {
                          setIsLoadingCanvas(false);
                        }
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                    >
                      Generate Lean Canvas
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Comments Section */}
            {idea?.id && (
              <div className="mt-12">
                <CommentsSection ideaId={idea.id} />
              </div>
            )}
            
            {/* Reviews Section */}
            {idea?.id && (
              <div className="mt-8">
                <ReviewsSection ideaId={idea.id} />
              </div>
            )}

            {/* Market Analysis Section */}
            {idea?.id && (
              <div className="mt-8">
                <MarketAnalysisSection
                  ideaId={idea.id}
                  ideaTitle={displayTitle}
                  problemStatement={idea.problem_statement}
                  proposedSolution={idea.proposed_solution}
                  category={idea.category}
                  location={idea.location}
                />
              </div>
            )}
            
          </div>
          
          {/* Sidebar (1/3) */}
          <div className="lg:col-span-1">
            {idea?.id && (
              <Sidebar 
                receipts={receipts}
                intimacy={intimacyScore}
                likes={likes}
                createdAt={idea.created_at}
                ideaId={idea.id}
              />
            )}
          </div>
          
        </div>
        
      </div>
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          url={typeof window !== 'undefined' ? window.location.href : ''}
          title={displayTitle}
          onClose={() => setShowShareModal(false)}
          copySuccess={copySuccess}
          onCopy={copyLink}
        />
      )}

      {/* Claim Modal */}
      {isClaiming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative">
            <button
              onClick={() => setIsClaiming(false)}
              className="absolute top-3 right-4 text-slate-400 hover:text-slate-700 text-xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Tu veux tester cette idée ?
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              <strong>3 conversations, 1 payment de 10 DH.</strong> C'est tout ce qu'il faut pour valider. 
              On te génère les messages WhatsApp et un mentor te contacte seulement si tu bloques.
            </p>

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!ideaId) return;
                try {
                  const res = await fetch(`/api/ideas/${ideaId}/claim`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(claimForm),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    alert(data.error || 'Impossible de sauvegarder ton engagement. Réessaie.');
                    return;
                  }
                  alert("✅ C'est noté ! On te génère les messages WhatsApp pour tes 3 conversations. Un mentor te contacte seulement si tu as besoin d'aide.");
                  setIsClaiming(false);
                  setClaimForm({
                    claimer_name: '',
                    claimer_email: '',
                    claimer_city: '',
                    claimer_type: 'solo',
                    engagement_level: 'exploring',
                    motivation: '',
                  });
                } catch (error) {
                  if (process.env.NODE_ENV === 'development') {
                    console.error('Error submitting claim:', error);
                  }
                  alert('Erreur réseau. Réessaie plus tard.');
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ton nom ou nom d&apos;équipe *
                </label>
                <input
                  type="text"
                  required
                  value={claimForm.claimer_name}
                  onChange={(e) => setClaimForm({ ...claimForm, claimer_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    value={claimForm.claimer_email}
                    onChange={(e) => setClaimForm({ ...claimForm, claimer_email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ville (optionnel)
                  </label>
                  <input
                    type="text"
                    value={claimForm.claimer_city}
                    onChange={(e) => setClaimForm({ ...claimForm, claimer_city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tu es / vous êtes *
                  </label>
                  <select
                    value={claimForm.claimer_type}
                    onChange={(e) => setClaimForm({ ...claimForm, claimer_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                  >
                    <option value="solo">Solo</option>
                    <option value="team">Équipe</option>
                    <option value="community">Communauté</option>
                    <option value="university_club">Club universitaire</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Étape actuelle *
                  </label>
                  <select
                    value={claimForm.engagement_level}
                    onChange={(e) => setClaimForm({ ...claimForm, engagement_level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                  >
                    <option value="exploring">Je découvre</option>
                    <option value="validating">Je valide le problème</option>
                    <option value="prototyping">Je fais un prototype</option>
                    <option value="launching">Je prépare le lancement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pourquoi cette idée ? (optionnel)
                </label>
                <textarea
                  rows={3}
                  value={claimForm.motivation}
                  onChange={(e) => setClaimForm({ ...claimForm, motivation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                  placeholder="Explique en 1-2 phrases pourquoi cette idée te parle."
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsClaiming(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UI Mock Modal */}
      {isUIMockOpen && uiMock && uiMock.layout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
            <button
              onClick={() => setIsUIMockOpen(false)}
              className="absolute top-3 right-4 text-slate-400 hover:text-slate-700 text-xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              🎨 Mock UI (Gemini Nano Banana)
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Esquisse d&apos;écran mobile pour cette idée. C&apos;est une
              suggestion rapide pour designers et devs – rien n&apos;est stocké.
            </p>

            <div className="space-y-4">
              <div className="border rounded-xl p-4 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900">
                  {uiMock.layout.screen_title}
                </h3>
                {uiMock.layout.description && (
                  <p className="text-sm text-slate-700 mt-1">
                    {uiMock.layout.description}
                  </p>
                )}
              </div>

              {uiMock.layout.sections.map((section, idx) => (
                <div
                  key={section.id || idx}
                  className="border rounded-xl p-4"
                >
                  <h4 className="text-base font-semibold text-slate-900 mb-1">
                    {section.title}
                  </h4>
                  {section.description && (
                    <p className="text-sm text-slate-700 mb-2">
                      {section.description}
                    </p>
                  )}

                  {section.suggested_components &&
                    section.suggested_components.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Composants suggérés
                        </div>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                          {section.suggested_components.map((comp, i) => (
                            <li key={i}>{comp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {section.cta_buttons && section.cta_buttons.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Boutons d&apos;action
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {section.cta_buttons.map((btn, i) => (
                          <div
                            key={i}
                            className="px-3 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-xs text-emerald-800"
                          >
                            <span className="font-semibold">
                              {btn.label}
                            </span>
                            {btn.action_hint && (
                              <span className="ml-1 text-[11px] text-emerald-700">
                                ({btn.action_hint})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-4 flex justify-between items-center gap-3">
                {uiMockError && (
                  <p className="text-xs text-red-600">{uiMockError}</p>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!uiMock || !uiMock.layout) return;
                      try {
                        navigator.clipboard.writeText(
                          JSON.stringify(uiMock.layout, null, 2)
                        );
                      } catch {
                        // ignore
                      }
                    }}
                    className="px-3 py-1 text-xs border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                  >
                    Copier JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUIMockOpen(false)}
                    className="px-4 py-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ idea }: { idea: Idea }) {
  const [problemStatement, setProblemStatement] = useState(idea.problem_statement);

  return (
    <div className="space-y-6">
      
      {/* Problem Sharpness Tool */}
      {idea?.id && (
        <ProblemSharpness
          ideaId={idea.id}
          currentProblem={problemStatement}
          onProblemUpdated={(newProblem) => {
            setProblemStatement(newProblem);
            // Update local idea state
            if (idea) {
              idea.problem_statement = newProblem;
            }
          }}
        />
      )}
      
      <Section title="The Problem">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {problemStatement}
        </p>
      </Section>
      
      {idea.proposed_solution && (
        <Section title="The Solution">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {idea.proposed_solution}
          </p>
        </Section>
      )}
      
      {idea.target_audience && (
        <Section title="Who This Is For">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {idea.target_audience}
          </p>
        </Section>
      )}
      
      {idea.moroccan_priorities && idea.moroccan_priorities.length > 0 && (
        <Section title="Aligns With">
          <div className="flex flex-wrap gap-2">
            {idea.moroccan_priorities.map(priority => (
              <div
                key={priority}
                className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-sm"
              >
                {priority}
              </div>
            ))}
          </div>
        </Section>
      )}
      
    </div>
  );
}

// Validation Tab Component
function ValidationTab({ receipts }: { receipts: number }) {
  const percentage = Math.min((receipts / 50) * 100, 100);
  
  return (
    <div className="space-y-6">
      
      <Section title="Validation Proof">
        <p className="text-gray-600 mb-6">
          <span className="text-3xl font-bold text-green-600">{receipts}</span>
          {' '}people have validated this idea
        </p>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-green-500 h-4 rounded-full"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{receipts} receipts</span>
            <span>{receipts >= 50 ? '✅ Goal reached!' : `${50 - receipts} more to strong validation`}</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Total Receipts"
            value={receipts}
            icon="💰"
          />
          <StatCard
            label="Validation Strength"
            value={getValidationStrength(receipts)}
            icon="📊"
          />
          <StatCard
            label="Avg per Week"
            value={Math.round(receipts / 12)}
            icon="📈"
          />
          <StatCard
            label="Latest Receipt"
            value="2 days ago"
            icon="🕐"
          />
        </div>
        
      </Section>
      
    </div>
  );
}

// Scoring Tab Component
function ScoringTab({ clarity, decision, intimacy }: { clarity: number; decision: number; intimacy: number }) {
  return (
    <div className="space-y-6">
      
      <Section title="Detailed Scoring">
        <p className="text-gray-600 mb-6">
          Based on Locke's framework for TRUE KNOWING
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ScoreCard
            icon="📝"
            label="Clarity"
            score={clarity}
            max={10}
            color="blue"
            description="How clear is the problem/solution?"
          />
          <ScoreCard
            icon="🎯"
            label="Decision"
            score={decision}
            max={40}
            color="purple"
            description="How ready to execute?"
          />
          <ScoreCard
            icon="🧠"
            label="Intimacy"
            score={intimacy}
            max={10}
            color="orange"
            description="How deeply does creator know the problem?"
          />
        </div>
        
        {/* Locke Quote */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
          <p className="italic text-gray-700 mb-2">
            "It is one thing to show a man that he is in error, and another to put him in possession of truth."
          </p>
          <p className="text-sm text-gray-600">— John Locke</p>
        </div>
        
      </Section>
      
    </div>
  );
}

// Sidebar Component
function Sidebar({ receipts, intimacy, likes, createdAt, ideaId }: { 
  receipts: number; 
  intimacy: number; 
  likes: number; 
  createdAt: string;
  ideaId: string;
}) {
  const router = useRouter();
  
  return (
    <div className="sticky top-20 space-y-6">
      
      {/* Quick Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
        
        <div className="space-y-3">
          <StatRow icon="💰" label="Receipts" value={receipts} />
          <StatRow icon="🧠" label="Intimacy" value={`${intimacy}/10`} />
          <StatRow icon="👁️" label="Views" value="-" />
          <StatRow icon="❤️" label="Likes" value={likes} />
          <StatRow icon="📅" label="Submitted" value={formatDate(createdAt)} />
        </div>
        
        <div className="mt-6 space-y-3">
          <button className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors">
            Support This Idea
          </button>
          <button className="w-full py-3 border-2 border-gray-300 rounded-lg font-bold hover:border-green-500 hover:text-green-600 transition-colors">
            Connect with Creator
          </button>
        </div>
        
        <button className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700">
          Report Issue
        </button>
      </div>
      
      {/* Similar Ideas */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-green-600" />
          Similar Ideas
        </h3>
        
        <SimilarIdeas ideaId={ideaId} limit={5} threshold={0.6} />
      </div>
      
    </div>
  );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function ScoreCard({ icon, label, score, max, color, description }: {
  icon: string;
  label: string;
  score: number;
  max: number;
  color: 'blue' | 'purple' | 'orange';
  description: string;
}) {
  const percentage = (score / max) * 100;
  const colorClasses = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-500' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-500' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-500' }
  };
  
  const colors = colorClasses[color];
  
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
      <div className="text-4xl mb-3">{icon}</div>
      <div className={`text-3xl font-bold ${colors.text} mb-2`}>
        {score}/{max}
      </div>
      <div className="font-bold text-gray-900 mb-2">{label}</div>
      <div className="text-sm text-gray-600 mb-4">{description}</div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-2 rounded-full ${colors.bg}`}
        />
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
      <div className="flex items-center gap-2 text-gray-600">
        <span>{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const configs = {
    exceptional: {
      text: 'Exceptional',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '⭐'
    },
    qualified: {
      text: 'Qualified',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '✅'
    },
    funded: {
      text: 'Funded',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '💰'
    },
    launched: {
      text: 'Launched',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🚀'
    },
    promising: {
      text: 'Promising',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '💡'
    }
  };
  
  const config = configs[status as keyof typeof configs] || configs.promising;
  
  return (
    <div className={`
      inline-flex items-center gap-1 ${large ? 'px-4 py-2 text-base' : 'px-3 py-1 text-sm'}
      rounded-lg border-2 font-bold
      ${config.color}
    `}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
}

// Share Modal Component
function ShareModal({ url, title, onClose, copySuccess, onCopy }: {
  url: string;
  title: string;
  onClose: () => void;
  copySuccess: boolean;
  onCopy: () => void;
}) {
  // Optimized WhatsApp share message (viral loop)
  const whatsappMessage = `فكرتي: "${title}"

كيفاش غادي تولي مشروع ب3 دقايق؟ شوفو هنا: ${url}

#FikraValley #مغرب_مقاول`;
  
  const shareOptions = [
    { name: 'LinkedIn', icon: '💼', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'Twitter', icon: '🐦', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
    { name: 'Facebook', icon: '📘', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'WhatsApp', icon: '💬', url: `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, primary: true }
  ];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl p-6 max-w-md w-full z-10"
      >
        <h3 className="text-2xl font-bold mb-4">Share this idea</h3>
        
        {/* Copy Link */}
        <button
          onClick={onCopy}
          className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors mb-4"
        >
          <span className="font-semibold">Copy Link</span>
          {copySuccess ? (
            <CheckIcon className="w-5 h-5 text-green-600" />
          ) : (
            <span>🔗</span>
          )}
        </button>
        
        {copySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
          >
            ✅ Link copied to clipboard!
          </motion.div>
        )}
        
        {/* Share Options - WhatsApp Prominent */}
        <div className="space-y-3">
          {/* WhatsApp - Primary, Prominent */}
          <a
            href={shareOptions.find(o => o.name === 'WhatsApp')?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 p-5 border-2 border-green-500 bg-green-50 rounded-lg hover:bg-green-100 transition-all shadow-md"
          >
            <span className="text-3xl">💬</span>
            <div className="flex-1 text-left">
              <span className="font-bold text-green-700 block">WhatsApp</span>
              <span className="text-xs text-green-600">شارك فالواتساب (99% فتح)</span>
            </div>
            <span className="text-green-600">→</span>
          </a>
          
          {/* Other Options */}
          <div className="grid grid-cols-3 gap-2">
            {shareOptions.filter(o => o.name !== 'WhatsApp').map(option => (
              <a
                key={option.name}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1 p-3 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="text-xs font-semibold">{option.name}</span>
              </a>
            ))}
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}

// Helper Functions
function getScoreGradient(score: number) {
  if (score >= 32) return 'from-purple-500 to-pink-500';
  if (score >= 25) return 'from-blue-500 to-indigo-500';
  return 'from-yellow-500 to-orange-500';
}

function getValidationStrength(receipts: number) {
  if (receipts >= 200) return 'Market Proven';
  if (receipts >= 50) return 'Strong';
  if (receipts >= 10) return 'Initial';
  return 'Weak';
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const months = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  if (months === 0) return 'This month';
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}
