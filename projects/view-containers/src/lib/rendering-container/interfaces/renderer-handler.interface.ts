import { RenderingContainerItem } from "../classes";
import { RenderingItemComponent } from "../rendering-container-parts";
import { RenderModelInterface } from "./render-model.interface";

export interface RendererHandlerInterface{

    injectDataModel(modle : RenderModelInterface):RenderingItemComponent

}