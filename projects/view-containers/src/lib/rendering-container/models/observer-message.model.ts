import { Observable, Subject } from "rxjs";
import { DataWithCallback } from "../../common/classes/two-way.observable";
import { ViewContainerRef } from "@angular/core";
import { RendererSelector } from "../types/rendering-container.types";



export class ObserverPayload{
    message:string = "Outgoind"
    refference:ViewContainerRef

    create(refference: ViewContainerRef){
        this.refference =refference
    }

    constructor(refference: ViewContainerRef, message : string | undefined){
        this.refference =refference
        if(message){
            this.message = message
        }else{
            this.message = "Outgoind default"
        }
    }
}


export class ObserverCallback{

    message:string
    child: RendererSelector[] = []

    constructor(child: RendererSelector[],  message: string|undefined = undefined){
        this.child  = child
        if(message){
            this.message = message
        }else{
            this.message = "Default messae"
        }
    }
}

export class ObserverData implements DataWithCallback<ObserverPayload, ObserverCallback> {

    data: ObserverPayload
    callback : (response: ObserverCallback) => void

    constructor(data : ObserverPayload, callback: (response: ObserverCallback) => void){
        this.data = data
        this.callback =callback
    }
}

export class SendReplyObserver{
    
    private subject = new Subject<DataWithCallback<ObserverPayload, ObserverCallback>>();

    sendData(data: ObserverPayload): Promise<ObserverCallback> {
        return new Promise((resolve) => {
            this.subject.next({
                data,
                callback: resolve
            });
        });
    }

    getObservable() {
        return this.subject.asObservable();
    }



}