'use client';

/**
 * Step 3 Demo: Journey Timeline
 * 
 * Animated timeline showing idea → launch progression.
 * Visualizes the full entrepreneurial journey with milestones.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface TimelineNode {
  id: string;
  label: string;
  time: string;
  icon: string;
  description: string;
}

const nodes: TimelineNode[] = [
  { id: 'submit', label: 'Soumission', time: 'Jour 0', icon: '📝', description: 'Vous soumettez votre idée' },
  { id: 'validate', label: 'Validation IA', time: 'Jour 1', icon: '🤖', description: 'Score de faisabilité calculé' },
  { id: 'receipts', label: 'Collecte reçus', time: 'Semaine 3', icon: '💰', description: '50 conversations validées' },
  { id: 'qualified', label: 'Qualifié', time: 'Semaine 6', icon: '✅', description: 'Score ≥ 25/50 atteint' },
  { id: 'mentor', label: 'Mentor', time: 'Semaine 7', icon: '🎓', description: 'Expert matché avec vous' },
  { id: 'funding', label: 'Financement', time: 'Semaine 10', icon: '💵', description: '50-80k DH d\'Intilaka' },
  { id: 'mvp', label: 'MVP', time: 'Semaine 14', icon: '🛠️', description: 'Prototype fonctionnel' },
  { id: 'launch', label: 'Launch', time: 'Semaine 18', icon: '🚀', description: 'Lancement officiel!' }
];

export default function Step3Demo() {
  const [currentNode, setCurrentNode] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentNode(prev => {
        if (prev >= nodes.length - 1) {
          clearInterval(timer);
          
          // Trigger confetti on launch
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f97316', '#3b82f6', '#10b981', '#eab308']
          });
          
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleRestart = () => {
    setCurrentNode(0);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  };

  const progressPercentage = ((currentNode + 1) / nodes.length) * 100;

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg">Votre Parcours</h3>
          <p className="text-xs text-gray-500">De l'idée au lancement</p>
        </div>
        <button
          onClick={handleRestart}
          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          🔄 Rejouer
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-orange-500 via-blue-500 to-green-500"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Début</span>
          <span className="font-bold text-orange-600">
            {Math.round(progressPercentage)}% complété
          </span>
          <span>Launch 🚀</span>
        </div>
      </div>
      
      {/* Timeline nodes */}
      <div className="space-y-4">
        {nodes.map((node, index) => (
          <TimelineNodeCard
            key={node.id}
            node={node}
            index={index}
            isActive={index === currentNode}
            isCompleted={index < currentNode}
            isUpcoming={index > currentNode}
          />
        ))}
      </div>
      
      {/* Success probability */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: currentNode >= 3 ? 1 : 0,
          scale: currentNode >= 3 ? 1 : 0.9
        }}
        className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📊</span>
          <span className="font-bold text-sm">Probabilité de succès:</span>
        </div>
        <div className="text-3xl font-bold text-green-600 mb-1">
          {currentNode < 3 ? '40%' : currentNode < 5 ? '65%' : currentNode < 7 ? '85%' : '95%'}
        </div>
        <div className="text-xs text-gray-600">
          {currentNode < 3 && 'Continuez à valider votre idée'}
          {currentNode >= 3 && currentNode < 5 && 'Excellente progression!'}
          {currentNode >= 5 && currentNode < 7 && 'Presque au financement!'}
          {currentNode >= 7 && 'Prêt pour le lancement!'}
        </div>
      </motion.div>
    </div>
  );
}

// Timeline Node Card
interface TimelineNodeCardProps {
  node: TimelineNode;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isUpcoming: boolean;
}

function TimelineNodeCard({ node, index, isActive, isCompleted, isUpcoming }: TimelineNodeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: isActive ? 1.02 : 1
      }}
      transition={{ delay: index * 0.1 }}
      className={`
        relative flex items-start gap-4 p-4 rounded-lg transition-all
        ${isActive ? 'bg-gradient-to-r from-orange-100 to-blue-100 shadow-md' : ''}
        ${isCompleted ? 'bg-green-50' : ''}
        ${isUpcoming ? 'bg-gray-50' : ''}
      `}
    >
      
      {/* Timeline line */}
      {index < 7 && (
        <div className="absolute left-[30px] top-[60px] w-0.5 h-12 bg-gray-300">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: isCompleted ? '100%' : 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-gradient-to-b from-orange-500 to-blue-500"
          />
        </div>
      )}
      
      {/* Node icon */}
      <div className="relative flex-shrink-0 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center text-xl
            ${isActive ? 'bg-gradient-to-br from-orange-500 to-blue-500 text-white shadow-lg' : ''}
            ${isCompleted ? 'bg-green-500 text-white' : ''}
            ${isUpcoming ? 'bg-gray-200 text-gray-400' : ''}
          `}
        >
          {isCompleted ? '✓' : node.icon}
        </motion.div>
        
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-orange-400"
          />
        )}
      </div>
      
      {/* Node content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`font-bold text-sm ${isActive ? 'text-orange-700' : isCompleted ? 'text-green-700' : 'text-gray-700'}`}>
            {node.label}
          </h4>
          <span className="text-xs text-gray-500">{node.time}</span>
        </div>
        
        <p className={`text-xs ${isActive ? 'text-gray-700' : 'text-gray-600'}`}>
          {node.description}
        </p>
        
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-bold"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              ⚡
            </motion.span>
            <span>En cours</span>
          </motion.div>
        )}
        
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 font-medium"
          >
            <span>✓</span>
            <span>Complété</span>
          </motion.div>
        )}
        
        {isUpcoming && (
          <div className="mt-2 text-xs text-gray-400">
            À venir
          </div>
        )}
      </div>
    </motion.div>
  );
}

