/**
 * Micro-Validation Component
 * 
 * Task-difficulty survey after EACH micro-step
 * "Was it easy?" (1-5 scale) with open-text blockers
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { recordTaskDifficulty } from './think-time-ux';

interface MicroValidationProps {
  stepId: string;
  stepName: string;
  onComplete: (difficulty: number, blockers?: string) => void;
  onSkip?: () => void;
}

export default function MicroValidation({ 
  stepId, 
  stepName, 
  onComplete,
  onSkip 
}: MicroValidationProps) {
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [blockers, setBlockers] = useState('');
  const [showBlockers, setShowBlockers] = useState(false);

  const handleSubmit = () => {
    if (difficulty === null) return;
    
    // Record difficulty
    const needsAttention = recordTaskDifficulty(stepId, difficulty, blockers);
    
    // Callback
    onComplete(difficulty, blockers);
    
    // If < 3.5/5, flag for review
    if (needsAttention) {
      console.warn(`⚠️ Step ${stepId} has low success rate (< 3.5/5)`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <Card className="border-2 border-terracotta-200 shadow-xl bg-white">
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                💭 Comment était cette étape?
              </h3>
              <p className="text-sm text-slate-600">
                "{stepName}" - C'était facile?
              </p>
            </div>

            {/* Difficulty Scale */}
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setDifficulty(num);
                    if (num <= 2) {
                      setShowBlockers(true); // Show blockers if difficult
                    }
                  }}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    difficulty === num
                      ? 'bg-terracotta-600 border-terracotta-700 text-white scale-110'
                      : 'bg-white border-slate-300 hover:border-terracotta-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 px-2">
              <span>Très difficile</span>
              <span>Très facile</span>
            </div>

            {/* Blockers (if difficulty <= 2) */}
            {showBlockers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-slate-700">
                  Qu'est-ce qui t'a bloqué? (optionnel)
                </label>
                <textarea
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  placeholder="Ex: Je ne savais pas quoi écrire, c'était trop long..."
                  className="w-full p-2 border rounded-lg text-sm"
                  rows={2}
                />
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {onSkip && (
                <Button
                  variant="outline"
                  onClick={onSkip}
                  className="flex-1"
                >
                  Passer
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={difficulty === null}
                className="flex-1 bg-terracotta-600 hover:bg-terracotta-700"
              >
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

