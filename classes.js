class Application {
    constructor(){
        this.screens = {};
        this.numberOfScreens = 0;
        this.startingScreen = "win0";
    }
}


class Screen {
    constructor(id){
        this.id=id;
        this.components = {};
        this.numberOfComponents = 0;
        this.layout = "stackLayout";
        this.style = "";
        this.type = "Window";
        this.isStartingWindow = false;
    }
}

class Component {
    constructor(id, type){
        this.id = id;
        this.type = type;
        this.specificAttributes = {};
        this.supportedActions = [];
        this.actions = {};
        this.isDynamic = false;             //If it is involved in some actions (need to be declared in JS)
        this.style = "";
        //Specific attributes for specific components
        switch (type){
            case "Label": this.specificAttributes["text"] = "Label";
                break;
                case "Button":{
                    this.specificAttributes["text"] = "Button";
                    this.supportedActions = ["tap","doubleTap","longPress"];
                } 
                      break;
                  case "TextField": this.specificAttributes["text"] = "TextField";
                      break;
                  case "TextView": this.specificAttributes["text"] = "TextView";
                      break;
                  case "SearchBar": this.specificAttributes["text"] = "SearchBar";
                      break;
                  case "Switch": this.specificAttributes["set"] = true;
                      break;
                  case "Slider": this.specificAttributes["value"] = 0;
                      break;
                  case "Progress": this.specificAttributes["value"] = 0;      //CHECK OTHER COMPONENTS
                      break;
                  case "ActivityIndicator": this.specificAttributes["busy"] = true;
                      break;
                  case "Image": this.specificAttributes["src"] = "img/mainIcon.png";
                      break;
                  case "ListView": this.specificAttributes["listElements"] = [];
                      break;
                  case "HtmlView": this.specificAttributes["html"] = "";
                      break;
                  case "WebView": this.specificAttributes["src"] = "http://www.google.com/";
                      break;
                  case "TabView": this.specificAttributes["tabs"] = [];
                      break;
                  case "SegmentedBar": this.specificAttributes["items"] = [];
                      break;
                  case "DatePicker": this.specificAttributes["date"] = "";
                      break;
                  case "TimePicker": this.specificAttributes["time"] = "";
                      break;
                  case "ListPicker": this.specificAttributes["items"] = [];
                      break;
                  
                
        }
    }
}

module.exports = {
    Application,
    Screen,
    Component,
};