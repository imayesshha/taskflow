import * as store from './store.js';
import { hist, run, undo, redo, addTask } from './commands.js';
import { read, write, visible } from './query.js';
import { render, initDnd } from './ui.js';
import { initShortcuts } from './shortcuts.js';
import { debounce, uid } from './utils.js';

const $ = (s) => document.querySelector(s);
let state = read();
let toastTimer;

function announce(message) {
  $('#status').textContent = message;
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function paint() {
  const all = store.get();
  const shown = visible(all, state);
  render(shown, state);
  $('#count').textContent = `${shown.length} of ${all.length} tasks.`;
  $('#undo').disabled = !hist.undo.length;
  $('#redo').disabled = !hist.redo.length;
  $('#undo').title = `Undo (${hist.undo.length}/20)`;
}

function syncControls() {
  $('#search').value = state.q;
  for (const key of ['status', 'priority', 'sort']) $('#f-' + key).value = state[key];
}

function setState(patch, push = true) {
  state = { ...state, ...patch };
  write(state, push);
  paint();
}

for (const key of ['status', 'priority', 'sort']) $('#f-' + key).addEventListener('change', (e) => setState({ [key]: e.target.value }));
$('#search').addEventListener('input', debounce((e) => setState({ q: e.target.value.trim() }, false), 250));
window.addEventListener('popstate', () => { state = read(); syncControls(); paint(); });

$('#add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = $('#new-title').value.trim();
  if (!title) return;
  run(addTask({ id: uid(), title, done: false, priority: $('#new-priority').value, due: $('#new-due').value, createdAt: Date.now() }));
  e.target.reset();
  $('#new-title').focus();
});
$('#undo').addEventListener('click', undo);
$('#redo').addEventListener('click', redo);
$('#help-btn').addEventListener('click', () => $('#help').showModal());

hist.onChange = (message) => { paint(); if (message) announce(message); };
store.subscribe(paint);
initDnd();
initShortcuts();
syncControls();
paint();
