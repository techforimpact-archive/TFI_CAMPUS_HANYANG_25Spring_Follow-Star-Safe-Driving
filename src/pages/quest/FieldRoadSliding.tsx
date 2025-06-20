import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useScale } from '../../hooks/useScale';
import GameTitle from '../../components/ui/GameTitle';
import { audioManager } from '../../utils/audioManager';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

const fieldRoad = '/assets/images/orchard_driving_road.png';
const motorcycle = '/assets/images/motorcycle.png';

const FieldRoadSliding = ({ onComplete }: { onComplete?: () => void }) => {
    const [startAnimation, setStartAnimation] = useState(false);
    const [showTitle, setShowTitle] = useState(false);
    const [showStartText, setShowStartText] = useState(true);
    const scale = useScale();

    useEffect(() => {
        // 1초 후 애니메이션 시작
        const animationTimer = setTimeout(() => {
            setStartAnimation(true);
        }, 1000 * Math.max(0.8, scale));
    
        return () => {
            clearTimeout(animationTimer);
        };
    }, [scale]);

    useEffect(() => {
        if (startAnimation) {
            const completeTimer = setTimeout(() => {
                onComplete?.();
            }, 5000 * Math.max(0.8, scale)); // 애니메이션 시간과 동일
            
            return () => clearTimeout(completeTimer);
        }
    }, [startAnimation, scale, onComplete]);

    return (
        <div className="w-full h-full">
            {/* 배경 도로 이미지 - 동적 스크롤 효과 */}
            <div className="absolute inset-0">
                <div
                    className="transition-transform"
                    style={{
                        transform: startAnimation ? 'translateY(-20%)' : 'translateY(-40%)',
                        transitionDuration: `${5000 * Math.max(0.8, scale)}ms`,
                        transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.6, 1.0)', // 부드러운 커브
                        maxWidth: '100%',
                        willChange: 'transform',
                    }}
                >
                    <img
                        src={fieldRoad}
                        alt="과수원 가는 길"
                        className="w-full h-auto object-contain"
                        style={{
                            minHeight: `calc(120vh * ${scale})`,
                            objectPosition: 'center bottom'
                        }}
                    />
                </div>
            </div>
            
            {/* 제목 표시 - 스케일 적용 */}
            {showTitle && !showStartText && (
                <motion.div 
                    className="absolute left-1/2 transform -translate-x-1/2 z-20"
                    style={{ 
                        top: `calc(20% * ${scale})`
                    }}
                    initial={{ opacity: 0, y: `calc(-20px * ${scale})` }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 * Math.max(0.8, scale) }}
                >
                </motion.div>
            )}
            
            {/* 오토바이 이미지 - PotholeQuest와 동일한 스타일 적용 */}
            <div className="absolute bottom-0 w-full flex justify-center">
                <img 
                    src={motorcycle} 
                    alt="이륜차" 
                    className="object-contain object-bottom"
                    style={{
                        width: `calc(100% * ${scale})`,
                        maxHeight: `calc(70vh * ${scale})`,
                        zIndex: 10
                    }}
                />
            </div>
        </div>
    );
};

export default FieldRoadSliding;