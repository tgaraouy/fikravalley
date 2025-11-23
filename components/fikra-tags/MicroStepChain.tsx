/**
 * Micro-Step Chain Visualization
 * 
 * Shows chain of micro-steps (like dominoes)
 * Completed = green dots, current = pulsing, future = gray
 */

'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export interface MicroStep {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'future';
  data?: {
    text?: string;
    voice?: string;
    agentOutputs?: any[];
  };
}

interface MicroStepChainProps {
  steps: MicroStep[];
  onStepClick: (step: MicroStep) => void;
}

export default function MicroStepChain({ steps, onStepClick }: MicroStepChainProps) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {/* Step Dot */}
          <motion.button
            onClick={() => onStepClick(step)}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              transition-all cursor-pointer
              ${step.status === 'completed' 
                ? 'bg-green-500 text-white' 
                : step.status === 'current'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-300 text-slate-600'
              }
            `}
            animate={step.status === 'current' ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {step.status === 'completed' ? '✓' : index + 1}
          </motion.button>
          
          {/* Step Label */}
          <div className="ml-2 min-w-[120px]">
            <p className="text-xs font-medium text-slate-700">
              {step.name}
            </p>
            {step.status === 'completed' && step.data && (
              <button
                onClick={() => onStepClick(step)}
                className="text-xs text-blue-600 mt-1"
              >
                Voir détails →
              </button>
            )}
          </div>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className={`
              w-8 h-0.5 mx-2
              ${step.status === 'completed' ? 'bg-green-500' : 'bg-slate-300'}
            `} />
          )}
        </div>
      ))}
    </div>
  );
}

