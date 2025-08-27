import { RenderingItemComponent } from "../rendering-container-parts";
import { RenderModelInterface } from "./render-model.interface";

export interface RendererHandlerInterface{

    injectDataModel(modle : RenderModelInterface):RenderingItemComponent<any>
    updateDataModel(model: RenderModelInterface):RenderingItemComponent<any> | undefined

    reloadRenderingItems(models: RenderModelInterface[]):void

}