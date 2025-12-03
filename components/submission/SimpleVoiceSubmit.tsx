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
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import PrivacyProtectionBadge from '@/components/PrivacyProtectionBadge';

interface SimpleVoiceSubmitProps {
  onSubmit: (transcript: string, contactInfo: { email?: string; phone?: string; name?: string }, extractedData?: any) => void;
}

export default function SimpleVoiceSubmit({ onSubmit }: SimpleVoiceSubmitProps) {
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
  
  // Real-time agent processing features (production mode)
  const [autoProcess, setAutoProcess] = useState(true); // Auto-process enabled by default
  const [agentResult, setAgentResult] = useState<any>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [extractedFields, setExtractedFields] = useState<any>(null); // Visible extracted fields
  const [currentInstruction, setCurrentInstruction] = useState<string>(''); // Real-time guidance
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedText = useRef<string>('');

  // Use stable Vercel AI SDK voice recorder
  const {
    isRecording,
    isTranscribing,
    transcript,
    error: recorderError,
    startRecording: startVoiceRecording,
    stopRecording: stopVoiceRecording,
    clearTranscript,
    setTranscript: setTranscriptManually,
  } = useVoiceRecorder({
    language: language === 'darija' ? 'darija' : language === 'fr' ? 'fr' : 'en',
    onTranscription: (text) => {
      // Auto-process when new transcription arrives
      if (autoProcess && text.length > 20) {
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
        
        processingTimeoutRef.current = setTimeout(() => {
          if (text !== lastProcessedText.current) {
            lastProcessedText.current = text;
            processWithAgent1(text);
          }
        }, 2000);
      }
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Voice recorder error:', error);
      }
    },
  });

  useEffect(() => {
    // Detect language
    const detected = detectLanguage();
    setLanguage(detected);
    
    // Set initial instruction
    setCurrentInstruction('💡 Cliquez sur le micro et parlez de votre idée...');
  }, []);

  // Wrapper functions for UI buttons (use hook's functions)
  const handleStartDictation = () => {
    startVoiceRecording(); // From useVoiceRecorder hook
  };

  const handleStopDictation = () => {
    stopVoiceRecording(); // From useVoiceRecorder hook
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
    if (edited !== null && edited !== transcript) {
      setTranscriptManually(edited);
      updatePrompt(edited);
    }
  };

  // Process with Agent 1 (real-time or manual) - Production mode
  const processWithAgent1 = async (text: string) => {
    if (!text || text.length < 20) return;
    
    setAgentLoading(true);
    setAgentResult(null);
    setCurrentInstruction('🤖 Analyse de votre idée en cours...');
    
    try {
      const response = await fetch('/api/agents/conversation-extractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speaker_quote: text,
          speaker_email: contactInfo.email || null,
          speaker_phone: contactInfo.phone || null,
        })
      });

      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('Agent 1 Response:', data);
      }
      setAgentResult(data);
      
      // If extraction successful, update extracted data and show fields
      if (data.success && data.data) {
        const extracted = data.data;
        const extractedDataObj = {
          title: extracted.problem_title || text.split('.')[0].substring(0, 100) || text.substring(0, 100),
          problem_statement: extracted.problem_statement || text,
          proposed_solution: extracted.proposed_solution || null,
          current_manual_process: extracted.current_manual_process || null,
          digitization_opportunity: extracted.digitization_opportunity || null,
          category: extracted.category || 'other',
          location: extracted.location || 'other',
          confidence_score: extracted.confidence_score,
          needs_clarification: extracted.needs_clarification,
          validation_question: extracted.validation_question,
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Setting extracted fields:', extractedDataObj);
        }
        
        setExtractedData(extractedDataObj);
        setExtractedFields(extractedDataObj); // Show extracted fields to user
        
        // Provide guidance based on extraction
        if (extracted.needs_clarification && extracted.validation_question) {
          setCurrentInstruction(`❓ ${extracted.validation_question}`);
        } else if (extracted.confidence_score && extracted.confidence_score >= 0.85) {
          setCurrentInstruction('✅ Idée bien comprise ! Vous pouvez continuer à parler ou soumettre.');
        } else {
          setCurrentInstruction('💡 Continuez à parler pour enrichir votre idée...');
        }
      } else {
        // If extraction failed, still populate with basic data from transcript
        if (process.env.NODE_ENV === 'development') {
          console.log('Extraction failed, using fallback data');
        }
        const fallbackData = {
          title: text.split('.')[0].substring(0, 100) || text.substring(0, 100),
          problem_statement: text,
          proposed_solution: null,
          category: 'other',
          location: 'other',
        };
        setExtractedFields(fallbackData);
        setCurrentInstruction('💡 Parlez plus en détail sur votre problème et solution...');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error processing with Agent 1:', error);
      }
      // On error, still populate with basic data
      const fallbackData = {
        title: text.split('.')[0].substring(0, 100) || text.substring(0, 100),
        problem_statement: text,
        proposed_solution: null,
        category: 'other',
        location: 'other',
      };
      setExtractedFields(fallbackData);
      setCurrentInstruction('⚠️ Erreur lors de l\'analyse. Les champs ont été remplis avec votre texte. Vous pouvez les modifier.');
    } finally {
      setAgentLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim() && !extractedFields?.problem_statement) return;
    
    // Use edited fields if available, otherwise use transcript
    const contentToCheck = extractedFields?.problem_statement || transcript;
    
    // Final moderation check
    const moderation = moderateContent(contentToCheck, { type: 'voice', strict: true });
    if (!moderation.allowed) {
      setModerationError(moderation.reason || 'Contenu inapproprié. Veuillez reformuler votre message.');
      return;
    }
    
    // If we already have extracted fields (from real-time processing), use them directly
    if (extractedFields && extractedFields.title && extractedFields.problem_statement) {
      // Use the edited fields directly - show contact form or submit
      setExtractedData(extractedFields);
      
      // Show contact form if not filled, otherwise submit directly
      if (!contactInfo.email && !contactInfo.phone) {
        setShowContactForm(true);
      } else {
        handleFinalSubmit(extractedFields);
      }
      return;
    }
    
    // Otherwise, use Agent 1 for extraction
    setIsExtracting(true);
    await processWithAgent1(transcript);
    
    // If we have extracted data from Agent 1, populate fields and show contact form if needed
    if (extractedData) {
      // Populate extractedFields for editing
      setExtractedFields({
        title: extractedData.title,
        problem_statement: extractedData.problem_statement,
        proposed_solution: extractedData.proposed_solution,
        current_manual_process: extractedData.current_manual_process,
        digitization_opportunity: extractedData.digitization_opportunity,
        category: extractedData.category || 'other',
        location: extractedData.location || 'other',
      });
      
      // Show contact form if not filled, otherwise submit directly
      if (!contactInfo.email && !contactInfo.phone) {
        setShowContactForm(true);
      } else {
        handleFinalSubmit(extractedData);
      }
    } else {
      // Fallback: use basic extraction
      const fallbackData = {
        title: transcript.split('.')[0].substring(0, 100) || transcript.substring(0, 100),
        problem_statement: transcript,
        category: 'other',
        location: 'other',
      };
      setExtractedData(fallbackData);
      setExtractedFields(fallbackData);
      
      // Show contact form if not filled, otherwise submit directly
      if (!contactInfo.email && !contactInfo.phone) {
        setShowContactForm(true);
      } else {
        handleFinalSubmit(fallbackData);
      }
    }
    
    setIsExtracting(false);
  };

  const handleFieldsConfirmed = (confirmedData: any) => {
    setExtractedData(confirmedData);
    // Update extractedFields with confirmed data for display
    setExtractedFields(confirmedData);
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
    
    // Use edited fields if available, otherwise use provided data
    const finalData = extractedFields && extractedFields.title && extractedFields.problem_statement
      ? extractedFields
      : dataToSubmit;
    
    // Submit in background with final data
    onSubmit(transcript, contactInfo, finalData);
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
    
    // Submit with extracted data (use edited fields if available)
    setShowContactForm(false);
    const dataToSubmit = extractedFields && extractedFields.title && extractedFields.problem_statement
      ? extractedFields
      : extractedData || {
          title: transcript.split('.')[0].substring(0, 100) || transcript.substring(0, 100),
          problem_statement: transcript,
          category: 'other',
          location: 'other',
        };
    handleFinalSubmit(dataToSubmit);
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

      <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24 md:pb-8 safe-area-bottom">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-slate-900">💡 Soumettre votre idée</h1>

          {/* Privacy Protection Badge */}
          <PrivacyProtectionBadge variant="full" showLink={true} />

          {/* Input Form - Replicate Test Page Flow */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Votre idée</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">
                    Décrivez votre idée (Required) *
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={autoProcess}
                        onChange={(e) => setAutoProcess(e.target.checked)}
                        className="rounded"
                      />
                      Auto-process (real-time)
                    </label>
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartDictation}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        🎤 Start Dictation
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopDictation}
                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                      >
                        ⏹️ Stop Dictation
                      </button>
                    )}
                  </div>
                </div>
                {/* Status Banner - Prominent feedback */}
                {isRecording && (
                  <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-semibold text-red-800">🎤 Enregistrement en cours...</p>
                      <p className="text-xs text-red-600">Parlez maintenant. La transcription commencera quand vous arrêterez.</p>
                    </div>
                  </div>
                )}
                {isTranscribing && (
                  <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className="font-semibold text-blue-800">🔄 Transcription en cours...</p>
                      <p className="text-xs text-blue-600">Whisper est en train de transcrire votre voix (3-5 secondes)...</p>
                    </div>
                  </div>
                )}
                {agentLoading && (
                  <div className="mb-4 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className="font-semibold text-purple-800">🤖 Analyse de votre idée...</p>
                      <p className="text-xs text-purple-600">Extraction du titre, catégorie, lieu, problème et solution...</p>
                    </div>
                  </div>
                )}
                {extractedFields && !agentLoading && !isTranscribing && (
                  <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">✅ Informations extraites avec succès !</p>
                      <p className="text-xs text-green-600">Vérifiez les champs ci-dessous et modifiez si nécessaire.</p>
                    </div>
                  </div>
                )}
                {recorderError && (
                  <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <p className="font-semibold text-red-800">⚠️ Erreur</p>
                    <p className="text-sm text-red-700 mt-1">{recorderError}</p>
                  </div>
                )}
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscriptManually(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={6}
                  placeholder="Parlez de votre idée en Darija, Tamazight, ou Français. Ou cliquez 'Start Dictation' pour parler."
                />
              </div>

              {/* Real-time Instruction */}
              {currentInstruction && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">{currentInstruction}</p>
                </div>
              )}

            </div>
          </div>

          {/* Extracted Fields - Always Visible and Editable */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Informations extraites</h2>
              {extractedFields && (extractedFields.title || extractedFields.problem_statement) && (
                <span className="text-sm text-green-600 font-medium">✓ Modifiable</span>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {extractedFields && (extractedFields.title || extractedFields.problem_statement) 
                ? 'Modifiez les champs ci-dessous si nécessaire avant de soumettre.'
                : 'Ces champs seront remplis automatiquement après l\'analyse de votre idée.'}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  type="text"
                  value={extractedFields?.title || ''}
                  onChange={(e) => setExtractedFields((prev: any) => ({ ...prev, title: e.target.value }))}
                  placeholder="Sera extrait automatiquement..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <select
                  value={extractedFields?.category || 'other'}
                  onChange={(e) => setExtractedFields((prev: any) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
                >
                  <option value="other">Sera détectée automatiquement...</option>
                  <option value="health">Santé</option>
                  <option value="education">Éducation</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="tech">Technologie</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="administration">Administration</option>
                  <option value="logistics">Logistique</option>
                  <option value="finance">Finance</option>
                  <option value="customer_service">Service Client</option>
                  <option value="inclusion">Inclusion</option>
                  <option value="tourism">Tourisme</option>
                  <option value="environment">Environnement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lieu</label>
                <select
                  value={extractedFields?.location || 'other'}
                  onChange={(e) => setExtractedFields((prev: any) => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
                >
                  <option value="other">Mentionnez la ville ou région...</option>
                  <option value="casablanca">Casablanca</option>
                  <option value="rabat">Rabat</option>
                  <option value="marrakech">Marrakech</option>
                  <option value="kenitra">Kenitra</option>
                  <option value="tangier">Tanger</option>
                  <option value="agadir">Agadir</option>
                  <option value="fes">Fès</option>
                  <option value="oujda">Oujda</option>
                  <option value="tanger">Tanger</option>
                  <option value="meknes">Meknès</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description du problème</label>
                <textarea
                  value={extractedFields?.problem_statement || ''}
                  onChange={(e) => setExtractedFields((prev: any) => ({ ...prev, problem_statement: e.target.value }))}
                  placeholder="Décrivez le problème..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Solution proposée</label>
                <textarea
                  value={extractedFields?.proposed_solution || ''}
                  onChange={(e) => setExtractedFields((prev: any) => ({ ...prev, proposed_solution: e.target.value }))}
                  placeholder="Expliquez votre solution..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Processus manuel actuel <span className="text-slate-400 font-normal text-xs">(optionnel)</span>
                </label>
                <textarea
                  value={extractedFields?.current_manual_process || ''}
                  onChange={(e) => setExtractedFields((prev: any) => ({ ...prev, current_manual_process: e.target.value }))}
                  placeholder="Comment le problème est résolu actuellement ? Ex: 'Les gens jettent les déchets dans la rue. La municipalité envoie des camions une fois par semaine.'"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Opportunité de numérisation <span className="text-slate-400 font-normal text-xs">(optionnel)</span>
                </label>
                <textarea
                  value={extractedFields?.digitization_opportunity || ''}
                  onChange={(e) => setExtractedFields((prev: any) => ({ ...prev, digitization_opportunity: e.target.value }))}
                  placeholder="Comment la technologie peut améliorer ce processus ? Ex: 'Une app mobile pour signaler les déchets, avec système de points/récompenses pour motiver la participation.'"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>
            </div>

          </div>

          {/* Guidance Section - Help users structure their ideas */}
          {extractedFields && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span>💡</span>
                Comment structurer votre idée ?
              </h3>
              <div className="text-xs text-blue-800 space-y-2">
                <p><strong>1. Le problème :</strong> Décrivez clairement le problème. Qui est affecté ? Où ? À quelle fréquence ?</p>
                <p><strong>2. Le processus actuel :</strong> Comment est-ce résolu maintenant ? (manuellement, avec quelles difficultés ?)</p>
                <p><strong>3. La solution digitale :</strong> Comment la technologie peut améliorer cela ? (app, plateforme, système ?)</p>
                <p><strong>4. L'opportunité :</strong> Pourquoi maintenant ? Quel est le gain (temps, coût, qualité) ?</p>
              </div>
            </div>
          )}

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
            
            {/* Confidence indicator - from Agent 1 result */}
            {agentResult?.confidence_score && agentResult.confidence_score < 0.85 && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  ⚠️ Précision: {Math.round(agentResult.confidence_score * 100)}% - Vérifie la transcription
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
            
            {/* Manual Analysis Button (if auto-process disabled) */}
            {!autoProcess && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => processWithAgent1(transcript)}
                  disabled={!transcript || agentLoading}
                  className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {agentLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyse en cours...
                    </span>
                  ) : (
                    '🔍 Analyser mon idée'
                  )}
                </button>
              </div>
            )}
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

          {/* Submit Button - Always visible when transcript exists or fields are filled */}
          {!isRecording && !showContactForm && (
            <div className="mt-8 mb-8 sticky bottom-4 z-10 bg-slate-50 p-4 rounded-lg border-2 border-green-300 shadow-xl">
              <button
                onClick={handleSubmit}
                disabled={isProcessing || isExtracting || showFieldsConfirmation || (!transcript && !(extractedFields && (extractedFields.title || extractedFields.problem_statement)))}
                className="w-full bg-green-600 text-white py-5 px-6 rounded-lg font-bold text-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {showFieldsConfirmation ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>⏳ Vérification en cours...</span>
                  </>
                ) : isExtracting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>⏳ Analyse en cours...</span>
                  </>
                ) : isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>⏳ Envoi...</span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>سّبق الفكرة (Submit)</span>
                  </>
                )}
              </button>
              <p className="text-xs text-slate-600 text-center mt-3 font-medium">
                {!transcript && !(extractedFields && (extractedFields.title || extractedFields.problem_statement)) 
                  ? '⚠️ Entrez votre idée dans le champ ci-dessus pour activer le bouton'
                  : transcript 
                    ? '✓ Vérifiez les informations extraites ci-dessus avant de soumettre'
                    : '✓ Remplissez les champs ci-dessus pour soumettre votre idée'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

