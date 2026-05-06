/* ============================================================================
 * DPVis — Engine Constants
 * AGENTS.md §8.2: All threshold values in the step engine must be named.
 * ============================================================================ */

/** Maximum number of steps before generation is capped */
export const MAX_STEPS = 10_000;

/** Generation timeout (ms) — if exceeded, offload to Web Worker */
export const GENERATION_TIMEOUT_MS = 200;

/** Warning message shown when step count is capped */
export const STEP_LIMIT_WARNING =
  'Step generation was capped at the maximum limit. A representative sample of the execution is shown.';
