'use client';

/**
 * Interactive CTA - Multi-Path Conversion
 * 
 * Adapts to user intent with 3 persona-based journeys.
 * Not just "Sign Up" - personalized paths for different stages.
 * 
 * Psychology: Make users feel seen + reduce choice paralysis
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

interface Persona {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: 'green' | 'blue' | 'orange';
  cta: {
    primary: string;
    secondary: string;
    link: string;
  };
  benefits: string[];
  timeCommitment: string;
  quote: string;
}

const personas: Persona[] = [
  {
    id: 'starter',
    icon: '🌱',
    title: "J'ai une idée",
    description: "Je veux valider si ça vaut le coup",
    color: 'green',
    cta: {
      primary: "Tester Mon Idée (Gratuit)",
      secondary: "Voir des exemples",
      link: "/submit"
    },
    benefits: [
      "Validation IA instantanée",
      "Score de faisabilité",
      "Feedback constructif",
      "Roadmap personnalisée"
    ],
    timeCommitment: "15 minutes",
    quote: "\"J'ai su en 20 min si mon idée était viable\" - Youssef"
  },
  {
    id: 'validator',
    icon: '💰',
    title: "Je valide mon marché",
    description: "Je collecte des preuves de demande",
    color: 'blue',
    cta: {
      primary: "Commencer la Validation",
      secondary: "Voir la méthode",
      link: "/validate"
    },
    benefits: [
      "Stratégie de receipts",
      "Templates prêts",
      "Suivi en temps réel",
      "Coaching IA"
    ],
    timeCommitment: "1-2 semaines",
    quote: "\"127 reçus collectés en 3 semaines\" - Amina"
  },
  {
    id: 'builder',
    icon: '🚀',
    title: "Je cherche financement",
    description: "Mon idée est validée, je veux passer au niveau suivant",
    color: 'orange',
    cta: {
      primary: "Accéder au Financement",
      secondary: "Voir les opportunités",
      link: "/submit"
    },
    benefits: [
      "Dossiers auto-générés",
      "Matching investisseurs",
      "Réseau mentors",
      "Suivi application"
    ],
    timeCommitment: "2-3 semaines",
    quote: "\"80,000 DH obtenus en 6 semaines\" - Karim"
  }
];

export default function InteractiveCTA() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovering, setHovering] = useState<string | null>(null);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
      
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
            Où êtes-vous dans{' '}
            <span className="text-orange-500">votre parcours</span>?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
            Choisissez votre point de départ, nous vous guiderons.
          </p>
        </motion.div>
        
        {/* Persona Cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <PersonaCard
                persona={persona}
                isSelected={selected === persona.id}
                isHovering={hovering === persona.id}
                onSelect={() => setSelected(persona.id)}
                onHover={() => setHovering(persona.id)}
                onLeave={() => setHovering(null)}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Expanded CTA */}
        <AnimatePresence mode="wait">
          {selected && (
            <ExpandedCTA
              persona={personas.find(p => p.id === selected)!}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
        
        {/* Bottom CTA (if nothing selected) */}
        {!selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="text-gray-500 mb-6 text-sm sm:text-base">Pas sûr par où commencer?</div>
            <Link href="/submit">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-gray-800 transition-all"
              >
                💬 Parler à un conseiller
              </motion.button>
            </Link>
          </motion.div>
        )}
        
      </div>
      
    </section>
  );
}

// Persona Card Component
interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  isHovering: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function PersonaCard({ persona, isSelected, isHovering, onSelect, onHover, onLeave }: PersonaCardProps) {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    blue: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
    orange: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
  };

  return (
    <motion.div
      onClick={onSelect}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      whileHover={{ y: -10, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative cursor-pointer rounded-2xl overflow-hidden shadow-xl
        bg-gradient-to-br ${colorClasses[persona.color]}
        ${isSelected ? 'ring-4 ring-offset-4 ring-orange-500' : ''}
        transition-all
      `}
    >
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} 
        />
      </div>
      
      {/* Content */}
      <div className="relative p-6 sm:p-8 text-white">
        
        {/* Icon */}
        <motion.div
          animate={{
            scale: isHovering ? 1.2 : 1,
            rotate: isHovering ? 5 : 0
          }}
          className="text-5xl sm:text-6xl mb-4"
        >
          {persona.icon}
        </motion.div>
        
        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold mb-2">
          {persona.title}
        </h3>
        
        {/* Description */}
        <p className="text-white/90 mb-6 text-sm sm:text-base">
          {persona.description}
        </p>
        
        {/* Quick benefits */}
        <div className="space-y-2 mb-6">
          {persona.benefits.slice(0, 2).map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="flex-shrink-0">✓</span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
        
        {/* Time commitment */}
        <div className="text-xs sm:text-sm font-bold bg-white/20 rounded-lg px-3 py-2 inline-block mb-4">
          ⏱️ {persona.timeCommitment}
        </div>
        
        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="w-full py-3 bg-white text-gray-900 rounded-lg font-bold hover:shadow-2xl transition-all text-sm sm:text-base"
        >
          {persona.cta.primary} →
        </motion.button>
        
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xl"
        >
          ✓
        </motion.div>
      )}
      
    </motion.div>
  );
}

// Expanded CTA Component
interface ExpandedCTAProps {
  persona: Persona;
  onClose: () => void;
}

function ExpandedCTA({ persona, onClose }: ExpandedCTAProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-4 border-orange-500 mb-8"
    >
      
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl sm:text-5xl">{persona.icon}</div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">{persona.title}</h3>
            <p className="text-gray-600 text-sm sm:text-base">{persona.description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl flex-shrink-0"
        >
          ✕
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Left: Benefits */}
        <div>
          <h4 className="font-bold text-base sm:text-lg mb-4">Ce que vous obtenez:</h4>
          <div className="space-y-3">
            {persona.benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <span className="text-gray-700 text-sm sm:text-base">{benefit}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Quote */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
            <div className="text-sm italic text-gray-700">
              {persona.quote}
            </div>
          </div>
        </div>
        
        {/* Right: CTAs */}
        <div className="flex flex-col justify-center">
          
          <Link href={persona.cta.link}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-base sm:text-lg mb-4 shadow-lg hover:shadow-xl transition-all"
            >
              {persona.cta.primary} →
            </motion.button>
          </Link>
          
          <button className="w-full py-3 border-2 border-gray-300 rounded-xl font-semibold hover:border-orange-500 hover:text-orange-500 transition-all text-sm sm:text-base">
            {persona.cta.secondary}
          </button>
          
          <div className="mt-6 space-y-2 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>100% gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Pas de carte bancaire requise</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Résultats en {persona.timeCommitment}</span>
            </div>
          </div>
          
        </div>
        
      </div>
      
    </motion.div>
  );
}

