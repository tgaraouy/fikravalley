'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import AgentDashboard from '@/components/agents/AgentDashboard';
import { CATEGORIES, MOROCCAN_CITIES } from '@/lib/categories';
import {
  saveDraftLocally,
  loadDraftLocally,
  trackInterruption,
  updateThinkTime,
  type ThinkTimeSession
} from '@/lib/workflow/think-time-ux';
import MicroValidation from '@/lib/workflow/micro-validation';
import { saveVoiceDraft, loadVoiceDraft } from '@/lib/voice/offline-storage';
import WhatsAppImport from './WhatsAppImport';

function detectFrequency(text: string): string {
  if (!text) return 'À préciser (soumission vocale)';

  const lower = text.toLowerCase();

  const exactPatterns = [
    /(chaque|tous les|toutes les)\s+(jour|jours|semaine|semaines|mois|années|ans)/i,
    /(une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s+(fois|par\s+semaine|par\s+mois|par\s+an)/i,
    /(\d+)\s*(fois|jour|jours|semaine|semaines|mois|ans)/i,
  ];

  for (const pattern of exactPatterns) {
    const match = lower.match(pattern);
    if (match) {
      return match[0]
        .replace(/\s+/g, ' ')
        .replace('par', '/')
        .trim();
    }
  }

  if (lower.includes('souvent')) return 'Souvent (à préciser)';
  if (lower.includes('rarement')) return 'Rarement (à préciser)';
  if (lower.includes('parfois')) return 'Parfois (à préciser)';

  return 'À préciser (soumission vocale)';
}

interface VoiceGuidedSubmissionProps {
  onSubmit: (idea: any) => void;
  onSaveDraft: (idea: any) => void;
}

export default function VoiceGuidedSubmission({ onSubmit, onSaveDraft }: VoiceGuidedSubmissionProps) {
  const searchParams = useSearchParams();

  // Voice recognition & Recording
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<'fr-MA' | 'ar-MA'>('fr-MA');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Form state
  const [ideaText, setIdeaText] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  // UI State
  const [showTextarea, setShowTextarea] = useState(false);
  const [transcriptionConfidence, setTranscriptionConfidence] = useState(1.0);

  // Agent guidance
  const [currentAgentMessage, setCurrentAgentMessage] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Think-Time UX tracking
  const [thinkTimeSession, setThinkTimeSession] = useState<ThinkTimeSession | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());
  const [showMicroValidation, setShowMicroValidation] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<string>('');

  // Initialize Think-Time session & Check for Imported Drafts
  useEffect(() => {
    const initSession = async () => {
      // Check URL for draftId (from WhatsApp import)
      const draftIdParam = searchParams.get('draftId');
      const userId = draftIdParam || `user_${Date.now()}`;

      // Load Text Draft
      const savedDraft = loadDraftLocally(userId);

      // Load Voice Draft (async)
      const voiceDraft = await loadVoiceDraft(userId);

      if (voiceDraft && voiceDraft.audioBlob) {
        setAudioBlob(voiceDraft.audioBlob);
        setAudioUrl(URL.createObjectURL(voiceDraft.audioBlob));
        setLanguage(voiceDraft.language);
        if (voiceDraft.transcript) setIdeaText(voiceDraft.transcript);

        // If imported from WhatsApp, show success message
        if ((voiceDraft as any).importedFrom === 'whatsapp') {
          alert('✅ Audio WhatsApp importé avec succès! Cliquez sur "Modifier le texte" pour voir la transcription.');
        }
      }

      if (savedDraft) {
        setThinkTimeSession(savedDraft);
        if (!voiceDraft) setIdeaText(savedDraft.steps[0]?.description || '');
      } else {
        const newSession: ThinkTimeSession = {
          userId,
          currentStep: 0,
          steps: [{
            id: 'step_problem',
            name: 'Décrire le problème',
            description: '',
            estimatedTimeSeconds: 300
          }],
          startedAt: new Date(),
          lastActivity: new Date(),
          interruptions: 0,
          totalThinkTime: 0
        };
        setThinkTimeSession(newSession);
      }
    };

    initSession();
  }, [searchParams]);

  // Auto-save draft every 30 seconds (Think-Time UX + Voice)
  useEffect(() => {
    if (!thinkTimeSession) return;

    const interval = setInterval(() => {
      if (thinkTimeSession) {
        const updated = {
          ...thinkTimeSession,
          steps: [{
            ...thinkTimeSession.steps[0],
            description: ideaText
          }],
          lastActivity: new Date()
        };
        saveDraftLocally(updated);
        setThinkTimeSession(updated);

        // Save voice draft if audio exists
        if (audioBlob) {
          saveVoiceDraft({
            id: thinkTimeSession.userId,
            transcript: ideaText,
            audioBlob: audioBlob,
            timestamp: Date.now(),
            language: language
          });
        }
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [thinkTimeSession, ideaText, audioBlob, language]);

  // Track interruptions
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && thinkTimeSession) {
        setThinkTimeSession(trackInterruption(thinkTimeSession));
      } else if (!document.hidden && thinkTimeSession) {
        const secondsSinceLastActivity = Math.floor(
          (new Date().getTime() - lastActivityTime.getTime()) / 1000
        );
        if (secondsSinceLastActivity > 60) {
          setThinkTimeSession(updateThinkTime(thinkTimeSession, 0));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [thinkTimeSession, lastActivityTime]);

  // Track active think time
  useEffect(() => {
    const interval = setInterval(() => {
      if (thinkTimeSession && !document.hidden) {
        setThinkTimeSession(updateThinkTime(thinkTimeSession, 5));
        setLastActivityTime(new Date());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [thinkTimeSession]);

  // Check voice support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }
  }, []);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;

            if (confidence < 0.85) {
              setTranscriptionConfidence(confidence);
              setShowTextarea(true); // Auto-expand if low confidence
            }

            if (event.results[i].isFinal) {
              final += transcriptPart + ' ';
            } else {
              interim += transcriptPart;
            }
          }

          if (final) {
            setTranscript(prev => prev + final);
            setIdeaText(prev => prev + final);
          }
          setInterimTranscript(interim);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);

          if (event.error === 'not-allowed') {
            alert('⚠️ 3afak, 3tina l\'permission bach nsm3ouk (Autorise le micro)');
          }
        };

        recognition.onend = () => {
          // Don't auto-stop if we want continuous, but here we handle manual stop
        };

        recognitionRef.current = recognition;
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
      }
    }
  }, [language]); // Re-init when language changes

  const startRecording = async () => {
    try {
      // 1. Start Speech Recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // 2. Start Audio Recording (MediaRecorder)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus' // Efficient compression
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        // Auto-save to IndexedDB
        if (thinkTimeSession) {
          saveVoiceDraft({
            id: thinkTimeSession.userId,
            transcript: ideaText,
            audioBlob: blob,
            timestamp: Date.now(),
            language: language
          });
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('⚠️ Erreur micro. Vérifie tes permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const toggleListening = useCallback(() => {
    if (!voiceSupported) {
      alert('Navigateur non supporté. Utilise Chrome ou Edge.');
      return;
    }

    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, voiceSupported, language, thinkTimeSession, ideaText]);

  // Handle WhatsApp Import
  const handleImport = async (blob: Blob) => {
    setAudioBlob(blob);
    setAudioUrl(URL.createObjectURL(blob));

    // Save to IndexedDB
    if (thinkTimeSession) {
      await saveVoiceDraft({
        id: thinkTimeSession.userId,
        transcript: '', // No transcript yet
        audioBlob: blob,
        timestamp: Date.now(),
        language: language
      });
    }

    alert('✅ Audio importé! Cliquez sur "Modifier le texte" pour transcrire (ou attendez l\'IA).');
  };

  // Smart agent guidance
  const getAgentGuidance = useCallback(() => {
    const text = ideaText.toLowerCase();
    const words = ideaText.split(' ').filter(w => w);
    const wordCount = words.length;

    if (wordCount < 10) return "🎯 FIKRA: Raconte-moi le problème. 'J'ai vu que...'";
    if (wordCount < 30) {
      if (text.includes('touristes') || text.includes('gens')) return "🎯 FIKRA: Qui EXACTEMENT? 'Touristes français', 'Familles de Casa'...";
      return "🎯 FIKRA: Continue! Qui a ce problème?";
    }
    if (wordCount < 60) {
      if (!text.includes('fois') && !text.includes('chaque')) return "📊 SCORE: À quelle FRÉQUENCE? 'Chaque jour', '3 fois par semaine'...";
      return "💪 SCORE: Bien! Que font-ils ACTUELLEMENT?";
    }
    if (wordCount < 100) {
      if (!text.includes('actuellement')) return "📊 SCORE: Comment ils font MAINTENANT? WhatsApp? Rien?";
      return "🎯 FIKRA: Quel est le COÛT (temps/argent) de ce problème?";
    }
    if (wordCount >= 100) {
      if (!text.includes('solution')) return "💡 FIKRA: Quelle est TON IDÉE de solution?";
      return "🎉 SCORE: Bravo! Clique 'Valider' pour l'analyse!";
    }
    return "✅ Continue...";
  }, [ideaText]);

  useEffect(() => {
    setCurrentAgentMessage(getAgentGuidance());
  }, [ideaText, getAgentGuidance]);

  const detectedFrequency = useMemo(() => detectFrequency(ideaText), [ideaText]);

  const parsedIdea = {
    description: ideaText,
    problem: { description: ideaText, who: '', where: location || '', frequency: detectedFrequency },
    solution: { description: '' },
    category: category || '',
    location: location || '',
    frequency: detectedFrequency
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: Writing Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-slate-900">
                <span className="text-terracotta-600">Raconte</span> ta <span className="text-brand-600">Fikra</span>
              </h1>
              <p className="text-lg text-slate-600">
                Les agents IA t'aident à structurer ton idée.
              </p>

              {/* Language Toggle */}
              <div className="flex justify-center gap-4 my-4">
                <button
                  onClick={() => setLanguage('fr-MA')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${language === 'fr-MA'
                      ? 'bg-brand-600 text-white shadow-lg'
                      : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                >
                  🇫🇷 Français (Recommandé)
                </button>
                <button
                  onClick={() => {
                    if (confirm('⚠️ La reconnaissance en Darija est moins précise (~60%). Veux-tu continuer?')) {
                      setLanguage('ar-MA');
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${language === 'ar-MA'
                      ? 'bg-terracotta-600 text-white shadow-lg'
                      : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                >
                  🇲🇦 Darija (Beta)
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentAgentMessage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-gradient-to-r from-terracotta-50 to-brand-50 border-l-4 border-terracotta-500 p-4 rounded-lg"
              >
                <p className="text-slate-800 font-medium">{currentAgentMessage}</p>
              </motion.div>
            </AnimatePresence>

            <Card className="border-2 border-terracotta-200 shadow-xl overflow-hidden">
              <CardContent className="p-6 space-y-6">
                {/* BIG MIC BUTTON */}
                <div className="flex flex-col items-center justify-center py-8 relative">
                  {/* Pulse Rings */}
                  {isListening && (
                    <>
                      <div className="absolute w-24 h-24 rounded-full bg-red-500/30 animate-ping" />
                      <div className="absolute w-32 h-32 rounded-full bg-red-500/20 animate-pulse delay-75" />
                    </>
                  )}

                  <Button
                    onClick={toggleListening}
                    size="lg"
                    className={`rounded-full w-24 h-24 flex items-center justify-center transition-all duration-300 z-10 ${isListening
                        ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/50'
                        : 'bg-terracotta-600 hover:bg-terracotta-700 shadow-terracotta-500/30'
                      } text-white shadow-xl border-4 border-white`}
                    aria-label={language === 'ar-MA' ? "Dwi daba (Parler maintenant)" : "Parler maintenant"}
                  >
                    <span className="text-4xl">{isListening ? '⏹️' : '🎤'}</span>
                  </Button>
                  <p className="mt-4 text-slate-600 font-medium animate-fade-in">
                    {isListening
                      ? (language === 'ar-MA' ? 'Kan-sm3ouk... (En écoute)' : 'Je t\'écoute...')
                      : (language === 'ar-MA' ? 'Brak bach dwi (Appuie pour parler)' : 'Appuie pour parler')}
                  </p>
                </div>

                {/* WhatsApp Import */}
                <div className="max-w-md mx-auto">
                  <WhatsAppImport onImport={handleImport} />
                </div>

                {/* Audio Playback */}
                {audioUrl && (
                  <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3 animate-slide-up">
                    <span className="text-sm font-medium text-slate-500">Ton enregistrement:</span>
                    <audio src={audioUrl} controls className="h-8 w-full max-w-xs" />
                  </div>
                )}

                {/* Transcript / Textarea */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      Transcription {transcriptionConfidence < 0.85 && <span className="text-amber-600 text-xs">(Vérifie le texte svp)</span>}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTextarea(!showTextarea)}
                      className="text-brand-600 text-xs hover:bg-brand-50"
                    >
                      {showTextarea ? 'Masquer le texte' : 'Modifier le texte ✏️'}
                    </Button>
                  </div>

                  <AnimatePresence mode="wait">
                    {showTextarea ? (
                      <motion.div
                        key="textarea"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <textarea
                          value={ideaText}
                          onChange={(e) => setIdeaText(e.target.value)}
                          placeholder="Le texte apparaîtra ici..."
                          className="w-full min-h-[200px] p-4 border-2 border-slate-200 rounded-lg focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 resize-none text-lg"
                          dir="auto"
                          autoFocus
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTextarea(true)}
                        className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors group"
                      >
                        {ideaText || <span className="text-slate-400 italic">La transcription apparaîtra ici...</span>}
                        <div className="mt-2 text-xs text-brand-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Clique pour modifier
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {interimTranscript && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm italic"
                    >
                      {interimTranscript}
                    </motion.div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-terracotta-500 bg-white"
                    >
                      <option value="">Sélectionne...</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ville <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-terracotta-500 bg-white"
                    >
                      <option value="">Sélectionne...</option>
                      {Array.from(new Set(MOROCCAN_CITIES.map(c => c.region || 'Autre'))).map((region) => (
                        <optgroup key={region} label={region}>
                          {MOROCCAN_CITIES.filter(c => (c.region || 'Autre') === region).map((city) => (
                            <option key={city.value} value={city.value}>{city.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      onSaveDraft(parsedIdea);
                      if (thinkTimeSession) saveDraftLocally(thinkTimeSession);
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={ideaText.length < 20}
                  >
                    💾 Sauvegarder (24h)
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentStepId('step_problem');
                      setShowMicroValidation(true);
                    }}
                    disabled={ideaText.length < 50 || !category || !location}
                    className="flex-1 bg-terracotta-600 hover:bg-terracotta-700"
                  >
                    🚀 Valider avec les Agents
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Agent Dashboard */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-terracotta-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>🤖</span>
                  <span>7 Agents en Direct</span>
                </h3>

                {ideaText.length > 20 && category && location ? (
                  <AgentDashboard
                    idea={parsedIdea}
                    onAgentUpdate={(agent, data) => console.log(`${agent} updated:`, data)}
                  />
                ) : (
                  <div className="text-center p-8 border-2 border-dashed border-yellow-300 rounded-lg bg-yellow-50">
                    <p className="text-yellow-800 font-medium mb-2">⚠️ En attente...</p>
                    <p className="text-yellow-700 text-sm">Parle ou écris pour activer les agents.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMicroValidation && (
        <MicroValidation
          stepId={currentStepId}
          stepName="Décrire le problème"
          onComplete={(difficulty) => {
            setShowMicroValidation(false);
            if (difficulty < 3.5) console.warn('⚠️ Low task ease score');
            onSubmit(parsedIdea);
          }}
          onSkip={() => {
            setShowMicroValidation(false);
            onSubmit(parsedIdea);
          }}
        />
      )}
    </div>
  );
}
