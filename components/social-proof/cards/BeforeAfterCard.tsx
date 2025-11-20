/**
 * Before/After Transformation Card
 * Split design showing progress from stuck → success
 */

import { Story } from '../SocialProofWall';

interface BeforeAfterCardProps {
  story: Story;
}

export default function BeforeAfterCard({ story }: BeforeAfterCardProps) {
  return (
    <div>
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        
        {/* Before */}
        <div className="p-4 sm:p-6 bg-red-50">
          <div className="text-center mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-bold text-red-600 mb-2">AVANT</div>
            <div className="text-3xl sm:text-4xl mb-2">😓</div>
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Score:</span>
              <span className="font-bold text-red-600">{story.data.before.score}/50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reçus:</span>
              <span className="font-bold">{story.data.before.receipts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-bold text-red-600 text-xs">{story.data.before.status}</span>
            </div>
          </div>
        </div>
        
        {/* After */}
        <div className="p-4 sm:p-6 bg-green-50">
          <div className="text-center mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-bold text-green-600 mb-2">APRÈS</div>
            <div className="text-3xl sm:text-4xl mb-2">🎉</div>
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Score:</span>
              <span className="font-bold text-green-600">{story.data.after.score}/50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reçus:</span>
              <span className="font-bold">{story.data.after.receipts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-bold text-green-600 text-xs">{story.data.after.status}</span>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Footer */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center">
        <div className="font-bold mb-1 text-sm sm:text-base">{story.user.name}</div>
        <div className="text-xs sm:text-sm opacity-90 mb-2">{story.user.idea}</div>
        <div className="text-xs opacity-75">
          ⚡ Transformation en {story.data.timeframe}
        </div>
        {story.data.after.funding && (
          <div className="text-xs sm:text-sm font-bold mt-2">
            💰 {story.data.after.funding} financé!
          </div>
        )}
      </div>
    </div>
  );
}

