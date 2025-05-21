import { RenderModelInterface } from "./render-model.interface";


export interface RenderComponentInterface<T extends RenderModelInterface>{
    dataSource: T
}


