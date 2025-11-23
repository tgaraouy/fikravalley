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
import SimpleVoiceSubmit from '@/components/submission/SimpleVoiceSubmit';

export default function VoiceSubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useSimple, setUseSimple] = useState(true); // Toggle to simple mode

  const handleSimpleSubmit = async (transcript: string, contactInfo: { email?: string; phone?: string; name?: string }) => {
    // Simple submit with contact info
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: transcript.split('.')[0].substring(0, 100),
          problem_statement: transcript,
          category: 'autre', // Auto-detect later
          location: 'autre', // Auto-detect later
          frequency: 'À préciser',
          submitter_name: contactInfo.name || 'Utilisateur Vocal',
          submitter_email: contactInfo.email || null,
          submitter_phone: contactInfo.phone || null,
          submitter_type: 'entrepreneur',
          submitted_via: 'voice',
          current_manual_process: 'Soumission vocale',
          digitization_opportunity: 'À analyser',
          proposed_solution: 'À développer'
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Get idea number from tracking code or use sequential number
        const ideaNumber = result.idea_number || 128; // This should come from API
        
        // Redirect to success page with tracking code and idea number
        router.push(`/idea-submitted?tracking_code=${result.tracking_code}&email=${contactInfo.email || ''}&idea_number=${ideaNumber}`);
      } else {
        const error = await response.json().catch(() => ({}));
        alert(`Erreur: ${error.error || 'Erreur lors de la soumission'}`);
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      const frequency =
        (idea.frequency && idea.frequency.trim().length > 0 && idea.frequency) ||
        'À préciser (soumission vocale)';

      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          problem_statement: description,
          category: idea.category || 'autre',
          location: idea.location || 'autre',
          frequency,
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

  // Use simple mode by default (WhatsApp-native)
  if (useSimple) {
    return (
      <SimpleVoiceSubmit
        onSubmit={handleSimpleSubmit}
      />
    );
  }

  return (
    <VoiceGuidedSubmission
      onSubmit={handleSubmit}
      onSaveDraft={handleSaveDraft}
    />
  );
}

