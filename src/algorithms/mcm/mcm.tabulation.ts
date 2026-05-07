import type {
  AlgorithmModule,
  MCMInput,
  Step,
  CellState,
  TableSnapshot2D,
  StepMetrics,
  OperationType,
} from '../types';
import { validateMCMInput } from './mcm.validation';

type Point = { i: number; j: number };

const MCM_TABULATION_CODE = [
  'function matrixChainOrder(p) {',
  '  const n = p.length - 1;',
  '  const dp = Array.from({ length: n }, () => Array(n).fill(0));',
  '  const split = Array.from({ length: n }, () => Array(n).fill(null));',
  '  for (let i = 0; i < n; i++) dp[i][i] = 0;',
  '  for (let len = 2; len <= n; len++) {',
  '    for (let i = 0; i <= n - len; i++) {',
  '      const j = i + len - 1;',
  '      dp[i][j] = Infinity;',
  '      for (let k = i; k < j; k++) {',
  '        const cost = dp[i][k] + dp[k + 1][j] + p[i] * p[k + 1] * p[j + 1];',
  '        if (cost < dp[i][j]) {',
  '          dp[i][j] = cost;',
  '          split[i][j] = k;',
  '        }',
  '      }',
  '    }',
  '  }',
  '  return { cost: dp[0][n - 1], parenthesization: build(0, n - 1, split) };',
  '}',
];

function cloneSplitTable(split: (number | null)[][]): (number | null)[][] {
  return split.map(row => [...row]);
}

function displayValue(value: number | null, split: number | null): number | string | null {
  if (value === null) return null;
  return split === null ? value : `${value} | k=${split + 1}`;
}

export class MCMTabulation implements AlgorithmModule {
  public validateInput = validateMCMInput;
  public getExplanationTemplates = () => ({});

  public getCode() {
    return MCM_TABULATION_CODE;
  }

  public getMetadata() {
    return {
      name: 'Matrix Chain Multiplication',
      strategy: 'Bottom-Up Interval DP',
      recurrence: 'dp[i][j] = min(dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j])',
    };
  }

  public getLearningContext() {
    return {
      ideas: [
        'Intervals are solved from short chains to long chains.',
        'Every split k is tried because the final multiplication could happen after any matrix in the interval.',
        'The merge cost is the scalar multiplication needed after both subchains are already optimal.',
      ],
    };
  }

  public getComplexity() {
    return {
      approach: 'tabulation' as const,
      timeComplexity: {
        notation: 'O(N^3)',
        description: 'For every interval, tries every split point.',
        order: 3,
      },
      spaceComplexity: {
        notation: 'O(N^2)',
        description: 'Stores interval costs and chosen split points.',
      },
      growthSamples: [
        { n: 2, ops: 1 },
        { n: 4, ops: 10 },
        { n: 6, ops: 35 },
        { n: 8, ops: 84 },
      ],
    };
  }

  public generateGrid(input: MCMInput): TableSnapshot2D {
    const n = input.dimensions.length - 1;
    const values = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_unused, j) => (i === j ? 0 : null))
    );
    const split = Array.from({ length: n }, () => Array<number | null>(n).fill(null));
    return this.createSnapshot(values, split);
  }

  public generateSteps(input: MCMInput): Step[] {
    const validation = this.validateInput(input);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const p = input.dimensions;
    const n = p.length - 1;
    const steps: Step[] = [];
    const values: (number | null)[][] = Array.from({ length: n }, () => Array<number | null>(n).fill(null));
    const split: (number | null)[][] = Array.from({ length: n }, () => Array<number | null>(n).fill(null));
    const tableStatesStored = n * n;
    let stepIndex = 0;
    let operationsExecuted = 0;

    const metrics = (): StepMetrics => ({
      totalOperationsSoFar: operationsExecuted,
      cacheHitsSoFar: 0,
      stackDepth: 0,
      redundantComputesSoFar: 0,
      operationsCount: operationsExecuted,
      statesStored: tableStatesStored,
    });

    const addStep = (
      operation: OperationType,
      active: Point,
      deps: Point[],
      vars: Record<string, string | number>,
      lineNumber: number,
      options: {
        conceptNoteType?: Step['explanation']['conceptNoteType'];
        countsOperation?: boolean;
        boundaryCells?: string[];
        pathCells?: string[];
        splitCells?: string[];
        milestoneId?: string;
      } = {}
    ) => {
      if (options.countsOperation) operationsExecuted++;
      steps.push({
        id: `mcm_${String(stepIndex).padStart(3, '0')}`,
        index: stepIndex++,
        algorithm: 'mcm',
        approach: 'tabulation',
        operation,
        tableSnapshot: this.createSnapshot(values, split, active, deps, options.boundaryCells, options.pathCells, options.splitCells),
        activeIndices: active,
        dependencyIndices: deps,
        codeReference: { language: 'javascript', lineNumber },
        explanation: {
          operationType: operation,
          conceptNoteType: options.conceptNoteType,
          variables: vars,
        },
        metrics: metrics(),
        metadata: {
          dimensions: [...p],
          chainLength: vars.chainLength,
          splitIndex: vars.k,
          formula: 'dp[i][j] = min(dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j])',
          parenthesization: vars.parenthesization,
        },
        milestoneId: options.milestoneId,
      });
    };

    for (let i = 0; i < n; i++) {
      values[i]![i] = 0;
      addStep(
        'initialize',
        { i, j: i },
        [],
        {
          i: i + 1,
          j: i + 1,
          value: 0,
          matrix: `A${i + 1}`,
          desc: `A${i + 1} alone costs 0 scalar multiplications.`,
        },
        5,
        { conceptNoteType: 'base_case', milestoneId: `mcm_init_${i}` }
      );
    }

    for (let len = 2; len <= n; len++) {
      addStep(
        'chain_length',
        { i: 0, j: len - 1 },
        [],
        {
          chainLength: len,
          desc: `Start diagonal for chains of length ${len}.`,
        },
        6,
        { milestoneId: `mcm_len_${len}` }
      );

      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        values[i]![j] = null;
        addStep(
          'select_interval',
          { i, j },
          [],
          {
            i: i + 1,
            j: j + 1,
            chainLength: len,
            interval: `A${i + 1}..A${j + 1}`,
            desc: `Evaluate interval A${i + 1}..A${j + 1}.`,
          },
          8,
          {
            conceptNoteType: 'optimal_substructure',
            boundaryCells: [`${i},${i}`, `${j},${j}`, `${i},${j}`],
            milestoneId: `mcm_interval_${i}_${j}`,
          }
        );

        let best = Infinity;
        let bestK: number | null = null;

        for (let k = i; k < j; k++) {
          const left = values[i]![k] ?? 0;
          const right = values[k + 1]![j] ?? 0;
          const dimLeft = p[i]!;
          const dimMid = p[k + 1]!;
          const dimRight = p[j + 1]!;
          const merge = dimLeft * dimMid * dimRight;
          const cost = left + right + merge;
          const deps = [{ i, j: k }, { i: k + 1, j }];
          const boundaryCells = [`${i},${i}`, `${k},${k}`, `${k + 1},${k + 1}`, `${j},${j}`];

          addStep(
            'try_split',
            { i, j },
            deps,
            {
              i: i + 1,
              j: j + 1,
              k: k + 1,
              chainLength: len,
              interval: `A${i + 1}..A${j + 1}`,
              leftInterval: `A${i + 1}..A${k + 1}`,
              rightInterval: `A${k + 2}..A${j + 1}`,
              left,
              right,
              merge,
              cost,
              dimLeft,
              dimMid,
              dimRight,
              formula: `${left} + ${right} + (${dimLeft}×${dimMid}×${dimRight})`,
              desc: `Trying split at k = ${k + 1}.`,
            },
            10,
            { countsOperation: true, boundaryCells }
          );

          addStep(
            'calculate_cost',
            { i, j },
            deps,
            {
              i: i + 1,
              j: j + 1,
              k: k + 1,
              left,
              right,
              merge,
              cost,
              dimLeft,
              dimMid,
              dimRight,
              formula: `${left} + ${right} + (${dimLeft}×${dimMid}×${dimRight}) = ${cost}`,
              desc: 'Total cost = left subproblem + right subproblem + multiplication cost.',
            },
            11,
            { boundaryCells }
          );

          if (cost < best) {
            best = cost;
            bestK = k;
            values[i]![j] = best;
            split[i]![j] = bestK;

            addStep(
              'update_min',
              { i, j },
              deps,
              {
                i: i + 1,
                j: j + 1,
                k: k + 1,
                best,
                cost,
                desc: `New minimum for dp[${i + 1}][${j + 1}] is ${best}.`,
              },
              13,
              { conceptNoteType: 'optimal_substructure', boundaryCells }
            );
          }
        }

        values[i]![j] = best;
        split[i]![j] = bestK;
        addStep(
          'final_decision',
          { i, j },
          bestK === null ? [] : [{ i, j: bestK }, { i: bestK + 1, j }],
          {
            i: i + 1,
            j: j + 1,
            k: bestK === null ? '' : bestK + 1,
            best,
            interval: `A${i + 1}..A${j + 1}`,
            leftInterval: bestK === null ? '' : `A${i + 1}..A${bestK + 1}`,
            rightInterval: bestK === null ? '' : `A${bestK + 2}..A${j + 1}`,
            desc: `Choosing minimum among all partitions: ${best}.`,
          },
          16,
          { milestoneId: `mcm_decision_${i}_${j}` }
        );
      }
    }

    const parenthesization = this.buildParenthesization(split, 0, n - 1);
    addStep(
      'result',
      { i: 0, j: n - 1 },
      [],
      {
        i: 1,
        j: n,
        result: values[0]?.[n - 1] ?? 0,
        parenthesization,
      },
      19,
      { milestoneId: 'mcm_result' }
    );

    this.addReconstructionSteps(steps, values, split, p, metrics, () => stepIndex++, 0, n - 1, parenthesization);

    return steps;
  }

  private createSnapshot(
    values: (number | null)[][],
    split: (number | null)[][],
    active?: Point,
    deps: Point[] = [],
    boundaryCells: string[] = [],
    pathCells: string[] = [],
    splitCells: string[] = []
  ): TableSnapshot2D {
    const n = values.length;
    const depSet = new Set(deps.map(dep => `${dep.i},${dep.j}`));
    const pathSet = new Set(pathCells);
    const cells: CellState[][] = values.map((row, i) =>
      row.map((value, j) => {
        let state: CellState['state'] = value === null ? 'idle' : 'computed';
        if (i > j) state = 'idle';
        if (depSet.has(`${i},${j}`)) state = 'dependency';
        if (pathSet.has(`${i},${j}`)) state = 'path';
        if (active && active.i === i && active.j === j) state = 'active';
        return { value: displayValue(value, split[i]?.[j] ?? null), state };
      })
    );

    return {
      dimensions: 2,
      rowLabels: Array.from({ length: n }, (_, i) => `i=${i + 1}`),
      colLabels: Array.from({ length: n }, (_, j) => `j=${j + 1}`),
      cells,
      metadata: {
        tableKind: 'interval',
        splitTable: cloneSplitTable(split),
        boundaryCells,
        pathCells,
        splitCells,
        activeChainLength: active && active.i <= active.j ? active.j - active.i + 1 : null,
        activeCellKey: active ? `${active.i},${active.j}` : null,
        phase: pathCells.length > 0 ? 'reconstruction' : 'dp-fill',
      },
    };
  }

  private buildParenthesization(split: (number | null)[][], i: number, j: number): string {
    if (i === j) return `A${i + 1}`;
    const k = split[i]?.[j] ?? null;
    if (k === null) return `A${i + 1}..A${j + 1}`;
    return `(${this.buildParenthesization(split, i, k)}${this.buildParenthesization(split, k + 1, j)})`;
  }

  private addReconstructionSteps(
    steps: Step[],
    values: (number | null)[][],
    split: (number | null)[][],
    dimensions: number[],
    metrics: () => StepMetrics,
    nextIndex: () => number,
    i: number,
    j: number,
    parenthesization: string,
    path: string[] = []
  ) {
    const stepIndex = nextIndex();
    const k = split[i]?.[j] ?? null;
    const nextPath = [...path, `${i},${j}`];
    const deps: Point[] = k === null ? [] : [{ i, j: k }, { i: k + 1, j }];
    const snapshot = this.createSnapshot(
      values,
      split,
      { i, j },
      deps,
      [`${i},${j}`],
      nextPath,
      k === null ? [] : [`${i},${k}`, `${k + 1},${j}`]
    );

    steps.push({
      id: `mcm_${String(stepIndex).padStart(3, '0')}`,
      index: stepIndex,
      algorithm: 'mcm',
      approach: 'tabulation',
      operation: 'backtrack_split',
      tableSnapshot: snapshot,
      activeIndices: { i, j },
      dependencyIndices: deps,
      codeReference: { language: 'javascript', lineNumber: 19 },
      explanation: {
        operationType: 'backtrack_split',
        variables: {
          i: i + 1,
          j: j + 1,
          k: k === null ? '' : k + 1,
          interval: `A${i + 1}..A${j + 1}`,
          leftInterval: k === null ? '' : `A${i + 1}..A${k + 1}`,
          rightInterval: k === null ? '' : `A${k + 2}..A${j + 1}`,
          parenthesization,
          desc: k === null
            ? `Reached base matrix A${i + 1}, no further split needed.`
            : `Optimal split at k=${k + 1} divides ${this.safeIntervalLabel(i, j)} into ${this.safeIntervalLabel(i, k)} and ${this.safeIntervalLabel(k + 1, j)}.`,
        },
      },
      metrics: metrics(),
      metadata: {
        dimensions: [...dimensions],
        parenthesization,
        splitIndex: k === null ? undefined : k + 1,
        reconstructionPath: nextPath,
      },
      milestoneId: `mcm_reconstruct_${i}_${j}`,
    });

    if (k !== null) {
      this.addReconstructionSteps(steps, values, split, dimensions, metrics, nextIndex, i, k, parenthesization, nextPath);
      this.addReconstructionSteps(steps, values, split, dimensions, metrics, nextIndex, k + 1, j, parenthesization, nextPath);
    }
  }

  private safeIntervalLabel(i: number, j: number): string {
    if (!Number.isFinite(i) || !Number.isFinite(j) || i < 0 || j < 0) return 'the selected interval';
    if (i === j) return `A${i + 1}`;
    return `(A${i + 1}..A${j + 1})`;
  }
}

export { MCM_TABULATION_CODE };
