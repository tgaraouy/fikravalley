/**
 * Admin Dashboard: Mentor Matches Review
 * 
 * Stage 6: Admin reviews and approves/rejects mentor matches
 * 
 * Features:
 * - View pending matches grouped by idea
 * - See top 3 matches per idea (sorted by match_score)
 * - Approve/reject individual or bulk matches
 * - View idea and mentor details
 */

'use client';

import { useState, useEffect } from 'react';
import { Check, X, Users, Lightbulb, TrendingUp, MapPin, Building2 } from 'lucide-react';

interface MentorMatch {
  id: string;
  match_score: number | null;
  match_reason: string | null;
  status: string;
  idea: {
    id: string;
    title: string;
    problem_statement: string;
    proposed_solution: string | null;
    category: string | null;
    location: string | null;
    status: string;
  };
  mentor: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    location: string | null;
    moroccan_city: string | null;
    expertise: string[] | null;
    skills: string[] | null;
    years_experience: number | null;
    company: string | null;
    willing_to_mentor: boolean | null;
    willing_to_cofund: boolean | null;
    ideas_matched: number | null;
    ideas_funded: number | null;
  };
}

interface IdeaGroup {
  idea: MentorMatch['idea'];
  matches: MentorMatch[];
}

export default function AdminMentorMatchesPage() {
  const [ideaGroups, setIdeaGroups] = useState<IdeaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'active' | 'rejected'>('pending');

  useEffect(() => {
    fetchMatches();
  }, [statusFilter]);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/mentor-matches?status=${statusFilter}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch matches');
      }
      
      setIdeaGroups(data.matches || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load mentor matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (matchIds: string[], ideaId: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/mentor-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          match_ids: matchIds,
          idea_id: ideaId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve matches');
      }

      // Refresh matches
      await fetchMatches();
      setSelectedMatches(new Set());
      
      alert(`✅ Approved ${data.updated} match(es)`);
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
      console.error('Error approving matches:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (matchIds: string[]) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/mentor-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          match_ids: matchIds,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject matches');
      }

      // Refresh matches
      await fetchMatches();
      setSelectedMatches(new Set());
      
      alert(`✅ Rejected ${data.updated} match(es)`);
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
      console.error('Error rejecting matches:', err);
    } finally {
      setProcessing(false);
    }
  };

  const toggleMatchSelection = (matchId: string) => {
    const newSelected = new Set(selectedMatches);
    if (newSelected.has(matchId)) {
      newSelected.delete(matchId);
    } else {
      newSelected.add(matchId);
    }
    setSelectedMatches(newSelected);
  };

  const getMatchScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchScoreLabel = (score: number | null) => {
    if (!score) return 'N/A';
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    return 'Fair';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading mentor matches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">❌ {error}</p>
            <button
              onClick={fetchMatches}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            👥 Mentor Matches Review
          </h1>
          <p className="text-slate-600">
            Review and approve/reject mentor matches for ideas
          </p>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Pending ({ideaGroups.reduce((sum, g) => sum + g.matches.length, 0)})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Active
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

        {/* Bulk Actions */}
        {selectedMatches.size > 0 && statusFilter === 'pending' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <p className="text-blue-800 font-medium">
              {selectedMatches.size} match(es) selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const firstIdeaId = ideaGroups.find(g => 
                    g.matches.some(m => selectedMatches.has(m.id))
                  )?.idea.id;
                  if (firstIdeaId) {
                    handleApprove(Array.from(selectedMatches), firstIdeaId);
                  }
                }}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Approve Selected
              </button>
              <button
                onClick={() => handleReject(Array.from(selectedMatches))}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reject Selected
              </button>
            </div>
          </div>
        )}

        {/* Idea Groups */}
        {ideaGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">
              No {statusFilter} matches found
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {ideaGroups.map((group) => (
              <div key={group.idea.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Idea Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-slate-900">
                          {group.idea.title || 'Untitled Idea'}
                        </h2>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {group.idea.category || 'other'}
                        </span>
                      </div>
                      <p className="text-slate-700 mb-2">{group.idea.problem_statement}</p>
                      {group.idea.proposed_solution && (
                        <p className="text-slate-600 text-sm">
                          <strong>Solution:</strong> {group.idea.proposed_solution}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                        {group.idea.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {group.idea.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {group.matches.length} match(es)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Matches List */}
                <div className="p-6">
                  <div className="space-y-4">
                    {group.matches.map((match) => (
                      <div
                        key={match.id}
                        className={`border rounded-lg p-4 ${
                          selectedMatches.has(match.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          {statusFilter === 'pending' && (
                            <input
                              type="checkbox"
                              checked={selectedMatches.has(match.id)}
                              onChange={() => toggleMatchSelection(match.id)}
                              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                          )}

                          {/* Mentor Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-slate-900 text-lg">
                                  {match.mentor.name}
                                </h3>
                                {match.mentor.company && (
                                  <div className="flex items-center gap-1 text-slate-600 text-sm mt-1">
                                    <Building2 className="w-4 h-4" />
                                    {match.mentor.company}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${getMatchScoreColor(match.match_score)}`}>
                                  {match.match_score ? (match.match_score * 100).toFixed(0) : 'N/A'}%
                                </div>
                                <div className="text-xs text-slate-500">
                                  {getMatchScoreLabel(match.match_score)}
                                </div>
                              </div>
                            </div>

                            {/* Match Details */}
                            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                              <div>
                                <p className="text-slate-600">
                                  <strong>Location:</strong> {match.mentor.location || 'N/A'}
                                </p>
                                {match.mentor.moroccan_city && (
                                  <p className="text-slate-600">
                                    <strong>Moroccan City:</strong> {match.mentor.moroccan_city}
                                  </p>
                                )}
                                {match.mentor.years_experience && (
                                  <p className="text-slate-600">
                                    <strong>Experience:</strong> {match.mentor.years_experience} years
                                  </p>
                                )}
                              </div>
                              <div>
                                {match.mentor.expertise && match.mentor.expertise.length > 0 && (
                                  <p className="text-slate-600 mb-1">
                                    <strong>Expertise:</strong>
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {match.mentor.expertise?.slice(0, 5).map((exp, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                                    >
                                      {exp}
                                    </span>
                                  ))}
                                </div>
                                {match.mentor.ideas_matched !== null && (
                                  <p className="text-slate-600 text-xs">
                                    Matched: {match.mentor.ideas_matched} | Funded: {match.mentor.ideas_funded || 0}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Match Reason */}
                            {match.match_reason && (
                              <div className="mt-3 p-3 bg-slate-50 rounded text-sm text-slate-700">
                                <strong>Why matched:</strong> {match.match_reason}
                              </div>
                            )}

                            {/* Contact Info */}
                            <div className="mt-3 text-xs text-slate-500">
                              <p>Email: {match.mentor.email}</p>
                              {match.mentor.phone && <p>Phone: {match.mentor.phone}</p>}
                            </div>
                          </div>

                          {/* Actions */}
                          {statusFilter === 'pending' && (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleApprove([match.id], group.idea.id)}
                                disabled={processing}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                              >
                                <Check className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject([match.id])}
                                disabled={processing}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 text-sm"
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

                  {/* Bulk Actions for This Idea */}
                  {statusFilter === 'pending' && group.matches.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
                      <button
                        onClick={() => {
                          const allMatchIds = group.matches.map(m => m.id);
                          handleApprove(allMatchIds, group.idea.id);
                        }}
                        disabled={processing}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Approve All ({group.matches.length})
                      </button>
                      <button
                        onClick={() => {
                          const allMatchIds = group.matches.map(m => m.id);
                          handleReject(allMatchIds);
                        }}
                        disabled={processing}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject All
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

