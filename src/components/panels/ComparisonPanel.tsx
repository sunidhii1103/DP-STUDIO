import React from 'react';
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
  if (!leftStep || !rightStep) return <div className="comparison-empty">No comparison data available</div>;

  const leftOps = leftStep.metrics.operationsCount;
  const rightOps = rightStep.metrics.operationsCount;
  const leftMem = leftStep.metrics.statesStored;
  const rightMem = rightStep.metrics.statesStored;

  const leftIsBetterTime = leftOps < rightOps;
  const rightIsBetterTime = rightOps < leftOps;

  const leftIsBetterSpace = leftMem < rightMem;
  const rightIsBetterSpace = rightMem < leftMem;

  return (
    <div className="comparison-container comparison-container-responsive">
      <div className="comparison-column">
        <div className="comparison-column-header">
          <h3>Memoization (Top-Down)</h3>
        </div>
        {(algo === 'knapsack' || algo === 'lcs') && (
          <div className="sync-warning">
            States may not perfectly sync step-by-step
          </div>
        )}
        <div className="comparison-column-content">
          <div className="panel visual-panel responsive-visual-panel">
            <VisualPanel 
              step={leftStep} 
              learningMode={learningMode} 
              renderExplanation={renderExplanation}
              isBetterTime={leftIsBetterTime}
              isBetterSpace={leftIsBetterSpace}
            />
          </div>
          <div className="panel code-panel responsive-code-panel algorithm-code-panel">
            <div className="code-panel-header">
              <span className="code-panel-title">Memoization Code</span>
            </div>
            <div className="algorithm-code-scroll" style={{ flex: 1, padding: '16px' }}>
              <CodePanel code={leftCode} activeLine={leftStep.codeReference.lineNumber} />
            </div>
          </div>
        </div>
      </div>

      <div className="comparison-column">
        <div className="comparison-column-header">
          <h3>Tabulation (Bottom-Up)</h3>
        </div>
        {(algo === 'knapsack' || algo === 'lcs') && (
          <div className="sync-warning">
            States may not perfectly sync step-by-step
          </div>
        )}
        <div className="comparison-column-content">
          <div className="panel visual-panel responsive-visual-panel">
            <VisualPanel 
              step={rightStep} 
              learningMode={learningMode} 
              renderExplanation={renderExplanation}
              isBetterTime={rightIsBetterTime}
              isBetterSpace={rightIsBetterSpace}
            />
          </div>
          <div className="panel code-panel responsive-code-panel algorithm-code-panel">
            <div className="code-panel-header">
              <span className="code-panel-title">Tabulation Code</span>
            </div>
            <div className="algorithm-code-scroll" style={{ flex: 1, padding: '16px' }}>
              <CodePanel code={rightCode} activeLine={rightStep.codeReference.lineNumber} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
