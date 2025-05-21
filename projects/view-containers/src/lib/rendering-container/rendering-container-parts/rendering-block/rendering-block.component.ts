import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContainerEventType, ContainerState} from './../../../common/enums';
import { RenderingBlock} from '../../classes';
import { ContainerEvent, configureCaller } from "./../../models"
import { RenderComponentInterface, RenderModelInterface} from '../../interfaces';
import { ContainerProviderService, TypedCallbackProvider } from "./../../../common/services"


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
  sourceItem  = model.required<RenderingBlock<T>>()


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

  //createEvent = configureCaller(this, this.sourceItem().hostingItem)

  constructor(private service : ContainerProviderService<ContainerEvent<T, string>, boolean>){

    this._provider =  service.provider

    effect(()=>{
      const sourceItem = this.sourceItem()
      this._dataSource = sourceItem.dataSource

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


  onClicked(){
    console.log("Click event registred")

    const createEvent = configureCaller(this, this.sourceItem().hostingItem)

    this.provider.send(createEvent(ContainerEventType.ON_CLICK, "")).then(result => {
      if(result == true){
        this.containerState.set(ContainerState.SELECTED)
        console.log("SELECTING")
      }
      console.log('Parent acknowledged in rendering block:', result);
    });
    

    if(!this.canSelect){
      return
    }

   // this.provider.emmitEvent(EventType.ON_LOST_FOCUS)
   // this.containerState.set(ContainerState.ACTIVE)
   // console.log(`${this.personalName} clicked`)
 }

 editBtnClick(){
    //   if(!this.canSelect){
    //     return
    //   }
    //   this.containerState.update((state)=>state)
    //   const send  =  (event: EventType, dataModel :T )  => {
    //   this.host.propagateToParent(event, dataModel)
    //   sent = true
      
    // }
    
    // let  sent:boolean = false
 
    // if(this.dataModel){
    //   send(EventType.ON_EDIT, this.dataModel)
    // }else{
    //     console.warn("modelFromContainer Tozhe mimo")
    // }

    // if(sent){
    //   console.log(`SettingEdit ${this.personalName}`)
    //   this.containerState.set(ContainerState.EDIT)
    //   this.canSelect = false
    //   this.host.emmitEvent(EventType.CAN_SELECT, this.canSelect)
    // }
 }

 saveBtnClick(){

  //  if(this.dataModel){

  //     console.log("Saving")
     
  //    // this.renderingContainer.getComponentRefference()?.instance.updateView()
  //  }else{
  //     console.warn(`Save Failed`) 
  //  }
 }

 cancelBtnClick(){
  
 }


 }
