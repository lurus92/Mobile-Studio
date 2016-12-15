/**************FUNCTIONS OF EDITOR THAT ACCESS TO THE FILE SYSTEM*****************/

var fs = require('fs');
var path = require('path');
var os = require('os');

var workingPath;
var projectName;

var codeEditor; //Contains the code editor if visible or NULL



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
    
    //Multiplatform things
    var cmdBuildPrj = "";
    if(os.platform()=="win32") cmdBuildPrj = 'tns create '+projectName+''; 
    else cmdBuildPrj = '/usr/local/bin/tns create '+projectName+'';        //TODO: CHECK FOR WIN
    
    process.stdout.on('data', function(data) {
        console.log(data); });
    process.stdin.on('data', function(data) {
        console.log(data); });
    
    /*****DECOMMENT NEXT LINES IF YOU WANT TO BUILD NS PROJECT***/
    childProcess.execSync(cmdBuildPrj, {cwd: workingPath, stdio:[0,1,2]}, function(error, stdout, stderr) {
        //Callback function to execute when command is executed
        console.log("cmd: " + error + " : "  + stdout);
        //$("#loading-panel").hide();
    });

    
    /****ADDING IOS THING*******/
    
    if(os.platform()=="darwin"){   //This things work only on a Mac
        var cmdIOS = '/usr/local/bin/tns platform add ios && /usr/local/bin/tns install'

        childProcess.execSync(cmdIOS, {cwd:  workingPath+"/"+projectName, stdio:[0,1,2]}, function(error, stdout, stderr) {
            //Callback function to execute when command is executed
            console.log("cmd: " + error + " : "  + stdout);
        });
    }
    
    
    //ELIMINATION OF DEFAULT TEMPLATES. WATCH OUT WHAT YOU DELETE!
    /*Build directory structure
    childProcess.execSync("rm -r app && mkdir app",{cwd: workingPath+"/"+projectName}, function(error, stdout, stderr) {
        //Callback function to execute when command is executed
        console.log("cmd: " + error + " : "  + stdout);
        //$("#loading-panel").hide();
    });*/

    buildManifest();
   // saveProjectToMainScreen();
    createComponentsExplorer();
    dirty = true;
    $("#loading-panel").hide();
    
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
     //var startScreen = application.screens["win0"].id;       //TODO: improve with name, not id
     var startScreen = application.startingScreen;
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
         var js = translateActions(application.screens[i]);
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
     updateFileExplorer();
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
        //$("#loading-panel").hide();
    });
    cp.stdout.on('data', function(data) {
        console.log(data); 
        $("#console").append(data);
        $("#console").append("<br/>");
        $("#console").scrollTop = $("#console").prop('scrollHeight');
        if (data.indexOf("BUILD SUCCEEDED") !== -1) new Notification("Build Succeeded",{
            title: "Build Succeeded",
          });
    });
    cp.stderr.on('data',function(data){
        console.log(data); 
        $("#console").append("<span style='color:red'>"+data+"</span>");
        $("#console").append("<br/>");
        $("#console").scrollTop = $("#console").prop('scrollHeight');
        new Notification("Error!",data);         
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
    existingPrj = true;
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
    toStore = projectName + "|" + workingPath + "|" + JSON.stringify(application) + "|" + componentsCounter;
    var rootPrj = workingPath+"/"+projectName+"/";
    fs.writeFile(rootPrj+projectName+".msa", toStore, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("Mobile Studio Application file written");
    }); 
    
    if(!existingPrj) saveProjectToMainScreen();     //ELSE, we could think to put at top, save timestamp, etc.
    updateFileExplorer();
    alert("Project Saved");
    dirty = false;
}

function restoreProjectFromFile(){
      var path = workingPath;
      var prjName = projectName;          //REMOVE THIS: THEY ARE GLOBAL
      codeEditor = null;
      fs.readFile(path+"/"+prjName+"/"+prjName+".msa", 'utf8', function (err,data) {
      if (err) {
          alert("File Not Found");
          //window.close();               //Send event to main in order to reopen startScreen
        return console.log(err);
      }
      $("#componentsContainer").show();
      $("#fileExplorer").css("height","20%");    //Add animation, please
      restoreFromString(data);
    });   

}

function restoreFromString(msaString){        //msaString is the string inside the file
    projectName = msaString.split("|")[0];
    workingPath = msaString.split("|")[1];
    var payload = msaString.split("|")[2];
    componentsCounter = msaString.split("|")[3];
    application = JSON.parse(payload);      //Model rebuilt
    applicationCopy = JSON.parse(payload);
    createComponentsExplorer();
    //clean the canvas
    $("#mainContent").html("");
    $("#mainContent").ruler();
    //Wea should rebuild the apps
    for (var i in application.screens){
        var newWindow = `<div id='`+i+`' class='window drawn-element `+platformToPreview+`'>
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
                      componentHTML = "<button id='"+id+"' class='drawn-element button' value='"+application.screens[i].components[j].specificAttributes['text']+"'>"+application.screens[i].components[j].specificAttributes['text']+"</button>";
                      break;
                  case "TextField":
                      componentHTML = "<input type='text' id='"+id+"' class='drawn-element textfield' value='"+application.screens[i].components[j].specificAttributes['text']+"'/>";
                      break;
                  case "TextView": componentHTML="<input type='textarea' id='"+id+"' class='drawn-element textarea' value='"+application.screens[i].components[j].specificAttributes['text']+"'/>";
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
                      componentHTML = "<div id='"+id+"' class='drawn-element slider value='"+application.screens[i].components[j].specificAttributes['value']+"></div>";
                      break;
                  case "Progress":
                      componentHTML = "<progress id='"+id+"' class='drawn-element progress' value='"+application.screens[i].components[j].specificAttributes['value']+"/>";
                      break;
                  case "Image":
                      componentHTML = "<img id='"+id+"' class='drawn-element image' />";
                      break;
                  case "ListView":
                      componentHTML = "<div id='"+id+"' class='drawn-element listview'/>";
                      break;
                  case "HtmlView":
                      componentHTML = "<iframe id='"+id+"' class='drawn-element htmlview'></iframe>";
                      break;
                  case "WebView":
                      componentHTML = "<iframe id='"+id+"' class='drawn-element htmlview'></iframe>";
                      break;
                  case "TabView":
                      componentHTML = "<div id='"+id+"' class='drawn-element tabview'></div>";
                      break;
                  case "SegmentedBar":
                      componentHTML = "<div id='"+id+"' class='drawn-element segmentedBar'></div>";
                      break;
                  case "DatePicker":
                      componentHTML = "<div id='"+id+"' class='drawn-element datepicker'></div>";
                      break;
                  case "TimePicker":
                      componentHTML = "<div id='"+id+"' class='drawn-element timepicker'></div>";
                      break;
                  case "ListPicker":
                      componentHTML = "<div id='"+id+"' class='drawn-element listpicker'></div>";
                      break;
                  case "ActivityIndicator":
                      componentHTML = "<div id='"+id+"' class='drawn-element activity-indicator'></div>";
                      break;
                  default: 
                      console.log("Warning: element with id: "+id+" could not be restored!");
                }
                $("#"+i).append(componentHTML);
                $("#"+j).attr("style",application.screens[i].components[j].style);
                $("#"+j).addClass(application.screens[i].layout);
                $("#"+j).addClass(platformToPreview);   //works?
                $("#"+j).draggable({ containment: "parent", cancel: false});

            }
            $("#"+i).prepend(`<div class="header drawn-element `+platformToPreview+`"></div>
                                                  </div>`);
        
            $("#"+i).find(".drawn-element").css("position","");


        }
    $("#loading-panel").hide();
}



function restoreFromSubModel(sm){        //msaString is the string inside the file
    globalApplication = application;
    application = sm;
    
    //From here it's the same as restoreFromString();
    createComponentsExplorer();
    //clean the canvas
    $("#mainContent").html("");
    $("#mainContent").ruler();
    //Wea should rebuild the apps
    for (var i in application.screens){
        var newWindow = `<div id='`+i+`' class='window drawn-element `+platformToPreview+`'>
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
                      componentHTML = "<button id='"+id+"' class='drawn-element button' value='"+application.screens[i].components[j].specificAttributes['text']+"'>"+application.screens[i].components[j].specificAttributes['text']+"</button>";
                      break;
                  case "TextField":
                      componentHTML = "<input type='text' id='"+id+"' class='drawn-element textfield' value='"+application.screens[i].components[j].specificAttributes['text']+"'/>";
                      break;
                  case "TextView": componentHTML="<input type='textarea' id='"+id+"' class='drawn-element textarea' value='"+application.screens[i].components[j].specificAttributes['text']+"'/>";
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
                      componentHTML = "<div id='"+id+"' class='drawn-element slider value='"+application.screens[i].components[j].specificAttributes['value']+"></div>";
                      break;
                  case "Progress":
                      componentHTML = "<progress id='"+id+"' class='drawn-element progress' value='"+application.screens[i].components[j].specificAttributes['value']+"/>";
                      break;
                  case "Image":
                      componentHTML = "<img id='"+id+"' class='drawn-element image' />";
                      break;
                  case "ListView":
                      componentHTML = "<div id='"+id+"' class='drawn-element listview'/>";
                      break;
                  case "HtmlView":
                      componentHTML = "<iframe id='"+id+"' class='drawn-element htmlview'></iframe>";
                      break;
                  case "WebView":
                      componentHTML = "<iframe id='"+id+"' class='drawn-element htmlview'></iframe>";
                      break;
                  case "TabView":
                      componentHTML = "<div id='"+id+"' class='drawn-element tabview'></div>";
                      break;
                  case "SegmentedBar":
                      componentHTML = "<div id='"+id+"' class='drawn-element segmentedBar'></div>";
                      break;
                  case "DatePicker":
                      componentHTML = "<div id='"+id+"' class='drawn-element datepicker'></div>";
                      break;
                  case "TimePicker":
                      componentHTML = "<div id='"+id+"' class='drawn-element timepicker'></div>";
                      break;
                  case "ListPicker":
                      componentHTML = "<div id='"+id+"' class='drawn-element listpicker'></div>";
                      break;
                  case "ActivityIndicator":
                      componentHTML = "<div id='"+id+"' class='drawn-element activity-indicator'></div>";
                      break;
                  default: 
                      console.log("Warning: element with id: "+id+" could not be restored!");
                }
                $("#"+i).append(componentHTML);
                $("#"+j).attr("style",application.screens[i].components[j].style);
                $("#"+j).addClass(application.screens[i].layout);
                $("#"+j).addClass(platformToPreview);   //works?
                $("#"+j).draggable({ containment: "parent", cancel: false});

            }
            $("#"+i).prepend(`<div class="header drawn-element `+platformToPreview+`"></div>
                                                  </div>`);
        
            $("#"+i).find(".drawn-element").css("position","");


        }
    $("#loading-panel").hide();
}



function openFileInCodeEditor(fileName){
    if(!fileName) console.log("error");
    var splitted = fileName.split(".");
    var ext = splitted[splitted.length-1];
    if((ext=="msa")&&(visualEditor)) restoreProjectFromFile();
    else{
        fs.readFile(fileName, 'utf8', function (err,data) {
                $("#propertyPanel").hide();
                codeEditor.setValue(String(data));
                codeEditor.editingFilePath = fileName;
            });
            //Front end small customizations
            $("#componentsContainer").hide();
            $("#fileExplorer").css("height","100%");    //Add animation, please
        switch(ext){
            case "json": codeEditor.setOption("mode","javascript");
            break;
            case "css": codeEditor.setOption("mode","css");
            break;
            case "js": codeEditor.setOption("mode","javascript");
            break;
            case "xml": codeEditor.setOption("mode","xml");
            break;
            default: console.log("Cannot color text");
        }
    }/*
    switch (ext){
        case "msa": restoreProjectFromFile();
            break;
        //case "json":  PUT THEMES HERE
        default:{
            fs.readFile(fileName, 'utf8', function (err,data) {
                $("#propertyPanel").hide();
                codeEditor.setValue(String(data));
            });
            $("#componentsContainer").hide();

        }
    } */                       
}


var fs = require('fs'),
    path = require('path')

function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            title: path.basename(filename)
        };
    if((path.basename=="Android")||(path.basename=="iOS")||(path.basename=="ios")) return info;
    if (stats.isDirectory()) {
        //info.type = "folder";
        info.folder = true;
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
    }
    //console.log(info);
    return info;
}

function populateFileExplorer(info){
  // if(!$("#fileExplorer").fancytree('getTree'))
    $("#fileExplorer").fancytree({
       source: info,
       activate: function(event, data){
          // A node was activated: display its title:
          node = data.node;
          if(data.node.isFolder()) return false;    //We are not opening folders
          //Consider Extension 
          createCodeEditor();
          openFileInCodeEditor(node.data.path);
        }
    });
}

function adaptModelForTree(){
    var adaptedModel = {};
    adaptedModel.children = [];
    adaptedModel.folder = true;
    adaptedModel.title = "Components";

    for (var i in application.screens){
        var count = adaptedModel.children.push({
            title: application.screens[i].id,
            folder: true,
            parentWindow: application.screens[i].id,
            children: []});
        for (var j in application.screens[i].components){
            adaptedModel.children[count-1].children.push({
                title: application.screens[i].components[j].id,
                parentWindow: application.screens[i].id});
        }
    }
    return adaptedModel;    
}

function createFileExplorer(){
    $("#fileExplorer").html("");
    var content = dirTree(workingPath+"/"+projectName);
    populateFileExplorer(content);
}

function updateFileExplorer(){
    var tree = $('#fileExplorer').fancytree('getTree');
    //if (!tree) return;
    var content = dirTree(workingPath+"/"+projectName);
    tree.reload(content);
}


function updateModelExplorer(){
    var tree = $('#modelExplorer').fancytree('getTree');
    //if(!tree) return;
    content = adaptModelForTree();
    tree.reload(content);
}

function selectInModelExplorer(id){
    var tree = $('#modelExplorer').fancytree('getTree');
    //if (!tree) return;
    tree.visit(function(node){
        if(node.title==id);
            node.setFocus(true);
  });
}


function createComponentsExplorer(){
    content = adaptModelForTree();
    var tree;
    try{
        tree = $("#modelExplorer").fancytree('getTree');
        tree.reload(content); 
    }catch(e){
        
     //if(!$("#modelExplorer").fancytree('getTree'))
        $("#modelExplorer").fancytree({
            source: content,
            activate: function(event, data){
                node = data.node;
                selectElement($("#"+node.title)[0], $("#"+node.data.parentWindow)[0]);
            }
        });
    }
}

function saveProject(){
    if (!codeEditor){
        //Code editor not displayed, save screen to msa
        storeModel();
        compileForNS();
    }else{
        //Code editor displayed: you should save the content of the editor!
        fs.writeFile(codeEditor.editingFilePath, codeEditor.getValue(), function (err) {
        if (err) {
            console.info("There was an error attempting to save your data.");
            console.warn(err.message);
            return;
        }
    });
    }
}

//TODO: each time you modify something in the editor, you should REPARSE everything before going to UI EDITOR!!!!