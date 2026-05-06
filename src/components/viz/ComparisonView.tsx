import React from 'react';
import { DPTable } from './DPTable';
import { ComplexityPanel } from '../panels/ComplexityPanel';
import { LearningPanel } from '../panels/LearningPanel';
import { CodePanel } from '../panels/CodePanel';
import type { Step, TableSnapshot1D } from '../../types/step.types';

interface ComparisonViewProps {
  leftSteps: Step[];
  rightSteps: Step[];
  leftCode: string[];
  rightCode: string[];
  currentIndex: number;
  learningMode: boolean;
}

const renderExplanation = (step: Step) => {
  const { operationType, variables } = step.explanation;
  
  if (operationType === 'initialize') {
    const idx = variables.i ?? variables.k;
    return (
      <p style={{ margin: 0, fontSize: '0.95rem' }}>
        Initialize base case: <code style={{ backgroundColor: '#e0e0e0', padding: '2px 4px', borderRadius: '4px' }}>dp[{idx}] = {variables.value}</code>
      </p>
    );
  }
  if (operationType === 'compute') {
    const idx = variables.i ?? variables.k;
    return (
      <p style={{ margin: 0, fontSize: '0.95rem' }}>
        Compute: <code style={{ backgroundColor: '#e0e0e0', padding: '2px 4px', borderRadius: '4px' }}>dp[{idx}] = {variables.result}</code>
      </p>
    );
  }
  if (operationType === 'cache_hit') {
    return (
      <p style={{ margin: 0, fontSize: '0.95rem' }}>
        Cache Hit: <code style={{ backgroundColor: '#e0e0e0', padding: '2px 4px', borderRadius: '4px', color: '#1565c0' }}>memo[{variables.k}] = {variables.cachedValue}</code>
      </p>
    );
  }
  if (operationType === 'recurse') {
    return (
      <p style={{ margin: 0, fontSize: '0.95rem' }}>
        Recurse: <code style={{ backgroundColor: '#e0e0e0', padding: '2px 4px', borderRadius: '4px', color: '#e65100' }}>fib({variables.k})</code>
      </p>
    );
  }
  if (operationType === 'result') {
    return (
      <p style={{ margin: 0, fontSize: '0.95rem' }}>
        Result: <code style={{ backgroundColor: '#e0e0e0', padding: '2px 4px', borderRadius: '4px', color: '#2e7d32' }}>dp[{variables.n}] = {variables.result}</code>
      </p>
    );
  }
  return <p style={{ margin: 0 }}>{operationType}</p>;
};

export const ComparisonView: React.FC<ComparisonViewProps> = ({ leftSteps, rightSteps, leftCode, rightCode, currentIndex, learningMode }) => {
  // Gracefully handle step mismatch by clamping to the max available index for each side
  const leftStep = leftSteps[Math.min(currentIndex, Math.max(0, leftSteps.length - 1))];
  const rightStep = rightSteps[Math.min(currentIndex, Math.max(0, rightSteps.length - 1))];

  if (!leftStep || !rightStep) return <div>No data</div>;

  // Calculate comparative metrics dynamically per step
  const leftOps = leftStep.metrics.operationsCount;
  const rightOps = rightStep.metrics.operationsCount;
  const leftMem = leftStep.metrics.statesStored;
  const rightMem = rightStep.metrics.statesStored;

  const leftIsBetterTime = leftOps < rightOps;
  const rightIsBetterTime = rightOps < leftOps;

  const leftIsBetterSpace = leftMem < rightMem;
  const rightIsBetterSpace = rightMem < leftMem;

  return (
    <div style={{ display: 'flex', gap: '2rem', width: '100%' }}>
      {/* Left Side: Memoization */}
      <div style={{ flex: 1, padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        <h3 style={{ textAlign: 'center', color: '#333', marginTop: 0 }}>Top-Down Memoization</h3>
        {leftStep && (
          <>
            <DPTable 
              snapshot={leftStep.tableSnapshot as TableSnapshot1D} 
              activeIndices={leftStep.activeIndices} 
            />
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fff', 
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              minHeight: '60px'
            }}>
              <strong style={{ textTransform: 'capitalize', color: '#555' }}>Step {leftStep.index + 1} — {leftStep.operation}</strong>
              <div style={{ marginTop: '0.5rem' }}>
                {renderExplanation(leftStep)}
              </div>
            </div>
            
            <ComplexityPanel 
              metrics={leftStep.metrics} 
              isBetterTime={leftIsBetterTime} 
              isBetterSpace={leftIsBetterSpace} 
            />
            {learningMode && <LearningPanel step={leftStep} />}
            <CodePanel code={leftCode} activeLine={leftStep.codeReference.lineNumber} />
          </>
        )}
      </div>

      {/* Right Side: Tabulation */}
      <div style={{ flex: 1, padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        <h3 style={{ textAlign: 'center', color: '#333', marginTop: 0 }}>Bottom-Up Tabulation</h3>
        {rightStep && (
          <>
            <DPTable 
              snapshot={rightStep.tableSnapshot as TableSnapshot1D} 
              activeIndices={rightStep.activeIndices} 
            />
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fff', 
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              minHeight: '60px'
            }}>
              <strong style={{ textTransform: 'capitalize', color: '#555' }}>Step {rightStep.index + 1} — {rightStep.operation}</strong>
              <div style={{ marginTop: '0.5rem' }}>
                {renderExplanation(rightStep)}
              </div>
            </div>

            <ComplexityPanel 
              metrics={rightStep.metrics} 
              isBetterTime={rightIsBetterTime} 
              isBetterSpace={rightIsBetterSpace} 
            />
            {learningMode && <LearningPanel step={rightStep} />}
            <CodePanel code={rightCode} activeLine={rightStep.codeReference.lineNumber} />
          </>
        )}
      </div>
    </div>
  );
};
