'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { IdeaCard, IdeaCardSkeleton } from './IdeaCard';

type SortOption = 'score' | 'recent' | 'receipts' | 'likes' | 'alpha';
type ViewMode = 'grid' | 'list';

interface Idea {
  id: string;
  title: string;
  title_darija?: string;
  problem_statement: string;
  proposed_solution?: string;
  location: string;
  category: string;
  total_score?: number;
  stage1_total?: number;
  stage2_total?: number;
  receipt_count?: number;
  upvote_count?: number;
  funding_status?: string;
  qualification_tier?: 'exceptional' | 'qualified' | 'developing';
  created_at: string;
  has_receipts?: boolean;
}

interface IdeasGridProps {
  ideas: Idea[];
  isLoading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  activeFilters?: number;
  onClearFilters?: () => void;
}

export default function IdeasGrid({
  ideas,
  isLoading,
  hasMore = false,
  onLoadMore,
  activeFilters = 0,
  onClearFilters
}: IdeasGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortedIdeas, setSortedIdeas] = useState(ideas);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Sort ideas when sort option or ideas change
  useEffect(() => {
    const sorted = [...ideas].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          const scoreA = (a.stage1_total || 0) + (a.stage2_total || 0);
          const scoreB = (b.stage1_total || 0) + (b.stage2_total || 0);
          return scoreB - scoreA;
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'receipts':
          return (b.receipt_count || 0) - (a.receipt_count || 0);
        case 'likes':
          return (b.upvote_count || 0) - (a.upvote_count || 0);
        case 'alpha':
          const titleA = a.title_darija || a.title;
          const titleB = b.title_darija || b.title;
          return titleA.localeCompare(titleB);
        default:
          return 0;
      }
    });
    setSortedIdeas(sorted);
  }, [ideas, sortBy]);
  
  const handleLoadMore = async () => {
    if (onLoadMore && !isLoadingMore) {
      setIsLoadingMore(true);
      await onLoadMore();
      setIsLoadingMore(false);
    }
  };
  
  if (isLoading && ideas.length === 0) {
    return <LoadingGrid />;
  }
  
  if (!isLoading && ideas.length === 0) {
    return (
      <EmptyState 
        hasFilters={activeFilters > 0}
        onClearFilters={onClearFilters}
      />
    );
  }
  
  return (
    <div className="flex-1">
      
      {/* Results Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 px-4 md:px-0">
        
        {/* Count */}
        <div className="text-xl font-bold text-gray-900">
          <span className="text-green-600">{ideas.length}</span> ideas found
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-gray-900 focus:border-green-500 focus:outline-none bg-white"
            >
              <option value="score">Highest Score</option>
              <option value="recent">Most Recent</option>
              <option value="receipts">Most Validated</option>
              <option value="likes">Most Liked</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
          
          {/* View Toggle (Desktop) */}
          <div className="hidden md:flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded transition-all font-medium ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded transition-all font-medium ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>
          
        </div>
        
      </div>
      
      {/* Ideas Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1920px] mx-auto'
          : 'flex flex-col gap-4 max-w-[1920px] mx-auto'
      }>
        <AnimatePresence mode="popLayout">
          {sortedIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              {viewMode === 'grid' ? (
                <IdeaCard idea={idea} />
              ) : (
                <IdeaCardList idea={idea} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Load More / End */}
      {onLoadMore && (
        <div className="mt-12 text-center">
          {hasMore ? (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <span className="flex items-center gap-2 justify-center">
                  <Spinner />
                  Loading...
                </span>
              ) : (
                'Load More Ideas'
              )}
            </button>
          ) : (
            <div className="text-gray-500 font-medium">
              ✅ All ideas displayed
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}

// Loading Grid Component
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1920px] mx-auto">
      {[...Array(9)].map((_, i) => (
        <IdeaCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Empty State Component
function EmptyState({ 
  hasFilters, 
  onClearFilters 
}: { 
  hasFilters: boolean; 
  onClearFilters?: () => void;
}) {
  const popularSearches = ['santé', 'education', 'agriculture', 'fintech', 'صحة', 'darija'];
  
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🔍</div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        No ideas found
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Try adjusting your filters or search terms.
        {hasFilters && " You have active filters that may be too restrictive."}
      </p>
      
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
        >
          Clear All Filters
        </button>
      )}
      
      <div className="mt-8">
        <p className="text-sm text-gray-500 mb-4">Popular searches:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {popularSearches.map(term => (
            <button
              key={term}
              onClick={() => window.location.href = `/ideas?q=${encodeURIComponent(term)}`}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors font-medium"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// List View Card (Alternative Layout)
function IdeaCardList({ idea }: { idea: Idea }) {
  const router = useRouter();
  
  // Calculate scores
  const clarityDecisionScore = (idea.stage1_total || 0) + (idea.stage2_total || 0);
  const intimacyScore = Math.round(((idea.total_score || 0) - clarityDecisionScore) * 10 / 10);
  const receipts = idea.receipt_count || 0;
  const likes = idea.upvote_count || 0;
  
  // Determine status
  const getStatus = (): 'exceptional' | 'qualified' | 'funded' | 'launched' | 'promising' => {
    if (idea.funding_status === 'funded') return 'funded';
    if (idea.funding_status === 'launched') return 'launched';
    if (idea.qualification_tier === 'exceptional') return 'exceptional';
    if (idea.qualification_tier === 'qualified') return 'qualified';
    return 'promising';
  };
  
  const status = getStatus();
  const displayTitle = idea.title_darija || idea.title;
  const displayDescription = idea.proposed_solution || idea.problem_statement;
  
  // Get sector icon
  const getSectorIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'agriculture': '🌾', 'education': '🎓', 'health': '🏥', 'healthcare': '🏥',
      'technology': '💻', 'fintech': '💳', 'finance': '💰', 'e-commerce': '🛒',
      'tourism': '✈️', 'environment': '🌍', 'social': '🤝', 'manufacturing': '🏭',
      'services': '🔧', 'energy': '⚡', 'transport': '🚗', 'food': '🍽️',
      'fashion': '👗', 'art': '🎨', 'sports': '⚽', 'media': '📺', 'other': '💡'
    };
    return icons[category.toLowerCase()] || '💡';
  };
  
  return (
    <motion.div
      onClick={() => router.push(`/ideas/${idea.id}`)}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer p-6"
    >
      <div className="flex items-start gap-6">
        
        {/* Left: Score Badge */}
        <div className="flex-shrink-0">
          <ScoreBadge score={clarityDecisionScore} />
        </div>
        
        {/* Middle: Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {displayTitle}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={status} />
            <LocationTag location={idea.location} />
            <SectorTag sector={idea.category} icon={getSectorIcon(idea.category)} />
          </div>
        </div>
        
        {/* Right: Stats + CTA */}
        <div className="flex-shrink-0 flex flex-col items-end gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span className="font-semibold">{receipts}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🧠</span>
              <span className="font-semibold">{intimacyScore}/10</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🤍</span>
              <span className="font-semibold">{likes}</span>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/ideas/${idea.id}`);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
          >
            View Details
          </button>
        </div>
        
      </div>
    </motion.div>
  );
}

// Score Badge Component
function ScoreBadge({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 32) return 'from-purple-500 to-pink-500';
    if (score >= 25) return 'from-blue-500 to-indigo-500';
    return 'from-yellow-500 to-orange-500';
  };
  
  return (
    <div className={`
      inline-flex items-center gap-1 px-3 py-1.5 
      bg-gradient-to-r ${getScoreColor(score)} 
      text-white rounded-full font-bold text-sm shadow-lg
    `}>
      <span>{score}</span>
      <span className="opacity-75">/40</span>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const configs = {
    exceptional: {
      text: 'Exceptional',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '⭐'
    },
    qualified: {
      text: 'Qualified',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '✅'
    },
    funded: {
      text: 'Funded',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '💰'
    },
    launched: {
      text: 'Launched',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🚀'
    },
    promising: {
      text: 'Promising',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '💡'
    }
  };
  
  const config = configs[status as keyof typeof configs] || configs.promising;
  
  return (
    <div className={`
      inline-flex items-center gap-1 px-2 py-1 
      rounded text-xs font-bold
      ${config.color}
    `}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
}

// Location Tag Component
function LocationTag({ location }: { location: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
      <span>📍</span>
      <span>{location}</span>
    </div>
  );
}

// Sector Tag Component
function SectorTag({ sector, icon }: { sector: string; icon: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
      <span>{icon}</span>
      <span className="capitalize">{sector}</span>
    </div>
  );
}

// Spinner Component
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
        fill="none"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

