import { get, set } from './store.js';

// Command pattern: every change is an object with do() and undo().
const LIMIT = 20;
export const hist = { undo: [], redo: [], onChange: () => {} };

export function run(cmd) {
  cmd.do();
  hist.undo.push(cmd);
  if (hist.undo.length > LIMIT) hist.undo.shift();
  hist.redo = [];
  hist.onChange(cmd.label);
}
export function undo() {
  const cmd = hist.undo.pop();
  if (!cmd) return;
  cmd.undo(); hist.redo.push(cmd); hist.onChange('Undid: ' + cmd.label);
}
export function redo() {
  const cmd = hist.redo.pop();
  if (!cmd) return;
  cmd.do(); hist.undo.push(cmd); hist.onChange('Redid: ' + cmd.label);
}

export const addTask = (task) => ({
  label: `Added "${task.title}"`,
  do: () => set([...get(), task]),
  undo: () => set(get().filter((t) => t.id !== task.id))
});

export const removeTask = (task) => {
  let index = 0;
  return {
    label: `Deleted "${task.title}"`,
    do: () => { index = get().findIndex((t) => t.id === task.id); set(get().filter((t) => t.id !== task.id)); },
    undo: () => { const list = [...get()]; list.splice(index, 0, task); set(list); }
  };
};

export const updateTask = (id, patch, label = 'Edited a task') => {
  let before = {};
  return {
    label,
    do: () => set(get().map((t) => {
      if (t.id !== id) return t;
      before = Object.fromEntries(Object.keys(patch).map((k) => [k, t[k]]));
      return { ...t, ...patch };
    })),
    undo: () => set(get().map((t) => (t.id === id ? { ...t, ...before } : t)))
  };
};

export const moveTask = (id, beforeId) => {
  let oldOrder = [];
  const title = get().find((t) => t.id === id)?.title ?? '';
  return {
    label: `Moved "${title}"`,
    do: () => {
      oldOrder = get().map((t) => t.id);
      const moved = get().find((t) => t.id === id);
      const rest = get().filter((t) => t.id !== id);
      const at = beforeId ? rest.findIndex((t) => t.id === beforeId) : rest.length;
      rest.splice(at < 0 ? rest.length : at, 0, moved);
      set(rest);
    },
    undo: () => { const byId = new Map(get().map((t) => [t.id, t])); set(oldOrder.map((i) => byId.get(i)).filter(Boolean)); }
  };
};
