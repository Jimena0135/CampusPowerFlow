import { useState, useEffect, useCallback } from 'react';

interface CanvasDimensions {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useResponsiveCanvas(containerRef: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: window.innerWidth || 1200,
    height: window.innerHeight || 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  const updateDimensions = useCallback(() => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calcular dimensiones del canvas basado en el contenedor o ventana
    let canvasWidth = windowWidth;
    let canvasHeight = windowHeight;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      canvasWidth = rect.width;
      canvasHeight = rect.height;
    } else {
      // Fallback: usar dimensiones de ventana menos header/toolbars
      canvasHeight = windowHeight - 120; // Resta espacio para header y toolbar
    }

    // Breakpoints responsivos
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;
    const isDesktop = windowWidth >= 1024;

    // Ajustar dimensiones según el tipo de dispositivo
    if (isMobile) {
      canvasWidth = Math.max(canvasWidth - 20, 320); // Mínimo 320px para móviles
      canvasHeight = Math.max(canvasHeight - 40, 400); // Más altura en móviles
    } else if (isTablet) {
      canvasWidth = Math.max(canvasWidth - 40, 600); // Mínimo 600px para tablets
      canvasHeight = Math.max(canvasHeight - 60, 500);
    } else {
      canvasWidth = Math.max(canvasWidth - 60, 800); // Mínimo 800px para desktop
      canvasHeight = Math.max(canvasHeight - 80, 600);
    }

    setDimensions({
      width: canvasWidth,
      height: canvasHeight,
      isMobile,
      isTablet,
      isDesktop,
    });
  }, [containerRef]);

  useEffect(() => {
    // Actualizar dimensiones iniciales
    updateDimensions();

    // Crear un ResizeObserver para observar cambios en el contenedor
    let resizeObserver: ResizeObserver | null = null;
    
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(containerRef.current);
    }

    // Observar cambios en el tamaño de la ventana
    const handleResize = () => {
      updateDimensions();
    };

    // Observar cambios de orientación en móviles
    const handleOrientationChange = () => {
      setTimeout(updateDimensions, 200); // Delay para que complete la rotación
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [updateDimensions]);

  return dimensions;
}
