import {
  Component,
  effect,
  signal,
  input,
  AfterViewInit,
  output,
  ChangeDetectionStrategy,
  viewChildren,
  model
} from '@angular/core';
import { CommonModule } from "@angular/common"
import { NumToStrPipe } from '../common/pipes/num-to-str.pipe';
import { RenderingItemComponent} from './rendering-container-parts';
import { ContainerEventType} from '../common/enums/container-event-type.enum';
import { RendererHandlerInterface, RenderModelInterface, RenderComponentInterface} from "./interfaces"
import { RenderingItemPayload } from './classes';
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
  styleUrls: ['./rendering.container.css', "./../styles/buttons.css"],

  changeDetection: ChangeDetectionStrategy.Default
})

export class RenderingContainerComponent{


 // @ViewChild('rootNode', { read: ViewContainerRef }) rootNode!: ViewContainerRef

  renderingItemComponents = viewChildren<RenderingItemComponent<any>>(RenderingItemComponent)

  getHandler = output<RendererHandlerInterface>()

  onCancel = output<any>()
  onEdit = output<any>()
  onSave = output<any>()

  //componetAssets = input<Map<string, ContainerComponentAsset<ContainerNodeComponent<any>>>>()

  opennedHeight = input<number>(100)
  height = signal<number>(100)
  containerClass = signal<string>("")

  renderingItemPayloads = model<RenderingItemPayload<any>[]>([]) 

  constructor(private service: ContainerProviderService<ContainerEvent<any>, boolean>) {

    effect(() => {
      this.height.set(this.opennedHeight())
    })
  }

  private isAnyInEditOrSelected():boolean{

   const  found =  this.renderingItemComponents().find(
      f=>f.containerState() == ContainerState.EDIT || f.containerState() == ContainerState.SELECTED
   )
   if(found != undefined){
     return true
   }
   return false
  }

  private isAnyInSelected():boolean{
    const  found =  this.renderingItemComponents().find(
        f=>f.containerState() == ContainerState.SELECTED
    )
    if(found != undefined){
      return true
    }
    return false
  }

   private isAnyInEditMode():boolean{
    const  found =  this.renderingItemComponents().find(
        f=>f.containerState() == ContainerState.EDIT
    )
    if(found != undefined){
      return true
    }
    return false
  }


  ngAfterViewInit(): void {

    this.service.provider.receive().subscribe(({ data, callback }) => {

      const payloads = this.renderingItemPayloads() 

      console.log(data.eventType)
      switch(data.eventType){
        case ContainerEventType.ON_CLICK:

          if(this.isAnyInEditMode()){
              callback(false)
          }else{

            this.renderingItemComponents().forEach( x=> x.setContainerStateIdle())
           
             callback(true)
          }
        break
        case ContainerEventType.ON_EDIT:

          this.onEdit.emit(data.caller)
          console.log("Allowing edit")
          callback(true)

        break
        case ContainerEventType.SAVE:
          this.onSave.emit(data.caller)
          callback(true)
        break
        case ContainerEventType.CANCEL:
          this.onCancel.emit(data.caller)
          callback(true)
        break
      }
    });
  }
}