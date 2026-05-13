/* ============================================================================
 * DPVis — LCS Explanation Templates
 * Pure functions — AGENTS.md §1.2: No React, no DOM.
 * ============================================================================ */

import type { ExplanationTemplateMap, StepContext } from '../types';

export function getLCSExplanationTemplates(): ExplanationTemplateMap {
  return {
    initialize: {
      header: (ctx: StepContext) => `Initialize Base Case: dp[${ctx.i}][${ctx.j}]`,
      recurrence: () => 'dp[i][0] = 0, dp[0][j] = 0',
      substituted: (ctx: StepContext) => `dp[${ctx.i}][${ctx.j}] = 0`,
      decision: () => 'An empty string compared with any string has an LCS of length 0.',
      conceptNote: () => 'Base cases are essential. LCS with an empty string is trivially 0.',
    },

    compare: {
      header: (ctx: StepContext) => `Compare s1[${Number(ctx.i)-1}] and s2[${Number(ctx.j)-1}]`,
      recurrence: () => 'if (s1[i-1] == s2[j-1])',
      substituted: (ctx: StepContext) => `'${ctx.char1}' == '${ctx.char2}'`,
      decision: () => 'Checking if current characters match.',
    },

    match: {
      header: (ctx: StepContext) => `Characters Match: '${ctx.char1}' == '${ctx.char2}'`,
      recurrence: () => 'dp[i][j] = dp[i-1][j-1] + 1',
      substituted: (ctx: StepContext) => `dp[${ctx.i}][${ctx.j}] = dp[${Number(ctx.i)-1}][${Number(ctx.j)-1}] + 1 = ${Number(ctx.valDiag) + 1}`,
      decision: () => `Characters match, so we extend the subsequence by 1 and move diagonally.`,
      conceptNote: () => 'Optimal Substructure: The LCS is 1 plus the LCS of the remaining prefixes.',
    },

    mismatch: {
      header: (ctx: StepContext) => `Characters Mismatch: '${ctx.char1}' != '${ctx.char2}'`,
      recurrence: () => 'dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
      substituted: (ctx: StepContext) => `dp[${ctx.i}][${ctx.j}] = max(${ctx.valTop}, ${ctx.valLeft}) = ${Math.max(Number(ctx.valTop), Number(ctx.valLeft))}`,
      decision: () => `Characters do not match, so we choose the longer subsequence from neighboring states.`,
      conceptNote: () => 'When characters mismatch, the optimal solution is the max of ignoring the current character from text1 or text2.',
    },

    choose_top: {
      header: (ctx: StepContext) => `Choose Top Cell: dp[${Number(ctx.i)-1}][${ctx.j}]`,
      recurrence: () => 'dp[i-1][j] >= dp[i][j-1]',
      substituted: (ctx: StepContext) => `${ctx.valTop} >= ${ctx.valLeft}`,
      decision: (ctx: StepContext) => `Excluding '${ctx.char1}' yields a longer subsequence than excluding '${ctx.char2}'.`,
    },

    choose_left: {
      header: (ctx: StepContext) => `Choose Left Cell: dp[${ctx.i}][${Number(ctx.j)-1}]`,
      recurrence: () => 'dp[i][j-1] > dp[i-1][j]',
      substituted: (ctx: StepContext) => `${ctx.valLeft} > ${ctx.valTop}`,
      decision: (ctx: StepContext) => `Excluding '${ctx.char2}' yields a longer subsequence than excluding '${ctx.char1}'.`,
    },

    result: {
      header: (ctx: StepContext) => `Final Result: ${ctx.result}`,
      recurrence: () => 'dp[n][m]',
      substituted: (ctx: StepContext) => `dp[${ctx.n}][${ctx.m}] = ${ctx.result}`,
      decision: (ctx: StepContext) => `The length of the Longest Common Subsequence is ${ctx.result}.`,
    },

    backtrack_match: {
      header: (ctx: StepContext) => `Reconstruct Match: '${ctx.char1}'`,
      recurrence: () => 's1[i-1] == s2[j-1] => Add to LCS, move diagonal',
      substituted: (ctx: StepContext) => `LCS = '${ctx.char1}' + LCS`,
      decision: () => `Characters match again, so this character becomes part of the final LCS.`,
      conceptNote: () => 'Tracing backwards: A diagonal move confirms the character is part of the final LCS.',
    },

    backtrack_move_top: {
      header: () => `Reconstruct Move Top`,
      recurrence: () => 'dp[i-1][j] >= dp[i][j-1] => Move i--',
      substituted: (ctx: StepContext) => `dp[${Number(ctx.i)-1}][${ctx.j}] >= dp[${ctx.i}][${Number(ctx.j)-1}] (${ctx.valTop} >= ${ctx.valLeft})`,
      decision: () => `Top cell is greater or equal, meaning optimal path came from above.`,
    },

    backtrack_move_left: {
      header: () => `Reconstruct Move Left`,
      recurrence: () => 'dp[i][j-1] > dp[i-1][j] => Move j--',
      substituted: (ctx: StepContext) => `dp[${ctx.i}][${Number(ctx.j)-1}] > dp[${Number(ctx.i)-1}][${ctx.j}] (${ctx.valLeft} > ${ctx.valTop})`,
      decision: () => `Left cell is greater, meaning optimal path came from left.`,
    },
  };
}
