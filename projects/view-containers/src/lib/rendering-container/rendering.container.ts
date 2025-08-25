import {
  Component,
  effect,
  signal,
  input,
  AfterViewInit,
  output,
  ChangeDetectionStrategy,
  viewChildren
} from '@angular/core';
import { CommonModule } from "@angular/common"
import { NumToStrPipe } from '../common/pipes/num-to-str.pipe';
import { RenderingItemComponent} from './rendering-container-parts';
import { ContainerEventType} from '../common/enums/container-event-type.enum';
import { RendererHandlerInterface, RenderModelInterface, RenderComponentInterface} from "./interfaces"
import { RenderingItem } from './classes';
import { ContainerEvent } from "./models"
import { ContainerProviderService } from "./../common/services"
import { ContainerState } from '../common/enums';

@Component({
  selector: 'lib-rendering-container',
  imports: [
    CommonModule,
    NumToStrPipe,
    RenderingItemComponent
  ],
  templateUrl: `./rendering.container.html`,
  styleUrl: './rendering.container.css',
  changeDetection: ChangeDetectionStrategy.Default
})

export class RenderingContainerComponent implements RendererHandlerInterface, AfterViewInit {
 // @ViewChild('rootNode', { read: ViewContainerRef }) rootNode!: ViewContainerRef

  renderingItemComponents = viewChildren<RenderingItemComponent>(RenderingItemComponent)

  getHandler = output<RendererHandlerInterface>()
  containerItems = input<RenderingItem<RenderModelInterface, RenderModelInterface>[]>([])

  onCancel = output<any>()
  onEdit = output<any>()
  onSave = output<any>()

  //componetAssets = input<Map<string, ContainerComponentAsset<ContainerNodeComponent<any>>>>()

  opennedHeight = input<number>(100)
  height = signal<number>(100)
  containerClass = signal<string>("")

  constructor(private service: ContainerProviderService<ContainerEvent<RenderModelInterface, any>, boolean>) {

    effect(() => {
      this.height.set(this.opennedHeight())
    })
  }

  private findRenderingItemComponent(elementId: string):RenderingItemComponent | undefined{
     return this.renderingItemComponents().find(x => x.renderingItem()?.elementId == elementId)
  }

  injectDataModel(model: RenderModelInterface): RenderingItemComponent {

    const foundItem = this.findRenderingItemComponent(model.elementId)
    if (!foundItem) {
      throw Error(`ContainerItem not found for htmlTag ${model.htmlTag} and elementId ${model.elementId}`)
    }
    const foundSourceItem = foundItem.renderingItem()
    if(foundSourceItem){
      foundSourceItem.setDataSource(model)
    }
    return foundItem
  }

  reloadRenderingItems(models: RenderModelInterface[]):void{
    console.log("Calling reloadRenderingItems")
    const components = this.renderingItemComponents()
    components.forEach(x=>x.renderingItem().emptySource().clearRenderingBlocks() )

    models.forEach(section=>{
      components.find(f=>f.renderingItem().elementId  == section.elementId)?.renderingItem().setDataSource(section)
    })
  }

  updateDataModel(model: RenderModelInterface):RenderingItemComponent | undefined{
      const foundItem = this.findRenderingItemComponent(model.elementId)
      if(!foundItem){
         throw Error(`(updateDataModel) ContainerItem not found for htmlTag ${model.htmlTag} and elementId ${model.elementId}`)
      }
     const foundSourceItem = foundItem.renderingItem()
     return foundSourceItem?.updateDataSource(model)
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
          this.onSave.emit(data.caller.dataSource)
          callback(true)
        break
        case ContainerEventType.CANCEL:
          this.onCancel.emit(data.caller.dataSource)
          callback(true)
        break
      }
    });
  }
}