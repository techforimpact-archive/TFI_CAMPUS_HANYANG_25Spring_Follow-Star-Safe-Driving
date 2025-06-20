import { useNavigate } from 'react-router-dom';
import { useScale } from '../../hooks/useScale';
import { audioManager } from '../../utils/audioManager';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

const next_button = '/assets/images/next_button.png'

interface NextButtonProps {
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
}


const NextButton: React.FC<NextButtonProps> = ({
    to = '/star',
    onClick,
    disabled = false,
    }) => {
    const navigate = useNavigate();
    const scale = useScale();

    const handleClick = () => {
      //선택 효과음
      audioManager.playButtonClick();
      if (disabled) return;      // 비활성화된 상태라면 아무 동작도 하지 않음
      if (onClick) {
        onClick();               // onClick 콜백이 있으면 그것만 실행
      } else {
        navigate(to);            // 아니면 to 경로로 네비게이트
      }
    };

    return (
        <img
            src={next_button}
            alt="다음 버튼"
            onClick={handleClick}
            className="absolute cursor-pointer z-50 hover:scale-105 transition-transform duration-300"
            style={{
                width: `calc(200px * ${scale})`,
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: `calc(40px * ${scale})`,
            }}
        />
    );
};

export default NextButton;