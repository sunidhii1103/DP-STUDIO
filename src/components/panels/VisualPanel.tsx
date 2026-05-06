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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {title && <h3 style={{ margin: 0, color: 'var(--color-text-primary)' }}>{title}</h3>}
      
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', flexShrink: 0 }}>
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
            backgroundColor: step.algorithm === 'lcs' && (step.operation.startsWith('backtrack') || (step.operation === 'result' && step.explanation?.variables?.partialLCS !== undefined)) ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            color: step.algorithm === 'lcs' && (step.operation.startsWith('backtrack') || (step.operation === 'result' && step.explanation?.variables?.partialLCS !== undefined)) ? '#c084fc' : '#60a5fa',
            border: `1px solid ${step.algorithm === 'lcs' && (step.operation.startsWith('backtrack') || (step.operation === 'result' && step.explanation?.variables?.partialLCS !== undefined)) ? 'rgba(168, 85, 247, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
          }}>
            {step.algorithm === 'lcs' && (step.operation.startsWith('backtrack') || (step.operation === 'result' && step.explanation?.variables?.partialLCS !== undefined)) ? "Backtracking Reconstruction Phase" : "DP Construction Phase"}
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
