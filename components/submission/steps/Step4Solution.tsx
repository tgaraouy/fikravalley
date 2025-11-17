'use client';

/**
 * Step 4: Solution
 * 
 * Solution description with similar ideas and voice-to-text
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VoiceRecorder from '@/components/VoiceRecorder';
import Link from 'next/link';

interface SimilarIdea {
  id: string;
  title: string;
  category: string;
  similarity: number;
}

interface Step4SolutionProps {
  value: string;
  onChange: (value: string) => void;
  similarIdeas?: SimilarIdea[];
  onSimilarIdeasLoad?: () => void;
}

export default function Step4Solution({
  value,
  onChange,
  similarIdeas = [],
  onSimilarIdeasLoad,
}: Step4SolutionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);

  useEffect(() => {
    if (value.length > 50 && onSimilarIdeasLoad) {
      onSimilarIdeasLoad();
    }
  }, [value, onSimilarIdeasLoad]);

  const handleTranscription = (text: string) => {
    onChange(value ? `${value} ${text}` : text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">4. Quelle est votre solution ?</h2>
        <p className="text-slate-600 mt-1">Décrivez votre solution proposée</p>
      </div>

      {/* Main Input */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Description de la solution</CardTitle>
              <CardDescription>
                Expliquez comment votre solution résout le problème
              </CardDescription>
            </div>
            <VoiceRecorder
              onTranscription={handleTranscription}
              isRecording={isRecording}
              onStartRecording={() => setIsRecording(true)}
              onStopRecording={() => setIsRecording(false)}
              isTranscribing={isTranscribing}
              fieldName="solution"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ex: Un système digital qui permet de rechercher les dossiers patients en quelques secondes, avec un formulaire digital qui se remplit automatiquement à partir des données existantes..."
            rows={8}
            className="resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <Badge className="bg-indigo-100 text-indigo-800">
              {value.length} caractères
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSimilar(!showSimilar)}
              disabled={similarIdeas.length === 0}
            >
              {showSimilar ? 'Masquer' : 'Voir'} les idées similaires ({similarIdeas.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Similar Ideas */}
      {showSimilar && similarIdeas.length > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900">💡 Idées similaires</CardTitle>
            <CardDescription>
              D'autres idées qui pourraient vous inspirer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {similarIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-3 bg-white rounded-lg border border-purple-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/ideas/${idea.id}`}
                        className="font-semibold text-purple-900 hover:underline"
                      >
                        {idea.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {idea.category}
                        </Badge>
                        <span className="text-xs text-purple-600">
                          {idea.similarity}% similaire
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="text-indigo-900 text-sm">💡 Conseils</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-indigo-800">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span>Décrivez la solution de manière simple et claire</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span>Expliquez comment elle résout le problème identifié</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span>Mentionnez les technologies ou méthodes utilisées</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span>Pensez à un MVP (Minimum Viable Product) d'abord</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

