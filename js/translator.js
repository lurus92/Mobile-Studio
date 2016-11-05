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
            return `<Page id="`+screen.id+`">
                        <StackLayout>
                            `+translateComponents(screen)+`
                        </StackLayout>
                    </Page>`;
            //return concat("x","y");
            break;
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
            case "Button":
                componentsTranslated += `
                        <Button id="`+screen.components[i].id+`" text="`+screen.components[i].specificAttributes["text"]+`" />
                        `;
                break;
            case "TextField": 
                componentsTranslated += `
                        <TextField id="`+screen.components[i].id+`" text="`+screen.components[i].specificAttributes["text"]+`" />
                        `;
                break;
            case "TextView": componentsTranslated += `
                        <TextField id="`+screen.components[i].id+`" text="`+screen.components[i].specificAttributes["text"]+`" />
                        `;
                break;
            case "SearchBar": componentsTranslated += `
                        <SearchBar id="`+screen.components[i].id+`" text="`+screen.components[i].specificAttributes["text"]+`" />
                        `;
                break;
            case "Switch": componentsTranslated += `
                        <SearchBar id="`+screen.components[i].id+`" checked="`+screen.components[i].specificAttributes["set"]+`" />
                        `; 
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
    //The useful styles starts at 6th position
    for (var i = 6; i<allStyles.length-1; i++) usefulStyles+= (allStyles[i]+";");
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