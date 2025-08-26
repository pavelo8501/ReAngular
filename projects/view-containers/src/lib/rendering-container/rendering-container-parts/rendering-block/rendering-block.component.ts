import { Component, effect, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContainerEventType, ContainerState} from './../../../common/enums';
import { RenderingBlock} from '../../classes';
import { ContainerEvent, configureCaller } from "./../../models"
import { RenderModelInterface} from '../../interfaces';
import { ContainerProviderService, TypedCallbackProvider } from "./../../../common/services"
import { RenderingItemComponent } from '../rendering-item/rendering-item.component';
import {guard} from "../../../../../../data-helpers/src/public-api"


@Component({
  selector: 'lib-rendering-block',
  imports: 
  [
    CommonModule, 
    FormsModule
  ],
  templateUrl: "./rendering-block.component.html",
  styleUrls: ['./rendering-block.component.css', "./../../../styles/buttons.css"]
})
export class RenderingBlockComponent{

  ContainerState = ContainerState

  renderingBlock  = model.required<RenderingBlock<RenderModelInterface>>()
 
  provider : TypedCallbackProvider<ContainerEvent<RenderModelInterface, string>, boolean>

  get parentContainer (): RenderingItemComponent{
    return this.renderingBlock().parentContainer
  }

  //createEvent = configureCaller(this, this.sourceItem().hostingItem)

  constructor(
    service : ContainerProviderService<ContainerEvent<RenderModelInterface, string>, boolean>
  ){
    this.provider = service.provider
    
    effect(()=>{
        this.createEventParameter = configureCaller(this.renderingBlock(),  this.parentContainer)
    })
     
  }

  // content = computed<string>(()=>{
  //   const source =  this._dataSource
  //   if(source != undefined){
  //     return source.content
  //   }else{
  //     return ""
  //   }
  // })

  //componentKey = computed<string>(()=>{
    // const source =  this._dataSource
    // if(source){
    //   return `${source.htmlTag}|${source.elementId}`
    // }
    // return `HtmlTag|ElementId`
  //})

  containerState = signal<ContainerState>(ContainerState.IDLE)
  classListEdit = model<{key:number, value:string}[]>([])

  componentId = input<string>()
  classList = input<string[]>([])

  canSelect:boolean = true
  

  // private createEvent(eventType : ContainerEventType, message:string = ""):ContainerEvent<T,string>{
  //   return  new ContainerEvent(this, eventType, this.sourceItem().hostingItem, message)
  // }


   createEventParameter? : <P>(eventType: ContainerEventType, payload: P) => ContainerEvent<RenderModelInterface, P>

    get createEvent(): <P>(eventType: ContainerEventType, payload: P) => ContainerEvent<RenderModelInterface, P>{
        
      if(this.createEventParameter){

        return this.createEventParameter
        
        }else{

        throw Error("createEventParameter not yet ready")

        }
    }


  setContinerState(state :ContainerState){
      this.containerState.set(state)
  }



  onClicked = guard(
    (event: MouseEvent)=> {
        event.preventDefault()
        event.stopPropagation()
        const state = this.containerState()
      if(state !=  ContainerState.IDLE){
        return false
      }else{
        return true
      }
    },
    ()=>{
    console.log("Click event registred")

    this.provider.send(this.createEvent(ContainerEventType.ON_CLICK, "")).then(result => {
      if(result == true){
        this.parentContainer.setContinerState(ContainerState.SELECTED)
        this.setContinerState(ContainerState.SELECTED)
        console.log("SELECTING")
      }
      console.log('Parent acknowledged in rendering block:', result);
    })
 })


 editBtnClick = guard(
    (event: MouseEvent)=> {
      event.preventDefault()
      event.stopPropagation()
      if(this.containerState()  != ContainerState.EDIT){
        return  true
      }else{
        return false
      }
    },
    ()=>{
     console.log("Click event editBtnClick registred")
      this.provider.send(this.createEvent(ContainerEventType.ON_EDIT, "")).then(result => {
      if(result){
        this.parentContainer.setContinerState(ContainerState.EDIT)
        this.setContinerState(ContainerState.EDIT)

      }
  })
})

 saveBtnClick = guard(
    (event: MouseEvent)=> {
      event.preventDefault()
      event.stopPropagation()
      if(this.containerState()  != ContainerState.EDIT){
        return  false
      }else{
        return true
      }
    },
    ()=>{
     console.log("Click event editBtnClick registred")

      this.provider.send(this.createEvent(ContainerEventType.SAVE, "")).then(result => {

      if(result){

        this.parentContainer.setContinerState(ContainerState.IDLE)
      }
  })
})




  cancelBtnClick(event: MouseEvent){

    event.preventDefault()
    event.stopPropagation()

    this.provider.send(this.createEvent(ContainerEventType.CANCEL, "")).then(result => {

      if(result){
        this.parentContainer.setContinerState(ContainerState.IDLE)
      }

    })
  }
}
