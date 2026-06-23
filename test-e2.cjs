// Check all available ways to access Electron APIs
console.log('process.type:', process.type);
console.log('process.contextIsolated:', process.contextIsolated);
// Try internal bindings
try { console.log('binding app:', typeof process._linkedBinding('electron_common_app')); } catch(e) { console.log('no linked binding'); }
// Check globalThis
const keys = Object.getOwnPropertyNames(globalThis).filter(k => k.toLowerCase().includes('electron'));
console.log('global electron keys:', keys);
// Check builtin modules
const m = require('module');
console.log('builtinModules include electron:', m.builtinModules.includes('electron'));
