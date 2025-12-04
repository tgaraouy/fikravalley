/**
 * Voice-Driven Mentor Search
 * 
 * User describes their background and motivation via voice
 * AI agent analyzes and recommends mentors from database
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Loader2, Users, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moderateContent, sanitizeContent } from '@/lib/moderation/content-moderation';

interface VoiceMentorSearchProps {
  onFindMentors: (background: string, motivation: string) => void;
  isSearching?: boolean;
}

export default function VoiceMentorSearch({ onFindMentors, isSearching = false }: VoiceMentorSearchProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [background, setBackground] = useState('');
  const [motivation, setMotivation] = useState('');
  const [currentField, setCurrentField] = useState<'background' | 'motivation' | null>(null);
  const [confidence, setConfidence] = useState(1.0);
  const [moderationErrors, setModerationErrors] = useState<{
    background?: string;
    motivation?: string;
  }>({});
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ar-MA'; // Darija first
        
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
          
          if (final && currentField) {
            // Moderate content in real-time
            const sanitized = sanitizeContent(final);
            const moderation = moderateContent(sanitized, { type: 'voice' });
            
            if (!moderation.allowed) {
              setModerationErrors(prev => ({
                ...prev,
                [currentField]: moderation.reason || 'Contenu inapproprié détecté'
              }));
              return; // Don't add blocked content
            }
            
            // Clear error if content is now valid
            setModerationErrors(prev => ({
              ...prev,
              [currentField]: undefined
            }));
            
            if (currentField === 'background') {
              setBackground(prev => prev + sanitized);
            } else if (currentField === 'motivation') {
              setMotivation(prev => prev + sanitized);
            }
            setConfidence(maxConfidence);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Speech recognition error:', event.error);
          }
          setIsRecording(false);
        };
      }
    }
  }, [currentField]);

  const startRecording = async (field: 'background' | 'motivation') => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setCurrentField(field);
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      }
      
      // Also record audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
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
      setCurrentField(null);
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFindMentors = () => {
    if (!background.trim() || !motivation.trim()) {
      alert('⚠️ Décris ton parcours et ta motivation avant de chercher des mentors');
      return;
    }
    
    // Final moderation check
    const backgroundMod = moderateContent(background, { type: 'text', strict: true });
    const motivationMod = moderateContent(motivation, { type: 'text', strict: true });
    
    if (!backgroundMod.allowed) {
      setModerationErrors(prev => ({ ...prev, background: backgroundMod.reason }));
      alert(`⚠️ Contenu inapproprié dans ton parcours: ${backgroundMod.reason}`);
      return;
    }
    
    if (!motivationMod.allowed) {
      setModerationErrors(prev => ({ ...prev, motivation: motivationMod.reason }));
      alert(`⚠️ Contenu inapproprié dans ta motivation: ${motivationMod.reason}`);
      return;
    }
    
    onFindMentors(background, motivation);
  };

  return (
    <div className="space-y-6">
      {/* Background Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100">
        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          1. Ton parcours (Background)
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Parle de ton expérience, tes compétences, ton secteur d'activité...
        </p>
        
        <div className="space-y-3">
          <textarea
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="Ex: Je suis développeur avec 5 ans d'expérience en santé digitale. J'ai travaillé sur des projets d'hôpitaux à Casablanca..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
            dir="auto"
          />
          
          <div className="flex items-center gap-3">
            <button
              onTouchStart={() => startRecording('background')}
              onTouchEnd={stopRecording}
              onMouseDown={() => startRecording('background')}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={isRecording && currentField !== 'background'}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${isRecording && currentField === 'background'
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }
                disabled:opacity-50
              `}
            >
              <Mic className="w-4 h-4" />
              {isRecording && currentField === 'background' ? 'Arrêter' : 'Parler'}
            </button>
            
            {confidence < 0.85 && background && (
              <span className="text-xs text-yellow-600">
                ⚠️ Précision: {Math.round(confidence * 100)}%
              </span>
            )}
            
            {/* Moderation error */}
            {moderationErrors.background && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                <div className="flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{moderationErrors.background}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Motivation Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-indigo-100">
        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          2. Ta motivation
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Pourquoi tu cherches un mentor ? Quel type d'aide tu veux ?
        </p>
        
        <div className="space-y-3">
          <textarea
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="Ex: Je veux lancer une startup dans la santé mais j'ai besoin de conseils sur la régulation, les partenariats hospitaliers..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
            dir="auto"
          />
          
          <div className="flex items-center gap-3">
            <button
              onTouchStart={() => startRecording('motivation')}
              onTouchEnd={stopRecording}
              onMouseDown={() => startRecording('motivation')}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={isRecording && currentField !== 'motivation'}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${isRecording && currentField === 'motivation'
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }
                disabled:opacity-50
              `}
            >
              <Mic className="w-4 h-4" />
              {isRecording && currentField === 'motivation' ? 'Arrêter' : 'Parler'}
            </button>
            
            {confidence < 0.85 && motivation && (
              <span className="text-xs text-yellow-600">
                ⚠️ Précision: {Math.round(confidence * 100)}%
              </span>
            )}
            
            {/* Moderation error */}
            {moderationErrors.motivation && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                <div className="flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{moderationErrors.motivation}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Find Mentors Button */}
      <div className="space-y-3">
        <Button
          onClick={handleFindMentors}
          disabled={isSearching || !background.trim() || !motivation.trim()}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold py-7 text-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
              <span>L'IA analyse ton profil et cherche les meilleurs mentors...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 mr-3" />
              <span>Trouver mes mentors (IA) - 0 formulaire requis</span>
            </>
          )}
        </Button>
        
        {/* Progress Indicator */}
        {background.trim() && motivation.trim() && !isSearching && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 font-medium">
              ✅ Profil complet! Cliquez sur le bouton pour trouver vos mentors
            </p>
          </div>
        )}
        
        <p className="text-xs text-slate-500 text-center">
          💡 <strong>Voice-driven:</strong> L'IA analyse ton parcours et ta motivation pour trouver les mentors les plus pertinents. Aucun formulaire complexe!
        </p>
      </div>
    </div>
  );
}

