'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';

// ============================================================================
// MOBILE FILTERS BOTTOM SHEET
// ============================================================================

interface MobileFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  onApply: () => void;
  children: React.ReactNode;
}

export function MobileFilters({ filters, setFilters, onApply, children }: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  useEffect(() => {
    // Count active filters
    const count = Object.values(filters).filter((v: any) => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'number') return v !== 0;
      return v !== null && v !== '';
    }).length;
    setActiveFiltersCount(count);
  }, [filters]);
  
  useEffect(() => {
    // Prevent body scroll when sheet is open
    if (isOpen) {
      document.body.classList.add('sheet-open');
    } else {
      document.body.classList.remove('sheet-open');
    }
    
    return () => {
      document.body.classList.remove('sheet-open');
    };
  }, [isOpen]);
  
  const handleClear = () => {
    setFilters({
      status: [],
      priorities: [],
      sectors: [],
      locations: [],
      minReceipts: 0,
      intimacy: null,
      timeframe: null
    });
  };
  
  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-white border-2 border-gray-300 rounded-full shadow-xl font-bold flex items-center gap-2"
      >
        <span>🎛️</span>
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {activeFiltersCount}
          </span>
        )}
      </motion.button>
      
      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info: PanInfo) => {
                if (info.offset.y > 200) {
                  setIsOpen(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="sticky top-0 bg-white pt-4 pb-2 px-4 border-b border-gray-200 z-10">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing" />
                
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Filters</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleClear}
                      className="text-sm text-green-600 font-semibold min-h-[44px] px-3"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        onApply();
                        setIsOpen(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold min-h-[44px]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Filter Content */}
              <div className="p-4">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// SWIPEABLE IDEA CARD
// ============================================================================

interface SwipeableIdeaCardProps {
  idea: any;
  onLike: (ideaId: string) => void;
  onShare: (idea: any) => void;
  children: React.ReactNode;
}

export function SwipeableIdeaCard({ idea, onLike, onShare, children }: SwipeableIdeaCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnd = (e: any, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x > 100) {
      // Swipe right: Like
      onLike(idea.id);
      // Haptic feedback (if supported)
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } else if (info.offset.x < -100) {
      // Swipe left: Share
      onShare(idea);
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
    
    // Snap back
    setOffsetX(0);
  };
  
  return (
    <div className="relative">
      {/* Background Icons (revealed on swipe) */}
      <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
        <motion.div
          animate={{ 
            opacity: offsetX > 50 ? 1 : 0, 
            scale: offsetX > 50 ? 1 : 0.5 
          }}
          className="text-4xl"
        >
          ❤️
        </motion.div>
        <motion.div
          animate={{ 
            opacity: offsetX < -50 ? 1 : 0, 
            scale: offsetX < -50 ? 1 : 0.5 
          }}
          className="text-4xl"
        >
          🔗
        </motion.div>
      </div>
      
      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDrag={(e, info) => setOffsetX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={{ x: offsetX }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'pan-y' // Allow vertical scrolling
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================================================
// FLOATING ACTION BUTTON (FAB)
// ============================================================================

export function FloatingSubmitButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ 
        scale: isVisible ? 1 : 0,
        y: isVisible ? 0 : 100
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => router.push('/submit')}
      className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center text-2xl"
      aria-label="Submit new idea"
    >
      💡
    </motion.button>
  );
}

// ============================================================================
// PULL TO REFRESH
// ============================================================================

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isDragging = useRef(false);
  
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isDragging.current = true;
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || window.scrollY !== 0) return;
      
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;
      
      if (distance > 0) {
        setPullDistance(Math.min(distance, 150));
        // Prevent default scroll if pulling
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };
    
    const handleTouchEnd = async () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      
      if (pullDistance > 100 && !isRefreshing) {
        setIsRefreshing(true);
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        await onRefresh();
        setIsRefreshing(false);
      }
      setPullDistance(0);
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);
  
  return (
    <div className="relative">
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              height: Math.min(pullDistance, 60)
            }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 flex items-center justify-center bg-white border-b border-gray-200 z-40"
          >
            {isRefreshing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-2xl"
              >
                ⏳
              </motion.div>
            ) : (
              <motion.div
                animate={{ 
                  rotate: pullDistance > 100 ? 180 : 0,
                  scale: pullDistance / 100
                }}
                className="text-2xl"
              >
                ↓
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {children}
    </div>
  );
}

// ============================================================================
// MOBILE SEARCH (Expandable Full Screen)
// ============================================================================

interface MobileSearchProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export function MobileSearch({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = "Search ideas...",
  suggestions = [],
  onSuggestionClick
}: MobileSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  
  const handleClose = () => {
    setIsFocused(false);
    inputRef.current?.blur();
    onBlur?.();
  };
  
  return (
    <>
      {/* Normal State */}
      {!isFocused && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-base"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      )}
      
      {/* Focused State (Full Screen Overlay) */}
      <AnimatePresence>
        {isFocused && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-50"
            >
              {/* Search Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                <div className="text-gray-400 text-xl">🔍</div>
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 text-lg outline-none"
                  autoFocus
                />
                <button
                  onClick={handleClose}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>
              
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-4">
                  <div className="text-sm text-gray-500 mb-3 font-semibold">
                    Popular searches:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          onChange(suggestion);
                          onSuggestionClick?.(suggestion);
                          handleClose();
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-green-100 text-gray-700 rounded-lg text-sm font-medium transition-colors min-h-[44px]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// MOBILE NAVIGATION TABS (Horizontal Scroll with Snap)
// ============================================================================

interface MobileTabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function MobileTabs({ tabs, activeTab, onChange }: MobileTabsProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
      <div className="flex gap-4 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              pb-4 font-semibold whitespace-nowrap snap-start min-h-[44px] px-4
              transition-colors border-b-2
              ${activeTab === tab.id 
                ? 'text-green-600 border-green-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY: Detect Mobile Device
// ============================================================================

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

