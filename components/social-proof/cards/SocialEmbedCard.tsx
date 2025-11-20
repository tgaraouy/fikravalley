/**
 * Social Media Embed Card
 * LinkedIn/Twitter-style post display
 */

import { Story } from '../SocialProofWall';

interface SocialEmbedCardProps {
  story: Story;
}

export default function SocialEmbedCard({ story }: SocialEmbedCardProps) {
  const platformConfig = {
    linkedin: {
      color: 'bg-blue-600',
      icon: '💼',
      name: 'LinkedIn'
    },
    twitter: {
      color: 'bg-sky-500',
      icon: '𝕏',
      name: 'Twitter'
    },
    instagram: {
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      icon: '📷',
      name: 'Instagram'
    }
  };

  const config = platformConfig[story.data.platform as keyof typeof platformConfig] || platformConfig.linkedin;

  return (
    <div className="bg-white border border-gray-200">
      
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${config.color} rounded flex items-center justify-center text-white text-sm`}>
            {config.icon}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900">{config.name}</div>
            <div className="text-xs text-gray-500">Featured post</div>
          </div>
        </div>
        <div className="text-xs text-gray-400">{story.data.date}</div>
      </div>
      
      {/* Post content */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3 mb-4">
          <img
            src={story.user.photo}
            alt={story.user.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm sm:text-base">{story.user.name}</div>
            <div className="text-xs text-gray-500">{story.user.location}</div>
            <div className="text-xs text-gray-400">{story.user.idea}</div>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4">
          {story.data.postText}
        </p>
        
        {/* Engagement */}
        <div className="flex items-center gap-4 sm:gap-6 pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span>❤️</span>
            <span className="font-medium">{story.data.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💬</span>
            <span className="font-medium">{story.data.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔄</span>
            <span className="font-medium">Partager</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}

