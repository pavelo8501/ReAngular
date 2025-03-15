import { HtmlTag } from "../../common/enums";


export class RendererSelector{
    constructor(
        public htmlTag: HtmlTag,  
        public htmlId: string,  
        public angularSelector :string){
    }
}