/**
 * Photo Testimonial Card
 * Large user photo with quote overlay and stats footer
 */

import { Story } from '../SocialProofWall';

interface PhotoCardProps {
  story: Story;
  isExpanded: boolean;
}

export default function PhotoCard({ story, isExpanded }: PhotoCardProps) {
  return (
    <div className="relative group">
      {/* Photo */}
      <div className="relative h-64 sm:h-80">
        <img
          src={story.user.photo}
          alt={story.user.name}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
          <div className="text-lg sm:text-2xl font-bold mb-2 leading-tight">
            "{story.data.quote}"
          </div>
          <div className="flex items-center gap-2 text-sm sm:text-base flex-wrap">
            <span className="font-semibold">{story.user.name}</span>
            <span className="opacity-75">• {story.user.location}</span>
          </div>
          <div className="text-xs sm:text-sm opacity-90 mt-1">
            {story.user.idea}
          </div>
        </div>
      </div>
      
      {/* Stats footer */}
      <div className="p-3 sm:p-4 bg-gray-50 grid grid-cols-3 gap-2 sm:gap-4 text-center">
        <div>
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {story.data.stats.receipts}
          </div>
          <div className="text-xs text-gray-600">Reçus</div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {story.data.stats.score}/50
          </div>
          <div className="text-xs text-gray-600">Score</div>
        </div>
        <div>
          <div className="text-base sm:text-xl font-bold text-orange-600">
            {story.data.stats.funding}
          </div>
          <div className="text-xs text-gray-600">Financé</div>
        </div>
      </div>
      
      {/* Hover overlay: "Voir l'histoire" */}
      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl sm:text-3xl mb-2">📖</div>
          <div className="font-bold text-sm sm:text-base px-4">Voir l'histoire complète</div>
        </div>
      </div>
    </div>
  );
}

