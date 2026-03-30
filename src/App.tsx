import { useState, useCallback } from 'react';
import {
  Play, AlertTriangle, Undo2, Redo2, Download, Upload,
  BarChart2, Search, ArrowLeft, Plus, Share2, Hexagon,
  GitBranch, RefreshCw,
} from 'lucide-react';
import { useGraph } from './store/graphContext';
import FlatTree from './components/FlatTree';
import SimulatePanel from './components/SimulatePanel';
import StatsPanel from './components/StatsPanel';
import { simulateFlow } from './utils/graphUtils';
import { computeStats } from './utils/graphStats';
import { exportToJSON, importFromJSON } from './utils/exportImport';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { SimulationStep } from './types';

export default function App() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useGraph();
  const { rootId, nodes, hasCycle, cycleNodes } = state;

  const [simSteps,   setSimSteps]   = useState<SimulationStep[] | null>(null);
  const [showStats,  setShowStats]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [importError, setImportError] = useState('');

  const nodeCount = Object.keys(nodes).length;
  const stats = computeStats(state);

  const handleSimulate = useCallback(() => {
    if (!rootId || hasCycle) return;
    setSimSteps(simulateFlow(rootId, nodes));
  }, [rootId, nodes, hasCycle]);

  const handleExport = useCallback(() => {
    if (rootId) exportToJSON(state);
  }, [state, rootId]);

  const handleImport = useCallback(async () => {
    try {
      setImportError('');
      const imported = await importFromJSON();
      dispatch({ type: 'IMPORT_STATE', payload: imported });
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Import failed');
      setTimeout(() => setImportError(''), 3000);
    }
  }, [dispatch]);

  useKeyboardShortcuts({ onUndo: undo, onRedo: redo, onExport: handleExport, canUndo, canRedo });

  const btnBase = 'btn-press flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200';

  return (
    <div className="min-h-screen">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(5,5,15,0.90)', backdropFilter: 'blur(20px)' }}
      >
        <div className="h-[2px] w-full"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #6366f1 30%, #8b5cf6 50%, #6366f1 70%, transparent 100%)' }}
        />
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 flex-wrap">

          {/* Back */}
          {rootId && (
            <button onClick={() => dispatch({ type: 'DELETE_NODE', id: rootId })}
              className={`${btnBase} shrink-0`}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
              title="Back to home"
            ><ArrowLeft size={13} /><span className="hidden sm:inline">Home</span></button>
          )}

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="relative w-8 h-8 shrink-0">
              <div className="absolute inset-0 rounded-xl bg-indigo-600 blur-md opacity-60" />
              <div className="relative w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              ><Hexagon size={16} strokeWidth={2} /></div>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold leading-none truncate" style={{
                background: 'linear-gradient(135deg, #a5b4fc, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Logic Flow Mapper</h1>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5 tracking-wider uppercase hidden sm:block">Recursive If-Then Engine</p>
            </div>
          </div>

          {/* Search */}
          {rootId && (
            <div className="relative hidden sm:block">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nodes…"
                className="pl-7 pr-3 py-1.5 rounded-xl text-xs text-slate-300 placeholder-slate-600 outline-none transition-all duration-200 w-28 focus:w-40 input-glow"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          )}

          {/* Toolbar buttons */}
          {rootId && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Undo */}
              <button onClick={undo} disabled={!canUndo}
                className={`${btnBase} w-8 h-8 p-0 justify-center`}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: canUndo ? '#94a3b8' : '#334155', cursor: canUndo ? 'pointer' : 'not-allowed' }}
                title="Undo (Ctrl+Z)"
              ><Undo2 size={14} /></button>

              {/* Redo */}
              <button onClick={redo} disabled={!canRedo}
                className={`${btnBase} w-8 h-8 p-0 justify-center`}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: canRedo ? '#94a3b8' : '#334155', cursor: canRedo ? 'pointer' : 'not-allowed' }}
                title="Redo (Ctrl+Y)"
              ><Redo2 size={14} /></button>

              {/* Export */}
              <button onClick={handleExport}
                className={`${btnBase}`}
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
                title="Export JSON (Ctrl+E)"
              ><Download size={13} /><span className="hidden sm:inline">Export</span></button>

              {/* Import */}
              <button onClick={handleImport}
                className={`${btnBase}`}
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
                title="Import JSON"
              ><Upload size={13} /><span className="hidden sm:inline">Import</span></button>

              {/* Stats */}
              <button onClick={() => setShowStats(true)}
                className={`${btnBase}`}
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}
                title="Graph statistics"
              ><BarChart2 size={13} /><span className="hidden sm:inline">{nodeCount}</span></button>
            </div>
          )}

          {/* Simulate */}
          <button onClick={handleSimulate} disabled={!rootId || hasCycle}
            className={`btn-press relative flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 overflow-hidden shrink-0`}
            style={!rootId || hasCycle
              ? { background: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.06)', cursor: 'not-allowed' }
              : { background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', boxShadow: '0 0 24px rgba(16,185,129,0.4)', border: '1px solid rgba(16,185,129,0.3)' }
            }
          >
            {rootId && !hasCycle && <span className="absolute inset-0 shimmer-bg pointer-events-none" />}
            {hasCycle
              ? <><AlertTriangle size={14} /> Cycle</>
              : <><Play size={13} fill="white" /> Simulate</>
            }
          </button>
        </div>

        {/* Mobile search bar */}
        {rootId && (
          <div className="sm:hidden px-3 pb-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nodes…"
                className="w-full pl-7 pr-3 py-1.5 rounded-xl text-xs text-slate-300 placeholder-slate-600 outline-none transition-all duration-200 input-glow"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>
        )}

        {/* Import error toast */}
        {importError && (
          <div className="px-4 pb-2 animate-fade-in">
            <div className="max-w-5xl mx-auto text-xs text-red-300 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            ><AlertTriangle size={12} className="inline mr-1" />{importError}</div>
          </div>
        )}
      </header>

      {/* ── Cycle Alert Banner ── */}
      {hasCycle && (
        <div className="animate-fade-in border-b border-red-500/20"
          style={{ background: 'linear-gradient(135deg, rgba(127,29,29,0.45), rgba(69,10,10,0.25))' }}
        >
          <div className="max-w-5xl mx-auto px-5 py-3 flex items-start gap-3">
            <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
            ><AlertTriangle size={14} color="#f87171" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-red-300 font-semibold text-sm">Invalid Logic Loop Detected</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
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
      <main className="max-w-5xl mx-auto px-2 sm:px-5 py-6 sm:py-10 overflow-x-hidden">
        {!rootId
          ? <EmptyState onInit={() => dispatch({ type: 'INIT_ROOT' })} onImport={handleImport} />
          : <FlatTree rootId={rootId} searchQuery={searchQuery} />
        }
      </main>

      {simSteps  && <SimulatePanel steps={simSteps} onClose={() => setSimSteps(null)} />}
      {showStats && <StatsPanel stats={stats} onClose={() => setShowStats(false)} />}
    </div>
  );
}

function EmptyState({ onInit, onImport }: { onInit: () => void; onImport: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      <div className="relative mb-8 animate-float">
        <div className="absolute inset-0 rounded-3xl blur-2xl opacity-50"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, #8b5cf6 100%)' }}
        />
        <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)' }}
        ><Hexagon size={48} color="#818cf8" strokeWidth={1.5} /></div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-3">Logic Flow Mapper</h2>
      <p className="text-slate-400 text-sm mb-2 max-w-sm leading-relaxed">
        Build recursive If-Then logic trees with infinite nesting, cross-node links, and real-time cycle detection.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <button onClick={onInit}
          className="btn-press relative px-8 py-3.5 rounded-2xl text-sm font-bold text-white overflow-hidden transition-all duration-200 hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 32px rgba(99,102,241,0.5)' }}
        >
          <span className="absolute inset-0 shimmer-bg pointer-events-none" />
          <span className="relative flex items-center gap-2"><Plus size={14} /> Create Root Node</span>
        </button>

        <button onClick={onImport}
          className="btn-press flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
        ><Upload size={14} /> Import JSON</button>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left">
        {[
          { Icon: GitBranch,  color: '#6366f1', shadow: 'rgba(99,102,241,0.3)', title: 'Infinite Nesting',  desc: 'Add children to any depth with collapse/expand for large trees.' },
          { Icon: Share2,     color: '#f59e0b', shadow: 'rgba(245,158,11,0.3)', title: 'Cross-Node Links', desc: 'Link any node to model non-linear logic. Cycles are detected instantly.' },
          { Icon: RefreshCw,  color: '#10b981', shadow: 'rgba(16,185,129,0.3)', title: 'Undo / Redo',      desc: 'Full history with Ctrl+Z / Ctrl+Y. Export & import as JSON.' },
        ].map(({ Icon, color, shadow, title, desc }) => (
          <div key={title}
            className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${color}20`, border: `1px solid ${color}40`, boxShadow: `0 0 12px ${shadow}` }}
            ><Icon size={18} color={color} /></div>
            <p className="text-sm font-semibold text-white mb-1.5">{title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
