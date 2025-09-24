import { ContainerSelector, SectionItemData, SelectorInterface } from "../models";


export interface DataInterface extends SelectorInterface {
    content : string
    classes : string[]
}

export interface DataServiceInterface{
    getDataForContainer(containerName: ContainerSelector):Promise<DataInterface>
}
