/**
 * Journey Pods Page
 * 
 * Geographic proximity-based pods
 * Only accessible when user completes Step 1 solo (>50%)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JourneyPods from '@/components/workflow/JourneyPods';
import { getTaskSuccessRate } from '@/lib/workflow/think-time-ux';

export default function PodsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [userCity, setUserCity] = useState<string>('');
  const [step1CompletionRate, setStep1CompletionRate] = useState(0);

  useEffect(() => {
    // In production, get from auth/session
    const storedUserId = localStorage.getItem('fikra_user_id') || `user_${Date.now()}`;
    const storedCity = localStorage.getItem('fikra_user_city') || 'casablanca';
    
    setUserId(storedUserId);
    setUserCity(storedCity);
    
    // Calculate Step 1 completion rate
    const step1Rate = getTaskSuccessRate('step_problem') / 5; // Convert 1-5 to 0-1
    setStep1CompletionRate(step1Rate);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            👥 Journey Pods
          </h1>
          <p className="text-lg text-slate-600">
            Travaille avec 2-5 personnes de ta ville pour valider ton idée
          </p>
        </div>

        <JourneyPods
          userId={userId}
          userCity={userCity}
          step1CompletionRate={step1CompletionRate}
        />
      </div>
    </div>
  );
}

