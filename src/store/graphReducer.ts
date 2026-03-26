import { GraphState, GraphAction, LogicNode, NodeId } from '../types';
import { generateId } from '../utils/idGenerator';
import { detectCycles } from '../utils/cycleDetection';
import { getSubtreeIds } from '../utils/graphUtils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeNode(id: NodeId, parentId: NodeId | null, label: string): LogicNode {
  return { id, label, condition: '', children: [], linkedTo: null, parentId };
}

/** Recompute cycle info and return the derived slice of state. */
function recomputeCycles(
  nodes: Record<NodeId, LogicNode>
): Pick<GraphState, 'cycleNodes' | 'hasCycle'> {
  const { hasCycle, cycleNodes } = detectCycles(nodes);
  return { hasCycle, cycleNodes };
}

// ─── Initial State ────────────────────────────────────────────────────────────

export const initialState: GraphState = {
  nodes: {},
  rootId: null,
  cycleNodes: [],
  hasCycle: false,
  nodeCounter: 0,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    /* ── Create the root node ── */
    case 'INIT_ROOT': {
      const id = generateId();
      const counter = state.nodeCounter + 1;
      const nodes = { [id]: makeNode(id, null, `Node ${counter}`) };
      return { ...state, nodes, rootId: id, nodeCounter: counter, ...recomputeCycles(nodes) };
    }

    /* ── Add a child to an existing node ── */
    case 'ADD_CHILD': {
      const parent = state.nodes[action.parentId];
      if (!parent) return state;

      const id = generateId();
      const counter = state.nodeCounter + 1;
      const newNode = makeNode(id, action.parentId, `Node ${counter}`);
      const updatedParent: LogicNode = { ...parent, children: [...parent.children, id] };
      const nodes = { ...state.nodes, [action.parentId]: updatedParent, [id]: newNode };

      return { ...state, nodes, nodeCounter: counter, ...recomputeCycles(nodes) };
    }

    /* ── Update the condition text of a node (no structural change → no cycle recheck) ── */
    case 'UPDATE_CONDITION': {
      const node = state.nodes[action.id];
      if (!node) return state;
      const nodes = { ...state.nodes, [action.id]: { ...node, condition: action.condition } };
      return { ...state, nodes };
    }

    /* ── Delete a node and its entire subtree ── */
    case 'DELETE_NODE': {
      if (action.id === state.rootId) return initialState; // delete root → reset

      const toDelete = getSubtreeIds(action.id, state.nodes);
      const newNodes: Record<NodeId, LogicNode> = {};

      for (const [id, node] of Object.entries(state.nodes)) {
        if (toDelete.has(id)) continue;
        newNodes[id] = {
          ...node,
          // Remove deleted children from parent's list
          children: node.children.filter((cid) => !toDelete.has(cid)),
          // Clear cross-links that pointed into the deleted subtree
          linkedTo: node.linkedTo && toDelete.has(node.linkedTo) ? null : node.linkedTo,
        };
      }

      return { ...state, nodes: newNodes, ...recomputeCycles(newNodes) };
    }

    /* ── Create a cross-link from one node to another ── */
    case 'LINK_NODE': {
      const node = state.nodes[action.fromId];
      if (!node || !state.nodes[action.toId]) return state;

      const nodes = { ...state.nodes, [action.fromId]: { ...node, linkedTo: action.toId } };
      return { ...state, nodes, ...recomputeCycles(nodes) };
    }

    /* ── Remove a cross-link ── */
    case 'UNLINK_NODE': {
      const node = state.nodes[action.id];
      if (!node || !node.linkedTo) return state;

      const nodes = { ...state.nodes, [action.id]: { ...node, linkedTo: null } };
      return { ...state, nodes, ...recomputeCycles(nodes) };
    }

    default:
      return state;
  }
}
