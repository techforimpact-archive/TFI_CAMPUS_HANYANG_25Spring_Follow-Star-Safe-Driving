// src/pages/driving/DrivingPrepPage.tsx 수정 부분
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useScale } from '../../hooks/useScale';
import { audioManager } from '../../utils/audioManager';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

// 이미지 임포트
const drivingBackground = '/assets/images/background.png';
const motorcycleSideView = '/assets/images/motorcycle_side_view.png';

const DrivingPrepPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scale = useScale();
  const [motorcyclePosition, setMotorcyclePosition] = useState(-100);
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [nextQuestId, setNextQuestId] = useState<string | null>(null);
  
  // URL 쿼리 파라미터에서 시나리오 ID와 다음 퀘스트 ID 가져오기
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sId = searchParams.get('scenario');
    const qId = searchParams.get('nextQuest');

    setScenarioId(sId);
    setNextQuestId(qId);
    
    console.log("DrivingPrepPage - 주행 준비 중:", { scenarioId: sId, nextQuestId: qId });

    audioManager.playSound('setMotor', 0.8);

    // 다음 화면으로 자동 이동 타이머
    const timer = setTimeout(() => {
      console.log("DrivingPrepPage - 미션 화면으로 이동:", { path: `/quest?scenario=${sId}&quest=${qId}` });
      audioManager.stopSound('setMotor');
      navigate(`/quest?scenario=${sId}&quest=${qId}`);
    }, 3000);
    
    return () => { 
      clearTimeout(timer);
      audioManager.stopSound('setMotor');
    };
  }, [location, navigate]);
  
  // ...existing code...
  // 이륜차 애니메이션
  useEffect(() => {
    // 이륜차가 화면을 완전히 지나가는데 필요한 총 거리
    const motorcycleWidth = 740 * scale;
    const totalDistance = window.innerWidth + motorcycleWidth + 100; // 시작점(-100) + 화면폭 + 오토바이폭 + 여유
    const animationDuration = 4000; // 4초
    const speed = totalDistance / (animationDuration / 16); // 16ms마다 이동할 거리
    
    const animationInterval = setInterval(() => {
      setMotorcyclePosition(prev => {
        const newPosition = prev + speed;
        // 화면을 완전히 벗어나면 인터벌 클리어
        if (newPosition > window.innerWidth + motorcycleWidth) {
          clearInterval(animationInterval);
          return newPosition;
        }
        return newPosition;
      });
    }, 16); // 약 60fps
    
    return () => clearInterval(animationInterval);
  }, [scale]);

  return (
    <div className="relative w-full h-full">
      {/* 배경 */}
      <img
        src={drivingBackground}
        alt="주행 배경"
        className="absolute w-full h-full object-cover"
      />
      
      {/* 이륜차 애니메이션 */}
      <img
        src={motorcycleSideView}
        alt="이륜차"
        style={{ 
          position: 'absolute',
          left: `${motorcyclePosition * scale}px`,
          bottom: `calc(0% * ${scale})`,
          width: `calc(649px * ${scale})`,
          height: 'auto',
        }}
      />
    </div>
  );
};

export default DrivingPrepPage;