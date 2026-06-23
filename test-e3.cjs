const { app } = require('electron');
console.log('app type:', typeof app);
if (app && app.whenReady) {
  app.whenReady().then(() => console.log('READY'));
} else {
  console.log('app not available');
}
