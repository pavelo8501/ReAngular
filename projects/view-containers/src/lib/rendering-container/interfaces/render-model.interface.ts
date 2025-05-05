import { RenderingBlock } from "./../classes"
import { HtmlTag } from "./../../common/enums"
import { RenderBlockInterface } from "./render-block.interface"


export interface RenderModelInterface{


    elementId : string
    htmlTag: HtmlTag

    actualHtml?: string
    content: string
    class_list:{key:number, value:string}[]

    
}