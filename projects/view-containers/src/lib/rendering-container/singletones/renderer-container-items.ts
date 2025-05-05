
import { RenderingContainerItem } from "./../classes"
import { RenderModelInterface} from "./../interfaces"


const rendererItems  = new Array<RenderingContainerItem<RenderModelInterface>>

export function createRendererItems<SOURCE extends RenderModelInterface>(
   items :  RenderingContainerItem<SOURCE>[]
): Array<RenderingContainerItem<SOURCE>> {
    items.forEach(i => 
        rendererItems.push(i)
      )
  return rendererItems as Array<RenderingContainerItem<SOURCE>>
}

