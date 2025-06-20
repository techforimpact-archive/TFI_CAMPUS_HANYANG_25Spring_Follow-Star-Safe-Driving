import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScale } from '../../hooks/useScale';
import Confetti from 'react-confetti';
import DancingStar from './DancingStar';
import { audioManager } from '../../utils/audioManager';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';


const success_background = '/assets/images/success_background_long.png';
const motorcycle = '/assets/images/motorcycle.png';

const SuccessBackground = () => {
    const navigate = useNavigate();
    const scale = useScale();
    const [showConfetti] = useState(true);
    const [startAnimation, setStartAnimation] = useState(false);
    const [showDancingStar, setShowDancingStar] = useState(false);
    const [hideMotorcycle, setHideMotorcycle] = useState(false);

    useEffect(() => {
        // 애니메이션 시작
        
        //환호성 효과음
        audioManager.playSound('goalIn', 0.8);
        setStartAnimation(true);

        // 4초 뒤 댄싱스타 등장 및 오토바이 페이드아웃 (스케일에 따라 시간 조정)
        const transitionTimer = setTimeout(() => {
            setShowDancingStar(true);
            setHideMotorcycle(true);
        }, 7400 * Math.max(0.8, scale));
        
        // 8초 후 결과 화면으로 자동 이동 (스케일에 따라 시간 조정)
        const navigationTimer = setTimeout(() => {
            navigate('/result');
        }, 15000 * Math.max(0.8, scale));

        return () => {
            clearTimeout(transitionTimer);
            clearTimeout(navigationTimer);
        };
    }, [navigate, scale]);

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* 배경 이미지 애니메이션 컨테이너 - 수정됨 */}
            <div
                className="transition-transform ease-out w-full h-full"
                style={{
                    transform: startAnimation ? 'translateY(-6%)' : 'translateY(-35%)',
                    transitionDuration: `${7500 * Math.max(0.8, scale)}ms` // 애니메이션 지속시간 스케일 적용
                }}
            >
                <img
                    src={success_background}
                    alt="주행 성공 후 배경"
                    className="w-full object-cover min-h-full"
                />
            </div>

            {/* 오토바이 이미지: 4초 후 페이드아웃 - 위치 조정됨 */}
            <img 
                src={motorcycle} 
                alt="이륜차" 
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 mx-auto object-contain transition-opacity duration-1000 z-50
                    ${hideMotorcycle ? 'opacity-0' : 'opacity-100'}`}
                style={{
                    width: `calc(75% * ${scale})`,
                    maxHeight: `calc(60% * ${scale})`
                }}
            />
            
            {/* 컨페티 이펙트 */}
            {showConfetti && (
                <div className="absolute top-0 left-0 w-full h-full z-50 pointer-events-none overflow-hidden">
                    <Confetti
                    width={1024 * scale}
                    height={768 * scale}
                    numberOfPieces={600 * Math.min(1.5, scale)}
                    gravity={0.1 * scale}
                    recycle={true}
                    confettiSource={{
                        x: 0,
                        y: 0,
                        w: 1024 * scale,
                        h: 100 * scale
                    }}
                    />
                </div>
                )}
            {/* 댄싱스타: 4초 후 등장 - 위치 조정됨 */}
            {showDancingStar && <DancingStar />}
        </div>
    );
};

export default SuccessBackground;