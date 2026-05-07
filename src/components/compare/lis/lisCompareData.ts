import type { Step } from '../../../types/step.types';

export const LIS_COMPARE_MAX_RECURSIVE_ITEMS = 10;

export interface LISRecursiveNode {
  id: string;
  index: number;
  prevIndex: number;
  depth: number;
  stateKey: string;
  label: string;
  decision: 'start' | 'skip' | 'take';
  occurrence: number;
  totalOccurrences: number;
  isRepeated: boolean;
  parentId: string | null;
  children: string[];
}

export interface LISRecursiveFrame {
  visibleNodeIds: string[];
  activeNodeId: string | null;
  repeatedNodeIds: string[];
  stats: {
    calls: number;
    repeatedStates: number;
    maxDepth: number;
    growthSignal: number;
  };
  message: string;
}

export interface LISOptimizedFrame {
  activeIndex: number | null;
  activeValue: number | null;
  tails: number[];
  previousTails: number[];
  action: 'search' | 'append' | 'replace' | 'keep' | 'done';
  low: number | null;
  high: number | null;
  mid: number | null;
  targetPosition: number | null;
  comparisonText: string;
  comparisonTone: 'active' | 'success' | 'reject' | 'neutral';
  caption: string;
  metrics: {
    binarySearches: number;
    comparisons: number;
    replacements: number;
    appends: number;
    tailsLength: number;
    comparisonsAvoided: number;
  };
  message: string;
}

export interface LISCompareFrame {
  index: number;
  phaseLabel: string;
  recursive: LISRecursiveFrame;
  dpStep: Step;
  optimized: LISOptimizedFrame;
}

export interface LISCompareSummary {
  recursiveCalls: number;
  dpTransitions: number;
  binarySearchOps: number;
  savedWork: number;
  optimizedSavings: number;
}

export interface LISCompareTimeline {
  frames: LISCompareFrame[];
  recursiveNodes: LISRecursiveNode[];
  summary: LISCompareSummary;
  nums: number[];
  recursiveInputLength: number;
  isRecursiveLimited: boolean;
}

interface RecursiveEvent {
  visibleNodeIds: string[];
  activeNodeId: string | null;
  stats: LISRecursiveFrame['stats'];
  message: string;
}

const stateKey = (index: number, prevIndex: number) => `${index},${prevIndex}`;

const clampPick = <T,>(items: T[], globalIndex: number, totalFrames: number): T | null => {
  if (items.length === 0) return null;
  if (items.length === 1 || totalFrames <= 1) return items[0] ?? null;
  const mapped = Math.round((globalIndex / (totalFrames - 1)) * (items.length - 1));
  return items[Math.min(mapped, items.length - 1)] ?? null;
};

function makeFallbackStep(nums: number[]): Step {
  return {
    id: 'lis_compare_fallback',
    index: 0,
    algorithm: 'lis',
    approach: 'tabulation',
    operation: 'initialize',
    tableSnapshot: {
      dimensions: 1,
      labels: nums.map((_value, index) => `dp[${index}]`),
      cells: nums.map(() => ({ value: 1, state: 'idle' })),
      metadata: {},
    },
    activeIndices: { i: 0 },
    dependencyIndices: [],
    codeReference: { language: 'javascript', lineNumber: 1 },
    explanation: {
      operationType: 'initialize',
      variables: { i: 0, value: nums[0] ?? 0 },
    },
    metrics: {
      totalOperationsSoFar: 0,
      cacheHitsSoFar: 0,
      stackDepth: 0,
      redundantComputesSoFar: 0,
      operationsCount: 0,
      statesStored: nums.length,
    },
    metadata: {
      nums,
      dp: nums.map(() => 1),
      parent: nums.map(() => -1),
      phase: 'initialize',
      lisLength: nums.length > 0 ? 1 : 0,
    },
  };
}

function buildRecursiveEvents(nums: number[]) {
  const nodes: LISRecursiveNode[] = [];
  const nodeById = new Map<string, LISRecursiveNode>();
  const events: RecursiveEvent[] = [];
  const seenCounts = new Map<string, number>();
  const visibleNodeIds: string[] = [];
  let calls = 0;
  let repeatedStates = 0;
  let maxDepth = 0;

  const snapshot = (activeNodeId: string | null, message: string) => {
    events.push({
      visibleNodeIds: [...visibleNodeIds],
      activeNodeId,
      stats: {
        calls,
        repeatedStates,
        maxDepth: maxDepth + 1,
        growthSignal: Math.max(1, Math.pow(2, nums.length)),
      },
      message,
    });
  };

  const visit = (
    index: number,
    prevIndex: number,
    depth: number,
    parentId: string | null,
    decision: LISRecursiveNode['decision'],
  ): number => {
    const key = stateKey(index, prevIndex);
    const occurrence = (seenCounts.get(key) ?? 0) + 1;
    seenCounts.set(key, occurrence);
    calls++;
    if (occurrence > 1) repeatedStates++;
    maxDepth = Math.max(maxDepth, depth);

    const id = `lis-r-${nodes.length}`;
    const prevLabel = prevIndex === -1 ? 'none' : String(prevIndex);
    const node: LISRecursiveNode = {
      id,
      index,
      prevIndex,
      depth,
      stateKey: key,
      label: `solve(${index}, ${prevLabel})`,
      decision,
      occurrence,
      totalOccurrences: occurrence,
      isRepeated: occurrence > 1,
      parentId,
      children: [],
    };
    nodes.push(node);
    nodeById.set(id, node);
    visibleNodeIds.push(id);
    if (parentId) nodeById.get(parentId)?.children.push(id);

    if (index >= nums.length) {
      snapshot(id, 'Reached the end of the sequence. This branch contributes 0 more elements.');
      return 0;
    }

    snapshot(
      id,
      occurrence > 1
        ? `State solve(${index}, ${prevLabel}) appears again: brute force is recomputing work.`
        : `At index ${index}, choose whether to skip or take ${nums[index]}.`,
    );

    const skip = visit(index + 1, prevIndex, depth + 1, id, 'skip');
    let take = Number.NEGATIVE_INFINITY;
    if (prevIndex === -1 || nums[index]! > nums[prevIndex]!) {
      snapshot(id, `${nums[index]} can be taken after ${prevIndex === -1 ? 'the start' : nums[prevIndex]}.`);
      take = 1 + visit(index + 1, index, depth + 1, id, 'take');
    } else {
      snapshot(id, `${nums[index]} cannot be taken after ${nums[prevIndex]} because LIS must increase.`);
    }

    const best = Math.max(skip, take);
    snapshot(id, `Return max(skip=${skip}, take=${Number.isFinite(take) ? take : 'blocked'}) = ${best}.`);
    return best;
  };

  visit(0, -1, 0, null, 'start');
  nodes.forEach((node) => {
    node.totalOccurrences = seenCounts.get(node.stateKey) ?? node.occurrence;
  });

  return { nodes, events };
}

function buildOptimizedEvents(nums: number[], dpTransitions: number): LISOptimizedFrame[] {
  const events: LISOptimizedFrame[] = [];
  const tails: number[] = [];
  let binarySearches = 0;
  let comparisons = 0;
  let replacements = 0;
  let appends = 0;

  const emit = (
    activeIndex: number | null,
    activeValue: number | null,
    previousTails: number[],
    action: LISOptimizedFrame['action'],
    low: number | null,
    high: number | null,
    mid: number | null,
    targetPosition: number | null,
    message: string,
    comparisonText = 'Preparing tails update.',
    comparisonTone: LISOptimizedFrame['comparisonTone'] = 'neutral',
    caption = 'Binary search finds the first valid replacement position.',
  ) => {
    events.push({
      activeIndex,
      activeValue,
      tails: [...tails],
      previousTails,
      action,
      low,
      high,
      mid,
      targetPosition,
      comparisonText,
      comparisonTone,
      caption,
      metrics: {
        binarySearches,
        comparisons,
        replacements,
        appends,
        tailsLength: tails.length,
        comparisonsAvoided: Math.max(0, dpTransitions - comparisons),
      },
      message,
    });
  };

  nums.forEach((value, index) => {
    const before = [...tails];
    let low = 0;
    let high = tails.length;
    binarySearches++;
    emit(
      index,
      value,
      before,
      'search',
      low,
      high,
      null,
      null,
      `Binary search where ${value} should live in tails[].`,
      tails.length === 0 ? `${value} starts the first tail` : `Find first tail >= ${value}`,
      'active',
      'Binary search finds the first valid replacement position.',
    );

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const midValue = tails[mid]!;
      comparisons++;
      emit(
        index,
        value,
        before,
        'search',
        low,
        high,
        mid,
        null,
        `Check tails[${mid}] = ${midValue} against ${value}.`,
        `${value} ${value > midValue ? '>' : '<='} ${midValue}`,
        'active',
        'Binary search narrows the only range that can contain the replacement point.',
      );
      if (midValue < value) {
        low = mid + 1;
        emit(
          index,
          value,
          before,
          'search',
          low,
          high,
          mid,
          low,
          `Search range narrows to [${low}, ${high}).`,
          `${value} > ${midValue} -> move right`,
          'success',
          'Values larger than the mid tail must search to the right.',
        );
      } else {
        high = mid;
        emit(
          index,
          value,
          before,
          'search',
          low,
          high,
          mid,
          low,
          `Search range narrows to [${low}, ${high}).`,
          `${value} <= ${midValue} -> replace leftmost valid tail`,
          'reject',
          'A smaller or equal value can improve this tail position.',
        );
      }
    }

    if (low === tails.length) {
      tails.push(value);
      appends++;
      emit(
        index,
        value,
        before,
        'append',
        low,
        high,
        null,
        low,
        `Append ${value}; it extends the longest tail.`,
        `${value} > all tails -> append`,
        'success',
        'Appending means we found a longer increasing subsequence length.',
      );
    } else {
      const replaced = tails[low]!;
      tails[low] = value;
      replacements++;
      emit(
        index,
        value,
        before,
        'replace',
        low,
        high,
        null,
        low,
        `Replace tails[${low}] with ${value} to keep future growth flexible.`,
        `${value} < ${replaced} -> replace position ${low}`,
        'success',
        'Smaller tail keeps future subsequences flexible.',
      );
    }
  });

  emit(
    null,
    null,
    [...tails],
    'done',
    null,
    null,
    null,
    null,
    `Optimized LIS length is tails.length = ${tails.length}.`,
    'tails.length is the LIS length',
    'neutral',
    'We do not build the actual LIS here, only optimal tails.',
  );
  return events;
}

function phaseLabel(frame: LISCompareFrame) {
  if (frame.optimized.action === 'search') return 'Optimized tails maintenance';
  if (frame.dpStep.metadata?.phase === 'reconstruction') return 'DP reconstruction';
  if (frame.recursive.stats.repeatedStates > 0) return 'Repeated recursion exposed';
  return 'Recursive branching';
}

export function createLISCompareTimeline(nums: number[], dpSteps: Step[]): LISCompareTimeline {
  const safeNums = nums.slice(0, 16);
  const recursiveNums = safeNums.slice(0, LIS_COMPARE_MAX_RECURSIVE_ITEMS);
  const isRecursiveLimited = safeNums.length > recursiveNums.length;
  const { nodes, events: recursiveEvents } = buildRecursiveEvents(recursiveNums);
  const dpTimeline = dpSteps.length > 0 ? dpSteps : [makeFallbackStep(safeNums)];
  const finalDpStep = dpTimeline[dpTimeline.length - 1]!;
  const dpTransitions = finalDpStep.metrics.operationsCount;
  const optimizedEvents = buildOptimizedEvents(safeNums, dpTransitions);
  const totalFrames = Math.max(recursiveEvents.length, dpTimeline.length, optimizedEvents.length, 1);

  const finalRecursive = recursiveEvents[recursiveEvents.length - 1]?.stats;
  const finalOptimized = optimizedEvents[optimizedEvents.length - 1]?.metrics;
  const summary: LISCompareSummary = {
    recursiveCalls: finalRecursive?.calls ?? 0,
    dpTransitions,
    binarySearchOps: finalOptimized?.comparisons ?? 0,
    savedWork: Math.max(0, (finalRecursive?.calls ?? 0) - dpTransitions),
    optimizedSavings: Math.max(0, dpTransitions - (finalOptimized?.comparisons ?? 0)),
  };

  const frames = Array.from({ length: totalFrames }, (_, index): LISCompareFrame => {
    const recursive = clampPick(recursiveEvents, index, totalFrames) ?? recursiveEvents[0]!;
    const dpStep = clampPick(dpTimeline, index, totalFrames) ?? dpTimeline[0]!;
    const optimized = clampPick(optimizedEvents, index, totalFrames) ?? optimizedEvents[0]!;
    const frame: LISCompareFrame = {
      index,
      phaseLabel: '',
      recursive: {
        ...recursive,
        repeatedNodeIds: recursive.visibleNodeIds.filter((nodeId) => nodes.find((node) => node.id === nodeId)?.isRepeated),
      },
      dpStep,
      optimized,
    };
    frame.phaseLabel = phaseLabel(frame);
    return frame;
  });

  return {
    frames,
    recursiveNodes: nodes,
    summary,
    nums: safeNums,
    recursiveInputLength: recursiveNums.length,
    isRecursiveLimited,
  };
}
