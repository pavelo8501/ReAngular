import { EventType } from "./../../common/enums";

export class EventSubject{

    constructor(public eventType : EventType, public value :any){
            
    }

}