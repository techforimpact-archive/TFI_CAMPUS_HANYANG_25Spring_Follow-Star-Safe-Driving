// src/components/ui/InlineBackground.tsx (새 파일)
import { useScale } from '../../hooks/useScale';

// 가장 중요한 배경 이미지를 base64로 인라인화
const BACKGROUND_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."; // 실제 base64 데이터

const Background = () => {
  const scale = useScale();

  return (
    <div 
      className="w-full h-full"
      style={{
        backgroundImage: `url(${BACKGROUND_BASE64})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: `scale(${Math.max(1, scale)})`,
        transformOrigin: 'center center'
      }}
    />
  );
};

export default Background;