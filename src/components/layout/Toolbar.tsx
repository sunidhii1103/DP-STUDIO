import React from 'react';
import type { Speed } from '../../hooks/usePlayback';

interface ToolbarProps {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  handlePrev: () => void;
  handleNext: () => void;
  speed: Speed;
  setSpeed: (s: Speed) => void;
  currentStepIndex: number;
  totalSteps: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isPlaying, play, pause, handlePrev, handleNext, speed, setSpeed, currentStepIndex, totalSteps
}) => {
  return (
    <div data-tour="step-3" className="app-playback-toolbar">
      <div className="app-playback-controls">
        <button 
          onClick={isPlaying ? pause : play}
          className={`play-btn ${isPlaying ? 'play-btn-pause' : 'play-btn-play'}`}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button 
          onClick={handlePrev} 
          disabled={currentStepIndex === 0}
          className="step-btn step-btn-prev"
        >
          Prev
        </button>
        
        <button 
          onClick={handleNext} 
          disabled={currentStepIndex === totalSteps - 1}
          className="step-btn step-btn-next"
        >
          Next
        </button>

        <span className="step-counter">
          Step {Math.min(currentStepIndex + 1, totalSteps)} / {totalSteps}
        </span>
      </div>

      <div className="app-playback-speed">
        <strong className="speed-label">Speed:</strong>
        <div className="speed-btn-group">
          {(['Slow', 'Medium', 'Fast'] as Speed[]).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`speed-btn ${speed === s ? 'speed-btn-active' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
