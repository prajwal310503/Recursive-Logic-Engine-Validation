import { GraphState } from '../types';

export function exportToJSON(state: GraphState): void {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `logic-flow-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(): Promise<GraphState> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string) as GraphState;
          if (!parsed.nodes || !('rootId' in parsed)) {
            throw new Error('Invalid Logic Flow Mapper file');
          }
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}
