class Application {
    constructor(){
        this.screens = {};
        this.numberOfScreens = 0;
    }
}


class Screen {
    constructor(id){
        this.id=id;
        this.customProperty= 1;         //example of property;
        this.components = {};
        this.numberOfComponents = 0;
        this.layout = "defaultLayout";
        this.style = "";
        
        
    }
}

class Component {
    constructor(id, type){
        this.id = id;
        this.type = type;
        this.customProperty= 1;         //example of property;
        this.specificAttributes = {}
        this.style = "";
        //Specific attributes for specific components
        switch (type){
            case "label": this.specificAttributes["text"] = "label";
                break;
        }
    }
}

module.exports = {
    Application,
    Screen,
    Component,
};