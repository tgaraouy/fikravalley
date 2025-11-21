/**
 * Voice-Guided Submission Page
 * 
 * New submission experience:
 * - User speaks OR writes
 * - All 7 agents listen and guide in real-time
 * - Conversational, not form-based
 * - Single page, no steps
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VoiceGuidedSubmission from '@/components/submission/VoiceGuidedSubmission';

export default function VoiceSubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (idea: any) => {
    console.log('Submitting idea:', idea);
    setIsSubmitting(true);

    try {
      // Extract the description from the idea object
      const description = idea.problem?.description || idea.description || '';
      
      if (!description || description.length < 20) {
        alert('⚠️ Écris au moins 20 caractères avant de soumettre!');
        setIsSubmitting(false);
        return;
      }

      // Generate a title from the first sentence or first 100 chars
      const title = description.split('.')[0].substring(0, 100) || description.substring(0, 100);

      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          problem_statement: description,
          category: idea.category || 'autre',
          location: idea.location || 'autre',
          status: 'submitted',
          submitted_via: 'voice_guided',
          current_manual_process: 'Non spécifié (Soumission Vocale)',
          digitization_opportunity: 'À analyser',
          proposed_solution: idea.solution?.description || 'À développer',
          roi_time_saved_hours: 0,
          roi_cost_saved_eur: 0,
          estimated_cost: 'Non estimé',
          data_sources: [],
          integration_points: [],
          ai_capabilities_needed: [],
          alignment: {
            morocco_priorities: [],
            other_alignment: ''
          },
          submitter_name: 'Utilisateur Vocal',
          submitter_email: 'vocal@fikravalley.com',
          submitter_phone: null,
          submitter_type: 'entrepreneur',
          submitter_skills: []
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la soumission');
      }

      const result = await response.json();
      console.log('Submission successful:', result);
      
      // Redirect to the idea page
      router.push(`/ideas/${result.id}?submitted=true&voice=true`);
    } catch (error: any) {
      console.error('Error submitting:', error);
      alert(`❌ Erreur: ${error.message}\n\nVérifie que tu as rempli tous les champs requis (Catégorie, Ville, Texte).`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = (idea: any) => {
    localStorage.setItem('voice_submission_draft', JSON.stringify({
      ...idea,
      savedAt: new Date().toISOString()
    }));
    alert('💾 Brouillon sauvegardé!');
  };

  return (
    <VoiceGuidedSubmission
      onSubmit={handleSubmit}
      onSaveDraft={handleSaveDraft}
    />
  );
}

