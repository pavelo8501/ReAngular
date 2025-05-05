import { Observable, Subject } from "rxjs"
import { EventSubject } from "./../models"
import { EventType } from "./../../common/enums"




export class RenderingContainerProvider{
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