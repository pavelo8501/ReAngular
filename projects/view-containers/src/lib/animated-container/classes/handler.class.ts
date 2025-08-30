import { AnimatableBase, CallbackRegistry, IAnimationHandler } from "@pavelo8501/data-helpers";
import { AnimatedContainerComponent } from "../animated-container.component";


export class ContainerHandler implements IAnimationHandler {

    saveRequest: CallbackRegistry = new CallbackRegistry("SaveRequests")
    cancelRequest: CallbackRegistry = new CallbackRegistry("CancelRequests")
   
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
        console.log("Show request from")
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

    subscribeSaveRequest(subscriber:any, callback:()=>void){
       this.saveRequest.subscribe(subscriber, callback) 
    }

    subscribeCancelRequest(subscriber:any, callback:()=>void){
      this.cancelRequest.subscribe(subscriber, callback)
    }

}