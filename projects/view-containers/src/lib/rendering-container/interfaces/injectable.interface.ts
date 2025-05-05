import { ContainerSelector } from "../../common/models"

export interface InjectableI{

    selector: ContainerSelector
    content: string
    class_list:{key:number, value:string}[]
    onContentUpdated? : (content:string)=>void
    
}