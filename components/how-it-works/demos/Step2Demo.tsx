'use client';

/**
 * Step 2 Demo: Scoring Animation
 * 
 * Shows transformation from empty form → scored + qualified.
 * Demonstrates the AI analysis and scoring breakdown.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type Stage = 'before' | 'animating' | 'after';

export default function Step2Demo() {
  const [stage, setStage] = useState<Stage>('before');
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    // Auto-play demo on mount
    const timer1 = setTimeout(() => {
      setStage('animating');
      
      // Animate score from 0 to 28
      let currentScore = 0;
      const scoreInterval = setInterval(() => {
        currentScore += 1;
        setScore(currentScore);
        
        if (currentScore >= 28) {
          clearInterval(scoreInterval);
          
          // Trigger confetti
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f97316']
          });
          
          // Move to after state
          setTimeout(() => {
            setStage('after');
          }, 500);
        }
      }, 50);
      
      return () => clearInterval(scoreInterval);
    }, 1000);

    return () => clearTimeout(timer1);
  }, [isPlaying]);

  const handleRestart = () => {
    setStage('before');
    setScore(0);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  };

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">Score de Faisabilité</h3>
        <button
          onClick={handleRestart}
          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          🔄 Rejouer
        </button>
      </div>
      
      <AnimatePresence mode="wait">
        {stage === 'before' && <BeforeState key="before" />}
        {stage === 'animating' && <AnimatingState key="animating" score={score} />}
        {stage === 'after' && <AfterState key="after" />}
      </AnimatePresence>
    </div>
  );
}

// Before State: Empty form
function BeforeState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-4"
    >
      {/* Score display - empty */}
      <div className="p-6 bg-gray-100 rounded-xl text-center">
        <div className="text-6xl font-bold text-gray-300 mb-2">0</div>
        <div className="text-sm text-gray-400">Score total (sur 50)</div>
        <div className="mt-3 inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
          Non qualifié
        </div>
      </div>
      
      {/* Empty sections */}
      <div className="space-y-3">
        {['Problème', 'Solution', 'Validation', 'Intimacy'].map((section) => (
          <div key={section} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-gray-400">{section}</span>
            <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-400 mt-6">
        Commencez à remplir pour voir votre score...
      </div>
    </motion.div>
  );
}

// Animating State: Score counting up
function AnimatingState({ score }: { score: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Score display - animating */}
      <div className="p-6 bg-gradient-to-r from-orange-100 to-blue-100 rounded-xl text-center">
        <motion.div
          key={score}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-6xl font-bold text-orange-600 mb-2"
        >
          {score}
        </motion.div>
        <div className="text-sm text-gray-700 mb-3">Score total (sur 50)</div>
        
        {/* Progress bar */}
        <div className="w-full bg-white rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(score / 50) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-orange-500 to-blue-500"
          />
        </div>
        
        <div className="mt-3 inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
          ⚡ Calcul en cours...
        </div>
      </div>
      
      {/* Sections filling in */}
      <div className="space-y-3">
        {[
          { name: 'Problème', filled: score > 5 },
          { name: 'Solution', filled: score > 12 },
          { name: 'Validation', filled: score > 20 },
          { name: 'Intimacy', filled: score > 25 }
        ].map((section) => (
          <motion.div
            key={section.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-lg flex items-center justify-between transition-colors ${
              section.filled ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <span className={`text-sm ${section.filled ? 'text-green-900 font-medium' : 'text-gray-400'}`}>
              {section.name}
            </span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: section.filled ? 1 : 0 }}
              className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs"
            >
              ✓
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// After State: Qualified with breakdown
function AfterState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Score display - final */}
      <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 15 }}
          className="text-6xl font-bold text-green-600 mb-2"
        >
          28
        </motion.div>
        <div className="text-sm text-gray-700 mb-3">Score total (sur 50)</div>
        
        {/* Full progress bar */}
        <div className="w-full bg-white rounded-full h-3 overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '56%' }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
          />
        </div>
        
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="inline-block px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold"
        >
          ✅ Qualifié pour Intilaka!
        </motion.div>
      </div>
      
      {/* Score breakdown */}
      <div className="space-y-2">
        <h4 className="font-bold text-sm text-gray-700 mb-3">Détails du score:</h4>
        
        {[
          { label: 'Clarity', score: 8.5, max: 10, color: 'green' },
          { label: 'Decision', score: 11.5, max: 40, color: 'orange' },
          { label: 'Intimacy', score: 8, max: 10, color: 'purple' }
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 bg-white rounded-lg border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-sm font-bold text-gray-900">
                {item.score}/{item.max}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.score / item.max) * 100}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                className={`h-full rounded-full bg-${item.color}-500`}
                style={{
                  backgroundColor: 
                    item.color === 'green' ? '#10b981' :
                    item.color === 'orange' ? '#f97316' :
                    '#9333ea'
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Next steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 bg-blue-50 rounded-lg"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🎯</span>
          <span className="font-bold text-sm">Prochaines étapes:</span>
        </div>
        <ul className="space-y-1 text-xs text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>3 mentors matchés</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>PDF Intilaka prêt</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-500">→</span>
            <span>Commencer la collecte de reçus</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
}

