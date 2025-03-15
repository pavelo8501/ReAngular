import { HtmlTag } from "../../common/enums"
import { InjectableI } from "../interfaces/injectable.interface"
import { RendererSelector } from "../types/rendering-container.types"


export class RenderingContainer{

    htmlId: string = ""
    htmlTag : HtmlTag = HtmlTag.SECTION
    angularSelector:string = ""

    private html:string = ""

    constructor(source :  RendererSelector){
        if(source){
            this.htmlId = source.htmlId
            this.htmlTag = source.htmlTag            
            this.angularSelector = source.angularSelector
        }
    }

}