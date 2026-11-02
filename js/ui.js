import { highlight } from './utils.js';
import { run, updateTask, removeTask, moveTask } from './commands.js';

const list = document.querySelector('#list');
const today = new Date().toISOString().slice(0, 10);

export function render(tasks, state) {
  list.replaceChildren(...tasks.map((t) => item(t, state)));
  list.dataset.manual = String(state.sort === 'manual');
  document.querySelector('#empty').hidden = tasks.length > 0;
  document.querySelector('#drag-hint').hidden = state.sort !== 'manual';
}

function el(tag, props = {}, ...kids) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...kids);
  return node;
}

function item(t, state) {
  const li = el('li', { className: 'task' + (t.done ? ' done' : ''), draggable: state.sort === 'manual' });
  li.dataset.id = t.id;

  const check = el('input', { type: 'checkbox', checked: t.done });
  check.setAttribute('aria-label', `Mark "${t.title}" as done`);
  check.onchange = () => run(updateTask(t.id, { done: check.checked }, `${check.checked ? 'Completed' : 'Reopened'} "${t.title}"`));

  const title = el('span', { className: 'title' }, highlight(t.title, state.q));
  title.ondblclick = () => edit(title, t);

  const badge = el('span', { className: `badge p-${t.priority}` }, t.priority);
  const due = t.due ? el('span', { className: 'due' + (t.due < today && !t.done ? ' overdue' : '') }, 'Due ' + t.due) : '';

  const editBtn = el('button', { className: 'icon', type: 'button' }, 'Edit');
  editBtn.setAttribute('aria-label', `Edit "${t.title}"`);
  editBtn.onclick = () => edit(title, t);
  const delBtn = el('button', { className: 'icon', type: 'button' }, 'Delete');
  delBtn.setAttribute('aria-label', `Delete "${t.title}"`);
  delBtn.onclick = () => run(removeTask(t));

  li.append(check, title, badge, due, editBtn, delBtn);
  return li;
}

function edit(span, t) {
  const input = el('input', { className: 'edit', value: t.title, maxLength: 120 });
  input.setAttribute('aria-label', 'Edit task title');
  span.replaceWith(input);
  input.focus(); input.select();
  let finished = false;
  const finish = (save) => {
    if (finished) return;
    finished = true;
    const value = input.value.trim();
    if (save && value && value !== t.title) run(updateTask(t.id, { title: value }, `Renamed "${t.title}"`));
    else input.replaceWith(span);
  };
  input.onkeydown = (e) => { if (e.key === 'Enter') finish(true); if (e.key === 'Escape') finish(false); };
  input.onblur = () => finish(true);
}

// HTML5 Drag and Drop reordering
export function initDnd() {
  let dragId = null;
  const clear = () => list.querySelectorAll('.dragging,.over-before,.over-after').forEach((n) => n.classList.remove('dragging', 'over-before', 'over-after'));
  const isLower = (e, li) => { const r = li.getBoundingClientRect(); return e.clientY > r.top + r.height / 2; };

  list.addEventListener('dragstart', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    dragId = li.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
    li.classList.add('dragging');
  });
  list.addEventListener('dragover', (e) => {
    if (!dragId) return;
    e.preventDefault();
    list.querySelectorAll('.over-before,.over-after').forEach((n) => n.classList.remove('over-before', 'over-after'));
    const li = e.target.closest('li');
    if (li && li.dataset.id !== dragId) li.classList.add(isLower(e, li) ? 'over-after' : 'over-before');
  });
  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const li = e.target.closest('li');
    if (!li || !dragId || li.dataset.id === dragId) return;
    const beforeId = isLower(e, li) ? (li.nextElementSibling?.dataset.id ?? null) : li.dataset.id;
    if (beforeId !== dragId) run(moveTask(dragId, beforeId));
  });
  list.addEventListener('dragend', () => { dragId = null; clear(); });
}
