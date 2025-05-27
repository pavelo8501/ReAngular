import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, model, signal, viewChildren } from '@angular/core';
import {RenderModelInterface} from "./../../interfaces"
import { RenderingItem } from './../../classes';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ContainerState } from '../../../common/enums';
import { RenderingBlockComponent } from './../rendering-block/rendering-block.component';
import { RenderingBlock } from "./../../classes"

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
export class RenderingItemComponent implements AfterViewInit {
  
  //@ViewChild('blockContainer', { read: ViewContainerRef }) containerRef!: ViewContainerRef;
  
  ContainerState =  ContainerState

  renderBlockComponents = viewChildren(RenderingBlockComponent)
  renderingItem =  model.required<RenderingItem<RenderModelInterface, RenderModelInterface>>()

  renderingBlocks = signal<RenderingBlock<RenderModelInterface>[]>([])
  
  //activeClass = "idle-class"
  containerState = signal<ContainerState>(ContainerState.IDLE)

  //childComponents = model<RenderingBlockComponent[]>([])


  // dataModel = computed<RenderModelInterface>(
  //   ()=>{
  //     const sourceItem = this.renderingItem()
  //     if(sourceItem){
  //        sourceItem.hostingComponent = this  
  //        sourceItem.onUpdated = (dataSource: any)=>{
  //         console.log("After update setting mode idle")
  //         this.setContinerState(ContainerState.IDLE)
  //       }
  //       return sourceItem.getDataSource()
  //     }
  //      throw Error("sourceItem undefined")
  //   }
  // )

  constructor(){
    effect(() =>{
        const renderingItem = this.renderingItem()
        renderingItem.hostingComponent = this
        renderingItem.onUpdated = (dataSource: any)=>{
          console.log("After update setting mode idle")
          this.setContinerState(ContainerState.IDLE)
        }
    })
  }

  setContinerState(state: ContainerState){
      this.containerState.set(state)
      switch(state){
        case ContainerState.IDLE:
          this.renderBlockComponents().forEach(x=>x.setContinerState(state))
        break;
      }
  }

  clearRenderingBlocks(){
    this.renderingBlocks.set([])
  }

  createRenderingBlock(dataSource : RenderModelInterface): RenderingBlock<RenderModelInterface>{

    const renderingBlock = new RenderingBlock<RenderModelInterface>(dataSource, this)
    const renderingBlocks = this.renderingBlocks()
    renderingBlocks.push(renderingBlock)
    this.renderingBlocks.set(renderingBlocks)

    return renderingBlock
  }
  
  ngAfterViewInit(): void {
      console.log("RenderingContainerItemComponent::ngAfterViewInit hit")
  }

 }
