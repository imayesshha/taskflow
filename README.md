# Taskflow: JavaScript Task Manager
Frontend Developer Internship, Phase 1 (Async JavaScript and Modules). Author: Ayesha Imran, Reg No SEP26-FE25-55.
No frameworks, no build step. ES modules need a web server: open the folder in VS Code and use **Live Server** (not by double-clicking index.html).

## Modules (js/)
| File | Job |
|---|---|
| main.js | Wires the page together, owns filter/search state |
| store.js | Holds the task list, saves on every change, notifies subscribers |
| storage.js | localStorage read/write and schema migration (v1 to v3) |
| commands.js | Command pattern, undo/redo stacks (20 actions max) |
| query.js | URL parameters (status, priority, sort, q), filtering and sorting |
| ui.js | Rendering, inline edit, HTML5 drag and drop |
| shortcuts.js | Keyboard shortcuts |
| utils.js | uid, debounce, safe match highlighting |

## Shortcuts
N new task, / search, Ctrl+Z undo, Ctrl+Y or Ctrl+Shift+Z redo, Esc clear/leave, ? help.

## Test schema migration
In DevTools console, then reload:
    localStorage.setItem('taskmanager', JSON.stringify([{text:'Old v1 task', done:false}]))
