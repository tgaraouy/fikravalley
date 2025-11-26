'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface IdeasDatabaseHeroProps {
  totalIdeas?: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
}

export default function IdeasDatabaseHero({ 
  totalIdeas = 247,
  searchQuery: externalSearchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur
}: IdeasDatabaseHeroProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Use external search query if provided, otherwise use internal
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchChange || setInternalSearchQuery;
  
  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Trigger search logic
    if (process.env.NODE_ENV === 'development') {
      console.log('Searching for:', query);
    }
    // TODO: Implement actual search functionality
    // This could navigate to a search results page or filter ideas
  };
  
  const popularSearches = [
    'santé', 'education', 'agriculture', 'fintech', 
    'صحة', 'darija', 'sṣeḥa', 'startup'
  ];
  
  return (
    <section className="relative py-12 md:py-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white overflow-hidden">
      
      {/* Animated Background Pattern */}
      <BackgroundPattern />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4"
        >
          Morocco's Innovation Database
        </motion.h1>
        
        {/* Live Counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-2xl md:text-3xl font-semibold mb-3"
        >
          <CountUp 
            end={totalIdeas} 
            duration={2}
            separator=","
          />{' '}
          validated ideas building Morocco's future
        </motion.div>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg md:text-xl lg:text-2xl opacity-90 mb-12 max-w-3xl mx-auto"
        >
          Discover, validate, and support innovative solutions for Morocco
        </motion.p>
        
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-4xl mx-auto relative"
          ref={searchRef}
        >
          <div className={`
            relative bg-white rounded-2xl shadow-2xl overflow-hidden
            transition-all duration-200
            ${isFocused ? 'ring-4 ring-green-500/20 border-2 border-green-500' : 'border-2 border-transparent'}
          `}>
            <div className="flex items-center flex-wrap md:flex-nowrap">
              
              {/* Search Icon */}
              <div className="pl-4 md:pl-6 text-gray-400">
                <MagnifyingGlassIcon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              
              {/* Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsFocused(true);
                  onSearchFocus?.();
                }}
                onBlur={() => {
                  // Delay to allow clicking on suggestions
                  setTimeout(() => {
                    onSearchBlur?.();
                  }, 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleSearch(searchQuery);
                    setIsFocused(false);
                  }
                }}
                placeholder="Search ideas in Darija, French, or Arabic... (e.g., 'santé', 'صحة', 'sṣeḥa')"
                className="flex-1 px-3 md:px-4 py-4 md:py-5 text-base md:text-lg text-gray-900 placeholder-gray-500 outline-none"
              />
              
              {/* Language Badges */}
              <div className="hidden md:flex pr-4 md:pr-6 gap-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded whitespace-nowrap">
                  🇲🇦 Darija
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded whitespace-nowrap">
                  🇫🇷 Français
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded whitespace-nowrap">
                  🇸🇦 عربي
                </span>
              </div>
              
            </div>
            
            {/* Mobile Language Badges */}
            <div className="md:hidden flex gap-2 px-4 pb-3 justify-center">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                🇲🇦 Darija
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                🇫🇷 Français
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                🇸🇦 عربي
              </span>
            </div>
          </div>
          
          {/* Search Suggestions */}
          <AnimatePresence>
            {isFocused && searchQuery.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl p-4 z-50"
              >
                <div className="text-sm text-gray-600 mb-3 font-semibold text-left">
                  Popular searches:
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map(term => (
                    <button
                      key={term}
                      onClick={() => {
                        handleSearch(term);
                        setIsFocused(false);
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-green-100 text-gray-700 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
      </div>
      
    </section>
  );
}

// Background Pattern Component
function BackgroundPattern() {
  // Use useState to generate random values only on client side
  // This prevents hydration mismatch between server and client
  const [shapes, setShapes] = useState<Array<{
    id: number;
    size: number;
    left: number;
    top: number;
    duration: number;
    delay: number;
    type: 'circle' | 'triangle';
  }>>([]);

  useEffect(() => {
    // Generate random shapes only on client side
    setShapes(Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 100 + 50,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
      type: i % 2 === 0 ? 'circle' : 'triangle' as 'circle' | 'triangle'
    })));
  }, []);
  
  // Don't render anything until shapes are generated (client-side only)
  if (shapes.length === 0) {
    return null;
  }
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {shapes.map(shape => (
        <motion.div
          key={shape.id}
          animate={{
            y: [0, -50, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut"
          }}
          className={`absolute bg-white ${shape.type === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
          style={{
            width: shape.size,
            height: shape.size,
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            filter: 'blur(2px)',
            opacity: 0.15
          }}
        />
      ))}
    </div>
  );
}

