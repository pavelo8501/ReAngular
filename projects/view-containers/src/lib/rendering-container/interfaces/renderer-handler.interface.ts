import { RenderingContainerItem } from "../classes";
import { RenderModelInterface } from "./render-model.interface";

export interface RendererHandlerInterface{

    injectDataModel(modle : RenderModelInterface):RenderingContainerItem<RenderModelInterface>

}