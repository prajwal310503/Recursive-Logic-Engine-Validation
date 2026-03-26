import React, { useState, useCallback, memo } from 'react';
import {
  ChevronDown, ChevronRight, Plus, Share2, Copy, X,
  FileText, AlertTriangle, Search,
} from 'lucide-react';
import { NodeId } from '../types';
import { useGraph } from '../store/graphContext';
import LinkModal from './LinkModal';

interface NodeCardProps {
  nodeId: NodeId;
  depth: number;
  searchQuery: string;
}

const DEPTH_ACCENTS = [
  { border: '#6366f1', glow: 'rgba(99,102,241,0.2)',  badge: 'rgba(99,102,241,0.15)',  badgeBorder: 'rgba(99,102,241,0.35)',  text: '#a5b4fc' },
  { border: '#8b5cf6', glow: 'rgba(139,92,246,0.2)',  badge: 'rgba(139,92,246,0.15)',  badgeBorder: 'rgba(139,92,246,0.35)',  text: '#c4b5fd' },
  { border: '#06b6d4', glow: 'rgba(6,182,212,0.18)',  badge: 'rgba(6,182,212,0.12)',   badgeBorder: 'rgba(6,182,212,0.3)',    text: '#67e8f9' },
  { border: '#10b981', glow: 'rgba(16,185,129,0.18)', badge: 'rgba(16,185,129,0.12)',  badgeBorder: 'rgba(16,185,129,0.3)',   text: '#6ee7b7' },
  { border: '#f59e0b', glow: 'rgba(245,158,11,0.18)', badge: 'rgba(245,158,11,0.12)',  badgeBorder: 'rgba(245,158,11,0.3)',   text: '#fcd34d' },
];

const NodeCard = memo(function NodeCard({ nodeId, depth, searchQuery }: NodeCardProps) {
  const { state, dispatch } = useGraph();
  const node = state.nodes[nodeId];
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const isCycle  = state.cycleNodes.includes(nodeId);
  const isRoot   = state.rootId === nodeId;
  const accent   = isCycle
    ? { border: '#ef4444', glow: 'rgba(239,68,68,0.3)', badge: 'rgba(239,68,68,0.15)', badgeBorder: 'rgba(239,68,68,0.4)', text: '#fca5a5' }
    : DEPTH_ACCENTS[depth % DEPTH_ACCENTS.length];

  const isMatch = searchQuery.trim().length > 0 && node && (
    node.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.note.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCondition  = useCallback((e: React.ChangeEvent<HTMLInputElement>) => dispatch({ type: 'UPDATE_CONDITION', id: nodeId, condition: e.target.value }), [dispatch, nodeId]);
  const handleNote       = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => dispatch({ type: 'UPDATE_NOTE', id: nodeId, note: e.target.value }), [dispatch, nodeId]);
  const handleAddChild   = useCallback(() => dispatch({ type: 'ADD_CHILD', parentId: nodeId }), [dispatch, nodeId]);
  const handleDelete     = useCallback(() => dispatch({ type: 'DELETE_NODE', id: nodeId }), [dispatch, nodeId]);
  const handleUnlink     = useCallback(() => dispatch({ type: 'UNLINK_NODE', id: nodeId }), [dispatch, nodeId]);
  const handleCollapse   = useCallback(() => dispatch({ type: 'TOGGLE_COLLAPSE', id: nodeId }), [dispatch, nodeId]);
  const handleDuplicate  = useCallback(() => dispatch({ type: 'DUPLICATE_NODE', id: nodeId }), [dispatch, nodeId]);

  if (!node) return null;

  const linkedNode  = node.linkedTo ? state.nodes[node.linkedTo] : null;
  const hasChildren = node.children.length > 0;

  // Cap indent: only first 3 levels add significant margin, deeper levels stay flat
  const childMarginLeft = depth >= 3 ? 2 : 10;

  return (
    <div className="relative animate-fade-up">
      <div
        className="relative rounded-2xl transition-all duration-300"
        style={{
          /* Solid opaque background — prevents bleed-through from behind */
          background: isMatch
            ? 'rgba(28,22,4,0.96)'
            : isCycle
              ? 'rgba(28,5,5,0.96)'
              : 'rgba(10,10,22,0.94)',
          border: `1px solid ${isMatch ? 'rgba(245,158,11,0.45)' : isCycle ? 'rgba(239,68,68,0.45)' : `${accent.border}22`}`,
          boxShadow: isCycle
            ? `0 0 20px rgba(239,68,68,0.15), inset 0 1px 0 rgba(255,255,255,0.04)`
            : isMatch
              ? '0 0 16px rgba(245,158,11,0.12)'
              : `inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
          style={{
            background: `linear-gradient(180deg, ${accent.border}, ${accent.border}55)`,
            boxShadow: `0 0 6px ${accent.glow}`,
          }}
        />

        {isCycle && (
          <div className="absolute -top-2.5 left-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-red-200 animate-pulse"
            style={{ background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.45)' }}
          ><AlertTriangle size={9} /> CYCLE</div>
        )}
        {isMatch && !isCycle && (
          <div className="absolute -top-2.5 left-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-200"
            style={{ background: 'rgba(245,158,11,0.25)', border: '1px solid rgba(245,158,11,0.45)' }}
          ><Search size={9} /> Match</div>
        )}

        {/* ── Card body ── */}
        <div className="p-3 sm:p-4 pl-4 sm:pl-5">

          {/* Header row */}
          <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
            {hasChildren && (
              <button onClick={handleCollapse}
                className="btn-press w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0"
                style={{ background: accent.badge, border: `1px solid ${accent.badgeBorder}`, color: accent.text }}
                title={node.collapsed ? 'Expand' : 'Collapse'}
              >
                {node.collapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
              </button>
            )}

            {/* Node label badge */}
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold truncate max-w-[140px] sm:max-w-[200px]"
              style={{ background: accent.badge, border: `1px solid ${accent.badgeBorder}`, color: accent.text }}
            >{node.label}</span>

            {isRoot && (
              <span className="text-[10px] text-slate-600 uppercase tracking-widest hidden sm:inline">Root</span>
            )}

            {hasChildren && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full text-slate-500 shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {node.collapsed ? `${node.children.length} hidden` : `${node.children.length}↓`}
              </span>
            )}

            <div className="flex-1 min-w-0" />

            {/* Note toggle */}
            <button
              onClick={() => setShowNote(v => !v)}
              className="btn-press w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0"
              style={{
                background: (node.note || showNote) ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                color: node.note ? '#a5b4fc' : '#475569',
                border: `1px solid ${node.note ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}
              title="Toggle note"
            ><FileText size={11} /></button>

            {/* Delete / Reset */}
            <button
              onClick={handleDelete}
              className="btn-press flex items-center gap-1 text-[11px] px-1.5 sm:px-2 py-1 rounded-lg shrink-0 transition-all duration-200"
              style={{ color: '#475569', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
              title={isRoot ? 'Reset' : 'Delete'}
            >
              <X size={11} />
              <span className="hidden sm:inline">{isRoot ? 'Reset' : 'Delete'}</span>
            </button>
          </div>

          {/* IF condition input */}
          <div className="relative mb-2.5">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold font-mono pointer-events-none select-none"
              style={{ color: accent.text }}
            >IF</div>
            <input
              type="text"
              value={node.condition}
              onChange={handleCondition}
              placeholder="Enter condition…"
              className={`w-full pl-8 pr-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 ${isCycle ? 'input-glow-red' : 'input-glow'}`}
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: `1px solid ${isCycle ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}`,
              }}
            />
          </div>

          {/* Note textarea */}
          {showNote && (
            <textarea
              value={node.note}
              onChange={handleNote}
              placeholder="Add a note…"
              rows={2}
              className="w-full mb-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 placeholder-slate-600 outline-none transition-all duration-200 resize-none input-glow animate-fade-in"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.18)' }}
            />
          )}

          {/* Cross-link badge */}
          {linkedNode && (
            <div className="flex items-center gap-2 mb-2.5 px-2.5 py-1.5 rounded-xl text-xs"
              style={{
                background: isCycle ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${isCycle ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)'}`,
              }}
            >
              <Share2 size={11} style={{ color: isCycle ? '#f87171' : '#fbbf24', flexShrink: 0 }} />
              <span className="flex-1 min-w-0 truncate" style={{ color: isCycle ? '#fca5a5' : '#fcd34d' }}>
                <span className="font-bold">{linkedNode.label}</span>
                <span className="opacity-50 hidden sm:inline">{linkedNode.condition && ` · ${linkedNode.condition}`}</span>
              </span>
              <button onClick={handleUnlink} className="ml-1 shrink-0 btn-press" style={{ color: '#475569' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
              ><X size={10} /></button>
            </div>
          )}

          {/* Action buttons — icon-only on mobile, icon + text on sm+ */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={handleAddChild}
              className="btn-press flex items-center gap-1 text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{ background: accent.badge, border: `1px solid ${accent.badgeBorder}`, color: accent.text }}
              title="Add Child"
            ><Plus size={11} /><span className="hidden sm:inline">Add Child</span></button>

            <button onClick={() => setShowLinkModal(true)}
              className="btn-press flex items-center gap-1 text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fcd34d' }}
              title={node.linkedTo ? 'Change Link' : 'Link to…'}
            ><Share2 size={11} /><span className="hidden sm:inline">{node.linkedTo ? 'Change Link' : 'Link to…'}</span></button>

            {!isRoot && (
              <button onClick={handleDuplicate}
                className="btn-press flex items-center gap-1 text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }}
                title="Duplicate"
              ><Copy size={11} /><span className="hidden sm:inline">Duplicate</span></button>
            )}
          </div>
        </div>

        {/* ── Children ── depth-capped indent so deep trees don't overflow */}
        {hasChildren && !node.collapsed && (
          <div
            className="mb-3 border-l border-dashed space-y-2"
            style={{
              marginLeft: `${childMarginLeft}px`,
              marginRight: depth >= 3 ? '2px' : '6px',
              paddingLeft: depth >= 3 ? '6px' : '10px',
              borderColor: isCycle ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.18)',
            }}
          >
            {node.children.map((childId) => (
              <div key={childId} className="pt-2 relative">
                <div
                  className="absolute border-t border-dashed"
                  style={{
                    top: '22px',
                    left: '-6px',
                    width: '6px',
                    borderColor: isCycle ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.18)',
                  }}
                />
                <NodeCard nodeId={childId} depth={depth + 1} searchQuery={searchQuery} />
              </div>
            ))}
          </div>
        )}

        {/* Collapsed pill */}
        {hasChildren && node.collapsed && (
          <div className="mx-2 mb-3">
            <button onClick={handleCollapse}
              className="w-full py-1.5 rounded-xl text-xs text-slate-600 hover:text-slate-400 transition-all flex items-center justify-center gap-2"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)' }}
            >▸ {node.children.length} node{node.children.length > 1 ? 's' : ''} hidden — tap to expand</button>
          </div>
        )}
      </div>

      {showLinkModal && <LinkModal fromId={nodeId} onClose={() => setShowLinkModal(false)} />}
    </div>
  );
});

export default NodeCard;
