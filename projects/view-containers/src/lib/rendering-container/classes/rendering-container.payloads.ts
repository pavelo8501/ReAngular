import { PropertyBinding, bindProperty } from "@pavelo8501/data-helpers";
import { ContainerState, HtmlTag } from "../../common/enums";
import { IContainerPayload } from "./container-payload.interface";


export class RenderingItemPayload<T extends object> implements IContainerPayload<T> {

    htmlTag:HtmlTag = HtmlTag.SECTION
    htmlTagDelegate:PropertyBinding<T, string>
    nameDelegate:PropertyBinding<T, string>
    captionDelegate: PropertyBinding<T,  string>
    classListDelegate :PropertyBinding<T, {key:number, value:string}[]>

    get classes():string[]{
        return this.classListDelegate.get().map(x=>x.value)
    }

     renderingBlockPayloads:  RenderingBlockPayload<any>[] = []
     private stateUpdateCallbacks:Array<(state:ContainerState)=>void>  = []

    constructor(
        public receiver:T,
        private nameProperty: keyof T,
        private htmlProperty: keyof T,
        private captionProperty: keyof T,
        private classListProperty: keyof T,
    ){
        this.htmlTagDelegate = bindProperty<T, string>(this.receiver, this.htmlProperty)
        this.nameDelegate = bindProperty<T, string>(this.receiver, this.nameProperty)
        this.captionDelegate = bindProperty<T, string>(this.receiver, this.captionProperty)
        this.classListDelegate = bindProperty<T, {key:number, value:string}[]>(this.receiver, this.classListProperty)
    }


    addRenderingBlockPayload(payload: RenderingBlockPayload<any>): RenderingItemPayload<T> {
        this.renderingBlockPayloads.push(payload)
        return this
    }

    addRenderingBlockPayloads(payload: RenderingBlockPayload<any>[]): RenderingItemPayload<T>{
        this.renderingBlockPayloads = payload
        return this
    }

     setContainerState(state: ContainerState){
        this.stateUpdateCallbacks.forEach(callback =>  callback(state))
    }

     subscribeStateUpdates(callback:(state: ContainerState)=>void){
        this.stateUpdateCallbacks.push(callback)
    }

    clear(){
        this.stateUpdateCallbacks = []
    }

}


export class RenderingBlockPayload<T extends object> implements IContainerPayload<T>{

     nameDelegate:PropertyBinding<T, string>
     contentDelegate: PropertyBinding<T, string>
     classListDelegate :PropertyBinding<T, {key:number, value:string}[]>

      get classes():string[]{
        return this.classListDelegate.get().map(x=>x.value)
      }

      private stateUpdateCallbacks:Array<(state:ContainerState)=>void>  = []

     constructor(
        public htmlTag:HtmlTag,
        public receiver:T,
        private nameProperty: keyof T,
        private contentProperty: keyof T,
        private classListProperty: keyof T,

    ){
        this.nameDelegate = bindProperty<T, string>(this.receiver, this.nameProperty)
        this.contentDelegate = bindProperty<T, string>(this.receiver, this.contentProperty)
        this.classListDelegate = bindProperty<T, {key:number, value:string}[]>(this.receiver, this.classListProperty)
    }

    subscribeStateUpdates(callback:(state: ContainerState)=>void){
        this.stateUpdateCallbacks.push(callback)
    }


    notifyContainerStateChanged(state: ContainerState){
        this.stateUpdateCallbacks.forEach(callback =>  callback(state))
    }

    clear(){
        this.stateUpdateCallbacks = []
    }

}
