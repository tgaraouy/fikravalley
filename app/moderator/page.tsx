'use client';

import { useEffect, useState, useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { formatDateTime } from '@/lib/utils';

type WorkshopSessionRow = Database['public']['Tables']['marrai_workshop_sessions']['Row'];
type ConversationIdeaRow = Database['public']['Tables']['marrai_conversation_ideas']['Row'];
type TranscriptRow = Database['public']['Tables']['marrai_transcripts']['Row'];

interface SessionStats {
  recordingDuration: number; // minutes
  wordsCaptured: number;
  ideasDetected: number;
  ideasPending: number;
  ideasValidated: number;
  ideasRejected: number;
}

export default function ModeratorPanel() {
  const [sessions, setSessions] = useState<WorkshopSessionRow[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<WorkshopSessionRow | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    recordingDuration: 0,
    wordsCaptured: 0,
    ideasDetected: 0,
    ideasPending: 0,
    ideasValidated: 0,
    ideasRejected: 0,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);
  const [manualIdeaForm, setManualIdeaForm] = useState({
    problem_title: '',
    problem_statement: '',
    speaker_quote: '',
    speaker_context: '',
    digitization_opportunity: '',
  });

  const channelRef = useRef<any>(null);
  const recordingStartTimeRef = useRef<Date | null>(null);

  // Fetch all sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const { data, error } = await supabase
          .from('marrai_workshop_sessions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setSessions(data || []);

        // Set first session as default if available
        if (data && data.length > 0 && !currentSessionId) {
          setCurrentSessionId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    }

    fetchSessions();
  }, []);

  // Fetch real-time stats
  const fetchStats = async () => {
    if (!currentSessionId) return;

    try {
      // Words captured
      const { data: transcripts } = await supabase
        .from('marrai_transcripts')
        .select('word_count')
        .eq('session_id', currentSessionId);

      const wordsCaptured = transcripts?.reduce((sum, t) => sum + (t.word_count || 0), 0) || 0;

      // Ideas stats
      const { data: ideas } = await supabase
        .from('marrai_conversation_ideas')
        .select('status')
        .eq('session_id', currentSessionId);

      const ideasDetected = ideas?.length || 0;
      const ideasPending = ideas?.filter((i) => i.status === 'pending_validation').length || 0;
      const ideasValidated = ideas?.filter((i) => i.status === 'speaker_validated').length || 0;
      const ideasRejected = ideas?.filter((i) => i.status === 'speaker_rejected').length || 0;

      // Recording duration
      let recordingDuration = 0;
      if (currentSession?.recording_started && currentSession.start_time) {
        const startTime = new Date(currentSession.start_time);
        const now = new Date();
        recordingDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60);
      } else if (currentSession?.recording_duration_minutes) {
        recordingDuration = currentSession.recording_duration_minutes;
      }

      setStats({
        recordingDuration,
        wordsCaptured,
        ideasDetected,
        ideasPending,
        ideasValidated,
        ideasRejected,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch current session
  useEffect(() => {
    if (!currentSessionId) return;

    async function fetchSessionData() {
      try {
        // Fetch session
        const { data: sessionData, error: sessionError } = await supabase
          .from('marrai_workshop_sessions')
          .select('*')
          .eq('id', currentSessionId)
          .single();

        if (sessionError) throw sessionError;
        setCurrentSession(sessionData);
        setSessionNotes(sessionData.session_summary || '');

        // Check recording status
        setIsRecording(sessionData.recording_started || false);
        if (sessionData.recording_started && sessionData.start_time) {
          recordingStartTimeRef.current = new Date(sessionData.start_time);
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
      }
    }

    fetchSessionData();
  }, [currentSessionId]);

  // Fetch stats when session changes
  useEffect(() => {
    if (!currentSessionId || !currentSession) return;
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId, currentSession]);

  // Real-time subscription
  useEffect(() => {
    if (!currentSessionId) return;

    // Cleanup previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`moderator_${currentSessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marrai_conversation_ideas',
          filter: `session_id=eq.${currentSessionId}`,
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marrai_transcripts',
          filter: `session_id=eq.${currentSessionId}`,
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'marrai_workshop_sessions',
          filter: `id=eq.${currentSessionId}`,
        },
        (payload) => {
          setCurrentSession(payload.new as WorkshopSessionRow);
          setIsRecording((payload.new as WorkshopSessionRow).recording_started || false);
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Auto-refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      clearInterval(interval);
    };
  }, [currentSessionId]);

  // Update recording duration every minute
  useEffect(() => {
    if (!isRecording || !currentSessionId) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 60000);

    return () => clearInterval(interval);
  }, [isRecording, currentSessionId]);

  // Toggle recording
  const toggleRecording = async () => {
    if (!currentSessionId) return;

    try {
      const newRecordingState = !isRecording;
      const now = new Date().toISOString();

      const updateData: any = {
        recording_started: newRecordingState,
        updated_at: now,
      };

      if (newRecordingState) {
        updateData.start_time = now;
        recordingStartTimeRef.current = new Date();
      } else {
        updateData.recording_stopped = true;
        updateData.end_time = now;
        if (recordingStartTimeRef.current) {
          const duration = Math.floor(
            (new Date().getTime() - recordingStartTimeRef.current.getTime()) / 1000 / 60
          );
          updateData.recording_duration_minutes = duration;
        }
      }

      const { error } = await supabase
        .from('marrai_workshop_sessions')
        .update(updateData)
        .eq('id', currentSessionId);

      if (error) throw error;
      setIsRecording(newRecordingState);
      fetchStats();
    } catch (error) {
      console.error('Error toggling recording:', error);
      alert('Erreur lors de la mise à jour de l\'enregistrement');
    }
  };

  // Save session notes
  const saveSessionNotes = async () => {
    if (!currentSessionId) return;

    try {
      setIsSavingNotes(true);
      const { error } = await supabase
        .from('marrai_workshop_sessions')
        .update({
          session_summary: sessionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSessionId);

      if (error) throw error;
      alert('Notes sauvegardées avec succès');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Erreur lors de la sauvegarde des notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Submit manual idea
  const submitManualIdea = async () => {
    if (!currentSessionId) return;

    try {
      setIsSubmittingIdea(true);

      if (!manualIdeaForm.problem_title || !manualIdeaForm.problem_statement) {
        alert('Le titre et la description du problème sont requis');
        return;
      }

      const { error } = await supabase.from('marrai_conversation_ideas').insert({
        session_id: currentSessionId,
        speaker_quote: manualIdeaForm.speaker_quote || manualIdeaForm.problem_statement,
        speaker_context: manualIdeaForm.speaker_context || 'Saisie manuelle par modérateur',
        problem_title: manualIdeaForm.problem_title,
        problem_statement: manualIdeaForm.problem_statement,
        digitization_opportunity: manualIdeaForm.digitization_opportunity || null,
        status: 'pending_validation',
        confidence_score: 0.95, // High confidence for manual entry
      });

      if (error) throw error;

      // Reset form
      setManualIdeaForm({
        problem_title: '',
        problem_statement: '',
        speaker_quote: '',
        speaker_context: '',
        digitization_opportunity: '',
      });

      alert('Idée ajoutée avec succès');
      fetchStats();
    } catch (error) {
      console.error('Error submitting manual idea:', error);
      alert('Erreur lors de l\'ajout de l\'idée');
    } finally {
      setIsSubmittingIdea(false);
    }
  };

  // Force extraction
  const forceExtraction = async () => {
    if (!currentSessionId) return;

    try {
      const response = await fetch('/api/extract-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentSessionId, force_reprocess: true }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Extraction déclenchée: ${data.ideasExtracted || 0} idée(s) extraite(s)`);
        fetchStats();
      } else {
        throw new Error(data.error || 'Erreur lors de l\'extraction');
      }
    } catch (error) {
      console.error('Error forcing extraction:', error);
      alert('Erreur lors de l\'extraction');
    }
  };

  // Export session data
  const exportSessionData = async () => {
    if (!currentSessionId) return;

    try {
      // Fetch all session data
      const [ideasRes, transcriptsRes] = await Promise.all([
        supabase.from('marrai_conversation_ideas').select('*').eq('session_id', currentSessionId),
        supabase.from('marrai_transcripts').select('*').eq('session_id', currentSessionId),
      ]);

      const exportData = {
        session: currentSession,
        stats,
        ideas: ideasRes.data || [],
        transcripts: transcriptsRes.data || [],
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${currentSessionId}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting session data:', error);
      alert('Erreur lors de l\'export');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <Card className="border-white/80 bg-white/95">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Panneau de Contrôle Modérateur</CardTitle>
            <CardDescription>Gestion des sessions d'atelier en temps réel</CardDescription>
          </CardHeader>
        </Card>

        {/* Session Selector */}
        <Card className="border-white/80 bg-white/95">
          <CardHeader>
            <CardTitle className="text-xl">Session Actuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select
                value={currentSessionId}
                onChange={(e) => setCurrentSessionId(e.target.value)}
                className="w-96"
              >
                <option value="">Sélectionner une session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name_french || session.name || session.id}
                    {session.created_at && ` - ${formatDateTime(session.created_at)}`}
                  </option>
                ))}
              </Select>
              {currentSession && (
                <Badge variant={isRecording ? 'success' : 'outline'}>
                  {isRecording ? '🔴 Enregistrement' : '⏸️ En pause'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {currentSessionId && (
          <>
            {/* Recording Control */}
            <Card className="border-white/80 bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl">Contrôle d'Enregistrement</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={toggleRecording}
                  variant={isRecording ? 'secondary' : 'primary'}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {isRecording ? '⏹️ Arrêter l\'enregistrement' : '▶️ Démarrer l\'enregistrement'}
                </Button>
                {isRecording && currentSession?.start_time && (
                  <p className="mt-4 text-sm text-slate-600">
                    Enregistrement démarré le {formatDateTime(currentSession.start_time)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stats Dashboard */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-700">Durée d'enregistrement</p>
                    <p className="mt-2 text-3xl font-bold text-blue-900">{stats.recordingDuration} min</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-700">Mots capturés</p>
                    <p className="mt-2 text-3xl font-bold text-green-900">
                      {stats.wordsCaptured.toLocaleString('fr-FR')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-purple-700">Idées détectées</p>
                    <p className="mt-2 text-3xl font-bold text-purple-900">{stats.ideasDetected}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-amber-700">En attente de validation</p>
                    <p className="mt-2 text-3xl font-bold text-amber-900">{stats.ideasPending}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-emerald-700">Validées</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-900">{stats.ideasValidated}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-red-700">Rejetées</p>
                    <p className="mt-2 text-3xl font-bold text-red-900">{stats.ideasRejected}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-white/80 bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl">Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={forceExtraction} variant="secondary" size="lg">
                    🔄 Forcer l'extraction d'idées
                  </Button>
                  <Button onClick={exportSessionData} variant="secondary" size="lg">
                    📥 Exporter les données
                  </Button>
                  <Button
                    onClick={() => (window.location.href = `/dashboard?session=${currentSessionId}`)}
                    variant="secondary"
                    size="lg"
                  >
                    📊 Voir le tableau de bord
                  </Button>
                  <Button
                    onClick={() => (window.location.href = `/workshop/qr-codes`)}
                    variant="secondary"
                    size="lg"
                  >
                    📱 Imprimer QR codes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Manual Idea Entry */}
            <Card className="border-white/80 bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl">Saisie Manuelle d'Idée</CardTitle>
                <CardDescription>Ajouter une idée manuellement (pour idées exprimées oralement)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="problem_title">Titre du problème *</Label>
                  <Input
                    id="problem_title"
                    value={manualIdeaForm.problem_title}
                    onChange={(e) =>
                      setManualIdeaForm({ ...manualIdeaForm, problem_title: e.target.value })
                    }
                    placeholder="Ex: Suivi des équipements hospitaliers"
                  />
                </div>
                <div>
                  <Label htmlFor="problem_statement">Description du problème *</Label>
                  <Textarea
                    id="problem_statement"
                    value={manualIdeaForm.problem_statement}
                    onChange={(e) =>
                      setManualIdeaForm({ ...manualIdeaForm, problem_statement: e.target.value })
                    }
                    placeholder="Décrivez le problème en détail..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="speaker_quote">Citation du locuteur (optionnel)</Label>
                  <Input
                    id="speaker_quote"
                    value={manualIdeaForm.speaker_quote}
                    onChange={(e) =>
                      setManualIdeaForm({ ...manualIdeaForm, speaker_quote: e.target.value })
                    }
                    placeholder="Citation exacte si disponible"
                  />
                </div>
                <div>
                  <Label htmlFor="speaker_context">Contexte du locuteur (optionnel)</Label>
                  <Input
                    id="speaker_context"
                    value={manualIdeaForm.speaker_context}
                    onChange={(e) =>
                      setManualIdeaForm({ ...manualIdeaForm, speaker_context: e.target.value })
                    }
                    placeholder="Ex: Directeur d'hôpital, Casablanca"
                  />
                </div>
                <div>
                  <Label htmlFor="digitization_opportunity">Opportunité de numérisation (optionnel)</Label>
                  <Textarea
                    id="digitization_opportunity"
                    value={manualIdeaForm.digitization_opportunity}
                    onChange={(e) =>
                      setManualIdeaForm({ ...manualIdeaForm, digitization_opportunity: e.target.value })
                    }
                    placeholder="Décrivez l'opportunité de numérisation..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={submitManualIdea}
                  disabled={isSubmittingIdea || !manualIdeaForm.problem_title || !manualIdeaForm.problem_statement}
                  variant="primary"
                  size="lg"
                >
                  {isSubmittingIdea ? '⏳ Ajout en cours...' : '➕ Ajouter l\'idée'}
                </Button>
              </CardContent>
            </Card>

            {/* Session Notes */}
            <Card className="border-white/80 bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl">Notes de Session</CardTitle>
                <CardDescription>Notes et observations sur la session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Ajoutez vos notes sur la session, les points clés, les observations..."
                  rows={8}
                />
                <Button
                  onClick={saveSessionNotes}
                  disabled={isSavingNotes}
                  variant="primary"
                  size="lg"
                >
                  {isSavingNotes ? '⏳ Sauvegarde...' : '💾 Sauvegarder les notes'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {!currentSessionId && (
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">Sélectionnez une session pour commencer</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

