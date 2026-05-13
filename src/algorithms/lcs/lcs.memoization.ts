/* ============================================================================
 * DPVis — LCS Memoization
 * ============================================================================ */

import type { AlgorithmModule, LCSInput, Step, CellState, TableSnapshot2D, StepMetrics } from '../types';
import { validateLCSInput } from './lcs.validation';
import { getLCSExplanationTemplates } from './lcs.templates';
import { v4 as uuidv4 } from 'uuid';

export class LCSMemoization implements AlgorithmModule {
  public validateInput = validateLCSInput;
  public getExplanationTemplates = getLCSExplanationTemplates;

  public getComplexity() {
    return {
      approach: 'memoization' as const,
      timeComplexity: { notation: 'O(N * M)', description: 'Evaluates each state once', order: 2 },
      spaceComplexity: { notation: 'O(N * M)', description: 'Call stack and memo table' },
      growthSamples: [ {n: 2, ops: 4}, {n: 4, ops: 16}, {n: 8, ops: 64} ]
    };
  }

  public generateSteps(input: LCSInput): Step[] {
    const steps: Step[] = [];
    const { s1, s2 } = input;
    const n = s1.length;
    const m = s2.length;

    let stepIndex = 0;
    const metrics: StepMetrics = {
      totalOperationsSoFar: 0,
      cacheHitsSoFar: 0,
      stackDepth: 0,
      redundantComputesSoFar: 0,
      operationsCount: 0,
      statesStored: 0
    };

    const table: CellState[][] = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0).map(() => ({ value: null, state: 'idle' })));

    const getSnapshot = (): TableSnapshot2D => ({
      dimensions: 2,
      rowLabels: ['-', ...s1.split('')],
      colLabels: ['-', ...s2.split('')],
      cells: table.map(r => r.map(c => ({ ...c })))
    });

    const addStep = (operation: Step['operation'], active: {i: number, j: number}, deps: {i: number, j: number}[], vars: Record<string, any>, line: number) => {
      metrics.totalOperationsSoFar++;
      metrics.operationsCount++;
      steps.push({
        id: uuidv4(),
        index: stepIndex++,
        algorithm: 'lcs',
        approach: 'memoization',
        operation,
        tableSnapshot: getSnapshot(),
        activeIndices: active,
        dependencyIndices: deps,
        codeReference: { language: 'javascript', lineNumber: line },
        explanation: { operationType: operation, variables: { ...vars } },
        metrics: { ...metrics }
      });
    };

    const lcs = (i: number, j: number): number => {
      metrics.stackDepth++;
      
      table[i]![j]!.state = 'active';
      addStep('recurse', {i, j}, [], {i, j}, 2);

      if (i === 0 || j === 0) {
        table[i]![j]! = { value: 0, state: 'computed' };
        metrics.statesStored++;
        addStep('initialize', {i, j}, [], {i, j}, 3);
        metrics.stackDepth--;
        return 0;
      }

      if (table[i]![j]!.value !== null) {
        metrics.cacheHitsSoFar++;
        table[i]![j]!.state = 'cached';
        addStep('cache_hit', {i, j}, [], {i, j, cachedValue: table[i]![j]!.value}, 6);
        table[i]![j]!.state = 'computed';
        metrics.stackDepth--;
        return table[i]![j]!.value as number;
      }

      addStep('compare', {i, j}, [], {i, j, char1: s1[i-1], char2: s2[j-1]}, 9);

      let res = 0;
      if (s1[i-1] === s2[j-1]) {
        res = 1 + lcs(i-1, j-1);
        
        table[i]![j]!.state = 'active'; // Reset to active after recursive return
        table[i-1]![j-1]!.state = 'dependency';
        addStep('match', {i, j}, [{i: i-1, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], valDiag: res - 1}, 10);
        
        table[i-1]![j-1]!.state = 'computed';
      } else {
        const top = lcs(i-1, j);
        const left = lcs(i, j-1);
        
        table[i]![j]!.state = 'active'; // Reset to active
        table[i-1]![j]!.state = 'dependency';
        table[i]![j-1]!.state = 'dependency';

        res = Math.max(top, left);
        
        addStep('mismatch', {i, j}, [{i: i-1, j}, {i, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], valTop: top, valLeft: left}, 14);

        if (top >= left) {
          addStep('choose_top', {i, j}, [{i: i-1, j}], {i, j, char1: s1[i-1], char2: s2[j-1], valTop: top, valLeft: left}, 16);
        } else {
          addStep('choose_left', {i, j}, [{i, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], valTop: top, valLeft: left}, 18);
        }
        table[i-1]![j]!.state = 'computed';
        table[i]![j-1]!.state = 'computed';
      }

      table[i]![j]! = { value: res, state: 'computed' };
      metrics.statesStored++;
      metrics.stackDepth--;
      return res;
    };

    const finalRes = lcs(n, m);
    addStep('result', {i: n, j: m}, [], {n, m, result: finalRes}, 22);

    let i = n;
    let j = m;
    let partialLCS = "";
    
    while (i > 0 && j > 0) {
      table[i]![j]!.state = 'active';
      addStep('compare', {i, j}, [], {i, j, char1: s1[i-1], char2: s2[j-1], partialLCS}, 24);

      if (s1[i-1] === s2[j-1]) {
        table[i]![j]!.state = 'match';
        table[i]![j]!.value = `${table[i]![j]!.value} ↖`;
        partialLCS = s1[i-1] + partialLCS;
        addStep('backtrack_match', {i, j}, [{i: i-1, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], partialLCS}, 25);
        i--;
        j--;
      } else {
        table[i-1]![j]!.state = 'dependency';
        table[i]![j-1]!.state = 'dependency';
        const rawTop = table[i-1]![j]!.value ?? 0;
        const rawLeft = table[i]![j-1]!.value ?? 0;
        const valTop = typeof rawTop === 'string' ? parseInt(rawTop as string) : rawTop as number;
        const valLeft = typeof rawLeft === 'string' ? parseInt(rawLeft as string) : rawLeft as number;

        addStep('mismatch', {i, j}, [{i: i-1, j}, {i, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], valTop, valLeft, partialLCS}, 27);

        if (valTop >= valLeft) {
          table[i-1]![j]!.state = 'computed';
          table[i]![j-1]!.state = 'computed';
          table[i]![j]!.state = 'path';
          table[i]![j]!.value = `${table[i]![j]!.value} ↑`;
          addStep('backtrack_move_top', {i, j}, [{i: i-1, j}], {i, j, valTop, valLeft, partialLCS}, 28);
          i--;
        } else {
          table[i-1]![j]!.state = 'computed';
          table[i]![j-1]!.state = 'computed';
          table[i]![j]!.state = 'path';
          table[i]![j]!.value = `${table[i]![j]!.value} ←`;
          addStep('backtrack_move_left', {i, j}, [{i, j: j-1}], {i, j, valTop, valLeft, partialLCS}, 30);
          j--;
        }
      }
    }
    if (table[i]?.[j]) {
      table[i]![j]!.state = 'path';
    }
    addStep('result', {i, j}, [], {n, m, result: finalRes, partialLCS}, 33);

    return steps;
  }
}
