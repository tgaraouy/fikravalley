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

interface SimpleVoiceSubmitProps {
  onSubmit: (transcript: string, contactInfo: { email?: string; phone?: string; name?: string }) => void;
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
  const [ideaNumber, setIdeaNumber] = useState(128); // This would come from API response
  const [language, setLanguage] = useState<Language>('fr');
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
            setTranscript(prev => prev + sanitized);
            setConfidence(maxConfidence);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };
      }
    }
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        setTranscript(''); // Clear previous
      }
      
      // Also record audio for offline storage
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      alert('Permission microphone refusée. Activez-la dans les paramètres.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleEdit = () => {
    // Show edit dialog (simple textarea overlay)
    const edited = prompt('Tsa7e7 (Correct):', transcript);
    if (edited !== null) {
      setTranscript(edited);
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
    
    // Show contact form if not filled
    if (!contactInfo.email && !contactInfo.phone) {
      setShowContactForm(true);
      return;
    }
    
    // Show reward screen immediately
    setShowReward(true);
    setIsProcessing(true);
    
    // Submit in background
    onSubmit(transcript, contactInfo);
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
    
    // Show reward screen immediately
    setShowReward(true);
    setIsProcessing(true);
    
    // Submit in background
    onSubmit(transcript, contactInfo);
  };

  return (
    <>
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
      {transcript && !isRecording && !showContactForm && (
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="mt-8 w-full max-w-md bg-green-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {isProcessing ? '⏳ Envoi...' : '✅ سّبق الفكرة (Submit)'}
        </button>
      )}
      </div>
    </>
  );
}

