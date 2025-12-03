/**
 * Hero Section Component
 * 
 * Based on PROJECT_MASTER_INSTRUCTIONS.md
 * - Pulsing microphone button (the "Hero")
 * - Viral headline in Darija: "Gol Fikrtk. Chouf Shariktk."
 * - Dynamic counter: "X Ideas Analyzed in Casablanca this week"
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mic } from 'lucide-react';

interface HeroSectionProps {
  initialCount?: number;
}

export function HeroSection({ initialCount = 1247 }: HeroSectionProps) {
  const [ideaCount, setIdeaCount] = useState(initialCount);
  const [isPulsing, setIsPulsing] = useState(true);

  // Simulate random increments
  useEffect(() => {
    const interval = setInterval(() => {
      // Random increment between 1-5
      const increment = Math.floor(Math.random() * 5) + 1;
      setIdeaCount(prev => prev + increment);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Format number with comma separator
  const formatCount = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="text-center mb-12">
      {/* Viral Headline (Darija) */}
      <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4" dir="rtl">
        <span className="block">Gol Fikrtk.</span>
        <span className="block text-green-600">Chouf Shariktk.</span>
      </h1>

      {/* Sub-head */}
      <p className="text-xl md:text-2xl text-slate-600 mb-8">
        No business plan needed. Just speak.
      </p>

      {/* Hero Microphone Button - Pulsing Animation */}
      <div className="flex justify-center mb-6">
        <Link href="/submit-voice">
          <button
            className={`
              relative
              w-24 h-24 md:w-32 md:h-32
              bg-gradient-to-br from-green-500 to-green-600
              rounded-full
              shadow-2xl
              flex items-center justify-center
              transition-all duration-300
              hover:scale-110
              active:scale-95
              ${isPulsing ? 'animate-pulse' : ''}
            `}
            onMouseEnter={() => setIsPulsing(false)}
            onMouseLeave={() => setIsPulsing(true)}
            aria-label="Start recording your idea"
          >
            {/* Breathing/Pulsing Ring */}
            {isPulsing && (
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
            )}
            
            {/* Microphone Icon */}
            <Mic className="w-12 h-12 md:w-16 md:h-16 text-white relative z-10" />
          </button>
        </Link>
      </div>

      {/* Dynamic Counter */}
      <div className="text-center">
        <p className="text-lg md:text-xl text-slate-700 font-semibold">
          <span className="text-green-600 font-bold">{formatCount(ideaCount)}</span>
          {' '}Ideas Analyzed in Casablanca this week
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Join the movement. Speak your idea.
        </p>
      </div>
    </div>
  );
}

