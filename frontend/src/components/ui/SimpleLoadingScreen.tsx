// src/components/ui/SimpleLoadingScreen.tsx - 진짜 모든 이미지 로딩 완료까지 대기
import { useState, useEffect } from 'react';
import { useScale } from '../../hooks/useScale';
import { simpleImagePreloader, imagePaths } from '../../utils/simpleImagePreloader';

interface SimpleLoadingScreenProps {
  onLoadComplete: () => void;
  minLoadTime?: number;
}

const SimpleLoadingScreen = ({ 
  onLoadComplete, 
  minLoadTime = 1500
}: SimpleLoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const scale = useScale();

  useEffect(() => {
    const startTime = Date.now();

    const checkLoading = () => {
      const loadedCount = simpleImagePreloader.getLoadedCount();
      const totalCount = simpleImagePreloader.getTotalCount();
      const loadProgress = simpleImagePreloader.getLoadProgress();
      const elapsed = Date.now() - startTime;
      
      setProgress(loadProgress);
      
      // 모든 이미지가 로딩되고 최소 시간이 지났으면 완료
      if (loadedCount === totalCount && elapsed >= minLoadTime) {
        clearInterval(checkInterval);
        clearTimeout(maxTimeout);
        
        console.log('[LoadingScreen] 모든 이미지 로딩 완료, 홈화면 이동');
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(onLoadComplete, 300);
        }, 500);
      }
    };

    const checkInterval = setInterval(checkLoading, 100);

    // 최대 대기 시간 (20초)
    const maxTimeout = setTimeout(() => {
      console.warn('[LoadingScreen] 최대 대기 시간 초과, 강제 완료');
      clearInterval(checkInterval);
      setProgress(100);
      setIsComplete(true);
      onLoadComplete();
    }, 20000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(maxTimeout);
    };
  }, [onLoadComplete, minLoadTime]);

  if (isComplete) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#FFF9C4] to-[#F0E68C] flex flex-col items-center justify-center z-[9999]">
      <div className="relative mb-8">
        <img
          src="/assets/images/star_character.png"
          alt="로딩 캐릭터"
          className="animate-bounce"
          style={{
            width: `calc(200px * ${scale})`,
            height: 'auto',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
          }}
          loading="eager"
          decoding="sync"
        />
      </div>
      
      <div 
        className="relative bg-white/30 backdrop-blur-sm rounded-full overflow-hidden border-2 border-white/50 shadow-lg"
        style={{
          width: `calc(320px * ${scale})`,
          height: `calc(20px * ${scale})`
        }}
      >
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div 
        className="mt-6 text-center font-bold text-gray-700"
        style={{ fontSize: `calc(18px * ${scale})` }}
      >
        게임을 준비하고 있어요... ({progress}%)
      </div>
      
      <div 
        className="mt-2 text-center text-gray-600"
        style={{ fontSize: `calc(14px * ${scale})` }}
      >
        {simpleImagePreloader.getLoadedCount()}/{simpleImagePreloader.getTotalCount()} 이미지 로딩됨
      </div>
    </div>
  );
};

export default SimpleLoadingScreen;