import React from 'react';
import type { AlgorithmId } from '../../types/step.types';
import './tutorial.css';

interface TutorialOverlayProps {
  algorithm: AlgorithmId;
  open: boolean;
  onClose: (completed: boolean) => void;
}

interface TourStep {
  selector?: string;
  title: string;
  body: string;
  tip?: string;
}

const algorithmTip = (algorithm: AlgorithmId): TourStep => {
  if (algorithm === 'mcm') {
    return {
      selector: '[data-tour="visualization-panel"]',
      title: 'MCM Interval DP',
      body: 'Matrix Chain Multiplication fills intervals diagonally. Shorter chains are solved first so longer chains can reuse them.',
      tip: 'In compare mode, diagonal waves show the bottom-up traversal order.',
    };
  }
  if (algorithm === 'lis') {
    return {
      selector: '[data-tour="visualization-panel"]',
      title: 'LIS Sequence Thinking',
      body: 'LIS tracks sequence order. In single mode, parent links reconstruct the subsequence; in compare mode, tails[] shows the O(n log n) leap.',
      tip: 'tails[] stores best possible tails, not necessarily the final subsequence.',
    };
  }
  if (algorithm === 'knapsack') {
    return {
      selector: '[data-tour="visualization-panel"]',
      title: 'Knapsack Decisions',
      body: 'Each state compares include vs exclude. The table records the best value under a capacity limit.',
      tip: 'Dependency cells show where each include/exclude option reads from.',
    };
  }
  if (algorithm === 'fibonacci') {
    return {
      selector: '[data-tour="metrics-panel"]',
      title: 'Fibonacci Reuse',
      body: 'Memoization and tabulation reuse previously solved states instead of recomputing recursive branches.',
      tip: 'Cache hits mean a state was retrieved, not recomputed.',
    };
  }
  return {
    selector: '[data-tour="visualization-panel"]',
    title: 'String DP Paths',
    body: 'The highlighted dependencies show how the next state is built from neighboring states.',
    tip: 'Backtracking reconstructs the actual answer after the table has the optimal value.',
  };
};

const buildSteps = (algorithm: AlgorithmId): TourStep[] => [
  {
    title: 'Welcome to DP Studio',
    body: 'Explore dynamic programming through synchronized visuals, code, metrics, and guided explanations.',
    tip: 'You can skip this tour now and replay it from the Tutorial or help buttons.',
  },
  {
    selector: '[data-tour="algorithm-selector"]',
    title: 'Choose an Algorithm',
    body: 'Switch between Fibonacci, Knapsack, LCS, Edit Distance, MCM, and LIS without changing the playback system.',
  },
  {
    selector: '[data-tour="input-field"]',
    title: 'Tune the Input',
    body: 'Inputs are validated before steps are generated, so the visualization always receives a safe step timeline.',
  },
  {
    selector: '[data-tour="playback-controls"]',
    title: 'Playback Controls',
    body: 'Play, pause, step forward, and step backward through immutable algorithm steps.',
    tip: 'Yellow means the current state is being computed.',
  },
  {
    selector: '[data-tour="speed-controls"]',
    title: 'Speed',
    body: 'Adjust animation speed while preserving the same synchronized step index.',
  },
  {
    selector: '[data-tour="learning-mode"]',
    title: 'Learning Mode',
    body: 'Turn on contextual teaching notes that explain the action, the reason, and the core DP concept.',
  },
  {
    selector: '[data-tour="compare-mode"]',
    title: 'Compare Mode',
    body: 'Compare mode keeps multiple strategies synchronized conceptually so you can see why optimization wins.',
    tip: 'Red nodes indicate recomputation. Green highlights usually mean reused or finalized state.',
  },
  {
    selector: '[data-tour="metrics-panel"]',
    title: 'Metrics',
    body: 'Metrics distinguish calls, states, transitions, comparisons, and cache hits so the cost model stays precise.',
  },
  {
    selector: '[data-tour="code-panel"]',
    title: 'Code Sync',
    body: 'The active code line follows the current step, connecting the visual state to the exact operation.',
  },
  algorithmTip(algorithm),
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ algorithm, open, onClose }) => {
  const steps = React.useMemo(() => buildSteps(algorithm), [algorithm]);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null);
  const current = steps[Math.min(stepIndex, steps.length - 1)]!;

  React.useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => setStepIndex(0));
    return () => window.cancelAnimationFrame(id);
  }, [open, algorithm]);

  React.useEffect(() => {
    if (!open) return undefined;

    const updateTarget = () => {
      if (!current.selector) {
        setTargetRect(null);
        return;
      }
      const element = document.querySelector(current.selector);
      if (!element) {
        setTargetRect(null);
        return;
      }
      setTargetRect(element.getBoundingClientRect());
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, true);
    return () => {
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget, true);
    };
  }, [current, open]);

  if (!open) return null;

  const isLast = stepIndex === steps.length - 1;
  const cardStyle: React.CSSProperties = targetRect
    ? {
      left: Math.min(window.innerWidth - 380, Math.max(16, targetRect.left + targetRect.width / 2 - 180)),
      top: targetRect.bottom + 18 > window.innerHeight - 260 ? Math.max(16, targetRect.top - 250) : targetRect.bottom + 18,
    }
    : {};

  return (
    <div className="tutorial-layer" role="dialog" aria-modal="true" aria-label="DP Studio tutorial">
      <div className="tutorial-backdrop" />
      {targetRect && (
        <div
          className="tutorial-spotlight"
          style={{
            left: targetRect.left - 12,
            top: targetRect.top - 12,
            width: targetRect.width + 24,
            height: targetRect.height + 24,
          }}
        />
      )}
      <div className={targetRect ? 'tutorial-card tutorial-card--targeted' : 'tutorial-card'} style={cardStyle}>
        <div className="tutorial-progress-wrap">
          <div className="tutorial-progress-text">
            <span>Experience {stepIndex + 1} / {steps.length}</span>
            <button className="tutorial-skip-btn" type="button" onClick={() => onClose(false)}>Dismiss</button>
          </div>
          <div className="tutorial-progress-bar-bg">
            <div 
              className="tutorial-progress-bar-fill" 
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} 
            />
          </div>
        </div>
        
        <h3>{current.title}</h3>
        <p>{current.body}</p>
        
        {current.tip && <div className="tutorial-tip">{current.tip}</div>}
        
        <div className="tutorial-legends" aria-label="Visualization legends">
          <span><b className="legend-dot legend-dot--yellow" /> active</span>
          <span><b className="legend-dot legend-dot--green" /> computed</span>
          <span><b className="legend-dot legend-dot--red" /> recomputed</span>
        </div>
        
        <div className="tutorial-actions">
          <button 
            type="button" 
            disabled={stepIndex === 0} 
            onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="tutorial-primary"
            onClick={() => {
              if (isLast) onClose(true);
              else setStepIndex((value) => value + 1);
            }}
          >
            {isLast ? 'Complete Tour' : stepIndex === 0 ? 'Start Exploring' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface TutorialHelpButtonProps {
  onOpen: () => void;
}

export const TutorialHelpButton: React.FC<TutorialHelpButtonProps> = ({ onOpen }) => (
  <button type="button" className="tutorial-help-button" onClick={onOpen} aria-label="Open tutorial and legends">
    ?
  </button>
);
