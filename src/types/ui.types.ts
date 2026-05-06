/* ============================================================================
 * DPVis — UI Type Definitions
 * Props interfaces for UI components. Components receive the minimum
 * data they need (AGENTS.md §3.2).
 * ============================================================================ */

import type { Step, CellState, TableSnapshot1D, TableSnapshot2D, ActiveIndices } from './step.types';
import type { AlgorithmId, Approach } from './step.types';

/* ── Playback Speed ───────────────────────────────────────────────────────── */

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2 | 4;

/* ── Visualization Props ──────────────────────────────────────────────────── */

export interface DPCellProps {
  cell: CellState;
  /** Label for ARIA accessibility (NF-A03) */
  label?: string;
}

export interface DPTable1DProps {
  snapshot: TableSnapshot1D;
  activeIndices: ActiveIndices;
  dependencyIndices: ActiveIndices[];
}

export interface DPTable2DProps {
  snapshot: TableSnapshot2D;
  activeIndices: ActiveIndices;
  dependencyIndices: ActiveIndices[];
}

/* ── Playback Controls Props ──────────────────────────────────────────────── */

export interface PlaybackControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
}

/* ── Explanation Panel Props ──────────────────────────────────────────────── */

export interface ExplanationPanelProps {
  step: Step;
}

/* ── Code Panel Props ─────────────────────────────────────────────────────── */

export interface CodePanelProps {
  /** The code string to display */
  code: string;
  /** 1-based line number to highlight */
  highlightLine: number;
  /** Programming language for syntax display */
  language: 'javascript' | 'python';
}

/* ── Input Panel Props ────────────────────────────────────────────────────── */

export interface InputPanelProps {
  selectedAlgorithm: AlgorithmId;
  selectedApproach: Approach;
}

/* ── Comparison Engine Props ──────────────────────────────────────────────── */

export interface ComparisonStepBundle {
  bruteForce: Step[];
  memoization: Step[];
  tabulation: Step[];
}

export interface ApproachMetrics {
  totalOperations: number;
  cacheHits: number;
  stackDepth: number;
  cellsComputed: number;
  redundantComputes: number;
}
