import {
  Component,
  effect,
  signal,
  ViewContainerRef,
  input,
  AfterViewInit,
  ViewChild,
  Injector,
  output,
  ChangeDetectionStrategy,
  viewChild
} from '@angular/core';
import { CommonModule } from "@angular/common"
import { RendererSelector } from './classes/renderer-selector.class';
import { RenderingContainer, RenderingContainerHost } from './classes/rendering-container.class';
import { ContainerComponentAsset } from './models';
import { NumToStrPipe } from '../common/pipes/num-to-str.pipe';
import { ContainerNodeComponent, RenderingContainerItemComponent, EditorToolsComponent } from './rendering-container-parts';
import { EventType } from '../common/enums/event-type.enum';

import { RendererHandlerInterface, RenderModelInterface } from "./interfaces"
import { RenderingContainerItem } from './classes';


@Component({
  selector: 'lib-rendering-container',
  imports: [
    CommonModule,
    NumToStrPipe,
    EditorToolsComponent,
    RenderingContainerItemComponent
  ],
  templateUrl: `./rendering.container.html`,
  styleUrl: './rendering.container.css',
  changeDetection: ChangeDetectionStrategy.Default
})

export class RenderingContainerComponent implements RendererHandlerInterface, AfterViewInit {
  @ViewChild('rootNode', { read: ViewContainerRef }) rootNode!: ViewContainerRef

  containerTools = viewChild(EditorToolsComponent)

  //@Output() handlerReady = new EventEmitter<RendererHandlerInterface>();


  getHandler = output<RendererHandlerInterface>()

  onEdit = output<any>()

  componetAssets = input<Map<string, ContainerComponentAsset<ContainerNodeComponent<any>>>>()
  containerItems = input<RenderingContainerItem<RenderModelInterface>[]>([])


  opennedHeight = input<number>(100)
  height = signal<number>(100)
  containerClass = signal<string>("")

  withEditor = input<EditorToolsComponent>()


  onSave = output<any>()
  private callbacks = {
    onNode: <T>(type: EventType, object: T) => {
      switch (type) {
        case EventType.ON_EDIT:
          this.onEdit.emit(object)
          break
        case EventType.SAVE:
          this.onSave.emit(object);
          console.log(`Rendering Container Received Save event with object `)
          console.log(object)

          break
      }
    }
  }

  private host: RenderingContainerHost = new RenderingContainerHost(this.callbacks)

  rendererSource = input<RenderingContainer<any> | undefined>(undefined)

  rootContainers: RenderingContainer<any>[] = []

  selectors = input<RendererSelector<any>[]>([])

  constructor() {
    effect(() => {

      const editor = this.withEditor()
      if (editor) {
        // this.withEditor = editor
        console.log("With Editor")
      }

      this.height.set(this.opennedHeight())
      const selectors = this.selectors()
      if (selectors.length > 0) {

        this.extract()

        console.warn(`selectors list is updated ${selectors.length}`)
        this.renderContent(selectors)
      }
    })
  }

  injectDataModel(model: RenderModelInterface): RenderingContainerItem<RenderModelInterface> {
    const found = this.containerItems().find(x=>x.htmlTag == model.htmlTag && x.elementId == model.elementId)
    if(!found){
      throw Error(`ContainerItem not found for htmlTag ${model.htmlTag} and elementId ${model.elementId}`)
    }
    found.setDataSource(model)
    return found
  }


  private extract() {
    const selectors = this.selectors()
    if (selectors.length > 0) {
      const model = selectors[0].exractDataSource()
      console.log("extract data model")
      const selector = selectors[0]
      console.log(selector.childSelectors)
    }
  }


  private renderContent(selectors: RendererSelector<any>[]) {
    const assetMap = this.componetAssets()
    if (assetMap) {
      let assets: ContainerComponentAsset<ContainerNodeComponent<any>>[] = []
      assetMap.forEach((value, _key) => assets.push(value))
      if (assets.length == 0) {
        console.warn(`Assets list is empty`)
      }
      selectors.forEach(selector => {
        const foundAsset = assets.find(x => x.htmlTag == selector.selector.tag)
        if (foundAsset) {
          const newContainer = new RenderingContainer(selector, this.host)
          const injector = Injector.create({
            providers: [{ provide: RenderingContainer, useValue: newContainer }],
            parent: this.rootNode.injector,
          });
          newContainer.setAssets(assets).setSourceHtml(selector.html)
          let newComponent = this.rootNode.createComponent<ContainerNodeComponent<any>>(foundAsset.componentType, { injector })
          newComponent.changeDetectorRef.detectChanges()
          newContainer.setComponentRefference(newComponent, this.rootNode)
          this.rootContainers.push(newContainer)
        } else {
          console.warn(`Unable to find asset for selector ${selector.name}`)
        }
      })
      console.log(`RenderingContainer created ${this.rootContainers.length}`)
    } else {
      console.warn(`Assets assetMap undefined ${assetMap}`)
    }
  }



  ngAfterViewInit(): void {

    this.getHandler.emit(this as RendererHandlerInterface)

    const selectors = this.selectors()
    if (selectors) {
      this.renderContent(selectors)
      this.extract()
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
