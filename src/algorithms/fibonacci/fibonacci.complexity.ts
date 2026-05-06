/* ============================================================================
 * DPVis — Fibonacci Complexity Metadata
 * Pure data — no React, no DOM (AGENTS.md §1.2)
 * SRS §4.4: ComplexityMetadata for chart rendering
 * ============================================================================ */

import type { ComplexityMetadata } from '../types';
import type { Approach } from '../../types/step.types';

/**
 * Return complexity metadata for the given Fibonacci approach.
 * Growth samples are pre-computed for chart rendering.
 */
export function getFibonacciComplexity(approach: Approach): ComplexityMetadata {
  switch (approach) {
    case 'brute_force':
      return {
        approach: 'brute_force',
        timeComplexity: {
          notation: 'O(2ⁿ)',
          description: 'Each call branches into two recursive calls, creating an exponential call tree.',
          order: 3,
        },
        spaceComplexity: {
          notation: 'O(n)',
          description: 'Call stack depth grows linearly with n.',
        },
        growthSamples: [
          { n: 1, ops: 1 },
          { n: 5, ops: 15 },
          { n: 10, ops: 177 },
          { n: 15, ops: 1973 },
          { n: 20, ops: 21891 },
          { n: 25, ops: 242785 },
          { n: 30, ops: 2692537 },
        ],
      };

    case 'memoization':
      return {
        approach: 'memoization',
        timeComplexity: {
          notation: 'O(n)',
          description: 'Each subproblem is computed at most once and cached. Subsequent lookups are O(1).',
          order: 1,
        },
        spaceComplexity: {
          notation: 'O(n)',
          description: 'Memo table stores n values, plus call stack depth of n.',
        },
        growthSamples: [
          { n: 1, ops: 1 },
          { n: 5, ops: 9 },
          { n: 10, ops: 19 },
          { n: 15, ops: 29 },
          { n: 20, ops: 39 },
          { n: 25, ops: 49 },
          { n: 30, ops: 59 },
        ],
      };

    case 'tabulation':
      return {
        approach: 'tabulation',
        timeComplexity: {
          notation: 'O(n)',
          description: 'Single pass through the table from index 0 to n.',
          order: 1,
        },
        spaceComplexity: {
          notation: 'O(n)',
          description: 'DP array of size n+1.',
        },
        growthSamples: [
          { n: 1, ops: 1 },
          { n: 5, ops: 6 },
          { n: 10, ops: 11 },
          { n: 15, ops: 16 },
          { n: 20, ops: 21 },
          { n: 25, ops: 26 },
          { n: 30, ops: 31 },
        ],
      };
  }
}
