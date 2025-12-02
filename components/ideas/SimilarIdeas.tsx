/**
 * Similar Ideas Component
 * 
 * Displays ideas similar to the current idea using vector embeddings
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface SimilarIdea {
  id: string;
  title: string;
  problem_statement: string;
  proposed_solution?: string;
  similarity: number;
}

interface SimilarIdeasProps {
  ideaId: string;
  limit?: number;
  threshold?: number;
}

export function SimilarIdeas({ ideaId, limit = 5, threshold = 0.6 }: SimilarIdeasProps) {
  const [similarIdeas, setSimilarIdeas] = useState<SimilarIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ideaId) return;

    const fetchSimilarIdeas = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/ideas/${ideaId}/similar?limit=${limit}&threshold=${threshold}`
        );

        if (!response.ok) {
          const data = await response.json();
          // If idea doesn't have embedding, that's okay - just show empty
          if (response.status === 400 && data.error?.includes('embedding')) {
            setSimilarIdeas([]);
            setIsLoading(false);
            return;
          }
          throw new Error(data.error || 'Failed to fetch similar ideas');
        }

        const data = await response.json();
        setSimilarIdeas(data.items || []);
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching similar ideas:', err);
        }
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarIdeas();
  }, [ideaId, limit, threshold]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-500 text-center py-4">
          <div className="inline-flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 animate-pulse" />
            <span>Finding similar ideas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        Unable to load similar ideas
      </div>
    );
  }

  if (similarIdeas.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No similar ideas found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {similarIdeas.map((similar) => (
        <Link
          key={similar.id}
          href={`/ideas/${similar.id}`}
          className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                {similar.title}
              </h4>
              {similar.problem_statement && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {similar.problem_statement}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                {Math.round(similar.similarity * 100)}%
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

