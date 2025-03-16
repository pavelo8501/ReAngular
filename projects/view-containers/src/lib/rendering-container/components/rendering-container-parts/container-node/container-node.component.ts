import { ChangeDetectionStrategy, Component, effect, input, signal, ViewContainerRef, AfterViewInit, ViewChild, Injector, Inject, inject } from '@angular/core';
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
export abstract class ContainerNodeComponent implements AfterViewInit{ 

  @ViewChild('nodeContianer', {read: ViewContainerRef }) nodeContianer!: ViewContainerRef


 renderingContainer = inject(RenderingContainer); 

 get personalName():string{
    
    return `NodeComponent[${this.renderingContainer.selector.name}]`
 }
 get assets():ContainerComponentAsset<ContainerNodeComponent>[]{
  
  if(this.renderingContainer){
     return this.renderingContainer.getAssets()
  }
  console.warn(`${this.personalName} trying to get assets while RenderingContainer undefined. Retutning empty array`)
  return []
 }
 
 classList = signal<string[]>([])
 htmlContent = signal<string>("")

 rendererSource = signal<RenderingContainer>(this.renderingContainer)
 nodeContainers = signal<RenderingContainer[]>([])

 protected suppressNoHtmlWarning: boolean = false

 constructor() {

 }


 private renderChildNodes(selectors: RendererSelector[]){

  let  containers: RenderingContainer[] = []

  let selectorsProcessed = 0
  selectors.forEach(selector => {
    const viewContainerRef = this.nodeContianer
    const foundAsset =  this.assets.find(x=>x.htmlTag  == selector.selector.tag)

    if(viewContainerRef!= undefined &&  foundAsset != undefined){
        const renderingContainer = new RenderingContainer(selector)

        const injector = Injector.create({
          providers: [{ provide: RenderingContainer, useValue: renderingContainer }],
          parent: viewContainerRef.injector, // Maintain existing dependencies
        });
        renderingContainer.setAssets(this.assets).setSourceHtml(selector.html)
        const newComponent = viewContainerRef.createComponent<ContainerNodeComponent>(foundAsset.componentType,{injector})
        renderingContainer.setComponentRefference(newComponent)
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
      if(html.length == 0){
        if(!this.suppressNoHtmlWarning){
          console.warn(`${this.personalName} No Html content provided`)
        }
      }else{
        this.htmlContent.set(html)
      }
      this.classList.set(renderer.classList)
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
