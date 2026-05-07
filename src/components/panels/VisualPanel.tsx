import React from 'react';
import { DPTable } from '../viz/DPTable';
import { ComplexityPanel } from './ComplexityPanel';
import { LearningPanel } from './LearningPanel';
import type { Step, TableSnapshot1D } from '../../types/step.types';

interface VisualPanelProps {
  step: Step;
  learningMode: boolean;
  title?: string;
  renderExplanation: (step: Step) => React.ReactNode;
  isBetterTime?: boolean;
  isBetterSpace?: boolean;
}

export const VisualPanel: React.FC<VisualPanelProps> = ({ 
  step, 
  learningMode, 
  title, 
  renderExplanation,
  isBetterTime,
  isBetterSpace
}) => {
  const isReconstructionPhase = 
    (step.algorithm === 'lcs' && (step.operation.startsWith('backtrack') || (step.operation === 'result' && step.explanation?.variables?.partialLCS !== undefined))) ||
    (step.algorithm === 'edit-distance' && (step.operation.startsWith('backtrack') || (step.operation === 'result' && step.explanation?.variables?.transformedStr !== undefined) || (['edit_replace', 'edit_delete', 'edit_insert'].includes(step.operation) && step.explanation?.variables?.transformedStr !== undefined))) ||
    (step.algorithm === 'mcm' && step.operation === 'backtrack_split');
  const isMCM = step.algorithm === 'mcm';
  const stepVariables = step.explanation?.variables ?? {};
  const chainLengthValue = Number(stepVariables.chainLength);
  const chainLengthLabel = Number.isFinite(chainLengthValue) && chainLengthValue > 0
    ? `Processing chain length = ${chainLengthValue}`
    : isReconstructionPhase
      ? 'Reconstructing optimal parenthesization'
      : 'Matrix chain interval DP';
  const intervalLabel = typeof stepVariables.interval === 'string' && stepVariables.interval
    ? stepVariables.interval
    : step.activeIndices?.j !== undefined
      ? `A${step.activeIndices.i + 1}..A${step.activeIndices.j + 1}`
      : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {title && <h3 style={{ margin: 0, color: 'var(--color-text-primary)' }}>{title}</h3>}
      
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', flexShrink: 0 }}>
        {isMCM && (
          <div className="mcm-interval-guide">
            <div className="mcm-chain-status">
              <span>{chainLengthLabel}</span>
              {intervalLabel && <code>{intervalLabel}</code>}
            </div>
            <div className="mcm-mini-legend" aria-label="Matrix chain interval DP legend">
              <span><strong>i</strong> start matrix</span>
              <span><strong>j</strong> end matrix</span>
              <span><strong>k</strong> split position</span>
            </div>
          </div>
        )}
        <DPTable 
          snapshot={step.tableSnapshot as TableSnapshot1D} 
          activeIndices={step.activeIndices} 
        />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 12, height: 12, borderRadius: 2, background: 'linear-gradient(135deg, #facc15, #f59e0b)' }}></span> Current cell</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(59, 130, 246, 0.15)', border: '1px dashed #60a5fa' }}></span> Dependency</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#22c55e' }}></span> Final result</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#fafafa', border: '1px solid #e0e0e0' }}></span> Not computed</span>
        </div>
      </div>

      <div className="panel" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-accent-secondary)', textTransform: 'capitalize', fontSize: '1.1rem' }}>
            {(() => {
              if (step.operation === 'backtrack_match') return `Step ${step.index + 1} — Backtracking: Match Found`;
              if (step.operation === 'backtrack_move_top') return `Step ${step.index + 1} — Backtracking: Move Up`;
              if (step.operation === 'backtrack_move_left') return `Step ${step.index + 1} — Backtracking: Move Left`;
              if (step.algorithm === 'knapsack' && step.approach === 'memoization') return `Computing State (${step.activeIndices.i}, ${step.activeIndices.j})`;
              return `Step ${step.index + 1} — ${step.operation.replace(/_/g, ' ')}`;
            })()}
          </h3>
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: 'bold', 
            padding: '4px 10px', 
            borderRadius: '12px', 
            backgroundColor: isReconstructionPhase ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            color: isReconstructionPhase ? '#c084fc' : '#60a5fa',
            border: `1px solid ${isReconstructionPhase ? 'rgba(168, 85, 247, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
          }}>
            {isReconstructionPhase ? "Backtracking Reconstruction Phase" : "DP Construction Phase"}
          </span>
        </div>
        <div style={{ color: 'var(--color-text-primary)' }}>
          {renderExplanation(step)}
        </div>
      </div>
      
      <ComplexityPanel 
        metrics={step.metrics} 
        isBetterTime={isBetterTime} 
        isBetterSpace={isBetterSpace} 
      />
      {learningMode && <LearningPanel step={step} />}
    </div>
  );
};
