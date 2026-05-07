/* ============================================================================
 * DPVis — Algorithm Type Definitions
 * Defines the AlgorithmModule interface contract (SRS §3.1),
 * algorithm input types (SRS §4.3), and complexity metadata (SRS §4.4).
 * ============================================================================ */

import type { Step, Approach, ExplanationMetadata } from './step.types';
import type { TableSnapshot } from './step.types';

/* ── Algorithm Input Types ────────────────────────────────────────────────── */

export interface FibonacciInput {
  /** Compute fib(n), range: 1–30 */
  n: number;
}

export interface KnapsackInput {
  /** Knapsack weight capacity, max: 20 */
  capacity: number;
  /** Items array, max 8 items */
  items: Array<{
    weight: number;
    value: number;
    label: string;
  }>;
}

export interface LCSInput {
  /** First string, max length: 12 */
  s1: string;
  /** Second string, max length: 12 */
  s2: string;
}

export interface EditDistanceInput {
  /** First string, max length: 12 */
  s1: string;
  /** Second string, max length: 12 */
  s2: string;
}

export interface MCMInput {
  /** Matrix dimensions p. Matrix Ai has size p[i-1] x p[i]. */
  dimensions: number[];
}

export interface LISInput {
  /** Numeric sequence for Longest Increasing Subsequence, max length: 16 */
  nums: number[];
}

/** Union of all possible algorithm inputs */
export type AlgorithmInput = FibonacciInput | KnapsackInput | LCSInput | EditDistanceInput | MCMInput | LISInput;

/* ── Validation ───────────────────────────────────────────────────────────── */

export interface ValidationResult {
  isValid: boolean;
  /** Specific error message if invalid (SRS §5.7 IV-03, IV-04) */
  error?: string;
}

/* ── Explanation Templates ────────────────────────────────────────────────── */

/** Context passed to explanation template functions */
export type StepContext = ExplanationMetadata['variables'];

/** Template functions for rendering step-level explanations (SRS §3.5) */
export interface ExplanationTemplate {
  header: (ctx: StepContext) => string;
  recurrence: (ctx: StepContext) => string;
  substituted: (ctx: StepContext) => string;
  decision: (ctx: StepContext) => string;
  conceptNote?: (ctx: StepContext) => string;
}

/** Map of operation type → explanation template */
export type ExplanationTemplateMap = {
  [operationType: string]: ExplanationTemplate;
};

/* ── Complexity Metadata ──────────────────────────────────────────────────── */

export interface ComplexityMetadata {
  approach: Approach;
  timeComplexity: {
    /** e.g., 'O(2^n)' */
    notation: string;
    description: string;
    /** For sorting/comparison: 1=linear, 2=quadratic, 3=exponential */
    order: number;
  };
  spaceComplexity: {
    notation: string;
    description: string;
  };
  /** Growth data points for chart rendering */
  growthSamples: Array<{ n: number; ops: number }>;
}

/* ── Algorithm Module Interface ───────────────────────────────────────────── */

/**
 * The AlgorithmModule interface — every algorithm must implement this exactly.
 * AGENTS.md §5.1: This interface is inviolable.
 *
 * Rules (AGENTS.md §1.2):
 * - generateSteps must be a pure function
 * - No setState, DOM access, or React hooks
 * - Testable independently of React
 */
export interface AlgorithmModule {
  /**
   * Pre-generate all steps for a given input.
   * Must be pure — identical inputs always produce identical Step[].
   * No UI side effects.
   */
  generateSteps(input: AlgorithmInput): Step[];

  /** Optional helper for algorithms that can expose an initial grid directly. */
  generateGrid?(input: AlgorithmInput): TableSnapshot;

  /** Optional code provider used by registry bridges that prefer module-owned code. */
  getCode?(): string[];

  /** Optional static metadata for algorithm-specific UI or docs. */
  getMetadata?(): Record<string, unknown>;

  /** Optional learning context for algorithm-specific teaching panels. */
  getLearningContext?(): Record<string, unknown>;

  /** Return static complexity metadata for this algorithm + approach */
  getComplexity(): ComplexityMetadata;

  /** Return explanation templates keyed by operation type */
  getExplanationTemplates(): ExplanationTemplateMap;

  /** Validate input before step generation (SRS §5.7 IV-01) */
  validateInput(input: AlgorithmInput): ValidationResult;
}

/* ── Algorithm Registry Types ─────────────────────────────────────────────── */

import type { AlgorithmId } from './step.types';

/** Maps approach to its AlgorithmModule implementation */
export type ApproachModuleMap = Partial<Record<Approach, AlgorithmModule>>;

/** Maps algorithm ID to its approach modules */
export type AlgorithmRegistry = Record<AlgorithmId, ApproachModuleMap>;
