/**
 * Track FikraTag Page
 * 
 * Public page to view FikraTag progress
 * Accessible via WhatsApp link
 */

'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { parseFikraTag, isValidFikraTag } from '@/lib/fikra-tags/generator';
import MicroStepChain, { type MicroStep } from '@/components/fikra-tags/MicroStepChain';

export default function TrackFikraPage() {
  const params = useParams();
  const tag = params.tag as string;
  const [fikraTag, setFikraTag] = useState<any>(null);
  const [steps, setSteps] = useState<MicroStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tag && isValidFikraTag(tag)) {
      const parsed = parseFikraTag(tag);
      setFikraTag(parsed);
      
      // Load progress (in production, fetch from API)
      loadProgress(tag);
    } else {
      setLoading(false);
    }
  }, [tag]);

  const loadProgress = async (tag: string) => {
    // Mock data - replace with API call
    const mockSteps: MicroStep[] = [
      { id: 'step1', name: 'Define problem', status: 'completed' },
      { id: 'step2', name: 'Talk to 3 users', status: 'completed' },
      { id: 'step3', name: 'Build test', status: 'current' },
      { id: 'step4', name: 'Launch', status: 'future' }
    ];
    
    setSteps(mockSteps);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!fikraTag) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>FikraTag invalide</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white">
                {fikraTag.code}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Progression</h2>
              <MicroStepChain
                steps={steps}
                onStepClick={(step) => {
                  alert(`Step: ${step.name}`);
                }}
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                Partagez ce lien pour suivre la progression
              </p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Lien copié!');
                }}
              >
                Copier le lien
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

