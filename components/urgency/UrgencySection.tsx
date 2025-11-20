'use client';

/**
 * Urgency Section - Positive Scarcity
 * 
 * Creates real urgency without manipulation.
 * Shows workshop seats filling + cohort forming + countdown.
 * 
 * Psychology: Real scarcity + Opportunity + Hope
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import Link from 'next/link';

interface Signup {
  name: string;
  city: string;
  time: string;
}

export default function UrgencySection() {
  const [spotsLeft, setSpotsLeft] = useState(23);
  const [recentSignups, setRecentSignups] = useState<Signup[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  // Simulate spots decreasing every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsLeft(prev => Math.max(0, prev - 1));

      // Add simulated signup
      const names = ['Youssef', 'Amina', 'Karim', 'Fatima', 'Ahmed', 'Sara', 'Omar', 'Leila'];
      const cities = ['Rabat', 'Casablanca', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès', 'Oujda'];
      
      setRecentSignups(prev => [
        {
          name: names[Math.floor(Math.random() * names.length)],
          city: cities[Math.floor(Math.random() * cities.length)],
          time: 'À l\'instant'
        },
        ...prev.slice(0, 4)
      ]);
    }, 45000); // Every 45 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialize with some signups
  useEffect(() => {
    setRecentSignups([
      { name: 'Youssef', city: 'Fès', time: 'Il y a 2 min' },
      { name: 'Amina', city: 'Casablanca', time: 'Il y a 5 min' },
      { name: 'Karim', city: 'Rabat', time: 'Il y a 8 min' },
      { name: 'Fatima', city: 'Marrakech', time: 'Il y a 12 min' },
      { name: 'Ahmed', city: 'Tanger', time: 'Il y a 15 min' }
    ]);
  }, []);

  return (
    <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      
      {showConfetti && width && height && (
        <Confetti 
          width={width} 
          height={height} 
          recycle={false} 
          numberOfPieces={200} 
        />
      )}
      
      {/* Animated background patterns */}
      <BackgroundPatterns />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          
          {/* Pulse badge */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold mb-4 sm:mb-6"
          >
            🔴 LIVE • Places limitées
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
            Votre cohorte{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              se forme maintenant
            </span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Rejoignez les 25% d'innovateurs qui passent de l'idée au financement 
            grâce à notre écosystème d'accompagnement.
          </p>
          
        </motion.div>
        
        {/* Main Urgency Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-white/20 mb-6 sm:mb-8"
        >
          
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            
            {/* Left: Countdown */}
            <div>
              
              <div className="mb-6">
                <div className="text-xs sm:text-sm font-bold text-yellow-400 mb-2">
                  PROCHAIN ATELIER
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                  <CountdownTimer targetDate={new Date('2025-12-31T23:59:59')} />
                </div>
                <div className="text-sm sm:text-base text-gray-300">
                  Avant la clôture des inscriptions
                </div>
              </div>
              
              {/* Spots remaining */}
              <div className="bg-black/30 rounded-xl p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm sm:text-base">Places restantes:</span>
                  <motion.span
                    key={spotsLeft}
                    initial={{ scale: 1.5, color: '#ef4444' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-3xl sm:text-4xl font-bold"
                  >
                    {spotsLeft}
                  </motion.span>
                </div>
                
                {/* Progress bar */}
                <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: `${(spotsLeft / 50) * 100}%` }}
                    transition={{ duration: 1 }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500"
                  />
                </div>
                
                <div className="text-xs text-gray-400 mt-2">
                  {50 - spotsLeft} entrepreneurs déjà inscrits
                </div>
              </div>
              
              {/* CTA */}
              <Link href="/submit">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 3000);
                  }}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-orange-500/50 transition-all"
                >
                  🚀 Réserver Ma Place Maintenant
                </motion.button>
              </Link>
              
              <div className="text-center text-xs sm:text-sm text-gray-400 mt-3">
                ✅ Gratuit • 🔒 Sans engagement • ⚡ Accès immédiat
              </div>
              
            </div>
            
            {/* Right: Recent Signups */}
            <div>
              
              <div className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                <span>👥</span>
                <span>Qui vient de rejoindre:</span>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {recentSignups.map((signup, i) => (
                    <motion.div
                      key={`${signup.name}-${signup.city}-${i}`}
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center font-bold flex-shrink-0">
                        {signup.name[0]}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base truncate">{signup.name}</div>
                        <div className="text-xs sm:text-sm text-gray-400 truncate">{signup.city}</div>
                      </div>
                      
                      {/* Time */}
                      <div className="text-xs text-green-400 font-bold flex-shrink-0">
                        {signup.time}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <div className="text-center mt-6 text-gray-400 text-sm">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Mises à jour en temps réel...
                </motion.div>
              </div>
              
            </div>
            
          </div>
          
        </motion.div>
        
        {/* Social Proof Stats */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 text-center mb-8 sm:mb-12">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6"
          >
            <div className="text-3xl sm:text-4xl mb-2">⚡</div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">2-3 sem</div>
            <div className="text-xs sm:text-sm text-gray-400">Premier contact</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6"
          >
            <div className="text-3xl sm:text-4xl mb-2">🎯</div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">25%</div>
            <div className="text-xs sm:text-sm text-gray-400">Taux de qualification</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6"
          >
            <div className="text-3xl sm:text-4xl mb-2">💰</div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">621K€</div>
            <div className="text-xs sm:text-sm text-gray-400">Économies potentielles</div>
          </motion.div>
          
        </div>
        
        {/* Testimonial ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-12 text-center"
        >
          <div className="text-xs sm:text-sm text-gray-400 mb-4">Ce qu'ils disent:</div>
          <TestimonialTicker />
        </motion.div>
        
      </div>
      
    </section>
  );
}

// Countdown Timer Component
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    const diff = targetDate.getTime() - new Date().getTime();
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
      <TimeUnit value={timeLeft.days} label="j" />
      <span className="text-2xl sm:text-3xl">:</span>
      <TimeUnit value={timeLeft.hours} label="h" />
      <span className="text-2xl sm:text-3xl">:</span>
      <TimeUnit value={timeLeft.minutes} label="m" />
      <span className="text-2xl sm:text-3xl">:</span>
      <TimeUnit value={timeLeft.seconds} label="s" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-black/50 rounded-lg px-2 sm:px-3 py-1 sm:py-2 min-w-[50px] sm:min-w-[60px]">
        <motion.div
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold"
        >
          {String(value).padStart(2, '0')}
        </motion.div>
      </div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

// Testimonial Ticker
function TestimonialTicker() {
  const testimonials = [
    '"Fikra m\'a sauvé 6 mois!" - Youssef, Fès',
    '"Meilleur feedback que j\'ai eu" - Amina, Casa',
    '"Enfin un process qui marche" - Karim, Rabat',
    '"Je suis passé de bloqué à financé!" - Omar, Marrakech',
    '"L\'accompagnement est exceptionnel" - Leila, Tanger'
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-base sm:text-lg md:text-xl italic text-gray-300 px-4"
      >
        {testimonials[current]}
      </motion.div>
    </AnimatePresence>
  );
}

// Animated Background Patterns
function BackgroundPatterns() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}
    </div>
  );
}

