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
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.problem.description.substring(0, 100),
          problem_statement: idea.problem.description,
          category: idea.category || 'autre',
          location: idea.location || 'autre',
          status: 'submitted',
          submitted_via: 'voice_guided',
          current_manual_process: '',
          digitization_opportunity: '',
          proposed_solution: idea.solution?.description || '',
          roi_time_saved_hours: 0,
          roi_cost_saved_eur: 0,
          estimated_cost: '',
          data_sources: [],
          integration_points: [],
          ai_capabilities_needed: [],
          alignment: {
            morocco_priorities: [],
            other_alignment: ''
          },
          submitter_name: '',
          submitter_email: '',
          submitter_phone: null,
          submitter_type: 'entrepreneur',
          submitter_skills: []
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission');
      }

      const result = await response.json();
      router.push(`/ideas/${result.id}?submitted=true&voice=true`);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Erreur lors de la soumission. Veuillez réessayer.');
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

