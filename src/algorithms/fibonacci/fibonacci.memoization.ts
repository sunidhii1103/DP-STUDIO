/* ============================================================================
 * DPVis — Fibonacci Memoization (generateSteps)
 * Pure function — AGENTS.md §1.2: No React, no DOM, deterministic.
 * Simulates top-down recursive calls with memoization cache.
 * ============================================================================ */

import type { AlgorithmInput, FibonacciInput } from '../types';
import type { Step, CellState, TableSnapshot1D } from '../../types/step.types';

function cloneCells(cells: CellState[]): CellState[] {
  return cells.map(c => ({ ...c }));
}

/**
 * Generate the complete step sequence for Fibonacci using top-down memoization.
 * Simulates the recursive call tree, recording each call, cache hit, and return.
 */
export function generateFibonacciMemoization(input: AlgorithmInput): Step[] {
  const { n } = input as FibonacciInput;
  const steps: Step[] = [];
  let stepIndex = 0;
  let operationCount = 0;
  let cacheHits = 0;
  let stackDepth = 0;
  let maxStackDepth = 0;

  const size = n + 1;
  const cells: CellState[] = Array.from({ length: size }, () => ({
    value: null,
    state: 'idle' as const,
  }));
  const memo: Map<number, number> = new Map();

  function snapshot(): TableSnapshot1D {
    return { dimensions: 1, cells: cloneCells(cells) };
  }

  function createStep(overrides: Partial<Step>): Step {
    operationCount++;
    return {
      id: `step_${String(stepIndex).padStart(3, '0')}`,
      index: stepIndex,
      algorithm: 'fibonacci',
      approach: 'memoization',
      operation: 'compute',
      tableSnapshot: snapshot(),
      activeIndices: { i: 0 },
      dependencyIndices: [],
      codeReference: { language: 'javascript', lineNumber: 1 },
      explanation: { operationType: 'compute', variables: {} },
      metrics: {
        totalOperationsSoFar: operationCount,
        cacheHitsSoFar: cacheHits,
        stackDepth,
        redundantComputesSoFar: 0,
        operationsCount: operationCount,
        statesStored: memo.size,
      },
      ...overrides,
    };
  }

  function fibMemo(k: number): number {
    stackDepth++;
    if (stackDepth > maxStackDepth) maxStackDepth = stackDepth;

    // Check cache
    if (memo.has(k)) {
      const cached = memo.get(k)!;
      cacheHits++;

      cells[k] = { value: cached, state: 'cached' };
      steps.push(createStep({
        operation: 'cache_hit',
        activeIndices: { i: k },
        codeReference: { language: 'javascript', lineNumber: 2 },
        explanation: {
          operationType: 'cache_hit',
          variables: { k, cachedValue: cached },
          conceptNoteType: 'cache_benefit',
        },
        milestoneId: `fib_${k}`,
      }));
      stepIndex++;

      stackDepth--;
      return cached;
    }

    // Base cases
    if (k <= 1) {
      cells[k] = { value: k, state: 'active' };
      steps.push(createStep({
        operation: 'initialize',
        activeIndices: { i: k },
        codeReference: { language: 'javascript', lineNumber: 3 },
        explanation: {
          operationType: 'initialize',
          variables: { k, value: k },
          conceptNoteType: 'base_case',
        },
        milestoneId: `fib_${k}`,
      }));
      stepIndex++;

      cells[k] = { value: k, state: 'computed' };
      memo.set(k, k);
      stackDepth--;
      return k;
    }

    // Recurse step
    cells[k] = { value: null, state: 'active' };
    steps.push(createStep({
      operation: 'recurse',
      activeIndices: { i: k },
      dependencyIndices: [{ i: k - 1 }, { i: k - 2 }],
      codeReference: { language: 'javascript', lineNumber: 4 },
      explanation: {
        operationType: 'recurse',
        variables: { k, 'k-1': k - 1, 'k-2': k - 2 },
      },
    }));
    stepIndex++;

    const val1 = fibMemo(k - 1);
    const val2 = fibMemo(k - 2);
    const result = val1 + val2;

    // Compute step
    memo.set(k, result);

    // Show dependencies highlighted
    const depCells = cloneCells(cells);
    if (k - 1 >= 0 && k - 1 < size) depCells[k - 1] = { ...depCells[k - 1]!, state: 'dependency' };
    if (k - 2 >= 0 && k - 2 < size) depCells[k - 2] = { ...depCells[k - 2]!, state: 'dependency' };
    depCells[k] = { value: result, state: 'active' };

    steps.push(createStep({
      operation: 'compute',
      tableSnapshot: { dimensions: 1, cells: depCells },
      activeIndices: { i: k },
      dependencyIndices: [{ i: k - 1 }, { i: k - 2 }],
      codeReference: { language: 'javascript', lineNumber: 4 },
      explanation: {
        operationType: 'compute',
        variables: {
          k,
          'fib(k-1)': val1,
          'fib(k-2)': val2,
          result,
        },
      },
      milestoneId: `fib_${k}`,
    }));
    stepIndex++;

    cells[k] = { value: result, state: 'computed' };
    stackDepth--;
    return result;
  }

  // Execute memoized recursion
  const finalValue = fibMemo(n);

  // Final result step
  cells[n] = { value: finalValue, state: 'result' };
  steps.push(createStep({
    operation: 'result',
    activeIndices: { i: n },
    codeReference: { language: 'javascript', lineNumber: 5 },
    explanation: {
      operationType: 'result',
      variables: { n, result: finalValue },
    },
    milestoneId: `fib_${n}_result`,
  }));

  return steps;
}
