
import { AnimatableBase } from "./../../animation/animatable.base"



export abstract class ComponentHandlerBase<T extends object> {

    owningComponent?: AnimatableBase

     private onSaveRequestedCallbacks: Array<() => void> = []
     private onCancelRequestedCallbacks: Array<() => void> = []

     private onValueSaveCallbacks:Array<(value: any)=>void > = []

    private componentResolvedCallbacks:Array<(component:AnimatableBase)=>void> = []
 
    constructor(
        public receiver: T,
        public onComponentResolved?: (component: AnimatableBase) => void
    ) {

    }

    provideComponent(component: AnimatableBase) {
        this.owningComponent = component
        this.onComponentResolved?.(component)
        this.componentResolvedCallbacks.forEach(
            x => x(component)
        )
        this.componentResolvedCallbacks = []
    }

    clear() {
        this.owningComponent = undefined
    }

    notifySavedRequested() {
        console.log("notifySavedRequested ")
         console.log(`subscriptions count: ${this.onSaveRequestedCallbacks.length}`)
        this.onSaveRequestedCallbacks.forEach(callback => callback())
        this.onSaveRequestedCallbacks = []
    }

    notifyCancelRequested() {
        this.onCancelRequestedCallbacks.forEach(x => x())
        this.onCancelRequestedCallbacks = []
    }

    provideValueToSave(value: any){

        console.log("provideValueToSave")
        console.log(value)

        this.onValueSaveCallbacks.forEach(x=>x(value))

        this.onValueSaveCallbacks = []
    }

    subscribeOnComponentResolved(callback: (component: AnimatableBase) => void) {
        if (this.owningComponent != undefined) {
            callback(this.owningComponent)
        } else {
            this.componentResolvedCallbacks.push(callback)
        }
    }

    subscribeOnSaveRequest(callback: () => void) {
        this.onSaveRequestedCallbacks.push(callback)
    }

    subscribeOnValueSave(callback: (value: any) => void) {
       this.onValueSaveCallbacks.push(callback)
    }

    subscribeOnCancelRequest(callback: () => void) {
       this.onCancelRequestedCallbacks.push(callback)
    }


}