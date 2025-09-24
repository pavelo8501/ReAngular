import {
  Component,
  effect,
  signal,
  input,
  output,
  viewChildren,
  model
} from '@angular/core';
import { CommonModule } from "@angular/common"
import { ContainerEventType} from '../common/enums/container-event-type.enum';
import { RendererHandlerInterface} from "./interfaces"
import {  RenderingBlockPayload, RenderingItemPayload } from './classes';
import { ContainerEvent } from "./models"
import { ContainerProviderService } from "./../common/services"
import { castOrUndefined, Colour, ContainerState, IContainerPayload, info, log, whenDefined } from "@pavelo8501/data-helpers";
import { RenderingItemComponent } from './components';

@Component({
  selector: 'lib-rendering-container',
  imports: [
    CommonModule,
    RenderingItemComponent
  ],
  templateUrl: `./rendering.container.html`,
  styleUrls: ['./rendering.container.css', "./../styles/buttons.css"]
})

export class RenderingContainerComponent{

  renderingItemComponents = viewChildren<RenderingItemComponent<any>>(RenderingItemComponent)

  getHandler = output<RendererHandlerInterface>()

  onCancel = output<any>()
  onEdit = output<any>()
  onSave = output<IContainerPayload<any>>()
  onContentEdit = output<IContainerPayload<any>>()
  onCssEdit =  output<IContainerPayload<any>>()
  onBlockEdit = output<{blockPayload:RenderingBlockPayload<any>; editType:ContainerEventType}>()

  opennedHeight = input<number|undefined>(undefined)

  heightStr:string = ""

  height = signal<number>(100)
  containerClass = signal<string>("")

  renderingItemPayloads = model<RenderingItemPayload<any>[]>([])
  
  
  constructor(
    private service: ContainerProviderService<ContainerEvent<any>, boolean>
  ){
    effect(() => {
      const opennedHeight = this.opennedHeight()
      if(opennedHeight != undefined){
        this.heightStr = `${opennedHeight}px`
      }else{
        this.heightStr = "100%"
      }
    })
  }

  private isAnyInEditMode():boolean{
    const found = this.renderingItemComponents().find(f=>f.containerState() == ContainerState.EDIT)

    if(found != undefined){
      return true
    }

    return false
  }


  ngAfterViewInit(): void {

    this.service.provider.receive().subscribe(({ data, callback }) => {

      const payloads = this.renderingItemPayloads() 
      const blockPayload = castOrUndefined<RenderingBlockPayload<any>>(RenderingBlockPayload, data.caller)

      switch(data.eventType){
        case ContainerEventType.ON_CLICK:

          if(this.isAnyInEditMode()){
            callback(true)
            //  callback(false)
          }else{

            this.renderingItemComponents().forEach( x=> x.setContainerStateIdle())
             callback(true)
          }
        break
        case ContainerEventType.ON_CONTENT_EDIT:
          whenDefined(blockPayload, payload=>{
               log("Emmiting", blockPayload)
               this.onBlockEdit.emit({blockPayload: payload, editType:ContainerEventType.ON_CLASS_EDIT})
          })
          callback(true)
        break

        case ContainerEventType.ON_CLASS_EDIT:
          whenDefined(blockPayload, payload=>{
               log("Emmiting", blockPayload)
               this.onBlockEdit.emit({blockPayload: payload, editType:ContainerEventType.ON_CLASS_EDIT})
          })
          callback(true)
        break

        case ContainerEventType.SAVE:
          this.onSave.emit(data.caller)
          callback(true)
        break
        case ContainerEventType.CANCEL:
          this.onCancel.emit(data.caller.receiver)
          callback(true)
        break
      }
    });
  }
}