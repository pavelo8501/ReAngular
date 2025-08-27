import { Component, effect, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContainerEventType, ContainerState} from './../../../common/enums';
import { RenderingBlockPayload} from '../../classes';
import { ContainerEvent} from "./../../models"
import { ContainerProviderService, TypedCallbackProvider } from "./../../../common/services"

@Component({
  selector: 'vc-rendering-block',
  imports: 
  [
    CommonModule, 
    FormsModule
  ],
  templateUrl: "./rendering-block.component.html",
  styleUrls: ['./rendering-block.component.css', "./../../../styles/buttons.css"]
})
export class RenderingBlockComponent<T extends object> {

  ContainerState = ContainerState

  payload =  model.required<RenderingBlockPayload<T>>()
  name:string = ""
  classes:string[] = []
  htmlContent:string = ""

  containerState = signal<ContainerState>(ContainerState.IDLE)
 
  provider : TypedCallbackProvider<ContainerEvent<T>, boolean>

  constructor(
    service : ContainerProviderService<ContainerEvent<T>, boolean>
  ){
    this.provider = service.provider
    
    effect(()=>{

      const payload = this.payload()
      this.name = payload.nameDelegate.get()
      this.classes = payload.classes
      this.htmlContent = payload.contentDelegate.get()
    })
     
  }

  canSelect:boolean = true
  

  private createEvent(eventType : ContainerEventType):ContainerEvent<T>{
     return  new ContainerEvent(this.payload().receiver , eventType)
  }

  setContinerState(state :ContainerState){
      this.containerState.set(state)
      this.payload().notifyContainerStateChanged(state)
  }

  onClicked(event: MouseEvent){

     event.preventDefault()
     event.stopPropagation()

     const state = this.containerState()
 
      this.provider.send(this.createEvent(ContainerEventType.ON_CLICK)).then(result => {
          if(result){
             console.log("onClicked received confirmed")
             this.setContinerState(ContainerState.SELECTED) 
          }else{
             console.log("onClicked received refusal")
          }
      })
  }

  editBtnClick(event: MouseEvent){
      event.preventDefault()
      event.stopPropagation()
      this.provider.send(this.createEvent(ContainerEventType.ON_EDIT)).then(result => {
        this.setContinerState(ContainerState.EDIT)
      })
  }

  saveBtnClick(event: MouseEvent){
      event.preventDefault()
      event.stopPropagation()
      this.provider.send(this.createEvent(ContainerEventType.SAVE)).then(result => {
      if(result){
         this.setContinerState(ContainerState.IDLE)
      }
  })
  }

  cancelBtnClick(event: MouseEvent){
    event.preventDefault()
    event.stopPropagation()
    this.provider.send(this.createEvent(ContainerEventType.CANCEL)).then(result => {
      if(result){
        this.setContinerState(ContainerState.IDLE)
      }
    })
  }
}
