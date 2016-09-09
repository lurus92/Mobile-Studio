var fs = require('fs');
var path = require('path');

function saveSettings (settings) {
    var file = 'my-settings-file.json';
    var filePath = path.join(nw.App.dataPath, file);
    fs.writeFile(filePath, settings, function (err) {
        if (err) {
            console.info("There was an error attempting to save your data.");
            console.warn(err.message);
            return;
        }
    });
}

function buildNewProject(config){
    var path = config[1][0];
    var name = config[2];               //config[2] name of the project from first screen
    //Backend stuff
    //TODO: WORK HERE
    var sys = require('util'),
        childProcess = require('child_process'),
        fixPath = require('fix-path');
    fixPath();      //Required to reset path and execute commands
    var cmdBuildPrj = '/usr/local/bin/tns create '+name+' --ng';        //TODO: CHECK FOR WIN

    /*****DECOMMENT NEXT LINES IF YOU WANT TO BUILD NS PROJECT****/
    childProcess.execSync(cmdBuildPrj, {cwd: path}, function(error, stdout, stderr) {
        //Callback function to execute when command is executed
        console.log("cmd: " + error + " : "  + stdout);
        //$("#loadingPanel").hide();
    });

    //Build directory structure
    childProcess.execSync("rm -r app && mkdir app",{cwd: path+"/"+name}, function(error, stdout, stderr) {
        //Callback function to execute when command is executed
        console.log("cmd: " + error + " : "  + stdout);
        //$("#loadingPanel").hide();
    });

    buildManifest(path,name);
    saveProjectToMainScreen(path,name);

    /*
    CHECK THIS FUNCTION IF YOU WANT TO DISPLAY A PROPER CONSOLE
    childProcess.stdout.on('data', function(data) {
        console.log(data); 
    });*/
    /*
    files = getFiles(path+"/"+name);

    for (var i in files){
        $("#filePanel").append(files[i]+"<br>");
    }*/

    //$("#filePanel").hide();
                                
}

 function buildManifest(path,namePrj){
    var manifest = {};
    manifest.name = namePrj;
    manifest.main = "app.js";
    var manifestJSON = JSON.stringify(manifest);

    var rootPrj = path+"/"+namePrj;
    fs.writeFile(rootPrj+"/app/package.json", manifestJSON, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("package.json file written");
    });                 
}

function saveProjectToMainScreen(path, namePrj){
    const {app} = require('electron').remote;
    var homePath = app.getPath("userData");
    var appDetails = {};
    appDetails.name = namePrj;
    appDetails.path = path;
    appDetailsJSON = JSON.stringify(appDetails);
    fs.writeFile(homePath+"/history", appDetailsJSON, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("New Project added");
});    
}