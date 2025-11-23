/**
 * My Fikras Dashboard
 * 
 * Mobile-first card-based dashboard
 * Shows all user's ideas with FikraTags
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FikraCard, { type FikraCardData } from '@/components/fikra-tags/FikraCard';
import MicroStepChain, { type MicroStep } from '@/components/fikra-tags/MicroStepChain';
import VoiceInput from '@/components/fikra-journal/VoiceInput';
import { generateFikraTag } from '@/lib/fikra-tags/generator';
import { getEntriesForTag } from '@/lib/fikra-journal/storage';
import { registerSyncListener } from '@/lib/fikra-journal/sync';

interface Idea {
  id: string;
  title: string;
  tracking_code: string;
  created_at: string;
  status: string;
  submitter_name?: string;
}

export default function MyFikrasPage() {
  const searchParams = useSearchParams();
  const [fikras, setFikras] = useState<FikraCardData[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [voiceDrafts, setVoiceDrafts] = useState<any[]>([]);
  const [selectedFikra, setSelectedFikra] = useState<string | null>(null);
  const [steps, setSteps] = useState<MicroStep[]>([]);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Get contact info from URL params
    const emailParam = searchParams.get('email');
    const phoneParam = searchParams.get('phone');
    
    if (emailParam) setEmail(emailParam);
    if (phoneParam) setPhone(phoneParam);

    // Register sync listener
    registerSyncListener();

    // Load user's ideas
    if (emailParam || phoneParam) {
      loadUserIdeas(emailParam || undefined, phoneParam || undefined);
    } else {
      // Show claim form if no contact info
      setIsLoading(false);
    }
    
    loadVoiceDrafts();
  }, [searchParams]);

  const loadVoiceDrafts = async () => {
    // Dynamically import to avoid SSR issues with IndexedDB
    const { getAllVoiceDrafts } = await import('@/lib/voice/offline-storage');
    const drafts = await getAllVoiceDrafts();
    setVoiceDrafts(drafts.sort((a, b) => b.timestamp - a.timestamp));
  };

  const loadUserIdeas = async (email?: string, phone?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ideas/search-by-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
      });

      if (response.ok) {
        const data = await response.json();
        setIdeas(data.ideas || []);
        
        // Convert ideas to FikraCard format
        const fikrasData: FikraCardData[] = (data.ideas || []).map((idea: Idea) => ({
          tag: {
            code: idea.tracking_code || `FKR-${idea.id.substring(0, 8).toUpperCase()}`,
            category: 'OTH',
            word: 'IDEA',
            number: 0,
            generatedAt: new Date(idea.created_at),
            synced: true,
          },
          state: idea.status === 'analyzed' ? 'step_active' : 'cooling_off',
          title: idea.title,
          coolingOffHours: 0,
          currentStep: `Status: ${idea.status}`,
          nextStep: 'En attente d\'analyse',
        }));
        
        setFikras(fikrasData);
      }
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      setIsLoading(false);
    }
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

  // Show claim form if no contact info provided
  if (!email && !phone && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-4 text-center">
            Trouvez vos idées
          </h1>
          <p className="text-slate-600 mb-6 text-center">
            Entrez votre email ou téléphone pour voir toutes vos idées
          </p>
          <Link
            href="/claim-idea"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
          >
            Rechercher mes idées
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Mes Fikras
          </h1>
          <p className="text-slate-600">
            {email || phone ? `Idées pour ${email || phone}` : 'Suivez vos idées avec des codes mémorables'}
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Chargement de vos idées...</p>
          </div>
        )}

        {!isLoading && ideas.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center shadow">
            <p className="text-slate-600 mb-4">Aucune idée trouvée.</p>
            <Link
              href="/submit-voice"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Soumettre une idée
            </Link>
          </div>
        )}

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

