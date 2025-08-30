import { CallbackRegistryBase } from "./callback-registry-base.class";

export class CallbackRegistry extends CallbackRegistryBase<void>{


     constructor(
        registryName:string = "N/A"
    ){
        super(registryName)
    }

   override triggerAll(){
        super.triggerAll(undefined, true)
   }

    triggerFor(subscriber: object, clearSubscription: boolean, warnOnNoSubscription?: boolean): void
    triggerFor(subscribers: object[], clearSubscription: boolean, warnOnNoSubscription?: boolean): void

    triggerFor(subscriberOrSubscribers: object | object[], clearSubscription:boolean, warnOnNoSubscription:boolean = false){
        super.trigger(subscriberOrSubscribers, undefined, clearSubscription, warnOnNoSubscription)
    }
}