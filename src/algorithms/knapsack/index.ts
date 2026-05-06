/* ============================================================================
 * DPVis — Knapsack Module (Barrel Export)
 * ============================================================================ */

import type { AlgorithmModule, ApproachModuleMap } from '../types';
import { generateKnapsackTabulation } from './knapsack.tabulation';
import { generateKnapsackMemoization } from './knapsack.memoization';

const knapsackTabulation: AlgorithmModule = {
  generateSteps: generateKnapsackTabulation,
  getComplexity: () => ({ approach: 'tabulation', timeComplexity: { notation: 'O(N*W)', description: '', order: 2 }, spaceComplexity: { notation: 'O(N*W)', description: '' }, growthSamples: [] }),
  getExplanationTemplates: () => ({}),
  validateInput: () => ({ isValid: true }),
};

const knapsackMemoization: AlgorithmModule = {
  generateSteps: generateKnapsackMemoization,
  getComplexity: () => ({ approach: 'memoization', timeComplexity: { notation: 'O(N*W)', description: '', order: 2 }, spaceComplexity: { notation: 'O(N*W)', description: '' }, growthSamples: [] }),
  getExplanationTemplates: () => ({}),
  validateInput: () => ({ isValid: true }),
};

export const knapsackApproaches: ApproachModuleMap = {
  tabulation: knapsackTabulation,
  memoization: knapsackMemoization,
};
