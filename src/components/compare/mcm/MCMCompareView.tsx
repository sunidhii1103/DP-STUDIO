import React from 'react';
import { RecursivePanel } from './RecursivePanel';
import { MemoPanel } from './MemoPanel';
import { TabulationPanel } from './TabulationPanel';
import { SharedPlaybackController } from './SharedPlaybackController';
import type { MCMComparePanelId, MCMCompareTimeline } from './mcmCompareData';
import type { Speed } from '../../../hooks/usePlayback';

interface MCMCompareViewProps {
  timeline: MCMCompareTimeline;
  currentStepIndex: number;
  speed: Speed;
}

const panelTabs: Array<{ id: MCMComparePanelId; label: string }> = [
  { id: 'recursive', label: 'Recursive' },
  { id: 'memoization', label: 'Memoization' },
  { id: 'tabulation', label: 'Tabulation' },
];

export const MCMCompareView: React.FC<MCMCompareViewProps> = ({
  timeline,
  currentStepIndex,
  speed,
}) => {
  const [activePanel, setActivePanel] = React.useState<MCMComparePanelId>('recursive');
  const totalSteps = Math.max(1, timeline.frames.length);
  const frame = timeline.frames[Math.min(currentStepIndex, totalSteps - 1)] ?? timeline.frames[0];

  if (!frame) {
    return <div className="mcm-compare-view"><p className="mcm-compare-empty">No MCM compare data available.</p></div>;
  }

  return (
    <div className="mcm-compare-view">
      <div className="mcm-compare-topline">
        <div>
          <span className="mcm-compare-kicker">Matrix Chain Multiplication</span>
          <h2>Compare Recursion, Memoization, and Tabulation</h2>
        </div>
        {timeline.isLimited && (
          <div className="mcm-limit-notice">
            Compare mode is capped at 7 matrices to keep recursion responsive.
          </div>
        )}
      </div>

      <SharedPlaybackController
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        speed={speed}
        phaseLabel={frame.phaseLabel}
      />

      <div className="mcm-mobile-tabs" role="tablist" aria-label="MCM comparison panels">
        {panelTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activePanel === tab.id}
            className={activePanel === tab.id ? 'mcm-mobile-tab mcm-mobile-tab--active' : 'mcm-mobile-tab'}
            onClick={() => setActivePanel(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mcm-compare-grid" data-active-panel={activePanel}>
        <div className="mcm-compare-panel-shell" data-panel="recursive">
          <RecursivePanel nodes={timeline.recursiveNodes} frame={frame.recursive} />
        </div>
        <div className="mcm-compare-panel-shell" data-panel="memoization">
          <MemoPanel frame={frame.memoization} matrixCount={timeline.matrixCount} />
        </div>
        <div className="mcm-compare-panel-shell" data-panel="tabulation">
          <TabulationPanel frame={frame.tabulation} />
        </div>
      </div>
    </div>
  );
};
