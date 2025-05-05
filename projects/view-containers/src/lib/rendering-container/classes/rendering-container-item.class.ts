import { HtmlTag } from "../../common/enums";
import { RenderBlockInterface } from "../interfaces/render-block.interface";
import { RenderModelInterface } from "../interfaces/render-model.interface";
import { RenderingItemComponent } from "../rendering-container-parts";
import { RenderingBlock } from "./rendering-block.class";

export class RenderingContainerItem<SOURCE extends RenderModelInterface>{

    private dataSource? : SOURCE = undefined
    private renderingBlocks : RenderingBlock<RenderBlockInterface>[] = []

    private hostingComponent? : RenderingItemComponent


    onBlocksUpdated? : (blocks: RenderingBlock<RenderBlockInterface>[]) => void;
    onNewBlock? : (block: RenderBlockInterface) => void;



    constructor(
        public htmlTag : HtmlTag,
        public elementId : string
    ){

    }

    setDataSource(source: SOURCE):SOURCE{
        this.dataSource = source
        console.log("Data source set")
        return this.dataSource!!
    }

}