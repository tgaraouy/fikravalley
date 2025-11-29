'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LikeButton } from './LikeButton';
import { MOROCCO_PRIORITIES } from '@/lib/idea-bank/scoring/morocco-priorities';
import { SDGBadgesList } from './SDGBadge';

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
  sdg_alignment?: number[] | { sdgTags?: number[] } | null;
  funding_status?: string;
  qualification_tier?: 'exceptional' | 'qualified' | 'developing';
  created_at: string;
  submitter_name?: string;
  has_receipts?: boolean;
  moroccan_priorities?: string[];
  budget_tier?: string | null;
  location_type?: string | null;
  complexity?: string | null;
  adoption_count?: number | null;
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
    // LikeButton component handles this now
  };
  
  const handleCardClick = () => {
    router.push(`/ideas/${idea.id}`);
  };
  
  const displayTitle = idea.title_darija || idea.title;
  const displayDescription = idea.proposed_solution || idea.problem_statement;
  const priorities = (idea.moroccan_priorities || []) as string[];

  const formatBudgetTier = (tier?: string | null) => {
    if (!tier) return null;
    switch (tier) {
      case '<1K':
        return '<1K DH';
      case '1K-5K':
        return '1K–5K DH';
      case '5K-10K':
        return '5K–10K DH';
      case '10K+':
        return '10K+ DH';
      default:
        return tier;
    }
  };
  
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
        
        {/* Adoption Count Badge */}
        {typeof idea.adoption_count === 'number' && idea.adoption_count > 0 && (
          <div className="absolute top-4 right-4 flex flex-col items-end gap-1 z-20">
            <span className="px-2 py-1 rounded-full bg-pink-500 text-white text-[10px] font-semibold shadow">
              🔥 {idea.adoption_count}
            </span>
          </div>
        )}
        
        {/* Like Button */}
        <div 
          className="absolute top-10 right-4 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <LikeButton 
            ideaId={idea.id}
            initialCount={likes}
            initialIsLiked={isLiked}
            onLikeChange={(count, isLiked) => {
              setLikes(count);
              setIsLiked(isLiked);
            }}
          />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 mt-8 line-clamp-2">
          {displayTitle}
        </h3>

        {/* Moroccan Priority Badges */}
        {priorities.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
            {priorities.slice(0, 2).map((code) => {
              const priority = MOROCCO_PRIORITIES.find((p) => p.id === code);
              if (!priority) return null;
              return (
                <span
                  key={code}
                  className="px-2 py-0.5 rounded-full bg-green-50 text-green-800 text-[10px] font-semibold border border-green-100"
                  title={priority.description}
                >
                  {priority.name.split(' ')[0]}
                </span>
              );
            })}
            {priorities.length > 2 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                +{priorities.length - 2}
              </span>
            )}
          </div>
        )}

        {/* SDG Badges (Secondary - below Morocco priorities) */}
        {(() => {
          let sdgNumbers: number[] = [];
          if (idea.sdg_alignment) {
            if (Array.isArray(idea.sdg_alignment)) {
              sdgNumbers = idea.sdg_alignment;
            } else if (typeof idea.sdg_alignment === 'object' && idea.sdg_alignment.sdgTags) {
              sdgNumbers = idea.sdg_alignment.sdgTags;
            }
          }
          return sdgNumbers.length > 0 ? (
            <div className="mb-2">
              <SDGBadgesList sdgNumbers={sdgNumbers} size="sm" maxDisplay={3} />
            </div>
          ) : null;
        })()}
        
        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-3 leading-relaxed">
          {displayDescription}
        </p>

        {/* Budget / Complexity / Location Type */}
        <div className="flex gap-2 flex-wrap mb-3 text-[11px]">
          {formatBudgetTier(idea.budget_tier) && (
            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
              {formatBudgetTier(idea.budget_tier)}
            </span>
          )}
          {idea.complexity && (
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 capitalize">
              {idea.complexity}
            </span>
          )}
          {idea.location_type && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 capitalize">
              {idea.location_type}
            </span>
          )}
        </div>
        
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
