/**
 * SIMPLE VOICE SUBMIT - WhatsApp-Native
 * 
 * 1 tap: Mic button (80% of screen)
 * Transcript appears IN PLACE (no scroll)
 * "Tsa7e7" (Correct) button if accuracy <85%
 * Submit button: Big, single action
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Check, X, AlertCircle } from 'lucide-react';
import { saveVoiceDraft } from '@/lib/voice/offline-storage';
import { moderateContent, sanitizeContent } from '@/lib/moderation/content-moderation';
import { detectLanguage, type Language } from '@/lib/constants/tagline';
import IdeaRewardScreen from '@/components/reward/IdeaRewardScreen';
import VoiceFieldsConfirmation from '@/components/submission/VoiceFieldsConfirmation';

interface SimpleVoiceSubmitProps {
  onSubmit: (transcript: string, contactInfo: { email?: string; phone?: string; name?: string }, extractedData?: any) => void;
}

export default function SimpleVoiceSubmit({ onSubmit }: SimpleVoiceSubmitProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '', name: '' });
  const [showReward, setShowReward] = useState(false);
  const [showFieldsConfirmation, setShowFieldsConfirmation] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [ideaNumber, setIdeaNumber] = useState(128); // This would come from API response
  const [language, setLanguage] = useState<Language>('fr');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isStoppingRef = useRef<boolean>(false);
  const recognitionReadyRef = useRef<boolean>(false);

  useEffect(() => {
    // Detect language
    const detected = detectLanguage();
    setLanguage(detected);
    
    if (typeof window !== 'undefined') {
      // Initialize Web Speech API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        // Set language based on detection
        recognitionRef.current.lang = detected === 'darija' ? 'ar-MA' : detected === 'fr' ? 'fr-FR' : 'en-US';
        
        // Initialize ready state - recognition starts in idle state
        recognitionReadyRef.current = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let final = '';
          let maxConfidence = 0;
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              final += result[0].transcript + ' ';
              maxConfidence = Math.max(maxConfidence, result[0].confidence || 0.8);
            }
          }
          
          if (final) {
            // Moderate content in real-time
            const sanitized = sanitizeContent(final);
            const moderation = moderateContent(sanitized, { type: 'voice' });
            
            if (!moderation.allowed) {
              setModerationError(moderation.reason || 'Contenu inapproprié détecté');
              // Don't add blocked content to transcript
              return;
            }
            
            setModerationError(null);
            const newTranscript = transcript + sanitized;
            setTranscript(newTranscript);
            setConfidence(maxConfidence);
            
            // Update prompt based on what user said
            updatePrompt(newTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          const errorType = event.error;
          
          // Handle different error types
          switch (errorType) {
            case 'no-speech':
              // This is normal - user hasn't spoken yet or paused
              // Don't log or stop, just continue listening
              return;
              
            case 'audio-capture':
              // Microphone not available or permission denied
              console.warn('Microphone not available:', errorType);
              setIsRecording(false);
              alert('⚠️ Microphone non disponible. Vérifie les permissions dans les paramètres du navigateur.');
              return;
              
            case 'not-allowed':
              // Permission denied
              console.warn('Microphone permission denied:', errorType);
              setIsRecording(false);
              alert('⚠️ Permission microphone refusée. Active-la dans les paramètres du navigateur.');
              return;
              
            case 'aborted':
              // Recognition was stopped manually
              // This is expected when user stops recording
              setIsRecording(false);
              return;
              
            case 'network':
              // Network error
              console.error('Network error during speech recognition:', errorType);
              setIsRecording(false);
              alert('⚠️ Erreur réseau. Vérifie ta connexion internet.');
              return;
              
            case 'service-not-allowed':
              // Speech recognition service not available
              console.error('Speech recognition service not available:', errorType);
              setIsRecording(false);
              alert('⚠️ Service de reconnaissance vocale non disponible. Essaie de rafraîchir la page.');
              return;
              
            default:
              // Unknown error - log it but don't stop unless it's critical
              console.warn('Speech recognition warning:', errorType);
              // Only stop on critical errors
              if (errorType === 'bad-grammar' || errorType === 'language-not-supported') {
                setIsRecording(false);
              }
              return;
          }
        };

        recognitionRef.current.onend = () => {
          // Recognition ended naturally
          recognitionReadyRef.current = true;
          isStoppingRef.current = false;
          setIsRecording(prev => {
            // Only reset if we were actually recording
            return false;
          });
        };
      }
    }
  }, []);

  const startRecording = async () => {
    // Prevent multiple simultaneous starts
    if (isRecording || isStoppingRef.current) {
      return;
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
          // Reset prompt when starting
          setCurrentPrompt('💡 Commence par décrire le problème que tu veux résoudre...');
          
          // Start speech recognition (check if already running)
          if (recognitionRef.current) {
        // Wait for recognition to be ready if it's stopping
        if (!recognitionReadyRef.current && recognitionRef.current.state !== 'idle') {
          console.log('Waiting for recognition to be ready...');
          // Wait up to 1 second for recognition to be ready
          let waitCount = 0;
          while (!recognitionReadyRef.current && waitCount < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
          }
        }

        try {
          // Check recognition state
          const state = recognitionRef.current.state;
          
          if (state === 'listening' || state === 'starting') {
            console.log('Recognition already active, stopping first');
            isStoppingRef.current = true;
            recognitionReadyRef.current = false;
            recognitionRef.current.stop();
            // Wait for onend event
            await new Promise<void>((resolve) => {
              const checkReady = () => {
                if (recognitionReadyRef.current) {
                  resolve();
                } else {
                  setTimeout(checkReady, 50);
                }
              };
              // Timeout after 1 second
              setTimeout(() => resolve(), 1000);
              checkReady();
            });
            isStoppingRef.current = false;
          }

          // Now start recognition
          recognitionRef.current.start();
          recognitionReadyRef.current = false;
          setIsRecording(true);
          setTranscript(''); // Clear previous
        } catch (recognitionError: any) {
          // If already started, stop and wait for ready state
          if (recognitionError.name === 'InvalidStateError' || recognitionError.message?.includes('already started')) {
            console.log('Recognition already started, stopping and waiting...');
            try {
              isStoppingRef.current = true;
              recognitionReadyRef.current = false;
              recognitionRef.current.stop();
              
              // Wait for onend event to fire
              await new Promise<void>((resolve) => {
                const checkReady = () => {
                  if (recognitionReadyRef.current) {
                    resolve();
                  } else {
                    setTimeout(checkReady, 50);
                  }
                };
                // Timeout after 1 second
                setTimeout(() => resolve(), 1000);
                checkReady();
              });
              
              isStoppingRef.current = false;
              
              // Now try starting again
              recognitionRef.current.start();
              recognitionReadyRef.current = false;
              setIsRecording(true);
              setTranscript('');
            } catch (retryError) {
              console.error('Error restarting recognition:', retryError);
              isStoppingRef.current = false;
              setIsRecording(false);
            }
          } else {
            throw recognitionError;
          }
        }
      }
      
      // Also record audio for offline storage
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus' // Compress to ~100KB/min
      });
      
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // Save offline
        await saveVoiceDraft({
          id: `draft_${Date.now()}`,
          transcript,
          audioBlob: blob,
          language: 'ar-MA',
          timestamp: Date.now()
        });
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert('Permission microphone refusée. Activez-la dans les paramètres.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        // Only stop if actually running
        const state = recognitionRef.current.state;
        if (state === 'listening' || state === 'starting') {
          isStoppingRef.current = true;
          recognitionReadyRef.current = false;
          recognitionRef.current.stop();
        }
      } catch (error) {
        console.error('Error stopping recognition:', error);
        isStoppingRef.current = false;
      }
      setIsRecording(false);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } catch (error) {
        console.error('Error stopping media recorder:', error);
      }
    }
  };

  const updatePrompt = (text: string) => {
    const lowerText = text.toLowerCase();
    const wordCount = text.split(' ').filter(w => w).length;
    
    // Dynamic prompts based on content
    if (wordCount < 10) {
      setCurrentPrompt('💡 Commence par décrire le problème. Ex: "Les infirmières passent trop de temps..."');
    } else if (wordCount < 30) {
      if (!lowerText.includes('qui') && !lowerText.includes('qui') && !lowerText.match(/(infirmières|étudiants|touristes|gens|personnes)/)) {
        setCurrentPrompt('💡 Qui a ce problème ? Ex: "Les infirmières", "Les étudiants", "Les touristes"...');
      } else if (!lowerText.match(/(casablanca|rabat|marrakech|kenitra|agadir|fes|meknes|oujda|à|au|dans)/)) {
        setCurrentPrompt('💡 Où se passe ce problème ? Ex: "À Casablanca", "Au CHU Ibn Sina"...');
      } else {
        setCurrentPrompt('💡 Continue ! Explique mieux le problème...');
      }
    } else if (wordCount < 60) {
      if (!lowerText.match(/(fois|chaque|jour|semaine|mois|quotidien|régulier)/)) {
        setCurrentPrompt('💡 À quelle fréquence ? Ex: "Chaque jour", "3 fois par semaine"...');
      } else if (!lowerText.match(/(actuellement|maintenant|faire|font|utilisent)/)) {
        setCurrentPrompt('💡 Que font-ils actuellement ? Ex: "Ils utilisent WhatsApp", "Ils font la queue"...');
      } else {
        setCurrentPrompt('💡 Bien ! Quelle est ta solution ?');
      }
    } else if (wordCount < 100) {
      if (!lowerText.match(/(solution|idée|app|système|plateforme|application)/)) {
        setCurrentPrompt('💡 Quelle est ta solution ? Ex: "Une app pour...", "Un système qui..."');
      } else {
        setCurrentPrompt('💡 Excellent ! Tu peux ajouter plus de détails si tu veux.');
      }
    } else {
      setCurrentPrompt('💡 Parfait ! Tu as dit l\'essentiel. Tu peux continuer ou arrêter.');
    }
  };

  const handleEdit = () => {
    // Show edit dialog (simple textarea overlay)
    const edited = prompt('Tsa7e7 (Correct):', transcript);
    if (edited !== null) {
      setTranscript(edited);
      updatePrompt(edited);
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) return;
    
    // Final moderation check
    const moderation = moderateContent(transcript, { type: 'voice', strict: true });
    if (!moderation.allowed) {
      setModerationError(moderation.reason || 'Contenu inapproprié. Veuillez reformuler votre message.');
      return;
    }
    
    // Extract structured data from transcript
    setIsExtracting(true);
    try {
      const extractResponse = await fetch('/api/ideas/extract-from-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          language: language === 'darija' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US'
        })
      });

      if (extractResponse.ok) {
        const result = await extractResponse.json();
        const data = result.data || {
          title: transcript.split('.')[0].substring(0, 100) || transcript.substring(0, 100),
          problem_statement: transcript,
          category: 'other',
          location: 'other',
        };
        setExtractedData(data);
        setShowFieldsConfirmation(true);
      } else {
        // Fallback: use basic extraction
        setExtractedData({
          title: transcript.split('.')[0].substring(0, 100) || transcript.substring(0, 100),
          problem_statement: transcript,
          category: 'other',
          location: 'other',
        });
        setShowFieldsConfirmation(true);
      }
    } catch (error) {
      console.error('Error extracting data:', error);
      // Fallback: use basic extraction
      setExtractedData({
        title: transcript.split('.')[0].substring(0, 100) || transcript.substring(0, 100),
        problem_statement: transcript,
        category: 'other',
        location: 'other',
      });
      setShowFieldsConfirmation(true);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFieldsConfirmed = (confirmedData: any) => {
    setExtractedData(confirmedData);
    setShowFieldsConfirmation(false);
    
    // Show contact form if not filled
    if (!contactInfo.email && !contactInfo.phone) {
      setShowContactForm(true);
      return;
    }
    
    // Submit with confirmed data
    handleFinalSubmit(confirmedData);
  };

  const handleFinalSubmit = async (dataToSubmit: any) => {
    // Show reward screen immediately
    setShowReward(true);
    setIsProcessing(true);
    
    // Submit in background with extracted data
    onSubmit(transcript, contactInfo, dataToSubmit);
  };

  const handleRewardNext = () => {
    setShowReward(false);
    setIsProcessing(false);
  };
  
  const handleContactSubmit = async () => {
    if (!contactInfo.email && !contactInfo.phone) {
      alert('⚠️ Entrez au moins un email ou un numéro de téléphone pour recevoir votre code de suivi');
      return;
    }
    
    // Final moderation check
    const moderation = moderateContent(transcript, { type: 'voice', strict: true });
    if (!moderation.allowed) {
      setModerationError(moderation.reason || 'Contenu inapproprié. Veuillez reformuler votre message.');
      return;
    }
    
    // Submit with extracted data
    setShowContactForm(false);
    handleFinalSubmit(extractedData || {
      title: transcript.split('.')[0].substring(0, 100) || transcript.substring(0, 100),
      problem_statement: transcript,
      category: 'other',
      location: 'other',
    });
  };

  return (
    <>
      {/* Fields Confirmation Modal */}
      {showFieldsConfirmation && extractedData && (
        <VoiceFieldsConfirmation
          extractedData={extractedData}
          onSubmit={handleFieldsConfirmed}
          onCancel={() => {
            setShowFieldsConfirmation(false);
            setExtractedData(null);
          }}
        />
      )}

      {/* Reward Screen */}
      {showReward && (
        <IdeaRewardScreen
          ideaNumber={ideaNumber}
          language={language}
          onNext={handleRewardNext}
          onSkip={() => setShowReward(false)}
        />
      )}

      <div className="flex flex-col h-screen justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      {/* Giant Mic Button - 80% of screen */}
      <button
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        className={`
          w-64 h-64 rounded-full flex items-center justify-center
          transition-all duration-200 shadow-2xl
          ${isRecording 
            ? 'bg-red-500 scale-110 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }
        `}
        disabled={isProcessing}
      >
        {isRecording ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            <X className="w-24 h-24 text-white relative z-10" />
          </div>
        ) : (
          <Mic className="w-24 h-24 text-white" />
        )}
      </button>

      {/* Status Text */}
      <p className="mt-6 text-lg font-medium text-slate-700">
        {isRecording ? '🎤 Dwi daba (Parle maintenant)...' : 'دير الصوت دابا (Appuie pour parler)'}
      </p>

      {/* Guidance Questions - Show when NOT recording */}
      {!isRecording && !transcript && (
        <div className="mt-8 w-full max-w-md">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 text-center">
              💡 Que dire ? (What to say?)
            </h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <p>
                  <strong>Le problème :</strong> "Les infirmières au CHU passent 4h par jour à chercher le matériel..."
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <p>
                  <strong>Qui a le problème :</strong> "Les infirmières", "Les étudiants", "Les touristes"...
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <p>
                  <strong>Où :</strong> "À Casablanca", "Au CHU Ibn Sina", "Dans les écoles de Rabat"...
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <p>
                  <strong>La solution :</strong> "Une app pour localiser le matériel", "Un système de réservation"...
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-blue-200">
              <p className="text-xs text-slate-600 text-center">
                💬 Parle naturellement en Darija ou en Français. Dis tout ce qui te passe par la tête !
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recording Guidance - Show DURING recording */}
      {isRecording && (
        <div className="mt-6 w-full max-w-md">
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 text-center mb-3 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              🎤 Enregistrement en cours...
            </p>
            {currentPrompt && (
              <div className="bg-white rounded-lg p-3 mb-3 border border-green-200">
                <p className="text-sm text-slate-700 text-center">
                  {currentPrompt}
                </p>
              </div>
            )}
            <div className="space-y-1 text-xs text-green-700">
              <p>💬 Parle naturellement, on t'écoute !</p>
              <p>💬 Dis tout ce qui te passe par la tête</p>
            </div>
          </div>
        </div>
      )}

      {/* Transcript: Appears IN PLACE, not below */}
      {transcript && (
        <div className="mt-8 w-full max-w-md">
          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-blue-200">
            <p className="text-base text-slate-800 leading-relaxed mb-4" dir="auto">
              {transcript}
            </p>
            
            {/* Confidence indicator */}
            {confidence < 0.85 && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  ⚠️ Précision: {Math.round(confidence * 100)}% - Vérifie la transcription
                </p>
              </div>
            )}
            
            {/* Moderation error */}
            {moderationError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Contenu bloqué
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      {moderationError}
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      Veuillez reformuler votre message en respectant les normes de la communauté.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Edit Button */}
            <button
              onClick={handleEdit}
              className="text-blue-600 text-sm font-medium mb-4 hover:text-blue-700"
            >
              ✏️ Tsa7e7 (Correct)
            </button>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-900">
              📧 Contact (pour recevoir votre code de suivi)
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Entrez votre email ou téléphone pour recevoir un code unique pour suivre votre idée.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom (optionnel)
                </label>
                <input
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                  placeholder="Votre nom"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span> (ou téléphone)
                </label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Téléphone <span className="text-red-500">*</span> (ou email)
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  placeholder="+212 6XX XXX XXX"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowContactForm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleContactSubmit}
                disabled={isProcessing || (!contactInfo.email && !contactInfo.phone)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? '⏳ Envoi...' : '✅ Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit: Big, single button */}
      {transcript && !isRecording && !showContactForm && !showFieldsConfirmation && (
        <button
          onClick={handleSubmit}
          disabled={isProcessing || isExtracting}
          className="mt-8 w-full max-w-md bg-green-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {isExtracting ? '⏳ Analyse en cours...' : isProcessing ? '⏳ Envoi...' : '✅ سّبق الفكرة (Submit)'}
        </button>
      )}
      </div>
    </>
  );
}

