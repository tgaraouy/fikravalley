/**
 * Voice-Guided Submission with All 7 Agents Active
 * 
 * Revolutionary submission experience:
 * - Voice dictation (user speaks, AI listens)
 * - All 7 agents participate in real-time
 * - Conversational, guided flow
 * - Live feedback as user writes/speaks
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import AgentDashboard from '@/components/agents/AgentDashboard';

interface VoiceGuidedSubmissionProps {
  onSubmit: (idea: any) => void;
  onSaveDraft: (idea: any) => void;
}

export default function VoiceGuidedSubmission({ onSubmit, onSaveDraft }: VoiceGuidedSubmissionProps) {
  // Voice recognition
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Form state
  const [ideaText, setIdeaText] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [currentSection, setCurrentSection] = useState<'problem' | 'solution' | 'evidence' | 'details'>('problem');
  
  // Agent guidance
  const [currentAgentMessage, setCurrentAgentMessage] = useState('');
  const [showAgentDashboard, setShowAgentDashboard] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(false);
  
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
        recognition.lang = 'fr-MA'; // Moroccan French
        
        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript;
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
            alert('🎤 Permission micro refusée. Va dans les paramètres de ton navigateur pour autoriser le micro.');
          } else if (event.error === 'no-speech') {
            // User stopped speaking, just stop
            setIsListening(false);
          }
        };
        
        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };
        
        recognitionRef.current = recognition;
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert('La reconnaissance vocale n\'est pas supportée sur ce navigateur. Utilisez Chrome ou Edge.');
      return;
    }
    
    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
      }
    } else {
      // Request microphone permission explicitly if available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (error) {
              console.error('Error starting recognition:', error);
              alert('Erreur lors du démarrage du micro. Réessaye.');
            }
          })
          .catch((error) => {
            console.error('Microphone permission denied:', error);
            alert('🎤 Permission micro requise! Autorise l\'accès au micro dans les paramètres de ton navigateur.');
          });
      } else {
        // Fallback: try to start recognition directly
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Error starting recognition:', error);
          alert('🎤 Permission micro requise! Autorise l\'accès au micro dans les paramètres de ton navigateur.');
        }
      }
    }
  }, [isListening]);

  // Get agent guidance based on current state
  const getAgentGuidance = useCallback(() => {
    if (ideaText.length < 20) {
      return "🎯 FIKRA: Clique sur 🎤 pour parler, ou commence à écrire ton problème...";
    }
    
    if (ideaText.length < 50) {
      return "🎯 FIKRA: Continue! Qui EXACTEMENT a ce problème? Où ça se passe?";
    }
    
    if (!ideaText.includes('CHU') && !ideaText.includes('hôpital') && !ideaText.includes('école')) {
      return "🎯 FIKRA: Sois plus spécifique! Quel lieu? Quel service?";
    }
    
    if (ideaText.split(' ').length < 30) {
      return "📊 SCORE: Bien! Maintenant, à quelle FRÉQUENCE ce problème arrive?";
    }
    
    if (!ideaText.toLowerCase().includes('hier') && !ideaText.toLowerCase().includes('vu') && !ideaText.toLowerCase().includes('vécu')) {
      return "🎯 FIKRA: As-tu VU ce problème de tes propres yeux? Raconte!";
    }
    
    return "✅ Excellent! Les agents analysent... Continue!";
  }, [ideaText]);

  useEffect(() => {
    setCurrentAgentMessage(getAgentGuidance());
  }, [ideaText, getAgentGuidance]);

  // Parse idea from text automatically
  const parsedIdea = {
    problem: {
      description: ideaText,
      who: '', // FIKRA will extract
      where: location || '',
      frequency: ''
    },
    solution: {
      description: '' // Will be asked after problem is clear
    },
    category,
    location
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: Writing Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-slate-900">
                <span className="text-terracotta-600">Raconte</span> ta <span className="text-brand-600">Fikra</span>
              </h1>
              <p className="text-lg text-slate-600">
                Parle ou écris. Les 7 agents IA t'écoutent et te guident en temps réel.
              </p>
            </div>

            {/* Agent Guidance Banner */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAgentMessage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-gradient-to-r from-terracotta-50 to-brand-50 border-l-4 border-terracotta-500 p-4 rounded-lg"
              >
                <p className="text-slate-800 font-medium">{currentAgentMessage || "Commence à écrire..."}</p>
              </motion.div>
            </AnimatePresence>

            {/* Main Writing Card */}
            <Card className="border-2 border-terracotta-200 shadow-xl">
              <CardContent className="p-6 space-y-4">
                {/* Voice Button */}
                <div className="flex justify-between items-center">
                  <Badge variant={isListening ? "default" : "outline"} className="text-sm">
                    {isListening ? '🎤 En écoute...' : voiceSupported ? '💭 Mode écrit' : '⌨️ Clavier uniquement'}
                  </Badge>
                  {voiceSupported ? (
                    <Button
                      onClick={toggleListening}
                      size="lg"
                      className={`${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                          : 'bg-terracotta-600 hover:bg-terracotta-700'
                      } text-white`}
                    >
                      {isListening ? '⏹️ Arrêter' : '🎤 Parler'}
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-slate-100">
                      🎤 Non supporté sur ce navigateur
                    </Badge>
                  )}
                </div>

                {/* Text Area */}
                <div className="relative">
                  <textarea
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    placeholder="Commence par le problème... Ex: 'Les infirmières au CHU Ibn Sina passent 20 minutes à chercher le matériel...'"
                    className="w-full min-h-[300px] p-4 border-2 border-slate-200 rounded-lg focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 resize-none text-lg"
                    dir="auto"
                  />
                  
                  {/* Interim transcript (what's being spoken now) */}
                  {interimTranscript && (
                    <div className="absolute bottom-2 left-2 right-2 bg-blue-50 border border-blue-200 rounded p-2 text-blue-700 text-sm italic">
                      {interimTranscript}
                    </div>
                  )}
                </div>

                {/* Word count & Progress */}
                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span>{ideaText.split(' ').filter(w => w).length} mots</span>
                  <span>
                    {ideaText.length < 50 && '🟡 Continue...'}
                    {ideaText.length >= 50 && ideaText.length < 100 && '🟢 Bien!'}
                    {ideaText.length >= 100 && '🔥 Excellent!'}
                  </span>
                </div>

                {/* Quick Info */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Sélectionne...</option>
                      <option value="sante">🏥 Santé</option>
                      <option value="education">📚 Éducation</option>
                      <option value="agriculture">🌾 Agriculture</option>
                      <option value="tech">💻 Tech</option>
                      <option value="commerce">🏪 Commerce</option>
                      <option value="transport">🚗 Transport</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ville
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Sélectionne...</option>
                      <option value="casablanca">Casablanca</option>
                      <option value="rabat">Rabat</option>
                      <option value="fes">Fès</option>
                      <option value="marrakech">Marrakech</option>
                      <option value="tanger">Tanger</option>
                      <option value="agadir">Agadir</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => onSaveDraft(parsedIdea)}
                    variant="outline"
                    className="flex-1"
                  >
                    💾 Sauvegarder
                  </Button>
                  <Button
                    onClick={() => onSubmit(parsedIdea)}
                    disabled={ideaText.length < 50}
                    className="flex-1 bg-terracotta-600 hover:bg-terracotta-700"
                  >
                    🚀 Valider avec les Agents
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-bold text-blue-900 mb-2">💡 Astuce Fikra:</h3>
                <p className="text-blue-800 text-sm">
                  Les meilleures idées sont <strong>spécifiques</strong>. Ne dis pas "les gens ont des problèmes", 
                  mais "Les infirmières du CHU Ibn Sina passent 4h par jour à chercher le matériel". 
                  Donne des <strong>noms, lieux, chiffres</strong>!
                </p>
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
                    onAgentUpdate={(agent, data) => {
                      console.log(`${agent} updated:`, data);
                    }}
                  />
                ) : ideaText.length > 20 && (!category || !location) ? (
                  <div className="text-center p-8 border-2 border-dashed border-yellow-300 rounded-lg bg-yellow-50">
                    <p className="text-yellow-800 font-medium mb-2">⚠️ Presque prêt!</p>
                    <p className="text-yellow-700 text-sm">Sélectionne la <strong>Catégorie</strong> et la <strong>Ville</strong> ci-dessus pour activer les agents.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { icon: '🎯', name: 'FIKRA', status: 'En attente...' },
                      { icon: '📊', name: 'SCORE', status: 'En attente...' },
                      { icon: '📸', name: 'PROOF', status: 'En attente...' },
                      { icon: '🤝', name: 'MENTOR', status: 'Prêt' },
                      { icon: '📄', name: 'DOC', status: 'Prêt' },
                      { icon: '🌐', name: 'NETWORK', status: 'Prêt' },
                      { icon: '🎓', name: 'COACH', status: 'Prêt' },
                    ].map((agent) => (
                      <div key={agent.name} className="flex items-center gap-3 p-2 border rounded opacity-50">
                        <span className="text-2xl">{agent.icon}</span>
                        <div>
                          <div className="font-semibold text-sm">{agent.name}</div>
                          <div className="text-xs text-slate-500">{agent.status}</div>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-center text-slate-500 pt-2">
                      👆 Commence à écrire pour activer les agents
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Card */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-bold text-green-900 mb-3">📈 Progression</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clarté</span>
                      <span>{Math.min(100, Math.floor((ideaText.length / 200) * 100))}%</span>
                    </div>
                    <Progress value={Math.min(100, (ideaText.length / 200) * 100)} className="h-2" />
                    
                    <div className="pt-2 text-xs text-green-800">
                      {ideaText.length < 50 && '✍️ Continue à écrire...'}
                      {ideaText.length >= 50 && ideaText.length < 100 && '🎯 Ajoute plus de détails spécifiques'}
                      {ideaText.length >= 100 && ideaText.length < 200 && '💪 Excellent! Parle de la fréquence du problème'}
                      {ideaText.length >= 200 && '🔥 Parfait! Tu peux valider avec les agents!'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

