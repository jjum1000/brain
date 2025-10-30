import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Image source URL */
  src: string;
  /** Fallback image when main image fails to load */
  fallback?: string;
  /** Show loading skeleton while image loads */
  showSkeleton?: boolean;
  /** Image aspect ratio class (e.g., "aspect-square", "aspect-video") */
  aspectRatio?: string;
  /** Container className for custom styling */
  containerClassName?: string;
  /** Maximum attempts to load image before showing fallback */
  maxRetries?: number;
}

/**
 * OptimizedImage Component
 *
 * Provides lazy loading, error handling, and loading states for images.
 * Features:
 * - Lazy loading with native loading="lazy"
 * - Fallback image on load failure
 * - Loading skeleton animation
 * - Error state handling
 * - Performance optimized
 */
export function OptimizedImage({
  src,
  fallback = '/default-avatar.svg',
  alt = 'Image',
  showSkeleton = true,
  aspectRatio = 'aspect-square',
  containerClassName = 'w-full h-full',
  className = 'w-full h-full object-cover',
  maxRetries = 1,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    // Use fallback image if main image fails
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
  };

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${containerClassName}`}>
      {/* Loading skeleton - shown while image is loading */}
      {isLoading && showSkeleton && (
        <Skeleton className="absolute inset-0 bg-slate-700 animate-pulse" />
      )}

      {/* Main image */}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onLoadStart={handleLoadStart}
        onLoad={handleLoadEnd}
        onError={handleError}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
        {...props}
      />

      {/* Error state - show fallback placeholder */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
          <div className="text-center">
            <div className="text-slate-400 text-xs">Image not available</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Avatar Image Component
 * Optimized for user/trader avatars with circular styling
 */
export function AvatarImage(props: Omit<OptimizedImageProps, 'aspectRatio' | 'containerClassName'>) {
  return (
    <OptimizedImage
      {...props}
      fallback="/default-avatar.svg"
      aspectRatio="aspect-square"
      containerClassName="w-full h-full rounded-full overflow-hidden"
      className="w-full h-full object-cover rounded-full"
    />
  );
}

/**
 * Card Image Component
 * Optimized for strategy/trader card images with rounded corners
 */
export function CardImage(props: Omit<OptimizedImageProps, 'aspectRatio' | 'containerClassName'>) {
  return (
    <OptimizedImage
      {...props}
      fallback="/default-strategy.svg"
      aspectRatio="aspect-video"
      containerClassName="w-full rounded-lg overflow-hidden"
      className="w-full h-full object-cover rounded-lg"
    />
  );
}
