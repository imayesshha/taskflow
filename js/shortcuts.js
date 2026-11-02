import { undo, redo } from './commands.js';

const $ = (s) => document.querySelector(s);

export function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (mod && !typing && (key === 'z' || key === 'y')) {
      e.preventDefault();
      (key === 'y' || e.shiftKey ? redo : undo)();
      return;
    }
    if (e.key === 'Escape') {
      const search = $('#search');
      if (document.activeElement === search && search.value) { search.value = ''; search.dispatchEvent(new Event('input')); }
      document.activeElement?.blur();
      return;
    }
    if (typing || mod || e.altKey) return;
    if (key === 'n') { e.preventDefault(); $('#new-title').focus(); }
    else if (e.key === '/') { e.preventDefault(); $('#search').focus(); }
    else if (e.key === '?') $('#help').showModal();
  });
}
