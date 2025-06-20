// Star.tsx
import React from 'react';
import { audioManager } from '../../utils/audioManager';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

// props로 채움 여부와 클릭 이벤트 받기
interface StarProps {
    filled: boolean;
    onClick: () => void;
}

const filled_star = '/assets/images/filled_star.png';
const empty_star = '/assets/images/empty_star.png';

const Star = ({ filled, onClick }: StarProps) => {

    //효과음을 위한 핸들러 추가
    const handleStarClick = () => {
        audioManager.playSound('makClick',0.5);
        onClick();
    };

    return (
        <img
        src={filled ? filled_star : empty_star} // ⭐ 상태에 따라 이미지 변경
        alt="별 이미지"
        onClick={handleStarClick} // ⭐ 클릭 시 상위 컴포넌트에 알림
        style={{
            width: '120px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        }}
        />
  );
};

export default Star;