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
  const totalStepsRef = useRef(totalSteps);
  const speedRef = useRef(speed);

  useEffect(() => {
    totalStepsRef.current = totalSteps;
  }, [totalSteps]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, [clearTimer]);

  const play = useCallback(() => {
    if (totalStepsRef.current <= 0) return;
    setCurrentStepIndex((current) => current >= totalStepsRef.current - 1 ? 0 : current);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    clearTimer();

    if (!isPlaying || totalStepsRef.current <= 0) {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setCurrentStepIndex((current) => {
        const lastStep = Math.max(0, totalStepsRef.current - 1);
        if (current >= lastStep) {
          setIsPlaying(false);
          clearTimer();
          return current;
        }
        return current + 1;
      });
    }, SPEED_MS[speedRef.current]);

    return clearTimer;
  }, [isPlaying, speed, clearTimer]);

  const handleNext = useCallback(() => {
    pause();
    setCurrentStepIndex((current) => Math.min(current + 1, Math.max(0, totalStepsRef.current - 1)));
  }, [pause]);

  const handlePrev = useCallback(() => {
    pause();
    setCurrentStepIndex((current) => Math.max(current - 1, 0));
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
