/**
 * SIMPLE PODS - Voice-Native
 * 
 * No forms - voice-only pod creation
 * Auto-detect city from GPS
 * Auto-join via share links (WhatsApp groups)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic } from 'lucide-react';

interface SimplePodsProps {
  userId: string;
  userCity: string;
}

export default function SimplePods({ userId, userCity }: SimplePodsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [podName, setPodName] = useState('');
  const [pods, setPods] = useState<any[]>([]);
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'ar-MA';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setPodName(transcript);
          setIsRecording(false);
          
          // Auto-create pod
          createPod(transcript);
        };
      }
    }
    
    // Load existing pods
    loadPods();
  }, []);

  const loadPods = async () => {
    try {
      const res = await fetch(`/api/pods?city=${userCity}`);
      const data = await res.json();
      if (data.success) {
        setPods(data.data || []);
      }
    } catch (error) {
      console.error('Error loading pods:', error);
    }
  };

  const startRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        setPodName('');
      }
    } catch (error) {
      alert('Permission microphone refusée');
    }
  };

  const createPod = async (name: string) => {
    try {
      const res = await fetch('/api/pods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          city: userCity, // Auto-detected
          creatorId: userId,
          creatorName: 'Creator'
        })
      });
      
      const data = await res.json();
      if (data.success) {
        // Generate share link (like WhatsApp groups)
        const shareLink = `${window.location.origin}/pods/join/${data.data.id}`;
        
        // Show success with share button
        alert(`✅ پودّ تي تكون! (Pod created!)\n\nPartage le lien: ${shareLink}`);
        
        // Reload pods
        loadPods();
      }
    } catch (error) {
      console.error('Error creating pod:', error);
    }
  };

  const sharePod = (podId: string) => {
    const shareLink = `${window.location.origin}/pods/join/${podId}`;
    const message = `دير پودّ جديد: ${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">
          👥 Pods
        </h1>

        {/* Create Pod: Voice-Only */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 text-center">
              دير پودّ جديد (Create Pod)
            </h2>
            
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={`
                w-full h-32 rounded-lg flex items-center justify-center
                transition-all
                ${isRecording 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-purple-600 hover:bg-purple-700'
                }
                text-white font-bold text-lg
              `}
            >
              {isRecording ? (
                <span>🎤 Dwi daba (Parle maintenant)...</span>
              ) : (
                <>
                  <Mic className="w-8 h-8 mr-2" />
                  <span>دير الصوت دابا (Appuie pour parler)</span>
                </>
              )}
            </button>
            
            {podName && (
              <p className="mt-4 text-center text-slate-700">
                "{podName}"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Existing Pods */}
        {pods.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              Pods disponibles
            </h2>
            {pods.map((pod) => (
              <Card key={pod.id} className="border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{pod.name}</h3>
                      <p className="text-sm text-slate-600">{pod.city}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sharePod(pod.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      📤 Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

