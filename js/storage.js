import { uid } from './utils.js';

const KEY = 'taskmanager';
export const CURRENT_VERSION = 3;

// Each step upgrades data from version N to N+1.
const migrations = {
  // v1 was a bare array of { text, done }
  1: (tasks) => tasks.map((t) => ({ id: t.id || uid(), title: t.text ?? t.title ?? 'Untitled', done: !!t.done, priority: 'medium' })),
  // v2 had no due date or creation time
  2: (tasks) => tasks.map((t, i) => ({ ...t, due: t.due || '', createdAt: t.createdAt || Date.now() - i }))
};

export function migrate(raw) {
  let version = Array.isArray(raw) ? 1 : raw.version;
  let tasks = Array.isArray(raw) ? raw : raw.tasks;
  while (version < CURRENT_VERSION) { tasks = migrations[version](tasks); version++; }
  return tasks;
}

const seed = () => [
  ['Plan the week', 'high'], ['Review pull requests', 'medium'], ['Write project report', 'high'], ['Book dentist appointment', 'low']
].map(([title, priority], i) => ({ id: uid(), title, done: false, priority, due: '', createdAt: Date.now() - i }));

export function load() {
  try {
    const text = localStorage.getItem(KEY);
    if (text === null) return seed();
    const tasks = migrate(JSON.parse(text));
    save(tasks); // store upgraded data right away
    return tasks;
  } catch (err) {
    console.warn('Could not read saved tasks, starting fresh.', err);
    return [];
  }
}

export function save(tasks) {
  try { localStorage.setItem(KEY, JSON.stringify({ version: CURRENT_VERSION, tasks })); }
  catch (err) { console.warn('Could not save tasks.', err); }
}
