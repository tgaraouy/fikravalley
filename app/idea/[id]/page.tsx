/**
 * Public Idea Page
 * 
 * Stage 9-10: Public visibility and viral sharing
 * 
 * Features:
 * - View idea details (if visible=true)
 * - "I Want to Help" button (creates marrai_problem_validations)
 * - Share buttons (Twitter, WhatsApp Status) using Agent 6
 * - SDG alignment display
 * - Mentor count display
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Lightbulb, 
  Share2, 
  Heart, 
  Twitter, 
  MessageCircle,
  CheckCircle,
  TrendingUp,
  MapPin,
  Target,
  DollarSign,
  Clock,
  Users,
  ExternalLink
} from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  problem_statement: string;
  proposed_solution: string | null;
  category: string | null;
  location: string | null;
  status: string;
  visible: boolean;
  featured: boolean;
  ai_feasibility_score: number | null;
  ai_impact_score: number | null;
  roi_time_saved_hours: number | null;
  roi_cost_saved_eur: number | null;
  alignment: {
    sdgTags?: string[];
    sdgConfidence?: number;
    moroccoPriorities?: string[];
  } | null;
  created_at: string;
  validation_count: number;
  mentor_count: number;
}

export default function PublicIdeaPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params.id as string;
  
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasValidated, setHasValidated] = useState(false);
  const [validating, setValidating] = useState(false);
  const [shareText, setShareText] = useState<{ twitter?: string; whatsappStatus?: string } | null>(null);

  useEffect(() => {
    fetchIdea();
  }, [ideaId]);

  const fetchIdea = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ideas/${ideaId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch idea');
      }
      
      setIdea(data);
      
      // Fetch share text from Agent 6
      const shareResponse = await fetch(`/api/agents/notification?action=generateShareText&ideaId=${ideaId}`);
      if (shareResponse.ok) {
        const shareData = await shareResponse.json();
        if (shareData.twitter || shareData.whatsappStatus) {
          setShareText({
            twitter: shareData.twitter,
            whatsappStatus: shareData.whatsappStatus,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load idea');
      console.error('Error fetching idea:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIWantToHelp = async () => {
    if (hasValidated || validating) return;
    
    setValidating(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/validate-problem`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate');
      }

      setHasValidated(true);
      if (idea) {
        setIdea({ ...idea, validation_count: (idea.validation_count || 0) + 1 });
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
      console.error('Error validating:', err);
    } finally {
      setValidating(false);
    }
  };

  const handleShareTwitter = () => {
    if (shareText?.twitter) {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.twitter)}`;
      window.open(url, '_blank');
    } else {
      // Fallback
      const text = idea 
        ? `${idea.title}\n\n${idea.problem_statement.substring(0, 100)}...\n\n${window.location.href}\n\n#فكرة_فالوادي #MRE`
        : '';
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const handleShareWhatsApp = () => {
    if (shareText?.whatsappStatus) {
      const url = `https://wa.me/?text=${encodeURIComponent(shareText.whatsappStatus)}`;
      window.open(url, '_blank');
    } else {
      // Fallback
      const text = idea
        ? `💡 فكرة جديدة في Fikra Valley:\n\n${idea.title}\n\n${idea.problem_statement}\n\nشوف التفاصيل: ${window.location.href}\n\n#فكرة_فالوادي`
        : '';
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('✅ Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Idea not found</h1>
          <p className="text-slate-600 mb-6">{error || 'This idea does not exist or is not publicly visible.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-slate-600 hover:text-slate-900 mb-4 inline-flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {idea.title || 'Untitled Idea'}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {idea.category && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium capitalize">
                {idea.category}
              </span>
            )}
            {idea.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="capitalize">{idea.location}</span>
              </div>
            )}
            {idea.featured && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                ⭐ Featured
              </span>
            )}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Problem Statement */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Problem Statement</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {idea.problem_statement}
            </p>
          </div>

          {/* Proposed Solution */}
          {idea.proposed_solution && (
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Proposed Solution</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {idea.proposed_solution}
              </p>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Impact Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {idea.ai_feasibility_score !== null && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <div className="text-sm text-slate-600">Feasibility</div>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {(idea.ai_feasibility_score * 100).toFixed(0)}%
                  </div>
                </div>
              )}
              {idea.ai_impact_score !== null && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div className="text-sm text-slate-600">Impact</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {(idea.ai_impact_score * 100).toFixed(0)}%
                  </div>
                </div>
              )}
              {idea.roi_cost_saved_eur !== null && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <div className="text-sm text-slate-600">ROI (Monthly)</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-700">
                    €{idea.roi_cost_saved_eur.toLocaleString()}
                  </div>
                </div>
              )}
              {idea.roi_time_saved_hours !== null && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div className="text-sm text-slate-600">Time Saved</div>
                  </div>
                  <div className="text-2xl font-bold text-orange-700">
                    {idea.roi_time_saved_hours.toFixed(0)}h
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SDG Alignment */}
          {idea.alignment?.sdgTags && idea.alignment.sdgTags.length > 0 && (
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">SDG Alignment</h2>
              <div className="flex flex-wrap gap-2">
                {idea.alignment.sdgTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="p-6 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-600" />
                  <span className="text-slate-700">
                    <strong>{idea.mentor_count || 0}</strong> mentors ready
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-slate-600" />
                  <span className="text-slate-700">
                    <strong>{idea.validation_count || 0}</strong> people validated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">How can you help?</h2>
          
          {/* I Want to Help Button */}
          <button
            onClick={handleIWantToHelp}
            disabled={hasValidated || validating}
            className="w-full mb-4 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {validating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Validating...</span>
              </>
            ) : hasValidated ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>✅ You validated this problem!</span>
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                <span>I Want to Help (I have this problem too)</span>
              </>
            )}
          </button>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShareTwitter}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Twitter className="w-5 h-5" />
              Share on Twitter
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Share on WhatsApp
            </button>
          </div>

          <button
            onClick={copyLink}
            className="w-full mt-3 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Copy Link
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-slate-500">
          <p>
            This idea is part of <strong>Fikra Valley</strong> - Transforming ideas into fundable projects
          </p>
          <p className="mt-2">
            Submitted {new Date(idea.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

