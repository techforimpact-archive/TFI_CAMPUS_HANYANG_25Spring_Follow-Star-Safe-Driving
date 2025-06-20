// Front/src/pages/scenarioSelect/ScenarioList.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScale } from '../../hooks/useScale';
import { audioManager } from '../../utils/audioManager';

import { simpleImagePreloader } from '../../utils/simpleImagePreloader';

// 이미지 임포트
const leftArrowDark = '/assets/images/left_arrow_dark.png';
const rightArrowDark = '/assets/images/right_arrow_dark.png';

// 시나리오 데이터
const allScenarios = [
    { 
        id: 1, 
        title: '시내 병원 진료 보는 날', 
        subtitle: '시내 병원 진료 보는 날',
        image: '/assets/images/scenario2.png',
        locked: true
    },
    { 
        id: 2, 
        title: '과수원 작업 하는 날', 
        subtitle: '과수원 작업 하는 날',
        image: '/assets/images/scenario1.png',
        locked: false
    },
    { 
        id: 3, 
        title: '시장에서 장 보는 날', 
        subtitle: '시장에서 장 보는 날',
        image: '/assets/images/scenario3.png',
        locked: true
    },
];

const ScenarioList = () => {
    const navigate = useNavigate();
    const scale = useScale();
    const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(1);
    const [frameColor, setFrameColor] = useState('#0DA429');
    
    // 드래그/터치 관련 상태
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragOffsetX, setDragOffsetX] = useState(0);
    const [dragDistance, setDragDistance] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // 스케일 적용된 상수들
    const SELECTED_SCALE = 1.2;
    const SCENARIO_WIDTH = 320 * scale;
    const SCENARIO_SPACING = 350 * scale;
    const FRAME_BORDER_WIDTH = 12 * scale;
    const DRAG_THRESHOLD = 50 * scale; // 드래그 민감도
    
    // 시나리오 잠금 여부에 따라 프레임 색상 업데이트
    useEffect(() => {
        setFrameColor(allScenarios[selectedScenarioIndex].locked ? '#718096' : '#0DA429');
    }, [selectedScenarioIndex]);

    // 드래그 시작 핸들러
    const handleDragStart = useCallback((clientX: number) => {
        setIsDragging(true);
        setDragStartX(clientX);
        setDragOffsetX(0);
        setDragDistance(0);
    }, []);
    
    // 드래그 중 핸들러
    const handleDragMove = useCallback((clientX: number) => {
        if (!isDragging) return;
        
        const deltaX = clientX - dragStartX;
        setDragOffsetX(deltaX);
        setDragDistance(Math.abs(deltaX));
    }, [isDragging, dragStartX]);
    
    // 드래그 종료 핸들러
    const handleDragEnd = useCallback(() => {
        if (!isDragging) return;
        
        const threshold = DRAG_THRESHOLD;
        let newIndex = selectedScenarioIndex;
        
        if (dragDistance > threshold) {
            if (dragOffsetX > 0 && selectedScenarioIndex > 0) {
                // 오른쪽으로 드래그 = 이전 시나리오
                newIndex = selectedScenarioIndex - 1;
            } else if (dragOffsetX < 0 && selectedScenarioIndex < allScenarios.length - 1) {
                // 왼쪽으로 드래그 = 다음 시나리오
                newIndex = selectedScenarioIndex + 1;
            }
        }
        
        setSelectedScenarioIndex(newIndex);
        setIsDragging(false);
        setDragOffsetX(0);
        setDragDistance(0);
    }, [isDragging, dragDistance, dragOffsetX, selectedScenarioIndex, DRAG_THRESHOLD]);
    
    // 시나리오 터치/클릭 핸들러
    const handleScenarioTouch = (index: number) => {
        //시나리오 선택 버튼 효과음
        if (!allScenarios[index].locked) {
            audioManager.playSound('etcSound', 0.7);
        }
        
        if (isDragging || dragDistance > 10 || isConfirming) return;
        
        // 잠긴 시나리오도 선택 상태 변경 허용 (실행은 막되 시각적 피드백은 제공)
        if (index !== selectedScenarioIndex) {
            setSelectedScenarioIndex(index);
            return;
        }
        
        // 현재 선택된 시나리오를 다시 터치하면 선택 (잠긴 것이 아닐 경우에만)
        if (index === selectedScenarioIndex && !allScenarios[index].locked) {
            handleScenarioSelect();
        }
    };

    
    // 마우스 이벤트 핸들러
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleDragStart(e.clientX);
    };
    
    const handleMouseMove = useCallback((e: MouseEvent) => {
        handleDragMove(e.clientX);
    }, [handleDragMove]);
    
    const handleMouseUp = useCallback(() => {
        handleDragEnd();
    }, [handleDragEnd]);
    
    // 터치 이벤트 핸들러
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            handleDragStart(e.touches[0].clientX);
        }
    };
    
    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (e.touches.length === 1) {
            e.preventDefault();
            handleDragMove(e.touches[0].clientX);
        }
    }, [handleDragMove]);
    
    const handleTouchEnd = useCallback(() => {
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
    
    // 왼쪽 버튼 클릭 핸들러
    const handleLeftClick = () => {
        //선택 버튼 효과음
        audioManager.playButtonClick();
        if (selectedScenarioIndex > 0 && !isConfirming) {
            setSelectedScenarioIndex(prev => prev - 1);
        }
    };

    // 오른쪽 버튼 클릭 핸들러
    const handleRightClick = () => {
        //선택 버튼 효과음
        audioManager.playButtonClick();
        if (selectedScenarioIndex < allScenarios.length - 1 && !isConfirming) {
            setSelectedScenarioIndex(prev => prev + 1);
        }
    };

    // 선택 확정 애니메이션 상태
    const [isConfirming, setIsConfirming] = useState(false);
    
    // 시나리오 선택 핸들러
    const handleScenarioSelect = () => {
        const scenario = allScenarios[selectedScenarioIndex];
        if (scenario.locked || isConfirming) return;
        
        setIsConfirming(true);
        
        // 부드러운 확정 애니메이션 후 이동
        setTimeout(() => {
            navigate(`/character-select?scenario=${scenario.id}`);
        }, 1200 * Math.max(0.8, scale));
    };

    return (
        <div 
            className="flex flex-col items-center justify-between h-full px-4 py-4 space-y-0"
            style={{
                paddingLeft: `calc(16px * ${scale})`,
                paddingRight: `calc(16px * ${scale})`,
                paddingTop: `calc(0px * ${scale})`,
                paddingBottom: `calc(16px * ${scale})`
            }}
        >
            {/* 타이틀 */}
            <div 
                className="bg-green-600 border-green-700 w-full max-w-5xl mb-0"
                style={{
                    borderWidth: `calc(8px * ${scale})`,
                    borderRadius: `calc(36px * ${scale})`,
                    paddingLeft: `calc(72px * ${scale})`,
                    paddingRight: `calc(72px * ${scale})`,
                    paddingTop: `calc(24px * ${scale})`,
                    paddingBottom: `calc(24px * ${scale})`,
                    marginBottom: `calc(16px * ${scale})`
                }}
            >
                <h1 
                    className="font-black text-white text-center"
                    style={{ fontSize: `${2.7 * scale}rem` }}
                >
                    원하는 안전 교육 게임을 선택하세요
                </h1>
            </div>
            
            {/* 메인 컨텐츠 영역 - 시나리오 선택 */}
            <div 
                className="flex-grow flex flex-col items-center justify-center w-full mt-0 mb-0"
                style={{
                    marginTop: `calc(10px * ${scale})`,
                    marginBottom: `calc(10px * ${scale})`
                }}
            >
                {/* 시나리오 표시 영역 - 드래그 가능 */}
                <div 
                    ref={containerRef}
                    className="relative flex justify-center items-center w-full cursor-grab active:cursor-grabbing select-none"
                    style={{ 
                        height: `calc(230px * ${scale})`,
                        marginBottom: `calc(5px * ${scale})`
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    {/* 시나리오 이미지들 */}
                    <div 
                        className="relative flex justify-center items-center w-full transition-transform duration-300 ease-out"
                        style={{ 
                            height: `calc(230px * ${scale})`,
                            transform: `translateX(${dragOffsetX}px)`
                        }}
                    >
                        {allScenarios.map((scenario, index) => {
                            const isSelected = selectedScenarioIndex === index;
                            const isConfirmingThis = isConfirming && isSelected;
                            
                            let translateX = (index - selectedScenarioIndex) * SCENARIO_SPACING;
                            let scaleValue = isSelected ? SELECTED_SCALE : 0.9;
                            let opacity = isSelected ? 1 : 0.6;
                            
                            // 확정 애니메이션 적용
                            if (isConfirmingThis) {
                                scaleValue = SELECTED_SCALE * 1.15;
                                opacity = 1;
                            }
                            
                            return (
                                <div
                                    key={scenario.id}
                                    className="absolute transition-all ease-in-out"
                                    style={{
                                        transform: `translateX(${translateX}px) scale(${scaleValue})`,
                                        zIndex: isSelected ? 15 : 5,
                                        opacity,
                                        transitionDuration: isDragging ? '0ms' : `${500 * Math.max(0.8, scale)}ms`
                                    }}
                                    onClick={() => handleScenarioTouch(index)}
                                > 
                                    <div 
                                        className={`overflow-hidden rounded-xl transition-all duration-300 ${
                                            isConfirmingThis ? 'animate-confirmSelection' : ''
                                        }`}
                                        style={{
                                            width: `${SCENARIO_WIDTH}px`,
                                            height: `calc(200px * ${scale})`,
                                            filter: scenario.locked ? 'grayscale(1) brightness(0.75)' : 'none',
                                            // Border 적용 방식 수정 - 모바일 호환성 개선
                                            border: isSelected ? `${FRAME_BORDER_WIDTH}px solid ${frameColor}` : `${FRAME_BORDER_WIDTH}px solid transparent`,
                                            boxSizing: 'border-box',
                                            boxShadow: isSelected ? 
                                                (isConfirmingThis ? 
                                                    `0 ${8 * scale}px ${20 * scale}px ${-2 * scale}px rgba(13, 164, 41, 0.4)` :
                                                    `0 ${4 * scale}px ${6 * scale}px ${-1 * scale}px rgba(0, 0, 0, 0.1)`
                                                ) : 'none',
                                            cursor: isSelected && !scenario.locked && !isConfirming ? 'pointer' : 'default',
                                            borderRadius: `calc(24px * ${scale})`,
                                            // 모바일 렌더링 최적화
                                            transform: 'translateZ(0)', // 항상 하드웨어 가속 적용
                                            backfaceVisibility: 'hidden',
                                            WebkitBackfaceVisibility: 'hidden',
                                            // 모바일에서 border 렌더링 강제
                                            WebkitTransform: 'translateZ(0)',
                                            willChange: isSelected ? 'transform, border-color' : 'auto'
                                        }}
                                    >
                                        <img
                                            src={scenario.image}
                                            alt={scenario.title}
                                            className="w-full h-full object-cover pointer-events-none"
                                            draggable={false}
                                        />
                                        
                                        {/* 잠금 표시 */}
                                        {scenario.locked && (
                                            <div 
                                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80"
                                                style={{
                                                    borderRadius: `calc(8px * ${scale})`, // 부모 border-radius와 일치
                                                }}
                                            >
                                                <div 
                                                    className="rounded-full"
                                                    style={{ padding: `calc(12px * ${scale})` }}
                                                >
                                                    <svg 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        className="text-white" 
                                                        fill="none" 
                                                        viewBox="0 0 24 24" 
                                                        stroke="currentColor"
                                                        style={{
                                                            width: `calc(56px * ${scale})`,
                                                            height: `calc(56px * ${scale})`
                                                        }}
                                                    >
                                                        <path 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                            strokeWidth={2} 
                                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* subtitle 박스 */}
                <div 
                    className="rounded-lg text-center overflow-hidden pointer-events-none text-white font-black whitespace-nowrap transition-all duration-500"
                    style={{ 
                        width: `${SCENARIO_WIDTH + 68 * scale}px`,
                        backgroundColor: allScenarios[selectedScenarioIndex].locked ? '#718096' : '#0DA429',
                        transformOrigin: 'top',
                        transform: `scale(${SELECTED_SCALE* 0.85})`, // isConfirming 조건 제거
                        boxSizing: 'border-box',
                        marginTop: `calc(23px * ${scale})`,
                        marginBottom: `calc(5px * ${scale})`,
                        paddingLeft: `calc(24px * ${scale})`,
                        paddingRight: `calc(24px * ${scale})`,
                        paddingTop: `calc(8px * ${scale})`,
                        paddingBottom: `calc(8px * ${scale})`,
                        boxShadow: isConfirming ? `0 0 ${20 * scale}px rgba(13, 164, 41, 0.5)` : 'none',
                        transitionDuration: `${500 * Math.max(0.8, scale)}ms`
                    }}
                    >
                    <p 
                        className="truncate"
                        style={{ fontSize: `calc(1.55rem * ${scale})` }}
                    >
                        {allScenarios[selectedScenarioIndex].subtitle}
                    </p>
                </div>
            </div>
            
            {/* 하단 방향 버튼 */}
            <div 
                className="flex justify-center"
                style={{ 
                    gap: `calc(64px * ${scale})`,
                }}
            >
                <img
                    src={leftArrowDark}
                    alt="왼쪽으로"
                    className={`transition-transform ${selectedScenarioIndex > 0 && !isConfirming ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
                    style={{
                        width: `calc(144px * ${scale})`,
                        height: `calc(144px * ${scale})`,
                        transitionDuration: `${200 * Math.max(0.8, scale)}ms`
                    }}
                    onClick={handleLeftClick}
                />
                
                <img
                    src={rightArrowDark}
                    alt="오른쪽으로"
                    className={`transition-transform ${allScenarios.length - 1 > selectedScenarioIndex && !isConfirming ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
                    style={{
                        width: `calc(144px * ${scale})`,
                        height: `calc(144px * ${scale})`,
                        transitionDuration: `${200 * Math.max(0.8, scale)}ms`
                    }}
                    onClick={handleRightClick}
                />
            </div>
        </div>
    );
};

export default ScenarioList;

/* 고령자 친화적 부드러운 애니메이션 CSS */
const styles = `
@keyframes confirmSelection {
    0% {
        transform: scale(1);
        filter: brightness(1);
    }
    30% {
        transform: scale(1.05);
        filter: brightness(1.1);
    }
    60% {
        transform: scale(1.02);
        filter: brightness(1.05);
    }
    100% {
        transform: scale(1.03);
        filter: brightness(1.08);
    }
}

@keyframes subtitleGlow {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.02);
    }
    100% {
        transform: scale(1.01);
    }
}

@keyframes confirmPulse {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }
    20% {
        transform: scale(1.05);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
`;

// 스타일을 head에 추가
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}