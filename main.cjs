const { app } = require('electron');
app.whenReady().then(() => {
  console.log('Electron app is running!');
  app.quit();
});
