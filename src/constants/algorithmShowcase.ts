import type { AlgorithmId } from '../types/step.types';

export type AlgorithmShowcaseItem = {
  id: AlgorithmId;
  name: string;
  tagline: string;
  pattern: string;
  complexity: string;
  compareSupported: boolean;
  accent: 'recursive' | 'dp' | 'optimized';
  icon: string;
  launchParams: Record<string, string>;
};

export const algorithmShowcase: AlgorithmShowcaseItem[] = [
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    tagline: 'Understand recursion, memoization, and tabulation.',
    pattern: '1D DP',
    complexity: 'O(n)',
    compareSupported: true,
    accent: 'recursive',
    icon: 'Fn',
    launchParams: { n: '7' },
  },
  {
    id: 'knapsack',
    name: '0/1 Knapsack',
    tagline: 'Visualize 2D state decision-making.',
    pattern: '2D DP',
    complexity: 'O(nW)',
    compareSupported: true,
    accent: 'dp',
    icon: '01',
    launchParams: { capacity: '5' },
  },
  {
    id: 'lcs',
    name: 'LCS',
    tagline: 'Explore string matching and reconstruction paths.',
    pattern: 'String DP',
    complexity: 'O(nm)',
    compareSupported: true,
    accent: 'dp',
    icon: 'Ab',
    launchParams: { s1: 'ABCBDAB', s2: 'BDCAB' },
  },
  {
    id: 'lis',
    name: 'LIS',
    tagline: 'See subsequence optimization evolve from O(n^2) to O(n log n).',
    pattern: 'Sequence DP',
    complexity: 'O(n^2)',
    compareSupported: true,
    accent: 'optimized',
    icon: 'Sq',
    launchParams: { values: '10,9,2,5,3,7,101,18' },
  },
  {
    id: 'mcm',
    name: 'Matrix Chain Multiplication',
    tagline: 'Learn interval DP and optimal parenthesization.',
    pattern: 'Interval DP',
    complexity: 'O(n^3)',
    compareSupported: true,
    accent: 'optimized',
    icon: 'Mx',
    launchParams: { dimensions: '10,30,5,60' },
  },
  {
    id: 'edit-distance',
    name: 'Edit Distance',
    tagline: 'Visualize insert, delete, and replace operations.',
    pattern: 'Edit Distance DP',
    complexity: 'O(nm)',
    compareSupported: true,
    accent: 'dp',
    icon: 'Ed',
    launchParams: { s1: 'horse', s2: 'ros' },
  },
];

export const supportedPatterns = ['1D DP', '2D DP', 'String DP', 'Interval DP', 'Sequence DP'];

export function getAlgorithmShowcaseItem(id: AlgorithmId) {
  return algorithmShowcase.find((item) => item.id === id);
}
