/* ============================================================================
 * DPVis — Step Orchestrator (Layer 2)
 * Orchestrates step generation: validates input, calls the algorithm module,
 * and delivers the resulting Step[] to state management.
 *
 * AGENTS.md §2.4: generateSteps() does NOT call setState. The orchestrator
 * calls generateSteps() and then dispatches the result. These two concerns
 * must never be merged.
 *
 * Architecture.md §2: Step Engine may depend on Algorithm Logic (Layer 1)
 * but NOT on UI (Layer 4).
 * ============================================================================ */

import { algorithmRegistry } from '../algorithms/registry';
import type { AlgorithmInput, ValidationResult } from '../algorithms/types';
import type { Step, AlgorithmId, Approach } from '../types/step.types';
import { MAX_STEPS, STEP_LIMIT_WARNING } from './constants';

/* ── Result Types ─────────────────────────────────────────────────────────── */

interface StepGenerationSuccess {
  success: true;
  steps: Step[];
  warning?: string;
}

interface StepGenerationFailure {
  success: false;
  error: string;
}

export type StepGenerationResult = StepGenerationSuccess | StepGenerationFailure;

/* ── Orchestrator ─────────────────────────────────────────────────────────── */

/**
 * Validate input for the selected algorithm + approach.
 * Returns a ValidationResult without side effects.
 */
export function validateAlgorithmInput(
  algorithmId: AlgorithmId,
  approach: Approach,
  input: AlgorithmInput
): ValidationResult {
  const approachMap = algorithmRegistry[algorithmId];
  if (!approachMap) {
    return { isValid: false, error: `Unknown algorithm: ${algorithmId}` };
  }

  const module = approachMap[approach];
  if (!module) {
    return { isValid: false, error: `Approach "${approach}" not available for ${algorithmId}` };
  }

  return module.validateInput(input);
}

/**
 * Generate steps for the selected algorithm + approach.
 *
 * This function:
 * 1. Looks up the AlgorithmModule from the registry
 * 2. Validates the input (SRS §5.7 IV-01)
 * 3. Calls generateSteps() — a pure function (AGENTS.md §1.2)
 * 4. Caps steps at MAX_STEPS if needed (Architecture.md §9.2)
 * 5. Returns the Step[] or an error — NEVER dispatches directly
 *
 * The caller (hook or component) is responsible for dispatching to state.
 */
export function orchestrateStepGeneration(
  algorithmId: AlgorithmId,
  approach: Approach,
  input: AlgorithmInput
): StepGenerationResult {
  // 1. Look up algorithm module
  const approachMap = algorithmRegistry[algorithmId];
  if (!approachMap) {
    return { success: false, error: `Unknown algorithm: ${algorithmId}` };
  }

  const module = approachMap[approach];
  if (!module) {
    return { success: false, error: `Approach "${approach}" not available for ${algorithmId}` };
  }

  // 2. Validate input (SRS §5.7 IV-01: must validate before generating)
  const validation = module.validateInput(input);
  if (!validation.isValid) {
    return { success: false, error: validation.error ?? 'Invalid input' };
  }

  // 3. Call generateSteps — wrapped in try/catch (AGENTS.md §7.1)
  try {
    let steps = module.generateSteps(input);

    // 4. Cap at MAX_STEPS (Architecture.md §9.2)
    let warning: string | undefined;
    if (steps.length > MAX_STEPS) {
      steps = steps.slice(0, MAX_STEPS);
      warning = STEP_LIMIT_WARNING;
    }

    return { success: true, steps, warning };
  } catch (err: unknown) {
    // AGENTS.md §7.1: Convert thrown errors to error result
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during step generation';
    return { success: false, error: message };
  }
}
