
import { PropertyBinding } from "../property-binding"
import { ContainerState } from "../containers"
import { HtmlTag } from "../html-related"


export interface  IContainerPayload<T extends object> {

    htmlTag:HtmlTag
    receiver:T
    nameDelegate:PropertyBinding<T, string>
    

    get classes():string[]

    subscribeStateUpdates(callback:(state: ContainerState)=>void):void

    clear():void

}