'use client';

/**
 * AI Suggestion Agent
 * 
 * Provides real-time AI-powered suggestions as users type in form fields.
 * Appears as floating suggestions that users can accept or dismiss.
 */

import { useState, useEffect, useRef, useId } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, X, Lightbulb, Loader2 } from 'lucide-react';

interface Suggestion {
  id: string;
  field: string;
  originalText: string;
  suggestedText: string;
  reason: string;
  confidence: number;
  timestamp: Date;
}

interface AISuggestionAgentProps {
  fieldName: string;
  currentValue: string;
  context?: Record<string, any>;
  onSuggestionAccept: (suggestion: string) => void;
  language?: 'fr' | 'darija';
  debounceMs?: number;
}

export default function AISuggestionAgent({
  fieldName,
  currentValue,
  context,
  onSuggestionAccept,
  language = 'fr',
  debounceMs = 1500,
}: AISuggestionAgentProps) {
  const baseId = useId();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Reset dismissed state when value changes significantly
    if (currentValue.length > 20 && !dismissed) {
      setIsVisible(true);
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only suggest if text is substantial and not just whitespace
    if (currentValue.trim().length < 30) {
      setSuggestion(null);
      setIsVisible(false);
      return;
    }

    // Debounce API call
    debounceTimer.current = setTimeout(async () => {
      if (dismissed) return;

      setIsLoading(true);
      try {
        const response = await fetch('/api/ai/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field: fieldName,
            currentValue: currentValue,
            context: context,
            language: language,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.suggestion && data.confidence > 0.6) {
            setSuggestion({
              id: `${baseId}-suggestion-${Date.now()}`,
              field: fieldName,
              originalText: currentValue,
              suggestedText: data.suggestion,
              reason: data.reason,
              confidence: data.confidence,
              timestamp: new Date(),
            });
            setIsVisible(true);
          } else {
            setSuggestion(null);
            setIsVisible(false);
          }
        }
      } catch (error) {
        console.error('Error getting AI suggestion:', error);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [currentValue, fieldName, context, language, debounceMs, dismissed]);

  const handleAccept = () => {
    if (suggestion) {
      onSuggestionAccept(suggestion.suggestedText);
      setSuggestion(null);
      setIsVisible(false);
      setDismissed(true);
      // Reset dismissed after a delay
      setTimeout(() => setDismissed(false), 5000);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    setTimeout(() => setDismissed(false), 10000);
  };

  if (!isMounted || !isVisible || !suggestion || dismissed) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in slide-in-from-top-2">
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="relative">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-indigo-500 animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-white">
                  Suggestion IA
                </Badge>
                <span className="text-xs text-slate-500">
                  Confiance: {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    {language === 'darija' ? 'L-IA t9tarek:' : 'L\'IA suggère:'}
                  </p>
                  <p className="text-sm text-slate-900 bg-white p-2 rounded border border-indigo-200">
                    {suggestion.suggestedText}
                  </p>
                </div>

                {suggestion.reason && (
                  <p className="text-xs text-slate-600 italic">
                    💡 {suggestion.reason}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-slate-600 hover:text-slate-900 text-xs h-7"
                >
                  <X className="w-3 h-3 mr-1" />
                  Ignorer
                </Button>
              </div>
            </div>

            {isLoading && (
              <div className="flex-shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

