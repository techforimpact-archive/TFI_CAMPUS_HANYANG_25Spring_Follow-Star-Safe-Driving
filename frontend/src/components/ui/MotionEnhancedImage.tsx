import { motion, MotionProps } from 'framer-motion';
import EnhancedOptimizedImage from './ReliableImage';

interface MotionEnhancedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
  priority?: 'critical' | 'high' | 'normal' | 'low';
  skeleton?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onClick?: () => void;
  initial?: MotionProps['initial'];
  animate?: MotionProps['animate'];
  transition?: MotionProps['transition'];
  whileHover?: MotionProps['whileHover'];
  whileTap?: MotionProps['whileTap'];
  exit?: MotionProps['exit'];
}

const MotionEnhancedImage = ({ 
  src, alt, className = '', style, fallback, priority = 'normal',
  skeleton = true, onLoad, onError, onClick,
  initial, animate, transition, whileHover, whileTap, exit,
  ...motionProps
}: MotionEnhancedImageProps) => {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      whileHover={whileHover}
      whileTap={whileTap}
      exit={exit}
      {...motionProps}
    >
      <EnhancedOptimizedImage
        src={src} alt={alt} className={className} style={style}
        onLoad={onLoad} onError={onError} onClick={onClick}
      />
    </motion.div>
  );
};

export default MotionEnhancedImage;