import type { Step } from '../../../types/step.types';

export const MCM_COMPARE_MAX_MATRICES = 7;

export type MCMComparePanelId = 'recursive' | 'memoization' | 'tabulation';

export interface MCMCallNode {
  id: string;
  i: number;
  j: number;
  depth: number;
  label: string;
  stateKey: string;
  occurrence: number;
  totalOccurrences: number;
  parentId: string | null;
  isRepeated: boolean;
  children: string[];
  result?: number;
}

export interface MCMRecursiveFrame {
  visibleNodeIds: string[];
  activeNodeId: string | null;
  repeatedNodeIds: string[];
  stats: {
    calls: number;
    repeatedStates: number;
    repeatedIntervals: number;
    depth: number;
    estimatedGrowth: number;
  };
  message: string;
}

export interface MCMMemoFrame {
  activeKey: string | null;
  computedKeys: string[];
  cacheHitKey: string | null;
  pendingKeys: string[];
  metrics: {
    computedOnce: number;
    cacheHits: number;
    savedCalls: number;
    reusePercentage: number;
  };
  message: string;
}

export interface MCMTabulationFrame {
  step: Step | null;
  intervalLength: number | null;
  activeDiagonalKeys: string[];
  completedDiagonalKeys: string[];
  dependencyKeys: string[];
  activeCellKey: string | null;
  interval: string;
  formula: string;
  bestSplit: string;
  traversalLabel: string;
  statesFilledOnce: number;
  dependencyReuseCount: number;
  deterministicTraversal: string;
  message: string;
}

export interface MCMCompareSummary {
  recursiveCalls: number;
  memoizedStates: number;
  savedWork: number;
  redundantAvoidedPercentage: number;
  tabulatedStates: number;
}

export interface MCMCompareFrame {
  index: number;
  phaseLabel: string;
  recursive: MCMRecursiveFrame;
  memoization: MCMMemoFrame;
  tabulation: MCMTabulationFrame;
}

export interface MCMCompareTimeline {
  frames: MCMCompareFrame[];
  recursiveNodes: MCMCallNode[];
  summary: MCMCompareSummary;
  matrixCount: number;
  isLimited: boolean;
}

interface RecursiveEvent {
  visibleNodeIds: string[];
  activeNodeId: string | null;
  stats: MCMRecursiveFrame['stats'];
  message: string;
}

interface MemoEvent {
  activeKey: string | null;
  computedKeys: string[];
  cacheHitKey: string | null;
  pendingKeys: string[];
  metrics: MCMMemoFrame['metrics'];
  message: string;
}

const stateKey = (i: number, j: number) => `${i},${j}`;

const intervalLabel = (i: number, j: number) => i === j ? `A${i + 1}` : `A${i + 1}..A${j + 1}`;

const upperTriangleStateCount = (matrixCount: number) => (matrixCount * (matrixCount + 1)) / 2;

const percent = (part: number, total: number) => total <= 0 ? 0 : Math.round((part / total) * 100);

const clampPick = <T,>(items: T[], globalIndex: number, totalFrames: number): T | null => {
  if (items.length === 0) return null;
  if (items.length === 1 || totalFrames <= 1) return items[0] ?? null;
  const mapped = Math.round((globalIndex / (totalFrames - 1)) * (items.length - 1));
  return items[Math.min(mapped, items.length - 1)] ?? null;
};

const emptySnapshot = (matrixCount: number): Step['tableSnapshot'] => ({
  dimensions: 2,
  rowLabels: Array.from({ length: matrixCount }, (_, i) => `i=${i + 1}`),
  colLabels: Array.from({ length: matrixCount }, (_, i) => `j=${i + 1}`),
  cells: Array.from({ length: matrixCount }, () =>
    Array.from({ length: matrixCount }, () => ({ value: null, state: 'idle' as const }))
  ),
  metadata: { tableKind: 'interval' },
});

const makeFallbackTabStep = (matrixCount: number): Step => ({
  id: 'mcm_compare_fallback',
  index: 0,
  algorithm: 'mcm',
  approach: 'tabulation',
  operation: 'initialize',
  tableSnapshot: emptySnapshot(matrixCount),
  activeIndices: { i: 0, j: 0 },
  dependencyIndices: [],
  codeReference: { language: 'javascript', lineNumber: 1 },
  explanation: {
    operationType: 'initialize',
    variables: { desc: 'Waiting for valid MCM tabulation data.' },
  },
  metrics: {
    totalOperationsSoFar: 0,
    cacheHitsSoFar: 0,
    stackDepth: 0,
    redundantComputesSoFar: 0,
    operationsCount: 0,
    statesStored: matrixCount * matrixCount,
  },
});

function buildRecursiveEvents(dimensions: number[], matrixCount: number) {
  const nodes: MCMCallNode[] = [];
  const nodeById = new Map<string, MCMCallNode>();
  const events: RecursiveEvent[] = [];
  const seenCounts = new Map<string, number>();
  const repeatedIntervalKeys = new Set<string>();
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
        repeatedIntervals: repeatedIntervalKeys.size,
        depth: maxDepth + 1,
        estimatedGrowth: Math.max(1, Math.round(Math.pow(2, Math.max(0, matrixCount - 1)))),
      },
      message,
    });
  };

  const visit = (i: number, j: number, depth: number, parentId: string | null): number => {
    const key = stateKey(i, j);
    const occurrence = (seenCounts.get(key) ?? 0) + 1;
    seenCounts.set(key, occurrence);
    calls++;
    if (occurrence > 1) {
      repeatedStates++;
      repeatedIntervalKeys.add(key);
    }
    maxDepth = Math.max(maxDepth, depth);

    const id = `r-${nodes.length}`;
    const node: MCMCallNode = {
      id,
      i,
      j,
      depth,
      label: `solve(${i + 1},${j + 1})`,
      stateKey: key,
      occurrence,
      totalOccurrences: occurrence,
      parentId,
      isRepeated: occurrence > 1,
      children: [],
    };
    nodes.push(node);
    nodeById.set(id, node);
    visibleNodeIds.push(id);

    if (parentId) {
      nodeById.get(parentId)?.children.push(id);
    }

    snapshot(
      id,
      occurrence > 1
        ? `${intervalLabel(i, j)} is recomputed by brute force instead of reused.`
        : `Expanding recursive call ${node.label}.`
    );

    if (i === j) {
      node.result = 0;
      snapshot(id, `${intervalLabel(i, j)} is a base case with cost 0.`);
      return 0;
    }

    let best = Number.POSITIVE_INFINITY;
    for (let k = i; k < j; k++) {
      snapshot(id, `Branch at k=${k + 1}: solve left and right intervals independently.`);
      const left = visit(i, k, depth + 1, id);
      const right = visit(k + 1, j, depth + 1, id);
      const merge = dimensions[i]! * dimensions[k + 1]! * dimensions[j + 1]!;
      best = Math.min(best, left + right + merge);
      snapshot(id, `Return to ${intervalLabel(i, j)} after trying k=${k + 1}.`);
    }

    node.result = best;
    snapshot(id, `${intervalLabel(i, j)} returns best cost ${best}.`);
    return best;
  };

  visit(0, matrixCount - 1, 0, null);
  nodes.forEach((node) => {
    node.totalOccurrences = seenCounts.get(node.stateKey) ?? node.occurrence;
  });
  return { nodes, events };
}

function buildMemoEvents(dimensions: number[], matrixCount: number): MemoEvent[] {
  const events: MemoEvent[] = [];
  const memo = new Map<string, number>();
  const pendingKeys: string[] = [];
  let cacheHits = 0;
  let savedCalls = 0;

  const emit = (activeKey: string | null, cacheHitKey: string | null, message: string) => {
    const computedOnce = memo.size;
    events.push({
      activeKey,
      computedKeys: [...memo.keys()],
      cacheHitKey,
      pendingKeys: [...pendingKeys],
      metrics: {
        computedOnce,
        cacheHits,
        savedCalls,
        reusePercentage: percent(cacheHits, cacheHits + computedOnce),
      },
      message,
    });
  };

  const solve = (i: number, j: number): number => {
    const key = stateKey(i, j);
    emit(key, null, `Check memo for ${intervalLabel(i, j)}.`);

    if (memo.has(key)) {
      cacheHits++;
      savedCalls++;
      emit(key, key, `Cache hit: reuse ${intervalLabel(i, j)} without expanding its subtree.`);
      return memo.get(key)!;
    }

    pendingKeys.push(key);
    emit(key, null, `Cache miss: compute ${intervalLabel(i, j)} once.`);

    if (i === j) {
      memo.set(key, 0);
      pendingKeys.pop();
      emit(key, null, `Store base interval ${intervalLabel(i, j)} = 0.`);
      return 0;
    }

    let best = Number.POSITIVE_INFINITY;
    for (let k = i; k < j; k++) {
      emit(key, null, `Try split k=${k + 1}; dependencies may come from cache.`);
      const left = solve(i, k);
      const right = solve(k + 1, j);
      const merge = dimensions[i]! * dimensions[k + 1]! * dimensions[j + 1]!;
      best = Math.min(best, left + right + merge);
    }

    memo.set(key, best);
    pendingKeys.pop();
    emit(key, null, `Store ${intervalLabel(i, j)} = ${best}. Future calls reuse it.`);
    return best;
  };

  solve(0, matrixCount - 1);
  return events;
}

function buildTabulationFrame(step: Step | null): MCMTabulationFrame {
  if (!step) {
    return {
      step: null,
      intervalLength: null,
      activeDiagonalKeys: [],
      completedDiagonalKeys: [],
      dependencyKeys: [],
      activeCellKey: null,
      interval: 'No tabulation step',
      formula: 'dp[i][j] = min over k',
      bestSplit: '-',
      traversalLabel: 'Waiting for tabulation data',
      statesFilledOnce: 0,
      dependencyReuseCount: 0,
      deterministicTraversal: 'Not started',
      message: 'Tabulation data is not available.',
    };
  }

  const variables = step.explanation?.variables ?? {};
  const metadata = step.tableSnapshot.metadata ?? {};
  const matrixCount = step.tableSnapshot.dimensions === 2 ? step.tableSnapshot.cells.length : 0;
  const metadataLength = typeof metadata.activeChainLength === 'number' ? metadata.activeChainLength : null;
  const intervalLength = typeof variables.chainLength === 'number' ? variables.chainLength : metadataLength;
  const activeCellKey = typeof metadata.activeCellKey === 'string'
    ? metadata.activeCellKey
    : step.activeIndices.j !== undefined
      ? `${step.activeIndices.i},${step.activeIndices.j}`
      : null;
  const interval = typeof variables.interval === 'string'
    ? variables.interval
    : step.activeIndices.j !== undefined
      ? intervalLabel(step.activeIndices.i, step.activeIndices.j)
      : 'Base diagonal';
  const formula = typeof variables.formula === 'string'
    ? variables.formula
    : 'dp[i][j] = min(dp[i][k] + dp[k+1][j] + p[i]*p[k+1]*p[j+1])';
  const bestSplit = typeof variables.k === 'number' ? `k = ${variables.k}` : '-';
  const activeDiagonalKeys = intervalLength && intervalLength > 0
    ? Array.from({ length: Math.max(0, matrixCount - intervalLength + 1) }, (_unused, i) => `${i},${i + intervalLength - 1}`)
    : [];
  const completedDiagonalKeys = intervalLength
    ? Array.from({ length: matrixCount }, (_unused, i) => i)
      .flatMap((i) => Array.from({ length: Math.max(0, intervalLength - 1) }, (_unused, lenIndex) => {
        const len = lenIndex + 1;
        return i + len - 1 < matrixCount ? `${i},${i + len - 1}` : null;
      }))
      .filter((key): key is string => key !== null)
    : [];
  const dependencyKeys = (step.dependencyIndices ?? [])
    .filter((dep) => dep.j !== undefined)
    .map((dep) => `${dep.i},${dep.j}`);
  const statesFilledOnce = step.tableSnapshot.dimensions === 2
    ? step.tableSnapshot.cells.reduce((count, row, i) => (
      count + row.filter((cell, j) => i <= j && cell.value !== null).length
    ), 0)
    : 0;
  const dependencyReuseCount = step.metrics?.totalOperationsSoFar
    ? step.metrics.totalOperationsSoFar * 2
    : dependencyKeys.length;
  const traversalLabel = intervalLength && intervalLength > 1
    ? `Processing interval length = ${intervalLength}`
    : 'Seeding base diagonal';

  return {
    step,
    intervalLength,
    activeDiagonalKeys,
    completedDiagonalKeys,
    dependencyKeys,
    activeCellKey,
    interval,
    formula,
    bestSplit,
    traversalLabel,
    statesFilledOnce,
    dependencyReuseCount,
    deterministicTraversal: intervalLength && intervalLength > 1 ? 'Shorter intervals first' : 'Base cases first',
    message: String(variables.desc ?? `Bottom-up step: ${step.operation.replace(/_/g, ' ')}.`),
  };
}

function phaseLabel(frame: MCMCompareFrame) {
  const tabLen = frame.tabulation.intervalLength;
  if (tabLen) return `Interval length ${tabLen}`;
  if (frame.recursive.stats.depth <= 2) return 'Branching begins';
  if (frame.memoization.metrics.cacheHits > 0) return 'Reuse becomes visible';
  return 'Base cases and setup';
}

export function createMCMCompareTimeline(dimensions: number[], tabulationSteps: Step[]): MCMCompareTimeline {
  const matrixCount = Math.max(0, dimensions.length - 1);
  const cappedDimensions = dimensions.slice(0, MCM_COMPARE_MAX_MATRICES + 1);
  const compareMatrixCount = Math.max(0, cappedDimensions.length - 1);
  const isLimited = matrixCount > MCM_COMPARE_MAX_MATRICES;

  if (compareMatrixCount < 2) {
    const fallback = makeFallbackTabStep(Math.max(1, compareMatrixCount));
    return {
      frames: [{
        index: 0,
        phaseLabel: 'Waiting for input',
        recursive: {
          visibleNodeIds: [],
          activeNodeId: null,
          repeatedNodeIds: [],
          stats: { calls: 0, repeatedStates: 0, repeatedIntervals: 0, depth: 0, estimatedGrowth: 0 },
          message: 'Enter at least two matrices.',
        },
        memoization: {
          activeKey: null,
          computedKeys: [],
          cacheHitKey: null,
          pendingKeys: [],
          metrics: { computedOnce: 0, cacheHits: 0, savedCalls: 0, reusePercentage: 0 },
          message: 'Memo table is waiting for a valid chain.',
        },
        tabulation: buildTabulationFrame(fallback),
      }],
      recursiveNodes: [],
      summary: {
        recursiveCalls: 0,
        memoizedStates: 0,
        savedWork: 0,
        redundantAvoidedPercentage: 0,
        tabulatedStates: 0,
      },
      matrixCount: compareMatrixCount,
      isLimited,
    };
  }

  const { nodes, events: recursiveEvents } = buildRecursiveEvents(cappedDimensions, compareMatrixCount);
  const memoEvents = buildMemoEvents(cappedDimensions, compareMatrixCount);
  const relevantTabSteps = tabulationSteps.length > 0
    ? tabulationSteps
    : [makeFallbackTabStep(compareMatrixCount)];
  const totalFrames = Math.max(recursiveEvents.length, memoEvents.length, relevantTabSteps.length, 1);
  const finalRecursive = recursiveEvents[recursiveEvents.length - 1]?.stats;
  const finalMemo = memoEvents[memoEvents.length - 1]?.metrics;
  const recursiveCalls = finalRecursive?.calls ?? 0;
  const memoizedStates = finalMemo?.computedOnce ?? 0;
  const savedWork = Math.max(0, recursiveCalls - memoizedStates);
  const summary: MCMCompareSummary = {
    recursiveCalls,
    memoizedStates,
    savedWork,
    redundantAvoidedPercentage: percent(savedWork, recursiveCalls),
    tabulatedStates: upperTriangleStateCount(compareMatrixCount),
  };

  const frames: MCMCompareFrame[] = Array.from({ length: totalFrames }, (_, index) => {
    const recursiveEvent = clampPick(recursiveEvents, index, totalFrames) ?? recursiveEvents[0]!;
    const memoEvent = clampPick(memoEvents, index, totalFrames) ?? memoEvents[0]!;
    const tabStep = clampPick(relevantTabSteps, index, totalFrames);
    const repeatedNodeIds = recursiveEvent.visibleNodeIds.filter((nodeId) => {
      const node = nodes.find((item) => item.id === nodeId);
      return !!node?.isRepeated;
    });

    const frame: MCMCompareFrame = {
      index,
      phaseLabel: '',
      recursive: {
        visibleNodeIds: recursiveEvent.visibleNodeIds,
        activeNodeId: recursiveEvent.activeNodeId,
        repeatedNodeIds,
        stats: recursiveEvent.stats,
        message: recursiveEvent.message,
      },
      memoization: memoEvent,
      tabulation: buildTabulationFrame(tabStep),
    };
    frame.phaseLabel = phaseLabel(frame);
    return frame;
  });

  return {
    frames,
    recursiveNodes: nodes,
    summary,
    matrixCount: compareMatrixCount,
    isLimited,
  };
}
