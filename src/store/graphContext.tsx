import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { GraphState, GraphAction } from '../types';
import { graphReducer, initialState } from './graphReducer';

interface GraphContextValue {
  state: GraphState;
  dispatch: React.Dispatch<GraphAction>;
}

const GraphContext = createContext<GraphContextValue | null>(null);

export function GraphProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(graphReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>;
}

export function useGraph(): GraphContextValue {
  const ctx = useContext(GraphContext);
  if (!ctx) throw new Error('useGraph must be used inside <GraphProvider>');
  return ctx;
}
