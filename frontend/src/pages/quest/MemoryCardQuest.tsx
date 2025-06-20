// Front/src/page/quest/MemoryCardQuest.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackButton from '../../components/ui/BackButton';
import { postQuestAttempt, AttemptPayload } from "../../services/endpoints/attempts";
import GameTitle from '../../components/ui/GameTitle';
import { useScale } from '../../hooks/useScale';
// import { useScore } from '../../context/ScoreContext';
import { useCharacter } from '../../context/CharacterContext';
import { audioManager } from '../../utils/audioManager';
import { initBgm, playBgm, stopBgm, unloadBgm } from '../../utils/backgroundMusic';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

// 이미지 임포트
const gameBackground = '/assets/images/pre_drive_background.png';
const gameCharacter = '/assets/images/game_character.png';
const helmetCard = '/assets/images/helmet_card.png';
const strawHatCard = '/assets/images/straw_hat_card.png';
const capHatCard = '/assets/images/cap_hat_card.png';
const cardBack = '/assets/images/card_back.png';
const grandfatherWithHelmet = '/assets/images/grandfather_with_helmet.png';
const giftBox = '/assets/images/gift.png';
const giftOpenHelmet = '/assets/images/gift_open.png';
const grandchildren = '/assets/images/grandchildren.png';
const helmet = '/assets/images/helmet.png';
const nextButton = '/assets/images/next_button.png';
const confirmButton = '/assets/images/confirm_button.png'

const giftBoxVariants = {
  hidden:   { scale: 0.5, rotate: -30, opacity: 0 },
  visible:  {
    scale: [1, 1.2, 0.9, 1],
    rotate: [-15, 15, -5, 0],
    opacity: 1,
    transition: {
      duration: 1,
      times: [0, 0.3, 0.6, 1],
      ease: ["easeOut", "easeIn", "easeOut"]
    }
  }
}

const openBoxVariants = {
  hidden:  { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      duration: 0.8
    }
  }
}

const helmetVariants = {
  hidden:  { y: 30, opacity: 0, scale: 0.5, rotate: -10 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 15,
      delay: 0.3,
    }
  }
}

// 카드 타입 정의
interface Card {
  id: number;
  type: 'helmet' | 'straw-hat' | 'cap';
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// 게임 단계 정의
type GamePhase =
  | 'intro1'
  | 'intro2'
  | 'intro3'
  | 'showCards'
  | 'game'
  | 'wrongPairFeedback'
  | 'wrongMatchFeedback'
  | 'tooManyAttempts'
  | 'showAnswer'
  | 'foundMatch'
  | 'showGift'
  | 'openGift'
  | 'helmetEquipped'
  | 'reshowCards'          // 새로 추가
  | 'showRemainingTries';  // 새로 추가

const MemoryCardQuest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // state
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [questId, setQuestId] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [initialCardOrder, setInitialCardOrder] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro1');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [giftAnimationStage, setGiftAnimationStage] = useState(0);
  const [finalScore, setFinalScore] = useState(20);
  const [showMessage, setShowMessage] = useState(false);
  const [showHintTitle, setShowHintTitle] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldShowHintMessage, setShouldShowHintMessage] = useState(false);
  const [shakingCards, setShakingCards] = useState<number[]>([]);

  const scale = useScale();

  // 타이머 refs
  const giftAnimationRef = useRef<number | null>(null);
  const autoTransitionTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  // 스케일 적용된 카드 크기 및 간격
  const scaledCardGap = {
    horizontal: 72 * scale,
    vertical: 16 * scale
  };

  // api
  // const { updateQuestScore } = useScore();

  // character context
  const { selectedCharacter, characterImages } = useCharacter();
  const characterLabel = selectedCharacter === 'grandfather' ? '할아버지' : '할머니';
  
  // URL 쿼리 파라미터
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setScenarioId(params.get('scenario'));
    setQuestId(params.get('quest') || '1');
  }, [location]);

  useEffect(() => {
    initBgm('sparrow_land');
    //console.log("init bgm");
    
    return () => {
    unloadBgm('sparrow_land');
    //console.log("unload bgm on unmount");
    };
  }, []);

  // ———— BGM 제어 ————
  useEffect(() => {
    if (gamePhase === 'showCards') {
      //console.log("play bgm");
      playBgm('sparrow_land');
    }
    if (gamePhase === 'showGift' || gamePhase === 'openGift') {
      //console.log("stop1 bgm");
      stopBgm('sparrow_land');
    }
  }, [gamePhase]);

  // 최초 게임 시작 시에만 카드 초기화
  useEffect(() => {
    if (gamePhase === 'showCards' && !isInitialized) {
      initializeCards();
      setIsInitialized(true);
    } else if (gamePhase === 'showCards' && isInitialized) {
      setFlippedCards([]);
      
      setCards(initialCardOrder.map(card => ({
        ...card,
        isFlipped: true,
      })));

      setShouldShowHintMessage(false);

      window.setTimeout(() => {
        setGamePhase('game');
        setCards(prev => prev.map(c => ({
          ...c,
          isFlipped: false
        })));
      }, 3000 * Math.max(0.8, scale)); // 3000 -> 2000으로 단축
    }

    if (gamePhase === 'intro2') {
      const timer = window.setTimeout(() => setShowMessage(true), 500 * Math.max(0.8, scale)); // 800 -> 500
      return () => clearTimeout(timer);
    }
  }, [gamePhase, isInitialized, initialCardOrder, scale]);

  // 힌트 타이틀 표시 관리
  useEffect(() => {
    if (gamePhase === 'tooManyAttempts') {
      setShowHintTitle(false);
    } else if (gamePhase === 'game' || gamePhase === 'reshowCards') {
      setShowHintTitle(true);
    }
  }, [gamePhase]);

  // 자동 전환 - 스케일 적용
  useEffect(() => {
    if (autoTransitionTimerRef.current != null) {
      clearTimeout(autoTransitionTimerRef.current);
    }

    const getScaledDuration = (baseDuration: number) => {
      return baseDuration * Math.max(0.8, scale);
    };

    if (gamePhase === 'intro1') {
      autoTransitionTimerRef.current = window.setTimeout(() => {
        setGamePhase('intro2');
      }, getScaledDuration(2500)); 
    } 
    else if (gamePhase === 'wrongMatchFeedback') {
      autoTransitionTimerRef.current = window.setTimeout(() => {
        if (attempts >= 5) {
          setShouldShowHintMessage(true);
          setFeedbackMessage("찾기 어려우신가요?\n정답을 알려드릴게요");
          setGamePhase('tooManyAttempts');
        } else {
          setGamePhase('reshowCards');
        }
      }, getScaledDuration(2000));
    }
    else if (gamePhase === 'showGift' || gamePhase === 'openGift') {
      autoTransitionTimerRef.current = window.setTimeout(() => {
        switch (gamePhase) {
          case 'showGift':     setGamePhase('openGift');       break;
          case 'openGift':     setGamePhase('helmetEquipped'); break;
        }
      }, getScaledDuration(2000));
    }
    else if (gamePhase === 'helmetEquipped') {
      autoTransitionTimerRef.current = window.setTimeout(() => {
        navigate(
          `/score?scenario=${scenarioId}&quest=${questId}&score=${finalScore}&correct=true`
        );
      }, getScaledDuration(3000));
    }
    // foundMatch와 showAnswer, helmetEquipped의 자동 전환 제거
    else if (gamePhase === 'wrongPairFeedback') {
      autoTransitionTimerRef.current = window.setTimeout(() => {
        if (attempts >= 5) {
          setShouldShowHintMessage(true);
          setFeedbackMessage("찾기 어려우신가요?\n정답을 알려드릴게요");
          setGamePhase('tooManyAttempts');
        } else {
          setFlippedCards([]);
          setGamePhase('reshowCards');
        }
      }, getScaledDuration(2000));
    }
    // reshowCards 단계 처리
    else if (gamePhase === 'reshowCards') {
      // 카드를 모두 뒤집어서 보여주기
      setCards(prev => prev.map(c => ({ ...c, isFlipped: true })));
      
      // 4초 후 남은 시도 횟수 보여주기
      autoTransitionTimerRef.current = window.setTimeout(() => {
        setGamePhase('showRemainingTries');
      }, getScaledDuration(4000));
    }
    // showRemainingTries 단계 처리
    else if (gamePhase === 'showRemainingTries') {
      // 3초 후 게임으로 돌아가기
      autoTransitionTimerRef.current = window.setTimeout(() => {
        setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
        setGamePhase('game');
      }, getScaledDuration(1500));
    }
    else if (gamePhase === 'tooManyAttempts') {
      autoTransitionTimerRef.current = window.setTimeout(() => {
        setShouldShowHintMessage(false);
        
        autoTransitionTimerRef.current = window.setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.type === 'helmet'
                ? { ...c, isFlipped: true }
                : { ...c, isFlipped: false }
            )
          );
          
          autoTransitionTimerRef.current = window.setTimeout(() => {
            setGamePhase('showAnswer');
          }, getScaledDuration(1000));
        }, getScaledDuration(300));
      }, getScaledDuration(2000));
    }

    return () => {
      if (autoTransitionTimerRef.current != null) {
        clearTimeout(autoTransitionTimerRef.current);
      }
    };
  }, [gamePhase, navigate, scenarioId, questId, finalScore, flippedCards, attempts, scale]);

  // 점수 계산
  useEffect(() => {
    let score = 20;
    if (attempts === 2) score = 16;
    else if (attempts === 3) score = 12;
    else if (attempts === 4) score = 8;
    else if (attempts >= 5) score = 4;
    setFinalScore(score);
  }, [attempts]);

  // API call && context update
  useEffect(() => {
    if (gamePhase === "helmetEquipped") {
      const sessionId = localStorage.getItem("session_id");
      
      if (!sessionId) {
        console.error("❌ session_id가 없습니다");
        return;
      }
      
      const questIdForApi = "helmet";
      
      const payload: AttemptPayload = {
        attempt_number: attempts,
        score_awarded: finalScore,
        selected_option: "helmet",
        is_correct: true,
        response_time: 0,
      };

      postQuestAttempt(sessionId, questIdForApi, payload)
        .then((res) => {
          console.log("✅ 시도 기록 완료:", res.data.attempt_id);
          // score update to Context
          // updateQuestScore("helmet", finalScore);
        })
        .catch((err) => {
          console.error("❌ 시도 기록 실패", err);
        });
    }
  }, [gamePhase, attempts, finalScore]);

  // 선물 애니메이션 - 스케일 적용
  useEffect(() => {
    if (gamePhase === 'openGift') {
      if (giftAnimationRef.current != null) clearTimeout(giftAnimationRef.current);
      setGiftAnimationStage(1);
      giftAnimationRef.current = window.setTimeout(() => {
        setGiftAnimationStage(2);
        giftAnimationRef.current = window.setTimeout(() => setGiftAnimationStage(3), 1000 * Math.max(0.8, scale));
      }, 500 * Math.max(0.8, scale));
    }
    return () => {
      if (giftAnimationRef.current != null) clearTimeout(giftAnimationRef.current);
    };
  }, [gamePhase, scale]);

  //효과음 재생
  useEffect(() => {
    if (gamePhase === 'intro1') {
      //장면 전환 효과음(주행 준비하기)
      audioManager.playsceneSwitch()
    } else if (gamePhase === 'intro2') {
      //손자손녀메세지 효과음
      audioManager.playMessageAlarm();
    } else if (gamePhase === 'intro3') {
      //퀘스트 등장 효과음
      audioManager.playQuestStart();
    } else if (gamePhase === 'wrongPairFeedback' || gamePhase === 'wrongMatchFeedback') {
      //카드 실패 효과음
      audioManager.playSound('wrongCard',0.7);
    } else if (gamePhase === 'game'|| gamePhase === 'showCards' || gamePhase === 'reshowCards') {
      //카드 뒤집기 효과음
      audioManager.playSound('flipCards',0.7);
    } else if (gamePhase === 'tooManyAttempts' || gamePhase === 'showRemainingTries') {
      //기본 알림 효과음
      audioManager.playSound('etcSound',0.7);
    } else if (gamePhase === 'showAnswer') {
      //시도 횟수 초과_정답 공개 효과음
      audioManager.playSound('revealAnswer',0.7);
    } else if (gamePhase === 'foundMatch') {
      //정답 효과음
      audioManager.playRightAnswer1();
    } else if (gamePhase === 'helmetEquipped') {
      //안전모 착용
      audioManager.playSound('helmetOn',0.7);
    }else if (gamePhase === 'showGift') {
      //선물 상자 흔들기
      audioManager.playSound('shakingBox',1.0);
    }
  }, [gamePhase]);

  useEffect(() => {
    if (giftAnimationStage === 2) {
      // 상자 열린 효과음
      audioManager.playSound('openBox',0.9);
    }
  }, [giftAnimationStage]);

  // 카드 초기화 함수
  const initializeCards = () => {
    const types = [
      { type: 'helmet', image: helmetCard },
      { type: 'straw-hat', image: strawHatCard },
      { type: 'cap', image: capHatCard },
    ] as const;
    
    const list: Card[] = [];
    types.forEach(({ type, image }) => {
      for (let i = 0; i < 2; i++) {
        list.push({ 
          id: list.length, 
          type, 
          image, 
          isFlipped: true,
          isMatched: false
        });
      }
    });
    
    const shuffled = shuffleCards(list);
    setCards(shuffled);
    setInitialCardOrder(shuffled);

    window.setTimeout(() => {
      setGamePhase('game');
      setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
    }, 3000 * Math.max(0.8, scale));
  };

  // 카드 섞기 함수
  const shuffleCards = (cards: Card[]): Card[] => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 카드 클릭 핸들러
  const handleCardClick = (id: number) => {
    if (gamePhase !== 'game') return;
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    //카드 클릭 효과음
    audioManager.playSound('cardClick',0.7);

    setCards(prev =>
      prev.map(c =>
        c.id === id ? { ...c, isFlipped: true } : c
      )
    );
    
    const flipped = [...flippedCards, id];
    setFlippedCards(flipped);

    if (flipped.length === 2) {
      setAttempts(a => a + 1);
      
      const [aId, bId] = flipped;
      const [aCard, bCard] = [aId, bId].map(i =>
        cards.find(c => c.id === i)!
      );

      if (aCard.type === bCard.type) {
        if (aCard.type === 'helmet') {
          // 정답 쌍(헬멧-헬멧) 발견
          window.setTimeout(() => {
            setCards(prev =>
              prev.map(c =>
                c.id === aId || c.id === bId
                  ? { ...c, isMatched: true }
                  : c
              )
            );
            setFlippedCards([]);
            window.setTimeout(() => setGamePhase('foundMatch'), 400 * Math.max(0.8, scale));
          }, 400 * Math.max(0.8, scale));
        } else {
          // 정답이 아닌 같은 쌍 선택
          window.setTimeout(() => {
            setShakingCards([aId, bId]);

            setFeedbackMessage("앗, 준비한 선물이 아니에요!\n안전모가 그려진 카드 쌍을 찾아주세요!");
            setGamePhase('wrongMatchFeedback');
            
            window.setTimeout(() => {
              setCards(prev =>
                prev.map(c =>
                  c.id === aId || c.id === bId
                    ? { ...c, isFlipped: false }
                    : c
                )
              );
              setFlippedCards([]);
              setShakingCards([]);
            }, 1500 * Math.max(0.8, scale));
          }, 800 * Math.max(0.8, scale));
        }
      } else {
        // 서로 다른 쌍 선택
        window.setTimeout(() => {
          setShakingCards([aId, bId]);

          setFeedbackMessage("앗, 서로 다른 그림이에요!\n안전모가 그려진 카드 쌍을 찾아주세요");
          setGamePhase('wrongPairFeedback');
          
          window.setTimeout(() => {
            setCards(prev =>
              prev.map(c =>
                c.id === aId || c.id === bId
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setFlippedCards([]);
            setShakingCards([]);
          }, 1500 * Math.max(0.8, scale));
        }, 800 * Math.max(0.8, scale));
      }
    }
  };

  // 다음 단계로 이동 핸들러
  const handleNextPhase = () => {
    //다음 버튼 효과음
    audioManager.playButtonClick();
    if (gamePhase === 'intro2' && !showMessage) return;
    setShowMessage(false);
    if (gamePhase === 'intro1')      setGamePhase('intro2');
    else if (gamePhase === 'intro2') setGamePhase('intro3');
    else if (gamePhase === 'intro3') setGamePhase('showCards');
  };

  const handleConfirm = () => {
    //선택 버튼 효과음
    audioManager.playButtonClick();
    if (gamePhase === 'foundMatch') {
      setGamePhase('showGift');
    } else if (gamePhase === 'showAnswer') {
      setGamePhase('helmetEquipped');
    }
  };

  // 배경 흐림 효과 렌더링 함수
  const renderBackdrop = () => {
    if (gamePhase === 'intro1' || gamePhase === 'helmetEquipped') return null;
    return <div className="absolute inset-0 bg-[#FFF9C4]/50 z-0" />;
  };

  // 단계별 버튼 표시 조건
  const showNextButton =
    (gamePhase === 'intro2' && showMessage) ||
    gamePhase === 'intro3';

  const showConfirmButton = 
    gamePhase === 'foundMatch' || 
    gamePhase === 'showAnswer';

  // 카드 컨테이너 패딩 조건부 설정
  const gameContentVisible = 
    gamePhase === 'showCards' || 
    gamePhase === 'game' || 
    gamePhase === 'wrongPairFeedback' ||
    gamePhase === 'wrongMatchFeedback'||
    gamePhase === 'tooManyAttempts' ||
    gamePhase === 'reshowCards' ||
    gamePhase === 'showRemainingTries';

  return (
    <div className="relative w-full h-full">
      {/* 배경 */}
      <EnhancedOptimizedImage src={gameBackground} alt="게임 배경" className="absolute w-full h-full object-cover" />
      {renderBackdrop()}

      {/* 서서히 페이드인되는 백드롭 */}
      {gamePhase !== 'intro1' && gamePhase !== 'helmetEquipped' && (
        <motion.div
          className="absolute inset-0 bg-[#FFF9C4]/50 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 * Math.max(0.8, scale) }}
        />
      )}

      {/* 헤더 */}
      {(gamePhase === 'intro1' || gamePhase === 'intro2' || gamePhase === 'intro3') && (
        <div 
          className="absolute z-50"
          style={{
            top: `calc(16px * ${scale})`,
            right: `calc(16px * ${scale})`
          }}
        >
        </div>
      )}

      <div 
        className="absolute z-50"
        style={{
          top: `calc(16px * ${scale})`,
          left: `calc(16px * ${scale})`
        }}
      >
        <BackButton onClick={() => navigate('/prologue')} />
      </div>

      {/* intro1 */}
      {gamePhase === 'intro1' && (
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center z-10"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 0.8 * Math.max(0.8, scale)}}
      >
        <motion.div
          style={{ marginTop: `calc(96px * ${scale})` }}
          className="text-center"
          initial={{y: `calc(-20px * ${scale})`}}
          animate={{y: 0}}
          transition={{duration: 0.8 * Math.max(0.8, scale)}}
        >
          <GameTitle 
            text="주행 준비하기" 
            fontSize="92px" 
            strokeWidth="14px"
            letterSpacing="0.04em"
          />
        </motion.div>
        
        {/* 캐릭터 이미지 컨테이너 - 패딩 축소 및 중앙 정렬 강화 */}
        <div 
          className="relative flex items-center justify-center"
          style={{
            width: `calc(350px * ${scale})`,
            height: `calc(500px * ${scale})`,
            marginTop: `calc(2px * ${scale})`
          }}
        >
          <motion.img
            src={characterImages.withoutHelmet}
            alt="캐릭터"
            className="max-w-full max-h-full object-contain pointer-events-none"
            style={{
              display: 'block',
              margin: '0 auto',
              width: `calc(400px * ${scale})`,
              height: 'auto'
            }}
            initial={{scale: 0.8, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{duration: 0.8 * Math.max(0.8, scale), ease: 'easeOut'}}
            draggable={false}
          />
        </div>
      </motion.div>
      )}

      {gamePhase === 'intro2' && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-10"
          style={{ marginTop: `calc(-112px * ${scale})` }}
          initial={{ opacity: 0, y: `calc(-30px * ${scale})` }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 * Math.max(0.8, scale) }}
        >
          <EnhancedOptimizedImage
            src={grandchildren}
            alt="손자손녀"
            style={{
              width: `calc(400px * ${scale})`,
              height: 'auto',
              marginBottom: `calc(-92px * ${scale})`,
              zIndex: 20
            }}
          />

          <div
            className="bg-white/75 border-[#0DA429] text-center"
            style={{
              paddingLeft: `calc(16px * ${scale})`,
              paddingRight: `calc(16px * ${scale})`,
              paddingTop: `calc(92px * ${scale})`,
              paddingBottom: `calc(92px * ${scale})`,
              width: '100%',
              maxWidth: `calc(732px * ${scale})`,
              borderRadius: `calc(30px * ${scale})`,
              borderWidth: `calc(10px * ${scale})`
            }}
          >
            <p 
              className="font-black text-black"
              style={{ fontSize: `calc(45px * ${scale})` }}
            >
              {characterLabel},<br />
              운전하시기 전에 중요한 선물이 있어요!
            </p>
          </div>
        </motion.div>
      )}

      {/* intro3 */}
      {gamePhase === 'intro3' && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-start"
          style={{ paddingTop: `calc(120px * ${scale})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 * Math.max(0.8, scale) }}
        >
          <motion.div
            className="relative z-10 w-4/5 max-w-4xl"
            initial={{ y: `calc(-20px * ${scale})` }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8 * Math.max(0.8, scale) }}
          >
            <h2 
              className="font-black text-center text-[#0DA429]"
              style={{ 
                fontSize: `calc(3rem * ${scale})`,
                marginBottom: `calc(32px * ${scale})`
              }}
            >
              <GameTitle 
                  text="손주가 준비한 선물 찾기" 
                  fontSize="60px"
                  strokeWidth={`calc(6px * ${scale})`} 
                />
            </h2>
            <div 
              className="bg-white/80 border-[#0DA429]/75 text-center"
              style={{
                borderWidth: `calc(12px * ${scale})`,
                paddingTop: `calc(52px * ${scale})`,
                paddingBottom: `calc(52px * ${scale})`,
                paddingLeft: `calc(32px * ${scale})`,
                paddingRight: `calc(32px * ${scale})`,
                borderRadius: `calc(40px * ${scale})`,
                maxWidth: `calc(900px * ${scale})`,
                width: '95%',
                margin: '0 auto'
              }}
            >
              <p 
                className="font-black text-black"
                style={{ 
                  fontSize: `calc(45px * ${scale})`,
                  marginBottom: `calc(48px * ${scale})`
                }}
              >
                선물은 과연 무엇일까요?<br />같은 그림의 카드 두 개를 찾아주세요!
              </p>
              <p 
                className="font-black text-[#0DA429]"
                style={{ fontSize: `calc(45px * ${scale})` }}
              >
                힌트: 이 선물은 머리를 보호해줘요
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 게임 화면 영역 */}
      {gameContentVisible && (
        <div 
          className="absolute inset-0 z-10"
          style={{
            paddingLeft: `calc(16px * ${scale})`,
            paddingRight: `calc(16px * ${scale})`,
            paddingTop: `calc(8px * ${scale})`,
            paddingBottom: `calc(8px * ${scale})`
          }}
        >
          <div className="w-full h-full flex flex-col items-center justify-start">
            
            {/* 타이틀 영역 */}
            <div 
              className="flex items-center justify-center"
              style={{ 
                height: `calc(30px * ${scale})`,
                marginTop: `calc(48px * ${scale})`
              }}
            >
              <div className={showHintTitle ? '' : 'invisible'}>
                {(gamePhase === 'reshowCards' || gamePhase === 'showRemainingTries') ? (
                  <GameTitle 
                    text="카드 전체를 다시 보여 드릴게요" 
                    fontSize="42px"
                    strokeWidth="4px"
                  />
                ) : (
                  <GameTitle 
                    text="힌트: 머리를 보호해주는 선물은 무엇일까요?" 
                    fontSize="42px"
                    strokeWidth="4px"
                  />
                )}
              </div>
            </div>
            
            {/* 카드 그리드 - 스케일 적용된 간격 */}
            <div 
              className="grid grid-cols-3 justify-items-center items-center flex-1 content-center"
              style={{
                gap: `${scaledCardGap.vertical}px ${scaledCardGap.horizontal}px`
              }}
            >
              {cards.map(card => {
                let cardInfo = { width: 210, height: 265 };
                
                if (card.type === 'straw-hat') {
                  cardInfo = { width: 210, height: 269 };
                } else if (card.type === 'cap') {
                  cardInfo = { width: 210, height: 265 };
                }
                
                const backCardInfo = { width: 210, height: 269 };
                
                const baseScale = Math.min(
                  (1024 * 0.9) / (cardInfo.width * 3 + scaledCardGap.horizontal * 2),
                  (768 * 0.75) / (cardInfo.height * 2 + scaledCardGap.vertical),
                  1.8
                ) * scale;
                
                const containerSize = {
                  width: Math.max(cardInfo.width, backCardInfo.width) * baseScale,
                  height: Math.max(cardInfo.height, backCardInfo.height) * baseScale
                };
                
                return (
                  <div
                    key={card.id}
                    className={`relative cursor-pointer transition-transform hover:scale-105 ${
                      shakingCards.includes(card.id) ? 'animate-shake' : ''
                    }`}
                    onClick={() => handleCardClick(card.id)}
                    style={{
                      width: `${containerSize.width}px`,
                      height: `${containerSize.height}px`,
                      transform: card.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transformStyle: 'preserve-3d',
                      transitionDuration: `${600 * Math.max(0.8, scale)}ms`
                    }}
                  >
                    {/* 카드 앞면 */}
                    <div 
                      className="absolute inset-0 backface-hidden transform-style-preserve-3d" 
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <EnhancedOptimizedImage
                        src={card.image}
                        alt={card.type}
                        className="w-full h-full object-contain"
                        style={{
                          width: `${cardInfo.width * baseScale}px`,
                          height: `${cardInfo.height * baseScale}px`,
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    </div>
                    
                    {/* 카드 뒷면 */}
                    <div 
                      className="absolute inset-0 backface-hidden transform-style-preserve-3d" 
                      style={{
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      <EnhancedOptimizedImage
                        src={cardBack}
                        alt="카드 뒷면"
                        className="w-full h-full object-contain"
                        style={{
                          width: `${backCardInfo.width * baseScale}px`,
                          height: `${backCardInfo.height * baseScale}px`,
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 서로 다른 쌍 피드백 - 게임 화면 위에 오버레이 */}
      {gamePhase === 'wrongPairFeedback' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div 
            className="bg-white border-8 border-green-600 rounded-xl text-center shadow-lg mx-auto"
            style={{
              padding: `calc(32px * ${scale})`,
              maxWidth: `calc(683px * ${scale})`,
              width: '100%'
            }}
          >
            <p 
              className="font-black text-[#0DA429] whitespace-pre-line"
              style={{ fontSize: `${2.2 * scale}rem` }}
            >
              {feedbackMessage}
            </p>
          </div>
        </div>
      )}

      {/* 정답이 아닌 같은 쌍 피드백 - 게임 화면 위에 오버레이 */}
      {gamePhase === 'wrongMatchFeedback' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div 
            className="bg-white border-8 border-green-600 rounded-xl text-center shadow-lg mx-auto"
            style={{
              padding: `calc(32px * ${scale})`,
              maxWidth: `calc(683px * ${scale})`,
              width: '100%'
            }}
          >
            <p 
              className="font-black text-[#0DA429] whitespace-pre-line"
              style={{ fontSize: `${2.2 * scale}rem` }}
            >
              {feedbackMessage}
            </p>
          </div>
        </div>
      )}

      {/* 시도 횟수 초과 피드백 */}
      {gamePhase === 'tooManyAttempts' && shouldShowHintMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div 
            className="bg-white border-8 border-green-600 rounded-xl text-center shadow-lg mx-auto"
            style={{
              padding: `calc(32px * ${scale})`,
              maxWidth: `calc(683px * ${scale})`,
              width: '100%'
            }}
          >
            <p 
              className="font-black text-[#0DA429] whitespace-pre-line"
              style={{ fontSize: `${2.2 * scale}rem` }}
            >
              {feedbackMessage}
            </p>
          </div>
        </div>
      )}

      {/* 남은 시도 횟수 표시 - 카드 위 오버레이 */}
      {gamePhase === 'showRemainingTries' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div 
            className="bg-[#0DA429] border-[#0E8E12] rounded-xl text-center shadow-lg"
            style={{
              borderWidth: "12px",
              borderRadius: `calc(32px * ${scale})`,
              padding: `calc(8px * ${scale})`,
              maxWidth: `calc(440px * ${scale})`,
              width: '100%'
            }}
          >
            <p 
              className="font-black text-white"
              style={{ fontSize: `calc(3rem * ${scale})` }}
            >
              남은 시도 횟수: {5 - attempts}
            </p>
          </div>
        </div>
      )}

      {/* 정답 보여주기 */}
      {gamePhase === 'showAnswer' && (
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 * Math.max(0.8, scale) }}
        >
          <motion.div 
            className="relative z-10 flex flex-col items-center"
            style={{
              width: '80%',
              maxWidth: `calc(1024px * ${scale})`,
              marginTop: `calc(-64px * ${scale})`
            }}
            initial={{ y: `calc(-30px * ${scale})`, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 * Math.max(0.8, scale) }}
          >
            <motion.img
              src={grandchildren}
              alt="손자손녀"
              style={{
                width: `calc(350px * ${scale})`,
                height: 'auto',
                marginBottom: `calc(-48px * ${scale})`,
                zIndex: 20
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 * Math.max(0.8, scale) }}
            />
            <motion.div 
              className="bg-white bg-opacity-90 border-8 border-green-600 rounded-xl w-full text-center"
              style={{
                padding: `calc(40px * ${scale})`,
                paddingTop: `calc(48px * ${scale})`,
                maxWidth: `calc(718px * ${scale})`
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 * Math.max(0.8, scale) }}
            >
              <motion.p 
                className="font-black text-[#0DA429]"
                style={{
                  fontSize: `calc(2.4rem * ${scale})`,
                  marginBottom: `calc(24px * ${scale})`
                }}
                initial={{ y: `calc(20px * ${scale})`, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 * Math.max(0.8, scale), delay: 0.3 * Math.max(0.8, scale) }}
              >
                선물을 공개합니다
              </motion.p>
              <motion.p 
                className="font-black text-black"
                style={{ fontSize: `calc(2.4rem * ${scale})` }}
                initial={{ y: `calc(20px * ${scale})`, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 * Math.max(0.8, scale), delay: 0.5 * Math.max(0.8, scale) }}
              >
                안전모는 당신을 보호해줄 <br/>소중한 선물이에요.
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* foundMatch */}
      {gamePhase === 'foundMatch' && (
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 * Math.max(0.8, scale) }}
        >
          <motion.div 
            className="relative z-10 flex flex-col items-center"
            style={{
              width: '80%',
              maxWidth: `calc(1024px * ${scale})`,
              marginTop: `calc(-70px * ${scale})`
            }}
            initial={{ y: `calc(-30px * ${scale})`, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 * Math.max(0.8, scale) }}
          >
            <motion.img
              src={grandchildren}
              alt="손자손녀"
              style={{
                width: `calc(377px * ${scale})`,
                height: 'auto',
                marginBottom: `calc(-56px * ${scale})`,
                zIndex: 20
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 * Math.max(0.8, scale) }}
            />
            <motion.div 
              className="bg-[#FFFAFA] bg-opacity-75 border-[#0DA429] w-full text-center"
              style={{
                padding: `calc(40px * ${scale})`,
                paddingTop: `calc(48px * ${scale})`,
                maxWidth: `calc(732px * ${scale})`,
                borderWidth: `calc(10px * ${scale})`,
                borderRadius: `calc(36px * ${scale})`
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 * Math.max(0.8, scale) }}
            >
              <motion.p 
                className="font-black text-[#0DA429]"
                style={{
                  fontSize: `calc(45px * ${scale})`,
                  marginBottom: `calc(12px * ${scale})`
                }}
                initial={{ y: `calc(20px * ${scale})`, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 * Math.max(0.8, scale), delay: 0.3 * Math.max(0.8, scale) }}
              >
                선물을 찾았어요!
              </motion.p>
              <motion.p 
                className="font-black text-black"
                style={{ fontSize: `calc(45px * ${scale})` }}
                initial={{ y: `calc(20px * ${scale})`, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 * Math.max(0.8, scale), delay: 0.5 * Math.max(0.8, scale) }}
              >
                안전모는 당신을 보호해줄 <br/>소중한 선물이에요.
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {gamePhase === 'showGift' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10"
          initial="hidden"
          animate="visible"
          variants={{
            ...giftBoxVariants,
            visible: {
              ...giftBoxVariants.visible,
              transition: {
                ...giftBoxVariants.visible.transition,
                duration: giftBoxVariants.visible.transition.duration * Math.max(0.8, scale)
              }
            }
          }}
        >
          <motion.img
            src={giftBox}
            alt="선물 상자"
            style={{
              width: `calc(640px * ${scale})`,
              height: `calc(640px * ${scale})`
            }}
            variants={giftBoxVariants}
          />
        </motion.div>
      )}

      {gamePhase === 'openGift' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10"
          initial="hidden"
          animate="visible"
          variants={{
            ...openBoxVariants,
            visible: {
              ...openBoxVariants.visible,
              transition: {
                ...openBoxVariants.visible.transition,
                duration: (openBoxVariants.visible.transition.duration || 0.8) * Math.max(0.8, scale)
              }
            }
          }}
        >
          <div 
            className="relative"
            style={{
              width: `calc(800px * ${scale})`,
              height: `calc(800px * ${scale})`
            }}
          >
            {/* 열린 상자 */}
            <motion.img
              src={giftOpenHelmet}
              alt="열린 상자"
              className="absolute inset-0 w-full h-full object-contain"
              variants={openBoxVariants}
            />

            {/* 헬멧을 flex로 완전 중앙에 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.img
                src={helmet}
                alt="헬멧"
                className="object-contain"
                style={{
                  width: `calc(320px * ${scale})`,
                  height: `calc(320px * ${scale})`
                }}
                initial="hidden"
                animate="visible"
                variants={{
                  ...helmetVariants,
                  visible: {
                    ...helmetVariants.visible,
                    transition: {
                      ...helmetVariants.visible.transition,
                      delay: (helmetVariants.visible.transition.delay || 0.3) * Math.max(0.8, scale)
                    }
                  }
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {gamePhase === 'helmetEquipped' && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 * Math.max(0.8, scale) }}
        >
          <div 
            className="text-center"
            style={{ marginTop: `calc(96px * ${scale})` }}
          >
            <GameTitle 
              text="안전모를 착용했어요" 
              fontSize="88px"
              strokeWidth="14px"
            />
          </div>
          <motion.img
            src={characterImages.withHelmet}
            alt="캐릭터"
            className="h-auto"
            style={{
              width: `calc(320px * ${scale})`,
              marginTop: `calc(24px * ${scale})`
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 * Math.max(0.8, scale) }}
          />
        </motion.div>
      )}

      {/* 중앙 Next 버튼 */}
      {showNextButton && (
        <div 
          className="absolute left-0 right-0 flex justify-center z-10"
          style={{ bottom: `calc(32px * ${scale})` }}
        >
          <EnhancedOptimizedImage
            src={nextButton}
            alt="다음"
            onClick={handleNextPhase}
            className="h-auto cursor-pointer hover:scale-105 transition-transform"
            style={{ width: `calc(192px * ${scale})` }}
          />
        </div>
      )}

      {/* 확인 버튼 */}
      {showConfirmButton && (
        <div 
          className="absolute left-0 right-0 flex justify-center z-10"
          style={{ bottom: `calc(32px * ${scale})` }}
        >
          <EnhancedOptimizedImage
            src={confirmButton}
            alt="확인"
            onClick={handleConfirm}
            className="h-auto cursor-pointer hover:scale-105 transition-transform"
            style={{ width: `calc(192px * ${scale})` }}
          />
        </div>
      )}
    </div>
  );
};

export default MemoryCardQuest;