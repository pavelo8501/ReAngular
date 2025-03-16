import { Type } from "@angular/core";
import { InjectableI } from "../interfaces/injectable.interface";
import { RendererSelector } from "../classes/renderer-selector.class"
import { ContainerNodeComponent, HtmlTag } from "../../../public-api";

export type ContainerComponentAsset<T extends ContainerNodeComponent> = {
  componentType: Type<T>
  htmlTag: HtmlTag
}

export interface ComponentAssetInterface<T extends ContainerNodeComponent> {
  componentAsset: ContainerComponentAsset<T>
}

const singletonComponentAssrets = new Map<string, ContainerComponentAsset<ContainerNodeComponent>>();

export function createComponentAsset<T extends ContainerNodeComponent>(
  assets: ContainerComponentAsset<T>[]
): Map<string, ContainerComponentAsset<ContainerNodeComponent>> {
  assets.forEach(x => {
    const key = x.htmlTag
    singletonComponentAssrets.set(key, x);
  })
  return singletonComponentAssrets
}
