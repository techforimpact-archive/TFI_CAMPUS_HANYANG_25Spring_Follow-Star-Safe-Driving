import { useScale } from '../../hooks/useScale';
import { audioManager } from '../../utils/audioManager';


const back_button = '/assets/images/back_button.png'

interface BackButtonProps {
  onClick?: () => void;
}

const BackButton = ({ onClick }: BackButtonProps) => {
    const scale = useScale();

    const handleBack = () => {
        //선택 효과음
        audioManager.playButtonClick();

        if (onClick) {
            onClick();
        } else {
            window.history.back();  // 브라우저 히스토리 강제 뒤로가기
        }
    };

    return (
        <img 
            src={back_button} 
            alt="뒤로가기"
            onClick={handleBack}
            className="absolute cursor-pointer z-50 active:scale-90 transition-transform duration-150"
            style={{
                top: `calc(4% * ${scale})`,
                left: `calc(4% * ${scale})`,
                width: `calc(11% * ${scale})`,
                height: 'auto'
            }}
        />
    );
};

export default BackButton;