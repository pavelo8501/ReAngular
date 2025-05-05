import { ComponentRef, ViewContainerRef } from "@angular/core"
import { InjectableI } from "./../interfaces"
import { ContainerNodeComponent } from "./../rendering-container-parts"
import { ContainerComponentAsset } from "../models"
import { RendererSelector } from "./renderer-selector.class"
import { RenderingFactory } from "./rendering-factory.class"
import { EventSubject } from "../models/event-subject.model"
import { Observable, Subject } from "rxjs"
import { EventType } from "../../common/enums/event-type.enum"


export class RenderingContainer<T  extends InjectableI> {

    get name():string{
        return `${this.selector.selector.key}`
    }
    get personalName():string{
        return `RenderingContainer[${this.name}]`
    }
    get angularSelector(): string {
        return this.selector.angularSelector
    }

    selector: RendererSelector<T>
    classes:{key:number, value:string}[]
    private html: string = ""
    private assets: ContainerComponentAsset<ContainerNodeComponent<T>>[] = []
   
    private thisComponentsRefference : ComponentRef<ContainerNodeComponent<T>> | undefined
    private parentViewRef : ViewContainerRef | undefined
    private subscriptions: {
        onHtmlUpdated: (html: string) => void;
        onChildUpdated: (selectors: RendererSelector<any>[]) => void;
    }
    private factory: RenderingFactory<T>

    get dataModel():T{
        return this.selector.dataModel
    }

    constructor(source: RendererSelector<T>, private host: RenderingContainerHost) {
        this.selector = source
        this.classes = source.classList
        this.subscriptions = {
            onHtmlUpdated: (html: string) => { },
            onChildUpdated: (selectors: RendererSelector<any>[]) => { }
        }

        this.html = source.html
        const existenChildren = this.selector.getChild(this.subscriptions.onChildUpdated)
        if(existenChildren.length > 0){
            console.log(`Child selectors already present in RenderingContainer constructor`)
        }
        this.factory = new RenderingFactory(this)
    }

    createNewContainer(source: RendererSelector<T>):RenderingContainer<T> {
        return new RenderingContainer(source, this.host)
    }

    listen():Observable<EventSubject>{
        return this.host.subscribe()
    }

    init(subscribe: { onHtmlUpdated: (html: string) => void }) {
        if (subscribe) {
            if (subscribe.onHtmlUpdated) {
                this.subscriptions.onHtmlUpdated = subscribe.onHtmlUpdated
            }
        }
    }

    getComponentRefference():ComponentRef<ContainerNodeComponent<T>>|undefined{
        if(this.thisComponentsRefference){
            return  this.thisComponentsRefference
        }else{
            console.warn(`${this.personalName} ComponentRef were requeste but undefined`)
            return undefined
        }
    }

    setComponentRefference(refference : ComponentRef<ContainerNodeComponent<T>>, parentViewRef : ViewContainerRef ):RenderingContainer<T>{
        this.thisComponentsRefference = refference
        this.parentViewRef = parentViewRef
        return this
    }

    setAssets(assets: ContainerComponentAsset<ContainerNodeComponent<T>>[]): RenderingContainer<T> {
        this.assets = assets
        this.factory
        return this
    }
    getAssets():ContainerComponentAsset<ContainerNodeComponent<T>>[]{
        if(this.assets.length == 0){
            console.warn(`${this.personalName} Assets were requeste but have none`)
        }
        return this.assets
    }

    getParentVewRef():ViewContainerRef|undefined{
        return this.parentViewRef
    }

    setSourceHtml(html: string): RenderingContainer<T> {
        if (this.html != html) {
            this.html = html
            this.subscriptions.onHtmlUpdated(html)
        }
        return this
    }

    gethtml(): string {
        return this.html
    }

    withFactory():RenderingFactory<T>{
        return this.factory
    }

    getHost():RenderingContainerHost{
        return this.host
    }

}

export class RenderingContainerHost{
    private eventSubject = new Subject<EventSubject>()
    private callbacks:{
        onNode: <T>(type:EventType, object: T)=>void
    }

    constructor(
        callbacks:{ 
            onNode: <T>(type:EventType, object: T)=>void 
        }){
        this.callbacks = callbacks
    }

    subscribe(): Observable<EventSubject>{
        return this.eventSubject.asObservable()
    }

    emmitEvent(type : EventType, value:any |undefined = undefined){
        this.eventSubject.next(new EventSubject(type, value))
    }

    propagateToParent<T>(type : EventType, object: T){
        this.callbacks.onNode(type, object)
    }
}