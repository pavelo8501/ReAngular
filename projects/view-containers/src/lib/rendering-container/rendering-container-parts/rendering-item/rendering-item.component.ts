import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, input, model, signal, viewChildren } from '@angular/core';
import { RenderingBlockPayload, RenderingItemPayload } from './../../classes';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ContainerState } from '../../../common/enums';
import { RenderingBlockComponent } from './../rendering-block/rendering-block.component';

@Component({
  selector: 'lib-rendering-item',
  imports: [
    CommonModule, 
    FormsModule,
    RenderingBlockComponent
],
  templateUrl: "./rendering-item.component.html",
  styleUrl: './rendering-item.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RenderingItemComponent<T extends object> implements AfterViewInit {

  ContainerState =  ContainerState
  renderBlockComponents = viewChildren(RenderingBlockComponent)

  payload = model.required<RenderingItemPayload<T>>()

  name:string = ""
  caption:string = ""
  classes:string[] = []
  renderingBlockPayloads: RenderingBlockPayload<any>[] = []

  containerState = signal<ContainerState>(ContainerState.IDLE)

  constructor(){
    effect(() =>{
        const payload = this.payload()
        this.name = payload.nameDelegate.get()
        this.caption = payload.captionDelegate.get()
        this.classes = payload.classes

        this.renderingBlockPayloads = payload.renderingBlockPayloads

        payload.subscribeStateUpdates(
          state=> {  
              this.containerState.set(state)
            }
        )

        this.renderingBlockPayloads.forEach(renderBlockPayload=>{
          renderBlockPayload.subscribeStateUpdates(
            state=>{
               console.log(`Updating state by callback from render block to state ${state}`)
               this.containerState.set(state)
            }
          )
        })
    })
  }

  setContinerState(state: ContainerState){
      this.containerState.set(state)
      switch(state){
        case ContainerState.IDLE:
          this.renderingBlockPayloads.forEach(x=>x.notifyContainerStateChanged(state))
        break;
      }
  }

  setContainerStateIdle(){
     this.containerState.set(ContainerState.IDLE)
      this.renderBlockComponents().forEach(blockComponent=>{
        blockComponent.setContinerState(ContainerState.IDLE)
      })
  }


  clearRenderingBlocks(){
    this.renderingBlockPayloads = []
  }

  ngAfterViewInit(): void {

  }

 }
