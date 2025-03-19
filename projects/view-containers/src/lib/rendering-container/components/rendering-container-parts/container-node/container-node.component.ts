import { ChangeDetectionStrategy, Component, effect, input, signal, ViewContainerRef, AfterViewInit, ViewChild, Injector, Inject, inject, Input, HostBinding, Signal } from '@angular/core';
import { RenderingContainer } from '../../../classes/rendering-container.class';
import { RendererSelector } from '../../../classes/renderer-selector.class';
import { ContainerComponentAsset } from '../../../models';

@Component({
  selector: 'lib-container-node',
  imports: [],
  template: `<ng-container #nodeContianer> </ng-container>`,
  styleUrl: './container-node.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class ContainerNodeComponent<T> implements AfterViewInit{ 

  @ViewChild('nodeContianer', {read: ViewContainerRef }) nodeContianer!: ViewContainerRef
  @ViewChild('nodeInnerContainer', {read: ViewContainerRef }) nodeInnerContainer!: ViewContainerRef


 renderingContainer = inject(RenderingContainer);

 dataModel = signal<T|undefined>(undefined)

 get personalName():string{
    return `NodeComponent[${this.renderingContainer.selector.name}]`
 }
 get assets():ContainerComponentAsset<ContainerNodeComponent<T>>[]{
  
  if(this.renderingContainer){
     return this.renderingContainer.getAssets()
  }
  console.warn(`${this.personalName} trying to get assets while RenderingContainer undefined. Retutning empty array`)
  return []
 }
 
 abstract classList : Signal<{key:number, value:string}[]>
 innerHtml = signal<string|undefined>(undefined)

 rendererSource = signal<RenderingContainer<T>>(this.renderingContainer)
 nodeContainers = signal<RenderingContainer<T>[]>([])

 protected suppressNoHtmlWarning: boolean = false

  @HostBinding('class') get  hostClassList(){
    return this.rendererSource()?.classList || '';
  }

 constructor() {

 }

 getNodeOuterContianer():ViewContainerRef|undefined{
    const viewRef =  this.nodeContianer
    if(viewRef){
      return viewRef
    }else{
      console.warn(`${this.personalName} getNodeOuterContianer returned undefined`)
      return undefined
    }
 }

 getNodeInnerContianer():ViewContainerRef|undefined{
      const viewRef =  this.nodeInnerContainer
      if(viewRef){
        return viewRef
      }else{
        console.warn(`${this.personalName} getNodeInnerContianer returned undefined`)
        return undefined
      }
}




 private renderChildNodes(selectors: RendererSelector[]){

  let  containers: RenderingContainer<T>[] = []
  let selectorsProcessed = 0
  //If on start parent view present than should be used
  console.log(`${this.personalName}  Rendering child  selectors count ${selectors.length}`)
  let parentRef =  this.getNodeInnerContianer()
  if(parentRef == undefined){
     console.warn(`getNodeInnerContianer is undefined `)
     parentRef = this.getNodeOuterContianer()
  }

  selectors.forEach(selector => {
    //const viewContainerRef = this.nodeContianer
    const foundAsset =  this.assets.find(x=>x.htmlTag  == selector.selector.tag)

    if(parentRef!= undefined &&  foundAsset != undefined){
        const renderingContainer = new RenderingContainer(selector)

        const injector = Injector.create({
          providers: [{ provide: RenderingContainer, useValue: renderingContainer }],
          parent: parentRef.injector, // Maintain existing dependencies
        });
        renderingContainer.setAssets(this.assets).setSourceHtml(selector.html)
        const newComponent = parentRef.createComponent<ContainerNodeComponent<T>>(foundAsset.componentType,{injector})
        renderingContainer.setComponentRefference(newComponent, parentRef)
        selectorsProcessed++
    }else{
        console.warn(`${this.personalName} no asset found for selector ${selector.personalName}, total assets provided ${this.assets.length}`)
        console.log(`Selector Tag ${selector.selector.key}`)
        console.log("AssetList")
        this.assets.forEach(x=>console.log(x))
        console.warn(`nodeContianer not found for ${this.personalName}`)
    }
  })

  if(selectorsProcessed != selectors.length){
    console.warn(`${this.personalName} total assets provided ${this.assets.length} successfully processed ${selectorsProcessed}`)
  }

  console.log(`${this.personalName} have created ${containers.length} new components`)
  this.nodeContainers.set(containers)  
}

 ngAfterViewInit(): void {
    const renderer = this.rendererSource()
    if(renderer){
      const html = renderer.gethtml()
      if(html.length){
        if(!this.suppressNoHtmlWarning){
          this.innerHtml.set(html)
        }
      }else{
        if(!this.suppressNoHtmlWarning){
          console.warn(`${this.personalName} No Html content provided`)
        }
      }
     // this.classList.set(renderer.classList)
      let byCallback = false
      const selectors =renderer.selector.getChild((childSelectors)=>{
        byCallback = true
        this.renderChildNodes(childSelectors)
      })
      if(!byCallback  && selectors.length > 0){
        this.renderChildNodes(selectors)
      }
    }else{
      console.warn(`${this.personalName} has no RenderingContainer class`)
    }
 }
}
