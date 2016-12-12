componentsCounter = 0;      //To insert in initialization
scaleFactor = 1;

var dirty = false;
//SupportedCSS: CSS tags that can be translated by NS
var supportedCSS = ['color','background-color','background-image','background-repeat','background-position','background-size','border-color','border-width','border-radius','font','font-family','font-size','font-style','font-weight','text-align','text-decoration','text-transform','letter-spacing','z-index','clip-path','vertical-align','horizontal-align','margin','margin-top','margin-right','margin-bottom','margin-left','width','height','min-width','min-height','padding','padding-top','padding-right','padding-bottom','padding-left','visibility','opacity'];

//var messageReceived = null;
window.$ = window.jQuery = require('./js/jquery-3.0.0.min.js');
//window.$ = window.jQuery = require('./js/zepto.js');
require('./js/jquery-ui.js');
require('./js/jquery.ui.ruler.js');
require('./js/colResizable-1.6.min.js');
//require('./js/jstree/jstree.js');
require('./js/fancytree/jquery.fancytree-all.min.js');
//require('./js/jquery.zoomooz.js');
var model = require('./classes.js');
let application = new model.Application(); 
platformToPreview = "ios";
$(window).ready(function() {

    //Graphic Initialization
   // $( "#mainContent" ).resizable();
    $( "#componentsPanel" ).resizable();
    /*$("#mainTable").colResizable({
        liveDrag:true
    });*/
    $( "#componentsPanel" ).droppable();
    $( "#mainContent" ).droppable();
    $( "#propertyPanel" ).hide();

    $( "#mainContent" ).ruler();

    $("#previewPlatformSelector").change(function(){
        if(this.value=="ios"){
            $(".drawn-element").removeClass("android");
            $(".drawn-element").addClass("ios");
            platformToPreview = "ios";
        }else{
            $(".drawn-element").removeClass("ios");
            $(".drawn-element").addClass("android");
            platformToPreview = "android";

        }
    });


    $("#mainContent").css("zoom",1);

    //IMPROVE ZOOM
    $( "#mainContent").on("mousewheel", function(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log("scrolling!");
            console.log(e);
            // perform desired zoom action here
            var newZoom = 1;
            if (e.originalEvent.wheelDelta>0)
              //  $(this).zoomTo({targetsize:1.25, duration:600});    //ZOOMOOZ
                newZoom = parseFloat($("#mainContent").css("zoom"))*1.1;
            else
               // $(this).zoomTo({targetsize:0.75, duration:600});     //ZOOMOOZ
                newZoom = parseFloat($("#mainContent").css("zoom"))*0.9;
            scaleFactor = newZoom;
            $(this).animate({'zoom':newZoom},1);
            console.log("newZoom: "+newZoom+" wheelData: "+e.originalEvent.wheelDelta);

        }
    });


    //Gather data from main (FOR NOW ONLY PATH)
    const {ipcRenderer} = require('electron');

    ipcRenderer.on('asynchronous-message', (event, arg) => {
        //messageReceived = arg;
        switch(arg[0]){
            case "initialization": {initialization(arg); break;}
            //default: console.log(arg);
        }
    });
    /*
    $("#mainContent").append(`
                         <div id="selector" style="background-color: blue; position:absolute; border: 4px solid #2aabd2;"></div>`);*/


    //Only at the very end we should set up a style (iOS/Android)
    //ios standard visualization
    $(".drawn-element").addClass("ios");
    platformToPreview = "ios";
});



function deleteElement(idToDelete,winId){
        dirty = true;
        $("#"+idToDelete).remove();
        $(".infoHovering").remove();
        $("#propertyPanel").hide();
        //Delete from model!!!
        //application.screens.splice(idToDelete,1);
        console.log("About to remove: winId = "+winId+", idToDelete = "+idToDelete);
        if (winId==null){
            delete application.screens[idToDelete];
            application.numberOfScreens--;
        }else{
            delete application.screens[winId].components[idToDelete];
            application.screens[winId].numberOfComponents--;
        }
        //updateModelExplorer();
    }


function buildProjectForAndroid(){
    $("#loading-panel").show();
    console.log("DO TRANSLATION HERE!")
}

function setNewCss(event, attributeID, property){                   //Incremental CSS UPDATE 
    dirty = true;
    $("#"+attributeID+"").css(""+property+"",""+this.value+"");
    //console.log(this);
}

function setNewAttr(event,attrType,oldAttr,compWin,winId,property){        //compWin = not defined if Window, id if comp
    dirty = true;
    var newId = this.value;
    switch(attrType){
        case "id":{
            /*Model update 
            if(!compWin){
                if (application.screens[""+newId+""]){
                    alert("You must use an unique id!");
                    return;
                }
                application.screens[""+oldAttr+""].id = ""+newId+"";
                application.screens[""+newId+""] = application.screens[""+oldAttr+""];
                delete application.screens[""+oldAttr+""];
            }else{*/
                //console.log(winId);
                //TODO: check unicity of the id
                var modelStringified = JSON.stringify(application);
                //If the id is already present in the stringified it COULD mean that is already used. Improve this
                if (modelStringified.indexOf(""+newId+"")>0){
                    alert("This ID seems to be already used by another component");
                    return;
                }
                application = {};
                var reOldKey = new RegExp(oldAttr,"g");
                modelStringified = modelStringified.replace(reOldKey, ""+newId+"");
                application = JSON.parse(modelStringified);
                //BETTER IDEA: stringify all the model, change all references to the old id with the new id, restore model (eliminate in this way all dependancies)
            //}
            //Front end update
            $("#"+oldAttr).attr("id",newId);
            if(!compWin) $("#"+newId).find("span").text(newId); //if starting window put starting window

            //Update panel. The simplest way to do it's close it!
            $("#propertyPanel").hide();
        }
            break;
        case "class": //similar to ID
            break;
        case "other":{
            if(property!="text") $("#"+oldAttr).attr(""+property+"",this.value);    //CHECK THIS
            else $("#"+oldAttr).text(this.value);
            application.screens[""+winId+""].components[""+oldAttr+""].specificAttributes[""+property+""] = this.value;

        }

    }

}


function buildPropertiesPanel(winId,compId){
  var styles = `<section style="max-height:200px; overflow: scroll">
                                            <table>
                                                <tbody>`;

  var attributeToSearch;
  if (!compId) attributeToSearch = application.screens[winId];
  else attributeToSearch = application.screens[winId].components[compId];

  for(var i=0;i<supportedCSS.length;i++){
      var property = supportedCSS[i];
      var propertyValue = $("#"+attributeToSearch.id).css(property);
      styles += `<tr>
                    <td>`+property+`</td>
                    <td style="float:right;">
                        <input type="text" value='`+propertyValue+`' onchange="setNewCss.call(this,event,'`+attributeToSearch.id+`','`+property+`');"/>
                    </td>
                </tr>`;
  }
  styles +=        `</tbody>
                </table>
            </section>`;


  var attributes = `<table>
            <tbody>
                <tr>
                    <td> ID </td>
                    <td style="float:right;">
                        <input type="text" value="`+attributeToSearch.id+`" onchange="setNewAttr.call(this,event,'id','`+attributeToSearch.id+`',`+compId+`,`+winId+`)"/>
                    </td>
                </tr>
                <tr>
                    <td> Class </td>
                    <td style="float:right;"><input type="text" placeholder="unset" /></td>
                </tr>`;
  if (!compId){ attributes+=`              
                <tr>
                    <td> Layout </td>
                    <td style="float:right;">
                        <select id="layoutSelector">
                            <option value="stackLayout">StackLayout</option>
                            <option value="absoluteLayout">AbsoluteLayout</option>
                            <option value="gridLayout">GridLayout</option>
                            <option value="dockLayout">DockLayout</option>
                            <option value="wrapLayout">WrapLayout</option>
                        </select>
                    </td>
                </tr>`;
                var checked = "";
                if (attributeToSearch.isStartingWindow) checked="checked='checked'";
                attributes+=`<tr>
                    <td> Starting Window </td>
                    <td style="float:right;">
                        <input type="checkbox" id="checkStartingWindow" `+checked+`"/>
                    </td>
                </tr>

`; //Insert here other window-specific attributes
        }else for(var i in attributeToSearch.specificAttributes){
        attributes+=`              
                <tr>
                    <td>`+i+`</td>
                    <td style="float:right;">
                        <input type="text" value="`+attributeToSearch.specificAttributes[i]+`" onchange="setNewAttr.call(this,event,'other','`+attributeToSearch.id+`','`+compId+`','`+winId+`','`+i+`')"/>
                    </td>
                </tr>`;
    }
  attributes +=`
            </tbody>
        </table>`;
  var actions = `<table>
            <tbody>`;
  //console.log("windId: "+winId+" compID:"+compId);
  for (var i in attributeToSearch.supportedActions){
      if(!application.screens[""+winId+""].components[""+compId+""].actions[""+attributeToSearch.supportedActions[i]+""])  //Action not yet assigned
        actions += `
                <tr>
                    <td> `+attributeToSearch.supportedActions[i]+` </td>
                    <td style="float:right;"><input type="button" onclick="drawLine.call(this,event,'`+compId+`','`+winId+`','`+attributeToSearch.supportedActions[i]+`');"/></td>
                </tr>
                `;
      else
         actions += `
            <tr>
                <td> `+attributeToSearch.supportedActions[i]+` </td>
                <td style="float:right;"><button onclick="deleteAction.call(this,event,'`+compId+`','`+winId+`','`+attributeToSearch.supportedActions[i]+`')"> ENABLED </button></td>
            </tr>
            `;

    }
    actions+=`
            </tbody>
        </table>`
  var containingWindow;
  if (!compId) containingWindow = null;
    else containingWindow = winId;
  var panelDetailContent = `
        <h1 id="titlePanelDetail">`+attributeToSearch.id+`</h1>
        <h3>`+attributeToSearch.type+`</h3>

        <h2> Attributes </h2>
    `+attributes+`
        <h2> Styles </h2>
    `+styles+`
        <h2> Actions </h2>
    `+actions+`
         <input value="DELETE" type="submit" onclick="deleteElement('`+attributeToSearch.id+`','`+containingWindow+`');">`;

  $("#properties").html(panelDetailContent); 

  $("#layoutSelector").change(function(){
      application.screens[winId].layout = this.value;
      removeAllLayoutClasses($("#"+winId));
      removeAllLayoutClasses($("#"+winId).find(".drawn-element"));
      $("#"+winId).addClass(this.value);
      $("#"+winId).find(".drawn-element").addClass(this.value);
      $("#"+winId).find(".drawn-element").css("position","");
      //Elements should be resizable in certain layout
      /*if ((this.value=="absoluteLayout")||(this.value=="wrapLayout"))
        $(".drawn-element").resizable();*/

      //Some components cannot be visualized in some layouts!
      if (this.value != "stackLayout")  //Put here safe layouts
        if (($("#"+winId).find(".searchbar").length + 0) > 0)    //Replace 0 with the class of other "dangerous" components
          createPopover("Warning","Some components cannot be visualized in the selected layout");

  });

  $("#checkStartingWindow").change(function(){
      application.startingScreen = winId;
      //eliminate flag for all the other windows
      for (var i in application.screens){
          if (i==winId) continue;
          application.screens[i].isStartingWindow = false;
          $("#"+i).find("span").text(i);
      }
      application.screens[winId].isStartingWindow = true;
      $("#"+winId).find("span").text(winId+" (Starting Window)");

  });


  $("#layoutSelector").val(application.screens.win0.layout);                
  $("#layoutSelector").change();


}



function removeAllLayoutClasses(element){
      element.removeClass("stackLayout");
      element.removeClass("gridLayout");
      element.removeClass("absoluteLayout");
      element.removeClass("dockLayout");
      element.removeClass("wrapLayout");
}

//TODO: remove following function
function setSelectionBox(elementToWrap){
    $("#selector").css("top",""+(parseFloat(elementToWrap.target.style.top)-3.0)+"")
    $("#selector").css("left",""+(parseFloat(elementToWrap.target.style.left)-3.0)+"");
    $("#selector").css("width",elementToWrap.target.style.width);
    $("#selector").css("height",elementToWrap.target.style.height);
}

//TODO: remove following function
function createPopover(title, description){
    $("#popover").remove();
    $("body").prepend(`
        <div id="popover">
            <h1>`+title+`</h1>
            <h2>`+description+`</h2>
        </div>`);
}

//TODO: check if the following funtion is useful
function normalizePosition(oldPosition){
    //Position should take care of the current zoom level of canvas
    return oldPosition*parseFloat($("#mainContent").css("zoom"));
}

function selectElement(element,window){
    console.log("parameters received: "+element.id+" "+window.id);
    if (element.id.substring(0,3)=="win"){
              buildPropertiesPanel(""+element.id+"",null);
              //setSelectionBox(sender)
              $("#propertyPanel").show();
          }else{
              buildPropertiesPanel(""+window.id+"",""+element.id+"");
              $("#propertyPanel").show(); 
          }
    selectInModelExplorer(element.id); //BIG PROBLEMS HERE
    $(".drawn-element").removeClass('selected-element');
    if(!$(element).hasClass("header"))
        $(element).addClass('selected-element');
}

function initializeWindowEvents(){
    dirty = false;

    /*FIX FOR JQUERY UI ZOOM BUG

    $.ui.ddmanager.prepareOffsets = function( t, event ) {
    var i, j,
        m = $.ui.ddmanager.droppables[ t.options.scope ] || [],
        type = event ? event.type : null, // workaround for #2317
        list = ( t.currentItem || t.element ).find( ":data(ui-droppable)" ).addBack();

    droppablesLoop: for ( i = 0; i < m.length; i++ ) {

        // No disabled and non-accepted
        if ( m[ i ].options.disabled || ( t && !m[ i ].accept.call( m[ i ].element[ 0 ], ( t.currentItem || t.element ) ) ) ) {
            continue;
        }

        // Filter out elements in the current dragged item
        for ( j = 0; j < list.length; j++ ) {
            if ( list[ j ] === m[ i ].element[ 0 ] ) {
                m[ i ].proportions().height = 0;
                continue droppablesLoop;
            }
        }

        m[ i ].visible = m[ i ].element.css( "display" ) !== "none";
        if ( !m[ i ].visible ) {
            continue;
        }

        // Activate the droppable if used directly from draggables
        if ( type === "mousedown" ) {
            m[ i ]._activate.call( m[ i ], event );
        }

        m[ i ].offset = m[ i ].element.offset();
        m[ i ].proportions({ width: m[ i ].element[ 0 ].offsetWidth * parseFloat($("#mainContent").css("zoom")).currentZoom, height: m[ i ].element[ 0 ].offsetHeight * parseFloat($("#mainContent").css("zoom")) });
    }

    };*/



    $(".window").draggable();
      //DetailPanel
      $(".window").click(function(sender){
          control = sender;
          selectElement(sender.target,this);
          /*
          if (sender.target.id.substring(0,3)=="win"){
              buildPropertiesPanel(""+sender.target.id+"",null);
              //setSelectionBox(sender)
              $("#propertyPanel").show();
          }else{
     //       console.log(sender);

              buildPropertiesPanel(""+this.id+"",""+sender.target.id+"");
              //setSelectionBox(sender)

              $("#propertyPanel").show(); 
          }*/
      });
      $(".window").droppable({
                      drop: function( event, ui ) {
                          //This function controls what happens when dropping an element in a Window
                          //2 behaviour to analyze:
                          //1) a component is taken from component panel
                          //2) an already present component get moved

                          //1) the ui.draggable[0] has "component" class
                          dirty = true;
                          x = ui.draggable[0];
                          if ($.inArray("component", ui.draggable[0].classList)>=0){
                            console.log("Dropping element!");
                            var id = "";
                            var componentHTML = "";
                            var type = $(ui.draggable[0]).find(".component-title").text();
                            //TODO: Create better ID
                            componentsCounter++;
                            id = type+componentsCounter;
                            var layout = application.screens[this.id].layout;
                            switch (type){
                                    //Strategy to offer a good visualization: try to build html elements that resemble the one in the mobile. If not possible, use div and proper backgrounds

                                  case "Label": 
                                      componentHTML = "<div id='"+id+"' class='drawn-element label  "+layout+" "+platformToPreview+"'>Label</div>";
                                      break;        
                                  case "Button":
                                      componentHTML = "<button id='"+id+"' class='drawn-element button "+layout+" "+platformToPreview+"' value='Button'>Button</button>";
                                      break;
                                  case "TextField":
                                      componentHTML = "<input type='text' id='"+id+"' class='drawn-element textfield "+layout+" "+platformToPreview+"' value='Insert Text Here'/>";
                                      break;
                                  case "TextView":
                                      componentHTML="<input type='textarea' id='"+id+"' class='drawn-element textarea "+layout+" "+platformToPreview+"' value='Insert Multiline Text Here'/>";
                                      break;
                                  case "SearchBar":
                                      componentHTML = "<input type='search' id='"+id+"' class='drawn-element searchbar "+layout+" "+platformToPreview+"' value='Search Here'/>";
                                      break;
                                  case "Switch":            //WATCH THE SWITCH!
                                      componentHTML = "<input type='checkbox' id='"+id+"' checked='checked' class='drawn-element switch "+layout+" "+platformToPreview+"'/>";
                                      break;
                                  case "Slider":
                                      componentHTML = "<div id='"+id+"' class='drawn-element slider "+layout+" "+platformToPreview+"' value='50'></div>";
                                      break;
                                  case "Progress":
                                      componentHTML = "<progress id='"+id+"' class='drawn-element progress "+layout+" "+platformToPreview+"'/>";
                                      break;
                                  case "ActivityIndicator":
                                      componentHTML = "<div id='"+id+"' class='drawn-element activity-indicator "+layout+" "+platformToPreview+"'></div>";
                                      break;
                                  case "Image":
                                      componentHTML = "<img id='"+id+"' class='drawn-element image "+layout+" "+platformToPreview+"'/>";
                                      break;
                                  case "ListView":      //MANAGE LISTVIEWS!
                                      componentHTML = "<div id='"+id+"' class='drawn-element listview "+layout+" "+platformToPreview+"'/>";
                                      break;
                                  case "HtmlView":
                                      componentHTML = "<iframe id='"+id+"' class='drawn-element htmlview "+layout+" "+platformToPreview+"'></iframe>";
                                      break;
                                  case "WebView":
                                      componentHTML = "<iframe id='"+id+"' class='drawn-element htmlview "+layout+" "+platformToPreview+"'></iframe>";
                                      break;
                                  case "TabView":
                                      componentHTML = "<div id='"+id+"' class='drawn-element tabview "+layout+" "+platformToPreview+"'></div>";
                                      break;
                                  case "SegmentedBar":
                                      componentHTML = "<div id='"+id+"' class='drawn-element segmentedBar "+layout+" "+platformToPreview+"'></div>";
                                      break;
                                  case "DatePicker":
                                      componentHTML = "<div id='"+id+"' class='drawn-element datepicker "+layout+" "+platformToPreview+"'></div>";
                                      break;
                                  case "TimePicker":
                                      componentHTML = "<div id='"+id+"' class='drawn-element timepicker "+layout+" "+platformToPreview+"'></div>";
                                      break;
                                  case "ListPicker":
                                      componentHTML = "<div id='"+id+"' class='drawn-element listpicker "+layout+" "+platformToPreview+"'></div>";


                                  default:
                                      console.log("Component not visualizable inside window");

                          }
                          //$(componentHTML).addClass(application.screens[this.id].layout);
                          //console.log(platformToPreview);
                          //$(componentHTML).addClass(platformToPreview);
                          //Checkboxes have a different behaviour
                          if ($(componentHTML).attr("type")=="checkbox")
                              componentHTML += "<label for='"+$(componentHTML).attr("id")+"'></label>";
                          $(this).append(componentHTML);
                          //Update Model
                          //Setting a property via constructor
                          var component = new model.Component (id,type);
                          //Creation of an attribute at run time:
                          application.screens[this.id].components[""+id+""] = component;
                          application.screens[this.id].numberOfComponents++;
                          //createComponentsExplorer();
                          //$("#modelExplorer").append("<span class='secondLevelModel'>"+id+" - "+type+" </span>");
                          $("#"+id).draggable({ containment: "parent", cancel:false });
                          updateModelExplorer();
                      }else{
                            //Behaviour here to move objects (STACK LAYOUT)
                          switch(layout){

                              case "stackLayout":{
                                  console.log("moved object");
                                  var movingObject = $(ui.draggable[0]).clone();
                                  $(ui.draggable[0]).remove();
                                  var target = document.elementFromPoint(normalizePosition(event.clientX),normalizePosition(event.clientY));
                                  if (!application.screens[""+target.id+""]){
                                      //the target is not a window
                                      $(movingObject).insertAfter(target);
                                      $(movingObject).css("top","0px");
                                      $(movingObject).draggable({ containment: "parent", cancel:false });
                                      //UPDATE MODEL!!!!
                                      //Bottleneck: to update the model we need to rewrite it:
                                      var oldComponentsModule = application.screens[this.id].components;
                                      application.screens[this.id].components = {};
                                      for (var i in oldComponentsModule){
                                          if (oldComponentsModule[i].id == movingObject[0].id) continue;
                                          if (oldComponentsModule[i].id == target.id){
                                              application.screens[this.id].components[i] = oldComponentsModule[i];
                                              application.screens[this.id].components[movingObject[0].id] = oldComponentsModule[movingObject[0].id];
                                          }else{
                                              application.screens[this.id].components[i] = oldComponentsModule[i];
                                          }
                                      }
                                  }else{
                                      //the target is an empty space in a window
                                      $(this).append(movingObject);
                                      $(movingObject).css("top","0px");
                                      $(movingObject).draggable({ containment: "parent", cancel:false  });
                                      //UPDATE MODEL!!!
                                      var toRestore = application.screens[this.id].components[movingObject[0].id];
                                      delete application.screens[this.id].components[movingObject[0].id];
                                      application.screens[this.id].components[movingObject[0].id] = toRestore;
                                  }
                            }
                          }//$(movingObject).insertBefore(document.elementFromPoint(event.clientX,event.clientY));
                          //console.log(document.elementFromPoint(event.clientX,event.clientY));
                        }
                      }
          });

    $(window).on("beforeunload", function() { 
       if(dirty) alert("There are some not saved changes. Do you wish to continue?");
    });

    /*$(".drawn-element").click(function(){
      $(".drawn-element").removeClass('selected-element');
        var selected = document.elementFromPoint(event.clientX,event.clientY);
        $(selected).addClass('selected-element');
        //console.log(this);
    });*/

    $("#mainContent").click(function(event){
        if(document.elementFromPoint(event.pageX,event.pageY).id=="mainContent"){
            $(".drawn-element").removeClass('selected-element');
            $("#propertyPanel").hide();
        }

    });

}



function initialization(config){        //config[1]: working path [it is in 0 position]
   // console.log(config);
    projectName = config[1];
    workingPath = config[2];
    existingPrj = config[3];
    if (!existingPrj) buildNewProject(config);  
    else restoreProjectFromFile();       //Check Indexes
    //$("#loading-panel").hide();
    createFileExplorer();

    /*$('#fileExplorer').fileTree({ root: config[2]+"/"+config[1] }, function(file) {
        alert(file);
    });*/

    document.title += " - "+config[1];



    /*****************************FRONT END*******************************/
    //$("#filePanel").append(config[1]);

    var components = ["Screen","Label","Button","TextField","TextView","SearchBar","Switch","Slider","Progress","ActivityIndicator","Image","ListView","HtmlView","WebView","TabView","SegmentedBar","DatePicker","TimePicker","ListPicker","Dialogs"];

    var componentsDescription = components;

    for(var i=0; i<components.length; i++){
        /*if (i==0) $("#componentsPanel").append("<div class='component ui-widget-content'>Screen</div>");
        else if (i==1) $("#componentsPanel").append("<div class='component ui-widget-content'>TEXT</div>");
        else $("#componentsPanel").append("<div class='component ui-widget-content'>Component "+i+"</div>");*/
        $("#componentsContainer").append(`
                    <div class='component ui-widget-content'>
                        <div class="component-preview" style="background-image: url('img/components-icons/`+components[i]+`.png');" ></div>
                        <div class="component-title">`+components[i]+`</div>
                        <div class="component-description">`+componentsDescription[i]+`</div>
                    </div>`);
    }


    $( ".component" ).draggable({
        opacity: 0.7,
        helper: "clone",
    });
    $( "#mainContent" ).droppable({
      drop: function( event, ui ) {

          //switch (ui.draggable[0].innerText){
          switch ($(ui.draggable[0]).find(".component-title").text()){
              case "Screen": {
                  var leftOffset = normalizePosition(ui.position.left - $("#componentsPanel").width());
                  var newId = application.numberOfScreens;
                  var newScreen = new model.Screen("win"+newId);
                  application.screens["win"+newId] = newScreen;
                  application.numberOfScreens++;
                  var firstWindowString = ""; 
                  if (application.numberOfScreens==1){ 
                      firstWindowString = "(Starting Window)";
                      application.startingScreen = "win"+newId;
                      application.screens["win"+newId].isStartingWindow = true;
                  }
                  var sampleWindow = `<div id='win`+newId+`' class='window drawn-element `+platformToPreview+`' style='top:`+normalizePosition(ui.position.top)+`; left: `+leftOffset+`;'>
                                      <span>win`+newId+` `+firstWindowString+`</span>
                                      <div class="header drawn-element `+platformToPreview+`"></div>
                                      </div>`;
                  //$(sampleWindow).appendTo($(this));
                  $("#mainContent").append(sampleWindow);
                  //createComponentsExplorer();
                 // $("#modelExplorer").append("<span class='firstLevelModel'>win"+newId+" - Window </span>");
                  initializeWindowEvents();
                  updateModelExplorer();

          //ui.draggable.clone().appendTo($(this)).draggable();

      }

     }}});


}

function deleteAction(event, compId, winId,action){
    dirty = true;
    application.screens[""+winId+""].components[""+compId+""].actions[""+action+""] = null;
    this.text = "";
}

var lineActive = false;
function drawLine(event, compId, winId,action){
    console.log(event);
    //console.log(sender);
    console.log(compId);
    console.log(winId);

    var findElementAtClickListener = function(event){
        dirty = true; //Not really true, true if we find something to bind
        $("#svg-container").remove();
        console.log(event);
        //bindAction(document.elementFromPoint(event.clientX,event.clientY),compId,winId);
        console.log("win "+winId+" comp: "+compId);
        application.screens[""+winId+""].components[""+compId+""].isDynamic = true;
        application.screens[""+winId+""].components[""+compId+""].actions[""+action+""] = document.elementFromPoint(event.clientX,event.clientY).id;
        //console.log(document.elementFromPoint(event.clientX,event.clientY));
        lineActive = false;
        document.onmousemove = null;

        // ARROW
        var x1 = parseFloat($("#"+winId).css("left"))+parseFloat($("#"+winId).css("width"));
        var y1 = (parseFloat($("#"+winId).css("top"))+parseFloat($("#"+winId).css("height")))/2;
        var x2= parseFloat($("#"+document.elementFromPoint(event.clientX,event.clientY).id).css("left"));
        var y2= (parseFloat($("#"+document.elementFromPoint(event.clientX,event.clientY).id).css("top"))+ parseFloat($("#"+document.elementFromPoint(event.clientX,event.clientY).id).css("height")))/2;
        x2 -= 20; //To manage arrow

        if (x2>0)  //No sense if it is negative.    
            $("#mainContent").prepend(`
                <svg id="createGoodId" style="z-index: 0;" class="action-arrow" height="100%" width="100%" style="position: absolute;">
                   <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L0,6 L9,3 z" fill="rgb(0,0,255)"></path>
                    </marker>
                  </defs>
                  <line id="lineAction" x1="`+x1+`" y1="`+y1+`" x2="`+x2+`" y2="`+y2+`" style="stroke:rgb(0,0,255);stroke-width:2" marker-end="url(#arrow)"></line>
                </svg>
                        `);

        $("body").unbind("click",findElementAtClickListener);
    }

    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        var dot, eventDoc, doc, body, pageX, pageY;

        event = event || window.event; // IE-ism

        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
              (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
              (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
              (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
              (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        // Use event.pageX / event.pageY here
       // console.log(event.pageX+" "+event.pageY);
        if(!lineActive){

         $("body").prepend(`
            <svg id="svg-container" height="100%" width="100%" style="position: absolute;">
              <line id="lineAction" x1="`+event.clientX+`" y1="`+event.clientY+`" x2="200" y2="200" style="stroke:rgb(0,0,255);stroke-width:2" />
            </svg>
                    `);
            lineActive = true;
        }else{
            document.getElementById("lineAction").setAttribute("x2",event.pageX);
            document.getElementById("lineAction").setAttribute("y2",event.pageY);
        }

        /*
        $("body").click(function(event){
            $("#svg-container").remove();
            console.log(document.elementFromPoint(event.clientX,event.clientY));
            lineActive = false;
            document.onmousemove = null;
        })*/
        if (lineActive)  $("body").bind("click","body",findElementAtClickListener);

    }

}

function createCodeEditor(){
    $("#mainContent").html("<input type='textarea' id='code' style='width:100%; height: 100%'/>");
     codeEditor = CodeMirror.fromTextArea($("#code")[0], {
        lineNumbers: true,
        mode: "htmlmixed",
        viewportMargin: Infinity,
        lineWrapping: true,
        theme: "lesser-dark",

    });      
    codeEditor.refresh();
    //$("#mainContent").css("overflow","hidden");
    $(".CodeMirror-scroll").css("height",parseInt($("#mainContent").css("height"))-34);
    //TODO: CHANGE SIZE ON RESIZE
}   