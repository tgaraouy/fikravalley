'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type ConversationIdeaRow = Database['public']['Tables']['marrai_conversation_ideas']['Row'];
type TranscriptRow = Database['public']['Tables']['marrai_transcripts']['Row'];

interface DashboardStats {
  wordsCaptured: number;
  ideasDetected: number;
  validated: number;
  pending: number;
  rejected: number;
}

function StatBox({ label, value, gradient }: { label: string; value: number; gradient: string }) {
  return (
    <Card className={`${gradient} border-0 text-white shadow-xl`}>
      <CardContent className="p-8">
        <p className="text-2xl font-semibold mb-3 opacity-90">{label}</p>
        <p className="text-6xl font-bold">{value.toLocaleString('fr-FR')}</p>
      </CardContent>
    </Card>
  );
}

function QRCodeDisplay({ data, size = 200 }: { data: string; size?: number }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(data, { width: size, margin: 2 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Erreur génération QR:', err));
  }, [data, size]);

  if (!qrDataUrl) {
    return (
      <div className="flex items-center justify-center w-48 h-48 bg-slate-200 rounded-lg animate-pulse">
        <span className="text-slate-500">Chargement QR...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg bg-white p-2" />
    </div>
  );
}

function PulsingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-yellow-400 rounded-2xl blur-xl opacity-50 animate-pulse" />
      <div className="relative">{children}</div>
    </div>
  );
}

export default function WorkshopDashboard() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session') || 'session_1_opening';

  const [stats, setStats] = useState<DashboardStats>({
    wordsCaptured: 0,
    ideasDetected: 0,
    validated: 0,
    pending: 0,
    rejected: 0,
  });
  const [latestPending, setLatestPending] = useState<ConversationIdeaRow | null>(null);
  const [validatedIdeas, setValidatedIdeas] = useState<ConversationIdeaRow[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [sessionName, setSessionName] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  const channelRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Initialize audio on user interaction (required by browsers)
  const enableAudio = async () => {
    try {
      setAudioError(null);

      // Create AudioContext (requires user interaction)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume AudioContext if suspended (some browsers start suspended)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Create audio element for notification sound
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/notification.mp3');
        audioRef.current.volume = 0.5; // Set volume to 50%
        audioRef.current.preload = 'auto';

        // Handle audio errors
        audioRef.current.addEventListener('error', (e) => {
          console.error('Audio error:', e);
          setAudioError('Erreur de chargement du fichier audio');
        });

        // Test play (will fail silently if file doesn't exist, but that's OK)
        try {
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (playError) {
          // If file doesn't exist, fall back to Web Audio API beep
          console.warn('Audio file not found, using fallback beep:', playError);
        }
      }

      setAudioEnabled(true);
      console.log('✅ Audio enabled successfully');
    } catch (err) {
      console.error('❌ Error enabling audio:', err);
      setAudioError(err instanceof Error ? err.message : 'Erreur lors de l\'activation de l\'audio');
      // Fall back to Web Audio API beep
      setAudioEnabled(true);
    }
  };

  // Play notification sound
  const playNotification = async () => {
    if (isMuted || !audioEnabled) {
      return;
    }

    try {
      // Try to play audio file first
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play().catch((err) => {
          // If audio file fails, fall back to Web Audio API beep
          console.warn('Audio file playback failed, using beep:', err);
          playBeepSound();
        });
      } else {
        // Fall back to Web Audio API beep if no audio file
        playBeepSound();
      }
    } catch (err) {
      console.error('Erreur lecture audio:', err);
      // Fall back to Web Audio API beep
      playBeepSound();
    }
  };

  // Fallback beep sound using Web Audio API
  const playBeepSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Resume if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (err) {
      console.error('Erreur beep audio:', err);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Set mounted flag and initialize time on client only
  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch session name
  useEffect(() => {
    async function fetchSessionName() {
      const { data } = await supabase
        .from('marrai_workshop_sessions')
        .select('name, name_french')
        .eq('id', sessionId)
        .single();

      if (data) {
        setSessionName(data.name_french || data.name || sessionId);
      }
    }
    fetchSessionName();
  }, [sessionId]);

  // Fetch initial stats
  const fetchStats = async () => {
    try {
      // Words captured
      const { data: transcripts } = await supabase
        .from('marrai_transcripts')
        .select('word_count')
        .eq('session_id', sessionId);

      const wordsCaptured =
        transcripts?.reduce((sum, t) => sum + (t.word_count || 0), 0) || 0;

      // Conversation ideas stats
      const { data: ideas } = await supabase
        .from('marrai_conversation_ideas')
        .select('*')
        .eq('session_id', sessionId);

      const ideasDetected = ideas?.length || 0;
      const validated = ideas?.filter((i) => i.status === 'speaker_validated').length || 0;
      const pending = ideas?.filter((i) => i.status === 'pending_validation').length || 0;
      const rejected = ideas?.filter((i) => i.status === 'speaker_rejected').length || 0;

      setStats({
        wordsCaptured,
        ideasDetected,
        validated,
        pending,
        rejected,
      });

      // Latest pending idea
      const latestPendingIdea = ideas
        ?.filter((i) => i.status === 'pending_validation')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      if (latestPendingIdea) {
        setLatestPending(latestPendingIdea);
      }

      // Validated ideas
      const validatedList = ideas
        ?.filter((i) => i.status === 'speaker_validated')
        .sort((a, b) => {
          const aTime = a.validated_at ? new Date(a.validated_at).getTime() : 0;
          const bTime = b.validated_at ? new Date(b.validated_at).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 10) || [];

      setValidatedIdeas(validatedList);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [sessionId]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Real-time subscription
  useEffect(() => {
    // Cleanup previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Subscribe to conversation_ideas changes
    const channel = supabase
      .channel(`conversation_ideas_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marrai_conversation_ideas',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Changement détecté:', payload);

          if (payload.eventType === 'INSERT') {
            playNotification();
            fetchStats();
          } else if (payload.eventType === 'UPDATE') {
            fetchStats();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      // Cleanup audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [sessionId]);

  // Calculate total impact
  const totalImpact = validatedIdeas.length;
  const avgCost = 5000; // Average cost estimate
  const estimatedBudget = totalImpact * avgCost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-5xl font-bold">Tableau de Bord Live - Fikra Labs</h1>
            <p className="text-xl text-slate-300 mt-2">
              Capture d&apos;idées en temps réel et validation. Les idées sélectionnées seront examinées pour considération de financement.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Audio Controls */}
            <div className="flex items-center gap-2">
              {!audioEnabled ? (
                <button
                  onClick={enableAudio}
                  className="rounded-lg border border-indigo-400 bg-indigo-600/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600/30"
                  title="Activer les notifications sonores (requiert une interaction utilisateur)"
                >
                  🔊 Activer le son
                </button>
              ) : (
                <button
                  onClick={toggleMute}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    isMuted
                      ? 'border-slate-400 bg-slate-700/20 text-slate-400 hover:bg-slate-700/30'
                      : 'border-indigo-400 bg-indigo-600/20 text-white hover:bg-indigo-600/30'
                  }`}
                  title={isMuted ? 'Activer le son' : 'Désactiver le son'}
                >
                  {isMuted ? '🔇 Son désactivé' : '🔊 Son activé'}
                </button>
              )}
              {audioError && (
                <span className="text-xs text-red-400" title={audioError}>
                  ⚠️
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold">{sessionName}</p>
              <p className="text-xl text-slate-300">
                {isMounted && currentTime
                  ? currentTime.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : '--:--:--'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        <StatBox
          label="Capturées"
          value={stats.ideasDetected}
          gradient="bg-gradient-to-br from-blue-600 to-blue-700"
        />
        <StatBox
          label="Validées"
          value={stats.validated}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-700"
        />
        <StatBox
          label="Analysées"
          value={stats.validated}
          gradient="bg-gradient-to-br from-indigo-600 to-indigo-700"
        />
        <StatBox
          label="En Évaluation"
          value={stats.pending}
          gradient="bg-gradient-to-br from-amber-600 to-amber-700"
        />
        <StatBox
          label="Sélectionnées"
          value={0}
          gradient="bg-gradient-to-br from-purple-600 to-purple-700"
        />
      </div>
      <p className="text-sm text-slate-300 text-center mb-6">
        Taux de sélection: 25% • Décisions de financement prises après l&apos;atelier
      </p>

      {/* Latest Pending Idea */}
      {latestPending && (
        <div className="mb-8">
          <PulsingCard>
            <Card className="border-0 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-bold">✨ Nouvelle Idée en Attente de Validation</CardTitle>
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xl px-4 py-2">
                    En Attente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xl font-semibold mb-2">Titre</p>
                      <p className="text-2xl font-bold">{latestPending.problem_title}</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold mb-2">Citation du Locuteur</p>
                      <p className="text-lg italic bg-white/10 p-4 rounded-lg">
                        &quot;{latestPending.speaker_quote}&quot;
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold mb-2">Problème</p>
                      <p className="text-lg">{latestPending.problem_statement}</p>
                    </div>
                    {latestPending.digitization_opportunity && (
                      <div>
                        <p className="text-xl font-semibold mb-2">Opportunité de Numérisation</p>
                        <p className="text-lg">{latestPending.digitization_opportunity}</p>
                      </div>
                    )}
                  </div>
                    <div className="flex flex-col items-center justify-center">
                    <p className="text-xl font-semibold mb-4">Scanner pour Valider</p>
                    <QRCodeDisplay
                      data={`${typeof window !== 'undefined' ? window.location.origin : ''}/validate?idea=${latestPending.id}`}
                      size={300}
                    />
                    {latestPending.speaker_context && (
                      <p className="text-lg mt-4 text-center">
                        Locuteur: {latestPending.speaker_context}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </PulsingCard>
        </div>
      )}

      {/* Validated Ideas Timeline */}
      {validatedIdeas.length > 0 && (
        <div className="mb-8">
          <Card className="border-0 bg-white/10 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Idées Validées</CardTitle>
              <CardDescription className="text-xl text-slate-300">
                {validatedIdeas.length} idée(s) validée(s) par les locuteurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validatedIdeas.map((idea) => (
                  <Card
                    key={idea.id}
                    className="border-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white text-2xl">
                            ✅
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-2xl font-bold">{idea.problem_title}</h3>
                            {idea.validated_at && (
                              <p className="text-lg text-slate-300">
                                {formatDateTime(idea.validated_at)}
                              </p>
                            )}
                          </div>
                          {idea.speaker_context && (
                            <p className="text-xl text-slate-300 mb-2">
                              Par: {idea.speaker_context}
                            </p>
                          )}
                          <p className="text-lg text-slate-200">{idea.problem_statement}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <QRCodeDisplay
                            data={`${typeof window !== 'undefined' ? window.location.origin : ''}/validate?idea=${idea.id}`}
                            size={120}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Total Impact */}
      <Card className="border-0 bg-gradient-to-br from-indigo-600/50 to-purple-600/50 backdrop-blur-lg">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-3xl font-semibold mb-2">Impact Total</p>
              <p className="text-5xl font-bold">{totalImpact} Idées Validées</p>
            </div>
            <div>
              <p className="text-3xl font-semibold mb-2">Budget Estimé</p>
              <p className="text-5xl font-bold">
                {estimatedBudget.toLocaleString('fr-FR')} EUR
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

