import { AfterViewInit, ChangeDetectionStrategy, Component, inject, Inject, input, model, signal, ViewChild, ViewContainerRef } from '@angular/core';
import {RenderBlockInterface, RenderModelInterface} from "./../../interfaces"
import { RenderingContainerItem } from './../../classes';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContainerState } from '../../../common/enums';
import { RenderingBlock } from '../../classes/rendering-block.class';
import { RenderingBlockComponent } from './../rendering-block/rendering-block.component';

@Component({
  selector: 'lib-rendering-container-item',
  imports: [
    CommonModule, FormsModule,
  ],
  templateUrl: "./rendering-container-item.component.html",
  styleUrl: './rendering-container-item.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RenderingContainerItemComponent implements AfterViewInit {
  
  @ViewChild('blockContainer', { read: ViewContainerRef }) containerRef!: ViewContainerRef;
  
  ContainerState =  ContainerState

  activeClass = "idle-class"
  containerState = ContainerState.IDLE

  renderingBlocks : RenderingBlockComponent<RenderBlockInterface>[] = []
  childComponents = model<RenderingBlockComponent<RenderBlockInterface>[]>([])

  sourceItem = input.required<RenderingContainerItem<RenderModelInterface>>()

  private addRenderingBlockComponent<SOURCE extends RenderBlockInterface>(dataSource : SOURCE){


    const componentRef = this.containerRef.createComponent(RenderingBlockComponent);
    componentRef.instance.dataSource.set(dataSource)
    this.renderingBlocks.push(componentRef.instance);
    this.childComponents.set(this.renderingBlocks);

  }
  
  ngAfterViewInit(): void {
      console.log("RenderingContainerItemComponent::ngAfterViewInit hit")
      this.sourceItem().onNewBlock = this.addRenderingBlockComponent.bind(this)
  }

 }
