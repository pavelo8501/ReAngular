import { HtmlTag } from "../../common/enums";

import { RenderModelInterface, RenderComponentInterface } from "../interfaces";
import { RenderingItemComponent } from "../rendering-container-parts";
import { RenderingBlock } from "./rendering-block.class";

export class RenderingItem<T extends RenderModelInterface,  R extends RenderModelInterface>{

    private dataSource? : T = undefined

    private _hostingComponent? : RenderingItemComponent
    get hostingComponent():RenderingItemComponent{
        if(!this._hostingComponent){
            throw Error("hostingComponent undefinded")
        }
        return this._hostingComponent
    }
    set hostingComponent(val:RenderingItemComponent){
        this._hostingComponent = val
    }

    get classes():string[]{
        const dataSource = this.dataSource
        if(dataSource){
            return dataSource.class_list.map(x=>x.value)
        }
        return []
    }

    constructor(
        public htmlTag : HtmlTag,
        public elementId : string,

    ){

    }

    onBlocksUpdated? : (blocks: RenderingBlock<RenderModelInterface>[]) => void
    onNewBlock? : (block: RenderModelInterface) => void
    onUpdated? : (dataSource : T)=>void

    getDataSource():T{
        const dataSource = this.dataSource
        if(dataSource != null){
             return dataSource
        }else{
            throw Error("dataSource unavailable in RenderingContainerItem")
        }
    }

    setDataSource(source: T):T{
        this.dataSource = source
        console.log("Data source set")
         console.log(source)
        return this.dataSource!!
    }

    updateDataSource(source:T):RenderingItemComponent | undefined{
       this.dataSource = source
       if(this.dataSource != undefined){
            console.log("Data source updated")
            this.onUpdated?.(this.dataSource)
            return this.hostingComponent
       }else{
            console.warn("Nothing to update")
            return undefined
       }
    }

    emptySource():RenderingItemComponent{
        this.dataSource = undefined
        return this.hostingComponent
    }

}