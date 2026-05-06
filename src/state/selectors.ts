/* ============================================================================
 * DPVis — Memoized State Selectors
 * AGENTS.md §6.3: Components should use selector hooks that derive and
 * memoize only the needed values, rather than subscribing to full AppState.
 * ============================================================================ */

import { useMemo } from 'react';
import { useAppContext } from './AppContext';
import type { Step } from '../types/step.types';

/**
 * Returns the current Step object, or null if no steps exist.
 * Memoized so that downstream React.memo components only re-render
 * when the actual step changes.
 */
export function useCurrentStep(): Step | null {
  const { state } = useAppContext();
  const { steps, currentStepIndex } = state;

  return useMemo(() => {
    if (steps.length === 0) return null;
    // Defensive: clamp index to valid range (AGENTS.md §7.2)
    const clampedIndex = Math.max(0, Math.min(currentStepIndex, steps.length - 1));
    return steps[clampedIndex] ?? null;
  }, [steps, currentStepIndex]);
}

/**
 * Returns playback-related state for the PlaybackControls component.
 * Only re-renders consumers when playback state changes.
 */
export function usePlaybackState() {
  const { state } = useAppContext();

  return useMemo(() => ({
    currentStepIndex: state.currentStepIndex,
    totalSteps: state.steps.length,
    isPlaying: state.isPlaying,
    playbackSpeed: state.playbackSpeed,
  }), [
    state.currentStepIndex,
    state.steps.length,
    state.isPlaying,
    state.playbackSpeed,
  ]);
}

/**
 * Returns algorithm selection state.
 */
export function useAlgorithmSelection() {
  const { state } = useAppContext();

  return useMemo(() => ({
    selectedAlgorithm: state.selectedAlgorithm,
    selectedApproach: state.selectedApproach,
    isComparisonMode: state.isComparisonMode,
    algorithmInput: state.algorithmInput,
    inputValidationError: state.inputValidationError,
  }), [
    state.selectedAlgorithm,
    state.selectedApproach,
    state.isComparisonMode,
    state.algorithmInput,
    state.inputValidationError,
  ]);
}

/**
 * Returns the full steps array (for debug mode / step inspection).
 */
export function useSteps(): Step[] {
  const { state } = useAppContext();
  return state.steps;
}
