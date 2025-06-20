// src/components/ui/ReliableImage.tsx - simpleImagePreloader 변경에 맞춘 수정본
import { useState, useEffect, useRef } from 'react';
import { simpleImagePreloader } from '../../utils/simpleImagePreloader';

interface ReliableImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  priority?: 'high' | 'normal' | 'low';
}

// 중요한 이미지들 (빠른 로딩 필요)
const HIGH_PRIORITY_IMAGES = [
  '/assets/images/background.png',
  '/assets/images/star_character.png',
  '/assets/images/title.png',
  '/assets/images/start_button.png',
  '/assets/images/home_button.png',
  '/assets/images/back_button.png',
  '/assets/images/next_button.png',
  '/assets/images/confirm_button.png'
];

const ReliableImage = ({ 
  src, 
  alt, 
  className = '', 
  style, 
  onClick,
  onLoad,
  onError,
  priority = 'normal'
}: ReliableImageProps) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  
  const isHighPriority = HIGH_PRIORITY_IMAGES.includes(src) || priority === 'high';

  useEffect(() => {
    let isCancelled = false;

    const loadImage = async () => {
      try {
        // 이미 로딩된 이미지는 즉시 표시
        if (simpleImagePreloader.isLoaded(src)) {
          if (!isCancelled) {
            setImageSrc(src);
            setLoadState('loaded');
            onLoad?.();
          }
          return;
        }

        // 이미지 로딩 시도
        await simpleImagePreloader.loadImage(src);
        
        if (!isCancelled) {
          setImageSrc(src);
          setLoadState('loaded');
          onLoad?.();
        }
      } catch (error) {
        if (!isCancelled) {
          console.warn(`이미지 로딩 실패: ${src}`, error);
          setLoadState('error');
          onError?.(error as Error);
        }
      }
    };

    loadImage();

    return () => {
      isCancelled = true;
    };
  }, [src, onLoad, onError]);

  // 로딩 중 스켈레톤
  if (loadState === 'loading') {
    return (
      <div 
        className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer flex items-center justify-center ${className}`}
        style={style}
        onClick={onClick}
        aria-label={`${alt} 로딩 중`}
      >
        <div className="w-6 h-6 rounded-full bg-gray-400 animate-pulse" />
      </div>
    );
  }

  // 에러 상태
  if (loadState === 'error') {
    return (
      <div 
        className={`bg-red-50 border border-red-200 flex items-center justify-center text-red-500 ${className}`}
        style={style}
        onClick={onClick}
        aria-label={`${alt} 로딩 실패`}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  // 정상 이미지
  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 opacity-100 ${className}`}
      style={style}
      draggable={false}
      onClick={onClick}
      loading={isHighPriority ? 'eager' : 'lazy'}
      decoding={isHighPriority ? 'sync' : 'async'}
    />
  );
};

export default ReliableImage;