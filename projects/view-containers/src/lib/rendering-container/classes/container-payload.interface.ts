import { PropertyBinding } from "@pavelo8501/data-helpers";
import { ContainerState, HtmlTag } from "../../common/enums";

export interface  IContainerPayload<T extends object>{

    htmlTag:HtmlTag
    receiver:T
    nameDelegate:PropertyBinding<T, string>

    get classes():string[]

    subscribeStateUpdates(callback:(state: ContainerState)=>void):void
    clear():void

}