/**
 * Idea Detail Dashboard for Mentors
 * 
 * Stage 8: Detailed view of an idea for mentor review
 * 
 * Access: /idea/[id]/dashboard?email=mentor@example.com
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Lightbulb, Check, X, TrendingUp, MapPin, Clock, ArrowLeft, Target, DollarSign } from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  problem_statement: string;
  proposed_solution: string | null;
  category: string | null;
  location: string | null;
  status: string;
  ai_feasibility_score: number | null;
  ai_impact_score: number | null;
  roi_time_saved_hours: number | null;
  roi_cost_saved_eur: number | null;
  alignment: any;
  created_at: string;
}

interface MentorMatch {
  id: string;
  match_score: number | null;
  match_reason: string | null;
  status: string;
  idea?: Idea | null;
}

export default function IdeaDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const ideaId = params.id as string;
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';

  const [idea, setIdea] = useState<Idea | null>(null);
  const [match, setMatch] = useState<MentorMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchIdeaAndMatch();
  }, [ideaId, email, phone]);

  const fetchIdeaAndMatch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch idea details
      const ideaResponse = await fetch(`/api/ideas/${ideaId}`);
      const ideaData = await ideaResponse.json();
      
      if (!ideaResponse.ok) {
        throw new Error(ideaData.error || 'Failed to fetch idea');
      }
      
      setIdea(ideaData);

      // Fetch match for this mentor
      const params = new URLSearchParams();
      if (email) params.set('email', email);
      if (phone) params.set('phone', phone);
      params.set('status', 'active');

      const matchResponse = await fetch(`/api/mentor/matches?${params.toString()}`);
      const matchData = await matchResponse.json();
      
      if (matchResponse.ok && matchData.matches) {
        const foundMatch = matchData.matches.find((m: MentorMatch) => m.idea?.id === ideaId);
        setMatch(foundMatch || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load idea');
      console.error('Error fetching idea:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!match) return;
    
    if (!confirm('Are you sure you want to accept this match? You will be notified when the idea submitter is ready to connect.')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/mentor/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          match_id: match.id,
          mentor_email: email || undefined,
          mentor_phone: phone || undefined,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept match');
      }

      // Refresh
      await fetchIdeaAndMatch();
      alert('✅ Match accepted! You will be notified when the idea submitter is ready.');
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
      console.error('Error accepting match:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!match) return;
    
    const reason = prompt('Please provide a brief reason for rejecting (optional):');
    
    if (!confirm('Are you sure you want to reject this match?')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/mentor/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          match_id: match.id,
          mentor_response: reason || undefined,
          mentor_email: email || undefined,
          mentor_phone: phone || undefined,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject match');
      }

      // Refresh
      await fetchIdeaAndMatch();
      alert('✅ Match rejected.');
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
      console.error('Error rejecting match:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading idea details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">❌ {error || 'Idea not found'}</p>
            <button
              onClick={() => router.back()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Idea Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                  <h1 className="text-2xl font-bold text-slate-900">
                    {idea.title || 'Untitled Idea'}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  {idea.category && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                      {idea.category}
                    </span>
                  )}
                  {idea.location && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span className="capitalize">{idea.location}</span>
                    </div>
                  )}
                </div>
              </div>
              {match?.match_score && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {(match.match_score * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-slate-500">Match Score</div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Problem Statement */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Problem Statement</h2>
              <p className="text-slate-700 leading-relaxed">{idea.problem_statement}</p>
            </div>

            {/* Proposed Solution */}
            {idea.proposed_solution && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Proposed Solution</h2>
                <p className="text-slate-700 leading-relaxed">{idea.proposed_solution}</p>
              </div>
            )}

            {/* Match Reason */}
            {match?.match_reason && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-1">Why you were matched:</h3>
                <p className="text-blue-800">{match.match_reason}</p>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {idea.ai_feasibility_score !== null && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
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
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
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
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
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
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
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

            {/* SDG Alignment */}
            {idea.alignment && idea.alignment.sdgTags && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">SDG Alignment</h3>
                <div className="flex flex-wrap gap-2">
                  {idea.alignment.sdgTags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {match && match.status === 'active' && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                  >
                    <Check className="w-5 h-5" />
                    Accept Match
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                  >
                    <X className="w-5 h-5" />
                    Reject Match
                  </button>
                </div>
              </div>
            )}

            {match && match.status === 'accepted' && (
              <div className="pt-4 border-t border-slate-200">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check className="w-5 h-5" />
                    <strong>You have accepted this match.</strong>
                  </div>
                  <p className="text-green-700 text-sm mt-2">
                    You will be notified when the idea submitter is ready to connect.
                  </p>
                </div>
              </div>
            )}

            {match && match.status === 'rejected' && (
              <div className="pt-4 border-t border-slate-200">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <X className="w-5 h-5" />
                    <strong>You have rejected this match.</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

