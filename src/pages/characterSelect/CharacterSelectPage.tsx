import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useScale } from '../../hooks/useScale';
import { useCharacter } from '../../context/CharacterContext';
import Background from '../../components/ui/Background';
import BackButton from '../../components/ui/BackButton';
import GameTitle from '../../components/ui/GameTitle';
import { audioManager } from '../../utils/audioManager';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

const grandfatherCharacter = '/assets/images/game_character_grandfather.png';
const grandmotherCharacter = '/assets/images/game_character_grandmother.png';

interface Character {
  id: 'grandfather' | 'grandmother';
  name: string;
  image: string;
}

const characters: Character[] = [
  {
    id: 'grandfather',
    name: '할아버지',
    image: grandfatherCharacter
  },
  {
    id: 'grandmother', 
    name: '할머니',
    image: grandmotherCharacter
  }
];

const CharacterSelectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scale = useScale();
  const { setCharacter } = useCharacter();
  
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const searchParams = new URLSearchParams(location.search);
  const scenarioId = searchParams.get('scenario');
  
  const handleCharacterSelect = (index: number) => {
    //기본 알림음
    audioManager.playSound('etcSound', 0.5);

    if (isConfirming) return;
    
    setSelectedCharacterIndex(index);
    setIsConfirming(true);
    
    const selectedCharacter = characters[index];
    setCharacter(selectedCharacter.id);
    
    setTimeout(() => {
      navigate(`/prologue?scenario=${scenarioId}`);
    }, 1200);
  };

  const handleBackToScenarios = () => {
    //선택 버튼 효과음
    audioManager.playButtonClick();
    navigate('/scenario-select');
  };

  return (
    <div className="relative w-full h-full">
      <Background />
      <BackButton onClick={handleBackToScenarios} />
      
      {/* 타이틀 */}
      <div 
        className="absolute bg-green-600 border-green-700 flex items-center justify-center z-30"
        style={{
          top: `calc(170px * ${scale})`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `calc(834px * ${scale})`,
          height: `calc(135px * ${scale})`,
          borderWidth: `calc(8px * ${scale})`,
          borderRadius: `calc(36px * ${scale})`,
          padding: `calc(24px * ${scale})`
        }}
      >
        <h1 
          className="font-black text-white text-center"
          style={{ fontSize: `${46 * scale}px` }}
        >
          원하는 캐릭터를 선택하세요
        </h1>
      </div>

      {/* 캐릭터 선택 영역 */}
      <div 
        className="absolute flex items-center justify-center z-20"
        style={{
          top: '70%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `calc(900px * ${scale})`,
          height: `calc(400px * ${scale})`,
          gap: `calc(60px * ${scale})`
        }}
      >
        {characters.map((character, index) => {
          const isSelected = selectedCharacterIndex === index;
          const isConfirmingThis = isConfirming && isSelected;
          
          let scaleValue = 1;
          
          if (isSelected) {
            scaleValue = 1.1;
          }
          
          if (isConfirmingThis) {
            scaleValue = 1.1;
          }
          
          return (
            <div
              key={character.id}
              className="relative transition-all ease-in-out cursor-pointer z-30 hover:scale-105"
              style={{
                transform: `scale(${scaleValue})`,
                transitionDuration: '500ms'
              }}
              onClick={() => handleCharacterSelect(index)}
            >
              <div 
                className={`rounded-xl transition-all duration-300 ${
                  isConfirmingThis ? 'animate-pulse' : ''
                }`}
                style={{
                  width: `calc(350px * ${scale})`,
                  height: `calc(400px * ${scale})`,
                  border: isSelected ? `calc(12px * ${scale}) solid #0DA429` : 'none',
                  boxSizing: 'border-box',
                  borderRadius: `calc(12px * ${scale})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: `calc(10px * ${scale})`,
                  boxShadow: isSelected ? 
                    `0 ${8 * scale}px ${0 * scale}px ${-2 * scale}px rgba(13, 164, 41, 0.4)` :
                    'none'
                }}
              >
                <img
                  src={character.image}
                  alt={character.name}
                  className="max-w-full max-h-full object-contain pointer-events-none"
                  draggable={false}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterSelectPage;