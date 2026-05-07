/* ============================================================================
 * DPVis — Step Type Definitions
 * The most critical data structure in the system (SRS §4.1).
 * Every animation, explanation, code highlight, and metric is derived from
 * the Step object. All panels are independent consumers of the same immutable
 * Step object — zero inter-panel communication.
 * ============================================================================ */

/* ── Core Enums / Unions ──────────────────────────────────────────────────── */

/** Supported algorithm identifiers */
export type AlgorithmId = 'fibonacci' | 'knapsack' | 'lcs' | 'edit-distance' | 'mcm' | 'lis';

/** Supported approach strategies */
export type Approach = 'brute_force' | 'memoization' | 'tabulation';

/**
 * Operation types representing atomic algorithm actions.
 * Each step is tagged with exactly one operation type.
 */
export type OperationType =
  | 'initialize'    // Setting up base cases
  | 'read'          // Reading a previously computed value
  | 'compare'       // Evaluating a condition (e.g., s1[i] === s2[j])
  | 'compute'       // Calculating dp[i][j] from dependencies
  | 'cache_hit'     // Memoization: returning a cached value
  | 'cache_miss'    // Memoization: first time computing a subproblem
  | 'recurse'       // Brute force: making a recursive call
  | 'return'        // Returning from a recursive call
  | 'result'        // Final step — solution extracted
  // LCS Specific Actions
  | 'match'
  | 'mismatch'
  | 'choose_top'
  | 'choose_left'
  | 'backtrack_match'
  | 'backtrack_move_top'
  | 'backtrack_move_left'
  // Edit Distance Specific Actions
  | 'edit_match'
  | 'edit_insert'
  | 'edit_delete'
  | 'edit_replace'
  | 'backtrack_edit_match'
  | 'backtrack_edit_insert'
  | 'backtrack_edit_delete'
  | 'backtrack_edit_replace'
  // Matrix Chain Multiplication Specific Actions
  | 'chain_length'
  | 'select_interval'
  | 'try_split'
  | 'calculate_cost'
  | 'update_min'
  | 'final_decision'
  | 'backtrack_split';

/** Visual state of a single DP table cell (drives CSS classes per AGENTS.md §2.1) */
export type CellVisualState =
  | 'idle'
  | 'active'
  | 'dependency'
  | 'computed'
  | 'result'
  | 'cached'
  | 'match'        // Used during LCS backtracking or computation
  | 'path';        // Used during LCS backtracking

/* ── Cell & Table Types ───────────────────────────────────────────────────── */

/** Represents the state of a single cell in the DP table */
export interface CellState {
  /** Cell value — null means not yet computed. String is used for backtracking arrows. */
  value: number | string | null;
  /** Visual state, mapped to CSS class dp-cell--{state} */
  state: CellVisualState;
}

/** 1D table snapshot (e.g., Fibonacci) */
export interface TableSnapshot1D {
  dimensions: 1;
  labels?: string[];
  cells: CellState[];
  metadata?: Record<string, unknown>;
}

/** 2D table snapshot (e.g., Knapsack, LCS) */
export interface TableSnapshot2D {
  dimensions: 2;
  rowLabels?: string[];
  colLabels?: string[];
  cells: CellState[][];
  metadata?: Record<string, unknown>;
}

/** Complete table snapshot at a given step */
export type TableSnapshot = TableSnapshot1D | TableSnapshot2D;

/* ── Index Types ──────────────────────────────────────────────────────────── */

/** Active indices being evaluated in the current step */
export interface ActiveIndices {
  i: number;
  /** Only present for 2D algorithms */
  j?: number;
}

/* ── Code Reference ───────────────────────────────────────────────────────── */

/** Maps a step to a specific line of code (SRS §5.5 CS-01) */
export interface CodeReference {
  language: 'javascript' | 'python';
  /** 1-based line number to highlight */
  lineNumber: number;
  /** Optional: the specific expression being evaluated */
  snippet?: string;
}

/* ── Explanation Metadata ─────────────────────────────────────────────────── */

/** Metadata used by the Explanation Engine to render per-step explanations */
export interface ExplanationMetadata {
  operationType: OperationType;
  /** Template variables — injected into explanation templates at render time */
  variables: Record<string, string | number>;
  /** Conceptual note type (optional, shown at contextually appropriate steps) */
  conceptNoteType?: 'overlapping_subproblem' | 'base_case' | 'optimal_substructure' | 'cache_benefit';
}

/* ── Step Metrics ─────────────────────────────────────────────────────────── */

/** Performance metrics tracked per step for the Comparison Engine */
export interface StepMetrics {
  totalOperationsSoFar: number;
  cacheHitsSoFar: number;
  stackDepth: number;
  redundantComputesSoFar: number;
  operationsCount: number;
  statesStored: number;
}

/* ── Step Object ──────────────────────────────────────────────────────────── */

/**
 * The Step object — the single most important data structure in DPVis.
 *
 * INVARIANTS (AGENTS.md):
 * - Every Step contains a COMPLETE tableSnapshot (no delta encoding) [§2.3]
 * - Steps are immutable once stored in state [§2.2]
 * - Steps are JSON-serializable [SE-03]
 * - Same input always produces identical Step[] [§1.2]
 */
export interface Step {
  /* ── Identity ─────────────────────────────────────────────────────────── */

  /** Unique step identifier, e.g. "step_042" */
  id: string;
  /** 0-based position in step sequence */
  index: number;
  /** Logical sync point for Comparison Engine milestone synchronization */
  milestoneId?: string;

  /* ── Execution Context ────────────────────────────────────────────────── */

  algorithm: AlgorithmId;
  approach: Approach;
  operation: OperationType;

  /* ── State Snapshot ───────────────────────────────────────────────────── */

  /** Complete DP table state at this step — NEVER relies on previous step */
  tableSnapshot: TableSnapshot;

  /* ── Active Indices ───────────────────────────────────────────────────── */

  /** Indices being evaluated this step */
  activeIndices: ActiveIndices;

  /** Dependencies referenced this step (cells read to compute active cell) */
  dependencyIndices: ActiveIndices[];

  /** Optional algorithm-specific structured metadata. Must remain JSON-serializable. */
  metadata?: Record<string, unknown>;

  /* ── Code Reference ───────────────────────────────────────────────────── */

  /** Maps this step to a specific line in the displayed code */
  codeReference: CodeReference;

  /* ── Explanation ──────────────────────────────────────────────────────── */

  /** Metadata consumed by the Explanation Engine for template rendering */
  explanation: ExplanationMetadata;

  /* ── Performance Metrics ──────────────────────────────────────────────── */

  /** Cumulative metrics for Comparison Engine display */
  metrics: StepMetrics;
}
