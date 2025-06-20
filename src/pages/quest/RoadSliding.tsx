import { useEffect, useState } from 'react';
import { useScale } from '../../hooks/useScale';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

const background = '/assets/images/basic_road_long.png';
const motorcycle = '/assets/images/motorcycle.png';

const RoadSliding = () => {
    const [startAnimation, setStartAnimation] = useState(false);
    const scale = useScale();

    useEffect(() => {
        // 컴포넌트 마운트 시 애니메이션 시작
        setStartAnimation(true);
    }, []);

    return (
        <div className="w-full h-full">
            {/* 배경 이미지 애니메이션 컨테이너 */}
            <div
                className="transition-transform ease-out"
                style={{
                    transform: startAnimation ? 'translateY(-20%)' : 'translateY(-35%)',
                    transitionDuration: `${5000 * Math.max(0.8, scale)}ms`, // 스케일에 따른 애니메이션 속도 조정
                    maxWidth: '100%',
                    willChange: 'transform',
                }}
            >
                <img
                    src={background}
                    alt="주행 중 배경"
                    className="w-full h-auto object-contain"
                />
            </div>
            <div className="absolute bottom-0 w-full flex justify-center">
                <img 
                    src={motorcycle} 
                    alt="이륜차" 
                    className="object-contain object-bottom"
                    style={{
                        width: `calc(80% * ${scale})`, // 4/5를 스케일 적용된 80%로 변경
                        maxHeight: `calc(50vh * ${scale})` // 스케일 적용
                    }}
                />
            </div>
        </div>
    );
};

export default RoadSliding;