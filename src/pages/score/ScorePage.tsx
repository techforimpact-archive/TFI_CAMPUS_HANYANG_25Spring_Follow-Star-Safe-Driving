import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Background from '../../components/ui/Background';
import HomeButton from '../../components/ui/HomeButton';
import { useScale } from '../../hooks/useScale';
import { audioManager } from '../../utils/audioManager';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

// 이미지 임포트
const grandchildrenHappy = '/assets/images/grandchildren_happy.png';
const grandchildrenSad = '/assets/images/grandchildren_sad.png';

const ScorePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0); // 애니메이션용 점수
  const [isCorrect, setIsCorrect] = useState(true);
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [questId, setQuestId] = useState<string | null>(null);
  const [showScore, setShowScore] = useState(false); // 점수 표시 제어

  const scale = useScale();
  
  // URL 쿼리 파라미터에서 정보 가져오기
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const scoreParam = searchParams.get('score');
    const correctParam = searchParams.get('correct');
    const sId = searchParams.get('scenario');
    const qId = searchParams.get('quest');
    
    console.log("ScorePage - 받은 파라미터:", { score: scoreParam, correct: correctParam, scenario: sId, quest: qId });
    
    const finalScore = scoreParam ? parseInt(scoreParam) : 0;
    const isAnswerCorrect = correctParam === 'true'; //효과음을 위해 변수 추가가

    setScore(finalScore);
    setIsCorrect(isAnswerCorrect);
    setScenarioId(sId);
    setQuestId(qId);
    
    // 500ms 후 점수 애니메이션 시작
    setTimeout(() => {
      setShowScore(true);

      if (isAnswerCorrect) {
        audioManager.playSound('highScore', 0.8);
      } else {
        audioManager.playSound('lowScore', 0.8);
      }
      
      // 점수 카운팅 애니메이션
      let currentScore = 0;
      const increment = Math.ceil(finalScore / 30); // 30프레임에 걸쳐 증가
      const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= finalScore) {
          currentScore = finalScore;
          clearInterval(timer);
        }
        setDisplayScore(currentScore);
      }, 50); // 50ms마다 업데이트
    }, 500);
    
    // 3초 후 다음 화면으로 자동 이동
    const timer = setTimeout(() => {
      // 미션별 분기 처리 확장
      console.log("ScorePage - 다음 화면 결정 중:", { questId: qId });

      switch(qId) {
        case '1':
          // 미션1 완료 → 미션2 준비로 이동
          console.log("미션1 완료 → 미션2 준비로 이동");
          navigate(`/pothole-quest?scenario=${sId}&quest=2`);
          break;
        case '2':
          // 미션2 완료 → 미션3으로 직접 이동 (수정)
          console.log("미션2 완료 → 미션3으로 직접 이동");
          navigate(`/makgeolli-quest?scenario=${sId}&quest=3`);
          break;
        case '3':
          // 미션3 완료 → 미션4로 직접 이동 (수정)
          console.log("미션3 완료 → 미션4로 직접 이동");
          navigate(`/harvest-quest?scenario=${sId}&quest=4`);
          break;
        case '4':
          // 미션4 완료 → 미션5로 직접 이동 (수정)
          console.log("미션4 완료 → 미션5로 직접 이동");
          navigate(`/return-quest?scenario=${sId}&quest=5`);
          break;
        case '5':
          // 미션5 완료 → 성공 화면으로 이동
          console.log("미션5 완료 → 성공 화면으로 이동");
          navigate(`/completion?scenario=${sId}`);
          break;
        default:
          // 알 수 없는 미션 → 홈으로 이동
          console.log("알 수 없는 미션 ID입니다. 홈으로 이동합니다.");
          navigate('/');
      }
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [location, navigate]);

  return (
    <div className="relative w-full h-full">
      {/* 배경 컴포넌트 사용 */}
      <Background />
      
      {/* 홈 버튼 추가 */}
      <HomeButton />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div 
          className={`
            flex flex-col items-center transition-all duration-700 ease-out
            ${showScore 
              ? 'transform scale-100 opacity-100' 
              : 'transform scale-90 opacity-0'
            }
          `}
          style={{ 
            marginTop: `calc(-100px * ${scale})`,
            animation: showScore ? 'groupAppear 0.7s ease-out' : 'none'
          }}
        >
          {/* 손자/손녀 이미지 */}
          <img
            src={isCorrect ? grandchildrenHappy : grandchildrenSad}
            alt={isCorrect ? "기쁜 손자손녀" : "슬픈 손자손녀"}
            className="relative z-20"
            style={{
              width: `calc(312px * ${scale})`,
              height: 'auto',
              marginBottom: `calc(-36px * ${scale})`
            }}
          />
          
          {/* 점수 표시 - 애니메이션 효과 추가 */}
          <div 
            className={`
              bg-[#0DA429]/80 border-green-700 shadow-lg flex items-center justify-center
              transition-all duration-700 ease-out
              ${showScore 
                ? 'transform scale-100 opacity-100' 
                : 'transform scale-100 opacity-0'  // scale-50에서 scale-100으로 변경
              }
            `}
            style={{
              transform: showScore 
                ? `scale(${1.05 * scale})` 
                : `scale(${1.05 * scale})`,  // 0.5에서 1.05로 변경하여 크기 변화 제거
              borderWidth: `calc(16px * ${scale})`,
              borderRadius: `calc(80px * ${scale})`,
              paddingLeft: `calc(160px * ${scale})`,
              paddingRight: `calc(160px * ${scale})`,
              paddingTop: `calc(20px * ${scale})`,
              paddingBottom: `calc(20px * ${scale})`,
              animation: showScore ? 'fadeInBox 0.7s ease-out' : 'none'  // 새로운 애니메이션으로 변경
            }}
          >
            <span 
              className={`
                text-9xl font-black text-white
                transition-all duration-300
                ${showScore ? 'transform scale-100' : 'transform scale-75'}
              `}
              style={{
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                filter: showScore ? 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' : 'none'
              }}
            >
              +{displayScore}
            </span>
          </div>
        </div>
      </div>
      
      {/* 커스텀 애니메이션 CSS */}
      <style>{`
        @keyframes groupAppear {
          0% {
            transform: scale(0.8) translateY(20px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInBox {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes scoreBounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) scale(1.05);
          }
          40% {
            transform: translateY(-10px) scale(1.08);
          }
          60% {
            transform: translateY(-5px) scale(1.06);
          }
        }
      `}</style>
    </div>
  );
};

export default ScorePage;