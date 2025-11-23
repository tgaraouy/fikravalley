/**
 * Voice-First Input Component
 * 
 * Primary input method - transcribed locally
 * Works offline, stores audio blob
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { autoSaveEntry } from '@/lib/fikra-journal/storage';

interface VoiceInputProps {
  fikraTag: string;
  step?: string;
  onTranscript: (text: string) => void;
}

export default function VoiceInput({ fikraTag, step, onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Web Speech API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'fr-MA'; // Moroccan French
        
        recognitionRef.current.onresult = (event: any) => {
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
          
          setTranscript(final + interim);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };
      }
    }
  }, []);

  const startListening = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
      
      // Also record audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        // Auto-save voice note
        autoSaveEntry('user', fikraTag, blob, step);
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error('Error starting voice input:', error);
      alert('Permission microphone refusée. Activez-la dans les paramètres.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    // Auto-save transcript
    if (transcript.trim()) {
      autoSaveEntry('user', fikraTag, transcript, step);
      onTranscript(transcript);
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Button
            onClick={isListening ? stopListening : startListening}
            className={isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {isListening ? '⏹️ Arrêter' : '🎤 Parler'}
          </Button>
          {isListening && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600">Enregistrement...</span>
            </div>
          )}
        </div>
        
        {transcript && (
          <div className="mt-3 p-3 bg-slate-50 rounded">
            <p className="text-sm text-slate-700">{transcript}</p>
            <p className="text-xs text-slate-500 mt-2">
              ✓ Sauvegardé localement
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

