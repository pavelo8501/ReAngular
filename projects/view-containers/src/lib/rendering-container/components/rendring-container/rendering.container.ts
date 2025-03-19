import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
  ViewContainerRef,
  input,
  AfterViewInit,
  ViewChild,
  Injector
} from '@angular/core';
import { CommonModule} from "@angular/common"
import { RendererSelector } from '../../classes/renderer-selector.class';
import { RenderingContainer } from '../../classes/rendering-container.class';
import { ContainerComponentAsset} from '../../models';
import { NumToStrPipe } from '../../../common/pipes/num-to-str.pipe';
import { ContainerNodeComponent } from '../rendering-container-parts/container-node/container-node.component';


@Component({
  selector: 'lib-rendering-container',
  imports: [CommonModule, NumToStrPipe],
  templateUrl: `./rendering.container.html`,
  styleUrl: './rendering.container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenderingContainerComponent implements AfterViewInit {
  @ViewChild('rootNode', {read: ViewContainerRef }) rootNode!: ViewContainerRef

  componetAssets = input<Map<string, ContainerComponentAsset<ContainerNodeComponent<any>>>>()
  opennedHeight = input<number>(100)
  height = signal<number>(100)
  containerClass = signal<string>("")

  rendererSource = input<RenderingContainer<any> | undefined>(undefined)

  rootContainers : RenderingContainer<any>[] = []

  selectors = input<RendererSelector[]>([])

  constructor() {
    effect(() => {

      this.height.set(this.opennedHeight())
      const selectors =  this.selectors()
      if(selectors.length > 0){
        console.warn(`selectors list is updated ${selectors.length}`)
        this.renderContent(selectors)
      }
    })
  }

  private renderContent(selectors: RendererSelector[]) {
    const assetMap = this.componetAssets()
    if (assetMap) {
      let assets: ContainerComponentAsset<ContainerNodeComponent<any>>[] = []
      assetMap.forEach((value, key) => assets.push(value))
      if (assets.length == 0) {
        console.warn(`Assets list is empty`)
      }
      selectors.forEach(selector => {
        const foundAsset = assets.find(x=>x.htmlTag  == selector.selector.tag)
        if(foundAsset){
            const newContainer = new RenderingContainer(selector)
            const injector = Injector.create({
            providers: [{ provide: RenderingContainer, useValue: newContainer }],
            parent: this.rootNode.injector,
          });
            newContainer.setAssets(assets).setSourceHtml(selector.html)
            let newComponent  = this.rootNode.createComponent<ContainerNodeComponent<any>>(foundAsset.componentType, {injector})
            newContainer.setComponentRefference(newComponent, this.rootNode)
            newComponent.instance.dataModel.set(selector.getDataModel())
            newComponent.instance.rendererSource.set(newContainer) 
            this.rootContainers.push(newContainer)
        }else{
            console.warn(`Unable to find asset for selector ${selector.name}`)
        }
      })
      console.log(`RenderingContainer created ${this.rootContainers.length}`)
    } else {
      console.warn(`Assets assetMap undefined ${assetMap}`)
    }
  }

  ngAfterViewInit(): void {

      const selectors = this.selectors()
      if(selectors){
        this.renderContent(selectors)
      }
     
      // if (this.renderingContainer == undefined) {
      //     this.renderingContainer = new RenderingContainer(hostSelector)
      //     let childSelectors: RendererSelector[] = []
      //     let byCallback: boolean = false
      //     childSelectors = hostSelector.getChild((selectors) => {
      //         byCallback = true
      //         this.renderContent(selectors)
      //     })
      //     if(!byCallback && childSelectors.length > 0){
      //         this.renderContent(childSelectors)
      //     }
      // }
    //}
  }

}
