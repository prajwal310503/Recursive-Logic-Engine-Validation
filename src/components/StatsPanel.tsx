import { X, BarChart2, Hexagon, ArrowRight, Share2, AlignEndHorizontal, RefreshCw, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';
import { GraphStats } from '../types';

interface StatsPanelProps {
  stats: GraphStats;
  onClose: () => void;
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

export default function StatsPanel({ stats, onClose }: StatsPanelProps) {
  const health = stats.cycleCount === 0
    ? { label: 'Healthy', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' }
    : { label: 'Cycle Detected', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' };

  const completeness = stats.totalNodes === 0
    ? 0
    : Math.round((stats.nodesWithCondition / stats.totalNodes) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: 'rgba(8,8,20,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)' }}
            >
              <BarChart2 size={15} color="#a5b4fc" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Graph Statistics</h2>
              <p className="text-[10px] text-slate-500">Real-time analysis of your logic tree</p>
            </div>
          </div>
          <button onClick={onClose}
            className="btn-press w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Health status */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
            style={{ background: health.bg, border: `1px solid ${health.border}` }}
          >
            <div className="flex items-center gap-2">
              {stats.cycleCount === 0
                ? <CheckCircle2 size={15} color="#10b981" />
                : <AlertTriangle size={15} color="#ef4444" />
              }
              <span className="text-sm font-semibold" style={{ color: health.color }}>{health.label}</span>
            </div>
            <span className="text-xs text-slate-400">
              {stats.cycleCount === 0 ? 'Ready to simulate' : `${stats.cycleCount} nodes in cycle`}
            </span>
          </div>
        </div>

        {/* Stat grid */}
        <div className="px-5 pb-4 grid grid-cols-2 gap-3">
          <StatCard label="Total Nodes"  value={stats.totalNodes}     color="#a5b4fc" icon={<Hexagon size={13} />} />
          <StatCard label="Total Edges"  value={stats.totalEdges}     color="#67e8f9" icon={<ArrowRight size={13} />} />
          <StatCard label="Cross Links"  value={stats.crossLinks}     color="#fcd34d" icon={<Share2 size={13} />} />
          <StatCard label="Max Depth"    value={stats.maxDepth}       color="#6ee7b7" icon={<AlignEndHorizontal size={13} />} />
          <StatCard label="Cycle Nodes"  value={stats.cycleCount}     color={stats.cycleCount ? '#f87171' : '#4ade80'} icon={<RefreshCw size={13} />} />
          <StatCard label="Collapsed"    value={stats.collapsedCount} color="#c4b5fd" icon={<ChevronRight size={13} />} />
        </div>

        {/* Completeness bar */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Condition completeness</span>
            <span className="text-xs font-bold text-slate-300">{completeness}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completeness}%`,
                background: completeness === 100
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              }}
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5">
            {stats.nodesWithCondition} of {stats.totalNodes} nodes have conditions
          </p>
        </div>

        {/* Shortcuts */}
        <div className="px-5 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
          <p className="text-[10px] text-slate-600 mb-2 uppercase tracking-wider">Keyboard shortcuts</p>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'Ctrl+Z', label: 'Undo' },
              { key: 'Ctrl+Y', label: 'Redo' },
              { key: 'Ctrl+E', label: 'Export' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-1.5 text-[11px]">
                <kbd className="px-2 py-0.5 rounded-md font-mono text-slate-300"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                >{key}</kbd>
                <span className="text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
