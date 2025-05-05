
import { RenderingBlockComponent, RenderingItemComponent} from "./../rendering-container-parts"
import {RenderBlockInterface} from "./../interfaces"


export class RendererContainerEvent<SOURCE extends RenderBlockInterface, P> {
    constructor(
      public caller: RenderingBlockComponent<SOURCE>,
      public hostingItem: RenderingItemComponent,
      public payload: P
    ) {}
  }