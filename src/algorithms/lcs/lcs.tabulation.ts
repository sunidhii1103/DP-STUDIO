/* ============================================================================
 * DPVis — LCS Tabulation
 * ============================================================================ */

import type { AlgorithmModule, LCSInput, Step, CellState, TableSnapshot2D, StepMetrics } from '../types';
import { validateLCSInput } from './lcs.validation';
import { getLCSExplanationTemplates } from './lcs.templates';
import { v4 as uuidv4 } from 'uuid';

export class LCSTabulation implements AlgorithmModule {
  public validateInput = validateLCSInput;
  public getExplanationTemplates = getLCSExplanationTemplates;

  public getComplexity() {
    return {
      approach: 'tabulation' as const,
      timeComplexity: { notation: 'O(N * M)', description: 'Fills an N x M matrix', order: 2 },
      spaceComplexity: { notation: 'O(N * M)', description: 'Requires N x M matrix space' },
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
        approach: 'tabulation',
        operation,
        tableSnapshot: getSnapshot(),
        activeIndices: active,
        dependencyIndices: deps,
        codeReference: { language: 'javascript', lineNumber: line },
        explanation: { operationType: operation, variables: { ...vars } },
        metrics: { ...metrics }
      });
    };

    for (let i = 0; i <= n; i++) {
      table[i]![0]! = { value: 0, state: 'computed' };
      metrics.statesStored++;
      addStep('initialize', {i, j: 0}, [], {i, j: 0}, 2);
    }
    for (let j = 1; j <= m; j++) {
      table[0]![j]! = { value: 0, state: 'computed' };
      metrics.statesStored++;
      addStep('initialize', {i: 0, j}, [], {i: 0, j}, 3);
    }

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        table[i]![j]!.state = 'active';
        table[i-1]![j-1]!.state = 'dependency';
        
        addStep('compare', {i, j}, [{i: i-1, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1]}, 6);

        if (s1[i-1] === s2[j-1]) {
          const val = table[i-1]![j-1]!.value as number;
          table[i]![j]! = { value: val + 1, state: 'computed' };
          table[i-1]![j-1]!.state = 'computed';
          metrics.statesStored++;
          addStep('match', {i, j}, [{i: i-1, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], valDiag: val}, 7);
        } else {
          table[i-1]![j-1]!.state = 'computed'; // reset diag
          table[i-1]![j]!.state = 'dependency';
          table[i]![j-1]!.state = 'dependency';
          
          addStep('mismatch', {i, j}, [{i: i-1, j}, {i, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], valTop: table[i-1]![j]!.value, valLeft: table[i]![j-1]!.value}, 9);

          if ((table[i-1]![j]!.value as number) >= (table[i]![j-1]!.value as number)) {
            table[i]![j]! = { value: table[i-1]![j]!.value, state: 'computed' };
            metrics.statesStored++;
            addStep('choose_top', {i, j}, [{i: i-1, j}], {i, j, char1: s1[i-1], char2: s2[j-1], valTop: table[i-1]![j]!.value, valLeft: table[i]![j-1]!.value}, 10);
          } else {
            table[i]![j]! = { value: table[i]![j-1]!.value, state: 'computed' };
            metrics.statesStored++;
            addStep('choose_left', {i, j}, [{i, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], valTop: table[i-1]![j]!.value, valLeft: table[i]![j-1]!.value}, 12);
          }
          table[i-1]![j]!.state = 'computed';
          table[i]![j-1]!.state = 'computed';
        }
      }
    }

    addStep('result', {i: n, j: m}, [], {n, m, result: table[n]?.[m]?.value}, 16);

    // Backtracking
    let i = n;
    let j = m;
    let partialLCS = "";
    
    while (i > 0 && j > 0) {
      table[i]![j]!.state = 'active';
      addStep('compare', {i, j}, [], {i, j, char1: s1[i-1], char2: s2[j-1], partialLCS}, 19);

      if (s1[i-1] === s2[j-1]) {
        table[i]![j]!.state = 'match';
        table[i]![j]!.value = `${table[i]![j]!.value} ↖`;
        partialLCS = s1[i-1] + partialLCS;
        addStep('backtrack_match', {i, j}, [{i: i-1, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], partialLCS}, 20);
        i--;
        j--;
      } else {
        table[i-1]![j]!.state = 'dependency';
        table[i]![j-1]!.state = 'dependency';
        const valTop = typeof table[i-1]![j]!.value === 'string' ? parseInt(table[i-1]![j]!.value as string) : table[i-1]![j]!.value as number;
        const valLeft = typeof table[i]![j-1]!.value === 'string' ? parseInt(table[i]![j-1]!.value as string) : table[i]![j-1]!.value as number;
        
        addStep('mismatch', {i, j}, [{i: i-1, j}, {i, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], valTop, valLeft, partialLCS}, 22);

        if (valTop >= valLeft) {
          table[i-1]![j]!.state = 'computed';
          table[i]![j-1]!.state = 'computed';
          table[i]![j]!.state = 'path'; 
          table[i]![j]!.value = `${table[i]![j]!.value} ↑`;
          addStep('backtrack_move_top', {i, j}, [{i: i-1, j}], {i, j, valTop, valLeft, partialLCS}, 23);
          i--;
        } else {
          table[i-1]![j]!.state = 'computed';
          table[i]![j-1]!.state = 'computed';
          table[i]![j]!.state = 'path';
          table[i]![j]!.value = `${table[i]![j]!.value} ←`;
          addStep('backtrack_move_left', {i, j}, [{i, j: j-1}], {i, j, valTop, valLeft, partialLCS}, 25);
          j--;
        }
      }
    }
    
    // Mark base case cell explicitly if reached
    if (table[i]?.[j]) {
      table[i]![j]!.state = 'path';
    }
    addStep('result', {i, j}, [], {n, m, result: table[n]?.[m]?.value, partialLCS}, 28);

    return steps;
  }
}
