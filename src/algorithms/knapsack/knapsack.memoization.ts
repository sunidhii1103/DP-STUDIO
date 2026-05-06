import type { AlgorithmInput, KnapsackInput } from '../../types/algorithm.types';
import type { Step, CellState, TableSnapshot2D } from '../../types/step.types';

function cloneCells2D(cells: CellState[][]): CellState[][] {
  return cells.map(row => row.map(c => ({ ...c })));
}

export function generateKnapsackMemoization(input: AlgorithmInput): Step[] {
  const { capacity, items } = input as KnapsackInput;
  const n = items ? items.length : 0;
  const steps: Step[] = [];
  let stepIndex = 0;
  let operationCount = 0;
  let statesStored = 0;

  const cells: CellState[][] = Array.from({ length: n + 1 }, () => 
    Array.from({ length: capacity + 1 }, () => ({ value: null, state: 'idle' as const }))
  );
  
  const memo: Map<string, number> = new Map();

  const rowLabels = ['0', ...items.map(item => item.label)];
  const colLabels = Array.from({ length: capacity + 1 }, (_, w) => String(w));

  function snapshot(): TableSnapshot2D {
    return { dimensions: 2, cells: cloneCells2D(cells), rowLabels, colLabels };
  }

  function createStep(overrides: Partial<Step>): Step {
    operationCount++;
    return {
      id: `step_${String(stepIndex).padStart(3, '0')}`,
      index: stepIndex,
      algorithm: 'knapsack',
      approach: 'memoization',
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
        statesStored: memo.size,
      },
      ...overrides,
    };
  }

  function knapsackMemo(i: number, w: number): number {
    const key = `${i}_${w}`;
    
    if (memo.has(key)) {
      const cached = memo.get(key)!;
      cells[i][w] = { value: cached, state: 'cached' };
      steps.push(createStep({
        operation: 'cache_hit',
        activeIndices: { i, j: w },
        codeReference: { language: 'javascript', lineNumber: 2 },
        explanation: {
          operationType: 'cache_hit',
          variables: { i, w, cachedValue: cached },
          conceptNoteType: 'cache_benefit',
        }
      }));
      stepIndex++;
      return cached;
    }

    if (i === 0 || w === 0) {
      cells[i][w] = { value: 0, state: 'active' };
      steps.push(createStep({
        operation: 'initialize',
        activeIndices: { i, j: w },
        codeReference: { language: 'javascript', lineNumber: 3 },
        explanation: {
          operationType: 'initialize',
          variables: { i, w, value: 0 },
          conceptNoteType: 'base_case',
        }
      }));
      stepIndex++;
      
      cells[i][w] = { value: 0, state: 'computed' };
      memo.set(key, 0);
      return 0;
    }

    cells[i][w] = { value: null, state: 'active' };
    steps.push(createStep({
      operation: 'recurse',
      activeIndices: { i, j: w },
      codeReference: { language: 'javascript', lineNumber: 4 },
      explanation: {
        operationType: 'recurse',
        variables: { i, w },
      }
    }));
    stepIndex++;

    const item = items[i - 1];
    let result = 0;
    let isIncluded = item.weight <= w;

    const valExclude = knapsackMemo(i - 1, w);
    let valInclude = 0;

    if (isIncluded) {
      valInclude = item.value + knapsackMemo(i - 1, w - item.weight);
      result = Math.max(valExclude, valInclude);
    } else {
      result = valExclude;
    }

    memo.set(key, result);
    
    const depCells = cloneCells2D(cells);
    depCells[i - 1][w] = { ...depCells[i - 1][w], state: 'dependency' };
    if (isIncluded) {
      depCells[i - 1][w - item.weight] = { ...depCells[i - 1][w - item.weight], state: 'dependency' };
    }
    depCells[i][w] = { value: result, state: 'active' };

    steps.push(createStep({
      operation: 'compute',
      tableSnapshot: { dimensions: 2, cells: depCells, rowLabels, colLabels },
      activeIndices: { i, j: w },
      codeReference: { language: 'javascript', lineNumber: isIncluded ? 7 : 9 },
      explanation: {
        operationType: 'compute',
        conceptNoteType: 'optimal_substructure',
        variables: { i, w, result, isIncluded, valExclude, valInclude, weight: item.weight, value: item.value, label: item.label }
      }
    }));
    stepIndex++;

    cells[i][w] = { value: result, state: 'computed' };
    return result;
  }

  if (n === 0 || capacity <= 0) {
    steps.push(createStep({
      operation: 'result',
      activeIndices: { i: 0, j: 0 },
      explanation: { operationType: 'result', variables: { result: 0, n: 0, capacity: 0 } },
      codeReference: { language: 'javascript', lineNumber: 13 }
    }));
    return steps;
  }

  const finalValue = knapsackMemo(n, capacity);
  
  cells[n][capacity] = { ...cells[n][capacity], state: 'result' };
  steps.push(createStep({
    operation: 'result',
    activeIndices: { i: n, j: capacity },
    codeReference: { language: 'javascript', lineNumber: 13 },
    explanation: {
      operationType: 'result',
      variables: { result: finalValue, n, capacity }
    }
  }));

  return steps;
}
