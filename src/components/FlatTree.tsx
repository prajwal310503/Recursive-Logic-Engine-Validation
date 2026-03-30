import { useMemo, useState } from 'react';
import { useGraph } from '../store/graphContext';
import NodeCard from './NodeCard';
import { NodeId } from '../types';

const PAGE = 50;

type FlatItem =
  | { kind: 'node'; id: NodeId; depth: number }
  | { kind: 'more'; parentId: NodeId; depth: number; remaining: number; showMore: () => void };

interface Props {
  rootId: NodeId;
  searchQuery: string;
}

export default function FlatTree({ rootId, searchQuery }: Props) {
  const { state } = useGraph();
  // per-node visible child count
  const [pageMap, setPageMap] = useState<Record<NodeId, number>>({});

  const showMore = (id: NodeId) =>
    setPageMap(prev => ({ ...prev, [id]: (prev[id] ?? PAGE) + PAGE }));

  const items = useMemo<FlatItem[]>(() => {
    const result: FlatItem[] = [];

    function walk(id: NodeId, depth: number) {
      const node = state.nodes[id];
      if (!node) return;
      result.push({ kind: 'node', id, depth });
      if (node.collapsed) return;

      const visible = pageMap[id] ?? PAGE;
      node.children.slice(0, visible).forEach(cid => walk(cid, depth + 1));

      if (node.children.length > visible) {
        const remaining = node.children.length - visible;
        result.push({
          kind: 'more',
          parentId: id,
          depth: depth + 1,
          remaining,
          showMore: () => showMore(id),
        });
      }
    }

    walk(rootId, 0);
    return result;
    // pageMap intentionally not in deps — only structural changes matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootId, state.nodes, pageMap]);

  return (
    <div className="relative space-y-2">
      {items.map((item, i) => {
        // Absolute indent: never cumulative, caps at 5 levels deep visually
        const indent = Math.min(item.depth * 28, 140);

        if (item.kind === 'more') {
          return (
            <div key={`more-${item.parentId}-${i}`} style={{ marginLeft: indent }}>
              <button
                onClick={item.showMore}
                className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
              >
                + Show {Math.min(PAGE, item.remaining)} more ({item.remaining} remaining)
              </button>
            </div>
          );
        }

        return (
          <div key={item.id} style={{ marginLeft: indent }}>
            <NodeCard nodeId={item.id} depth={item.depth} searchQuery={searchQuery} />
          </div>
        );
      })}
    </div>
  );
}
