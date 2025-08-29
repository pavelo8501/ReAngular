import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, input, model, signal, viewChildren } from '@angular/core';
import { RenderingBlockPayload, RenderingItemPayload } from './../../classes';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { RenderingBlockComponent } from './../rendering-block/rendering-block.component';
import { ContainerEventType, ContainerState,  ContainerProviderService} from './../../../common';
import { ContainerEvent} from "./../../models"


@Component({
  selector: 'lib-rendering-item',
  imports: [
    CommonModule, 
    FormsModule,
    RenderingBlockComponent
],
  templateUrl: "./rendering-item.component.html",
  styleUrls: ['./rendering-item.component.css', "./../../../styles/buttons.css"],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RenderingItemComponent<T extends object> implements AfterViewInit {

  ContainerState =  ContainerState
  renderBlockComponents = viewChildren(RenderingBlockComponent)

  payload = model.required<RenderingItemPayload<T>>()

  name:string = ""
  caption:string = ""
  classes:string[] = []
  renderingBlockPayloads: RenderingBlockPayload<any>[] = []

  containerState = signal<ContainerState>(ContainerState.IDLE)


  constructor(
    private  service : ContainerProviderService<ContainerEvent<T>, boolean>
  ){
    
    effect(() =>{
        const payload = this.payload()
        this.name = payload.nameDelegate.get()
        this.caption = payload.captionDelegate.get()
        this.classes = payload.classes

        this.renderingBlockPayloads = payload.renderingBlockPayloads

        payload.subscribeStateUpdates(
          state=> {  
              this.containerState.set(state)
            }
        )

        this.renderingBlockPayloads.forEach(renderBlockPayload=>{
          renderBlockPayload.subscribeStateUpdates(
            state=>{
               this.containerState.set(state)
            }
          )
        })
    })
  }

  private createEvent(
    eventType : ContainerEventType,
    childPayload?: RenderingBlockPayload<any>  
  ):ContainerEvent<T>{

    if(childPayload != undefined){
       return  new ContainerEvent(childPayload, eventType)
    }else{
      return  new ContainerEvent(this.payload(), eventType)
    }
  }

  private findSelectedRenderingComponent():RenderingBlockComponent<any>| undefined{
     return this.renderBlockComponents().find(x=>x.containerState() != ContainerState.IDLE)
  }

  setContinerState(state: ContainerState){
      this.containerState.set(state)
      switch(state){
        case ContainerState.IDLE:
          this.renderingBlockPayloads.forEach(x=>x.notifyContainerStateChanged(state))
        break;
      }
  }

  setContainerStateIdle(){
     this.containerState.set(ContainerState.IDLE)
      this.renderBlockComponents().forEach(blockComponent=>{
        blockComponent.setContinerState(ContainerState.IDLE)
      })
  }

  clearRenderingBlocks(){
    this.renderingBlockPayloads = []
  }

  editCssBtnClick(event:MouseEvent){

  }
  editTextBtnClick(event:MouseEvent){
    event.preventDefault()
    event.stopPropagation()

    const renderBlock = this.findSelectedRenderingComponent()
    if(renderBlock != undefined){
        const emitEvent = this.createEvent(ContainerEventType.ON_CONTENT_EDIT, renderBlock.payload())
        console.log("emitEvent created for renderBlock")
        this.service.provider.send(emitEvent).then(result => {
          this.setContinerState(ContainerState.EDIT)
        })
    }else{
        const emitEvent = this.createEvent(ContainerEventType.ON_CONTENT_EDIT)
        console.log("emitEvent created")
        this.service.provider.send(emitEvent).then(result => {
          this.setContinerState(ContainerState.EDIT)
        })
    }
  }
  
  ngAfterViewInit(): void {

  }

 }
