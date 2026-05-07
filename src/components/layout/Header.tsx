import React from 'react';
import type { AlgorithmId } from '../../types/step.types';

interface HeaderProps {
  algo: AlgorithmId;
  fibN: number;
  knapCapacity: number;
  lcsS1: string;
  lcsS2: string;
  mcmDimensions: string;
  mcmValidationError?: string | null;
  lisArray: string;
  lisValidationError?: string | null;
  setAlgo: (v: AlgorithmId) => void;
  setFibN: (v: number) => void;
  setKnapCapacity: (v: number) => void;
  setLcsS1: (v: string) => void;
  setLcsS2: (v: string) => void;
  setMcmDimensions: (v: string) => void;
  setLisArray: (v: string) => void;
  mode: 'single' | 'comparison';
  toggleMode: () => void;
  learningMode: boolean;
  setLearningMode: (v: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  algo, fibN, knapCapacity, lcsS1, lcsS2, mcmDimensions, mcmValidationError, lisArray, lisValidationError, setAlgo, setFibN, setKnapCapacity, setLcsS1, setLcsS2, setMcmDimensions, setLisArray, mode, toggleMode, learningMode, setLearningMode
}) => {
  const title = algo === 'fibonacci'
    ? `Fibonacci (n = ${fibN})`
    : algo === 'knapsack'
      ? `0/1 Knapsack (Cap = ${knapCapacity})`
      : algo === 'edit-distance'
        ? `Edit Distance (${lcsS1}, ${lcsS2})`
        : algo === 'mcm'
          ? `MCM (${mcmDimensions})`
          : algo === 'lis'
            ? `LIS (${lisArray})`
            : `LCS (${lcsS1}, ${lcsS2})`;

  return (
    <header className="app-header" style={{
      width: '100%',
      padding: '0.75rem 1.5rem',
      backgroundColor: 'var(--color-bg-secondary)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div className="app-header-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
          <img src="/logo.png" alt="DP Studio" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
          <span style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>DP Studio</span>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)' }}></div>
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 'bold' }}>{title}</span>
      </div>
      
      <div className="app-header-controls" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="app-header-inputs" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select 
            value={algo} 
            onChange={(e) => setAlgo(e.target.value as AlgorithmId)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '9999px', 
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-subtle)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="fibonacci">Fibonacci</option>
            <option value="knapsack">0/1 Knapsack</option>
            <option value="lcs">LCS</option>
            <option value="edit-distance">Edit Distance</option>
            <option value="mcm">Matrix Chain Multiplication</option>
            <option value="lis">Longest Increasing Subsequence</option>
          </select>
          
          {algo === 'fibonacci' && (
            <input 
              type="number" 
              value={fibN} 
              onChange={(e) => setFibN(Math.min(15, Math.max(1, parseInt(e.target.value) || 1)))}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '9999px', 
                width: '80px',
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-subtle)',
                outline: 'none',
              }}
            />
          )}

          {algo === 'knapsack' && (
            <input 
              type="number" 
              value={knapCapacity} 
              onChange={(e) => setKnapCapacity(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '9999px', 
                width: '80px',
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-subtle)',
                outline: 'none',
              }}
            />
          )}

          {(algo === 'lcs' || algo === 'edit-distance') && (
            <>
              <input 
                type="text" 
                value={lcsS1} 
                onChange={(e) => setLcsS1(e.target.value.substring(0, 12).toUpperCase())}
                placeholder="S1"
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '9999px', 
                  width: '90px',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-subtle)',
                  outline: 'none',
                }}
              />
              <input 
                type="text" 
                value={lcsS2} 
                onChange={(e) => setLcsS2(e.target.value.substring(0, 12).toUpperCase())}
                placeholder="S2"
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '9999px', 
                  width: '90px',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-subtle)',
                  outline: 'none',
                }}
              />
            </>
          )}

          {algo === 'mcm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <input
                type="text"
                value={mcmDimensions}
                onChange={(e) => setMcmDimensions(e.target.value)}
                placeholder="10,30,5,60"
                aria-invalid={!!mcmValidationError}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  width: '150px',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: `1px solid ${mcmValidationError ? 'var(--color-error)' : 'var(--color-border-subtle)'}`,
                  outline: 'none',
                }}
              />
              {mcmValidationError && (
                <span style={{ color: 'var(--color-error)', fontSize: '0.72rem', maxWidth: '220px' }}>
                  {mcmValidationError}
                </span>
              )}
            </div>
          )}

          {algo === 'lis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <input
                type="text"
                value={lisArray}
                onChange={(e) => setLisArray(e.target.value)}
                placeholder="10,9,2,5,3,7,101,18"
                aria-invalid={!!lisValidationError}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  width: '240px',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: `1px solid ${lisValidationError ? 'var(--color-error)' : 'var(--color-border-subtle)'}`,
                  outline: 'none',
                }}
              />
              {lisValidationError && (
                <span style={{ color: 'var(--color-error)', fontSize: '0.72rem', maxWidth: '260px' }}>
                  {lisValidationError}
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          backgroundColor: 'var(--color-bg-tertiary)', 
          borderRadius: '9999px', 
          padding: '4px',
          border: '1px solid var(--color-border)' 
        }}>
          <button 
            onClick={() => { if (mode !== 'single') toggleMode() }}
            style={{
              padding: '0.4rem 1rem',
              backgroundColor: mode === 'single' ? 'var(--color-accent-primary)' : 'transparent',
              color: mode === 'single' ? '#fff' : 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: mode === 'single' ? 'bold' : 'normal',
            }}
          >
            Single
          </button>
          <button 
            title={algo === 'lis' ? 'Compare brute force recursion, O(n^2) DP, and O(n log n) tails.' : undefined}
            onClick={() => { if (mode !== 'comparison') toggleMode() }}
            style={{
              padding: '0.4rem 1rem',
              backgroundColor: mode === 'comparison' ? 'var(--color-accent-primary)' : 'transparent',
              color: mode === 'comparison' ? '#fff' : 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: mode === 'comparison' ? 'bold' : 'normal',
            }}
          >
            Compare
          </button>
        </div>

        <button 
          onClick={() => setLearningMode(!learningMode)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: learningMode ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
            color: learningMode ? '#fff' : 'var(--color-text-primary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '9999px',
            fontWeight: 'bold',
          }}
        >
          {learningMode ? 'Learning On' : 'Learning Off'}
        </button>
      </div>
    </header>
  );
};
