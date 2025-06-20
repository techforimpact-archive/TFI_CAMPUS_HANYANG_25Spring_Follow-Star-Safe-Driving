import { useScale } from '../../hooks/useScale';

const HarvestBox2 = () => {
    const scale = useScale();

    // 사과박스의 위치와 크기 지정 - 스케일 적용
    const boxData = [
        { top: '55%', left: '20%', width: '50%' },
        { top: '65%', left: '45%', width: '45%' },
        { top: '75%', left: '79%', width: '71%' },
        { top: '82%', left: '24%', width: '55%' },
    ];

    return (
        <div className="w-full h-full">
            {boxData.map((box, index) => (
                <img
                    key={index}
                    src="/assets/images/apple_box.png"
                    alt={`사과박스-${index}`}
                    className="absolute"
                    style={{
                        top: box.top,
                        left: box.left,
                        width: `calc(${box.width} * ${scale})`, // 너비에 스케일 적용
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                        opacity: 1, // 명시적으로
                        scale: 1,   // 명시적으로
                        transition: 'none', // 애니메이션 제거
                    }}
                />
            ))}
        </div>
    );
};

export default HarvestBox2;