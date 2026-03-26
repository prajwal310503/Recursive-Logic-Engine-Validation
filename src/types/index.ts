// ─── Core Graph Types ────────────────────────────────────────────────────────

export type NodeId = string;

/**
 * A single logic node in the directed graph.
 * The graph is stored in a flat, normalised map (Record<NodeId, LogicNode>)
 * rather than as a nested tree. This gives O(1) lookups and makes cross-node
 * references (links) trivial to represent without duplication.
 */
export interface LogicNode {
  id: NodeId;
  /** Human-readable auto-label, e.g. "Node 3" */
  label: string;
  /** The condition text entered by the user */
  condition: string;
  /** Ordered list of child node IDs (tree edges) */
  children: NodeId[];
  /** Optional cross-link to another node (non-tree edge that can create cycles) */
  linkedTo: NodeId | null;
  /** Parent in the tree (null for root) */
  parentId: NodeId | null;
}

// ─── Graph State ─────────────────────────────────────────────────────────────

export interface GraphState {
  /** Flat normalised map of all nodes */
  nodes: Record<NodeId, LogicNode>;
  /** ID of the root node (null when the tree is empty) */
  rootId: NodeId | null;
  /** IDs of nodes that participate in a cycle (derived, recomputed on every mutation) */
  cycleNodes: NodeId[];
  /** True when at least one cycle exists */
  hasCycle: boolean;
  /** Monotonic counter used for labelling nodes */
  nodeCounter: number;
}

// ─── Reducer Actions ─────────────────────────────────────────────────────────

export type GraphAction =
  | { type: 'INIT_ROOT' }
  | { type: 'ADD_CHILD'; parentId: NodeId }
  | { type: 'UPDATE_CONDITION'; id: NodeId; condition: string }
  | { type: 'DELETE_NODE'; id: NodeId }
  | { type: 'LINK_NODE'; fromId: NodeId; toId: NodeId }
  | { type: 'UNLINK_NODE'; id: NodeId };

// ─── Simulation ───────────────────────────────────────────────────────────────

export interface SimulationStep {
  nodeId: NodeId;
  label: string;
  condition: string;
  via: 'tree' | 'link';
}
