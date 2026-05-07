import type {
  AlgorithmInput,
  AlgorithmModule,
  CellState,
  ComplexityMetadata,
  ExplanationTemplateMap,
  LISInput,
  Step,
  StepMetrics,
  TableSnapshot,
} from '../types';
import { validateLISInput } from './lis.validation';

const LIS_TABULATION_CODE = [
  'function lis(nums) {',
  '  const n = nums.length;',
  '  const dp = Array(n).fill(1);',
  '  const parent = Array(n).fill(-1);',
  '  for (let i = 0; i < n; i++) {',
  '    for (let j = 0; j < i; j++) {',
  '      if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {',
  '        dp[i] = dp[j] + 1;',
  '        parent[i] = j;',
  '      }',
  '    }',
  '  }',
  '  let best = dp.indexOf(Math.max(...dp));',
  '  const sequence = [];',
  '  while (best !== -1) {',
  '    sequence.push(nums[best]);',
  '    best = parent[best];',
  '  }',
  '  return sequence.reverse();',
  '}',
];

const cloneArray = <T,>(items: T[]) => [...items];

const makeSnapshot = (
  dp: number[],
  activeIndex: number | null,
  dependencyIndex: number | null,
  resultIndices: Set<number>,
): TableSnapshot => ({
  dimensions: 1,
  labels: dp.map((_value, index) => `dp[${index}]`),
  cells: dp.map((value, index): CellState => {
    let state: CellState['state'] = 'computed';
    if (dependencyIndex === index) state = 'dependency';
    if (activeIndex === index) state = 'active';
    if (resultIndices.has(index)) state = 'path';
    return { value, state };
  }),
});

export class LISTabulation implements AlgorithmModule {
  public validateInput(input: AlgorithmInput) {
    return validateLISInput(input as LISInput);
  }

  public getCode() {
    return LIS_TABULATION_CODE;
  }

  public getMetadata() {
    return {
      name: 'Longest Increasing Subsequence',
      strategy: 'Bottom-Up Sequence DP',
      recurrence: 'dp[i] = max(1, dp[j] + 1) for every j < i where nums[j] < nums[i]',
    };
  }

  public getLearningContext() {
    return {
      ideas: [
        'A subsequence keeps relative order but can skip elements.',
        'dp[i] stores the best increasing subsequence that must end at index i.',
        'The parent array remembers which previous index produced the best extension.',
      ],
    };
  }

  public getComplexity(): ComplexityMetadata {
    return {
      approach: 'tabulation',
      timeComplexity: {
        notation: 'O(n^2)',
        description: 'For each element, scan all earlier elements as possible predecessors.',
        order: 2,
      },
      spaceComplexity: {
        notation: 'O(n)',
        description: 'Stores one LIS length and one predecessor pointer per element.',
      },
      growthSamples: [
        { n: 4, ops: 6 },
        { n: 8, ops: 28 },
        { n: 12, ops: 66 },
        { n: 16, ops: 120 },
      ],
    };
  }

  public getExplanationTemplates(): ExplanationTemplateMap {
    return {};
  }

  public generateGrid(input: AlgorithmInput): TableSnapshot {
    const { nums } = input as LISInput;
    return makeSnapshot(Array.from({ length: nums.length }, () => 1), null, null, new Set());
  }

  public generateSteps(input: AlgorithmInput): Step[] {
    const lisInput = input as LISInput;
    const validation = this.validateInput(lisInput);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const nums = lisInput.nums;
    const n = nums.length;
    const dp = Array.from({ length: n }, () => 1);
    const parent = Array.from({ length: n }, () => -1);
    const steps: Step[] = [];
    let stepIndex = 0;
    let operations = 0;
    let updates = 0;
    let reconstructionSteps = 0;
    let bestIndex = 0;

    const metrics = (): StepMetrics => ({
      totalOperationsSoFar: operations,
      cacheHitsSoFar: 0,
      stackDepth: 0,
      redundantComputesSoFar: updates,
      operationsCount: operations,
      statesStored: n,
    });

    const addStep = (
      operation: Step['operation'],
      activeIndex: number,
      dependencyIndex: number | null,
      lineNumber: number,
      variables: Record<string, string | number>,
      options: {
        resultIndices?: Set<number>;
        countsOperation?: boolean;
        conceptNoteType?: Step['explanation']['conceptNoteType'];
        phase?: 'initialize' | 'dp' | 'reconstruction' | 'result';
        sequenceSoFar?: number[];
        milestoneId?: string;
      } = {},
    ) => {
      if (options.countsOperation) operations++;
      const resultIndices = options.resultIndices ?? new Set<number>();

      steps.push({
        id: `lis_${String(stepIndex).padStart(3, '0')}`,
        index: stepIndex++,
        algorithm: 'lis',
        approach: 'tabulation',
        operation,
        tableSnapshot: makeSnapshot(dp, activeIndex, dependencyIndex, resultIndices),
        activeIndices: { i: activeIndex },
        dependencyIndices: dependencyIndex === null ? [] : [{ i: dependencyIndex }],
        codeReference: { language: 'javascript', lineNumber },
        explanation: {
          operationType: operation,
          variables,
          conceptNoteType: options.conceptNoteType,
        },
        metrics: metrics(),
        metadata: {
          nums: cloneArray(nums),
          dp: cloneArray(dp),
          parent: cloneArray(parent),
          currentIndex: activeIndex,
          compareIndex: dependencyIndex,
          chosenParentIndex: parent[activeIndex] ?? -1,
          pathIndices: [...resultIndices],
          phase: options.phase ?? 'dp',
          sequenceSoFar: options.sequenceSoFar ?? [],
          lisLength: Math.max(...dp),
          comparisons,
          updates,
          reconstructionSteps,
        },
        milestoneId: options.milestoneId,
      });
    };

    let comparisons = 0;

    for (let i = 0; i < n; i++) {
      addStep(
        'initialize',
        i,
        null,
        3,
        {
          i,
          value: nums[i]!,
          dpValue: 1,
          desc: `Start dp[${i}] = 1 because ${nums[i]} alone is an increasing subsequence.`,
        },
        {
          conceptNoteType: 'base_case',
          phase: 'initialize',
          milestoneId: `lis_init_${i}`,
        },
      );
    }

    for (let i = 0; i < n; i++) {
      addStep(
        'read',
        i,
        null,
        5,
        {
          i,
          value: nums[i]!,
          dpValue: dp[i]!,
          desc: `Now find the best increasing subsequence ending at index ${i}.`,
        },
        { phase: 'dp', milestoneId: `lis_outer_${i}` },
      );

      for (let j = 0; j < i; j++) {
        comparisons++;
        addStep(
          'compare',
          i,
          j,
          7,
          {
            i,
            j,
            current: nums[i]!,
            candidate: nums[j]!,
            currentDp: dp[i]!,
            candidateDp: dp[j]!,
            canExtend: nums[j]! < nums[i]! ? 1 : 0,
            desc: nums[j]! < nums[i]!
              ? `${nums[i]} can extend subsequence ending at ${nums[j]}.`
              : `${nums[i]} cannot extend ${nums[j]} because sequence must increase.`,
          },
          {
            countsOperation: true,
            conceptNoteType: 'optimal_substructure',
            phase: 'dp',
          },
        );

        if (nums[j]! < nums[i]! && dp[j]! + 1 > dp[i]!) {
          const previous = dp[i]!;
          dp[i] = dp[j]! + 1;
          parent[i] = j;
          updates++;
          if (dp[i]! > dp[bestIndex]!) bestIndex = i;

          addStep(
            'compute',
            i,
            j,
            8,
            {
              i,
              j,
              current: nums[i]!,
              candidate: nums[j]!,
              previous,
              result: dp[i]!,
              parentIndex: j,
              parentValue: nums[j]!,
              desc: `Updating dp[${i}] from ${previous} to ${dp[i]} using predecessor index ${j}.`,
            },
            {
              countsOperation: true,
              conceptNoteType: 'optimal_substructure',
              phase: 'dp',
              milestoneId: `lis_update_${i}_${j}`,
            },
          );
        }
      }
    }

    bestIndex = dp.reduce((best, value, index) => value > dp[best]! ? index : best, 0);
    addStep(
      'read',
      bestIndex,
      null,
      13,
      {
        i: bestIndex,
        result: dp[bestIndex]!,
        value: nums[bestIndex]!,
        desc: `DP complete. Start reconstruction from index ${bestIndex}, where LIS length is ${dp[bestIndex]}.`,
      },
      {
        phase: 'reconstruction',
        milestoneId: 'lis_reconstruction_start',
      },
    );

    const pathForward: number[] = [];
    for (let cursor = bestIndex; cursor !== -1; cursor = parent[cursor] ?? -1) {
      pathForward.unshift(cursor);
    }

    const seenPath = new Set<number>();
    const sequenceSoFar: number[] = [];
    for (let cursor = bestIndex; cursor !== -1; cursor = parent[cursor] ?? -1) {
      const parentIndex = parent[cursor] ?? -1;
      reconstructionSteps++;
      seenPath.add(cursor);
      sequenceSoFar.unshift(nums[cursor]!);
      addStep(
        'read',
        cursor,
        parentIndex === -1 ? null : parentIndex,
        15,
        {
          i: cursor,
          value: nums[cursor]!,
          parentIndex,
          parentValue: parentIndex === -1 ? '' : nums[parentIndex]!,
          partialSequence: sequenceSoFar.join(', '),
          desc: parentIndex === -1
            ? `${nums[cursor]} starts this reconstructed subsequence.`
            : `Follow parent[${cursor}] = ${parentIndex} to continue rebuilding the LIS.`,
        },
        {
          resultIndices: new Set(seenPath),
          phase: 'reconstruction',
          sequenceSoFar: cloneArray(sequenceSoFar),
          milestoneId: `lis_backtrack_${cursor}`,
        },
      );
    }

    const finalPath = new Set(pathForward);
    addStep(
      'result',
      bestIndex,
      null,
      19,
      {
        result: dp[bestIndex]!,
        sequence: pathForward.map((index) => nums[index]).join(', '),
        desc: `Final LIS is [${pathForward.map((index) => nums[index]).join(', ')}] with length ${dp[bestIndex]}.`,
      },
      {
        resultIndices: finalPath,
        phase: 'result',
        sequenceSoFar: pathForward.map((index) => nums[index]!),
        milestoneId: 'lis_result',
      },
    );

    return steps;
  }
}

export { LIS_TABULATION_CODE };
