/**
 * Customization Page (Power User Tier)
 */

'use client';

import { useState, useEffect } from 'react';
import CustomizationPanel from '@/components/workflow/CustomizationPanel';
import type { UserWorkflowHistory } from '@/lib/workflow/customization-guardrails';

export default function CustomizePage() {
  const [userHistory, setUserHistory] = useState<UserWorkflowHistory>({
    userId: '',
    completedPods: 0,
    sprintCompletionRate: 0,
    taskEaseScore: 0,
    customizationAttempts: 0
  });

  useEffect(() => {
    // In production, fetch from API
    const userId = localStorage.getItem('fikra_user_id') || `user_${Date.now()}`;
    
    // Mock data - replace with API call
    setUserHistory({
      userId,
      completedPods: 1, // Change to 2+ to unlock
      sprintCompletionRate: 0.55, // Change to 0.6+ to unlock
      taskEaseScore: 3.2, // Change to 3.5+ to unlock
      customizationAttempts: 0
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            ⚙️ Personnalisation
          </h1>
          <p className="text-lg text-slate-600">
            Débloque la personnalisation en prouvant ta discipline
          </p>
        </div>

        <CustomizationPanel userHistory={userHistory} />
      </div>
    </div>
  );
}

