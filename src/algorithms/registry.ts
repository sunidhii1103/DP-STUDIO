/* ============================================================================
 * DPVis — Algorithm Registry
 * NF-E03: The algorithm registry is a simple declarative map.
 * AlgorithmId → ApproachModuleMap
 *
 * AGENTS.md §5.2: Adding a new algorithm requires ONLY:
 *   1. New files under src/algorithms/{algorithmName}/
 *   2. One new entry in this file
 *   3. One new input component
 * Zero modifications to core modules.
 * ============================================================================ */

import type { AlgorithmRegistry } from './types';
import { fibonacciApproaches } from './fibonacci';
import { knapsackApproaches } from './knapsack';
import { lcsApproaches } from './lcs';

import { editDistanceApproaches } from './edit-distance';
import { mcmApproaches } from './mcm';

export const algorithmRegistry: AlgorithmRegistry = {
  fibonacci: fibonacciApproaches,
  knapsack: knapsackApproaches,
  lcs: lcsApproaches,
  'edit-distance': editDistanceApproaches,
  mcm: mcmApproaches,
};
