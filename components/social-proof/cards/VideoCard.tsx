/**
 * Video Testimonial Card
 * Video with thumbnail, play button, and user info
 */

import { Story } from '../SocialProofWall';

interface VideoCardProps {
  story: Story;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export default function VideoCard({ story, isPlaying, setIsPlaying }: VideoCardProps) {
  return (
    <div>
      {/* Video or thumbnail */}
      <div className="relative aspect-video bg-gray-900">
        {isPlaying ? (
          <video
            src={story.data.videoUrl}
            controls
            autoPlay
            className="w-full h-full"
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <>
            <img
              src={story.data.thumbnail || story.user.photo}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
            
            {/* Play button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(true);
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-all group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center text-orange-500 text-2xl sm:text-3xl group-hover:scale-110 transition-transform shadow-xl">
                ▶️
              </div>
            </button>
            
            {/* Duration badge */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-2 sm:px-3 py-1 bg-black/80 text-white rounded-lg text-xs sm:text-sm font-bold">
              {story.data.duration}
            </div>
          </>
        )}
      </div>
      
      {/* User info */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <img
            src={story.user.photo}
            alt={story.user.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate text-sm sm:text-base">{story.user.name}</div>
            <div className="text-xs sm:text-sm text-gray-600 truncate">{story.user.idea}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

