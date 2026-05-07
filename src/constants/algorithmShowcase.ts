import type { AlgorithmId } from '../types/step.types';

export type AlgorithmShowcaseItem = {
  id: AlgorithmId;
  name: string;
  tagline: string;
  pattern: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  complexity: string;
  compareSupported: boolean;
  accent: 'fibonacci' | 'lis' | 'lcs' | 'mcm' | 'edit-distance' | 'knapsack';
  icon: string;
  launchParams: Record<string, string>;
};

export const algorithmShowcase: AlgorithmShowcaseItem[] = [
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    tagline: 'Learn recursion, memoization, and tabulation evolution.',
    pattern: '1D DP',
    level: 'Beginner',
    complexity: 'O(n)',
    compareSupported: true,
    accent: 'fibonacci',
    icon: 'Fn',
    launchParams: { n: '7' },
  },
  {
    id: 'lis',
    name: 'Longest Increasing Subsequence',
    tagline: 'Compare recursion, DP, and binary search optimization.',
    pattern: 'Sequence DP',
    level: 'Intermediate',
    complexity: 'O(n log n)',
    compareSupported: true,
    accent: 'lis',
    icon: 'LIS',
    launchParams: { values: '10,9,2,5,3,7,101,18' },
  },
  {
    id: 'lcs',
    name: 'Longest Common Subsequence',
    tagline: 'Visualize string matching and DP table reconstruction.',
    pattern: '2D DP',
    level: 'Intermediate',
    complexity: 'O(nm)',
    compareSupported: true,
    accent: 'lcs',
    icon: 'LCS',
    launchParams: { s1: 'ABCBDAB', s2: 'BDCAB' },
  },
  {
    id: 'mcm',
    name: 'Matrix Chain Multiplication',
    tagline: 'Understand partition DP and optimal split decisions.',
    pattern: 'Partition DP',
    level: 'Advanced',
    complexity: 'O(n^3)',
    compareSupported: true,
    accent: 'mcm',
    icon: 'MCM',
    launchParams: { dimensions: '10,30,5,60' },
  },
  {
    id: 'edit-distance',
    name: 'Edit Distance',
    tagline: 'Track insert, delete, and replace transformations.',
    pattern: 'String DP',
    level: 'Intermediate',
    complexity: 'O(nm)',
    compareSupported: true,
    accent: 'edit-distance',
    icon: 'Ed',
    launchParams: { s1: 'horse', s2: 'ros' },
  },
  {
    id: 'knapsack',
    name: '0/1 Knapsack',
    tagline: 'Explore 2D state transitions and choice optimization.',
    pattern: '2D DP',
    level: 'Intermediate',
    complexity: 'O(nW)',
    compareSupported: true,
    accent: 'knapsack',
    icon: '01',
    launchParams: { capacity: '5' },
  },
];

export const supportedPatterns = ['1D DP', '2D DP', 'String DP', 'Partition DP', 'Sequence DP'];

export function getAlgorithmShowcaseItem(id: AlgorithmId) {
  return algorithmShowcase.find((item) => item.id === id);
}
