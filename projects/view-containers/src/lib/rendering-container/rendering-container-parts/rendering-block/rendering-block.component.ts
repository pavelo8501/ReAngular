import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContainerEventType, ContainerState} from './../../../common/enums';
import { RenderingBlock} from '../../classes';
import { ContainerEvent, configureCaller } from "./../../models"
import { RenderComponentInterface, RenderModelInterface} from '../../interfaces';
import { ContainerProviderService, TypedCallbackProvider } from "./../../../common/services"
import { RenderingItemComponent } from '../rendering-item/rendering-item.component';
import {guard} from "../../../../../../data-helpers/src/public-api"


@Component({
  selector: 'lib-rendering-block',
  imports: [CommonModule, FormsModule],
  templateUrl: "./rendering-block.component.html",
  styleUrl: './rendering-block.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RenderingBlockComponent<T extends RenderModelInterface> implements RenderComponentInterface<T> {

  ContainerState = ContainerState
  private  personalName: string = "RenderingBlockComponent"
  classController  = model.required<RenderingBlock<T>>()


  private _provider? :  TypedCallbackProvider<ContainerEvent<T, string>, boolean> = undefined
  get provider ():  TypedCallbackProvider<ContainerEvent<T, string>, boolean>{
    if(!this._provider){
      throw Error(`RenderingContainerProvider uninitialized in ${this.personalName}`)
    }
    return this._provider
  }

  private _dataSource? : T = undefined
  get dataSource (): T{
    if(!this._dataSource){
      throw Error(`SOURCE uninitialized in ${this.personalName}`)
    }
    return this._dataSource
  }

  get parentContainer (): RenderingItemComponent{
    return this.classController().parentContainer
  }

  //createEvent = configureCaller(this, this.sourceItem().hostingItem)

  createEventParameter? : <P>(eventType: ContainerEventType, payload: P) => ContainerEvent<T, P>
  get createEvent(): <P>(eventType: ContainerEventType, payload: P) => ContainerEvent<T, P>{
    if(this.createEventParameter){
      return this.createEventParameter
    }else{
      throw Error("createEventParameter not yet ready")
    }
    
  }


  constructor(private service : ContainerProviderService<ContainerEvent<T, string>, boolean>){

    this._provider =  service.provider
    effect(()=>{
      const sourceItem = this.classController()
      this._dataSource = sourceItem.dataSource
      this.createEventParameter = configureCaller(this,  this.parentContainer)
    })
  }

  content = computed<string>(()=>{
    const source =  this._dataSource
    if(source != undefined){
      return source.content
    }else{
      return ""
    }
  })

  componentKey = computed<string>(()=>{
    const source =  this._dataSource
    if(source){
      return `${source.htmlTag}|${source.elementId}`
    }
    return `HtmlTag|ElementId`
  })

  containerState = signal<ContainerState>(ContainerState.IDLE)
  classListEdit = model<{key:number, value:string}[]>([])

  componentId = input<string>()
  classList = input<string[]>([])

  canSelect:boolean = true
  

  // private createEvent(eventType : ContainerEventType, message:string = ""):ContainerEvent<T,string>{
  //   return  new ContainerEvent(this, eventType, this.sourceItem().hostingItem, message)
  // }

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

  //  if(this.dataModel){

  //     console.log("Saving")
     
  //    // this.renderingContainer.getComponentRefference()?.instance.updateView()
  //  }else{
  //     console.warn(`Save Failed`) 
  //  }
 

 cancelBtnClick(event: MouseEvent){
  
 }

}
