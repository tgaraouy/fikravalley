/**
 * Ultra Simple Idea Submission
 * 
 * Minimal data entry:
 * - Voice/Text input
 * - Email + Phone (required)
 * - Consent checkbox (required)
 * - Visible/Public toggle
 * - Auto-extraction of metadata
 */

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface ExtractedMetadata {
  title: string;
  problem_statement: string;
  proposed_solution?: string;
  category: string;
  location: string;
  submitter_type: string;
  confidence: number;
}

export default function UltraSimpleSubmit({ onSubmit }: { onSubmit?: (data: any) => void }) {
  const router = useRouter();
  const { toasts, success, error: showError, removeToast } = useToast();
  
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [visible, setVisible] = useState(false); // Default: private
  
  const [extractedMetadata, setExtractedMetadata] = useState<ExtractedMetadata | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      showError('Impossible d\'accéder au microphone. Veuillez autoriser l\'accès.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Transcribe audio using OpenAI Whisper
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTranscript(data.transcript || '');
        // Auto-extract metadata after transcription
        if (data.transcript) {
          extractMetadata(data.transcript);
        }
      } else {
        showError('Erreur lors de la transcription. Essayez d\'écrire votre idée.');
      }
    } catch (error) {
      showError('Erreur lors de la transcription.');
    }
  };

  // Extract metadata from transcript
  const extractMetadata = async (text: string) => {
    if (!text || text.length < 20) return;

    setIsExtracting(true);
    try {
      const response = await fetch('/api/ideas/extract-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.metadata) {
          setExtractedMetadata(data.metadata);
          setShowMetadata(true);
        }
      }
    } catch (error) {
      // Silent fail - user can still submit
      if (process.env.NODE_ENV === 'development') {
        console.error('Error extracting metadata:', error);
      }
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle text input change
  const handleTextChange = (text: string) => {
    setTranscript(text);
    // Auto-extract after 3 seconds of no typing
    const timeoutId = setTimeout(() => {
      if (text.length >= 20) {
        extractMetadata(text);
      }
    }, 3000);
    return () => clearTimeout(timeoutId);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!transcript || transcript.trim().length < 20) {
      showError('Veuillez décrire votre idée (au moins 20 caractères)');
      return false;
    }
    if (!email || !email.includes('@')) {
      showError('Veuillez entrer une adresse email valide');
      return false;
    }
    if (!phone || phone.trim().length < 8) {
      showError('Veuillez entrer un numéro de téléphone valide');
      return false;
    }
    if (!consent) {
      showError('Veuillez accepter les conditions de consentement');
      return false;
    }
    return true;
  };

  // Submit idea
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Use extracted metadata or fallback
      const metadata = extractedMetadata || {
        title: transcript.split('.')[0].substring(0, 100) || transcript.substring(0, 100),
        problem_statement: transcript,
        category: 'other',
        location: 'other',
        submitter_type: 'entrepreneur',
        confidence: 0.3,
      };

      // Submit idea
      const ideaResponse = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: metadata.title,
          problem_statement: metadata.problem_statement,
          proposed_solution: metadata.proposed_solution || null,
          category: metadata.category,
          location: metadata.location,
          submitter_name: name || 'Utilisateur Vocal',
          submitter_email: email,
          submitter_phone: phone,
          submitter_type: metadata.submitter_type,
          submitted_via: 'web',
          visible: visible, // Public visibility
        }),
      });

      if (!ideaResponse.ok) {
        const errorData = await ideaResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la soumission');
      }

      const ideaData = await ideaResponse.json();

      // Record consent
      try {
        await fetch('/api/consent/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: ideaData.id, // Use idea ID as user identifier
            phone: phone,
            submission: true,
            analysis: true,
            marketing: false,
            dataRetention: '90',
          }),
        });
      } catch (consentError) {
        // Log but don't fail submission
        if (process.env.NODE_ENV === 'development') {
          console.error('Error recording consent:', consentError);
        }
      }

      // Call custom onSubmit if provided
      if (onSubmit) {
        onSubmit({
          ...ideaData,
          tracking_code: ideaData.tracking_code,
        });
      } else {
        // Redirect to success page
        router.push(`/idea-submitted?tracking_code=${ideaData.tracking_code}&email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      showError(error.message || 'Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            💡 Partagez Votre Idée
          </h1>
          <p className="text-slate-600">
            Parlez ou écrivez votre idée. On s'occupe du reste.
          </p>
        </div>

        {/* Voice/Text Input */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}    
              variant={isRecording ? 'destructive' : 'primary'}
              className="flex-1"
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Arrêter
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Parler
                </>
              )}
            </Button>
          </div>

          <Textarea
            placeholder="Ou écrivez votre idée ici... (minimum 20 caractères)"
            value={transcript}
            onChange={(e) => {
              const text = e.target.value;
              setTranscript(text);
              handleTextChange(text);
            }}
            className="min-h-[200px]"
            disabled={isRecording}
          />

          {isExtracting && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyse en cours...</span>
            </div>
          )}

          {showMetadata && extractedMetadata && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Métadonnées détectées (confiance: {Math.round(extractedMetadata.confidence * 100)}%)</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Catégorie:</strong> {extractedMetadata.category}</p>
                <p><strong>Localisation:</strong> {extractedMetadata.location}</p>
                <p><strong>Type:</strong> {extractedMetadata.submitter_type}</p>
              </div>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Contact</h2>
          
          <Input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="tel"
            placeholder="Téléphone mobile * (+212 6XX XXX XXX)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            type="text"
            placeholder="Nom (optionnel)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Visibility & Consent */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Visibilité & Consentement</h2>
          
          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Rendre publique</p>
              <p className="text-sm text-slate-600">
                {visible 
                  ? 'Votre idée sera visible dans la banque d\'idées publique'
                  : 'Votre idée restera privée (visible uniquement par vous)'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4"
              required
            />
            <label htmlFor="consent" className="text-sm text-slate-700">
              <strong>J'accepte les conditions de consentement PDPL *</strong>
              <br />
              <span className="text-xs text-slate-600">
                J'autorise Fikra Valley à traiter mes données personnelles conformément à la loi PDPL marocaine.
                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline ml-1">
                  En savoir plus
                </a>
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isRecording || isExtracting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Soumission en cours...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Soumettre Mon Idée
            </>
          )}
        </Button>

        {/* Info */}
        <p className="text-xs text-center text-slate-500">
          Un code de suivi unique sera généré pour votre idée. 
          Vous pourrez le retrouver dans votre email de confirmation.
        </p>
      </div>
    </>
  );
}

