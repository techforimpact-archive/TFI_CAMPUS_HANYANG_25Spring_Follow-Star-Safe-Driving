// src/components/ui/Background.tsx
import { useScale } from '../../hooks/useScale';
import EnhancedOptimizedImage from './ReliableImage';

const Background = () => {
  const scale = useScale();

  return (
    <EnhancedOptimizedImage
      src="/assets/images/background.png"
      alt="배경"
      className="w-full h-full"
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: `scale(${Math.max(1, scale)})`,
        transformOrigin: 'center center'
      }}
    />
  );
};

export default Background;