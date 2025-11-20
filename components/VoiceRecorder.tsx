'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// Simple icon components (no external dependency needed)
const MicIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const SquareIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const LoaderIcon = () => (
  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isTranscribing: boolean;
  fieldName: string;
}

export default function VoiceRecorder({
  onTranscription,
  isRecording,
  onStartRecording,
  onStopRecording,
  isTranscribing,
  fieldName,
}: VoiceRecorderProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR'; // French language

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onTranscription(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // User didn't speak, try again
          if (isRecording) {
            recognition.start();
          }
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          // Restart if still recording
          try {
            recognition.start();
          } catch (e) {
            // Already started or error
          }
        }
      };

      recognitionRef.current = recognition;
      setHasPermission(true);
    } else {
      setHasPermission(false);
    }
  }, [isRecording, onTranscription]);

  const handleStartRecording = async () => {
    if (!recognitionRef.current) {
      alert('La reconnaissance vocale n\'est pas disponible dans votre navigateur. Veuillez utiliser Chrome, Edge ou Safari.');
      return;
    }

    try {
      recognitionRef.current.start();
      onStartRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Erreur lors du démarrage de l\'enregistrement. Veuillez vérifier les permissions du microphone.');
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onStopRecording();
  };

  if (hasPermission === false) {
    return (
      <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
        ⚠️ La reconnaissance vocale n'est pas disponible dans ce navigateur. Utilisez Chrome, Edge ou Safari.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleStartRecording}
          className="flex items-center gap-2"
        >
          <MicIcon />
          Enregistrer
        </Button>
      ) : (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleStopRecording}
          className="flex items-center gap-2"
        >
          <SquareIcon />
          Arrêter
        </Button>
      )}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span className="h-2 w-2 bg-red-600 rounded-full animate-pulse"></span>
          Enregistrement en cours...
        </div>
      )}
      {isTranscribing && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <LoaderIcon />
          Transcription...
        </div>
      )}
    </div>
  );
}

