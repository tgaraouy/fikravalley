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
import { CATEGORIES, MOROCCAN_CITIES } from '@/lib/categories';

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

  // Smart agent guidance based on content analysis
  const getAgentGuidance = useCallback(() => {
    const text = ideaText.toLowerCase();
    const words = ideaText.split(' ').filter(w => w);
    const wordCount = words.length;
    
    // Phase 1: Get them started
    if (wordCount < 10) {
      return "🎯 FIKRA: Raconte-moi le problème que tu as observé. Commence par 'J'ai vu que...' ou 'J'ai remarqué que...'";
    }
    
    // Phase 2: Analyze what they said and ask specific follow-ups
    if (wordCount < 30) {
      // Check if they mentioned a general group
      if (text.includes('touristes') || text.includes('gens') || text.includes('personnes') || text.includes('clients')) {
        return "🎯 FIKRA: Qui EXACTEMENT? Par exemple: 'Touristes français de 30-40 ans' ou 'Familles avec enfants de Casablanca'. Sois précis!";
      }
      if (text.includes('maroc') || text.includes('casa') || text.includes('rabat')) {
        return "📊 SCORE: Bien! Maintenant, combien de personnes? Par exemple: '3 de mes amis sur 5' ou '80% des touristes que je connais'";
      }
      return "🎯 FIKRA: Continue! Qui EXACTEMENT a vécu ce problème? Donne-moi des noms ou des chiffres.";
    }
    
    // Phase 3: Get frequency and specificity
    if (wordCount < 60) {
      // Check if they gave specifics
      const hasNumbers = /\d+/.test(text);
      const hasFrequency = text.includes('fois') || text.includes('chaque') || text.includes('souvent') || text.includes('toujours');
      
      if (!hasNumbers && !hasFrequency) {
        return "📊 SCORE: À quelle FRÉQUENCE ça arrive? Dis-moi: 'Chaque semaine', '3 fois sur 10', '80% du temps'...";
      }
      
      // Check if they mentioned lived experience
      const hasLivedExp = text.includes('vu') || text.includes('vécu') || text.includes('hier') || 
                          text.includes('observé') || text.includes('passé') || text.includes('copains') ||
                          text.includes('amis') || text.includes('famille');
      
      if (!hasLivedExp) {
        return "🎯 FIKRA: As-tu VU ce problème toi-même? Raconte-moi UNE histoire spécifique. Par exemple: 'Hier, j'ai vu mon ami Pierre...'";
      }
      
      return "💪 SCORE: Bien! Maintenant dis-moi: Que font-ils ACTUELLEMENT pour résoudre ce problème?";
    }
    
    // Phase 4: Get current solution and impact
    if (wordCount < 100) {
      const hasSolution = text.includes('actuellement') || text.includes('maintenant') || 
                         text.includes('font') || text.includes('utilisent') || text.includes('essaient');
      
      if (!hasSolution) {
        return "📊 SCORE: Que font-ils pour résoudre ce problème MAINTENANT? Par exemple: 'Ils utilisent WhatsApp' ou 'Ils ne font rien'";
      }
      
      return "🎯 FIKRA: Parfait! Quel est le COÛT de ce problème? Temps perdu? Argent perdu? Frustration?";
    }
    
    // Phase 5: Solution ideation
    if (wordCount >= 100) {
      const hasSolutionIdea = text.includes('solution') || text.includes('idée') || 
                             text.includes('proposer') || text.includes('créer');
      
      if (!hasSolutionIdea) {
        return "💡 FIKRA: Excellente analyse! Maintenant, quelle est TON IDÉE de solution? Comment tu vois ça?";
      }
      
      return "🎉 SCORE: Bravo! Tu as une base solide. Clique 'Valider avec les Agents' pour l'analyse complète!";
    }
    
    return "✅ Continue, tu es sur la bonne voie!";
  }, [ideaText]);

  useEffect(() => {
    setCurrentAgentMessage(getAgentGuidance());
  }, [ideaText, getAgentGuidance]);

  // Parse idea from text automatically
  const parsedIdea = {
    description: ideaText,  // Main text
    problem: {
      description: ideaText,
      who: '', // FIKRA will extract
      where: location || '',
      frequency: ''
    },
    solution: {
      description: '' // Will be asked after problem is clear
    },
    category: category || '',
    location: location || ''
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
                Les agents IA te posent des questions. Réponds en parlant ou écrivant.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <span className="px-3 py-1 bg-terracotta-50 rounded-full">🎤 Parle naturellement</span>
                <span className="px-3 py-1 bg-brand-50 rounded-full">🤖 Agents te guident</span>
                <span className="px-3 py-1 bg-green-50 rounded-full">⚡ 5-10 minutes</span>
              </div>
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
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 bg-white"
                    >
                      <option value="">Sélectionne une catégorie...</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {CATEGORIES.length} catégories disponibles
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ville <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200 bg-white"
                    >
                      <option value="">Sélectionne une ville...</option>
                      {/* Group by region */}
                      {Array.from(new Set(MOROCCAN_CITIES.map(c => c.region || 'Autre'))).map((region) => {
                        const citiesInRegion = MOROCCAN_CITIES.filter(c => (c.region || 'Autre') === region);
                        return (
                          <optgroup key={region} label={region}>
                            {citiesInRegion.map((city) => (
                              <option key={city.value} value={city.value}>
                                {city.label}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {MOROCCAN_CITIES.length} villes disponibles
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => onSaveDraft(parsedIdea)}
                    variant="outline"
                    className="flex-1"
                    disabled={ideaText.length < 20}
                  >
                    💾 Sauvegarder
                  </Button>
                  <Button
                    onClick={() => onSubmit(parsedIdea)}
                    disabled={ideaText.length < 50 || !category || !location}
                    className="flex-1 bg-terracotta-600 hover:bg-terracotta-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      ideaText.length < 50 
                        ? 'Écris au moins 50 caractères' 
                        : !category 
                        ? 'Sélectionne une catégorie'
                        : !location
                        ? 'Sélectionne une ville'
                        : 'Valider avec les agents'
                    }
                  >
                    🚀 Valider avec les Agents
                  </Button>
                </div>
                
                {/* Validation Messages */}
                {(ideaText.length >= 20 || category || location) && (
                  <div className="text-xs text-slate-600 text-center pt-2">
                    {!category && '⚠️ Sélectionne une catégorie '}
                    {!location && '⚠️ Sélectionne une ville '}
                    {ideaText.length < 50 && `⚠️ Écris encore ${50 - ideaText.length} caractères`}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workflow Progress */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <h3 className="font-bold text-purple-900 mb-3">📍 Ton Parcours:</h3>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 ${ideaText.split(' ').length >= 10 ? 'text-green-700' : 'text-slate-400'}`}>
                    <span>{ideaText.split(' ').length >= 10 ? '✅' : '⭕'}</span>
                    <span className="text-sm">1. Problème décrit</span>
                  </div>
                  <div className={`flex items-center gap-2 ${ideaText.split(' ').length >= 30 ? 'text-green-700' : 'text-slate-400'}`}>
                    <span>{ideaText.split(' ').length >= 30 ? '✅' : '⭕'}</span>
                    <span className="text-sm">2. Qui? Combien? Où?</span>
                  </div>
                  <div className={`flex items-center gap-2 ${ideaText.split(' ').length >= 60 ? 'text-green-700' : 'text-slate-400'}`}>
                    <span>{ideaText.split(' ').length >= 60 ? '✅' : '⭕'}</span>
                    <span className="text-sm">3. Fréquence + Expérience vécue</span>
                  </div>
                  <div className={`flex items-center gap-2 ${ideaText.split(' ').length >= 100 ? 'text-green-700' : 'text-slate-400'}`}>
                    <span>{ideaText.split(' ').length >= 100 ? '✅' : '⭕'}</span>
                    <span className="text-sm">4. Solution actuelle + Coût</span>
                  </div>
                  <div className={`flex items-center gap-2 ${ideaText.split(' ').length >= 120 ? 'text-green-700' : 'text-slate-400'}`}>
                    <span>{ideaText.split(' ').length >= 120 ? '✅' : '⭕'}</span>
                    <span className="text-sm">5. Ton idée de solution</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contextual Tips */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-bold text-blue-900 mb-2">💡 Exemple:</h3>
                <p className="text-blue-800 text-sm">
                  {ideaText.split(' ').length < 30 ? (
                    <>
                      <strong>"3 de mes amis français</strong> sont venus à Marrakech pour 10 jours. 
                      <strong>Aucun</strong> ne veut revenir. Ils disent: 'On a tout vu'."
                    </>
                  ) : ideaText.split(' ').length < 60 ? (
                    <>
                      <strong>"J'ai demandé à 8 touristes</strong> au Riad où je travaille. 
                      <strong>6 sur 8</strong> ne reviendront pas. Ils trouvent que..."
                    </>
                  ) : ideaText.split(' ').length < 100 ? (
                    <>
                      <strong>"Actuellement, ils suivent juste TripAdvisor.</strong> Mais ça montre que les sites touristiques classiques. 
                      Ils ratent 80% des expériences authentiques..."
                    </>
                  ) : (
                    <>
                      <strong>"Mon idée:</strong> Une app qui connecte les touristes avec des locaux pour des expériences authentiques. 
                      Pas les sites classiques, mais la vraie vie marocaine."
                    </>
                  )}
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

              {/* Progress Card with Stages */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-bold text-green-900 mb-3">📈 Ta Position</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {ideaText.split(' ').length < 30 && 'Phase 1: Décrire'}
                        {ideaText.split(' ').length >= 30 && ideaText.split(' ').length < 60 && 'Phase 2: Préciser'}
                        {ideaText.split(' ').length >= 60 && ideaText.split(' ').length < 100 && 'Phase 3: Quantifier'}
                        {ideaText.split(' ').length >= 100 && ideaText.split(' ').length < 120 && 'Phase 4: Analyser'}
                        {ideaText.split(' ').length >= 120 && 'Phase 5: Solutions'}
                      </span>
                      <span className="font-bold text-green-700">
                        {Math.min(100, Math.floor((ideaText.split(' ').length / 120) * 100))}%
                      </span>
                    </div>
                    <Progress value={Math.min(100, (ideaText.split(' ').length / 120) * 100)} className="h-3" />
                    
                    <div className="pt-2 text-xs text-green-800 font-medium">
                      {ideaText.split(' ').length < 10 && '✍️ Raconte le problème que tu as observé'}
                      {ideaText.split(' ').length >= 10 && ideaText.split(' ').length < 30 && '🎯 Qui EXACTEMENT? Donne des noms, lieux'}
                      {ideaText.split(' ').length >= 30 && ideaText.split(' ').length < 60 && '📊 Combien? À quelle fréquence?'}
                      {ideaText.split(' ').length >= 60 && ideaText.split(' ').length < 100 && '💪 As-tu VU ça? Raconte une histoire vraie'}
                      {ideaText.split(' ').length >= 100 && ideaText.split(' ').length < 120 && '💡 Quelle est ta solution?'}
                      {ideaText.split(' ').length >= 120 && '🔥 Prêt! Clique "Valider avec les Agents"'}
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

