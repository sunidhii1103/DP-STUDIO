import React, { useState, useEffect } from 'react';
import { uiRegistry } from '../algorithms/config';

// Layout Components
import { Header } from '../components/layout/Header';
import { Toolbar } from '../components/layout/Toolbar';
import { MainLayout } from '../components/layout/MainLayout';
import { ResizableLayout } from '../components/layout/ResizableLayout';

// Panel Components
import { VisualPanel } from '../components/panels/VisualPanel';
import { CodePanel } from '../components/panels/CodePanel';
import { ComparisonPanel } from '../components/panels/ComparisonPanel';
import { MCMCompareView } from '../components/compare/mcm/MCMCompareView';
import { createMCMCompareTimeline } from '../components/compare/mcm/mcmCompareData';
import { LISCompareView } from '../components/compare/lis/LISCompareView';
import { createLISCompareTimeline } from '../components/compare/lis/lisCompareData';

import { usePlayback } from '../hooks/usePlayback';
import type { Speed } from '../hooks/usePlayback';
import type { AlgorithmId, Step } from '../types/step.types';

type Mode = 'single' | 'comparison';
type AlgorithmSelection = AlgorithmId;

const readStoredValue = (key: string) => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
};

const readStoredAlgorithm = (): AlgorithmSelection => {
  const stored = readStoredValue('dpstudio:lastAlgorithm') as AlgorithmSelection | null;
  return stored && ['fibonacci', 'knapsack', 'lcs', 'edit-distance', 'mcm', 'lis'].includes(stored) ? stored : 'fibonacci';
};

const readStoredSpeed = (): Speed => {
  const stored = readStoredValue('dpstudio:preferredSpeed') as Speed | null;
  return stored && ['Slow', 'Medium', 'Fast'].includes(stored) ? stored : 'Medium';
};

const safeText = (value: unknown, fallback = '-'): string => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number' && !Number.isFinite(value)) return fallback;
  const text = String(value);
  return text === 'NaN' || text === 'undefined' ? fallback : text;
};

const MCMCostPanel: React.FC<{ variables: Record<string, unknown> }> = ({ variables }) => {
  const i = safeText(variables.i, '?');
  const j = safeText(variables.j, '?');
  const k = safeText(variables.k, '?');
  const left = safeText(variables.left);
  const right = safeText(variables.right);
  const merge = safeText(variables.merge);
  const cost = safeText(variables.cost);
  const dimLeft = safeText(variables.dimLeft);
  const dimMid = safeText(variables.dimMid);
  const dimRight = safeText(variables.dimRight);

  return (
    <div className="mcm-cost-panel">
      <div className="mcm-cost-row">
        <span className="mcm-cost-label">Dependencies</span>
        <code>dp[{i}][{k}]</code>
        <code>dp[{Number(k) + 1 || '?'}][{j}]</code>
      </div>
      <div className="mcm-cost-equation">
        <span>cost =</span>
        <code>{left}</code>
        <span>+</span>
        <code>{right}</code>
        <span>+</span>
        <code>({dimLeft}×{dimMid}×{dimRight}) = {merge}</code>
        <span>=</span>
        <strong>{cost}</strong>
      </div>
    </div>
  );
};

function parseMCMDimensions(raw: string): { dimensions: number[]; error: string | null } {
  const tokens = raw.split(',').map(token => token.trim());
  if (tokens.some(token => token.length === 0)) {
    return { dimensions: [], error: 'Use comma-separated dimensions only.' };
  }
  if (tokens.some(token => !/^\d+$/.test(token))) {
    return { dimensions: [], error: 'Dimensions must be numeric positive integers.' };
  }
  const dimensions = tokens.map(Number);
  if (dimensions.some(value => value <= 0)) {
    return { dimensions: [], error: 'Dimensions must be positive integers.' };
  }
  if (dimensions.length < 3) {
    return { dimensions: [], error: 'Enter at least 3 dimensions for 2 matrices.' };
  }
  if (dimensions.length > 9) {
    return { dimensions: [], error: 'Use at most 9 dimensions for readability.' };
  }
  return { dimensions, error: null };
}

function parseLISArray(raw: string): { nums: number[]; error: string | null } {
  const tokens = raw.split(',').map(token => token.trim());
  if (raw.trim().length === 0 || tokens.length === 0) {
    return { nums: [], error: 'Enter a comma-separated integer array.' };
  }
  if (tokens.some(token => token.length === 0)) {
    return { nums: [], error: 'Use comma-separated integers only.' };
  }
  if (tokens.some(token => !/^-?\d+$/.test(token))) {
    return { nums: [], error: 'LIS values must be integers. Negatives are allowed.' };
  }
  const nums = tokens.map(Number);
  if (nums.length > 16) {
    return { nums: [], error: 'Use at most 16 numbers for readability.' };
  }
  return { nums, error: null };
}

export const VisualizerPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>('single');
  const [learningMode, setLearningMode] = useState(() => readStoredValue('dpstudio:learningMode') === 'true');
  const [algo, setAlgo] = useState<AlgorithmSelection>(() => readStoredAlgorithm());
  const [fibN, setFibN] = useState(5);
  const [knapCapacity, setKnapCapacity] = useState(5);
  const [lcsS1, setLcsS1] = useState('ABCBDAB');
  const [lcsS2, setLcsS2] = useState('BDCAB');
  const [mcmDimensions, setMcmDimensions] = useState('10,30,5,60');
  const [lisArray, setLisArray] = useState('10,9,2,5,3,7,101,18');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [knapItems, _setKnapItems] = useState([
    { weight: 2, value: 3, label: 'A' },
    { weight: 3, value: 4, label: 'B' },
    { weight: 4, value: 5, label: 'C' },
  ]);

  const parsedMCM = React.useMemo(() => parseMCMDimensions(mcmDimensions), [mcmDimensions]);
  const parsedLIS = React.useMemo(() => parseLISArray(lisArray), [lisArray]);

  const { tabulationSteps, memoizationSteps } = React.useMemo(() => {
    if (!uiRegistry || !uiRegistry[algo]) return { tabulationSteps: [], memoizationSteps: [] };
    try {
      let inputConfig;
      if (algo === 'fibonacci') inputConfig = { n: fibN };
      else if (algo === 'knapsack') inputConfig = { capacity: knapCapacity, items: knapItems };
      else if (algo === 'mcm') {
        if (parsedMCM.error) return { tabulationSteps: [], memoizationSteps: [] };
        inputConfig = { dimensions: parsedMCM.dimensions };
      }
      else if (algo === 'lis') {
        if (parsedLIS.error) return { tabulationSteps: [], memoizationSteps: [] };
        inputConfig = { nums: parsedLIS.nums };
      }
      else inputConfig = { s1: lcsS1, s2: lcsS2 };

      const result = uiRegistry[algo].generateSteps(inputConfig);
      return { 
        tabulationSteps: result?.tabulation || [], 
        memoizationSteps: result?.memoization || [] 
      };
    } catch (e) {
      console.error("Failed to generate steps:", e);
      return { tabulationSteps: [], memoizationSteps: [] };
    }
  }, [algo, fibN, knapCapacity, knapItems, lcsS1, lcsS2, parsedMCM, parsedLIS]);

  const mcmCompareTimeline = React.useMemo(() => {
    if (algo !== 'mcm' || parsedMCM.error) return null;
    return createMCMCompareTimeline(parsedMCM.dimensions, tabulationSteps);
  }, [algo, parsedMCM, tabulationSteps]);

  const lisCompareTimeline = React.useMemo(() => {
    if (algo !== 'lis' || parsedLIS.error) return null;
    return createLISCompareTimeline(parsedLIS.nums, tabulationSteps);
  }, [algo, parsedLIS, tabulationSteps]);

  const effectiveMode = mode;

  const totalSteps = effectiveMode === 'single'
    ? tabulationSteps.length
    : algo === 'mcm'
      ? (mcmCompareTimeline?.frames.length ?? 0)
      : algo === 'lis'
        ? (lisCompareTimeline?.frames.length ?? 0)
        : Math.max(tabulationSteps.length, memoizationSteps.length);

  const {
    currentStepIndex,
    setCurrentStepIndex,
    isPlaying,
    speed,
    play,
    pause,
    setSpeed,
    handleNext,
    handlePrev,
  } = usePlayback(totalSteps);

  useEffect(() => {
    setSpeed(readStoredSpeed());
  }, [setSpeed]);

  useEffect(() => {
    window.localStorage.setItem('dpstudio:lastAlgorithm', algo);
  }, [algo]);

  useEffect(() => {
    window.localStorage.setItem('dpstudio:learningMode', String(learningMode));
  }, [learningMode]);

  useEffect(() => {
    window.localStorage.setItem('dpstudio:preferredSpeed', speed);
  }, [speed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.code === 'Space') {
        event.preventDefault();
        if (isPlaying) pause();
        else play();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (algo === 'lis' && mode === 'comparison' && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('lis-tree-zoom', { detail: { direction: 'in' } }));
      } else if (algo === 'lis' && mode === 'comparison' && event.key === '-') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('lis-tree-zoom', { detail: { direction: 'out' } }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [algo, mode, isPlaying, pause, play, handleNext, handlePrev]);

  useEffect(() => {
    setCurrentStepIndex(0);
    pause();
  }, [algo, fibN, knapCapacity, knapItems, lcsS1, lcsS2, mcmDimensions, lisArray, mode, setCurrentStepIndex, pause]);

  const toggleMode = () => {
    pause();
    setCurrentStepIndex(0);
    setMode(prev => prev === 'single' ? 'comparison' : 'single');
  };

  const renderExplanation = (step: Step) => {
    if (!step || !step.explanation || !step.explanation.variables) return null;
    const { operationType, variables } = step.explanation;
    
    if (step.algorithm === 'mcm') {
      if (operationType === 'initialize') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>{safeText(variables.desc, `dp[${safeText(variables.i)}][${safeText(variables.j)}] = 0`)}</p>;
      }
      if (operationType === 'chain_length') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Starting diagonal traversal for chain length <strong>{safeText(variables.chainLength)}</strong>.</p>;
      }
      if (operationType === 'select_interval') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Current interval: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{safeText(variables.interval, 'selected interval')}</code>. We will try every split inside it.</p>;
      }
      if (operationType === 'try_split') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>Trying split at <strong>k = {safeText(variables.k)}</strong>: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{safeText(variables.leftInterval, 'left interval')}</code> + <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{safeText(variables.rightInterval, 'right interval')}</code>.</p>
            <MCMCostPanel variables={variables} />
          </div>
        );
      }
      if (operationType === 'calculate_cost') {
        return (
          <div style={{ fontSize: '1.1rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ margin: 0 }}>Total cost = left subproblem + right subproblem + multiplication cost</p>
            <MCMCostPanel variables={variables} />
          </div>
        );
      }
      if (operationType === 'update_min') {
        return <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-success)' }}>New minimum found: <strong>{safeText(variables.best)}</strong> using split <strong>k = {safeText(variables.k)}</strong>.</p>;
      }
      if (operationType === 'final_decision') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Choosing minimum among all partitions for <strong>{safeText(variables.interval, 'this interval')}</strong>: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-success)' }}>{safeText(variables.best)}</code>.</p>;
      }
      if (operationType === 'backtrack_split') {
        return <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-info)' }}><strong>Reconstruction:</strong> {safeText(variables.desc, 'Following the stored split for this interval.')}<br /><span style={{ color: 'var(--color-text-secondary)' }}>Parenthesization: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{safeText(variables.parenthesization, 'not available')}</code></span></p>;
      }
      if (operationType === 'result') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Minimum scalar multiplication cost: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-success)' }}>{safeText(variables.result)}</code><br /><span style={{ color: 'var(--color-text-secondary)' }}>Optimal parenthesization: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{safeText(variables.parenthesization, 'not available')}</code></span></p>;
      }
      return null;
    }

    if (step.algorithm === 'lis') {
      if (operationType === 'initialize') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Initialize <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>dp[{safeText(variables.i)}] = 1</code>. A single value, <strong>{safeText(variables.value)}</strong>, is already an increasing subsequence of length 1.</p>;
      }
      if (operationType === 'read') {
        if (step.metadata?.phase === 'reconstruction') {
          return (
            <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-info)' }}>
              <strong>Backtracking Reconstruction Phase:</strong> {safeText(variables.desc, 'Follow predecessor pointers.')}
              <br />
              <span style={{ color: 'var(--color-text-secondary)' }}>Subsequence so far: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>[{safeText(variables.partialSequence, '')}]</code></span>
            </p>
          );
        }
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Focus index <strong>{safeText(variables.i)}</strong> with value <strong>{safeText(variables.value)}</strong>. We scan earlier values as possible predecessors.</p>;
      }
      if (operationType === 'compare') {
        const canExtend = Number(variables.canExtend) === 1;
        return <p style={{ fontSize: '1.1rem', margin: 0, color: canExtend ? 'var(--color-success)' : 'var(--color-warning)' }}>{safeText(variables.desc)}<br /><span style={{ color: 'var(--color-text-secondary)' }}>Candidate transition: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>dp[{safeText(variables.j)}] + 1 = {Number(variables.candidateDp) + 1}</code></span></p>;
      }
      if (operationType === 'compute') {
        return <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-success)' }}>Updating <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>dp[{safeText(variables.i)}]</code> from <strong>{safeText(variables.previous)}</strong> to <strong>{safeText(variables.result)}</strong> and setting <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>parent[{safeText(variables.i)}] = {safeText(variables.parentIndex)}</code>.</p>;
      }
      if (operationType === 'result') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Final LIS length: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-success)' }}>{safeText(variables.result)}</code><br /><span style={{ color: 'var(--color-text-secondary)' }}>Actual subsequence: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>[{safeText(variables.sequence)}]</code></span></p>;
      }
      return null;
    }
    
    if (step.algorithm === 'knapsack') {
      if (operationType === 'initialize') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>{variables.desc || `Base case: index ${variables.i}, capacity ${variables.w}`}</p>;
      }
      if (operationType === 'compute') {
        return (
          <div style={{ fontSize: '1.1rem', margin: 0, lineHeight: '1.6' }}>
            We compare excluding item <strong>{variables.label}</strong> vs including it:<br />
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', color: 'var(--color-text-secondary)' }}>
              <li><strong>Exclude:</strong> dp[i-1][w] = {variables.valExclude}</li>
              {variables.isIncluded ? (
                <li><strong>Include:</strong> value + dp[i-1][w-weight] = {variables.value} + {Number(variables.valInclude) - Number(variables.value)} = {variables.valInclude}</li>
              ) : (
                <li><strong>Include:</strong> <em style={{ color: 'var(--color-error)' }}>Not possible (weight &gt; capacity)</em></li>
              )}
            </ul>
            <p style={{ margin: 0 }}>Result: Choose max value = <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-success)', fontWeight: 'bold' }}>{variables.result}</code></p>
          </div>
        );
      }
      if (operationType === 'cache_hit') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Cache Hit: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-info)' }}>memo[{variables.i}][{variables.w}] = {variables.cachedValue}</code></p>;
      }
      if (operationType === 'recurse') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Recurse: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-warning)' }}>knapsack({variables.i}, {variables.w})</code></p>;
      }
      if (operationType === 'result') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Algorithm complete! Max value is: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-success)' }}>{variables.result}</code></p>;
      }
      return null;
    }

    if (step.algorithm === 'lcs') {
      if (operationType === 'initialize') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Initialize Base Case: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>dp[{variables.i}][{variables.j}] = 0</code></p>;
      }
      if (operationType === 'compare') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>Compare characters: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>'{variables.char1}' == '{variables.char2}'</code></p>
            {variables.partialLCS !== undefined && (
               <p style={{ fontSize: '1.1rem', margin: 0, fontWeight: 'bold', color: 'var(--color-success)' }}>
                 Current LCS: <code style={{ padding: '2px 6px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '4px' }}>{variables.partialLCS || '""'}</code>
               </p>
            )}
          </div>
        );
      }
      if (operationType === 'match') {
        return <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-success)' }}>Characters Match! <br/><span style={{fontSize: '0.9rem'}}>Extend LCS by 1.</span></p>;
      }
      if (operationType === 'mismatch' || operationType === 'choose_top' || operationType === 'choose_left') {
        return <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-warning)' }}>Mismatch.<br/><span style={{fontSize: '0.9rem', color: 'var(--color-text-secondary)'}}>Evaluating max of top ({variables.valTop}) and left ({variables.valLeft}).</span></p>;
      }
      if (operationType?.startsWith('backtrack')) {
        let text = "";
        if (operationType === 'backtrack_match') {
          text = `Characters match ('${variables.char1}'), so we include it and move diagonally ↖`;
        } else if (operationType === 'backtrack_move_top') {
          text = `Mismatch. We follow the larger neighboring state to preserve optimal subsequence length. Moving top ↑ (${variables.valTop} >= ${variables.valLeft})`;
        } else if (operationType === 'backtrack_move_left') {
          text = `Mismatch. We follow the larger neighboring state to preserve optimal subsequence length. Moving left ← (${variables.valTop} < ${variables.valLeft})`;
        }
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-info)' }}>
               <strong>Backtracking Phase:</strong> {text}
             </p>
             {variables.partialLCS !== undefined && (
               <p style={{ fontSize: '1.1rem', margin: 0, fontWeight: 'bold', color: 'var(--color-success)' }}>
                 Current LCS: <code style={{ padding: '2px 6px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '4px' }}>{variables.partialLCS || '""'}</code>
               </p>
             )}
          </div>
        );
      }
      if (operationType === 'result') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>Algorithm complete! LCS Length is: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-success)' }}>{variables.result}</code></p>
            {variables.partialLCS !== undefined && (
               <p style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold', color: 'var(--color-success)' }}>
                 Final LCS String: <code style={{ padding: '2px 6px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '4px' }}>{variables.partialLCS || '""'}</code>
               </p>
            )}
          </div>
        );
      }
      if (operationType === 'cache_hit') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Cache Hit: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-info)' }}>memo[{variables.i}][{variables.j}] = {variables.cachedValue}</code></p>;
      }
      if (operationType === 'recurse') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Recurse: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-warning)' }}>lcs({variables.i}, {variables.j})</code></p>;
      }
      return null;
    }

    if (step.algorithm === 'edit-distance') {
      if (operationType === 'initialize') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Initialize Base Case: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>dp[{variables.i}][{variables.j}] = {variables.val}</code></p>;
      }
      if (operationType === 'compare') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Compare characters: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>'{variables.char1}' == '{variables.char2}'</code></p>;
      }
      if (operationType === 'edit_match') {
        return <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-success)' }}>Characters Match! <br/><span style={{fontSize: '0.9rem'}}>No operation needed. Inherit cost: {variables.valDiag}</span></p>;
      }
      if (operationType === 'compute') {
        return <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-warning)' }}>Mismatch.<br/><span style={{fontSize: '0.9rem', color: 'var(--color-text-secondary)'}}>Evaluating min of REPLACE ({variables.vReplace}), DELETE ({variables.vDelete}), INSERT ({variables.vInsert}).</span></p>;
      }
      if (operationType === 'edit_replace' || operationType === 'edit_delete' || operationType === 'edit_insert') {
        if (variables.transformedStr !== undefined) {
           return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-info)' }}>
                <strong>Applying Operation:</strong> {variables.op}
              </p>
              <p style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold', color: 'var(--color-success)' }}>
                 Current String: <code style={{ padding: '2px 6px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '4px' }}>{variables.transformedStr}</code>
              </p>
            </div>
          );
        }
        const type = operationType.replace('edit_', '').toUpperCase();
        return <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-error)' }}>Chosen: <strong>{type}</strong><br/><span style={{fontSize: '0.9rem'}}>Cost = 1 + {variables.minVal}</span></p>;
      }
      if (operationType?.startsWith('backtrack_edit')) {
        let text = "";
        if (operationType === 'backtrack_edit_match') text = `Characters match ('${variables.char1}'), moving diagonally ↖`;
        else if (operationType === 'backtrack_edit_replace') text = `REPLACE '${variables.char1}' with '${variables.char2}', moving diagonally ↖`;
        else if (operationType === 'backtrack_edit_delete') text = `DELETE '${variables.char1}', moving top ↑`;
        else if (operationType === 'backtrack_edit_insert') text = `INSERT '${variables.char2}', moving left ←`;
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-info)' }}>
               <strong>Backtracking Phase:</strong> {text}
             </p>
          </div>
        );
      }
      if (operationType === 'result') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>Algorithm complete! Min Operations: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-success)' }}>{variables.result}</code></p>
            {variables.transformedStr !== undefined && (
               <p style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold', color: 'var(--color-success)' }}>
                 Final Transformed String: <code style={{ padding: '2px 6px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '4px' }}>{variables.transformedStr}</code>
               </p>
            )}
          </div>
        );
      }
      if (operationType === 'cache_hit') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Cache Hit: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-info)' }}>memo[{variables.i}][{variables.j}] = {variables.cachedValue}</code></p>;
      }
      if (operationType === 'read') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Read State: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>dp[{variables.i}][{variables.j}]</code></p>;
      }
      if (operationType === 'recurse') {
        return <p style={{ fontSize: '1.1rem', margin: 0 }}>Recurse: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-warning)' }}>editDistance(...)</code></p>;
      }
      return null;
    }

    if (operationType === 'initialize') {
      const idx = variables.i ?? variables.k;
      return <p style={{ fontSize: '1.1rem', margin: 0 }}>Initialize base case: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>dp[{idx}] = {variables.value}</code></p>;
    }
    if (operationType === 'compute') {
      const idx = variables.i ?? variables.k;
      return <p style={{ fontSize: '1.1rem', margin: 0, lineHeight: '1.8' }}>Compute current state: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '4px 8px', borderRadius: '4px' }}>dp[{idx}] = {variables.result}</code></p>;
    }
    if (operationType === 'cache_hit') {
      return <p style={{ fontSize: '1.1rem', margin: 0 }}>Cache Hit: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-info)' }}>memo[{variables.k}] = {variables.cachedValue}</code></p>;
    }
    if (operationType === 'recurse') {
      return <p style={{ fontSize: '1.1rem', margin: 0 }}>Recurse: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 4px', borderRadius: '4px', color: 'var(--color-warning)' }}>fib({variables.k})</code></p>;
    }
    if (operationType === 'result') {
      return <p style={{ fontSize: '1.1rem', margin: 0 }}>Algorithm complete: <code style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-success)' }}>result = {variables.result}</code></p>;
    }
    return null;
  };

  if ((algo === 'mcm' && parsedMCM.error) || (algo === 'lis' && parsedLIS.error)) {
    const validationError = algo === 'mcm' ? parsedMCM.error : parsedLIS.error;
    return (
      <MainLayout>
        <Header 
          algo={algo}
          fibN={fibN}
          knapCapacity={knapCapacity}
          lcsS1={lcsS1}
          lcsS2={lcsS2}
          mcmDimensions={mcmDimensions}
          mcmValidationError={parsedMCM.error}
          lisArray={lisArray}
          lisValidationError={parsedLIS.error}
          setAlgo={setAlgo}
          setFibN={setFibN}
          setKnapCapacity={setKnapCapacity}
          setLcsS1={setLcsS1}
          setLcsS2={setLcsS2}
          setMcmDimensions={setMcmDimensions}
          setLisArray={setLisArray}
          mode={effectiveMode}
          toggleMode={toggleMode}
          learningMode={learningMode}
          setLearningMode={setLearningMode}
        />
        <div style={{ padding: '2rem', color: 'var(--color-text-primary)' }}>{validationError}</div>
      </MainLayout>
    );
  }

  if (!tabulationSteps || tabulationSteps.length === 0 || (algo === 'fibonacci' && (!memoizationSteps || memoizationSteps.length === 0))) {
    return <div style={{ padding: '2rem', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)', height: '100vh' }}>Loading...</div>;
  }

  const currentTabStep = tabulationSteps[Math.min(currentStepIndex, Math.max(0, tabulationSteps.length - 1))];

  if (!currentTabStep) {
    return <div style={{ padding: '2rem', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)', height: '100vh' }}>Loading...</div>;
  }

  return (
    <MainLayout>
      <Header 
        algo={algo}
        fibN={fibN}
        knapCapacity={knapCapacity}
        lcsS1={lcsS1}
        lcsS2={lcsS2}
        mcmDimensions={mcmDimensions}
        mcmValidationError={algo === 'mcm' ? parsedMCM.error : null}
        lisArray={lisArray}
        lisValidationError={algo === 'lis' ? parsedLIS.error : null}
        setAlgo={setAlgo}
        setFibN={setFibN}
        setKnapCapacity={setKnapCapacity}
        setLcsS1={setLcsS1}
        setLcsS2={setLcsS2}
        setMcmDimensions={setMcmDimensions}
        setLisArray={setLisArray}
        mode={effectiveMode}
        toggleMode={toggleMode}
        learningMode={learningMode}
        setLearningMode={setLearningMode}
      />
      
      <Toolbar 
        isPlaying={isPlaying}
        play={play}
        pause={pause}
        handlePrev={handlePrev}
        handleNext={handleNext}
        speed={speed}
        setSpeed={setSpeed}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
      />
      
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {effectiveMode === 'single' ? (
          <ResizableLayout
            leftPanel={
              <VisualPanel 
                step={currentTabStep} 
                learningMode={learningMode} 
                renderExplanation={renderExplanation}
              />
            }
            rightPanel={
              <CodePanel 
                code={uiRegistry[algo]?.code?.tabulation || []} 
                activeLine={currentTabStep.codeReference?.lineNumber || 1} 
              />
            }
          />
        ) : algo === 'mcm' && mcmCompareTimeline ? (
          <MCMCompareView
            timeline={mcmCompareTimeline}
            currentStepIndex={currentStepIndex}
            speed={speed}
          />
        ) : algo === 'lis' && lisCompareTimeline ? (
          <LISCompareView
            timeline={lisCompareTimeline}
            currentStepIndex={currentStepIndex}
            speed={speed}
            learningMode={learningMode}
            pause={pause}
          />
        ) : (
          <div style={{ padding: '0.5rem', height: '100%', overflow: 'hidden' }}>
            <ComparisonPanel 
              leftStep={memoizationSteps[Math.min(currentStepIndex, Math.max(0, memoizationSteps.length - 1))]!}
              rightStep={tabulationSteps[Math.min(currentStepIndex, Math.max(0, tabulationSteps.length - 1))]!}
              leftCode={uiRegistry[algo]?.code?.memoization || []}
              rightCode={uiRegistry[algo]?.code?.tabulation || []}
              learningMode={learningMode}
              algo={algo}
              renderExplanation={renderExplanation}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};
