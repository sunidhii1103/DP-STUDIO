/* ============================================================================
 * DPVis — App-Wide Constants
 * AGENTS.md §8.2: All threshold values must be named constants.
 * No magic numbers permitted inline.
 * ============================================================================ */

/* ── Step Engine ──────────────────────────────────────────────────────────── */

/** Maximum number of steps before generation is capped (Architecture.md §9.2) */
export const MAX_STEP_COUNT = 10_000;

/** Base autoplay interval in ms at 1× speed (SRS §5.6 PC-02) */
export const BASE_PLAYBACK_INTERVAL_MS = 800;

/** Step generation timeout before Web Worker offload (Architecture.md §9.3) */
export const STEP_GENERATION_TIMEOUT_MS = 200;

/* ── Playback Speeds ──────────────────────────────────────────────────────── */

/** Available playback speed multipliers (PRD §4.6) */
export const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 2, 4] as const;

/** Default playback speed */
export const DEFAULT_PLAYBACK_SPEED = 1;

/* ── Input Constraints ────────────────────────────────────────────────────── */

/** Fibonacci: max n value (SRS §4.3) */
export const FIBONACCI_MAX_N = 30;

/** Fibonacci: min n value */
export const FIBONACCI_MIN_N = 1;

/** Knapsack: max number of items (SRS §4.3) */
export const KNAPSACK_MAX_ITEMS = 8;

/** Knapsack: max weight capacity (SRS §4.3) */
export const KNAPSACK_MAX_CAPACITY = 20;

/** LCS: max string length (SRS §4.3) */
export const LCS_MAX_LENGTH = 12;

/* ── UI ───────────────────────────────────────────────────────────────────── */

/** Step index lower bound (SRS §5.1 SE-06) */
export const MIN_STEP_INDEX = 0;
