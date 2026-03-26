import { SimulationStep } from '../types';

interface SimulatePanelProps {
  steps: SimulationStep[];
  onClose: () => void;
}

export default function SimulatePanel({ steps, onClose }: SimulatePanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: 'rgba(8,8,20,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 48px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.35)', boxShadow: '0 0 12px rgba(16,185,129,0.2)' }}
            >
              <span className="text-green-400 text-sm">▶</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Logic Simulation Trace</h2>
              <p className="text-[10px] text-slate-500">DFS traversal · {steps.length} node{steps.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="btn-press w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors text-lg"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >×</button>
        </div>

        {/* Steps */}
        <ol className="max-h-96 overflow-y-auto px-5 py-4 space-y-2.5">
          {steps.map((step, i) => (
            <li key={step.nodeId}
              className="flex items-start gap-3 animate-slide-right"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Step number */}
              <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5"
                style={{
                  background: step.via === 'link'
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.15))'
                    : 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.25))',
                  border: step.via === 'link' ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(99,102,241,0.4)',
                  color: step.via === 'link' ? '#fcd34d' : '#a5b4fc',
                }}
              >{i + 1}</div>

              {/* Content */}
              <div className="flex-1 rounded-xl px-4 py-3 min-w-0 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(99,102,241,0.2)',
                      border: '1px solid rgba(99,102,241,0.35)',
                      color: '#a5b4fc',
                    }}
                  >{step.label}</span>
                  {step.via === 'link' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d' }}
                    >⇢ via link</span>
                  )}
                  {i === 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}
                    >root</span>
                  )}
                </div>
                <p className="text-sm">
                  <span className="text-slate-500 font-mono text-xs">IF </span>
                  <span className="text-slate-200 font-mono">{step.condition}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}
        >
          <p className="text-[11px] text-slate-600">
            Nodes reachable from root · depth-first order
          </p>
          <button onClick={onClose}
            className="btn-press text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}
          >Close</button>
        </div>
      </div>
    </div>
  );
}
