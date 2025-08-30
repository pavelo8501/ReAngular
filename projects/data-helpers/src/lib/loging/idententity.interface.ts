import { OutputMode } from "./loging.enums"

export interface IComponentIdentity{
    componentName:string
    outputMode:OutputMode
}

export interface Identity{
    source: IComponentIdentity, 
    optionalString?: string
}