const m = require('module');
console.log('Total builtins:', m.builtinModules.length);
// List all builtin modules
m.builtinModules.forEach(b => console.log(' ', b));
