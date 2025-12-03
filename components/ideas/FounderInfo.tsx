/**
 * Founder Info Component
 * 
 * Displays founder information for an idea:
 * - Original submitter (if idea was created by founder)
 * - Claimer (if idea was picked up by founder)
 * - Links to founder's other ideas
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface FounderInfoProps {
  ideaId: string;
  submitterName?: string;
  submitterEmail?: string;
}

interface FounderData {
  name: string;
  email?: string;
  type: 'submitter' | 'claimer';
  ideaCount?: number;
}

export default function FounderInfo({ ideaId, submitterName, submitterEmail }: FounderInfoProps) {
  const [founder, setFounder] = useState<FounderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFounderInfo = async () => {
      try {
        // Check if there's a claimer (founder who picked up the idea)
        const claimResponse = await fetch(`/api/ideas/${ideaId}/founder`);
        if (claimResponse.ok) {
          const data = await claimResponse.json();
          if (data.founder) {
            setFounder({
              name: data.founder.name,
              email: data.founder.email,
              type: data.founder.type,
              ideaCount: data.founder.ideaCount,
            });
            setIsLoading(false);
            return;
          }
        }

        // Fallback to submitter (original creator)
        if (submitterName) {
          setFounder({
            name: submitterName,
            email: submitterEmail,
            type: 'submitter',
          });
        }
      } catch (error) {
        console.error('Error fetching founder info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (ideaId) {
      fetchFounderInfo();
    }
  }, [ideaId, submitterName, submitterEmail]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-16 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  if (!founder) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
            {founder.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-slate-900">
              {founder.type === 'submitter' ? 'Créateur' : 'Fondateur'}
            </h3>
            {founder.type === 'claimer' && (
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                A pris en charge
              </span>
            )}
          </div>
          
          <p className="text-slate-700 font-medium mb-2">{founder.name}</p>
          
          {founder.email && (
            <p className="text-sm text-slate-500 mb-3">{founder.email}</p>
          )}

          {/* Link to founder's ideas */}
          <Link
            href={`/founder/${encodeURIComponent(founder.email || founder.name)}/ideas`}
            className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>
              {founder.ideaCount !== undefined 
                ? `Voir ${founder.ideaCount} ${founder.ideaCount === 1 ? 'idée' : 'idées'}`
                : 'Voir les idées de ce fondateur'}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

