/**
 * useVoiceRecorder Hook
 * 
 * Stable voice recording using MediaRecorder + Vercel AI SDK transcription
 * Works reliably across browsers and handles Darija/Tamazight well
 */

import { useState, useRef } from 'react';

interface UseVoiceRecorderOptions {
  language?: 'darija' | 'fr' | 'en';
  onTranscription?: (text: string) => void;
  onError?: (error: Error) => void;
}

export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}) {
  const { language = 'fr', onTranscription, onError } = options;
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      streamRef.current = stream;

      // Create MediaRecorder with efficient codec
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Convert to base64 and transcribe
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        setIsTranscribing(true);
        
        try {
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result?.toString().split(',')[1];
              
              if (!base64Audio) {
                throw new Error('Failed to convert audio to base64');
              }

              // Call transcription API
              const res = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  audioData: base64Audio,
                  language: language === 'darija' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US'
                }),
              });

              if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Transcription failed');
              }

              const { transcription } = await res.json();
              
              // Append to existing transcript
              setTranscript((prev) => {
                const newText = prev ? prev + ' ' + transcription : transcription;
                if (onTranscription) {
                  onTranscription(newText);
                }
                return newText;
              });
              
            } catch (err: any) {
              const error = err instanceof Error ? err : new Error('Transcription failed');
              setError(error.message);
              if (onError) {
                onError(error);
              }
            } finally {
              setIsTranscribing(false);
            }
          };

          reader.onerror = () => {
            setIsTranscribing(false);
            const error = new Error('Failed to read audio file');
            setError(error.message);
            if (onError) {
              onError(error);
            }
          };
          
        } catch (err: any) {
          setIsTranscribing(false);
          const error = err instanceof Error ? err : new Error('Transcription failed');
          setError(error.message);
          if (onError) {
            onError(error);
          }
        }
      };

      recorder.onerror = (e) => {
        const error = new Error('Recording error');
        setError(error.message);
        if (onError) {
          onError(error);
        }
        setIsRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // Collect data every second
      setIsRecording(true);

    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to start recording');
      setError(error.message);
      setIsRecording(false);
      if (onError) {
        onError(error);
      }
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert('⚠️ Microphone permission required. Please allow access.');
      } else {
        alert(`⚠️ Error: ${error.message}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);
  };

  const clearTranscript = () => {
    setTranscript('');
    setError(null);
  };

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
    setTranscript, // Allow manual edits
  };
}

