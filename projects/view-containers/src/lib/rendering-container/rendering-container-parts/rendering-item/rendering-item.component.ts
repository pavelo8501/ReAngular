import { AfterViewInit, ChangeDetectionStrategy, Component, inject, Inject, input, model, signal, ViewChild, ViewContainerRef } from '@angular/core';
import {RenderComponentInterface, RenderModelInterface} from "./../../interfaces"
import { RenderingContainerItem } from './../../classes';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ContainerState } from '../../../common/enums';
import { RenderingBlockComponent } from './../rendering-block/rendering-block.component';
import { RenderingBlock } from "./../../classes"

@Component({
  selector: 'lib-rendering-item',
  imports: [
    CommonModule, FormsModule,
  ],
  templateUrl: "./rendering-item.component.html",
  styleUrl: './rendering-item.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RenderingItemComponent implements AfterViewInit {
  
  @ViewChild('blockContainer', { read: ViewContainerRef }) containerRef!: ViewContainerRef;
  
  ContainerState =  ContainerState

  activeClass = "idle-class"
  containerState = ContainerState.IDLE

  renderingBlocks : RenderingBlockComponent<RenderModelInterface>[] = []
  childComponents = model<RenderingBlockComponent<RenderModelInterface>[]>([])

  sourceItem = input.required<RenderingContainerItem<RenderModelInterface>>()


  private addRenderingBlockComponent<SOURCE extends RenderModelInterface>(dataSource : SOURCE):RenderingBlock<SOURCE>{
    const componentRef = this.containerRef.createComponent(RenderingBlockComponent);
    const newSourceItem = new RenderingBlock<SOURCE>(dataSource, this)
    componentRef.instance.sourceItem.set(newSourceItem)
    this.renderingBlocks.push(componentRef.instance);
    this.childComponents.set(this.renderingBlocks);
    return newSourceItem
  }

  setRenderingBlock<SOURCE extends RenderModelInterface>(renderingBlock : SOURCE): RenderingBlock<SOURCE>{
    return this.addRenderingBlockComponent(renderingBlock)
}
  
  ngAfterViewInit(): void {
      console.log("RenderingContainerItemComponent::ngAfterViewInit hit")
      this.sourceItem().onNewBlock = this.addRenderingBlockComponent.bind(this)
  }

 }
