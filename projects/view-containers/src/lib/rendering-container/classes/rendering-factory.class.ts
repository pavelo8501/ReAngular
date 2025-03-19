import { ContainerComponentAsset} from "./../models";
import {ContainerNodeComponent} from "./../components/rendering-container-parts"
import { RendererSelector } from "./renderer-selector.class";
import { RenderingContainer } from "./rendering-container.class";
import { HtmlTag } from "./../../common/enums";
import { ComponentRef, Injector, ViewContainerRef } from "@angular/core";

export class RenderingFactory<T>{

    get name():string{
        return `${this.container.name}` 
    }
    get personalName():string{
       return `RenderingFactory[${this.name}]`
    }

    private assets :  ContainerComponentAsset<ContainerNodeComponent<T>>[]=[]
    constructor(private container : RenderingContainer<T>){

    }

    setAssets(assets: ContainerComponentAsset<ContainerNodeComponent<T>>[]){
        this.assets = assets
    }

    asset(htmlTag: HtmlTag):ContainerComponentAsset<ContainerNodeComponent<T>>|undefined{
        const found = this.assets.find(x=>x.htmlTag == htmlTag)
        if(found){
            return found
        }else{
            console.warn(`${this.personalName} no asset found for selector ${htmlTag}, total assets provided ${this.assets.length}`)
            console.log(`Selector Tag ${htmlTag}`)
            console.log("AssetList")
            this.assets.forEach(x=>console.log(x))
            console.warn(`nodeContianer not found for ${this.personalName}`)
            console.warn(`Asset not found`)
            return undefined
        }
    }

    // createComponent(parentContainerRef: ViewContainerRef,   selector:  RendererSelector, callback : (newContainer : RenderingContainer | undefined ) => void){
       

    //     if(parentContainerRef){

    //         const asset = this.asset(selector.selector.tag)
    //         if(asset){
    //             let  newContainer = new RenderingContainer(selector)
    //             newContainer.setAssets(this.assets).setSourceHtml(selector.html)
    //             const injector = Injector.create({
    //                 providers: [{ provide: RenderingContainer, useValue: newContainer }],
    //                 parent: parentContainerRef.injector,
    //             });
    //                 const newComponent  = parentContainerRef.createComponent<ContainerNodeComponent>(asset.componentType, {injector})
    //             if(newComponent){
    //                 console.log(`Created component for ${this.name}`)
    //                 newContainer.setComponentRefference(newComponent) 
    //             }else{
    //                 console.warn(`New component creation failed`)
    //             }
    //             callback(newContainer)
    //         }else{
    //             console.warn(`${this.personalName} asset for ${this.name} not found`)
    //         }
    //     }else{
    //         console.warn(`${this.personalName} ParentViewRef not found`)
    //     }
    //     callback(undefined)
    // }


}