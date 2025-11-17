'use client';

/**
 * Progressive Disclosure Idea Submission Form
 * 
 * 7-step guided process with auto-save, real-time scoring, and bilingual support
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Step1Problem from '@/components/submission/steps/Step1Problem';
import Step2AsIs from '@/components/submission/steps/Step2AsIs';
import Step3Benefits from '@/components/submission/steps/Step3Benefits';
import Step4Solution from '@/components/submission/steps/Step4Solution';
import Step5Evidence from '@/components/submission/steps/Step5Evidence';
import Step6Operations from '@/components/submission/steps/Step6Operations';
import Step7Review from '@/components/submission/steps/Step7Review';
import ClarityFeedbackDisplay from '@/components/submission/ClarityFeedback';
import AIAgentChat from '@/components/ai/AIAgentChat';
import AISuggestionAgent from '@/components/ai/AISuggestionAgent';
import AIAnalysisAgent from '@/components/ai/AIAnalysisAgent';
import { Combobox } from '@/components/ui/combobox';
import { CATEGORIES, MOROCCAN_CITIES } from '@/lib/categories';
import { scoreProblemStatement, scoreAsIsAnalysis, scoreBenefitStatement, scoreOperationalNeeds } from '@/lib/idea-bank/scoring';
import type { IdeaScoringInput } from '@/lib/idea-bank/scoring';

interface ProcessStep {
  id: string;
  description: string;
  timeMinutes: number;
  costEur: number;
}

const STEPS = [
  { id: 1, name: 'Problème', icon: '❓' },
  { id: 2, name: 'Actuel', icon: '📋' },
  { id: 3, name: 'Bénéfices', icon: '💰' },
  { id: 4, name: 'Solution', icon: '💡' },
  { id: 5, name: 'Preuves', icon: '📸' },
  { id: 6, name: 'Opérations', icon: '⚙️' },
  { id: 7, name: 'Révision', icon: '✅' },
];

export default function SubmitIdeaPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Form data
  const [language, setLanguage] = useState<'fr' | 'ar' | 'darija'>('fr');
  const [problemStatement, setProblemStatement] = useState('');
  const [asIsAnalysis, setAsIsAnalysis] = useState('');
  const [benefitStatement, setBenefitStatement] = useState('');
  const [solution, setSolution] = useState('');
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [timeSavedHours, setTimeSavedHours] = useState(0);
  const [costSavedEur, setCostSavedEur] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [dataSources, setDataSources] = useState<string[]>([]);
  const [integrationPoints, setIntegrationPoints] = useState<string[]>([]);
  const [aiCapabilities, setAiCapabilities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [ocrText, setOcrText] = useState('');
  const [baridCashVerified, setBaridCashVerified] = useState(false);
  const [teamSize, setTeamSize] = useState(0);
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [moroccoPriorities, setMoroccoPriorities] = useState<string[]>([]);
  const [otherAlignment, setOtherAlignment] = useState('');
  
  // Submitter contact information
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitterPhone, setSubmitterPhone] = useState('');
  const [submitterType, setSubmitterType] = useState<string>('');
  const [submitterSkills, setSubmitterSkills] = useState<string[]>([]);

  // Calculate clarity score in real-time
  const calculateClarityScore = useCallback(() => {
    const input: IdeaScoringInput = {
      problemStatement,
      asIsAnalysis,
      benefitStatement,
      operationalNeeds: '', // Will be calculated from dataSources, etc.
      dataSources,
      integrationPoints,
      aiCapabilitiesNeeded: aiCapabilities,
    };

    const problemScore = scoreProblemStatement(input);
    const asIsScore = scoreAsIsAnalysis(input);
    const benefitScore = scoreBenefitStatement(input);
    const operationalScore = scoreOperationalNeeds(input);

    return (problemScore + asIsScore + benefitScore + operationalScore) / 4;
  }, [problemStatement, asIsAnalysis, benefitStatement, dataSources, integrationPoints, aiCapabilities]);

  const clarityScore = calculateClarityScore();


  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [problemStatement, asIsAnalysis, benefitStatement, solution]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('fikravalley_submission_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setProblemStatement(data.problemStatement || '');
        setAsIsAnalysis(data.asIsAnalysis || '');
        setBenefitStatement(data.benefitStatement || '');
        setSolution(data.solution || '');
        setTimeSavedHours(data.timeSavedHours || 0);
        setCostSavedEur(data.costSavedEur || 0);
        setEstimatedCost(data.estimatedCost || '');
        setDataSources(data.dataSources || []);
        setIntegrationPoints(data.integrationPoints || []);
        setAiCapabilities(data.aiCapabilities || []);
        setLocation(data.location || '');
        setCategory(data.category || '');
        setMoroccoPriorities(data.moroccoPriorities || []);
        setOtherAlignment(data.otherAlignment || '');
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);

  const saveDraft = () => {
    const draft = {
      problemStatement,
      asIsAnalysis,
      benefitStatement,
      solution,
      timeSavedHours,
      costSavedEur,
      estimatedCost,
      dataSources,
      integrationPoints,
      aiCapabilities,
      location,
      category,
      moroccoPriorities,
      otherAlignment,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem('fikravalley_submission_draft', JSON.stringify(draft));
    setLastSaved(new Date());
  };

  const handleNext = () => {
    saveDraft();
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    saveDraft();

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || problemStatement.substring(0, 100),
          problem_statement: problemStatement,
          current_manual_process: asIsAnalysis,
          digitization_opportunity: benefitStatement,
          proposed_solution: solution,
          roi_time_saved_hours: timeSavedHours,
          roi_cost_saved_eur: costSavedEur,
          estimated_cost: estimatedCost,
          data_sources: dataSources,
          integration_points: integrationPoints,
          ai_capabilities_needed: aiCapabilities,
          location,
          category,
          status: 'submitted',
          submitted_via: 'web',
          alignment: {
            morocco_priorities: moroccoPriorities,
            other_alignment: otherAlignment,
          },
          submitter_name: submitterName,
          submitter_email: submitterEmail,
          submitter_phone: submitterPhone || null,
          submitter_type: submitterType,
          submitter_skills: submitterSkills,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission');
      }

      const result = await response.json();

      // Clear draft
      localStorage.removeItem('fikravalley_submission_draft');

      // Show celebration
      setShowCelebration(true);
      setTimeout(() => {
        router.push(`/ideas/${result.id}?submitted=true`);
      }, 2000);
    } catch (error) {
      console.error('Error submitting:', error);
      setIsSubmitting(false);
      alert('Erreur lors de la soumission. Veuillez réessayer.');
    }
  };

  const totalTime = processSteps.reduce((sum, step) => sum + step.timeMinutes, 0);
  const totalCost = processSteps.reduce((sum, step) => sum + step.costEur, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">Idée soumise avec succès !</h2>
            <p className="text-white">Analyse IA en cours...</p>
          </div>
        </div>
      )}

      <div className={`container mx-auto px-4 py-8 transition-all duration-300 ease-in-out ${
        isChatOpen ? 'max-w-[calc(100%-420px)] pr-[420px]' : 'max-w-5xl'
      }`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Soumettre une Idée</h1>
              <p className="text-slate-600 mt-1">Processus guidé en 7 étapes</p>
            </div>
            {lastSaved && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ✓ Sauvegardé {lastSaved.toLocaleTimeString()}
              </Badge>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Étape {currentStep} sur {STEPS.length}
              </span>
              <span className="text-sm text-slate-600">
                {Math.round((currentStep / STEPS.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`text-xs ${
                    step.id === currentStep
                      ? 'font-bold text-indigo-600'
                      : step.id < currentStep
                      ? 'text-green-600'
                      : 'text-slate-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{step.icon}</div>
                    <div>{step.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-white/80 bg-white/95 shadow-xl">
          <CardContent className="p-6 md:p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Titre de l'idée
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Suivi des équipements hospitaliers"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Catégorie
                    </label>
                    <Combobox
                      options={CATEGORIES.map(cat => ({
                        value: cat.value,
                        label: language === 'ar' && cat.labelAr ? cat.labelAr :
                               language === 'darija' && cat.labelDarija ? cat.labelDarija :
                               cat.label
                      }))}
                      value={category}
                      onChange={setCategory}
                      placeholder={language === 'darija' ? 'Khtar kategoriya' : 'Sélectionnez une catégorie...'}
                      allowCustom={true}
                      customLabel={language === 'darija' ? 'Zid kategoriya jdida' : 'Ajouter une catégorie'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Localisation
                    </label>
                    <Combobox
                      options={MOROCCAN_CITIES.map(city => ({
                        value: city.value,
                        label: city.label
                      }))}
                      value={location}
                      onChange={setLocation}
                      placeholder={language === 'darija' ? 'Khtar blasa' : 'Sélectionnez une ville...'}
                      allowCustom={true}
                      customLabel={language === 'darija' ? 'Zid blasa jdida' : 'Ajouter une ville'}
                    />
                  </div>
                </div>
                <Step1Problem
                  value={problemStatement}
                  onChange={setProblemStatement}
                  language={language}
                  onLanguageChange={setLanguage}
                  clarityScore={clarityScore}
                />
                
                {/* Feedback Display */}
                {clarityScore < 6 && problemStatement.length > 10 && (
                  <ClarityFeedbackDisplay
                    idea={{
                      problemStatement,
                      asIsAnalysis,
                      benefitStatement,
                      operationalNeeds: '',
                      dataSources,
                      integrationPoints,
                      aiCapabilitiesNeeded: aiCapabilities,
                      processSteps,
                      roiTimeSavedHours: timeSavedHours,
                      roiCostSavedEur: costSavedEur,
                      estimatedCost,
                      teamSize,
                      budget,
                      location,
                      category,
                    }}
                    language={language === 'darija' ? 'darija' : 'fr'}
                    onImprove={(criterion) => {
                      // Navigate to relevant step
                      if (criterion === 'problem') setCurrentStep(1);
                      else if (criterion === 'asIs') setCurrentStep(2);
                      else if (criterion === 'benefits') setCurrentStep(3);
                      else if (criterion === 'operations') setCurrentStep(6);
                    }}
                  />
                )}
              </div>
            )}

            {currentStep === 2 && (
              <Step2AsIs
                value={asIsAnalysis}
                onChange={setAsIsAnalysis}
                processSteps={processSteps}
                onProcessStepsChange={setProcessSteps}
                totalTime={totalTime}
                totalCost={totalCost}
              />
            )}

            {currentStep === 3 && (
              <Step3Benefits
                value={benefitStatement}
                onChange={setBenefitStatement}
                timeSavedHours={timeSavedHours}
                onTimeSavedChange={setTimeSavedHours}
                costSavedEur={costSavedEur}
                onCostSavedChange={setCostSavedEur}
                estimatedCost={estimatedCost}
                onEstimatedCostChange={setEstimatedCost}
              />
            )}

            {currentStep === 4 && (
              <Step4Solution
                value={solution}
                onChange={setSolution}
                similarIdeas={[]}
              />
            )}

            {currentStep === 5 && (
              <Step5Evidence
                photos={photos}
                onPhotosChange={setPhotos}
                ocrText={ocrText}
                onOcrTextChange={setOcrText}
                baridCashVerified={baridCashVerified}
                onBaridCashVerify={() => setBaridCashVerified(true)}
              />
            )}

            {currentStep === 6 && (
              <Step6Operations
                dataSources={dataSources}
                onDataSourcesChange={setDataSources}
                integrationPoints={integrationPoints}
                onIntegrationPointsChange={setIntegrationPoints}
                aiCapabilities={aiCapabilities}
                onAiCapabilitiesChange={setAiCapabilities}
                teamSize={teamSize}
                onTeamSizeChange={setTeamSize}
                budget={budget}
                onBudgetChange={setBudget}
                moroccoPriorities={moroccoPriorities}
                onMoroccoPrioritiesChange={setMoroccoPriorities}
                otherAlignment={otherAlignment}
                onOtherAlignmentChange={setOtherAlignment}
                language={language}
                problemStatement={problemStatement}
                proposedSolution={solution}
              />
            )}

            {currentStep === 7 && (
              <Step7Review
                data={{
                  problemStatement,
                  asIsAnalysis,
                  benefitStatement,
                  solution,
                  timeSavedHours,
                  costSavedEur,
                  estimatedCost,
                  dataSources,
                  integrationPoints,
                  aiCapabilities,
                  location,
                  category,
                  moroccoPriorities,
                  otherAlignment,
                  submitterName,
                  submitterEmail,
                  submitterPhone,
                  submitterType,
                  submitterSkills,
                }}
                clarityScore={clarityScore}
                onEdit={setCurrentStep}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                language={language}
                onSubmitterNameChange={setSubmitterName}
                onSubmitterEmailChange={setSubmitterEmail}
                onSubmitterPhoneChange={setSubmitterPhone}
                onSubmitterTypeChange={setSubmitterType}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            ← Précédent
          </Button>
          {currentStep < 7 && (
            <Button onClick={handleNext}>
              Suivant →
            </Button>
          )}
        </div>

        {/* AI Analysis Agent - Shows live analysis */}
        {(currentStep >= 2 && currentStep <= 6) && (
          <div className="mt-6">
            <AIAnalysisAgent
              formData={{
                problemStatement,
                asIsAnalysis,
                benefitStatement,
                operationalNeeds: dataSources.join(', '),
                category,
                location,
              }}
              language={language === 'ar' ? 'fr' : language}
              compact={false}
            />
          </div>
        )}
      </div>

      {/* AI Agent Chat - Floating assistant (minimized by default to not block UI) */}
      <AIAgentChat
        context={{
          step: currentStep,
          stepName: STEPS.find(s => s.id === currentStep)?.name || '',
          currentData: {
            problemStatement,
            asIsAnalysis,
            benefitStatement,
            solution,
            category,
            location,
          },
          language: language === 'ar' ? 'fr' : language,
        }}
        onSuggestionApply={(suggestion) => {
          // Apply suggestion based on current step
          if (currentStep === 1) setProblemStatement(suggestion);
          else if (currentStep === 2) setAsIsAnalysis(suggestion);
          else if (currentStep === 3) setBenefitStatement(suggestion);
          else if (currentStep === 4) setSolution(suggestion);
        }}
        position="bottom-right"
        minimized={!isChatOpen}
        onToggle={(isMinimized) => setIsChatOpen(!isMinimized)}
      />
    </div>
  );
}
