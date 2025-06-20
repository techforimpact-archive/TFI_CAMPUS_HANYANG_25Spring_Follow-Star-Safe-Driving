// src/utils/viewportUtils.ts
export const getViewportHeight = (): number => {
  // visualViewport API 사용 (모던 브라우저)
  if (window.visualViewport) {
    return window.visualViewport.height;
  }
  
  // iOS Safari 대응
  if (window.innerHeight && document.documentElement.clientHeight) {
    return Math.min(window.innerHeight, document.documentElement.clientHeight);
  }
  
  return window.innerHeight;
};

export const setupViewportHeightVar = (): void => {
  const updateVH = () => {
    const vh = getViewportHeight() * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  updateVH();
  window.addEventListener('resize', updateVH);
  
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateVH);
  }
};