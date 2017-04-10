const electron = require('electron');
const os = require('os');
const {app} = electron;
const {BrowserWindow} = electron;
const Menu = electron.Menu

let startWindow;
let editorWindow;
//var app = require('app');
app.commandLine.appendSwitch('remote-debugging-port', '8315');
app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1');

function createStartWindow() {
  if (os.platform()=="darwin"){
  startWindow = new BrowserWindow({
      width: 800,
      height: 600,
      resizable: false,
      icon: `file://${__dirname}/img/startupIcon.png`,
      titleBarStyle: 'hidden',
      vibrancy: 'dark' 

  });
}else{
   startWindow = new BrowserWindow({
      width: 800,
      height: 600,
      resizable: false,
      icon: `file://${__dirname}/img/startupIcon.png`,
      frame: false
  });  
}
  startWindow.loadURL(`file://${__dirname}/index.html`);   


    

  startWindow.on('closed', () => {
    startWindow = null;
  });
    
    //Menu stuff
    
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
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
  if (startWindow) startWindow.close();
   

}

app.on('ready', createStartWindow);

/*
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});*/

app.on('activate', () => {
  if (startWindow === null) {
    createStartWindow();
  }
});


const {ipcMain} = require('electron');

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg);
  switch(arg[0]){
      case "startEditor": createEditorWindow(arg[1], arg[2], arg[3]);
          break;
      case "terminate": app.quit();
  }
  /*if(arg[0]=="startEditor"){        //arg[0] is the name of the message
    //prepareNS(arg[1]);
    createEditorWindow(arg[1], arg[2], arg[3]);     //arg[1] and followers are other parameters
  }*/
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

function toImplement(){
    //Do something
}


//MENU STUFF
let template = [
    {
      label: 'File',
      submenu: [{
        label: 'New Project',
        accelerator: 'CmdOrCtrl+N',
        click: function(){
            createStartWindow();
        }
      },{
        label: 'Open...',
        accelerator: 'CmdOrCtrl+O',
        click: function(){
            toImplement();
        }
      }, {
        label: 'Save All',
        accelerator: 'CmdOrCtrl+S',
      }]
    },
                {
  label: 'Edit',

  submenu: [{
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  },
            {
    label: 'Redo',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: 'Select All',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }]
},
    {
  label: 'Build',

  submenu: [{
    label: 'Build',

  },
            {
    label: 'Compile',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: 'Select All',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }]
},
    {
  label: 'Run',

  submenu: [{
    label: 'Run on...',

  },
            {
    label: 'Debug',
  }, {
    type: 'separator'
  },{
    label: 'Manage Platforms...',

  }]
},{
  label: 'View',
  submenu: [{
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        // on reload, start fresh and close any old
        // open secondary windows
        if (focusedWindow.id === 1) {
          BrowserWindow.getAllWindows().forEach(function (win) {
            if (win.id > 1) {
              win.close()
            }
          })
        }
        focusedWindow.reload()
      }
    }
  }, {
    label: 'Toggle Full Screen',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F'
      } else {
        return 'F11'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
      }
    }
  }, {
    label: 'Toggle Developer Tools',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I'
      } else {
        return 'Ctrl+Shift+I'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.toggleDevTools()
      }
    }
  }, {
    type: 'separator'
  }, {
    label: 'App Menu Demo',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        const options = {
          type: 'info',
          title: 'Application Menu Demo',
          buttons: ['Ok'],
          message: 'This demo is for the Menu section, showing how to create a clickable menu item in the application menu.'
        }
        electron.dialog.showMessageBox(focusedWindow, options, function () {})
      }
    }
  }]
}, {
  label: 'Window',
  role: 'window',
  submenu: [{
    label: 'Minimize',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: 'Close',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }, {
    type: 'separator'
  }, {
    label: 'Reopen Window',
    accelerator: 'CmdOrCtrl+Shift+T',
    enabled: false,
    key: 'reopenMenuItem',
    click: function () {
      app.emit('activate')
    }
  }]
}, {
  label: 'Help',
  role: 'help',
  submenu: [{
    label: 'Learn More',
    click: function () {
      electron.shell.openExternal('http://electron.atom.io')
    }
  }]
}];

if (process.platform === 'darwin') {
  const electron = require('electron');
  const name = electron.app.getName();
  template.unshift({
    label: name,
    submenu: [{
      label: 'About MobileStudio',
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: 'Services',
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: `Hide MobileStudio`,
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: 'Show All',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: function () {
        app.quit()
      }
    }]
  })

  // Window menu.
  template[3].submenu.push({
    type: 'separator'
  }, {
    label: 'Bring All to Front',
    role: 'front'
  })

}