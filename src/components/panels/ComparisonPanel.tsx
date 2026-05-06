import React, { useState } from 'react';
import { VisualPanel } from './VisualPanel';
import { CodePanel } from './CodePanel';

import type { Step } from '../../types/step.types';

interface ComparisonPanelProps {
  leftStep: Step;
  rightStep: Step;
  leftCode: string[];
  rightCode: string[];
  learningMode: boolean;
  algo: string;
  renderExplanation: (step: Step) => React.ReactNode;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ 
  leftStep, 
  rightStep, 
  leftCode, 
  rightCode, 
  learningMode, 
  algo,
  renderExplanation
}) => {
  if (!leftStep || !rightStep) return <div>No comparison data available</div>;

  const leftOps = leftStep.metrics.operationsCount;
  const rightOps = rightStep.metrics.operationsCount;
  const leftMem = leftStep.metrics.statesStored;
  const rightMem = rightStep.metrics.statesStored;

  const leftIsBetterTime = leftOps < rightOps;
  const rightIsBetterTime = rightOps < leftOps;

  const leftIsBetterSpace = leftMem < rightMem;
  const rightIsBetterSpace = rightMem < leftMem;

  const [codeTab, setCodeTab] = useState<'memoization' | 'tabulation'>('memoization');

  return (
    <div className="comparison-container">
      <div className="visual-comparison">
        {/* Memoization */}
        <div className="panel comparison-panel">
          <h3 style={{ textAlign: 'center', margin: '0 0 1rem 0', color: 'var(--color-text-primary)' }}>Memoization (Top-Down)</h3>
          {(algo === 'knapsack' || algo === 'lcs') && (
            <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.05)', color: 'var(--color-text-secondary)', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.1)', fontSize: '0.8rem', textAlign: 'center' }}>
              States may not perfectly sync step-by-step
            </div>
          )}
          <div className="visual-panel">
            <VisualPanel 
              step={leftStep} 
              learningMode={learningMode} 
              renderExplanation={renderExplanation}
              isBetterTime={leftIsBetterTime}
              isBetterSpace={leftIsBetterSpace}
            />
          </div>
        </div>

        {/* Tabulation */}
        <div className="panel comparison-panel">
          <h3 style={{ textAlign: 'center', margin: '0 0 1rem 0', color: 'var(--color-text-primary)' }}>Tabulation (Bottom-Up)</h3>
          {(algo === 'knapsack' || algo === 'lcs') && (
            <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.05)', color: 'var(--color-text-secondary)', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.1)', fontSize: '0.8rem', textAlign: 'center' }}>
              States may not perfectly sync step-by-step
            </div>
          )}
          <div className="visual-panel">
            <VisualPanel 
              step={rightStep} 
              learningMode={learningMode} 
              renderExplanation={renderExplanation}
              isBetterTime={rightIsBetterTime}
              isBetterSpace={rightIsBetterSpace}
            />
          </div>
        </div>
      </div>

      <div className="panel code-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button 
            style={{ flex: 1, padding: '12px', background: codeTab === 'memoization' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', color: codeTab === 'memoization' ? '#60a5fa' : 'var(--color-text-secondary)', borderBottom: codeTab === 'memoization' ? '2px solid #3b82f6' : '2px solid transparent' }}
            onClick={() => setCodeTab('memoization')}
          >
            Memoization
          </button>
          <button 
            style={{ flex: 1, padding: '12px', background: codeTab === 'tabulation' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', color: codeTab === 'tabulation' ? '#60a5fa' : 'var(--color-text-secondary)', borderBottom: codeTab === 'tabulation' ? '2px solid #3b82f6' : '2px solid transparent' }}
            onClick={() => setCodeTab('tabulation')}
          >
            Tabulation
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {codeTab === 'memoization' ? (
            <CodePanel code={leftCode} activeLine={leftStep.codeReference.lineNumber} />
          ) : (
            <CodePanel code={rightCode} activeLine={rightStep.codeReference.lineNumber} />
          )}
        </div>
      </div>
    </div>
  );
};
