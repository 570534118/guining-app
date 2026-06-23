const { app, BrowserWindow } = require('electron');
if (app && app.whenReady) {
  app.whenReady().then(() => { console.log('OK'); app.quit(); });
} else {
  console.log('FAIL: app is', typeof app);
  process.exit(1);
}
