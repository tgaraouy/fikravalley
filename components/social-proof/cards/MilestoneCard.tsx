/**
 * Milestone Achievement Card
 * Large stat focused, celebrating achievements
 */

import { Story } from '../SocialProofWall';

interface MilestoneCardProps {
  story: Story;
}

export default function MilestoneCard({ story }: MilestoneCardProps) {
  const colorConfig = {
    green: {
      gradient: 'from-green-400 to-green-600',
      bg: 'bg-green-50',
      text: 'text-green-900'
    },
    blue: {
      gradient: 'from-blue-400 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-900'
    },
    orange: {
      gradient: 'from-orange-400 to-orange-600',
      bg: 'bg-orange-50',
      text: 'text-orange-900'
    },
    purple: {
      gradient: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-50',
      text: 'text-purple-900'
    }
  };

  const config = colorConfig[story.data.color as keyof typeof colorConfig] || colorConfig.green;

  return (
    <div className="relative overflow-hidden">
      
      {/* Background icon (subtle) */}
      <div 
        className="absolute -right-4 -top-4 text-9xl opacity-5 transform rotate-12 select-none pointer-events-none"
        style={{ fontSize: '12rem' }}
      >
        {story.data.icon}
      </div>
      
      {/* Content */}
      <div className={`relative p-6 sm:p-8 bg-gradient-to-br ${config.gradient} text-white`}>
        
        {/* Large stat */}
        <div className="text-center mb-4">
          <div className="text-5xl sm:text-6xl md:text-7xl font-black mb-2 drop-shadow-lg">
            {story.data.number.toLocaleString('fr-FR')}
          </div>
          <div className="text-2xl sm:text-3xl font-bold opacity-90">
            {story.data.unit}
          </div>
        </div>
        
        {/* Achievement name */}
        <div className="text-center mb-3">
          <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
            {story.data.achievement}
          </div>
          <div className="text-xs sm:text-sm opacity-75">
            En {story.data.timeframe}
          </div>
        </div>
        
        {/* Description */}
        <div className={`${config.bg} ${config.text} text-xs sm:text-sm p-3 sm:p-4 rounded-lg text-center font-medium`}>
          {story.data.description}
        </div>
        
      </div>
      
      {/* User info footer */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={story.user.photo}
            alt={story.user.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{story.user.name}</div>
            <div className="text-xs text-gray-600 truncate">{story.user.idea}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

