export type NodeId = string;

export interface LogicNode {
  id: NodeId;
  label: string;
  condition: string;
  children: NodeId[];
  linkedTo: NodeId | null;
  parentId: NodeId | null;
  collapsed: boolean;        // UI collapse state (persisted)
  note: string;              // Optional freeform note per node
}

export interface GraphState {
  nodes: Record<NodeId, LogicNode>;
  rootId: NodeId | null;
  cycleNodes: NodeId[];
  hasCycle: boolean;
  nodeCounter: number;
}

export type GraphAction =
  | { type: 'INIT_ROOT' }
  | { type: 'ADD_CHILD'; parentId: NodeId }
  | { type: 'UPDATE_CONDITION'; id: NodeId; condition: string }
  | { type: 'UPDATE_NOTE'; id: NodeId; note: string }
  | { type: 'DELETE_NODE'; id: NodeId }
  | { type: 'LINK_NODE'; fromId: NodeId; toId: NodeId }
  | { type: 'UNLINK_NODE'; id: NodeId }
  | { type: 'TOGGLE_COLLAPSE'; id: NodeId }
  | { type: 'DUPLICATE_NODE'; id: NodeId }
  | { type: 'IMPORT_STATE'; payload: GraphState };

// History wrapper
export interface HistoryState {
  past: GraphState[];
  present: GraphState;
  future: GraphState[];
}

export interface SimulationStep {
  nodeId: NodeId;
  label: string;
  condition: string;
  via: 'tree' | 'link';
  depth: number;
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  crossLinks: number;
  maxDepth: number;
  cycleCount: number;
  collapsedCount: number;
  nodesWithCondition: number;
}
