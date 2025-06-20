// Front/src/components/ui/RegionBubble.tsx
import { useState, useEffect } from 'react';
import { useScale } from '../../hooks/useScale';
import { audioManager } from '../../utils/audioManager';

interface RegionBubbleProps {
  show: boolean;
}

const RegionBubble = ({ show }: RegionBubbleProps) => {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const scale = useScale();

  useEffect(() => {
    if (show) {
      //기본 알림음
      audioManager.playSound('etcSound', 0.5);
      
      // 표시할 때: 렌더링 시작 후 애니메이션
      setShouldRender(true);
      const timer = setTimeout(() => {
        setVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // 숨길 때: 애니메이션 먼저, 렌더링 종료는 나중에
      setVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500 * Math.max(0.8, scale)); // 애니메이션 duration과 동일
      return () => clearTimeout(timer);
    }
  }, [show, scale]);

  if (!shouldRender) return null;

  return (
    <div 
      className="absolute transform origin-top-right z-40"
      style={{
        top: `calc(160px * ${scale})`,
        right: `calc(20px * ${scale})`
      }}
    >
      {/* 말풍선 꼬리 */}
      <div 
        className={`absolute bg-green-600 transform rotate-45 shadow-md
                   transition-all duration-500 ease-out z-0
                   ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
        style={{
          top: `calc(-16px * ${scale})`,
          right: `calc(48px * ${scale})`,
          width: `calc(32px * ${scale})`,
          height: `calc(32px * ${scale})`
        }}
      ></div>
      
      {/* 말풍선 내용 */}
      <div 
        className={`relative bg-green-600 text-white shadow-lg z-10
                   transition-all duration-500 ease-out
                   ${visible ? 'opacity-100 transform-none' : 'opacity-0 transform -translate-y-4'}`}
        style={{
          borderRadius: `calc(16px * ${scale})`,
          paddingTop: `calc(12px * ${scale})`,
          paddingBottom: `calc(12px * ${scale})`,
          paddingLeft: `calc(24px * ${scale})`,
          paddingRight: `calc(24px * ${scale})`
        }}
      >
        <p 
          className="font-black whitespace-nowrap"
          style={{ fontSize: `calc(1.25rem * ${scale})` }}
        >
          잠깐, 지역 선택은 하셨나요?
        </p>
      </div>
    </div>
  );
};

export default RegionBubble;