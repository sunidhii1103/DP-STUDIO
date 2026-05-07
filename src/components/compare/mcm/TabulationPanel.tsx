import React from 'react';
import { DPTable } from '../../viz/DPTable';
import type { MCMTabulationFrame } from './mcmCompareData';

interface TabulationPanelProps {
  frame: MCMTabulationFrame;
}

export const TabulationPanel: React.FC<TabulationPanelProps> = ({ frame }) => {
  return (
    <section className="mcm-compare-panel mcm-compare-panel--tab">
      <div className="mcm-compare-panel-header">
        <div>
          <span className="mcm-compare-kicker">Bottom Up</span>
          <h3>Diagonal Tabulation</h3>
        </div>
        <span className="mcm-compare-complexity mcm-compare-complexity--bright">O(n^3)</span>
      </div>

      <div className="mcm-tab-stage">
        {frame.step ? (
          <DPTable snapshot={frame.step.tableSnapshot} activeIndices={frame.step.activeIndices} />
        ) : (
          <p className="mcm-compare-empty">Tabulation table is waiting for valid steps.</p>
        )}
      </div>

      <div className="mcm-tab-detail-grid">
        <div>
          <span>Interval Length</span>
          <strong>{frame.intervalLength ?? '-'}</strong>
        </div>
        <div>
          <span>Current Chain</span>
          <strong>{frame.interval}</strong>
        </div>
        <div>
          <span>Best Split</span>
          <strong>{frame.bestSplit}</strong>
        </div>
      </div>

      <div className="mcm-formula-box">
        <span>Cost formula</span>
        <code>{frame.formula}</code>
      </div>

      <div className="mcm-compare-message">{frame.message}</div>

      <div className="mcm-compare-teaching-card">
        Bottom-up order guarantees dependencies are solved first, then longer intervals choose their best split.
      </div>
    </section>
  );
};
