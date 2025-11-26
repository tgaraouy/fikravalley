/**
 * Mentor Dashboard: View Matches
 * 
 * Stage 8: Mentors can view their matched ideas and accept/reject
 * 
 * Access: /mentor/dashboard?email=mentor@example.com
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lightbulb, Check, X, TrendingUp, MapPin, Clock, ExternalLink } from 'lucide-react';

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
  mentor_responded_at: string | null;
  idea: Idea;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export default function MentorDashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [matches, setMatches] = useState<MentorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'active' | 'accepted' | 'rejected'>('active');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');

  useEffect(() => {
    if (email || phone) {
      fetchMatches();
    }
  }, [email, phone, statusFilter]);

  const fetchMatches = async () => {
    if (!email && !phone) {
      setError('Please enter your email or phone number');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (email) params.set('email', email);
      if (phone) params.set('phone', phone);
      params.set('status', statusFilter);

      const response = await fetch(`/api/mentor/matches?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch matches');
      }
      
      setMentor(data.mentor);
      setMatches(data.matches || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load matches');
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching matches:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId: string) => {
    if (!confirm('Are you sure you want to accept this match? You will be notified when the idea submitter is ready to connect.')) {
      return;
    }

    try {
      const response = await fetch('/api/mentor/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          match_id: matchId,
          mentor_email: email || undefined,
          mentor_phone: phone || undefined,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept match');
      }

      // Refresh matches
      await fetchMatches();
      alert('✅ Match accepted! You will be notified when the idea submitter is ready.');
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
      console.error('Error accepting match:', err);
    }
  };

  const handleReject = async (matchId: string) => {
    const reason = prompt('Please provide a brief reason for rejecting (optional):');
    
    if (!confirm('Are you sure you want to reject this match?')) {
      return;
    }

    try {
      const response = await fetch('/api/mentor/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          match_id: matchId,
          mentor_response: reason || undefined,
          mentor_email: email || undefined,
          mentor_phone: phone || undefined,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject match');
      }

      // Refresh matches
      await fetchMatches();
      alert('✅ Match rejected.');
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
      console.error('Error rejecting match:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && !email && !phone) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold mb-4">👥 Mentor Dashboard</h1>
            <p className="text-slate-600 mb-6">
              Enter your email or phone number to view your matched ideas
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mentor@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212612345678"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                onClick={fetchMatches}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Matches
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your matches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">❌ {error}</p>
            <button
              onClick={() => {
                setEmail('');
                setPhone('');
                setError(null);
              }}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            👥 Mentor Dashboard
          </h1>
          {mentor && (
            <p className="text-slate-600">
              Welcome, <strong>{mentor.name}</strong> ({mentor.email})
            </p>
          )}
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Active ({matches.filter(m => m.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'accepted'
                ? 'bg-green-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Lightbulb className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">
              No {statusFilter} matches found
            </p>
            <p className="text-slate-500 text-sm mt-2">
              New matches will appear here when ideas are matched with your expertise.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Idea Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-slate-900">
                          {match.idea.title || 'Untitled Idea'}
                        </h2>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {match.idea.category || 'other'}
                        </span>
                      </div>
                      <p className="text-slate-700 mb-2">{match.idea.problem_statement}</p>
                      {match.idea.proposed_solution && (
                        <p className="text-slate-600 text-sm">
                          <strong>Solution:</strong> {match.idea.proposed_solution}
                        </p>
                      )}
                    </div>
                    {match.match_score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {(match.match_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-slate-500">Match Score</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Details */}
                <div className="p-6">
                  {match.match_reason && (
                    <div className="mb-4 p-3 bg-slate-50 rounded text-sm text-slate-700">
                      <strong>Why you were matched:</strong> {match.match_reason}
                    </div>
                  )}

                  {/* Idea Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {match.idea.ai_feasibility_score !== null && (
                      <div className="p-3 bg-green-50 rounded">
                        <div className="text-sm text-slate-600">Feasibility</div>
                        <div className="text-lg font-bold text-green-700">
                          {(match.idea.ai_feasibility_score * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                    {match.idea.ai_impact_score !== null && (
                      <div className="p-3 bg-blue-50 rounded">
                        <div className="text-sm text-slate-600">Impact</div>
                        <div className="text-lg font-bold text-blue-700">
                          {(match.idea.ai_impact_score * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                    {match.idea.roi_cost_saved_eur !== null && (
                      <div className="p-3 bg-purple-50 rounded">
                        <div className="text-sm text-slate-600">ROI (Monthly)</div>
                        <div className="text-lg font-bold text-purple-700">
                          €{match.idea.roi_cost_saved_eur.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {match.idea.location && (
                      <div className="p-3 bg-orange-50 rounded">
                        <div className="text-sm text-slate-600">Location</div>
                        <div className="text-lg font-bold text-orange-700 capitalize">
                          {match.idea.location}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Info */}
                  {match.status === 'accepted' && match.mentor_responded_at && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2 text-green-800">
                        <Check className="w-5 h-5" />
                        <div>
                          <strong>Accepted</strong> on {formatDate(match.mentor_responded_at)}
                        </div>
                      </div>
                    </div>
                  )}

                  {match.status === 'rejected' && match.mentor_responded_at && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-2 text-red-800">
                        <X className="w-5 h-5" />
                        <div>
                          <strong>Rejected</strong> on {formatDate(match.mentor_responded_at)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {match.status === 'active' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push(`/idea/${match.idea.id}/dashboard?email=${email || phone}`)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Full Details
                      </button>
                      <button
                        onClick={() => handleAccept(match.id)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(match.id)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

