/**
 * Mentor Matching Component
 * 
 * Match mentors to ideas
 */

'use client';

import { useState, useEffect } from 'react';

interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  email: string;
  ideas_matched: number;
  success_rate: number;
}

interface Idea {
  id: string;
  title: string;
  category: string;
  needs_mentor: boolean;
}

export function MentorMatching() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    fetchMentors();
    fetchIdeas();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/admin/mentors');
      const data = await response.json();
      setMentors(data.mentors || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/admin/ideas?needsMentor=true');
      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const handleMatch = async () => {
    if (!selectedIdea || !selectedMentor) return;

    try {
      await fetch('/api/admin/mentors/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: selectedIdea.id,
          mentorId: selectedMentor.id,
        }),
      });
      alert('Mentor matched successfully!');
      fetchIdeas();
      setSelectedIdea(null);
      setSelectedMentor(null);
    } catch (error) {
      console.error('Error matching mentor:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Mentor Matching</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ideas Needing Mentors */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Ideas Needing Mentors ({ideas.filter((i) => i.needs_mentor).length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {ideas
              .filter((i) => i.needs_mentor)
              .map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => setSelectedIdea(idea)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedIdea?.id === idea.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-slate-900">{idea.title}</div>
                  <div className="text-sm text-slate-600 capitalize">{idea.category}</div>
                </button>
              ))}
          </div>
        </div>

        {/* Available Mentors */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Available Mentors ({mentors.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {mentors.map((mentor) => (
              <button
                key={mentor.id}
                onClick={() => setSelectedMentor(mentor)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedMentor?.id === mentor.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-medium text-slate-900">{mentor.name}</div>
                <div className="text-sm text-slate-600">{mentor.expertise.join(', ')}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {mentor.ideas_matched} matched • {mentor.success_rate}% success
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Match Action */}
      {selectedIdea && selectedMentor && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-900 mb-1">Ready to Match</div>
              <div className="text-sm text-slate-600">
                {selectedIdea.title} ↔ {selectedMentor.name}
              </div>
            </div>
            <button
              onClick={handleMatch}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Create Match
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

