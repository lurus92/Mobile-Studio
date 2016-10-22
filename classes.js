class Application {
    constructor(){
        this.screens= new Array();
    }
}


class Screen {
    constructor(id){
        this.id=id;
        this.customProperty= 1;         //example of property;
        this.components = new Array();
        
        this.layout = "defaultLayout";
        
        
    }
}

class Component {
    constructor(id, type){
        this.id = id;
        this.type = type;
        this.customProperty= 1;         //example of property;
    }
}

module.exports = {
    Application,
    Screen,
    Component,
};