import { Component, 
  signal, 
  ViewContainerRef, 
  AfterViewInit, 
  ViewChild, 
  Injector, 
  inject, 
  HostBinding, 
  Signal, 
  ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';

import {  RendererSelector} from './../../classes';
import { ContainerComponentAsset }  from './../../models';
import { ContainerState, ContainerEventType } from '../../../common/enums';
import { InjectableI } from './../../interfaces';

@Component({
  standalone:true,
  selector: 'lib-container-node',
  imports: [
    CommonModule
  ],
  template: `<ng-container #nodeContianer> </ng-container>`,
  styleUrl: './container-node.component.css',
  changeDetection: ChangeDetectionStrategy.Default
})

export abstract class ContainerNodeComponent<T extends InjectableI> implements AfterViewInit{ 

  @ViewChild('nodeContianer', {read: ViewContainerRef }) nodeContianer!: ViewContainerRef
  @ViewChild('nodeInnerContainer', {read: ViewContainerRef }) nodeInnerContainer!: ViewContainerRef

 //renderingContainer = inject(RenderingContainer2);

//  get dataModel() :T{
//     return this.renderingContainer.dataModel
//  }

 //content = signal<string>(this.dataModel.content)

// private host : RenderingContainerHost = this.renderingContainer.getHost()

//  get personalName():string{
//     return `NodeComponent[${this.renderingContainer.selector.name}]`
//  }
//  get assets():ContainerComponentAsset<ContainerNodeComponent<T>>[]{
  
//   if(this.renderingContainer){
//      return this.renderingContainer.getAssets()
//   }
//   console.warn(`${this.personalName} trying to get assets while RenderingContainer undefined. Retutning empty array`)
//   return []
//  }
 
 abstract classes : Signal<string[]>

 //nodeContainers = signal<RenderingContainer2<T>[]>([])

 protected suppressNoHtmlWarning: boolean = false

 canSelect:boolean = true

  // @HostBinding('class') get  hostClassList(){
  //   return this.renderingContainer.classes || '';
  // }
  protected containerState = signal<ContainerState>(ContainerState.IDLE)

  abstract updateView : ()=> void

  constructor() {
    
  }

 onClicked(){
    // if(!this.canSelect){
    //   return
    // }
    // this.host.emmitEvent(ContainerEventType.ON_LOST_FOCUS)
    // this.containerState.set(ContainerState.SELECTED)
    // console.log(`${this.personalName} clicked`)
 }

 editBtnClick(){
      // if(!this.canSelect){
      //   return
      // }
      // this.containerState.update((state)=>state)
      // const send  =  (event: ContainerEventType, dataModel :T )  => {
      // this.host.propagateToParent(event, dataModel)
      // sent = true
      
   // }
    
    // let  sent:boolean = false
 
    // if(this.dataModel){
    //   send(ContainerEventType.ON_EDIT, this.dataModel)
    // }else{
    //     console.warn("modelFromContainer Tozhe mimo")
    // }

    // if(sent){
    //   console.log(`SettingEdit ${this.personalName}`)
    //   this.containerState.set(ContainerState.EDIT)
    //   this.canSelect = false
    //   this.host.emmitEvent(ContainerEventType.CAN_SELECT, this.canSelect)
    // }
 }

 saveBtnClick(){

  //  if(this.dataModel){

  //     console.log("Saving")
  //     this.host.propagateToParent(ContainerEventType.SAVE,  this.dataModel)
  //     this.canSelect = true
  //     this.host.emmitEvent(ContainerEventType.CAN_SELECT, this.canSelect)
  //     this.containerState.set(ContainerState.IDLE)
  //     this.host.emmitEvent(ContainerEventType.UPDATE_VIEW, true)
     
  //    // this.renderingContainer.getComponentRefference()?.instance.updateView()
  //  }else{
  //     console.warn(`Save Failed`) 
  //  }
 }

 cancelBtnClick(){
  // this.host.propagateToParent(ContainerEventType.CANCEL_SAVE,  this.dataModel)
  // console.log(`cancelClick on ${this.personalName}`)
 }


//  getNodeOuterContianer():ViewContainerRef|undefined{
//     // const viewRef =  this.nodeContianer
//     // if(viewRef){
//     //   return viewRef
//     // }else{
//     //   console.warn(`${this.personalName} getNodeOuterContianer returned undefined`)
//     //   return undefined
//     // }
//  }

//  getNodeInnerContianer():ViewContainerRef|undefined{
//       // const viewRef =  this.nodeInnerContainer
//       // if(viewRef){
//       //   return viewRef
//       // }else{
//       //   console.warn(`${this.personalName} getNodeInnerContianer returned undefined`)
//       //   return undefined
//       // }
// }

 private renderChildNodes(selectors: RendererSelector<any>[]){

  // let  containers: RenderingContainer2<T>[] = []
  // let selectorsProcessed = 0
  // //If on start parent view present than should be used
  // console.log(`${this.personalName}  Rendering child  selectors count ${selectors.length}`)
  // let parentRef =  this.getNodeInnerContianer()
  // if(parentRef == undefined){
  //    console.warn(`getNodeInnerContianer is undefined `)
  //    parentRef = this.getNodeOuterContianer()
  // }

  // selectors.forEach(selector => {
  //   //const viewContainerRef = this.nodeContianer
  //   const foundAsset =  this.assets.find(x=>x.htmlTag  == selector.selector.tag)

  //   if(parentRef!= undefined &&  foundAsset != undefined){
  //       const renderingContainer = this.renderingContainer.createNewContainer(selector)
  //       const injector = Injector.create({
  //         providers: [{ provide: RenderingContainer2, useValue: renderingContainer }],
  //         parent: parentRef.injector, // Maintain existing dependencies
  //       });
  //       renderingContainer.setAssets(this.assets).setSourceHtml(selector.html)
  //       const newComponent = parentRef.createComponent<ContainerNodeComponent<T>>(foundAsset.componentType,{injector})
  //       newComponent.changeDetectorRef.detectChanges()
  //       renderingContainer.setComponentRefference(newComponent, parentRef)
  //       selectorsProcessed++
  //   }else{
  //       console.warn(`${this.personalName} no asset found for selector ${selector.personalName}, total assets provided ${this.assets.length}`)
  //       console.log(`Selector Tag ${selector.selector.key}`)
  //       console.log("AssetList")
  //       this.assets.forEach(x=>console.log(x))
  //       console.warn(`nodeContianer not found for ${this.personalName}`)
  //   }
  // })

  // if(selectorsProcessed != selectors.length){
  //   console.warn(`${this.personalName} total assets provided ${this.assets.length} successfully processed ${selectorsProcessed}`)
  // }

  // console.log(`${this.personalName} have created ${containers.length} new components`)
  // this.nodeContainers.set(containers)  
}

 ngAfterViewInit(): void {
    // const renderer = this.renderingContainer
    // if(renderer){
    //   const html = renderer.gethtml()
    //   if(html.length){
    //     if(!this.suppressNoHtmlWarning){
    //       this.content.set(html)
    //     }
    //   }else{
    //     if(!this.suppressNoHtmlWarning){
    //       console.warn(`${this.personalName} No Html content provided`)
    //     }
    //   }
    //  // this.classList.set(renderer.classList)
    //   let byCallback = false
    //   const selectors =renderer.selector.getChild((childSelectors :RendererSelector<any>[])=>{
    //     byCallback = true
    //     this.renderChildNodes(childSelectors)
    //   })
    //   if(!byCallback  && selectors.length > 0){
    //     this.renderChildNodes(selectors)
    //   }
    // }else{
    //   console.warn(`${this.personalName} has no RenderingContainer class`)
    // }
 }

}
