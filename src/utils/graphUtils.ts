import { NodeId, LogicNode, SimulationStep } from '../types';

/**
 * Returns the set of all IDs in the subtree rooted at `id`
 * (including the root itself).  Uses an iterative BFS so it handles
 * arbitrarily deep trees without stack overflow.
 */
export function getSubtreeIds(id: NodeId, nodes: Record<NodeId, LogicNode>): Set<NodeId> {
  const result = new Set<NodeId>();
  const queue: NodeId[] = [id];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (result.has(current)) continue; // guard against accidental cycles during deletion
    result.add(current);
    const node = nodes[current];
    if (node) {
      for (const childId of node.children) {
        queue.push(childId);
      }
    }
  }

  return result;
}

/**
 * Simulates the logic flow starting from `rootId`.
 * Performs a DFS traversal following tree-children first, then the cross-link.
 * Returns an ordered list of steps. Stops if a node would be visited twice
 * (cycle guard – the simulation button should already be disabled in that case,
 * but this prevents infinite loops defensively).
 */
export function simulateFlow(
  rootId: NodeId,
  nodes: Record<NodeId, LogicNode>
): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const visited = new Set<NodeId>();

  function dfs(id: NodeId, via: 'tree' | 'link'): void {
    if (visited.has(id)) return;
    visited.add(id);

    const node = nodes[id];
    if (!node) return;

    steps.push({
      nodeId: id,
      label: node.label,
      condition: node.condition || '(no condition)',
      via,
    });

    for (const childId of node.children) {
      dfs(childId, 'tree');
    }

    if (node.linkedTo) {
      dfs(node.linkedTo, 'link');
    }
  }

  dfs(rootId, 'tree');
  return steps;
}
