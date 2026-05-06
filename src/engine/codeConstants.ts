export const FIBONACCI_TABULATION_CODE = [
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

export const FIBONACCI_MEMOIZATION_CODE = [
  "function fib(n, memo = {}) {",
  "  if (n in memo) return memo[n];",
  "  if (n <= 1) return n;",
  "  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);",
  "  return memo[n];",
  "}"
];

export const KNAPSACK_TABULATION_CODE = [
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

export const KNAPSACK_MEMOIZATION_CODE = [
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
