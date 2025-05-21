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
  viewChild,
  viewChildren
} from '@angular/core';
import { CommonModule } from "@angular/common"
import { RendererSelector } from './classes/renderer-selector.class';
import { ContainerComponentAsset } from './models';
import { NumToStrPipe } from '../common/pipes/num-to-str.pipe';
import { ContainerNodeComponent, RenderingItemComponent, EditorToolsComponent } from './rendering-container-parts';
import { ContainerEventType} from '../common/enums/container-event-type.enum';

import { RendererHandlerInterface, RenderModelInterface, RenderComponentInterface} from "./interfaces"
import { RenderingContainerItem } from './classes';
import { ContainerEvent } from "./models"

import { ContainerProviderService } from "./../common/services"



@Component({
  selector: 'lib-rendering-container',
  imports: [
    CommonModule,
    NumToStrPipe,
    EditorToolsComponent,
    RenderingItemComponent
  ],
  templateUrl: `./rendering.container.html`,
  styleUrl: './rendering.container.css',
  changeDetection: ChangeDetectionStrategy.Default
})

export class RenderingContainerComponent implements RendererHandlerInterface, AfterViewInit {
  @ViewChild('rootNode', { read: ViewContainerRef }) rootNode!: ViewContainerRef

  renderingItemComponents = viewChildren<RenderingItemComponent>(RenderingItemComponent)


  containerTools = viewChild(EditorToolsComponent)

  getHandler = output<RendererHandlerInterface>()
  containerItems = input<RenderingContainerItem<RenderModelInterface>[]>([])

  onEdit = output<any>()

  //componetAssets = input<Map<string, ContainerComponentAsset<ContainerNodeComponent<any>>>>()

  opennedHeight = input<number>(100)
  height = signal<number>(100)
  containerClass = signal<string>("")

  withEditor = input<EditorToolsComponent>()


  onSave = output<any>()


  private callbacks = {
    onNode: <T>(type: ContainerEventType, object: T) => {
      switch (type) {
        case ContainerEventType.ON_EDIT:
          this.onEdit.emit(object)
          break
        case ContainerEventType.SAVE:
          this.onSave.emit(object);
          console.log(`Rendering Container Received Save event with object `)
          console.log(object)

          break
      }
    }
  }
  selectors = input<RendererSelector<any>[]>([])

  constructor(private service: ContainerProviderService<ContainerEvent<RenderModelInterface, any>, boolean>) {

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
        //  this.renderContent(selectors)
      }
    })
  }

  injectDataModel(model: RenderModelInterface): RenderingItemComponent {

    const foundItem = this.renderingItemComponents().find(x => x.sourceItem().htmlTag == model.htmlTag && x.sourceItem().elementId == model.elementId)
    if (!foundItem) {
      throw Error(`ContainerItem not found for htmlTag ${model.htmlTag} and elementId ${model.elementId}`)
    }
    // const found = this.containerItems().find(x=>x.htmlTag == model.htmlTag && x.elementId == model.elementId)
    // if(!found){
    //   throw Error(`ContainerItem not found for htmlTag ${model.htmlTag} and elementId ${model.elementId}`)
    // }
    const foundSourceItem = foundItem.sourceItem()
    foundSourceItem.setDataSource(model)
    return foundItem
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


  // private renderContent(selectors: RendererSelector<any>[]) {
  //   //const assetMap = this.componetAssets()
  //   if (assetMap) {
  //     let assets: ContainerComponentAsset<ContainerNodeComponent<any>>[] = []
  //     assetMap.forEach((value, _key) => assets.push(value))
  //     if (assets.length == 0) {
  //       console.warn(`Assets list is empty`)
  //     }
  //     selectors.forEach(selector => {
  //       const foundAsset = assets.find(x => x.htmlTag == selector.selector.tag)
  //       if (foundAsset) {
  //         const newContainer = new RenderingContainer2(selector, this.host)
  //         const injector = Injector.create({
  //           providers: [{ provide: RenderingContainer2, useValue: newContainer }],
  //           parent: this.rootNode.injector,
  //         });
  //         newContainer.setAssets(assets).setSourceHtml(selector.html)
  //         let newComponent = this.rootNode.createComponent<ContainerNodeComponent<any>>(foundAsset.componentType, { injector })
  //         newComponent.changeDetectorRef.detectChanges()
  //         newContainer.setComponentRefference(newComponent, this.rootNode)
  //         this.rootContainers.push(newContainer)
  //       } else {
  //         console.warn(`Unable to find asset for selector ${selector.name}`)
  //       }
  //     })
  //     console.log(`RenderingContainer created ${this.rootContainers.length}`)
  //   } else {
  //     console.warn(`Assets assetMap undefined ${assetMap}`)
  //   }
  // }



  ngAfterViewInit(): void {

    this.getHandler.emit(this as RendererHandlerInterface)


    this.service.provider.receive().subscribe(({ data, callback }) => {
      console.log('Received event:', data);
      this.onSave.emit(data.caller.dataSource)
      callback(true); // respond to sender
    });

    const selectors = this.selectors()
    if (selectors) {
      // this.renderContent(selectors)
      this.extract()
    }
  }

}
