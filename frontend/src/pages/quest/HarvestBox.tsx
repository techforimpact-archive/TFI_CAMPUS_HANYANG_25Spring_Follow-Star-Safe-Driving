import { useEffect, useState } from 'react';
import { useScale } from '../../hooks/useScale';
import { audioManager } from '../../utils/audioManager';

const NUM_BOXES = 4;

const HarvestBox = () => {
    const [visibleBoxes, setVisibleBoxes] = useState<boolean[]>(Array(NUM_BOXES).fill(false));
    const scale = useScale();

    // 사과박스의 위치와 크기 지정 - 스케일 적용
    const boxData = [
        { top: '432px', left: '229px', width: '459px' },
        { top: '432px', left: '562px', width: '459px' },
        { top: '537px', left: '792px', width: '517px' },
        { top: '566px', left: '396px', width: '492px' },
    ];

    useEffect(() => {
        const timers = boxData.map((_, i) =>
            setTimeout(() => {
                setVisibleBoxes((prev) => {
                    const updated = [...prev];
                    updated[i] = true;
                    return updated;
                });
            }, i * 500 * Math.max(0.8, scale)) // 애니메이션 간격도 스케일 적용
        );

        return () => timers.forEach(clearTimeout);
    }, [scale]); // scale을 dependency에 추가

    // 사과박스 쌓는 효과음
    useEffect(() => {
        // 새로 나타난 박스 개수 확인
        const visibleCount = visibleBoxes.filter(Boolean).length;
        
        // 박스가 하나 이상 나타났을 때만 효과음 재생
        if (visibleCount > 0) {
            audioManager.playSound('appleBox', 0.7);
        }
    }, [visibleBoxes]); // visibleBoxes 변화 감지

    return (
        <div className="w-full h-full">
            {boxData.map((box, index) => (
                <img
                    key={index}
                    src='/assets/images/apple_box.png'
                    alt={`사과박스-${index}`}
                    className={`absolute transition-all ease-out
                        ${visibleBoxes[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                    style={{
                        top: box.top,
                        left: box.left,
                        width: `calc(${box.width} * ${scale})`, // 너비에 스케일 적용
                        transform: 'translate(-50%, -50%)',
                        transitionDuration: `${500 * Math.max(0.8, scale)}ms`, // 애니메이션 지속시간 스케일 적용
                        zIndex: 10,
                    }}
                />
            ))}
        </div>
    );
};

export default HarvestBox;