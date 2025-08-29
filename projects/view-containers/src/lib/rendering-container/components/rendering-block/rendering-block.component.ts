import { Component, effect, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContainerEventType, ContainerState, HtmlTag} from './../../../common/enums';
import { RenderingBlockPayload} from '../../classes';
import { ContainerEvent} from "./../../models"
import { ContainerProviderService, TypedCallbackProvider } from "./../../../common/services"
import { ImageViewerComponent, ImageData } from "@pavelo8501/form-controls";

@Component({
  selector: 'vc-rendering-block',
  imports: [
    CommonModule,
    FormsModule,
    ImageViewerComponent
],
  templateUrl: "./rendering-block.component.html",
  styleUrls: ['./rendering-block.component.css', "./../../../styles/buttons.css"]
})
export class RenderingBlockComponent<T extends object> {

  ContainerState = ContainerState
  HtmlTag = HtmlTag

  payload =  model.required<RenderingBlockPayload<T>>()

  htmlTag:HtmlTag = HtmlTag.PARAGRAPH
  name:string = ""
  classes:string[] = []

  content = model<string>("")
  containerState = signal<ContainerState>(ContainerState.IDLE)

  imageData?:ImageData
 
  provider : TypedCallbackProvider<ContainerEvent<T>, boolean>

  constructor(
    service : ContainerProviderService<ContainerEvent<T>, boolean>
  ){
    this.provider = service.provider
    
    effect(()=>{

      const payload = this.payload()

      this.htmlTag = payload.htmlTag
      this.name = payload.nameDelegate.get()
      this.classes = payload.classes

      if(this.htmlTag == HtmlTag.IMAGE){
        this.imageData = ImageData.fromJson(payload.contentDelegate.get())
      }

       payload.contentDelegate.subscribe(
        (newValue, oldValue)=>{
            console.log(`contentDelegate subscription fired with value ${newValue}`)
            this.content.set(newValue)
        }
       )
      this.content.set(payload.contentDelegate.get())
    })
  }

  canSelect:boolean = true
  
  private createEvent(eventType : ContainerEventType):ContainerEvent<T>{
     return  new ContainerEvent(this.payload(), eventType)
  }

  setContinerState(state :ContainerState){
      this.containerState.set(state)
      this.payload().notifyContainerStateChanged(state)
  }

  onClicked(event: MouseEvent){
      event.preventDefault()
      event.stopPropagation()
      this.provider.send(this.createEvent(ContainerEventType.ON_CLICK)).then(result => {
          if(result){
              this.setContinerState(ContainerState.SELECTED) 
          }else{
              console.log("onClicked received refusal")
          }
      })
  }
}
