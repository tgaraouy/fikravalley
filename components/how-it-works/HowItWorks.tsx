'use client';

/**
 * Interactive How It Works Section
 * 
 * Transforms static process description into interactive demos
 * where users can EXPERIENCE each step before trying it.
 * 
 * Psychology: Show, don't tell. Interactive > Passive reading.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Step1Demo from './demos/Step1Demo';
import Step2Demo from './demos/Step2Demo';
import Step3Demo from './demos/Step3Demo';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
  demo: React.ReactNode;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Décrivez votre Défi",
    description: "Partagez votre contexte local et vos obstacles",
    icon: "📝",
    demo: <Step1Demo />
  },
  {
    id: 2,
    title: "Validation IA Immédiate",
    description: "Recevez instantanément un score de faisabilité",
    icon: "🤖",
    demo: <Step2Demo />
  },
  {
    id: 3,
    title: "Accélération & Financement",
    description: "Les projets validés accèdent à notre réseau d'experts",
    icon: "🚀",
    demo: <Step3Demo />
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-bold mb-4">
            COMMENT ÇA MARCHE ?
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
            Un parcours{' '}
            <span className="text-orange-500">simple</span>
            {' '}et{' '}
            <span className="text-blue-500">transparent</span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Fikra Valley offre une évaluation professionnelle gratuite. 
            Chaque soumission est examinée par notre équipe. 
            Les idées sélectionnées sont contactées dans un délai de 2-3 semaines.
          </p>
        </div>
        
        {/* Interactive Tabs - Desktop */}
        <div className="hidden md:grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left: Step Selector */}
          <div className="space-y-4">
            {steps.map(step => (
              <StepCard
                key={step.id}
                step={step}
                isActive={activeStep === step.id}
                onClick={() => setActiveStep(step.id)}
              />
            ))}
            
            {/* Progress indicator */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⚡</span>
                <span className="font-bold text-lg">Temps moyen</span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                2-3 semaines
              </div>
              <div className="text-sm text-gray-600">
                De la soumission au premier contact pour les idées sélectionnées
              </div>
            </div>
          </div>
          
          {/* Right: Interactive Demo */}
          <div className="relative sticky top-20">
            
            {/* Demo container with device mockup */}
            <div className="relative bg-gray-100 rounded-2xl shadow-2xl p-4 sm:p-6 aspect-[4/3]">
              
              {/* Browser chrome */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              
              {/* Demo content */}
              <div className="bg-white rounded-lg h-[calc(100%-40px)] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {steps.find(s => s.id === activeStep)?.demo}
                  </motion.div>
                </AnimatePresence>
              </div>
              
            </div>
            
            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 px-4 py-2 bg-green-500 text-white rounded-full shadow-lg text-sm font-bold z-10"
            >
              ✨ Essayez maintenant!
            </motion.div>
            
          </div>
          
        </div>
        
        {/* Mobile: Horizontal scroll pills + demo below */}
        <div className="md:hidden">
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {steps.map(step => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`
                  flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm
                  transition-all whitespace-nowrap
                  ${activeStep === step.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700'
                  }
                `}
              >
                <span className="mr-2">{step.icon}</span>
                <span>Étape {step.id}</span>
              </button>
            ))}
          </div>
          
          {/* Demo */}
          <div className="bg-gray-100 rounded-2xl p-4 aspect-[3/4]">
            <div className="bg-white rounded-lg h-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  {steps.find(s => s.id === activeStep)?.demo}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Mobile progress indicator */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚡</span>
              <span className="font-bold">Temps moyen</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              2-3 semaines
            </div>
            <div className="text-xs text-gray-600">
              De la soumission au premier contact
            </div>
          </div>
        </div>
        
      </div>
      
    </section>
  );
}

// Step Card Component
interface StepCardProps {
  step: Step;
  isActive: boolean;
  onClick: () => void;
}

function StepCard({ step, isActive, onClick }: StepCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        p-6 rounded-xl cursor-pointer transition-all
        ${isActive 
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl' 
          : 'bg-white border-2 border-gray-200 hover:border-orange-300'
        }
      `}
    >
      <div className="flex items-center gap-4">
        
        {/* Step number */}
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0
          ${isActive ? 'bg-white text-orange-500' : 'bg-orange-100 text-orange-500'}
        `}>
          {step.id}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg mb-1 ${isActive ? 'text-white' : 'text-gray-900'}`}>
            {step.title}
          </h3>
          <p className={`text-sm ${isActive ? 'text-white/90' : 'text-gray-600'}`}>
            {step.description}
          </p>
        </div>
        
        {/* Active indicator */}
        {isActive && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-2xl flex-shrink-0"
          >
            ▶️
          </motion.div>
        )}
        
      </div>
    </motion.div>
  );
}

