import { useState, useCallback } from 'react';
import { useGraph } from './store/graphContext';
import NodeCard from './components/NodeCard';
import SimulatePanel from './components/SimulatePanel';
import { simulateFlow } from './utils/graphUtils';
import { SimulationStep } from './types';

export default function App() {
  const { state, dispatch } = useGraph();
  const { rootId, nodes, hasCycle, cycleNodes } = state;
  const [simSteps, setSimSteps] = useState<SimulationStep[] | null>(null);

  const handleSimulate = useCallback(() => {
    if (!rootId || hasCycle) return;
    setSimSteps(simulateFlow(rootId, nodes));
  }, [rootId, nodes, hasCycle]);

  const nodeCount = Object.keys(nodes).length;

  return (
    <div className="min-h-screen">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(5,5,15,0.88)', backdropFilter: 'blur(20px)' }}
      >
        {/* Gradient accent line at top */}
        <div className="h-[2px] w-full"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #6366f1 30%, #8b5cf6 50%, #6366f1 70%, transparent 100%)' }}
        />
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center gap-4">
          {/* Back button — visible only when tree exists */}
          {rootId && (
            <button
              onClick={() => dispatch({ type: 'DELETE_NODE', id: rootId })}
              className="btn-press shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
              title="Back to home"
            >
              <span className="text-sm">←</span>
              <span className="hidden sm:inline">Home</span>
            </button>
          )}

          {/* Logo */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-9 h-9 shrink-0">
              <div className="absolute inset-0 rounded-xl bg-indigo-600 blur-md opacity-60" />
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >⬡</div>
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none" style={{
                background: 'linear-gradient(135deg, #a5b4fc, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Logic Flow Mapper</h1>
              <p className="text-[10px] text-slate-500 leading-none mt-1 tracking-wider uppercase">Recursive If-Then Engine</p>
            </div>
          </div>

          {/* Stats */}
          {nodeCount > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full text-slate-400"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-white font-semibold">{nodeCount}</span> node{nodeCount !== 1 ? 's' : ''}
              </span>
              {hasCycle && (
                <span className="text-xs px-3 py-1 rounded-full text-red-300 font-semibold animate-pulse"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                >⚠ {cycleNodes.length} in cycle</span>
              )}
            </div>
          )}

          {/* Simulate button */}
          <button
            onClick={handleSimulate}
            disabled={!rootId || hasCycle}
            className="btn-press relative flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 overflow-hidden"
            style={!rootId || hasCycle
              ? { background: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.06)', cursor: 'not-allowed' }
              : { background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', boxShadow: '0 0 24px rgba(16,185,129,0.4)', border: '1px solid rgba(16,185,129,0.3)' }
            }
          >
            {rootId && !hasCycle && <span className="absolute inset-0 shimmer-bg pointer-events-none" />}
            {hasCycle ? <><span>⚠</span><span>Cycle Detected</span></> : <><span>▶</span><span>Simulate Logic</span></>}
          </button>
        </div>
      </header>

      {/* ── Cycle Alert Banner ── */}
      {hasCycle && (
        <div className="animate-fade-in border-b border-red-500/20"
          style={{ background: 'linear-gradient(135deg, rgba(127,29,29,0.45), rgba(69,10,10,0.25))' }}
        >
          <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-red-400 text-base mt-0.5"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
            >⚠</div>
            <div className="flex-1 min-w-0">
              <p className="text-red-300 font-semibold text-sm">Invalid Logic Loop Detected</p>
              <p className="text-red-400/70 text-xs mt-0.5">
                Remove the looping link to re-enable simulation.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {cycleNodes.map((id, i) => (
                  <span key={id} className="flex items-center gap-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-red-200"
                      style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)' }}
                    >{nodes[id]?.label ?? id}</span>
                    {i < cycleNodes.length - 1 && <span className="text-red-600 text-xs">→</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-5 py-10">
        {!rootId ? <EmptyState onInit={() => dispatch({ type: 'INIT_ROOT' })} />
          : (
            <div className="animate-fade-up">
              <NodeCard nodeId={rootId} depth={0} />
            </div>
          )}
      </main>

      {simSteps && <SimulatePanel steps={simSteps} onClose={() => setSimSteps(null)} />}
    </div>
  );
}

function EmptyState({ onInit }: { onInit: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      <div className="relative mb-8 animate-float">
        <div className="absolute inset-0 rounded-3xl blur-2xl opacity-50"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, #8b5cf6 100%)' }}
        />
        <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)' }}
        >⬡</div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-3">Logic Flow Mapper</h2>
      <p className="text-slate-400 text-sm mb-2 max-w-sm leading-relaxed">
        Build recursive If-Then logic trees with infinite nesting, cross-node links, and real-time cycle detection.
      </p>

      <button onClick={onInit}
        className="btn-press mt-8 relative px-8 py-3.5 rounded-2xl text-sm font-bold text-white overflow-hidden transition-all duration-200 hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 32px rgba(99,102,241,0.5)' }}
      >
        <span className="absolute inset-0 shimmer-bg pointer-events-none" />
        <span className="relative">+ Create Root Node</span>
      </button>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left">
        {[
          { icon: '⬡', color: '#6366f1', shadow: 'rgba(99,102,241,0.3)', title: 'Infinite Nesting', desc: 'Add children to any depth. Each node can branch into its own subtree.' },
          { icon: '⇢', color: '#f59e0b', shadow: 'rgba(245,158,11,0.3)', title: 'Cross-Node Links', desc: 'Link any node to another to model non-linear logic flows.' },
          { icon: '⚠', color: '#ef4444', shadow: 'rgba(239,68,68,0.3)', title: 'Cycle Detection', desc: 'DFS-based engine detects loops instantly and flags every node in the cycle.' },
        ].map((f) => (
          <div key={f.title}
            className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
              style={{ background: `${f.color}20`, border: `1px solid ${f.color}40`, boxShadow: `0 0 12px ${f.shadow}` }}
            >{f.icon}</div>
            <p className="text-sm font-semibold text-white mb-1.5">{f.title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
