import { HtmlTag } from "../../common/enums";
import { RenderModelInterface } from "./../interfaces";
import { RenderingItemComponent } from "../rendering-container-parts";

export class RenderingBlock<SOURCE extends RenderModelInterface>{

    get htmlTag (): HtmlTag{
       return this.dataSource.htmlTag
    }
    get elementId (): string{
        return this.elementId
    }
    
    constructor(
        public dataSource : SOURCE,
        public parentContainer : RenderingItemComponent,
    ){
        
    }

    setDataSource(source: SOURCE){
        this.dataSource = source
        console.log("Data source set")
    }

}