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
  { border: '#6366f1', glow: 'rgba(99,102,241,0.35)',  badge: 'rgba(99,102,241,0.18)',  badgeBorder: 'rgba(99,102,241,0.4)',  text: '#a5b4fc' },
  { border: '#8b5cf6', glow: 'rgba(139,92,246,0.35)',  badge: 'rgba(139,92,246,0.18)',  badgeBorder: 'rgba(139,92,246,0.4)',  text: '#c4b5fd' },
  { border: '#06b6d4', glow: 'rgba(6,182,212,0.3)',    badge: 'rgba(6,182,212,0.15)',   badgeBorder: 'rgba(6,182,212,0.35)',  text: '#67e8f9' },
  { border: '#10b981', glow: 'rgba(16,185,129,0.3)',   badge: 'rgba(16,185,129,0.15)',  badgeBorder: 'rgba(16,185,129,0.35)', text: '#6ee7b7' },
  { border: '#f59e0b', glow: 'rgba(245,158,11,0.3)',   badge: 'rgba(245,158,11,0.15)',  badgeBorder: 'rgba(245,158,11,0.35)', text: '#fcd34d' },
];

const NodeCard = memo(function NodeCard({ nodeId, depth, searchQuery }: NodeCardProps) {
  const { state, dispatch } = useGraph();
  const node = state.nodes[nodeId];
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const isCycle  = state.cycleNodes.includes(nodeId);
  const isRoot   = state.rootId === nodeId;
  const accent   = isCycle
    ? { border: '#ef4444', glow: 'rgba(239,68,68,0.5)', badge: 'rgba(239,68,68,0.18)', badgeBorder: 'rgba(239,68,68,0.45)', text: '#fca5a5' }
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

  return (
    <div className="relative animate-fade-up">
      <div className="relative rounded-2xl transition-all duration-300"
        style={{
          background: isMatch ? 'rgba(245,158,11,0.1)' : isCycle ? 'rgba(127,29,29,0.25)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isMatch ? 'rgba(245,158,11,0.5)' : isCycle ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.07)'}`,
          backdropFilter: 'blur(16px)',
          boxShadow: isCycle
            ? '0 0 32px rgba(239,68,68,0.2), 0 8px 32px rgba(0,0,0,0.4)'
            : isMatch ? '0 0 24px rgba(245,158,11,0.15)' : '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Left accent bar */}
        <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
          style={{ background: `linear-gradient(180deg, ${accent.border}, ${accent.border}66)`, boxShadow: `0 0 8px ${accent.glow}` }}
        />

        {isCycle && (
          <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-red-200 animate-pulse"
            style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}
          ><AlertTriangle size={9} /> CYCLE</div>
        )}
        {isMatch && !isCycle && (
          <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-200"
            style={{ background: 'rgba(245,158,11,0.3)', border: '1px solid rgba(245,158,11,0.5)' }}
          ><Search size={9} /> Match</div>
        )}

        {/* ── Card body ── */}
        <div className="p-3 sm:p-5 pl-4 sm:pl-6">

          {/* Header row */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {hasChildren && (
              <button onClick={handleCollapse}
                className="btn-press w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0"
                style={{ background: accent.badge, border: `1px solid ${accent.badgeBorder}`, color: accent.text }}
                title={node.collapsed ? 'Expand children' : 'Collapse children'}
              >
                {node.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: accent.badge, border: `1px solid ${accent.badgeBorder}`, color: accent.text, boxShadow: `0 0 8px ${accent.glow}` }}
            >
              <span className="truncate max-w-[120px] sm:max-w-none">{node.label}</span>
            </div>

            {isRoot && <span className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:inline">Root</span>}

            {hasChildren && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full text-slate-500 shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >{node.collapsed ? `${node.children.length}↓` : `${node.children.length} child${node.children.length > 1 ? 'ren' : ''}`}</span>
            )}

            <div className="flex-1" />

            {/* Note toggle */}
            <button onClick={() => setShowNote(v => !v)}
              className="btn-press w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0"
              style={{
                background: (node.note || showNote) ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: node.note ? '#a5b4fc' : '#475569',
                border: `1px solid ${node.note ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
              title="Toggle note"
            ><FileText size={11} /></button>

            {/* Delete */}
            <button onClick={handleDelete}
              className="btn-press flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-all duration-200 hover:bg-red-950/30 shrink-0"
              title={isRoot ? 'Reset' : 'Delete'}
            ><X size={11} /><span className="hidden sm:inline">{isRoot ? 'Reset' : 'Delete'}</span></button>
          </div>

          {/* IF input */}
          <div className="relative mb-3">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold font-mono pointer-events-none"
              style={{ color: accent.text }}
            >IF</div>
            <input type="text" value={node.condition} onChange={handleCondition}
              placeholder="Enter condition…"
              className={`w-full pl-9 pr-3 py-2.5 sm:py-3 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 ${isCycle ? 'input-glow-red' : 'input-glow'}`}
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${isCycle ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.08)'}` }}
            />
          </div>

          {/* Note textarea */}
          {showNote && (
            <textarea value={node.note} onChange={handleNote}
              placeholder="Add a note or description…"
              rows={2}
              className="w-full mb-3 px-3 py-2 rounded-xl text-xs text-slate-300 placeholder-slate-600 outline-none transition-all duration-200 resize-none input-glow animate-fade-in"
              style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(99,102,241,0.2)' }}
            />
          )}

          {/* Cross-link badge */}
          {linkedNode && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl text-xs"
              style={{
                background: isCycle ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${isCycle ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.25)'}`,
              }}
            >
              <Share2 size={12} style={{ color: isCycle ? '#f87171' : '#fbbf24', flexShrink: 0 }} />
              <span className="flex-1 min-w-0 truncate" style={{ color: isCycle ? '#fca5a5' : '#fcd34d' }}>
                → <span className="font-bold">{linkedNode.label}</span>
                <span className="opacity-60 hidden sm:inline">{linkedNode.condition && ` · ${linkedNode.condition}`}</span>
              </span>
              <button onClick={handleUnlink} className="ml-auto text-slate-500 hover:text-white transition-colors btn-press shrink-0">
                <X size={11} />
              </button>
            </div>
          )}

          {/* Action buttons — icon-only on mobile, icon+text on sm+ */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button onClick={handleAddChild}
              className="btn-press flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ background: accent.badge, border: `1px solid ${accent.badgeBorder}`, color: accent.text }}
              title="Add Child"
            ><Plus size={12} /><span className="hidden sm:inline">Add Child</span></button>

            <button onClick={() => setShowLinkModal(true)}
              className="btn-press flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d' }}
              title={node.linkedTo ? 'Change Link' : 'Link to…'}
            ><Share2 size={12} /><span className="hidden sm:inline">{node.linkedTo ? 'Change Link' : 'Link to…'}</span></button>

            {!isRoot && (
              <button onClick={handleDuplicate}
                className="btn-press flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all duration-200 hover:scale-105"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}
                title="Duplicate"
              ><Copy size={12} /><span className="hidden sm:inline">Duplicate</span></button>
            )}
          </div>
        </div>

        {/* ── Children ── */}
        {hasChildren && !node.collapsed && (
          <div
            className="mb-3 sm:mb-4 pl-2 sm:pl-5 border-l-2 border-dashed space-y-2 sm:space-y-3"
            style={{
              marginLeft: '6px',
              marginRight: '4px',
              borderColor: isCycle ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)',
            }}
          >
            {node.children.map((childId) => (
              <div key={childId} className="pt-3 sm:pt-4 relative">
                <div
                  className="absolute border-t-2 border-dashed"
                  style={{
                    top: '26px',
                    left: '-8px',
                    width: '8px',
                    borderColor: isCycle ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)',
                  }}
                />
                <NodeCard nodeId={childId} depth={depth + 1} searchQuery={searchQuery} />
              </div>
            ))}
          </div>
        )}

        {/* Collapsed pill */}
        {hasChildren && node.collapsed && (
          <div className="mx-2 sm:mx-5 mb-3 sm:mb-4">
            <button onClick={handleCollapse}
              className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-all flex items-center justify-center gap-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)' }}
            >▸ {node.children.length} node{node.children.length > 1 ? 's' : ''} hidden — tap to expand</button>
          </div>
        )}
      </div>

      {showLinkModal && <LinkModal fromId={nodeId} onClose={() => setShowLinkModal(false)} />}
    </div>
  );
});

export default NodeCard;
