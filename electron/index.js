const electron = require('electron');
const app = electron.remote.require("./main");

function appQuit() {
  app.appQuit();
}
