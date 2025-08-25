import { ContainerEventType, HtmlTag } from "../../common/enums";
import { RenderModelInterface } from "./../interfaces";
import { RenderingItemComponent } from "../rendering-container-parts";
import { TypedCallbackProvider } from "../../common/classes";
import { configureCaller, ContainerEvent } from "../models";

export class RenderingBlock<T extends RenderModelInterface>{


     get classes():string[]{
        return this.dataSource.class_list.map(x=>x.value)
    }


    get htmlTag (): HtmlTag{
       return this.dataSource.htmlTag
    }
    get elementId (): string{
        return this.elementId
    }

    private _provider? :  TypedCallbackProvider<ContainerEvent<T, string>, boolean> = undefined
    get provider ():  TypedCallbackProvider<ContainerEvent<T, string>, boolean>{
        if(!this._provider){
        throw Error(`RenderingContainerProvider uninitialized in ${this.dataSource.elementId}`)
        }
        return this._provider
    }
    set provider (value : TypedCallbackProvider<ContainerEvent<T, string>, boolean>){
        this._provider = value
    }

    createEventParameter? : <P>(eventType: ContainerEventType, payload: P) => ContainerEvent<RenderModelInterface, P>
    get createEvent(): <P>(eventType: ContainerEventType, payload: P) => ContainerEvent<RenderModelInterface, P>{
        if(this.createEventParameter){

             return this.createEventParameter

        }else{

            throw Error("createEventParameter not yet ready")

        }
    }

    
    constructor(
        public dataSource : T,
        public parentContainer : RenderingItemComponent,
    ){
        this.createEventParameter = configureCaller(this,  this.parentContainer)
    }

    setDataSource(source: T){
        this.dataSource = source
        console.log("Data source set")
        console.log(source)
    }

}