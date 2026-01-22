
import { useState, useEffect, useRef } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

export function useDimensions(ref: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const updateDimensions = () => {
      if (ref.current) {
        const { width, height } = ref.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial measurement
    updateDimensions();

    // Set up ResizeObserver
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(() => {
        updateDimensions();
      });

      if (ref.current) {
        resizeObserverRef.current.observe(ref.current);
      }
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', updateDimensions);
    }

    return () => {
      if (resizeObserverRef.current && ref.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener('resize', updateDimensions);
      }
    };
  }, [ref]);

  return dimensions;
}
