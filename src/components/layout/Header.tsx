import React from 'react';

interface HeaderProps {
  algo: 'fibonacci' | 'knapsack' | 'lcs';
  fibN: number;
  knapCapacity: number;
  lcsS1: string;
  lcsS2: string;
  setAlgo: (v: 'fibonacci' | 'knapsack' | 'lcs') => void;
  setFibN: (v: number) => void;
  setKnapCapacity: (v: number) => void;
  setLcsS1: (v: string) => void;
  setLcsS2: (v: string) => void;
  mode: 'single' | 'comparison';
  toggleMode: () => void;
  learningMode: boolean;
  setLearningMode: (v: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  algo, fibN, knapCapacity, lcsS1, lcsS2, setAlgo, setFibN, setKnapCapacity, setLcsS1, setLcsS2, mode, toggleMode, learningMode, setLearningMode
}) => {
  return (
    <header style={{
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
          <img src="/logo.png" alt="DP Studio" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
          <span style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>DP Studio</span>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)' }}></div>
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 'bold' }}>{algo === 'fibonacci' ? `Fibonacci (n = ${fibN})` : algo === 'knapsack' ? `0/1 Knapsack (Cap = ${knapCapacity})` : `LCS (${lcsS1}, ${lcsS2})`}</span>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select 
            value={algo} 
            onChange={(e) => setAlgo(e.target.value as 'fibonacci' | 'knapsack' | 'lcs')}
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

          {algo === 'lcs' && (
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
