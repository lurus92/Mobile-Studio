const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron;
let startWindow;
let editorWindow;


function createStartWindow() {
  startWindow = new BrowserWindow({
      width: 800,
      height: 600,
      resizable: false,
      icon: `file://${__dirname}/img/startupIcon.png`,
      titleBarStyle: 'hidden'

  });
  startWindow.loadURL(`file://${__dirname}/index.html`);      

  startWindow.on('closed', () => {
    startWindow = null;
  });
}

function createEditorWindow(){
  startWindow.close();
  editorWindow = new BrowserWindow({
      width: 1024,
      height: 768,
  });
  editorWindow.loadURL(`file://${__dirname}/editor.html`);
  editorWindow.on('closed', () => {
    editorWindow = null;
  });
}

app.on('ready', createStartWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (startWindow === null) {
    createStartWindow();
  }
});


const {ipcMain} = require('electron');

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg);
  if(arg[0]=="startEditor"){
    createEditorWindow();
  }
});

