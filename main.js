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
/*
function checkIfNativeScriptIsIntalled(){
    try {
        nativeScript = require.resolve("mocha"));
    } catch(e) {
    alert("NativeScript not intalled");
    process.exit(e.code);
}
}
*/
function createEditorWindow(path, prjName, existingPrj){
  startWindow.close();
  editorWindow = new BrowserWindow({
      width: 1024,
      height: 768
  });
  editorWindow.loadURL(`file://${__dirname}/editor.html`);
  //editorWindow.send('asynchronous-message', ["initialization", path]);
  editorWindow.webContents.on('did-finish-load', () => {
    editorWindow.webContents.send('asynchronous-message', ["initialization", path, prjName, existingPrj])
  })
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
  if(arg[0]=="startEditor"){        //arg[0] is the name of the message
    //prepareNS(arg[1]);
    createEditorWindow(arg[1], arg[2], arg[3]);     //arg[1] and followers are other parameters
  }
});


function prepareNS(path){
    /*TODO: WORK HERE
    var exec = require('child_process').exec;
    var cmdChangeDir = 'cd '+path;
    var cmdBuildPrj = 'tns create my-first-app --ng';

    exec(cmdChangeDir, function(error, stdout, stderr) {
      // command output is in stdout
    });
    exec(cmdBuildPrj, function(error, stdout, stderr) {
      // command output is in stdout
    });*/
  
}
