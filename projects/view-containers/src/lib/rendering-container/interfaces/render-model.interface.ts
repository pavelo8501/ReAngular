import { HtmlTag } from "./../../common/enums"


export interface RenderModelInterface{
    elementId : string
    htmlTag: HtmlTag

    actualHtml?: string
    content: string
    class_list:{key:number, value:string}[]
}