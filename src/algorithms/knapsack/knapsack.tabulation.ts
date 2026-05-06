import type { AlgorithmInput, KnapsackInput } from '../../types/algorithm.types';
import type { Step, CellState, TableSnapshot2D } from '../../types/step.types';

function cloneCells2D(cells: CellState[][]): CellState[][] {
  return cells.map(row => row.map(c => ({ ...c })));
}

export function generateKnapsackTabulation(input: AlgorithmInput): Step[] {
  const { capacity, items } = input as KnapsackInput;
  const n = items ? items.length : 0;
  const steps: Step[] = [];
  let stepIndex = 0;
  let operationCount = 0;
  
  // Initialize 2D array
  const cells: CellState[][] = Array.from({ length: n + 1 }, () => 
    Array.from({ length: capacity + 1 }, () => ({ value: null, state: 'idle' as const }))
  );

  const rowLabels = ['0', ...items.map(item => item.label)];
  const colLabels = Array.from({ length: capacity + 1 }, (_, w) => String(w));

  function snapshot(): TableSnapshot2D {
    return { dimensions: 2, cells: cloneCells2D(cells), rowLabels, colLabels };
  }

  function createStep(overrides: Partial<Step>): Step {
    operationCount++;
    const activeCells = overrides.tableSnapshot 
      ? (overrides.tableSnapshot as TableSnapshot2D).cells 
      : cells;
    let statesStored = 0;
    activeCells.forEach(row => row.forEach(c => {
      if (c.value !== null) statesStored++;
    }));

    return {
      id: `step_${String(stepIndex).padStart(3, '0')}`,
      index: stepIndex,
      algorithm: 'knapsack',
      approach: 'tabulation',
      operation: 'compute',
      tableSnapshot: overrides.tableSnapshot || snapshot(),
      activeIndices: { i: 0, j: 0 },
      dependencyIndices: [],
      codeReference: { language: 'javascript', lineNumber: 1 },
      explanation: { operationType: 'compute', variables: {} },
      metrics: {
        totalOperationsSoFar: operationCount,
        cacheHitsSoFar: 0,
        stackDepth: 0,
        redundantComputesSoFar: 0,
        operationsCount: operationCount,
        statesStored: statesStored,
      },
      ...overrides,
    };
  }

  // Handle edge cases: empty items or 0 capacity
  if (n === 0 || capacity <= 0) {
    cells[0][0] = { value: 0, state: 'result' };
    steps.push(createStep({
      operation: 'result',
      activeIndices: { i: 0, j: 0 },
      explanation: {
        operationType: 'result',
        variables: { result: 0, n: 0, capacity: 0 }
      },
      codeReference: { language: 'javascript', lineNumber: 13 },
      milestoneId: 'init_0_0'
    }));
    console.log("Steps generated:", steps.length);
    return steps;
  }

  // Base cases: i=0 or w=0 is 0
  for (let i = 0; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (i === 0 || w === 0) {
        cells[i][w] = { value: 0, state: 'computed' };
      }
    }
  }
  
  steps.push(createStep({
    operation: 'initialize',
    activeIndices: { i: 0, j: 0 },
    explanation: {
      operationType: 'initialize',
      conceptNoteType: 'base_case',
      variables: { desc: 'Initialize row 0 and col 0 to 0 (base case with 0 items or 0 capacity)' }
    },
    codeReference: { language: 'javascript', lineNumber: 3 },
    milestoneId: 'init_0_0'
  }));
  stepIndex++;

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 1; w <= capacity; w++) {
      const depCells = cloneCells2D(cells);
      const isIncluded = item.weight <= w;
      
      let valExclude = cells[i - 1][w].value!;
      let valInclude = 0;
      let dependencyIndices = [{ i: i - 1, j: w }];
      
      depCells[i - 1][w] = { ...depCells[i - 1][w], state: 'dependency' };
      
      let explanationVars: Record<string, any> = {
        i, w, weight: item.weight, value: item.value, label: item.label, valExclude
      };

      if (isIncluded) {
        valInclude = item.value + cells[i - 1][w - item.weight].value!;
        dependencyIndices.push({ i: i - 1, j: w - item.weight });
        depCells[i - 1][w - item.weight] = { ...depCells[i - 1][w - item.weight], state: 'dependency' };
        explanationVars.valInclude = valInclude;
      }
      
      const result = isIncluded ? Math.max(valExclude, valInclude) : valExclude;
      depCells[i][w] = { value: result, state: 'active' };

      steps.push(createStep({
        operation: 'compute',
        tableSnapshot: { dimensions: 2, cells: depCells, rowLabels, colLabels },
        activeIndices: { i, j: w },
        dependencyIndices,
        explanation: {
          operationType: 'compute',
          conceptNoteType: 'optimal_substructure',
          variables: { ...explanationVars, result, isIncluded }
        },
        codeReference: { language: 'javascript', lineNumber: isIncluded ? 7 : 9 },
        milestoneId: `compute_${i}_${w}`
      }));
      stepIndex++;
      
      cells[i][w] = { value: result, state: 'computed' };
    }
  }

  cells[n][capacity] = { ...cells[n][capacity], state: 'result' };
  steps.push(createStep({
    operation: 'result',
    activeIndices: { i: n, j: capacity },
    explanation: {
      operationType: 'result',
      variables: { result: cells[n][capacity].value!, n, capacity }
    },
    codeReference: { language: 'javascript', lineNumber: 13 },
    milestoneId: `result_${n}_${capacity}`
  }));

  console.log("Steps generated:", steps.length);
  return steps;
}
