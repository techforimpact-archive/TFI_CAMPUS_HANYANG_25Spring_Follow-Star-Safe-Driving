import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';
//import { useWindowSize } from 'react-use';
//import Confetti from 'react-confetti';
import { audioManager } from '../../utils/audioManager';


const success_background = '/assets/images/scenario_success_confetti.png';
const awards = '/assets/images/perfect_score_certificate.png';
const perfect_congrats = '/assets/images/perfect_congrats.png';

const PerfectScore = () => {
    const navigate = useNavigate();
    //const { width, height } = useWindowSize();

    const [showCongrats, setShowCongrats] = useState(false);
    const [showAwards, setShowAwards] = useState(false);

    useEffect(() => {
        //결과 효과음
        audioManager.playSound('reportGeneral', 0.8);
        // 애니메이션 타이밍
        setTimeout(() => setShowCongrats(true), 300);   // 약간의 딜레이 후
        setTimeout(() => setShowAwards(true), 1500);    // 축하 후 등장

        // 페이지 자동 이동
        const navigationTimer = setTimeout(() => {
        navigate('/certificate');
        }, 15000);

        return () => clearTimeout(navigationTimer);
    }, [navigate]);

    return (
        <div className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-[#FFF9C4]/70 z-10" />

        {/* 배경 */}
        <img
            src={success_background}
            alt="주행 성공 후 배경"
            className="w-full object-cover min-h-full"
        />

        {/* 🎉 축하 멘트 애니메이션 */}
        <img
            src={perfect_congrats}
            alt="축하멘트!"
            className={`absolute top-[13%] left-1/2 transform -translate-x-1/2
            w-[710px] object-contain z-50 transition-all duration-1000 ease-out
            ${showCongrats ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
            `}
        />

        {/* 🏆 어워즈 애니메이션 */}
        <img
            src={awards}
            alt="모범운전 어워즈"
            className={`absolute left-1/2 transform -translate-x-1/2
            w-[400px] max-h-[70%] object-contain z-50 transition-all duration-1000 ease-out
            ${showAwards ? 'bottom-[2%] opacity-100' : 'bottom-[-150px] opacity-0'}
            `}
        />
        </div>
    );
};

export default PerfectScore;
