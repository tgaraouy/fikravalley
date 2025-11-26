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

const FLAG_LOGO = '/png/FikraValley_flag_logo.png';

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
      return FLAG_LOGO;
    }

    switch (variant) {
      case 'white':
      case 'icon':
      case 'full':
      default:
        return FLAG_LOGO;
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

