import { HtmlTag } from '@pavelo8501/data-helpers'


export interface RenderModelInterface{

    
    elementId : string
    htmlTag: HtmlTag

    actualHtml?: string
    content: string
    class_list:{key:number, value:string}[]
}