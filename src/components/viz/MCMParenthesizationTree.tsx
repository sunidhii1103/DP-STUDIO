import React from 'react';
import type { Step, TableSnapshot2D } from '../../types/step.types';

interface TreeNode {
  i: number;
  j: number;
  k: number | null;
  left: TreeNode | null;
  right: TreeNode | null;
  leafCount: number;
}

interface MCMParenthesizationTreeProps {
  step: Step;
}

const keyFor = (i: number, j: number) => `${i},${j}`;

const safeIntervalLabel = (i: number, j: number) => {
  if (!Number.isFinite(i) || !Number.isFinite(j) || i < 0 || j < 0) return 'A?';
  return i === j ? `A${i + 1}` : `A${i + 1}..A${j + 1}`;
};

const getSplit = (splitTable: (number | null)[][], i: number, j: number): number | null => {
  const split = splitTable[i]?.[j];
  return typeof split === 'number' && split >= i && split < j ? split : null;
};

const getDimensions = (step: Step): number[] => {
  const raw = step.metadata?.dimensions;
  return Array.isArray(raw)
    ? raw.filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0)
    : [];
};

const getMatrixDims = (dimensions: number[], i: number) => {
  const rows = dimensions[i];
  const cols = dimensions[i + 1];
  if (!rows || !cols) return '';
  return `${rows}×${cols}`;
};

const buildTree = (
  splitTable: (number | null)[][],
  i: number,
  j: number,
  depth = 0
): TreeNode | null => {
  if (depth > 16 || i < 0 || j < i || i >= splitTable.length || j >= splitTable.length) return null;

  const k = getSplit(splitTable, i, j);
  if (i === j || k === null) {
    return { i, j, k: null, left: null, right: null, leafCount: Math.max(1, j - i + 1) };
  }

  const left = buildTree(splitTable, i, k, depth + 1);
  const right = buildTree(splitTable, k + 1, j, depth + 1);
  const leafCount = Math.max(1, (left?.leafCount ?? 0) + (right?.leafCount ?? 0));

  return { i, j, k, left, right, leafCount };
};

const getFocusText = (step: Step, isReconstruction: boolean) => {
  const vars = step.explanation?.variables ?? {};
  const interval = typeof vars.interval === 'string' && vars.interval ? vars.interval : '';
  const k = typeof vars.k === 'number' ? vars.k : null;

  if (isReconstruction && k !== null && interval) {
    return `Split chain ${interval} at k=${k}`;
  }
  if (isReconstruction && interval) {
    return `Reached base matrix ${interval}`;
  }
  if (k !== null && interval) {
    return `Evaluating split k=${k} for ${interval}`;
  }
  if (interval) {
    return `Focused interval ${interval}`;
  }
  return 'Tree updates from the current DP step';
};

const renderNode = (
  node: TreeNode,
  activeKey: string | null,
  pathKeys: Set<string>,
  splitKeys: Set<string>,
  dimensions: number[],
  isReconstruction: boolean,
  isRoot = false
): React.ReactNode => {
  const nodeKey = keyFor(node.i, node.j);
  const isLeaf = node.i === node.j || !node.left || !node.right;
  const isActive = activeKey === nodeKey;
  const isPath = pathKeys.has(nodeKey);
  const isSplitBranch = splitKeys.has(nodeKey);
  const isInactive = isReconstruction && !isActive && !isPath && !isSplitBranch;
  const hasChildren = !!node.left && !!node.right;
  const matrixDims = isLeaf ? getMatrixDims(dimensions, node.i) : '';

  const branchClassName = [
    'mcm-tree-branch',
    isRoot ? 'mcm-tree-branch--root' : '',
    hasChildren ? 'mcm-tree-branch--has-children' : '',
    isActive ? 'mcm-tree-branch--active' : '',
    isPath ? 'mcm-tree-branch--path' : '',
    isSplitBranch ? 'mcm-tree-branch--split' : '',
    isInactive ? 'mcm-tree-branch--inactive' : '',
  ].filter(Boolean).join(' ');

  const nodeClassName = [
    'mcm-tree-node',
    isLeaf ? 'mcm-tree-node--leaf' : 'mcm-tree-node--internal',
    isActive ? 'mcm-tree-node--active' : '',
    isPath ? 'mcm-tree-node--path' : '',
    isSplitBranch ? 'mcm-tree-node--split-branch' : '',
    isInactive ? 'mcm-tree-node--inactive' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={branchClassName}
      key={nodeKey}
      style={{ ['--leaf-count' as string]: node.leafCount }}
    >
      <div className={`mcm-tree-node-wrap ${hasChildren ? 'mcm-tree-node-wrap--has-children' : ''}`}>
        <div className={nodeClassName}>
          {isLeaf ? (
            <>
              <span className="mcm-tree-leaf-label">{safeIntervalLabel(node.i, node.j)}</span>
              {matrixDims && <span className="mcm-tree-node-dims">{matrixDims}</span>}
            </>
          ) : (
            <>
              <span className="mcm-tree-multiply">×</span>
              <span className="mcm-tree-node-split">k = {(node.k ?? 0) + 1}</span>
              <span className="mcm-tree-node-interval">{safeIntervalLabel(node.i, node.j)}</span>
            </>
          )}
        </div>
      </div>
      {hasChildren && (
        <div className="mcm-tree-children">
          {renderNode(node.left!, activeKey, pathKeys, splitKeys, dimensions, isReconstruction)}
          {renderNode(node.right!, activeKey, pathKeys, splitKeys, dimensions, isReconstruction)}
        </div>
      )}
    </div>
  );
};

export const MCMParenthesizationTree: React.FC<MCMParenthesizationTreeProps> = ({ step }) => {
  if (step.algorithm !== 'mcm' || step.tableSnapshot.dimensions !== 2) return null;

  const snapshot = step.tableSnapshot as TableSnapshot2D;
  const metadata = snapshot.metadata ?? {};
  const splitTable = metadata.splitTable as (number | null)[][] | undefined;
  const n = snapshot.cells.length;

  if (!splitTable || n === 0) return null;

  const root = buildTree(splitTable, 0, n - 1);
  const hasRootSplit = getSplit(splitTable, 0, n - 1) !== null || n === 1;
  const activeKey = typeof metadata.activeCellKey === 'string'
    ? metadata.activeCellKey
    : step.activeIndices.j !== undefined
      ? keyFor(step.activeIndices.i, step.activeIndices.j)
      : null;
  const pathKeys = new Set((metadata.pathCells as string[] | undefined) ?? []);
  const splitKeys = new Set((metadata.splitCells as string[] | undefined) ?? []);
  const isReconstruction = metadata.phase === 'reconstruction';
  const dimensions = getDimensions(step);
  const parenthesization = typeof step.metadata?.parenthesization === 'string' && step.metadata.parenthesization
    ? step.metadata.parenthesization
    : typeof step.explanation?.variables?.parenthesization === 'string'
      ? step.explanation.variables.parenthesization
      : '';
  const focusText = getFocusText(step, isReconstruction);

  return (
    <div className="mcm-tree-panel" aria-label="Optimal parenthesization tree">
      <div className="mcm-tree-header">
        <div>
          <span className="mcm-tree-title">Optimal Parenthesization Tree</span>
          <span className="mcm-tree-focus">{focusText}</span>
        </div>
        {parenthesization && <code>{parenthesization}</code>}
      </div>
      {root && hasRootSplit ? (
        <div className={`mcm-tree ${isReconstruction ? 'mcm-tree--reconstruction' : ''}`}>
          <div className="mcm-tree-canvas">
            {renderNode(root, activeKey, pathKeys, splitKeys, dimensions, isReconstruction, true)}
          </div>
        </div>
      ) : (
        <p className="mcm-tree-fallback">
          Tree appears once the full-chain split is known.
        </p>
      )}
    </div>
  );
};
