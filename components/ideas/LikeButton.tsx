'use client';

import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface LikeButtonProps {
  ideaId: string;
  initialCount?: number;
  initialIsLiked?: boolean;
  onLikeChange?: (count: number, isLiked: boolean) => void;
}

export function LikeButton({ 
  ideaId, 
  initialCount = 0, 
  initialIsLiked = false,
  onLikeChange 
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch initial state
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(`/api/ideas/${ideaId}/likes`);
        const data = await response.json();
        if (data.count !== undefined) {
          setCount(data.count);
        }
        if (data.isLiked !== undefined) {
          setIsLiked(data.isLiked);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching like status:', error);
        }
      }
    };

    fetchLikeStatus();
  }, [ideaId]);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const previousIsLiked = isLiked;
    const previousCount = count;

    // Optimistic update
    setIsLiked(!previousIsLiked);
    setCount(previousIsLiked ? count - 1 : count + 1);
    setIsAnimating(true);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setCount(data.count);
        setIsLiked(data.isLiked);
        onLikeChange?.(data.count, data.isLiked);
      } else {
        // Revert on error
        setIsLiked(previousIsLiked);
        setCount(previousCount);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling like:', error);
      }
      // Revert on error
      setIsLiked(previousIsLiked);
      setCount(previousCount);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-red-400 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <motion.div
        animate={{ scale: isAnimating ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        {isLiked ? (
          <HeartSolidIcon className="w-5 h-5 text-red-500" />
        ) : (
          <HeartIcon className="w-5 h-5 text-gray-600" />
        )}
      </motion.div>
      <span className={`font-semibold ${isLiked ? 'text-red-600' : 'text-gray-700'}`}>
        {count}
      </span>
      <span className="text-sm text-gray-600">
        {count === 1 ? 'like' : 'likes'}
      </span>
    </button>
  );
}

