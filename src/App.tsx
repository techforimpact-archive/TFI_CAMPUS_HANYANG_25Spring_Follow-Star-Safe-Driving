// src/App.tsx - 완전 수정 버전 (스크롤 방지 포함)
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CharacterProvider } from './context/CharacterContext';
import AspectRatioContainer from './components/layout/AspectRatioContainer';
import EnhancedLoadingScreen from './components/ui/SimpleLoadingScreen';
import { useDragPrevention } from './hooks/useDragPrevention';

// 레이아웃 컴포넌트들
import StartPrologueLayout from './components/layout/StartPrologueLayout';
// import QuestLayout from './components/layout/QuestLayout';
import ResultLayout from './components/layout/ResultLayout'

// 페이지 컴포넌트들
import HomePage from './pages/home/HomePage';
import SettingPage from './pages/home/SettingPage';
import ScenarioSelectPage from './pages/scenarioSelect/ScenarioSelectPage';
import CharacterSelectPage from './pages/characterSelect/CharacterSelectPage';
import EduScreen from './pages/ResultScreen/EduScreen';
import Certificate from './pages/ResultScreen/Certificate';
import PersonalInfo from './pages/ResultScreen/PersonalInfo';
import StarSurvey from './pages/ResultScreen/StarSurvey';
import ProloguePage from './pages/prologue/ProloguePage';
import DrivingPrepPage from './pages/driving/DrivingPrepPage';
import MemoryCardQuest from './pages/quest/MemoryCardQuest';
import ScorePage from './pages/score/ScorePage';
import PotholeQuest from './pages/quest/PotholeQuest';
import CompletionBackground from './pages/questFinish/CompletionBackground';
import SuccessBackground from './pages/questFinish/SuccessBackground';
import MakgeolliQuest from './pages/quest/MakgeolliQuest';
import HarvestQuest from './pages/quest/HarvestQuest';
import ReturnQuest from './pages/quest/ReturnQuest';
import PerfectScore from './pages/ResultScreen/PerfectScore';
import Memory from './pages/ResultScreen/Memory';
import VillageRank from './pages/ResultScreen/VillageRank';
import DevelopmentNotice from './pages/DevelopmentNotice';


function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  useDragPrevention();

  const handleLoadComplete = () => {
    setIsInitialLoading(false);
    console.log('[App] 초기 로딩 완료');
  };

  useEffect(() => {
    // 게임 실행 시 body 스크롤 완전 차단
    document.body.classList.add('no-scroll');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // 모바일 터치 스크롤 방지 (기존 코드 개선)
    const preventScroll = (e: TouchEvent) => {
      // 게임 컨테이너 내부가 아닌 경우에만 방지
      const target = e.target as Element;
      if (!target.closest('.scrollable-content')) {
        e.preventDefault();
      }
    };
    
    // 휠 스크롤 방지
    const preventWheel = (e: WheelEvent) => {
      const target = e.target as Element;
      if (!target.closest('.scrollable-content')) {
        e.preventDefault();
      }
    };
    
    // 키보드 스크롤 방지 (스페이스바, 방향키 등)
    const preventKeyScroll = (e: KeyboardEvent) => {
      const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
      if (scrollKeys.includes(e.keyCode)) {
        const target = e.target as Element;
        if (!target.closest('.scrollable-content')) {
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('wheel', preventWheel, { passive: false });
    document.addEventListener('keydown', preventKeyScroll, { passive: false });
    
    return () => {
      // 컴포넌트 언마운트 시 모든 제한 해제
      document.body.classList.remove('no-scroll');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('keydown', preventKeyScroll);
    };
  }, []);

  if (isInitialLoading) {
    return <EnhancedLoadingScreen onLoadComplete={handleLoadComplete} />;
  }

  return (
    <CharacterProvider>
      <AspectRatioContainer>
        <Routes>
          {/* 시작 및 프롤로그 화면들 */}
          <Route element={<StartPrologueLayout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/setting" element={<SettingPage />} />
            <Route path="/scenario-select" element={<ScenarioSelectPage />} />
            <Route path="/character-select" element={<CharacterSelectPage />} />
            <Route path="/prologue" element={<ProloguePage />} />
          </Route>
          
          <Route path="/driving-prep" element={<DrivingPrepPage />} />

          {/* 퀘스트 화면들 */}
          <Route path="/quest" element={<MemoryCardQuest />} />
          <Route path="/pothole-quest" element={<PotholeQuest />} />
          <Route path="/makgeolli-quest" element={<MakgeolliQuest/>} />
          <Route path="/harvest-quest" element={<HarvestQuest />} />
          <Route path="/return-quest" element={<ReturnQuest/>}/>
          <Route path="/score" element={<ScorePage />} />
           
          {/* 주행 완료 관련 화면들 */}
          <Route path="/success" element={<SuccessBackground />} />
          <Route path="/completion" element={<CompletionBackground />} />
          <Route path='/perfect' element={<PerfectScore/>} />
           
          {/* 결과 및 수료 관련 화면들 */}
          <Route element={<ResultLayout />}>
            <Route path="/result" element={<EduScreen />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/info" element={<PersonalInfo/>} />
            <Route path="/survey" element={<StarSurvey />} />
            <Route path="/memory" element={<Memory />} />
            <Route path='/rank' element={<VillageRank/>} />
          </Route>

          {/* 추가: 개발 중 알림 페이지 */}
          <Route path="/development-notice" element={<DevelopmentNotice />} />
        </Routes>
      </AspectRatioContainer>
    </CharacterProvider>
  );
}

export default App;