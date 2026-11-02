// Filter, sort and search state lives in the URL, e.g. ?status=active&sort=priority&q=report
const DEFAULTS = { status: 'all', priority: 'all', sort: 'manual', q: '' };
const ALLOWED = {
  status: ['all', 'active', 'done'],
  priority: ['all', 'high', 'medium', 'low'],
  sort: ['manual', 'created', 'priority', 'due', 'title']
};

export function read() {
  const params = new URLSearchParams(location.search);
  const state = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) {
    const value = params.get(key);
    if (value && (key === 'q' || ALLOWED[key].includes(value))) state[key] = value;
  }
  return state;
}

export function write(state, push = true) {
  const params = new URLSearchParams();
  for (const key of Object.keys(DEFAULTS)) if (state[key] !== DEFAULTS[key]) params.set(key, state[key]);
  const url = params.toString() ? '?' + params : location.pathname;
  window.history[push ? 'pushState' : 'replaceState'](null, '', url);
}

const rank = { high: 0, medium: 1, low: 2 };
const comparers = {
  created: (a, b) => b.createdAt - a.createdAt,
  priority: (a, b) => rank[a.priority] - rank[b.priority],
  due: (a, b) => (a.due || '9999').localeCompare(b.due || '9999'),
  title: (a, b) => a.title.localeCompare(b.title)
};

export function visible(tasks, s) {
  const q = s.q.toLowerCase();
  const list = tasks.filter((t) =>
    (s.status === 'all' || (s.status === 'done') === t.done) &&
    (s.priority === 'all' || t.priority === s.priority) &&
    t.title.toLowerCase().includes(q));
  return comparers[s.sort] ? list.sort(comparers[s.sort]) : list;
}
