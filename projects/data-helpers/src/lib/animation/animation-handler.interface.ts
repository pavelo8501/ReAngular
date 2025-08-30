import { AnimatableBase } from "./animatable.base"



export interface IAnimationHandler{

    hide(receiver: AnimatableBase):void
    show(receiver: AnimatableBase):void

    subscribeSaveRequest(subscriber:any, callback:()=>void):void
    subscribeCancelRequest(subscriber:any, callback:()=>void):void
}