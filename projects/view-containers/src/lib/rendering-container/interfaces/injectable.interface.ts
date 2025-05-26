import { ContainerSelector } from "../../common/models"

export interface InjectableI{

    selector: ContainerSelector
    content: string
    //class_list:ClassItem []
   // onContentUpdated? : (content:string)=>void
    
}