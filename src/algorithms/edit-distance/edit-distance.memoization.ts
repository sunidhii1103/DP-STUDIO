import type { AlgorithmModule, EditDistanceInput } from '../../types/algorithm.types';
import type { Step, CellState, TableSnapshot2D, StepMetrics } from '../../types/step.types';
import { validateEditDistanceInput } from './edit-distance.validation';
import { v4 as uuidv4 } from 'uuid';

export class EditDistanceMemoization implements AlgorithmModule {
  public validateInput = validateEditDistanceInput;
  public getExplanationTemplates = () => ({});

  public getComplexity() {
    return {
      approach: 'memoization' as const,
      timeComplexity: { notation: 'O(N * M)', description: 'Recursively explores up to N x M states', order: 2 },
      spaceComplexity: { notation: 'O(N * M)', description: 'Call stack and memoization table' },
      growthSamples: [ {n: 2, ops: 4}, {n: 4, ops: 16}, {n: 8, ops: 64} ]
    };
  }

  public generateSteps(input: EditDistanceInput): Step[] {
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

    const table: CellState[][] = Array(n + 1).fill(0).map((_, i) => Array(m + 1).fill(0).map((_, j) => {
      if (i === 0) return { value: j, state: 'idle' };
      if (j === 0) return { value: i, state: 'idle' };
      return { value: null, state: 'idle' };
    }));

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
        algorithm: 'edit-distance',
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

    // Pre-initialize base cases
    for (let i = 0; i <= n; i++) {
      table[i]![0]! = { value: i, state: 'computed' };
      metrics.statesStored++;
      addStep('initialize', {i, j: 0}, [], {i, j: 0, val: i}, 2);
    }
    for (let j = 1; j <= m; j++) {
      table[0]![j]! = { value: j, state: 'computed' };
      metrics.statesStored++;
      addStep('initialize', {i: 0, j}, [], {i: 0, j, val: j}, 3);
    }

    const editDist = (i: number, j: number): number => {
      if (i === 0) return j;
      if (j === 0) return i;

      table[i]![j]!.state = 'active';
      addStep('read', {i, j}, [], {i, j}, 5);

      if (table[i]![j]!.value !== null) {
        metrics.cacheHitsSoFar++;
        table[i]![j]!.state = 'cached';
        addStep('cache_hit', {i, j}, [], {i, j, cachedValue: table[i]![j]!.value}, 6);
        return table[i]![j]!.value as number;
      }

      addStep('compare', {i, j}, [], {i, j, char1: s1[i-1], char2: s2[j-1]}, 8);

      if (s1[i-1] === s2[j-1]) {
        addStep('recurse', {i, j}, [{i: i-1, j: j-1}], {i, j, nextI: i-1, nextJ: j-1}, 9);
        const val = editDist(i - 1, j - 1);
        
        table[i]![j]! = { value: val, state: 'computed' };
        table[i-1]![j-1]!.state = 'computed';
        metrics.statesStored++;
        addStep('edit_match', {i, j}, [{i: i-1, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], valDiag: val}, 10);
        return val;
      } else {
        addStep('recurse', {i, j}, [{i: i-1, j: j-1}, {i: i-1, j}, {i, j: j-1}], {i, j}, 12);
        
        const vReplace = editDist(i - 1, j - 1);
        const vDelete = editDist(i - 1, j);
        const vInsert = editDist(i, j - 1);
        
        table[i-1]![j-1]!.state = 'dependency';
        table[i-1]![j]!.state = 'dependency';
        table[i]![j-1]!.state = 'dependency';
        
        addStep('compute', {i, j}, [{i: i-1, j: j-1}, {i: i-1, j}, {i, j: j-1}], {i, j, char1: s1[i-1], char2: s2[j-1], vReplace, vDelete, vInsert}, 14);

        const minVal = Math.min(vReplace, vDelete, vInsert);
        table[i]![j]! = { value: minVal + 1, state: 'computed' };
        metrics.statesStored++;
        
        let op = '';
        if (minVal === vReplace) op = 'edit_replace';
        else if (minVal === vDelete) op = 'edit_delete';
        else op = 'edit_insert';
        
        addStep(op as Step['operation'], {i, j}, [], {i, j, char1: s1[i-1], char2: s2[j-1], minVal}, 15);

        table[i-1]![j-1]!.state = 'computed';
        table[i-1]![j]!.state = 'computed';
        table[i]![j-1]!.state = 'computed';
        return minVal + 1;
      }
    };

    editDist(n, m);
    addStep('result', {i: n, j: m}, [], {n, m, result: table[n]?.[m]?.value}, 20);

    // Backtracking
    const ops = [];
    let bi = n;
    let bj = m;
    while (bi > 0 || bj > 0) {
      table[bi]![bj]!.state = 'active';
      if (bi > 0 && bj > 0 && s1[bi-1] === s2[bj-1]) {
        table[bi]![bj]!.state = 'match';
        table[bi]![bj]!.value = `${table[bi]![bj]!.value} ↖`;
        addStep('backtrack_edit_match', {i: bi, j: bj}, [{i: bi-1, j: bj-1}], {i: bi, j: bj, char1: s1[bi-1], char2: s2[bj-1]}, 25);
        ops.push({ type: 'match', char: s1[bi-1] });
        bi--;
        bj--;
      } else {
        const vReplace = (bi > 0 && bj > 0) ? (typeof table[bi-1]![bj-1]!.value === 'string' ? parseInt(table[bi-1]![bj-1]!.value as string) : table[bi-1]![bj-1]!.value as number) : Infinity;
        const vDelete = (bi > 0) ? (typeof table[bi-1]![bj]!.value === 'string' ? parseInt(table[bi-1]![bj]!.value as string) : table[bi-1]![bj]!.value as number) : Infinity;
        const vInsert = (bj > 0) ? (typeof table[bi]![bj-1]!.value === 'string' ? parseInt(table[bi]![bj-1]!.value as string) : table[bi]![bj-1]!.value as number) : Infinity;
        
        const minVal = Math.min(vReplace, vDelete, vInsert);
        const currVal = typeof table[bi]![bj]!.value === 'string' ? parseInt(table[bi]![bj]!.value as string) : table[bi]![bj]!.value as number;
        
        if (minVal === vReplace && minVal !== Infinity && currVal === minVal + 1) {
          table[bi]![bj]!.state = 'path';
          table[bi]![bj]!.value = `${table[bi]![bj]!.value} ↖`;
          addStep('backtrack_edit_replace', {i: bi, j: bj}, [{i: bi-1, j: bj-1}], {i: bi, j: bj, char1: s1[bi-1], char2: s2[bj-1]}, 26);
          ops.push({ type: 'replace', char1: s1[bi-1], char2: s2[bj-1] });
          bi--;
          bj--;
        } else if (minVal === vDelete && minVal !== Infinity && currVal === minVal + 1) {
          table[bi]![bj]!.state = 'path';
          table[bi]![bj]!.value = `${table[bi]![bj]!.value} ↑`;
          addStep('backtrack_edit_delete', {i: bi, j: bj}, [{i: bi-1, j: bj}], {i: bi, j: bj, char1: s1[bi-1]}, 27);
          ops.push({ type: 'delete', char1: s1[bi-1] });
          bi--;
        } else if (minVal === vInsert && minVal !== Infinity && currVal === minVal + 1) {
          table[bi]![bj]!.state = 'path';
          table[bi]![bj]!.value = `${table[bi]![bj]!.value} ←`;
          addStep('backtrack_edit_insert', {i: bi, j: bj}, [{i: bi, j: bj-1}], {i: bi, j: bj, char2: s2[bj-1]}, 28);
          ops.push({ type: 'insert', char2: s2[bj-1] });
          bj--;
        }
      }
    }
    
    if (table[bi]?.[bj]) {
      table[bi]![bj]!.state = 'path';
    }
    addStep('result', {i: bi, j: bj}, [], {n, m, result: table[n]?.[m]?.value}, 30);

    // Forward pass
    ops.reverse();
    let currentTransformed = s1;
    let cursor = 0;
    
    for (const op of ops) {
      if (op.type === 'match') {
        cursor++;
      } else if (op.type === 'replace') {
        currentTransformed = currentTransformed.substring(0, cursor) + op.char2 + currentTransformed.substring(cursor + 1);
        addStep('edit_replace', {i: 0, j: 0}, [], { transformedStr: currentTransformed, op: `REPLACE ${op.char1} with ${op.char2}` }, 32);
        cursor++;
      } else if (op.type === 'delete') {
        currentTransformed = currentTransformed.substring(0, cursor) + currentTransformed.substring(cursor + 1);
        addStep('edit_delete', {i: 0, j: 0}, [], { transformedStr: currentTransformed, op: `DELETE ${op.char1}` }, 33);
      } else if (op.type === 'insert') {
        currentTransformed = currentTransformed.substring(0, cursor) + op.char2 + currentTransformed.substring(cursor);
        addStep('edit_insert', {i: 0, j: 0}, [], { transformedStr: currentTransformed, op: `INSERT ${op.char2}` }, 34);
        cursor++;
      }
    }
    
    addStep('result', {i: n, j: m}, [], {n, m, result: table[n]?.[m]?.value, transformedStr: currentTransformed, final: true}, 38);

    return steps;
  }
}
