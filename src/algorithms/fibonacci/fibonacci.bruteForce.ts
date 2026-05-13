/* ============================================================================
 * DPVis — Fibonacci Brute Force (generateSteps)
 * Pure function — AGENTS.md §1.2
 * Simulates naive recursive calls, exposing redundant computation.
 * Step count capped at MAX_STEPS to prevent runaway generation.
 * ============================================================================ */

import type { AlgorithmInput, FibonacciInput } from '../types';
import type { Step, CellState, TableSnapshot1D } from '../../types/step.types';
import { MAX_STEPS } from '../../engine/constants';

function cloneCells(cells: CellState[]): CellState[] {
  return cells.map(c => ({ ...c }));
}

/**
 * Generate the complete step sequence for Fibonacci using naive brute force.
 * This approach has exponential time complexity O(2^n), so steps are capped.
 */
export function generateFibonacciBruteForce(input: AlgorithmInput): Step[] {
  const { n } = input as FibonacciInput;
  const steps: Step[] = [];
  let stepIndex = 0;
  let operationCount = 0;
  let stackDepth = 0;
  let redundantComputes = 0;

  const size = n + 1;
  const cells: CellState[] = Array.from({ length: size }, () => ({
    value: null,
    state: 'idle' as const,
  }));

  // Track which subproblems have been computed (for redundancy counting)
  const computedOnce: Set<number> = new Set();

  function snapshot(): TableSnapshot1D {
    return { dimensions: 1, cells: cloneCells(cells) };
  }

  function createStep(overrides: Partial<Step>): Step {
    operationCount++;
    return {
      id: `step_${String(stepIndex).padStart(3, '0')}`,
      index: stepIndex,
      algorithm: 'fibonacci',
      approach: 'brute_force',
      operation: 'compute',
      tableSnapshot: snapshot(),
      activeIndices: { i: 0 },
      dependencyIndices: [],
      codeReference: { language: 'javascript', lineNumber: 1 },
      explanation: { operationType: 'compute', variables: {} },
      metrics: {
        totalOperationsSoFar: operationCount,
        cacheHitsSoFar: 0,
        stackDepth,
        redundantComputesSoFar: redundantComputes,
        operationsCount: operationCount,
        statesStored: computedOnce.size,
      },
      ...overrides,
    };
  }

  function fibBrute(k: number): number {
    // Bail out if we've hit the step limit
    if (steps.length >= MAX_STEPS) return k <= 1 ? k : 0;

    stackDepth++;

    // Track redundancy
    if (computedOnce.has(k)) {
      redundantComputes++;
    }

    // Base cases
    if (k <= 1) {
      cells[k] = { value: k, state: 'active' };
      steps.push(createStep({
        operation: 'initialize',
        activeIndices: { i: k },
        codeReference: { language: 'javascript', lineNumber: 2 },
        explanation: {
          operationType: 'initialize',
          variables: { k, value: k },
          conceptNoteType: 'base_case',
        },
        milestoneId: `fib_${k}`,
      }));
      stepIndex++;

      computedOnce.add(k);
      stackDepth--;
      return k;
    }

    // Recurse step — show that we're making two recursive calls
    cells[k] = { value: null, state: 'active' };
    steps.push(createStep({
      operation: 'recurse',
      activeIndices: { i: k },
      dependencyIndices: [{ i: k - 1 }, { i: k - 2 }],
      codeReference: { language: 'javascript', lineNumber: 4 },
      explanation: {
        operationType: 'recurse',
        variables: { k, 'k-1': k - 1, 'k-2': k - 2 },
        conceptNoteType: computedOnce.has(k) ? 'overlapping_subproblem' : undefined,
      },
    }));
    stepIndex++;

    if (steps.length >= MAX_STEPS) { stackDepth--; return 0; }

    const val1 = fibBrute(k - 1);
    if (steps.length >= MAX_STEPS) { stackDepth--; return 0; }
    const val2 = fibBrute(k - 2);

    const result = val1 + val2;

    // Return step
    cells[k] = { value: result, state: 'computed' };
    if (steps.length < MAX_STEPS) {
      steps.push(createStep({
        operation: 'return',
        activeIndices: { i: k },
        dependencyIndices: [{ i: k - 1 }, { i: k - 2 }],
        codeReference: { language: 'javascript', lineNumber: 5 },
        explanation: {
          operationType: 'return',
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
    }

    computedOnce.add(k);
    stackDepth--;
    return result;
  }

  const finalValue = fibBrute(n);

  // Final result step
  if (steps.length < MAX_STEPS) {
    cells[n] = { value: finalValue, state: 'result' };
    steps.push(createStep({
      operation: 'result',
      activeIndices: { i: n },
      codeReference: { language: 'javascript', lineNumber: 6 },
      explanation: {
        operationType: 'result',
        variables: { n, result: finalValue },
      },
      milestoneId: `fib_${n}_result`,
    }));
  }

  return steps;
}
