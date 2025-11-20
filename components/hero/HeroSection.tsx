'use client';

/**
 * Fikra Valley Hero Section - ALIVE with animations
 * 
 * Features:
 * - Animated word-by-word hero text
 * - Live updating statistics with real-time counters
 * - Scrolling activity ticker
 * - Glassmorphism cards with hover effects
 * - Confetti celebration on CTA click
 * - Fully responsive design
 */

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

interface Stats {
  ideas: number;
  receipts: number;
  qualified: number;
  funding: number;
}

interface Activity {
  id: string;
  type: 'qualified' | 'receipt' | 'score_jump' | 'mentor_match' | 'document' | 'launch';
  user: string;
  location: string;
  detail: string;
  timestamp: Date;
}

export default function HeroSection() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    ideas: 1247,
    receipts: 23456,
    qualified: 347,
    funding: 12400000
  });
  
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'qualified',
      user: 'Youssef',
      location: 'Fès',
      detail: 'qualified',
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: '2',
      type: 'receipt',
      user: 'Amina',
      location: 'Casablanca',
      detail: '47',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '3',
      type: 'score_jump',
      user: 'Karim',
      location: 'Rabat',
      detail: '+3',
      timestamp: new Date(Date.now() - 8 * 60 * 1000)
    },
    {
      id: '4',
      type: 'mentor_match',
      user: 'Sarah',
      location: 'Marrakech',
      detail: 'mentor',
      timestamp: new Date(Date.now() - 12 * 60 * 1000)
    },
    {
      id: '5',
      type: 'document',
      user: 'Ahmed',
      location: 'Tanger',
      detail: 'pdf',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '6',
      type: 'launch',
      user: 'Fatima',
      location: 'Agadir',
      detail: 'launch',
      timestamp: new Date(Date.now() - 20 * 60 * 1000)
    }
  ]);
  
  // Simulate real-time updates
  useEffect(() => {
    // Update receipts every 10 seconds
    const receiptsInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        receipts: prev.receipts + 1
      }));
    }, 10000);
    
    // Update ideas every 30 seconds
    const ideasInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        ideas: prev.ideas + 1
      }));
    }, 30000);
    
    // Update qualified every 2 minutes
    const qualifiedInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        qualified: prev.qualified + 1
      }));
    }, 120000);
    
    // Update funding every minute
    const fundingInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        funding: prev.funding + 50000
      }));
    }, 60000);
    
    // Add new activity every 30 seconds
    const activityInterval = setInterval(() => {
      const newActivity = generateRandomActivity();
      setActivities(prev => [newActivity, ...prev].slice(0, 10));
    }, 30000);
    
    return () => {
      clearInterval(receiptsInterval);
      clearInterval(ideasInterval);
      clearInterval(qualifiedInterval);
      clearInterval(fundingInterval);
      clearInterval(activityInterval);
    };
  }, []);
  
  const handlePrimaryCTA = useCallback(() => {
    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#ea580c', '#fbbf24', '#10b981']
    });
    
    // Navigate after short delay
    setTimeout(() => {
      router.push('/submit');
    }, 500);
  }, [router]);
  
  const handleSecondaryCTA = useCallback(() => {
    // Smooth scroll to success stories section (if exists)
    const successSection = document.getElementById('success-stories');
    if (successSection) {
      successSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-blue-50 to-purple-50 overflow-hidden px-4 py-20">
      
      {/* Animated background elements */}
      <BackgroundAnimation />
      
      {/* Animated Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8 z-10"
      >
        <AnimatedText 
          text="Transformez vos Idées en Réalité" 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent leading-tight"
        />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-lg sm:text-xl md:text-2xl text-gray-600 text-center max-w-4xl mb-12 z-10 px-4"
      >
        Obtenez une validation technique instantanée et accédez à un réseau
        d'experts pour concrétiser vos projets au Maroc.
      </motion.p>
      
      {/* Living Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl w-full mb-12 z-10 px-4">
        
        <StatCard
          icon="💡"
          value={stats.ideas}
          label="Idées soumises"
          color="yellow"
          delay={0}
        />
        
        <StatCard
          icon="💰"
          value={stats.receipts}
          label="Conversations réelles"
          color="green"
          delay={0.1}
        />
        
        <StatCard
          icon="✅"
          value={stats.qualified}
          label="Qualifiés pour financement"
          percentage={Math.round((stats.qualified / stats.ideas) * 100)}
          color="blue"
          delay={0.2}
        />
        
        <StatCard
          icon="🏆"
          value={stats.funding}
          label="Financements obtenus"
          format="currency"
          color="gold"
          delay={0.3}
        />
        
      </div>
      
      {/* Live Activity Ticker */}
      <div className="w-full max-w-7xl mb-12 z-10 px-4">
        <ActivityTicker activities={activities} />
      </div>
      
      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 z-10 px-4">
        <motion.button
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrimaryCTA}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2 justify-center"
        >
          <span className="text-xl">🚀</span>
          <span>Tester mon Idée Gratuitement</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSecondaryCTA}
          className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-base sm:text-lg hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all flex items-center gap-2 justify-center"
        >
          <span className="text-xl">📖</span>
          <span>Voir les Success Stories</span>
        </motion.button>
      </div>
      
      {/* Subtle note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs sm:text-sm text-gray-500 text-center flex items-center gap-2 z-10 px-4"
      >
        <span>🔒</span>
        <span>Accès restreint pour le premier atelier • Demande d'accès requise</span>
      </motion.p>
      
    </section>
  );
}

// Animated Text Component (word-by-word reveal)
function AnimatedText({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  
  return (
    <h1 className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: i * 0.1,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="inline-block mr-2 sm:mr-3"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  percentage?: number;
  format?: 'number' | 'currency';
  color: 'yellow' | 'green' | 'blue' | 'gold';
  delay: number;
}

function StatCard({ icon, value, label, percentage, format = 'number', color, delay }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const colorClasses = {
    yellow: 'shadow-yellow-500/20 hover:shadow-yellow-500/40 border-yellow-100',
    green: 'shadow-green-500/20 hover:shadow-green-500/40 border-green-100',
    blue: 'shadow-blue-500/20 hover:shadow-blue-500/40 border-blue-100',
    gold: 'shadow-amber-500/20 hover:shadow-amber-500/40 border-amber-100'
  };
  
  // Smooth counting animation
  useEffect(() => {
    setIsAnimating(true);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = (value - displayValue) / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setDisplayValue(prev => prev + increment);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  const formattedValue = format === 'currency' 
    ? `${(displayValue / 1000000).toFixed(1)}M`
    : Math.round(displayValue).toLocaleString('fr-FR');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02, rotate: 1 }}
      className={`
        backdrop-blur-lg bg-white/40 border-2
        rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl ${colorClasses[color]}
        hover:shadow-2xl transition-all duration-300
        flex flex-col items-center justify-center
        min-h-[160px] sm:min-h-[180px] md:min-h-[200px]
      `}
    >
      {/* Animated Icon */}
      <motion.div
        animate={{
          scale: isAnimating ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4"
      >
        {icon}
      </motion.div>
      
      {/* Animated Number */}
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">
        {formattedValue}
        {format === 'currency' && <span className="text-xl sm:text-2xl md:text-3xl ml-1">DH</span>}
      </div>
      
      {/* Percentage if provided */}
      {percentage !== undefined && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.5 }}
          className="text-xs sm:text-sm font-semibold text-green-600 mb-1 sm:mb-2"
        >
          {percentage}% de succès
        </motion.div>
      )}
      
      {/* Label */}
      <div className="text-xs sm:text-sm text-gray-600 font-medium text-center">
        {label}
      </div>
    </motion.div>
  );
}

// Activity Ticker Component
function ActivityTicker({ activities }: { activities: Activity[] }) {
  const [isPaused, setIsPaused] = useState(false);
  
  const activityIcons: Record<Activity['type'], string> = {
    qualified: '🎉',
    receipt: '💰',
    score_jump: '🧠',
    mentor_match: '🎓',
    document: '✨',
    launch: '🚀'
  };
  
  const getActivityMessage = (activity: Activity): string => {
    const timeAgo = getTimeAgo(activity.timestamp);
    
    switch (activity.type) {
      case 'qualified':
        return `${activity.user} (${activity.location}) qualified ${timeAgo}`;
      case 'receipt':
        return `${activity.user} collected receipt #${activity.detail}`;
      case 'score_jump':
        return `${activity.user}'s score jumped ${activity.detail} points`;
      case 'mentor_match':
        return `${activity.user} matched with expert mentor`;
      case 'document':
        return `${activity.user} generated Intilaka PDF`;
      case 'launch':
        return `${activity.user}'s idea just launched`;
    }
  };
  
  // Duplicate activities for seamless loop
  const loopedActivities = [...activities, ...activities, ...activities];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="relative overflow-hidden bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-orange-500/10 rounded-xl py-3 sm:py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        animate={{
          x: isPaused ? undefined : ['0%', '-33.33%']
        }}
        transition={{
          x: {
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }
        }}
        className="flex gap-6 sm:gap-8 whitespace-nowrap"
      >
        {loopedActivities.map((activity, i) => (
          <div key={`${activity.id}-${i}`} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 px-2">
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                delay: i * 0.2
              }}
              className="text-base sm:text-lg"
            >
              {activityIcons[activity.type]}
            </motion.span>
            <span>{getActivityMessage(activity)}</span>
            <span className="text-gray-400">•</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// Background Animation Component
function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
          className="absolute w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}
      
      {/* Gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-20 right-10 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-3xl"
      />
    </div>
  );
}

// Helper: Generate random activity
function generateRandomActivity(): Activity {
  const names = ['Youssef', 'Amina', 'Karim', 'Fatima', 'Ahmed', 'Sarah', 'Omar', 'Leila', 'Hassan', 'Nadia'];
  const cities = ['Rabat', 'Casablanca', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan'];
  const types: Activity['type'][] = ['qualified', 'receipt', 'score_jump', 'mentor_match', 'document', 'launch'];
  
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    id: Math.random().toString(36).substring(7),
    type,
    user: names[Math.floor(Math.random() * names.length)],
    location: cities[Math.floor(Math.random() * cities.length)],
    detail: type === 'receipt' ? String(Math.floor(Math.random() * 100) + 1) : '+' + String(Math.floor(Math.random() * 5) + 1),
    timestamp: new Date()
  };
}

// Helper: Get time ago string
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 min ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 7200) return '1 hour ago';
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

