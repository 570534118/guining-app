// Try alternate require paths for electron built-in
try {
  const e = require('electron');
  console.log('electron keys:', Object.keys(e).length);
  console.log('has app:', !!e.app);
} catch(err) {
  console.log('electron failed:', err.message);
}
// Check if node_modules/electron is being loaded
const resolved = require.resolve('electron');
console.log('resolved to:', resolved);
