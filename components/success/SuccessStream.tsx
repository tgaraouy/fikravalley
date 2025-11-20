'use client';

/**
 * Success Stream - Live User Wins Feed
 * 
 * Real-time feed of user achievements that creates social proof,
 * FOMO, inspiration, and community feeling.
 * 
 * Psychology: If they can do it, I can too!
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface SuccessEvent {
  id: string;
  type: 'receipt' | 'qualified' | 'intimacy' | 'mentor' | 'milestone';
  user: {
    name: string;
    location: string;
    avatar: string;
  };
  data: {
    // For receipts
    count?: number;
    // For qualified
    score?: number;
    // For intimacy
    from?: number;
    to?: number;
    // For mentor match
    mentorName?: string;
    expertise?: string;
    // For milestone
    badgeName?: string;
    badgeIcon?: string;
  };
  timestamp: Date;
}

export default function SuccessStream() {
  const [events, setEvents] = useState<SuccessEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Initialize with events
  useEffect(() => {
    setEvents(generateInitialEvents());
  }, []);

  // Simulate WebSocket connection (replace with real WebSocket in production)
  useEffect(() => {
    if (isPaused) return;

    // Add new event every 5 seconds
    const interval = setInterval(() => {
      const newEvent = generateRandomEvent();
      setEvents(prev => [newEvent, ...prev].slice(0, 10)); // Keep last 10

      // If it's a qualification event, trigger confetti
      if (newEvent.type === 'qualified') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.3 },
          colors: ['#3b82f6', '#10b981', '#f97316']
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-blue-50 to-white">
      
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold mb-4"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🔴
            </motion.span>
            <span>EN DIRECT</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4">
            Des Marocains construisent{' '}
            <span className="text-orange-500">maintenant</span>
          </h2>
          
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Chaque petite victoire compte. Regardez-les se produire en temps réel.
          </p>
        </div>
        
        {/* Events Stream */}
        <div 
          className="relative h-[500px] sm:h-[600px] overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          
          <div className="space-y-3 sm:space-y-4">
            <AnimatePresence mode="popLayout">
              {events.map((event, index) => (
                <SuccessCard
                  key={event.id}
                  event={event}
                  index={index}
                  isExpanded={expandedEvent === event.id}
                  onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {/* Gradient fade at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          
        </div>
        
        {/* Pause indicator */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mt-4 text-xs sm:text-sm text-gray-500 flex items-center justify-center gap-2"
            >
              <span>⏸️</span>
              <span>Pause (survolez pour reprendre)</span>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
      
    </section>
  );
}

// Success Card Component
interface SuccessCardProps {
  event: SuccessEvent;
  index: number;
  isExpanded: boolean;
  onClick: () => void;
}

function SuccessCard({ event, index, isExpanded, onClick }: SuccessCardProps) {
  const variants = {
    initial: { 
      x: 300, 
      opacity: 0, 
      scale: 0.8 
    },
    animate: { 
      x: 0, 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
        delay: index * 0.05 // Stagger effect
      }
    },
    exit: { 
      x: -300, 
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  const borderColors = {
    receipt: 'border-green-500',
    qualified: 'border-blue-500',
    intimacy: 'border-purple-500',
    mentor: 'border-orange-500',
    milestone: 'border-yellow-500'
  };

  const bgColors = {
    receipt: 'bg-white',
    qualified: 'bg-white',
    intimacy: 'bg-white',
    mentor: 'bg-white',
    milestone: 'bg-gradient-to-r from-yellow-50 to-white'
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`
        p-4 sm:p-6 ${bgColors[event.type]} rounded-xl shadow-lg hover:shadow-xl 
        transition-all cursor-pointer border-l-4 ${borderColors[event.type]}
        ${event.type === 'milestone' ? 'relative overflow-hidden' : ''}
      `}
    >
      {/* Shimmer effect for milestone */}
      {event.type === 'milestone' && (
        <motion.div
          animate={{
            x: [-100, 300],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "linear"
          }}
          className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent skew-x-12"
        />
      )}

      <div className="flex items-start gap-3 sm:gap-4 relative">
        
        {/* Avatar(s) */}
        <div className="relative flex-shrink-0">
          {event.type === 'mentor' ? (
            // Overlapping avatars for mentor match
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <div
                className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm sm:text-base border-2 border-white z-10"
              >
                {event.user.name.charAt(0)}
              </div>
              <div
                className="absolute left-5 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base border-2 border-white"
              >
                {event.data.mentorName?.charAt(0) || 'M'}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base"
              >
                {event.user.name.charAt(0)}
              </div>
              {/* Type badge */}
              <div className="absolute -bottom-1 -right-1 text-base sm:text-xl">
                {getEventIcon(event.type)}
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-1 sm:mb-2 flex-wrap gap-1">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="font-bold text-gray-900 text-sm sm:text-base">{event.user.name}</span>
              <span className="text-gray-500 text-xs sm:text-sm">
                ({event.user.location})
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {formatTimeAgo(event.timestamp)}
            </span>
          </div>
          
          {/* Event-specific content */}
          {renderEventContent(event, isExpanded)}
          
        </div>
        
      </div>
    </motion.div>
  );
}

// Event Content Renderer
function renderEventContent(event: SuccessEvent, isExpanded: boolean) {
  switch (event.type) {
    case 'receipt':
      return (
        <div>
          <p className="text-gray-700 mb-2 text-sm sm:text-base">
            Vient de collecter son{' '}
            <span className="font-bold text-green-600">{event.data.count}ème reçu</span>! 💰
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((event.data.count || 0) / 50) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-green-500 h-1.5 sm:h-2 rounded-full"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{event.data.count}/50</span>
          </div>
          
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 rounded-lg overflow-hidden"
            >
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Stratégie:</strong> Validation en personne dans les cafés de {event.user.location}.
              </p>
              <p className="text-xs sm:text-sm text-gray-700 mt-2">
                <strong>Prochaine étape:</strong> {50 - (event.data.count || 0)} reçus de plus pour atteindre 50 (Strong Validation)
              </p>
            </motion.div>
          )}
        </div>
      );
    
    case 'qualified':
      return (
        <div>
          <p className="text-gray-700 mb-2 text-sm sm:text-base">
            Est maintenant{' '}
            <span className="font-bold text-blue-600">qualifié pour financement</span>! ✅
          </p>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-bold">
              Score: {event.data.score}/50
            </div>
            <button className="text-xs sm:text-sm text-blue-600 hover:underline font-medium">
              Voir son parcours →
            </button>
          </div>
          
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg space-y-2 overflow-hidden"
            >
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Clarity:</span>
                <span className="font-bold">8.5/10</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Decision:</span>
                <span className="font-bold">19.5/40</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Intimacy:</span>
                <span className="font-bold">7.2/10</span>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs sm:text-sm font-bold text-blue-900">
                  🎉 Eligible pour Intilaka! Probabilité de financement: 65%
                </p>
              </div>
            </motion.div>
          )}
        </div>
      );
    
    case 'intimacy':
      return (
        <div>
          <p className="text-gray-700 mb-2 text-sm sm:text-base">
            Intimacy score: {' '}
            <span className="font-bold text-purple-600">
              {event.data.from} → {event.data.to}
            </span>! 🧠
          </p>
          
          {/* Mini progress visualization */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: i < (event.data.to || 0) ? 1 : 0.3,
                  backgroundColor: i < (event.data.to || 0) ? '#9333ea' : '#e5e7eb'
                }}
                transition={{ delay: i * 0.05 }}
                className="w-2 h-6 sm:w-3 sm:h-8 rounded-full"
              />
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 italic">
            <span>"Locke serait fier!"</span>
          </div>
          
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 sm:mt-4 p-3 sm:p-4 bg-purple-50 rounded-lg overflow-hidden"
            >
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Amélioration:</strong> A ajouté une expérience vécue personnellement + 
                3 margin notes + 12 conversations documentées.
              </p>
              <p className="text-xs sm:text-sm text-purple-700 mt-2 font-medium">
                Passage de "knowing OF" → "TRUE KNOWING" (Locke's standard)
              </p>
            </motion.div>
          )}
        </div>
      );
    
    case 'mentor':
      return (
        <div>
          <p className="text-gray-700 mb-2 text-sm sm:text-base">
            Connecté avec{' '}
            <span className="font-bold text-orange-600">{event.data.mentorName}</span>{' '}
            (Expert {event.data.expertise})! 🎓
          </p>
          
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 sm:mt-4 p-3 sm:p-4 bg-orange-50 rounded-lg overflow-hidden"
            >
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Match score:</strong> 92/100 (Perfect match!)
              </p>
              <p className="text-xs sm:text-sm text-gray-700 mt-2">
                <strong>Raisons:</strong> Même secteur, expérience de 10 ans, 
                basé à {event.user.location}
              </p>
              <p className="text-xs sm:text-sm text-orange-700 mt-2 italic">
                "This mentor has LIVED experience in this domain" - Locke's insight
              </p>
            </motion.div>
          )}
        </div>
      );
    
    case 'milestone':
      return (
        <div>
          <p className="text-gray-700 mb-2 text-sm sm:text-base">
            A débloqué:{' '}
            <span className="font-bold text-yellow-600">"{event.data.badgeName}"</span>! 🏆
          </p>
          <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs sm:text-sm font-medium">
            <span className="text-base sm:text-lg">{event.data.badgeIcon}</span>
            <span>{event.data.badgeName}</span>
          </div>
          
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg overflow-hidden"
            >
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Signification:</strong> A collecté 50+ reçus en moins de 4 semaines.
              </p>
              <p className="text-xs sm:text-sm text-gray-700 mt-2">
                <strong>Prochaine étape:</strong> Viser "Market Proven" (200 reçus)
              </p>
              <p className="text-xs sm:text-sm text-yellow-700 mt-2 font-medium">
                🎉 Top 15% des idées sur Fikra Valley!
              </p>
            </motion.div>
          )}
        </div>
      );
  }
}

// Helper Functions
function getEventIcon(type: SuccessEvent['type']): string {
  const icons = {
    receipt: '💰',
    qualified: '✅',
    intimacy: '🧠',
    mentor: '🎓',
    milestone: '🏆'
  };
  return icons[type];
}

function formatTimeAgo(timestamp: Date): string {
  const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);
  
  if (seconds < 60) return 'À l\'instant';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes} min${minutes > 1 ? 's' : ''}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
}

function generateRandomEvent(): SuccessEvent {
  const names = ['Youssef', 'Amina', 'Karim', 'Fatima', 'Ahmed', 'Sarah', 'Omar', 'Leila', 'Hassan', 'Nadia', 'Mehdi', 'Zineb'];
  const cities = ['Rabat', 'Casablanca', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan'];
  const types: SuccessEvent['type'][] = ['receipt', 'qualified', 'intimacy', 'mentor', 'milestone'];
  const mentorNames = ['Rachid', 'Nadia', 'Hassan', 'Zineb', 'Mehdi', 'Salma', 'Youssef', 'Amina'];
  const expertise = ['Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'Agritech', 'Cleantech', 'Tourism', 'Manufacturing'];
  const badges = [
    { name: 'Proof Collector', icon: '🎯' },
    { name: 'Validation Champion', icon: '🏆' },
    { name: 'Deep Thinker', icon: '🧠' },
    { name: 'Community Helper', icon: '🤝' },
    { name: 'True Knower', icon: '🎓' },
    { name: 'Marathon Runner', icon: '🏃' }
  ];

  const type = types[Math.floor(Math.random() * types.length)];
  const user = {
    name: names[Math.floor(Math.random() * names.length)],
    location: cities[Math.floor(Math.random() * cities.length)],
    avatar: `/avatars/user-${Math.floor(Math.random() * 20)}.jpg`
  };

  let data: SuccessEvent['data'] = {};

  switch (type) {
    case 'receipt':
      data = { count: Math.floor(Math.random() * 100) + 1 };
      break;
    case 'qualified':
      data = { score: Math.floor(Math.random() * 8) + 25 }; // 25-32
      break;
    case 'intimacy':
      const from = Math.floor(Math.random() * 5) + 1; // 1-5
      data = { from, to: Math.min(from + Math.floor(Math.random() * 4) + 1, 10) }; // +1 to +4, max 10
      break;
    case 'mentor':
      data = {
        mentorName: mentorNames[Math.floor(Math.random() * mentorNames.length)],
        expertise: expertise[Math.floor(Math.random() * expertise.length)]
      };
      break;
    case 'milestone':
      const badge = badges[Math.floor(Math.random() * badges.length)];
      data = {
        badgeName: badge.name,
        badgeIcon: badge.icon
      };
      break;
  }

  return {
    id: Math.random().toString(36).substring(2, 11),
    type,
    user,
    data,
    timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000) // Within last hour
  };
}

function generateInitialEvents(): SuccessEvent[] {
  return Array.from({ length: 6 }, () => generateRandomEvent())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

