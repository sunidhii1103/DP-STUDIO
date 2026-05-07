import React from 'react';
import type { MCMCallNode, MCMRecursiveFrame } from './mcmCompareData';

interface RecursivePanelProps {
  nodes: MCMCallNode[];
  frame: MCMRecursiveFrame;
}

const renderCallNode = (
  node: MCMCallNode,
  nodeMap: Map<string, MCMCallNode>,
  visibleIds: Set<string>,
  activeNodeId: string | null,
  repeatedIds: Set<string>
): React.ReactNode => {
  if (!visibleIds.has(node.id)) return null;

  const childNodes = node.children
    .map((childId) => nodeMap.get(childId))
    .filter((child): child is MCMCallNode => !!child && visibleIds.has(child.id));
  const isActive = activeNodeId === node.id;
  const isRepeated = repeatedIds.has(node.id);

  return (
    <div className="mcm-compare-call-branch" key={node.id}>
      <div
        className={[
          'mcm-compare-call-node',
          isActive ? 'mcm-compare-call-node--active' : '',
          isRepeated ? 'mcm-compare-call-node--repeated' : '',
        ].filter(Boolean).join(' ')}
      >
        <span>{node.label}</span>
        <small>{isRepeated ? `repeat #${node.occurrence}` : `depth ${node.depth + 1}`}</small>
      </div>
      {childNodes.length > 0 && (
        <div className="mcm-compare-call-children">
          {childNodes.map((child) => renderCallNode(child, nodeMap, visibleIds, activeNodeId, repeatedIds))}
        </div>
      )}
    </div>
  );
};

export const RecursivePanel: React.FC<RecursivePanelProps> = ({ nodes, frame }) => {
  const nodeMap = React.useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const visibleIds = React.useMemo(() => new Set(frame.visibleNodeIds), [frame.visibleNodeIds]);
  const repeatedIds = React.useMemo(() => new Set(frame.repeatedNodeIds), [frame.repeatedNodeIds]);
  const root = nodes[0];

  return (
    <section className="mcm-compare-panel mcm-compare-panel--recursive">
      <div className="mcm-compare-panel-header">
        <div>
          <span className="mcm-compare-kicker">Brute Force</span>
          <h3>Recursive Explosion</h3>
        </div>
        <span className="mcm-compare-complexity mcm-compare-complexity--hot">O(2^n)</span>
      </div>

      <div className="mcm-compare-tree-stage">
        {root ? (
          <div className="mcm-compare-call-tree">
            {renderCallNode(root, nodeMap, visibleIds, frame.activeNodeId, repeatedIds)}
          </div>
        ) : (
          <p className="mcm-compare-empty">Recursive tree will appear for a valid matrix chain.</p>
        )}
      </div>

      <div className="mcm-compare-message">{frame.message}</div>

      <div className="mcm-compare-metrics">
        <div><strong>{frame.stats.calls}</strong><span>Calls</span></div>
        <div><strong>{frame.stats.repeatedStates}</strong><span>Repeated States</span></div>
        <div><strong>{frame.stats.depth}</strong><span>Depth</span></div>
        <div><strong>{frame.stats.estimatedGrowth}</strong><span>Growth Signal</span></div>
      </div>

      <div className="mcm-compare-teaching-card">
        Subproblems recomputed many times. The orange nodes are the same intervals being solved again from scratch.
      </div>
    </section>
  );
};
