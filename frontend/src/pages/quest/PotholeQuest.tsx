// Front/src/pages/quest/PotholeQuest.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { postQuestAttempt, AttemptPayload } from '../../services/endpoints/attempts';
import { useScale } from '../../hooks/useScale';
import GameTitle from '../../components/ui/GameTitle';
// import { useScore } from '../../context/ScoreContext';
import { useCharacter } from '../../context/CharacterContext';
import { audioManager } from '../../utils/audioManager';
import { initBgm, playBgm, stopBgm, unloadBgm } from '../../utils/backgroundMusic';

import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

import { simpleImagePreloader } from '../../utils/simpleImagePreloader';

// 이미지 임포트
const drivingRoad = '/assets/images/driving_road.png';
const motorcycle = '/assets/images/motorcycle.png';
const smallPothole = '/assets/images/small_pothole.png';
const potholeAccident = '/assets/images/grandfather_pothole_accident.png';
const dangerWarning = '/assets/images/danger_warning.png';
const successCircle = '/assets/images/success_circle.png';
export const starCharacter = '/assets/images/star_character.png';
const confirmButton = '/assets/images/confirm_button.png';

// 게임 단계 정의
type GamePhase = 
  | 'driving'       // 동적 주행 화면
  | 'selection'     // 선택지 제공
  | 'successResult' // 정답 선택 결과
  | 'fadeOut'       // 오답 페이드아웃
  | 'failResult'    // 오답 선택 결과

const PotholeQuest = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [questId, setQuestId] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('driving');
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showStartText, setShowStartText] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);
  const [hideSuccessImages, setHideSuccessImages] = useState(false);

  const scale = useScale();
  // const { updateQuestScore } = useScore();

  // character context
  const { characterImages } = useCharacter();

  const scaledHoverScale = 1.05 + (0.02 * scale);
  // URL 쿼리 파라미터 처리
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sId = searchParams.get('scenario');
    const qId = searchParams.get('quest');
    setScenarioId(sId);
    setQuestId(qId || '2');
  }, [location]);

  // 1) 최초 마운트 시 BGM 로드
  useEffect(() => {
    (async () => {
      await initBgm('del_rio_bravo');
      //console.log('init bgm');

      // 마운트 직후 driving 단계라면 재생
      if (gamePhase === 'driving') {
        //console.log('주행 시작 bgm');
        playBgm('del_rio_bravo');
      }
    })();

    // 언마운트 시 해제
    return () => {
      unloadBgm('del_rio_bravo');
      //console.log('unload bgm on unmount');
    };
  }, []); // 한 번만 실행

  // 2) gamePhase 가 바뀔 때마다 재생/정지
  useEffect(() => {
    if (gamePhase === 'driving') {
      playBgm('del_rio_bravo');
      //console.log('play bgm on driving phase');
    }
    if (gamePhase === 'successResult' || gamePhase === 'fadeOut' || gamePhase === 'failResult') {
      stopBgm('del_rio_bravo');
      //console.log('stop bgm on end phases');
    }
  }, [gamePhase]);



  // 주행 단계 타이밍 제어
  useEffect(() => {
    if (gamePhase === 'driving') {
      //장면 전환 효과음(주행 시작)
      audioManager.playsceneSwitch()
      
      // 1초 후 애니메이션 시작
      const animationTimer = setTimeout(() => {
        setStartAnimation(true);
      }, 3000 * Math.max(0.8, scale));

      // 3초 후 "주행 시작" 텍스트 숨김
      const hideTextTimer = setTimeout(() => {
        setShowStartText(false);
      }, 3000 * Math.max(0.8, scale));

      // 7초 후 (스크롤 애니메이션이 포트홀 위치에 도달한 후) 선택지 화면으로 전환
      const transitionTimer = setTimeout(() => {
        setGamePhase('selection');
      }, 8000 * Math.max(0.8, scale));

      return () => {
        clearTimeout(animationTimer);
        clearTimeout(hideTextTimer);
        clearTimeout(transitionTimer);
      };
    }
  }, [gamePhase, scale]);

  //퀘스트 등장 시 효과음 재생
  useEffect(() => {
    if (gamePhase === 'selection') {
      audioManager.playQuestStart();
    }
  }, [gamePhase]);

  // failResult 단계에서 경고 메시지 표시
  useEffect(() => {
    if (gamePhase === 'failResult') {
      const timer = setTimeout(() => {
        //오답 효과음
        audioManager.playWrongAnswer();

        setShowWarning(true);
      }, 2000 * Math.max(0.8, scale));

      return () => clearTimeout(timer);
    } else {
      setShowWarning(false);
    }
  }, [gamePhase, scale]);

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

  // 선택지 선택 핸들러
  const handleOptionSelect = (option: 'A' | 'B') => {
    //효과음 재생
    audioManager.playQuestSelect();
    
    setSelectedOption(option);
    
    // API 호출
    const isCorrect = option === 'A';
    const scoreAwarded = isCorrect ? 20 : 10;

    const sessionId = localStorage.getItem('session_id')!;
    const qId = "pothole";
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
        // updateQuestScore("pothole", scoreAwarded);
      })
      .catch((err) => {console.error('❌ 시도 기록 실패', err);});

    const getScaledDuration = (baseDuration: number) => {
      return baseDuration * Math.max(0.8, scale);
    };

    if (option === 'A') {
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
  
  return (
    <div className="w-full h-full">
      {/* 배경 - 동적 스크롤 효과 */}
      <div className="absolute inset-0">
        <div
          className="transition-transform"
          style={{
            transform: startAnimation ? 'translateY(-15%)' : 'translateY(-40%)',
            transitionDuration: `${5000 * Math.max(0.8, scale)}ms`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.6, 1.0)', // ease-out 대신 더 부드러운 커브
            maxWidth: '100%',
            willChange: 'transform',
          }}
        >
          <EnhancedOptimizedImage
            src={drivingRoad}
            alt="주행 배경"
            className="w-full h-auto object-contain"
          />
          
          {/* 포트홀을 배경 이미지의 특정 위치에 미리 배치 */}
          <EnhancedOptimizedImage
            src={smallPothole}
            alt="포트홀"
            className="absolute"
            style={{
              left: '40%',
              top: `calc(30% * ${scale})`, // 배경 이미지 기준 위치
              width: `calc(220px * ${scale})`,
              height: 'auto',
              transform: 'translateX(-50%)',
              zIndex: 5
            }}
          />
        </div>
      </div>
      
      {/* 헤더 영역 */}
      {(gamePhase !== 'fadeOut' && gamePhase !== 'failResult') && (
        <div 
          className="absolute z-10"
          style={{
            top: `calc(16px * ${scale})`,
            right: `calc(16px * ${scale})`
          }}
        >
        </div>
      )}

      {/* 주행 화면 */}
      {gamePhase === 'driving' && (
        <div className="absolute inset-0">
          {/* 오토바이 이미지 - 화면 하단 중앙, 크게 */}
          <div className="absolute bottom-0 w-full flex justify-center">
            <EnhancedOptimizedImage
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

          {/* "주행 시작" 텍스트 */}
          {showStartText && (
            <motion.div 
              className="absolute left-1/2 transform -translate-x-1/2 z-20"
              style={{ 
                top: `calc(20% * ${scale})`
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 * Math.max(0.8, scale) }}
            >
              <GameTitle 
                text="주행 시작" 
                fontSize={`calc(102px * ${scale})`}
                strokeWidth={`calc(14px * ${scale})`}
              />
            </motion.div>
          )}
        </div>
      )}
      
      {/* 선택지 화면 */}
      {gamePhase === 'selection' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#FFF9C4]/60 z-0"></div>
          
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
                  fontSize: `calc(64px * ${scale})`,
                  marginTop: `calc(-4px * ${scale})`
                }}
              >
                구덩이 조심
              </h2>
              <p
                className="text-black text-center font-black leading-relaxed"
                style={{
                  fontSize: `calc(44px * ${scale})`,
                  marginTop: `calc(16px * ${scale})`,
                }}
              >
                앞에 큰 <span style={{ color: '#B91C1C' }}>구덩이</span>가 있어요!<br/>
                구덩이를 지날 때는 핸들 통제가 어려워져요<br/>
                어떻게 운전할까요?
              </p>
            </div>

            {/* 선택지 버튼 */}
            <div
              className="flex justify-between"
              style={{
                width: `calc(815px * ${scale})`,
                gap: `calc(20px * ${scale})`,
                padding: 0
              }}
            >
              <motion.button
                className={`rounded-[20px] font-black text-black transition duration-300 cursor-pointer flex items-center justify-center
                  ${selectedOption === 'A' ? 
                    'bg-[#0DA429] bg-opacity-90 border-[#0DA429] scale-105' : 
                    'bg-[#FFFAFA] bg-opacity-70 border-[#0DA429] hover:bg-opacity-90'}
                `}
                style={{
                  width: `calc(385px * ${scale})`,
                  height: `calc(208px * ${scale})`,
                  fontSize: `calc(2.2rem * ${scale})`,
                  borderWidth: `calc(7px * ${scale})`,
                  transform: selectedOption === 'A' ? `scale(${scaledHoverScale})` : 'scale(1)',
                  boxSizing: 'border-box',
                  lineHeight: 1.4,
                  padding: `calc(12px * ${scale})` // 내부 여백 추가

                }}
                onClick={() => handleOptionSelect('A')}
                disabled={!!selectedOption}
                animate={{ scale: [1, 1.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut",repeatType: "reverse" }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{ color: '#B91C1C' }}>속도를 줄이고</span><br/>
                  구덩이를 피해<br/>
                  조심히 지나간다
                </div>
              </motion.button>
              
              <motion.button
                className={`rounded-[20px] font-black text-black transition duration-300 cursor-pointer flex items-center justify-center
                  ${selectedOption === 'B' ? 
                    'bg-[#0DA429] bg-opacity-90 border-[#0DA429] scale-105' : 
                    'bg-[#FFFAFA] bg-opacity-70 border-[#0DA429] hover:bg-opacity-90'}
                `}
                style={{
                  width: `calc(385px * ${scale})`,
                  height: `calc(208px * ${scale})`,
                  fontSize: `calc(2.2rem * ${scale})`,
                  borderWidth: `calc(7px * ${scale})`,
                  transform: selectedOption === 'B' ? `scale(${scaledHoverScale})` : 'scale(1)',
                  boxSizing: 'border-box',
                  lineHeight: 1.4,
                  padding: `calc(12px * ${scale})` 
                }}
                onClick={() => handleOptionSelect('B')}
                disabled={!!selectedOption}
                animate={{ scale: [1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut",repeatType: "reverse" }}
              >
                <div style={{ textAlign: 'center' }}>
                빨리 지나가면 <br/>덜 흔들릴 것 같아 <br/><span style={{ color: '#B91C1C' }}>속도를 높여 지나간다</span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      )}
      
      {/* 정답 결과 화면 */}
      {gamePhase === 'successResult' && !showSuccessMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">

          {/* 배경 오버레이 */}
          <motion.div
            className="absolute inset-0 bg-[#FFF9C4]/60 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* 성공 원과 캐릭터 */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <motion.img
              src={successCircle} 
              alt="성공 원" 
              className="absolute w-full h-full object-contain"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={hideSuccessImages ? { scale: 0.3, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={hideSuccessImages ? { duration: 0.8, ease: 'easeIn' } : { duration: 1, ease: 'easeOut' }}
            />
            
            <motion.img
              src={characterImages.mission2Success}  
              alt="오토바이 운전하는 캐릭터" 
              className="absolute object-contain z-30"
              style={{
                width: `calc(50% * ${scale})`,
                height: 'auto'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={hideSuccessImages ? { scale: 0.5, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={hideSuccessImages ? { duration: 0.8, ease: 'easeIn' } : { duration: 1, delay: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
          
      {/* 정답 후 성공 메시지 화면 */}
      {gamePhase === 'successResult' && showSuccessMessage && (
        <div className="absolute inset-0">
          {/* 배경 이미지 유지 */}
          <div className="absolute inset-0">
            <div
              className="transition-transform ease-out"
              style={{
                transform: 'translateY(-15%)',
                transitionDuration: `${5000 * Math.max(0.8, scale)}ms`,
                maxWidth: '100%',
                willChange: 'transform',
              }}
            >
              <EnhancedOptimizedImage
                src={drivingRoad}
                alt="주행 배경"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-[#FFF9C4]/60 z-10" />
          
          {/* 메시지 콘텐츠 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
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
                fontSize={`calc(76px * ${scale})`}
                strokeWidth={`calc(12px * ${scale})`}
                color="text-[#0E8E12]"
              />
            </motion.div>
            
            <motion.div 
              className="bg-[#0DA429]/80 bg-opacity-90 border-green-700 border-8 w-[73%] mx-auto text-center relative"
              style={{ 
                marginTop: `calc(240px * ${scale})`,
                paddingTop: `calc(60px * ${scale})`,    // 위쪽 패딩 증가
                paddingBottom: `calc(60px * ${scale})`, // 아래쪽 패딩 증가
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
                style={{ fontSize: `calc(3.5rem * ${scale})` }}
              >
                휴, 속도를 줄인 덕분에<br />
                구덩이를 잘 피했어요
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
              <EnhancedOptimizedImage
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
          <EnhancedOptimizedImage
            src={characterImages.potholeAccident}
            alt="사고 장면"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
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
                  className="text-[#EE404C] font-black"
                  style={{ 
                    fontSize: `calc(4rem * ${scale})`,
                    marginBottom: `calc(16px * ${scale})`
                  }}
                >
                  이륜차가 기우뚱!
                </h2>
                <p 
                  className="font-black text-black"
                  style={{
                    fontSize: `calc(48px * ${scale})`,
                    letterSpacing: "0.05em"
                }}
                >
                  구덩이는 도로 위 함정과 같아요.<br />
                  속도를 줄이고 지나가야 안전해요.
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
                <EnhancedOptimizedImage
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

export default PotholeQuest;