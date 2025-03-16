import { ComponentRef, ViewContainerRef } from "@angular/core"
import { ContainerNodeComponent } from "../../../public-api"
import { ContainerComponentAsset } from "../models"
import { RendererSelector } from "./renderer-selector.class"
import { RenderingFactory } from "./rendering-factory.class"


export class RenderingContainer {

    get name():string{
        return `${this.selector.selector.key}`
    }
    get personalName():string{
        return `RenderingContainer[${this.name}]`
    }
    get angularSelector(): string {
        return this.selector.angularSelector
    }

    selector: RendererSelector
    classList:string[]
    private html: string = ""
    private assets: ContainerComponentAsset<ContainerNodeComponent>[] = []
    private thisComponentsRefference : ComponentRef<ContainerNodeComponent> | undefined
    private parentViewRef : ViewContainerRef | undefined
    private subscriptions: {
        onHtmlUpdated: (html: string) => void;
        onChildUpdated: (selectors: RendererSelector[]) => void;
    }
    private factory: RenderingFactory

    constructor(source: RendererSelector) {
        this.selector = source
        this.classList = source.classList
        this.subscriptions = {
            onHtmlUpdated: (html: string) => { },
            onChildUpdated: (selectors: RendererSelector[]) => { }
        }
        this.html = source.html
        const existenChildren = this.selector.getChild(this.subscriptions.onChildUpdated)
        if(existenChildren.length > 0){
            console.log(`Child selectors already present in RenderingContainer constructor`)
        }
        this.factory = new RenderingFactory(this)
    }

    init(subscribe: { onHtmlUpdated: (html: string) => void }) {
        if (subscribe) {
            if (subscribe.onHtmlUpdated) {
                this.subscriptions.onHtmlUpdated = subscribe.onHtmlUpdated
            }
        }
    }

    getComponentRefference():ComponentRef<ContainerNodeComponent>|undefined{
        if(this.thisComponentsRefference){
            return  this.thisComponentsRefference
        }else{
            console.warn(`${this.personalName} ComponentRef were requeste but undefined`)
            return undefined
        }
    }

    setComponentRefference(refference : ComponentRef<ContainerNodeComponent>):RenderingContainer{
        this.thisComponentsRefference = refference
        return this
    }

    setAssets(assets: ContainerComponentAsset<ContainerNodeComponent>[]): RenderingContainer {
        this.assets = assets
        this.factory
        return this
    }
    getAssets():ContainerComponentAsset<ContainerNodeComponent>[]{
        if(this.assets.length == 0){
            console.warn(`${this.personalName} Assets were requeste but have none`)
        }
        return this.assets
    }

    getParentVewRef():ViewContainerRef|undefined{
        return this.parentViewRef
    }

    setSourceHtml(html: string): RenderingContainer {
        if (this.html != html) {
            this.html = html
            this.subscriptions.onHtmlUpdated(html)
        }
        return this
    }

    gethtml(): string {
        return this.html
    }

    withFactory():RenderingFactory{
        return this.factory
    }

}