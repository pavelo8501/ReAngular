import { Type } from "@angular/core";
import { ContainerNodeComponent} from "./../rendering-container-parts"
import{HtmlTag}from "./../../common/enums/html-tag.enum"
import { } from "../interfaces";

export type ContainerComponentAsset<T extends ContainerNodeComponent<any>> = {
  componentType: Type<T>
  htmlTag: HtmlTag
}

export interface ComponentAssetInterface<T extends ContainerNodeComponent<any>> {
  componentAsset: ContainerComponentAsset<T>
}

const singletonComponentAssrets = new Map<string, ContainerComponentAsset<ContainerNodeComponent<any>>>();

export function createComponentAsset<T>(
  assets: ContainerComponentAsset<ContainerNodeComponent<any>>[]
): Map<string, ContainerComponentAsset<ContainerNodeComponent<any>>> {
  assets.forEach(x => {
    const key = x.htmlTag
    singletonComponentAssrets.set(key, x);
  })
  return singletonComponentAssrets
}
