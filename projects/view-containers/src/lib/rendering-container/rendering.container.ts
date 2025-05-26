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
import { ContainerState } from '../common/enums';



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
  onSave = output<any>()

  //componetAssets = input<Map<string, ContainerComponentAsset<ContainerNodeComponent<any>>>>()

  opennedHeight = input<number>(100)
  height = signal<number>(100)
  containerClass = signal<string>("")

  withEditor = input<EditorToolsComponent>()
  

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


  private deselect(components: readonly  RenderingItemComponent[]):boolean{
    if(components.find(f=>f.containerState() == ContainerState.EDIT)){
      return false
    }else{
       components.forEach(x=>{x.setContinerState(ContainerState.IDLE)})
       return true
    }
  }

  ngAfterViewInit(): void {

    this.getHandler.emit(this as RendererHandlerInterface)
    this.service.provider.receive().subscribe(({ data, callback }) => {
      const components = this.renderingItemComponents()  
      console.log(data.eventType)
      switch(data.eventType){
        case ContainerEventType.ON_CLICK:
           callback(this.deselect(components))
        break
        case ContainerEventType.ON_EDIT:
          const found = components.find(x=>x.containerState() == ContainerState.EDIT)
          if(found == null){
            this.onEdit.emit(data.caller.dataSource)
            callback(true)
          }else{
            callback(false) 
          }
        break
        case ContainerEventType.SAVE:
          this.onSave.emit(data.hostingItem.dataModel())
          callback(true)
        break
        case ContainerEventType.CANCEL:
          callback(true)
        break
      }
    });

    const selectors = this.selectors()
    if (selectors) {
      // this.renderContent(selectors)
    //  this.extract()
    }
  }

}
