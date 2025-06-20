// src/hooks/useDragPrevention.ts
import { useEffect } from 'react';

export const useDragPrevention = () => {
  useEffect(() => {
    const preventDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const preventDrop = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const preventDragOver = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const preventContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('dragstart', preventDragStart);
    document.addEventListener('drop', preventDrop);
    document.addEventListener('dragover', preventDragOver);
    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('dragstart', preventDragStart);
      document.removeEventListener('drop', preventDrop);
      document.removeEventListener('dragover', preventDragOver);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);
};