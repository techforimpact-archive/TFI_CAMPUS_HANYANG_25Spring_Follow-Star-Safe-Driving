// Front/src/context/CharacterContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CharacterType = 'grandfather' | 'grandmother';

interface CharacterImages {
  withoutHelmet: string;
  withHelmet: string;
  potholeAccident: string;
  fieldAccident: string;
  mission2Success: string;
  mission4Success: string;
  mission5Success: string;
  mission5Fail: string;
  missionFailEveningDriving: string;
}

interface CharacterContextType {
  selectedCharacter: CharacterType;
  characterImages: CharacterImages;
  setCharacter: (character: CharacterType) => void;
}

const characterImageMap: Record<CharacterType, CharacterImages> = {
  grandfather: {
    withoutHelmet: '/assets/images/game_character_grandfather.png',
    withHelmet: '/assets/images/grandfather_with_helmet.png',
    potholeAccident: '/assets/images/grandfather_pothole_accident.png',
    fieldAccident: '/assets/images/grandfather_field_accident.png',
    mission2Success: '/assets/images/mission2_success_grandfather.png',
    mission4Success: '/assets/images/mission4_success_grandfather_cart.png',
    mission5Success: '/assets/images/mission5_success_grandfather.png',
    mission5Fail: '/assets/images/mission5_fail_grandfather.png',
    missionFailEveningDriving: '/assets/images/mission_fail_evening_driving_grandfather.png'
  },
  grandmother: {
    withoutHelmet: '/assets/images/game_character_grandmother.png',
    withHelmet: '/assets/images/grandmother_with_helmet.png',
    potholeAccident: '/assets/images/grandmother_pothole_accident.png',
    fieldAccident: '/assets/images/grandmother_field_accident.png',
    mission2Success: '/assets/images/mission2_success_grandmother.png',
    mission4Success: '/assets/images/mission4_success_grandmother_cart.png',
    mission5Success: '/assets/images/mission5_success_grandmother.png',
    mission5Fail: '/assets/images/mission5_fail_grandmother.png',
    missionFailEveningDriving: '/assets/images/mission_fail_evening_driving_grandmother.png'
  }
};

const CharacterContext = createContext<CharacterContextType | null>(null);

export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('grandfather');

  useEffect(() => {
    const savedCharacter = localStorage.getItem('selectedCharacter') as CharacterType;
    if (savedCharacter && (savedCharacter === 'grandfather' || savedCharacter === 'grandmother')) {
      setSelectedCharacter(savedCharacter);
    }
  }, []);

  const setCharacter = (character: CharacterType) => {
    setSelectedCharacter(character);
    localStorage.setItem('selectedCharacter', character);
  };

  const characterImages = characterImageMap[selectedCharacter];

  return (
    <CharacterContext.Provider value={{ 
      selectedCharacter, 
      characterImages, 
      setCharacter 
    }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within CharacterProvider');
  }
  return context;
};