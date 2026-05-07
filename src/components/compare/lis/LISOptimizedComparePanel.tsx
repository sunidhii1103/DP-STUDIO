import React from 'react';
import type { LISOptimizedFrame } from './lisCompareData';

interface LISOptimizedComparePanelProps {
  frame: LISOptimizedFrame;
}

export const LISOptimizedComparePanel: React.FC<LISOptimizedComparePanelProps> = ({ frame }) => {
  const maxSlots = Math.max(
    frame.tails.length,
    frame.previousTails.length,
    (frame.targetPosition ?? -1) + 1,
    (frame.high ?? -1) + 1,
    1,
  );

  const pointerFor = (index: number) => {
    const labels: string[] = [];
    if (frame.low === index) labels.push('LOW');
    if (frame.high === index) labels.push('HIGH');
    if (frame.mid === index) labels.push('MID');
    return labels;
  };

  const actionLabel = frame.action === 'append'
    ? 'APPEND'
    : frame.action === 'replace'
      ? 'REPLACE'
      : frame.action === 'keep'
        ? 'KEEP'
        : frame.action === 'done'
          ? 'DONE'
          : 'SEARCH';

  return (
    <section className="lis-compare-panel lis-compare-panel--optimized" data-tour="lis-optimized-panel">
      <div className="lis-compare-panel-header">
        <div>
          <span className="lis-compare-kicker">Binary Search</span>
          <h3>Optimized Tails</h3>
        </div>
        <span className="lis-complexity lis-complexity--optimized">O(n log n)</span>
      </div>

      <div className="lis-optimized-focus">
        <span>Current value</span>
        <strong>{frame.activeValue ?? 'done'}</strong>
        <small>{frame.activeIndex === null ? 'all values processed' : `nums[${frame.activeIndex}]`}</small>
      </div>

      <div className={[
        'lis-comparison-feedback',
        `lis-comparison-feedback--${frame.comparisonTone}`,
      ].join(' ')}>
        <span>{actionLabel}</span>
        <strong>{frame.comparisonText}</strong>
      </div>

      <div className="lis-binary-range">
        <div className="lis-range-track">
          {Array.from({ length: maxSlots }, (_unused, index) => {
            const inRange = frame.low !== null && frame.high !== null && index >= frame.low && index < frame.high;
            const isMid = frame.mid === index;
            const isTarget = frame.targetPosition === index;
            const pointers = pointerFor(index);

            return (
              <div
                key={index}
                className={[
                  'lis-range-slot',
                  inRange ? 'lis-range-slot--range' : '',
                  isMid ? 'lis-range-slot--mid' : '',
                  isTarget ? 'lis-range-slot--target' : '',
                  !inRange && frame.action === 'search' ? 'lis-range-slot--dimmed' : '',
                ].filter(Boolean).join(' ')}
              >
                {pointers.length > 0 && (
                  <b className={pointers.length > 1 ? 'lis-pointer-chip lis-pointer-chip--merged' : 'lis-pointer-chip'}>
                    {pointers.join(' / ')}
                  </b>
                )}
                <span>{index}</span>
                {isMid && <small>mid</small>}
                {isTarget && <small>pos</small>}
              </div>
            );
          })}
        </div>
        <p>low = {frame.low ?? '-'} | high = {frame.high ?? '-'} | mid = {frame.mid ?? '-'}</p>
      </div>

      <div className="lis-tails-board" aria-label="Optimized tails array">
        {Array.from({ length: maxSlots }, (_unused, index) => {
          const value = frame.tails[index];
          const previousValue = frame.previousTails[index];
          const isTarget = frame.targetPosition === index;
          const wasChanged = previousValue !== value;

          return (
            <div
              key={index}
              className={[
                'lis-tail-card',
                value === undefined ? 'lis-tail-card--empty' : '',
                isTarget ? 'lis-tail-card--target' : '',
                wasChanged && value !== undefined ? 'lis-tail-card--changed' : '',
              ].filter(Boolean).join(' ')}
            >
              <span>len {index + 1}</span>
              <strong>{value ?? '-'}</strong>
              <small>{wasChanged && value !== undefined ? actionLabel : value === undefined ? 'empty' : 'tail'}</small>
            </div>
          );
        })}
      </div>

      <div className="lis-panel-message">{frame.message}</div>

      <div className="lis-caption-row">
        <span>Smaller tail keeps future subsequences flexible.</span>
        <span>{frame.caption}</span>
        <span>We do not build the actual LIS here, only optimal tails.</span>
      </div>

      <div className="lis-metric-grid">
        <div><strong>{frame.metrics.binarySearches}</strong><span>Binary searches</span></div>
        <div><strong>{frame.metrics.replacements}</strong><span>Replacements</span></div>
        <div><strong>{frame.metrics.appends}</strong><span>Appends</span></div>
        <div><strong>{frame.metrics.comparisonsAvoided}</strong><span>Comparisons avoided</span></div>
      </div>

      <div className="lis-teaching-card">
        tails[] is not always the actual LIS. It stores the smallest possible tail for an increasing subsequence of each length.
      </div>
    </section>
  );
};
