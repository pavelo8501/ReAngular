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
} from '@angular/core';
import {CommonModule} from "@angular/common"
import { InjectableI } from '../../interfaces/injectable.interface';
import { ObserverPayload, SendReplyObserver } from '../../models/observer-message.model';
import { RendererSelector} from '../../types/rendering-container.types';
import { RenderingContainer } from '../../classes/rendering-container.class';
import { ContainerComponentAsset } from '../../models';


@Component({
  selector: 'lib-rendering-container',
  imports: [CommonModule],
  templateUrl: `./rendering.container.html`,
  styleUrl: './rendering.container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenderingContainerComponent implements OnInit { 


  componetAssets = input<Map<string, ContainerComponentAsset<InjectableI>>>()
  selector  = input.required<RendererSelector>()
  sourceHtml = input<string>()

  renderedTemplate = input<string|undefined>(undefined)

  observer : SendReplyObserver|undefined
  renderingContainer : RenderingContainer | undefined

  constructor(private viewRef: ViewContainerRef){
      effect(()=>{
        const selector = this.selector()
        if(selector){
          this.renderingContainer =  new  RenderingContainer(selector)
        }
      })
  }

  private processNewComponent(component: ComponentRef<InjectableI>){
    if(this.observer){
      const message = new  ObserverPayload (this.viewRef, "Hajushki")
      this.observer.sendData(message).then(response => {
        response.child
        console.log(`Received response with ${response.child.length} selectors count:`, response);

        response.child.forEach(x=>{
        //  const childCreated =  this.viewRef.createComponent(x.)
        })
    })

    }else{
      console.error("RenderingContainerComponent Observer did not initialized")
    }
  }

  ngOnInit(): void {

    const selector = this.selector()
    if(selector){
     
    }
    // const rendererSelector =  this.selector()
    // this.angularSelector.set(rendererSelector.angularSelector)
    // const component  = this.viewRef.createComponent(rendererSelector.getComponentType())
    // this.processNewComponent(component)
  }

}
