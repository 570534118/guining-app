// Delete the node_modules/electron/index.js and package.json first
const fs = require('fs');
const path = require('path');
const electronDir = path.join(__dirname, 'node_modules', 'electron');
if (fs.existsSync(path.join(electronDir, 'index.js'))) {
  fs.renameSync(path.join(electronDir, 'index.js'), path.join(electronDir, '_index.js'));
  fs.renameSync(path.join(electronDir, 'package.json'), path.join(electronDir, '_package.json'));
}
// Clear require cache
delete require.cache[require.resolve('electron')];
// Try again
try {
  const e = require('electron');
  console.log('SUCCESS! app:', typeof e.app);
} catch(err) {
  console.log('FAIL:', err.message);
}
// Restore
if (fs.existsSync(path.join(electronDir, '_index.js'))) {
  fs.renameSync(path.join(electronDir, '_index.js'), path.join(electronDir, 'index.js'));
  fs.renameSync(path.join(electronDir, '_package.json'), path.join(electronDir, 'package.json'));
}
