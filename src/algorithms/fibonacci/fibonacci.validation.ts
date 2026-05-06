/* ============================================================================
 * DPVis — Fibonacci Input Validation
 * Pure function — no React, no DOM (AGENTS.md §1.2)
 * SRS §5.7: IV-01 through IV-04
 * ============================================================================ */

import type { AlgorithmInput, ValidationResult, FibonacciInput } from '../types';
import { FIBONACCI_MIN_N, FIBONACCI_MAX_N } from '../../constants';

/** Type guard to verify input is FibonacciInput */
function isFibonacciInput(input: AlgorithmInput): input is FibonacciInput {
  return 'n' in input && typeof (input as FibonacciInput).n === 'number';
}

/**
 * Validate Fibonacci input before step generation.
 * SRS §5.7 IV-03: Empty/missing input returns a specific error message.
 * SRS §5.7 IV-04: Constraint violations state the constraint value.
 */
export function validateFibonacciInput(input: AlgorithmInput): ValidationResult {
  if (!isFibonacciInput(input)) {
    return { isValid: false, error: 'Invalid input type for Fibonacci. Expected { n: number }.' };
  }

  const { n } = input;

  if (n === undefined || n === null) {
    return { isValid: false, error: 'Please provide a value for n.' };
  }

  if (!Number.isInteger(n)) {
    return { isValid: false, error: 'n must be a whole number.' };
  }

  if (n < FIBONACCI_MIN_N) {
    return { isValid: false, error: `n must be at least ${FIBONACCI_MIN_N}.` };
  }

  if (n > FIBONACCI_MAX_N) {
    return { isValid: false, error: `n must be at most ${FIBONACCI_MAX_N} to ensure performance.` };
  }

  return { isValid: true };
}
