import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'white' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  href?: string;
}

const sizeMap = {
  sm: { width: 40, height: 40 },
  md: { width: 120, height: 40 },
  lg: { width: 240, height: 80 },
};

export default function Logo({
  variant = 'full',
  size = 'md',
  showText = true,
  className = '',
  href = '/',
}: LogoProps) {
  const dimensions = sizeMap[size];

  // Determine which logo file to use
  // If showText is true, use the combined logo with wordmark
  // If showText is false, use just the icon
  const logoSrc = (() => {
    if (!showText) {
      // Icon only
      return '/fikra_logo_v3.png';
    }
    
    // Full logo with wordmark
    switch (variant) {
      case 'white':
        return '/logo-white.svg'; // Fallback if needed
      case 'icon':
        return '/fikra_logo_v3.png';
      default:
        return '/fikravalley_words_logo.png'; // Combined icon + wordmark
    }
  })();

  const logoContent = (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex-shrink-0" style={{ width: dimensions.width, height: dimensions.height, minWidth: dimensions.width }}>
        <Image
          src={logoSrc}
          alt="Fikra Valley Logo"
          fill
          sizes={`${dimensions.width}px`}
          className="object-contain"
          priority
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

