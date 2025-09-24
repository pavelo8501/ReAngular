import {  deleteFromList, whenDefined } from "./../../fun"
import { CallbackSubscription } from "./subscription.model"


export abstract class CallbackRegistryBase<T>{

    private subscriptions:Array<CallbackSubscription<T>> = []


    constructor(
        public registryName:string = "N/A"
    ){

    }

    private outputCurrentState(subscriber?:object){
        console.log(`Registry : ${this.registryName}`)
        whenDefined(subscriber, forSubscriber=>{
            console.log("Last request for subscriber")
            console.log(forSubscriber)
        })
        console.log(`Active subscription conunt: ${this.subscriptions.length}`)
    }

    private triggerSubscription(subscriber: object, value:T, clearSubscription: boolean, warnOnNoSubscription: boolean = false){
        const subscription = this.findSubscription(subscriber)
        if(subscription != undefined){
            subscription.callback(value)
        }
        if(clearSubscription){
            this.removeSubscription(subscriber, warnOnNoSubscription)
        }
    }

    protected findSubscription(subscriber:object):CallbackSubscription<T> | undefined{
       const subscription = this.subscriptions.find(x=>x.subscriber  === subscriber)
       return subscription
    }


    protected removeSubscription(subscriber:object, warnOnNoSubscription:boolean){
       const subscription =  this.findSubscription(subscriber)
       if(subscription != undefined){
         deleteFromList(this.subscriptions, subscription)
       }else{
        if(warnOnNoSubscription){
            console.warn("No subscription")
            this.outputCurrentState(subscriber)
        }
       }
    }
    
    subscribe(subscriber:object, callback: ()=>void){
        const subscription:CallbackSubscription<T> = new CallbackSubscription(subscriber, callback)
        this.subscriptions.push(subscription)
    }

    triggerAll(value:T, clearRegistry:boolean = false){
        this.subscriptions.forEach(subscription=>{
            subscription.callback(value)
        })
        if(clearRegistry){
             this.clear()
        }
    }

    trigger(subscriber: object, value:T,  clearSubscription: boolean, warnOnNoSubscription?: boolean): void;
    trigger(subscribers: object[], value:T,  clearSubscription: boolean, warnOnNoSubscription?: boolean): void;

    trigger(subscriberOrSubscribers: object | object[], value:T, clearSubscription:boolean, warnOnNoSubscription:boolean = false){
        if (Array.isArray(subscriberOrSubscribers)) {
            subscriberOrSubscribers.forEach(subscriber=>{
                this.triggerSubscription(subscriber, value, clearSubscription, warnOnNoSubscription, )
            })
        }else{
            this.triggerSubscription(subscriberOrSubscribers, value, clearSubscription, warnOnNoSubscription)
        }
    }

    clear(){
        this.subscriptions = []
    }

}