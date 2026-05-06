/* ============================================================================
 * DPVis — Initial State
 * Default AppState values. Separated from reducer for clarity.
 * ============================================================================ */

import type { Step, AlgorithmId, Approach } from '../types/step.types';
import type { AlgorithmInput } from '../types/algorithm.types';
import type { PlaybackSpeed, ComparisonStepBundle } from '../types/ui.types';
import { DEFAULT_PLAYBACK_SPEED } from '../constants';

/* ── App State Shape (SRS §3.3) ───────────────────────────────────────────── */

export interface AppState {
  /* Algorithm selection */
  selectedAlgorithm: AlgorithmId;
  selectedApproach: Approach;
  isComparisonMode: boolean;

  /* Input */
  algorithmInput: AlgorithmInput;
  inputValidationError: string | null;

  /* Step engine */
  steps: Step[];
  comparisonSteps: ComparisonStepBundle | null;

  /* Playback */
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;

  /* UI state */
  isDebugMode: boolean;
}

/* ── Default State ────────────────────────────────────────────────────────── */

export const initialState: AppState = {
  selectedAlgorithm: 'fibonacci',
  selectedApproach: 'tabulation',
  isComparisonMode: false,

  algorithmInput: { n: 6 },
  inputValidationError: null,

  steps: [],
  comparisonSteps: null,

  currentStepIndex: 0,
  isPlaying: false,
  playbackSpeed: DEFAULT_PLAYBACK_SPEED as PlaybackSpeed,

  isDebugMode: false,
};
