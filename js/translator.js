/************THIS FUNCTION WILL CONVERT THE HTML LAYOUT TO A NATIVESCRIPT LAYOUT*************/


function translate(application){
    //For each screen we have to build a NS page
    var pageArray = new Array   //we should create a new File for each page
    for (var i = 0; i<application.screens.length; i++){
        pageArray.push(translateScreen(application.screens[i]));
    }
    return pageArray;
}
           
           
function translateScreen(screen){
    switch (screen.layout){
        case "defaultLayout":
            return "<Page><StackLayout>"+translateComponents(screen)+"</StackLayout></Page>";
            //return concat("x","y");
            break;
        /*default:
            return "<Page>"+translateComponents(screen)+"</Page>" */
    }                          
}
                

function translateComponents(screen){
    //For each component we must do a translation
    var componentsTranslated = "";
    for (var i = 0; i<screen.components.length; i++){
        switch (screen.components[i].type){
            case "label":
                componentsTranslated += "<Label id='"+screen.components[i].id+"' text='"+screen.components[i].text+"' />";
                break;
            default: componentsTranslated+="";    
        }
    }
    return componentsTranslated;
}                