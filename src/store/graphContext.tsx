import React, {
  createContext, useContext, useReducer, useMemo, useCallback, useEffect,
} from 'react';
import { GraphState, GraphAction, HistoryState } from '../types';
import { graphReducer, initialState } from './graphReducer';

// ─── LocalStorage ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'lfm-graph-v1';

function loadSaved(): GraphState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GraphState) : null;
  } catch {
    return null;
  }
}

function persist(state: GraphState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota */ }
}

// ─── History Reducer ──────────────────────────────────────────────────────────

// Actions that are purely cosmetic — don't push to undo history
const TRANSIENT: Set<GraphAction['type']> = new Set([
  'UPDATE_CONDITION',
  'UPDATE_NOTE',
  'TOGGLE_COLLAPSE',
]);

type HistoryAction = GraphAction | { type: 'UNDO' } | { type: 'REDO' };

const MAX_HISTORY = 50;

function historyReducer(history: HistoryState, action: HistoryAction): HistoryState {
  if (action.type === 'UNDO') {
    if (history.past.length === 0) return history;
    const prev = history.past[history.past.length - 1];
    return {
      past: history.past.slice(0, -1),
      present: prev,
      future: [history.present, ...history.future],
    };
  }

  if (action.type === 'REDO') {
    if (history.future.length === 0) return history;
    const next = history.future[0];
    return {
      past: [...history.past, history.present],
      present: next,
      future: history.future.slice(1),
    };
  }

  // Normal graph action
  const newPresent = graphReducer(history.present, action as GraphAction);
  if (newPresent === history.present) return history; // no structural change

  const isTransient = TRANSIENT.has(action.type);
  return {
    past: isTransient
      ? history.past
      : [...history.past.slice(-MAX_HISTORY), history.present],
    present: newPresent,
    future: isTransient ? history.future : [],
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface GraphContextValue {
  state: GraphState;
  dispatch: React.Dispatch<GraphAction>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const GraphContext = createContext<GraphContextValue | null>(null);

function buildInitialHistory(): HistoryState {
  const saved = loadSaved();
  return { past: [], present: saved ?? initialState, future: [] };
}

export function GraphProvider({ children }: { children: React.ReactNode }) {
  const [history, histDispatch] = useReducer(historyReducer, undefined, buildInitialHistory);

  // Persist on every present change
  useEffect(() => {
    persist(history.present);
  }, [history.present]);

  const dispatch = useCallback(
    (action: GraphAction) => histDispatch(action),
    []
  );
  const undo = useCallback(() => histDispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => histDispatch({ type: 'REDO' }), []);

  const value = useMemo<GraphContextValue>(
    () => ({
      state: history.present,
      dispatch,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
    }),
    [history, dispatch, undo, redo]
  );

  return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>;
}

export function useGraph(): GraphContextValue {
  const ctx = useContext(GraphContext);
  if (!ctx) throw new Error('useGraph must be used inside <GraphProvider>');
  return ctx;
}
