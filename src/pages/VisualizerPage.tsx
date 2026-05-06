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

import { usePlayback } from '../hooks/usePlayback';
import type { Step } from '../types/step.types';

type Mode = 'single' | 'comparison';
type AlgorithmSelection = 'fibonacci' | 'knapsack' | 'lcs';

export const VisualizerPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>('single');
  const [learningMode, setLearningMode] = useState(false);
  const [algo, setAlgo] = useState<AlgorithmSelection>('fibonacci');
  const [fibN, setFibN] = useState(5);
  const [knapCapacity, setKnapCapacity] = useState(5);
  const [lcsS1, setLcsS1] = useState('ABCBDAB');
  const [lcsS2, setLcsS2] = useState('BDCAB');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [knapItems, _setKnapItems] = useState([
    { weight: 2, value: 3, label: 'A' },
    { weight: 3, value: 4, label: 'B' },
    { weight: 4, value: 5, label: 'C' },
  ]);

  const { tabulationSteps, memoizationSteps } = React.useMemo(() => {
    if (!uiRegistry || !uiRegistry[algo]) return { tabulationSteps: [], memoizationSteps: [] };
    try {
      let inputConfig;
      if (algo === 'fibonacci') inputConfig = { n: fibN };
      else if (algo === 'knapsack') inputConfig = { capacity: knapCapacity, items: knapItems };
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
  }, [algo, fibN, knapCapacity, knapItems, lcsS1, lcsS2]);

  const totalSteps = mode === 'single' 
    ? tabulationSteps.length 
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
    setCurrentStepIndex(0);
    pause();
  }, [algo, fibN, knapCapacity, knapItems, lcsS1, lcsS2, setCurrentStepIndex, pause]);

  const toggleMode = () => {
    pause();
    setCurrentStepIndex(0);
    setMode(prev => prev === 'single' ? 'comparison' : 'single');
  };

  const renderExplanation = (step: Step) => {
    if (!step || !step.explanation || !step.explanation.variables) return null;
    const { operationType, variables } = step.explanation;
    
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
        setAlgo={setAlgo}
        setFibN={setFibN}
        setKnapCapacity={setKnapCapacity}
        setLcsS1={setLcsS1}
        setLcsS2={setLcsS2}
        mode={mode}
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
        {mode === 'single' ? (
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
