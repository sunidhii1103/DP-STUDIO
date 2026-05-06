/* ============================================================================
 * DPVis — Fibonacci Tabulation (generateSteps)
 * Pure function — AGENTS.md §1.2: No React, no DOM, deterministic.
 * AGENTS.md §2.3: Every step has a COMPLETE tableSnapshot.
 * ============================================================================ */

import type { AlgorithmInput, FibonacciInput } from '../types';
import type { Step, CellState, TableSnapshot1D } from '../../types/step.types';

/**
 * Deep-clone a 1D cells array for complete snapshot (AGENTS.md §2.3).
 * No delta encoding — each step has the full table state.
 */
function cloneCells(cells: CellState[]): CellState[] {
  return cells.map(c => ({ ...c }));
}

/**
 * Generate the complete step sequence for Fibonacci using bottom-up tabulation.
 *
 * dp[0] = 0, dp[1] = 1
 * dp[i] = dp[i-1] + dp[i-2]  for i >= 2
 */
export function generateFibonacciTabulation(input: AlgorithmInput): Step[] {
  const { n } = input as FibonacciInput;
  const steps: Step[] = [];
  let stepIndex = 0;
  let operationCount = 0;

  // Initialize the DP array
  const size = n + 1;
  const cells: CellState[] = Array.from({ length: size }, () => ({
    value: null,
    state: 'idle' as const,
  }));

  /** Helper to create a snapshot at the current state */
  function snapshot(): TableSnapshot1D {
    return { dimensions: 1, cells: cloneCells(cells) };
  }

  function createStep(overrides: Partial<Step>): Step {
    operationCount++;

    return {
      id: `step_${String(stepIndex).padStart(3, '0')}`,
      index: stepIndex,
      algorithm: 'fibonacci',
      approach: 'tabulation',
      operation: 'compute',
      tableSnapshot: overrides.tableSnapshot || snapshot(),
      activeIndices: { i: 0 },
      dependencyIndices: [],
      codeReference: { language: 'javascript', lineNumber: 1 },
      explanation: {
        operationType: 'compute',
        variables: {},
      },
      metrics: {
        totalOperationsSoFar: operationCount,
        cacheHitsSoFar: 0,
        stackDepth: 0,
        redundantComputesSoFar: 0,
        operationsCount: operationCount,
        statesStored: size,
      },
      ...overrides,
    };
  }

  // ── Step: Initialize dp[0] = 0 ──────────────────────────────────────────
  cells[0] = { value: 0, state: 'active' };
  steps.push(createStep({
    operation: 'initialize',
    activeIndices: { i: 0 },
    codeReference: { language: 'javascript', lineNumber: 3 },
    explanation: {
      operationType: 'initialize',
      variables: { i: 0, value: 0 },
      conceptNoteType: 'base_case',
    },
    milestoneId: 'fib_0',
  }));
  stepIndex++;

  // Mark dp[0] as computed
  cells[0] = { value: 0, state: 'computed' };

  // ── Step: Initialize dp[1] = 1 (if n >= 1) ─────────────────────────────
  if (n >= 1) {
    cells[1] = { value: 1, state: 'active' };
    steps.push(createStep({
      operation: 'initialize',
      activeIndices: { i: 1 },
      codeReference: { language: 'javascript', lineNumber: 4 },
      explanation: {
        operationType: 'initialize',
        variables: { i: 1, value: 1 },
        conceptNoteType: 'base_case',
      },
      milestoneId: 'fib_1',
    }));
    stepIndex++;

    cells[1] = { value: 1, state: 'computed' };
  }

  // ── Steps: Fill dp[2] through dp[n] ─────────────────────────────────────
  for (let i = 2; i <= n; i++) {
    const prev1 = cells[i - 1]?.value ?? 0;
    const prev2 = cells[i - 2]?.value ?? 0;
    const result = prev1 + prev2;

    // Mark dependencies
    const depCells = cloneCells(cells);
    if (i - 1 >= 0) depCells[i - 1] = { ...depCells[i - 1]!, state: 'dependency' };
    if (i - 2 >= 0) depCells[i - 2] = { ...depCells[i - 2]!, state: 'dependency' };
    depCells[i] = { value: result, state: 'active' };

    steps.push(createStep({
      operation: 'compute',
      tableSnapshot: { dimensions: 1, cells: depCells },
      activeIndices: { i },
      dependencyIndices: [{ i: i - 1 }, { i: i - 2 }],
      codeReference: { language: 'javascript', lineNumber: 6 },
      explanation: {
        operationType: 'compute',
        variables: {
          i,
          'dp[i-1]': prev1,
          'dp[i-2]': prev2,
          result,
        },
      },
      milestoneId: `fib_${i}`,
    }));
    stepIndex++;

    // Update the cell to computed
    cells[i] = { value: result, state: 'computed' };
  }

  // ── Final step: Result ──────────────────────────────────────────────────
  const finalValue = cells[n]?.value ?? 0;
  cells[n] = { value: finalValue, state: 'result' };

  steps.push(createStep({
    operation: 'result',
    activeIndices: { i: n },
    codeReference: { language: 'javascript', lineNumber: 8 },
    explanation: {
      operationType: 'result',
      variables: { n, result: finalValue },
    },
    milestoneId: `fib_${n}_result`,
  }));

  return steps;
}
