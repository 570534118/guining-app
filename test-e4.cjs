// Try individual electron submodules
try { console.log('electron/main:', typeof require('electron/main')); } catch(e) { console.log('no electron/main'); }
try { console.log('electron/common:', typeof require('electron/common')); } catch(e) { console.log('no electron/common'); }
try { console.log('electron/renderer:', typeof require('electron/renderer')); } catch(e) { console.log('no electron/renderer'); }
// Maybe the APIs are under different names?
try { console.log('@electron/remote:', typeof require('@electron/remote')); } catch(e) { console.log('no @electron/remote'); }
