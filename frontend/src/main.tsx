// src/main.tsx - simpleImagePreloader 변경에 맞춘 수정본
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { CharacterProvider } from './context/CharacterContext'
import { simpleImagePreloader, imagePaths } from './utils/simpleImagePreloader'
import { setupViewportHeightVar } from './utils/viewportUtils';

setupViewportHeightVar();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CharacterProvider>
        <App />
      </CharacterProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

if (process.env.NODE_ENV === 'development') {
  (window as any).imageDebug = {
    status: () => {
      const loadedImages = imagePaths.filter((src: string) => simpleImagePreloader.isLoaded(src));
      
      console.group('🖼️ 이미지 로딩 상태');
      console.log(`전체: ${loadedImages.length}/${imagePaths.length} loaded (${((loadedImages.length / imagePaths.length) * 100).toFixed(1)}%)`);
      console.log('✅ 로딩 완료:', loadedImages.slice(0, 10)); // 처음 10개만 표시
      
      const notLoaded = imagePaths.filter((src: string) => !simpleImagePreloader.isLoaded(src));
      if (notLoaded.length > 0) {
        console.warn(`❌ 로딩 실패/대기 중 (${notLoaded.length}개):`, notLoaded.slice(0, 5)); // 처음 5개만 표시
      }
      console.groupEnd();
      
      return {
        loaded: loadedImages.length,
        total: imagePaths.length,
        percentage: ((loadedImages.length / imagePaths.length) * 100).toFixed(1)
      };
    },
    
    clear: () => {
      simpleImagePreloader.clearCache();
      console.log('🗑️ 이미지 캐시 클리어 완료');
    },
    
    check: (src: string) => {
      const isLoaded = simpleImagePreloader.isLoaded(src);
      const image = simpleImagePreloader.getImage(src);
      
      console.log(`🔍 이미지 체크: ${src}`);
      console.log(`  - 로딩됨: ${isLoaded}`);
      console.log(`  - 캐시됨: ${!!image}`);
      
      if (image) {
        console.log(`  - 크기: ${image.naturalWidth}x${image.naturalHeight}`);
      }
      
      return { loaded: isLoaded, cached: !!image, element: image };
    },
    
    test: async () => {
      console.log('⚡ 이미지 로딩 성능 테스트 시작...');
      
      const testImages = imagePaths.slice(0, 5); // 처음 5개 이미지로 테스트
      
      const startTime = Date.now();
      
      try {
        await Promise.all(testImages.map((src: string) => simpleImagePreloader.loadImage(src)));
        const endTime = Date.now();
        console.log(`✅ 테스트 완료: ${endTime - startTime}ms`);
      } catch (error) {
        console.error('❌ 테스트 실패:', error);
      }
    },
    
    viewport: () => {
      console.group('📱 뷰포트 정보');
      console.log(`window.innerHeight: ${window.innerHeight}px`);
      console.log(`window.innerWidth: ${window.innerWidth}px`);
      console.log(`document.documentElement.clientHeight: ${document.documentElement.clientHeight}px`);
      console.log(`document.documentElement.clientWidth: ${document.documentElement.clientWidth}px`);
      
      if (window.visualViewport) {
        console.log(`visualViewport.height: ${window.visualViewport.height}px`);
        console.log(`visualViewport.width: ${window.visualViewport.width}px`);
      } else {
        console.log('visualViewport: 지원되지 않음');
      }
      
      const vh = getComputedStyle(document.documentElement).getPropertyValue('--vh');
      console.log(`CSS --vh 변수: ${vh}`);
      
      console.groupEnd();
    },
    
    help: () => {
      console.log(`
🖼️ 이미지 디버깅 도구 사용법:

window.imageDebug.status()     - 현재 로딩 상태 확인
window.imageDebug.clear()      - 캐시 클리어
window.imageDebug.check(url)   - 특정 이미지 상태 확인
window.imageDebug.test()       - 성능 테스트
window.imageDebug.viewport()   - 뷰포트 정보 확인
window.imageDebug.help()       - 이 도움말

예시:
window.imageDebug.status()
window.imageDebug.check('/assets/images/background.png')
window.imageDebug.viewport()
      `);
    }
  };
  
  setTimeout(() => {
    console.log('🚀 이미지 프리로더 및 뷰포트 초기화 완료');
    console.log('💡 window.imageDebug.help() 입력으로 사용법 확인');
    (window as any).imageDebug.status();
    (window as any).imageDebug.viewport();
  }, 2000);
  
  setInterval(() => {
    const loaded = imagePaths.filter((src: string) => simpleImagePreloader.isLoaded(src));
    const percentage = (loaded.length / imagePaths.length) * 100;
    if (percentage < 80) { // 80% 미만일 때만 경고
      console.warn(`⚠️ 이미지 로딩 진행률: ${percentage.toFixed(1)}% (${loaded.length}/${imagePaths.length})`);
    }
  }, 30000);
}