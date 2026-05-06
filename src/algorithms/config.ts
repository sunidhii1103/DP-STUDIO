import { algorithmRegistry } from './registry';

const FIBONACCI_TABULATION_CODE = [
  "function fib(n) {",
  "  if (n <= 1) return n;",
  "  let dp = new Array(n + 1).fill(0);",
  "  dp[1] = 1;",
  "  for (let i = 2; i <= n; i++) {",
  "    dp[i] = dp[i - 1] + dp[i - 2];",
  "  }",
  "  return dp[n];",
  "}"
];

const FIBONACCI_MEMOIZATION_CODE = [
  "function fib(n, memo = {}) {",
  "  if (n in memo) return memo[n];",
  "  if (n <= 1) return n;",
  "  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);",
  "  return memo[n];",
  "}"
];

const KNAPSACK_TABULATION_CODE = [
  "function knapsack(capacity, items) {",
  "  const n = items.length;",
  "  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));",
  "  for (let i = 1; i <= n; i++) {",
  "    for (let w = 1; w <= capacity; w++) {",
  "      if (items[i-1].weight <= w) {",
  "        dp[i][w] = Math.max(dp[i-1][w], items[i-1].value + dp[i-1][w-items[i-1].weight]);",
  "      } else {",
  "        dp[i][w] = dp[i-1][w];",
  "      }",
  "    }",
  "  }",
  "  return dp[n][capacity];",
  "}"
];

const KNAPSACK_MEMOIZATION_CODE = [
  "function knapsack(i, w) {",
  "  if (memo[i][w]) return memo[i][w];",
  "  if (i === 0 || w === 0) return 0;",
  "  let result;",
  "  if (items[i-1].weight <= w) {",
  "    result = Math.max(knapsack(i-1, w), items[i-1].value + knapsack(i-1, w-items[i-1].weight));",
  "  } else {",
  "    result = knapsack(i-1, w);",
  "  }",
  "  memo[i][w] = result;",
  "  return result;",
  "}"
];

const LCS_TABULATION_CODE = [
  "function lcs(s1, s2) {",
  "  const dp = Array(s1.length + 1).fill().map(() => Array(s2.length + 1).fill(0));",
  "  for (let i = 1; i <= s1.length; i++) {",
  "    for (let j = 1; j <= s2.length; j++) {",
  "      if (s1[i-1] === s2[j-1]) {",
  "        dp[i][j] = 1 + dp[i-1][j-1];",
  "      } else {",
  "        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);",
  "      }",
  "    }",
  "  }",
  "  return dp[s1.length][s2.length];",
  "}"
];

const LCS_MEMOIZATION_CODE = [
  "function lcs(i, j) {",
  "  if (i === 0 || j === 0) return 0;",
  "  if (memo[i][j]) return memo[i][j];",
  "  if (s1[i-1] === s2[j-1]) {",
  "    memo[i][j] = 1 + lcs(i-1, j-1);",
  "  } else {",
  "    memo[i][j] = Math.max(lcs(i-1, j), lcs(i, j-1));",
  "  }",
  "  return memo[i][j];",
  "}"
];

const EDIT_DISTANCE_TABULATION_CODE = [
  "function editDistance(s1, s2) {",
  "  const dp = Array(s1.length + 1).fill().map(() => Array(s2.length + 1).fill(0));",
  "  for (let i = 0; i <= s1.length; i++) dp[i][0] = i;",
  "  for (let j = 0; j <= s2.length; j++) dp[0][j] = j;",
  "  for (let i = 1; i <= s1.length; i++) {",
  "    for (let j = 1; j <= s2.length; j++) {",
  "      if (s1[i-1] === s2[j-1]) {",
  "        dp[i][j] = dp[i-1][j-1];",
  "      } else {",
  "        dp[i][j] = 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);",
  "      }",
  "    }",
  "  }",
  "  return dp[s1.length][s2.length];",
  "}"
];

const EDIT_DISTANCE_MEMOIZATION_CODE = [
  "function editDistance(i, j) {",
  "  if (i === 0) return j;",
  "  if (j === 0) return i;",
  "  if (memo[i][j]) return memo[i][j];",
  "  if (s1[i-1] === s2[j-1]) {",
  "    memo[i][j] = editDistance(i-1, j-1);",
  "  } else {",
  "    const replace = editDistance(i-1, j-1);",
  "    const del = editDistance(i-1, j);",
  "    const insert = editDistance(i, j-1);",
  "    memo[i][j] = 1 + Math.min(replace, del, insert);",
  "  }",
  "  return memo[i][j];",
  "}"
];

export const uiRegistry = {
  fibonacci: {
    generateSteps: (input: any) => ({
      tabulation: algorithmRegistry.fibonacci.tabulation.generateSteps(input),
      memoization: algorithmRegistry.fibonacci.memoization.generateSteps(input)
    }),
    code: {
      tabulation: FIBONACCI_TABULATION_CODE,
      memoization: FIBONACCI_MEMOIZATION_CODE
    }
  },
  knapsack: {
    generateSteps: (input: any) => ({
      tabulation: algorithmRegistry.knapsack.tabulation.generateSteps(input),
      memoization: algorithmRegistry.knapsack.memoization.generateSteps(input)
    }),
    code: {
      tabulation: KNAPSACK_TABULATION_CODE,
      memoization: KNAPSACK_MEMOIZATION_CODE
    }
  },
  lcs: {
    generateSteps: (input: any) => ({
      tabulation: algorithmRegistry.lcs.tabulation!.generateSteps(input),
      memoization: algorithmRegistry.lcs.memoization!.generateSteps(input)
    }),
    code: {
      tabulation: LCS_TABULATION_CODE,
      memoization: LCS_MEMOIZATION_CODE
    }
  },
  'edit-distance': {
    generateSteps: (input: any) => ({
      tabulation: algorithmRegistry['edit-distance'].tabulation!.generateSteps(input),
      memoization: algorithmRegistry['edit-distance'].memoization!.generateSteps(input)
    }),
    code: {
      tabulation: EDIT_DISTANCE_TABULATION_CODE,
      memoization: EDIT_DISTANCE_MEMOIZATION_CODE
    }
  }
};
