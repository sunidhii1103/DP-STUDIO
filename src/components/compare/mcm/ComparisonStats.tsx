import React from 'react';
import type { MCMCompareFrame, MCMCompareSummary } from './mcmCompareData';

interface ComparisonStatsProps {
  frame: MCMCompareFrame;
  summary: MCMCompareSummary;
}

type MetricTone = 'recursive' | 'memo' | 'tab' | 'summary';

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  tone: MetricTone;
  caption?: string;
}

const useCountUp = (value: number, duration = 420) => {
  const [display, setDisplay] = React.useState(value);
  const lastValue = React.useRef(value);

  React.useEffect(() => {
    const from = lastValue.current;
    const to = value;
    if (from === to) return undefined;

    let frameId = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (to - from) * eased);
      setDisplay(next);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        lastValue.current = to;
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [duration, value]);

  return display;
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, suffix = '', tone, caption }) => {
  const animatedValue = useCountUp(value);

  return (
    <div className={`mcm-stat-card mcm-stat-card--${tone}`}>
      <span>{label}</span>
      <strong>{animatedValue.toLocaleString()}{suffix}</strong>
      {caption && <small>{caption}</small>}
    </div>
  );
};

export const ComparisonStats: React.FC<ComparisonStatsProps> = ({ frame, summary }) => {
  const recursive = frame.recursive.stats;
  const memo = frame.memoization.metrics;
  const tab = frame.tabulation;
  const currentSavedWork = Math.max(0, recursive.calls - memo.computedOnce);
  const currentAvoided = recursive.calls > 0 ? Math.round((currentSavedWork / recursive.calls) * 100) : 0;

  return (
    <section className="mcm-stats-section" aria-label="Why DP wins comparison statistics">
      <div className="mcm-master-summary">
        <div>
          <span className="mcm-compare-kicker">Why DP Wins</span>
          <h3>DP avoided {summary.redundantAvoidedPercentage}% redundant computations.</h3>
        </div>
        <div className="mcm-master-summary-grid">
          <MetricCard tone="summary" label="Recursive calls" value={summary.recursiveCalls} />
          <MetricCard tone="summary" label="Memoized states" value={summary.memoizedStates} />
          <MetricCard tone="summary" label="Saved work" value={summary.savedWork} caption="calls not recomputed" />
        </div>
      </div>

      <div className="mcm-stat-groups">
        <div className="mcm-stat-group mcm-stat-group--recursive">
          <div className="mcm-stat-group-title">
            <span>Recursive</span>
            <strong>waste grows fast</strong>
          </div>
          <MetricCard tone="recursive" label="Total recursive calls" value={recursive.calls} />
          <MetricCard tone="recursive" label="Repeated states" value={recursive.repeatedStates} />
          <MetricCard tone="recursive" label="Max recursion depth" value={recursive.depth} />
          <MetricCard tone="recursive" label="Growth signal" value={recursive.estimatedGrowth} />
        </div>

        <div className="mcm-stat-group mcm-stat-group--memo">
          <div className="mcm-stat-group-title">
            <span>Memoization</span>
            <strong>reuse becomes visible</strong>
          </div>
          <MetricCard tone="memo" label="Unique states computed" value={memo.computedOnce} />
          <MetricCard tone="memo" label="Cache hits" value={memo.cacheHits} />
          <MetricCard tone="memo" label="Saved recomputations" value={currentSavedWork} />
          <MetricCard tone="memo" label="Reuse percentage" value={Math.max(memo.reusePercentage, currentAvoided)} suffix="%" />
        </div>

        <div className="mcm-stat-group mcm-stat-group--tab">
          <div className="mcm-stat-group-title">
            <span>Tabulation</span>
            <strong>deterministic order</strong>
          </div>
          <MetricCard tone="tab" label="States filled once" value={tab.statesFilledOnce} />
          <MetricCard tone="tab" label="Dependency reuse count" value={tab.dependencyReuseCount} />
          <MetricCard tone="tab" label="Target states" value={summary.tabulatedStates} />
          <div className="mcm-stat-card mcm-stat-card--tab">
            <span>Traversal</span>
            <strong>{tab.deterministicTraversal}</strong>
            <small>{tab.traversalLabel}</small>
          </div>
        </div>
      </div>
    </section>
  );
};
