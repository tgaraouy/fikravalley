/**
 * Fikra Card Component
 * 
 * Mobile-first card for each idea
 * Thumb-sized, icon-based states
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shareFikraTag } from '@/lib/fikra-tags/share';
import type { FikraTag } from '@/lib/fikra-tags/generator';

export type FikraState = 'draft' | 'cooling_off' | 'step_active' | 'blocked' | 'completed';

export interface FikraCardData {
  tag: FikraTag;
  state: FikraState;
  title: string;
  titleDarija?: string;
  coolingOffHours?: number;
  currentStep?: string;
  nextStep?: string;
  progress?: number; // 0-100
  podName?: string;
  podProgress?: number;
}

interface FikraCardProps {
  data: FikraCardData;
  onView: (tag: string) => void;
  onLogProgress: (tag: string) => void;
  onGetHelp: (tag: string) => void;
}

const STATE_CONFIG: Record<FikraState, { icon: string; color: string; label: string; action: string }> = {
  draft: { icon: '📝', color: 'bg-slate-100 text-slate-700', label: 'Brouillon', action: 'Soumettre' },
  cooling_off: { icon: '⏳', color: 'bg-yellow-100 text-yellow-700', label: 'Refroidissement', action: 'Voir' },
  step_active: { icon: '🎯', color: 'bg-blue-100 text-blue-700', label: 'En cours', action: 'Log Progress' },
  blocked: { icon: '🚧', color: 'bg-red-100 text-red-700', label: 'Bloqué', action: 'Get Help' },
  completed: { icon: '✅', color: 'bg-green-100 text-green-700', label: 'Terminé', action: 'Start New Idea' }
};

export default function FikraCard({ data, onView, onLogProgress, onGetHelp }: FikraCardProps) {
  const [sharing, setSharing] = useState(false);
  const config = STATE_CONFIG[data.state];

  const handleShare = () => {
    setSharing(true);
    shareFikraTag(data.tag.code);
    setTimeout(() => setSharing(false), 1000);
  };

  return (
    <Card className="mb-4 border-2">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={config.color}>
              {config.icon} {data.tag.code}
            </Badge>
            {data.coolingOffHours && (
              <span className="text-xs text-slate-600">
                {data.coolingOffHours}h restantes
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={sharing}
          >
            {sharing ? '✓' : '📤'}
          </Button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 mb-1">
          {data.title}
        </h3>
        {data.titleDarija && (
          <p className="text-sm text-slate-600 mb-3" dir="rtl">
            {data.titleDarija}
          </p>
        )}

        {/* State Info */}
        <div className="mb-3">
          {data.state === 'step_active' && data.currentStep && (
            <p className="text-sm text-blue-700 mb-1">
              ✅ {data.currentStep}
            </p>
          )}
          {data.nextStep && (
            <p className="text-sm text-slate-600">
              🎯 Prochain: {data.nextStep}
            </p>
          )}
        </div>

        {/* Pod Progress (if in pod) */}
        {data.podName && (
          <div className="mb-3 p-2 bg-purple-50 rounded border border-purple-200">
            <p className="text-xs font-semibold text-purple-900 mb-1">
              POD: {data.podName}
            </p>
            {data.podProgress !== undefined && (
              <div className="w-full bg-purple-200 rounded-full h-1.5">
                <div
                  className="bg-purple-600 h-1.5 rounded-full"
                  style={{ width: `${data.podProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(data.tag.code)}
            className="flex-1"
          >
            Voir
          </Button>
          {data.state === 'step_active' && (
            <Button
              size="sm"
              onClick={() => onLogProgress(data.tag.code)}
              className="flex-1 bg-terracotta-600 hover:bg-terracotta-700"
            >
              Log Progress
            </Button>
          )}
          {data.state === 'blocked' && (
            <Button
              size="sm"
              onClick={() => onGetHelp(data.tag.code)}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Get Help
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

