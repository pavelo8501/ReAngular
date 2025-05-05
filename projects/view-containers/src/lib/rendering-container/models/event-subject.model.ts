import { EventType } from "../../common/enums/event-type.enum";

export class EventSubject{

    type : EventType
    value: any

    constructor(eventType : EventType, value :any| undefined){
        this.type = eventType
        if(value){
            this.value = value
        }
    }

}