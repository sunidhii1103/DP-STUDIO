/* ============================================================================
 * DPVis — Fibonacci Code Strings
 * Code displayed in the CodePanel, with line numbers matching
 * step.codeReference.lineNumber values from the step generators.
 * SRS §5.5 CS-01: Active code line is derived from step data.
 * ============================================================================ */

/** JavaScript representation of Fibonacci tabulation */
export const FIBONACCI_TABULATION_CODE = `function fibonacci(n) {
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}`;

/** JavaScript representation of Fibonacci memoization */
export const FIBONACCI_MEMOIZATION_CODE = `function fibonacci(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 0) return 0;
  if (n === 1) return 1;

  memo[n] = fibonacci(n - 1, memo)
           + fibonacci(n - 2, memo);
  return memo[n];
}`;

/** JavaScript representation of Fibonacci brute force */
export const FIBONACCI_BRUTE_FORCE_CODE = `function fibonacci(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  return fibonacci(n - 1)
       + fibonacci(n - 2);
}`;

/** Python representation of Fibonacci tabulation */
export const FIBONACCI_TABULATION_CODE_PYTHON = `def fibonacci(n):
    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 1

    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]

    return dp[n]`;

/** Python representation of Fibonacci memoization */
export const FIBONACCI_MEMOIZATION_CODE_PYTHON = `def fibonacci(n, memo={}):
    if n in memo: return memo[n]
    if n <= 0: return 0
    if n == 1: return 1

    memo[n] = fibonacci(n - 1, memo) \\
            + fibonacci(n - 2, memo)
    return memo[n]`;

/** Python representation of Fibonacci brute force */
export const FIBONACCI_BRUTE_FORCE_CODE_PYTHON = `def fibonacci(n):
    if n <= 0: return 0
    if n == 1: return 1

    return fibonacci(n - 1) \\
         + fibonacci(n - 2)`;

import type { Approach } from '../../types/step.types';

/** Get code string for the given approach and language */
export function getFibonacciCode(
  approach: Approach,
  language: 'javascript' | 'python' = 'javascript'
): string {
  const codeMap: Record<Approach, Record<string, string>> = {
    tabulation: {
      javascript: FIBONACCI_TABULATION_CODE,
      python: FIBONACCI_TABULATION_CODE_PYTHON,
    },
    memoization: {
      javascript: FIBONACCI_MEMOIZATION_CODE,
      python: FIBONACCI_MEMOIZATION_CODE_PYTHON,
    },
    brute_force: {
      javascript: FIBONACCI_BRUTE_FORCE_CODE,
      python: FIBONACCI_BRUTE_FORCE_CODE_PYTHON,
    },
  };

  return codeMap[approach]?.[language] ?? FIBONACCI_TABULATION_CODE;
}
