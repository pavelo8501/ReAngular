import { AnimatedContainerComponent } from "../animated-container.component";
import { IAnimationHandler } from "@pavelo8501/data-helpers";

export class ContainerHandler implements IAnimationHandler {

   
    constructor(
       private hostingContainer:AnimatedContainerComponent
    ){
      
    }

    bindContainer(container:AnimatedContainerComponent){
        this.hostingContainer = container
    }

    fadeOut(){
        this.hostingContainer.fadeOut()
    }

    popup(){
        this.hostingContainer.popup()
    }

}