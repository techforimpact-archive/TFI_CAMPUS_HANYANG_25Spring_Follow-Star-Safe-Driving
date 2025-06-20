import { useEffect, useState } from 'react';
import { useScale } from '../../hooks/useScale';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

// 이미지 목록
const starImages = [
    '/assets/images/dancing_star1.png',
    '/assets/images/dancing_star2.png',
    '/assets/images/dancing_star3.png',
    '/assets/images/dancing_star4.png',
];

const DancingStar = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scale = useScale();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % starImages.length);
        }, 800 * Math.max(0.8, scale)); // 애니메이션 간격에 스케일 적용 (최소 0.8배 보장)

        return () => clearInterval(interval);
    }, [scale]); // scale을 dependency에 추가

    return (
        <div className="w-full h-full flex justify-center items-center">
            <img
                src={starImages[currentImageIndex]}
                alt={`Dancing Star ${currentImageIndex}`}
                className="absolute object-contain z-40"
                style={{
                    bottom: `calc(5% * ${scale})`,
                    width: `calc(22% * ${scale})`
                }}
            />
        </div>
    );
};

export default DancingStar;