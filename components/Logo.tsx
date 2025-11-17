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
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 80, height: 80 },
};

const textSizeMap = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

export default function Logo({
  variant = 'full',
  size = 'md',
  showText = true,
  className = '',
  href = '/',
}: LogoProps) {
  const dimensions = sizeMap[size];
  const textSize = textSizeMap[size];

  // Determine which logo file to use
  // Try SVG first, fallback to GIF
  const logoSrc = (() => {
    switch (variant) {
      case 'white':
        return '/logo-white.svg';
      case 'icon':
        return '/logo-icon.svg';
      default:
        return '/logo.svg';
    }
  })();

  // Use GIF as primary (SVG files can be added later)
  const logoSrcFinal = '/fikralabs-logo.gif';

  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0" style={{ width: dimensions.width, height: dimensions.height }}>
        <Image
          src={logoSrcFinal}
          alt="Fikra Valley Logo"
          fill
          className="object-contain"
          priority
          unoptimized={logoSrcFinal.endsWith('.gif')}
        />
      </div>
      {showText && (
        <span className={`font-bold text-indigo-600 ${textSize} whitespace-nowrap`}>
          Fikra Valley
        </span>
      )}
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

