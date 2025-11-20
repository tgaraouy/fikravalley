'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  HeartIcon, 
  ShareIcon, 
  CheckIcon 
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';

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
  submitter_name?: string;
  has_receipts?: boolean;
  target_audience?: string;
  moroccan_priorities?: string[];
}

export default function IdeaDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'validation' | 'scoring'>('overview');
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  useEffect(() => {
    // Fetch idea data
    const fetchIdea = async () => {
      try {
        const response = await fetch(`/api/ideas/${params.id}`);
        const data = await response.json();
        setIdea(data);
        setLikes(data.upvote_count || 0);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching idea:', error);
        setIsLoading(false);
      }
    };
    
    fetchIdea();
  }, [params.id]);
  
  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    // TODO: API call
    // try {
    //   await fetch(`/api/ideas/${params.id}/upvote`, { method: 'POST' });
    // } catch (error) {
    //   // Revert on error
    //   setIsLiked(isLiked);
    //   setLikes(idea?.upvote_count || 0);
    // }
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      // Native share on mobile
      try {
        await navigator.share({
          title: idea?.title || 'Fikra Valley Idea',
          text: idea?.problem_statement || '',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Show modal on desktop
      setShowShareModal(true);
    }
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💡</div>
          <div className="text-xl font-semibold text-gray-600">Loading idea...</div>
        </div>
      </div>
    );
  }
  
  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">Idea not found</div>
          <button 
            onClick={() => router.push('/ideas')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Back to Ideas
          </button>
        </div>
      </div>
    );
  }
  
  const clarityDecisionScore = (idea.stage1_total || 0) + (idea.stage2_total || 0);
  const intimacyScore = Math.round(((idea.total_score || 0) - clarityDecisionScore) * 10 / 10);
  const receipts = idea.receipt_count || 0;
  
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
  
  const getStatus = (): 'exceptional' | 'qualified' | 'funded' | 'launched' | 'promising' => {
    if (idea.funding_status === 'funded') return 'funded';
    if (idea.funding_status === 'launched') return 'launched';
    if (idea.qualification_tier === 'exceptional') return 'exceptional';
    if (idea.qualification_tier === 'qualified') return 'qualified';
    return 'promising';
  };
  
  const status = getStatus();
  const displayTitle = idea.title_darija || idea.title;
  
  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 mb-6">
            <button onClick={() => router.push('/ideas')} className="hover:text-green-600 transition-colors">
              Ideas
            </button>
            <span>/</span>
            <button onClick={() => router.push(`/ideas?sector=${idea.category}`)} className="hover:text-green-600 transition-colors">
              {idea.category}
            </button>
            <span>/</span>
            <span className="text-gray-900 truncate">{displayTitle}</span>
          </div>
          
          {/* Score Badge */}
          <div className="mb-4">
            <div className={`
              inline-flex items-center gap-2 px-6 py-3
              bg-gradient-to-r ${getScoreGradient(clarityDecisionScore)}
              text-white rounded-full font-bold text-2xl shadow-xl
            `}>
              <span>{clarityDecisionScore}</span>
              <span className="opacity-75 text-xl">/40</span>
            </div>
          </div>
          
          {/* Status + Engagement */}
          <div className="flex items-center gap-4 flex-wrap mb-6">
            <StatusBadge status={status} large />
            
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              {isLiked ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span>{likes} likes</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              <ShareIcon className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {displayTitle}
          </h1>
          
          {/* Description */}
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            {idea.problem_statement}
          </p>
          
          {/* Metadata */}
          <div className="flex items-center gap-6 flex-wrap text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                {(idea.submitter_name || 'A')[0].toUpperCase()}
              </div>
              <span className="font-medium">By {idea.submitter_name || 'Anonymous'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{idea.location}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span>{getSectorIcon(idea.category)}</span>
              <span className="capitalize">{idea.category}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span>Submitted {formatDate(idea.created_at)}</span>
            </div>
          </div>
          
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2">
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto">
              {['overview', 'validation', 'scoring'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`
                    pb-4 font-semibold whitespace-nowrap transition-colors
                    ${activeTab === tab 
                      ? 'text-green-600 border-b-2 border-green-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            {activeTab === 'overview' && <OverviewTab idea={idea} />}
            {activeTab === 'validation' && <ValidationTab receipts={receipts} />}
            {activeTab === 'scoring' && (
              <ScoringTab 
                clarity={idea.stage1_total || 0}
                decision={idea.stage2_total || 0}
                intimacy={intimacyScore}
              />
            )}
            
          </div>
          
          {/* Sidebar (1/3) */}
          <div className="lg:col-span-1">
            <Sidebar 
              receipts={receipts}
              intimacy={intimacyScore}
              likes={likes}
              createdAt={idea.created_at}
              ideaId={idea.id}
            />
          </div>
          
        </div>
        
      </div>
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          url={typeof window !== 'undefined' ? window.location.href : ''}
          title={displayTitle}
          onClose={() => setShowShareModal(false)}
          copySuccess={copySuccess}
          onCopy={copyLink}
        />
      )}
      
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ idea }: { idea: Idea }) {
  return (
    <div className="space-y-6">
      
      <Section title="The Problem">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {idea.problem_statement}
        </p>
      </Section>
      
      {idea.proposed_solution && (
        <Section title="The Solution">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {idea.proposed_solution}
          </p>
        </Section>
      )}
      
      {idea.target_audience && (
        <Section title="Who This Is For">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {idea.target_audience}
          </p>
        </Section>
      )}
      
      {idea.moroccan_priorities && idea.moroccan_priorities.length > 0 && (
        <Section title="Aligns With">
          <div className="flex flex-wrap gap-2">
            {idea.moroccan_priorities.map(priority => (
              <div
                key={priority}
                className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-sm"
              >
                {priority}
              </div>
            ))}
          </div>
        </Section>
      )}
      
    </div>
  );
}

// Validation Tab Component
function ValidationTab({ receipts }: { receipts: number }) {
  const percentage = Math.min((receipts / 50) * 100, 100);
  
  return (
    <div className="space-y-6">
      
      <Section title="Validation Proof">
        <p className="text-gray-600 mb-6">
          <span className="text-3xl font-bold text-green-600">{receipts}</span>
          {' '}people have validated this idea
        </p>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-green-500 h-4 rounded-full"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{receipts} receipts</span>
            <span>{receipts >= 50 ? '✅ Goal reached!' : `${50 - receipts} more to strong validation`}</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Total Receipts"
            value={receipts}
            icon="💰"
          />
          <StatCard
            label="Validation Strength"
            value={getValidationStrength(receipts)}
            icon="📊"
          />
          <StatCard
            label="Avg per Week"
            value={Math.round(receipts / 12)}
            icon="📈"
          />
          <StatCard
            label="Latest Receipt"
            value="2 days ago"
            icon="🕐"
          />
        </div>
        
      </Section>
      
    </div>
  );
}

// Scoring Tab Component
function ScoringTab({ clarity, decision, intimacy }: { clarity: number; decision: number; intimacy: number }) {
  return (
    <div className="space-y-6">
      
      <Section title="Detailed Scoring">
        <p className="text-gray-600 mb-6">
          Based on Locke's framework for TRUE KNOWING
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ScoreCard
            icon="📝"
            label="Clarity"
            score={clarity}
            max={10}
            color="blue"
            description="How clear is the problem/solution?"
          />
          <ScoreCard
            icon="🎯"
            label="Decision"
            score={decision}
            max={40}
            color="purple"
            description="How ready to execute?"
          />
          <ScoreCard
            icon="🧠"
            label="Intimacy"
            score={intimacy}
            max={10}
            color="orange"
            description="How deeply does creator know the problem?"
          />
        </div>
        
        {/* Locke Quote */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
          <p className="italic text-gray-700 mb-2">
            "It is one thing to show a man that he is in error, and another to put him in possession of truth."
          </p>
          <p className="text-sm text-gray-600">— John Locke</p>
        </div>
        
      </Section>
      
    </div>
  );
}

// Sidebar Component
function Sidebar({ receipts, intimacy, likes, createdAt, ideaId }: { 
  receipts: number; 
  intimacy: number; 
  likes: number; 
  createdAt: string;
  ideaId: string;
}) {
  const router = useRouter();
  
  return (
    <div className="sticky top-20 space-y-6">
      
      {/* Quick Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
        
        <div className="space-y-3">
          <StatRow icon="💰" label="Receipts" value={receipts} />
          <StatRow icon="🧠" label="Intimacy" value={`${intimacy}/10`} />
          <StatRow icon="👁️" label="Views" value="-" />
          <StatRow icon="❤️" label="Likes" value={likes} />
          <StatRow icon="📅" label="Submitted" value={formatDate(createdAt)} />
        </div>
        
        <div className="mt-6 space-y-3">
          <button className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors">
            Support This Idea
          </button>
          <button className="w-full py-3 border-2 border-gray-300 rounded-lg font-bold hover:border-green-500 hover:text-green-600 transition-colors">
            Connect with Creator
          </button>
        </div>
        
        <button className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700">
          Report Issue
        </button>
      </div>
      
      {/* Related Ideas */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Similar Ideas</h3>
        
        <div className="space-y-3">
          <div className="text-sm text-gray-500 text-center py-4">
            Related ideas coming soon
          </div>
        </div>
      </div>
      
    </div>
  );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function ScoreCard({ icon, label, score, max, color, description }: {
  icon: string;
  label: string;
  score: number;
  max: number;
  color: 'blue' | 'purple' | 'orange';
  description: string;
}) {
  const percentage = (score / max) * 100;
  const colorClasses = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-500' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-500' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-500' }
  };
  
  const colors = colorClasses[color];
  
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
      <div className="text-4xl mb-3">{icon}</div>
      <div className={`text-3xl font-bold ${colors.text} mb-2`}>
        {score}/{max}
      </div>
      <div className="font-bold text-gray-900 mb-2">{label}</div>
      <div className="text-sm text-gray-600 mb-4">{description}</div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-2 rounded-full ${colors.bg}`}
        />
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
      <div className="flex items-center gap-2 text-gray-600">
        <span>{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
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
      inline-flex items-center gap-1 ${large ? 'px-4 py-2 text-base' : 'px-3 py-1 text-sm'}
      rounded-lg border-2 font-bold
      ${config.color}
    `}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
}

// Share Modal Component
function ShareModal({ url, title, onClose, copySuccess, onCopy }: {
  url: string;
  title: string;
  onClose: () => void;
  copySuccess: boolean;
  onCopy: () => void;
}) {
  const shareOptions = [
    { name: 'LinkedIn', icon: '💼', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'Twitter', icon: '🐦', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
    { name: 'Facebook', icon: '📘', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'WhatsApp', icon: '💬', url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}` }
  ];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl p-6 max-w-md w-full z-10"
      >
        <h3 className="text-2xl font-bold mb-4">Share this idea</h3>
        
        {/* Copy Link */}
        <button
          onClick={onCopy}
          className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors mb-4"
        >
          <span className="font-semibold">Copy Link</span>
          {copySuccess ? (
            <CheckIcon className="w-5 h-5 text-green-600" />
          ) : (
            <span>🔗</span>
          )}
        </button>
        
        {copySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
          >
            ✅ Link copied to clipboard!
          </motion.div>
        )}
        
        {/* Share Options */}
        <div className="grid grid-cols-2 gap-3">
          {shareOptions.map(option => (
            <a
              key={option.name}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="font-semibold">{option.name}</span>
            </a>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}

// Helper Functions
function getScoreGradient(score: number) {
  if (score >= 32) return 'from-purple-500 to-pink-500';
  if (score >= 25) return 'from-blue-500 to-indigo-500';
  return 'from-yellow-500 to-orange-500';
}

function getValidationStrength(receipts: number) {
  if (receipts >= 200) return 'Market Proven';
  if (receipts >= 50) return 'Strong';
  if (receipts >= 10) return 'Initial';
  return 'Weak';
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const months = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  if (months === 0) return 'This month';
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}
