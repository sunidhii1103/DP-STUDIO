import React from 'react';
import type { Step } from '../../types/step.types';
import './lisSequence.css';

interface LISSequenceViewProps {
  step: Step;
}

const asNumberArray = (value: unknown): number[] => (
  Array.isArray(value) ? value.filter((item): item is number => typeof item === 'number') : []
);

const asNumber = (value: unknown, fallback = -1) => (
  typeof value === 'number' && Number.isFinite(value) ? value : fallback
);

export const LISSequenceView: React.FC<LISSequenceViewProps> = ({ step }) => {
  const metadata = step.metadata ?? {};
  const nums = asNumberArray(metadata.nums);
  const dp = asNumberArray(metadata.dp);
  const parent = asNumberArray(metadata.parent);
  const pathIndices = new Set(asNumberArray(metadata.pathIndices));
  const currentIndex = asNumber(metadata.currentIndex);
  const compareIndex = asNumber(metadata.compareIndex);
  const chosenParentIndex = asNumber(metadata.chosenParentIndex);
  const phase = String(metadata.phase ?? 'dp');
  const sequenceSoFar = asNumberArray(metadata.sequenceSoFar);
  const lisLength = asNumber(metadata.lisLength, 1);

  if (nums.length === 0) return null;

  const activeParentLinks = parent
    .map((parentIndex, index) => ({ parentIndex, index }))
    .filter(({ parentIndex, index }) => parentIndex >= 0 && (pathIndices.has(index) || index === currentIndex || parentIndex === compareIndex));

  return (
    <div className="lis-visual" aria-label="Longest Increasing Subsequence sequence visualization">
      <div className="lis-visual-header">
        <div>
          <span className="lis-kicker">Sequence Flow</span>
          <strong>{phase === 'reconstruction' || phase === 'result' ? 'Following predecessor links' : 'Building LIS ending at each index'}</strong>
        </div>
        <div className="lis-summary-pill">LIS length {lisLength}</div>
      </div>

      <div className="lis-array-row">
        {nums.map((value, index) => {
          const isCurrent = index === currentIndex;
          const isCandidate = index === compareIndex;
          const isChosenParent = index === chosenParentIndex;
          const isPath = pathIndices.has(index);
          return (
            <div
              key={`${value}-${index}`}
              className={[
                'lis-array-card',
                isCurrent ? 'lis-array-card--current' : '',
                isCandidate ? 'lis-array-card--candidate' : '',
                isChosenParent ? 'lis-array-card--parent' : '',
                isPath ? 'lis-array-card--path' : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="lis-index">idx {index}</span>
              <strong>{value}</strong>
              <small>dp = {dp[index] ?? 1}</small>
              <em>{parent[index] === -1 || parent[index] === undefined ? 'start' : `parent ${parent[index]}`}</em>
            </div>
          );
        })}
      </div>

      <div className="lis-parent-map" aria-label="Predecessor links">
        {activeParentLinks.length > 0 ? (
          activeParentLinks.map(({ parentIndex, index }) => (
            <span key={`${parentIndex}-${index}`} className="lis-parent-link">
              {nums[parentIndex]} <b>→</b> {nums[index]}
            </span>
          ))
        ) : (
          <span className="lis-parent-link lis-parent-link--muted">No predecessor chosen yet</span>
        )}
      </div>

      <div className="lis-reconstruction-strip">
        <span>{phase === 'reconstruction' || phase === 'result' ? 'Reconstructed subsequence' : 'Best chain preview'}</span>
        <strong>
          {sequenceSoFar.length > 0
            ? sequenceSoFar.join(' → ')
            : pathIndices.size > 0
              ? [...pathIndices].sort((a, b) => a - b).map((index) => nums[index]).join(' → ')
              : 'waiting'}
        </strong>
      </div>

      <div className="lis-legend">
        <span><b className="lis-dot lis-dot--current" /> current nums[i]</span>
        <span><b className="lis-dot lis-dot--candidate" /> candidate nums[j]</span>
        <span><b className="lis-dot lis-dot--parent" /> chosen predecessor</span>
        <span><b className="lis-dot lis-dot--path" /> reconstruction path</span>
      </div>
    </div>
  );
};
