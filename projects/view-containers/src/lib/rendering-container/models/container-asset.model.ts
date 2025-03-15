import { Type } from "@angular/core";
import { InjectableI } from "../interfaces/injectable.interface";

export type ContainerComponentAsset<T extends InjectableI>  = {
  componentType: Type<T>
  angularSelector: string

}

 export interface ComponentAssetInterface<T extends InjectableI>{
    componentAsset : ContainerComponentAsset<T>
 }
 
 const singletonComponentAssrets = new Map<string, ContainerComponentAsset<InjectableI>>();

 export function createComponentAsset<T extends InjectableI>(assets: ContainerComponentAsset<T>[]): Map<string, ContainerComponentAsset<InjectableI>> {
    assets.forEach(x=>{
        const key = x.angularSelector
        singletonComponentAssrets.set(key, x);
    })
    return singletonComponentAssrets
}
