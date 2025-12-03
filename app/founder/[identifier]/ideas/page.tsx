/**
 * Founder's Ideas Page
 * 
 * Shows all ideas associated with a founder:
 * - Ideas they created
 * - Ideas they claimed
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SparklesIcon, PlusIcon, PencilIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Idea {
  id: string;
  title: string;
  problem_statement: string;
  category: string;
  location: string;
  created_at: string;
  visible: boolean;
  source: 'created' | 'claimed';
}

export default function FounderIdeasPage() {
  const params = useParams();
  const router = useRouter();
  const [founder, setFounder] = useState<any>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [founderLetter, setFounderLetter] = useState<string | null>(null);
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [editedLetter, setEditedLetter] = useState('');
  const [isSavingLetter, setIsSavingLetter] = useState(false);

  useEffect(() => {
    const fetchFounderData = async () => {
      try {
        const identifier = params.identifier as string;
        
        // Fetch ideas
        const ideasResponse = await fetch(`/api/founder/${encodeURIComponent(identifier)}/ideas`);
        if (ideasResponse.ok) {
          const ideasData = await ideasResponse.json();
          setFounder(ideasData.founder);
          setIdeas(ideasData.ideas || []);
        }

        // Fetch founder letter
        const letterResponse = await fetch(`/api/founder/${encodeURIComponent(identifier)}/letter`);
        if (letterResponse.ok) {
          const letterData = await letterResponse.json();
          setFounderLetter(letterData.letter);
          setEditedLetter(letterData.letter || '');
          if (!founder) {
            setFounder(letterData.founder);
          }
        }
      } catch (error) {
        console.error('Error fetching founder data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.identifier) {
      fetchFounderData();
    }
  }, [params.identifier]);

  const handleSaveLetter = async () => {
    if (!editedLetter.trim()) {
      alert('La lettre ne peut pas être vide');
      return;
    }

    setIsSavingLetter(true);
    try {
      const identifier = params.identifier as string;
      const response = await fetch(`/api/founder/${encodeURIComponent(identifier)}/letter`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letter: editedLetter,
          city: founder?.city,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFounderLetter(data.letter);
        setIsEditingLetter(false);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || 'Impossible de sauvegarder la lettre'}`);
      }
    } catch (error) {
      console.error('Error saving letter:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSavingLetter(false);
    }
  };

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

  const decodedIdentifier = decodeURIComponent(params.identifier as string);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            ← Retour
          </button>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {founder?.name || decodedIdentifier}
          </h1>
          {founder?.city && (
            <p className="text-slate-600 mb-2">📍 {founder.city}</p>
          )}
          <p className="text-slate-600">
            {founder?.ideaCount || ideas.length} {ideas.length === 1 ? 'idée' : 'idées'}
          </p>
        </div>

        {/* Founder Letter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
              Lettre du Fondateur
            </h2>
            {!isEditingLetter && (
              <button
                onClick={() => setIsEditingLetter(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                {founderLetter ? 'Modifier' : 'Ajouter une lettre'}
              </button>
            )}
          </div>

          {isEditingLetter ? (
            <div className="space-y-4">
              <textarea
                value={editedLetter}
                onChange={(e) => setEditedLetter(e.target.value)}
                placeholder="Écrivez votre lettre de présentation (PR/pitch letter) qui construit la confiance, l'authenticité, la compétence et la cohérence pour les mentors et investisseurs..."
                rows={12}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y text-slate-700"
              />
              <p className="text-xs text-slate-500">
                💡 Cette lettre aide les mentors et investisseurs à comprendre votre parcours, votre vision et votre engagement. Soyez authentique et montrez votre passion.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveLetter}
                  disabled={isSavingLetter || !editedLetter.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSavingLetter ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => {
                    setIsEditingLetter(false);
                    setEditedLetter(founderLetter || '');
                  }}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div>
              {founderLetter ? (
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {founderLetter}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                  <DocumentTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Aucune lettre pour le moment</p>
                  <p className="text-sm text-slate-500 mb-4">
                    Ajoutez une lettre de présentation pour construire la confiance avec les mentors et investisseurs
                  </p>
                  <button
                    onClick={() => setIsEditingLetter(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Ajouter une lettre
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create New Idea Button */}
        <div className="mb-6">
          <Link
            href="/submit-voice"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Créer une nouvelle idée</span>
          </Link>
        </div>

        {/* Ideas List */}
        {ideas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <SparklesIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Aucune idée pour le moment
            </h2>
            <p className="text-slate-600 mb-6">
              Commencez par créer votre première idée ou récupérez une idée existante.
            </p>
            <Link
              href="/ideas"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <span>Explorer les idées</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-slate-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    idea.source === 'created'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {idea.source === 'created' ? 'Créée' : 'Récupérée'}
                  </span>
                  {!idea.visible && (
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                      Privée
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                  {idea.title}
                </h3>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {idea.problem_statement}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{idea.category}</span>
                  <span>•</span>
                  <span>{idea.location}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

