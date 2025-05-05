import { HtmlTag } from "../../common/enums";
import { RenderBlockInterface } from "../interfaces/render-block.interface";
import { RenderModelInterface } from "../interfaces/render-model.interface";
import { RenderingBlock } from "./rendering-block.class";

export class RenderingContainerItem<SOURCE extends RenderModelInterface>{

    private dataSource? : SOURCE = undefined
    private renderingBlocks : RenderingBlock<RenderBlockInterface>[] = []


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

    setRenderingBlock<SOURCE extends RenderBlockInterface>(renderingBlock : SOURCE): RenderingBlock<SOURCE>{


        this.onNewBlock?.(renderingBlock)
        


        const newRenderingBlock = new RenderingBlock<SOURCE>(renderingBlock.htmlTag, renderingBlock.elementId)
        newRenderingBlock.setDataSource(renderingBlock)
        this.renderingBlocks.push(newRenderingBlock)
        this.onBlocksUpdated?.(this.renderingBlocks)
        console.log(`Setting rendering block ${newRenderingBlock.elementId}`)
        return newRenderingBlock
    }

}