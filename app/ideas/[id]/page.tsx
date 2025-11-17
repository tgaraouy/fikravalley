/**
 * Idea Detail Page
 * 
 * Full display of an idea with all details, scoring, and interactions
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOROCCO_PRIORITIES } from '@/lib/idea-bank/scoring/morocco-priorities';
// Icons - using simple text/emojis for now

interface Idea {
  id: string;
  title: string;
  title_darija?: string;
  problem_statement: string;
  proposed_solution?: string;
  current_manual_process?: string;
  location: string;
  category: string;
  total_score?: number;
  stage1_total?: number;
  stage2_total?: number;
  stage1_breakdown?: {
    problemStatement: number;
    asIsAnalysis: number;
    benefitStatement: number;
    operationalNeeds: number;
  };
  stage2_breakdown?: {
    strategicFit: number;
    feasibility: number;
    differentiation: number;
    evidenceOfDemand: number;
  };
  receipt_count?: number;
  upvote_count?: number;
  problem_validation_count?: number;
  alignment?: {
    moroccoPriorities?: string[];
    sdgTags?: number[];
    sdgAutoTagged?: boolean;
    sdgConfidence?: { [sdg: number]: number };
  };
  sdg_alignment?: number[]; // Legacy field
  funding_status?: string;
  qualification_tier?: 'exceptional' | 'qualified' | 'developing';
  created_at: string;
  submitter_name?: string;
  break_even_months?: number;
  similar_ideas?: Idea[];
}

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params.id as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const response = await fetch(`/api/ideas/${ideaId}`);
        const data = await response.json();
        setIdea(data);
      } catch (error) {
        console.error('Error fetching idea:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (ideaId) {
      fetchIdea();
    }
  }, [ideaId]);

  const handleUpvote = async () => {
    if (hasUpvoted) return;

    try {
      await fetch(`/api/ideas/${ideaId}/upvote`, { method: 'POST' });
      setHasUpvoted(true);
      if (idea) {
        setIdea({ ...idea, upvote_count: (idea.upvote_count || 0) + 1 });
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleValidateProblem = async () => {
    if (hasValidated) return;

    try {
      await fetch(`/api/ideas/${ideaId}/validate-problem`, { method: 'POST' });
      setHasValidated(true);
      if (idea) {
        setIdea({
          ...idea,
          problem_validation_count: (idea.problem_validation_count || 0) + 1,
        });
      }
    } catch (error) {
      console.error('Error validating problem:', error);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `${idea?.title} - Morocco Innovation Database`;

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
    setShowShareMenu(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Idea not found</h1>
          <Link
            href="/ideas"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Back to Ideas
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-800';
    if (score >= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (score >= 25) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 20) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/ideas"
            className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm"
          >
            ← Back to Ideas
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {idea.title_darija || idea.title}
          </h1>
          {idea.title_darija && idea.title !== idea.title_darija && (
            <p className="text-xl opacity-90">{idea.title}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Badge */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`px-4 py-2 rounded-full text-lg font-bold border-2 ${getScoreColor(
                    idea.total_score || idea.stage2_total
                  )}`}
                >
                  Score: {(idea.total_score || idea.stage2_total || 0)}/40
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleUpvote}
                    disabled={hasUpvoted}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      hasUpvoted
                        ? 'bg-red-100 text-red-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <span className="text-xl">{hasUpvoted ? '❤️' : '🤍'}</span>
                    <span className="font-semibold">{idea.upvote_count || 0}</span>
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <span className="text-xl mr-1">🔗</span>
                      Share
                    </button>
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 z-10 min-w-[200px]">
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <span className="mr-2">🐦</span>
                          Twitter
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <span className="mr-2">💼</span>
                          LinkedIn
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <span className="mr-2">💬</span>
                          WhatsApp
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              {idea.stage1_breakdown && (
                <div className="mt-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Clarity Score (Stage 1)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Problem Statement</span>
                      <span className="font-semibold">{idea.stage1_breakdown.problemStatement}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">As-Is Analysis</span>
                      <span className="font-semibold">{idea.stage1_breakdown.asIsAnalysis}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Benefit Statement</span>
                      <span className="font-semibold">{idea.stage1_breakdown.benefitStatement}/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Operational Needs</span>
                      <span className="font-semibold">{idea.stage1_breakdown.operationalNeeds}/10</span>
                    </div>
                  </div>
                </div>
              )}

              {idea.stage2_breakdown && (
                <div className="mt-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Decision Score (Stage 2)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Strategic Fit</span>
                      <span className="font-semibold">{idea.stage2_breakdown.strategicFit}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Feasibility</span>
                      <span className="font-semibold">{idea.stage2_breakdown.feasibility}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Differentiation</span>
                      <span className="font-semibold">{idea.stage2_breakdown.differentiation}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Evidence of Demand</span>
                      <span className="font-semibold">{idea.stage2_breakdown.evidenceOfDemand}/5</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Problem Statement */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Problem Statement</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {idea.problem_statement}
              </p>
              <button
                onClick={handleValidateProblem}
                disabled={hasValidated}
                className={`mt-4 px-6 py-2 rounded-lg font-semibold transition-colors ${
                  hasValidated
                    ? 'bg-green-100 text-green-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {hasValidated ? (
                  <>
                    <span className="mr-2">✅</span>
                    I have this problem too ({idea.problem_validation_count || 0})
                  </>
                ) : (
                  <>
                    <span className="mr-2">👥</span>
                    I have this problem too
                  </>
                )}
              </button>
            </div>

            {/* Solution */}
            {idea.proposed_solution && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Proposed Solution</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {idea.proposed_solution}
                </p>
              </div>
            )}

            {/* Current Process */}
            {idea.current_manual_process && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Current Manual Process</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {idea.current_manual_process}
                </p>
              </div>
            )}

            {/* Similar Ideas */}
            {idea.similar_ideas && Array.isArray(idea.similar_ideas) && idea.similar_ideas.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Similar Ideas</h2>
                <div className="space-y-3">
                  {idea.similar_ideas.map((similar) => (
                    <Link
                      key={similar.id}
                      href={`/ideas/${similar.id}`}
                      className="block p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      <h3 className="font-semibold text-slate-900">{similar.title}</h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {similar.problem_statement}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meta Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <span>📍</span>
                  <span>{idea.location || 'Morocco'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>🏆</span>
                  <span className="capitalize">{idea.category}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>📅</span>
                  <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                </div>
                {idea.break_even_months && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>⏰</span>
                    <span>Break-even: {idea.break_even_months} months</span>
                  </div>
                )}
                {idea.receipt_count && idea.receipt_count > 0 && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>📝</span>
                    <span>{idea.receipt_count} validated receipts</span>
                  </div>
                )}
              </div>
            </div>

            {/* Strategic Alignment */}
            {((idea.alignment?.moroccoPriorities && idea.alignment.moroccoPriorities.length > 0) || 
              (idea.alignment?.sdgTags && idea.alignment.sdgTags.length > 0) || 
              (idea.sdg_alignment && Array.isArray(idea.sdg_alignment) && idea.sdg_alignment.length > 0)) && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Strategic Alignment</h2>
                
                {/* Morocco Priorities (prominent) */}
                {idea.alignment?.moroccoPriorities && idea.alignment.moroccoPriorities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span className="text-2xl">🇲🇦</span>
                      Priorités Nationales Marocaines
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {idea.alignment.moroccoPriorities.map((id) => {
                        const priority = MOROCCO_PRIORITIES.find(p => p.id === id);
                        if (!priority) return null;
                        return (
                          <div
                            key={id}
                            className="px-4 py-2 bg-green-100 border-2 border-green-600 rounded-lg"
                          >
                            <div className="font-semibold text-green-900">{priority.name}</div>
                            <div className="text-sm text-green-700 mt-1">{priority.description}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* SDGs (secondary, subtle) */}
                {(() => {
                  const sdgs = idea.alignment?.sdgTags || idea.sdg_alignment || [];
                  if (sdgs.length === 0) return null;
                  
                  const avgConfidence = idea.alignment?.sdgConfidence && sdgs.length > 0
                    ? Math.round(
                        Object.values(idea.alignment.sdgConfidence).reduce((a: number, b: number) => a + b, 0) / 
                        sdgs.length * 100
                      )
                    : null;
                  
                  return (
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                        <span>🌍</span>
                        UN Sustainable Development Goals
                        {avgConfidence && (
                          <span className="text-xs font-normal text-gray-400">
                            (Auto-detected, {avgConfidence}% confidence)
                          </span>
                        )}
                        {!avgConfidence && idea.alignment?.sdgAutoTagged && (
                          <span className="text-xs font-normal text-gray-400">
                            (Auto-detected)
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {sdgs.map((sdg) => {
                          const confidence = idea.alignment?.sdgConfidence?.[sdg];
                          const sdgTitles: Record<number, string> = {
                            1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health',
                            4: 'Quality Education', 5: 'Gender Equality', 6: 'Clean Water',
                            7: 'Clean Energy', 8: 'Decent Work', 9: 'Innovation',
                            10: 'Reduced Inequality', 11: 'Sustainable Cities',
                            12: 'Responsible Consumption', 13: 'Climate Action',
                            14: 'Life Below Water', 15: 'Life on Land',
                            16: 'Peace & Justice', 17: 'Partnerships',
                          };
                          const title = sdgTitles[sdg] || `SDG ${sdg}`;
                          return (
                            <div
                              key={sdg}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                              title={confidence ? `${title} - ${Math.round(confidence * 100)}% confidence` : title}
                            >
                              SDG {sdg}: {title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Creator Credit */}
            {idea.submitter_name && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">Created by</h3>
                <p className="text-slate-600">
                  {idea.submitter_name.split(' ')[0]} {/* First name only */}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
