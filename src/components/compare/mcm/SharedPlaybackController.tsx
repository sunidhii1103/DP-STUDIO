import React from 'react';
import type { Speed } from '../../../hooks/usePlayback';

interface SharedPlaybackControllerProps {
  currentStepIndex: number;
  totalSteps: number;
  speed: Speed;
  phaseLabel: string;
}

export const SharedPlaybackController: React.FC<SharedPlaybackControllerProps> = ({
  currentStepIndex,
  totalSteps,
  speed,
  phaseLabel,
}) => {
  const progress = totalSteps <= 1 ? 0 : (currentStepIndex / (totalSteps - 1)) * 100;

  return (
    <div className="mcm-sync-strip" aria-label="MCM synchronized playback status">
      <div>
        <span className="mcm-compare-kicker">Synchronized Compare Playback</span>
        <strong>Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}</strong>
      </div>
      <div className="mcm-sync-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="mcm-sync-meta">
        <span>{phaseLabel}</span>
        <span>{speed}</span>
      </div>
    </div>
  );
};
