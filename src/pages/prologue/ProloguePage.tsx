// src/pages/prologue/ProloguePage.tsx (간소화된 버전)
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// import { createGuestUser } from '../../services/endpoints/user';
import { createSession } from '../../services/endpoints/session';

import { useScale } from '../../hooks/useScale';
import { useCharacter } from '../../context/CharacterContext';

import { audioManager } from '../../utils/audioManager';

import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

import { simpleImagePreloader } from '../../utils/simpleImagePreloader';
import { stopBgm } from '../../utils/backgroundMusic';

// 이미지 임포트
const scenario1FullMap = '/assets/images/scenario1_full_map.png';
const starCharacter = '/assets/images/star_character.png';
const departButton = '/assets/images/depart_button.png';
const grandchildren = '/assets/images/grandchildren.png';
const homeButton = '/assets/images/home_button.png';
const nextButton = '/assets/images/next_button.png';
const letterEnvelope = '/assets/images/letter_envelope.png';
import BackButton from '../../components/ui/BackButton';
import GameTitle from '../../components/ui/GameTitle';

// 프롤로그 단계 정의 (간소화)
type PrologueStep = 'mission' | 'map' | 'letterMessage' | 'encouragement';

const ProloguePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scale = useScale();
  const [step, setStep] = useState<PrologueStep>('mission');
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const { selectedCharacter } = useCharacter();
  const characterLabel = selectedCharacter === 'grandfather' ? '할아버지' : '할머니';
  
  // URL 쿼리 파라미터에서 시나리오 ID 가져오기
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('scenario');
    setScenarioId(id);
    console.log("id : ", id);

    // map 단계에서 2초 후 메시지 표시
    if (step === 'map') {
      const timer = setTimeout(() => {
        //약도 문구 효과음
        audioManager.playSound('mapGuide', 0.7);
        setShowMessage(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }

    // letterMessage 단계에서 2초 후 encouragement로 자동 전환
    if (step === 'letterMessage') {
      const soundtimer = setTimeout(() => {
        audioManager.playMessageAlarm();
      }, 500);

      const timer = setTimeout(() => {
        setStep('encouragement');
      }, 2000);
      
      return () => {
        clearTimeout(soundtimer);
        clearTimeout(timer);
      }
    }
  }, [location, step]);


  //효과음 & 배경음 stop
  useEffect(() => {
    if (step === 'mission') {
      audioManager.playSound('missionGuide', 0.5);
    } else if (step === 'letterMessage'){
        stopBgm('sparrow_land');
    } else if (step === 'encouragement' && characterLabel === '할아버지') {
        audioManager.playSound('childGrandFather', 0.7);
    } else if (step === 'encouragement' && characterLabel === '할머니'){
      audioManager.playSound('childGrandMother', 0.7);
    }
  },[step]);

  useEffect(() =>{
    // const alreadyHasUser = localStorage.getItem("user_id");
    const alreadyHasSession = localStorage.getItem("session_id");
    const vid = localStorage.getItem("village_id");
    // console.log("(O) user_id : ", alreadyHasUser);
    console.log("(O) session_id : ", alreadyHasSession);
    // 한 번만 생성
    if (!alreadyHasSession) {
      createSession(vid!)
      .then((sessionRes) => {
        const sessionId = sessionRes.data.session_id;
        localStorage.setItem("session_id", sessionId);
        console.log("✅ 세션 생성 완료", { sessionId });
      })
      .catch((err) => {
        console.error("❌ 세션 생성 실패", err);
      });
    }
  }, []);

  // 다음 단계로 이동 핸들러
  const handleNextStep = () => {
    //선택 효과음
    audioManager.playButtonClick();

    if (step === 'mission') {
      setStep('map');
    } else if (step === 'map' && showMessage) {
      setStep('letterMessage');
    }
  };

  // 홈으로 이동 핸들러
  const handleGoHome = () => {
    navigate('/');
  };

  // 주행 준비 페이지로 이동
  const handleDepartClick = () => {
    //기본 알림음
    audioManager.playSound('etcSound', 0.5);

    console.log("ProloguePage - 출발하기 버튼 클릭: 주행 준비 페이지로 이동", { scenarioId });
    navigate(`/driving-prep?scenario=${scenarioId}&nextQuest=1`);
  };

  // 미션 소개 컨텐츠
  const MissionContent = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      <h1 
        style={{ 
          marginBottom: `${52 * scale}px`
        }}
      >
        <GameTitle 
          text="과수원 작업 하는 날" 
          fontSize="64px" 
          strokeWidth="12px"
          letterSpacing="0.05em"
        />
      </h1>
      <div 
        className="relative bg-[#0DA429] bg-opacity-80 border-[#0E8E12]/80 w-4/5 max-w-4xl mx-auto animate-[fadeIn_1200ms_ease-out]"
        style={{
          borderWidth: `calc(8px * ${scale})`,
          paddingTop: `${scale * 72}px`,
          paddingBottom: `${scale * 72}px`,
          borderRadius: `calc(36px * ${scale})`,
          paddingLeft: `calc(32px * ${scale})`,
          paddingRight: `calc(32px * ${scale})`,
          marginBottom: `${60 * scale}px`,

        }}
      >
        <p 
          className="text-center text-white font-black"
          style={{
            fontSize: `${3.0 * scale}rem`,
            letterSpacing: `${0.07 * scale}em`
          }}
        >
          이륜차를 타고 과수원에 갔다가
          <br />
          집으로 안전하게 돌아오세요
        </p>
        
        <EnhancedOptimizedImage
          src={starCharacter}
          alt="별별이 캐릭터" 
          className="absolute animate-[fadeIn_1500ms_ease-out]"
          style={{
            bottom: `calc(-102px * ${scale})`,
            left: `calc(-102px * ${scale})`,
            width: `calc(239px * ${scale})`,
            height: 'auto',
            zIndex: 20
          }}
        />
      </div>
    </div>
  );

  // 맵 + 안내 메시지 컨텐츠
  const MapContent = () => (
    <>
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div 
            className="w-4/5 max-w-4xl mx-auto"
            style={{ maxWidth: `calc(1024px * ${scale})` }}
          >
            <motion.div 
              className="bg-[#FFFAFA] bg-opacity-90 border-[#0E8212] rounded-xl mx-auto text-center"
              style={{
                borderWidth: `calc(10px * ${scale})`,
                borderRadius: `calc(30px * ${scale})`,
                paddingTop: `calc(40px * ${scale})`,
                paddingBottom: `calc(40px * ${scale})`,
                paddingLeft: `calc(24px * ${scale})`,
                paddingRight: `calc(24px * ${scale})`,
                width: `calc(754px * ${scale})`,
              }}
              initial={{ opacity: 0, y: `calc(20px * ${scale})` }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <p 
                  className="text-black font-black"
                  style={{
                    fontSize: `${36 * scale}px`,
                    letterSpacing: `${0.07 * scale}em`
                  }}
                >
                  이륜차 운전 중 여러 상황이 벌어져요!<br />
                  안전 운전에 유의하여 문제를 해결해보아요
                </p>
                <EnhancedOptimizedImage
                  src={starCharacter}
                  alt="별별이 캐릭터" 
                  className="absolute"
                  style={{
                    bottom: `calc(-80px * ${scale})`,
                    left: `calc(-180px * ${scale})`,
                    width: `calc(239px * ${scale})`,
                    height: 'auto',
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );

  // 편지 메시지 컨텐츠
  const LetterMessageContent = () => (
  <div className="absolute inset-0 flex items-center justify-center z-20">
    <div className="flex flex-col items-center justify-center">
      {/* 응원 메시지 타이틀 */}
      <motion.div
        initial={{ opacity: 0, y: `calc(-40px * ${scale})` }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        
        style={{
          marginBottom: `calc(-80px * ${scale})`,
          padding: `calc(20px * ${scale})`,
          borderRadius: `calc(20px * ${scale})`
        }}
      >
        <GameTitle 
          text="응원 메시지가 도착했어요!" 
          fontSize="55px" 
          strokeWidth="12px"
          letterSpacing="0.05em"
        />
      </motion.div>
      
      {/* 편지 봉투 애니메이션 - 중앙 정렬 수정 */}
      <motion.div
        className="flex items-center justify-center"
        style={{
          width: `calc(520px * ${scale})`,
          height: `calc(520px * ${scale})`,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src={letterEnvelope}
          alt="편지 봉투"
          className="object-contain"
          style={{
            width: `calc(720px * ${scale})`,
            height: 'auto'
          }}
          initial={{ rotate: -5 }}
          animate={{ 
            scale: [1, 1.1, 0.9, 1], 
            rotate: [-5, 5, -2, 0],
            y: [0, `calc(-10px * ${scale})`, `calc(5px * ${scale})`, 0]
          }}
          transition={{ 
            duration: 2,
            times: [0, 0.3, 0.6, 1],
            ease: "easeOut",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 1
          }}
        />
      </motion.div>
    </div>
  </div>
);

  // 격려 메시지 컨텐츠
  const EncouragementContent = () => (
    <div className="absolute inset-0 flex flex-col justify-between z-20" 
        style={{ paddingTop: `calc(120px * ${scale})`, paddingBottom: `calc(100px * ${scale})` }}>
      {/* 컨텐츠 영역 - 중앙 정렬 */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div 
          className="relative w-4/5"
          style={{ maxWidth: `calc(1024px * ${scale})` }}
          initial={{ opacity: 0, y: `calc(20px * ${scale})` }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <EnhancedOptimizedImage
            src={grandchildren} 
            alt="손자손녀" 
            className="absolute left-1/2 transform -translate-x-1/2 z-20"
            style={{
              top: `calc(-170px * ${scale})`,
              width: `calc(380px * ${scale})`,
              height: 'auto'
            }}
          />
          
          <div 
            className="bg-[#FFFAFA] bg-opacity-90 border-[#0E8212]/80 rounded-xl w-full text-center"
            style={{
              borderWidth: `calc(12px * ${scale})`,
              borderRadius: `calc(52px * ${scale})`,
              padding: `calc(48px * ${scale})`,
              paddingTop: `calc(80px * ${scale})`,
            }}
          >
            <p 
              className="font-black text-black"
              style={{ fontSize: `${48 * scale}px` }}
            >
              무엇보다 {characterLabel}가 제일 소중해요!<br />
              조심히 다녀오세요!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // NavigationButtons 컴포넌트 내부 수정
  const NavigationButtons = () => {
    const handleBackToCharacterSelect = () => {
      navigate(`/character-select?scenario=${scenarioId}`);
    };

    return (
      <>
        {(step === 'mission' || 
  (step === 'map' && showMessage)) && (
          <div 
            className="absolute left-0 right-0 flex justify-center items-center z-50"
            style={{ 
              bottom: `calc(48px * ${scale})`
            }}
          >
            <EnhancedOptimizedImage
              src={nextButton}
              alt="다음"
              onClick={handleNextStep}
              className="h-auto cursor-pointer hover:scale-105 transition-transform"
              style={{ 
                width: `calc(192px * ${scale})`
              }}
            />
          </div>
        )}

        {/* encouragement 단계 전용 버튼 */}
        {step === 'encouragement' && (
          <div 
            className="absolute left-0 right-0 flex justify-center items-center z-50"
            style={{ 
              bottom: `calc(-32px * ${scale})`
            }}
          >
            <EnhancedOptimizedImage
              src={departButton}
              alt="출발하기"
              onClick={handleDepartClick}
              className="h-auto cursor-pointer hover:scale-105 transition-transform"
              style={{ 
                width: `calc(320px * ${scale})`,
                minHeight: `calc(48px * ${scale})`
              }}
              onLoad={() => {
                console.log('[ProloguePage] 출발하기 버튼 이미지 로딩 완료');
              }}
              onError={(error) => {
                console.error('[ProloguePage] 출발하기 버튼 이미지 로딩 실패:', error);
              }}
            />
          </div>
        )}
        
        {/* encouragement 단계에서만 홈 버튼 표시 */}
        {step === 'encouragement' && (
          <EnhancedOptimizedImage
            src={homeButton}
            alt="홈으로"
            onClick={handleGoHome}
            className="absolute cursor-pointer hover:scale-105 transition-transform"
            style={{ 
              top: `calc(48px * ${scale})`,
              right: `calc(48px * ${scale})`,
              width: `calc(120px * ${scale})`,
              height: 'auto',
              zIndex: 60
            }}
          />
        )}
        
        {/* encouragement 단계에서만 홈 버튼 표시 */}
        {step === 'encouragement' && (
          <EnhancedOptimizedImage
            src={homeButton}
            alt="홈으로"
            onClick={handleGoHome}
            className="absolute cursor-pointer hover:scale-105 transition-transform"
            style={{ 
              top: `calc(48px * ${scale})`,
              right: `calc(48px * ${scale})`,
              width: `calc(120px * ${scale})`,
              height: 'auto',
              zIndex: 60
            }}
          />
        )}
      </>
    );
  };

  return (
    <div className="relative w-full h-full">
      <NavigationButtons />
      
      {/* 배경 이미지 */}
      <div className="absolute inset-0">
          {step === 'mission' ? (
            <EnhancedOptimizedImage
              src="/assets/images/background.png"
              alt="미션 배경"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          ) : (
            <motion.img 
              src={scenario1FullMap} 
              alt="경로 지도" 
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          )}
        </div>
      
      {/* 노란색 오버레이 - map에서 메시지 표시 시와 encouragement에서만 */}
      {((step === 'map' && showMessage) || step === 'letterMessage' || step === 'encouragement') && (
        <motion.div 
          className="absolute inset-0 bg-[#FFF9C4]/60 z-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
      )}
      
      {/* 단계별 컨텐츠 */}
      {step === 'mission' && <MissionContent />}
      {step === 'map' && <MapContent />}
      {step === 'letterMessage' && <LetterMessageContent />}
      {step === 'encouragement' && <EncouragementContent />}
    
      
      {/* 추가: 디버깅용 현재 단계 표시
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded z-[100]">
          Current Step: {step}
          {step === 'encouragement' && <div>출발하기 버튼이 표시되어야 함</div>}
        </div>
      )} */}
    </div>
  );
};

export default ProloguePage;