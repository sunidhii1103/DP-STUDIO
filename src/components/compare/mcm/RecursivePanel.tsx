import React from 'react';
import type { MCMCallNode, MCMRecursiveFrame } from './mcmCompareData';

interface RecursivePanelProps {
  nodes: MCMCallNode[];
  frame: MCMRecursiveFrame;
}

interface LayoutNode {
  node: MCMCallNode;
  x: number;
  y: number;
}

interface LayoutEdge {
  id: string;
  from: LayoutNode;
  to: LayoutNode;
  isRepeated: boolean;
}

interface SubtreeLayout {
  width: number;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  root: LayoutNode;
}

const NODE_WIDTH = 116;
const NODE_HEIGHT = 58;
const MAX_RENDERED_TREE_NODES = 260;

const yForDepth = (depth: number) => {
  let y = 0;
  for (let level = 0; level < depth; level++) {
    y += Math.max(68, 96 - level * 4);
  }
  return y;
};

const keepAncestors = (ids: string[], nodeMap: Map<string, MCMCallNode>) => {
  if (ids.length <= MAX_RENDERED_TREE_NODES) return new Set(ids);
  const kept = new Set(ids.slice(-MAX_RENDERED_TREE_NODES));
  ids.slice(-MAX_RENDERED_TREE_NODES).forEach((id) => {
    let cursor = nodeMap.get(id)?.parentId ?? null;
    while (cursor) {
      kept.add(cursor);
      cursor = nodeMap.get(cursor)?.parentId ?? null;
    }
  });
  return kept;
};

const buildLayout = (
  node: MCMCallNode,
  nodeMap: Map<string, MCMCallNode>,
  visibleIds: Set<string>,
): SubtreeLayout | null => {
  if (!visibleIds.has(node.id)) return null;

  const childNodes = node.children
    .map((childId) => nodeMap.get(childId))
    .filter((child): child is MCMCallNode => !!child)
    .map((child) => buildLayout(child, nodeMap, visibleIds))
    .filter((layout): layout is SubtreeLayout => !!layout);

  const gap = Math.max(18, 40 - node.depth * 3);
  const childrenWidth = childNodes.reduce((sum, child) => sum + child.width, 0) + Math.max(0, childNodes.length - 1) * gap;
  const width = Math.max(NODE_WIDTH, childrenWidth);
  const y = yForDepth(node.depth);

  if (childNodes.length === 0) {
    const root = { node, x: width / 2, y };
    return { width, nodes: [root], edges: [], root };
  }

  let offset = (width - childrenWidth) / 2;
  const positionedChildren = childNodes.map((child) => {
    const shiftedNodes = child.nodes.map((item) => ({ ...item, x: item.x + offset }));
    const shiftedRoot = { ...child.root, x: child.root.x + offset };
    const nodeById = new Map(shiftedNodes.map((item) => [item.node.id, item]));
    const shiftedEdges = child.edges.map((edge) => ({
      ...edge,
      from: nodeById.get(edge.from.node.id) ?? edge.from,
      to: nodeById.get(edge.to.node.id) ?? edge.to,
    }));
    offset += child.width + gap;
    return { ...child, nodes: shiftedNodes, edges: shiftedEdges, root: shiftedRoot };
  });

  const firstChild = positionedChildren[0]!.root;
  const lastChild = positionedChildren[positionedChildren.length - 1]!.root;
  const root = { node, x: (firstChild.x + lastChild.x) / 2, y };
  const nodes = [root, ...positionedChildren.flatMap((child) => child.nodes)];
  const edges = [
    ...positionedChildren.map((child) => ({
      id: `${node.id}-${child.root.node.id}`,
      from: root,
      to: child.root,
      isRepeated: child.root.node.isRepeated,
    })),
    ...positionedChildren.flatMap((child) => child.edges),
  ];

  return { width, nodes, edges, root };
};

const connectorPath = (edge: LayoutEdge) => {
  const startX = edge.from.x;
  const startY = edge.from.y + NODE_HEIGHT;
  const endX = edge.to.x;
  const endY = edge.to.y;
  const midY = startY + Math.max(22, (endY - startY) * 0.55);
  return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
};

export const RecursivePanel: React.FC<RecursivePanelProps> = ({ nodes, frame }) => {
  const nodeMap = React.useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const visibleIds = React.useMemo(() => keepAncestors(frame.visibleNodeIds, nodeMap), [frame.visibleNodeIds, nodeMap]);
  const repeatedIds = React.useMemo(() => new Set(frame.repeatedNodeIds), [frame.repeatedNodeIds]);
  const root = nodes[0];
  const layout = React.useMemo(() => root ? buildLayout(root, nodeMap, visibleIds) : null, [root, nodeMap, visibleIds]);
  const canvasWidth = Math.max(layout?.width ?? 0, 320) + 48;
  const canvasHeight = layout
    ? Math.max(...layout.nodes.map((item) => item.y)) + NODE_HEIGHT + 36
    : 260;
  const hiddenNodeCount = Math.max(0, frame.visibleNodeIds.length - visibleIds.size);

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
        {layout ? (
          <div
            className="mcm-compare-call-tree"
            style={{ width: canvasWidth, height: canvasHeight }}
          >
            <svg className="mcm-compare-call-links" width={canvasWidth} height={canvasHeight} aria-hidden="true">
              {layout.edges.map((edge) => (
                <path
                  key={edge.id}
                  d={connectorPath({
                    ...edge,
                    from: { ...edge.from, x: edge.from.x + 24 },
                    to: { ...edge.to, x: edge.to.x + 24 },
                  })}
                  className={[
                    'mcm-compare-call-link',
                    edge.isRepeated ? 'mcm-compare-call-link--repeated' : '',
                  ].filter(Boolean).join(' ')}
                />
              ))}
            </svg>
            {layout.nodes.map(({ node, x, y }) => {
              const isActive = frame.activeNodeId === node.id;
              const isRepeated = repeatedIds.has(node.id);
              return (
                <div
                  key={node.id}
                  className={[
                    'mcm-compare-call-node',
                    isActive ? 'mcm-compare-call-node--active' : '',
                    isRepeated ? 'mcm-compare-call-node--repeated' : '',
                  ].filter(Boolean).join(' ')}
                  style={{
                    left: x + 24 - NODE_WIDTH / 2,
                    top: y,
                    ['--mcm-node-depth' as string]: node.depth,
                  }}
                  title={isRepeated ? `This state was solved ${node.totalOccurrences} times.` : `${node.label} at depth ${node.depth + 1}`}
                >
                  <span>{node.label}</span>
                  <small>{isRepeated ? 'recomputed' : `depth ${node.depth + 1}`}</small>
                  {isRepeated && <b>repeat #{node.occurrence}</b>}
                </div>
              );
            })}
            {hiddenNodeCount > 0 && (
              <span className="mcm-tree-window-note">{hiddenNodeCount} earlier calls windowed for smooth playback</span>
            )}
          </div>
        ) : (
          <p className="mcm-compare-empty">Recursive tree will appear for a valid matrix chain.</p>
        )}
      </div>

      <div className="mcm-compare-message">{frame.message}</div>

      <div className="mcm-compare-metrics">
        <div><strong>{frame.stats.calls}</strong><span>Calls</span></div>
        <div><strong>{frame.stats.repeatedStates}</strong><span>Repeated States</span></div>
        <div><strong>{frame.stats.repeatedIntervals}</strong><span>Repeated Intervals</span></div>
        <div><strong>{frame.stats.depth}</strong><span>Depth</span></div>
      </div>

      <div className="mcm-compare-teaching-card">
        Recursive brute force recomputes the same interval multiple times. Red-orange branches show work being repeated from scratch.
      </div>
    </section>
  );
};
