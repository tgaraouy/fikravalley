'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: string;
  rating: number;
  title?: string;
  review_text?: string;
  review_type: 'feasibility' | 'impact' | 'market' | 'technical' | 'general';
  created_at: string;
  reviewer_name?: string;
}

interface ReviewsSectionProps {
  ideaId: string;
}

const reviewTypeLabels = {
  feasibility: 'Feasibility',
  impact: 'Impact',
  market: 'Market Potential',
  technical: 'Technical',
  general: 'General',
};

export function ReviewsSection({ ideaId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    review_text: '',
    review_type: 'general' as Review['review_type'],
    reviewer_name: '',
  });

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/ideas/${ideaId}/reviews`);
        const data = await response.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching reviews:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [ideaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rating) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success && data.review) {
        setReviews([data.review, ...reviews]);
        // Update stats
        const newTotal = stats.total + 1;
        const newSum = stats.average * stats.total + formData.rating;
        const newAverage = newSum / newTotal;
        setStats({
          total: newTotal,
          average: newAverage,
          distribution: {
            ...stats.distribution,
            [formData.rating]: stats.distribution[formData.rating as keyof typeof stats.distribution] + 1,
          },
        });
        setFormData({
          rating: 5,
          title: '',
          review_text: '',
          review_type: 'general',
          reviewer_name: '',
        });
        setShowForm(false);
      } else {
        alert(data.error || 'Failed to add review');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting review:', error);
      }
      alert('Failed to add review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            disabled={!interactive}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          >
            {star <= rating ? (
              <StarIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarOutlineIcon className="w-5 h-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Reviews ({stats.total})
          </h3>
          {stats.total > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(Math.round(stats.average))}
              <span className="text-lg font-semibold text-gray-900">
                {stats.average.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({stats.total} {stats.total === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
        >
          {showForm ? 'Cancel' : 'Write Review'}
        </button>
      </div>

      {/* Rating Distribution */}
      {stats.total > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Rating Distribution</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating as keyof typeof stats.distribution];
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-yellow-400"
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                {renderStars(formData.rating, true, (rating) => 
                  setFormData({ ...formData, rating })
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Type
                </label>
                <select
                  value={formData.review_type}
                  onChange={(e) => setFormData({ ...formData, review_type: e.target.value as Review['review_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {Object.entries(reviewTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Title (optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Brief summary of your review"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Review (optional)
                </label>
                <textarea
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Share your detailed thoughts..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.review_text.length}/2000 characters
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">
                      {review.reviewer_name || 'Anonymous'}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {reviewTypeLabels[review.review_type]}
                    </span>
                  </div>
                  {renderStars(review.rating)}
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mt-2">{review.title}</h4>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(review.created_at)}
                </span>
              </div>
              {review.review_text && (
                <p className="text-gray-700 whitespace-pre-wrap mt-2">{review.review_text}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

