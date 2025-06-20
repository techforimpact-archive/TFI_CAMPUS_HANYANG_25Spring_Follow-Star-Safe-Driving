// Front/src/pages/quest/ReturnQuest.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameTitle from '../../components/ui/GameTitle';
import { useScale } from '../../hooks/useScale';
import { postQuestAttempt, AttemptPayload } from '../../services/endpoints/attempts';
import { useCharacter } from '../../context/CharacterContext';
import { audioManager } from '../../utils/audioManager';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';
import { initBgm, playBgm, stopBgm, unloadBgm } from '../../utils/backgroundMusic';

// 이미지 임포트
const homecomingTimeSettingBackground = '/assets/images/homecoming_time_setting_tree_road.png';
const homecomingTimeClocks = '/assets/images/homecoming_time_clocks.png';
const dragButton = '/assets/images/drag_button.png';
const sunsetSceneMountain = '/assets/images/sunset_scene_mountain.png';
const sunsetSceneSun = '/assets/images/sunset_scene_sun.png';
const blurredVision = '/assets/images/blurred_vision.png';
const goraniFlash = '/assets/images/gorani_flash.png';
const goraniFace = '/assets/images/gorani_face.png';
const dangerWarning = '/assets/images/danger_warning.png';
const successCircle = '/assets/images/success_circle.png';
const starCharacter = '/assets/images/star_character.png';
const nextButton = '/assets/images/next_button.png';
const confirmButton = '/assets/images/confirm_button.png';

// 게임 단계 정의
type GamePhase = 
  | 'sunsetAnimation'
  | 'gameIntro'
  | 'gamePlay'
  | 'successResult'
  | 'successMessage'
  | 'failSequence1'
  | 'failSequence2'
  | 'failSequence3'
  | 'failSequence4'
  | 'failResult'
  | 'score';

// 시간별 배경색 정의
const getBackgroundColor = (hour: number): string => {
    switch(hour) {
      case 5: return 'linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 50%, #FFF8DC 100%)';
      case 6: return 'linear-gradient(to bottom, #FFE4B5 0%, #FFA07A 40%, #FF8C69 100%)';
      case 7: return 'linear-gradient(to bottom, #FF8C69 0%, #FF6347 40%, #CD5C5C 100%)';
      case 8: return 'linear-gradient(to bottom, #4B0082 0%, #2F4F4F 40%, #000080 100%)';
      case 9: return 'linear-gradient(to bottom, #191970 0%, #000000 50%, #0D0D0D 100%)';
      default: return '#000000';
    }
  };

const ReturnQuest = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const clocksRef = useRef<HTMLDivElement>(null);
  const dragButtonRef = useRef<HTMLImageElement>(null);
  
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [questId, setQuestId] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('sunsetAnimation');
  const [selectedHour, setSelectedHour] = useState(7);
  const [showSun, setShowSun] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hideSuccessImages, setHideSuccessImages] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  // 드래그 관련 상태 - 비율 기반으로 변경
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartRatio, setDragStartRatio] = useState(0);
  const [dragButtonRatio, setDragButtonRatio] = useState(0.5); // 0~1 비율
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentExactHour, setCurrentExactHour] = useState(7);

  const scale = useScale();
  const { characterImages } = useCharacter();

  // URL 쿼리 파라미터 처리
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sId = searchParams.get('scenario');
    const qId = searchParams.get('quest');
    setScenarioId(sId);
    setQuestId(qId || '5');
  }, [location]);

   // 1) 마운트 시 단 한 번 BGM 초기화, 언마운트 시 해제
  //
  useEffect(() => {
    (async () => {
      await initBgm('del_rio_bravo');
      //console.log('init del_rio_bravo bgm');
      if (gamePhase === 'sunsetAnimation') {
        playBgm('del_rio_bravo');
        //console.log('play del_rio_bravo on mount');
      }
    })();

    return () => {
      unloadBgm('del_rio_bravo');
      //console.log('unload del_rio_bravo bgm on unmount');
    };
  }, []);

  //
  // 2) gamePhase 변화에 따른 play/stop
  //
  useEffect(() => {
    if (gamePhase === 'failSequence1'  || gamePhase === 'successResult' ) {
      stopBgm('del_rio_bravo');
      //console.log('stop del_rio_bravo on phase:', gamePhase);
    }
  }, [gamePhase]);

  // 시간을 비율로 변환 (5시=0, 9시=1)
  const hourToRatio = useCallback((hour: number): number => {
    return Math.max(0, Math.min(1, (hour - 5) / 4));
  }, []);

  // 비율을 시간으로 변환 (0=5시, 1=9시)
  const ratioToHour = useCallback((ratio: number): number => {
    return 5 + (ratio * 4);
  }, []);

  // 드래그 버튼 위치 업데이트 함수 - 비율 기반
  const updateDragButtonPosition = useCallback((hour: number) => {
    const ratio = hourToRatio(hour);
    setDragButtonRatio(ratio);
    setCurrentExactHour(hour);
  }, [hourToRatio]);

  // 초기 위치 설정
  useEffect(() => {
    if (gamePhase === 'gamePlay') {
      updateDragButtonPosition(selectedHour);
    }
  }, [gamePhase, selectedHour, updateDragButtonPosition]);

  // 클릭 위치를 비율로 변환
  const getClickRatio = useCallback((clientX: number): number => {
    if (!clocksRef.current) return 0.5;
    
    const rect = clocksRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const ratio = relativeX / rect.width;
    
    // 사이드 마진 고려 (10% 여백)
    const sideMarginRatio = 0.1;
    const adjustedRatio = (ratio - sideMarginRatio) / (1 - sideMarginRatio * 2);
    
    return Math.max(0, Math.min(1, adjustedRatio));
  }, []);

  // 시간별 배경색을 부드럽게 보간하는 함수
  const getInterpolatedBackgroundColor = (exactHour: number): string => {
    const hour = Math.floor(exactHour);
    const fraction = exactHour - hour;
    
    if (exactHour <= 5) return getBackgroundColor(5);
    if (exactHour >= 9) return getBackgroundColor(9);
    
    if (fraction === 0) return getBackgroundColor(hour);
    
    const currentColors = getHourColors(hour);
    const nextColors = getHourColors(hour + 1);
    
    const interpolatedColors = currentColors.map((color, index) => 
      interpolateColor(color, nextColors[index], fraction)
    );
    
    return `linear-gradient(to bottom, ${interpolatedColors[0]} 0%, ${interpolatedColors[1]} 40%, ${interpolatedColors[2]} 100%)`;
  };

  const getHourColors = (hour: number): string[] => {
    const colorMap: { [key: number]: string[] } = {
      5: ['#87CEEB', '#B0E0E6', '#FFF8DC'],
      6: ['#FFE4B5', '#FFA07A', '#FF8C69'],
      7: ['#FF8C69', '#FF6347', '#CD5C5C'],
      8: ['#4B0082', '#2F4F4F', '#000080'],
      9: ['#191970', '#000000', '#0D0D0D']
    };
    return colorMap[hour] || colorMap[7];
  };

  // 색상 보간 함수
  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // 클릭 핸들러 - 비율 기반
  const handleClockClick = useCallback((e: React.MouseEvent) => {
    if (isDragging || isAnimating) return;
    
    const clickRatio = getClickRatio(e.clientX);
    const targetHour = Math.round(ratioToHour(clickRatio));
    
    setIsAnimating(true);
    setSelectedHour(targetHour);
    setCurrentExactHour(targetHour);
    
    setTimeout(() => {
      updateDragButtonPosition(targetHour);
      setTimeout(() => setIsAnimating(false), 300 * Math.max(0.8, scale));
    }, 50 * Math.max(0.8, scale));
  }, [isDragging, isAnimating, getClickRatio, ratioToHour, updateDragButtonPosition, scale]);

  // 드래그 시작 핸들러
  const handleDragStart = useCallback((clientX: number) => {
    if (isAnimating) return;
    
    const clickRatio = getClickRatio(clientX);
    
    setIsDragging(true);
    setDragStartRatio(clickRatio - dragButtonRatio);
  }, [dragButtonRatio, isAnimating, getClickRatio]);

  // 드래그 중 핸들러
  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    
    const currentRatio = getClickRatio(clientX);
    const newButtonRatio = currentRatio - dragStartRatio;
    
    // 범위 제한
    const clampedRatio = Math.max(0, Math.min(1, newButtonRatio));
    
    setDragButtonRatio(clampedRatio);
    
    const exactHour = ratioToHour(clampedRatio);
    setCurrentExactHour(exactHour);
    
    const roundedHour = Math.round(exactHour);
    if (roundedHour !== selectedHour && Math.abs(exactHour - roundedHour) < 0.3) {
      setSelectedHour(roundedHour);
    }
  }, [isDragging, dragStartRatio, selectedHour, getClickRatio, ratioToHour]);

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setIsAnimating(true);
    
    const exactHour = ratioToHour(dragButtonRatio);
    const targetHour = Math.round(exactHour);
    
    setSelectedHour(targetHour);
    setCurrentExactHour(targetHour);
    
    setTimeout(() => {
      updateDragButtonPosition(targetHour);
      setTimeout(() => setIsAnimating(false), 300 * Math.max(0.8, scale));
    }, 50 * Math.max(0.8, scale));
  }, [isDragging, dragButtonRatio, ratioToHour, updateDragButtonPosition, scale]);

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    //드래그 클릭 효과음
    audioManager.playSound('barClick',0.5);

    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX);
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    //드래그 클릭 효과음
    audioManager.playSound('barClick',0.5);
    handleDragEnd();
  }, [handleDragEnd]);

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    //드래그 클릭 효과음
    audioManager.playSound('barClick',0.5);

    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleDragMove(touch.clientX);
    }
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    //드래그 클릭 효과음
    audioManager.playSound('barClick',0.5);
    handleDragEnd();
  }, [handleDragEnd]);

  // 글로벌 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // 단계별 자동 진행
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    const getScaledDuration = (baseDuration: number) => {
      return baseDuration * Math.max(0.8, scale);
    };
    
    if (gamePhase === 'sunsetAnimation') {
      timer = setTimeout(() => {
        setShowSun(true);
      }, getScaledDuration(100));
      
      const titleTimer = setTimeout(() => {
        //장면 전환 효과음(해가 지고 있어요)
        audioManager.playsceneSwitch()
        setShowTitle(true);
      }, getScaledDuration(4000));
      
      const nextTimer = setTimeout(() => {
        //퀘스트 등장 효과음
        audioManager.playQuestStart();
        setGamePhase('gameIntro');
      }, getScaledDuration(6000));
      
      return () => {
        if (timer) clearTimeout(timer);
        clearTimeout(titleTimer);
        clearTimeout(nextTimer);
      };
    }
    else if (gamePhase === 'successResult') {
      //정답 효과음
      audioManager.playRightAnswer1();
      timer = setTimeout(() => {
        setHideSuccessImages(true);

        const messageTimer = setTimeout(() => {
          audioManager.playRightAnswer2();
          setShowSuccessMessage(true);
        }, getScaledDuration(1000));

        return () => clearTimeout(messageTimer);
      }, getScaledDuration(3000));
    }
    else if (gamePhase === 'failSequence1') {
      //사고 전 긴장 효과음
      audioManager.playSound('accidentBefore', 1.0);

      timer = setTimeout(() => {
        setGamePhase('failSequence2');
      }, getScaledDuration(2000));
    }
    else if (gamePhase === 'failSequence2') {
      timer = setTimeout(() => {
        setGamePhase('failSequence3');
      }, getScaledDuration(2000));
    }
    else if (gamePhase === 'failSequence3') {
      //고라니 울음 소리
      audioManager.playSound('accidentGorani', 1.0);

      timer = setTimeout(() => {
        setGamePhase('failSequence4');
      }, getScaledDuration(2000));
    }
    else if (gamePhase === 'failSequence4') {
      timer = setTimeout(() => {
        audioManager.stopSound('accidentGorani');
        setGamePhase('failResult');
      }, getScaledDuration(2000));
    }
    else if (gamePhase === 'failResult') {
      timer = setTimeout(() => {
        //오답 효과음
        audioManager.playWrongAnswer();
        setShowWarning(true);
      }, getScaledDuration(2000));
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gamePhase, scale]);

  // 확인 버튼 클릭 핸들러
  const handleConfirmClick = () => {
    //선택 버튼 효과음
    audioManager.playButtonClick();

    if (gamePhase === 'successResult' && showSuccessMessage) {
      const sessionId = localStorage.getItem('session_id')!;
      const payload: AttemptPayload = {
        attempt_number: 1,
        score_awarded: 20,
        selected_option: selectedHour.toString(),
        is_correct: true,
        response_time: 0,
      };

      postQuestAttempt(sessionId, "Return", payload)
        .then((res) => {
          console.log("✅ 시도 기록 완료:", res.data.attempt_id);
        })
        .catch(err => console.error("❌ 시도 기록 실패", err));

      navigate(`/score?scenario=${scenarioId}&quest=${questId}&score=20&correct=true`);
    } else if (gamePhase === 'failResult' && showWarning) {
      const sessionId = localStorage.getItem('session_id')!;
      const payload: AttemptPayload = {
        attempt_number: 1,
        score_awarded: 10,
        selected_option: selectedHour.toString(),
        is_correct: false,
        response_time: 0,
      };

      postQuestAttempt(sessionId, "Return", payload)
        .then((res) => {
          console.log('✅ 시도 기록 완료:', res.data.attempt_id);
        })
        .catch((err) => {console.error('❌ 시도 기록 실패', err);});

      navigate(`/score?scenario=${scenarioId}&quest=${questId}&score=10&correct=false`);
    }
  };

  // 게임 시작 핸들러
  const handleStartGame = () => {
    //퀘스트 선택 효과음
    audioManager.playQuestSelect();

    if (selectedHour >= 5 && selectedHour <= 7) {
      setGamePhase('successResult');
    } else {
      setGamePhase('failSequence1');
    }
  };

  // 다음 단계로 이동 핸들러
  const handleNextPhase = () => {
    //다음 버튼 효과음
    audioManager.playButtonClick();

    if (gamePhase === 'gameIntro') {
      setGamePhase('gamePlay');
    }
  };

  // 드래그 버튼의 실제 픽셀 위치 계산
  const getDragButtonPixelPosition = useCallback(() => {
    if (!clocksRef.current) return 0;
    
    const rect = clocksRef.current.getBoundingClientRect();
    const sideMarginRatio = 0.1;
    
    // 비율을 실제 픽셀 위치로 변환
    const usableWidth = rect.width * (1 - sideMarginRatio * 2);
    const leftMargin = rect.width * sideMarginRatio;
    
    return leftMargin + (usableWidth * dragButtonRatio);
  }, [dragButtonRatio]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 동적 배경색 */}
      <div 
        className="absolute inset-0 transition-all ease-out"
        style={{ 
          background: gamePhase === 'gamePlay' ? getInterpolatedBackgroundColor(currentExactHour) : 
                    gamePhase === 'successResult' ? getBackgroundColor(selectedHour) :
                    (gamePhase === 'failSequence1' || gamePhase === 'failSequence2' || 
                      gamePhase === 'failSequence3' || gamePhase === 'failSequence4') ? '#000000' :
                    gamePhase === 'failResult' ? '#000000' :
                    'linear-gradient(to bottom, #FFE4B5 0%, #FFA07A 100%)',
          transitionDuration: `${200 * Math.max(0.8, scale)}ms`
        }}
      />

      {/* 해가 지는 애니메이션 */}
      {gamePhase === 'sunsetAnimation' && (
        <div className="absolute inset-0">
          <EnhancedOptimizedImage
            src={sunsetSceneMountain}
            alt="산"
            className="absolute bottom-0 w-full h-auto z-10"
            style={{ objectFit: 'cover', objectPosition: 'bottom' }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <motion.img
              src={sunsetSceneSun}
              alt="해"
              style={{
                width: `calc(700px * ${scale})`,
                height: `calc(612px * ${scale})`
              }}
              initial={{ 
                x: `calc(400px * ${scale})`,
                y: `calc(-100px * ${scale})`
              }}
              animate={showSun ? { 
                x: 0,
                y: `calc(80px * ${scale})`
              } : {}}
              transition={{ 
                duration: 3 * Math.max(0.8, scale), 
                ease: 'easeOut' 
              }}
            />
          </div>
          
          {showTitle && (
            <motion.div 
              className="absolute left-0 right-0 flex justify-center items-center z-20"
              style={{ top: `calc(80px * ${scale})` }}
              initial={{ opacity: 0, y: `calc(20px * ${scale})` }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 1 * Math.max(0.8, scale), 
                ease: 'easeOut' 
              }}
            >
              <GameTitle 
                text="해가 지고 있어요" 
                fontSize={`calc(5.2rem * ${scale})`} 
                strokeWidth={`calc(12px * ${scale})`} 
              />
            </motion.div>
          )}
        </div>
      )}

      {/* 게임 안내 화면 */}
      {gamePhase === 'gameIntro' && (
        <div className="absolute inset-0">
          <EnhancedOptimizedImage
            src={sunsetSceneMountain}
            alt="산"
            className="absolute bottom-0 w-full h-auto z-10"
            style={{ objectFit: 'cover', objectPosition: 'bottom' }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <EnhancedOptimizedImage
              src={sunsetSceneSun}
              alt="해"
              style={{
                width: `calc(700px * ${scale})`,
                height: `calc(612px * ${scale})`,
                transform: `translate(0px, ${80 * scale}px)`
              }}
            />
          </div>
          
          <motion.div 
            className="absolute inset-0 bg-[#FFF9C4]/60 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 * Math.max(0.8, scale) }}
          />
          
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center z-30"
            initial={{ opacity: 0, y: `calc(20px * ${scale})` }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 * Math.max(0.8, scale), delay: 0.3 }}
          >
            <div className="relative w-4/5 max-w-4xl">
              <div 
                className="flex justify-center items-center"
                style={{ marginBottom: `calc(32px * ${scale})` }}
              >
                <GameTitle 
                  text="귀가 시간 정하기" 
                  fontSize={`${64 * scale}px`} 
                  strokeWidth={`calc(10px * ${scale})`} 
                />
              </div>
              
              <div 
                className="bg-[#FFFAFA]/75 rounded-xl text-center"
                style={{ 
                  padding: `calc(40px * ${scale})`,
                  marginBottom: `calc(64px * ${scale})`,
                  border: `10px solid #0DA429`,
                  borderRadius: `calc(52px * ${scale})`
                }}
              >
                <p 
                  className="font-black text-black"
                  style={{ fontSize: `${52 * scale}px` }}
                >
                  해가 지기 시작해요<br/>
                  <span className="text-red-600">언제쯤</span><br/>
                  작업을 마치고 집으로 출발할까요?
                </p>
              </div>
            </div>
          </motion.div>
          
          <div 
            className="absolute left-0 right-0 flex justify-center z-50"
            style={{ bottom: `calc(32px * ${scale})` }}
          >
            <EnhancedOptimizedImage
              src={nextButton}
              alt="다음"
              onClick={handleNextPhase}
              style={{
                width: `calc(200px * ${scale})`,
                height: 'auto'
              }}
              className="cursor-pointer hover:scale-105 transition-transform"
            />
          </div>
        </div>
      )}

      {/* 게임 플레이 화면 */}
      {gamePhase === 'gamePlay' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <EnhancedOptimizedImage
            src={homecomingTimeSettingBackground}
            alt="귀가시간 설정 배경"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          <div 
            className="flex justify-center z-20"
            style={{ marginTop: `calc(80px * ${scale})` }}
          >
            <motion.button
              onClick={handleStartGame}
              disabled={isDragging || isAnimating}
              className="bg-[#0DA429] hover:bg-green-700 text-white font-black border-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-colors duration-300"
              style={{
                fontSize: `calc(48px * ${scale})`,
                paddingTop: `calc(8px * ${scale})`,
                paddingBottom: `calc(8px * ${scale})`,
                paddingLeft: `calc(24px * ${scale})`,
                paddingRight: `calc(24px * ${scale})`,
                letterSpacing: "0.05em",
                borderWidth: `calc(6px * ${scale})`,
                borderRadius: `calc(24px * ${scale})`
              }}
              animate={{ scale: [1, 1.05] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut",repeatType: "reverse" }}
            >
              오후 {selectedHour}시 귀가
            </motion.button>
          </div>
          
          {/* 시계 드래그 영역 */}
          <div className="absolute bottom-2 left-0 right-0 w-full z-10">
            <div 
              ref={clocksRef}
              className="relative w-full"
            >
              <EnhancedOptimizedImage
                src={homecomingTimeClocks}
                alt="시계들"
                className="w-full h-auto object-cover pointer-events-none"
                style={{ aspectRatio: '976/215' }}
              />
              
              {/* 클릭/드래그 영역 */}
              <div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{ zIndex: 25 }}
                onMouseDown={(e) => {
                  if (!clocksRef.current || !dragButtonRef.current) return;
                  
                  const clickRatio = getClickRatio(e.clientX);
                  const buttonRatio = dragButtonRatio;
                  const tolerance = 0.1; // 버튼 주변 10% 영역
                  
                  if (Math.abs(clickRatio - buttonRatio) < tolerance) {
                    handleMouseDown(e);
                  } else {
                    handleClockClick(e);
                  }
                }}
                onTouchStart={(e) => {
                  if (!clocksRef.current || !dragButtonRef.current) return;
                  
                  const touch = e.touches[0];
                  const touchRatio = getClickRatio(touch.clientX);
                  const buttonRatio = dragButtonRatio;
                  const tolerance = 0.1;
                  
                  if (Math.abs(touchRatio - buttonRatio) < tolerance) {
                    handleTouchStart(e);
                  } else {
                    const syntheticEvent = {
                      clientX: touch.clientX,
                      preventDefault: () => {},
                    } as React.MouseEvent;
                    handleClockClick(syntheticEvent);
                  }
                }}
              />
              
              {/* 드래그 버튼 - 비율 기반 위치 */}
              <img
                ref={dragButtonRef}
                src={dragButton}
                alt="드래그 버튼"
                className={`absolute transition-all select-none pointer-events-none
                  ${isDragging ? 'scale-110 drop-shadow-lg' : 'hover:scale-105'}
                  ${isAnimating && !isDragging ? 'transition-all duration-300 ease-out' : ''}
                  ${isDragging ? 'transition-none' : ''}`}
                style={{
                  width: `calc(81px * ${scale})`,
                  height: `calc(108px * ${scale})`,
                  left: `${(dragButtonRatio * 80 + 10)}%`, // 10% 좌측 여백, 80% 사용 영역
                  top: '48%',
                  transform: 'translateX(-50%)',
                  filter: isDragging ? 'brightness(1.1)' : 'none',
                }}
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* 정답 결과 화면 */}
      {gamePhase === 'successResult' && !showSuccessMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <EnhancedOptimizedImage
            src={homecomingTimeSettingBackground}
            alt="배경"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <motion.div
            className="absolute inset-0 bg-[#FFF9C4]/60 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          
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
              src={characterImages.mission5Success}
              alt="성공한 캐릭터"
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

      {gamePhase === 'successResult' && showSuccessMessage && (
        <div className="absolute inset-0">
          <EnhancedOptimizedImage
            src={homecomingTimeSettingBackground}
            alt="배경"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-[#FFF9C4]/60 z-10" />
          
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
                fontSize={`calc(4rem * ${scale})`}
                strokeWidth={`calc(12px * ${scale})`}
                color="text-[#0E8E12]"
              />
            </motion.div>
            
            <motion.div 
              className="bg-[#0DA429]/50 bg-opacity-70 border-[#0E8E12] w-[75%] mx-auto text-center relative"
              style={{ 
                padding: `calc(48px * ${scale})`,
                marginTop: `calc(25% * ${scale})`,
                marginBottom: `calc(32px * ${scale})`,
                borderWidth: `calc(12px * ${scale})`,
                borderRadius: `calc(52px * ${scale})`
              }}
              initial={{ opacity: 0, scale: 0.8, y: `calc(30px * ${scale})` }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            >
              <p 
                className="font-black text-white leading-relaxed"
                style={{ fontSize: `calc(60px * ${scale})` }}
              >
                해가 지기 전이<br/>
                집 가기 딱 좋은 시간이에요
              </p>
              
              <motion.img
                src={starCharacter}
                alt="별별이"
                className="absolute z-40"
                style={{
                  bottom: `calc(-100px * ${scale})`,
                  left: `calc(-120px * ${scale})`,
                  width: `calc(246px * ${scale})`
                }}
                initial={{ opacity: 0, x: `calc(-30px * ${scale})`, y: `calc(10px * ${scale})` }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              />
            </motion.div>

            <motion.button
              onClick={handleConfirmClick}
              className="cursor-pointer hover:scale-105 transition-transform duration-200 border-0 outline-none bg-transparent p-0"
              style={{
                marginTop: `calc(40px * ${scale})`,
                width: `calc(200px * ${scale})`,
                height: 'auto',
                marginBottom: `calc(20px * ${scale})`
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
          </div>
        </div>
      )}

      {/* 오답 시퀀스들 */}
      {gamePhase === 'failSequence1' && (
        <motion.img
          src={characterImages.missionFailEveningDriving}
          alt="야간 운전"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {gamePhase === 'failSequence2' && (
        <motion.img
          src={blurredVision}
          alt="시야 흐림"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {gamePhase === 'failSequence3' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black z-0" />
          
          <motion.img
            src={goraniFlash}
            alt="플래시"
            className="absolute inset-0 w-full h-full object-cover z-10"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0, 1, 0, 1] 
            }}
            transition={{
              duration: 1.2 * Math.max(0.8, scale),
              times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 1],
              ease: "linear"
            }}
          />
          
          <motion.img
            src={goraniFace}
            alt="고라니"
            className="absolute bottom-0 right-0 z-5"
            style={{ 
              width: `calc(700px * ${scale})`, 
              height: `calc(700px * ${scale})` 
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.1 * Math.max(0.8, scale), 
              delay: 0.6 * Math.max(0.8, scale)
            }}
          />
        </div>
      )}

      {gamePhase === 'failSequence4' && (
        <motion.img
          src={characterImages.mission5Fail}
          alt="사고"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {gamePhase === 'failResult' && (
        <div className="absolute inset-0">
          <EnhancedOptimizedImage
            src={characterImages.mission5Fail}
            alt="사고 배경"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {showWarning && (
            <motion.div
              className="absolute inset-0 bg-[#FFF9C4]/60 flex flex-col items-center justify-end z-10"
              style={{ paddingBottom: `calc(40px * ${scale})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.img
                src={dangerWarning}
                alt="위험 경고"
                style={{
                  width: `calc(16% * ${scale})`,
                  marginBottom: `calc(16px * ${scale})`
                }}
                initial={{ y: `calc(-20px * ${scale})`, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              
              <motion.div
                className="w-[80%] bg-white bg-opacity-90 border-[#EE404C] text-center"
                style={{
                  padding: `calc(32px * ${scale})`,
                  borderWidth: `calc(12px * ${scale})`,
                  borderRadius: `calc(36px * ${scale})`
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h2
                  className="text-[#EE404C] font-black"
                  style={{ 
                    fontSize: `calc(4rem * ${scale})`,
                    marginBottom: `calc(16px * ${scale})`
                  }}
                >
                  야생 동물과 부딪혀요!
                </h2>
                <p 
                  className="font-black text-black"
                  style={{
                    fontSize: `calc(48px * ${scale})`,
                    letterSpacing: "0.05em"
                }}
                >
                  야간 주행 시 시야 확보가 어려워요<br/>
                  해가 지기 전에 집으로 돌아가요
                </p>
              </motion.div>

              <motion.button
                onClick={handleConfirmClick}
                className="cursor-pointer hover:scale-105 transition-transform duration-200 border-0 outline-none bg-transparent p-0"
                style={{
                  marginTop: `calc(40px * ${scale})`,
                  width: `calc(200px * ${scale})`,
                  height: 'auto',
                  marginBottom: `calc(20px * ${scale})`
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

export default ReturnQuest;