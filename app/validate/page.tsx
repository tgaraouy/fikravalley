'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type ConversationIdeaRow = Database['public']['Tables']['marrai_conversation_ideas']['Row'];

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 rounded animate-pulse" />
        <div className="h-32 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

function SuccessScreen({ onViewIdeas }: { onViewIdeas: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="border-emerald-200 bg-white/95 shadow-xl max-w-md w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-white mb-6 text-6xl">
            ✓
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900 mb-4">Merci !</CardTitle>
          <CardDescription className="text-lg text-slate-600 mb-8">
            Votre validation a été enregistrée avec succès.
          </CardDescription>
          <Button onClick={onViewIdeas} size="lg" className="w-full">
            Voir toutes les idées
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ValidateIdeaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ideaId = searchParams.get('idea');

  const [idea, setIdea] = useState<ConversationIdeaRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchIdea() {
      if (!ideaId) {
        setError('ID d\'idée manquant');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('marrai_conversation_ideas')
          .select('*')
          .eq('id', ideaId)
          .single();

        if (fetchError || !data) {
          setError('Idée non trouvée');
          setIsLoading(false);
          return;
        }

        setIdea(data);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Erreur lors du chargement de l\'idée');
      } finally {
        setIsLoading(false);
      }
    }

    fetchIdea();
  }, [ideaId]);

  const handleValidation = async (status: 'speaker_validated' | 'needs_refinement' | 'speaker_rejected') => {
    if (!idea) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'speaker_validated') {
        updateData.validated_at = new Date().toISOString();
        updateData.validation_notes = notes || null;
        updateData.validation_method = 'qr_scan';
      } else if (status === 'needs_refinement') {
        updateData.refinement_notes = notes || null;
      } else if (status === 'speaker_rejected') {
        updateData.validation_notes = notes || null;
      }

      const { error: updateError } = await supabase
        .from('marrai_conversation_ideas')
        .update(updateData)
        .eq('id', idea.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // If validated, trigger promotion to main ideas table
      if (status === 'speaker_validated') {
        try {
          await fetch('/api/promote-idea', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation_idea_id: idea.id }),
          });
        } catch (promoteError) {
          console.error('Erreur lors de la promotion:', promoteError);
          // Don't fail the validation if promotion fails
        }
      }

      setShowSuccess(true);
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation');
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return <SuccessScreen onViewIdeas={() => router.push('/ideas')} />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="border-red-200 bg-red-50 max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-white mb-6 text-6xl">
              ✕
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 mb-4">Erreur</CardTitle>
            <CardDescription className="text-base text-slate-600 mb-8">
              {error || 'Idée non trouvée'}
            </CardDescription>
            <Button onClick={() => router.push('/ideas')} variant="secondary" size="lg" className="w-full">
              Retour aux idées
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 pb-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Validation d&apos;Idée</h1>
          <p className="text-lg text-slate-600">
            Confirmez ou corrigez l&apos;idée capturée lors de votre discussion
          </p>
        </div>

        {/* What We Captured Section */}
        <Card className="border-white/80 bg-white/95 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Ce que nous avons capté de votre discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {idea.speaker_quote && (
              <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-4">
                <p className="text-sm font-semibold text-indigo-900 mb-2">Votre citation</p>
                <p className="text-base italic text-indigo-800">&quot;{idea.speaker_quote}&quot;</p>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">{idea.problem_title}</h2>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Description du problème</p>
              <p className="text-base text-slate-700 leading-relaxed">{idea.problem_statement}</p>
            </div>

            {idea.proposed_solution && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Solution proposée</p>
                <p className="text-base text-slate-700 leading-relaxed">{idea.proposed_solution}</p>
              </div>
            )}

            {idea.digitization_opportunity && (
              <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-900 mb-2">
                  Opportunité de Numérisation
                </p>
                <p className="text-base text-emerald-800 leading-relaxed">
                  {idea.digitization_opportunity}
                </p>
              </div>
            )}

            {idea.validation_question && (
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900 mb-2">Question de clarification</p>
                <p className="text-base text-amber-800">{idea.validation_question}</p>
              </div>
            )}

            {idea.speaker_context && (
              <div className="text-sm text-slate-500">
                <p>
                  <strong>Locuteur:</strong> {idea.speaker_context}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card className="border-white/80 bg-white/95 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Commentaires</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="notes">Commentaires ou précisions (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez des détails, corrections ou précisions sur cette idée..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">
                <strong>Erreur:</strong> {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => handleValidation('speaker_validated')}
            disabled={isSubmitting}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-lg"
          >
            ✅ Oui, c&apos;est correct - Valider
          </Button>

          <Button
            onClick={() => handleValidation('needs_refinement')}
            disabled={isSubmitting}
            variant="secondary"
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border-0 shadow-lg"
          >
            ✏️ Besoin de clarification
          </Button>

          <Button
            onClick={() => handleValidation('speaker_rejected')}
            disabled={isSubmitting}
            variant="ghost"
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white border-0 shadow-lg"
          >
            ❌ Non, ce n&apos;est pas ça
          </Button>
        </div>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="border-white/80 bg-white/95 max-w-sm w-full mx-4">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-lg font-semibold text-slate-900">Enregistrement en cours...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

