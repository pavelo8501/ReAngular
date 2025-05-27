
import { RenderingItem } from "."
import { RenderModelInterface } from "../interfaces"


const rendererItems = new Array<RenderingItem<RenderModelInterface, RenderModelInterface>>

export function createRendererItems(
  items: RenderingItem<RenderModelInterface, RenderModelInterface>[]
): Array<RenderingItem<RenderModelInterface, RenderModelInterface>> {
  items.forEach(i =>
    rendererItems.push(i)
  )
  return rendererItems as Array<RenderingItem<RenderModelInterface, RenderModelInterface>>
}

