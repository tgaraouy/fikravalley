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
import { Mic, Check, X } from 'lucide-react';
import { saveVoiceDraft } from '@/lib/voice/offline-storage';

interface SimpleVoiceSubmitProps {
  onSubmit: (transcript: string) => void;
}

export default function SimpleVoiceSubmit({ onSubmit }: SimpleVoiceSubmitProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Web Speech API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ar-MA'; // Darija first
        
        recognitionRef.current.onresult = (event: any) => {
          let final = '';
          let maxConfidence = 0;
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              final += result[0].transcript + ' ';
              maxConfidence = Math.max(maxConfidence, result[0].confidence || 0.8);
            }
          }
          
          if (final) {
            setTranscript(prev => prev + final);
            setConfidence(maxConfidence);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };
      }
    }
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        setTranscript(''); // Clear previous
      }
      
      // Also record audio for offline storage
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus' // Compress to ~100KB/min
      });
      
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // Save offline
        await saveVoiceDraft({
          id: `draft_${Date.now()}`,
          transcript,
          audioBlob: blob,
          language: 'ar-MA',
          timestamp: Date.now()
        });
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Permission microphone refusée. Activez-la dans les paramètres.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleEdit = () => {
    // Show edit dialog (simple textarea overlay)
    const edited = prompt('Tsa7e7 (Correct):', transcript);
    if (edited !== null) {
      setTranscript(edited);
    }
  };

  const handleSubmit = () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    onSubmit(transcript);
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      {/* Giant Mic Button - 80% of screen */}
      <button
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        className={`
          w-64 h-64 rounded-full flex items-center justify-center
          transition-all duration-200 shadow-2xl
          ${isRecording 
            ? 'bg-red-500 scale-110 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }
        `}
        disabled={isProcessing}
      >
        {isRecording ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            <X className="w-24 h-24 text-white relative z-10" />
          </div>
        ) : (
          <Mic className="w-24 h-24 text-white" />
        )}
      </button>

      {/* Status Text */}
      <p className="mt-6 text-lg font-medium text-slate-700">
        {isRecording ? '🎤 Dwi daba (Parle maintenant)...' : 'دير الصوت دابا (Appuie pour parler)'}
      </p>

      {/* Transcript: Appears IN PLACE, not below */}
      {transcript && (
        <div className="mt-8 w-full max-w-md">
          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-blue-200">
            <p className="text-base text-slate-800 leading-relaxed mb-4" dir="auto">
              {transcript}
            </p>
            
            {/* Confidence indicator */}
            {confidence < 0.85 && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  ⚠️ Précision: {Math.round(confidence * 100)}% - Vérifie la transcription
                </p>
              </div>
            )}
            
            {/* Edit Button */}
            <button
              onClick={handleEdit}
              className="text-blue-600 text-sm font-medium mb-4 hover:text-blue-700"
            >
              ✏️ Tsa7e7 (Correct)
            </button>
          </div>
        </div>
      )}

      {/* Submit: Big, single button */}
      {transcript && !isRecording && (
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="mt-8 w-full max-w-md bg-green-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {isProcessing ? '⏳ Envoi...' : '✅ سّبق الفكرة (Submit)'}
        </button>
      )}
    </div>
  );
}

