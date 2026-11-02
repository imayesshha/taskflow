export const uid = () => crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);

export const debounce = (fn, ms = 250) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

// Returns a fragment with matches wrapped in <mark>. Uses text nodes only, so no HTML injection.
export function highlight(text, query) {
  const frag = document.createDocumentFragment();
  if (!query) { frag.append(text); return frag; }
  const safe = query.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');
  text.split(new RegExp('(' + safe + ')', 'gi')).forEach((part, i) => {
    if (i % 2) { const m = document.createElement('mark'); m.textContent = part; frag.append(m); }
    else if (part) frag.append(part);
  });
  return frag;
}
