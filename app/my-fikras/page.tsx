/**
 * My Fikras Dashboard
 * 
 * Mobile-first card-based dashboard
 * Shows all user's ideas with FikraTags
 */

'use client';

import { useState, useEffect } from 'react';
import FikraCard, { type FikraCardData } from '@/components/fikra-tags/FikraCard';
import MicroStepChain, { type MicroStep } from '@/components/fikra-tags/MicroStepChain';
import VoiceInput from '@/components/fikra-journal/VoiceInput';
import { generateFikraTag } from '@/lib/fikra-tags/generator';
import { getEntriesForTag } from '@/lib/fikra-journal/storage';
import { registerSyncListener } from '@/lib/fikra-journal/sync';

export default function MyFikrasPage() {
  const [fikras, setFikras] = useState<FikraCardData[]>([]);
  const [voiceDrafts, setVoiceDrafts] = useState<any[]>([]);
  const [selectedFikra, setSelectedFikra] = useState<string | null>(null);
  const [steps, setSteps] = useState<MicroStep[]>([]);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  useEffect(() => {
    // Register sync listener
    registerSyncListener();

    // Load user's fikras (in production, fetch from API)
    loadFikras();
    loadVoiceDrafts();
  }, []);

  const loadVoiceDrafts = async () => {
    // Dynamically import to avoid SSR issues with IndexedDB
    const { getAllVoiceDrafts } = await import('@/lib/voice/offline-storage');
    const drafts = await getAllVoiceDrafts();
    setVoiceDrafts(drafts.sort((a, b) => b.timestamp - a.timestamp));
  };

  const loadFikras = async () => {
    // Mock data - replace with API call
    const mockFikras: FikraCardData[] = [
      {
        tag: generateFikraTag('education', true),
        state: 'cooling_off',
        title: 'دروس الفيزياء بالدارجة',
        coolingOffHours: 23,
        currentStep: 'Step 1: Talked to 3 users',
        nextStep: 'Build landing page'
      },
      {
        tag: generateFikraTag('food', true),
        state: 'step_active',
        title: 'مخبزة كهربائية ذكية',
        currentStep: 'Step 1: Talked to 3 users ✅',
        nextStep: 'Build landing page',
        podName: 'Darija Physics Pod',
        podProgress: 60
      }
    ];

    setFikras(mockFikras);
  };

  const handleView = async (tag: string) => {
    setSelectedFikra(tag);

    // Load steps for this fikra
    const entries = await getEntriesForTag(tag);

    // Convert entries to steps
    const stepMap = new Map<string, MicroStep>();
    entries.forEach(entry => {
      if (entry.step) {
        if (!stepMap.has(entry.step)) {
          stepMap.set(entry.step, {
            id: entry.step,
            name: entry.step,
            status: 'completed',
            data: {
              text: entry.type === 'text' ? entry.content as string : undefined,
              voice: entry.type === 'voice' ? 'Voice note recorded' : undefined
            }
          });
        }
      }
    });

    setSteps(Array.from(stepMap.values()));
    setShowVoiceInput(true);
  };

  const handleLogProgress = (tag: string) => {
    setSelectedFikra(tag);
    setShowVoiceInput(true);
  };

  const handleGetHelp = (tag: string) => {
    // Open help dialog or redirect to pod
    alert(`Get help for ${tag}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Mes Fikras
          </h1>
          <p className="text-slate-600">
            Suivez vos idées avec des codes mémorables
          </p>
        </div>

        {/* Voice Drafts Section */}
        {voiceDrafts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>🎤</span> Brouillons Vocaux
            </h2>
            <div className="space-y-3">
              {voiceDrafts.map((draft) => (
                <div key={draft.id} className="bg-white p-4 rounded-lg shadow border border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-900 line-clamp-1">
                      {draft.transcript || 'Enregistrement sans titre'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(draft.timestamp).toLocaleDateString()} • {draft.language === 'ar-MA' ? '🇲🇦 Darija' : '🇫🇷 Français'}
                    </p>
                  </div>
                  <a
                    href={`/submit-voice?draftId=${draft.id}`}
                    className="px-3 py-1.5 bg-terracotta-100 text-terracotta-700 rounded-full text-sm font-medium hover:bg-terracotta-200 transition-colors"
                  >
                    Reprendre ➡️
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fikra Cards */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Idées Validées</h2>
          {fikras.map((fikra) => (
            <FikraCard
              key={fikra.tag.code}
              data={fikra}
              onView={handleView}
              onLogProgress={handleLogProgress}
              onGetHelp={handleGetHelp}
            />
          ))}
        </div>

        {/* Selected Fikra Details */}
        {selectedFikra && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">
              {selectedFikra}
            </h2>

            {/* Micro-Step Chain */}
            {steps.length > 0 && (
              <div className="mb-6">
                <MicroStepChain
                  steps={steps}
                  onStepClick={(step) => {
                    // Show step details
                    alert(`Step: ${step.name}\nData: ${JSON.stringify(step.data)}`);
                  }}
                />
              </div>
            )}

            {/* Voice Input */}
            {showVoiceInput && (
              <VoiceInput
                fikraTag={selectedFikra}
                step="current"
                onTranscript={(text) => {
                  console.log('Transcript:', text);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

