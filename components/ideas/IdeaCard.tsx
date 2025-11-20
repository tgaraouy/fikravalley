'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
  sdg_alignment?: number[];
  funding_status?: string;
  qualification_tier?: 'exceptional' | 'qualified' | 'developing';
  created_at: string;
  submitter_name?: string;
  has_receipts?: boolean;
}

interface IdeaCardProps {
  idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(idea.upvote_count || 0);
  
  // Calculate scores
  const clarityDecisionScore = (idea.stage1_total || 0) + (idea.stage2_total || 0); // Out of 40
  const intimacyScore = Math.round(((idea.total_score || 0) - clarityDecisionScore) * 10 / 10); // Approximate intimacy out of 10
  const receipts = idea.receipt_count || 0;
  
  // Determine status
  const getStatus = (): 'exceptional' | 'qualified' | 'funded' | 'launched' | 'promising' => {
    if (idea.funding_status === 'funded') return 'funded';
    if (idea.funding_status === 'launched') return 'launched';
    if (idea.qualification_tier === 'exceptional') return 'exceptional';
    if (idea.qualification_tier === 'qualified') return 'qualified';
    return 'promising';
  };
  
  const status = getStatus();
  
  // Get sector icon
  const getSectorIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'agriculture': '🌾',
      'education': '🎓',
      'health': '🏥',
      'healthcare': '🏥',
      'technology': '💻',
      'fintech': '💳',
      'finance': '💰',
      'e-commerce': '🛒',
      'tourism': '✈️',
      'environment': '🌍',
      'social': '🤝',
      'manufacturing': '🏭',
      'services': '🔧',
      'energy': '⚡',
      'transport': '🚗',
      'food': '🍽️',
      'fashion': '👗',
      'art': '🎨',
      'sports': '⚽',
      'media': '📺',
      'other': '💡'
    };
    return icons[category.toLowerCase()] || '💡';
  };
  
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    // TODO: Call API to update likes
    // try {
    //   await fetch(`/api/ideas/${idea.id}/upvote`, { method: 'POST' });
    // } catch (error) {
    //   console.error('Failed to update like:', error);
    //   // Revert on error
    //   setIsLiked(isLiked);
    //   setLikes(idea.upvote_count || 0);
    // }
  };
  
  const handleCardClick = () => {
    router.push(`/ideas/${idea.id}`);
  };
  
  const displayTitle = idea.title_darija || idea.title;
  const displayDescription = idea.proposed_solution || idea.problem_statement;
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
    >
      
      {/* Header */}
      <div className="relative p-6 pb-4">
        
        {/* Score Badge */}
        <div className="absolute top-4 left-4">
          <ScoreBadge score={clarityDecisionScore} />
        </div>
        
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <motion.div
            animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="text-xl"
          >
            {isLiked ? '❤️' : '🤍'}
          </motion.div>
          <span className="text-sm font-semibold text-gray-700">
            {likes}
          </span>
        </button>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 mt-8 line-clamp-2">
          {displayTitle}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {displayDescription}
        </p>
        
        {/* Status Badge */}
        <StatusBadge status={status} />
        
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gray-200" />
      
      {/* Footer */}
      <div className="p-4 bg-gray-50">
        
        {/* Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <LocationTag location={idea.location} />
          <SectorTag sector={idea.category} icon={getSectorIcon(idea.category)} />
        </div>
        
        {/* Stats + CTA */}
        <div className="flex items-center justify-between text-sm">
          
          {/* Stats */}
          <div className="flex items-center gap-4">
            {/* Receipts */}
            <div className="flex items-center gap-1 text-gray-600">
              <span>💰</span>
              <span className="font-semibold">{receipts}</span>
              <span className="text-xs">reçus</span>
            </div>
            
            {/* Intimacy */}
            <div className="flex items-center gap-1 text-gray-600">
              <span>🧠</span>
              <span className="font-semibold">{intimacyScore}/10</span>
            </div>
          </div>
          
          {/* CTA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/ideas/${idea.id}`);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
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
    if (score >= 32) return 'from-purple-500 to-pink-500'; // Exceptional
    if (score >= 25) return 'from-blue-500 to-indigo-500'; // Qualified
    return 'from-yellow-500 to-orange-500'; // Promising
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
      inline-flex items-center gap-1 px-3 py-1 
      rounded-lg border-2 text-sm font-bold
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

// Loading Skeleton Component
export function IdeaCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse overflow-hidden">
      {/* Score badge skeleton */}
      <div className="h-7 w-20 bg-gray-200 rounded-full mb-4" />
      
      {/* Title skeleton */}
      <div className="h-6 bg-gray-200 rounded mb-2" />
      <div className="h-6 bg-gray-200 rounded mb-4 w-3/4" />
      
      {/* Description skeleton */}
      <div className="h-4 bg-gray-200 rounded mb-2" />
      <div className="h-4 bg-gray-200 rounded mb-2" />
      <div className="h-4 bg-gray-200 rounded mb-4 w-2/3" />
      
      {/* Status badge skeleton */}
      <div className="h-7 w-24 bg-gray-200 rounded-lg mb-4" />
      
      {/* Divider */}
      <div className="h-px bg-gray-200 mb-4" />
      
      {/* Footer skeleton */}
      <div className="bg-gray-50 -mx-6 -mb-6 p-4">
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-20 bg-gray-200 rounded" />
          <div className="h-6 w-24 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="flex gap-4">
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-8 w-28 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
