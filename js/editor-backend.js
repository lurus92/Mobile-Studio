var fs = require('fs');
var path = require('path');

var workingPath;
var projectName;

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
    workingPath = config[1][0];
    projectName = config[2];               //config[2] name of the project from first screen
    //Backend stuff
    //TODO: WORK HERE
    var sys = require('util'),
        childProcess = require('child_process'),
        fixPath = require('fix-path');
    fixPath();      //Required to reset path and execute commands
    var cmdBuildPrj = '/usr/local/bin/tns create '+projectName+'';        //TODO: CHECK FOR WIN

    /*****DECOMMENT NEXT LINES IF YOU WANT TO BUILD NS PROJECT****/
    childProcess.execSync(cmdBuildPrj, {cwd: workingPath}, function(error, stdout, stderr) {
        //Callback function to execute when command is executed
        console.log("cmd: " + error + " : "  + stdout);
        //$("#loadingPanel").hide();
    });
    
    /****ADDING IOS THING********/
    var cmdIOS = '/usr/local/bin/tns platform add ios && /usr/local/bin/tns install'
    
    childProcess.execSync(cmdIOS, {cwd:  workingPath+"/"+projectName}, function(error, stdout, stderr) {
        //Callback function to execute when command is executed
        console.log("cmd: " + error + " : "  + stdout);
    });

    /*Build directory structure //UNCOMMENT TO DELETE DEFAULT TEMPLATE FILES
    childProcess.execSync("rm -r app && mkdir app",{cwd: workingPath+"/"+projectName}, function(error, stdout, stderr) {
        //Callback function to execute when command is executed
        console.log("cmd: " + error + " : "  + stdout);
        //$("#loadingPanel").hide();
    });*/

    buildManifest();
    saveProjectToMainScreen();

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

 function compileForNS(){
     var translation = translate(application);
     var startScreen = application.screens[0].id;       //TODO: improve with name, not id
     var appJS = `var application = require("application");
                  application.start({ moduleName: "`+startScreen+`" });`;
     var rootPrj = workingPath+"/"+projectName;
     fs.writeFile(rootPrj+"/app/app.js", appJS, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("app.js written");
     });  
     //For each screen we should write a js and an xml, that SHOULD be taken from our translation (for now only the XML can be built)
     for (var i in application.screens){
         if (i==0) continue;
         var xml = translateScreen(application.screens[i]);
         var js = `//Put something interesting here
                    var createViewModel = require("./main-view-model").createViewModel;
                    function onNavigatingTo(args) {
                        var page = args.object;
                        page.bindingContext = createViewModel();
                    }
                    exports.onNavigatingTo = onNavigatingTo;`;
         var css = null; //put CSS
         //File writing
         fs.writeFile(rootPrj+"/app/"+application.screens[i].id+".js", js, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("JS of screen: "+application.screens[i].id+" written");
         });    
         fs.writeFile(rootPrj+"/app/"+application.screens[i].id+".xml", xml, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("XML of screen: "+application.screens[i].id+" written");
         });       
     }
}

function runForIOS(){
    var sys = require('util'),
        childProcess = require('child_process'),
        fixPath = require('fix-path');
    fixPath();      //Required to reset path and execute commands
    var cmdRunPrj = '/usr/local/bin/tns run ios --emulator'; 
    childProcess.execSync(cmdRunPrj, {cwd: workingPath+"/"+projectName}, function(error, stdout, stderr) {
        //Callback function to execute when command is executed
        console.log("cmd: " + error + " : "  + stdout);
        //$("#loadingPanel").hide();
    });
    
}
         

 function buildManifest(){
    var manifest = {};
    manifest.name = projectName;
    manifest.main = "app.js";
    var manifestJSON = JSON.stringify(manifest);

    var rootPrj = workingPath+"/"+projectName;
    fs.writeFile(rootPrj+"/app/package.json", manifestJSON, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("package.json file written");
    });                 
}

function saveProjectToMainScreen(){
    const {app} = require('electron').remote;
    var homePath = app.getPath("userData");
    var appDetails = {};
    appDetails.name = projectName;
    appDetails.path = workingPath;
    appDetailsJSON = JSON.stringify(appDetails);
    fs.appendFile(homePath+"/history", appDetailsJSON, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("New Project added");
});    
}