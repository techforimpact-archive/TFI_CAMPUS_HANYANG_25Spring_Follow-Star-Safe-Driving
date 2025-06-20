import { useState, useEffect } from 'react';

export const useScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const scaleValue = computedStyle.getPropertyValue('--scale').trim();
      setScale(parseFloat(scaleValue) || 1);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return scale;
};