/* ============================================================================
 * DPVis — App Reducer
 * Pure reducer function — all action handlers (SRS §3.3).
 * AGENTS.md §7.2: Step index is always clamped to valid range.
 * AGENTS.md §6.1: Each action handles all related state changes atomically.
 * ============================================================================ */

import type { AppState } from './initialState';
import type { AppAction } from './actions';
import {
  SET_ALGORITHM,
  SET_APPROACH,
  SET_INPUT,
  SET_INPUT_ERROR,
  GENERATE_STEPS,
  SET_STEP_INDEX,
  STEP_FORWARD,
  STEP_BACKWARD,
  SET_PLAYING,
  SET_SPEED,
  RESET,
  TOGGLE_DEBUG,
  TOGGLE_COMPARISON,
  SET_COMPARISON_STEPS,
} from './actions';
import { MIN_STEP_INDEX } from '../constants';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case SET_ALGORITHM:
      return {
        ...state,
        selectedAlgorithm: action.payload,
        // Clear steps when algorithm changes
        steps: [],
        comparisonSteps: null,
        currentStepIndex: MIN_STEP_INDEX,
        isPlaying: false,
        inputValidationError: null,
      };

    case SET_APPROACH:
      return {
        ...state,
        selectedApproach: action.payload,
        // Clear steps when approach changes
        steps: [],
        currentStepIndex: MIN_STEP_INDEX,
        isPlaying: false,
        inputValidationError: null,
      };

    case SET_INPUT:
      return {
        ...state,
        algorithmInput: action.payload,
        inputValidationError: null,
      };

    case SET_INPUT_ERROR:
      return {
        ...state,
        inputValidationError: action.payload,
        isPlaying: false,
      };

    case GENERATE_STEPS:
      return {
        ...state,
        steps: action.payload,
        currentStepIndex: MIN_STEP_INDEX,
        isPlaying: false,
        inputValidationError: null,
      };

    case SET_STEP_INDEX: {
      // Clamp to valid range (AGENTS.md §7.2)
      const maxIndex = Math.max(state.steps.length - 1, 0);
      const clamped = Math.max(MIN_STEP_INDEX, Math.min(action.payload, maxIndex));
      return {
        ...state,
        currentStepIndex: clamped,
      };
    }

    case STEP_FORWARD: {
      // No-op at final step (SRS §5.6 PC-03)
      const maxIndex = Math.max(state.steps.length - 1, 0);
      return {
        ...state,
        currentStepIndex: Math.min(state.currentStepIndex + 1, maxIndex),
      };
    }

    case STEP_BACKWARD:
      // No-op at step 0 (SRS §5.6 PC-04)
      return {
        ...state,
        currentStepIndex: Math.max(state.currentStepIndex - 1, MIN_STEP_INDEX),
      };

    case SET_PLAYING:
      return {
        ...state,
        isPlaying: action.payload,
      };

    case SET_SPEED:
      return {
        ...state,
        playbackSpeed: action.payload,
      };

    case RESET:
      // Return to step 0 without regenerating (SRS §5.6 PC-06)
      return {
        ...state,
        currentStepIndex: MIN_STEP_INDEX,
        isPlaying: false,
      };

    case TOGGLE_DEBUG:
      return {
        ...state,
        isDebugMode: !state.isDebugMode,
      };

    case TOGGLE_COMPARISON:
      return {
        ...state,
        isComparisonMode: !state.isComparisonMode,
        comparisonSteps: state.isComparisonMode ? null : state.comparisonSteps,
      };

    case SET_COMPARISON_STEPS:
      return {
        ...state,
        comparisonSteps: action.payload,
      };

    default:
      return state;
  }
}
