import { HtmlTag } from "../../common/enums";

import { RenderModelInterface, RenderComponentInterface } from "../interfaces";
import { RenderingItemComponent } from "../rendering-container-parts";
import { RenderingBlock } from "./rendering-block.class";

export class RenderingContainerItem<T extends RenderModelInterface>{

    private dataSource? : T = undefined
    private renderingBlocks : RenderingBlock<RenderModelInterface>[] = []

    private hostingComponent? : RenderingItemComponent


    onBlocksUpdated? : (blocks: RenderingBlock<RenderModelInterface>[]) => void;
    onNewBlock? : (block: RenderModelInterface) => void;

    constructor(
        public htmlTag : HtmlTag,
        public elementId : string
    ){

    }

    setDataSource(source: T):T{
        this.dataSource = source
        console.log("Data source set")
        return this.dataSource!!
    }

}