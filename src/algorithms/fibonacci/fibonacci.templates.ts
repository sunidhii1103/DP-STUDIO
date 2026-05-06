/* ============================================================================
 * DPVis — Fibonacci Explanation Templates
 * Pure functions — AGENTS.md §1.2: No React, no DOM.
 * SRS §3.5: Template functions receive step context and return strings.
 * Architecture.md §7: Explanation Engine template rendering pipeline.
 * ============================================================================ */

import type { ExplanationTemplateMap, StepContext } from '../types';

/**
 * Explanation templates for Fibonacci, keyed by operation type.
 * Each template function is pure — receives StepContext, returns a string.
 */
export function getFibonacciExplanationTemplates(): ExplanationTemplateMap {
  return {
    initialize: {
      header: (ctx: StepContext) =>
        `Setting base case: dp[${ctx['i'] ?? ctx['k'] ?? 0}]`,
      recurrence: () =>
        'dp[0] = 0, dp[1] = 1',
      substituted: (ctx: StepContext) =>
        `dp[${ctx['i'] ?? ctx['k'] ?? 0}] = ${ctx['value'] ?? 0}`,
      decision: (ctx: StepContext) =>
        `Base case — dp[${ctx['i'] ?? ctx['k'] ?? 0}] is defined directly as ${ctx['value'] ?? 0}.`,
      conceptNote: () =>
        'Base cases are the foundation of every DP solution. They represent subproblems small enough to solve directly without recursion.',
    },

    compute: {
      header: (ctx: StepContext) =>
        `Computing dp[${ctx['i'] ?? ctx['k'] ?? 0}]`,
      recurrence: () =>
        'dp[i] = dp[i-1] + dp[i-2]',
      substituted: (ctx: StepContext) => {
        const i = ctx['i'] ?? ctx['k'] ?? 0;
        const prev1 = ctx['dp[i-1]'] ?? ctx['fib(k-1)'] ?? '?';
        const prev2 = ctx['dp[i-2]'] ?? ctx['fib(k-2)'] ?? '?';
        const result = ctx['result'] ?? '?';
        return `dp[${Number(i) - 1}] + dp[${Number(i) - 2}] = ${prev1} + ${prev2} = ${result}`;
      },
      decision: (ctx: StepContext) =>
        `The value ${ctx['result'] ?? '?'} is the sum of the two preceding Fibonacci numbers.`,
    },

    recurse: {
      header: (ctx: StepContext) =>
        `Calling fib(${ctx['k'] ?? '?'})`,
      recurrence: () =>
        'fib(k) = fib(k-1) + fib(k-2)',
      substituted: (ctx: StepContext) =>
        `fib(${ctx['k-1'] ?? '?'}) + fib(${ctx['k-2'] ?? '?'})`,
      decision: (ctx: StepContext) =>
        `Recursively computing fib(${ctx['k-1'] ?? '?'}) and fib(${ctx['k-2'] ?? '?'}).`,
      conceptNote: () =>
        'Notice how the same subproblems are computed multiple times in brute force. This is the "overlapping subproblems" property that makes DP effective.',
    },

    return: {
      header: (ctx: StepContext) =>
        `Returning fib(${ctx['k'] ?? '?'}) = ${ctx['result'] ?? '?'}`,
      recurrence: () =>
        'fib(k) = fib(k-1) + fib(k-2)',
      substituted: (ctx: StepContext) =>
        `fib(${ctx['k'] ?? '?'}) = ${ctx['fib(k-1)'] ?? '?'} + ${ctx['fib(k-2)'] ?? '?'} = ${ctx['result'] ?? '?'}`,
      decision: (ctx: StepContext) =>
        `Computed fib(${ctx['k'] ?? '?'}) = ${ctx['result'] ?? '?'} and returning to caller.`,
    },

    cache_hit: {
      header: (ctx: StepContext) =>
        `Cache hit: fib(${ctx['k'] ?? '?'}) = ${ctx['cachedValue'] ?? '?'}`,
      recurrence: () =>
        'memo[k] already computed — return cached value',
      substituted: (ctx: StepContext) =>
        `memo[${ctx['k'] ?? '?'}] = ${ctx['cachedValue'] ?? '?'}`,
      decision: (ctx: StepContext) =>
        `fib(${ctx['k'] ?? '?'}) was already computed. Returning ${ctx['cachedValue'] ?? '?'} from cache — no recomputation needed.`,
      conceptNote: () =>
        'This is the power of memoization: by caching results, we avoid the exponential blowup of redundant recursive calls.',
    },

    result: {
      header: (ctx: StepContext) =>
        `Result: fib(${ctx['n'] ?? '?'}) = ${ctx['result'] ?? '?'}`,
      recurrence: () =>
        'fib(n) — final answer',
      substituted: (ctx: StepContext) =>
        `fib(${ctx['n'] ?? '?'}) = ${ctx['result'] ?? '?'}`,
      decision: (ctx: StepContext) =>
        `The ${ctx['n'] ?? '?'}th Fibonacci number is ${ctx['result'] ?? '?'}.`,
    },
  };
}
