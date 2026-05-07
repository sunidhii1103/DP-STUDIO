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
  onStartTutorial: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  algo, fibN, knapCapacity, lcsS1, lcsS2, mcmDimensions, mcmValidationError, lisArray, lisValidationError, setAlgo, setFibN, setKnapCapacity, setLcsS1, setLcsS2, setMcmDimensions, setLisArray, mode, toggleMode, learningMode, setLearningMode, onStartTutorial
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
    <header className="app-header">
      <div className="app-header-title">
        <div className="logo" onClick={() => window.location.href = '/'}>
          <img src="/logo.png" alt="DP Studio" />
          <span>DP Studio</span>
        </div>
        <div className="app-header-divider"></div>
        <span className="app-header-algo-name">{title}</span>
      </div>
      
      <div className="app-header-controls">
        <div className="app-header-section app-header-inputs" data-tour="step-1">
          <select 
            value={algo} 
            onChange={(e) => setAlgo(e.target.value as AlgorithmId)}
            className="header-select"
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
              className="header-input header-input-short"
            />
          )}

          {algo === 'knapsack' && (
            <input 
              type="number" 
              value={knapCapacity} 
              onChange={(e) => setKnapCapacity(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              className="header-input header-input-short"
            />
          )}

          {(algo === 'lcs' || algo === 'edit-distance') && (
            <>
              <input 
                type="text" 
                value={lcsS1} 
                onChange={(e) => setLcsS1(e.target.value.substring(0, 12).toUpperCase())}
                placeholder="S1"
                className="header-input header-input-medium"
              />
              <input 
                type="text" 
                value={lcsS2} 
                onChange={(e) => setLcsS2(e.target.value.substring(0, 12).toUpperCase())}
                placeholder="S2"
                className="header-input header-input-medium"
              />
            </>
          )}

          {algo === 'mcm' && (
            <div className="header-input-wrapper">
              <input
                type="text"
                value={mcmDimensions}
                onChange={(e) => setMcmDimensions(e.target.value)}
                placeholder="10,30,5,60"
                aria-invalid={!!mcmValidationError}
                className={`header-input header-input-long ${mcmValidationError ? 'header-input-error' : ''}`}
              />
              {mcmValidationError && (
                <span className="header-input-error-msg">
                  {mcmValidationError}
                </span>
              )}
            </div>
          )}

          {algo === 'lis' && (
            <div className="header-input-wrapper">
              <input
                type="text"
                value={lisArray}
                onChange={(e) => setLisArray(e.target.value)}
                placeholder="10,9,2,5,3,7,101,18"
                aria-invalid={!!lisValidationError}
                className={`header-input header-input-xl ${lisValidationError ? 'header-input-error' : ''}`}
              />
              {lisValidationError && (
                <span className="header-input-error-msg">
                  {lisValidationError}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="app-header-section app-header-mode" data-tour="step-2">
          <button 
            onClick={() => { if (mode !== 'single') toggleMode() }}
            className={`mode-btn ${mode === 'single' ? 'mode-btn-active' : ''}`}
          >
            Single
          </button>
          <button 
            title={algo === 'lis' ? 'Compare brute force recursion, O(n^2) DP, and O(n log n) tails.' : undefined}
            onClick={() => { if (mode !== 'comparison') toggleMode() }}
            className={`mode-btn ${mode === 'comparison' ? 'mode-btn-active' : ''}`}
          >
            Compare
          </button>
        </div>

        <div className="app-header-section app-header-learning">
          <button 
            data-tour="step-4"
            onClick={() => setLearningMode(!learningMode)}
            className={`learning-btn ${learningMode ? 'learning-btn-on' : 'learning-btn-off'}`}
          >
            {learningMode ? 'Learning On' : 'Learning Off'}
          </button>

          <button 
            onClick={onStartTutorial}
            className="tutorial-header-btn"
          >
            Tutorial
          </button>
        </div>
      </div>
    </header>
  );
};
