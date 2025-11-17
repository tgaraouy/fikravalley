/**
 * Idea Management Component
 * 
 * Table of all ideas with filters and bulk actions
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Idea {
  id: string;
  title: string;
  submitter_name: string;
  location: string;
  category: string;
  stage1_total?: number;
  stage2_total?: number;
  total_score?: number;
  qualification_tier?: 'exceptional' | 'qualified' | 'developing' | 'pending';
  receipt_count?: number;
  upvote_count?: number;
  funding_status?: string;
  created_at: string;
  status?: string;
}

export function IdeaManagement() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    status: '',
    scoreMin: '',
    scoreMax: '',
    category: '',
    qualificationTier: '',
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchIdeas();
  }, [filters, search]);

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
        search,
      });
      const response = await fetch(`/api/admin/ideas?${params}`);
      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) return;

    try {
      await fetch('/api/admin/ideas/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ideaIds: Array.from(selectedIds),
        }),
      });
      setSelectedIds(new Set());
      fetchIdeas();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === ideas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ideas.map((i) => i.id)));
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-800';
    if (score >= 30) return 'bg-yellow-100 text-yellow-800';
    if (score >= 25) return 'bg-green-100 text-green-800';
    if (score >= 20) return 'bg-blue-100 text-blue-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Idea Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulkAction('approve')}
            disabled={selectedIds.size === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Approve Selected
          </button>
          <button
            onClick={() => handleBulkAction('reject')}
            disabled={selectedIds.size === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Reject Selected
          </button>
          <button
            onClick={() => handleBulkAction('flag')}
            disabled={selectedIds.size === 0}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Flag Selected
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
          <select
            value={filters.qualificationTier}
            onChange={(e) => setFilters({ ...filters, qualificationTier: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          >
            <option value="">All Tiers</option>
            <option value="exceptional">Exceptional</option>
            <option value="qualified">Qualified</option>
            <option value="developing">Developing</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          >
            <option value="">All Categories</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="agriculture">Agriculture</option>
            <option value="tech">Tech</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="administration">Administration</option>
          </select>
          <button
            onClick={() => {
              setFilters({
                status: '',
                scoreMin: '',
                scoreMax: '',
                category: '',
                qualificationTier: '',
              });
              setSearch('');
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === ideas.length && ideas.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Submitter</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Tier</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Loading ideas...
                  </td>
                </tr>
              ) : ideas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No ideas found
                  </td>
                </tr>
              ) : (
                ideas.map((idea) => (
                  <tr key={idea.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(idea.id)}
                        onChange={() => toggleSelect(idea.id)}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/ideas/${idea.id}`}
                        className="font-medium text-slate-900 hover:text-green-600"
                      >
                        {idea.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {idea.submitter_name || 'Anonymous'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(
                          idea.total_score || idea.stage2_total
                        )}`}
                      >
                        {idea.total_score || idea.stage2_total || 0}/40
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">
                      {idea.qualification_tier || 'pending'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">
                      {idea.category}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                        {idea.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/ideas/${idea.id}/edit`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={async () => {
                            await fetch(`/api/admin/ideas/${idea.id}/score`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'override' }),
                            });
                            fetchIdeas();
                          }}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Score
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2">
        <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
          Previous
        </button>
        <span className="px-4 py-2 text-slate-600">Page 1 of 1</span>
        <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
          Next
        </button>
      </div>
    </div>
  );
}

