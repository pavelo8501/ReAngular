import { ComponentHandlerBase } from "@pavelo8501/data-helpers";
import { ImageDataEditorComponent } from "@pavelo8501/form-controls";



export class ImageEditorHandler<T extends object> extends ComponentHandlerBase<ImageDataEditorComponent, T>  {


    constructor(
        receiver: T
    ){
        super(receiver)
    }
  
}