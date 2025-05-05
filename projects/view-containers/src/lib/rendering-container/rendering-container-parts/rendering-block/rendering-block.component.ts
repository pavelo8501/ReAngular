import { ChangeDetectionStrategy, Component, computed, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContainerState, EventType } from '../../../common/enums';
import { RenderingContainerHost } from '../../classes';
import { RenderingContainerProvider } from '../../classes/rendering-container-provider.class';
import { RenderBlockInterface } from '../../interfaces';


@Component({
  selector: 'lib-rendering-block',
  imports: [CommonModule, FormsModule],
  templateUrl: "./rendering-block.component.html",
  styleUrl: './rendering-block.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RenderingBlockComponent<SOURCE extends RenderBlockInterface> {


  
  dataSource = model.required<SOURCE>()

  content = computed<string>(()=>{
    const source =  this.dataSource()
    if(source != undefined){
      return source.content
    }else{
      return ""
    }
  })

  componentKey = computed<string>(()=>{
    const source =  this.dataSource()

    return `${source.htmlTag}|${source.elementId}`

  })


 personalName: string = "RenderingBlockComponent"

 private callbacks = {
  onNode: <T>(type: EventType, object: T) => {
    switch (type) {
      case EventType.ON_EDIT:
       // this.onEdit.emit(object)
        break
      case EventType.SAVE:
       // this.onSave.emit(object);
        console.log(`Rendering Container Received Save event with object `)
        console.log(object)

        break
    }
  }
 }

  private provider : RenderingContainerProvider = new RenderingContainerProvider(this.callbacks)

  ContainerState = ContainerState

  containerState = signal<ContainerState>(ContainerState.IDLE)
  classListEdit = model<{key:number, value:string}[]>([])

  componentId = input<string>()
  classList = input<string[]>([])

  canSelect:boolean = true



  onClicked(){

    if(!this.canSelect){
      return
    }

    this.provider.emmitEvent(EventType.ON_LOST_FOCUS)
    this.containerState.set(ContainerState.ACTIVE)
    console.log(`${this.personalName} clicked`)
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
