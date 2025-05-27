import { RenderingItemComponent } from "../rendering-container-parts";
import { RenderModelInterface } from "./render-model.interface";

export interface RendererHandlerInterface{

    injectDataModel(modle : RenderModelInterface):RenderingItemComponent
    updateDataModel(model: RenderModelInterface):RenderingItemComponent | undefined

    reloadRenderingItems(models: RenderModelInterface[]):void

}