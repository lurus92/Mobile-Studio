/************THIS FUNCTION WILL CONVERT THE HTML LAYOUT TO A NATIVESCRIPT LAYOUT*************/


function translate(application){
    //For each screen we have to build a NS page
    var pageArray = new Array ();  //we should create a new File for each page
    for (var i in application.screens){
        pageArray.push(translateScreen(application.screens[i]));
    }
    return pageArray;
}
           
           
function translateScreen(screen){
    switch (screen.layout){
        case "stackLayout":
            return `<Page id="`+screen.id+`" loaded="loadView`+screen.id+`">
                        <StackLayout>
                            `+translateComponents(screen)+`
                        </StackLayout>
                    </Page>`;
            //return concat("x","y");
            break;
        case "wrapLayout":
            return `<Page id="`+screen.id+`" loaded="loadView`+screen.id+`">
                        <WrapLayout>
                            `+translateComponents(screen)+`
                        </WrapLayout>
                    </Page>`;
            //return concat("x","y");
            break;
        case "absoluteLayout":
            return `<Page id="`+screen.id+`" loaded="loadView`+screen.id+`">
                        <AbsoluteLayout>
                            `+translateComponents(screen)+`
                        </AbsoluteLayout>
                    </Page>`;
        default: alert("Cannot translate layout.");
        
        /*default:
            return "<Page>"+translateComponents(screen)+"</Page>" */
    }                          
}
                

function translateComponents(screen){
    //For each component we must do a translation
    var componentsTranslated = "";
    //for (var i = 0; i<screen.components.length; i++){
    for (var i in screen.components){
        switch (screen.components[i].type){
            case "Label":
                componentsTranslated += `
                        <Label id="`+screen.components[i].id+`" text="`+screen.components[i].specificAttributes["text"]+`" />
                        `;
                break;
            case "Button":{
                var actionsPointers = "";
                if (screen.components[i].actions)
                    for(var j in screen.components[i].actions)
                        actionsPointers = actionsPointers+j+"='"+j+"Action' ";
                componentsTranslated += `
                        <Button id="`+screen.components[i].id+`" text="`+screen.components[i].specificAttributes["text"]+`" `+actionsPointers+` />
                        `;
                }
                break;
            case "TextField": 
                componentsTranslated += `
                        <TextField id="`+screen.components[i].id+`" text="`+screen.components[i].specificAttributes["text"]+`" />
                        `;
                break;
            case "TextView": componentsTranslated += `
                        <TextView id="`+screen.components[i].id+`" text="`+screen.components[i].specificAttributes["text"]+`" />
                        `;
                break;
            case "SearchBar": componentsTranslated += `
                        <SearchBar id="`+screen.components[i].id+`" text="`+screen.components[i].specificAttributes["text"]+`" />
                        `;
                break;
            case "Switch": componentsTranslated += `
                        <Switch id="`+screen.components[i].id+`" checked="`+screen.components[i].specificAttributes["set"]+`" />
                        `; 
                break;
            case "Slider": componentsTranslated += `
                        <Slider id="`+screen.components[i].id+`" value="`+screen.components[i].specificAttributes["value"]+`" />
                        `; 
                break;
            case "Progress": componentsTranslated += `
                        <Progress id="`+screen.components[i].id+`" value="`+screen.components[i].specificAttributes["value"]+`" />
                        `; 
                break;
                //Check activityIndicator busy property
            case "ActivityIndicator": componentsTranslated += `
                        <ActivityIndicator id="`+screen.components[i].id+`" busy="`+screen.components[i].specificAttributes["busy"]+`" />
                        `;
                break;
            case "Image": componentsTranslated += `
                        <Image id="`+screen.components[i].id+`" src="`+screen.components[i].specificAttributes["src"]+`" />
                        `; 
                break;
            //PUT SOMETHING IN LIST! (access to listElements array in model)
            case "ListView": componentsTranslated += `
                        <ListView id="`+screen.components[i].id+`" />
                        `; 
                break;
            case "HtmlView": componentsTranslated += `
                        <HtmlView id="`+screen.components[i].id+`" html="`+screen.components[i].specificAttributes["html"]+`" />
                        `; 
                break;
            case "WebView": componentsTranslated += `
                        <WebView id="`+screen.components[i].id+`" src="`+screen.components[i].specificAttributes["src"]+`" />
                        `; 
                break;
            //PUT SOMETHING IN TABVIEW! (access to tabs array in model)
            case "TabView": componentsTranslated += `
                        <TabView id="`+screen.components[i].id+`"/>
                        `; 
                break;
            //PUT SOMETHING IN SegmentedBar! (access to items array in model)
            case "SegmentedBar": componentsTranslated += `
                        <SegmentedBar id="`+screen.components[i].id+`"/>
                        `; 
                break;
            case "DatePicker": componentsTranslated += `
                        <DatePicker id="`+screen.components[i].id+`"/>
                        `; 
                break;
            case "TimePicker": componentsTranslated += `
                        <TimePicker id="`+screen.components[i].id+`"/>
                        `; 
                break;
            //PUT SOMETHING IN ListPicker! (access to items array in model)
            case "ListPicker": componentsTranslated += `
                        <ListPicker id="`+screen.components[i].id+`"/>
                        `; 
                break;
                
                
            default: componentsTranslated+="";    
        }
    }
    return componentsTranslated;
} 


function translateScreenStyle(screen){
    var allStyles = $("#"+screen.id+"").attr("style");
    //We have ALL the styles of the window, also the unnecessary ones needed to position itself in the editor
    var allStyles = allStyles.split(";");
    var usefulStyles = "";
    //The useful styles starts at 6th position REALLY??? NO. Translate all Style.
    for (var i = 0; i<allStyles.length; i++) usefulStyles+= (allStyles[i]+";");
    var styleWindow=`#`+screen.id+`{
                `+usefulStyles+`
            }`;
    var styleComponents = "";
    for (var i in screen.components){
        if(!$("#"+i+"").attr("style")) continue;
        styleComponents +=`
            #`+i+`{
                `+$("#"+i+"").attr("style")+`
            }`;
    }
    return styleWindow+`
            `+styleComponents;
}

function translateActions(screen){
   var js = `var view = require("ui/core/view");
             var frame = require("ui/frame");  //Frame that allows navigation

            function onLoad(args) {
                var page = args.object;
            `
   for (var i in screen.components){
       //FOR NOW WE ONLY HANDLE TAP ON BUTTONS
       if (screen.components[i].isDynamic){
            js += `var `+i+`=view.getViewById(page, "`+i+`");`;
            /*for (action in screen.components[i].actions)    //We handle multiple actions per element
                switch (action){                            //We consider only navigation to different pages
                   case "onclick": js+=`
                        `+i+`.on("tap", function(){
                            frame.topmost().navigate({moduleName: "`+screen.components[i].actions[action]+`"});
                        });`
                   break;
                   default: js+="";*/
              // }
                        
        }
   }
        js += `}
                exports.loadView`+screen.id+` = onLoad;`
        

        //Actions at the end!
        if (screen.components[i].actions)
            for (action in screen.components[i].actions)    //We handle multiple actions per element
                switch(action){
                    case "tap":  js += `
                        exports.`+action+`Action = function (args){
                            frame.topmost().navigate({moduleName: "`+screen.components[i].actions[action]+`"});
                        }`

                }
           
        
        return js;
}