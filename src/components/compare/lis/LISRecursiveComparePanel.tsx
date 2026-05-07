import React from 'react';
import type { LISRecursiveFrame, LISRecursiveNode } from './lisCompareData';

interface LISRecursiveComparePanelProps {
  nodes: LISRecursiveNode[];
  frame: LISRecursiveFrame;
}

interface LayoutNode {
  node: LISRecursiveNode;
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

const NODE_WIDTH = 112;
const NODE_HEIGHT = 56;
const MAX_RENDERED_NODES = 240;
const MIN_ZOOM = 0.55;
const MAX_ZOOM = 1.7;

const yForDepth = (depth: number) => {
  let y = 0;
  for (let level = 0; level < depth; level++) {
    y += Math.max(62, 86 - level * 2);
  }
  return y;
};

const keepWindowWithAncestors = (ids: string[], nodeMap: Map<string, LISRecursiveNode>) => {
  if (ids.length <= MAX_RENDERED_NODES) return new Set(ids);
  const kept = new Set(ids.slice(-MAX_RENDERED_NODES));
  ids.slice(-MAX_RENDERED_NODES).forEach((id) => {
    let cursor = nodeMap.get(id)?.parentId ?? null;
    while (cursor) {
      kept.add(cursor);
      cursor = nodeMap.get(cursor)?.parentId ?? null;
    }
  });
  return kept;
};

const activePathFor = (activeNodeId: string | null, nodeMap: Map<string, LISRecursiveNode>) => {
  const path = new Set<string>();
  let cursor = activeNodeId;
  while (cursor) {
    path.add(cursor);
    cursor = nodeMap.get(cursor)?.parentId ?? null;
  }
  return path;
};

const buildLayout = (
  node: LISRecursiveNode,
  nodeMap: Map<string, LISRecursiveNode>,
  visibleIds: Set<string>,
): SubtreeLayout | null => {
  if (!visibleIds.has(node.id)) return null;

  const childLayouts = node.children
    .map((childId) => nodeMap.get(childId))
    .filter((child): child is LISRecursiveNode => !!child)
    .map((child) => buildLayout(child, nodeMap, visibleIds))
    .filter((layout): layout is SubtreeLayout => !!layout);

  const gap = Math.max(18, 40 - node.depth * 2);
  const childWidth = childLayouts.reduce((sum, child) => sum + child.width, 0) + Math.max(0, childLayouts.length - 1) * gap;
  const width = Math.max(NODE_WIDTH, childWidth);
  const y = yForDepth(node.depth);

  if (childLayouts.length === 0) {
    const root = { node, x: width / 2, y };
    return { width, nodes: [root], edges: [], root };
  }

  let offset = (width - childWidth) / 2;
  const positionedChildren = childLayouts.map((child) => {
    const shiftedNodes = child.nodes.map((item) => ({ ...item, x: item.x + offset }));
    const shiftedRoot = { ...child.root, x: child.root.x + offset };
    const shiftedNodeMap = new Map(shiftedNodes.map((item) => [item.node.id, item]));
    const shiftedEdges = child.edges.map((edge) => ({
      ...edge,
      from: shiftedNodeMap.get(edge.from.node.id) ?? edge.from,
      to: shiftedNodeMap.get(edge.to.node.id) ?? edge.to,
    }));
    offset += child.width + gap;
    return { ...child, nodes: shiftedNodes, edges: shiftedEdges, root: shiftedRoot };
  });

  const root = {
    node,
    x: (positionedChildren[0]!.root.x + positionedChildren[positionedChildren.length - 1]!.root.x) / 2,
    y,
  };

  return {
    width,
    root,
    nodes: [root, ...positionedChildren.flatMap((child) => child.nodes)],
    edges: [
      ...positionedChildren.map((child) => ({
        id: `${node.id}-${child.root.node.id}`,
        from: root,
        to: child.root,
        isRepeated: child.root.node.isRepeated,
      })),
      ...positionedChildren.flatMap((child) => child.edges),
    ],
  };
};

const connectorPath = (edge: LayoutEdge) => {
  const startX = edge.from.x;
  const startY = edge.from.y + NODE_HEIGHT;
  const endX = edge.to.x;
  const endY = edge.to.y;
  const midY = startY + Math.max(28, (endY - startY) * 0.62);
  return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
};

export const LISRecursiveComparePanel: React.FC<LISRecursiveComparePanelProps> = ({ nodes, frame }) => {
  const [zoom, setZoom] = React.useState(1);
  const [focusActive, setFocusActive] = React.useState(true);
  const [viewport, setViewport] = React.useState({ left: 0, top: 0, width: 1, height: 1 });
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const dragRef = React.useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  const nodeMap = React.useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const visibleIds = React.useMemo(() => keepWindowWithAncestors(frame.visibleNodeIds, nodeMap), [frame.visibleNodeIds, nodeMap]);
  const repeatedIds = React.useMemo(() => new Set(frame.repeatedNodeIds), [frame.repeatedNodeIds]);
  const activePath = React.useMemo(() => activePathFor(frame.activeNodeId, nodeMap), [frame.activeNodeId, nodeMap]);
  const root = nodes[0];
  const layout = React.useMemo(() => root ? buildLayout(root, nodeMap, visibleIds) : null, [root, nodeMap, visibleIds]);
  const canvasWidth = Math.max(layout?.width ?? 0, 320) + 48;
  const canvasHeight = layout ? Math.max(...layout.nodes.map((item) => item.y)) + NODE_HEIGHT + 44 : 260;
  const hiddenCount = Math.max(0, frame.visibleNodeIds.length - visibleIds.size);
  const activeLayoutNode = layout?.nodes.find((item) => item.node.id === frame.activeNodeId);

  const updateViewport = React.useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    setViewport({
      left: stage.scrollLeft,
      top: stage.scrollTop,
      width: stage.clientWidth,
      height: stage.clientHeight,
    });
  }, []);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !activeLayoutNode) return;
    const targetLeft = Math.max(0, (activeLayoutNode.x + 24) * zoom - stage.clientWidth / 2);
    const targetTop = Math.max(0, activeLayoutNode.y * zoom - stage.clientHeight / 2 + NODE_HEIGHT);
    stage.scrollTo({ left: targetLeft, top: targetTop, behavior: 'smooth' });
    window.setTimeout(updateViewport, 260);
  }, [activeLayoutNode, zoom, updateViewport]);

  React.useEffect(() => {
    updateViewport();
    const onResize = () => window.requestAnimationFrame(updateViewport);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateViewport]);

  React.useEffect(() => {
    const onShortcut = (event: Event) => {
      const detail = (event as CustomEvent<{ direction: 'in' | 'out' | 'reset' }>).detail;
      if (detail.direction === 'reset') setZoom(1);
      else setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + (detail.direction === 'in' ? 0.1 : -0.1))));
    };
    window.addEventListener('lis-tree-zoom', onShortcut);
    return () => window.removeEventListener('lis-tree-zoom', onShortcut);
  }, []);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + (event.deltaY < 0 ? 0.08 : -0.08))));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    dragRef.current = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop };
    stage.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    const drag = dragRef.current;
    if (!stage || !drag) return;
    stage.scrollLeft = drag.left - (event.clientX - drag.x);
    stage.scrollTop = drag.top - (event.clientY - drag.y);
    updateViewport();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    stageRef.current?.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  const navigateMiniMap = (event: React.MouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const xRatio = (event.clientX - bounds.left) / bounds.width;
    const yRatio = (event.clientY - bounds.top) / bounds.height;
    stage.scrollTo({
      left: Math.max(0, xRatio * canvasWidth * zoom - stage.clientWidth / 2),
      top: Math.max(0, yRatio * canvasHeight * zoom - stage.clientHeight / 2),
      behavior: 'smooth',
    });
    window.setTimeout(updateViewport, 260);
  };

  const scaledWidth = canvasWidth * zoom;
  const scaledHeight = canvasHeight * zoom;
  const miniNodes = layout?.nodes ?? [];
  const miniScaleX = 100 / Math.max(canvasWidth, 1);
  const miniScaleY = 74 / Math.max(canvasHeight, 1);
  const miniViewport = {
    left: Math.min(100, (viewport.left / zoom) * miniScaleX),
    top: Math.min(74, (viewport.top / zoom) * miniScaleY),
    width: Math.min(100, (viewport.width / zoom) * miniScaleX),
    height: Math.min(74, (viewport.height / zoom) * miniScaleY),
  };

  return (
    <section className="lis-compare-panel lis-compare-panel--recursive" data-tour="lis-recursive-panel">
      <div className="lis-compare-panel-header">
        <div>
          <span className="lis-compare-kicker">Brute Force</span>
          <h3>Recursive Branching</h3>
        </div>
        <span className="lis-complexity lis-complexity--hot">O(2^n)</span>
      </div>

      <div className="lis-tree-toolbar" aria-label="Recursive tree controls">
        <button onClick={() => setZoom((current) => Math.min(MAX_ZOOM, current + 0.12))}>Zoom In</button>
        <button onClick={() => setZoom((current) => Math.max(MIN_ZOOM, current - 0.12))}>Zoom Out</button>
        <button onClick={() => setZoom(1)}>Reset View</button>
        <label>
          <input type="checkbox" checked={focusActive} onChange={(event) => setFocusActive(event.target.checked)} />
          Focus Active Branch
        </label>
      </div>

      <div
        className="lis-recursive-stage"
        ref={stageRef}
        onScroll={updateViewport}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {layout ? (
          <div className="lis-recursive-zoom-surface" style={{ width: scaledWidth, height: scaledHeight }}>
            <div
              className="lis-recursive-tree"
              style={{
                width: canvasWidth,
                height: canvasHeight,
                transform: `scale(${zoom})`,
              }}
            >
              <svg className="lis-recursive-links" width={canvasWidth} height={canvasHeight} aria-hidden="true">
                {layout.edges.map((edge) => {
                  const isActiveEdge = activePath.has(edge.from.node.id) && activePath.has(edge.to.node.id);
                  return (
                    <path
                      key={edge.id}
                      d={connectorPath({
                        ...edge,
                        from: { ...edge.from, x: edge.from.x + 24 },
                        to: { ...edge.to, x: edge.to.x + 24 },
                      })}
                      className={[
                        'lis-recursive-link',
                        edge.isRepeated ? 'lis-recursive-link--repeated' : '',
                        isActiveEdge ? 'lis-recursive-link--active-path' : '',
                        focusActive && !isActiveEdge ? 'lis-recursive-link--muted' : '',
                      ].filter(Boolean).join(' ')}
                    />
                  );
                })}
              </svg>
              {layout.nodes.map(({ node, x, y }) => {
                const isActive = frame.activeNodeId === node.id;
                const isRepeated = repeatedIds.has(node.id);
                const isActivePath = activePath.has(node.id);
                const isMuted = focusActive && !isActivePath && !isActive;
                const style: React.CSSProperties & Record<string, number> = {
                  left: x + 24 - NODE_WIDTH / 2,
                  top: y,
                  '--lis-depth': node.depth,
                };

                return (
                  <div
                    key={node.id}
                    className={[
                      'lis-recursive-node',
                      `lis-recursive-node--${node.decision}`,
                      isActive ? 'lis-recursive-node--active' : '',
                      isRepeated ? 'lis-recursive-node--repeated' : '',
                      isActivePath ? 'lis-recursive-node--active-path' : '',
                      isMuted ? 'lis-recursive-node--muted' : '',
                    ].filter(Boolean).join(' ')}
                    style={style}
                    title={isRepeated ? `This recursive state was solved ${node.totalOccurrences} times.` : node.label}
                  >
                    <span>{node.label}</span>
                    <small>{isRepeated ? 'recomputed' : node.decision}</small>
                  </div>
                );
              })}
              {hiddenCount > 0 && <span className="lis-window-note">{hiddenCount} earlier calls windowed</span>}
            </div>
          </div>
        ) : (
          <p className="lis-compare-empty">Recursive tree is waiting for input.</p>
        )}

        {layout && (
          <div className="lis-tree-minimap" onClick={navigateMiniMap} aria-label="Recursive tree minimap">
            {miniNodes.map(({ node, x, y }) => (
              <span
                key={node.id}
                className={activePath.has(node.id) ? 'lis-minimap-dot lis-minimap-dot--active' : 'lis-minimap-dot'}
                style={{ left: x * miniScaleX, top: y * miniScaleY }}
              />
            ))}
            <b
              className="lis-minimap-viewport"
              style={{
                left: `${miniViewport.left}%`,
                top: miniViewport.top,
                width: `${Math.max(10, miniViewport.width)}%`,
                height: Math.max(10, miniViewport.height),
              }}
            />
          </div>
        )}
      </div>

      <div className="lis-panel-message">{frame.message}</div>

      <div className="lis-metric-grid">
        <div><strong>{frame.stats.calls}</strong><span>Total calls</span></div>
        <div><strong>{frame.stats.repeatedStates}</strong><span>Repeated states</span></div>
        <div><strong>{frame.stats.maxDepth}</strong><span>Max depth</span></div>
        <div><strong>{frame.stats.growthSignal}</strong><span>Growth signal</span></div>
      </div>

      <div className="lis-teaching-card">
        Recursive LIS explores both taking and skipping each element. Red states reveal the same subproblem being solved again.
      </div>
    </section>
  );
};
