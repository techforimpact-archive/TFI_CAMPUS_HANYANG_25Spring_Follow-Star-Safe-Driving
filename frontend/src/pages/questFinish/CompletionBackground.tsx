import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScale } from '../../hooks/useScale';
import Confetti from 'react-confetti';
import { audioManager } from '../../utils/audioManager';
import { getSession } from '../../services/endpoints/session';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

const completion_background = '/assets/images/completion_background_long.png';
const motorcycle = '/assets/images/motorcycle.png';

const CompletionBackground = () => {
    const navigate = useNavigate();
    const scale = useScale();
    const [showConfetti] = useState(true);
    const [startAnimation, setStartAnimation] = useState(false);

    // 타이머 식별자를 보관하기 위해 ref 사용
    const navigationTimerRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        // 컴포넌트 마운트 시 애니메이션 시작
        //환호성 효과음
        audioManager.playSound('goalIn', 0.8);

        setStartAnimation(true);
        console.log("CompletionBackground - 애니메이션 시작");

        // 100점 확인하기 위해 sessionId로 확인!
        const sessionId = localStorage.getItem('session_id');
        let totalScore: number | null = null;

        if (sessionId) {
      getSession(sessionId)
        .then((res) => {
          totalScore = res.data.total_score;
          console.log('[CompletionBackground] total_score:', totalScore);
        })
        .catch((err) => {
          console.error('[CompletionBackground] getSession 오류:', err);
          totalScore = null;
        })
        .finally(() => {
          // 3) 8초 뒤에 분기 처리
          navigationTimerRef.current = window.setTimeout(() => {
            console.log(
              'CompletionBackground - 8초 경과, totalScore →',
              totalScore
            );
            if (totalScore === 100) {
              navigate('/perfect');
            } else {
              navigate('/result');
            }
          }, 8000 * Math.max(0.8, scale));
        });
    } else {
      // session_id가 없으면 (그럴 일이 없어야 하지만), 8초 뒤에 바로 /result로 이동
      navigationTimerRef.current = window.setTimeout(() => {
        console.log(
          'CompletionBackground - session_id 없음, 8초 뒤 /result로 이동'
        );
        navigate('/result');
      }, 8000 * Math.max(0.8, scale));
    }

    // cleanup: 언마운트될 때 타이머 해제
    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, [navigate, scale]);

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* 배경 이미지 애니메이션 컨테이너 - 수정됨 */}
            <div
                className="transition-transform ease-out w-full h-full"
                style={{
                    transform: startAnimation ? 'translateY(-2%)' : 'translateY(-30%)',
                    transitionDuration: `${6000 * Math.max(0.8, scale)}ms` // 애니메이션 지속시간 스케일 적용
                }}
            >
                <img
                    src={completion_background}
                    alt="주행 완료 후 배경"
                    className="w-full object-cover min-h-full"
                />
            </div>
            
            {/* 오토바이 이미지 - 위치 조정됨 */}
            <img
                src={motorcycle} 
                alt="이륜차" 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mx-auto object-contain"
                style={{
                width: `calc(100% * ${scale})`,
                maxHeight: `calc(70vh * ${scale})`,
                zIndex: 10
              }}
            />
            
            {/* 컨페티 이펙트 */}
            {showConfetti && (
                <div className="absolute top-0 left-0 w-full h-full z-50 pointer-events-none overflow-hidden">
                    <Confetti
                    width={1024 * scale}
                    height={768 * scale}
                    numberOfPieces={650 * Math.min(1.5, scale)}
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
        </div>
    );
};

export default CompletionBackground;