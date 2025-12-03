/**
 * Founders List Page
 * 
 * Simple list showing:
 * - Founder name
 * - City
 * - Idea count
 * - Link to founder letter/ideas
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserIcon, MapPinIcon, SparklesIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Founder {
  name: string;
  city?: string;
  email?: string;
  ideaCount: number;
  identifier: string;
}

export default function FoundersPage() {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFounders = async () => {
      try {
        const response = await fetch('/api/founders/list');
        if (response.ok) {
          const data = await response.json();
          setFounders(data.founders || []);
        }
      } catch (error) {
        console.error('Error fetching founders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFounders();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Fondateurs
          </h1>
          <p className="text-slate-600">
            {founders.length} {founders.length === 1 ? 'fondateur' : 'fondateurs'}
          </p>
        </div>

        {/* Founders List */}
        {founders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <UserIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Aucun fondateur pour le moment
            </h2>
            <p className="text-slate-600">
              Les fondateurs apparaîtront ici lorsqu'ils créeront ou récupéreront des idées.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-200">
              {founders.map((founder, index) => (
                <div
                  key={founder.identifier}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Name, City, Idea Count */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {founder.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">
                            {founder.name}
                          </h3>
                          {founder.city && (
                            <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                              <MapPinIcon className="w-4 h-4" />
                              <span>{founder.city}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Idea Count */}
                      <div className="flex items-center gap-2 text-sm text-slate-600 ml-13">
                        <SparklesIcon className="w-4 h-4" />
                        <span>
                          {founder.ideaCount} {founder.ideaCount === 1 ? 'idée' : 'idées'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Link to Founder Ideas and Letter */}
                    <div className="flex-shrink-0 flex gap-2">
                      <Link
                        href={`/founder/${encodeURIComponent(founder.identifier)}/ideas`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>Idées & Message</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
