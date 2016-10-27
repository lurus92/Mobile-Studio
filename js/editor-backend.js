/**************FUNCTIONS OF EDITOR THAT ACCESS TO THE FILE SYSTEM*****************/

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
    

    //ELIMINATION OF DEFAULT TEMPLATES. WATCH OUT WHAT YOU DELETE!
    /*Build directory structure
    childProcess.execSync("rm -r app && mkdir app",{cwd: workingPath+"/"+projectName}, function(error, stdout, stderr) {
        //Callback function to execute when command is executed
        console.log("cmd: " + error + " : "  + stdout);
        //$("#loadingPanel").hide();
    });*/

    buildManifest();
   // saveProjectToMainScreen();
    
    $("#loadingPanel").hide();
    
    //OLD FILE VISUALIZATION
    /*
    files = getFiles(path+"/"+name);

    for (var i in files){
        $("#filePanel").append(files[i]+"<br>");
    }*/

    //$("#filePanel").hide();
                                
}

 function compileForNS(){
     var translation = translate(application);
     var startScreen = application.screens["win0"].id;       //TODO: improve with name, not id
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
         var css = translateScreenStyle(application.screens[i]); //put CSS
         var css = css.replace(/px/g,'');   //HERE YOU SHOULD DELETE PX/EM/OTHER UNITS
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
         fs.writeFile(rootPrj+"/app/"+application.screens[i].id+".css", css, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("CSS of screen: "+application.screens[i].id+" written");
         });       
     }
}

function run(mode){
    var sys = require('util'),
        childProcess = require('child_process'),
        fixPath = require('fix-path');
    fixPath();      //Required to reset path and execute commands
    var cmdRunPrj
    switch(mode){
        case "iosEmulator": cmdRunPrj = '/usr/local/bin/tns run ios --emulator';
            break;
        case "iosReal": cmdRunPrj = "to DO!"
            break;
        case "androidEmulator": cmdRunPrj = '/usr/local/bin/tns run android --emulator';
            break;
        case "androidReal": cmdRunPrj = '/usr/local/bin/tns run android';
            break;
        default: alert("Missing running mode");
    }
    //var cmdRunPrj = '/usr/local/bin/tns run ios --emulator'; 
    var cp = childProcess.exec(cmdRunPrj, {cwd: workingPath+"/"+projectName}, function(error, stdout, stderr) {
        //Callback function to execute when command is executed
        console.log("cmd: " + error + " : "  + stdout);
        //$("#loadingPanel").hide();
    });
    cp.stdout.on('data', function(data) {
        console.log(data); 
        $("#console").append(data);
        $("#console").append("<br/>");
        $("#console").scrollTop = $("#console").scrollHeight;
        if(data=="** BUILD SUCCEEDED **") new Notification("Build Succeeded","");
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


function storeModel(){
    //Save CSS for screens
    for (var i in application.screens){
        application.screens[""+i+""].style = $("#"+i+"").attr("style");
            //Save CSS for components
            for (var j in application.screens[""+i+""].components){
                application.screens[""+i+""].components[""+j+""].style = $("#"+j+"").attr("style");
            }
    }

    //Easy task: stringify everything
    toStore = projectName + "|" + workingPath + "|" + JSON.stringify(application);
    var rootPrj = workingPath+"/"+projectName+"/";
    fs.writeFile(rootPrj+projectName+".msa", toStore, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("Mobile Studio Application file written");
    }); 
    
    if(!existingPrj) saveProjectToMainScreen();     //ELSE, we could think to put at top, save timestamp, etc.
    
    alert("Project Saved");
}

function restoreProjectFromFile(path,prjName){
      fs.readFile(path+"/"+prjName+"/"+prjName+".msa", 'utf8', function (err,data) {
      if (err) {
          alert("File Not Found");
        return console.log(err);
      }
      restoreFromString(data);
    });   

}

function restoreFromString(msaString){        //msaString is the string inside the file
    projectName = msaString.split("|")[0];
    workingPath = msaString.split("|")[1];
    var payload = msaString.split("|")[2];
    application = JSON.parse(payload);      //Model rebuilt
    //We should rebuild the apps
    for (var i in application.screens){
        var newWindow = `<div id='`+i+`' class='window drawn-element'>
                            <span>`+i+`</span>  <!--INSERT FIRST WINDOW TEXT -->
                         </div>`;
        $("#mainContent").append(newWindow);
        $("#"+i).attr("style",application.screens[i].style);
        initializeWindowEvents();
        for (var j in application.screens[i].components){
            var componentHTML = "";
            var id = application.screens[i].components[j].id;
            switch (application.screens[i].components[j].type){
                case "Label":
                    componentHTML = "<div id='"+id+"' class='drawn-element label'>"+application.screens[i].components[j].specificAttributes['text']+"</div>";
                    break;
                case "Button":
                      componentHTML = "<button id='"+id+"' class='drawn-element button' value='"+application.screens[i].components[j].specificAttributes['text']+"'></button>";
                      break;
                  case "TextField":
                      componentHTML = "<input type='text' id='"+id+"' class='drawn-element textfield' value='"+application.screens[i].components[j].specificAttributes['text']+"'/>";
                      break;
                  case "TextView": componentHTML="<div>Cos'è una TextView?</div>";
                      break;
                  case "SearchBar":
                      componentHTML = "<input type='search' id='"+id+"' class='drawn-element searchbar' value='"+application.screens[i].components[j].specificAttributes['text']+"'/>";
                      break;
                  case "Switch":{
                      var checked = "";
                      if (application.screens[i].components[j].specificAttributes['set']) checked='checked="checked"'
                      componentHTML = "<input type='checkbox' id='"+id+"' class='drawn-element switch' "+checked+"/>";
                      }
                      break;
                  case "Slider":
                      componentHTML = "<div>Non so cosa sia</div>";
                      break;
                  case "Progress":
                      componentHTML = "<progress id='"+id+"' class='drawn-element progress' value='"+application.screens[i].components[j].specificAttributes['value']+"/>";
                      break;
                default: 
                      componentHTML = "<div> Couldn't restore this element </div>";
                }
                $("#"+i).append(componentHTML);

            }
            $("#"+j).attr("style",application.screens[i].components[j].style);

        }
    $("#loadingPanel").hide();
}