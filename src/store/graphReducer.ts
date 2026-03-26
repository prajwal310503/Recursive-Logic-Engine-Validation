import { GraphState, GraphAction, LogicNode, NodeId } from '../types';
import { generateId } from '../utils/idGenerator';
import { detectCycles } from '../utils/cycleDetection';
import { getSubtreeIds } from '../utils/graphUtils';

function makeNode(id: NodeId, parentId: NodeId | null, label: string): LogicNode {
  return { id, label, condition: '', children: [], linkedTo: null, parentId, collapsed: false, note: '' };
}

function recomputeCycles(nodes: Record<NodeId, LogicNode>): Pick<GraphState, 'cycleNodes' | 'hasCycle'> {
  const { hasCycle, cycleNodes } = detectCycles(nodes);
  return { hasCycle, cycleNodes };
}

export const initialState: GraphState = {
  nodes: {},
  rootId: null,
  cycleNodes: [],
  hasCycle: false,
  nodeCounter: 0,
};

export function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {

    case 'INIT_ROOT': {
      const id = generateId();
      const counter = state.nodeCounter + 1;
      const nodes = { [id]: makeNode(id, null, `Node ${counter}`) };
      return { ...state, nodes, rootId: id, nodeCounter: counter, ...recomputeCycles(nodes) };
    }

    case 'ADD_CHILD': {
      const parent = state.nodes[action.parentId];
      if (!parent) return state;
      const id = generateId();
      const counter = state.nodeCounter + 1;
      const newNode = makeNode(id, action.parentId, `Node ${counter}`);
      // Auto-expand parent when adding a child
      const updatedParent: LogicNode = { ...parent, children: [...parent.children, id], collapsed: false };
      const nodes = { ...state.nodes, [action.parentId]: updatedParent, [id]: newNode };
      return { ...state, nodes, nodeCounter: counter, ...recomputeCycles(nodes) };
    }

    case 'UPDATE_CONDITION': {
      const node = state.nodes[action.id];
      if (!node) return state;
      const nodes = { ...state.nodes, [action.id]: { ...node, condition: action.condition } };
      return { ...state, nodes };
    }

    case 'UPDATE_NOTE': {
      const node = state.nodes[action.id];
      if (!node) return state;
      const nodes = { ...state.nodes, [action.id]: { ...node, note: action.note } };
      return { ...state, nodes };
    }

    case 'DELETE_NODE': {
      if (action.id === state.rootId) return initialState;
      const toDelete = getSubtreeIds(action.id, state.nodes);
      const newNodes: Record<NodeId, LogicNode> = {};
      for (const [id, node] of Object.entries(state.nodes)) {
        if (toDelete.has(id)) continue;
        newNodes[id] = {
          ...node,
          children: node.children.filter((cid) => !toDelete.has(cid)),
          linkedTo: node.linkedTo && toDelete.has(node.linkedTo) ? null : node.linkedTo,
        };
      }
      return { ...state, nodes: newNodes, ...recomputeCycles(newNodes) };
    }

    case 'LINK_NODE': {
      const node = state.nodes[action.fromId];
      if (!node || !state.nodes[action.toId]) return state;
      const nodes = { ...state.nodes, [action.fromId]: { ...node, linkedTo: action.toId } };
      return { ...state, nodes, ...recomputeCycles(nodes) };
    }

    case 'UNLINK_NODE': {
      const node = state.nodes[action.id];
      if (!node || !node.linkedTo) return state;
      const nodes = { ...state.nodes, [action.id]: { ...node, linkedTo: null } };
      return { ...state, nodes, ...recomputeCycles(nodes) };
    }

    case 'TOGGLE_COLLAPSE': {
      const node = state.nodes[action.id];
      if (!node) return state;
      const nodes = { ...state.nodes, [action.id]: { ...node, collapsed: !node.collapsed } };
      return { ...state, nodes };
    }

    case 'DUPLICATE_NODE': {
      const src = state.nodes[action.id];
      if (!src || !src.parentId) return state; // cannot duplicate root
      const parent = state.nodes[src.parentId];
      if (!parent) return state;

      const newId = generateId();
      const counter = state.nodeCounter + 1;
      const duplicate: LogicNode = {
        ...src,
        id: newId,
        label: `Node ${counter}`,
        children: [],       // duplicate is a leaf — no subtree copy
        linkedTo: null,
        collapsed: false,
      };
      const updatedParent: LogicNode = {
        ...parent,
        children: [...parent.children, newId],
      };
      const nodes = { ...state.nodes, [src.parentId]: updatedParent, [newId]: duplicate };
      return { ...state, nodes, nodeCounter: counter, ...recomputeCycles(nodes) };
    }

    case 'IMPORT_STATE': {
      const imported = action.payload;
      // Recompute cycles on import to ensure consistency
      const cycles = detectCycles(imported.nodes);
      return { ...imported, ...cycles };
    }

    default:
      return state;
  }
}
