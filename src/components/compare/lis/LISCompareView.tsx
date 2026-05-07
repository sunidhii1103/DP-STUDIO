import React from 'react';
import type { Speed } from '../../../hooks/usePlayback';
import type { LISCompareTimeline } from './lisCompareData';
import { LISRecursiveComparePanel } from './LISRecursiveComparePanel';
import { LISDPComparePanel } from './LISDPComparePanel';
import { LISOptimizedComparePanel } from './LISOptimizedComparePanel';
import './lisCompare.css';

interface LISCompareViewProps {
  timeline: LISCompareTimeline;
  currentStepIndex: number;
  speed: Speed;
  learningMode: boolean;
  pause: () => void;
}

const tourSteps = [
  {
    title: 'Compare Mode',
    body: 'Three strategies share one playback timeline so you can see brute force, DP reuse, and binary search progress together.',
  },
  {
    title: 'Playback Controls',
    body: 'Use Play, Prev, Next, and speed controls to move through synchronized logical moments.',
  },
  {
    title: 'Recursive Tree',
    body: 'Orange branches show take/skip exploration. Red states are repeated subproblems that brute force solves again.',
  },
  {
    title: 'DP Reconstruction',
    body: 'The center panel reuses dp[i] and parent links to rebuild an actual LIS after the table is ready.',
  },
  {
    title: 'Binary Search Optimization',
    body: 'The right panel maintains optimal tails. This is why LIS can leap from O(n^2) to O(n log n).',
  },
  {
    title: 'Learning Mode',
    body: 'Turn Learning Mode on when you want contextual hints and algorithm-specific explanations while playback continues normally.',
  },
];

const readBoolean = (key: string) => (
  typeof window !== 'undefined' && window.localStorage.getItem(key) === 'true'
);

export const LISCompareView: React.FC<LISCompareViewProps> = ({
  timeline,
  currentStepIndex,
  speed,
  learningMode,
  pause,
}) => {
  const [tourOpen, setTourOpen] = React.useState(() => !readBoolean('dpstudio:lisCompareTourDone'));
  const [tourIndex, setTourIndex] = React.useState(0);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const totalSteps = Math.max(1, timeline.frames.length);
  const frame = timeline.frames[Math.min(currentStepIndex, totalSteps - 1)] ?? timeline.frames[0];
  const progress = totalSteps <= 1 ? 0 : (Math.min(currentStepIndex, totalSteps - 1) / (totalSteps - 1)) * 100;

  React.useEffect(() => {
    window.localStorage.removeItem('dpstudio:lisTutorialMode');
  }, []);

  if (!frame) {
    return <div className="lis-compare-view"><p className="lis-compare-empty">No LIS compare data available.</p></div>;
  }

  const completeTour = () => {
    window.localStorage.setItem('dpstudio:lisCompareTourDone', 'true');
    setTourOpen(false);
  };

  return (
    <div className="lis-compare-view">
      <div className="lis-compare-topline">
        <div>
          <span className="lis-compare-kicker">Longest Increasing Subsequence</span>
          <h2>Compare Recursion, DP, and Binary Search</h2>
        </div>
        <div className="lis-top-actions">
          {timeline.isRecursiveLimited && (
            <div className="lis-limit-notice">
              Recursive tree uses the first {timeline.recursiveInputLength} values to keep exponential branching responsive.
            </div>
          )}
          <button onClick={() => { pause(); setTourOpen(true); }}>Walkthrough</button>
          <button onClick={() => setShortcutsOpen(true)}>Shortcuts</button>
        </div>
      </div>

      <div className="lis-sync-strip" aria-label="LIS synchronized compare playback" data-tour="lis-playback">
        <div>
          <span className="lis-compare-kicker">Synchronized Compare Playback</span>
          <strong>Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}</strong>
        </div>
        <div className="lis-sync-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
        <div className="lis-sync-meta">
          <span>{frame.phaseLabel}</span>
          <span>{speed}</span>
        </div>
      </div>

      <section className="lis-why-banner" aria-label="Why LIS optimization wins">
        <div>
          <span className="lis-compare-kicker">Why Optimization Wins</span>
          <strong>
            Recursion explored {timeline.summary.recursiveCalls} calls, DP checked {timeline.summary.dpTransitions} transitions, and binary search needed {timeline.summary.binarySearchOps} comparisons.
          </strong>
        </div>
        <div className="lis-why-grid">
          <div><strong>{timeline.summary.recursiveCalls}</strong><span>Recursive calls</span></div>
          <div><strong>{timeline.summary.dpTransitions}</strong><span>DP transitions</span></div>
          <div><strong>{timeline.summary.binarySearchOps}</strong><span>Binary search ops</span></div>
          <div><strong>{timeline.summary.savedWork}</strong><span>Computations avoided</span></div>
        </div>
      </section>

      {learningMode && (
        <section className="lis-learning-strip" aria-label="LIS compare learning mode" data-tour="lis-learning">
          <div><strong>Recursive</strong><span>Brute force explores all subsequences by branching take/skip.</span></div>
          <div><strong>DP</strong><span>We reuse the best subsequence ending at earlier positions.</span></div>
          <div><strong>Optimized</strong><span>Binary search maintains compact optimal tails for each length.</span></div>
        </section>
      )}

      {learningMode && (
        <section className="lis-hint-strip" aria-label="Contextual LIS tutorial hints">
          <span>Try slowing playback speed for replacement steps.</span>
          <span>Notice repeated recursion states glowing red.</span>
          <span>Observe how DP avoids recomputation with stored states.</span>
        </section>
      )}

      <div className="lis-compare-grid">
        <LISRecursiveComparePanel nodes={timeline.recursiveNodes} frame={frame.recursive} />
        <LISDPComparePanel step={frame.dpStep} recursiveCalls={frame.recursive.stats.calls} />
        <LISOptimizedComparePanel frame={frame.optimized} />
      </div>

      {tourOpen && (
        <div className="lis-tour-backdrop" role="dialog" aria-modal="true" aria-label="LIS compare walkthrough">
          <div className="lis-tour-card">
            <span className="lis-compare-kicker">Walkthrough {tourIndex + 1} of {tourSteps.length}</span>
            <h3>{tourSteps[tourIndex]!.title}</h3>
            <p>{tourSteps[tourIndex]!.body}</p>
            <div className="lis-tour-progress" aria-hidden="true">
              {tourSteps.map((step, index) => (
                <span key={step.title} className={index <= tourIndex ? 'is-active' : ''} />
              ))}
            </div>
            <div className="lis-tour-actions">
              <button onClick={completeTour}>Skip</button>
              <button
                onClick={() => {
                  if (tourIndex >= tourSteps.length - 1) completeTour();
                  else setTourIndex((index) => index + 1);
                }}
              >
                {tourIndex >= tourSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {shortcutsOpen && (
        <div className="lis-tour-backdrop" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <div className="lis-tour-card lis-shortcuts-card">
            <span className="lis-compare-kicker">Keyboard Shortcuts</span>
            <h3>Move faster when exploring</h3>
            <dl>
              <div><dt>Space</dt><dd>Play or pause</dd></div>
              <div><dt>Arrow Right</dt><dd>Next step</dd></div>
              <div><dt>Arrow Left</dt><dd>Previous step</dd></div>
              <div><dt>+</dt><dd>Zoom recursion tree in</dd></div>
              <div><dt>-</dt><dd>Zoom recursion tree out</dd></div>
            </dl>
            <div className="lis-tour-actions">
              <button onClick={() => setShortcutsOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
