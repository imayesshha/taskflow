import { load, save } from './storage.js';

let tasks = load();
const subscribers = new Set();

export const get = () => tasks;
export const set = (next) => { tasks = next; save(tasks); subscribers.forEach((fn) => fn(tasks)); };
export const subscribe = (fn) => { subscribers.add(fn); return () => subscribers.delete(fn); };
