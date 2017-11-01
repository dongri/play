// Sets variables (const)
const { app, BrowserWindow, Tray, session, Menu, globalShortcut} = require('electron')
const path = require('path')
const Positioner = require('electron-positioner');
const assetsDirectory = path.join(__dirname, 'img')

const webURL = "https://play.origami.co/static/electron/index.html"

let tray = undefined
let window = undefined
 
var cachedBounds;
var windowPosition = 'trayCenter';

app.dock.hide()

app.on('ready', () => {
  createTray()
})

app.on('window-all-closed', () => {
  app.quit()
})

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'icon.png'))

  var defaults = {
    width: 300,
    height: 500,
    show: false,
    frame: false,
    resizable: true
  };

  tray.window = new BrowserWindow(defaults);
  tray.positioner = new Positioner(tray.window);
  // tray.window.loadURL.loadURL('file://' + __dirname + '/index.html');
  tray.window.loadURL(webURL, {"extraHeaders" : "pragma: no-cache\n"});
  tray.window.on('blur', hideWindow);
  tray.window.setVisibleOnAllWorkspaces(true);
  
  tray.on('click', function (e, bounds) {
    if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) { return hideWindow(); };
    if (tray.window && tray.window.isVisible()) { return hideWindow(); };
    bounds = bounds || cachedBounds;
    cachedBounds = bounds;
    showWindow(cachedBounds);
  });

  tray.window.on('closed', function() {
      session.defaultSession.clearCache(() => {})
      tray.window = null
  })

  setTimeout( function() { showWindow(tray.getBounds()); }, 5 );

  // tray.window.webContents.openDevTools()
  
}

const hideWindow = () => {
  if (!tray.window) { return; }

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()

  tray.window.hide();
}

function showWindow (trayPos) {
  var noBoundsPosition;
  if (trayPos === undefined) {
    noBoundsPosition = 'topCenter';
  }
  var position = tray.positioner.calculate(noBoundsPosition || windowPosition, trayPos);
  tray.window.setPosition(position.x, position.y);
  tray.window.show();

  // Copy
  globalShortcut.register('CmdOrCtrl+C', function () {
    let code = `document.execCommand('copy');`;
    tray.window.webContents.executeJavaScript(code);
  });

  // Paste
  globalShortcut.register('CmdOrCtrl+V', function () {
    let code = `document.execCommand('paste');`;
    tray.window.webContents.executeJavaScript(code);
  });

  // Select All
  globalShortcut.register('CmdOrCtrl+A', function () {
    let code = `document.execCommand('selectAll');`;
    tray.window.webContents.executeJavaScript(code);
  });

  // Cut
  globalShortcut.register('CmdOrCtrl+X', function () {
    let code = `document.execCommand('cut');`;
    tray.window.webContents.executeJavaScript(code);
  });

}
