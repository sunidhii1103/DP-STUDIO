/* ============================================================================
 * DPVis — Action Types & Action Creators
 * AGENTS.md §4.3: All action type strings are SCREAMING_SNAKE_CASE constants.
 * No action type string may be hardcoded inline in a component.
 * AGENTS.md §6.1: Single dispatch point per user action.
 * ============================================================================ */

import type { Step, AlgorithmId, Approach } from '../types/step.types';
import type { AlgorithmInput } from '../types/algorithm.types';
import type { PlaybackSpeed, ComparisonStepBundle } from '../types/ui.types';

/* ── Action Type Constants ────────────────────────────────────────────────── */

export const SET_ALGORITHM = 'SET_ALGORITHM' as const;
export const SET_APPROACH = 'SET_APPROACH' as const;
export const SET_INPUT = 'SET_INPUT' as const;
export const SET_INPUT_ERROR = 'SET_INPUT_ERROR' as const;
export const GENERATE_STEPS = 'GENERATE_STEPS' as const;
export const SET_STEP_INDEX = 'SET_STEP_INDEX' as const;
export const STEP_FORWARD = 'STEP_FORWARD' as const;
export const STEP_BACKWARD = 'STEP_BACKWARD' as const;
export const SET_PLAYING = 'SET_PLAYING' as const;
export const SET_SPEED = 'SET_SPEED' as const;
export const RESET = 'RESET' as const;
export const TOGGLE_DEBUG = 'TOGGLE_DEBUG' as const;
export const TOGGLE_COMPARISON = 'TOGGLE_COMPARISON' as const;
export const SET_COMPARISON_STEPS = 'SET_COMPARISON_STEPS' as const;

/* ── Action Interfaces ────────────────────────────────────────────────────── */

interface SetAlgorithmAction {
  type: typeof SET_ALGORITHM;
  payload: AlgorithmId;
}

interface SetApproachAction {
  type: typeof SET_APPROACH;
  payload: Approach;
}

interface SetInputAction {
  type: typeof SET_INPUT;
  payload: AlgorithmInput;
}

interface SetInputErrorAction {
  type: typeof SET_INPUT_ERROR;
  payload: string | null;
}

interface GenerateStepsAction {
  type: typeof GENERATE_STEPS;
  payload: Step[];
}

interface SetStepIndexAction {
  type: typeof SET_STEP_INDEX;
  payload: number;
}

interface StepForwardAction {
  type: typeof STEP_FORWARD;
}

interface StepBackwardAction {
  type: typeof STEP_BACKWARD;
}

interface SetPlayingAction {
  type: typeof SET_PLAYING;
  payload: boolean;
}

interface SetSpeedAction {
  type: typeof SET_SPEED;
  payload: PlaybackSpeed;
}

interface ResetAction {
  type: typeof RESET;
}

interface ToggleDebugAction {
  type: typeof TOGGLE_DEBUG;
}

interface ToggleComparisonAction {
  type: typeof TOGGLE_COMPARISON;
}

interface SetComparisonStepsAction {
  type: typeof SET_COMPARISON_STEPS;
  payload: ComparisonStepBundle | null;
}

/** Discriminated union of all possible actions */
export type AppAction =
  | SetAlgorithmAction
  | SetApproachAction
  | SetInputAction
  | SetInputErrorAction
  | GenerateStepsAction
  | SetStepIndexAction
  | StepForwardAction
  | StepBackwardAction
  | SetPlayingAction
  | SetSpeedAction
  | ResetAction
  | ToggleDebugAction
  | ToggleComparisonAction
  | SetComparisonStepsAction;
