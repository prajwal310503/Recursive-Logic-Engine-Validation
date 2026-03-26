import { GraphState, GraphStats, NodeId } from '../types';

export function computeStats(state: GraphState): GraphStats {
  const nodes = Object.values(state.nodes);
  const totalNodes = nodes.length;
  const totalEdges = nodes.reduce(
    (acc, n) => acc + n.children.length + (n.linkedTo ? 1 : 0), 0
  );
  const crossLinks = nodes.filter((n) => n.linkedTo !== null).length;
  const collapsedCount = nodes.filter((n) => n.collapsed).length;
  const nodesWithCondition = nodes.filter((n) => n.condition.trim() !== '').length;

  // Max tree depth via iterative DFS
  let maxDepth = 0;
  if (state.rootId && state.nodes[state.rootId]) {
    const stack: [NodeId, number][] = [[state.rootId, 0]];
    const visited = new Set<NodeId>();
    while (stack.length > 0) {
      const [id, depth] = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      if (depth > maxDepth) maxDepth = depth;
      const node = state.nodes[id];
      if (node) {
        for (const cid of node.children) stack.push([cid, depth + 1]);
      }
    }
  }

  return {
    totalNodes,
    totalEdges,
    crossLinks,
    maxDepth,
    cycleCount: state.cycleNodes.length,
    collapsedCount,
    nodesWithCondition,
  };
}
