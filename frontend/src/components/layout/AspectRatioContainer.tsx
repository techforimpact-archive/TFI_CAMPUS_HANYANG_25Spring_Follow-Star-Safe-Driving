// src/components/layout/AspectRatioContainer.tsx
import { ReactNode, useEffect, useState } from 'react';

interface AspectRatioContainerProps {
  children: ReactNode;
  targetRatio?: number;
  fillMode?: 'fit' | 'fill';
}

const AspectRatioContainer = ({ 
  children, 
  targetRatio = 4/3,
  fillMode = 'fit'
}: AspectRatioContainerProps) => {
  const [containerSize, setContainerSize] = useState({ width: 1024, height: 768 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateSize = () => {
      // 모바일 뷰포트 최적화: dvh 단위 효과 적용
      const windowWidth = window.innerWidth * 0.98;
      const windowHeight = Math.min(
        window.innerHeight * 0.98,
        window.visualViewport?.height || window.innerHeight
      );
      
      const windowRatio = windowWidth / windowHeight;
      
      let newWidth, newHeight, newScale;
      
      if (windowRatio > targetRatio) {
        newHeight = windowHeight;
        newWidth = windowHeight * targetRatio;
      } else {
        newWidth = windowWidth;
        newHeight = windowWidth / targetRatio;
      }
      
      newScale = Math.min(newWidth / 1024, newHeight / 768);
      
      setContainerSize({ width: newWidth, height: newHeight });
      setScale(newScale);
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    
    // visualViewport 변화 감지 (모바일 키보드, 브라우저 UI 변화)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', calculateSize);
    }
    
    return () => {
      window.removeEventListener('resize', calculateSize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', calculateSize);
      }
    };
  }, [targetRatio]);

  const preventDragEvents = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div 
      className="w-full flex items-center justify-center bg-gray-100 overflow-hidden no-drag"
      style={{ 
        height: '100dvh', // dvh 단위 사용으로 모바일 최적화
        minHeight: '100dvh'
      }}
      onDragStart={preventDragEvents}
      onDrag={preventDragEvents}
      onDragEnd={preventDragEvents}
      onContextMenu={preventContextMenu}
    >
      <div 
        className="relative bg-white shadow-lg overflow-hidden no-drag"
        style={{ 
          width: `${containerSize.width}px`,
          height: `${containerSize.height}px`,
        }}
        onDragStart={preventDragEvents}
        onDrag={preventDragEvents}
        onDragEnd={preventDragEvents}
      >
        <div 
          className="relative no-drag"
          style={{
            width: '1024px',
            height: '768px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            '--scale': scale.toString(),
          } as React.CSSProperties}
          onDragStart={preventDragEvents}
          onDrag={preventDragEvents}
          onDragEnd={preventDragEvents}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AspectRatioContainer;