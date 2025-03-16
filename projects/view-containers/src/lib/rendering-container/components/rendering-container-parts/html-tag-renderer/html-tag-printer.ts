import { ChangeDetectionStrategy, Component, computed, input, signal, ViewContainerRef } from '@angular/core';
import { RenderingContainer } from '../../../classes/rendering-container.class';
import { RenderingContainerComponent } from '../../rendring-container/rendering.container';
import { ContainerNodeComponent } from '../container-node/container-node.component';

@Component({
  selector: 'lib-tag-printer',
  imports: [],
  template: `<div>  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagPrinter {
  constructor(private viewRef : ViewContainerRef){
  }
  getRefference():ViewContainerRef|undefined{
    if(this.viewRef){
      return this.viewRef
    }else{
      console.warn(`TagPrinter ViewContainerRef is ${this.viewRef}`)
      return undefined
    }
  }
}
