/**
 * Content Moderation Wrapper Component
 * 
 * Wraps input components to provide real-time content moderation
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { moderateContent, type ModerationResult } from '@/lib/moderation/content-moderation';

interface ContentModerationWrapperProps {
  children: (props: {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
  }) => React.ReactNode;
  onModerationChange?: (result: ModerationResult) => void;
  showWarnings?: boolean;
  strict?: boolean;
}

export default function ContentModerationWrapper({
  children,
  onModerationChange,
  showWarnings = true,
  strict = false
}: ContentModerationWrapperProps) {
  const [value, setValue] = useState('');
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (value.trim().length > 0) {
      const result = moderateContent(value, { strict });
      setModerationResult(result);
      
      if (onModerationChange) {
        onModerationChange(result);
      }
      
      // Show warning if content is flagged
      if (!result.allowed || result.flaggedWords) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    } else {
      setModerationResult(null);
      setShowWarning(false);
    }
  }, [value, strict, onModerationChange]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-2">
      {children({
        value,
        onChange: handleChange
      })}

      {/* Moderation Warning */}
      {showWarnings && showWarning && moderationResult && (
        <div className={`p-3 rounded-lg border ${getSeverityColor(moderationResult.severity)}`}>
          <div className="flex items-start gap-2">
            {getSeverityIcon(moderationResult.severity)}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {moderationResult.allowed ? 'Contenu signalé pour révision' : 'Contenu bloqué'}
              </p>
              {moderationResult.reason && (
                <p className="text-xs mt-1">{moderationResult.reason}</p>
              )}
              {moderationResult.flaggedWords && moderationResult.flaggedWords.length > 0 && (
                <p className="text-xs mt-1">
                  Mots détectés: {moderationResult.flaggedWords.join(', ')}
                </p>
              )}
              {moderationResult.suggestions && (
                <ul className="text-xs mt-2 space-y-1">
                  {moderationResult.suggestions.map((suggestion, idx) => (
                    <li key={idx}>• {suggestion}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success indicator */}
      {showWarnings && !showWarning && value.trim().length > 10 && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Contenu conforme</span>
        </div>
      )}
    </div>
  );
}

