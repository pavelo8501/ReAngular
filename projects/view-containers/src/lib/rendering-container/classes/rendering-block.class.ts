import { HtmlTag } from "../../common/enums";
import { RenderBlockInterface } from "../interfaces/render-block.interface";
import { RenderModelInterface } from "../interfaces/render-model.interface";

export class RenderingBlock<SOURCE extends RenderBlockInterface>{



    private dataSource? : SOURCE = undefined


    constructor(
        public htmlTag : HtmlTag,
        public elementId : string
    ){

    }

    setDataSource(source: SOURCE){
        this.dataSource = source
        console.log("Data source set")
    }

}