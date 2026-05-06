import { useState, useEffect, useRef, useCallback } from 'react';

export type Speed = 'Slow' | 'Medium' | 'Fast';

const SPEED_MS: Record<Speed, number> = {
  Slow: 1500,
  Medium: 800,
  Fast: 300,
};

export function usePlayback(totalSteps: number) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('Medium');
  const timerRef = useRef<number | null>(null);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (totalSteps === 0) return;
    
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [currentStepIndex, totalSteps]);

  useEffect(() => {
    if (!isPlaying || totalSteps === 0) {
      return;
    }

    timerRef.current = window.setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= totalSteps - 1) {
          pause();
          return prev;
        }
        return prev + 1;
      });
    }, SPEED_MS[speed]);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, speed, totalSteps, pause]);

  const handleNext = useCallback(() => {
    pause(); 
    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [pause, totalSteps]);

  const handlePrev = useCallback(() => {
    pause(); 
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, [pause]);

  return {
    currentStepIndex,
    setCurrentStepIndex,
    isPlaying,
    speed,
    play,
    pause,
    setSpeed,
    handleNext,
    handlePrev,
  };
}
