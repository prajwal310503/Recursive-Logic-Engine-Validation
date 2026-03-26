import { NodeId, LogicNode } from '../types';

export interface CycleResult {
  hasCycle: boolean;
  /** All node IDs that are part of at least one cycle */
  cycleNodes: NodeId[];
}

/**
 * Returns the outgoing neighbours of a node in the directed graph.
 * Both tree-children and cross-links count as edges.
 */
function getNeighbors(node: LogicNode, nodes: Record<NodeId, LogicNode>): NodeId[] {
  const neighbors: NodeId[] = [];

  for (const childId of node.children) {
    if (nodes[childId]) neighbors.push(childId);
  }

  if (node.linkedTo && nodes[node.linkedTo]) {
    neighbors.push(node.linkedTo);
  }

  return neighbors;
}

/**
 * Detects all cycles in the directed graph using iterative DFS with a
 * three-colour (WHITE / GRAY / BLACK) scheme.
 *
 * Complexity: O(V + E) where V = number of nodes, E = number of edges
 * (children + cross-links).
 *
 * When a back-edge is found (current node → GRAY ancestor) we walk the
 * current DFS path back to the ancestor and mark every node on that path as
 * a cycle participant. We continue the traversal so ALL cycles are found, not
 * just the first one.
 */
export function detectCycles(nodes: Record<NodeId, LogicNode>): CycleResult {
  const WHITE = 0 as const; // not yet visited
  const GRAY = 1 as const;  // in current DFS path (recursion stack)
  const BLACK = 2 as const; // fully processed

  const color = new Map<NodeId, typeof WHITE | typeof GRAY | typeof BLACK>();
  const cycleNodeSet = new Set<NodeId>();

  // Explicit stack-based DFS to avoid call-stack overflow on very deep trees.
  // We track the ordered path (DFS stack) so we can identify the exact cycle.
  const dfsPath: NodeId[] = [];
  const pathIndex = new Map<NodeId, number>(); // nodeId → index in dfsPath

  for (const id of Object.keys(nodes)) {
    color.set(id, WHITE);
  }

  function dfs(startId: NodeId): void {
    // We simulate recursion with an explicit stack of frames.
    // Each frame: { id, neighborIndex } – how far we've iterated through neighbors.
    type Frame = { id: NodeId; neighbors: NodeId[]; ni: number };
    const stack: Frame[] = [];

    color.set(startId, GRAY);
    dfsPath.push(startId);
    pathIndex.set(startId, dfsPath.length - 1);
    stack.push({ id: startId, neighbors: getNeighbors(nodes[startId], nodes), ni: 0 });

    while (stack.length > 0) {
      const frame = stack[stack.length - 1];

      if (frame.ni < frame.neighbors.length) {
        const neighborId = frame.neighbors[frame.ni++];
        const c = color.get(neighborId) ?? WHITE;

        if (c === WHITE) {
          // Tree edge – recurse
          color.set(neighborId, GRAY);
          dfsPath.push(neighborId);
          pathIndex.set(neighborId, dfsPath.length - 1);
          stack.push({
            id: neighborId,
            neighbors: getNeighbors(nodes[neighborId], nodes),
            ni: 0,
          });
        } else if (c === GRAY) {
          // Back edge → cycle detected!
          // Mark every node from the ancestor up to the current frame as cycle participants.
          const cycleStart = pathIndex.get(neighborId) ?? 0;
          for (let i = cycleStart; i < dfsPath.length; i++) {
            cycleNodeSet.add(dfsPath[i]);
          }
        }
        // BLACK: cross or forward edge – no cycle from this edge
      } else {
        // Done with this node – pop and mark BLACK
        color.set(frame.id, BLACK);
        pathIndex.delete(frame.id);
        dfsPath.pop();
        stack.pop();
      }
    }
  }

  for (const id of Object.keys(nodes)) {
    if ((color.get(id) ?? WHITE) === WHITE) {
      dfs(id);
    }
  }

  return {
    hasCycle: cycleNodeSet.size > 0,
    cycleNodes: Array.from(cycleNodeSet),
  };
}
