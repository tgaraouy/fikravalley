'use client';

import { useState, useEffect } from 'react';
import { ChatBubbleLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  content: string;
  comment_type: 'suggestion' | 'question' | 'concern' | 'support' | 'technical';
  created_at: string;
  author_name?: string;
  author_email?: string;
}

interface CommentsSectionProps {
  ideaId: string;
}

const commentTypeLabels = {
  suggestion: '💡 Suggestion',
  question: '❓ Question',
  concern: '⚠️ Concern',
  support: '👍 Support',
  technical: '🔧 Technical',
};

export function CommentsSection({ ideaId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    comment_type: 'support' as Comment['comment_type'],
    author_name: '',
    author_email: '',
  });

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/ideas/${ideaId}/comments`);
        const data = await response.json();
        if (data.comments) {
          setComments(data.comments);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching comments:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [ideaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success && data.comment) {
        setComments([data.comment, ...comments]);
        setFormData({
          content: '',
          comment_type: 'support',
          author_name: '',
          author_email: '',
        });
        setShowForm(false);
      } else {
        alert(data.error || 'Failed to add comment');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting comment:', error);
      }
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftIcon className="w-6 h-6 text-gray-600" />
          <h3 className="text-xl font-bold text-gray-900">
            Comments ({comments.length})
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
        >
          {showForm ? 'Cancel' : 'Add Comment'}
        </button>
      </div>

      {/* Comment Form */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name (optional)
                </label>
                <input
                  type="text"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment Type
                </label>
                <select
                  value={formData.comment_type}
                  onChange={(e) => setFormData({ ...formData, comment_type: e.target.value as Comment['comment_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {Object.entries(commentTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Comment *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={4}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Share your thoughts, questions, or suggestions..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.content.length}/2000 characters
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !formData.content.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Comment'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {comment.author_name || 'Anonymous'}
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {commentTypeLabels[comment.comment_type]}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

