import { useState, useEffect, useRef, useCallback } from 'react';

interface UseResizableProps {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  direction: 'left' | 'right';
  storageKey?: string; // Clave para persistir en localStorage
  onResize?: (width: number) => void;
}

export function useResizable({
  initialWidth,
  minWidth,
  maxWidth,
  direction,
  storageKey,
  onResize
}: UseResizableProps) {
  // Inicializar con valor de localStorage si existe
  const getInitialWidth = () => {
    if (storageKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedWidth = parseInt(stored, 10);
        return Math.min(Math.max(parsedWidth, minWidth), maxWidth);
      }
    }
    return initialWidth;
  };

  const [width, setWidth] = useState(getInitialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Persistir cambios en localStorage
  const updateWidth = useCallback((newWidth: number) => {
    setWidth(newWidth);
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newWidth.toString());
    }
    onResize?.(newWidth);
  }, [storageKey, onResize]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = width;
    
    // Agregar clase al body para prevenir selección de texto
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startX.current;
    const newWidth = direction === 'left' 
      ? startWidth.current + deltaX 
      : startWidth.current - deltaX;

    const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    
    updateWidth(clampedWidth);
  }, [isResizing, direction, minWidth, maxWidth, updateWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    
    // Restaurar estilos del body
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const handleDoubleClick = useCallback(() => {
    // Doble click para restaurar tamaño por defecto
    updateWidth(initialWidth);
  }, [initialWidth, updateWidth]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  return {
    width,
    isResizing,
    handleMouseDown,
    handleDoubleClick,
    setWidth: updateWidth
  };
}
