import { useEffect, useState } from 'react';
import { useScale } from '../../hooks/useScale';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

const star_character = '/assets/images/star_character.png'

interface CharacterAnimationProps {
  onAnimationComplete?: () => void;
}

const CharacterAnimation = ({ onAnimationComplete }: CharacterAnimationProps) => {
    const [animationCompleted, setAnimationCompleted] = useState(false);
    const scale = useScale();

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationCompleted(true);
            // 애니메이션 종료 후 콜백 호출
            if (onAnimationComplete) {
                onAnimationComplete();
            }
        }, 2000); // 2초 후 애니메이션 종료
        return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return (
        <img
            src={star_character}
            alt="캐릭터"
            className="absolute z-20"
            style={{
                // 해상도 대응 크기
                width: `calc(25% * ${scale})`,
                height: 'auto',
                // 해상도 대응 위치
                top: animationCompleted ? `calc(55% * ${scale})` : `calc(40% * ${scale})`, 
                left: animationCompleted ? `calc(65% * ${scale})` : `calc(5% * ${scale})`,
                transform: 'translate(0, 0)',
                // 애니메이션 지속시간도 스케일에 따라 조정 가능 (선택사항)
                transition: `all ${2000 * Math.max(0.8, scale)}ms ease-out`
            }}
        />
    );
};

export default CharacterAnimation;