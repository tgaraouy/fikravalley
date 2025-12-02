'use client';

import { useState } from 'react';
import { SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ProblemSharpnessAnalysis {
  score: number;
  isVague: boolean;
  identifiedFriction: string | null;
  targetPersona: string | null;
  specificJob: string | null;
  painPoint: string | null;
  suggestions: string[];
  sharpenedProblem: string | null;
}

interface ProblemSharpnessProps {
  ideaId: string;
  currentProblem: string;
  onProblemUpdated?: (newProblem: string) => void;
}

export function ProblemSharpness({ ideaId, currentProblem, onProblemUpdated }: ProblemSharpnessProps) {
  const [analysis, setAnalysis] = useState<ProblemSharpnessAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProblem, setEditedProblem] = useState(currentProblem);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProblem = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/problem-sharpness`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to analyze problem');
      }

      const data = await response.json();
      
      if (!data.analysis) {
        throw new Error('Invalid response from server');
      }
      
      setAnalysis(data.analysis);
      setError(null); // Clear any previous errors
      
      // If sharpened problem is available, pre-fill edit field
      if (data.analysis.sharpenedProblem) {
        setEditedProblem(data.analysis.sharpenedProblem);
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error analyzing problem sharpness:', err);
      }
      setError(err.message || 'Erreur lors de l\'analyse. Veuillez réessayer.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveProblem = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_statement: editedProblem,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save problem');
      }

      setIsEditing(false);
      if (onProblemUpdated) {
        onProblemUpdated(editedProblem);
      }
      
      // Re-analyze after update
      await analyzeProblem();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4) return 'Net';
    if (score >= 3) return 'Acceptable';
    return 'Vague';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Netteté du Problème</h2>
        </div>
        <button
          onClick={analyzeProblem}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Analyse en cours...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Analyser la Netteté
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Analysez votre problème pour vérifier sa netteté selon le framework pré-seed.
          </p>
          <p className="text-sm text-gray-500">
            Un problème net identifie: qui a le problème, quelle friction exacte, et pourquoi c'est douloureux maintenant.
          </p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Score Display */}
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}/5
            </div>
            <div>
              <div className={`text-lg font-semibold ${getScoreColor(analysis.score)}`}>
                {getScoreLabel(analysis.score)}
              </div>
              <div className="text-sm text-gray-500">
                {analysis.isVague ? 'Problème trop vague' : 'Problème bien défini'}
              </div>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.targetPersona && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">👤 Persona Cible</h3>
                <p className="text-sm text-blue-800">{analysis.targetPersona}</p>
              </div>
            )}

            {analysis.identifiedFriction && (
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">⚡ Friction Identifiée</h3>
                <p className="text-sm text-orange-800">{analysis.identifiedFriction}</p>
              </div>
            )}

            {analysis.specificJob && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">🎯 Tâche Spécifique</h3>
                <p className="text-sm text-green-800">{analysis.specificJob}</p>
              </div>
            )}

            {analysis.painPoint && (
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">💔 Point de Douleur</h3>
                <p className="text-sm text-red-800">{analysis.painPoint}</p>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                Suggestions d'amélioration
              </h3>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Edit Problem Statement */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Énoncé du Problème</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  ✏️ Modifier
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editedProblem}
                  onChange={(e) => setEditedProblem(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Décrivez le problème de manière spécifique..."
                />
                {analysis.sharpenedProblem && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-purple-900 mb-1">
                      💡 Version affinée suggérée:
                    </p>
                    <p className="text-sm text-purple-800">{analysis.sharpenedProblem}</p>
                    <button
                      onClick={() => setEditedProblem(analysis.sharpenedProblem || editedProblem)}
                      className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Utiliser cette version →
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={saveProblem}
                    disabled={isSaving}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProblem(currentProblem);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{currentProblem}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

