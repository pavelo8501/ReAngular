import { AnimatableBase, IAnimationHandler } from "@pavelo8501/data-helpers";
import { AnimatedContainerComponent } from "../animated-container.component";


export class ContainerHandler implements IAnimationHandler {

   
    constructor(
       private hostingContainer:AnimatedContainerComponent
    ){
      
    }

    bindContainer(container:AnimatedContainerComponent){
        this.hostingContainer = container
    }

    hide(receiver:AnimatableBase){
        this.hostingContainer.notifiedHide(receiver)
    }

    show(receiver:AnimatableBase){
        this.hostingContainer.notifiedShow(receiver)
    }

    fadeOutContainer(){
       this.hostingContainer.fadeOut()
    }

    popupContainer(){
        this.hostingContainer.popup()
    }

    popupShowingbyIndex(placeholderIndex: number){
       this.hostingContainer.popupShowingbyIndex(placeholderIndex)
   }

   popupShowing(caller:AnimatableBase){
         this.hostingContainer.popupShowing(caller)
   }

}