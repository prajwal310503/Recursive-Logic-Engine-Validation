import React, { useState, useCallback, memo } from 'react';
import {
  ChevronDown, ChevronRight, Plus, Share2, Copy, X,
  FileText, AlertTriangle, Search, GitBranch,
} from 'lucide-react';
import { NodeId } from '../types';
import { useGraph } from '../store/graphContext';
import LinkModal from './LinkModal';

interface NodeCardProps {
  nodeId: NodeId;
  depth: number;
  searchQuery: string;
}

// Depth 0-4 cycles through these accent colours
const ACCENTS = [
  { pill: '#6366f1', pillBg: 'rgba(99,102,241,0.12)',  pillBorder: 'rgba(99,102,241,0.3)',  text: '#a5b4fc', track: 'rgba(99,102,241,0.2)'  },
  { pill: '#8b5cf6', pillBg: 'rgba(139,92,246,0.12)',  pillBorder: 'rgba(139,92,246,0.3)',  text: '#c4b5fd', track: 'rgba(139,92,246,0.2)'  },
  { pill: '#06b6d4', pillBg: 'rgba(6,182,212,0.1)',    pillBorder: 'rgba(6,182,212,0.25)',  text: '#67e8f9', track: 'rgba(6,182,212,0.18)'  },
  { pill: '#10b981', pillBg: 'rgba(16,185,129,0.1)',   pillBorder: 'rgba(16,185,129,0.25)', text: '#6ee7b7', track: 'rgba(16,185,129,0.18)' },
  { pill: '#f59e0b', pillBg: 'rgba(245,158,11,0.1)',   pillBorder: 'rgba(245,158,11,0.25)', text: '#fcd34d', track: 'rgba(245,158,11,0.18)' },
];

const NodeCard = memo(function NodeCard({ nodeId, depth, searchQuery }: NodeCardProps) {
  const { state, dispatch } = useGraph();
  const node = state.nodes[nodeId];
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const isCycle = state.cycleNodes.includes(nodeId);
  const isRoot  = state.rootId === nodeId;
  const accent  = isCycle
    ? { pill: '#ef4444', pillBg: 'rgba(239,68,68,0.12)', pillBorder: 'rgba(239,68,68,0.35)', text: '#fca5a5', track: 'rgba(239,68,68,0.25)' }
    : ACCENTS[depth % ACCENTS.length];

  const isMatch = searchQuery.trim().length > 0 && node && (
    node.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.note.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCondition = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: 'UPDATE_CONDITION', id: nodeId, condition: e.target.value }), [dispatch, nodeId]);
  const handleNote = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) =>
    dispatch({ type: 'UPDATE_NOTE', id: nodeId, note: e.target.value }), [dispatch, nodeId]);
  const handleAddChild  = useCallback(() => dispatch({ type: 'ADD_CHILD', parentId: nodeId }), [dispatch, nodeId]);
  const handleDelete    = useCallback(() => dispatch({ type: 'DELETE_NODE', id: nodeId }), [dispatch, nodeId]);
  const handleUnlink    = useCallback(() => dispatch({ type: 'UNLINK_NODE', id: nodeId }), [dispatch, nodeId]);
  const handleCollapse  = useCallback(() => dispatch({ type: 'TOGGLE_COLLAPSE', id: nodeId }), [dispatch, nodeId]);
  const handleDuplicate = useCallback(() => dispatch({ type: 'DUPLICATE_NODE', id: nodeId }), [dispatch, nodeId]);

  if (!node) return null;

  const linkedNode  = node.linkedTo ? state.nodes[node.linkedTo] : null;
  const hasChildren = node.children.length > 0;

  /* ─── border colour ─── */
  const borderColor = isMatch
    ? 'rgba(245,158,11,0.5)'
    : isCycle
      ? 'rgba(239,68,68,0.45)'
      : `${accent.pill}33`;

  return (
    <>
      {/* ── Floating badge (cycle / search match) ── */}
      {(isCycle || isMatch) && (
        <div className="flex mb-1" style={{ paddingLeft: 4 }}>
          {isCycle && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-red-200 animate-pulse"
              style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}
            ><AlertTriangle size={9} /> CYCLE DETECTED</span>
          )}
          {isMatch && !isCycle && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-200"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)' }}
            ><Search size={9} /> Match</span>
          )}
        </div>
      )}

      {/* ── Card ── */}
      <div
        className="rounded-2xl overflow-hidden transition-colors duration-200"
        style={{
          background: isMatch
            ? 'rgba(30,24,4,0.97)'
            : isCycle
              ? 'rgba(30,5,5,0.97)'
              : 'rgba(12,12,24,0.96)',
          border: `1px solid ${borderColor}`,
          boxShadow: isCycle
            ? '0 0 0 1px rgba(239,68,68,0.1), 0 2px 12px rgba(0,0,0,0.5)'
            : '0 2px 12px rgba(0,0,0,0.4)',
        }}
      >
        {/* Coloured top stripe — depth indicator, always short */}
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${accent.pill}, ${accent.pill}44)` }} />

        <div className="px-4 py-3">

          {/* ── Row 1: label + meta + actions ── */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Collapse toggle */}
            {hasChildren && (
              <button
                onClick={handleCollapse}
                className="btn-press shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: accent.pillBg, border: `1px solid ${accent.pillBorder}`, color: accent.text }}
                title={node.collapsed ? 'Expand' : 'Collapse'}
              >
                {node.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
            )}

            {/* Label */}
            <span
              className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: accent.pillBg, border: `1px solid ${accent.pillBorder}`, color: accent.text }}
            >{node.label}</span>

            {/* Depth pill */}
            {depth > 0 && (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-mono"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.07)' }}
              >L{depth}</span>
            )}

            {isRoot && (
              <span className="shrink-0 text-[10px] uppercase tracking-widest" style={{ color: '#475569' }}>Root</span>
            )}

            {hasChildren && (
              <span className="shrink-0 flex items-center gap-1 text-[10px]" style={{ color: '#475569' }}>
                <GitBranch size={9} />
                {node.collapsed
                  ? `${node.children.length} hidden`
                  : `${node.children.length} child${node.children.length !== 1 ? 'ren' : ''}`}
              </span>
            )}

            <div className="flex-1 min-w-0" />

            {/* Note toggle */}
            <button
              onClick={() => setShowNote(v => !v)}
              className="btn-press shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: (node.note || showNote) ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                color: node.note ? '#a5b4fc' : '#334155',
                border: `1px solid ${node.note ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
              }}
              title="Note"
            ><FileText size={12} /></button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="btn-press shrink-0 flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-colors"
              style={{ color: '#334155', background: 'transparent', border: '1px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
              title={isRoot ? 'Reset' : 'Delete'}
            >
              <X size={12} />
              <span className="hidden sm:inline">{isRoot ? 'Reset' : 'Delete'}</span>
            </button>
          </div>

          {/* ── Row 2: IF condition input ── */}
          <div className="relative mt-2.5">
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black font-mono pointer-events-none select-none"
              style={{ color: accent.text, letterSpacing: '0.04em' }}
            >IF</div>
            <input
              type="text"
              value={node.condition}
              onChange={handleCondition}
              placeholder="Enter condition…"
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-600 outline-none transition-colors ${isCycle ? 'input-glow-red' : 'input-glow'}`}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${isCycle ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)'}`,
              }}
            />
          </div>

          {/* ── Note ── */}
          {showNote && (
            <textarea
              value={node.note}
              onChange={handleNote}
              placeholder="Add a note…"
              rows={2}
              className="w-full mt-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 placeholder-slate-600 outline-none resize-none input-glow animate-fade-in"
              style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(99,102,241,0.15)' }}
            />
          )}

          {/* ── Cross-link badge ── */}
          {linkedNode && (
            <div className="flex items-center gap-2 mt-2.5 px-3 py-2 rounded-xl text-xs"
              style={{
                background: isCycle ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.06)',
                border: `1px solid ${isCycle ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.18)'}`,
              }}
            >
              <Share2 size={11} style={{ color: isCycle ? '#f87171' : '#fbbf24', flexShrink: 0 }} />
              <span className="flex-1 min-w-0 truncate" style={{ color: isCycle ? '#fca5a5' : '#fcd34d' }}>
                <span className="font-semibold">{linkedNode.label}</span>
                {linkedNode.condition && <span className="opacity-40"> · {linkedNode.condition}</span>}
              </span>
              <button onClick={handleUnlink} className="btn-press shrink-0" style={{ color: '#475569' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
              ><X size={10} /></button>
            </div>
          )}

          {/* ── Action buttons ── */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button onClick={handleAddChild}
              className="btn-press flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: accent.pillBg, border: `1px solid ${accent.pillBorder}`, color: accent.text }}
            ><Plus size={11} /> Add Child</button>

            <button onClick={() => setShowLinkModal(true)}
              className="btn-press flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', color: '#fcd34d' }}
            ><Share2 size={11} /> {node.linkedTo ? 'Change Link' : 'Link to…'}</button>

            {!isRoot && (
              <button onClick={handleDuplicate}
                className="btn-press flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }}
              ><Copy size={11} /> Duplicate</button>
            )}
          </div>

        </div>
      </div>

      {showLinkModal && <LinkModal fromId={nodeId} onClose={() => setShowLinkModal(false)} />}
    </>
  );
});

export default NodeCard;
