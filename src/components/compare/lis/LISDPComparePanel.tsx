import React from 'react';
import { LISSequenceView } from '../../viz/LISSequenceView';
import type { Step } from '../../../types/step.types';

interface LISDPComparePanelProps {
  step: Step;
  recursiveCalls: number;
}

const asNumber = (value: unknown, fallback = 0) => (
  typeof value === 'number' && Number.isFinite(value) ? value : fallback
);

export const LISDPComparePanel: React.FC<LISDPComparePanelProps> = ({ step, recursiveCalls }) => {
  const metadata = step.metadata ?? {};
  const transitions = step.metrics.operationsCount;
  const updates = asNumber(metadata.updates);
  const states = Array.isArray(metadata.dp) ? metadata.dp.length : step.metrics.statesStored;
  const saved = Math.max(0, recursiveCalls - transitions);

  return (
    <section className="lis-compare-panel lis-compare-panel--dp">
      <div className="lis-compare-panel-header">
        <div>
          <span className="lis-compare-kicker">Dynamic Programming</span>
          <h3>O(n²) State Reuse</h3>
        </div>
        <span className="lis-complexity lis-complexity--dp">O(n²)</span>
      </div>

      <LISSequenceView step={step} />

      <div className="lis-panel-message">
        {String(step.explanation?.variables?.desc ?? 'DP stores the best LIS ending at each index.')}
      </div>

      <div className="lis-metric-grid">
        <div><strong>{states}</strong><span>States computed</span></div>
        <div><strong>{updates}</strong><span>Updates</span></div>
        <div><strong>{transitions}</strong><span>Transitions checked</span></div>
        <div><strong>{saved}</strong><span>Recursive expansions avoided</span></div>
      </div>

      <div className="lis-teaching-card">
        DP stores the best LIS ending at each index, then reuses those states instead of expanding every take/skip branch.
      </div>
    </section>
  );
};
