// Front/src/pages/quest/HarvestQuest.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import HarvestBox from './HarvestBox';
import { postQuestAttempt, AttemptPayload } from '../../services/endpoints/attempts';
import GameTitle from '../../components/ui/GameTitle';
import { useScale } from '../../hooks/useScale';
// import { useScore } from '../../context/ScoreContext';
import { useCharacter } from '../../context/CharacterContext';
import { audioManager } from '../../utils/audioManager';
import MotionEnhancedImage from '../../components/ui/MotionEnhancedImage';
import EnhancedLoadingScreen from 'components/ui/SimpleLoadingScreen';

// 이미지 임포트
const fieldHarvestBoxes = '/assets/images/work_complete_with_applebox.png';
const field = '/assets/images/work_complete_without_applebox.png';
const accident = '/assets/images/grandfather_field_accident.png';
const dangerWarning = '/assets/images/danger_warning.png';
const successCircle = '/assets/images/success_circle.png';
const starCharacter = '/assets/images/star_character.png';
const motorcycle = '/assets/images/mission4_motorcycle.png';
const confirmButton = '/assets/images/confirm_button.png';

// 게임 단계 정의
type GamePhase = 
  | 'intro'         // 시작 화면
  | 'driving'       // 오토바이 주행
  | 'harvestDone'   // 수확물 싣기
  | 'selection'     // 선택지 제공
  | 'successResult' // 정답 선택 결과
  | 'fadeOut'       // 오답 페이드아웃
  | 'failResult'    // 오답 선택 결과
  | 'score';        // 점수 화면

const HarvestQuest = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [questId, setQuestId] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [fallbackImage, setFallbackImage] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showIntroText, setShowIntroText] = useState(false);
  const [hideSuccessImages, setHideSuccessImages] = useState(false);
  const scale = useScale();
  // const { updateQuestScore } = useScore();

  // character context
  const { characterImages } = useCharacter();

  // 스케일 적용된 클릭 영역 크기
  const scaledClickAreaPadding = 20 * scale;
  const scaledHoverScale = 1.05 + (0.02 * scale); // 스케일에 따른 호버 효과 조정

  // URL 쿼리 파라미터에서 시나리오 ID와 퀘스트 ID 가져오기
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sId = searchParams.get('scenario');
    const qId = searchParams.get('quest');
    setScenarioId(sId);
    setQuestId(qId || '4');
    
    // 스케일에 따른 타이밍 조정 함수
    const getScaledDuration = (baseDuration: number) => {
      return baseDuration * Math.max(0.8, scale);
    };
    
    // 인트로 화면 3초 후 드라이빙 - 스케일 적용
    const timer = setTimeout(() => {
      setGamePhase('driving');
      
      // 드라이빙 1초 후 사과박스 쌓인 정지 화면으로 전환 - 스케일 적용
      const drivingTimer = setTimeout(() => {
        setGamePhase('harvestDone');
        
        // 수확 후 선택지 화면으로 전환
        const alertTimer = setTimeout(() => {
          setGamePhase('selection');
        }, 0);
        
        return () => clearTimeout(alertTimer);
      }, getScaledDuration(0));
      
      return () => clearTimeout(drivingTimer);
    }, getScaledDuration(3000));
    
    return () => clearTimeout(timer);
  }, [location, scale]);

  //퀘스트 등장 시 효과음 재생
  useEffect(() => {
    if (gamePhase === 'selection') {
      audioManager.playQuestStart();
    }
  }, [gamePhase]);
  
  const handleConfirmClick = () => {
    //선택 버튼 효과음
    audioManager.playButtonClick();
    if (gamePhase === 'successResult' && showSuccessMessage) {
      // 성공 메시지에서 확인 버튼 클릭 시
      navigate(`/score?scenario=${scenarioId}&quest=${questId}&score=20&correct=true`);
    } else if (gamePhase === 'failResult' && showWarning) {
      // 실패 메시지에서 확인 버튼 클릭 시
      navigate(`/score?scenario=${scenarioId}&quest=${questId}&score=10&correct=false`);
    }
  };

  // 선택지 선택 핸들러 - 스케일 적용된 타이밍
  const handleOptionSelect = (option: 'A' | 'B') => {
    //효과음 재생
    audioManager.playQuestSelect();

    setSelectedOption(option);
    
    // API 호출
    const isCorrect = option === 'B';
    const scoreAwarded = isCorrect ? 20 : 10;

    const sessionId = localStorage.getItem('session_id')!;
    const qId = "Harvest";
    const payload: AttemptPayload = {
      attempt_number: 1,
      score_awarded: scoreAwarded,
      selected_option: option,
      is_correct: isCorrect,
      response_time: 0,
    };

    postQuestAttempt(sessionId, qId, payload)
      .then((res) => {
        console.log('✅ 시도 기록 완료:', res.data.attempt_id);
        //updateQuestScore("Harvest", scoreAwarded);
      })
      .catch((err) => {console.error('❌ 시도 기록 실패', err);});

    const getScaledDuration = (baseDuration: number) => {
      return baseDuration * Math.max(0.8, scale);
    };

    if (option === 'B') {
      // 정답 선택
      setTimeout(() => {
        audioManager.playRightAnswer1();
        setGamePhase('successResult');
        
        setTimeout(() => {
          setHideSuccessImages(true);
          
          setTimeout(() => {
            audioManager.playRightAnswer2();
            setShowSuccessMessage(true);
          }, getScaledDuration(1000));
        }, getScaledDuration(3000));
      }, getScaledDuration(1000));
    } else {
      // 오답 선택
      setTimeout(() => {
        audioManager.playSound('accidentMotor', 1.0);
        setGamePhase('fadeOut');
        setTimeout(() => {
          setGamePhase('failResult');
        }, getScaledDuration(1500));
      }, getScaledDuration(1000));
    }
  };
  
  // failResult 단계에서 시간차를 두고 경고 메시지 표시 - 스케일 적용
  useEffect(() => {
    if (gamePhase === 'failResult') {
      const timer = setTimeout(() => {
        //오답 효과음
        audioManager.playWrongAnswer();

        setShowWarning(true);
      }, 4000 * Math.max(0.8, scale));

      return () => clearTimeout(timer);
    } else {
      setShowWarning(false);
    }
  }, [gamePhase, scale]);

  // 이미지 오류 핸들러
  const handleImageError = () => {
    setFallbackImage(true);
  };

  // 퀘스트 제목 렌더링 - 스케일 적용
  useEffect(() => {
    if (gamePhase === 'intro') {
      const timer = setTimeout(() => {
        setShowIntroText(true);
      }, 3000 * Math.max(0.8, scale));

      return () => clearTimeout(timer);
    } else {
      setShowIntroText(false);
    }
  }, [gamePhase, scale]);

  return (
    <div className="w-full h-full">
      {/* 배경 */}
      {(gamePhase !== 'intro' && gamePhase !== 'fadeOut' && gamePhase !== 'failResult'&& gamePhase !== 'score' ) && (
        <MotionEnhancedImage
          src={fieldHarvestBoxes}
          alt="수확완료 화면"
          className="absolute w-full h-full object-cover"
        />
      )}

      {/* 배경 흐리게 처리 */}
      {(gamePhase !== 'intro' && gamePhase !== 'driving' && gamePhase !== 'harvestDone' && gamePhase !== 'failResult' ) && (
        <div className="absolute inset-0 bg-[#FFF9C4]/60 z-10"></div>
      )}

      {/* 인트로 화면 */}
      {gamePhase === 'intro' && (
        <>
          <MotionEnhancedImage
          src={field}
          alt="수확 전 화면"
          className="absolute w-full h-full object-cover"
        />
          <HarvestBox /> 
        </>
      )}

      {/* 주행 화면 */}
      {gamePhase === 'driving' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
        </div>
      )}   

      {/* 선택지 화면 */}
      {gamePhase === 'selection' && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center z-10"
            style={{ top: `calc(20px * ${scale})` }}
          >
            {/* 선택지 제목 및 설명 */}
            <div 
              className="bg-[#FFFAFA] bg-opacity-75 border-[#0DA429] rounded-[30px] flex flex-col justify-center items-center text-center"
              style={{ 
                width: `calc(815px * ${scale})`,
                height: `calc(400px * ${scale})`,
                borderWidth: `calc(10px * ${scale})`,
                padding: `calc(12px * ${scale})`,
                marginBottom: `calc(32px * ${scale})`
              }}
            >
              <h2 
                className="font-black text-[#0DA429] text-center"
                style={{ 
                  fontSize: `calc(3.5rem * ${scale})`,
                  marginTop: `calc(-8px * ${scale})`
                }}
              >
                무거운 짐 싣기
              </h2>
              <p
                className="text-black text-center font-black leading-relaxed"
                style={{
                  fontSize: `calc(2.5rem * ${scale})`,
                  marginTop: `calc(25px * ${scale})`,
                  letterSpacing: `calc(0.05em * ${scale})`
                }}
              >
                작업하는 중에 수확한 농작물을<br/>
                <span style={{ color: '#B91C1C' }}>이륜차에 싣고 싶어요</span><br/>
                어떻게 옮길까요?
              </p>
            </div>
            
            {/* 선택지 버튼 - 스케일 적용된 클릭 영역 */}
            <div
              className="flex justify-between"
              style={{
                width: `calc(815px * ${scale})`,
                gap: `calc(20px * ${scale})`,
                padding: 0
              }}
            >
              <motion.button
                className={`rounded-[20px] font-black text-black transition duration-300 cursor-pointer
                  ${selectedOption === 'A' ? 
                    'bg-[#0DA429] bg-opacity-90 border-[#0DA429] scale-105' : 
                    'bg-[#FFFAFA] bg-opacity-70 border-[#0DA429] hover:bg-opacity-90'}
                `}
                style={{
                  width: `calc(385px * ${scale})`,
                  height: `calc(208px * ${scale})`,
                  fontSize: `calc(2.2rem * ${scale})`,
                  borderWidth: `calc(7px * ${scale})`,
                  // 클릭 영역 확장을 위한 패딩
                  padding: `calc(12px * ${scale})`,
                  transform: selectedOption === 'A' ? `scale(${scaledHoverScale})` : 'scale(1)',
                  boxSizing: 'border-box',
                  lineHeight: 1.4,
                }}
                onClick={() => handleOptionSelect('A')}
                disabled={!!selectedOption}
                animate={{ scale: [1, 1.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut",repeatType: "reverse" }}
              >
                과수원으로<br/><span style={{ color: '#B91C1C' }}>이륜차를 운전해</span><br/> 짐을 싣는다
              </motion.button>
              
              <motion.button
                className={`rounded-[20px] font-black text-black transition duration-300 cursor-pointer
                  ${selectedOption === 'B' ? 
                    'bg-[#0DA429] bg-opacity-90 border-[#0DA429] scale-105' : 
                    'bg-[#FFFAFA] bg-opacity-70 border-[#0DA429] hover:bg-opacity-90'}
                `}
                style={{
                  width: `calc(385px * ${scale})`,
                  height: `calc(208px * ${scale})`,
                  fontSize: `calc(2.2rem * ${scale})`,
                  borderWidth: `calc(7px * ${scale})`,
                  // 클릭 영역 확장을 위한 패딩
                  padding: `calc(12px * ${scale})`,
                  transform: selectedOption === 'B' ? `scale(${scaledHoverScale})` : 'scale(1)',
                  boxSizing: 'border-box',
                  lineHeight: 1.4,
                }}
                onClick={() => handleOptionSelect('B')}
                disabled={!!selectedOption}
                animate={{ scale: [1.1, 1] }}  
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut",repeatType: "reverse" }}
              >
                <span style={{ color: '#B91C1C' }}>손수레를 이용해</span><br/> 이륜차까지<br/> 짐을 옮겨 싣는다
              </motion.button>
            </div>
          </div>
        </div>
      )}
      
      {/* 정답 결과 화면 */}
      {gamePhase === 'successResult' && !showSuccessMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* 중앙에 큰 success_circle 이미지 */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            
            <motion.img
              src={successCircle} 
              alt="성공 원" 
              className="absolute w-full h-full object-contain"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={hideSuccessImages ? { scale: 0.3, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={hideSuccessImages ? { duration: 0.8, ease: 'easeIn' } : { duration: 1, ease: 'easeOut' }}
            />
            
            {/* 그 위에 할아버지와 오토바이 이미지 */}
            <div className="absolute inset-0 flex items-center justify-center z-30">
              {!fallbackImage ? (
                <>
                <motion.img
                  src={characterImages.mission4Success}
                  alt="수레 끄시는 어르신신" 
                  className="absolute object-contain z-40"
                  style={{
                    left: `calc(20% * ${scale})`,
                    width: `calc(400px * ${scale})`,
                    height: 'auto'
                  }}
                  onError={handleImageError}
                  // 1) 시작 상태: 작게, 투명, 화면 왼쪽(-50px) 밖에서
                  initial={{ scale: 0.8, opacity: 0, x: -80 }}
                  // 2) 조건에 따라 보여줄 때(show) vs 숨길 때(hide) 목표 상태 지정
                  animate={
                    hideSuccessImages
                      ? { scale: 0.5, opacity: 0, x: 20 }                        // 사라질 땐 다시 작아지면서 왼쪽으로
                      : { scale: 1, opacity: 1, x: `calc(20px * ${scale})` }    // 보일 땐 제자리에서 커지면서 오른쪽(35px*scale) 으로
                  }
                  // 3) 각 속성별 transition 세부 조정
                  transition={{
                    // scale, opacity는 기존 처럼 easeIn/out, duration, delay 분리
                    scale:   hideSuccessImages
                      ? { duration: 0.8, ease: 'easeIn' }
                      : { duration: 1,   delay: 0.3, ease: 'easeOut' },
                    opacity: hideSuccessImages
                      ? { duration: 0.8, ease: 'easeIn' }
                      : { duration: 1,   delay: 0.3, ease: 'easeOut' },
                    // x축 이동은 mission4Success 로직을 재사용
                    x: { duration: 10 * Math.max(0.8, scale), repeat: 0 }
                  }}
                />
                  <motion.img
                    src={motorcycle}
                    alt="오토바이"
                    className="absolute object-contain z-50"
                    style={{
                      right: `calc(22% * ${scale})`,
                      top: `calc(15% * ${scale})`,
                      transform: 'translateY(-50%)',
                      width: `calc(323px * ${scale})`
                    }}
                    onError={handleImageError}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={hideSuccessImages ? { scale: 0.5, opacity: 0 } : { scale: 1, opacity: 1 }}
                    transition={hideSuccessImages ? { duration: 0.8, ease: 'easeIn' } : { duration: 1, delay: 0.3, ease: 'easeOut' }}
                  />
                </>
              ) : (
                <MotionEnhancedImage
                  src="/assets/images/character_with_helmet.png"  
                  alt="헬멧 쓴 캐릭터" 
                  className="object-contain"
                  style={{
                    width: `calc(40% * ${scale})`,
                    height: 'auto'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 정답 후 성공 메시지 화면 */}
      {gamePhase === 'successResult' && showSuccessMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
          {/* 중앙 상단에 정답입니다! */}
            <motion.div 
              className="absolute left-0 right-0 flex justify-center items-center"
              style={{ 
                top: `calc(15% * ${scale})`
              }}
              initial={{ opacity: 0, y: `calc(-30px * ${scale})` }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <GameTitle 
                text="정답입니다!" 
                fontSize={`calc(4rem * ${scale})`}
                strokeWidth={`calc(12px * ${scale})`}
                color="text-[#0E8E12]"
              />
            </motion.div>

          {/* 중앙에 녹색 박스에 메시지 */}
          <motion.div 
              className="bg-[#0DA429]/60 bg-opacity-90 border-green-700 border-8 w-[73%] mx-auto text-center relative"
              style={{ 
                marginTop: `calc(240px * ${scale})`,
                paddingTop: `calc(30px * ${scale})`,    // 위쪽 패딩 증가
                paddingBottom: `calc(30px * ${scale})`, // 아래쪽 패딩 증가
                paddingLeft: `calc(40px * ${scale})`,   // 좌우는 기존 유지
                paddingRight: `calc(40px * ${scale})`,
                borderRadius: `calc(48px * ${scale})`
              }}
              initial={{ opacity: 0, scale: 0.8, y: `calc(30px * ${scale})` }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            >
            <p 
                className="font-black text-white"
                style={{ fontSize: `calc(60px * ${scale})` }}
            >
              당신의 안전과<br/> 소중한 자산을 보호하는 <br/> 현명한 선택이에요
            </p>
          </motion.div>
          
          {/* 확인 버튼 */}
            <motion.button
              onClick={handleConfirmClick}
              className="cursor-pointer hover:scale-105 transition-transform duration-200 border-0 outline-none bg-transparent p-0"
              style={{
                marginTop: `calc(40px * ${scale})`,
                width: `calc(200px * ${scale})`,
                height: 'auto',
                marginBottom: `calc(20px * ${scale})` // 하단 간격 조정
              }}
              initial={{ opacity: 0, y: `calc(20px * ${scale})` }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
            >
              <MotionEnhancedImage
                src={confirmButton} 
                alt="확인 버튼" 
                className="w-full h-auto"
              />
            </motion.button>

          <motion.img 
            src={starCharacter} 
            alt="별별이" 
            className="absolute z-40"
            style={{
              bottom: `calc(15% * ${scale})`,
              left: `calc(3% * ${scale})`,
              width: `calc(23% * ${scale})`
            }}
            initial={{ opacity: 0, x: `calc(-30px * ${scale})`, y: `calc(10px * ${scale})` }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          />
        </div>
      )}
      
      {/* 페이드아웃 화면 */}
      {gamePhase === 'fadeOut' && (
        <motion.img
          src="/assets/images/accident_fadeout.png"
          alt="전환 이미지"
          className="absolute inset-0 w-full h-full object-cover z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 * Math.max(0.8, scale) }}
        />
      )}
      
      {/* 오답 결과 화면 */}
      {gamePhase === 'failResult' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <MotionEnhancedImage
            src={characterImages.fieldAccident}
            alt="사고 장면"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* 애니메이션 컨테이너 - 스케일 적용된 애니메이션 */}
          {showWarning && (
            <motion.div 
              className="absolute inset-0 bg-[#FFF9C4]/60 flex flex-col items-center justify-end z-10"
              style={{ paddingBottom:`calc(40px * ${scale})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 * Math.max(0.8, scale) }}
            >
              <motion.img 
                src={dangerWarning} 
                alt="위험 경고" 
                style={{
                  width: `calc(16% * ${scale})`,
                  marginBottom: `calc(4px * ${scale})`
                }}
                initial={{ y: `calc(-20px * ${scale})`, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 * Math.max(0.8, scale), delay: 0.2 * Math.max(0.8, scale) }}
              />
              
              <motion.div 
                className="w-[80%] bg-white bg-opacity-80 border-[#EE404C] text-center"
                style={{
                  padding: `calc(32px * ${scale})`,
                  borderWidth: `calc(12px * ${scale})`,
                  borderRadius: `calc(36px * ${scale})`
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 * Math.max(0.8, scale), delay: 0.4 * Math.max(0.8, scale) }}
              >
                <h2 
                  className="font-black text-[#EE404C]"
                  style={{ 
                    fontSize: `calc(4rem * ${scale})`,
                    marginBottom: `calc(16px * ${scale})`
                  }}
                >
                  덜컹! 넘어졌어요
                </h2>
                <p 
                  className="font-black text-black"
                  style={{
                    fontSize: `calc(48px * ${scale})`,
                    letterSpacing: "0.05em"
                }}
                >
                  뿌리에 걸려 낙상할 수 있어요<br />
                  이륜차는 도로에 두고 짐을 옮겨요
                </p>
              </motion.div>
          {/* 확인 버튼 */}
            <motion.button
              onClick={handleConfirmClick}
              className="cursor-pointer hover:scale-105 transition-transform duration-200 border-0 outline-none bg-transparent p-0"
              style={{
                marginTop: `calc(40px * ${scale})`,
                width: `calc(200px * ${scale})`,
                height: 'auto',
                marginBottom: `calc(20px * ${scale})` // 하단 간격 조정
              }}
              initial={{ opacity: 0, y: `calc(20px * ${scale})` }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
            >
              <MotionEnhancedImage
                src={confirmButton} 
                alt="확인 버튼" 
                className="w-full h-auto"
              />
            </motion.button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default HarvestQuest;