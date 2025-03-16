import {
  ChangeDetectionStrategy,
  Component,
  effect,
  model,
  signal,
  ViewContainerRef,
  OnInit,
  ComponentRef,
  input,
  viewChild,
  AfterViewInit,
  TemplateRef,
  ViewChild,
  Injector
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from "@angular/common"
import { InjectableI } from '../../interfaces/injectable.interface';
import { ObserverPayload, SendReplyObserver } from '../../models/observer-message.model';
import { RendererSelector } from '../../classes/renderer-selector.class';
import { RenderingContainer } from '../../classes/rendering-container.class';
import { ContainerComponentAsset } from '../../models';
import { HtmlTag } from '../../../common/enums';
import { TagPrinter } from '../rendering-container-parts/html-tag-renderer/html-tag-printer';
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

  componetAssets = input<Map<string, ContainerComponentAsset<ContainerNodeComponent>>>()
  selector = input.required<RendererSelector>()
  sourceHtml = input<string>()

  opennedHeight = input<number>(100)
  height = signal<number>(100)


  containerClass = signal<string>("")


  renderedTemplate = input<string | undefined>(undefined)

  childRenderingContainers = signal<RenderingContainerComponent[] | undefined>(undefined)

  rendererSource = input<RenderingContainer | undefined>(undefined)


  observer: SendReplyObserver | undefined
  renderingContainer: RenderingContainer | undefined


  rootContainers = signal<RenderingContainer[]>([])

  constructor() {
    effect(() => {

      this.height.set(this.opennedHeight())

      const hostSelector = this.selector()

      if (this.renderingContainer == undefined) {
        this.renderingContainer = new RenderingContainer(hostSelector)
        let childSelectors: RendererSelector[] = []
        let byCallback: boolean = false
        childSelectors = hostSelector.getChild((selectors) => {
          byCallback = true
          this.renderContent(selectors)
        })
      }
    })
  }


  private renderAssetsOnly(selectors: RendererSelector[], assets: ContainerComponentAsset<ContainerNodeComponent>[]) {
    console.log("RenderAssetsOnly call")
    let containers: RenderingContainer[] = []
    if(this.rootNode){
    selectors.forEach(selector => {
        const foundAsset = assets.find(x=>x.htmlTag  == selector.selector.tag)
        if(foundAsset){
            const newContainer = new RenderingContainer(selector)

            const injector = Injector.create({
            providers: [{ provide: RenderingContainer, useValue: newContainer }],
            parent: this.rootNode.injector, // Maintain existing dependencies
          });
            newContainer.setAssets(assets).setSourceHtml(selector.html)

            let newComponent  = this.rootNode.createComponent<ContainerNodeComponent>(foundAsset.componentType, {injector})
            newContainer.setAssets(assets).setSourceHtml(selector.html).setComponentRefference(newComponent)
            newComponent.instance.rendererSource.set(newContainer) 
            containers.push(newContainer)
        }else{
            console.warn(`Unable to find asset for selector ${selector.name}`)
        }
      })
    }
    console.log(`${containers.length} prepared for rootContainers signal`)
    this.rootContainers.set(containers)
  }

  private renderAllHtml(assets: ContainerComponentAsset<ContainerNodeComponent>[]) {

  }

  private renderContent(selectors: RendererSelector[]) {
    const assetMap = this.componetAssets()

    if (assetMap) {
      let assets: ContainerComponentAsset<ContainerNodeComponent>[] = []
      assetMap.forEach((value, key) => assets.push(value))
      if (assets.length == 0) {
        console.warn(`Assets list is empty`)
      }
      if (this.selector().selector.tag == HtmlTag.BODY) {
        this.renderAssetsOnly(selectors, assets)
      } else {
        this.renderAllHtml(assets)
      }
    } else {
      console.warn(`Assets assetMap undefined ${assetMap}`)
    }
  }

  ngAfterViewInit(): void {
    const hostSelector = this.selector()
    if (hostSelector) {
      if (this.renderingContainer == undefined) {
          this.renderingContainer = new RenderingContainer(hostSelector)
          let childSelectors: RendererSelector[] = []
          let byCallback: boolean = false
          childSelectors = hostSelector.getChild((selectors) => {
              byCallback = true
              this.renderContent(selectors)
          })
      }
    }
  }

}
