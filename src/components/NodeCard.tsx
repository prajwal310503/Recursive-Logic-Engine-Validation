import React, { useState, useCallback, memo } from 'react';
import { NodeId } from '../types';
import { useGraph } from '../store/graphContext';
import LinkModal from './LinkModal';

interface NodeCardProps {
  nodeId: NodeId;
  depth: number;
}

const DEPTH_ACCENTS = [
  { border: '#6366f1', glow: 'rgba(99,102,241,0.35)', badge: 'rgba(99,102,241,0.2)', badgeBorder: 'rgba(99,102,241,0.4)', text: '#a5b4fc' },
  { border: '#8b5cf6', glow: 'rgba(139,92,246,0.35)', badge: 'rgba(139,92,246,0.2)', badgeBorder: 'rgba(139,92,246,0.4)', text: '#c4b5fd' },
  { border: '#06b6d4', glow: 'rgba(6,182,212,0.3)',   badge: 'rgba(6,182,212,0.15)',  badgeBorder: 'rgba(6,182,212,0.35)',  text: '#67e8f9' },
  { border: '#10b981', glow: 'rgba(16,185,129,0.3)',  badge: 'rgba(16,185,129,0.15)', badgeBorder: 'rgba(16,185,129,0.35)', text: '#6ee7b7' },
  { border: '#f59e0b', glow: 'rgba(245,158,11,0.3)',  badge: 'rgba(245,158,11,0.15)', badgeBorder: 'rgba(245,158,11,0.35)', text: '#fcd34d' },
];

const NodeCard = memo(function NodeCard({ nodeId, depth }: NodeCardProps) {
  const { state, dispatch } = useGraph();
  const node = state.nodes[nodeId];
  const [showLinkModal, setShowLinkModal] = useState(false);

  const isCycle = state.cycleNodes.includes(nodeId);
  const isRoot  = state.rootId === nodeId;
  const accent  = isCycle
    ? { border: '#ef4444', glow: 'rgba(239,68,68,0.5)', badge: 'rgba(239,68,68,0.2)', badgeBorder: 'rgba(239,68,68,0.45)', text: '#fca5a5' }
    : DEPTH_ACCENTS[depth % DEPTH_ACCENTS.length];

  const handleConditionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'UPDATE_CONDITION', id: nodeId, condition: e.target.value }),
    [dispatch, nodeId]
  );
  const handleAddChild  = useCallback(() => dispatch({ type: 'ADD_CHILD', parentId: nodeId }), [dispatch, nodeId]);
  const handleDelete    = useCallback(() => dispatch({ type: 'DELETE_NODE', id: nodeId }),     [dispatch, nodeId]);
  const handleUnlink    = useCallback(() => dispatch({ type: 'UNLINK_NODE', id: nodeId }),     [dispatch, nodeId]);

  if (!node) return null;

  const linkedNode = node.linkedTo ? state.nodes[node.linkedTo] : null;

  return (
    <div className="relative animate-fade-up">
      {/* Card */}
      <div
        className={`relative rounded-2xl transition-all duration-300 ${isCycle ? 'animate-cycle-pulse' : ''}`}
        style={{
          background: isCycle
            ? 'rgba(127,29,29,0.25)'
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isCycle ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.07)'}`,
          backdropFilter: 'blur(16px)',
          boxShadow: isCycle
            ? `0 0 32px rgba(239,68,68,0.25), 0 8px 32px rgba(0,0,0,0.4)`
            : `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Left accent bar */}
        <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
          style={{ background: `linear-gradient(180deg, ${accent.border}, ${accent.border}88)`, boxShadow: `0 0 8px ${accent.glow}` }}
        />

        {/* Cycle badge */}
        {isCycle && (
          <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-red-200 animate-pulse"
            style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}
          >
            ⚠ CYCLE DETECTED
          </div>
        )}

        <div className="p-5 pl-6">
          {/* Header row */}
          <div className="flex items-center gap-2.5 mb-4">
            {/* Node label badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: accent.badge, border: `1px solid ${accent.badgeBorder}`, color: accent.text, boxShadow: `0 0 8px ${accent.glow}` }}
            >
              {isRoot && <span className="text-[10px]">◉</span>}
              <span>{node.label}</span>
            </div>
            {isRoot && (
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Root</span>
            )}
            <div className="flex-1" />
            {/* Delete button */}
            <button onClick={handleDelete}
              className="btn-press flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-all duration-200 hover:bg-red-950/30"
            >
              <span>✕</span>
              <span>{isRoot ? 'Reset' : 'Delete'}</span>
            </button>
          </div>

          {/* IF condition input */}
          <div className="relative mb-4">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono pointer-events-none"
              style={{ color: accent.text }}
            >IF</div>
            <input
              type="text"
              value={node.condition}
              onChange={handleConditionChange}
              placeholder="Enter your condition…"
              className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 ${isCycle ? 'input-glow-red' : 'input-glow'}`}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${isCycle ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.08)'}`,
              }}
            />
          </div>

          {/* Cross-link badge */}
          {linkedNode && (
            <div className="flex items-center gap-2.5 mb-4 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200"
              style={{
                background: isCycle ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${isCycle ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.25)'}`,
              }}
            >
              <span className="text-base" style={{ color: isCycle ? '#f87171' : '#fbbf24' }}>⇢</span>
              <span style={{ color: isCycle ? '#fca5a5' : '#fcd34d' }}>
                Linked to <span className="font-bold">{linkedNode.label}</span>
                {linkedNode.condition && <span className="opacity-60"> · {linkedNode.condition}</span>}
              </span>
              <button onClick={handleUnlink}
                className="ml-auto text-slate-500 hover:text-white transition-colors text-sm btn-press"
                title="Remove link"
              >✕</button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleAddChild}
              className="btn-press flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ background: `${accent.badge}`, border: `1px solid ${accent.badgeBorder}`, color: accent.text, boxShadow: `0 0 8px ${accent.glow}` }}
            >
              <span className="text-sm font-bold">+</span> Add Child
            </button>

            <button onClick={() => setShowLinkModal(true)}
              className="btn-press flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: node.linkedTo ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)',
                color: '#fcd34d',
              }}
            >
              <span>⇢</span> {node.linkedTo ? 'Change Link' : 'Link to…'}
            </button>
          </div>
        </div>

        {/* Children */}
        {node.children.length > 0 && (
          <div className="mx-4 mb-4 pl-5 border-l-2 border-dashed space-y-3 connector-normal"
            style={{ borderColor: isCycle ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)' }}
          >
            {node.children.map((childId) => (
              <div key={childId} className="pt-4 relative">
                {/* Horizontal tick */}
                <div className="absolute top-7 -left-[21px] w-5 border-t-2 border-dashed"
                  style={{ borderColor: isCycle ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)' }}
                />
                <NodeCard nodeId={childId} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>

      {showLinkModal && <LinkModal fromId={nodeId} onClose={() => setShowLinkModal(false)} />}
    </div>
  );
});

export default NodeCard;
