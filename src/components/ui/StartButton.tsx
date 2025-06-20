// src/components/ui/StartButton.tsx
import { useNavigate } from 'react-router-dom';
import { audioManager } from '../../utils/audioManager';

const start_button = '/assets/images/start_button.png'

const StartButton = () => {
    const navigate = useNavigate();

    //효과음을 위해 핸들러 추가
    const handleClick = () => {
      audioManager.playButtonClick();
      navigate('/scenario-select');
    };

    return (
        <img
        src={start_button}
        alt="시작하기 버튼"
        onClick={handleClick}
        className="absolute cursor-pointer z-50 hover:scale-105 transition-transform duration-300"
        style={{
          bottom: '0%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '27%',
          height: 'auto'
        }}
        />
    );
};

export default StartButton;