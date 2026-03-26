import { useEffect } from 'react';

interface Shortcuts {
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useKeyboardShortcuts({ onUndo, onRedo, onExport, canUndo, canRedo }: Shortcuts) {
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      if (e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        onUndo();
      } else if ((e.key === 'y' || (e.key === 'z' && e.shiftKey)) && canRedo) {
        e.preventDefault();
        onRedo();
      } else if (e.key === 'e') {
        e.preventDefault();
        onExport();
      }
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onUndo, onRedo, onExport, canUndo, canRedo]);
}
