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
    <div className="app-playback-toolbar" style={{
      width: '100%',
      padding: '0.75rem 1.5rem',
      backgroundColor: 'var(--color-bg-elevated)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button 
          onClick={isPlaying ? pause : play}
          style={{
            padding: '0.5rem 1.5rem', 
            backgroundColor: isPlaying ? 'var(--color-error)' : 'var(--color-success)',
            color: 'white',
            borderRadius: '9999px',
            fontWeight: 'bold',
            minWidth: '100px',
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button 
          onClick={handlePrev} 
          disabled={currentStepIndex === 0}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            borderRadius: '9999px',
            border: '1px solid var(--color-border-subtle)',
            opacity: currentStepIndex === 0 ? 0.5 : 1,
            fontWeight: 'bold'
          }}
        >
          Prev
        </button>
        
        <button 
          onClick={handleNext} 
          disabled={currentStepIndex === totalSteps - 1}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            borderRadius: '9999px',
            border: '1px solid var(--color-border-subtle)',
            opacity: currentStepIndex === totalSteps - 1 ? 0.5 : 1,
            fontWeight: 'bold'
          }}
        >
          Next
        </button>

        <span style={{ color: 'var(--color-text-secondary)', marginLeft: '1rem', fontFamily: 'var(--font-family-mono)' }}>
          Step {Math.min(currentStepIndex + 1, totalSteps)} / {totalSteps}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        <strong style={{ color: 'var(--color-text-secondary)', marginRight: '0.5rem', fontSize: '0.9rem' }}>Speed:</strong>
        {(['Slow', 'Medium', 'Fast'] as Speed[]).map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: speed === s ? 'var(--color-accent-primary)' : 'var(--color-bg-tertiary)',
              color: speed === s ? '#fff' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: speed === s ? 'bold' : 'normal',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};
