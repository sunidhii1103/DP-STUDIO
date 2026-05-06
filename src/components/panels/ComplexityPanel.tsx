import React from 'react';
import type { StepMetrics } from '../../types/step.types';

interface ComplexityPanelProps {
  metrics: StepMetrics;
  isBetterTime?: boolean;
  isBetterSpace?: boolean;
}

export const ComplexityPanel: React.FC<ComplexityPanelProps> = ({ metrics, isBetterTime, isBetterSpace }) => {
  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      display: 'flex',
      gap: '1rem',
      fontSize: '0.95rem'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#6c757d', marginBottom: '0.25rem', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>
          Operations Executed
        </div>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: isBetterTime ? '#28a745' : '#007bff',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {metrics.operationsCount}
          {isBetterTime && (
            <span style={{ fontSize: '0.85rem', color: '#28a745', fontWeight: 'normal', backgroundColor: '#e8f5e9', padding: '2px 6px', borderRadius: '4px' }}>
              Better
            </span>
          )}
        </div>
      </div>
      
      <div style={{ flex: 1, borderLeft: '1px solid #dee2e6', paddingLeft: '1rem' }}>
        <div style={{ color: '#6c757d', marginBottom: '0.25rem', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>
          States Stored
        </div>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: isBetterSpace ? '#28a745' : '#17a2b8',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {metrics.statesStored}
          {isBetterSpace && (
            <span style={{ fontSize: '0.85rem', color: '#28a745', fontWeight: 'normal', backgroundColor: '#e8f5e9', padding: '2px 6px', borderRadius: '4px' }}>
              Better
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
