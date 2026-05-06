/* ============================================================================
 * DPVis — Fibonacci Module (Barrel Export)
 * Assembles the three approach-specific AlgorithmModule implementations.
 * AGENTS.md §5.1: Every module implements the AlgorithmModule interface.
 * ============================================================================ */

import type { AlgorithmModule, ApproachModuleMap } from '../types';
import { validateFibonacciInput } from './fibonacci.validation';
import { generateFibonacciTabulation } from './fibonacci.tabulation';
import { generateFibonacciMemoization } from './fibonacci.memoization';
import { generateFibonacciBruteForce } from './fibonacci.bruteForce';
import { getFibonacciComplexity } from './fibonacci.complexity';
import { getFibonacciExplanationTemplates } from './fibonacci.templates';

/* ── Tabulation Module ────────────────────────────────────────────────────── */

const fibonacciTabulation: AlgorithmModule = {
  generateSteps: generateFibonacciTabulation,
  getComplexity: () => getFibonacciComplexity('tabulation'),
  getExplanationTemplates: getFibonacciExplanationTemplates,
  validateInput: validateFibonacciInput,
};

/* ── Memoization Module ───────────────────────────────────────────────────── */

const fibonacciMemoization: AlgorithmModule = {
  generateSteps: generateFibonacciMemoization,
  getComplexity: () => getFibonacciComplexity('memoization'),
  getExplanationTemplates: getFibonacciExplanationTemplates,
  validateInput: validateFibonacciInput,
};

/* ── Brute Force Module ───────────────────────────────────────────────────── */

const fibonacciBruteForce: AlgorithmModule = {
  generateSteps: generateFibonacciBruteForce,
  getComplexity: () => getFibonacciComplexity('brute_force'),
  getExplanationTemplates: getFibonacciExplanationTemplates,
  validateInput: validateFibonacciInput,
};

/* ── Approach Map ─────────────────────────────────────────────────────────── */

export const fibonacciApproaches: ApproachModuleMap = {
  tabulation: fibonacciTabulation,
  memoization: fibonacciMemoization,
  brute_force: fibonacciBruteForce,
};
