import { useCallback } from 'react';
import { NodeId } from '../types';
import { useGraph } from '../store/graphContext';
import { getSubtreeIds } from '../utils/graphUtils';

interface LinkModalProps {
  fromId: NodeId;
  onClose: () => void;
}

export default function LinkModal({ fromId, onClose }: LinkModalProps) {
  const { state, dispatch } = useGraph();
  const { nodes } = state;

  const subtree = getSubtreeIds(fromId, nodes);
  const allOther = Object.values(nodes).filter((n) => n.id !== fromId);

  const handleSelect = useCallback(
    (toId: NodeId) => {
      dispatch({ type: 'LINK_NODE', fromId, toId });
      onClose();
    },
    [dispatch, fromId, onClose]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-scale-in shadow-glass-lg"
        style={{
          background: 'rgba(10,10,25,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.35)' }}
            >⇢</div>
            <div>
              <h2 className="text-sm font-bold text-white">Link to a Node</h2>
              <p className="text-[10px] text-slate-500">Select the target node</p>
            </div>
          </div>
          <button onClick={onClose}
            className="btn-press w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors text-lg"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >×</button>
        </div>

        {/* Node list */}
        <ul className="max-h-72 overflow-y-auto">
          {allOther.length === 0 && (
            <li className="px-5 py-8 text-slate-500 text-sm text-center">
              No other nodes exist yet.
            </li>
          )}
          {allOther.map((node) => {
            const willCycle = subtree.has(node.id);
            return (
              <li key={node.id}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <button
                  className="w-full text-left px-5 py-3 flex items-center gap-3 transition-all duration-150 group"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => handleSelect(node.id)}
                >
                  <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={willCycle
                      ? { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }
                      : { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }
                    }
                  >{node.label}</span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate font-mono">
                      {node.condition || <span className="italic text-slate-600 font-sans">no condition</span>}
                    </p>
                    {willCycle && (
                      <p className="text-[11px] text-red-400 mt-0.5">⚠ Will create a cycle</p>
                    )}
                  </div>

                  <span className="text-slate-600 group-hover:text-slate-400 transition-colors text-base shrink-0">→</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-[11px] text-slate-600">
            Cycles are allowed but immediately flagged. Link creates a directed edge.
          </p>
        </div>
      </div>
    </div>
  );
}
