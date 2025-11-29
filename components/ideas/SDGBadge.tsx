'use client';

import { getSDGInfo } from '@/lib/constants/sdg-info';

interface SDGBadgeProps {
  sdgNumber: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

export function SDGBadge({ sdgNumber, size = 'sm', showNumber = true, className = '' }: SDGBadgeProps) {
  const sdgInfo = getSDGInfo(sdgNumber);

  if (!sdgInfo) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${sdgInfo.color}20`,
        color: sdgInfo.color,
        border: `1px solid ${sdgInfo.color}40`,
      }}
      title={`ODD ${sdgNumber}: ${sdgInfo.nameFr}`}
    >
      <span>{sdgInfo.icon}</span>
      {showNumber && <span>ODD {sdgNumber}</span>}
    </span>
  );
}

interface SDGBadgesListProps {
  sdgNumbers: number[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  className?: string;
}

export function SDGBadgesList({ sdgNumbers, size = 'sm', maxDisplay = 3, className = '' }: SDGBadgesListProps) {
  if (!sdgNumbers || sdgNumbers.length === 0) {
    return null;
  }

  const displaySDGs = sdgNumbers.slice(0, maxDisplay);
  const remaining = sdgNumbers.length - maxDisplay;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {displaySDGs.map((sdg) => (
        <SDGBadge key={sdg} sdgNumber={sdg} size={size} />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-slate-500 font-medium">+{remaining}</span>
      )}
    </div>
  );
}

