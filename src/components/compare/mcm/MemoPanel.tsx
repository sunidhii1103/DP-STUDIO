import React from 'react';
import type { MCMMemoFrame } from './mcmCompareData';

interface MemoPanelProps {
  frame: MCMMemoFrame;
  matrixCount: number;
}

const keyFor = (i: number, j: number) => `${i},${j}`;

export const MemoPanel: React.FC<MemoPanelProps> = ({ frame, matrixCount }) => {
  const computed = React.useMemo(() => new Set(frame.computedKeys), [frame.computedKeys]);
  const pending = React.useMemo(() => new Set(frame.pendingKeys), [frame.pendingKeys]);

  return (
    <section className="mcm-compare-panel mcm-compare-panel--memo">
      <div className="mcm-compare-panel-header">
        <div>
          <span className="mcm-compare-kicker">Top Down</span>
          <h3>Memoization Cache</h3>
        </div>
        <span className="mcm-compare-complexity mcm-compare-complexity--cool">O(n^3)</span>
      </div>

      <div className="mcm-memo-grid" style={{ ['--mcm-size' as string]: matrixCount }}>
        {Array.from({ length: matrixCount }, (_, i) =>
          Array.from({ length: matrixCount }, (_unused, j) => {
            const key = keyFor(i, j);
            const isInvalid = i > j;
            const isActive = frame.activeKey === key;
            const isHit = frame.cacheHitKey === key;
            const isComputed = computed.has(key);
            const isPending = pending.has(key);
            return (
              <div
                key={key}
                className={[
                  'mcm-memo-cell',
                  isInvalid ? 'mcm-memo-cell--invalid' : '',
                  isComputed ? 'mcm-memo-cell--computed' : '',
                  isPending ? 'mcm-memo-cell--pending' : '',
                  isActive ? 'mcm-memo-cell--active' : '',
                  isHit ? 'mcm-memo-cell--hit' : '',
                ].filter(Boolean).join(' ')}
                title={isHit ? 'cache hit: reused memoized state' : isComputed ? 'memoized state available for reuse' : undefined}
              >
                {!isInvalid && (
                  <>
                    <span>{`A${i + 1}${j === i ? '' : `-${j + 1}`}`}</span>
                    {isHit && <small>cache hit</small>}
                    {!isHit && isComputed && <small>memoized</small>}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mcm-compare-message">{frame.message}</div>

      <div className="mcm-compare-metrics">
        <div><strong>{frame.metrics.computedOnce}</strong><span>Computed Once</span></div>
        <div><strong>{frame.metrics.cacheHits}</strong><span>Cache Hits</span></div>
        <div><strong>{frame.metrics.savedCalls}</strong><span>Saved Calls</span></div>
        <div><strong>{frame.metrics.reusePercentage}%</strong><span>Reuse</span></div>
      </div>

      <div className="mcm-compare-teaching-card">
        Cache prevents repeated interval solving. Green flashes mean the answer is reused instead of recomputed.
      </div>
    </section>
  );
};
